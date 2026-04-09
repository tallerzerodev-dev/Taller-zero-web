export default function Loading() {
    return (
        <main className="flex-1 flex flex-col items-center justify-center bg-black min-h-screen">
            <div className="flex flex-col items-center gap-8">
                {/* Logo pulsante */}
                <div className="w-12 h-12 rounded-full bg-black border-2 border-white relative overflow-hidden flex items-center justify-center animate-pulse">
                    <div className="absolute inset-0 bg-white/20 blur-[2px]"></div>
                    <div className="w-3 h-3 rounded-full bg-white"></div>
                </div>

                {/* Barra de carga brutalista */}
                <div className="w-48 h-[2px] bg-[#222] overflow-hidden">
                    <div className="h-full w-1/3 bg-white animate-[loading-bar_1.2s_ease-in-out_infinite]"></div>
                </div>

                <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-[#555]">
                    CARGANDO...
                </span>
            </div>

            <style>{`
                @keyframes loading-bar {
                    0% { transform: translateX(-100%); }
                    50% { transform: translateX(200%); }
                    100% { transform: translateX(400%); }
                }
            `}</style>
        </main>
    )
}
