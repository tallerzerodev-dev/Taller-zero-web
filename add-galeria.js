const fs = require('fs');
const file = 'c:/Users/SPCMSK/Documents/Taller zero WEB/taller-zero-web/src/app/admin/dashboard/page.tsx';
let txt = fs.readFileSync(file, 'utf8');

const newLink =             <Link href="/admin/dashboard/galeria" className="block">
                <FadeIn className="bg-[#0a0a0a] border border-[#222222] p-8 hover:border-white transition-colors group cursor-pointer flex flex-col h-full">
                    <h2 className="text-2xl font-bold uppercase tracking-widest mb-4 group-hover:translate-x-2 transition-transform text-white">Editar Galería</h2>
                    <p className="text-[#888888] font-mono text-sm leading-relaxed mb-6 flex-1">Sube fotos, asigna sesiones y organiza el mosaico visual.</p>
                    <span className="text-white font-mono text-xs uppercase tracking-widest border-b border-white pb-1 w-fit">Gestor ?</span>
                </FadeIn>
            </Link>

        </StaggerContainer>;

txt = txt.replace('        </StaggerContainer>\n\n      </div>', newLink + '\n\n      </div>');
fs.writeFileSync(file, txt);
