const fs = require('fs');
let c = fs.readFileSync('src/app/sessions/page.tsx', 'utf8');

const regex = /\{\/\*\s*IMAGEN DESTACADA\s*\*\/\}\s*<div className="w-full aspect-\[4\/3\] bg-black overflow-hidden relative mb-6">[\s\S]*?(?=\{\/\*\s*INFORMAC)/;

const repl = `{/* IMAGEN DESTACADA */}
                    <div className="w-full aspect-[4/3] bg-black overflow-hidden relative mb-6">
                        {(() => {
                           const bgUrl = session.gifUrl || '/placeholder.jpg';
                           const isVideo = bgUrl.toLowerCase().endsWith('.mp4') || bgUrl.toLowerCase().endsWith('.webm') || bgUrl.toLowerCase().endsWith('.mov');
                           return isVideo ? (
                             <video src={bgUrl} autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover grayscale mix-blend-luminosity group-hover:scale-105 transition-transform duration-1000 z-0" />
                           ) : (
                             <div className="absolute inset-0 bg-cover bg-center grayscale mix-blend-luminosity group-hover:scale-105 transition-transform duration-1000 z-0"
                               style={{ backgroundImage: \`url(\\\${bgUrl})\` }}></div>
                           );
                        })()}
                        <div className="absolute bottom-4 right-4 z-10 w-10 h-10 rounded-full border border-white/50 flex items-center justify-center bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                        </div>
                      </div>

                    `;

c = c.replace(regex, repl);
fs.writeFileSync('src/app/sessions/page.tsx', c);
console.log('Fixed');