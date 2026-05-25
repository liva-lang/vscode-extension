# Liva Language Support

**Version 0.15.0** — Complete IDE experience for Liva v2.3 in Visual Studio Code and Cursor.

## Features

### IDE Support
- **Syntax Highlighting** — Full TextMate grammar including `::`, `=>`, `defer`, `rust {}`, enums
- **300 Snippets** — All language constructs, stdlib, HTTP, DB, Config, Regex, Date, CSV, etc.
- **LSP Integration** — Real-time diagnostics, completion, hover, go-to-definition, references
- **Quick Fixes** — "Did you mean?" auto-corrections for typos
- **Interface Validation** — Real-time checking of interface implementations
- **Fallible Validation** — Detects unhandled fallible function calls

### Commands
| Command | Description |
|---------|-------------|
| `Liva: Compile File` | Compile current `.liva` file (`livac build`) |
| `Liva: Run Program` | Compile and run (`livac run`) |
| `Liva: Check Syntax` | Check for errors without compiling (`livac check`) |
| `Liva: Format File` | Format with `livac fmt` |
| `Liva: Lint File` | Lint with `livac lint` (W001-W004) |
| `Liva: Run Tests` | Run test files (`livac test`) |
| `Liva: Run Tests with Coverage` | Run tests with coverage report (`livac test --coverage`) |
| `Liva: Run Benchmarks` | Run benchmarks (`livac bench`) |
| `Liva: Generate Documentation` | Build API docs (`livac doc`) |
| `Liva: Start REPL` | Launch the interactive REPL (`livac repl`) |
| `Liva: Restart Language Server` | Restart the LSP server |
| `Liva: Update Compiler` | Update `livac` to latest version |

### Compiler Features Supported

**Core Language:**
Variables, constants, functions (`=>` one-liners), classes, interfaces, enum types (recursive + auto-boxing), destructuring, generics, type aliases, union types, tuples, `defer`

**Error Handling:**
`fail`, error binding (`let val, err = fn()`), `or fail`, `or <value>`, error trace chaining

**Collections:**
Arrays (31 methods), Map<K,V>, Set<T>, string (28 methods)

**Concurrency:**
`async`/`await`, `par` parallel, `task` handles, auto fire-and-forget

**Control Flow:**
`if`/`else`, `while`, `for` (range, array, map, enumerate), `switch` (statement + expression), `break`/`continue`, `=>` one-liners

**Stdlib:**
| Module | Functions |
|--------|-----------|
| File/Dir | read, write, copy, move, readLines, list, exists, create, delete |
| Date | now, new, parse, timestamp, format, add, diff |
| Regex | test, match, findAll, replace, split |
| CSV | read, write, parse, stringify, readTable, writeTable |
| Random | nextInt, nextFloat, choice, shuffle, uuid |
| Crypto | sha256, md5, base64Encode, base64Decode |
| Process | exec, spawn, pid, exit |
| Log | info, warn, error, debug (variadic + table rendering) |
| Config | load, get, getInt, getBool, getAll |
| HTTP | get, post, put, delete + response.json() |
| Server | create, get/post/put/delete routes, listen (axum) |
| Response | text, json, status |
| DB | open, exec, query, close (SQLite) |

**Syntax Sugar:**
`or fail`, `=>` one-liners, point-free refs (`items.forEach(print)`), `::` method refs, `+=`/`-=`/`*=`/`/=`/`%=`, `for i, item in array`

**Tooling:**
`livac build`, `run`, `check`, `fmt`, `test`, `lint`, `lsp`, `init`, `update`

**Interop:**
`rust { }` inline blocks, `use rust "crate" version "x.y"` with features

## Quick Start

```liva
import { readLines } from "./utils"

main() {
    let lines, err = File.readLines("data.txt")
    if err => fail $"Cannot read: {err.message}"

    let count = lines.filter(l => l.trim().length > 0).length
    print($"Non-empty lines: {count}")
}
```

## Installation

### From VSIX (local)

```bash
cd vscode-extension
npm install && npm run compile
npx vsce package
code --install-extension liva-vscode-0.15.0.vsix
```

### Compiler

```bash
# Install livac
curl -fsSL https://raw.githubusercontent.com/liva-lang/livac/main/scripts/install.sh | bash

# Or update existing
livac update
```

## Configuration

```json
{
    "liva.compiler.path": "livac",
    "liva.compiler.outputDirectory": "./target/liva_build",
    "liva.compiler.autoBuild": true,
    "liva.liveValidation": true,
    "liva.lsp.enabled": true
}
```

## Development

```bash
npm install          # Install dependencies
npm run compile      # Build
npm run watch        # Watch mode
npx vsce package     # Package VSIX
```

## License

MIT — see [LICENSE](LICENSE).

---

**Enjoy programming in Liva! 🚀**

