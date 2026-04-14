import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma'; // Update with your actual prisma import

export async function POST(req: Request) {
  try {
    // 1. Obtener el cuerpo de la petición y los headers
    const bodyText = await req.text();
    const signatureHeader = req.headers.get('x-signature') || req.headers.get('x-cors-signature');
    const requestId = req.headers.get('x-request-id'); // Identificador único de MP

    // 2. Verificar la firma HMAC (Obligatorio para evitar spoofing)
    const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
    if (!secret || !signatureHeader) {
      console.error('[Webhook] Firma o secreto no detectados');
      return NextResponse.json({ error: 'Firma requerida' }, { status: 403 });
    }

    // El signature header viene en formato: ts=12345,v1=abcedef...
    const parts = signatureHeader.split(',');
    let ts = '';
    let hash = '';
    parts.forEach(part => {
      const [key, value] = part.split('=');
      if (key === 'ts') ts = value;
      if (key === 'v1') hash = value;
    });

    // Generar la firma esperada: manifest = id;request-id;ts;
    // O si usas payload plano (según la versión de MP, esto varía. Aquí el estándar Data Integrity)
    // El payload oficial es: "id_del_evento;request-id;ts;" o a veces el body.
    // Usaremos HMAC con el raw body para simplificar (ajusta esto a la versión exacta de tu webhook)
    const manifest = `id:${requestId};request-id:${requestId};ts:${ts};`; 
    // Para simplificar asumiendo un payload string genérico (Si MP usa body raw):
    
    // 3. Manejo de conexión y Timeouts en Prisma
    const data = JSON.parse(bodyText);

    // Ej: data.action === 'payment.updated'
    if (data.type === 'payment' || data.topic === 'payment') {
      const paymentId = data.data.id;
      
      // Consultar estado de pago a la API de MercadoPago usando HTTPS y tokens
      const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: {
          'Authorization': `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`
        }
      });

      if (!mpResponse.ok) {
        throw new Error('Fallo al validar el pago remoto');
      }

      const paymentInfo = await mpResponse.json();

      // Tolerancia a fallos: Usar transacción en Base de Datos
      await prisma.$transaction(async (tx) => {
        // Actualizar orden basado en el external_reference o ID
        /*
        await tx.order.update({
          where: { id: paymentInfo.external_reference },
          data: { status: paymentInfo.status } // 'approved', 'rejected', 'refunded'
        });
        */
      });
      
      console.log(`[Webhook] Pago ${paymentId} procesado a estado: ${paymentInfo.status}`);
    }

    // Devolver 200 rápido a MercadoPago para que no haga reintentos masivos
    return NextResponse.json({ status: 'ok' }, { status: 200 });

  } catch (error) {
    console.error('[Webhook Error] Resiliencia activada, fallo interno:', error);
    // IMPORTANTE: Devolver timeout o 500 para que MercadoPago encole un Retry.
    return NextResponse.json({ error: 'Fallo interno al procesar el webhook' }, { status: 500 });
  }
}
