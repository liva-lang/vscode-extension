import * as path from 'path';
import * as vscode from 'vscode';
import {
    LanguageClient,
    LanguageClientOptions,
    ServerOptions,
    TransportKind
} from 'vscode-languageclient/node';

let client: LanguageClient | undefined;

export function activateLspClient(context: vscode.ExtensionContext): void {
    // Get compiler path from configuration
    const config = vscode.workspace.getConfiguration('liva');
    const compilerPath = config.get<string>('compiler.path', 'livac');
    
    // Check if LSP is enabled
    const lspEnabled = config.get<boolean>('lsp.enabled', true);
    if (!lspEnabled) {
        console.log('[Liva LSP] LSP client disabled in configuration');
        return;
    }

    console.log(`[Liva LSP] Starting Language Server at: ${compilerPath}`);

    // Define how to start the LSP server
    const serverOptions: ServerOptions = {
        command: compilerPath,
        args: ['--lsp'],
        transport: TransportKind.stdio,
    };

    // Options to control the language client
    const clientOptions: LanguageClientOptions = {
        // Register the server for Liva documents
        documentSelector: [
            { scheme: 'file', language: 'liva' },
            { scheme: 'untitled', language: 'liva' }
        ],
        synchronize: {
            // Notify the server about file changes to '.liva' files in the workspace
            fileEvents: vscode.workspace.createFileSystemWatcher('**/*.liva')
        },
        outputChannelName: 'Liva Language Server',
    };

    // Create the language client and start it
    client = new LanguageClient(
        'livaLanguageServer',
        'Liva Language Server',
        serverOptions,
        clientOptions
    );

    // Start the client (this will also launch the server)
    client.start().then(() => {
        console.log('[Liva LSP] Language Server started successfully');
        vscode.window.showInformationMessage('Liva Language Server started');
    }).catch((error) => {
        console.error('[Liva LSP] Failed to start Language Server:', error);
        vscode.window.showErrorMessage(`Failed to start Liva LSP: ${error.message}`);
    });

    // Register a command to restart the LSP server
    const restartCommand = vscode.commands.registerCommand('liva.restartLsp', async () => {
        if (client) {
            await client.stop();
            await client.start();
            vscode.window.showInformationMessage('Liva Language Server restarted');
        }
    });

    context.subscriptions.push(restartCommand);
}

export function deactivateLspClient(): Thenable<void> | undefined {
    if (!client) {
        return undefined;
    }
    return client.stop();
}
