import Link from 'next/link'

export default function NotFound() {
    return (
        <main className="flex-1 flex flex-col items-center justify-center bg-black min-h-screen px-6 relative overflow-hidden">
            {/* Líneas decorativas de fondo */}
            <div className="absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#222] to-transparent"></div>
            <div className="absolute top-0 left-1/2 w-[1px] h-full bg-gradient-to-b from-transparent via-[#222] to-transparent"></div>

            <div className="max-w-2xl w-full text-center flex flex-col items-center gap-6 z-10">
                <span className="font-mono text-xs uppercase tracking-[0.4em] font-bold bg-white text-black px-3 py-1 inline-block">
                    TRANSMISIÓN INTERRUMPIDA
                </span>

                <h1 className="text-[20vw] sm:text-[15vw] md:text-[12rem] font-bold uppercase tracking-tighter text-white leading-none mix-blend-difference select-none">
                    404
                </h1>

                <p className="font-mono text-sm text-[#888] uppercase tracking-widest max-w-md">
                    La frecuencia solicitada no existe en nuestro archivo.
                    Puede que haya sido eliminada o que nunca haya existido.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 mt-8">
                    <Link href="/" className="brutalist-button">
                        VOLVER AL INICIO
                    </Link>
                    <Link
                        href="/sessions"
                        className="font-mono text-xs uppercase tracking-widest text-[#888] hover:text-white border border-[#333] px-6 py-3 hover:border-white transition-colors text-center"
                    >
                        EXPLORAR SESIONES
                    </Link>
                </div>

                <div className="mt-12 font-mono text-[10px] text-[#333] uppercase tracking-widest">
                    TALLER ZERO // SIGNAL LOST
                </div>
            </div>
        </main>
    )
}
