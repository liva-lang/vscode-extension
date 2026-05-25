import * as vscode from 'vscode';

/**
 * Inlay Hints for Liva.
 *
 * Two hint kinds, both regex-driven (no AST, no LSP roundtrip):
 *
 * 1. **Parameter name hints** at call sites for known stdlib calls and
 *    user-defined functions found in the same document.
 *
 *    Example:
 *
 *        push(arr, 42)   ───►   push(arr: arr, value: 42)
 *
 * 2. **Type hints** after `let name = <literal>` when the literal type
 *    is unambiguous (string, int, float, bool, array literal, map literal).
 *
 *    Example:
 *
 *        let count = 0           ───►   let count: int = 0
 *        let name = "Liva"       ───►   let name: string = "Liva"
 *        let items = []          ───►   let items: array = []
 *
 * These are *display only* — they never modify the source. Toggle them
 * with `editor.inlayHints.enabled` in VS Code settings.
 */
export class LivaInlayHintsProvider implements vscode.InlayHintsProvider {
    private _onDidChange = new vscode.EventEmitter<void>();
    public readonly onDidChangeInlayHints = this._onDidChange.event;

    public refresh(): void {
        this._onDidChange.fire();
    }

    public provideInlayHints(
        document: vscode.TextDocument,
        range: vscode.Range,
        _token: vscode.CancellationToken,
    ): vscode.InlayHint[] {
        const hints: vscode.InlayHint[] = [];

        // ── Pass 1: build a map of fn name -> [param names]
        // Pattern: fn name(p1: T, p2: T, ...) or name(p1, p2) =>
        const fnSigs = new Map<string, string[]>();
        const fnSigRe = /^\s*(?:pub\s+)?fn\s+([A-Za-z_]\w*)\s*\(([^)]*)\)/gm;
        const arrowFnRe = /^\s*(?:pub\s+)?([A-Za-z_]\w*)\s*\(([^)]*)\)\s*=>/gm;
        const text = document.getText();

        for (const m of [...text.matchAll(fnSigRe), ...text.matchAll(arrowFnRe)]) {
            const name = m[1];
            const params = m[2]
                .split(',')
                .map(p => p.trim())
                .filter(Boolean)
                .map(p => {
                    // strip default value and type annotation
                    const noDefault = p.split('=')[0].trim();
                    const noType = noDefault.split(':')[0].trim();
                    return noType;
                });
            if (params.length > 0 && !fnSigs.has(name)) {
                fnSigs.set(name, params);
            }
        }

        // ── Pass 2: scan visible range for call sites & let-bindings
        const startLine = range.start.line;
        const endLine = Math.min(range.end.line, document.lineCount - 1);

        const letRe = /^\s*let\s+([A-Za-z_]\w*)\s*=\s*(.+?)(?:\s*\/\/.*)?$/;
        const callRe = /\b([A-Za-z_]\w*)\s*\(([^)]*)\)/g;

        for (let i = startLine; i <= endLine; i++) {
            const line = document.lineAt(i);
            const t = line.text;

            // Skip comment-only lines
            if (/^\s*(\/\/|\/\*|\*)/.test(t)) continue;

            // ── Type hints on `let name = <literal>`
            const letMatch = letRe.exec(t);
            if (letMatch && !/:\s*\w/.test(t.slice(0, letMatch.index + letMatch[0].indexOf('='))) ) {
                const name = letMatch[1];
                const rhs = letMatch[2].trim();
                const ty = inferType(rhs);
                if (ty) {
                    const nameEnd = t.indexOf(name) + name.length;
                    const pos = new vscode.Position(i, nameEnd);
                    const hint = new vscode.InlayHint(pos, `: ${ty}`, vscode.InlayHintKind.Type);
                    hint.paddingLeft = false;
                    hint.paddingRight = true;
                    hints.push(hint);
                }
            }

            // ── Parameter name hints at call sites
            callRe.lastIndex = 0;
            let cm: RegExpExecArray | null;
            while ((cm = callRe.exec(t)) !== null) {
                const fnName = cm[1];
                const argsRaw = cm[2];

                // Skip keywords/control structures masquerading as calls
                if (KEYWORDS.has(fnName)) continue;

                const params = fnSigs.get(fnName) ?? STDLIB_SIGS[fnName];
                if (!params) continue;

                const args = splitArgs(argsRaw);
                if (args.length === 0) continue;

                // Where args start within the line
                const parenOpen = cm.index + fnName.length + (cm[0].indexOf('(') - fnName.length);
                let cursor = parenOpen + 1;

                for (let a = 0; a < args.length && a < params.length; a++) {
                    const argText = args[a];
                    const argTrimmed = argText.trimStart();
                    const leading = argText.length - argTrimmed.length;
                    const argStart = cursor + leading;

                    // Don't add a hint if the user already wrote `name:` or `name =`
                    if (/^\w+\s*[:=]/.test(argTrimmed)) {
                        cursor += argText.length + 1; // +1 for the comma
                        continue;
                    }
                    // Don't add a hint if the arg matches the param name (redundant)
                    const argIdent = argTrimmed.match(/^[A-Za-z_]\w*\b/);
                    if (argIdent && argIdent[0] === params[a]) {
                        cursor += argText.length + 1;
                        continue;
                    }

                    const pos = new vscode.Position(i, argStart);
                    const hint = new vscode.InlayHint(pos, `${params[a]}:`, vscode.InlayHintKind.Parameter);
                    hint.paddingLeft = false;
                    hint.paddingRight = true;
                    hints.push(hint);

                    cursor += argText.length + 1;
                }
            }
        }

        return hints;
    }
}

const KEYWORDS = new Set([
    'if', 'else', 'while', 'for', 'switch', 'case', 'return', 'fail',
    'fn', 'class', 'enum', 'interface', 'struct', 'let', 'var',
    'import', 'from', 'as', 'pub', 'async', 'await', 'parallel',
    'defer', 'or', 'and', 'not', 'in', 'true', 'false', 'null', 'self',
    'new', 'print', 'println',
]);

/**
 * Known stdlib function signatures (parameter names only).
 * Kept small on purpose — covers the most-called helpers.
 */
const STDLIB_SIGS: Record<string, string[]> = {
    push: ['arr', 'value'],
    pop: ['arr'],
    len: ['value'],
    map: ['arr', 'fn'],
    filter: ['arr', 'predicate'],
    reduce: ['arr', 'fn', 'initial'],
    sort: ['arr'],
    reverse: ['arr'],
    join: ['arr', 'sep'],
    split: ['str', 'sep'],
    contains: ['haystack', 'needle'],
    indexOf: ['arr', 'item'],
    slice: ['arr', 'start', 'end'],
    range: ['start', 'end'],
    Log_info: ['message'],
    Log_warn: ['message'],
    Log_error: ['message'],
    Log_debug: ['message'],
};

/**
 * Returns an inferred Liva type for a right-hand-side literal,
 * or null if the type is ambiguous (function call, expression, etc.).
 */
function inferType(rhs: string): string | null {
    if (/^"([^"\\]|\\.)*"$/.test(rhs)) return 'string';
    if (/^-?\d+$/.test(rhs)) return 'int';
    if (/^-?\d+\.\d+$/.test(rhs)) return 'float';
    if (rhs === 'true' || rhs === 'false') return 'bool';
    if (/^\[.*\]$/.test(rhs)) return 'array';
    if (/^\{.*\}$/.test(rhs)) return 'map';
    return null;
}

/**
 * Splits a comma-separated argument list, respecting balanced
 * parentheses, brackets, braces, and string literals.
 */
function splitArgs(input: string): string[] {
    const out: string[] = [];
    let depth = 0;
    let inStr: string | null = null;
    let buf = '';

    for (let i = 0; i < input.length; i++) {
        const c = input[i];
        const prev = i > 0 ? input[i - 1] : '';

        if (inStr) {
            buf += c;
            if (c === inStr && prev !== '\\') inStr = null;
            continue;
        }
        if (c === '"' || c === "'" || c === '`') {
            inStr = c;
            buf += c;
            continue;
        }
        if (c === '(' || c === '[' || c === '{') depth++;
        else if (c === ')' || c === ']' || c === '}') depth--;

        if (c === ',' && depth === 0) {
            out.push(buf);
            buf = '';
            continue;
        }
        buf += c;
    }
    if (buf.trim().length > 0) out.push(buf);
    return out;
}
