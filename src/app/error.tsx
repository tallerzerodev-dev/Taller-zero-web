'use client'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    return (
        <main className="flex-1 flex flex-col items-center justify-center bg-black min-h-screen px-6">
            <div className="max-w-xl w-full text-center flex flex-col items-center gap-8">
                <div className="border-4 border-white px-6 py-2">
                    <span className="font-mono text-xs uppercase tracking-[0.4em] text-white font-bold">ERROR DEL SISTEMA</span>
                </div>

                <h1 className="text-5xl md:text-7xl font-bold uppercase tracking-tighter text-white leading-none">
                    ALGO SALIÓ<br />MAL
                </h1>

                <p className="font-mono text-sm text-[#888] uppercase tracking-widest max-w-md">
                    Se produjo un error inesperado. Puedes intentar recargar la sección.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 mt-4">
                    <button
                        onClick={() => reset()}
                        className="brutalist-button"
                    >
                        REINTENTAR
                    </button>
                    <a
                        href="/"
                        className="font-mono text-xs uppercase tracking-widest text-[#888] hover:text-white border border-[#333] px-6 py-3 hover:border-white transition-colors text-center"
                    >
                        VOLVER AL INICIO
                    </a>
                </div>

                {process.env.NODE_ENV === 'development' && (
                    <div className="mt-8 border border-[#333] bg-[#0a0a0a] p-6 w-full text-left">
                        <span className="font-mono text-[10px] text-[#555] uppercase tracking-widest block mb-2">DEBUG //</span>
                        <pre className="font-mono text-xs text-[#ff3333] whitespace-pre-wrap break-words">
                            {error.message}
                        </pre>
                    </div>
                )}
            </div>
        </main>
    )
}
