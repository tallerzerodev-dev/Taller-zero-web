export function Ticker({ text }: { text: string }) {
    return (
        <div className="w-full relative overflow-hidden bg-white text-black border-y-2 border-black py-3 flex">
            <div className="animate-marquee whitespace-nowrap flex will-change-transform">
                <span className="text-xl md:text-2xl font-mono uppercase tracking-[0.2em] font-bold mx-4">
                    {text} &nbsp; • &nbsp; {text} &nbsp; • &nbsp; {text} &nbsp; • &nbsp; {text} &nbsp; • &nbsp; {text} &nbsp; • &nbsp; {text} &nbsp; • &nbsp;
                </span>
                <span className="text-xl md:text-2xl font-mono uppercase tracking-[0.2em] font-bold mx-4">
                    {text} &nbsp; • &nbsp; {text} &nbsp; • &nbsp; {text} &nbsp; • &nbsp; {text} &nbsp; • &nbsp; {text} &nbsp; • &nbsp; {text} &nbsp; • &nbsp;
                </span>
            </div>
        </div>
    )
}
