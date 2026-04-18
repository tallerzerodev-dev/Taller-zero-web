import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const SubscribeSchema = z.object({
    email: z.string().email('Email inválido'),
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const parsed = SubscribeSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: 'Email inválido', details: parsed.error.format() },
                { status: 400 }
            );
        }

        const { email } = parsed.data;

        // Intentar guardar el suscriptor, ignorando si ya existe
        const existingSubscriber = await prisma.subscriber.findUnique({
            where: { email }
        });

        if (!existingSubscriber) {
            await prisma.subscriber.create({
                data: { email }
            });
        }

        return NextResponse.json({ success: true, message: '¡Gracias por unirte al vacío!' });
    } catch (error) {
        console.error('Error suscribiendo email:', error);
        return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
    }
}
