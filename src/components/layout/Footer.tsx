import Link from 'next/link'

export function Footer({ storeEnabled = false }: { storeEnabled?: boolean }) {
    return (
        <footer className="w-full border-t-4 border-white bg-black pt-16 pb-8 px-6 mt-20">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">

                {/* Brand */}
                <div className="md:col-span-2 flex flex-col items-start gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-black"></div>
                        </div>
                        <h3 className="font-mono font-bold text-2xl uppercase tracking-widest">
                            Taller Zero
                        </h3>
                    </div>
                    <p className="text-gray-400 max-w-sm mt-4 font-sans">
                        Un colectivo que combina trabajo, música de calidad y merch exclusivo.
                        Sesiones de electrónica grabadas en espacios de trabajo reales.
                    </p>
                </div>

                {/* Links */}
                <div className="flex flex-col gap-4 font-mono uppercase text-sm">
                    <h4 className="text-gray-500 mb-2">Explorar</h4>
                    <Link href="/sessions" className="hover:text-white transition-colors flex items-center gap-2 group">
                        <span className="w-0 h-[1px] bg-white group-hover:w-4 transition-all duration-300"></span> Sesiones
                    </Link>
                    <Link href="/galeria" className="hover:text-white transition-colors flex items-center gap-2 group">
                        <span className="w-0 h-[1px] bg-white group-hover:w-4 transition-all duration-300"></span> Galería
                    </Link>
                    {storeEnabled && (
                        <Link href="/store" className="hover:text-white transition-colors flex items-center gap-2 group">
                            <span className="w-0 h-[1px] bg-white group-hover:w-4 transition-all duration-300"></span> Tienda
                        </Link>
                    )}
                    <Link href="/about" className="hover:text-white transition-colors flex items-center gap-2 group">
                        <span className="w-0 h-[1px] bg-white group-hover:w-4 transition-all duration-300"></span> About
                    </Link>
                </div>

                {/* Social */}
                <div className="flex flex-col gap-4 font-mono uppercase text-sm">
                    <h4 className="text-gray-500 mb-2">Conectar</h4>
                    <a href="https://instagram.com/tallerzero" target="_blank" rel="noreferrer" className="hover:text-white transition-colors flex items-center gap-2 group">
                        <span className="w-0 h-[1px] bg-white group-hover:w-4 transition-all duration-300"></span> Instagram
                    </a>
                    <a href="https://youtube.com/@tallerzero" target="_blank" rel="noreferrer" className="hover:text-white transition-colors flex items-center gap-2 group">
                        <span className="w-0 h-[1px] bg-white group-hover:w-4 transition-all duration-300"></span> YouTube
                    </a>
                    <a href="https://soundcloud.com/tallerzero" target="_blank" rel="noreferrer" className="hover:text-white transition-colors flex items-center gap-2 group">
                        <span className="w-0 h-[1px] bg-white group-hover:w-4 transition-all duration-300"></span> SoundCloud
                    </a>
                </div>

            </div>

            <div className="max-w-7xl mx-auto border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 font-mono text-xs text-gray-500 uppercase tracking-wider">
                <p>© {new Date().getFullYear()} TALLER ZERO. TODOS LOS DERECHOS RESERVADOS.</p>
                <p>HECHO EN CHILE</p>
            </div>
        </footer>
    )
}
