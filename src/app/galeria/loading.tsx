export default function GaleriaLoading() {
    return (
        <main className="flex-1 flex flex-col bg-black min-h-screen pt-24 pb-20 px-6 md:px-12 lg:px-20 xl:px-24">
            <div className="max-w-[1600px] w-full mx-auto">
                <header className="mb-12 border-b border-[#333] pb-12">
                    <div className="h-4 w-28 bg-[#111] animate-pulse mb-4"></div>
                    <div className="h-20 w-72 bg-[#111] animate-pulse mb-8"></div>
                    <div className="flex flex-wrap gap-4 mt-8">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-9 w-24 bg-[#111] animate-pulse border border-[#222]"></div>
                        ))}
                    </div>
                </header>

                <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
                    {[300, 400, 250, 350, 280, 320, 380, 260].map((h, i) => (
                        <div key={i} className="break-inside-avoid mb-6 border border-[#222]">
                            <div className="bg-[#111] animate-pulse" style={{ height: h }}></div>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    )
}
