const fs = require('fs');
const path = 'src/app/admin/dashboard/editor/page.tsx';
let txt = fs.readFileSync(path, 'utf8');

// Replace the onChange handler to keep existing photo if file is cancelled, instead of overriding with ''
const oldInput = \<input type="file" accept="image/*" className="w-full bg-black border border-[#333] p-1 text-white text-[10px] mb-1 file:mr-2 file:bg-white file:text-black file:border-0 file:px-2 file:py-1 file:text-[10px] file:font-mono file:uppercase file:cursor-pointer hover:file:bg-[#ccc]" onChange={(e) => handleArtistChange(index, 'photo', e.target.files?.[0] ? URL.createObjectURL(e.target.files[0]) : '')} />\;
const newInput = \<input type="file" accept="image/*" className="w-full bg-black border border-[#333] p-1 text-white text-[10px] mb-1 file:mr-2 file:bg-white file:text-black file:border-0 file:px-2 file:py-1 file:text-[10px] file:font-mono file:uppercase file:cursor-pointer hover:file:bg-[#ccc]" onChange={(e) => { if (e.target.files?.[0]) handleArtistChange(index, 'photo', URL.createObjectURL(e.target.files[0])) }} />\n                        {artist.photo && <div className="text-[10px] font-mono text-[#4ade80] flex justify-between"><span>? Archivo cargado</span></div>}\;

txt = txt.replace(oldInput, newInput);
fs.writeFileSync(path, txt, 'utf8');
console.log('Fixed artist photo replacement');
