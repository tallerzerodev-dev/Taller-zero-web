export default function MaintenancePage() {
    return (
        <main className="flex-1 flex flex-col items-center justify-center bg-black min-h-screen px-6">
            <div className="text-center max-w-lg border border-[#333] p-10 bg-[#0a0a0a]">
                <h1 className="text-4xl font-bold uppercase tracking-widest text-white mb-4">Mantenimiento</h1>
                <p className="text-[#888] font-mono text-sm uppercase tracking-widest mb-8">
                    Estamos realizando mejoras en la plataforma para ofrecerte una mejor experiencia. 
                    Volveremos en unos minutos.
                </p>
                <div className="animate-pulse flex space-x-4 justify-center">
                    <div className="h-3 w-3 bg-white rounded-full"></div>
                    <div className="h-3 w-3 bg-white rounded-full"></div>
                    <div className="h-3 w-3 bg-white rounded-full"></div>
                </div>
            </div>
        </main>
    )
}
