# VS Code Extension Integration Guide

## Overview

The Liva VS Code extension (v0.0.5) now integrates seamlessly with the Liva compiler's beautiful error reporting system. This provides real-time diagnostics with rich, helpful error messages directly in your editor.

## How It Works

### 1. Compiler JSON Output

The compiler now supports a `--json` flag that outputs structured error information:

```bash
livac main.liva --json
```

Output example:
```json
{
  "location": {
    "file": "main.liva",
    "line": 319,
    "column": null,
    "source_line": "  let userResult3 = validateUser(\"\", \"pass123\")"
  },
  "code": "E0701",
  "title": "Fallible function must be called with error binding",
  "message": "Function 'validateUser' can fail but is not being called with error binding.\n       The function contains 'fail' statements and must be handled properly.",
  "help": "Change to: let result, err = validateUser(...)"
}
```

### 2. Extension Integration

The VS Code extension:
1. Invokes the compiler with `--json` flag
2. Parses the JSON error output
3. Creates VS Code diagnostics with:
   - **Precise location**: Exact line and range of the error
   - **Error code**: `E0701`, `E0702`, etc.
   - **Rich message**: Multi-line explanation with helpful suggestions
   - **Source**: Tagged as "Liva Compiler"

### 3. User Experience

When you save a Liva file with errors:

```liva
validateUser(username: string, password: string): User {
  if username.length < 3 {
    fail "Username too short"
  }
  if password.length < 8 {
    fail "Password too weak"
  }
  return { username, password }
}

main() {
  // ERROR: Missing error binding
  let user = validateUser("", "pass123")
  print(user)
}
```

You'll see in VS Code:
- ❌ Red squiggly line under the error
- 🔴 Error in Problems panel (Ctrl+Shift+M)
- Hover tooltip with full error message

![Error Example](https://via.placeholder.com/600x200?text=Error+Display+Example)

**Problems Panel Display:**
```
E0701: Fallible function must be called with error binding

Function 'validateUser' can fail but is not being called with error binding.
The function contains 'fail' statements and must be handled properly.

💡 Change to: let result, err = validateUser(...)

main.liva:13
```

## Error Codes

Current supported error codes:

| Code | Description |
|------|-------------|
| E0701 | Fallible function called without error binding |

More error codes will be added as the compiler's semantic analysis expands.

## Architecture

### Extension Flow

```
User saves file
    ↓
Extension triggers compile (--json flag)
    ↓
Compiler outputs JSON error
    ↓
Extension parses JSON
    ↓
createDiagnosticFromJson()
    ↓
VS Code displays diagnostic
```

### Key Functions

**`parseCompilerErrors(errorMessage, filePath)`**
- Tries JSON parsing first
- Falls back to text parsing for compatibility
- Returns array of VS Code diagnostics

**`createDiagnosticFromJson(errorJson, filePath)`**
- Converts JSON structure to `vscode.Diagnostic`
- Calculates line ranges from file content
- Formats message with code, title, message, and help text

**`compileLivaFile(filePath, silent?)`**
- Invokes compiler with `--json` flag
- Handles both stdout and stderr
- Updates diagnostic collection

## Configuration

The extension respects these settings:

```json
{
  // Path to livac compiler (must support --json flag)
  "liva.compiler.path": "livac",
  
  // Output directory for compiled code
  "liva.compiler.outputDirectory": "./target/liva_build",
  
  // Enable auto-build on save
  "liva.autoBuild": true
}
```

## Development

### Testing Locally

1. **Build the compiler:**
   ```bash
   cd livac
   cargo build
   ```

2. **Package the extension:**
   ```bash
   cd vscode-extension
   npm run compile
   npx vsce package
   ```

3. **Install in VS Code:**
   ```bash
   code --install-extension liva-vscode-0.0.5.vsix
   ```

4. **Test with example file:**
   Create a file with a fallible function error and watch the diagnostics appear!

### Adding New Error Types

To add support for new error types (e.g., E0702, E0703):

1. **In compiler (Rust):**
   - Define error in `src/error.rs` with `SemanticErrorInfo`
   - Ensure `code`, `title`, `message`, and `help` fields are set
   - Use JSON serialization

2. **In extension (TypeScript):**
   - No changes needed! The `LivaErrorJson` interface handles all codes
   - Optionally add code actions for specific error codes

## Future Enhancements

- [ ] **Code Actions**: Quick fixes for common errors (e.g., "Add error binding")
- [ ] **Inline hints**: Show inferred types and error flows
- [ ] **Error lens**: Show errors inline at end of line
- [ ] **Diagnostic related information**: Link to function definition
- [ ] **Multi-file errors**: Show errors across imported modules

## Troubleshooting

### Extension not showing errors

1. Check compiler version: `livac --help` (should show `--json` flag)
2. Verify extension is active: Check "Liva Language Support" in Extensions panel
3. Enable verbose output: Set `"liva.verbose": true` in settings
4. Check Output panel: View → Output → "Liva Extension"

### JSON parsing errors

- Ensure livac was built with serde support
- Check that `--json` flag is recognized
- Verify error output format matches `LivaErrorJson` interface

### Diagnostic not appearing in Problems panel

- Ensure file is saved (auto-build triggers on save)
- Check that `autoBuild` is enabled in settings
- Manually run "Liva: Check Syntax" command

## Related Files

- **Extension**: `vscode-extension/src/extension.ts`
- **Compiler errors**: `livac/src/error.rs`
- **CLI integration**: `livac/src/main.rs`
- **Semantic analysis**: `livac/src/semantic.rs`

## Contributing

When adding new diagnostics:
1. Add error detection in semantic analyzer
2. Create `SemanticErrorInfo` with JSON serialization
3. Test with `--json` flag
4. Extension will automatically display the new error type!

---

**Note**: This integration is part of the feature branch `feature/contextual-fallibility-system` and will be merged to main once thoroughly tested.
