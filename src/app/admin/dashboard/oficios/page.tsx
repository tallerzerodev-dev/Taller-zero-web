'use client'

import { useState, useEffect } from 'react'
import { FadeIn } from '@/components/ui/Animations'
import Image from 'next/image'

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

export default function OficiosAdminPage() {
    const [oficios, setOficios] = useState<Oficio[]>([])
    const [loading, setLoading] = useState(true)
    const [editing, setEditing] = useState<Oficio | null>(null)

    // Form States
    const [name, setName] = useState('')
    const [bio, setBio] = useState('')
    const [coverImage, setCoverImage] = useState('')
    const [images, setImages] = useState<string[]>([])
    
    // Social & Contact
    const [instagram, setInstagram] = useState('')
    const [email, setEmail] = useState('')
    const [phone, setPhone] = useState('')
    const [address, setAddress] = useState('')

    const fetchOficios = async () => {
        try {
            const res = await fetch('/api/admin/oficios')
            const data = await res.json()
            setOficios(data)
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchOficios()
    }, [])

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const tempUrl = URL.createObjectURL(file)
            setCoverImage(tempUrl)
        }
    }

    const handleGalleryImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || [])
        const newImages = files.map(file => URL.createObjectURL(file))
        setImages(prev => [...prev, ...newImages])
    }

    const removeGalleryImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index))
    }

    // Comprimir imagen en el navegador antes de subirla (evita el límite de 4.5MB de Vercel)
    const compressImage = (blobUrl: string, maxWidth = 2000, quality = 0.8): Promise<Blob> => {
        return new Promise((resolve, reject) => {
            const img = document.createElement('img')
            img.onload = () => {
                const canvas = document.createElement('canvas')
                let w = img.width
                let h = img.height
                if (w > maxWidth) {
                    h = Math.round((h * maxWidth) / w)
                    w = maxWidth
                }
                canvas.width = w
                canvas.height = h
                const ctx = canvas.getContext('2d')
                if (!ctx) return reject(new Error('No canvas context'))
                ctx.drawImage(img, 0, 0, w, h)
                canvas.toBlob(
                    (blob) => blob ? resolve(blob) : reject(new Error('Compression failed')),
                    'image/jpeg',
                    quality
                )
            }
            img.onerror = reject
            img.src = blobUrl
        })
    }

    const uploadIfBlob = async (url: string) => {
        if (!url || !url.startsWith('blob:')) return url
        const compressed = await compressImage(url)
        const formData = new FormData()
        formData.append('file', compressed, 'taller-zero-oficio.jpg')

        const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData })
        if (!uploadRes.ok) {
            const textResponse = await uploadRes.text()
            throw new Error(`Upload failed (${uploadRes.status}): ${textResponse.slice(0, 50)}`)
        }
        const data = await uploadRes.json()
        if (data.url) return data.url
        throw new Error('Upload error: no url returned')
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const finalImage = await uploadIfBlob(coverImage)
            
            // Subir de manera secuencial en lugar de Promise.all para evitar saturar el servidor local
            const finalGallery: string[] = []
            for (let i = 0; i < images.length; i++) {
                const uploadedUrl = await uploadIfBlob(images[i])
                finalGallery.push(uploadedUrl)
            }
            
            const payload = {
                id: editing?.id,
                name,
                bio,
                coverImage: finalImage,
                images: finalGallery,
                instagram,
                email,
                phone,
                address
            }

            await fetch('/api/admin/oficios', {
                method: editing ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })

            resetForm()
            fetchOficios()
        } catch (err) {
            alert('Ocurrió un error al guardar el oficio.')
            console.error(err)
        }
    }

    const editOficio = (o: Oficio) => {
        setEditing(o)
        setName(o.name)
        setBio(o.bio || '')
        setCoverImage(o.coverImage || '')
        setImages(o.images || [])
        setInstagram(o.instagram || '')
        setEmail(o.email || '')
        setPhone(o.phone || '')
        setAddress(o.address || '')
    }

    const resetForm = () => {
        setEditing(null)
        setName('')
        setBio('')
        setCoverImage('')
        setImages([])
        setInstagram('')
        setEmail('')
        setPhone('')
        setAddress('')
    }

    const deleteOficio = async (id: string) => {
        if (confirm('¿Seguro que deseas eliminar este oficio?')) {
            await fetch('/api/admin/oficios?id=' + id, { method: 'DELETE' })
            fetchOficios()
        }
    }

    if (loading) return <div className="text-white text-center pt-32">Cargando oficios...</div>

    return (
        <main className="flex-1 flex flex-col bg-black min-h-screen px-6 py-24">
            <div className="w-full max-w-6xl mx-auto">
                <FadeIn>
                    <div className="border-b border-[#333] pb-6 mb-10 flex justify-between items-end">
                        <h1 className="text-4xl font-bold uppercase tracking-tighter text-white">Oficios</h1>
                        <button onClick={resetForm} className="text-xs uppercase bg-white text-black px-4 py-2 font-mono tracking-widest">
                            + Nuevo Oficio
                        </button>
                    </div>
                </FadeIn>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Listado de Oficios */}
                    <div className="col-span-1 lg:col-span-2 order-2 lg:order-1">
                        <h2 className="text-xl text-white font-mono uppercase tracking-widest mb-6 border-b border-[#333] pb-2">Colaboradores</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {oficios.map(o => (
                                <div key={o.id} className="border border-[#222] bg-[#0a0a0a] p-4 flex flex-col gap-4">
                                    {o.coverImage && (
                                        <div className="w-full h-48 relative bg-[#111]">
                                            <Image src={o.coverImage} alt={o.name} fill className="object-cover" />
                                        </div>
                                    )}
                                    <div>
                                        <h3 className="text-white font-bold uppercase tracking-widest leading-tight mb-2">{o.name}</h3>
                                        <p className="text-[#888] font-mono text-sm line-clamp-3">{o.bio}</p>
                                        <div className="flex gap-2 mt-4 pt-4 border-t border-[#222]">
                                            <button onClick={() => editOficio(o)} className="text-white font-mono text-xs uppercase tracking-widest hover:text-[#bbb] flex-1 text-left">Editar</button>
                                            <button onClick={() => deleteOficio(o.id)} className="text-red-500 font-mono text-xs uppercase tracking-widest hover:text-red-400">Borrar</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {oficios.length === 0 && <p className="text-[#666] font-mono text-sm">No hay oficios registrados aún.</p>}
                        </div>
                    </div>

                    {/* Formulario */}
                    <div className="col-span-1 order-1 lg:order-2">
                        <div className="border border-[#333] bg-[#0a0a0a] p-6 sticky top-24">
                            <h2 className="text-lg text-white font-mono uppercase tracking-widest mb-6">{editing ? 'Editar Oficio' : 'Añadir Oficio'}</h2>

                            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                                <div>
                                    <label htmlFor="imageUpload" className="text-xs uppercase font-mono text-[#888] tracking-widest">Foto de Portada</label>
                                    {coverImage && <img src={coverImage} alt="preview" className="w-full h-32 object-cover bg-[#111] border border-[#333] mb-2 mt-2" />}
                                    <input id="imageUpload" name="imageUpload" type="file" accept="image/*" onChange={handleImageChange} className="w-full text-xs text-[#888] font-mono file:mr-4 file:py-2 file:px-4 file:border-0 file:text-xs file:font-mono file:bg-white file:text-black cursor-pointer mt-2" />
                                </div>

                                <div>
                                    <label htmlFor="name" className="text-xs uppercase font-mono text-[#888] tracking-widest block mb-1">Nombre</label>
                                    <input id="name" name="name" required value={name} onChange={e => setName(e.target.value)} className="w-full bg-[#111] border border-[#333] text-white p-2 font-mono text-sm" placeholder="Ej: Cafe Cabra" />
                                </div>

                                <div>
                                    <label htmlFor="bio" className="text-xs uppercase font-mono text-[#888] tracking-widest block mb-1">Biografía / Cómo Participa</label>
                                    <textarea id="bio" name="bio" rows={5} value={bio} onChange={e => setBio(e.target.value)} className="w-full bg-[#111] border border-[#333] text-white p-2 font-mono text-sm" placeholder="Añade la descripción aquí..." />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="instagram" className="text-xs uppercase font-mono text-[#888] tracking-widest block mb-1">Instagram (URL)</label>
                                        <input id="instagram" type="url" value={instagram} onChange={e => setInstagram(e.target.value)} className="w-full bg-[#111] border border-[#333] text-white p-2 font-mono text-sm" placeholder="https://instagram.com/..." />
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="text-xs uppercase font-mono text-[#888] tracking-widest block mb-1">Email</label>
                                        <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-[#111] border border-[#333] text-white p-2 font-mono text-sm" placeholder="correo@ejemplo.com" />
                                    </div>
                                    <div>
                                        <label htmlFor="phone" className="text-xs uppercase font-mono text-[#888] tracking-widest block mb-1">WhatsApp (Número)</label>
                                        <input id="phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full bg-[#111] border border-[#333] text-white p-2 font-mono text-sm" placeholder="Ej: 912345678 (Sin el +56)" />
                                    </div>
                                    <div>
                                        <label htmlFor="address" className="text-xs uppercase font-mono text-[#888] tracking-widest block mb-1">Dirección</label>
                                        <input id="address" type="text" value={address} onChange={e => setAddress(e.target.value)} className="w-full bg-[#111] border border-[#333] text-white p-2 font-mono text-sm" placeholder="Ej: Av. Providencia 1234" />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="galleryUpload" className="text-xs uppercase font-mono text-[#888] tracking-widest block mb-1">Fotos Adicionales (Actuaciones en Taller Zero)</label>
                                    <input id="galleryUpload" name="galleryUpload" type="file" accept="image/*" multiple onChange={handleGalleryImagesChange} className="w-full text-xs text-[#888] font-mono file:mr-4 file:py-2 file:px-4 file:border-0 file:text-xs file:font-mono file:bg-white file:text-black cursor-pointer mt-2" />
                                    {images.length > 0 && (
                                        <div className="grid grid-cols-3 gap-2 mt-4">
                                            {images.map((img, idx) => (
                                                <div key={idx} className="relative aspect-square bg-[#111] border border-[#333] group">
                                                    <Image src={img} alt="Gallery image" fill className="object-cover" />
                                                    <button type="button" onClick={() => removeGalleryImage(idx)} className="absolute top-1 right-1 bg-black/80 text-white w-6 h-6 flex items-center justify-center hover:bg-red-500 opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-4 mt-4">
                                    <button type="submit" className="flex-1 bg-white text-black py-2 font-mono uppercase tracking-widest text-sm font-bold shadow-[0_0_15px_rgba(255,255,255,0.2)] hover:bg-[#ccc] transition-colors">
                                        {editing ? 'Guardar Cambios' : 'Añadir'}
                                    </button>
                                    {editing && (
                                        <button type="button" onClick={resetForm} className="bg-transparent border border-[#555] text-[#888] px-4 py-2 font-mono uppercase tracking-widest text-xs hover:text-white transition-colors">
                                            Cancelar
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

            </div>
        </main>
    )
}
