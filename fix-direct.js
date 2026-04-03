const fs = require('fs');
let text = fs.readFileSync('src/app/admin/dashboard/editor/page.tsx', 'utf8');

const badCode1 = "<input type=\"file\" accept=\"image/*,video/*\" className=\"w-full bg-black border border-[#333] p-2 text-white text-xs file:mr-4 file:bg-white file:text-black file:border-0 file:px-4 file:py-2 file:text-xs file:font-mono file:uppercase file:cursor-pointer hover:file:bg-[#ccc]\" onChange={(e) => handleChange('gifUrl', e.target.files?.[0] ? { if (e.target.files?.[0]) handleArtistChange(index, 'photo', URL.createObjectURL(e.target.files[0])) }} />";

const goodCode1 = "<input type=\"file\" accept=\"image/*,video/*\" className=\"w-full bg-black border border-[#333] p-2 text-white text-xs file:mr-4 file:bg-white file:text-black file:border-0 file:px-4 file:py-2 file:text-xs file:font-mono file:uppercase file:cursor-pointer hover:file:bg-[#ccc]\" onChange={(e) => { if(e.target.files?.[0]) handleChange('gifUrl', URL.createObjectURL(e.target.files[0])) }} />";

const badCode2 = "{artist.photo && <div className=\"text-[10px] font-mono text-[#4ade80] mt-1\">? Imagen cargada en Sistema</div>}";
const goodCode2 = "{content.gifUrl && <div className=\"text-[10px] font-mono text-[#4ade80] mt-1\">? GIF Cargado</div>}";

const parts1 = text.split(badCode1);
if(parts1.length > 1) {
  text = parts1.join(goodCode1);
  console.log("Replaced input successfully");
} else {
  console.log("Could not find input exactly");
}

const parts2 = text.split(badCode2);
if(parts2.length > 1) {
  text = parts2.join(goodCode2);
  console.log("Replaced div successfully");
} else {
  console.log("Could not find div exactly");
  // Try another replacement pattern
  text = text.replace(/\{artist\.photo && <div className="text-\[10px\] font-mono text-\[#4ade80\] mt-1">.*\? Imagen cargada en Sistema<\/div>\}/, goodCode2);
}

fs.writeFileSync('src/app/admin/dashboard/editor/page.tsx', text, 'utf8');

