const fs = require('fs');
const file = 'c:/Users/SPCMSK/Documents/Taller zero WEB/taller-zero-web/src/app/page.tsx';
let txt = fs.readFileSync(file, 'utf8');
txt = txt.replace('{/* THE STORE / BRAND FEATURE */}\n            <section className="px-6 md:px-12 lg:px-20 xl:px-24 py-24 w-full border-b border-[#333]">', '{/* THE STORE / BRAND FEATURE */}\n            {homeData?.storeEnabled && (\n            <section className="px-6 md:px-12 lg:px-20 xl:px-24 py-24 w-full border-b border-[#333]">');
txt = txt.replace('VER CATÁLOGO COMPLETO\n                    </Link>\n                </div>\n            </section>', 'VER CATÁLOGO COMPLETO\n                    </Link>\n                </div>\n            </section>\n            )}');
fs.writeFileSync(file, txt);
