export default function SessionsLoading() {
    return (
        <main className="flex-1 flex flex-col bg-black min-h-screen pt-32 pb-24">
            <section className="px-6 w-full max-w-[1400px] mx-auto mb-16">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#333] pb-8">
                    <div>
                        <div className="h-16 w-64 bg-[#111] animate-pulse"></div>
                        <div className="h-4 w-48 bg-[#111] animate-pulse mt-4"></div>
                    </div>
                    <div className="space-y-2">
                        <div className="h-3 w-32 bg-[#111] animate-pulse"></div>
                        <div className="h-3 w-24 bg-[#111] animate-pulse"></div>
                    </div>
                </div>
            </section>

            <section className="px-6 w-full max-w-[1400px] mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="border border-[#222] bg-[#0a0a0a] p-1 pb-6">
                            <div className="flex justify-between p-3">
                                <div className="h-5 w-12 bg-[#111] animate-pulse"></div>
                                <div className="h-5 w-20 bg-[#111] animate-pulse"></div>
                            </div>
                            <div className="w-full aspect-[4/3] bg-[#111] animate-pulse mb-6"></div>
                            <div className="px-4 space-y-3">
                                <div className="h-8 w-3/4 bg-[#111] animate-pulse"></div>
                                <div className="h-3 w-full bg-[#111] animate-pulse border-t border-[#222] pt-3"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </main>
    )
}
