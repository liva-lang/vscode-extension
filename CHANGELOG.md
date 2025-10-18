# Changelog

## [0.0.7] - 2025-10-18

### 🎨 Phase 1: Enhanced Syntax & Snippets - COMPLETE ✅

Major improvements to developer experience with enhanced syntax highlighting, comprehensive snippets, and better language configuration.

### Added

#### Phase 1.1: Enhanced Syntax Highlighting
- **String template interpolation**: Full support for `$"text {expression}"` syntax
  - Proper highlighting of embedded expressions within templates
  - Escape sequence support
- **Categorized keywords**: Better organization by purpose
  - Control flow: `if`, `else`, `while`, `for`, `switch`, `return`, `break`, `continue`
  - Concurrency: `async`, `await`, `par`, `task`, `fire`
  - Parallel policies: `parvec`, `with`, `ordered`, `chunk`, `threads`, `simdWidth`
  - Declarations: `let`, `const`, `constructor`, `this`
  - Error handling: `fail`, `throw`, `try`, `catch`, `Err`, `Ok`
- **Enhanced numeric literals**:
  - Hexadecimal: `0xFF`, `0x1A2B3C`
  - Binary: `0b1010`, `0b11110000`
  - Scientific notation: `1.5e10`, `2.5e-3`
- **Function highlighting**:
  - Function definitions with proper name highlighting
  - Function call recognition
- **Operator improvements**:
  - Arrow function: `=>`
  - Type annotation: `->`
  - Range: `..`
  - Assignment variants: `+=`, `-=`, `*=`, `/=`, `%=`
- **Null/None literals**: `null`, `None`

#### Phase 1.2: Comprehensive Snippets (56 total)
- **Function snippets**:
  - `fn`: One-liner function with arrow
  - `fnb`: Block function
  - `fnt`: Function with return type
  - `fn1`: Typed one-liner function
- **Control flow snippets**:
  - `if`, `ife`, `ifelif`: If statements
  - `while`: While loop
  - `for`, `forr`: For loops
  - `forseq`, `forpar`, `forparp`: For loop policies
  - `forvec`, `forparvec`: Vectorized loops
  - `switch`: Switch statement
  - `tern`: Ternary expression
- **Concurrency snippets** (NEW):
  - `async`, `par`: Async/parallel calls
  - `taska`, `taskp`: Task handles
  - `await`: Await task
  - `firea`, `firep`: Fire and forget
  - `asyncm`: Multi-async pattern
  - `parpat`: Parallel computation pattern
- **Error handling snippets**:
  - `letf`: Fallible binding
  - `leta`, `letp`: Error binding with async/par
  - `iferr`, `iferrp`: Error checking
  - `iff`: If fail
  - `tf`: Ternary fail
  - `fail`: Fail statement
- **Classes & objects**:
  - `class`, `classt`: Class declarations
  - `main`: Main function
  - `obj`, `arr`, `arrobj`: Literals
- **Utilities**:
  - `st`: String template
  - `pr`, `prs`: Print statements
  - `cb`, `todo`, `fixme`: Comments

#### Phase 1.3: Enhanced Language Configuration
- **Better auto-closing pairs**:
  - Context-aware closing (notIn: string, comment)
  - Auto-close before specific characters
- **Code folding support**:
  - Region markers: `// #region` / `// #endregion`
- **Improved indentation rules**:
  - Better handling of nested structures
  - Smart bracket/paren/brace indentation
- **OnEnter rules**:
  - Multi-line comment continuation (`/** */`)
  - Control flow statement indentation
  - Special handling for async/par/task/fire

### Changed
- Updated syntax highlighting to use semantic categories instead of flat keyword list
- Improved word pattern for better identifier recognition
- Enhanced bracket matching for all pair types

### Testing
- Added comprehensive test file: `test_syntax_highlighting.liva`
  - Tests all 15 major syntax categories
  - ~330 lines covering every language feature
  - Validates string templates, concurrency, error binding, etc.

### Migration Notes
- No breaking changes
- All existing code remains compatible
- New features are opt-in via snippets

---

## [0.0.6] - 2025-10-17

### Changed
- **Updated concurrency keywords**: Changed `boost` to `parvec` for parallel vectorization
  - The keyword `parvec` is more descriptive and clearly indicates parallel + vectorization
  - Updated syntax highlighting to recognize `parvec` instead of `boost`
  - Better semantic meaning: par (parallel) + vec (vectorization) = parvec

### Added
- **Enhanced loop snippets**:
  - `forseq`: Sequential for loop
  - `forpar`: Parallel for loop
  - `forvec`: Vectorized for loop
  - `forparvec`: Parallel vectorized for loop with SIMD options
  - `forwith`: For loop with policy options (dropdown selection)
- **Documentation improvements**:
  - Added section explaining data-parallel loop policies in README
  - Updated example.liva with comprehensive demonstrations of all loop policies
  - Examples now show `seq`, `par`, `vec`, and `parvec` usage

### Fixed
- Updated syntax highlighting to recognize the new `parvec` keyword

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
