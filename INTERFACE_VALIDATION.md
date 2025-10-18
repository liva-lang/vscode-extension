# Real-time Interface Validation in Liva VSCode Extension

## Overview

The Liva VSCode extension now includes **real-time validation** of interface implementations. This feature provides instant feedback as you type, showing red underlines when a class doesn't implement all required methods from its interfaces.

## How It Works

### 1. Interface Detection

The validator scans your code to find interface definitions:

```liva
// Detected as INTERFACE because:
// - No constructor
// - Only method signatures (no implementations with => or {})
Animal {
    makeSound(): string
    getName(): string
}
```

### 2. Class Implementation Detection

It identifies classes implementing interfaces using the `:` syntax:

```liva
// Detected as CLASS implementing Animal interface
Dog : Animal {
    constructor(name: string) {
        this.name = name
    }
    
    name: string
    makeSound() => "Woof!"
    // Missing: getName()
}
```

### 3. Method Validation

For each class, the validator checks:
- ✅ All interface methods are present
- ✅ Method names match exactly
- ✅ Interface exists in the file

### 4. Error Reporting

If validation fails, you see:

```
❌ Class 'Dog' does not implement method 'getName' from interface 'Animal'

Required: getName(): string

💡 Add this method to the class or remove the interface from the implements clause
```

## Features

### Multi-Interface Support

```liva
// Validates ALL interfaces in comma-separated list
Circle : Drawable, Comparable {
    // Must implement ALL methods from both interfaces
    draw(): void        // from Drawable
    compareTo(): int    // from Comparable
}
```

### Smart Detection

The validator distinguishes interfaces from classes:

| Has Constructor? | Has Fields? | Detected As |
|-----------------|-------------|-------------|
| ❌ No | ❌ No | **Interface** |
| ✅ Yes | ❌ No | **Class** |
| ❌ No | ✅ Yes | **Class** |
| ✅ Yes | ✅ Yes | **Class** |

### Performance

- **Debounced validation**: 300ms delay after you stop typing
- **Incremental parsing**: Only re-validates changed files
- **No compiler required**: Pure TypeScript/JavaScript validation

## Examples

### Valid Implementation ✅

```liva
Animal {
    makeSound(): string
    getName(): string
}

Dog : Animal {
    constructor(name: string) {
        this.name = name
    }
    
    name: string
    
    makeSound() => "Woof!"
    getName() => this.name  // ✅ All methods implemented
}
```

**Result**: No errors

### Missing Method ❌

```liva
Cat : Animal {
    makeSound() => "Meow!"
    // ❌ Missing getName()
}
```

**Result**: Red underline on `Cat : Animal` line with error message

### Undefined Interface ⚠️

```liva
Bird : Flyable {  // ⚠️ Flyable not defined
    constructor(name: string) {
        this.name = name
    }
    
    name: string
}
```

**Result**: Yellow warning on `Bird : Flyable` line

## Technical Details

### Architecture

```
InterfaceValidationProvider
├── extractInterfaces(lines)
│   └── Finds all interface definitions
├── extractClasses(lines)
│   └── Finds classes with : Interface syntax
└── validateInterfaces(document)
    └── Checks all methods implemented
```

### Parser Logic

**Interface Extraction:**
1. Find pattern: `InterfaceName {`
2. Skip if contains `constructor`
3. Extract method signatures: `methodName(params): ReturnType`
4. Ignore lines with `=>` or `{` (those are implementations)

**Class Extraction:**
1. Find pattern: `ClassName : Interface1, Interface2 {`
2. Extract interface names from comma-separated list
3. Extract implemented method names
4. Track line numbers for error reporting

**Validation:**
1. For each class, get its interfaces
2. For each interface, get required methods
3. Check if class has all required method names
4. Generate diagnostics for missing methods

### Error Messages

Format:
```
Class 'ClassName' does not implement method 'methodName' from interface 'InterfaceName'

Required: methodName(params): ReturnType

💡 Add this method to the class or remove the interface from the implements clause
```

### Diagnostic Severity

- **Error** (red): Missing required method
- **Warning** (yellow): Interface not found

## Limitations (Current Implementation)

1. **Single-file scope**: Only validates interfaces defined in the same file
2. **Name-only matching**: Doesn't validate parameter types or return types (yet)
3. **No cross-file imports**: Can't validate interfaces from other files
4. **Parser-based**: Regex-based parsing, not full AST analysis

## Future Enhancements

1. ✨ **Cross-file validation**: Import interfaces from other files
2. ✨ **Signature validation**: Check parameter types and return types match
3. ✨ **Quick fixes**: Auto-generate missing methods
4. ✨ **Refactoring**: Rename methods across interfaces and implementations
5. ✨ **Go to interface**: Jump to interface definition from class
6. ✨ **Find implementations**: Find all classes implementing an interface

## Configuration

Currently auto-enabled. Future settings:

```json
{
    "liva.interfaceValidation.enabled": true,
    "liva.interfaceValidation.debounceMs": 300,
    "liva.interfaceValidation.checkSignatures": false
}
```

## Comparison with Other Languages

| Language | Interface Validation | When | How |
|----------|---------------------|------|-----|
| **TypeScript** | ✅ Yes | Real-time | Language server |
| **Java** | ✅ Yes | Real-time | Eclipse JDT |
| **C#** | ✅ Yes | Real-time | Roslyn |
| **Rust** | ✅ Yes (traits) | Real-time | rust-analyzer |
| **Liva** | ✅ Yes | Real-time | **This extension!** |

## Testing

Run the test file:

```bash
code test_interface_validation.liva
```

This file includes:
- ✅ Valid implementations (no errors)
- ❌ Invalid implementations (missing methods)
- ⚠️ Undefined interfaces (warnings)
- 🧪 Edge cases (extra methods, multiple interfaces)

## Contributing

Want to improve the validator? See:
- `src/providers/interfaceValidator.ts` - Main validation logic
- `src/extension.ts` - Integration with VSCode
- `test_interface_validation.liva` - Test cases

## License

Same as the Liva VSCode extension (MIT)
