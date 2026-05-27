# 🎨 VS Code Extension Context

> **Proyecto:** vscode-extension - Soporte Liva para VS Code/Cursor  
> **Versión:** 0.17.0  
> **Lenguaje:** TypeScript  
> **Liva compiler:** v2.4.0 (released 2026-05-27)  
> **Última actualización:** 2026-05-27
>
> Features clave v0.15-v0.17: comandos `liva.test`/`liva.bench`/`liva.doc`/`liva.repl`/`liva.testCoverage`; 309 snippets (incluye `describe`, `jtest`, `beforeeach`, `aftereach`, `expect`, `bench`); CodeLens (▶ Run, ▶ Run Test, ▶ Bench); Inlay Hints; Test Explorer (TestController API). LSP server (livac LSP gen-2) expone: completion · hover (cross-file) · signature · definition · implementation · references · document/workspace symbols · document highlight · selection range · folding range · document link · rename (workspace-wide) · code actions (W001/W002/W003/W007 quick fixes) · formatting · diagnostics (errors + linter W001-W008).  

---

## 📦 Qué es este proyecto

**vscode-extension** es la extensión de VS Code que proporciona soporte completo para el lenguaje Liva:

- Syntax highlighting (incluyendo `::` method references, `defer`, `rust {}`)
- 300 snippets (stdlib P0/P1/P2, HTTP Server, DB, Config, Log, defer, etc.)
- Cliente LSP integrado
- Autocompletado
- Go to Definition
- Hover con tipos
- Diagnósticos en tiempo real
- Comandos: compile, run, check, format, lint

---

## 🏗️ Arquitectura

```
src/
├── extension.ts              # Punto de entrada, activación
├── lspClient.ts              # Cliente LSP (vscode-languageclient)
├── compilerInstaller.ts      # Auto-instalación del compilador
└── providers/
    ├── completionProvider.ts     # Autocompletado
    ├── definitionProvider.ts     # Go to Definition + References
    ├── hoverProvider.ts          # Hover information
    ├── signatureHelpProvider.ts  # Firma de funciones
    ├── symbolProvider.ts         # Document symbols
    ├── interfaceValidator.ts     # Validación de interfaces
    └── fallibleValidator.ts      # Validación de funciones fallibles

syntaxes/
└── liva.tmLanguage.json      # Syntax highlighting (TextMate)

snippets/
└── liva.json                 # 300 code snippets
```

---

## 🛠️ Comandos

```bash
# Instalar dependencias
npm install

# Compilar
npm run compile

# Watch mode (desarrollo)
npm run watch

# Empaquetar extensión
npx vsce package

# Instalar extensión local
code --install-extension liva-vscode-0.13.0.vsix
```

---

## 🔌 Integración LSP

La extensión actúa como **cliente LSP** que se comunica con el servidor LSP del compilador (`livac lsp`).

```
VS Code Extension (TypeScript)
        │
        │ JSON-RPC (stdio)
        ▼
    livac lsp (Rust)
```

### Capabilities soportadas:
- `textDocument/completion`
- `textDocument/hover`
- `textDocument/definition`
- `textDocument/references`
- `textDocument/formatting`
- `textDocument/publishDiagnostics`

---

## 📁 Archivos de Configuración

| Archivo | Propósito |
|---------|-----------|
| `package.json` | Manifiesto de la extensión, contributes |
| `language-configuration.json` | Brackets, comments, auto-close |
| `tsconfig.json` | Configuración TypeScript |
| `syntaxes/liva.tmLanguage.json` | Gramática TextMate |
| `snippets/liva.json` | Snippets de código |

---

## 🧪 Testing

1. Abrir el proyecto en VS Code
2. Presionar **F5** para abrir Extension Development Host
3. Abrir un archivo `.liva` y probar las features

---

## 📚 Documentación

| Archivo | Contenido |
|---------|-----------|
| `README.md` | Features y changelog |
| `CHANGELOG.md` | Historial de versiones |
| `docs/` | Documentación adicional |

---

## ⚠️ Notas para Desarrollo

1. **El binario `livac`** debe estar en el PATH o en `bin/` para que el LSP funcione
2. **lspClient.ts** maneja la conexión con el servidor LSP
3. **Los snippets** están en `snippets/liva.json` - 300 patterns (stdlib P0/P1/P2, Server, DB, Config, Log, defer, rust, Map, Set, Regex, Date, CSV, Random, Crypto, Process)
4. Para probar cambios, usar F5 (Extension Development Host)
5. **CLI usa subcomandos**: `livac build`, `run`, `check`, `fmt`, `lint`, `lsp` (NO flags legacy como `--run`)
6. **HTTP calls auto-await**: usar `HTTP.get(url)` sin prefijo `async`
