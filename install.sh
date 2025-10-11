#!/bin/bash

echo "🧩 Instalando extensión Liva para VS Code/Cursor..."
echo ""

# Compilar la extensión
echo "→ Compilando extensión..."
npm run compile

if [ $? -ne 0 ]; then
    echo "❌ Error al compilar la extensión"
    exit 1
fi

# Empaquetar la extensión
echo "→ Empaquetando extensión..."
npx vsce package

if [ $? -ne 0 ]; then
    echo "❌ Error al empaquetar la extensión"
    exit 1
fi

# Encontrar el archivo .vsix generado
VSIX_FILE=$(ls *.vsix | head -n 1)

if [ -z "$VSIX_FILE" ]; then
    echo "❌ No se encontró el archivo .vsix generado"
    exit 1
fi

echo "✓ Extensión empaquetada: $VSIX_FILE"
echo ""
echo "📦 Instalando extensión en VS Code/Cursor..."
echo ""

# Función para instalar la extensión
install_extension() {
    local vsix_file="$1"

    # Intentar diferentes comandos para instalar la extensión
    if command -v code >/dev/null 2>&1; then
        echo "→ Instalando con 'code'..."
        code --install-extension "$vsix_file"
        return $?
    elif command -v cursor >/dev/null 2>&1; then
        echo "→ Instalando con 'cursor'..."
        cursor --install-extension "$vsix_file"
        return $?
    else
        echo "❌ No se encontró VS Code ni Cursor en el PATH"
        return 1
    fi
}

# Instalar la extensión
if install_extension "$VSIX_FILE"; then
    echo "✅ Extensión instalada correctamente!"
    echo ""
    echo "🎉 ¡Ya puedes usar Liva en VS Code/Cursor!"
    echo ""
    echo "💡 Consejos para empezar:"
    echo "   - Abre un archivo .liva"
    echo "   - Usa Ctrl+Shift+P y busca 'Liva:' para ver comandos disponibles"
    echo "   - Configura el compilador en las opciones de VS Code"
    echo ""
else
    echo "❌ Error al instalar la extensión automáticamente"
    echo ""
    echo "🔧 Instalación manual:"
    echo "   1. Abre VS Code o Cursor"
    echo "   2. Ve a Extensiones (Ctrl+Shift+X)"
    echo "   3. Haz clic en '...' > 'Install from VSIX'"
    echo "   4. Selecciona el archivo: $(pwd)/$VSIX_FILE"
    echo ""
    echo "📁 Ubicación del archivo: $(pwd)/$VSIX_FILE"
    echo ""
    echo "💡 También puedes instalarlo desde VS Code Marketplace cuando esté disponible"
    echo ""
    exit 1
fi
