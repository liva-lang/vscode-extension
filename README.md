# Liva Language Support

**Version 0.1.0** - Complete IDE experience for Liva in Visual Studio Code and Cursor.

## 🎉 What's New in 0.1.0

### Phase 2: IntelliSense & Code Intelligence - COMPLETE ✅

**Full IntelliSense support!** Professional-grade code intelligence features:

- **🔮 Intelligent Code Completion** (Ctrl+Space)
  - 100+ completion items for keywords, types, functions
  - Context-aware suggestions
  - Snippet support for complex patterns
  - Concurrency keywords with examples

- **📖 Hover Information**
  - Keyword descriptions with usage examples
  - Type information with value ranges
  - Function signatures and documentation
  - Concurrency model explanations

- **✍️ Signature Help** (Ctrl+Shift+Space)
  - Real-time parameter hints while typing
  - 30+ built-in function signatures
  - Active parameter highlighting
  - Parameter descriptions

- **🎯 Code Navigation**
  - Go to Definition (F12)
  - Peek Definition (Alt+F12)
  - Find All References (Shift+F12)
  - Go to Symbol in File (Ctrl+Shift+O)

- **📑 Document Outline**
  - Hierarchical code structure
  - Outline view in Explorer
  - Breadcrumbs navigation
  - Functions, classes, constants

### Phase 1: Enhanced Syntax & Snippets (v0.0.7)

- **🎨 Enhanced Syntax Highlighting**: Full Liva v0.6 support
- **📝 56 Comprehensive Snippets**: Speed up your coding
- **⚙️ Enhanced Language Configuration**: Smart auto-closing and indentation

## Features

### ✅ Fully Implemented

**IntelliSense & Code Intelligence (Phase 2):**
- ✅ **Code completion** with intelligent suggestions
- ✅ **Hover information** for symbols and keywords
- ✅ **Signature help** with parameter hints
- ✅ **Go to definition** and peek definition
- ✅ **Find all references** across file
- ✅ **Document symbols** and outline view

**Syntax & Language Support (Phase 1):**
- ✅ **Advanced syntax highlighting** with v0.6 features
- ✅ **56 snippets** for all language constructs
- ✅ **String template support** with interpolation
- ✅ **Code folding** with region markers
- ✅ **Smart auto-closing** and indentation

**Compiler Integration:**
- ✅ **Integrated compilation** and execution
- ✅ **Automatic compilation** on save
- ✅ **Real-time error diagnostics**
- ✅ **Error tooltips** with suggestions
- ✅ **Problems panel integration**

### 🚧 Coming Soon (Phase 3+)

- **Code actions** - Quick fixes and refactoring
- **Debugging support** - Breakpoints and step-through
- **Test integration** - Run and debug tests
- **Code formatting** - Automatic formatting

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

#### Classes and Interfaces

Liva supports object-oriented programming with classes and interfaces:

**Classes:**
```liva
Person {
    constructor(name: string, age: int) {
        this.name = name
        this.age = age
    }
    
    name: string
    age: int
    
    greet() => $"Hello, I'm {this.name}"
}
```

**Interfaces:**
```liva
// Interface: only method signatures (no fields, no constructor)
Drawable {
    draw(): void
    getBounds(): string
}

// Class implementing interface
Circle : Drawable {
    radius: float
    
    constructor(radius: float) {
        this.radius = radius
    }
    
    draw() => println("Drawing circle")
    getBounds() => $"Circle(r={this.radius})"
}

// Multiple interfaces
Shape : Drawable, Comparable {
    // Must implement all interface methods
}
```

**Key points:**
- Interface = only method signatures (no implementation, no fields)
- Class = has fields and method implementations
- Use `:` to implement one or more interfaces (comma-separated)
- Maps cleanly to Rust traits

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

