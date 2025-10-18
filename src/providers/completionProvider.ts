import * as vscode from 'vscode';

/**
 * Completion provider for Liva language
 * Provides intelligent code completion for keywords, functions, variables, and more
 */
export class LiveCompletionProvider implements vscode.CompletionItemProvider {
    
    /**
     * Provide completion items for the given position
     */
    provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken,
        context: vscode.CompletionContext
    ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList> {
        
        const linePrefix = document.lineAt(position).text.substring(0, position.character);
        const completions: vscode.CompletionItem[] = [];

        // Get context-aware completions
        completions.push(...this.getKeywordCompletions(linePrefix));
        completions.push(...this.getConcurrencyCompletions(linePrefix));
        completions.push(...this.getControlFlowCompletions(linePrefix));
        completions.push(...this.getTypeCompletions(linePrefix));
        completions.push(...this.getErrorHandlingCompletions(linePrefix));
        completions.push(...this.getBuiltInFunctions(linePrefix));

        return completions;
    }

    /**
     * Get keyword completions
     */
    private getKeywordCompletions(linePrefix: string): vscode.CompletionItem[] {
        const keywords = [
            // Variable declarations
            { label: 'let', kind: vscode.CompletionItemKind.Keyword, detail: 'Variable declaration', documentation: 'Declare a mutable variable' },
            { label: 'const', kind: vscode.CompletionItemKind.Keyword, detail: 'Constant declaration', documentation: 'Declare an immutable constant' },
            
            // Control flow
            { label: 'if', kind: vscode.CompletionItemKind.Keyword, detail: 'If statement', documentation: 'Conditional statement' },
            { label: 'else', kind: vscode.CompletionItemKind.Keyword, detail: 'Else clause', documentation: 'Alternative branch for if statement' },
            { label: 'while', kind: vscode.CompletionItemKind.Keyword, detail: 'While loop', documentation: 'Loop while condition is true' },
            { label: 'for', kind: vscode.CompletionItemKind.Keyword, detail: 'For loop', documentation: 'Iterate over a collection' },
            { label: 'in', kind: vscode.CompletionItemKind.Keyword, detail: 'In keyword', documentation: 'Used in for loops' },
            { label: 'switch', kind: vscode.CompletionItemKind.Keyword, detail: 'Switch statement', documentation: 'Multi-way branch statement' },
            { label: 'case', kind: vscode.CompletionItemKind.Keyword, detail: 'Case clause', documentation: 'Match a case in switch' },
            { label: 'default', kind: vscode.CompletionItemKind.Keyword, detail: 'Default case', documentation: 'Default case in switch' },
            { label: 'return', kind: vscode.CompletionItemKind.Keyword, detail: 'Return statement', documentation: 'Return from function' },
            { label: 'break', kind: vscode.CompletionItemKind.Keyword, detail: 'Break statement', documentation: 'Exit loop early' },
            { label: 'continue', kind: vscode.CompletionItemKind.Keyword, detail: 'Continue statement', documentation: 'Skip to next iteration' },
            
            // Logical operators
            { label: 'and', kind: vscode.CompletionItemKind.Operator, detail: 'Logical AND', documentation: 'Boolean AND operator' },
            { label: 'or', kind: vscode.CompletionItemKind.Operator, detail: 'Logical OR', documentation: 'Boolean OR operator' },
            { label: 'not', kind: vscode.CompletionItemKind.Operator, detail: 'Logical NOT', documentation: 'Boolean NOT operator' },
            
            // Other keywords
            { label: 'import', kind: vscode.CompletionItemKind.Module, detail: 'Import statement', documentation: 'Import a module' },
            { label: 'use', kind: vscode.CompletionItemKind.Module, detail: 'Use statement', documentation: 'Use symbols from module' },
            { label: 'rust', kind: vscode.CompletionItemKind.Module, detail: 'Rust block', documentation: 'Embed Rust code' },
            { label: 'type', kind: vscode.CompletionItemKind.Keyword, detail: 'Type alias', documentation: 'Define a type alias' },
            { label: 'test', kind: vscode.CompletionItemKind.Function, detail: 'Test function', documentation: 'Define a test function' },
            { label: 'constructor', kind: vscode.CompletionItemKind.Constructor, detail: 'Class constructor', documentation: 'Define class constructor' },
            { label: 'this', kind: vscode.CompletionItemKind.Keyword, detail: 'This reference', documentation: 'Reference to current instance' },
        ];

        return keywords.map(k => {
            const item = new vscode.CompletionItem(k.label, k.kind);
            item.detail = k.detail;
            item.documentation = new vscode.MarkdownString(k.documentation);
            return item;
        });
    }

    /**
     * Get concurrency-related completions
     */
    private getConcurrencyCompletions(linePrefix: string): vscode.CompletionItem[] {
        const items: vscode.CompletionItem[] = [];

        // Async/Par keywords
        const asyncItem = new vscode.CompletionItem('async', vscode.CompletionItemKind.Keyword);
        asyncItem.detail = 'Async execution';
        asyncItem.documentation = new vscode.MarkdownString('Execute function asynchronously\n\nExample: `let result = async fetchData()`');
        asyncItem.insertText = new vscode.SnippetString('async ${1:functionCall}(${2:args})');
        items.push(asyncItem);

        const parItem = new vscode.CompletionItem('par', vscode.CompletionItemKind.Keyword);
        parItem.detail = 'Parallel execution';
        parItem.documentation = new vscode.MarkdownString('Execute function in parallel\n\nExample: `let result = par compute(data)`');
        parItem.insertText = new vscode.SnippetString('par ${1:functionCall}(${2:args})');
        items.push(parItem);

        // Task keyword
        const taskItem = new vscode.CompletionItem('task', vscode.CompletionItemKind.Keyword);
        taskItem.detail = 'Task handle';
        taskItem.documentation = new vscode.MarkdownString('Create a task handle for later awaiting\n\nExample: `let handle = task async fetchData()`');
        taskItem.insertText = new vscode.SnippetString('task ${1|async,par|} ${2:functionCall}(${3:args})');
        items.push(taskItem);

        // Fire keyword
        const fireItem = new vscode.CompletionItem('fire', vscode.CompletionItemKind.Keyword);
        fireItem.detail = 'Fire and forget';
        fireItem.documentation = new vscode.MarkdownString('Execute without waiting for result\n\nExample: `fire async logEvent("message")`');
        fireItem.insertText = new vscode.SnippetString('fire ${1|async,par|} ${2:functionCall}(${3:args})');
        items.push(fireItem);

        // Await keyword
        const awaitItem = new vscode.CompletionItem('await', vscode.CompletionItemKind.Keyword);
        awaitItem.detail = 'Await task result';
        awaitItem.documentation = new vscode.MarkdownString('Wait for task to complete\n\nExample: `let result = await taskHandle`');
        awaitItem.insertText = new vscode.SnippetString('await ${1:taskHandle}');
        items.push(awaitItem);

        // Parallel execution policies
        const policies = [
            { label: 'seq', detail: 'Sequential execution', doc: 'Execute loop sequentially (default)' },
            { label: 'par', detail: 'Parallel execution', doc: 'Execute loop iterations in parallel' },
            { label: 'vec', detail: 'Vectorized execution', doc: 'Execute with SIMD vectorization' },
            { label: 'parvec', detail: 'Parallel + Vectorized', doc: 'Combine parallel and vectorized execution' },
            { label: 'with', detail: 'Policy options', doc: 'Specify execution policy options' },
            { label: 'chunk', detail: 'Chunk size', doc: 'Set chunk size for parallel execution' },
            { label: 'threads', detail: 'Thread count', doc: 'Set number of threads' },
            { label: 'simdWidth', detail: 'SIMD width', doc: 'Set SIMD vector width' },
            { label: 'ordered', detail: 'Ordered execution', doc: 'Maintain iteration order' },
        ];

        policies.forEach(p => {
            const item = new vscode.CompletionItem(p.label, vscode.CompletionItemKind.Keyword);
            item.detail = p.detail;
            item.documentation = new vscode.MarkdownString(p.doc);
            items.push(item);
        });

        return items;
    }

    /**
     * Get control flow completions
     */
    private getControlFlowCompletions(linePrefix: string): vscode.CompletionItem[] {
        const items: vscode.CompletionItem[] = [];

        // If statement
        if (linePrefix.endsWith('if') || linePrefix.includes('else ')) {
            const ifItem = new vscode.CompletionItem('if', vscode.CompletionItemKind.Snippet);
            ifItem.detail = 'If statement';
            ifItem.insertText = new vscode.SnippetString('if ${1:condition} {\n    ${2:// code}\n}');
            items.push(ifItem);
        }

        // For loops
        if (linePrefix.trim().startsWith('for') || linePrefix.endsWith('for ')) {
            const forSeqItem = new vscode.CompletionItem('for seq', vscode.CompletionItemKind.Snippet);
            forSeqItem.detail = 'Sequential for loop';
            forSeqItem.insertText = new vscode.SnippetString('for seq ${1:item} in ${2:collection} {\n    ${3:// code}\n}');
            items.push(forSeqItem);

            const forParItem = new vscode.CompletionItem('for par', vscode.CompletionItemKind.Snippet);
            forParItem.detail = 'Parallel for loop';
            forParItem.insertText = new vscode.SnippetString('for par ${1:item} in ${2:collection} with chunk ${3:2} threads ${4:4} {\n    ${5:// code}\n}');
            items.push(forParItem);

            const forParvecItem = new vscode.CompletionItem('for parvec', vscode.CompletionItemKind.Snippet);
            forParvecItem.detail = 'Parallel vectorized for loop';
            forParvecItem.insertText = new vscode.SnippetString('for parvec ${1:item} in ${2:collection} with simdWidth ${3:4} {\n    ${4:// code}\n}');
            items.push(forParvecItem);
        }

        return items;
    }

    /**
     * Get type completions
     */
    private getTypeCompletions(linePrefix: string): vscode.CompletionItem[] {
        const types = [
            // Primitive types
            { label: 'number', detail: 'Number type', doc: 'Generic number type' },
            { label: 'float', detail: 'Float type', doc: 'Floating-point number' },
            { label: 'bool', detail: 'Boolean type', doc: 'Boolean value (true/false)' },
            { label: 'char', detail: 'Character type', doc: 'Single character' },
            { label: 'string', detail: 'String type', doc: 'Text string' },
            
            // Integer types
            { label: 'i8', detail: '8-bit signed integer', doc: 'Signed 8-bit integer (-128 to 127)' },
            { label: 'i16', detail: '16-bit signed integer', doc: 'Signed 16-bit integer' },
            { label: 'i32', detail: '32-bit signed integer', doc: 'Signed 32-bit integer' },
            { label: 'i64', detail: '64-bit signed integer', doc: 'Signed 64-bit integer' },
            { label: 'i128', detail: '128-bit signed integer', doc: 'Signed 128-bit integer' },
            { label: 'isize', detail: 'Pointer-sized signed integer', doc: 'Platform-dependent signed integer' },
            
            { label: 'u8', detail: '8-bit unsigned integer', doc: 'Unsigned 8-bit integer (0 to 255)' },
            { label: 'u16', detail: '16-bit unsigned integer', doc: 'Unsigned 16-bit integer' },
            { label: 'u32', detail: '32-bit unsigned integer', doc: 'Unsigned 32-bit integer' },
            { label: 'u64', detail: '64-bit unsigned integer', doc: 'Unsigned 64-bit integer' },
            { label: 'u128', detail: '128-bit unsigned integer', doc: 'Unsigned 128-bit integer' },
            { label: 'usize', detail: 'Pointer-sized unsigned integer', doc: 'Platform-dependent unsigned integer' },
            
            // Float types
            { label: 'f32', detail: '32-bit float', doc: 'Single-precision floating-point' },
            { label: 'f64', detail: '64-bit float', doc: 'Double-precision floating-point' },
        ];

        return types.map(t => {
            const item = new vscode.CompletionItem(t.label, vscode.CompletionItemKind.TypeParameter);
            item.detail = t.detail;
            item.documentation = new vscode.MarkdownString(t.doc);
            return item;
        });
    }

    /**
     * Get error handling completions
     */
    private getErrorHandlingCompletions(linePrefix: string): vscode.CompletionItem[] {
        const items: vscode.CompletionItem[] = [];

        // Fail keyword
        const failItem = new vscode.CompletionItem('fail', vscode.CompletionItemKind.Keyword);
        failItem.detail = 'Fail statement';
        failItem.documentation = new vscode.MarkdownString('Raise an error\n\nExample: `fail "error message"`');
        failItem.insertText = new vscode.SnippetString('fail "${1:message}"');
        items.push(failItem);

        // Error binding pattern
        if (linePrefix.includes('let ')) {
            const errorBindingItem = new vscode.CompletionItem('Error binding', vscode.CompletionItemKind.Snippet);
            errorBindingItem.detail = 'Fallible let binding';
            errorBindingItem.documentation = new vscode.MarkdownString('Bind result and error from fallible expression\n\nExample: `let result, err = divide(10, 0)`');
            errorBindingItem.insertText = new vscode.SnippetString('${1:result}, ${2:err} = ${3:expression}');
            items.push(errorBindingItem);

            const asyncErrorItem = new vscode.CompletionItem('Async error binding', vscode.CompletionItemKind.Snippet);
            asyncErrorItem.detail = 'Error binding with async';
            asyncErrorItem.documentation = new vscode.MarkdownString('Bind result and error from async call\n\nExample: `let result, err = async fetchData()`');
            asyncErrorItem.insertText = new vscode.SnippetString('${1:result}, ${2:err} = async ${3:functionCall}(${4:args})');
            items.push(asyncErrorItem);

            const parErrorItem = new vscode.CompletionItem('Par error binding', vscode.CompletionItemKind.Snippet);
            parErrorItem.detail = 'Error binding with par';
            parErrorItem.documentation = new vscode.MarkdownString('Bind result and error from parallel call\n\nExample: `let result, err = par compute(data)`');
            parErrorItem.insertText = new vscode.SnippetString('${1:result}, ${2:err} = par ${3:functionCall}(${4:args})');
            items.push(parErrorItem);
        }

        // Try/catch
        const tryItem = new vscode.CompletionItem('try', vscode.CompletionItemKind.Keyword);
        tryItem.detail = 'Try block';
        tryItem.documentation = new vscode.MarkdownString('Try-catch error handling');
        tryItem.insertText = new vscode.SnippetString('try {\n    ${1:// code}\n} catch ${2:err} {\n    ${3:// handle error}\n}');
        items.push(tryItem);

        const catchItem = new vscode.CompletionItem('catch', vscode.CompletionItemKind.Keyword);
        catchItem.detail = 'Catch block';
        catchItem.documentation = new vscode.MarkdownString('Catch errors from try block');
        items.push(catchItem);

        // Result types
        const okItem = new vscode.CompletionItem('Ok', vscode.CompletionItemKind.EnumMember);
        okItem.detail = 'Success result';
        okItem.documentation = new vscode.MarkdownString('Wrap successful result');
        okItem.insertText = new vscode.SnippetString('Ok(${1:value})');
        items.push(okItem);

        const errItem = new vscode.CompletionItem('Err', vscode.CompletionItemKind.EnumMember);
        errItem.detail = 'Error result';
        errItem.documentation = new vscode.MarkdownString('Wrap error result');
        errItem.insertText = new vscode.SnippetString('Err(${1:error})');
        items.push(errItem);

        return items;
    }

    /**
     * Get built-in functions
     */
    private getBuiltInFunctions(linePrefix: string): vscode.CompletionItem[] {
        const functions = [
            { 
                label: 'print', 
                detail: 'print(value)', 
                doc: 'Print value to console',
                snippet: 'print(${1:value})'
            },
            { 
                label: 'println', 
                detail: 'println(value)', 
                doc: 'Print value with newline',
                snippet: 'println(${1:value})'
            },
            { 
                label: 'length', 
                detail: 'length(collection)', 
                doc: 'Get length of collection',
                snippet: 'length(${1:collection})'
            },
            { 
                label: 'push', 
                detail: 'push(array, item)', 
                doc: 'Add item to array',
                snippet: 'push(${1:array}, ${2:item})'
            },
            { 
                label: 'pop', 
                detail: 'pop(array)', 
                doc: 'Remove and return last item',
                snippet: 'pop(${1:array})'
            },
        ];

        return functions.map(f => {
            const item = new vscode.CompletionItem(f.label, vscode.CompletionItemKind.Function);
            item.detail = f.detail;
            item.documentation = new vscode.MarkdownString(f.doc);
            item.insertText = new vscode.SnippetString(f.snippet);
            return item;
        });
    }
}
