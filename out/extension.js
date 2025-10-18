"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = require("vscode");
const path = require("path");
const child_process_1 = require("child_process");
const util_1 = require("util");
const completionProvider_1 = require("./providers/completionProvider");
const hoverProvider_1 = require("./providers/hoverProvider");
const signatureHelpProvider_1 = require("./providers/signatureHelpProvider");
const definitionProvider_1 = require("./providers/definitionProvider");
const symbolProvider_1 = require("./providers/symbolProvider");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
// Diagnostic collection for Liva errors
const livaDiagnostics = vscode.languages.createDiagnosticCollection('liva');
function activate(context) {
    console.log('Liva extension is now active!');
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
    const compileCommand = vscode.commands.registerCommand('liva.compile', async (fileUri) => {
        const filePath = fileUri?.fsPath || vscode.window.activeTextEditor?.document.fileName;
        if (!filePath) {
            vscode.window.showErrorMessage('No Liva file is currently open or selected');
            return;
        }
        await compileLivaFile(filePath);
    });
    const runCommand = vscode.commands.registerCommand('liva.run', async (fileUri) => {
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
        if (document.languageId === 'liva' && getConfig('autoBuild', true)) {
            const filePath = document.fileName;
            await compileLivaFile(filePath, true); // Silent mode for auto-build
        }
    });
    // Real-time validation while typing (with debounce)
    let validationTimeout;
    const changeListener = vscode.workspace.onDidChangeTextDocument((event) => {
        if (event.document.languageId === 'liva' && getConfig('liveValidation', true)) {
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
        if (document.languageId === 'liva' && getConfig('liveValidation', true)) {
            await validateLivaFile(document);
        }
    });
    // Register completion provider
    const completionProvider = vscode.languages.registerCompletionItemProvider('liva', new completionProvider_1.LiveCompletionProvider(), '.', // Trigger completion on dot for member access
    ' ', // Trigger on space for keywords
    '(');
    // Register hover provider
    const hoverProvider = vscode.languages.registerHoverProvider('liva', new hoverProvider_1.LivaHoverProvider());
    // Register signature help provider
    const signatureHelpProvider = vscode.languages.registerSignatureHelpProvider('liva', new signatureHelpProvider_1.LivaSignatureHelpProvider(), '(', // Trigger on opening parenthesis
    ',');
    // Register definition provider
    const definitionProvider = vscode.languages.registerDefinitionProvider('liva', new definitionProvider_1.LivaDefinitionProvider());
    // Register reference provider
    const referenceProvider = vscode.languages.registerReferenceProvider('liva', new definitionProvider_1.LivaReferenceProvider());
    // Register document symbol provider
    const symbolProvider = vscode.languages.registerDocumentSymbolProvider('liva', new symbolProvider_1.LivaDocumentSymbolProvider());
    context.subscriptions.push(compileCommand, runCommand, checkCommand, fileWatcher, changeListener, openListener, livaDiagnostics, completionProvider, hoverProvider, signatureHelpProvider, definitionProvider, referenceProvider, symbolProvider);
}
function deactivate() {
    livaDiagnostics.clear();
}
async function compileLivaFile(filePath, silent = false) {
    const compilerPath = getConfig('compiler.path', 'livac');
    const outputDir = getConfig('compiler.outputDirectory', './target/liva_build');
    // Clear previous diagnostics for this file
    if (vscode.window.activeTextEditor) {
        livaDiagnostics.delete(vscode.window.activeTextEditor.document.uri);
    }
    try {
        if (!silent) {
            vscode.window.showInformationMessage(`Compiling ${path.basename(filePath)}...`);
        }
        const { stdout, stderr } = await execAsync(`"${compilerPath}" "${filePath}" --output "${outputDir}" --json`);
        if (stdout && !silent) {
            vscode.window.showInformationMessage('Compilation successful!');
        }
        if (stderr && !silent) {
            console.log('Compiler stderr:', stderr);
        }
    }
    catch (error) {
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
async function runLivaProgram(filePath) {
    const compilerPath = getConfig('compiler.path', 'livac');
    const outputDir = getConfig('compiler.outputDirectory', './target/liva_build');
    try {
        vscode.window.showInformationMessage(`Running ${path.basename(filePath)}...`);
        const { stdout, stderr } = await execAsync(`"${compilerPath}" "${filePath}" --output "${outputDir}" --run`);
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
    }
    catch (error) {
        const errorMessage = error.message || error.toString();
        vscode.window.showErrorMessage(`Runtime failed: ${errorMessage}`);
        console.error('Liva runtime error:', error);
    }
}
async function checkLivaSyntax(filePath) {
    const compilerPath = getConfig('compiler.path', 'livac');
    // Clear previous diagnostics for this file
    if (vscode.window.activeTextEditor) {
        livaDiagnostics.delete(vscode.window.activeTextEditor.document.uri);
    }
    try {
        vscode.window.showInformationMessage(`Checking syntax of ${path.basename(filePath)}...`);
        const { stdout, stderr } = await execAsync(`"${compilerPath}" "${filePath}" --check --json`);
        if (stdout) {
            vscode.window.showInformationMessage('Syntax check passed!');
        }
        if (stderr) {
            console.log('Check stderr:', stderr);
        }
    }
    catch (error) {
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
async function validateLivaFile(document) {
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
    const compilerPath = getConfig('compiler.path', 'livac');
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
    }
    catch (error) {
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
    }
    finally {
        // Clean up temp file
        try {
            if (fs.existsSync(tmpFilePath)) {
                fs.unlinkSync(tmpFilePath);
                console.log(`[Liva] Cleaned up temp file: ${tmpFilePath}`);
            }
        }
        catch (cleanupError) {
            console.error(`[Liva] Failed to clean up temp file:`, cleanupError);
        }
    }
}
function getConfig(section, defaultValue) {
    const config = vscode.workspace.getConfiguration('liva');
    return config.get(section, defaultValue);
}
function parseCompilerErrors(errorMessage, filePath) {
    const diagnostics = [];
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
    }
    catch (e) {
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
                const range = new vscode.Range(new vscode.Position(lineNumber, 0), new vscode.Position(lineNumber, fileLines[lineNumber]?.length || 0));
                const diagnostic = new vscode.Diagnostic(range, `Liva compiler error: ${errorText}`, vscode.DiagnosticSeverity.Error);
                diagnostic.source = 'Liva Compiler';
                diagnostics.push(diagnostic);
            }
        }
    }
    catch (fileError) {
        console.error('Error reading file for diagnostics:', fileError);
    }
    return diagnostics;
}
function createDiagnosticFromJson(errorJson, filePath) {
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
    }
    catch (e) {
        lineLength = 100; // Fallback
    }
    // Create a range that highlights the specific error location
    // If we have column information, highlight from that column for a few characters
    // Otherwise, highlight the entire line
    let range;
    if (errorJson.location.column && errorJson.location.column > 0) {
        // Highlight approximately 3 characters from the error position
        const endColumn = Math.min(column + 3, lineLength);
        range = new vscode.Range(new vscode.Position(lineNumber, column), new vscode.Position(lineNumber, endColumn));
    }
    else {
        // Highlight the entire line
        range = new vscode.Range(new vscode.Position(lineNumber, 0), new vscode.Position(lineNumber, lineLength));
    }
    // Build the diagnostic message
    let message = `${errorJson.code}: ${errorJson.title}`;
    if (errorJson.message && errorJson.message !== errorJson.title) {
        message += `\n\n${errorJson.message}`;
    }
    if (errorJson.help) {
        message += `\n\n💡 ${errorJson.help}`;
    }
    const diagnostic = new vscode.Diagnostic(range, message, vscode.DiagnosticSeverity.Error);
    diagnostic.code = errorJson.code;
    diagnostic.source = 'Liva Compiler';
    return diagnostic;
}
//# sourceMappingURL=extension.js.map