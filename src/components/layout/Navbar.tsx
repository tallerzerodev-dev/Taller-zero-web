'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { Menu, X, ShoppingCart } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'

export function Navbar({ storeEnabled = false }: { storeEnabled?: boolean }) {
    const [isOpen, setIsOpen] = useState(false)
    const pathname = usePathname()
    const { data: session } = useSession()

    const isAdminArea = pathname?.startsWith('/admin/dashboard')

    return (
        <nav className="fixed top-0 w-full z-50 border-b-2 border-white bg-black/90 backdrop-blur-sm">
            <div className="w-full px-6 md:px-12 lg:px-20 xl:px-24 h-20 flex items-center justify-between">

                {/* Logo */}
                <Link href="/" className="flex items-center group">
                    <div className="relative w-36 h-12 md:w-48 md:h-16 transition-transform duration-500 group-hover:scale-105">
                        <Image
                            src="/logo_taller_zero.png"
                            alt="Taller Zero Logo"
                            fill
                            className="object-contain object-left scale-150 origin-left"
                            priority
                        />
                    </div>
                </Link>

                {/* Desktop Links */}
                <div className="hidden md:flex items-center gap-8 font-mono text-sm tracking-widest uppercase">
                    <Link href="/sessions" className="hover:text-gray-400 transition-colors">Sesiones</Link>
                    <Link href="/galeria" className="hover:text-gray-400 transition-colors">Galería</Link>
                    {storeEnabled && <Link href="/store" className="hover:text-gray-400 transition-colors">Tienda</Link>}
                    <Link href="/about" className="hover:text-gray-400 transition-colors">About</Link>
                    {storeEnabled && (
                        <Link
                            href="/cart"
                            className="group flex items-center bg-white text-black h-10 w-10 hover:w-[155px] transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] overflow-hidden px-2.5 ml-2"
                        >
                            <ShoppingCart className="w-5 h-5 shrink-0" />
                            <span className="font-bold text-sm tracking-widest whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-500 ml-3 flex gap-2">
                                CARRITO <span>(2)</span>
                            </span>
                        </Link>
                    )}
                    {session ? (
                        <div className="flex items-center gap-4 ml-4">
                            {session.user?.isAdmin && (
                                <Link href="/admin/dashboard" className="border-2 border-[#ff3333] text-[#ff3333] px-4 py-2 hover:bg-[#ff3333] hover:text-white transition-colors">
                                    ADMIN
                                </Link>
                            )}
                            <button onClick={() => signOut({ callbackUrl: '/' })} className="border-2 border-white px-4 py-2 hover:bg-white hover:text-black transition-colors">
                                SALIR
                            </button>
                        </div>
                    ) : (
                        <Link href="/login" className="border-2 border-white px-4 py-2 hover:bg-white hover:text-black transition-colors ml-4">
                            INGRESAR
                        </Link>
                    )}
                </div>

                {/* Mobile Toggle */}
                <button
                    className="md:hidden p-2"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>

            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden border-t-2 border-gray-800 bg-black absolute w-full left-0 top-20 flex flex-col font-mono text-lg uppercase tracking-widest">
                    <Link href="/sessions" onClick={() => setIsOpen(false)} className="p-6 border-b border-gray-800 hover:bg-gray-900">Sesiones</Link>
                    <Link href="/galeria" onClick={() => setIsOpen(false)} className="p-6 border-b border-gray-800 hover:bg-gray-900">Galería</Link>
                    {storeEnabled && <Link href="/store" onClick={() => setIsOpen(false)} className="p-6 border-b border-gray-800 hover:bg-gray-900">Tienda</Link>}
                    <Link href="/about" onClick={() => setIsOpen(false)} className="p-6 border-b border-gray-800 hover:bg-gray-900">About</Link>
                    {storeEnabled && <Link href="/cart" onClick={() => setIsOpen(false)} className="p-6 border-b border-gray-800 hover:bg-gray-900 flex justify-between">Carrito <span className="bg-white text-black px-2 py-0.5 text-xs font-bold">2</span></Link>}
                    {session ? (
                        <>
                            {session.user?.isAdmin && (
                                <Link href="/admin/dashboard" onClick={() => setIsOpen(false)} className="p-6 text-[#ff3333] hover:bg-[#ff3333] hover:text-white transition-colors">PANEL ADMIN</Link>
                            )}
                            <button onClick={() => { setIsOpen(false); signOut({ callbackUrl: '/' }); }} className="p-6 text-gray-400 hover:bg-white hover:text-black transition-colors w-full text-left">CERRAR SESIÓN</button>
                        </>
                    ) : (
                        <Link href="/login" onClick={() => setIsOpen(false)} className="p-6 text-gray-400 hover:bg-white hover:text-black transition-colors">INGRESAR</Link>
                    )}
                </div>
            )}
        </nav>
    )
}


