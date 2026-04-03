const fs = require('fs');
let text = fs.readFileSync('src/app/api/admin/content/route.ts', 'utf8');
text = text.replace(/if \(\['sesiones', 'Sesiones'.*\.includes\(type\)\) \{/, "if (type && ['sesiones', 'Sesiones', 'sesi髇es', 'Sesi髇es', 'sesi贸nes', 'Sesi贸nes'].includes(type)) {");
let save = fs.readFileSync('src/app/api/admin/save/route.ts', 'utf8');
save = save.replace(/if \(\['sesiones', 'Sesiones'.*\.includes\(page\)\) \{/, "if (page && ['sesiones', 'Sesiones', 'sesi髇es', 'Sesi髇es', 'sesi贸nes', 'Sesi贸nes'].includes(page)) {");
fs.writeFileSync('src/app/api/admin/content/route.ts', text, 'utf8');
fs.writeFileSync('src/app/api/admin/save/route.ts', save, 'utf8');
