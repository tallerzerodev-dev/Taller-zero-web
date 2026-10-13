import { NextResponse } from 'next/server'
import QRCode from 'qrcode'
import { SITE_URL } from '@/lib/site'
import { TICKET_CODE_PATTERN } from '@/lib/tickets'

export async function GET(request: Request, { params }: { params: { token: string } }) {
  try {
    const { token } = params

    // Solo se generan QR para tokens con formato de invitación o de entrada
    if (!/^tz-vip-[a-f0-9]{8,32}$/.test(token) && !TICKET_CODE_PATTERN.test(token)) {
      return new NextResponse('Token inválido', { status: 400 })
    }
    
    const baseUrl = SITE_URL
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
