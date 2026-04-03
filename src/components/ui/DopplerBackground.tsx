'use client'

export function DopplerBackground() {
    return (
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden opacity-[0.25] mix-blend-screen bg-black">
            {/* Doppler Rings de-centered and skewed for a distorted sound wave effect */}
            <div
                className="absolute inset-[0%] w-[150%] h-[150%] -left-[25%] -top-[25%]"
                style={{
                    backgroundImage: `
                        radial-gradient(circle at 60% 50%, transparent 5%, rgba(255,255,255,1) 5.5%, transparent 6%),
                        radial-gradient(circle at 58% 50%, transparent 12%, rgba(255,255,255,0.7) 12.5%, transparent 13%),
                        radial-gradient(circle at 55% 50%, transparent 20%, rgba(255,255,255,0.5) 20.5%, transparent 21%),
                        radial-gradient(circle at 51% 50%, transparent 29%, rgba(255,255,255,0.4) 29.5%, transparent 30%),
                        radial-gradient(circle at 45% 50%, transparent 39%, rgba(255,255,255,0.3) 39.5%, transparent 40%),
                        radial-gradient(circle at 38% 50%, transparent 50%, rgba(255,255,255,0.2) 50.5%, transparent 51%),
                        radial-gradient(circle at 29% 50%, transparent 62%, rgba(255,255,255,0.15) 62.5%, transparent 63%),
                        radial-gradient(circle at 18% 50%, transparent 75%, rgba(255,255,255,0.1) 75.5%, transparent 76%),
                        radial-gradient(circle at 5% 50%, transparent 89%, rgba(255,255,255,0.05) 89.5%, transparent 90%)
                    `,
                    transform: 'skewX(-15deg) skewY(-5deg) scaleY(0.8)',
                    filter: 'blur(1px)' // Suaviza un poco las líneas como si fuera un eco
                }}
            />

            {/* Estática / Ruido Blanco Brutalista industrial encima de las ondas */}
            <div
                className="absolute inset-0 opacity-[0.08]"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
                }}
            />

            {/* Degradados negros sobre las ondas para que se fundan con el fondo y la págiana y no sean cortes abruptos */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,black_90%)] z-10" />
            <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black z-10" />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black z-10" />
        </div>
    )
}