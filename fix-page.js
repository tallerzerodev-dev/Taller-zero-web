const fs = require('fs');
let t = fs.readFileSync('src/app/admin/dashboard/editor/page.tsx', 'utf8');
t = t.replace("URL.createObjectURL(e.target.files[0]) : '')} />", "{ if (e.target.files?.[0]) handleArtistChange(index, 'photo', URL.createObjectURL(e.target.files[0])) }} />\n                        {artist.photo && <div className=\"text-[10px] font-mono text-[#4ade80] mt-1\">? Imagen cargada en Sistema</div>}");
fs.writeFileSync('src/app/admin/dashboard/editor/page.tsx', t, 'utf8');
