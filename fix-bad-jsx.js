const fs = require('fs');
let content = fs.readFileSync('src/app/admin/dashboard/editor/page.tsx', 'utf8');

const regex = /<input type="file" accept="image\/\*,video\/\*" className="w-full bg-black border border-\[#333\] p-2 text-white text-xs file:mr-4 file:bg-white file:text-black file:border-0 file:px-4 file:py-2 file:text-xs file:font-mono file:uppercase file:cursor-pointer hover:file:bg-\[#ccc\]" onChange=\{\(e\) => handleChange\('gifUrl', e\.target\.files\?\.\[0\] \? \{ if \(e\.target\.files\?\.\[0\]\) handleArtistChange\(index, 'photo', URL\.createObjectURL\(e\.target\.files\[0\]\)\) \}\} \/>[\s\S]*?Sistema<\/div>\}/;

const fix = \<input type="file" accept="image/*,video/*" className="w-full bg-black border border-[#333] p-2 text-white text-xs file:mr-4 file:bg-white file:text-black file:border-0 file:px-4 file:py-2 file:text-xs file:font-mono file:uppercase file:cursor-pointer hover:file:bg-[#ccc]" onChange={(e) => { if (e.target.files?.[0]) handleChange('gifUrl', URL.createObjectURL(e.target.files[0])) }} />
                        {content.gifUrl && <div className="text-[10px] font-mono text-[#4ade80] mt-1">✓ Imagen cargada en Sistema</div>}\;

content = content.replace(regex, fix);

fs.writeFileSync('src/app/admin/dashboard/editor/page.tsx', content, 'utf8');
