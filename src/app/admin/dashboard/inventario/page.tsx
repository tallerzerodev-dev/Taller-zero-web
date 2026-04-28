'use client'

import { useState, useEffect } from 'react'
import { FadeIn } from '@/components/ui/Animations'
import Image from 'next/image'

interface Product {
    id: string
    title: string
    price: number
    description: string | null
    images: string[]
    category: string
    isAvailable: boolean
    stock: number
    views: number
    sizes: string[]
}

export default function InventarioPage() {
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [editing, setEditing] = useState<Product | null>(null)

    // States del formulario
    const [title, setTitle] = useState('')
    const [price, setPrice] = useState(0)
    const [description, setDescription] = useState('')
    const [category, setCategory] = useState('Ropa')
    const [stock, setStock] = useState(0)
    const [sizes, setSizes] = useState('')
    const [imageUrl, setImageUrl] = useState('')

    const fetchProducts = async () => {
        try {
            const res = await fetch('/api/admin/inventario')
            const data = await res.json()
            setProducts(data)
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchProducts()
    }, [])

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const tempUrl = URL.createObjectURL(file)
            setImageUrl(tempUrl)
        }
    }

    const uploadIfBlob = async (url: string) => {
        if (!url || !url.startsWith('blob:')) return url
        const res = await fetch(url)
        const blob = await res.blob()
        const formData = new FormData()
        formData.append('file', blob, 'taller-zero-product.' + (blob.type.split('/')[1] || 'bin'))

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
            const finalImage = await uploadIfBlob(imageUrl)
            const payload = {
                id: editing?.id,
                title,
                price,
                description,
                category,
                stock,
                sizes: sizes.split(',').map(s => s.trim()).filter(Boolean),
                images: finalImage ? [finalImage] : [],
                isAvailable: stock > 0
            }

            await fetch('/api/admin/inventario', {
                method: editing ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })

            resetForm()
            fetchProducts()
        } catch (err) {
            alert('Ocurrió un error al guardar el producto.')
            console.error(err)
        }
    }

    const editProduct = (p: Product) => {
        setEditing(p)
        setTitle(p.title)
        setPrice(p.price)
        setDescription(p.description || '')
        setCategory(p.category)
        setStock(p.stock)
        setSizes(p.sizes.join(', '))
        setImageUrl(p.images[0] || '')
    }

    const resetForm = () => {
        setEditing(null)
        setTitle(''); setPrice(0); setDescription(''); setCategory('Ropa'); setStock(0); setSizes(''); setImageUrl('')
    }

    const deleteProduct = async (id: string) => {
        if (confirm('¿Seguro que deseas eliminar este producto?')) {
            await fetch('/api/admin/inventario?id=' + id, { method: 'DELETE' })
            fetchProducts()
        }
    }

    if (loading) return <div className="text-white text-center pt-32">Cargando inventario...</div>

    return (
        <main className="flex-1 flex flex-col bg-black min-h-screen px-6 py-24">
            <div className="w-full max-w-6xl mx-auto">
                <FadeIn>
                    <div className="border-b border-[#333] pb-6 mb-10 flex justify-between items-end">
                        <h1 className="text-4xl font-bold uppercase tracking-tighter text-white">Inventario</h1>
                        <button onClick={resetForm} className="text-xs uppercase bg-white text-black px-4 py-2 font-mono tracking-widest">
                            + Nuevo Producto
                        </button>
                    </div>
                </FadeIn>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Listado de Productos */}
                    <div className="col-span-1 lg:col-span-2 order-2 lg:order-1">
                        <h2 className="text-xl text-white font-mono uppercase tracking-widest mb-6 border-b border-[#333] pb-2">Tus Productos</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {products.map(p => (
                                <div key={p.id} className="border border-[#222] bg-[#0a0a0a] p-4 flex flex-col gap-4">
                                    {p.images[0] && (
                                        <div className="w-full h-48 relative bg-[#111]">
                                            <Image src={p.images[0]} alt={p.title} fill className="object-contain p-2" />
                                        </div>
                                    )}
                                    <div>
                                        <span className="text-[10px] uppercase text-[#888] tracking-widest inline-block border border-[#333] px-2 py-0.5 mb-2">{p.category}</span>
                                        <h3 className="text-white font-bold uppercase tracking-widest leading-tight">{p.title}</h3>
                                        <p className="text-[#888] font-mono text-sm mt-1">${p.price.toLocaleString('es-CL')} | Stock: {p.stock}</p>
                                        <div className="flex gap-2 mt-4 pt-4 border-t border-[#222]">
                                            <button onClick={() => editProduct(p)} className="text-white font-mono text-xs uppercase tracking-widest hover:text-[#bbb] flex-1 text-left">Editar</button>
                                            <button onClick={() => deleteProduct(p.id)} className="text-red-500 font-mono text-xs uppercase tracking-widest hover:text-red-400">Borrar</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {products.length === 0 && <p className="text-[#666] font-mono text-sm">No hay productos en tu inventario aún.</p>}
                        </div>
                    </div>

                    {/* Formulario */}
                    <div className="col-span-1 order-1 lg:order-2">
                        <div className="border border-[#333] bg-[#0a0a0a] p-6 sticky top-24">
                            <h2 className="text-lg text-white font-mono uppercase tracking-widest mb-6">{editing ? 'Editar Producto' : 'Añadir Producto'}</h2>

                            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                                <div>
                                    <label className="text-xs uppercase font-mono text-[#888] tracking-widest">Fotografía (1 Principal)</label>
                                    {imageUrl && <img src={imageUrl} alt="preview" className="w-full h-32 object-contain bg-[#111] border border-[#333] mb-2" />}
                                    <input type="file" accept="image/*" onChange={handleImageChange} className="w-full text-xs text-[#888] font-mono file:mr-4 file:py-2 file:px-4 file:border-0 file:text-xs file:font-mono file:bg-white file:text-black cursor-pointer" />
                                </div>

                                <div>
                                    <label className="text-xs uppercase font-mono text-[#888] tracking-widest block mb-1">Nombre</label>
                                    <input required value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-[#111] border border-[#333] text-white p-2 font-mono text-sm" />
                                </div>

                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <label className="text-xs uppercase font-mono text-[#888] tracking-widest block mb-1">Precio (CLP)</label>
                                        <input required type="number" min="0" value={price} onChange={e => setPrice(Number(e.target.value))} className="w-full bg-[#111] border border-[#333] text-white p-2 font-mono text-sm" />
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-xs uppercase font-mono text-[#888] tracking-widest block mb-1">Stock</label>
                                        <input required type="number" min="0" value={stock} onChange={e => setStock(Number(e.target.value))} className="w-full bg-[#111] border border-[#333] text-white p-2 font-mono text-sm" />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs uppercase font-mono text-[#888] tracking-widest block mb-1">Categoría</label>
                                    <select value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-[#111] border border-[#333] text-white p-2 font-mono text-sm">
                                        <option>Ropa</option>
                                        <option>Accesorios</option>
                                        <option>Merch Audio</option>
                                        <option>Revista/Libro</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-xs uppercase font-mono text-[#888] tracking-widest block mb-1">Tallas (Separadas por comas)</label>
                                    <input placeholder="Ej: S, M, L, XL" value={sizes} onChange={e => setSizes(e.target.value)} className="w-full bg-[#111] border border-[#333] text-white p-2 font-mono text-sm" />
                                </div>

                                <div>
                                    <label className="text-xs uppercase font-mono text-[#888] tracking-widest block mb-1">Descripción Corta</label>
                                    <textarea rows={3} value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-[#111] border border-[#333] text-white p-2 font-mono text-sm" />
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
