const fs = require('fs');
const path = 'c:/Users/SPCMSK/Documents/Taller zero WEB/taller-zero-web/src/app/api/admin/save/route.ts';
let content = fs.readFileSync(path, 'utf8');
content = content.replace('featuredItemSubtitle: content.featuredItemSubtitle,', 'featuredItemSubtitle: content.featuredItemSubtitle,\n          storeEnabled: content.storeEnabled,');
content = content.replace("featuredItemSubtitle: content.featuredItemSubtitle || '',", "featuredItemSubtitle: content.featuredItemSubtitle || '',\n          storeEnabled: Boolean(content.storeEnabled),");
fs.writeFileSync(path, content, 'utf8');
