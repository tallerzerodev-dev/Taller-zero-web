export default function Loading() {
    return (
        <main className="flex-1 flex flex-col items-center justify-center bg-black min-h-screen relative overflow-hidden">
            <div className="flex flex-col items-center gap-16 z-10">
                {/* Rubik's Cube 3D Animation */}
                <div className="scene">
                    <div className="cube-wrapper">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((id) => (
                            <div key={id} className={`mini-cube mc${id}`}>
                                <div className="face face-front"></div>
                                <div className="face face-back"></div>
                                <div className="face face-right"></div>
                                <div className="face face-left"></div>
                                <div className="face face-top"></div>
                                <div className="face face-bottom"></div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col items-center gap-4">
                    {/* Barra de carga brutalista */}
                    <div className="w-48 h-[1px] bg-[#222] overflow-hidden relative">
                        <div className="absolute top-0 left-0 h-full w-1/3 bg-white animate-[loading-bar_1.5s_ease-in-out_infinite]"></div>
                    </div>

                    <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-[#555] animate-pulse">
                        ENSAMBLANDO DATOS...
                    </span>
                </div>
            </div>

            {/* Grid background subtil */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>

            <style>{`
                .scene {
                    width: 60px;
                    height: 60px;
                    perspective: 1000px;
                    margin-bottom: 20px;
                }

                .cube-wrapper {
                    width: 100%;
                    height: 100%;
                    position: relative;
                    transform-style: preserve-3d;
                    animation: rotate-wrapper 8s infinite linear;
                }

                @keyframes rotate-wrapper {
                    0% { transform: rotateX(-20deg) rotateY(0deg); }
                    100% { transform: rotateX(-20deg) rotateY(360deg); }
                }

                .mini-cube {
                    position: absolute;
                    width: 30px;
                    height: 30px;
                    transform-style: preserve-3d;
                }

                .mc1 { animation: a1 2s cubic-bezier(0.2, 0.8, 0.2, 1) infinite alternate; }
                .mc2 { animation: a2 2s cubic-bezier(0.2, 0.8, 0.2, 1) infinite alternate; }
                .mc3 { animation: a3 2s cubic-bezier(0.2, 0.8, 0.2, 1) infinite alternate; }
                .mc4 { animation: a4 2s cubic-bezier(0.2, 0.8, 0.2, 1) infinite alternate; }
                .mc5 { animation: a5 2s cubic-bezier(0.2, 0.8, 0.2, 1) infinite alternate; }
                .mc6 { animation: a6 2s cubic-bezier(0.2, 0.8, 0.2, 1) infinite alternate; }
                .mc7 { animation: a7 2s cubic-bezier(0.2, 0.8, 0.2, 1) infinite alternate; }
                .mc8 { animation: a8 2s cubic-bezier(0.2, 0.8, 0.2, 1) infinite alternate; }

                @keyframes a1 {
                    0%, 15% { transform: translate3d(-40px, -40px, 55px) scale(0.1) rotateX(90deg) rotateY(90deg); opacity: 0; }
                    85%, 100% { transform: translate3d(0px, 0px, 15px) scale(1) rotateX(0deg) rotateY(0deg); opacity: 1; }
                }
                @keyframes a2 {
                    0%, 15% { transform: translate3d(70px, -40px, 55px) scale(0.1) rotateX(90deg) rotateY(90deg); opacity: 0; }
                    85%, 100% { transform: translate3d(30px, 0px, 15px) scale(1) rotateX(0deg) rotateY(0deg); opacity: 1; }
                }
                @keyframes a3 {
                    0%, 15% { transform: translate3d(-40px, 70px, 55px) scale(0.1) rotateX(90deg) rotateY(90deg); opacity: 0; }
                    85%, 100% { transform: translate3d(0px, 30px, 15px) scale(1) rotateX(0deg) rotateY(0deg); opacity: 1; }
                }
                @keyframes a4 {
                    0%, 15% { transform: translate3d(70px, 70px, 55px) scale(0.1) rotateX(90deg) rotateY(90deg); opacity: 0; }
                    85%, 100% { transform: translate3d(30px, 30px, 15px) scale(1) rotateX(0deg) rotateY(0deg); opacity: 1; }
                }
                @keyframes a5 {
                    0%, 15% { transform: translate3d(-40px, -40px, -55px) scale(0.1) rotateX(90deg) rotateY(90deg); opacity: 0; }
                    85%, 100% { transform: translate3d(0px, 0px, -15px) scale(1) rotateX(0deg) rotateY(0deg); opacity: 1; }
                }
                @keyframes a6 {
                    0%, 15% { transform: translate3d(70px, -40px, -55px) scale(0.1) rotateX(90deg) rotateY(90deg); opacity: 0; }
                    85%, 100% { transform: translate3d(30px, 0px, -15px) scale(1) rotateX(0deg) rotateY(0deg); opacity: 1; }
                }
                @keyframes a7 {
                    0%, 15% { transform: translate3d(-40px, 70px, -55px) scale(0.1) rotateX(90deg) rotateY(90deg); opacity: 0; }
                    85%, 100% { transform: translate3d(0px, 30px, -15px) scale(1) rotateX(0deg) rotateY(0deg); opacity: 1; }
                }
                @keyframes a8 {
                    0%, 15% { transform: translate3d(70px, 70px, -55px) scale(0.1) rotateX(90deg) rotateY(90deg); opacity: 0; }
                    85%, 100% { transform: translate3d(30px, 30px, -15px) scale(1) rotateX(0deg) rotateY(0deg); opacity: 1; }
                }

                .face {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    border: 1px solid rgba(255, 255, 255, 0.8);
                    background: rgba(0, 0, 0, 0.4);
                }

                .face-front  { transform: translateZ(15px); }
                .face-back   { transform: rotateY(180deg) translateZ(15px); }
                .face-right  { transform: rotateY(90deg) translateZ(15px); }
                .face-left   { transform: rotateY(-90deg) translateZ(15px); }
                .face-top    { transform: rotateX(90deg) translateZ(15px); }
                .face-bottom { transform: rotateX(-90deg) translateZ(15px); }

                @keyframes loading-bar {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(300%); }
                }
            `}</style>
        </main>
    );
}
