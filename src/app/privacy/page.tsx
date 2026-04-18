import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Políticas de Privacidad',
    description: 'Políticas de privacidad y manejo de datos en Taller Zero.',
};

export default function PrivacyPage() {
    return (
        <main className="flex-1 bg-black min-h-screen px-6 py-24 text-[#aaa] font-mono text-xs md:text-sm tracking-widest leading-relaxed">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl md:text-5xl font-bold uppercase tracking-tighter text-white mb-12 pb-4 border-b border-[#333]">
                    Políticas de Privacidad
                </h1>

                <div className="space-y-8">
                    <section>
                        <h2 className="text-white text-lg font-bold mb-4 uppercase">1. Recopilación de Información</h2>
                        <p>
                            En Taller Zero, recopilamos información personal que usted nos proporciona voluntariamente al registrarse, realizar una compra o suscribirse a nuestro newsletter. Esta información puede incluir: nombre, dirección de correo electrónico, dirección de envío y número de teléfono.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-white text-lg font-bold mb-4 uppercase">2. Uso de la Información</h2>
                        <p>
                            La información recopilada se utiliza exclusivamente para:
                            <br />- Procesar y despachar sus pedidos.
                            <br />- Enviarle actualizaciones sobre el estado de sus compras.
                            <br />- Responder a sus consultas y requerimientos de soporte.
                            <br />- Enviar boletines informativos (solo si ha optado explícitamente por recibirlos).
                        </p>
                    </section>

                    <section>
                        <h2 className="text-white text-lg font-bold mb-4 uppercase">3. Protección de Datos</h2>
                        <p>
                            Implementamos medidas de seguridad para mantener la seguridad de su información personal. No almacenamos datos de pago (como números de tarjetas de crédito); todas las transacciones financieras se procesan a través de proveedores seguros externos (Flow).
                        </p>
                    </section>

                    <section>
                        <h2 className="text-white text-lg font-bold mb-4 uppercase">4. Compartir Información a Terceros</h2>
                        <p>
                            No vendemos, comercializamos ni transferimos su información personal identificable a terceros. Esto no incluye a los terceros de confianza que nos asisten en operar nuestro sitio web o llevar a cabo nuestro negocio (por ejemplo, empresas de mensajería como Starken o BlueExpress), siempre que dichas partes acepten mantener esta información confidencial.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-white text-lg font-bold mb-4 uppercase">5. Uso de Cookies</h2>
                        <p>
                            Utilizamos cookies para mejorar su experiencia en nuestro sitio web, recordar los artículos en su carrito de compras y compilar datos agregados sobre el tráfico y la interacción del sitio. Usted puede optar por desactivar las cookies a través de la configuración de su navegador, aunque esto podría afectar el funcionamiento de ciertas características del sitio.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-white text-lg font-bold mb-4 uppercase">6. Sus Derechos</h2>
                        <p>
                            Usted tiene el derecho de acceder, corregir o eliminar su información personal en cualquier momento. Si desea ejercer estos derechos o darse de baja de nuestro newsletter, por favor contáctenos directamente.
                        </p>
                    </section>
                </div>
            </div>
        </main>
    );
}
