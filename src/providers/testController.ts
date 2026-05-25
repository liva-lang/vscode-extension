import * as vscode from 'vscode';
import * as path from 'path';
import * as cp from 'child_process';

/**
 * VS Code TestController integration for Liva.
 *
 * Discovers tests in `.liva` files by regex-scanning for:
 *
 *   - `describe("name", () => {`            (Jest-style suite)
 *   - `test("name", () => {`                (Jest-style test inside suite)
 *   - `fn test_xxx()` / `test_xxx()`        (legacy `livac test` runner)
 *
 * Runs tests by invoking `livac test <file>` and parses stdout to map
 * pass/fail back to TestItems. Output is also streamed to the
 * "Test Results" pane.
 *
 * Discovery is incremental: files are scanned on open + on save, and
 * the test tree is updated in place. Workspace-wide discovery happens
 * lazily when the user clicks "Refresh Tests" or runs all tests.
 */
export class LivaTestController {
    private controller: vscode.TestController;
    private fileItems = new Map<string, vscode.TestItem>();
    private compilerPath: string;

    constructor(context: vscode.ExtensionContext, compilerPath: string) {
        this.compilerPath = compilerPath;

        this.controller = vscode.tests.createTestController(
            'liva-tests',
            'Liva Tests',
        );
        context.subscriptions.push(this.controller);

        // Manual & lazy discovery
        this.controller.resolveHandler = async (item) => {
            if (!item) {
                await this.discoverAllInWorkspace();
            } else if (item.uri) {
                await this.discoverInFile(item.uri);
            }
        };

        // Run / debug profiles
        this.controller.createRunProfile(
            'Run',
            vscode.TestRunProfileKind.Run,
            (req, tok) => this.runHandler(req, tok, false),
            true,
        );

        this.controller.createRunProfile(
            'Run with Coverage',
            vscode.TestRunProfileKind.Coverage,
            (req, tok) => this.runHandler(req, tok, true),
            false,
        );

        // File watchers — keep the tree fresh
        const watcher = vscode.workspace.createFileSystemWatcher('**/*.liva');
        context.subscriptions.push(watcher);
        watcher.onDidCreate(uri => this.discoverInFile(uri));
        watcher.onDidChange(uri => this.discoverInFile(uri));
        watcher.onDidDelete(uri => this.removeFile(uri));

        // Active-editor seed
        vscode.workspace.onDidOpenTextDocument(doc => {
            if (doc.languageId === 'liva') this.discoverInFile(doc.uri);
        });
        for (const doc of vscode.workspace.textDocuments) {
            if (doc.languageId === 'liva') this.discoverInFile(doc.uri);
        }
    }

    private async discoverAllInWorkspace(): Promise<void> {
        const files = await vscode.workspace.findFiles('**/*.liva', '**/target/**');
        await Promise.all(files.map(uri => this.discoverInFile(uri)));
    }

    private async discoverInFile(uri: vscode.Uri): Promise<void> {
        let text: string;
        try {
            const doc = await vscode.workspace.openTextDocument(uri);
            text = doc.getText();
        } catch {
            return;
        }

        const tests = parseTests(text);
        if (tests.length === 0) {
            this.removeFile(uri);
            return;
        }

        const fileId = uri.toString();
        let fileItem = this.fileItems.get(fileId);
        if (!fileItem) {
            fileItem = this.controller.createTestItem(
                fileId,
                path.basename(uri.fsPath),
                uri,
            );
            this.controller.items.add(fileItem);
            this.fileItems.set(fileId, fileItem);
        }

        // Rebuild children — simpler than diffing
        fileItem.children.replace([]);

        // Group by suite name (describe) — legacy test_ functions live at file root
        const suites = new Map<string, vscode.TestItem>();

        for (const t of tests) {
            const range = new vscode.Range(t.line, 0, t.line, 0);

            if (t.kind === 'describe') {
                const item = this.controller.createTestItem(
                    `${fileId}::${t.name}`,
                    t.name,
                    uri,
                );
                item.range = range;
                suites.set(t.name, item);
                fileItem.children.add(item);
            } else if (t.kind === 'test' && t.parent) {
                const parent = suites.get(t.parent) ?? fileItem;
                const item = this.controller.createTestItem(
                    `${fileId}::${t.parent}::${t.name}`,
                    t.name,
                    uri,
                );
                item.range = range;
                parent.children.add(item);
            } else {
                // Legacy test_xxx fn — lives at file root
                const item = this.controller.createTestItem(
                    `${fileId}::${t.name}`,
                    t.name,
                    uri,
                );
                item.range = range;
                fileItem.children.add(item);
            }
        }
    }

    private removeFile(uri: vscode.Uri): void {
        const id = uri.toString();
        const existing = this.fileItems.get(id);
        if (existing) {
            this.controller.items.delete(id);
            this.fileItems.delete(id);
        }
    }

    private async runHandler(
        request: vscode.TestRunRequest,
        token: vscode.CancellationToken,
        coverage: boolean,
    ): Promise<void> {
        const run = this.controller.createTestRun(request);
        const queue: vscode.TestItem[] = [];

        // If the user picked specific items, queue those; otherwise all
        // top-level (file) items.
        if (request.include) {
            request.include.forEach(t => queue.push(t));
        } else {
            this.controller.items.forEach(t => queue.push(t));
        }

        // Bucket items by file URI so we run `livac test <file>` once per file
        const byFile = new Map<string, vscode.TestItem[]>();
        const visit = (item: vscode.TestItem) => {
            if (request.exclude?.includes(item)) return;
            if (item.uri) {
                const key = item.uri.toString();
                const bucket = byFile.get(key) ?? [];
                bucket.push(item);
                byFile.set(key, bucket);
            }
            item.children.forEach(visit);
        };
        for (const item of queue) visit(item);

        for (const [uriStr, items] of byFile) {
            if (token.isCancellationRequested) break;
            const uri = vscode.Uri.parse(uriStr);

            items.forEach(i => run.started(i));

            try {
                const { code, output } = await this.execLivac(uri.fsPath, coverage, token);
                run.appendOutput(output.replace(/\r?\n/g, '\r\n') + '\r\n', undefined, items[0]);

                // Very permissive pass/fail parsing — exit-code based
                // with per-test grep for "✓ name" / "✗ name" markers.
                const passSet = new Set<string>();
                const failSet = new Set<string>();
                for (const line of output.split(/\r?\n/)) {
                    const pm = line.match(/[✓✔]\s+(.+)/);
                    if (pm) passSet.add(pm[1].trim());
                    const fm = line.match(/[✗✘×]\s+(.+)/);
                    if (fm) failSet.add(fm[1].trim());
                }

                const markRecursive = (it: vscode.TestItem) => {
                    const label = it.label;
                    if (failSet.has(label)) {
                        run.failed(it, new vscode.TestMessage('Test failed (see Test Results pane).'));
                    } else if (passSet.has(label)) {
                        run.passed(it);
                    } else if (it.children.size > 0) {
                        // Suite: aggregate from children
                        it.children.forEach(markRecursive);
                    } else if (code === 0) {
                        run.passed(it);
                    } else {
                        run.failed(it, new vscode.TestMessage(`livac test exited with code ${code}`));
                    }
                };
                for (const it of items) markRecursive(it);
            } catch (err) {
                const msg = err instanceof Error ? err.message : String(err);
                for (const it of items) {
                    run.errored(it, new vscode.TestMessage(`Failed to run livac: ${msg}`));
                }
            }
        }

        run.end();
    }

    private execLivac(
        file: string,
        coverage: boolean,
        token: vscode.CancellationToken,
    ): Promise<{ code: number; output: string }> {
        return new Promise((resolve) => {
            const args = ['test', file];
            if (coverage) args.push('--coverage');

            const child = cp.spawn(this.compilerPath, args, {
                cwd: path.dirname(file),
                shell: false,
            });

            let output = '';
            child.stdout?.on('data', d => (output += d.toString()));
            child.stderr?.on('data', d => (output += d.toString()));

            const killSub = token.onCancellationRequested(() => child.kill());
            child.on('close', code => {
                killSub.dispose();
                resolve({ code: code ?? 1, output });
            });
            child.on('error', err => {
                killSub.dispose();
                resolve({ code: 1, output: output + '\n' + err.message });
            });
        });
    }
}

interface ParsedTest {
    kind: 'describe' | 'test' | 'legacy';
    name: string;
    parent?: string; // describe name, for `test` items
    line: number;
}

/**
 * Extracts tests from Liva source. Tracks brace depth to associate
 * `test(...)` calls with their enclosing `describe(...)`.
 */
function parseTests(src: string): ParsedTest[] {
    const out: ParsedTest[] = [];
    const lines = src.split(/\r?\n/);

    // Stack of describe blocks with their starting brace depth
    const stack: { name: string; depth: number }[] = [];
    let depth = 0;

    const describeRe = /^\s*describe\s*\(\s*["'`]([^"'`]+)["'`]\s*,/;
    const testRe = /^\s*test\s*\(\s*["'`]([^"'`]+)["'`]\s*,/;
    const legacyRe = /^\s*(?:fn\s+)?(test_[A-Za-z0-9_]*)\s*\(/;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        const dm = describeRe.exec(line);
        if (dm) {
            out.push({ kind: 'describe', name: dm[1], line: i });
            stack.push({ name: dm[1], depth: depth });
        }

        const tm = testRe.exec(line);
        if (tm) {
            const parent = stack.length > 0 ? stack[stack.length - 1].name : undefined;
            out.push({ kind: 'test', name: tm[1], parent, line: i });
        }

        const lm = legacyRe.exec(line);
        if (lm && !describeRe.test(line) && !testRe.test(line)) {
            out.push({ kind: 'legacy', name: lm[1], line: i });
        }

        // Update brace depth (string-aware-lite — good enough)
        let inStr: string | null = null;
        for (let j = 0; j < line.length; j++) {
            const c = line[j];
            if (inStr) {
                if (c === inStr && line[j - 1] !== '\\') inStr = null;
                continue;
            }
            if (c === '"' || c === "'" || c === '`') { inStr = c; continue; }
            if (c === '/' && line[j + 1] === '/') break;
            if (c === '{') depth++;
            else if (c === '}') {
                depth--;
                // Pop suites whose body closed
                while (stack.length > 0 && stack[stack.length - 1].depth >= depth) {
                    stack.pop();
                }
            }
        }
    }

    return out;
}
