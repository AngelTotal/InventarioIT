const fs = require('fs');
const path = 'c:/xampp/htdocs/inventario/app.js';
let content = fs.readFileSync(path, 'utf8');
// Strip anything that looks like BOM or double-encoded BOM
content = content.replace(/^[\uFEFF\u00EF\u00BB\u00BF\u00C3\u00AF\u00C2\u00BB\u00C2\u00BF]+/, '');
// Fix common mis-encoded characters
const reMap = {
    'Ã‰xito': 'Éxito',
    'aÃ±adido': 'añadido',
    'bÃºsqueda': 'búsqueda',
    'PerifÃ©rico': 'Periférico',
    'cÃ³mputo': 'cómputo',
    'AdministraciÃ³n': 'Administración',
    'GestiÃ³n': 'Gestión',
    'TÃ³ner': 'Tóner',
    'atenciÃ³n': 'atención',
    'RevisiÃ³n': 'Revisión',
    'dÃ­a': 'día', // Note: one I previously missed was the 0xAD dot-less i maybe?
    'AÃ±adir': 'Añadir',
    'AÃ±adida': 'Añadida',
    'tÃ³ner': 'tóner',
    'perifÃ©ricos': 'periféricos',
    'configuraciÃ³n': 'configuración',
    'Ã¡': 'á',
    'Ã©': 'é',
    'Ã­': 'í',
    'Ã³': 'ó',
    'Ãº': 'ú',
    'Ã±': 'ñ',
    'Â¿': '¿'
};
for (const [key, val] of Object.entries(reMap)) {
    content = content.split(key).join(val);
}
fs.writeFileSync(path, content, 'utf8');
console.log('Fixed app.js encoding and BOM.');
