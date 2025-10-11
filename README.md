# Liva Language Support for VS Code & Cursor

Esta extensión proporciona soporte completo para el lenguaje de programación **Liva** en Visual Studio Code y Cursor.

## Características

### ✅ Implementadas

- **Resaltado de sintaxis** completo para archivos `.liva`
- **Snippets** para construcciones comunes del lenguaje
- **Configuración del compilador** con opciones personalizables
- **Comandos de compilación y ejecución** integrados
- **Compilación automática** al guardar (opcional)
- **Soporte de comentarios** (línea y bloque)
- **Auto-cierre de paréntesis** y sangría automática

### 🚧 En desarrollo

- **Diagnósticos de errores** del compilador en tiempo real
- **Formateo automático** de código Liva
- **Autocompletado inteligente** basado en el contexto

## Instalación

### Desde VS Code Marketplace (próximamente)

1. Abre VS Code
2. Ve a la pestaña de Extensiones (Ctrl+Shift+X)
3. Busca "Liva Language Support"
4. Haz clic en "Instalar"

### Desde código fuente

```bash
# Clona el repositorio
git clone https://github.com/liva-lang/liva-vscode.git
cd liva-vscode

# Instala dependencias
npm install

# Compila la extensión
npm run compile

# Empaqueta la extensión (opcional)
vsce package

# Instala desde VSIX (opcional)
code --install-extension liva-vscode-0.0.1.vsix
```

## Uso

### Comandos disponibles

- **Liva: Compile File** - Compila el archivo actual
- **Liva: Run Program** - Compila y ejecuta el programa
- **Liva: Check Syntax** - Verifica la sintaxis sin compilar

### Atajos de teclado

Los comandos pueden ejecutarse desde:
- La paleta de comandos (Ctrl+Shift+P)
- El menú contextual del explorador de archivos (click derecho en `.liva`)
- El menú contextual del editor

### Configuración

Puedes personalizar el comportamiento de la extensión en la configuración de VS Code:

```json
{
    "liva.compiler.path": "livac",
    "liva.compiler.outputDirectory": "./target/liva_build",
    "liva.compiler.autoBuild": true
}
```

### Opciones de configuración

- `liva.compiler.path`: Ruta al ejecutable del compilador Liva (por defecto: `livac`)
- `liva.compiler.outputDirectory`: Directorio de salida para los binarios compilados
- `liva.compiler.autoBuild`: Compilar automáticamente al guardar archivos

## Snippets

La extensión incluye snippets para las construcciones más comunes de Liva:

- `fn` - Declaración de función
- `fn1` - Función de una línea
- `let` - Variable mutable
- `const` - Constante
- `if` / `ife` - Condicionales
- `while` / `for` - Bucles
- `switch` - Sentencias switch
- `async` / `parallel` / `task` - Concurrencia
- `try` - Manejo de errores
- `class` - Declaración de clases
- `import` / `use` - Módulos
- `test` - Funciones de prueba

## Requisitos

- **Visual Studio Code** 1.80.0 o superior
- **Compilador Liva** (`livac`) instalado y en el PATH
- **Node.js** y **npm** para desarrollo

## Desarrollo

### Prerrequisitos

```bash
npm install -g typescript @vscode/vsce
```

### Construir

```bash
npm run compile
```

### Probar

```bash
npm run test
```

### Empaquetar

```bash
vsce package
```

## Arquitectura del lenguaje Liva

Liva es un lenguaje moderno que compila a Rust con características como:

- **Tipado fuerte** con inferencia automática
- **Concurrencia híbrida** (async/parallel/task/fire)
- **Sintaxis clara** inspirada en TypeScript y Python
- **Seguridad de memoria** heredada de Rust
- **Encapsulación** con niveles de visibilidad (`_` y `__`)
- **Interoperabilidad total** con Rust y sus crates

## Contribuir

¡Las contribuciones son bienvenidas! Puedes ayudar con:

1. **Mejoras en el resaltado de sintaxis**
2. **Nuevos snippets y autocompletado**
3. **Diagnósticos de errores más avanzados**
4. **Formateo automático**
5. **Soporte para nuevas características del lenguaje**

## Licencia

MIT License - ver el archivo LICENSE para más detalles.

## Soporte

Para problemas, sugerencias o preguntas:

- Crea un issue en el repositorio de GitHub
- Contacta al autor: [Fran Nadal](https://github.com/liva-lang)

---

**¡Disfruta programando en Liva! 🚀**
