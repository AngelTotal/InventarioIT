const fs = require('fs');
const path = 'c:/xampp/htdocs/inventario/app.js';
let content = fs.readFileSync(path, 'utf8');

const reMap = {
    'Ã¡': 'á', 'Ã©': 'é', 'Ã­': 'í', 'Ã³': 'ó', 'Ãº': 'ú',
    'Ã ': 'Á', 'Ã‰': 'É', 'Ã ': 'Í', 'Ã“': 'Ó', 'Ãš': 'Ú',
    'Ã±': 'ñ', 'Ã‘': 'Ñ',
    'Â¿': '¿', 'Â¡': '¡',
    'Ã­': 'í', // Double check different i variants
    'Ã³': 'ó',
    'Ã¼': 'ü',
    'SÃ': 'SÍ',
    'Ã‰xito': 'Éxito',
    'aÃ±adido': 'añadido',
    'Ã¡rea': 'área',
    'Ã rea': 'Área',
    'RELACIÃ“N': 'RELACIÓN',
    'GestiÃ³n': 'Gestión',
    'AdministraciÃ³n': 'Administración',
    'TÃ³ner': 'Tóner',
    'tÃ³ner': 'tóner',
    'bÃºsqueda': 'búsqueda',
    'cÃ³mputo': 'cómputo'
};

for (const [key, val] of Object.entries(reMap)) {
    content = content.split(key).join(val);
}

// Special case for some weirdness like Ã­ (0xAD)
content = content.replace(/\u00C3\u00AD/g, 'í');
content = content.replace(/\u00C3\u00B3/g, 'ó');
content = content.replace(/\u00C3\u00BA/g, 'ú');
content = content.replace(/\u00C3\u00A1/g, 'á');
content = content.replace(/\u00C3\u00A9/g, 'é');

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed more app.js encoding issues.');
