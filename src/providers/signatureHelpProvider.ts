import * as vscode from 'vscode';

/**
 * Signature help provider for Liva language
 * Provides function parameter hints while typing
 */
export class LivaSignatureHelpProvider implements vscode.SignatureHelpProvider {
    
    /**
     * Provide signature help for the given position
     */
    provideSignatureHelp(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken,
        context: vscode.SignatureHelpContext
    ): vscode.ProviderResult<vscode.SignatureHelp> {
        
        // Get the line up to the cursor
        const linePrefix = document.lineAt(position).text.substring(0, position.character);
        
        // Find the function being called
        const functionMatch = linePrefix.match(/(\w+)\s*\(([^)]*)$/);
        if (!functionMatch) {
            return null;
        }

        const functionName = functionMatch[1];
        const argsText = functionMatch[2];
        
        // Count commas to determine active parameter
        const commaCount = (argsText.match(/,/g) || []).length;
        const activeParameter = commaCount;

        // Get signature information for the function
        const signatureInfo = this.getFunctionSignature(functionName);
        if (!signatureInfo) {
            return null;
        }

        const signatureHelp = new vscode.SignatureHelp();
        signatureHelp.signatures = [signatureInfo];
        signatureHelp.activeSignature = 0;
        signatureHelp.activeParameter = Math.min(activeParameter, signatureInfo.parameters.length - 1);

        return signatureHelp;
    }

    /**
     * Get signature information for a function
     */
    private getFunctionSignature(functionName: string): vscode.SignatureInformation | null {
        const signatures = this.getAllSignatures();
        return signatures[functionName] || null;
    }

    /**
     * Get all function signatures
     */
    private getAllSignatures(): Record<string, vscode.SignatureInformation> {
        return {
            // Built-in functions
            'print': this.createSignature(
                'print(value)',
                'Prints a value to the console without a newline',
                [{ label: 'value', documentation: 'The value to print (any type)' }]
            ),
            'println': this.createSignature(
                'println(value)',
                'Prints a value to the console with a newline',
                [{ label: 'value', documentation: 'The value to print (any type)' }]
            ),
            'length': this.createSignature(
                'length(collection)',
                'Returns the length of a collection or string',
                [{ label: 'collection', documentation: 'Array or string to measure' }]
            ),
            'push': this.createSignature(
                'push(array, item)',
                'Adds an item to the end of an array',
                [
                    { label: 'array', documentation: 'The array to modify' },
                    { label: 'item', documentation: 'The item to add' }
                ]
            ),
            'pop': this.createSignature(
                'pop(array)',
                'Removes and returns the last item from an array',
                [{ label: 'array', documentation: 'The array to modify' }]
            ),
            'insert': this.createSignature(
                'insert(array, index, item)',
                'Inserts an item at a specific index in an array',
                [
                    { label: 'array', documentation: 'The array to modify' },
                    { label: 'index', documentation: 'Index where to insert (0-based)' },
                    { label: 'item', documentation: 'The item to insert' }
                ]
            ),
            'remove': this.createSignature(
                'remove(array, index)',
                'Removes and returns the item at a specific index',
                [
                    { label: 'array', documentation: 'The array to modify' },
                    { label: 'index', documentation: 'Index of item to remove (0-based)' }
                ]
            ),
            'slice': this.createSignature(
                'slice(array, start, end)',
                'Returns a slice of the array from start to end',
                [
                    { label: 'array', documentation: 'The array to slice' },
                    { label: 'start', documentation: 'Start index (inclusive)' },
                    { label: 'end', documentation: 'End index (exclusive)' }
                ]
            ),
            'map': this.createSignature(
                'map(array, function)',
                'Applies a function to each element and returns a new array',
                [
                    { label: 'array', documentation: 'The array to transform' },
                    { label: 'function', documentation: 'Function to apply to each element' }
                ]
            ),
            'filter': this.createSignature(
                'filter(array, predicate)',
                'Returns a new array with elements that match the predicate',
                [
                    { label: 'array', documentation: 'The array to filter' },
                    { label: 'predicate', documentation: 'Function that returns true for elements to keep' }
                ]
            ),
            'reduce': this.createSignature(
                'reduce(array, function, initial)',
                'Reduces array to a single value using the function',
                [
                    { label: 'array', documentation: 'The array to reduce' },
                    { label: 'function', documentation: 'Reducer function (accumulator, element) => result' },
                    { label: 'initial', documentation: 'Initial accumulator value' }
                ]
            ),
            'range': this.createSignature(
                'range(start, end, step)',
                'Creates an array of numbers from start to end',
                [
                    { label: 'start', documentation: 'Starting number (inclusive)' },
                    { label: 'end', documentation: 'Ending number (exclusive)' },
                    { label: 'step', documentation: 'Optional: step size (default: 1)' }
                ]
            ),
            'split': this.createSignature(
                'split(string, separator)',
                'Splits a string into an array of substrings',
                [
                    { label: 'string', documentation: 'The string to split' },
                    { label: 'separator', documentation: 'Character or string to split on' }
                ]
            ),
            'join': this.createSignature(
                'join(array, separator)',
                'Joins array elements into a string',
                [
                    { label: 'array', documentation: 'Array of strings to join' },
                    { label: 'separator', documentation: 'String to insert between elements' }
                ]
            ),
            'substring': this.createSignature(
                'substring(string, start, end)',
                'Returns a substring from start to end',
                [
                    { label: 'string', documentation: 'The string to extract from' },
                    { label: 'start', documentation: 'Start index (inclusive)' },
                    { label: 'end', documentation: 'End index (exclusive)' }
                ]
            ),
            'replace': this.createSignature(
                'replace(string, old, new)',
                'Replaces occurrences of old with new in string',
                [
                    { label: 'string', documentation: 'The string to modify' },
                    { label: 'old', documentation: 'Substring to replace' },
                    { label: 'new', documentation: 'Replacement substring' }
                ]
            ),
            'toLowerCase': this.createSignature(
                'toLowerCase(string)',
                'Converts string to lowercase',
                [{ label: 'string', documentation: 'The string to convert' }]
            ),
            'toUpperCase': this.createSignature(
                'toUpperCase(string)',
                'Converts string to uppercase',
                [{ label: 'string', documentation: 'The string to convert' }]
            ),
            'trim': this.createSignature(
                'trim(string)',
                'Removes whitespace from both ends of string',
                [{ label: 'string', documentation: 'The string to trim' }]
            ),
            'parseInt': this.createSignature(
                'parseInt(string, radix)',
                'Parses string as an integer',
                [
                    { label: 'string', documentation: 'The string to parse' },
                    { label: 'radix', documentation: 'Optional: number base (2-36, default: 10)' }
                ]
            ),
            'parseFloat': this.createSignature(
                'parseFloat(string)',
                'Parses string as a floating-point number',
                [{ label: 'string', documentation: 'The string to parse' }]
            ),
            'toString': this.createSignature(
                'toString(value)',
                'Converts value to string representation',
                [{ label: 'value', documentation: 'The value to convert' }]
            ),
            'format': this.createSignature(
                'format(template, ...args)',
                'Formats a string with arguments',
                [
                    { label: 'template', documentation: 'Format template string' },
                    { label: '...args', documentation: 'Values to insert into template' }
                ]
            ),
            
            // Math functions
            'abs': this.createSignature(
                'abs(number)',
                'Returns absolute value of number',
                [{ label: 'number', documentation: 'The number to process' }]
            ),
            'sqrt': this.createSignature(
                'sqrt(number)',
                'Returns square root of number',
                [{ label: 'number', documentation: 'The number (must be non-negative)' }]
            ),
            'pow': this.createSignature(
                'pow(base, exponent)',
                'Returns base raised to exponent power',
                [
                    { label: 'base', documentation: 'The base number' },
                    { label: 'exponent', documentation: 'The exponent' }
                ]
            ),
            'min': this.createSignature(
                'min(a, b)',
                'Returns the smaller of two numbers',
                [
                    { label: 'a', documentation: 'First number' },
                    { label: 'b', documentation: 'Second number' }
                ]
            ),
            'max': this.createSignature(
                'max(a, b)',
                'Returns the larger of two numbers',
                [
                    { label: 'a', documentation: 'First number' },
                    { label: 'b', documentation: 'Second number' }
                ]
            ),
            'floor': this.createSignature(
                'floor(number)',
                'Rounds number down to nearest integer',
                [{ label: 'number', documentation: 'The number to round' }]
            ),
            'ceil': this.createSignature(
                'ceil(number)',
                'Rounds number up to nearest integer',
                [{ label: 'number', documentation: 'The number to round' }]
            ),
            'round': this.createSignature(
                'round(number)',
                'Rounds number to nearest integer',
                [{ label: 'number', documentation: 'The number to round' }]
            ),
        };
    }

    /**
     * Helper to create signature information
     */
    private createSignature(
        label: string,
        documentation: string,
        parameters: Array<{ label: string; documentation: string }>
    ): vscode.SignatureInformation {
        const signature = new vscode.SignatureInformation(label, documentation);
        signature.parameters = parameters.map(p => 
            new vscode.ParameterInformation(p.label, p.documentation)
        );
        return signature;
    }
}
