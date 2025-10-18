import * as vscode from 'vscode';

/**
 * Document symbol provider for Liva language
 * Provides outline view and breadcrumbs navigation
 */
export class LivaDocumentSymbolProvider implements vscode.DocumentSymbolProvider {
    
    /**
     * Provide document symbols for outline view
     */
    provideDocumentSymbols(
        document: vscode.TextDocument,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.SymbolInformation[] | vscode.DocumentSymbol[]> {
        
        const symbols: vscode.DocumentSymbol[] = [];
        
        // Parse functions
        symbols.push(...this.parseFunctions(document));
        
        // Parse classes
        symbols.push(...this.parseClasses(document));
        
        // Parse constants
        symbols.push(...this.parseConstants(document));
        
        return symbols;
    }

    /**
     * Parse function definitions
     */
    private parseFunctions(document: vscode.TextDocument): vscode.DocumentSymbol[] {
        const symbols: vscode.DocumentSymbol[] = [];
        const text = document.getText();
        
        // Regex patterns for different function styles
        const patterns = [
            // One-liner: name(params) => expr
            /^(\s*)(\w+)\s*\(([^)]*)\)\s*=>\s*(.+)$/gm,
            // Block function: name(params) { ... }
            /^(\s*)(\w+)\s*\(([^)]*)\)\s*\{/gm,
            // With return type: name(params): Type {
            /^(\s*)(\w+)\s*\(([^)]*)\)\s*:\s*(\w+)\s*\{/gm,
            // With return type arrow: name(params): Type => expr
            /^(\s*)(\w+)\s*\(([^)]*)\)\s*:\s*(\w+)\s*=>\s*(.+)$/gm,
        ];

        for (const pattern of patterns) {
            const matches = text.matchAll(pattern);
            for (const match of matches) {
                if (match.index !== undefined) {
                    const functionName = match[2];
                    const params = match[3] || '';
                    const hasReturnType = match[4] && match[4] !== '{';
                    
                    // Skip if it's 'constructor' (part of a class)
                    if (functionName === 'constructor') {
                        continue;
                    }
                    
                    const startPos = document.positionAt(match.index);
                    const endOfLine = document.lineAt(startPos.line).range.end;
                    
                    // Create the symbol
                    const detail = hasReturnType ? `: ${match[4]}` : '';
                    const symbolName = `${functionName}(${params})${detail}`;
                    
                    const symbol = new vscode.DocumentSymbol(
                        symbolName,
                        '', // detail
                        vscode.SymbolKind.Function,
                        new vscode.Range(startPos, endOfLine),
                        new vscode.Range(startPos, startPos.translate(0, functionName.length))
                    );
                    
                    symbols.push(symbol);
                }
            }
        }

        return symbols;
    }

    /**
     * Parse class definitions
     */
    private parseClasses(document: vscode.TextDocument): vscode.DocumentSymbol[] {
        const symbols: vscode.DocumentSymbol[] = [];
        const text = document.getText();
        
        // Pattern: ClassName {
        const classPattern = /^(\s*)([A-Z]\w*)\s*\{/gm;
        const matches = text.matchAll(classPattern);
        
        for (const match of matches) {
            if (match.index !== undefined) {
                const className = match[2];
                const startPos = document.positionAt(match.index);
                
                // Find the closing brace
                const endPos = this.findClosingBrace(text, match.index);
                const endPosition = endPos ? document.positionAt(endPos) : document.lineAt(startPos.line).range.end;
                
                // Create class symbol
                const classSymbol = new vscode.DocumentSymbol(
                    className,
                    'class',
                    vscode.SymbolKind.Class,
                    new vscode.Range(startPos, endPosition),
                    new vscode.Range(startPos, startPos.translate(0, className.length))
                );
                
                // Parse class members
                const classBody = text.substring(match.index, endPos || text.length);
                classSymbol.children = this.parseClassMembers(document, classBody, match.index!);
                
                symbols.push(classSymbol);
            }
        }

        return symbols;
    }

    /**
     * Parse class members (constructor, fields, methods)
     */
    private parseClassMembers(
        document: vscode.TextDocument,
        classBody: string,
        classStartIndex: number
    ): vscode.DocumentSymbol[] {
        const members: vscode.DocumentSymbol[] = [];
        
        // Parse constructor
        const constructorPattern = /constructor\s*\(([^)]*)\)\s*\{/g;
        const constructorMatches = classBody.matchAll(constructorPattern);
        for (const match of constructorMatches) {
            if (match.index !== undefined) {
                const params = match[1];
                const absoluteIndex = classStartIndex + match.index;
                const startPos = document.positionAt(absoluteIndex);
                const endPos = document.lineAt(startPos.line).range.end;
                
                const symbol = new vscode.DocumentSymbol(
                    `constructor(${params})`,
                    '',
                    vscode.SymbolKind.Constructor,
                    new vscode.Range(startPos, endPos),
                    new vscode.Range(startPos, startPos.translate(0, 11)) // length of "constructor"
                );
                members.push(symbol);
            }
        }
        
        // Parse fields
        const fieldPattern = /^\s+(\w+)\s*:\s*(\w+)/gm;
        const fieldMatches = classBody.matchAll(fieldPattern);
        for (const match of fieldMatches) {
            if (match.index !== undefined) {
                const fieldName = match[1];
                const fieldType = match[2];
                const absoluteIndex = classStartIndex + match.index;
                const startPos = document.positionAt(absoluteIndex);
                const endPos = document.lineAt(startPos.line).range.end;
                
                const symbol = new vscode.DocumentSymbol(
                    fieldName,
                    fieldType,
                    vscode.SymbolKind.Field,
                    new vscode.Range(startPos, endPos),
                    new vscode.Range(startPos, startPos.translate(0, fieldName.length))
                );
                members.push(symbol);
            }
        }
        
        // Parse methods (similar to functions but inside class)
        const methodPatterns = [
            /^\s+(\w+)\s*\(([^)]*)\)\s*=>\s*(.+)$/gm,
            /^\s+(\w+)\s*\(([^)]*)\)\s*\{/gm,
            /^\s+(\w+)\s*\(([^)]*)\)\s*:\s*(\w+)\s*\{/gm,
        ];
        
        for (const pattern of methodPatterns) {
            const methodMatches = classBody.matchAll(pattern);
            for (const match of methodMatches) {
                if (match.index !== undefined) {
                    const methodName = match[1];
                    // Skip constructor (already handled)
                    if (methodName === 'constructor') {
                        continue;
                    }
                    
                    const params = match[2] || '';
                    const absoluteIndex = classStartIndex + match.index;
                    const startPos = document.positionAt(absoluteIndex);
                    const endPos = document.lineAt(startPos.line).range.end;
                    
                    const symbol = new vscode.DocumentSymbol(
                        `${methodName}(${params})`,
                        'method',
                        vscode.SymbolKind.Method,
                        new vscode.Range(startPos, endPos),
                        new vscode.Range(startPos, startPos.translate(0, methodName.length))
                    );
                    members.push(symbol);
                }
            }
        }
        
        return members;
    }

    /**
     * Parse constant declarations
     */
    private parseConstants(document: vscode.TextDocument): vscode.DocumentSymbol[] {
        const symbols: vscode.DocumentSymbol[] = [];
        const text = document.getText();
        
        // Pattern: const NAME = value
        const constPattern = /^(\s*)const\s+([A-Z_][A-Z0-9_]*)\s*=\s*(.+)$/gm;
        const matches = text.matchAll(constPattern);
        
        for (const match of matches) {
            if (match.index !== undefined) {
                const constName = match[2];
                const value = match[3].trim();
                const startPos = document.positionAt(match.index);
                const endPos = document.lineAt(startPos.line).range.end;
                
                const symbol = new vscode.DocumentSymbol(
                    constName,
                    value.length > 30 ? value.substring(0, 27) + '...' : value,
                    vscode.SymbolKind.Constant,
                    new vscode.Range(startPos, endPos),
                    new vscode.Range(startPos, startPos.translate(0, constName.length))
                );
                
                symbols.push(symbol);
            }
        }

        return symbols;
    }

    /**
     * Find the closing brace for a block starting at startIndex
     */
    private findClosingBrace(text: string, startIndex: number): number | null {
        let braceCount = 0;
        let inString = false;
        let stringChar = '';
        
        for (let i = startIndex; i < text.length; i++) {
            const char = text[i];
            const prevChar = i > 0 ? text[i - 1] : '';
            
            // Handle strings
            if ((char === '"' || char === "'") && prevChar !== '\\') {
                if (!inString) {
                    inString = true;
                    stringChar = char;
                } else if (char === stringChar) {
                    inString = false;
                    stringChar = '';
                }
                continue;
            }
            
            if (inString) {
                continue;
            }
            
            // Count braces
            if (char === '{') {
                braceCount++;
            } else if (char === '}') {
                braceCount--;
                if (braceCount === 0) {
                    return i;
                }
            }
        }
        
        return null;
    }
}
