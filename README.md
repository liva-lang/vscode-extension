# Liva Language Support

**Version 0.0.7** - Complete programming language support for Liva in Visual Studio Code and Cursor.

## 🎉 What's New in 0.0.7

### Phase 1: Enhanced Syntax & Snippets - COMPLETE ✅

- **🎨 Enhanced Syntax Highlighting**: Full support for Liva v0.6 features
  - String template interpolation: `$"text {expression}"`
  - Concurrency keywords: `async`, `par`, `task`, `fire`, `await`
  - Enhanced numeric literals: hex (`0xFF`), binary (`0b1010`), scientific notation
  - Better function and operator highlighting

- **📝 56 Comprehensive Snippets**: Speed up your coding
  - Function snippets: `fn`, `fnb`, `fnt`, `fn1`
  - Concurrency patterns: `async`, `par`, `taska`, `taskp`, `await`, `firea`, `firep`
  - Error handling: `letf`, `leta`, `letp`, `iferr`, `iff`, `fail`
  - Full snippet list in [CHANGELOG.md](CHANGELOG.md)

- **⚙️ Enhanced Language Configuration**:
  - Smart auto-closing pairs with context awareness
  - Code folding support with region markers
  - Better indentation for nested structures
  - Multi-line comment continuation

## Features

### ✅ Implemented

- **Syntax highlighting** complete for `.liva` files with v0.6 features
- **56 snippets** for all language constructs (functions, concurrency, error handling, etc.)
- **String template support** with interpolation highlighting
- **Compiler integration** with customizable options
- **Integrated compilation and execution** commands
- **Automatic compilation** on save (optional)
- **Real-time error diagnostics** with precise location highlighting
- **Error tooltips** with detailed information and suggestions
- **Problems panel integration** with all compilation errors
- **Code folding** with region markers
- **Smart auto-closing** and automatic indentation
- **Comment support** (line and block with continuation)

### 🚧 Coming Soon (Phase 2+)

- **IntelliSense** - Intelligent autocompletion and hover information
- **Code actions** - Quick fixes and refactoring
- **Debugging support** - Breakpoints and step-through debugging
- **Test integration** - Run and debug tests directly in VS Code
- **Code formatting** - Automatic Liva code formatting

## Installation

### From VS Code Marketplace (coming soon)

1. Open VS Code
2. Go to Extensions tab (Ctrl+Shift+X)
3. Search for "Liva Language Support"
4. Click "Install"

### From source code

```bash
# Clone the repository
git clone https://github.com/liva-lang/vscode-extension.git
cd vscode-extension

# Install dependencies
npm install

# Compile the extension
npm run compile

# Package the extension (optional)
vsce package

# Install from VSIX (optional)
code --install-extension liva-vscode-0.0.1.vsix
```

## Usage

### Available Commands

- **Liva: Compile File** - Compiles the current file
- **Liva: Run Program** - Compiles and runs the program
- **Liva: Check Syntax** - Verifies syntax without compiling

### Language Features

#### Data-Parallel Loop Policies

Liva supports different execution policies for loops:

- **`seq`** - Sequential execution (default)
- **`par`** - Parallel execution using multiple threads
- **`vec`** - Vectorized execution using SIMD
- **`parvec`** - Combined parallel and vectorized execution

Example:
```liva
// Sequential
for seq x in items {
    print(x)
}

// Parallel
for par x in items with chunk 2 threads 4 {
    process(x)
}

// Vectorized
for vec x in items with simdWidth 4 {
    compute(x)
}

// Parallel + Vectorized
for parvec x in items with simdWidth 4 ordered {
    heavyComputation(x)
}
```

### Keyboard Shortcuts

Commands can be executed from:
- Command palette (Ctrl+Shift+P)
- File explorer context menu (right-click on `.liva` files)
- Editor context menu

### Configuration

You can customize the extension behavior in VS Code settings:

```json
{
    "liva.compiler.path": "livac",
    "liva.compiler.outputDirectory": "./target/liva_build",
    "liva.compiler.autoBuild": true
}
```

### Configuration Options

- `liva.compiler.path`: Path to the Liva compiler executable (default: `livac`)
- `liva.compiler.outputDirectory`: Output directory for compiled binaries
- `liva.compiler.autoBuild`: Automatically compile on file save
- `liva.liveValidation`: Enable real-time validation while typing (default: `true`) 🆕

## 🔴 Error Reporting

The extension integrates with Liva's advanced error reporting system to provide:

### Real-time Error Detection

Errors are detected and displayed as you type (with a 500ms debounce), showing:

- **Red underlines** at the exact location of errors
- **Detailed tooltips** when hovering over errors with:
  - Error code (e.g., E0001)
  - Error title and description
  - Helpful suggestions for fixing the error
- **Problems panel** with a list of all errors for quick navigation

### Example Error Display

When you write invalid code:

```liva
let x = 10
let x = 20  // Error: Variable 'x' already defined
```

You'll see:
- A red squiggly underline under the second `x`
- Tooltip showing: `E0001: Variable 'x' already defined in this scope`
- Suggestion: `💡 Consider using a different name or removing the previous declaration of 'x'`

### Error Categories

- **E1xxx** - Lexer errors (invalid tokens)
- **E2xxx** - Parser errors (syntax problems)
- **E0xxx** - Semantic errors (logic issues)
- **E3xxx** - Code generation errors

For more details, see the [compiler documentation](https://github.com/liva-lang/livac/blob/main/docs/ERROR_CODES.md).

## Requirements

- **Visual Studio Code** 1.80.0 or higher
- **Liva Compiler** (`livac`) installed and in PATH
- **Node.js** and **npm** for development

## Development

### Prerequisites

```bash
npm install -g typescript @vscode/vsce
```

### Build

```bash
npm run compile
```

### Test

```bash
npm run test
```

### Package

```bash
vsce package
```

## License

MIT License - see LICENSE file for details.

## Support

For issues, suggestions or questions:

- Create an issue in the GitHub repository
- Contact the author: [Fran Nadal](https://github.com/liva-lang)

---

**Enjoy programming in Liva! 🚀**

