'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { FadeIn, StaggerContainer } from '@/components/ui/Animations'
import { X, Mail, Phone, MapPin, ChevronLeft, ChevronRight } from 'lucide-react'

const InstagramIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
    </svg>
)

interface Oficio {
    id: string
    name: string
    coverImage: string | null
    bio: string | null
    images: string[]
    instagram: string | null
    email: string | null
    phone: string | null
    address: string | null
}

export default function OficiosGallery({ oficios }: { oficios: Oficio[] }) {
    const [selectedOficio, setSelectedOficio] = useState<Oficio | null>(null)
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

    const nextImage = (e: React.MouseEvent) => {
        e.stopPropagation()
        if (selectedOficio && lightboxIndex !== null) {
            setLightboxIndex((lightboxIndex + 1) % selectedOficio.images.length)
        }
    }

    const prevImage = (e: React.MouseEvent) => {
        e.stopPropagation()
        if (selectedOficio && lightboxIndex !== null) {
            setLightboxIndex((lightboxIndex - 1 + selectedOficio.images.length) % selectedOficio.images.length)
        }
    }

    return (
        <>
            {/* GRID DE OFICIOS */}
            {oficios.length === 0 ? (
                <div className="py-32 text-center border border-[#333] bg-[#0a0a0a]">
                    <span className="font-mono text-sm text-[#555] uppercase tracking-widest">
                        AÚN NO HAY COLABORADORES REGISTRADOS.
                    </span>
                </div>
            ) : (
                <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {oficios.map((oficio) => (
                        <FadeIn key={oficio.id}>
                            <motion.div
                                layoutId={`card-${oficio.id}`}
                                className="group relative aspect-[4/5] cursor-pointer overflow-hidden border border-[#222] bg-transparent hover:border-[#666] transition-colors duration-500"
                                onClick={() => setSelectedOficio(oficio)}
                            >
                                {oficio.coverImage ? (
                                    <motion.div layoutId={`image-${oficio.id}`} className="absolute inset-0">
                                        <Image
                                            src={oficio.coverImage}
                                            alt={oficio.name}
                                            fill
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                            className="object-contain group-hover:scale-105 transition-transform duration-700"
                                        />
                                    </motion.div>
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="font-mono text-[#333] text-xs uppercase tracking-widest">Sin foto</span>
                                    </div>
                                )}
                                
                                {/* Overlay Gradient & Title */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-500" />
                                <div className="absolute bottom-0 left-0 p-6 w-full">
                                    <motion.h3 layoutId={`title-${oficio.id}`} className="text-xl font-bold uppercase tracking-widest text-white">
                                        {oficio.name}
                                    </motion.h3>
                                </div>
                            </motion.div>
                        </FadeIn>
                    ))}
                </StaggerContainer>
            )}

            {/* MODAL */}
            <AnimatePresence>
                {selectedOficio && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedOficio(null)}
                            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[100]"
                        />
                        <div className="fixed inset-0 pointer-events-none z-[101] flex items-center justify-center p-4 sm:p-6 lg:p-12">
                            <motion.div
                                layoutId={`card-${selectedOficio.id}`}
                                className="bg-[#0a0a0a] border border-[#333] w-full max-w-5xl max-h-[90vh] overflow-y-auto pointer-events-auto relative shadow-[0_0_50px_rgba(0,0,0,0.8)]"
                            >
                                <button
                                    onClick={() => setSelectedOficio(null)}
                                    className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black text-white p-2 border border-white/20 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>

                                <div className="flex flex-col md:flex-row min-h-[60vh]">
                                    {/* Modal Left: Cover Image */}
                                    <div className="w-full md:w-1/2 relative bg-[#0a0a0a] min-h-[300px] md:min-h-0">
                                        {selectedOficio.coverImage ? (
                                            <motion.div layoutId={`image-${selectedOficio.id}`} className="absolute inset-0">
                                                <Image
                                                    src={selectedOficio.coverImage}
                                                    alt={selectedOficio.name}
                                                    fill
                                                    sizes="(max-width: 768px) 100vw, 50vw"
                                                    className="object-contain group-hover:scale-105 transition-transform duration-700"
                                                />
                                            </motion.div>
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <span className="font-mono text-[#333] text-xs uppercase tracking-widest">Sin foto</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Modal Right: Content */}
                                    <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-start overflow-y-auto">
                                        <span className="font-mono text-[10px] text-[#666] uppercase tracking-[0.3em] font-bold mb-4 inline-block">{`/// `}RED TALLER ZERO</span>
                                        <motion.h3 layoutId={`title-${selectedOficio.id}`} className="text-3xl md:text-4xl font-bold uppercase tracking-widest text-white mb-8 border-b border-[#333] pb-6">
                                            {selectedOficio.name}
                                        </motion.h3>
                                        
                                        <div className="font-sans text-base md:text-lg text-[#aaa] font-light leading-relaxed whitespace-pre-wrap mb-8">
                                            {selectedOficio.bio || 'Sin biografía disponible.'}
                                        </div>

                                        {/* Contacto & Redes */}
                                        {(selectedOficio.instagram || selectedOficio.email || selectedOficio.phone || selectedOficio.address) && (
                                            <div className="flex flex-col gap-3 mb-8 text-[#aaa] font-mono text-sm">
                                                {selectedOficio.address && (
                                                    <div className="flex items-center gap-3">
                                                        <MapPin className="w-4 h-4 text-[#666]" />
                                                        <span>{selectedOficio.address}</span>
                                                    </div>
                                                )}
                                                {selectedOficio.phone && (
                                                    <a href={`https://wa.me/56${selectedOficio.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-white transition-colors">
                                                        <Phone className="w-4 h-4 text-[#666]" />
                                                        <span>+56 {selectedOficio.phone}</span>
                                                    </a>
                                                )}
                                                {selectedOficio.email && (
                                                    <a href={`mailto:${selectedOficio.email}`} className="flex items-center gap-3 hover:text-white transition-colors">
                                                        <Mail className="w-4 h-4 text-[#666]" />
                                                        <span>{selectedOficio.email}</span>
                                                    </a>
                                                )}
                                                {selectedOficio.instagram && (
                                                    <a href={selectedOficio.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-white transition-colors">
                                                        <InstagramIcon className="w-4 h-4 text-[#666]" />
                                                        <span className="truncate">Instagram</span>
                                                    </a>
                                                )}
                                            </div>
                                        )}

                                        {/* Mini-Galería de actuaciones */}
                                        {selectedOficio.images && selectedOficio.images.length > 0 && (
                                            <div className="mt-auto pt-6 border-t border-[#222]">
                                                <span className="font-mono text-[10px] text-[#555] uppercase tracking-[0.3em] font-bold mb-4 block">EN TALLER ZERO</span>
                                                <div className="grid grid-cols-3 gap-2">
                                                    {selectedOficio.images.map((img, idx) => (
                                                        <div 
                                                            key={idx} 
                                                            className="relative aspect-square bg-[#111] border border-[#222] overflow-hidden cursor-pointer group"
                                                            onClick={() => setLightboxIndex(idx)}
                                                        >
                                                            <Image
                                                                src={img}
                                                                alt={`${selectedOficio.name} en Taller Zero ${idx + 1}`}
                                                                fill
                                                                sizes="(max-width: 768px) 33vw, 20vw"
                                                                className="object-cover group-hover:scale-110 transition-transform duration-500"
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </>
                )}
            </AnimatePresence>

            {/* LIGHTBOX para ampliar fotos de la mini-galería */}
            <AnimatePresence>
                {lightboxIndex !== null && selectedOficio && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setLightboxIndex(null)}
                        className="fixed inset-0 bg-black/95 z-[200] flex items-center justify-center p-6 cursor-pointer"
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="relative w-full h-full max-w-[85vw] max-h-[85vh] group"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setLightboxIndex(null)}
                                className="absolute -top-4 -right-4 z-10 bg-black/50 hover:bg-black text-white p-2 border border-white/20 transition-colors rounded-full backdrop-blur-md"
                            >
                                <X className="w-6 h-6" />
                            </button>

                            {selectedOficio.images.length > 1 && (
                                <>
                                    <button
                                        onClick={prevImage}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black text-white p-3 border border-white/20 transition-colors rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100"
                                    >
                                        <ChevronLeft className="w-8 h-8" />
                                    </button>
                                    <button
                                        onClick={nextImage}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black text-white p-3 border border-white/20 transition-colors rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100"
                                    >
                                        <ChevronRight className="w-8 h-8" />
                                    </button>
                                </>
                            )}

                            <Image
                                src={selectedOficio.images[lightboxIndex]}
                                alt={`Foto ampliada ${lightboxIndex + 1}`}
                                fill
                                sizes="100vw"
                                className="object-contain"
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
