# 🎨 VS Code Extension Context

> **Proyecto:** vscode-extension - Soporte Liva para VS Code/Cursor  
> **Versión:** 0.13.0  
> **Lenguaje:** TypeScript  

---

## 📦 Qué es este proyecto

**vscode-extension** es la extensión de VS Code que proporciona soporte completo para el lenguaje Liva:

- Syntax highlighting (incluyendo `::` method references)
- Snippets (70+, incluyendo point-free y `::` variants)
- Cliente LSP integrado
- Autocompletado
- Go to Definition
- Hover con tipos
- Diagnósticos en tiempo real

---

## 🏗️ Arquitectura

```
src/
├── extension.ts              # Punto de entrada, activación
├── lspClient.ts              # Cliente LSP (vscode-languageclient)
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
└── liva.json                 # 70+ code snippets
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

La extensión actúa como **cliente LSP** que se comunica con el servidor LSP del compilador (`livac --lsp`).

```
VS Code Extension (TypeScript)
        │
        │ JSON-RPC (stdio)
        ▼
    livac --lsp (Rust)
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
3. **Los snippets** están en `snippets/liva.json` - 70+ patterns
4. Para probar cambios, usar F5 (Extension Development Host)
