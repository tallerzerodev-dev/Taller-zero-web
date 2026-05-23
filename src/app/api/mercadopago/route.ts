import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { MercadoPagoConfig, Preference } from 'mercadopago';

const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000;
const RATE_LIMIT_MAX = 5;
const rateLimitMap = new Map<string, { count: number, expires: number }>();

const MercadoPagoOrderSchema = z.object({
    amount: z.number().min(0), // Changed from 1 to 0 temporarily to see if empty cart was the issue, though empty cart shouldn't happen
    currency: z.string().default('CLP'),
    concept: z.string(),
    email: z.string().email(),
    orderId: z.string(),
    customerName: z.string(),
    customerPhone: z.string().optional(),
    shippingAddress: z.string().optional(),
    items: z.array(z.object({
        id: z.string(),
        title: z.string(),
        price: z.number(),
        quantity: z.number().min(1),
        size: z.string().optional(),
    })),
});

export async function POST(req: Request) {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const now = Date.now();
    const entry = rateLimitMap.get(ip);
    if (entry && entry.expires > now) {
        if (entry.count >= RATE_LIMIT_MAX) {
            return NextResponse.json({ error: 'Demasiados intentos, espera unos minutos.' }, { status: 429 });
        }
        entry.count++;
        rateLimitMap.set(ip, entry);
    } else {
        rateLimitMap.set(ip, { count: 1, expires: now + RATE_LIMIT_WINDOW_MS });
    }

    try {
        const body = await req.json();
        const parsed = MercadoPagoOrderSchema.safeParse(body);
        if (!parsed.success) {
            console.error('ZOD VALIDATION ERROR:', JSON.stringify(parsed.error.format(), null, 2));
            console.error('RECEIVED BODY:', JSON.stringify(body, null, 2));
            return NextResponse.json({ error: 'Payload inválido', details: parsed.error.format() }, { status: 400 });
        }

        const data = parsed.data;
        const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN_TEST || '';

        if (!accessToken) {
            return NextResponse.json({ error: 'Credenciales de Mercado Pago no configuradas' }, { status: 500 });
        }

        // VALIDACIÓN DE CARRITO: Asegurarnos de que los productos existen en la BD
        // Si el usuario tiene productos viejos en localStorage que fueron borrados, Prisma lanzará error 500.
        const productIds = data.items.map(i => i.id);
        const existingProducts = await prisma.product.findMany({
            where: { id: { in: productIds } },
            select: { id: true }
        });

        if (existingProducts.length !== productIds.length) {
            return NextResponse.json({ 
                error: 'Hay productos en tu carrito que ya no están disponibles o fueron borrados. Por favor vacía tu carrito e intenta de nuevo.' 
            }, { status: 400 });
        }

        let origin = req.headers.get('origin') || 'https://taller-zero.cl';
        // Mercado Pago bloquea explícitamente "localhost" en las back_urls y lanza el error "back_url.success must be defined".
        // Para desarrollo local, usaremos el dominio de producción como un parche.
        if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
            origin = 'https://taller-zero.cl';
        }
        const resultUrl = `${origin}/checkout/result`;

        const mpItems = data.items.map(item => ({
            id: item.id,
            title: item.size ? `${item.title} (Talla: ${item.size})` : item.title,
            quantity: item.quantity,
            unit_price: item.price,
            currency_id: 'CLP',
        }));

        const itemsTotal = data.items.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
        if (data.amount > itemsTotal) {
            mpItems.push({
                id: 'shipping',
                title: 'Costo de Envío',
                quantity: 1,
                unit_price: data.amount - itemsTotal,
                currency_id: 'CLP',
            });
        }

        // Initialize Mercado Pago SDK
        const client = new MercadoPagoConfig({ accessToken });
        const preference = new Preference(client);

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
                external_reference: data.orderId,
                statement_descriptor: 'TALLER ZERO',
            }
        });

        // Save order in database
        await prisma.order.create({
            data: {
                id: data.orderId,
                customerName: data.customerName,
                customerEmail: data.email,
                customerPhone: data.customerPhone || '',
                shippingAddress: data.shippingAddress || '',
                status: 'PENDING',
                totalAmount: data.amount,
                items: {
                    create: data.items.map((item: any) => ({
                        productId: item.id,
                        quantity: item.quantity,
                        size: item.size || null,
                        priceAtTime: item.price,
                    })),
                },
            },
        });

        // Return the preference ID for the Wallet component
        return NextResponse.json({ 
            preferenceId: preferenceResponse.id 
        });

    } catch (error) {
        console.error('ERROR CREATING PREFERENCE:', error);
        const errorDetails = error instanceof Error ? (error.stack || error.message) : JSON.stringify(error, Object.getOwnPropertyNames(error), 2);
        return NextResponse.json({ error: 'Error del servidor', details: errorDetails }, { status: 500 });
    }
}
