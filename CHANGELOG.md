# Changelog

## [0.0.5] - 2024-10-16

### Added
- **Rich error diagnostics**: Integration with livac compiler's JSON output format
- **Real-time error detection**: Beautiful error messages with code, title, and helpful suggestions
- **Enhanced error parsing**: Support for both JSON and legacy text formats
- **Improved error display**: Error messages now show:
  - Error code (e.g., E0701)
  - Clear title describing the issue
  - Detailed message explaining the problem
  - Helpful suggestions with emoji (💡)

### Changed
- Updated compiler invocations to use `--json` flag for structured error output
- Enhanced `parseCompilerErrors()` function to parse JSON format
- Improved error message extraction from compiler output (checks both stderr and stdout)
- Better error reporting in VS Code's Problems panel

### Technical Details
- Added `LivaErrorJson` interface for type-safe JSON parsing
- Implemented `createDiagnosticFromJson()` for converting JSON errors to VS Code diagnostics
- Maintains backward compatibility with text-based error format

## [0.0.4] - Previous version
- Basic compiler integration
- Syntax highlighting
- Auto-build on save

## Installation

### From VSIX file:
```bash
code --install-extension liva-vscode-0.0.5.vsix
```

### Manual installation:
1. Copy `liva-vscode-0.0.5.vsix` to your extensions folder
2. Open VS Code
3. Go to Extensions view (Ctrl+Shift+X)
4. Click "..." menu → "Install from VSIX"
5. Select the `liva-vscode-0.0.5.vsix` file

## Requirements

- Liva compiler (`livac`) v0.6 or higher with JSON output support
- Compiler must be in PATH or configured in settings

## Usage

The extension now provides rich error diagnostics automatically:

1. **Auto-build on save**: Errors appear in Problems panel as you type
2. **Compile command**: `Ctrl+Shift+P` → "Liva: Compile File"
3. **Check syntax**: `Ctrl+Shift+P` → "Liva: Check Syntax"

### Example Error Display

When you have a fallible function call without error binding:

```liva
let result = validateUser("", "password")  // Missing error binding
```

You'll see in the Problems panel:
```
E0701: Fallible function must be called with error binding

Function 'validateUser' can fail but is not being called with error binding.
The function contains 'fail' statements and must be handled properly.

💡 Change to: let result, err = validateUser(...)
```

## Configuration

```json
{
  "liva.compiler.path": "livac",
  "liva.compiler.outputDirectory": "./target/liva_build",
  "liva.autoBuild": true
}
```
