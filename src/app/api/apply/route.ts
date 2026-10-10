import { NextResponse } from 'next/server';
import { z } from 'zod';
import { Resend } from 'resend';
import { escapeHtml } from '@/lib/html';

const resend = new Resend(process.env.RESEND_API_KEY);

// Evita enlaces javascript: o data: dentro del correo
const isHttpsUrl = (value: string) => value.startsWith('https://');

const ApplySchema = z.object({
  realName: z.string().trim().min(2, "El nombre completo es obligatorio").max(120),
  aka: z.string().trim().min(2, "El AKA es obligatorio").max(80),
  phone: z.string().trim().min(8, "Ingresa un número de contacto válido").max(30),
  email: z.string().trim().email("Debe ser un email válido").max(200),
  socialLink: z.string().trim().url("Debe ser una URL válida (Instagram)").max(300).refine(isHttpsUrl, "El enlace debe comenzar con https://"),
  djMixLink: z.string().trim().url("Debe ser una URL válida al mix").max(300).refine(isHttpsUrl, "El enlace debe comenzar con https://"),
  message: z.string().trim().min(10, "Cuéntanos un poco más sobre ti (mínimo 10 caracteres)").max(3000),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Zod validation
    const parsed = ApplySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Datos inválidos', details: parsed.error.format() }, { status: 400 });
    }

    // Todo lo que entra al HTML del correo va escapado
    const data = Object.fromEntries(
      Object.entries(parsed.data).map(([key, value]) => [key, escapeHtml(value)])
    ) as Record<keyof typeof parsed.data, string>;

    // Enviar email vía Resend
    const { error } = await resend.emails.send({
      from: 'Taller Zero <no-reply@taller-zero.cl>',
      to: ['contacto.taller0@gmail.com'],
      subject: `Nueva Postulación DJ: ${parsed.data.aka} (${parsed.data.realName})`,
      replyTo: parsed.data.email,
      html: `
        <div style="font-family: monospace; background-color: #000; color: #fff; padding: 20px;">
          <h2 style="color: #fff; text-transform: uppercase;">NUEVA POSTULACIÓN TALLER ZERO</h2>
          <hr style="border-color: #333;" />
          <p><strong>NOMBRE REAL:</strong> ${data.realName}</p>
          <p><strong>AKA DJ:</strong> ${data.aka}</p>
          <p><strong>TELÉFONO:</strong> ${data.phone}</p>
          <p><strong>EMAIL:</strong> ${data.email}</p>
          <p><strong>INSTAGRAM:</strong> <a href="${data.socialLink}" style="color: #4ade80;">${data.socialLink}</a></p>
          <p><strong>SOUNDCLOUD MIX:</strong> <a href="${data.djMixLink}" style="color: #4ade80;">${data.djMixLink}</a></p>
          <p><strong>PROPUESTA:</strong></p>
          <p style="background-color: #111; padding: 10px; border: 1px solid #333; white-space: pre-wrap;">${data.message}</p>
        </div>
      `,
    });

    if (error) {
      console.error('Error al enviar email con Resend:', error);
      return NextResponse.json({ error: 'Error interno enviando correo' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error en POST /api/apply:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
