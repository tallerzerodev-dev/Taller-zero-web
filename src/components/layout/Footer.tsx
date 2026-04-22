import Link from 'next/link'
import Image from 'next/image'
import { NewsletterForm } from '@/components/ui/NewsletterForm'

export function Footer({ storeEnabled = false }: { storeEnabled?: boolean }) {  
    return (
        <footer className="w-full border-t-4 border-white bg-black pt-16 pb-8 px-6 mt-20">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-12 mb-16">

                {/* Brand */}
                <div className="md:col-span-2 flex flex-col items-start gap-4"> 
                    <Link href="/" className="relative w-48 h-16 md:w-64 md:h-20 mb-2 group block">
                        <Image
                            src="/logo_taller_zero.png"
                            alt="Taller Zero Logo"
                            fill
                            className="object-contain object-left scale-[1.7] origin-left transition-transform duration-500 group-hover:scale-[1.8]"
                            unoptimized
                        />
                    </Link>
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
                    <a href="https://www.instagram.com/tallerzro/?hl=es" target="_blank" rel="noreferrer" className="hover:text-white transition-colors flex items-center gap-2 group">
                        <span className="w-0 h-[1px] bg-white group-hover:w-4 transition-all duration-300"></span> Instagram
                    </a>
                    <a href="https://www.youtube.com/@Taller_zero" target="_blank" rel="noreferrer" className="hover:text-white transition-colors flex items-center gap-2 group">
                        <span className="w-0 h-[1px] bg-white group-hover:w-4 transition-all duration-300"></span> YouTube
                    </a>
                    <a href="https://soundcloud.com/taller-0?utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing" target="_blank" rel="noreferrer" className="hover:text-white transition-colors flex items-center gap-2 group">
                        <span className="w-0 h-[1px] bg-white group-hover:w-4 transition-all duration-300"></span> SoundCloud
                    </a>
                </div>

                {/* Newsletter */}
                <div className="md:col-span-1">
                    <NewsletterForm />
                </div>

            </div>

            <div className="max-w-7xl mx-auto border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 font-mono text-xs text-gray-500 uppercase tracking-wider">
                <div className="flex gap-4">
                    <Link href="/terms" className="hover:text-white transition-colors">Términos y Condiciones</Link>
                    <span>|</span>
                    <Link href="/privacy" className="hover:text-white transition-colors">Privacidad</Link>
                </div>
                <p>© {new Date().getFullYear()} TALLER ZERO. TODOS LOS DERECHOS RESERVADOS.</p>
                <p>HECHO EN CHILE</p>
            </div>
        </footer>
    )
}
