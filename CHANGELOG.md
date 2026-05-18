# Changelog

## [0.14.1] - 2026-05-18

### Fixed
- `extend` keyword now always highlighted as `keyword.declaration` (previously
  only colored when the full `extend Name {` form appeared on a single line —
  multi-line and incomplete forms were rendered as plain text).

## [0.14.0] - 2026-03-23

### 🗄️ DB Module + Missing Stdlib Syntax Highlighting

### Added

#### Syntax Highlighting (10 new namespaces)
- **DB**: `DB.open()`, `DB.exec()`, `DB.query()`, `DB.close()`
- **Regex**: `Regex.test()`, `Regex.match()`, `Regex.findAll()`, etc.
- **Date**: `Date.now()`, `Date.new()`, `Date.parse()`, etc.
- **CSV**: `CSV.read()`, `CSV.write()`, `CSV.parse()`, etc.
- **Random**: `Random.nextInt()`, `Random.shuffle()`, `Random.uuid()`, etc.
- **Crypto**: `Crypto.sha256()`, `Crypto.md5()`, `Crypto.base64Encode()`, etc.
- **Process**: `Process.exec()`, `Process.spawn()`, `Process.pid()`, etc.
- **Server**: `Server.create()`, `app.listen()`, etc.
- **Response**: `Response.text()`, `Response.json()`, `Response.status()`
- All namespaces use `support.class.*` / `support.function.*` scopes

#### New Snippets (16 new, 266 total)
- `dbopen` — Open SQLite database with error handling
- `dbexec` — Execute SQL statement
- `dbexecparams` — Execute parameterized SQL
- `dbquery` — Query and iterate rows
- `dbqueryparams` — Query with parameters
- `dbclose` — Close database connection
- `dbfull` — Complete DB setup (open, create table, insert, query, close)
- `servercreate` — Create HTTP server with route
- `serverroute` — Add HTTP route handler
- `resjson` — JSON response
- `sha256` — SHA-256 hash
- `processexec` — Execute shell command
- `randint` — Random integer
- `regextest` — Test regex pattern
- `datenow` — Get current date/time
- `csvread` — Read CSV file

### Fixed
- Replaced all `if err != ""` with idiomatic `if err {` in docs, examples, and hover info

## [0.13.0] - 2026-02-11

### 🍬 Liva v1.1.0 Syntax Sugar Support

**Point-free function references and `::` method references!**

### Added

#### Syntax Highlighting
- **`::` method reference operator**: Highlighted as `keyword.operator.method-reference.liva`
- **`object::method` pattern**: Object highlighted as variable, `::` as operator, method as function reference
- Examples: `names.map(fmt::format)`, `items.forEach(logger::log)`

#### New Snippets (6 new)
- `foreachpf` — forEach with point-free function reference
- `foreachmr` — forEach with `::` method reference
- `mappf` — map with point-free function reference
- `mapmr` — map with `::` method reference
- `filterpf` — filter with point-free function reference
- `filtermr` — filter with `::` method reference

#### Examples & Tests
- Added point-free and `::` method reference examples to `example.liva`
- Added syntax highlighting test cases (sections 16 & 17)

---

## [0.12.0] - 2025-10-27

### 🚀 Language Server Protocol (LSP) Integration ✨

**Full LSP support with intelligent code features!** Liva now includes a native Language Server providing real-time diagnostics, smart completions, navigation, and hover information.

### Added

#### LSP Client Integration
- **Language Server Protocol client**:
  * Connects to `livac lsp` server
  * Automatic startup on Liva file open
  * Configurable via `liva.lsp.enabled` setting
  * Restart command: `Liva: Restart Language Server`

#### Smart Features via LSP
- **Code Completion** (Ctrl+Space):
  * Keywords: let, const, fn, if, else, while, for, return, etc.
  * Types: int, float, string, bool, void
  * Built-in functions: parseInt, parseFloat, toString
  * AST-extracted symbols: functions, classes, type aliases
  * Trigger characters: `.` and `:`

- **Go to Definition** (F12):
  * Jump to function declarations
  * Navigate to class definitions
  * Find type alias declarations
  * Context-aware symbol resolution

- **Find All References** (Shift+F12):
  * Locate all usages of functions, classes, variables
  * Word boundary detection for accurate results
  * Single-file scope with precise locations

- **Hover Information** (Mouse hover):
  * Type signatures for symbols
  * Function/class/type descriptions
  * Built-in keyword documentation
  * Markdown-formatted tooltips

- **Real-time Diagnostics**:
  * Lexer, parser, and semantic errors
  * Inline error messages with rich metadata
  * Error codes and categories
  * Automatic updates on file changes

#### Configuration
- **New Settings**:
  * `liva.lsp.enabled`: Enable/disable LSP (default: true)
  * `liva.compiler.path`: Path to livac executable

### Changed
- Extension now prioritizes LSP features over manual providers
- Fallback to legacy providers when LSP disabled
- Version bumped to 0.12.0 to match compiler LSP release

### Technical Details
- Uses `vscode-languageclient` for JSON-RPC communication
- Server process: `livac lsp` via stdio transport
- Document sync: Full text synchronization
- Symbol extraction from Liva AST
- Textual reference finding with boundary checking

---

## [Unreleased]

### 🎯 Advanced Types Support - Liva v0.11.x ✨

**Union types, type aliases, and pattern matching with type narrowing!** Complete support for Phase 7 (Advanced Types) features in the Liva compiler v0.11.0-v0.11.3.

### Added

#### v0.11.3 - Pattern Matching for Union Types
- **Pattern matching with type patterns**:
  * Syntax: `n: int => expr` in switch expressions
  * Automatic type narrowing in each match arm
  * Full exhaustiveness checking support
  * Works with 2+ type unions

#### v0.11.2 - Union Types
- **Union type syntax highlighting**:
  * Basic unions: `int | string`, `T | U | V`
  * Multi-type unions: `int | string | bool`
  * Union with tuples: `(int, int) | string`
  * Union with arrays: `[int] | string`
  * Union with optionals: `int? | string`

#### v0.11.1 - Type Aliases
- **Type alias declarations**:
  * Simple aliases: `type UserId = int`
  * Tuple aliases: `type Point = (int, int)`
  * Generic aliases: `type Box<T> = (T,)`
  * Nested aliases: `type IntBox = Box<int>`
  * Array and optional aliases

#### Syntax Highlighting Updates
- **New operator**: Pipe `|` for union types in type context
- **Enhanced**: `type` keyword recognition for aliases
- **Added**: Pattern matching with type annotations support

---

## [0.9.0] - Previous Release

### 🎯 Parameter Destructuring - Liva v0.10.2 & v0.10.3 ✅

**Destructure arrays and objects in variables, function parameters, and lambdas!** Complete modern destructuring support inspired by JavaScript/TypeScript, bringing ergonomic data extraction patterns to Liva.

### Added

#### Variable Destructuring (v0.10.2)
- **Enhanced let bindings with destructuring patterns**:
  * Array destructuring: `let [x, y] = [10, 20]`
  * Object destructuring: `let {id, name} = user`
  * Skip elements: `let [first, , third] = array`
  * Rest patterns: `let [head, ...tail] = list`
  * Field renaming: `let {name: userName, email: userEmail} = user`
  * Nested destructuring: `let [[a, b], [c, d]] = matrix`

#### Function Parameter Destructuring (v0.10.3)
- **Destructuring in function parameters**:
  * Array params: `printPair([x, y]: [int]) { ... }`
  * Object params: `processUser({id, name}: User) { ... }`
  * One-liners: `sum([a, b]: [int]): int => a + b`
  * Field renaming: `greet({firstName: first}: Person) { ... }`
  * Rest patterns: `processList([head, ...tail]: [int]) { ... }`
  * Works in both functions and methods

#### Lambda Destructuring (v0.10.3)
- **Destructuring in array method lambdas**:
  * forEach: `pairs.forEach(([x, y]) => print(x, y))`
  * map: `points.map(([a, b]) => a + b)`
  * filter: `users.filter(({age}) => age >= 18)`
  * reduce: `items.reduce((acc, [x, y]) => acc + x + y, 0)`
  * Parallel execution: `data.parvec().forEach(([x, y]) => ...)`

#### 20+ New Destructuring Snippets
- **Variable destructuring**:
  * `letarr` - Array destructuring in let
  * `letarrskip` - Array with skip elements
  * `letarrrest` - Array with rest pattern
  * `letobj` - Object destructuring in let
  * `letobjren` - Object with field renaming
  * `letobjrest` - Object with rest pattern

- **Function parameter destructuring**:
  * `fnarr` - Function with array destructuring param
  * `fnobj` - Function with object destructuring param
  * `fn1arr` - One-liner with array destructuring
  * `fn1obj` - One-liner with object destructuring

- **Lambda destructuring**:
  * `foreachd` - forEach with array destructuring
  * `foreachobj` - forEach with object destructuring
  * `mapd` - map with array destructuring
  * `mapobj` - map with object destructuring
  * `filterd` - filter with array destructuring
  * `filterobj` - filter with object destructuring
  * `reduced` - reduce with array destructuring

#### Documentation Updates
- **Enhanced language-reference docs**:
  * `functions.md` - Complete Parameter Destructuring section (200+ lines)
  * `variables.md` - Expanded Destructuring section with all patterns
  * `syntax-overview.md` - Quick reference examples
- **Implementation docs**: PHASE_6.5.1_PARAM_DESTRUCTURING_DESIGN.md
- **User guide examples**: Real-world HTTP and array processing patterns

### Changed
- **Snippet improvements**: 20+ new destructuring patterns
- **Documentation**: Comprehensive guides for v0.10.2 and v0.10.3 features
- **Examples**: Added working code samples for all destructuring forms

### Implementation Details
- Parser recognizes `[x, y] =>` and `{x, y} =>` as lambda starts
- Codegen generates temporary parameter names (`_param_0`, `_param_1`)
- Destructuring code inserted at function/lambda entry
- Works with all array methods (forEach, map, filter, reduce)
- Full support for parallel execution (parvec)

**Examples:**
```liva
// Variable destructuring
let [x, y] = [10, 20]
let {id, name} = user
let [head, ...tail] = [1, 2, 3, 4]

// Function parameter destructuring
printPair([first, second]: [int]): int {
    print($"First: {first}, Second: {second}")
    return first + second
}

// Lambda destructuring
let pairs = [[1, 2], [3, 4], [5, 6]]
pairs.forEach(([x, y]) => {
    print($"Sum: {x + y}")
})

// Object destructuring in filter
let users = [{id: 1, name: "Alice", age: 25}]
let adults = users.filter(({age}) => age >= 18)
```

---

## [0.7.0] - 2025-01-24

### 🎉 JSON & File I/O Support - Liva v0.9.3 & v0.9.4 ✅

Complete support for JSON parsing/serialization and File I/O operations! This update brings comprehensive snippets and syntax highlighting for working with JSON data and file system operations.

### Added

#### JSON Parsing & Serialization (v0.9.3)
- **Syntax highlighting for JSON namespace**: `JSON.parse()`, `JSON.stringify()`
- **8 JSON snippets**:
  * `jsonparse` - Parse JSON with full error handling pattern
  * `jsonp` - Simple JSON parse
  * `jsons` - JSON stringify
  * `jsonstringify` - Stringify with validation
  * `jsonfile` - Complete read and parse JSON file pattern
  * `savejson` - Stringify and save to file

**JSON Features:**
- Parse JSON strings with error binding: `let data, err = JSON.parse(json)`
- Convert values to JSON: `let json = JSON.stringify(value)`
- Full error handling integration
- Bidirectional type mapping (JSON ↔ Liva types)

#### File I/O Operations (v0.9.4)
- **Syntax highlighting for File namespace**: `File.read()`, `File.write()`, `File.append()`, `File.exists()`, `File.delete()`
- **8 File I/O snippets**:
  * `fileread` - Read file with error handling
  * `fread` - Simple file read
  * `filewrite` - Write file with error handling
  * `fwrite` - Simple file write
  * `fappend` - Append to file
  * `fexists` - Check file existence
  * `fdelete` - Delete file
  * `jsonfile` - Read & parse JSON file (complete pattern)
  * `savejson` - Save JSON to file (complete pattern)

**File I/O Features:**
- Read files: `let content, err = File.read("path.txt")`
- Write files: `let err = File.write("path.txt", content)`
- Append to files: `let err = File.append("path.txt", data)`
- Check existence: `if File.exists("path.txt") { ... }`
- Delete files: `let err = File.delete("path.txt")`
- UTF-8 support with Rust std::fs backend

### Changed
- **Version**: 0.6.0 → 0.7.0
- **Description**: Added "JSON parsing, File I/O" to extension description
- **Syntax highlighting**: Added JSON and File namespaces recognition

### Usage Examples

**Parse JSON data:**
```liva
// Type 'jsonparse' → Tab
let data, err = JSON.parse(json_string)
if err == "" {
    // use data
} else {
    console.error($"Parse error: {err}")
}
```

**Read JSON file:**
```liva
// Type 'jsonfile' → Tab
let content, read_err = File.read("data.json")
if read_err {
    console.error($"Read error: {read_err}")
} else {
    let data, parse_err = JSON.parse(content)
    if parse_err == "" {
        // use data
    } else {
        console.error($"Parse error: {parse_err}")
    }
}
```

**Write to file:**
```liva
// Type 'filewrite' → Tab
let err = File.write("output.txt", content)
if err == "" {
    console.log("File written successfully")
} else {
    console.error($"Write error: {err}")
}
```

**Save JSON to file:**
```liva
// Type 'savejson' → Tab
let json = JSON.stringify(data)
let err = File.write("output.json", json)
if err == "" {
    console.log("JSON saved successfully")
} else {
    console.error($"Save error: {err}")
}
```

### Compatibility

- **Requires**: Liva compiler v0.9.3 (JSON) or v0.9.4 (File I/O) or later
- **Backward compatible**: All previous v0.6.0 features still work
- **VS Code version**: 1.80.0 or later

### Benefits

- **JSON integration**: Parse and generate JSON with ease
- **File operations**: Read, write, append, delete files
- **Error handling**: Full error binding support for safe operations
- **Professional patterns**: Complete snippets for common workflows
- **UTF-8 support**: Proper Unicode handling for international text

---

## [0.6.0] - 2025-01-24

### 🎉 Pattern Matching Support - Liva v0.9.5 ✅

Full support for Liva's new pattern matching with switch expressions! This update brings complete IntelliSense for switch expressions with multiple pattern types and guards.

### Added

#### Pattern Matching Syntax Highlighting
- **Wildcard pattern**: Underscore `_` now highlighted as `constant.language.wildcard.liva`
- **Inclusive range operator**: `..=` now highlighted as `keyword.operator.range.inclusive.liva`
- **Proper precedence**: `..=` matched before `..` to prevent conflicts
- **Context-aware**: Word boundary matching for underscore (doesn't match in identifiers)

#### 10+ Pattern Matching Snippets
**Switch expression snippets:**
- `switchexpr` - Basic switch with literal patterns and wildcard
- `switchb` - Switch with binding pattern
- `switchr` - Switch with range patterns (exclusive)
- `switchri` - Switch with inclusive range patterns (`..=`)
- `switchg` - Switch with pattern guards (if conditions)
- `switchc` - Complex switch combining all pattern types
- `switchlet` - Assign switch result to variable
- `switchret` - Return switch expression result
- `switchblock` - Switch with block expressions
- `switchrange` - Switch demonstrating all range types (`..<`, `..=`, `<..`, `<..=`)

#### Pattern Types Supported
1. **Literal patterns**: `1 => "one"`, `"hello" => result`
2. **Wildcard pattern**: `_ => "default"`
3. **Binding pattern**: `n => n * 2` (binds value to variable)
4. **Range patterns**:
   - Exclusive: `1..10` (1 to 9)
   - Inclusive: `1..=10` (1 to 10)
   - Open ranges: `..10`, `10..`
5. **Pattern guards**: `n if n < 20 => "teenager"`

### Changed
- **Version**: 0.5.0 → 0.6.0
- **Description**: Added "pattern matching with switch expressions" to extension description
- **Syntax highlighting**: Added 2 new patterns for pattern matching features

### Usage Examples

**Simple switch with literals:**
```liva
// Type 'switchexpr' → Tab
switch value {
    1 => "one"
    2 => "two"
    _ => "other"
}
```

**Switch with ranges:**
```liva
// Type 'switchri' → Tab
switch score {
    90..=100 => "A"
    80..=89 => "B"
    70..=79 => "C"
    _ => "F"
}
```

**Switch with pattern guards:**
```liva
// Type 'switchg' → Tab
switch value {
    n if n < 0 => "negative"
    n if n == 0 => "zero"
    n if n > 0 => "positive"
}
```

**Complex switch:**
```liva
// Type 'switchc' → Tab
switch input {
    0 => "zero"
    1..10 => "small"
    n if n > 100 => "large"
    n => $"medium: {n}"
}
```

**Switch as expression:**
```liva
// Type 'switchlet' → Tab
let result = switch value {
    pattern1 => expr1
    pattern2 => expr2
    _ => default
}
```

### Compatibility

- **Requires**: Liva compiler v0.9.5 or later
- **Backward compatible**: All previous v0.5.0 features still work
- **VS Code version**: 1.80.0 or later

### Benefits

- **Modern pattern matching**: Expressive switch expressions that return values
- **Type-safe patterns**: Wildcard, binding, literal, and range patterns
- **Guards for complex logic**: Add conditions to patterns with `if`
- **Professional tooling**: Full IntelliSense with snippets matching Rust/Swift quality
- **Learn by example**: Comprehensive snippets demonstrate all pattern types

---

## [0.5.0] - 2025-10-23

### 🎉 Generics & Trait Aliases Support - Liva v0.9.2 ✅

Complete support for generics with trait aliases! This major update brings full IntelliSense for Liva's new generic programming features introduced in v0.9.2.

### Added

#### Trait Aliases Syntax Highlighting
- **Trait alias keywords**: `Numeric`, `Comparable`, `Number`, `Printable` highlighted with special color
- **Granular trait keywords**: `Add`, `Sub`, `Mul`, `Div`, `Rem`, `Neg`, `Eq`, `Ord`, `Display`, `Debug` highlighted distinctly
- **Support for trait composition**: Recognizes `T: Numeric + Display` syntax
- **Generic type parameters**: Proper highlighting of `<T>`, `<T: Numeric>`, etc.

#### 20+ Generic Snippets
**Function snippets:**
- `fng` - Generic function with Numeric constraint
- `fngc` - Generic function with Comparable constraint
- `fngn` - Generic function with Number constraint
- `fn1g` - Generic one-liner with Numeric
- `fn1gc` - Generic one-liner with Comparable
- `fngm` - Generic function with mixed constraints (aliases + granular)
- `fngr` - Generic function with granular traits only

**Class snippets:**
- `classg` - Generic class with Numeric
- `classgc` - Generic class with Comparable
- `classgn` - Generic class with Number (Range example)

**Common patterns:**
- `sum` - Generic sum function (one-liner)
- `gmax` - Generic max function
- `gmin` - Generic min function
- `clamp` - Generic clamp function
- `avg` - Generic average function
- `swap` - Generic swap function (no constraints)
- `arrsum` - Sum all elements in array
- `arrmax` - Find maximum in array
- `filterg` - Generic filter with predicate
- `mapg` - Generic map with two type parameters

#### Documentation Enhancements
- **Comprehensive generics section** in README with:
  - Overview of trait aliases system
  - When to use aliases vs granular traits
  - Complete examples of all patterns
  - Generic functions with all constraint types
  - Generic classes with different aliases
  - Mixed constraints examples
  - Real-world usage patterns
- **Updated example.liva** with 130+ lines of generic examples:
  - All trait aliases demonstrated
  - Mixed constraints patterns
  - Generic class examples (Range, Calculator)
  - Practical usage in `testGenerics()` function

#### IntelliSense Support
- **Autocomplete** for all trait aliases and granular traits
- **Syntax highlighting** distinguishes aliases from granular traits
- **20+ code snippets** for quick generic code creation
- **Full documentation** in hover and completion items

### Changed
- **Version**: 0.4.0 → 0.5.0
- **Description**: Added "generics with trait aliases" to extension description
- **Keywords**: Added "generics" and "trait-aliases" to package.json keywords
- **README**: Added major section on Generics & Trait Aliases with comprehensive examples

### Trait Aliases Reference

**Built-in aliases:**
- `Numeric` = Add + Sub + Mul + Div + Rem + Neg (all arithmetic)
- `Comparable` = Ord + Eq (equality and ordering)
- `Number` = Numeric + Comparable (complete number operations)
- `Printable` = Display + Debug (formatting)

**Granular traits:**
- Arithmetic: Add, Sub, Mul, Div, Rem, Neg
- Comparison: Ord, Eq, PartialOrd, PartialEq
- Formatting: Display, Debug
- Utilities: Clone, Copy, Default, Hash

### Usage Examples

**Simple generic function:**
```liva
// Type 'sum' → Tab
sum<T: Numeric>(a: T, b: T): T => a + b
```

**Generic with mixed constraints:**
```liva
// Type 'fngm' → Tab
formatAndCompare<T: Comparable + Display>(a: T, b: T): string {
    if a == b { return $"Equal: {a}" }
    return $"{a} vs {b}"
}
```

**Generic class:**
```liva
// Type 'classgn' → Tab
Range<T: Number> {
    constructor(min: T, max: T) {
        this.min = min
        this.max = max
    }
    
    min: T
    max: T
    
    contains(value: T): bool {
        return value >= this.min and value <= this.max
    }
}
```

### Compatibility

- **Requires**: Liva compiler v0.9.2 or later
- **Backward compatible**: All previous v0.4.0 features still work
- **VS Code version**: 1.80.0 or later

### Benefits

- **Intuitive generic programming**: Simple aliases like `Numeric` and `Comparable`
- **Precise control**: Granular traits still available when needed
- **Flexible mixing**: Combine aliases and granular traits freely
- **Professional tooling**: Full IntelliSense matching modern language support
- **Learn by example**: Comprehensive snippets demonstrate best practices

---

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
- **Concurrency completions**: `async`, `par`, `task`, `await` with snippets
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
  - async, par, task, await with complete examples
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
  - Concurrency: `async`, `await`, `par`, `task`
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
  - Special handling for async/par/task

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
