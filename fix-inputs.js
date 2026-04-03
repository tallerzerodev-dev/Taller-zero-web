const fs = require('fs');
let t = fs.readFileSync('src/app/admin/dashboard/editor/page.tsx', 'utf8');

// Fix: Don't replace existing values with '' if user clicks cancel on file inputs.
t = t.replace(/e\.target\.files\?\.\[0\] \? URL\.createObjectURL\(e\.target\.files\[0\]\) : ''\}/g,
    "e.target.files?.[0] ? URL.createObjectURL(e.target.files[0]) : (content.heroBackground || content.gifUrl || '')}");

// But specifically for artists where it uses handleArtistChange
t = t.replace(
    /onChange=\{\(e\) => handleArtistChange\(index, 'photo', e\.target\.files\?\.\[0\] \? URL\.createObjectURL\(e\.target\.files\[0\]\) : ''\)\}/g,
    "onChange={(e) => { if(e.target.files?.[0]) handleArtistChange(index, 'photo', URL.createObjectURL(e.target.files[0])) }}"
);

// Specifically for gifUrl
t = t.replace(
    /onChange=\{\(e\) => handleChange\('gifUrl', e\.target\.files\?\.\[0\] \? URL\.createObjectURL\(e\.target\.files\[0\]\) : ''\)\}/g,
    "onChange={(e) => { if(e.target.files?.[0]) handleChange('gifUrl', URL.createObjectURL(e.target.files[0])) }}"
);

// Specifically for heroBackground
t = t.replace(
    /onChange=\{\(e\) => handleChange\('heroBackground', e\.target\.files\?\.\[0\] \? URL\.createObjectURL\(e\.target\.files\[0\]\) : ''\)\}/g,
    "onChange={(e) => { if(e.target.files?.[0]) handleChange('heroBackground', URL.createObjectURL(e.target.files[0])) }}"
);

// Add visual indicators
t = t.replace(
    /<label className="text-\[10px\] text-white uppercase tracking-widest block mb-1">Foto Artista<\/label>/g,
    `<label className="text-[10px] text-white uppercase tracking-widest flex justify-between mb-1"><span>Foto Artista</span> {artist.photo && <span className="text-[#4ade80]">✓ CARGADA</span>}</label>`
);

t = t.replace(
    /<label className="text-\[10px\] text-\[#888\] uppercase tracking-widest block mb-2">GIF o Imágen \(Hero\)<\/label>/g,
    `<label className="text-[10px] text-[#888] uppercase tracking-widest flex justify-between mb-2"><span>GIF o Imágen (Hero)</span> {content.gifUrl && <span className="text-[#4ade80]">✓ CARGADA</span>}</label>`
);

fs.writeFileSync('src/app/admin/dashboard/editor/page.tsx', t, 'utf8');
