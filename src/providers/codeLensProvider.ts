import * as vscode from 'vscode';

/**
 * CodeLens provider for Liva files.
 *
 * Detects three patterns and surfaces inline actions:
 *
 *   • `main()` / `main() {` / `fn main(` / `main() =>`
 *     → ▶ Run  ▶ Build  ▶ Check
 *
 *   • Jest-style suites: `describe("name", () => {`
 *     → ▶ Run Tests  (runs `livac test` on this file)
 *
 *   • Test functions: `test_xxx()` / `test("name", () => {`
 *     → ▶ Run Tests
 *
 *   • Benchmark functions: `bench_xxx()` / `fn bench_xxx(`
 *     → ⏱ Run Benchmarks  (runs `livac bench` on this file)
 *
 *   • Doc-comment block on top-level decls: `/// summary`
 *     → 📄 Generate Docs (runs `livac doc`)
 *
 * Parsing is regex-based — cheap, no AST. Anything misidentified
 * just shows an extra lens, which is harmless.
 */
export class LivaCodeLensProvider implements vscode.CodeLensProvider {
    private _onDidChange = new vscode.EventEmitter<void>();
    public readonly onDidChangeCodeLenses = this._onDidChange.event;

    public refresh(): void {
        this._onDidChange.fire();
    }

    public provideCodeLenses(
        document: vscode.TextDocument,
        _token: vscode.CancellationToken,
    ): vscode.CodeLens[] {
        const lenses: vscode.CodeLens[] = [];
        const fileArg = document.uri;

        const mainRe = /^\s*(?:fn\s+)?main\s*\([^)]*\)\s*(?:=>|\{|$)/;
        const describeRe = /^\s*describe\s*\(\s*["'`]/;
        const jtestRe = /^\s*test\s*\(\s*["'`]/;
        const legacyTestFnRe = /^\s*(?:fn\s+)?test_[A-Za-z0-9_]*\s*\(/;
        const benchRe = /^\s*(?:fn\s+)?bench_[A-Za-z0-9_]*\s*\(/;
        const docRe = /^\s*\/\/\/\s/;

        // First, scan the file for "kinds" we found, so we don't emit
        // a Run Tests lens for every test_ in a 200-line file.
        const tests: number[] = [];
        const benches: number[] = [];
        let firstMainLine = -1;
        let firstDocLine = -1;

        for (let i = 0; i < document.lineCount; i++) {
            const text = document.lineAt(i).text;
            if (mainRe.test(text) && firstMainLine === -1) {
                firstMainLine = i;
            }
            if (describeRe.test(text) || jtestRe.test(text) || legacyTestFnRe.test(text)) {
                tests.push(i);
            }
            if (benchRe.test(text)) {
                benches.push(i);
            }
            if (docRe.test(text) && firstDocLine === -1) {
                firstDocLine = i;
            }
        }

        if (firstMainLine !== -1) {
            const range = new vscode.Range(firstMainLine, 0, firstMainLine, 0);
            lenses.push(new vscode.CodeLens(range, {
                title: '▶ Run',
                command: 'liva.run',
                arguments: [fileArg],
            }));
            lenses.push(new vscode.CodeLens(range, {
                title: '⚙ Build',
                command: 'liva.compile',
                arguments: [fileArg],
            }));
            lenses.push(new vscode.CodeLens(range, {
                title: '✓ Check',
                command: 'liva.check',
            }));
        }

        // Show one "Run Tests" lens per describe/test it finds, so it's
        // available wherever the cursor lives.
        for (const line of tests) {
            const range = new vscode.Range(line, 0, line, 0);
            lenses.push(new vscode.CodeLens(range, {
                title: '▶ Run Tests',
                command: 'liva.test',
            }));
            lenses.push(new vscode.CodeLens(range, {
                title: '⊕ With Coverage',
                command: 'liva.testCoverage',
            }));
        }

        for (const line of benches) {
            const range = new vscode.Range(line, 0, line, 0);
            lenses.push(new vscode.CodeLens(range, {
                title: '⏱ Run Benchmarks',
                command: 'liva.bench',
            }));
        }

        if (firstDocLine !== -1) {
            const range = new vscode.Range(firstDocLine, 0, firstDocLine, 0);
            lenses.push(new vscode.CodeLens(range, {
                title: '📄 Generate Docs',
                command: 'liva.doc',
            }));
        }

        return lenses;
    }
}
