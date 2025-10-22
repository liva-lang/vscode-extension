# Real-Time Fallible Function Validation

## Overview

As of version **0.3.2**, the Liva VS Code extension now provides **real-time validation** for fallible function calls. This feature catches a common error pattern where functions containing `fail` statements are called without proper error binding.

## What It Does

The validator:
1. **Detects fallible functions**: Automatically identifies functions that contain `fail` statements
2. **Validates all calls**: Checks every call to a fallible function in your code
3. **Shows instant feedback**: Red squiggly lines appear immediately when you make a mistake
4. **Provides helpful messages**: Clear explanation and fix suggestion

## Error Code: E0701

**Title**: Fallible function must be called with error binding

**When it appears**: When you call a function that can fail without using the error binding pattern.

## Example

### ❌ Wrong (shows error)

```liva
divide(a, b) {
    if b == 0.0 {
        fail "Division by zero"
    }
    return a / b
}

main() {
    // ERROR: Red squiggly line on "divide"
    console.log($"Result: {divide(10.0, 2.0)}")
    
    // ERROR: Red squiggly line on "divide"
    let x = divide(20.0, 4.0)
    
    // ERROR: Red squiggly line on "divide"
    divide(30.0, 5.0)
}
```

### ✅ Correct (no error)

```liva
main() {
    // Using error binding pattern
    let result, err = divide(10.0, 2.0)
    if err != null {
        console.error($"Error: {err}")
    } else {
        console.log($"Result: {result}")
    }
}
```

## How It Works

### Detection Phase
The validator scans your code and builds a list of fallible functions:
- Parses function declarations
- Checks if function body contains `fail` statements
- Tracks function names for validation

### Validation Phase
For each function call in your code:
- Checks if the called function is in the fallible list
- Verifies if the call is in an error binding context (`let x, err = ...`)
- If not, creates a diagnostic (red squiggly line) at the call site

### Performance
- **Debounced**: 300ms delay after you stop typing
- **Fast**: No compiler invocation needed
- **Independent**: Works alongside compiler validation

## Benefits

1. **Immediate Feedback**: See errors as you type, not after compilation
2. **Learn Correct Patterns**: The extension teaches you the right way to handle errors
3. **Prevent Runtime Issues**: Catch mistakes before they cause problems
4. **Type Safety**: Prevents Result type leakage (no more "Ok(5.0)" in output)

## Technical Details

- **Provider**: `FallibleFunctionValidator`
- **Language**: TypeScript
- **Parsing**: Simple regex-based AST-like parsing
- **Integration**: Separate diagnostic collection (`liva-fallible`)
- **Compiler Sync**: Matches validation in `livac` compiler (commit e18cadb)

## Settings

The validation is **always enabled** and works automatically. No configuration needed.

## See Also

- [CHANGELOG.md](CHANGELOG.md) - Version history
- [README.md](README.md) - Extension documentation
- Compiler implementation: `livac/src/semantic.rs` (lines 1217-1249)

## Version

- Introduced in: **v0.3.2** (2025-10-22)
- Compiler support: **livac v0.8.0+**
