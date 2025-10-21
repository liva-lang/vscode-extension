# Module System Examples

This directory contains examples demonstrating Liva v0.8.0's module system.

## Files

- **`math.liva`** - Mathematical utility functions (module)
- **`main.liva`** - Main program importing from math module

## Running the Example

```bash
# From this directory
livac main.liva --run

# Or with explicit output
livac main.liva --output ./build
```

## Expected Output

```
=== Liva Module System Demo ===

--- Basic Operations ---
10 + 5 = 15
10 - 5 = 5
10 * 5 = 50
10 / 5 = 2

--- Advanced Operations ---
2^8 = 256
5! = 120

Module system working perfectly! ✅
```

## Module Features Demonstrated

1. **Named imports**: `import { add, subtract } from "./math.liva"`
2. **Multiple imports**: Importing several functions in one statement
3. **Relative paths**: Using `./` for same-directory imports
4. **Function reuse**: Using imported functions as if they were local

## Project Structure

```
modules/
├── math.liva        # Utility module
├── main.liva        # Entry point
├── README.md        # This file
└── .liva_build/     # Build cache (auto-generated)
```
