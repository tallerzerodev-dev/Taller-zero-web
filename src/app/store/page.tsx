import Link from 'next/link'
import { FadeIn, StaggerContainer } from '@/components/ui/Animations'

const PRODUCTS = [
    { id: 'pol-001', name: 'Polerón TR-Z', price: '$50.000', label: 'NUEVO', image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=1974&auto=format&fit=crop' },
    { id: 'pol-002', name: 'Polera Void', price: '$25.000', label: 'PRE-ORDER', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=2080&auto=format&fit=crop' },
    { id: 'pol-003', name: 'Polerón Horizon', price: '$50.000', label: '', image: 'https://images.unsplash.com/photo-1614676471928-2ed0ad1061a4?q=80&w=2041&auto=format&fit=crop' }
]

export default function StorePage() {
    return (
        <main className="flex-1 flex flex-col items-center bg-black min-h-screen px-6 py-24">
            <div className="w-full max-w-7xl mx-auto">
                <FadeIn y={20}>
                    <div className="flex flex-col md:flex-row justify-between items-end border-b-4 border-white mb-16 pb-8 gap-6">
                        <div>
                            <h1 className="text-6xl md:text-8xl font-bold uppercase tracking-tighter">
                                Merch<br />Store
                            </h1>
                            <p className="text-gray-400 font-mono text-xl mt-4 uppercase tracking-widest">
                                Equipamiento oficial del taller.
                            </p>
                        </div>
                        <div className="font-mono text-sm uppercase text-gray-500 tracking-widest text-right">
                            <p>Envío Nacional: Activado</p>
                            <p>Stock: Limitado</p>
                        </div>
                    </div>
                </FadeIn>

                <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {PRODUCTS.map((product) => (
                        <FadeIn key={product.id}>
                            <Link href={`/store/${product.id}`} className="group block">
                                <div className="w-full aspect-[3/4] bg-gray-900 border-4 border-gray-800 group-hover:border-white transition-colors duration-300 relative overflow-hidden mb-6 p-4">
                                    {product.label && (
                                        <div className="absolute top-4 right-4 z-20 bg-white text-black font-mono text-xs font-bold px-2 py-1 tracking-widest">
                                            {product.label}
                                        </div>
                                    )}
                                    <div
                                        className="absolute inset-4 bg-cover bg-center mix-blend-luminosity grayscale group-hover:scale-105 transition-transform duration-700"
                                        style={{ backgroundImage: `url(${product.image})` }}
                                    ></div>
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/20">
                                        <span className="brutalist-button">Ver Detalles</span>
                                    </div>
                                </div>
                                <div className="flex justify-between items-start font-mono uppercase tracking-wide">
                                    <h3 className="text-xl font-bold">{product.name}</h3>
                                    <span className="text-gray-400">{product.price}</span>
                                </div>
                            </Link>
                        </FadeIn>
                    ))}
                </StaggerContainer>
            </div>
        </main>
    )
}
