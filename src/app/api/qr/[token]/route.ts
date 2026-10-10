import { NextResponse } from 'next/server'
import QRCode from 'qrcode'

export async function GET(request: Request, { params }: { params: { token: string } }) {
  try {
    const { token } = params

    // Solo se generan QR para tokens con formato de invitación
    if (!/^tz-vip-[a-f0-9]{8,32}$/.test(token)) {
      return new NextResponse('Token inválido', { status: 400 })
    }
    
    const baseUrl = process.env.NEXTAUTH_URL || 'https://taller-zero.cl'
    const scanUrl = `${baseUrl}/scan/${token}`
    
    const qrBuffer = await QRCode.toBuffer(scanUrl, {
      color: {
        dark: '#000000', 
        light: '#ffffff' 
      },
      width: 400,
      margin: 2
    })

    // To avoid the TypeScript Error with Next.js BodyInit, we cast it to any
    // or convert it to a Blob, but Buffer is supported in Node runtime
    return new NextResponse(qrBuffer as any, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error) {
    console.error('Error generando QR PNG:', error)
    return new NextResponse('Error', { status: 500 })
  }
}
