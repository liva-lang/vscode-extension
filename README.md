# Liva Language Support

**Version 0.13.0** - Complete IDE experience for Liva v1.1.0 in Visual Studio Code and Cursor.

## 🎉 Liva v1.1.0 — Syntax Sugar & Ergonomics!

The Liva compiler now includes ergonomic syntax sugar features, fully supported by this extension:

- ✅ **Syntax Highlighting** - Full grammar support including `::` operator
- ✅ **Error Diagnostics** - Real-time error reporting
- ✅ **Autocomplete** - IntelliSense for all symbols
- ✅ **Go to Definition** - Navigate codebase easily
- ✅ **Hover Information** - Type info on hover
- ✅ **Multi-file Support** - Import/export across modules

## 🎉 What's New in 0.13.0

### Point-Free Function References (v1.1.0) 🎯

**Pass function names directly as callbacks — no lambda wrapper needed!**

```liva
// Before (still works)
items.forEach(x => print(x))
nums.map(x => double(x))

// After — point-free (v1.1.0)
items.forEach(print)
nums.map(double)
names.filter(isValid)
for item in items => print
```

**Snippets:** `foreachpf`, `mappf`, `filterpf`

### Method References with `::` (v1.1.0) 🔗

**Reference instance methods as callbacks using `object::method` syntax!**

```liva
let fmt = Formatter("Hello")
let greetings = names.map(fmt::format)   // ["Hello: Alice", ...]
names.forEach(logger::log)
```

**Snippets:** `foreachmr`, `mapmr`, `filtermr`

### Parameter Destructuring v0.10.2 & v0.10.3 🎯 ✅

**Destructure arrays and objects directly in parameters and variables!** Modern syntax inspired by JavaScript/TypeScript.

- **📦 Variable Destructuring (v0.10.2)**
  - Array destructuring: `let [x, y] = [10, 20]`
  - Object destructuring: `let {id, name} = user`
  - Skip elements: `let [first, , third] = array`
  - Rest patterns: `let [head, ...tail] = list`
  - Field renaming: `let {name: userName} = user`

- **🔧 Function Parameter Destructuring (v0.10.3)**
  - Array params: `printPair([x, y]: [int]) { ... }`
  - Object params: `processUser({id, name}: User) { ... }`
  - One-liners: `sum([a, b]: [int]): int => a + b`
  - Works in methods and functions

- **⚡ Lambda Destructuring (v0.10.3)**
  - forEach: `pairs.forEach(([x, y]) => print(x, y))`
  - map: `points.map(([a, b]) => a + b)`
  - filter: `users.filter(({age}) => age >= 18)`
  - All array methods support destructuring!

- **📝 20+ New Destructuring Snippets**
  - `letarr` - Array destructuring in let
  - `letobj` - Object destructuring in let
  - `letarrrest` - Array with rest pattern
  - `fnarr` - Function with array destructuring
  - `fnobj` - Function with object destructuring
  - `foreachd` - forEach with destructuring
  - `mapd`, `mapobj` - map with destructuring
  - `filterd`, `filterobj` - filter with destructuring
  - And 12 more patterns!

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

// Lambda destructuring with forEach
let pairs = [[1, 2], [3, 4], [5, 6]]
pairs.forEach(([x, y]) => {
    print($"x={x}, y={y}, sum={x + y}")
})

// Object destructuring in map
let users = [{id: 1, name: "Alice"}, {id: 2, name: "Bob"}]
let names = users.map(({name}) => name)
```

### HTTP Client v0.9.6: Complete REST API Support 🌐 ✅

**Modern HTTP client with ergonomic JSON parsing!** Built-in async HTTP methods and response.json() API.

- **🌐 HTTP Methods**
  - `HTTP.get(url)` - GET requests with automatic JSON parsing
  - `HTTP.post(url, body)` - POST with JSON or form data
  - `HTTP.put(url, body)` - PUT for updates
  - `HTTP.delete(url)` - DELETE operations
  - All methods async by default with error binding pattern

- **✨ Ergonomic JSON Parsing**
  - `response.json()` - Parse JSON directly from responses (like fetch API)
  - Returns `(JsonValue, String)` tuple for easy error handling
  - Alternative to `JSON.parse(response.body)`
  - Cleaner, more intuitive API

- **🎨 Typed JSON Parsing**
  - Direct deserialization to custom classes
  - `let users: [User], err = response.json()`
  - Automatic serde derives for classes
  - Type-safe API consumption

- **📦 Response Object**
  - `status: int` - HTTP status code (200, 404, etc.)
  - `statusText: string` - Status message ("OK", "Not Found")
  - `body: string` - Response body
  - `headers: {string: string}` - Response headers map
  - `json() -> (JsonValue, String)` - Parse response as JSON

- **⚡ Modern Patterns**
  - Error binding: `let response, err = HTTP.get(url)`
  - Async execution with 30-second timeout
  - TLS/SSL support via rustls
  - Clean REST API integration

- **📝 16 New HTTP Snippets**
  - `httpget`, `hget` - Quick GET requests
  - `httppost`, `hpost` - POST with JSON
  - `httpjson` - GET with response.json()
  - `httptyped` - Typed JSON parsing pattern
  - `restapi` - Full REST API class template
  - And 9 more patterns!

**Example:**
```liva
main() {
    // Simple GET with JSON parsing
    let response, err = HTTP.get("https://api.github.com/users/octocat")
    if err {
        console.error($"Request failed: {err}")
        return
    }
    
    // Parse JSON directly from response
    let json, parseErr = response.json()
    if parseErr {
        console.error($"JSON error: {parseErr}")
        return
    }
    
    console.success($"Status: {response.status} {response.statusText}")
    console.log($"User data: {json}")
}
```

**Typed parsing example:**
```liva
User {
    name: string
    email: string
    age: int
}

main() {
    let response, err = HTTP.get("https://api.example.com/users/1")
    if err { return }
    
    // Automatic deserialization to User class
    let user: User, jsonErr = response.json()
    if jsonErr { return }
    
    console.log($"Name: {user.name}, Email: {user.email}")
}
```

## Previous Updates

### 0.4.0 - Enhanced Error Messages & Quick Fixes

### Phase 5 Integration: Enhanced Error Messages & Quick Fixes ✅

**Intelligent error diagnostics with interactive quick fixes!** Integration of Liva compiler v0.8.1 Phase 5 enhancements.

- **⚡ One-Click Quick Fixes**
  - Click on red squigglies to see "Did you mean?" suggestions
  - Press ⌘+. (Ctrl+.) for instant typo fixes
  - Automatically replaces incorrect names with correct ones
  - Smart Levenshtein distance algorithm (max 2 character edits)

- **🎯 Precise Error Highlighting**
  - Exact token underlining using compiler's length field
  - No more approximate +3 characters
  - Highlights exactly the problematic token

- **📂 Error Categories**
  - Categorized errors: `[Lexical]`, `[Syntax]`, `[Semantic]`, etc.
  - 8 error categories for easy identification
  - Clear message format: `[Category] E0xxx: Error title`

- **💡 Intelligent Hints & Help**
  - Contextual hints for common errors
  - Code examples in related information panel
  - Clickable documentation links (📚 icon)
  - Enhanced hover with markdown formatting

**Example:**
```liva
console.log(divid(10, 2))  // Typo: 'divid'
// ❌ [Semantic] E2001: Undefined function 'divid'
// 💡 Did you mean 'divide'?
// ⚡ Quick Fix: Click lightbulb → "Change to 'divide'" → Fixed!
```

## Previous Updates

### 0.3.1 - Console API Support ✅

**Complete IntelliSense for Liva's Console API!**

- **🎨 Colored Output Functions**
  - `console.log()` - Debug information
  - `console.success()` - **Green** success messages
  - `console.warn()` - **Yellow** warnings
  - `console.error()` - **Red** errors

- **⌨️ User Input**
  - `console.input("prompt")` - Read with prompt
  - `console.input()` - Read without prompt

- **🔮 IntelliSense Features**
  - Autocomplete for all console methods
  - Hover documentation with examples
  - Syntax highlighting for console namespace
  - Built-in function support (parseInt, parseFloat, toString)

## Previous Updates

### 0.3.0 - Module System Support - Liva v0.8.0 ✅

**Full support for Liva's new module system!**

- **📦 Multi-File Projects**
  - Import functions and types from other Liva files
  - Automatic module resolution
  - Clean project organization

- **🔗 Import Statements**
  - `import { add, subtract } from "./math.liva"`
  - Syntax highlighting for imports
  - Code snippets for common patterns

- **🚀 Smart Compilation**
  - Automatic detection of multi-file projects
  - Uses `.liva_build/` for local builds
  - Maintains build cache between runs
  - `--run` flag now works with multi-file projects

- **📂 Project Structure**
  - Support for organized codebases
  - Cross-file navigation (coming soon)
  - Module dependency tracking (coming soon)

### Phase 2: IntelliSense & Code Intelligence ✅

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
- ✅ **Interface validation** - Real-time checking of interface implementations

### 🚧 Coming Soon (Phase 3+)

- **Code actions** - Quick fixes and refactoring
- **Debugging support** - Breakpoints and step-through
- **Test integration** - Run and debug tests
- **Code formatting** - Automatic formatting

## Module System (v0.8.0)

Organize your code across multiple files with Liva's module system:

### Creating a Multi-File Project

**math.liva** (utility module):
```liva
// Export functions by defining them
add(a: int, b: int): int => a + b
multiply(a: int, b: int): int => a * b
```

**main.liva** (entry point):
```liva
// Import specific functions
import { add, multiply } from "./math.liva"

main() {
    result = add(5, multiply(3, 4))
    print($"Result: {result}")  // Output: Result: 17
}
```

### Import Syntax

```liva
// Import specific items
import { function1, function2 } from "./module.liva"

// Import all items
import * from "./module.liva"

// Relative paths
import { helper } from "./utils/helper.liva"
import { Config } from "../config.liva"
```

### Compilation

The extension automatically detects multi-file projects:

- **Single file**: Uses default output directory
- **With imports**: Uses `.liva_build/` for fast incremental builds
- **Build cache**: Maintains compiled artifacts between runs

### Project Organization

```
my-project/
├── main.liva           # Entry point
├── math.liva           # Math utilities
├── utils/
│   ├── helper.liva     # Helper functions
│   └── types.liva      # Type definitions
└── .liva_build/        # Build cache (auto-generated)
```

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
- **Real-time validation**: Extension shows red underlines if class doesn't implement all interface methods

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

## Generics & Trait Aliases (v0.9.2) 🎉

Liva v0.9.2 introduces **trait aliases** - intuitive names for common constraint patterns that make generic programming accessible while maintaining full power for experts.

### Trait Aliases

**Built-in aliases** for common patterns:

- **`Numeric`** - All arithmetic operations (Add + Sub + Mul + Div + Rem + Neg)
- **`Comparable`** - Equality and ordering (Ord + Eq)
- **`Number`** - Complete number operations (Numeric + Comparable)
- **`Printable`** - Formatting (Display + Debug)

### Generic Functions

Write functions that work with any type:

```liva
// Simple arithmetic with Numeric
sum<T: Numeric>(a: T, b: T): T => a + b

multiply<T: Numeric>(a: T, b: T): T => a * b

// Comparison with Comparable
max<T: Comparable>(a: T, b: T): T {
    if a > b { return a }
    return b
}

min<T: Comparable>(a: T, b: T): T => a < b ? a : b

// Complex operations with Number (math + comparison)
clamp<T: Number>(value: T, min: T, max: T): T {
    if value < min { return min }
    if value > max { return max }
    return value
}

inRange<T: Number>(value: T, min: T, max: T): bool {
    return value >= min and value <= max
}
```

### Mixed Constraints

Combine trait aliases with granular traits:

```liva
// Trait alias + granular trait
formatAndCompare<T: Comparable + Display>(a: T, b: T): string {
    if a == b { return $"Equal: {a}" }
    if a > b { return $"{a} > {b}" }
    return $"{a} < {b}"
}

// Multiple combinations
debugCalc<T: Numeric + Printable>(a: T, b: T): T {
    console.log($"Computing: {a} + {b}")
    return a + b
}
```

### Granular Traits (Precise Control)

Use specific traits when you need exact control:

```liva
// Only addition, nothing else
addOnly<T: Add>(a: T, b: T): T => a + b

// Only comparison
lessThan<T: Ord>(a: T, b: T): bool => a < b

// Only equality
equals<T: Eq>(a: T, b: T): bool => a == b
```

**Available granular traits:**
- **Arithmetic**: `Add`, `Sub`, `Mul`, `Div`, `Rem`, `Neg`
- **Comparison**: `Ord`, `Eq`, `PartialOrd`, `PartialEq`
- **Formatting**: `Display`, `Debug`
- **Utilities**: `Clone`, `Copy`, `Default`, `Hash`

### Generic Classes

Create reusable data structures:

```liva
// Generic range with Number constraints
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
    
    size(): T {
        return this.max - this.min
    }
}

// Generic calculator with Numeric
Calculator<T: Numeric> {
    constructor(initial: T) {
        this.value = initial
    }
    
    value: T
    
    add(other: T): T {
        this.value = this.value + other
        return this.value
    }
    
    multiply(other: T): T {
        this.value = this.value * other
        return this.value
    }
}
```

### Usage Examples

```liva
main() {
    // Works with int
    let sum1 = sum<int>(10, 20)           // 30
    let max1 = max<int>(100, 50)           // 100
    let clamp1 = clamp<int>(150, 0, 100)  // 100
    
    // Works with float
    let sum2 = sum<float>(3.14, 2.71)     // 5.85
    let max2 = max<float>(10.5, 20.3)     // 20.3
    
    // Generic classes
    let range = Range<int>(0, 100)
    let inRange = range.contains(50)      // true
    let size = range.size()               // 100
    
    let calc = Calculator<int>(10)
    calc.add(5)                           // 15
    calc.multiply(2)                      // 30
}
```

### IntelliSense Support

The extension provides full IntelliSense for generics:

- ✅ **Syntax highlighting** for trait aliases and granular traits
- ✅ **20+ generic snippets** for common patterns
- ✅ **Autocomplete** for `Numeric`, `Comparable`, `Number`, `Printable`
- ✅ **Autocomplete** for granular traits (`Add`, `Ord`, `Display`, etc.)
- ✅ **Code snippets** for generic functions and classes

### Generic Snippets

Use these prefixes to quickly create generic code:

**Functions:**
- `fng` - Generic function with Numeric
- `fngc` - Generic function with Comparable
- `fngn` - Generic function with Number
- `fn1g` - Generic one-liner with Numeric
- `fngm` - Generic function with mixed constraints
- `fngr` - Generic function with granular traits

**Classes:**
- `classg` - Generic class with Numeric
- `classgc` - Generic class with Comparable
- `classgn` - Generic class with Number

**Common patterns:**
- `sum` - Generic sum function
- `gmax` / `gmin` - Generic max/min functions
- `clamp` - Generic clamp function
- `avg` - Generic average function
- `swap` - Generic swap function

## HTTP Client (v0.9.6) 🌐

Make HTTP requests with Liva's built-in async HTTP client:

### Basic Requests

```liva
main() {
    // GET request with error binding
    let response, err = HTTP.get("https://api.example.com/users")
    
    if err {
        console.error($"Request failed: {err}")
        return
    }
    
    console.success($"Status: {response.status} {response.statusText}")
    console.log($"Body: {response.body}")
}
```

### HTTP Methods

**GET:**
```liva
let response, err = HTTP.get("https://api.example.com/data")
```

**POST:**
```liva
let body = '{"name": "John", "email": "john@example.com"}'
let response, err = HTTP.post("https://api.example.com/users", body)
```

**PUT:**
```liva
let updateData = '{"name": "Jane Doe"}'
let response, err = HTTP.put("https://api.example.com/users/1", updateData)
```

**DELETE:**
```liva
let response, err = HTTP.delete("https://api.example.com/users/1")
```

### JSON Parsing

**Ergonomic response.json():**
```liva
let response, err = HTTP.get("https://api.github.com/users/octocat")
if err { return }

// Parse JSON directly from response (like fetch API)
let json, parseErr = response.json()
if parseErr { return }

console.log($"Data: {json}")
```

**Typed JSON parsing:**
```liva
User {
    name: string
    email: string
    company: string
}

main() {
    let response, err = HTTP.get("https://api.example.com/users/1")
    if err { return }
    
    // Automatic deserialization to User class
    let user: User, jsonErr = response.json()
    if jsonErr { return }
    
    console.log($"User: {user.name} at {user.company}")
}
```

**Alternative with JSON.parse():**
```liva
let json, err = JSON.parse(response.body)
```

### Response Object

Every HTTP response provides:

- `status: int` - HTTP status code (200, 404, 500, etc.)
- `statusText: string` - Status message ("OK", "Not Found", etc.)
- `body: string` - Response body as string
- `headers: {string: string}` - Response headers as map
- `json() -> (JsonValue, String)` - Parse response body as JSON

### Error Handling

All HTTP methods return a tuple `(Response, String)`:

```liva
let response, err = HTTP.get(url)

if err {
    console.error($"Error: {err}")
    return
}

// Check status code
if response.status >= 400 {
    console.warn($"HTTP error: {response.status}")
}
```

### Complete Example

```liva
ApiClient {
    baseUrl: string
    
    constructor(baseUrl: string) {
        this.baseUrl = baseUrl
    }
    
    getUser(id: int) {
        let url = $"{this.baseUrl}/users/{id}"
        let response, err = HTTP.get(url)
        
        if err {
            console.error($"Request failed: {err}")
            return
        }
        
        if response.status == 200 {
            let json, parseErr = response.json()
            if parseErr == "" {
                console.success("User fetched successfully")
                return json
            }
        }
    }
    
    createUser(userData: string) {
        let url = $"{this.baseUrl}/users"
        let response, err = HTTP.post(url, userData)
        
        if err {
            console.error($"Failed to create user: {err}")
            return
        }
        
        console.success($"User created: {response.status}")
    }
}

main() {
    let api = ApiClient("https://api.example.com")
    api.getUser(1)
    api.createUser('{"name": "Alice", "email": "alice@example.com"}')
}
```

### HTTP Snippets

Quick snippets for common HTTP patterns:

- `httpget` / `hget` - GET request with error handling
- `httppost` / `hpost` - POST request with JSON body
- `httpput` / `hput` - PUT request
- `httpdelete` / `hdel` - DELETE request
- `httpjson` - GET with response.json() parsing
- `httppostjson` - POST with JSON response
- `resjson` - response.json() with error handling
- `resjsonc` - response.json() with class type hint
- `httptyped` - Typed JSON parsing pattern
- `httpstatus` - Status code checking
- `httpfull` - Full HTTP request pattern
- `restapi` - Complete REST API class template

### Features

- ✅ **Async by default** - All requests are async
- ✅ **Error binding** - Clean error handling with tuples
- ✅ **30-second timeout** - Prevents hanging requests
- ✅ **TLS/SSL support** - Secure HTTPS via rustls
- ✅ **JSON parsing** - Built-in response.json() method
- ✅ **Typed parsing** - Automatic deserialization to classes
- ✅ **Complete response object** - Status, headers, body

For more information, see the [HTTP Client documentation](https://github.com/liva-lang/livac/blob/main/docs/language-reference/http.md).

### When to Use Each Approach

**Use trait aliases (Numeric, Comparable, Number) when:**
- ✅ You need common operations (arithmetic, comparison)
- ✅ You want clear, intuitive code
- ✅ You're writing general-purpose utilities
- ✅ You want to minimize constraints verbosity

**Use granular traits (Add, Ord, Display) when:**
- ✅ You need precise control over operations
- ✅ You want to minimize constraints for flexibility
- ✅ You're implementing specific interfaces
- ✅ Performance optimization requires specificity

**Mix both approaches when:**
- ✅ You have complex requirements
- ✅ You need multiple different capabilities
- ✅ You're combining standard traits with custom needs

### More Information

For comprehensive documentation on generics and trait aliases:
- [Generics Reference](https://github.com/liva-lang/livac/blob/main/docs/language-reference/generics.md)
- [Trait Aliases Guide](https://github.com/liva-lang/livac/blob/main/docs/guides/trait-aliases-guide.md)
- [Examples](https://github.com/liva-lang/livac/tree/main/examples)

## 🔴 Error Reporting

The extension provides comprehensive error detection and reporting:

### Real-time Interface Validation ⚡

The extension validates interface implementations **as you type**, providing instant feedback:

**What it checks:**
- ✅ All methods from interfaces are implemented in classes
- ✅ Interface names exist and are defined
- ✅ Multi-interface implementations (comma-separated)
- ✅ Distinguishes interfaces (signatures only) from classes (has fields)

**Example:**
```liva
// Define interface
Animal {
    makeSound(): string
    getName(): string
}

// ❌ Missing getName() - Shows red underline
Dog : Animal {
    makeSound() => "Woof!"
    // Error: Class 'Dog' does not implement method 'getName' from interface 'Animal'
    // 💡 Add this method to the class or remove the interface
}

// ✅ All methods implemented - No errors
Cat : Animal {
    makeSound() => "Meow!"
    getName() => "Kitty"
}
```

**Features:**
- **Red squiggly underlines** on class declaration when methods are missing
- **Detailed error messages** showing exactly which method is missing
- **Required signature** displayed in error tooltip
- **Helpful suggestions** to fix the issue
- **Fast validation** with 300ms debounce after typing
- **No false positives** - distinguishes between interfaces and classes correctly

### Compiler Error Detection

Errors from the Liva compiler are detected and displayed as you type (with a 500ms debounce), showing:

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

