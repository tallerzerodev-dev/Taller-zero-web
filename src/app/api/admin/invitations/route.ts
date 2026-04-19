import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Resend } from 'resend'
import crypto from 'crypto'
import QRCode from 'qrcode'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function GET() {
  try {
    const invitations = await prisma.invitation.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json({ invitations })
  } catch (error) {
    console.error('Error al obtener invitaciones:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { guestName, guestEmail } = await request.json()

    if (!guestName || !guestEmail) {
      return NextResponse.json({ error: 'Nombre y correo son requeridos' }, { status: 400 })
    }

    // 1. Generar token único
    const rawToken = crypto.randomBytes(16).toString('hex')
    const token = `tz-vip-${rawToken.substring(0, 8)}`

    // 2. Crear registro en BD
    const invitation = await prisma.invitation.create({
      data: {
        guestName,
        guestEmail,
        token
      }
    })

    const baseUrl = process.env.NEXTAUTH_URL || 'https://taller-zero.cl'
    const vipUrl = `${baseUrl}/vip/${token}`
    const scanUrl = `${baseUrl}/scan/${token}`
    
    // Usar nuestro propio endpoint para servir la imagen del QR.
    // Esto funcionará perfectamente en producción (Vercel) porque la URL será pública
    // y los AdBlockers no la bloquearán porque es del mismo dominio (taller-zero.cl).
    const qrImageUrl = `${baseUrl}/api/qr/${token}`

    // 4. Plantilla de Correo HTML Brutalista y Afilada (Completamente Responsiva)
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>TALLER ZERO - ACCESO VIP</title>
        <style>
          @media screen and (max-width: 600px) {
            .container { width: 100% !important; padding: 20px 10px !important; }
            .header-title { font-size: 24px !important; }
            .guest-name { font-size: 20px !important; }
            .btn { padding: 15px 20px !important; font-size: 10px !important; display: block !important; margin: 0 auto !important; width: 80% !important; box-sizing: border-box !important; }
            .qr-image { width: 180px !important; height: 180px !important; }
            .inner-box { padding: 30px 10px !important; }
          }
        </style>
      </head>
      <body style="background-color: #000000; color: #ffffff; font-family: 'Courier New', Courier, monospace; padding: 0; margin: 0; text-align: center; -webkit-text-size-adjust: 100%;">
        
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #000000; padding: 40px 10px;" class="container">
          <tr>
            <td align="center">
              
              <!-- Contenedor Principal -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; width: 100%; background-color: #050505; border: 2px solid #222222; text-align: center;">
                
                <!-- Encabezado -->
                <tr>
                  <td style="padding: 40px 20px 20px 20px; border-bottom: 2px solid #222222;" class="inner-box">
                    <p style="color: #666666; letter-spacing: 3px; font-size: 10px; text-transform: uppercase; margin: 0 0 20px 0; font-weight: bold;">
                      /// COMUNICADO DE ACCESO ///
                    </p>
                    <h1 class="header-title" style="font-size: 32px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; margin: 0; color: #ffffff;">
                      TALLER ZERO
                    </h1>
                  </td>
                </tr>

                <!-- Cuerpo - Nombre y Botón -->
                <tr>
                  <td style="padding: 40px 20px;" class="inner-box">
                    <p style="font-size: 12px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 10px 0; color: #888888;">
                      IDENTIDAD CONFIRMADA:
                    </p>
                    <h2 class="guest-name" style="font-size: 24px; font-weight: bold; margin: 0 0 30px 0; color: #ffffff; text-transform: uppercase; letter-spacing: 1px;">
                      ${guestName}
                    </h2>
                    
                    <!-- Botón movido arriba como lo pediste -->
                    <a href="${vipUrl}" class="btn" style="display: inline-block; background-color: #ffffff; color: #000000; text-decoration: none; padding: 18px 36px; font-weight: 900; text-transform: uppercase; letter-spacing: 3px; font-size: 12px; border: 1px solid #ffffff;">
                      VER INFORMACIÓN DEL EVENTO
                    </a>
                  </td>
                </tr>

                <!-- Zona del QR -->
                <tr>
                  <td style="padding: 0 20px 40px 20px;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #111111; border: 1px solid #333333;">
                      <tr>
                        <td align="center" style="padding: 40px 20px;" class="inner-box">
                          <p style="color: #666666; font-size: 10px; text-transform: uppercase; letter-spacing: 3px; margin: 0 0 25px 0; font-weight: bold;">
                            PASE DE ENTRADA ÚNICO
                          </p>
                          
                          <!-- Usando la URL del API de tu propio dominio -->
                          <img src="${qrImageUrl}" class="qr-image" alt="Código QR Taller Zero" width="220" height="220" style="display: block; width: 220px; height: 220px; margin: 0 auto; border: 10px solid #ffffff;" />
                          
                          <p style="color: #ff3333; font-size: 10px; text-transform: uppercase; letter-spacing: 2px; margin: 25px 0 0 0; font-weight: bold;">
                            ADVERTENCIA: ESCANEO DE UN SOLO USO.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding: 30px 20px; border-top: 2px solid #222222; background-color: #020202;">
                    <p style="color: #555555; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; margin: 0; line-height: 1.8;">
                      DRESSCODE: INDUSTRIAL BLACK.<br>
                      NO FOTOS. NO FLASH.<br><br>
                      © TALLER ZERO
                    </p>
                  </td>
                </tr>

              </table>

            </td>
          </tr>
        </table>

      </body>
      </html>
    `

    // 5. Enviar el correo usando Resend con prioridad ALTA
    const resendResponse = await resend.emails.send({
      from: 'Taller Zero <contacto@taller-zero.cl>',
      to: [guestEmail],
      subject: 'TALLER ZERO - TU ACCESO EXCLUSIVO',
      html: emailHtml,
      headers: {
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
        'Importance': 'high'
      }
    })

    if (resendResponse.error) {
      console.error('Error de Resend:', resendResponse.error)
      return NextResponse.json({ error: 'Invitación creada en DB pero falló el envío de correo' }, { status: 500 })
    }

    return NextResponse.json({ success: true, invitation })

  } catch (error: any) {
    console.error('Error al generar invitación:', error)
    return NextResponse.json({ error: error.message || 'Error del servidor' }, { status: 500 })
  }
}
