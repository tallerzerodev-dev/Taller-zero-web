import { NextResponse } from 'next/server';
// Simple rate limiter (in-memory, por IP)
const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000; // 5 minutos
const RATE_LIMIT_MAX = 5; // Máximo 5 intentos por ventana
const rateLimitMap = new Map<string, { count: number, expires: number }>();
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import crypto from 'crypto';

// Esquema de validación para crear una orden de pago con Flow
const FlowOrderSchema = z.object({
    amount: z.number().min(1),
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
        quantity: z.number(),
        size: z.string().optional(),
    })),
});

// Utilidad para firmar los parámetros según la documentación de Flow
function signParams(params: Record<string, any>, secretKey: string) {
    const keys = Object.keys(params).sort();
    let toSign = '';
    for (const key of keys) {
        toSign += key + params[key];
    }
    return crypto.createHmac('sha256', secretKey).update(toSign).digest('hex');
}
export async function POST(req: Request) {
    // Obtener IP del request (Next.js Edge/Node)
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
        const parsed = FlowOrderSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ error: 'Payload inválido', details: parsed.error.format() }, { status: 400 });
        }

        // Aquí debes obtener las credenciales de Flow (apiKey y secretKey) desde variables de entorno o config segura
        const apiKey = process.env.FLOW_API_KEY || '';
        const secretKey = process.env.FLOW_SECRET_KEY || '';
        if (!apiKey || !secretKey) {
            return NextResponse.json({ error: 'Credenciales de Flow no configuradas' }, { status: 500 });
        }

        // Construir los parámetros para la orden
        const params = {
            apiKey,
            amount: parsed.data.amount,
            currency: parsed.data.currency,
            concept: parsed.data.concept,
            email: parsed.data.email,
            orderId: parsed.data.orderId,
            urlReturn: 'https://taller-zero.cl/checkout/result',
            urlConfirmation: 'https://taller-zero.cl/api/flow/confirm',
        };
        // Firmar los parámetros
        const s = signParams(params, secretKey);
        const payload = { ...params, s };

        // Llamar a la API de Flow (sandbox por defecto)
        const flowRes = await fetch('https://sandbox.flow.cl/api/payment/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams(payload as any).toString(),
        });
        const flowData = await flowRes.json();
        if (!flowRes.ok) {
            return NextResponse.json({ error: 'Error en Flow', details: flowData }, { status: 502 });
        }


        // Guardar la orden en la base de datos
        const order = await prisma.order.create({
            data: {
                id: parsed.data.orderId,
                customerName: parsed.data.customerName,
                customerEmail: parsed.data.email,
                customerPhone: parsed.data.customerPhone || '',
                shippingAddress: parsed.data.shippingAddress || '',
                status: 'PENDING',
                totalAmount: parsed.data.amount,
                items: {
                    create: parsed.data.items.map((item: any) => ({
                        productId: item.id,
                        quantity: item.quantity,
                        size: item.size || null,
                        priceAtTime: item.price,
                    })),
                },
            },
            include: { items: true },
        });

        return NextResponse.json(flowData);
    } catch (error) {
        return NextResponse.json({ error: 'Error del servidor', details: String(error) }, { status: 500 });
    }
}
