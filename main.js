// Global variables
let pyodide = null;
let astData = null;
let svg = null;
let g = null;
let zoom = null;

// Initialize Pyodide
async function initPyodide() {
    if (pyodide) return pyodide;
    try {
        pyodide = await loadPyodide();
        console.log('Pyodide loaded successfully');
        return pyodide;
    } catch (error) {
        console.error('Error loading Pyodide:', error);
        showError('Error al cargar el entorno Python');
        return null;
    }
}

// Generate AST from Python code
async function generateAST(code) {
    if (!pyodide) await initPyodide();
    if (!pyodide) return null;

    try {
        pyodide.globals.set('user_code', code);
        const maxDepth = parseInt(document.getElementById('maxDepth').value) || 5;
        pyodide.globals.set('max_depth', maxDepth);

        const pythonCode = `
import ast
import json

def ast_to_dict(node, depth=0, max_depth=100):
    if depth > max_depth:
        return {'_type': '...', '_truncated': True}

    if isinstance(node, ast.AST):
        result = {'_type': node.__class__.__name__}
        for field, value in ast.iter_fields(node):
            if isinstance(value, list):
                result[field] = [ast_to_dict(item, depth + 1, max_depth) for item in value]
            else:
                result[field] = ast_to_dict(value, depth + 1, max_depth)
        return result
    else:
        return {'_value': repr(node), '_primitive': True}

try:
    tree = ast.parse(user_code)
    result = ast_to_dict(tree, max_depth=max_depth)
    output = json.dumps(result)
except SyntaxError as e:
    output = json.dumps({'error': f'Error de sintaxis en línea {e.lineno}: {e.msg}'})
except Exception as e:
    output = json.dumps({'error': str(e)})

output
`;

        const result = await pyodide.runPythonAsync(pythonCode);
        return result ? JSON.parse(result) : null;
    } catch (error) {
        console.error('Error:', error);
        return { error: error.message };
    }
}

// Convert AST to hierarchy
function astToHierarchy(node, name = 'Module') {
    if (!node) return { name: 'null', children: [] };

    if (node._value !== undefined) {
        return { name: node._value, isValue: true, children: [] };
    }

    if (node._truncated) {
        return { name: '...', children: [] };
    }

    const nodeName = node._type || 'Unknown';
    const children = [];

    for (const [key, value] of Object.entries(node)) {
        if (key.startsWith('_')) continue;

        if (Array.isArray(value)) {
            value.forEach((item, idx) => {
                const child = astToHierarchy(item, `${key}`);
                if (child) children.push(child);
            });
        } else if (value && typeof value === 'object') {
            const child = astToHierarchy(value, key);
            if (child) {
                child.fieldName = key;
                children.push(child);
            }
        }
    }

    return { name: nodeName, children: children };
}

// Draw tree with D3
function drawTree(data) {
    d3.select('#treeContainer').selectAll('svg').remove();
    document.getElementById('emptyState').style.display = 'none';

    const container = document.getElementById('treeContainer');
    const width = container.clientWidth;
    const height = container.clientHeight;

    // <CHANGE> Mejorar el espaciado vertical y horizontal para un layout jerárquico más limpio
    const svg = d3.select('#treeContainer')
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .style('background', 'white');

    const g = svg.append('g');

    // Create hierarchy and tree layout
    const hierarchy = d3.hierarchy(data);
    const treeLayout = d3.tree()
        .size([width - 100, height - 100])
        .separation((a, b) => {
            // <CHANGE> Mayor separación entre nodos hermanos para mejor legibilidad
            return (a.parent === b.parent ? 1.5 : 2) / (a.depth || 1);
        });

    treeLayout(hierarchy);

    // Draw links
    g.selectAll('.link')
        .data(hierarchy.links())
        .enter()
        .append('path')
        .attr('class', 'link')
        .attr('d', d3.linkVertical()
            .x(d => d.x)
            .y(d => d.y));

    // Draw nodes
    const nodes = g.selectAll('.node')
        .data(hierarchy.descendants())
        .enter()
        .append('g')
        .attr('class', 'node')
        .attr('transform', d => `translate(${d.x},${d.y})`);

    // <CHANGE> Nodos circulares con colores tierra/dorado
    nodes.append('circle')
        .attr('class', 'node-circle')
        .attr('r', 18)
        .attr('fill', '#d4af37')
        .attr('stroke', '#9d6b3a')
        .attr('stroke-width', 2)
        .on('click', (event, d) => {
            if (d.children || d._children) {
                toggleNode(d);
                updateTreeDisplay();
            }
        });

    // <CHANGE> Texto más grande y legible dentro de los nodos
    nodes.append('text')
        .attr('class', 'node-text')
        .attr('dy', '0.35em')
        .attr('text-anchor', 'middle')
        .style('font-size', '13px')
        .style('font-weight', 'bold')
        .style('fill', '#2c3e50')
        .text(d => {
            let label = d.data.name;
            return label.length > 12 ? label.substring(0, 10) + '...' : label;
        });

    // Zoom behavior
    zoom = d3.zoom()
        .scaleExtent([0.5, 3])
        .on('zoom', event => {
            g.attr('transform', event.transform);
        });

    svg.call(zoom);

    // Center tree
    const bounds = g.node().getBBox();
    const scale = 0.9 / Math.max(bounds.width / width, bounds.height / height);
    const translate = [width / 2 - (bounds.x + bounds.width / 2) * scale, 40];
    svg.call(zoom.transform, d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale));
}

function toggleNode(d) {
    if (d.children) {
        d._children = d.children;
        d.children = null;
    } else {
        d.children = d._children;
        d._children = null;
    }
}

function updateTreeDisplay() {
    if (astData) {
        const hierarchy = astToHierarchy(astData);
        drawTree(hierarchy);
    }
}

// Utility functions
function showError(message) {
    const container = document.getElementById('errorContainer');
    document.getElementById('errorMessage').textContent = message;
    container.classList.add('show');
}

function hideError() {
    document.getElementById('errorContainer').classList.remove('show');
}

// Event listeners
document.getElementById('generateBtn').addEventListener('click', async () => {
    const code = document.getElementById('codeInput').value.trim();
    if (!code) {
        showError('Por favor, ingresa código Python');
        return;
    }

    hideError();
    document.getElementById('generateBtn').disabled = true;

    const ast = await generateAST(code);
    document.getElementById('generateBtn').disabled = false;

    if (ast && ast.error) {
        showError(ast.error);
    } else if (ast) {
        astData = ast;
        const hierarchy = astToHierarchy(ast);
        drawTree(hierarchy);
    }
});

document.getElementById('clearBtn').addEventListener('click', () => {
    document.getElementById('codeInput').value = '';
    d3.select('#treeContainer').selectAll('svg').remove();
    document.getElementById('emptyState').style.display = 'flex';
    hideError();
    astData = null;
});

document.getElementById('exampleBtn').addEventListener('click', () => {
    document.getElementById('codeInput').value = 'x = 3 + 5\nprint(x)';
});

document.getElementById('zoomIn').addEventListener('click', () => {
    d3.select('#treeContainer svg').transition().call(zoom.scaleBy, 1.3);
});

document.getElementById('zoomOut').addEventListener('click', () => {
    d3.select('#treeContainer svg').transition().call(zoom.scaleBy, 0.7);
});

document.getElementById('zoomReset').addEventListener('click', () => {
    d3.select('#treeContainer svg').transition().call(zoom.transform, d3.zoomIdentity);
});

document.getElementById('downloadBtn').addEventListener('click', () => {
    const svgElement = d3.select('#treeContainer svg').node();
    if (!svgElement) {
        showError('Primero genera un árbol');
        return;
    }

    const serializer = new XMLSerializer();
    let source = serializer.serializeToString(svgElement);
    source = '<?xml version="1.0" standalone="no"?>\r\n' + source;

    const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'arbol-sintactico.svg';
    link.click();
});

// Initialize
window.addEventListener('load', () => {
    initPyodide();
    document.getElementById('exampleBtn').click();
});