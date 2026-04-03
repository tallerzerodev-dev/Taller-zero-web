import Link from 'next/link'
import { FadeIn } from '@/components/ui/Animations'

const PRODUCTS_DATA: Record<string, any> = {
    'pol-001': {
        name: 'Poler�n\nTR-Z',
        price: '$50.000 CLP',
        desc: 'Poler�n heavyweight 100% algod�n. Serigrafiado a mano en el taller. Dise�o brutalista con el logo en alto contraste. Edici�n limitada.',
        image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=1974&auto=format&fit=crop'
    },
    'pol-002': {
        name: 'Polera\nVoid',
        price: '$25.000 CLP',
        desc: 'Drop shoulder t-shirt. Tela premium. Estampado corrosivo que no se desgasta. El uniforme oficial del underground.',
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=2080&auto=format&fit=crop'
    },
    'pol-003': {
        name: 'Poler�n\nHorizon',
        price: '$50.000 CLP',
        desc: 'Inspiraci�n industrial y cortes rectos. Cierre met�lico grueso y detalles ocultos. Para la noche m�s larga.',
        image: 'https://images.unsplash.com/photo-1614676471928-2ed0ad1061a4?q=80&w=2041&auto=format&fit=crop'
    }
}

export default function ProductPage({ params }: { params: { id: string } }) {
    const product = PRODUCTS_DATA[params.id] || {
        name: 'Art�culo\nDesconocido',
        price: '$0 CLP',
        desc: 'Este art�culo no se encuentra en la base de datos de nuestro cat�logo.',
        image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=1974&auto=format&fit=crop'
    };

    return (
        <main className="flex-1 flex justify-center bg-black min-h-screen px-6 py-24">
            <div className="w-full max-w-7xl mx-auto flex flex-col md:flex-row gap-12">
                {/* IMAGEN DE PRODUCTO */}
                <FadeIn className="w-full md:w-1/2 aspect-[3/4] bg-gray-900 border-4 border-gray-800 relative">
                    <div
                        className="absolute inset-4 bg-cover bg-center mix-blend-luminosity grayscale"
                        style={{ backgroundImage: `url(${product.image})` }}
                    ></div>
                    <div className="absolute bottom-4 left-4 z-20 bg-white text-black font-mono text-xs font-bold px-2 py-1 tracking-widest uppercase">
                        {params.id}
                    </div>
                </FadeIn>

                {/* DETALLES DE PRODUCTO */}
                <FadeIn delay={0.2} className="w-full md:w-1/2 flex flex-col pt-8 md:pt-0">
                    <Link href="/store" className="font-mono text-sm uppercase tracking-widest text-gray-500 hover:text-white mb-8 border-b border-gray-800 pb-4 w-fit">
                        ? Volver a la Tienda
                    </Link>

                    <h1 className="text-5xl md:text-7xl font-bold uppercase tracking-tighter mb-4 whitespace-pre-line">
                        {product.name}
                    </h1>

                    <p className="text-3xl font-mono text-gray-300 mb-8">{product.price}</p>

                    <div className="space-y-8 border-y-2 border-white py-8 my-8">
                        <p className="text-gray-400 font-sans text-lg leading-relaxed">
                            {product.desc}
                        </p>

                        <div className="flex flex-col gap-4 font-mono uppercase tracking-widest">
                            <div className="flex gap-4 items-center">
                                <span className="text-gray-500 w-20">TALLAS:</span>
                                <div className="flex gap-2">
                                    {['S', 'M', 'L', 'XL'].map(size => (
                                        <button key={size} className="border-2 border-gray-800 hover:border-white px-4 py-2 hover:bg-white hover:text-black transition-colors">
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-4 items-center mt-2">
                                <span className="text-gray-500 w-20">COLOR:</span>
                                <div className="flex gap-2">
                                    <button className="w-8 h-8 rounded-full bg-black border-2 border-white" title="Negro"></button>
                                    <button className="w-8 h-8 rounded-full bg-gray-600 border-2 border-gray-800 hover:border-white" title="Gris Mute"></button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button className="brutalist-button w-full text-center text-lg mt-auto !py-6">
                        AGREGAR AL CARRITO
                    </button>
                </FadeIn>
            </div>
        </main>
    )
}
