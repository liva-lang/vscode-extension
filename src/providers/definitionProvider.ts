import * as vscode from 'vscode';

/**
 * Definition provider for Liva language
 * Provides "Go to Definition" functionality (F12)
 * 
 * Phase 2 implementation: Searches within the current file
 * Future: Cross-file definitions with full AST parsing
 */
export class LivaDefinitionProvider implements vscode.DefinitionProvider {
    
    /**
     * Provide definition location for the symbol at the given position
     */
    provideDefinition(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.Definition | vscode.LocationLink[]> {
        
        const range = document.getWordRangeAtPosition(position);
        if (!range) {
            return null;
        }

        const word = document.getText(range);
        const line = document.lineAt(position.line).text;

        // Try to find the definition in the current file
        const definitions = this.findDefinitionsInDocument(document, word);
        
        if (definitions.length === 0) {
            return null;
        }

        // Return the first definition found
        // Future: could show all definitions if multiple exist
        return definitions[0];
    }

    /**
     * Find all definitions of a symbol in the document
     */
    private findDefinitionsInDocument(
        document: vscode.TextDocument,
        symbolName: string
    ): vscode.Location[] {
        const locations: vscode.Location[] = [];
        
        // Search for function definitions
        locations.push(...this.findFunctionDefinitions(document, symbolName));
        
        // Search for variable declarations
        locations.push(...this.findVariableDeclarations(document, symbolName));
        
        // Search for class definitions
        locations.push(...this.findClassDefinitions(document, symbolName));
        
        return locations;
    }

    /**
     * Find function definitions
     * Matches: functionName(params) => expr
     *          functionName(params) { ... }
     */
    private findFunctionDefinitions(
        document: vscode.TextDocument,
        functionName: string
    ): vscode.Location[] {
        const locations: vscode.Location[] = [];
        
        // Regex patterns for function definitions
        const patterns = [
            // One-liner: name(params) => expr
            new RegExp(`^\\s*(${functionName})\\s*\\([^)]*\\)\\s*=>`, 'm'),
            // Block function: name(params) {
            new RegExp(`^\\s*(${functionName})\\s*\\([^)]*\\)\\s*{`, 'm'),
            // With return type: name(params): Type {
            new RegExp(`^\\s*(${functionName})\\s*\\([^)]*\\)\\s*:\\s*\\w+\\s*{`, 'm'),
            // With return type arrow: name(params): Type => expr
            new RegExp(`^\\s*(${functionName})\\s*\\([^)]*\\)\\s*:\\s*\\w+\\s*=>`, 'm'),
        ];

        const text = document.getText();
        
        for (const pattern of patterns) {
            const matches = text.matchAll(new RegExp(pattern.source, 'gm'));
            for (const match of matches) {
                if (match.index !== undefined) {
                    const position = document.positionAt(match.index);
                    const range = new vscode.Range(position, position.translate(0, functionName.length));
                    locations.push(new vscode.Location(document.uri, range));
                }
            }
        }

        return locations;
    }

    /**
     * Find variable declarations
     * Matches: let varName = ...
     *          const CONSTANT = ...
     */
    private findVariableDeclarations(
        document: vscode.TextDocument,
        variableName: string
    ): vscode.Location[] {
        const locations: vscode.Location[] = [];
        
        // Regex patterns for variable declarations
        const patterns = [
            // let varName = ...
            new RegExp(`^\\s*let\\s+(${variableName})\\s*[=,]`, 'm'),
            // const CONSTANT = ...
            new RegExp(`^\\s*const\\s+(${variableName})\\s*=`, 'm'),
            // Error binding: let value, err = ...
            new RegExp(`^\\s*let\\s+\\w+\\s*,\\s*(${variableName})\\s*=`, 'm'),
            new RegExp(`^\\s*let\\s+(${variableName})\\s*,\\s*\\w+\\s*=`, 'm'),
        ];

        const text = document.getText();
        
        for (const pattern of patterns) {
            const matches = text.matchAll(new RegExp(pattern.source, 'gm'));
            for (const match of matches) {
                if (match.index !== undefined && match[1]) {
                    const position = document.positionAt(match.index + match[0].indexOf(match[1]));
                    const range = new vscode.Range(position, position.translate(0, variableName.length));
                    locations.push(new vscode.Location(document.uri, range));
                }
            }
        }

        return locations;
    }

    /**
     * Find class definitions
     * Matches: ClassName { ... }
     */
    private findClassDefinitions(
        document: vscode.TextDocument,
        className: string
    ): vscode.Location[] {
        const locations: vscode.Location[] = [];
        
        // Regex pattern for class definitions
        // ClassName {
        const pattern = new RegExp(`^\\s*(${className})\\s*{`, 'm');

        const text = document.getText();
        const matches = text.matchAll(new RegExp(pattern.source, 'gm'));
        
        for (const match of matches) {
            if (match.index !== undefined) {
                // Make sure it's a PascalCase name (class convention)
                if (className[0] === className[0].toUpperCase()) {
                    const position = document.positionAt(match.index);
                    const range = new vscode.Range(position, position.translate(0, className.length));
                    locations.push(new vscode.Location(document.uri, range));
                }
            }
        }

        return locations;
    }
}

/**
 * Reference provider for Liva language
 * Provides "Find All References" functionality (Shift+F12)
 */
export class LivaReferenceProvider implements vscode.ReferenceProvider {
    
    /**
     * Provide all references to the symbol at the given position
     */
    provideReferences(
        document: vscode.TextDocument,
        position: vscode.Position,
        context: vscode.ReferenceContext,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.Location[]> {
        
        const range = document.getWordRangeAtPosition(position);
        if (!range) {
            return null;
        }

        const word = document.getText(range);
        
        // Find all references in the document
        const references = this.findReferencesInDocument(document, word);
        
        if (!context.includeDeclaration) {
            // Filter out the declaration if requested
            return references.filter(loc => {
                const line = document.lineAt(loc.range.start.line).text;
                return !(line.match(/^\s*(let|const|fn)\s+/) && line.includes(word));
            });
        }
        
        return references;
    }

    /**
     * Find all references to a symbol in the document
     */
    private findReferencesInDocument(
        document: vscode.TextDocument,
        symbolName: string
    ): vscode.Location[] {
        const locations: vscode.Location[] = [];
        
        // Create a regex that matches the symbol as a whole word
        const pattern = new RegExp(`\\b${symbolName}\\b`, 'g');
        const text = document.getText();
        
        const matches = text.matchAll(pattern);
        for (const match of matches) {
            if (match.index !== undefined) {
                const position = document.positionAt(match.index);
                const range = new vscode.Range(position, position.translate(0, symbolName.length));
                locations.push(new vscode.Location(document.uri, range));
            }
        }

        return locations;
    }
}
