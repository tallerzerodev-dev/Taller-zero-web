'use client'

import { useState } from 'react'
import { FadeIn } from '@/components/ui/Animations'
import { useRouter } from 'next/navigation'
import { signIn, signOut, useSession } from 'next-auth/react'

export default function LoginPage() {
    const { data: session, status } = useSession()
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    if (status === 'loading') {
        return (
            <main className="flex-1 flex items-center justify-center bg-black min-h-screen px-6">
                <span className="font-mono text-xs uppercase tracking-widest text-[#888] animate-pulse">CARGANDO SESIÓN...</span>
            </main>
        )
    }

    if (status === 'authenticated') {
        // Redirigir según el rol del usuario conectado
        if (session.user?.isAdmin) {
            router.push('/admin/dashboard/editor')
        } else {
            router.push('/')
        }
    }

    const handleGoogleLogin = () => {
        setLoading(true)
        signIn('google', { callbackUrl: '/' })
    }

    return (
        <main className="flex-1 flex items-center justify-center bg-black min-h-screen px-6 relative overflow-hidden">
            <FadeIn className="w-full max-w-md relative z-10">
                <div className="bg-[#050505] border border-[#333] p-8 md:p-12 relative overflow-hidden group hover:border-white/50 transition-colors duration-500">
                    <div className="mb-12">
                        <span className="text-xs font-mono uppercase tracking-[0.3em] font-bold text-[#555] block mb-2">TALLER ZERO</span>
                        <h1 className="text-4xl text-white font-bold uppercase tracking-tighter">Bienvenido<br />al portal</h1>
                        <p className="text-[#888] font-mono text-[10px] uppercase mt-4 border-l-2 border-[#333] pl-3 py-1">Inicia sesión para usar el carrito de compras y guardar sets.</p>
                    </div>

                    <button
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        className="w-full bg-white text-black font-bold uppercase tracking-widest py-4 text-sm hover:bg-[#ccc] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-mono flex flex-row items-center justify-center gap-3">
                        {loading ? 'CONECTANDO...' : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="18px" height="18px">
                                    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                                    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                                    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                                    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
                                </svg>
                                INICIAR SESIÓN CON GOOGLE
                            </>
                        )}
                    </button>

                    <div className="mt-8 pt-6 border-t border-[#333] text-center">
                        <span className="text-[10px] font-mono text-[#555] uppercase tracking-widest">
                            TU SESIÓN SERÁ GUARDADA DE FORMA SEGURA
                        </span>
                    </div>
                </div>
            </FadeIn>
        </main>
    )
}
