# Liva Language Support

Liva programming language support for Visual Studio Code and Cursor.

## Features

### ✅ Implemented

- **Syntax highlighting** complete for `.liva` files
- **Snippets** for common language constructs
- **Compiler configuration** with customizable options
- **Integrated compilation and execution** commands
- **Automatic compilation** on save (optional)
- **Comment support** (line and block)
- **Auto-closing** of parentheses and automatic indentation

### 🚧 In development

- **Real-time compiler error diagnostics**
- **Automatic Liva code formatting**
- **Intelligent autocompletion** based on context

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

