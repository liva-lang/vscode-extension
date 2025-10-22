import * as vscode from 'vscode';

interface FunctionInfo {
    name: string;
    line: number;
    isFallible: boolean;
}

/**
 * Validator for fallible function calls in Liva
 * Detects when fallible functions (containing 'fail' statements) are called
 * without proper error binding pattern (let result, err = ...)
 */
export class FallibleFunctionValidator {
    private diagnosticCollection: vscode.DiagnosticCollection;

    constructor() {
        this.diagnosticCollection = vscode.languages.createDiagnosticCollection('liva-fallible');
    }

    public activate(context: vscode.ExtensionContext) {
        // Validate on document change (debounced)
        let validationTimeout: NodeJS.Timeout | undefined;
        const changeListener = vscode.workspace.onDidChangeTextDocument((event) => {
            if (event.document.languageId === 'liva') {
                if (validationTimeout) {
                    clearTimeout(validationTimeout);
                }

                validationTimeout = setTimeout(() => {
                    this.validateDocument(event.document);
                }, 300); // 300ms debounce
            }
        });

        // Validate on document open
        const openListener = vscode.workspace.onDidOpenTextDocument((document) => {
            if (document.languageId === 'liva') {
                this.validateDocument(document);
            }
        });

        // Validate all open documents on activation
        vscode.workspace.textDocuments.forEach((document) => {
            if (document.languageId === 'liva') {
                this.validateDocument(document);
            }
        });

        context.subscriptions.push(
            this.diagnosticCollection,
            changeListener,
            openListener
        );
    }

    private validateDocument(document: vscode.TextDocument) {
        const diagnostics: vscode.Diagnostic[] = [];
        const text = document.getText();
        const lines = text.split('\n');

        // Step 1: Detect which functions are fallible (contain 'fail' statements)
        const fallibleFunctions = this.detectFallibleFunctions(lines);
        
        console.log(`[FallibleValidator] Detected fallible functions:`, fallibleFunctions.map(f => f.name));

        // Step 2: Find all function calls and check if they're fallible
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmedLine = line.trim();

            // Skip empty lines and comments
            if (!trimmedLine || trimmedLine.startsWith('//')) {
                continue;
            }

            // Check for function calls in this line
            for (const func of fallibleFunctions) {
                if (this.containsFunctionCall(line, func.name)) {
                    // Check if this line is in an error binding context
                    if (!this.isInErrorBindingContext(line)) {
                        // Create diagnostic for this error
                        const diagnostic = this.createFallibleCallDiagnostic(
                            document,
                            i,
                            line,
                            func.name
                        );
                        if (diagnostic) {
                            diagnostics.push(diagnostic);
                        }
                    }
                }
            }
        }

        console.log(`[FallibleValidator] Found ${diagnostics.length} fallible call errors`);
        this.diagnosticCollection.set(document.uri, diagnostics);
    }

    /**
     * Detect which functions contain 'fail' statements
     */
    private detectFallibleFunctions(lines: string[]): FunctionInfo[] {
        const functions: FunctionInfo[] = [];
        let currentFunction: { name: string; line: number; depth: number } | null = null;
        let braceDepth = 0;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmedLine = line.trim();

            // Skip comments and empty lines
            if (!trimmedLine || trimmedLine.startsWith('//')) {
                continue;
            }

            // Detect function declaration: functionName(params) {
            // Pattern: starts with identifier followed by (
            const funcMatch = trimmedLine.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/);
            if (funcMatch && trimmedLine.includes('{')) {
                const funcName = funcMatch[1];
                currentFunction = { name: funcName, line: i, depth: braceDepth };
                console.log(`[FallibleValidator] Found function declaration: ${funcName} at line ${i}`);
            }

            // Track brace depth to know when we exit a function
            const openBraces = (line.match(/{/g) || []).length;
            const closeBraces = (line.match(/}/g) || []).length;
            braceDepth += openBraces - closeBraces;

            // Check if current function contains 'fail' statement
            if (currentFunction && trimmedLine.includes('fail ')) {
                // Make sure it's actually a fail statement, not just the word "fail" in a string
                const failMatch = trimmedLine.match(/\bfail\s+/);
                if (failMatch) {
                    console.log(`[FallibleValidator] Function ${currentFunction.name} contains 'fail' at line ${i}`);
                    functions.push({
                        name: currentFunction.name,
                        line: currentFunction.line,
                        isFallible: true
                    });
                    currentFunction = null; // Mark this function as processed
                }
            }

            // If we've closed all braces from the function, reset current function
            if (currentFunction && braceDepth <= currentFunction.depth) {
                currentFunction = null;
            }
        }

        return functions;
    }

    /**
     * Check if a line contains a call to the specified function
     */
    private containsFunctionCall(line: string, funcName: string): boolean {
        // Look for funcName followed by (
        const callPattern = new RegExp(`\\b${funcName}\\s*\\(`);
        const hasCall = callPattern.test(line);
        
        if (hasCall) {
            // Make sure it's not a function declaration (doesn't start with the function name)
            const trimmed = line.trim();
            const isDeclaration = trimmed.startsWith(`${funcName}(`);
            return !isDeclaration;
        }
        
        return false;
    }

    /**
     * Check if a line is in an error binding context
     * Pattern: let varname, err = funcCall(...)
     */
    private isInErrorBindingContext(line: string): boolean {
        const trimmedLine = line.trim();
        
        // Check for error binding pattern: let x, err = ...
        // Must have:
        // 1. Start with "let"
        // 2. Have a comma before the equals sign
        if (trimmedLine.startsWith('let ')) {
            const beforeEquals = trimmedLine.split('=')[0];
            if (beforeEquals && beforeEquals.includes(',')) {
                return true;
            }
        }
        
        return false;
    }

    /**
     * Create a diagnostic for a fallible function call without error binding
     */
    private createFallibleCallDiagnostic(
        document: vscode.TextDocument,
        lineNumber: number,
        lineText: string,
        funcName: string
    ): vscode.Diagnostic | null {
        // Find the position of the function call in the line
        const callPattern = new RegExp(`\\b${funcName}\\s*\\(`);
        const match = callPattern.exec(lineText);
        
        if (!match) {
            return null;
        }

        const startColumn = match.index;
        const endColumn = startColumn + funcName.length;

        const range = new vscode.Range(
            new vscode.Position(lineNumber, startColumn),
            new vscode.Position(lineNumber, endColumn)
        );

        const message = `Function '${funcName}' can fail but is not being called with error binding.\n` +
                       `The function contains 'fail' statements and must be handled properly.\n\n` +
                       `💡 Change to: let result, err = ${funcName}(...)`;

        const diagnostic = new vscode.Diagnostic(
            range,
            message,
            vscode.DiagnosticSeverity.Error
        );

        diagnostic.code = 'E0701';
        diagnostic.source = 'Liva';

        return diagnostic;
    }

    public dispose() {
        this.diagnosticCollection.dispose();
    }
}
