const fs = require('fs');
const file = 'c:/Users/SPCMSK/Documents/Taller zero WEB/taller-zero-web/prisma/schema.prisma';
let txt = fs.readFileSync(file, 'utf8');

txt = txt.replace('url       String  caption   String?  // Ej: B2B Especial...  date      DateTime @default(now()) // Fecha personalizada, sino hereda la de la sesión', 'url       String\n  caption   String?\n  date      DateTime @default(now()) // Fecha personalizada, sino hereda la de la sesión');

fs.writeFileSync(file, txt);
