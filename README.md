# 🌳 Generador de Árboles Sintácticos

Una aplicación web interactiva que visualiza la estructura sintáctica del código Python mediante árboles jerárquicos.

![Ejemplo de árbol sintáctico](docs/demo.png)

## ✨ Características

- Análisis sintáctico de código Python en tiempo real
- Visualización interactiva de árboles AST (Abstract Syntax Tree)
- Interfaz de usuario intuitiva y responsiva
- Zoom y navegación del árbol mediante gestos
- Control de profundidad del árbol
- Capacidad para expandir/colapsar nodos
- Exportación del árbol en formato SVG

## 🚀 Tecnologías Utilizadas

- **[Pyodide](https://pyodide.org/)**: Compilación de Python para WebAssembly
- **[D3.js](https://d3js.org/)**: Visualización de datos y manipulación del DOM
- **HTML5/CSS3**: Maquetación y estilos modernos
- **JavaScript**: Lógica de la aplicación y manipulación del AST

## 🛠️ Uso

1. Abre `index.html` en tu navegador web
2. Escribe o pega tu código Python en el área de texto
3. Ajusta la profundidad máxima del árbol si lo deseas
4. Haz clic en "Generar Árbol"
5. Interactúa con el árbol:
   - **Arrastrar**: Mueve el árbol
   - **Rueda del mouse**: Zoom in/out
   - **Clic en nodos**: Expande/colapsa subárboles
   - **Botones de zoom**: Controla el nivel de acercamiento
   - **Descargar**: Guarda el árbol como imagen SVG

## 🎯 Ejemplos de Uso

```python
# Ejemplo básico
x = 3 + 5
print(x)
```

Este código generará un árbol que muestra la estructura de:
- Asignación de variable
- Operación aritmética
- Llamada a función

## 💻 Desarrollo Local

1. Clona el repositorio:
```bash
git clone https://github.com/tu-usuario/generador-arboles-sintacticos.git
```

2. No se requiere instalación adicional, ya que el proyecto utiliza CDNs para sus dependencias.

3. Abre `index.html` en tu navegador preferido.

## 📝 Limitaciones

- El análisis está limitado a código Python
- La profundidad máxima del árbol está limitada para mantener la legibilidad
- Requiere conexión a internet para cargar Pyodide y D3.js

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Haz fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 👥 Autor

Brayan Chan - [@Brayan-chan](https://github.com/Brayan-chan)
