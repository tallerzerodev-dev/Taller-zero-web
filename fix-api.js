const fs = require('fs');

function fixContent() {
    const f = 'src/app/api/admin/content/route.ts';
    let t = fs.readFileSync(f, 'utf8');
    // Match any type === 'sesiones' or variations block
    t = t.replace(/if \s*\(type\s*===\s*'sesiones'[^)]*\)\s*\{/g, "if (['sesiones', 'Sesiones', 'sesiónes', 'Sesiónes', 'sesiÃ³nes', 'SesiÃ³nes'].includes(type)) {");
    fs.writeFileSync(f, t, 'utf8');
}

function fixSave() {
    const f = 'src/app/api/admin/save/route.ts';
    let t = fs.readFileSync(f, 'utf8');
    // 3. Guardar Sesión (Nueva o Editada)
    t = t.replace(/if \s*\(page\s*===\s*'sesiones'[^)]*\)\s*\{/g, "if (['sesiones', 'Sesiones', 'sesiónes', 'Sesiónes', 'sesiÃ³nes', 'SesiÃ³nes'].includes(page)) {");
    fs.writeFileSync(f, t, 'utf8');
}

fixContent();
fixSave();
console.log("Fixed API routes.");