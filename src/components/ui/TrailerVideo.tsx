'use client'

import { useRef, useState } from 'react'

export function TrailerVideo({ src }: { src: string }) {
    const videoRef = useRef<HTMLVideoElement>(null)
    const [isMuted, setIsMuted] = useState(true)

    const toggleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !videoRef.current.muted
            setIsMuted(videoRef.current.muted)
        }
    }

    const handleEnded = () => {
        if (videoRef.current) {
            // Cuando termine, volvemos al primer frame y lo dejamos pausado como portada
            videoRef.current.currentTime = 0
            videoRef.current.pause()
        }
    }

    return (
        <div className="absolute inset-0 w-full h-full group">
            <video
                ref={videoRef}
                src={src}
                autoPlay
                muted
                playsInline
                onEnded={handleEnded}
                className="w-full h-full object-cover transition-all duration-1000"
            />

            {/* Custom Mute Toggle Button */}
            <button
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleMute();
                }}
                className="absolute bottom-4 right-4 z-10 w-10 h-10 rounded-full bg-black/70 border border-[#333] hover:border-white text-white flex items-center justify-center backdrop-blur-sm transition-colors duration-300"
                title={isMuted ? "Activar Sonido" : "Silenciar"}
            >
                {isMuted ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
                        <line x1="2" y1="2" x2="22" y2="22" stroke="white" strokeWidth="2" />
                        <path d="M11 5L6 9H2v6h4l5 4zM22 9l-6 6M16 9l6 6" />
                    </svg>
                ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                        <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                        <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
                    </svg>
                )}
            </button>
        </div>
    )
}
