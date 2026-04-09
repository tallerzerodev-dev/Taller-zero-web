import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const id = searchParams.get('id');

  try {
    if (type === 'home') {
      const data = await prisma.homeContent.findUnique({ where: { id: 'home-singleton' } });
      return NextResponse.json(data || null);
    }

    if (type === 'about') {
      const data = await prisma.aboutContent.findUnique({ where: { id: 'about-singleton' } });
      return NextResponse.json(data || null);
    }

    if (type && ['sesiones', 'Sesiones', 'sesi�nes', 'Sesi�nes', 'sesiónes', 'Sesiónes'].includes(type)) {
      // Pedir una sesión en específico (con sus artistas)
      if (id) {
        const session = await prisma.session.findUnique({
          where: { id },
          include: { artists: true }
        });
        return NextResponse.json(session);
      }
      // Pedir la lista de todas las sesiones para llenar el "Select / Dropdown"
      else {
        const sessions = await prisma.session.findMany({
          orderBy: { createdAt: 'desc' },
          select: { id: true, sessionNumber: true, title: true } // Traemos solo lo necesario para la lista
        });
        return NextResponse.json(sessions);
      }
    }

    return NextResponse.json({ error: 'Tipo no especificado' }, { status: 400 });
  } catch (error) {
    console.error("Error obteniendo datos:", error);
    return NextResponse.json({ error: 'Error del servidor conectando a base de datos' }, { status: 500 });
  }
}
