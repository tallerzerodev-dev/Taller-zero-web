const fs = require('fs');

const files = [
    'src/app/admin/dashboard/editor/page.tsx',
    'src/app/api/admin/save/route.ts',
    'src/app/api/admin/content/route.ts'
];

for (const file of files) {
    let txt = fs.readFileSync(file, 'utf8');

    // Fix common double-encoded UTF-8 from ISO-8859-1 conversions
    txt = txt.replace(/Ã³/g, 'ó');
    txt = txt.replace(/Ã“/g, 'Ó');
    txt = txt.replace(/Ã-/g, 'í'); // In case TÃ-tulo
    txt = txt.replace(/TÃtulo/g, 'Título');
    txt = txt.replace(/Ã©/g, 'é'); // marquÃ©e
    txt = txt.replace(/Ã¡/g, 'á'); // pÃ¡gina
    txt = txt.replace(/Ãn/g, 'ín');
    txt = txt.replace(/ï¿½/g, 'ó'); // 'Previsualizaciï¿½n'

    // En caso de que se rompiera el page.tsx y su parametrización:
    txt = txt.replace(
        "const page = searchParams.get('page') || 'home'",
        "const rawPage = searchParams.get('page') || 'home'\n  const page = ['sesiones', 'sesiÃ³nes', 'sesiónes', 'Sesiónes'].includes(rawPage.toLowerCase()) ? 'Sesiónes' : rawPage"
    );

    fs.writeFileSync(file, txt, 'utf8');
    console.log(`Corregido ${file}`);
}
