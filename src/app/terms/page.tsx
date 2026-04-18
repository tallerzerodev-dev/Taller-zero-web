import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Términos y Condiciones',
    description: 'Términos y condiciones de uso y compra en Taller Zero.',
};

export default function TermsPage() {
    return (
        <main className="flex-1 bg-black min-h-screen px-6 py-24 text-[#aaa] font-mono text-xs md:text-sm tracking-widest leading-relaxed">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl md:text-5xl font-bold uppercase tracking-tighter text-white mb-12 pb-4 border-b border-[#333]">
                    Términos y Condiciones
                </h1>

                <div className="space-y-8">
                    <section>
                        <h2 className="text-white text-lg font-bold mb-4 uppercase">1. Información General</h2>
                        <p>
                            Las presentes Condiciones Generales regulan el uso del sitio web y las transacciones comerciales realizadas a través de la plataforma Taller Zero. Al acceder o utilizar este sitio, usted acepta estar sujeto a estos términos.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-white text-lg font-bold mb-4 uppercase">2. Productos y Servicios</h2>
                        <p>
                            Taller Zero ofrece productos físicos (merchandising) y acceso a contenido digital. Nos reservamos el derecho de modificar o descontinuar cualquier producto o servicio sin previo aviso. Los precios están sujetos a cambios.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-white text-lg font-bold mb-4 uppercase">3. Pagos y Transacciones</h2>
                        <p>
                            Los pagos son procesados a través de la pasarela de pagos Flow (Webpay, Servipag, Mach, etc.). Al realizar una compra, usted acepta los términos y condiciones del procesador de pagos. Taller Zero no almacena información de tarjetas de crédito o débito.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-white text-lg font-bold mb-4 uppercase">4. Envíos y Entregas</h2>
                        <p>
                            Los envíos se realizan a través de servicios externos (Starken, BlueExpress). Los tiempos de entrega son estimados y no garantizados. Taller Zero no se hace responsable por retrasos atribuibles a la empresa de transporte una vez despachado el pedido.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-white text-lg font-bold mb-4 uppercase">5. Cambios y Devoluciones</h2>
                        <p>
                            De acuerdo con la ley de protección al consumidor de Chile, los productos pueden ser devueltos en un plazo de 10 días desde la recepción, siempre y cuando se encuentren sin uso, con sus etiquetas y empaque original. Los costos de envío por devoluciones corren por cuenta del cliente, salvo fallas de fábrica.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-white text-lg font-bold mb-4 uppercase">6. Propiedad Intelectual</h2>
                        <p>
                            Todo el contenido visual, sonoro y escrito en este sitio (incluyendo sesiones, grabaciones, fotografías y diseños de ropa) es propiedad exclusiva de Taller Zero. Queda prohibida su reproducción, distribución o uso comercial sin autorización expresa y por escrito.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-white text-lg font-bold mb-4 uppercase">7. Modificaciones</h2>
                        <p>
                            Taller Zero se reserva el derecho de actualizar estos términos en cualquier momento. El uso continuado del sitio tras cualquier modificación constituye la aceptación de los nuevos términos.
                        </p>
                    </section>
                </div>
            </div>
        </main>
    );
}
