import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { SHIPPING_OPTIONS, SHIPPING_TYPES } from '@/lib/shipping';
import { getMercadoPagoAccessToken, getSiteUrl } from '@/lib/payments';
import { checkRateLimit } from '@/lib/ratelimit';

// El navegador solo dice QUÉ quiere comprar. Precio, título, envío, total e ID de orden
// los decide el servidor; .strict() rechaza cualquier campo extra (price, amount, orderId...).
const CheckoutSchema = z.object({
    email: z.string().trim().email().max(200),
    customerName: z.string().trim().min(2).max(120),
    customerPhone: z.string().trim().min(6).max(30),
    shippingAddress: z.string().trim().min(5).max(500),
    shippingType: z.enum(SHIPPING_TYPES),
    items: z.array(z.object({
        id: z.string().min(1).max(64),
        quantity: z.number().int().min(1).max(10),
        size: z.string().max(30).optional(),
        color: z.string().max(30).optional(),
    }).strict()).min(1).max(20),
}).strict();

export async function POST(req: Request) {
    if (!(await checkRateLimit('checkout', req.headers))) {
        return NextResponse.json({ error: 'Demasiados intentos, espera unos minutos.' }, { status: 429 });
    }

    try {
        const body = await req.json().catch(() => null);
        const parsed = CheckoutSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ error: 'Datos de compra inválidos. Revisa el formulario e intenta de nuevo.' }, { status: 400 });
        }

        const data = parsed.data;
        const accessToken = getMercadoPagoAccessToken();

        if (!accessToken) {
            return NextResponse.json({ error: 'Credenciales de Mercado Pago no configuradas' }, { status: 500 });
        }

        // VALIDACIÓN DE CARRITO contra la base de datos
        const productIds = Array.from(new Set(data.items.map(i => i.id)));
        const products = await prisma.product.findMany({
            where: { id: { in: productIds } },
        });
        const productsById = new Map(products.map(p => [p.id, p]));

        const quantityByProduct = new Map<string, number>();
        for (const item of data.items) {
            const product = productsById.get(item.id);
            if (!product || !product.isAvailable) {
                return NextResponse.json({
                    error: 'Hay productos en tu carrito que ya no están disponibles. Por favor vacía tu carrito e intenta de nuevo.'
                }, { status: 400 });
            }
            if (product.sizes.length > 0 && (!item.size || !product.sizes.includes(item.size))) {
                return NextResponse.json({ error: `Talla no válida para ${product.title}.` }, { status: 400 });
            }
            if (product.colors.length > 0 && (!item.color || !product.colors.includes(item.color))) {
                return NextResponse.json({ error: `Color no válido para ${product.title}.` }, { status: 400 });
            }
            quantityByProduct.set(item.id, (quantityByProduct.get(item.id) || 0) + item.quantity);
        }

        for (const [productId, quantity] of Array.from(quantityByProduct)) {
            const product = productsById.get(productId)!;
            if (product.stock < quantity) {
                return NextResponse.json({
                    error: `No hay stock suficiente de ${product.title} (quedan ${product.stock}).`
                }, { status: 400 });
            }
        }

        const orderItems = data.items.map(item => {
            const product = productsById.get(item.id)!;
            return {
                product,
                quantity: item.quantity,
                size: product.sizes.length > 0 ? item.size! : null,
                color: product.colors.length > 0 ? item.color! : null,
            };
        });

        const shippingCost = SHIPPING_OPTIONS[data.shippingType].cost;
        const itemsTotal = orderItems.reduce((acc, i) => acc + i.product.price * i.quantity, 0);
        const totalAmount = itemsTotal + shippingCost;

        if (totalAmount <= 0) {
            return NextResponse.json({ error: 'El total de la compra no es válido.' }, { status: 400 });
        }

        // La orden se crea primero para que su ID (generado por la base) sea la referencia del pago
        const order = await prisma.order.create({
            data: {
                customerName: data.customerName,
                customerEmail: data.email,
                customerPhone: data.customerPhone,
                shippingAddress: data.shippingAddress,
                shippingType: data.shippingType,
                shippingCost,
                status: 'PENDING',
                totalAmount,
                items: {
                    create: orderItems.map(i => ({
                        productId: i.product.id,
                        quantity: i.quantity,
                        size: i.size,
                        color: i.color,
                        priceAtTime: i.product.price,
                    })),
                },
            },
        });

        const mpItems = orderItems.map(i => ({
            id: i.product.id,
            title: [i.product.title, i.size && `Talla: ${i.size}`, i.color && `Color: ${i.color}`].filter(Boolean).join(' - '),
            quantity: i.quantity,
            unit_price: i.product.price,
            currency_id: 'CLP',
        }));

        if (shippingCost > 0) {
            mpItems.push({
                id: 'shipping',
                title: 'Costo de Envío',
                quantity: 1,
                unit_price: shippingCost,
                currency_id: 'CLP',
            });
        }

        const siteUrl = getSiteUrl();
        // Mercado Pago bloquea explícitamente "localhost" en las back_urls y lanza el error "back_url.success must be defined".
        // Para desarrollo local, usaremos el dominio de producción como un parche.
        const isLocal = siteUrl.includes('localhost') || siteUrl.includes('127.0.0.1');
        const publicUrl = isLocal ? 'https://www.taller-zero.cl' : siteUrl;
        const resultUrl = `${publicUrl}/checkout/result`;

        try {
            const preference = new Preference(new MercadoPagoConfig({ accessToken }));
            const preferenceResponse = await preference.create({
                body: {
                    items: mpItems,
                    payer: {
                        name: data.customerName,
                        email: data.email,
                    },
                    back_urls: {
                        success: resultUrl,
                        failure: resultUrl,
                        pending: resultUrl
                    },
                    auto_return: 'approved',
                    external_reference: order.id,
                    statement_descriptor: 'TALLER ZERO',
                    ...(isLocal ? {} : { notification_url: `${siteUrl}/api/webhooks/mercadopago` }),
                }
            });

            // Return the preference ID for the Wallet component
            return NextResponse.json({
                preferenceId: preferenceResponse.id
            });
        } catch (error) {
            await prisma.order.update({ where: { id: order.id }, data: { status: 'CANCELLED' } });
            throw error;
        }

    } catch (error) {
        console.error('ERROR CREATING PREFERENCE:', error);
        return NextResponse.json({ error: 'No se pudo generar el pago. Intenta nuevamente.' }, { status: 500 });
    }
}
