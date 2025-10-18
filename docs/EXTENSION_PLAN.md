# 🎨 Liva VSCode Extension - Implementation Plan

**Current Version:** 0.0.6  
**Target Version:** 1.0.0  
**Status:** 📋 PLANNING PHASE

---

## 📊 Current State Analysis

### ✅ What's Already Working

1. **Basic Language Support:**
   - ✅ Syntax highlighting (TextMate grammar)
   - ✅ Language configuration (brackets, comments, auto-close)
   - ✅ Code snippets (basic)

2. **Compiler Integration:**
   - ✅ Compile command (`liva.compile`)
   - ✅ Run command (`liva.run`)
   - ✅ Check syntax command (`liva.check`)
   - ✅ Auto-build on save
   - ✅ Live validation (with debounce)

3. **Diagnostics:**
   - ✅ Error parsing from compiler output
   - ✅ JSON format support
   - ✅ Text format fallback
   - ✅ Line/column highlighting
   - ✅ Error messages with help text

4. **Configuration:**
   - ✅ Compiler path
   - ✅ Output directory
   - ✅ Auto-build toggle
   - ✅ Live validation toggle

### ❌ What's Missing (Critical Features)

1. **IntelliSense / Autocompletion:**
   - ❌ No completion provider
   - ❌ No function signature help
   - ❌ No hover information
   - ❌ No goto definition

2. **Advanced Code Intelligence:**
   - ❌ No semantic highlighting
   - ❌ No code folding
   - ❌ No outline/symbols
   - ❌ No rename refactoring

3. **Debugging:**
   - ❌ No debug adapter
   - ❌ No breakpoints
   - ❌ No step through
   - ❌ No variable inspection

4. **Code Actions:**
   - ❌ No quick fixes
   - ❌ No code formatting
   - ❌ No organize imports
   - ❌ No refactoring suggestions

5. **Enhanced Snippets:**
   - ⚠️ Basic snippets only
   - ❌ No smart context-aware snippets
   - ❌ No snippet templates

6. **Testing Integration:**
   - ❌ No test explorer
   - ❌ No test runner
   - ❌ No test coverage

---

## 🎯 Implementation Phases

### Phase 1: Enhanced Syntax & Snippets (1 week) 🟢 QUICK WINS

**Goal:** Improve developer experience with better syntax support and snippets

#### Tasks:

1. **Enhanced Syntax Highlighting**
   - [ ] Update `liva.tmLanguage.json` with new v0.6 keywords
   - [ ] Add support for concurrency keywords (`async`, `par`, `task`, `fire`)
   - [ ] Improve string template highlighting (`$"text {expr}"`)
   - [ ] Add semantic token provider for better coloring
   - [ ] Support for new fail expression syntax

2. **Comprehensive Snippets**
   - [ ] Function declarations (one-liner, block, async, fallible)
   - [ ] Class declarations with constructors
   - [ ] Error binding patterns (`let value, err = async f()`)
   - [ ] Control structures (if/else, for, while)
   - [ ] Async/par patterns
   - [ ] Test function templates

3. **Improved Language Configuration**
   - [ ] Better bracket matching for all types
   - [ ] Auto-indentation rules
   - [ ] Word pattern for better word selection
   - [ ] On-enter rules for auto-formatting

#### Tests:
- [ ] Syntax highlighting regression test
- [ ] Snippet insertion tests
- [ ] Auto-formatting behavior tests

#### Deliverables:
- Updated `syntaxes/liva.tmLanguage.json`
- Enhanced `snippets/liva.json`
- Updated `language-configuration.json`
- Documentation with examples

---

### Phase 2: IntelliSense & Code Intelligence (2-3 weeks) 🟡 MEDIUM COMPLEXITY

**Goal:** Provide intelligent code completion and navigation

#### Sub-Phase 2.1: Completion Provider

**Tasks:**
- [ ] Create Language Server Protocol (LSP) client
- [ ] Implement basic completion provider
- [ ] Function name completion
- [ ] Variable name completion
- [ ] Keyword completion
- [ ] Class/type completion
- [ ] Import/module completion

**Implementation Strategy:**
```typescript
// Create completion provider
vscode.languages.registerCompletionItemProvider('liva', {
    provideCompletionItems(document, position, token, context) {
        // Parse document and provide suggestions
    }
});
```

#### Sub-Phase 2.2: Signature Help

**Tasks:**
- [ ] Parse function signatures from compiler
- [ ] Show parameter hints while typing
- [ ] Highlight current parameter
- [ ] Show parameter types and descriptions

#### Sub-Phase 2.3: Hover Information

**Tasks:**
- [ ] Show type information on hover
- [ ] Show function documentation
- [ ] Show variable types
- [ ] Show error descriptions

#### Sub-Phase 2.4: Go to Definition

**Tasks:**
- [ ] Parse symbol definitions from AST
- [ ] Implement definition provider
- [ ] Support for functions, variables, classes
- [ ] Support for imports

#### Tests:
- [ ] Completion suggestions accuracy
- [ ] Signature help accuracy
- [ ] Hover information correctness
- [ ] Definition navigation tests

#### Deliverables:
- Completion provider implementation
- Signature help provider
- Hover provider
- Definition provider
- LSP client integration (if needed)

---

### Phase 3: Code Actions & Refactoring (2 weeks) 🟡 MEDIUM COMPLEXITY

**Goal:** Provide quick fixes and refactoring capabilities

#### Sub-Phase 3.1: Quick Fixes

**Tasks:**
- [ ] "Add error binding" quick fix (convert `let x = async f()` to `let x, err = async f()`)
- [ ] "Import missing symbol" quick fix
- [ ] "Fix type mismatch" suggestions
- [ ] "Remove unused variable" quick fix
- [ ] "Add await to task" quick fix

#### Sub-Phase 3.2: Code Formatting

**Tasks:**
- [ ] Implement document formatting provider
- [ ] Call `livac --format` (if available) or implement formatter
- [ ] Format on save option
- [ ] Format selection option

#### Sub-Phase 3.3: Refactoring

**Tasks:**
- [ ] Extract function refactoring
- [ ] Rename symbol (with all references)
- [ ] Convert sync to async
- [ ] Convert function to lambda

#### Tests:
- [ ] Quick fix application tests
- [ ] Formatting consistency tests
- [ ] Refactoring correctness tests

#### Deliverables:
- Code action provider
- Document formatting provider
- Rename provider
- Refactoring commands

---

### Phase 4: Debugging Support (3-4 weeks) 🔴 COMPLEX

**Goal:** Full debugging experience with breakpoints and step-through

#### Sub-Phase 4.1: Debug Adapter Protocol

**Tasks:**
- [ ] Research Rust debugging integration
- [ ] Implement DAP client for Liva
- [ ] Launch configuration for Liva programs
- [ ] Attach configuration

#### Sub-Phase 4.2: Breakpoints

**Tasks:**
- [ ] Set breakpoints in Liva source
- [ ] Map Liva lines to generated Rust lines
- [ ] Conditional breakpoints
- [ ] Logpoints

#### Sub-Phase 4.3: Debug Controls

**Tasks:**
- [ ] Step over, step into, step out
- [ ] Continue, pause, restart
- [ ] Variable inspection
- [ ] Watch expressions
- [ ] Call stack navigation

#### Sub-Phase 4.4: Debug Console

**Tasks:**
- [ ] REPL for evaluating Liva expressions
- [ ] Print variable values
- [ ] Modify variables during debugging

#### Tests:
- [ ] Breakpoint hit tests
- [ ] Step through accuracy tests
- [ ] Variable inspection tests

#### Deliverables:
- Debug adapter implementation
- Launch/attach configurations
- Debug UI integration
- Documentation for debugging

---

### Phase 5: Testing Integration (1-2 weeks) 🟢 MEDIUM PRIORITY

**Goal:** Integrated test runner and explorer

#### Tasks:

1. **Test Explorer**
   - [ ] Discover Liva test functions
   - [ ] Show test tree in sidebar
   - [ ] Run individual tests
   - [ ] Run all tests
   - [ ] Show test results inline

2. **Test Runner**
   - [ ] Execute tests via compiler
   - [ ] Parse test results
   - [ ] Show pass/fail status
   - [ ] Show test output

3. **Test Coverage**
   - [ ] Generate coverage reports
   - [ ] Show coverage inline (green/red gutters)
   - [ ] Coverage summary

#### Tests:
- [ ] Test discovery accuracy
- [ ] Test execution reliability
- [ ] Coverage calculation correctness

#### Deliverables:
- Test explorer view
- Test runner implementation
- Coverage provider
- Test result display

---

### Phase 6: Advanced Features (2-3 weeks) 🔵 NICE TO HAVE

**Goal:** Additional features for enhanced productivity

#### Tasks:

1. **Code Lens**
   - [ ] Show reference counts above functions/classes
   - [ ] Show "Run" button above main()
   - [ ] Show test results inline

2. **Inlay Hints**
   - [ ] Type hints for inferred types
   - [ ] Parameter names in function calls
   - [ ] Implicit return type hints

3. **Semantic Highlighting**
   - [ ] Different colors for different symbol types
   - [ ] Highlight function parameters
   - [ ] Highlight captured variables in lambdas

4. **Document Symbols / Outline**
   - [ ] Show outline of current file
   - [ ] Navigate to functions, classes, etc.
   - [ ] Breadcrumbs support

5. **Find All References**
   - [ ] Find all usages of a symbol
   - [ ] Show references in peek view
   - [ ] Highlight references in editor

6. **Workspace Symbols**
   - [ ] Search for symbols across workspace
   - [ ] Quick navigation to any symbol

#### Tests:
- [ ] Code lens accuracy tests
- [ ] Inlay hints correctness tests
- [ ] Symbol navigation tests

#### Deliverables:
- Code lens provider
- Inlay hints provider
- Document symbol provider
- Reference provider
- Workspace symbol provider

---

## 📋 Phase Priority Matrix

| Phase | Priority | Complexity | Impact | Estimated Time |
|-------|----------|------------|--------|----------------|
| **Phase 1** | 🔴 Critical | 🟢 Low | High | 1 week |
| **Phase 2** | 🔴 Critical | 🟡 Medium | Very High | 2-3 weeks |
| **Phase 3** | 🟡 High | 🟡 Medium | High | 2 weeks |
| **Phase 4** | 🟢 Medium | 🔴 High | Medium | 3-4 weeks |
| **Phase 5** | 🟡 High | 🟡 Medium | Medium | 1-2 weeks |
| **Phase 6** | 🟢 Low | 🟡 Medium | Low | 2-3 weeks |

**Recommended Order:** 1 → 2 → 3 → 5 → 6 → 4

---

## 🛠️ Technical Architecture

### Option A: Standalone Extension (Current)

**Pros:**
- Simple architecture
- No external dependencies
- Fast to implement basic features

**Cons:**
- Limited code intelligence
- Hard to maintain complex features
- No cross-editor support

### Option B: Language Server Protocol (Recommended)

**Pros:**
- Full code intelligence capabilities
- Cross-editor support (VSCode, Vim, Emacs, etc.)
- Better performance (separate process)
- Industry standard approach

**Cons:**
- More complex architecture
- Requires Rust implementation
- Longer development time

### Recommended Approach: Hybrid

1. **Phase 1:** Continue with standalone extension
2. **Phase 2:** Start implementing LSP server in Rust
3. **Phase 3+:** Migrate features to LSP server progressively

---

## 📂 File Structure (Proposed)

```
vscode-extension/
├── src/
│   ├── extension.ts          (Main extension entry)
│   ├── providers/
│   │   ├── completionProvider.ts
│   │   ├── hoverProvider.ts
│   │   ├── definitionProvider.ts
│   │   ├── signatureHelpProvider.ts
│   │   ├── codeActionProvider.ts
│   │   ├── formattingProvider.ts
│   │   └── debugAdapter.ts
│   ├── features/
│   │   ├── diagnostics.ts
│   │   ├── snippets.ts
│   │   ├── commands.ts
│   │   └── testing.ts
│   ├── lsp/
│   │   ├── client.ts
│   │   └── server/ (Rust implementation)
│   └── utils/
│       ├── compiler.ts
│       ├── parser.ts
│       └── config.ts
├── syntaxes/
│   └── liva.tmLanguage.json   (Updated)
├── snippets/
│   └── liva.json              (Enhanced)
├── language-configuration.json (Updated)
├── package.json               (Updated with new features)
└── docs/
    ├── EXTENSION_PLAN.md      (This file)
    ├── PROGRESS.md            (Phase progress tracking)
    └── API_REFERENCE.md       (Extension API docs)
```

---

## 🧪 Testing Strategy

### Unit Tests
- Test each provider independently
- Mock VSCode APIs
- Test utility functions

### Integration Tests
- Test extension activation
- Test command execution
- Test provider integration

### End-to-End Tests
- Real VSCode instance
- Real Liva files
- User workflow scenarios

---

## 📊 Success Metrics

### Phase 1 Success Criteria:
- ✅ All Liva v0.6 keywords highlighted correctly
- ✅ 20+ useful snippets available
- ✅ Auto-indentation works correctly
- ✅ No regressions in existing features

### Phase 2 Success Criteria:
- ✅ Completion suggestions in 90% of contexts
- ✅ Accurate function signatures
- ✅ Hover shows correct type information
- ✅ Go to definition works for all symbol types

### Phase 3 Success Criteria:
- ✅ 5+ quick fixes implemented
- ✅ Document formatting works correctly
- ✅ Rename updates all references

### Overall Success Criteria (v1.0.0):
- ✅ All critical features implemented (Phases 1-3)
- ✅ 95% test coverage
- ✅ < 100ms response time for completions
- ✅ Zero critical bugs
- ✅ Comprehensive documentation
- ✅ Positive user feedback

---

## 🚀 Next Steps

1. **Read and Approve Plan:** Review this document
2. **Start Phase 1:** Enhanced syntax and snippets
3. **Set up Project Board:** Track progress visually
4. **Create PROGRESS.md:** Similar to compiler implementation
5. **Begin Implementation:** One phase at a time

---

## 📚 Resources

### VSCode Extension Development
- [VSCode Extension API](https://code.visualstudio.com/api)
- [Language Server Protocol](https://microsoft.github.io/language-server-protocol/)
- [Debug Adapter Protocol](https://microsoft.github.io/debug-adapter-protocol/)

### Similar Projects
- [Rust Analyzer](https://github.com/rust-lang/rust-analyzer)
- [TypeScript Language Service](https://github.com/microsoft/TypeScript)
- [Python Extension](https://github.com/microsoft/vscode-python)

### Tools
- [yo code](https://github.com/Microsoft/vscode-generator-code) - Extension generator
- [vsce](https://github.com/microsoft/vscode-vsce) - Extension packager
- [ovsx](https://github.com/eclipse/openvsx) - Open VSX registry

---

**Ready to start? Let's begin with Phase 1! 🚀**
