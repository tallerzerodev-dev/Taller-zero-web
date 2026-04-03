const fs = require('fs');
const file = 'c:/Users/SPCMSK/Documents/Taller zero WEB/taller-zero-web/src/app/admin/dashboard/editor/page.tsx';
let txt = fs.readFileSync(file, 'utf8');

txt = txt.replace(
  "defaultEditorData.home)",
  "defaultEditorData.home)\n  const [storeEnabled, setStoreEnabled] = useState(content.storeEnabled || false)"
);

txt = txt.replace(
  "setIsDirty(true)\n  }",
  "setIsDirty(true)\n  }\n\n  const handleStoreToggle = () => {\n    setStoreEnabled(!storeEnabled)\n    handleChange('storeEnabled', !storeEnabled)\n  }"
);

txt = txt.replace(
  '<h3 className="text-white border-b border-[#333] pb-2 text-xs">3. TIENDA (DESTACADO)</h3>',
  '<h3 className="text-white border-b border-[#333] pb-2 text-xs flex justify-between items-center">\n                  <span>3. TIENDA (DESTACADO)</span>\n                  <label className="flex items-center cursor-pointer gap-2">\n                    <span className="text-[#555]">Habilitar Tienda en Navegación</span>\n                    <input type="checkbox" checked={storeEnabled || content.storeEnabled} onChange={handleStoreToggle} className="w-4 h-4 bg-black border border-[#333] checked:bg-white checked:border-white focus:ring-0 rounded-none cursor-pointer" />\n                  </label>\n                </h3>'
);

txt = txt.replace(
  "content = data.data;",
  "content = data.data;\n        if (page === 'home') setStoreEnabled(data.data.storeEnabled);"
);

fs.writeFileSync(file, txt);
