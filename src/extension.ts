import * as vscode from 'vscode';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Diagnostic collection for Liva errors
const livaDiagnostics = vscode.languages.createDiagnosticCollection('liva');

export function activate(context: vscode.ExtensionContext) {
    console.log('Liva extension is now active!');

    // Clear diagnostics on activation
    livaDiagnostics.clear();

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

    // File watcher for auto-build
    const fileWatcher = vscode.workspace.onDidSaveTextDocument(async (document) => {
        if (document.languageId === 'liva' && getConfig<boolean>('autoBuild', true)) {
            const filePath = document.fileName;
            await compileLivaFile(filePath, true); // Silent mode for auto-build
        }
    });

    context.subscriptions.push(compileCommand, runCommand, checkCommand, fileWatcher);
}

export function deactivate() {}

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
            `"${compilerPath}" "${filePath}" --output "${outputDir}"`
        );

        if (stdout && !silent) {
            vscode.window.showInformationMessage('Compilation successful!');
        }

        if (stderr && !silent) {
            console.log('Compiler stderr:', stderr);
        }

    } catch (error: any) {
        const errorMessage = error.message || error.toString();

        // Parse compiler errors and show as diagnostics
        const diagnostics = parseCompilerErrors(errorMessage, filePath);
        if (diagnostics.length > 0 && vscode.window.activeTextEditor) {
            livaDiagnostics.set(vscode.window.activeTextEditor.document.uri, diagnostics);
        }

        if (!silent) {
            vscode.window.showErrorMessage(`Compilation failed: ${errorMessage}`);
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
            `"${compilerPath}" "${filePath}" --check`
        );

        if (stdout) {
            vscode.window.showInformationMessage('Syntax check passed!');
        }

        if (stderr) {
            console.log('Check stderr:', stderr);
        }

    } catch (error: any) {
        const errorMessage = error.message || error.toString();

        // Parse compiler errors and show as diagnostics
        const diagnostics = parseCompilerErrors(errorMessage, filePath);
        if (diagnostics.length > 0 && vscode.window.activeTextEditor) {
            livaDiagnostics.set(vscode.window.activeTextEditor.document.uri, diagnostics);
        }

        vscode.window.showErrorMessage(`Syntax check failed: ${errorMessage}`);
        console.error('Liva syntax check error:', error);
    }
}

function getConfig<T>(section: string, defaultValue: T): T {
    const config = vscode.workspace.getConfiguration('liva');
    return config.get<T>(section, defaultValue);
}

function parseCompilerErrors(errorMessage: string, filePath: string): vscode.Diagnostic[] {
    const diagnostics: vscode.Diagnostic[] = [];
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
