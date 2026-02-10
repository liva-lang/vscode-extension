import * as vscode from 'vscode';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { activateLspClient, deactivateLspClient } from './lspClient';
import { ensureCompilerInstalled, checkForUpdates, findCompiler } from './compilerInstaller';
import { LiveCompletionProvider } from './providers/completionProvider';
import { LivaHoverProvider } from './providers/hoverProvider';
import { LivaSignatureHelpProvider } from './providers/signatureHelpProvider';
import { LivaDefinitionProvider, LivaReferenceProvider } from './providers/definitionProvider';
import { LivaDocumentSymbolProvider } from './providers/symbolProvider';
import { InterfaceValidationProvider } from './providers/interfaceValidator';
import { FallibleFunctionValidator } from './providers/fallibleValidator';

const execAsync = promisify(exec);

// Diagnostic collection for Liva errors
const livaDiagnostics = vscode.languages.createDiagnosticCollection('liva');

/**
 * Phase 5.1: Code Action Provider for "Did you mean?" suggestions
 * Provides quick fixes for typos and common errors
 */
class LivaCodeActionProvider implements vscode.CodeActionProvider {
    public provideCodeActions(
        document: vscode.TextDocument,
        range: vscode.Range | vscode.Selection,
        context: vscode.CodeActionContext,
        token: vscode.CancellationToken
    ): vscode.CodeAction[] | undefined {
        const codeActions: vscode.CodeAction[] = [];

        // Look for diagnostics with "Did you mean?" suggestions
        for (const diagnostic of context.diagnostics) {
            if (diagnostic.source === 'Liva Compiler') {
                const suggestion = this.extractSuggestion(diagnostic.message);
                if (suggestion) {
                    const action = new vscode.CodeAction(
                        `Change to '${suggestion}'`,
                        vscode.CodeActionKind.QuickFix
                    );

                    // Create a text edit to replace the error token with the suggestion
                    action.edit = new vscode.WorkspaceEdit();
                    action.edit.replace(document.uri, diagnostic.range, suggestion);
                    action.diagnostics = [diagnostic];
                    action.isPreferred = true; // Make it the default action

                    codeActions.push(action);
                }
            }
        }

        return codeActions;
    }

    /**
     * Extract suggestion from "Did you mean 'xxx'?" or similar patterns
     */
    private extractSuggestion(message: string): string | null {
        // Pattern 1: "Did you mean 'xxx'?"
        let match = message.match(/Did you mean '([^']+)'\?/);
        if (match) {
            return match[1];
        }

        // Pattern 2: "Perhaps you meant 'xxx'"
        match = message.match(/Perhaps you meant '([^']+)'/);
        if (match) {
            return match[1];
        }

        // Pattern 3: Extract from suggestion field (already in message with 💡)
        match = message.match(/💡.*'([^']+)'/);
        if (match) {
            return match[1];
        }

        return null;
    }
}

/**
 * Phase 5.4: Enhanced Hover Provider for documentation links
 * Shows error details with clickable links when hovering over errors
 */
class LivaErrorHoverProvider implements vscode.HoverProvider {
    public provideHover(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken
    ): vscode.Hover | undefined {
        // Get diagnostics for the current position
        const diagnostics = livaDiagnostics.get(document.uri);
        if (!diagnostics) {
            return undefined;
        }

        // Find diagnostics that overlap with the hover position
        const relevantDiagnostics = diagnostics.filter(d => d.range.contains(position));
        if (relevantDiagnostics.length === 0) {
            return undefined;
        }

        const contents: vscode.MarkdownString[] = [];

        for (const diagnostic of relevantDiagnostics) {
            const markdown = new vscode.MarkdownString();
            markdown.isTrusted = true; // Allow command URIs
            markdown.supportHtml = true;

            // Add error code and message
            markdown.appendMarkdown(`**${diagnostic.code}**\n\n`);
            markdown.appendMarkdown(`${diagnostic.message}\n\n`);

            // Extract and add documentation link if present
            const docLink = this.extractDocLink(diagnostic.message);
            if (docLink) {
                markdown.appendMarkdown(`📚 [View documentation](${docLink})\n\n`);
            }

            contents.push(markdown);
        }

        return new vscode.Hover(contents);
    }

    /**
     * Extract documentation link from diagnostic message
     */
    private extractDocLink(message: string): string | null {
        // Look for markdown links in the message
        const match = message.match(/\[.*?\]\((https?:\/\/[^\)]+)\)/);
        if (match) {
            return match[1];
        }

        // Look for plain URLs
        const urlMatch = message.match(/(https?:\/\/[^\s]+)/);
        if (urlMatch) {
            return urlMatch[1];
        }

        return null;
    }
}

export async function activate(context: vscode.ExtensionContext) {
    console.log('Liva extension is now active!');

    // ===== COMPILER INSTALLATION CHECK =====
    // Ensure the compiler is available before starting LSP
    const compilerPath = await ensureCompilerInstalled();
    // =======================================

    // ===== LSP CLIENT INTEGRATION (Phase 9) =====
    // Start the Language Server Protocol client
    // This provides: completion, diagnostics, hover, goto definition, find references
    const lspEnabled = vscode.workspace.getConfiguration('liva').get<boolean>('lsp.enabled', true);
    if (lspEnabled && compilerPath) {
        console.log('[Liva] Starting LSP client...');
        activateLspClient(context, compilerPath);
    } else if (!compilerPath) {
        console.log('[Liva] Compiler not found, LSP disabled. Syntax highlighting still active.');
    } else {
        console.log('[Liva] LSP client disabled, using fallback providers');
    }
    // ============================================

    // Register update compiler command
    const updateCompilerCmd = vscode.commands.registerCommand('liva.updateCompiler', async () => {
        await checkForUpdates();
        // Reload to pick up new compiler
        const choice = await vscode.window.showInformationMessage(
            'Reload window to use updated compiler?',
            'Reload',
            'Later'
        );
        if (choice === 'Reload') {
            await vscode.commands.executeCommand('workbench.action.reloadWindow');
        }
    });

    // Clear diagnostics on activation
    livaDiagnostics.clear();

    // Validate all open Liva documents on activation
    vscode.workspace.textDocuments.forEach(async (document) => {
        if (document.languageId === 'liva' || document.fileName.endsWith('.liva')) {
            console.log(`[Liva] Found open Liva document on activation: ${document.fileName}`);
            await validateLivaFile(document);
        }
    });

    // Register commands
    const compileCommand = vscode.commands.registerCommand('liva.compile', async (fileUri?: vscode.Uri) => {
        const filePath = fileUri?.fsPath || vscode.window.activeTextEditor?.document.fileName;

        if (!filePath) {
            vscode.window.showErrorMessage('No Liva file is currently open or selected');
            return;
        }

        await compileLivaFile(filePath);
    });

    const runCommand = vscode.commands.registerCommand('liva.run', async (fileUri?: vscode.Uri) => {
        const filePath = fileUri?.fsPath || vscode.window.activeTextEditor?.document.fileName;

        if (!filePath) {
            vscode.window.showErrorMessage('No Liva file is currently open or selected');
            return;
        }

        await runLivaProgram(filePath);
    });

    const checkCommand = vscode.commands.registerCommand('liva.check', async () => {
        const filePath = vscode.window.activeTextEditor?.document.fileName;

        if (!filePath) {
            vscode.window.showErrorMessage('No Liva file is currently open');
            return;
        }

        await checkLivaSyntax(filePath);
    });

    // File watcher for auto-build on save
    const fileWatcher = vscode.workspace.onDidSaveTextDocument(async (document) => {
        if (document.languageId === 'liva' && getConfig<boolean>('autoBuild', true)) {
            const filePath = document.fileName;
            await compileLivaFile(filePath, true); // Silent mode for auto-build
        }
    });

    // Real-time validation while typing (with debounce)
    let validationTimeout: NodeJS.Timeout | undefined;
    const changeListener = vscode.workspace.onDidChangeTextDocument((event) => {
        if (event.document.languageId === 'liva' && getConfig<boolean>('liveValidation', true)) {
            // Clear previous timeout
            if (validationTimeout) {
                clearTimeout(validationTimeout);
            }

            // Debounce: validate 500ms after user stops typing
            validationTimeout = setTimeout(async () => {
                await validateLivaFile(event.document);
            }, 500);
        }
    });

    // Validate on document open
    const openListener = vscode.workspace.onDidOpenTextDocument(async (document) => {
        if (document.languageId === 'liva' && getConfig<boolean>('liveValidation', true)) {
            await validateLivaFile(document);
        }
    });

    // Register completion provider
    const completionProvider = vscode.languages.registerCompletionItemProvider(
        'liva',
        new LiveCompletionProvider(),
        '.', // Trigger completion on dot for member access
        ' ', // Trigger on space for keywords
        '(', // Trigger on opening paren for function calls
    );

    // Register hover provider (LSP will handle most, this is fallback)
    const hoverProvider = vscode.languages.registerHoverProvider(
        'liva',
        new LivaHoverProvider()
    );

    // Phase 5.4: Register enhanced hover provider for error documentation
    const errorHoverProvider = vscode.languages.registerHoverProvider(
        'liva',
        new LivaErrorHoverProvider()
    );

    // Register signature help provider
    const signatureHelpProvider = vscode.languages.registerSignatureHelpProvider(
        'liva',
        new LivaSignatureHelpProvider(),
        '(', // Trigger on opening parenthesis
        ',', // Trigger on comma (next parameter)
    );

    // Register definition provider
    const definitionProvider = vscode.languages.registerDefinitionProvider(
        'liva',
        new LivaDefinitionProvider()
    );

    // Register reference provider
    const referenceProvider = vscode.languages.registerReferenceProvider(
        'liva',
        new LivaReferenceProvider()
    );

    // Register document symbol provider
    const symbolProvider = vscode.languages.registerDocumentSymbolProvider(
        'liva',
        new LivaDocumentSymbolProvider()
    );

    // Phase 5.1: Register code action provider for "Did you mean?" quick fixes
    const codeActionProvider = vscode.languages.registerCodeActionsProvider(
        'liva',
        new LivaCodeActionProvider(),
        {
            providedCodeActionKinds: [vscode.CodeActionKind.QuickFix]
        }
    );

    // Register interface validator for real-time validation
    const interfaceValidator = new InterfaceValidationProvider();
    interfaceValidator.activate(context);

    // Register fallible function validator for real-time validation
    const fallibleValidator = new FallibleFunctionValidator();
    fallibleValidator.activate(context);

    context.subscriptions.push(
        compileCommand, 
        runCommand, 
        checkCommand, 
        updateCompilerCmd,
        fileWatcher, 
        changeListener, 
        openListener, 
        livaDiagnostics,
        completionProvider,
        hoverProvider,
        errorHoverProvider,
        signatureHelpProvider,
        definitionProvider,
        referenceProvider,
        symbolProvider,
        codeActionProvider
    );
}

export function deactivate() {
    livaDiagnostics.clear();
    // Stop the LSP client
    return deactivateLspClient();
}

async function compileLivaFile(filePath: string, silent: boolean = false): Promise<void> {
    const compilerPath = getConfig<string>('compiler.path', 'livac');
    const outputDir = getConfig<string>('compiler.outputDirectory', './target/liva_build');

    // Clear previous diagnostics for this file
    if (vscode.window.activeTextEditor) {
        livaDiagnostics.delete(vscode.window.activeTextEditor.document.uri);
    }

    try {
        if (!silent) {
            vscode.window.showInformationMessage(`Compiling ${path.basename(filePath)}...`);
        }

        const { stdout, stderr } = await execAsync(
            `"${compilerPath}" "${filePath}" --output "${outputDir}" --json`
        );

        if (stdout && !silent) {
            vscode.window.showInformationMessage('Compilation successful!');
        }

        if (stderr && !silent) {
            console.log('Compiler stderr:', stderr);
        }

    } catch (error: any) {
        const errorMessage = error.stderr || error.stdout || error.message || error.toString();

        // Parse compiler errors and show as diagnostics
        const diagnostics = parseCompilerErrors(errorMessage, filePath);
        if (diagnostics.length > 0 && vscode.window.activeTextEditor) {
            livaDiagnostics.set(vscode.window.activeTextEditor.document.uri, diagnostics);
        }

        if (!silent) {
            vscode.window.showErrorMessage(`Compilation failed: ${diagnostics.length > 0 ? diagnostics[0].message : errorMessage}`);
        }
        console.error('Liva compilation error:', error);
    }
}

async function runLivaProgram(filePath: string): Promise<void> {
    const compilerPath = getConfig<string>('compiler.path', 'livac');
    const outputDir = getConfig<string>('compiler.outputDirectory', './target/liva_build');

    try {
        vscode.window.showInformationMessage(`Running ${path.basename(filePath)}...`);

        const { stdout, stderr } = await execAsync(
            `"${compilerPath}" "${filePath}" --output "${outputDir}" --run`
        );

        if (stdout) {
            const outputChannel = vscode.window.createOutputChannel('Liva Output');
            outputChannel.clear();
            outputChannel.appendLine('Program output:');
            outputChannel.appendLine(stdout);
            outputChannel.show();
        }

        if (stderr) {
            console.log('Runtime stderr:', stderr);
        }

    } catch (error: any) {
        const errorMessage = error.message || error.toString();
        vscode.window.showErrorMessage(`Runtime failed: ${errorMessage}`);
        console.error('Liva runtime error:', error);
    }
}

async function checkLivaSyntax(filePath: string): Promise<void> {
    const compilerPath = getConfig<string>('compiler.path', 'livac');

    // Clear previous diagnostics for this file
    if (vscode.window.activeTextEditor) {
        livaDiagnostics.delete(vscode.window.activeTextEditor.document.uri);
    }

    try {
        vscode.window.showInformationMessage(`Checking syntax of ${path.basename(filePath)}...`);

        const { stdout, stderr } = await execAsync(
            `"${compilerPath}" "${filePath}" --check --json`
        );

        if (stdout) {
            vscode.window.showInformationMessage('Syntax check passed!');
        }

        if (stderr) {
            console.log('Check stderr:', stderr);
        }

    } catch (error: any) {
        const errorMessage = error.stderr || error.stdout || error.message || error.toString();

        // Parse compiler errors and show as diagnostics
        const diagnostics = parseCompilerErrors(errorMessage, filePath);
        if (diagnostics.length > 0 && vscode.window.activeTextEditor) {
            livaDiagnostics.set(vscode.window.activeTextEditor.document.uri, diagnostics);
        }

        vscode.window.showErrorMessage(`Syntax check failed: ${diagnostics.length > 0 ? diagnostics[0].message : errorMessage}`);
        console.error('Liva syntax check error:', error);
    }
}

async function validateLivaFile(document: vscode.TextDocument): Promise<void> {
    console.log(`[Liva] validateLivaFile called for: ${document.fileName}, languageId: ${document.languageId}`);
    
    // Only validate Liva files
    if (document.languageId !== 'liva' && !document.fileName.endsWith('.liva')) {
        console.log(`[Liva] Skipping validation - not a Liva file`);
        return;
    }

    // Check if live validation is enabled
    const liveValidationEnabled = getConfig('liveValidation', true);
    console.log(`[Liva] Live validation enabled: ${liveValidationEnabled}`);
    if (!liveValidationEnabled) {
        return;
    }

    const compilerPath = getConfig<string>('compiler.path', 'livac');
    const originalFilePath = document.uri.fsPath;
    
    console.log(`[Liva] Compiler path: ${compilerPath}`);
    console.log(`[Liva] Original file path: ${originalFilePath}`);
    console.log(`[Liva] Document is dirty (unsaved): ${document.isDirty}`);

    // Clear previous diagnostics for this file
    livaDiagnostics.delete(document.uri);

    // Create a temporary file with the current buffer content
    const fs = require('fs');
    const os = require('os');
    const tmpDir = os.tmpdir();
    const tmpFilePath = path.join(tmpDir, `liva_validate_${Date.now()}_${path.basename(originalFilePath)}`);
    
    try {
        // Write current document content to temp file
        fs.writeFileSync(tmpFilePath, document.getText(), 'utf8');
        console.log(`[Liva] Created temp file: ${tmpFilePath}`);
        
        const command = `"${compilerPath}" "${tmpFilePath}" --check --json`;
        console.log(`[Liva] Executing command: ${command}`);
        
        const { stdout, stderr } = await execAsync(command);

        console.log(`[Liva] Command stdout: ${stdout}`);
        console.log(`[Liva] Command stderr: ${stderr}`);

        // If compilation succeeds, clear diagnostics (no errors)
        if (stdout && !stderr) {
            livaDiagnostics.set(document.uri, []);
        }

    } catch (error: any) {
        console.log(`[Liva] Command failed with error:`, error);
        const errorMessage = error.stderr || error.stdout || error.message || error.toString();
        console.log(`[Liva] Error message: ${errorMessage}`);

        // Parse compiler errors and show as diagnostics
        // Use original file path for diagnostic mapping
        const diagnostics = parseCompilerErrors(errorMessage, originalFilePath);
        console.log(`[Liva] Parsed ${diagnostics.length} diagnostics`);
        
        if (diagnostics.length > 0) {
            console.log(`[Liva] Setting diagnostics:`, diagnostics);
            livaDiagnostics.set(document.uri, diagnostics);
        }
    } finally {
        // Clean up temp file
        try {
            if (fs.existsSync(tmpFilePath)) {
                fs.unlinkSync(tmpFilePath);
                console.log(`[Liva] Cleaned up temp file: ${tmpFilePath}`);
            }
        } catch (cleanupError) {
            console.error(`[Liva] Failed to clean up temp file:`, cleanupError);
        }
    }
}

function getConfig<T>(section: string, defaultValue: T): T {
    const config = vscode.workspace.getConfiguration('liva');
    return config.get<T>(section, defaultValue);
}

function parseCompilerErrors(errorMessage: string, filePath: string): vscode.Diagnostic[] {
    const diagnostics: vscode.Diagnostic[] = [];
    
    console.log(`[Liva] parseCompilerErrors called with message length: ${errorMessage.length}`);
    console.log(`[Liva] Raw error message: ${errorMessage.substring(0, 500)}`);
    
    // Try to parse as JSON first (new format with --json flag)
    try {
        // The error message might have compiler output before JSON, so extract JSON
        const jsonMatch = errorMessage.match(/\{.*"location".*\}/s);
        if (jsonMatch) {
            const jsonString = jsonMatch[0];
            console.log(`[Liva] Found JSON in output: ${jsonString}`);
            const jsonError = JSON.parse(jsonString);
            
            if (jsonError.location && jsonError.code) {
                console.log(`[Liva] Parsed JSON error successfully`);
                const diagnostic = createDiagnosticFromJson(jsonError, filePath);
                if (diagnostic) {
                    console.log(`[Liva] Created diagnostic from JSON:`, diagnostic);
                    diagnostics.push(diagnostic);
                }
                return diagnostics;
            }
        }
    } catch (e) {
        console.log(`[Liva] Failed to parse JSON:`, e);
        // Not JSON, fallback to text parsing
    }
    
    // Fallback to text-based parsing (legacy format)
    const lines = errorMessage.split('\n');

    // Read the source file to get line information
    try {
        const fileContent = require('fs').readFileSync(filePath, 'utf8');
        const fileLines = fileContent.split('\n');

        for (const line of lines) {
            // Look for error patterns in the compiler output
            // This is a basic parser - you might need to adjust based on actual compiler output format
            const errorMatch = line.match(/error:\s*(.+)/i) || line.match(/Error:\s*(.+)/i);
            const lineMatch = line.match(/line\s+(\d+)/i) || line.match(/:(\d+):/);

            if (errorMatch) {
                const errorText = errorMatch[1];
                let lineNumber = 0;

                if (lineMatch) {
                    lineNumber = parseInt(lineMatch[1]) - 1; // VS Code uses 0-based line numbers
                }

                // Clamp line number to valid range
                lineNumber = Math.max(0, Math.min(lineNumber, fileLines.length - 1));

                const range = new vscode.Range(
                    new vscode.Position(lineNumber, 0),
                    new vscode.Position(lineNumber, fileLines[lineNumber]?.length || 0)
                );

                const diagnostic = new vscode.Diagnostic(
                    range,
                    `Liva compiler error: ${errorText}`,
                    vscode.DiagnosticSeverity.Error
                );

                diagnostic.source = 'Liva Compiler';
                diagnostics.push(diagnostic);
            }
        }
    } catch (fileError) {
        console.error('Error reading file for diagnostics:', fileError);
    }

    return diagnostics;
}

interface LivaErrorJson {
    location?: {
        file: string;
        line: number;
        column?: number;
        source_line?: string;
        length?: number; // Phase 5.2: Precise token length for underlining
        context_before?: string[]; // Phase 5.2: Lines before error
        context_after?: string[]; // Phase 5.2: Lines after error
    };
    code: string;
    title: string;
    message: string;
    help?: string;
    suggestion?: string; // Phase 5.1: "Did you mean?" suggestions
    hint?: string; // Phase 5.4: Intelligent hints
    example?: string; // Phase 5.4: Code examples
    doc_link?: string; // Phase 5.4: Documentation links
    category?: string; // Phase 5.3: Error category name
}

function createDiagnosticFromJson(errorJson: LivaErrorJson, filePath: string): vscode.Diagnostic | null {
    if (!errorJson.location || !errorJson.location.line) {
        return null;
    }

    // VS Code uses 0-based line numbers
    const lineNumber = errorJson.location.line - 1;
    const column = errorJson.location.column ? errorJson.location.column - 1 : 0;
    
    // Try to read the file to get the correct line length
    let lineLength = 0;
    try {
        const fileContent = require('fs').readFileSync(filePath, 'utf8');
        const fileLines = fileContent.split('\n');
        lineLength = fileLines[lineNumber]?.length || 0;
    } catch (e) {
        lineLength = 100; // Fallback
    }

    // Phase 5.2: Use precise token length for highlighting
    let range: vscode.Range;
    if (errorJson.location.column && errorJson.location.column > 0) {
        // Use the actual token length if available (Phase 5.2 enhancement)
        const tokenLength = errorJson.location.length || 3; // Default to 3 if not provided
        const endColumn = Math.min(column + tokenLength, lineLength);
        range = new vscode.Range(
            new vscode.Position(lineNumber, column),
            new vscode.Position(lineNumber, endColumn)
        );
    } else {
        // Highlight the entire line
        range = new vscode.Range(
            new vscode.Position(lineNumber, 0),
            new vscode.Position(lineNumber, lineLength)
        );
    }

    // Phase 5.3: Add category to message
    let message = '';
    if (errorJson.category) {
        message = `[${errorJson.category}] ${errorJson.code}: ${errorJson.title}`;
    } else {
        message = `${errorJson.code}: ${errorJson.title}`;
    }
    
    if (errorJson.message && errorJson.message !== errorJson.title) {
        message += `\n\n${errorJson.message}`;
    }
    
    // Phase 5.1: Add "Did you mean?" suggestions
    if (errorJson.suggestion) {
        message += `\n\n💡 ${errorJson.suggestion}`;
    }
    
    // Phase 5.4: Add intelligent hints
    if (errorJson.hint) {
        message += `\n\n💡 Hint: ${errorJson.hint}`;
    }
    
    // Legacy help field (maintain backwards compatibility)
    if (errorJson.help && !errorJson.hint) {
        message += `\n\n💡 ${errorJson.help}`;
    }

    // Phase 5.4: Add documentation link
    if (errorJson.doc_link) {
        message += `\n\n📚 [View documentation](${errorJson.doc_link})`;
    }

    const diagnostic = new vscode.Diagnostic(
        range,
        message,
        vscode.DiagnosticSeverity.Error
    );

    diagnostic.code = errorJson.code;
    diagnostic.source = 'Liva Compiler';

    // Phase 5.4: Add code examples as related information
    if (errorJson.example) {
        const exampleLocation = new vscode.Location(
            vscode.Uri.file(filePath),
            range
        );
        diagnostic.relatedInformation = [
            new vscode.DiagnosticRelatedInformation(
                exampleLocation,
                `Example:\n${errorJson.example}`
            )
        ];
    }

    return diagnostic;
}
