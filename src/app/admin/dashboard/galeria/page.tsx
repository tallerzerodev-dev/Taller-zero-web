'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FadeIn } from '@/components/ui/Animations'
import imageCompression from 'browser-image-compression'

export default function GaleriaAdminPage() {
    const [photos, setPhotos] = useState<any[]>([])
    const [sessions, setSessions] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [uploading, setUploading] = useState(false)
    const [progress, setProgress] = useState({ current: 0, total: 0, failed: 0 })

    // Form
    const [files, setFiles] = useState<File[]>([])
    const [caption, setCaption] = useState('')
    const [sessionId, setSessionId] = useState('')

    useEffect(() => {
        fetchData()
    }, [])

    async function fetchData() {
        setLoading(true)
        const res = await fetch('/api/admin/galeria', { cache: 'no-store' })
        if (res.ok) {
            const data = await res.json()
            setPhotos(data.photos)
            setSessions(data.sessions)
        }
        setLoading(false)
    }

    async function handleUpload(e: React.FormEvent) {
        e.preventDefault()
        if (files.length === 0) return alert('Debes seleccionar al menos una imagen')

        setUploading(true)
        setProgress({ current: 0, total: files.length, failed: 0 })

        let successCount = 0
        let failCount = 0

        for (let i = 0; i < files.length; i++) {
            const file = files[i]
            let retries = 3
            let uploaded = false

            while (retries > 0 && !uploaded) {
                try {
                    // Upload to Cloudinary
                    const formData = new FormData()
                    formData.append('file', file)

                    const uploadRes = await fetch('/api/upload', {
                        method: 'POST',
                        body: formData
                    })

                    if (!uploadRes.ok) {
                        const errData = await uploadRes.json().catch(() => ({}))
                        throw new Error(errData.error || `HTTP error! status: ${uploadRes.status}`)
                    }
                    const uploadData = await uploadRes.json()

                    if (!uploadData.url) throw new Error(`Falló la subida a Cloudinary para ${file.name}`)

                    // Save to DB
                    const dbRes = await fetch('/api/admin/galeria', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            url: uploadData.url,
                            caption,
                            sessionId: sessionId || null
                        })
                    })

                    if (!dbRes.ok) throw new Error(`No se pudo guardar en la BD para ${file.name}`)

                    successCount++
                    uploaded = true
                } catch (error) {
                    console.error(`Intento fallido con foto ${file.name} (quedan ${retries - 1}):`, error)
                    retries--
                    if (retries === 0) {
                        failCount++
                    } else {
                        // Esperar un poco antes de reintentar
                        await new Promise(resolve => setTimeout(resolve, 2000))
                    }
                }
            }

            // Actualizar progreso UI y permitir que el servidor respire para no saturar Cloudinary/Next.js
            setProgress(prev => ({ ...prev, current: i + 1, failed: failCount }))
            await new Promise(resolve => setTimeout(resolve, 800))
        }

        alert(`Proceso finalizado. Subidas exitosas: ${successCount}. Fallidas: ${failCount}`)

        setFiles([])
        setCaption('')
        setSessionId('')
        setProgress({ current: 0, total: 0, failed: 0 })
        const fileInput = document.getElementById('gallery-upload') as HTMLInputElement
        if (fileInput) fileInput.value = ''

        setUploading(false)
        fetchData()
    }

    async function handleDelete(id: string) {
        if (!confirm('¿Seguro quieres eliminar esta foto?')) return

        const res = await fetch(`/api/admin/galeria?id=${id}`, {
            method: 'DELETE'
        })
        if (res.ok) fetchData()
    }

    return (
        <main className="flex-1 flex flex-col bg-black min-h-screen px-6 py-24">
            <div className="w-full max-w-7xl mx-auto">
                <FadeIn>
                    <div className="border-b border-[#333] pb-8 mb-12 flex justify-between items-end">
                        <div>
                            <Link href="/admin/dashboard" className="text-[#888] hover:text-white font-mono text-xs uppercase tracking-widest mb-4  flex items-center gap-2">
                                ← VOLVER AL PANEL
                            </Link>
                            <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-tighter text-white">
                                GESTIÓN DE GALERÍA
                            </h1>
                        </div>
                    </div>
                </FadeIn>

                <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-12">
                    {/* UPLOAD FORM */}
                    <div className="bg-[#0a0a0a] border border-[#222] p-6 h-fit sticky top-24">
                        <h2 className="text-white font-bold uppercase tracking-widest mb-6">SUBIR FOTO</h2>
                        <form onSubmit={handleUpload} className="space-y-4">
                            <div>
                                <label className="block text-[#888] font-mono text-[10px] uppercase tracking-widest mb-2">
                                    Archivo/s Imagen/GIF {files.length > 0 && `(${files.length} seleccionados)`}
                                </label>
                                <input
                                    id="gallery-upload"
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={async e => {
                                        if (e.target.files && e.target.files.length > 0) {
                                            setUploading(true);
                                            const fileArray = Array.from(e.target.files);
                                            const processedFiles = [];
                                            
                                            for (let i = 0; i < fileArray.length; i++) {
                                                const f = fileArray[i];
                                                setProgress({ current: i + 1, total: fileArray.length, failed: 0 }); // Usamos progress temporalmente para indicar compresión
                                                if (f.type.startsWith('image/') && f.size > 8 * 1024 * 1024) {
                                                    try {
                                                        const options = { maxSizeMB: 8, maxWidthOrHeight: 3000, useWebWorker: true };
                                                        const compressed = await imageCompression(f, options);
                                                        processedFiles.push(compressed);
                                                    } catch (err) {
                                                        console.error('Error comprimiendo:', err);
                                                        processedFiles.push(f);
                                                    }
                                                } else {
                                                    processedFiles.push(f);
                                                }
                                            }

                                            const oversized = processedFiles.filter(f => f.size > 10485760);
                                            if (oversized.length > 0) {
                                                alert(`❌ ${oversized.length} archivo(s) pesan más de 10 MB incluso después de intentar comprimirlos, por lo que serán ignorados. (Ej: ${oversized[0].name})`);
                                            }
                                            
                                            const validFiles = processedFiles.filter(f => f.size <= 10485760);
                                            setFiles(prev => [...prev, ...validFiles]);
                                            
                                            setUploading(false);
                                            setProgress({ current: 0, total: 0, failed: 0 });

                                            if (validFiles.length === 0) e.target.value = '';
                                        }
                                    }}
                                    className="w-full bg-black border border-[#333] p-2 text-white text-xs file:mr-4 file:bg-white file:text-black file:border-0 file:px-4 file:py-2 file:text-xs file:font-mono file:uppercase file:cursor-pointer hover:file:bg-[#ccc]"
                                />
                            </div>

                            <div>
                                <label className="block text-[#888] font-mono text-[10px] uppercase tracking-widest mb-2">Asignar a Sesión (Opcional)</label>
                                <select
                                    value={sessionId}
                                    onChange={e => setSessionId(e.target.value)}
                                    className="w-full bg-black border border-[#333] p-3 text-white text-xs focus:outline-none focus:border-white"
                                >
                                    <option value="">-- Ninguna --</option>
                                    {sessions.map(s => (
                                        <option key={s.id} value={s.id}>{s.title}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-[#888] font-mono text-[10px] uppercase tracking-widest mb-2">Pie de Foto (Opcional)</label>
                                <input
                                    type="text"
                                    value={caption}
                                    onChange={e => setCaption(e.target.value)}
                                    placeholder="Ej: B2B Especial..."
                                    className="w-full bg-black border border-[#333] p-3 text-white text-xs focus:outline-none focus:border-white"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={uploading}
                                className="w-full bg-white text-black font-bold uppercase tracking-widest py-3 text-sm hover:bg-[#ccc] transition-colors disabled:opacity-50 relative overflow-hidden"
                            >
                                {uploading
                                    ? `SUBIENDO... ${progress.current}/${progress.total} ${progress.failed > 0 ? `(${progress.failed} errors)` : ''}`
                                    : 'SUBIR FOTO AL MOSAICO'}
                                {uploading && (
                                    <div
                                        className="absolute bottom-0 left-0 h-1 bg-green-500 transition-all duration-300"
                                        style={{ width: `${(progress.current / progress.total) * 100}%` }}
                                    />
                                )}
                            </button>
                        </form>
                    </div>

                    {/* FOTOS Y GALERIA */}
                    <div>
                        {loading ? (
                            <p className="text-[#888] font-mono text-sm uppercase tracking-widest">Cargando...</p>
                        ) : photos.length === 0 ? (
                            <div className="border border-[#333] p-12 text-center">
                                <p className="text-[#555] font-mono text-sm uppercase tracking-widest">No hay fotos en la galería.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                                {photos.map(photo => (
                                    <div key={photo.id} className="border border-[#333] bg-[#0a0a0a] group relative overflow-hidden aspect-[4/5]">
                                        <img
                                            src={photo.url}
                                            alt={photo.caption || 'Foto'}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col justify-between p-4 transition-opacity">
                                            <button
                                                onClick={() => handleDelete(photo.id)}
                                                className="self-end bg-red-600 text-white font-bold font-mono text-[10px] px-2 py-1 tracking-widest hover:bg-red-700"
                                            >
                                                ELIMINAR
                                            </button>

                                            <div className="font-mono">
                                                {photo.session && (
                                                    <span className="block text-[8px] border border-white/50 text-white/80 px-1 mb-1">{photo.session.title}</span>
                                                )}
                                                {photo.caption && (
                                                    <span className="block text-xs text-white">{photo.caption}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    )
}