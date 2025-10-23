# Changelog

## [Unreleased]

## [0.4.0] - 2025-01-XX

### 🎉 Phase 5 Integration: Enhanced Error Messages & Quick Fixes ✅

Full integration of Liva compiler v0.8.1 Phase 5 enhancements into VS Code extension, providing intelligent error diagnostics and interactive quick fixes.

### Added

#### Phase 5.1: "Did You Mean?" Quick Fixes
- **Interactive code actions**: Click on red squigglies to see suggestions
- **One-click fixes**: Automatically replace typos with correct names
- **Smart suggestions**: Levenshtein distance algorithm (max 2 edits)
- **Preferred action**: Marked as default quick fix (⌘+. / Ctrl+.)
- **Pattern matching**: Detects "Did you mean 'xxx'?" in error messages

#### Phase 5.2: Precise Error Highlighting
- **Exact token underlining**: Uses token `length` field for accurate ranges
- **No more approximate +3 characters**: Highlights exactly the problematic token
- **Context support**: Parses `context_before` and `context_after` fields
- **Better visual feedback**: More precise error location in editor

#### Phase 5.3: Error Categories in Diagnostics
- **Categorized errors**: Shows `[Lexical]`, `[Syntax]`, `[Semantic]`, etc.
- **Clear message format**: `[Category] E0xxx: Error title`
- **8 error categories**:
  - Lexical (E0xxx): Invalid tokens
  - Syntax (E1xxx): Grammar violations
  - Semantic (E2xxx): Type errors, undefined symbols
  - Control Flow (E3xxx): Return/break issues
  - Error Handling (E4xxx): Fallible patterns
  - Concurrency (E5xxx): Async/par errors
  - Standard Library (E6xxx): Stdlib issues
  - I/O (E7xxx): File/console errors

#### Phase 5.4: Intelligent Hints & Documentation
- **Contextual hints**: Automatic helpful hints for common errors
- **Code examples**: Shows correct usage patterns in related information
- **Documentation links**: Clickable links to error documentation
  - Appears in diagnostic message with 📚 icon
  - Also available on hover over error
- **Enhanced hover provider**: Shows error details with markdown formatting
  - Error code and description
  - Clickable documentation links
  - Rich markdown content

#### New TypeScript Interfaces
- Extended `LivaErrorJson` interface with Phase 5 fields:
  - `length?: number` - Token length for precise highlighting
  - `context_before?: string[]` - Lines before error
  - `context_after?: string[]` - Lines after error
  - `suggestion?: string` - "Did you mean?" suggestions
  - `hint?: string` - Intelligent hints
  - `example?: string` - Code examples
  - `doc_link?: string` - Documentation URLs
  - `category?: string` - Error category name

#### New Providers
- **`LivaCodeActionProvider`**: Quick fix provider for typo suggestions
- **`LivaErrorHoverProvider`**: Enhanced hover with documentation links

### Changed
- **Enhanced `createDiagnosticFromJson()`**:
  - Uses `length` field instead of hardcoded +3 characters
  - Displays error category in message
  - Adds suggestions, hints, and doc links to message
  - Creates related information for code examples
- **Version bumped**: 0.3.2 → 0.4.0
- **Backward compatible**: Still supports legacy error format

### Technical Implementation
- `LivaCodeActionProvider` class with regex-based suggestion extraction
- `LivaErrorHoverProvider` class with markdown link support
- Pattern matching for multiple suggestion formats
- Registered both providers in extension activation
- All providers properly disposed in subscriptions

### Example Workflow

**1. Typo in function name:**
```liva
console.log(divid(10, 2))  // Typo: 'divid' instead of 'divide'
```

**VS Code shows:**
- Red squiggly under `divid`
- Error: `[Semantic] E2001: Undefined function 'divid'`
- 💡 Suggestion: `Did you mean 'divide'?`
- **Quick Fix available**: ⌘+. shows "Change to 'divide'"
- **One click** → Fixed!

**2. Error with documentation:**
```liva
let x = fallibleFunc()  // Missing error binding
```

**VS Code shows:**
- Red squiggly under function call
- Error: `[Error Handling] E0701: Fallible function must be called with error binding`
- 💡 Hint: `Change to: let result, err = fallibleFunc(...)`
- 📚 **Hover shows clickable link** to error documentation
- **Example in related information**: Shows correct usage pattern

**3. Precise highlighting:**
```liva
let x = 42unknownSuffix  // Invalid suffix
```

**Before (v0.3.2):** Underlines `42u` (first 3 chars)
**Now (v0.4.0):** Underlines exactly `unknownSuffix` (using length field)

### Benefits

- **Faster error fixing**: One-click quick fixes for typos
- **Learn as you code**: See correct patterns immediately
- **Better error understanding**: Categories, hints, examples, docs
- **Precise visual feedback**: Exact token highlighting
- **Professional IDE experience**: Matches TypeScript/Rust tooling quality

### Compatibility

- **Requires**: Liva compiler v0.8.1 or later (with Phase 5 error format)
- **Backward compatible**: Works with older compilers (legacy format)
- **VS Code version**: 1.80.0 or later

## [0.3.2] - 2025-10-22

### Added

#### Real-Time Fallible Function Validation ✅
- **Instant error detection**: Red squiggly lines appear immediately when fallible functions are called without error binding
- **Fast validation**: Works independently of compiler for instant feedback (300ms debounce)
- **Comprehensive detection**: Validates calls in all contexts:
  - String templates: `console.log($"Result: {divide(10, 2)}")`
  - Variable assignments: `let x = divide(10, 2)`
  - Standalone calls: `divide(10, 2)`
- **Smart function analysis**: Automatically detects which functions are fallible (contain `fail` statements)
- **Error binding recognition**: Correctly identifies when error binding is used: `let result, err = divide(10, 2)`
- **Clear error messages**: Shows E0701 error with:
  - Explanation of why it's an error
  - The function name that's problematic
  - Helpful fix suggestion: "Change to: let result, err = functionName(...)"

#### Technical Implementation
- New `FallibleFunctionValidator` provider
- AST-like parsing of Liva code in TypeScript
- Tracks function definitions and their fallibility
- Validates all call sites in real-time
- Separate diagnostic collection for fallible errors

### Changed
- Version bumped to 0.3.2
- Enhanced developer experience with proactive error prevention

### Example

**Before (no validation):**
```liva
divide(a, b) {
    if b == 0.0 {
        fail "Division by zero"
    }
    return a / b
}

main() {
    console.log($"Result: {divide(10.0, 2.0)}")  // Would print "Ok(5.0)" - BAD!
}
```

**Now (with validation):**
```liva
divide(a, b) {
    if b == 0.0 {
        fail "Division by zero"
    }
    return a / b
}

main() {
    console.log($"Result: {divide(10.0, 2.0)}")  // ❌ RED SQUIGGLY LINE
    // Error: E0701 - Function 'divide' can fail but is not being called with error binding
    // 💡 Change to: let result, err = divide(...)
}
```

**Correct usage:**
```liva
main() {
    let result, err = divide(10.0, 2.0)  // ✅ NO ERROR
    if err != null {
        console.error($"Error: {err}")
    } else {
        console.log($"Result: {result}")
    }
}
```

### Benefits
- **Catch errors while typing**: No need to compile to see this type of error
- **Learn correct patterns**: Immediate feedback teaches proper error handling
- **Prevent runtime issues**: Stops Result type leakage before it happens
- **Matches compiler**: Same validation as livac compiler (commit e18cadb)

## [0.3.1] - 2025-10-21

### Added

#### Console API Enhancements
- **console.input()** - Read user input with optional prompt (IntelliSense support)
- **console.success()** - Display success messages in green
- **console.error()** - Display errors in red (updated hover docs)
- **console.warn()** - Display warnings in yellow (updated hover docs)
- **console.log()** - Debug output (updated hover docs)

#### IntelliSense Improvements
- Added autocomplete for all console functions with documentation
- Added hover information for console methods with examples
- Added syntax highlighting for `console` namespace
- Added snippets for common console usage patterns
- Updated built-in function completions with parseInt, parseFloat, toString

#### Syntax Highlighting
- Console namespace now highlighted as special class
- Console methods highlighted as support functions
- Built-in functions (print, parseInt, etc.) now properly highlighted

### Changed
- Extension version bumped to 0.3.1
- Improved documentation for all console functions with color indicators
- Updated completion provider with comprehensive console API

## [0.3.0] - 2025-10-21

### 🎉 Module System Support - Liva v0.8.0 ✅

Full support for Liva's new module system enabling multi-file projects.

### Added

#### Module System Features
- **Multi-file project support**: Import functions and types from other `.liva` files
- **Updated import snippets**: New syntax `import { item } from "./module.liva"`
  - `import` - Single item import
  - `importm` - Multiple items import
  - `importw` - Wildcard import (all items)
- **Smart compilation**: Automatic detection of multi-file projects
- **Build optimization**: Uses `.liva_build/` directory for local builds with caching

#### Compiler Integration Improvements
- **Enhanced --run flag**: Now works seamlessly with multi-file projects
- **Intelligent output directory selection**:
  - `--run` with imports → `.liva_build/` (local cache)
  - `--output <path>` → User-specified location
  - Default → `./target/liva_build`

### Changed
- Updated package description to include module system
- Added "modules" and "imports" to extension keywords
- Improved import statement snippets with v0.8.0 syntax

### Documentation
- Updated README with Module System features
- Added examples of multi-file project organization
- Documented new import syntax and patterns

## [0.2.0] - 2025-10-20

### 🎉 Standard Library Snippets - COMPLETE ✅

Added comprehensive IntelliSense snippets for Liva's Phase 2 Standard Library implementation (37 functions).

### Added

#### Array Method Snippets (9 methods)
- **`map`**: Transform array elements with mapping function
- **`filter`**: Filter array elements with predicate
- **`reduce`**: Reduce array to single value with accumulator
- **`foreach`**: Iterate over array with side effects
- **`find`**: Find first matching element
- **`some`**: Check if any element matches predicate
- **`every`**: Check if all elements match predicate
- **`indexof`**: Find index of value in array
- **`includes`**: Check if array contains value
- **`chain`**: Multi-step array pipeline (filter → map → reduce)

#### String Method Snippets (11 methods)
- **`split`**: Split string into array by delimiter
- **`replace`**: Replace substring with new value
- **`upper`**: Convert to uppercase
- **`lower`**: Convert to lowercase
- **`trim`**: Remove leading/trailing whitespace
- **`trimstart`**: Remove leading whitespace
- **`trimend`**: Remove trailing whitespace
- **`starts`**: Check if string starts with prefix
- **`ends`**: Check if string ends with suffix
- **`substr`**: Extract substring by range
- **`charat`**: Get character at index
- **`sindexof`**: Find index of substring

#### Math Function Snippets (9 functions)
- **`sqrt`**: Square root calculation
- **`pow`**: Power (base^exponent)
- **`abs`**: Absolute value
- **`floor`**: Round down to integer
- **`ceil`**: Round up to integer
- **`round`**: Round to nearest integer
- **`min`**: Minimum of two values
- **`max`**: Maximum of two values
- **`random`**: Random float [0, 1)

#### Type Conversion Snippets (5 patterns)
- **`parseint`**: Parse string to integer with error binding
- **`parsefloat`**: Parse string to float with error binding
- **`tostring`**: Convert value to string
- **`parseintp`**: Parse integer with error checking pattern
- **`parsefloatp`**: Parse float with error checking pattern

#### Console/IO Snippets (9 patterns)
- **`log`**: console.log() - print to stdout
- **`logt`**: console.log() with string template
- **`err`**: console.error() - print to stderr
- **`errt`**: console.error() with string template
- **`warn`**: console.warn() - print warning
- **`warnt`**: console.warn() with string template
- **`readline`**: Read line from stdin
- **`prompt`**: Display prompt and read input
- **`inputpat`**: Interactive input with validation pattern

### Changed
- **Updated version**: 0.1.0 → 0.2.0
- **Updated description**: Added "standard library" to extension description
- **Enhanced keywords**: Added stdlib-related keywords (standard-library, arrays, strings, math, async, parallel)

### Developer Experience Improvements

- **43 new snippets** for standard library functions
- **IntelliSense support**: All stdlib functions now auto-complete
- **Code patterns**: Complex patterns like error checking and method chaining
- **Documentation**: Each snippet includes clear description
- **Productivity boost**: Quickly access array methods, string operations, math functions, I/O, and conversions

### Statistics
- **Total snippets**: 103 (60 existing + 43 new)
- **Array snippets**: 9 methods + 1 chain pattern
- **String snippets**: 11 methods
- **Math snippets**: 9 functions
- **Conversion snippets**: 3 functions + 2 patterns
- **I/O snippets**: 5 functions + 4 template patterns

### Usage Examples

**Array operations:**
```liva
// Type 'map' → Tab
numbers.map(x => x * 2)

// Type 'chain' → Tab
numbers
    .filter(x => x > 0)
    .map(x => x * 2)
    .reduce((acc, x) => acc + x, 0)
```

**String operations:**
```liva
// Type 'split' → Tab
text.split(",")

// Type 'upper' → Tab
name.toLowerCase()
```

**Math functions:**
```liva
// Type 'sqrt' → Tab
Math.sqrt(16.0)

// Type 'pow' → Tab
Math.pow(2.0, 3.0)
```

**Type conversion with error handling:**
```liva
// Type 'parseintp' → Tab
let num, err = parseInt("42")
if err == "" {
    // use num
} else {
    console.error($"Parse error: {err}")
}
```

**Interactive I/O:**
```liva
// Type 'inputpat' → Tab
let input = prompt("Enter a number: ")
let num, err = parseInt(input)
if err == "" {
    console.log($"You entered: {num}")
} else {
    console.error($"Invalid input: {err}")
}
```

---

## [0.1.0] - 2025-10-18


- **Live validation** of interface implementations as you type
- **Red underlines** for missing method implementations
- **Instant feedback** when class doesn't implement all interface methods
- **Detailed error messages** showing:
  - Which method is missing
  - Required method signature
  - Which interface requires it
  - Helpful suggestion to fix
- **Multi-interface support**: Validates all interfaces in comma-separated list
- **Interface detection**: Automatically distinguishes interfaces (signatures only) from classes (has fields/constructor)
- **Debounced validation**: 300ms delay after typing stops for performance
- **Warning for undefined interfaces**: Shows warning if interface name not found

**Example validation:**
```liva
Animal {
    makeSound(): string
    getName(): string
}

// ❌ Error: Missing getName() method
Dog : Animal {
    makeSound() => "Woof!"
    // Red underline appears on class declaration line
}
```

#### Interface Syntax Support
- **Interface snippets**:
  - `interface`: Full interface declaration with method signatures
  - `iface`: Simple interface with one method
  - `classi`: Class implementing single interface
  - `classim`: Class implementing multiple interfaces
- **Enhanced syntax highlighting**:
  - Class/interface implementation detection with `:` syntax
  - Better highlighting for `ClassName : Interface1, Interface2` patterns
- **Documentation**:
  - Added interface examples to README
  - Updated example.liva with interface patterns (commented for future implementation)
  
### Technical Details
- Added `class-interface-declaration` pattern to syntax grammar
- Captures interface names in implementation declarations
- Prepared for semantic validation of interface implementations

## [0.1.0] - 2025-10-18

### 🚀 Phase 2: IntelliSense & Code Intelligence - COMPLETE ✅

Major milestone! Full IntelliSense support with intelligent code completion, navigation, and symbol management.

### Added

#### Phase 2.1: Completion Provider (af27ce9)
- **Intelligent code completion** with 100+ completion items
- **Keyword completions**: All language keywords with descriptions
- **Concurrency completions**: `async`, `par`, `task`, `fire`, `await` with snippets
- **Type completions**: Primitive and platform-specific types (i8-i128, u8-u128, f32, f64)
- **Error handling completions**: Error binding patterns, fail statements
- **Built-in function completions**: print, println, length, push, pop
- **Context-aware suggestions**: Different completions based on typing context
- **Snippet support**: Complex patterns with placeholders

#### Phase 2.2: Hover Provider (87f9ceb)
- **Keyword hover information**: Detailed descriptions with examples
  - Control flow: if, for, while, switch, return, break, continue
  - Logical operators: and, or, not
  - Module keywords: import, use, constructor, this
- **Type hover information**: Type descriptions with value ranges
  - Integer types with min/max values
  - Float types with precision info
- **Built-in function hover**: Signatures, descriptions, examples
  - Shows function signature, parameters, return type
  - Practical usage examples
- **Concurrency keyword hover**: Detailed execution model explanations
  - async, par, task, fire, await with complete examples
  - Parallel policies: seq, parvec, chunk, threads, simdWidth, ordered
- **Markdown formatting**: Rich hover content with code examples

#### Phase 2.3: Signature Help Provider (899ea60)
- **Real-time parameter hints** while typing function calls
- **Active parameter highlighting**: Shows which parameter you're typing
- **30+ built-in function signatures**:
  - Array functions: push, pop, insert, remove, slice, map, filter, reduce
  - String functions: split, join, substring, replace, toLowerCase, toUpperCase, trim
  - Type conversion: parseInt, parseFloat, toString, format
  - Math functions: abs, sqrt, pow, min, max, floor, ceil, round
  - I/O functions: print, println
  - Utility: length, range
- **Parameter documentation**: Detailed description for each parameter
- **Trigger characters**: '(' and ',' for automatic display

#### Phase 2.4: Definition & Reference Providers (c018a09)
- **Go to Definition (F12)**:
  - Functions: All styles (one-liner, block, with return types)
  - Variables: let and const declarations
  - Error binding patterns: let value, err = ...
  - Classes: PascalCase class definitions
- **Find All References (Shift+F12)**:
  - Finds all usages of a symbol
  - Option to include/exclude declaration
  - Whole-word matching
- **Peek Definition (Alt+F12)**: Inline definition preview
- **Current file scope**: Phase 2 implementation (cross-file in future phases)

#### Phase 2.5: Document Symbol Provider (99d3db1)
- **Outline view**: Document structure in Explorer sidebar
- **Breadcrumbs navigation**: Navigate code hierarchy at top of editor
- **Symbol detection**:
  - Functions with all syntax variations
  - Classes with full member hierarchy
  - Constructors, fields, methods
  - Constants (UPPERCASE naming)
- **Hierarchical structure**: Classes show nested members
- **Go to Symbol (Ctrl+Shift+O)**: Quick navigation within file

### Developer Experience Improvements

- **IntelliSense now matches industry standards**:
  - TypeScript/JavaScript level completion
  - Full hover information
  - Signature help while typing
  - Code navigation (F12, Shift+F12)
  - Document outline
  
- **Productivity features**:
  - Faster coding with completions
  - Learn as you code with hover info
  - Quick navigation with Go to Definition
  - Understand code structure with outline

### Technical Details

- Created 5 provider modules:
  - `providers/completionProvider.ts` (350 lines)
  - `providers/hoverProvider.ts` (345 lines)
  - `providers/signatureHelpProvider.ts` (311 lines)
  - `providers/definitionProvider.ts` (255 lines)
  - `providers/symbolProvider.ts` (304 lines)
- All providers registered in `extension.ts`
- Regex-based parsing for symbol detection
- Markdown support for rich documentation
- Incremental approach: current-file scope for Phase 2

### Keyboard Shortcuts

- **Ctrl+Space**: Trigger completion
- **Ctrl+Shift+Space**: Trigger signature help
- **F12**: Go to Definition
- **Alt+F12**: Peek Definition
- **Shift+F12**: Find All References
- **Ctrl+Shift+O**: Go to Symbol in File

### Statistics

- **Commits**: 5 commits for Phase 2
- **Files created**: 5 provider modules
- **Lines added**: ~1,565 lines of code
- **Completion items**: 100+
- **Function signatures**: 30+
- **Hover entries**: 50+

---

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
