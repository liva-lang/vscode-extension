# Upgrade Guide: VSCode Extension v0.0.6

## What's New in v0.0.6

### 🎯 Keyword Change: `boost` → `parvec`

The concurrency keyword `boost` has been renamed to **`parvec`** for better clarity and semantic meaning:

- **`par`** = Parallel execution
- **`vec`** = Vectorization (SIMD)
- **`parvec`** = **Par**allel + **Vec**torization

This makes the intent much clearer when reading code!

### Before (v0.0.5 and earlier):
```liva
for boost x in items with simdWidth 4 {
    process(x)
}
```

### Now (v0.0.6):
```liva
for parvec x in items with simdWidth 4 {
    process(x)
}
```

---

## 🆕 New Features

### Enhanced Loop Snippets

Type these prefixes and press Tab:

| Snippet | Trigger | Description |
|---------|---------|-------------|
| Sequential loop | `forseq` | `for seq x in items { ... }` |
| Parallel loop | `forpar` | `for par x in items { ... }` |
| Vectorized loop | `forvec` | `for vec x in items { ... }` |
| Parallel+Vec loop | `forparvec` | `for parvec x in items with simdWidth 4 { ... }` |
| Loop with options | `forwith` | `for [policy] x in items with [options] { ... }` |

### Complete Loop Policies Reference

```liva
// Sequential (default)
for seq x in items {
    print(x)
}

// Parallel execution with multiple threads
for par x in items with chunk 2 threads 4 {
    heavyComputation(x)
}

// SIMD vectorization
for vec x in items with simdWidth 4 {
    mathOperation(x)
}

// Combined parallel + vectorization
for parvec x in items with simdWidth 4 ordered {
    intensiveProcessing(x)
}
```

---

## 📝 Updated Documentation

- **README.md**: Now includes section on data-parallel loop policies
- **example.liva**: Updated with comprehensive examples of all loop types
- **CHANGELOG.md**: Full details of changes

---

## 🔧 Migration Guide

If you have existing Liva code using `boost`:

1. **Find and Replace**: Search for `for boost` and replace with `for parvec`
2. **No other changes needed**: The semantics and behavior remain identical
3. **Recompile**: Run `livac` on your updated files

### Automated Migration (VS Code)

1. Open your project in VS Code
2. Press `Ctrl+Shift+H` (Find and Replace in Files)
3. Find: `for boost`
4. Replace: `for parvec`
5. Click "Replace All"

---

## 🚀 Installation

### From VSIX File:

```bash
code --install-extension liva-vscode-0.0.6.vsix
```

### Upgrade from Previous Version:

1. Uninstall the old version (optional, but recommended)
2. Install the new VSIX file
3. Reload VS Code

---

## ✅ Verification

After upgrading, verify the extension is working:

1. Open a `.liva` file
2. Type `forparvec` and press Tab
3. You should see the parvec snippet
4. Syntax highlighting should recognize `parvec` as a keyword (colored)

---

## 🐛 Troubleshooting

### Syntax highlighting not working for `parvec`

1. Close VS Code completely
2. Reopen VS Code
3. Run "Developer: Reload Window" from command palette

### Snippets not appearing

1. Verify extension is activated (check Extensions panel)
2. Make sure file extension is `.liva`
3. Try typing the full snippet name

---

## 📋 Complete Changes Summary

### Files Modified:

- **syntaxes/liva.tmLanguage.json**: Updated keyword list
- **snippets/liva.json**: Added 5 new loop snippets
- **example.liva**: Comprehensive examples of all policies
- **README.md**: Added loop policies documentation section
- **CHANGELOG.md**: Documented all changes
- **package.json**: Version bump to 0.0.6

### Compiler Changes Required:

This extension version requires **Liva compiler v0.6** or higher with the `parvec` keyword support.

---

## 💡 Tips

- Use `forwith` snippet for quick dropdown selection of loop policy
- Combine `parvec` with `simdWidth`, `ordered`, and `chunk` options for optimal performance
- Remember: `parvec` = parallel + vectorization, perfect for compute-intensive workloads

---

## 🤝 Support

For issues or questions:
- GitHub Issues: https://github.com/liva-lang/livac/issues
- Documentation: See VSCODE_INTEGRATION.md

---

**Happy coding with Liva! 🎉**
