import * as vscode from 'vscode';

/**
 * Interface Validator
 * 
 * Validates that classes implementing interfaces have all required methods.
 * Shows red squiggly underlines for missing method implementations.
 */

interface MethodSignature {
    name: string;
    params: string;
    returnType: string;
    line: number;
}

interface InterfaceDefinition {
    name: string;
    methods: MethodSignature[];
    line: number;
}

interface ClassDefinition {
    name: string;
    interfaces: string[];
    methods: string[];
    line: number;
    implementsLine: number; // Line where "ClassName : Interface" appears
}

export function validateInterfaces(document: vscode.TextDocument): vscode.Diagnostic[] {
    const diagnostics: vscode.Diagnostic[] = [];
    const text = document.getText();
    const lines = text.split('\n');

    // Step 1: Extract all interface definitions
    const interfaces = extractInterfaces(lines);
    
    // Step 2: Extract all class definitions with their interfaces
    const classes = extractClasses(lines);

    // Step 3: Validate each class implements all required methods
    for (const cls of classes) {
        for (const interfaceName of cls.interfaces) {
            const iface = interfaces.get(interfaceName);
            
            if (!iface) {
                // Interface not found - show warning on the implements line
                const range = new vscode.Range(
                    new vscode.Position(cls.implementsLine, 0),
                    new vscode.Position(cls.implementsLine, lines[cls.implementsLine].length)
                );
                
                diagnostics.push(new vscode.Diagnostic(
                    range,
                    `Interface '${interfaceName}' not found`,
                    vscode.DiagnosticSeverity.Warning
                ));
                continue;
            }

            // Check each required method
            for (const method of iface.methods) {
                if (!cls.methods.includes(method.name)) {
                    // Method not implemented - show error on the class declaration line
                    const range = new vscode.Range(
                        new vscode.Position(cls.implementsLine, 0),
                        new vscode.Position(cls.implementsLine, lines[cls.implementsLine].length)
                    );

                    const message = `Class '${cls.name}' does not implement method '${method.name}' from interface '${interfaceName}'\n\n` +
                                  `Required: ${method.name}(${method.params})${method.returnType ? `: ${method.returnType}` : ''}\n\n` +
                                  `💡 Add this method to the class or remove the interface from the implements clause`;

                    diagnostics.push(new vscode.Diagnostic(
                        range,
                        message,
                        vscode.DiagnosticSeverity.Error
                    ));
                }
            }
        }
    }

    return diagnostics;
}

function extractInterfaces(lines: string[]): Map<string, InterfaceDefinition> {
    const interfaces = new Map<string, InterfaceDefinition>();
    let currentInterface: InterfaceDefinition | null = null;
    let braceDepth = 0;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // Skip comments
        if (line.startsWith('//') || line.startsWith('/*')) {
            continue;
        }

        // Detect interface start: "InterfaceName {"
        // Must NOT have "constructor" (that indicates it's a class, not interface)
        // Must NOT have field declarations like "fieldName: Type" on its own line (classes have fields)
        const interfaceMatch = line.match(/^([A-Z][a-zA-Z0-9_]*)\s*\{/);
        
        if (interfaceMatch && !currentInterface) {
            const name = interfaceMatch[1];
            currentInterface = {
                name,
                methods: [],
                line: i
            };
            braceDepth = 1;
            continue;
        }

        if (currentInterface) {
            // Track brace depth
            braceDepth += (line.match(/\{/g) || []).length;
            braceDepth -= (line.match(/\}/g) || []).length;

            // End of interface
            if (braceDepth === 0) {
                // Only consider it an interface if it has no constructor
                // We'll validate this by checking if we found "constructor" inside
                let hasConstructor = false;
                for (let j = currentInterface.line; j <= i; j++) {
                    if (lines[j].includes('constructor')) {
                        hasConstructor = true;
                        break;
                    }
                }

                // Only add if it looks like an interface (no constructor, no field implementations)
                if (!hasConstructor) {
                    interfaces.set(currentInterface.name, currentInterface);
                }
                
                currentInterface = null;
                continue;
            }

            // Detect method signature: "methodName(params): ReturnType" or "methodName(): ReturnType"
            // Method signatures should NOT have "=>" or "{" on the same line (those are implementations)
            const methodMatch = line.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*\((.*?)\)\s*(?::\s*([a-zA-Z0-9_\[\]]+))?$/);
            
            if (methodMatch && !line.includes('=>') && !line.includes('{')) {
                const methodName = methodMatch[1];
                const params = methodMatch[2] || '';
                const returnType = methodMatch[3] || '';

                currentInterface.methods.push({
                    name: methodName,
                    params,
                    returnType,
                    line: i
                });
            }
        }
    }

    return interfaces;
}

function extractClasses(lines: string[]): ClassDefinition[] {
    const classes: ClassDefinition[] = [];
    let currentClass: ClassDefinition | null = null;
    let braceDepth = 0;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // Skip comments
        if (line.startsWith('//') || line.startsWith('/*')) {
            continue;
        }

        // Detect class with interface implementation: "ClassName : Interface1, Interface2 {"
        const classWithInterfaceMatch = line.match(/^([A-Z][a-zA-Z0-9_]*)\s*:\s*([A-Z][a-zA-Z0-9_,\s]+)\s*\{/);
        
        if (classWithInterfaceMatch && !currentClass) {
            const className = classWithInterfaceMatch[1];
            const interfaceList = classWithInterfaceMatch[2]
                .split(',')
                .map(name => name.trim())
                .filter(name => name.length > 0);

            currentClass = {
                name: className,
                interfaces: interfaceList,
                methods: [],
                line: i,
                implementsLine: i
            };
            braceDepth = 1;
            continue;
        }

        if (currentClass) {
            // Track brace depth
            braceDepth += (line.match(/\{/g) || []).length;
            braceDepth -= (line.match(/\}/g) || []).length;

            // End of class
            if (braceDepth === 0) {
                classes.push(currentClass);
                currentClass = null;
                continue;
            }

            // Detect method implementation: "methodName() =>" or "methodName() {"
            const methodMatch = line.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/);
            
            if (methodMatch) {
                const methodName = methodMatch[1];
                
                // Skip constructor
                if (methodName !== 'constructor') {
                    currentClass.methods.push(methodName);
                }
            }
        }
    }

    return classes;
}

/**
 * Provider that runs interface validation in real-time
 */
export class InterfaceValidationProvider {
    private diagnosticCollection: vscode.DiagnosticCollection;
    private validationTimeout: NodeJS.Timeout | undefined;

    constructor() {
        this.diagnosticCollection = vscode.languages.createDiagnosticCollection('liva-interfaces');
    }

    public activate(context: vscode.ExtensionContext): void {
        // Validate all open documents on activation
        vscode.workspace.textDocuments.forEach(doc => {
            if (doc.languageId === 'liva') {
                this.validateDocument(doc);
            }
        });

        // Validate on document change (with debounce)
        context.subscriptions.push(
            vscode.workspace.onDidChangeTextDocument(event => {
                if (event.document.languageId === 'liva') {
                    this.scheduleValidation(event.document);
                }
            })
        );

        // Validate on document open
        context.subscriptions.push(
            vscode.workspace.onDidOpenTextDocument(doc => {
                if (doc.languageId === 'liva') {
                    this.validateDocument(doc);
                }
            })
        );

        // Clear diagnostics on document close
        context.subscriptions.push(
            vscode.workspace.onDidCloseTextDocument(doc => {
                this.diagnosticCollection.delete(doc.uri);
            })
        );

        // Add diagnostic collection to subscriptions for cleanup
        context.subscriptions.push(this.diagnosticCollection);
    }

    private scheduleValidation(document: vscode.TextDocument): void {
        // Clear previous timeout
        if (this.validationTimeout) {
            clearTimeout(this.validationTimeout);
        }

        // Debounce: validate 300ms after user stops typing
        this.validationTimeout = setTimeout(() => {
            this.validateDocument(document);
        }, 300);
    }

    private validateDocument(document: vscode.TextDocument): void {
        const diagnostics = validateInterfaces(document);
        this.diagnosticCollection.set(document.uri, diagnostics);
    }

    public dispose(): void {
        if (this.validationTimeout) {
            clearTimeout(this.validationTimeout);
        }
        this.diagnosticCollection.clear();
        this.diagnosticCollection.dispose();
    }
}
