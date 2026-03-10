import * as vscode from 'vscode';

/**
 * Hover provider for Liva language
 * Provides hover information for symbols, keywords, and more
 */
export class LivaHoverProvider implements vscode.HoverProvider {
    
    /**
     * Provide hover information for the given position
     */
    provideHover(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.Hover> {
        
        const range = document.getWordRangeAtPosition(position);
        if (!range) {
            return null;
        }

        const word = document.getText(range);
        const line = document.lineAt(position.line).text;

        // Check for different symbol types
        const keywordInfo = this.getKeywordInfo(word);
        if (keywordInfo) {
            return new vscode.Hover(keywordInfo, range);
        }

        const typeInfo = this.getTypeInfo(word);
        if (typeInfo) {
            return new vscode.Hover(typeInfo, range);
        }

        const builtInInfo = this.getBuiltInFunctionInfo(word);
        if (builtInInfo) {
            return new vscode.Hover(builtInInfo, range);
        }

        const concurrencyInfo = this.getConcurrencyInfo(word, line);
        if (concurrencyInfo) {
            return new vscode.Hover(concurrencyInfo, range);
        }

        return null;
    }

    /**
     * Get hover information for keywords
     */
    private getKeywordInfo(word: string): vscode.MarkdownString | null {
        const keywords: Record<string, { title: string; description: string; example?: string }> = {
            'let': {
                title: 'Variable Declaration',
                description: 'Declares a mutable variable that can be reassigned.',
                example: 'let name = "Alice"\nlet age = 25\nage = 26  // Can reassign'
            },
            'const': {
                title: 'Constant Declaration',
                description: 'Declares an immutable constant that cannot be reassigned.',
                example: 'const MAX_USERS = 100\nconst PI = 3.14159'
            },
            'if': {
                title: 'If Statement',
                description: 'Conditional branching. Executes code block if condition is true.',
                example: 'if age >= 18 {\n    print("Adult")\n} else {\n    print("Minor")\n}'
            },
            'for': {
                title: 'For Loop',
                description: 'Iterates over a collection or range.',
                example: 'for item in items {\n    print(item)\n}\n\nfor i in 0..10 {\n    print(i)\n}'
            },
            'while': {
                title: 'While Loop',
                description: 'Repeats code block while condition is true.',
                example: 'let i = 0\nwhile i < 10 {\n    print(i)\n    i = i + 1\n}'
            },
            'return': {
                title: 'Return Statement',
                description: 'Returns a value from a function and exits early.',
                example: 'calculateSum(a, b) {\n    return a + b\n}'
            },
            'break': {
                title: 'Break Statement',
                description: 'Exits the current loop immediately.',
                example: 'for i in 0..100 {\n    if i == 10 break\n    print(i)\n}'
            },
            'continue': {
                title: 'Continue Statement',
                description: 'Skips rest of current iteration and continues with next.',
                example: 'for i in 0..10 {\n    if i % 2 == 0 continue\n    print(i)  // Only odd numbers\n}'
            },
            'switch': {
                title: 'Switch Statement',
                description: 'Multi-way branch based on value matching.',
                example: 'switch status {\n    case "active": print("Active")\n    case "inactive": print("Inactive")\n    default: print("Unknown")\n}'
            },
            'and': {
                title: 'Logical AND Operator',
                description: 'Returns true if both operands are true.',
                example: 'if age >= 18 and hasLicense {\n    print("Can drive")\n}'
            },
            'or': {
                title: 'Logical OR Operator',
                description: 'Returns true if at least one operand is true.',
                example: 'if age < 18 or not hasPermission {\n    print("Access denied")\n}'
            },
            'not': {
                title: 'Logical NOT Operator',
                description: 'Negates a boolean value.',
                example: 'if not isValid {\n    print("Invalid input")\n}'
            },
            'import': {
                title: 'Import Statement',
                description: 'Imports a module or library.',
                example: 'import "std/collections"\nimport "mymodule"'
            },
            'constructor': {
                title: 'Class Constructor',
                description: 'Defines how to initialize a class instance.',
                example: 'Person {\n    constructor(name: string, age: int) {\n        this.name = name\n        this.age = age\n    }\n    name: string\n    age: int\n}'
            },
            'this': {
                title: 'This Reference',
                description: 'References the current instance in a class method.',
                example: 'greet() {\n    print($"Hello, I\'m {this.name}")\n}'
            },
        };

        const info = keywords[word];
        if (!info) {
            return null;
        }

        const md = new vscode.MarkdownString();
        md.appendMarkdown(`### ${info.title}\n\n`);
        md.appendMarkdown(`${info.description}\n\n`);
        if (info.example) {
            md.appendMarkdown(`**Example:**\n\`\`\`liva\n${info.example}\n\`\`\`\n`);
        }
        md.isTrusted = true;

        return md;
    }

    /**
     * Get hover information for types
     */
    private getTypeInfo(word: string): vscode.MarkdownString | null {
        const types: Record<string, { title: string; description: string; range?: string }> = {
            'number': { title: 'Generic Number Type', description: 'A generic numeric type for integers and floats' },
            'float': { title: 'Floating-Point Number', description: 'Double-precision floating-point number' },
            'bool': { title: 'Boolean Type', description: 'True or false value' },
            'char': { title: 'Character Type', description: 'Single Unicode character' },
            'string': { title: 'String Type', description: 'UTF-8 encoded text string' },
            
            'i8': { title: '8-bit Signed Integer', description: 'Signed 8-bit integer', range: '-128 to 127' },
            'i16': { title: '16-bit Signed Integer', description: 'Signed 16-bit integer', range: '-32,768 to 32,767' },
            'i32': { title: '32-bit Signed Integer', description: 'Signed 32-bit integer', range: '-2,147,483,648 to 2,147,483,647' },
            'i64': { title: '64-bit Signed Integer', description: 'Signed 64-bit integer', range: '-9,223,372,036,854,775,808 to 9,223,372,036,854,775,807' },
            'i128': { title: '128-bit Signed Integer', description: 'Signed 128-bit integer' },
            'isize': { title: 'Pointer-Sized Signed Integer', description: 'Platform-dependent signed integer (32 or 64 bits)' },
            
            'u8': { title: '8-bit Unsigned Integer', description: 'Unsigned 8-bit integer', range: '0 to 255' },
            'u16': { title: '16-bit Unsigned Integer', description: 'Unsigned 16-bit integer', range: '0 to 65,535' },
            'u32': { title: '32-bit Unsigned Integer', description: 'Unsigned 32-bit integer', range: '0 to 4,294,967,295' },
            'u64': { title: '64-bit Unsigned Integer', description: 'Unsigned 64-bit integer' },
            'u128': { title: '128-bit Unsigned Integer', description: 'Unsigned 128-bit integer' },
            'usize': { title: 'Pointer-Sized Unsigned Integer', description: 'Platform-dependent unsigned integer (32 or 64 bits)' },
            
            'f32': { title: '32-bit Float', description: 'Single-precision floating-point number (IEEE 754)' },
            'f64': { title: '64-bit Float', description: 'Double-precision floating-point number (IEEE 754)' },
            'Map': { title: 'Map<K, V> Collection', description: 'Key-value dictionary (hashmap) with O(1) lookup. Created with `Map { key: value }` syntax. Supports methods: get, set, has, delete, keys, values, entries, clear, forEach. Iteration with `for key, value in map`.' },
            'Set': { title: 'Set<T> Collection', description: 'Unique value collection (hashset) with O(1) lookup. Created with `Set { value1, value2 }` syntax. Supports methods: add, has, delete, values, clear, forEach, union, intersection, difference. Iteration with `for value in set`.' },
        };

        const info = types[word];
        if (!info) {
            return null;
        }

        const md = new vscode.MarkdownString();
        md.appendMarkdown(`### ${info.title}\n\n`);
        md.appendMarkdown(`${info.description}\n\n`);
        if (info.range) {
            md.appendMarkdown(`**Range:** ${info.range}\n`);
        }
        md.isTrusted = true;

        return md;
    }

    /**
     * Get hover information for built-in functions
     */
    private getBuiltInFunctionInfo(word: string): vscode.MarkdownString | null {
        const functions: Record<string, { signature: string; description: string; returns?: string; example?: string }> = {
            'print': {
                signature: 'print(value: any)',
                description: 'Prints a value to the console without a newline.',
                returns: 'void',
                example: 'print("Hello")\nprint(42)\nprint($"Name: {name}")'
            },
            'println': {
                signature: 'println(value: any)',
                description: 'Prints a value to the console with a newline.',
                returns: 'void',
                example: 'println("Hello, world!")\nprintln($"User: {username}")'
            },
            'console.log': {
                signature: 'console.log(...values: any[])',
                description: 'Prints debug information to stdout. Values are displayed with proper spacing.',
                returns: 'void',
                example: 'console.log("Debug:", value)\nconsole.log("User:", name, "Age:", age)'
            },
            'console.success': {
                signature: 'console.success(...values: any[])',
                description: 'Prints success message in **green color** to stdout. Perfect for confirmations.',
                returns: 'void',
                example: 'console.success("✓ User created!")\nconsole.success("Task completed:", taskName)'
            },
            'console.warn': {
                signature: 'console.warn(...values: any[])',
                description: 'Prints warning message in **yellow/amber color** to stderr.',
                returns: 'void',
                example: 'console.warn("Memory usage high:", usage, "%")\nconsole.warn("Deprecated function used")'
            },
            'console.error': {
                signature: 'console.error(...values: any[])',
                description: 'Prints error message in **red color** to stderr.',
                returns: 'void',
                example: 'console.error("Error:", errorMsg)\nconsole.error("Failed to connect:", url)'
            },
            'console.input': {
                signature: 'console.input(prompt?: string): string',
                description: 'Reads a line of text from stdin. Optional prompt message (like Python\'s input()).',
                returns: 'string',
                example: 'let name = console.input("Your name: ")\nlet age = console.input()  // No prompt'
            },
            'parseInt': {
                signature: 'parseInt(str: string): (number, string)',
                description: 'Parses a string to an integer. Returns (value, error) tuple.',
                returns: '(number, string)',
                example: 'let num, err = parseInt("42")\nif err == "" {\n    print(num)\n}'
            },
            'parseFloat': {
                signature: 'parseFloat(str: string): (number, string)',
                description: 'Parses a string to a float. Returns (value, error) tuple.',
                returns: '(number, string)',
                example: 'let num, err = parseFloat("3.14")\nif err == "" {\n    print(num)\n}'
            },
            'toString': {
                signature: 'toString(value: any): string',
                description: 'Converts any value to its string representation.',
                returns: 'string',
                example: 'let str = toString(42)  // "42"\nlet str2 = toString(true)  // "true"'
            },
            'length': {
                signature: 'length(collection: array | string): number',
                description: 'Returns the length of a collection or string.',
                returns: 'number',
                example: 'let items = [1, 2, 3]\nlet len = length(items)  // 3\nlet strLen = length("hello")  // 5'
            },
            'push': {
                signature: 'push(array: array, item: any): void',
                description: 'Adds an item to the end of an array.',
                returns: 'void',
                example: 'let items = [1, 2, 3]\npush(items, 4)\n// items is now [1, 2, 3, 4]'
            },
            'pop': {
                signature: 'pop(array: array): any',
                description: 'Removes and returns the last item from an array.',
                returns: 'any',
                example: 'let items = [1, 2, 3]\nlet last = pop(items)  // 3\n// items is now [1, 2]'
            },
        };

        const info = functions[word];
        if (!info) {
            return null;
        }

        const md = new vscode.MarkdownString();
        md.appendMarkdown(`\`\`\`liva\n${info.signature}\n\`\`\`\n\n`);
        md.appendMarkdown(`${info.description}\n\n`);
        if (info.returns) {
            md.appendMarkdown(`**Returns:** \`${info.returns}\`\n\n`);
        }
        if (info.example) {
            md.appendMarkdown(`**Example:**\n\`\`\`liva\n${info.example}\n\`\`\`\n`);
        }
        md.isTrusted = true;

        return md;
    }

    /**
     * Get hover information for concurrency keywords
     */
    private getConcurrencyInfo(word: string, line: string): vscode.MarkdownString | null {
        const concurrency: Record<string, { title: string; description: string; example?: string }> = {
            'async': {
                title: 'Async Execution',
                description: 'Executes a function asynchronously without blocking. The result is lazily awaited when first used.',
                example: 'let user = async fetchUser(1)\n// Execution starts, result awaited when used\nprint(user)  // Awaits here\n\n// With error binding:\nlet data, err = async loadData()\nif err != "" {\n    print($"Error: {err}")\n}'
            },
            'par': {
                title: 'Parallel Execution',
                description: 'Executes a function in parallel using multiple cores. Result is lazily joined when first used.',
                example: 'let result = par compute(data)\n// Computation runs in parallel\nprint(result)  // Joins here\n\n// With error binding:\nlet value, err = par heavyComputation(100)'
            },
            'task': {
                title: 'Task Handle',
                description: 'Creates a task handle for deferred execution. Allows spawning multiple tasks and awaiting them later.',
                example: 'let task1 = task async fetchUser(1)\nlet task2 = task par compute(100)\n\n// Do other work...\n\n// Await results when needed\nlet user = await task1\nlet result = await task2'
            },
            'await': {
                title: 'Await Task',
                description: 'Waits for a task handle to complete and returns its result.',
                example: 'let task = task async fetchData()\n// Do other work...\nlet data = await task  // Wait for completion'
            },
            'seq': {
                title: 'Sequential Execution Policy',
                description: 'Executes loop iterations sequentially (default behavior).',
                example: 'for seq item in items {\n    process(item)  // One at a time\n}'
            },
            'parvec': {
                title: 'Parallel + Vectorized Execution',
                description: 'Combines parallel execution with SIMD vectorization for maximum performance.',
                example: 'for parvec value in data with simdWidth 4 ordered {\n    compute(value)  // Parallel + SIMD\n}'
            },
            'fail': {
                title: 'Fail Statement',
                description: 'Raises an error in a fallible function. Must be handled with error binding.',
                example: 'divide(a, b) {\n    if b == 0 fail "Division by zero"\n    return a / b\n}\n\nlet result, err = divide(10, 0)\nif err != "" {\n    print($"Error: {err}")\n}'
            },
            'chunk': {
                title: 'Chunk Size Policy',
                description: 'Sets the chunk size for parallel loop execution.',
                example: 'for par item in items with chunk 100 {\n    process(item)\n}'
            },
            'threads': {
                title: 'Thread Count Policy',
                description: 'Sets the number of threads for parallel execution.',
                example: 'for par item in items with threads 8 {\n    process(item)\n}'
            },
            'simdWidth': {
                title: 'SIMD Width Policy',
                description: 'Sets the SIMD vector width for vectorized execution.',
                example: 'for parvec value in data with simdWidth 8 {\n    compute(value)\n}'
            },
            'ordered': {
                title: 'Ordered Execution Policy',
                description: 'Maintains iteration order in parallel execution (may reduce performance).',
                example: 'for par item in items with ordered {\n    print(item)  // Prints in order\n}'
            },
        };

        const info = concurrency[word];
        if (!info) {
            return null;
        }

        const md = new vscode.MarkdownString();
        md.appendMarkdown(`### ${info.title}\n\n`);
        md.appendMarkdown(`${info.description}\n\n`);
        if (info.example) {
            md.appendMarkdown(`**Example:**\n\`\`\`liva\n${info.example}\n\`\`\`\n`);
        }
        md.isTrusted = true;

        return md;
    }
}
