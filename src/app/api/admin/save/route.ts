import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { page, action, content } = body;

    // 1. Guardar Home
    if (page === 'home') {
      const saved = await prisma.homeContent.upsert({
        where: { id: 'home-singleton' },
        update: {
          heroTitle: content.heroTitle,
          heroSubtitle: content.heroSubtitle,
          heroBackground: content.heroBackground,
          tickerText: content.tickerText,
          featuredSessionId: content.featuredSessionId,
          featuredSessionTitle: content.featuredSessionTitle,
          featuredSessionGif: content.featuredSessionGif,
          featuredItemImage: content.featuredItemImage,
          featuredItemTitle: content.featuredItemTitle,
          featuredItemSubtitle: content.featuredItemSubtitle,
          storeEnabled: content.storeEnabled,
        },
        create: {
          id: 'home-singleton',
          heroTitle: content.heroTitle || '',
          heroSubtitle: content.heroSubtitle || '',
          heroBackground: content.heroBackground || '',
          tickerText: content.tickerText || '',
          featuredSessionId: content.featuredSessionId || '',
          featuredSessionTitle: content.featuredSessionTitle || '',
          featuredSessionGif: content.featuredSessionGif || '',
          featuredItemImage: content.featuredItemImage || '',
          featuredItemTitle: content.featuredItemTitle || '',
          featuredItemSubtitle: content.featuredItemSubtitle || '',
          storeEnabled: Boolean(content.storeEnabled),
        },
      });
      return NextResponse.json({ success: true, data: saved });
    }

    // 2. Guardar About
    if (page === 'about') {
      const saved = await prisma.aboutContent.upsert({
        where: { id: 'about-singleton' },
        update: {
          title: content.title,
          content: content.content,
          coverImage: content.coverImage,
        },
        create: {
          id: 'about-singleton',
          title: content.title || '',
          content: content.content || '',
          coverImage: content.coverImage || '',
        },
      });
      return NextResponse.json({ success: true, data: saved });
    }

    // 3. Guardar Sesión (Nueva o Editada)
    if (page && ['sesiones', 'Sesiones', 'sesi�nes', 'Sesi�nes', 'sesiónes', 'Sesiónes'].includes(page)) {
      const { artists, id, createdAt, updatedAt, session, ...sessionData } = content;
      const safeArtists = Array.isArray(artists) ? artists : [];

      if (action === 'new') {
        const newSession = await prisma.session.create({
          data: {
            title: sessionData.title,
            sessionNumber: sessionData.sessionNumber,
            dateText: sessionData.dateText,
            gifUrl: sessionData.gifUrl,
            trailerUrl: sessionData.trailerUrl,
            spinup: sessionData.spinup,
            showLeftColInfo: sessionData.showLeftColInfo,
            leftColLine1: sessionData.leftColLine1,
            leftColLine2: sessionData.leftColLine2,
            leftColLine3: sessionData.leftColLine3,
            artists: {
              create: safeArtists.map((a: any) => ({
                name: a.name || 'Artista ' + Math.floor(Math.random() * 1000),
                photo: a.photo,
                bio: a.bio,
                youtube: a.youtube,
              })),
            },
          },
        });
        return NextResponse.json({ success: true, data: newSession });
      } else {
        if (!id) return NextResponse.json({ error: 'Falta ID para editar' }, { status: 400 });

        // Eliminamos los artistas antiguos y los reemplazamos por los nuevos (estrategia sencilla de actualización 1 a muchos)
        await prisma.artist.deleteMany({
          where: { sessionId: id }
        });

        const updatedSession = await prisma.session.update({
          where: { id: id },
          data: {
            title: sessionData.title,
            sessionNumber: sessionData.sessionNumber,
            dateText: sessionData.dateText,
            gifUrl: sessionData.gifUrl,
            trailerUrl: sessionData.trailerUrl,
            spinup: sessionData.spinup,
            showLeftColInfo: sessionData.showLeftColInfo,
            leftColLine1: sessionData.leftColLine1,
            leftColLine2: sessionData.leftColLine2,
            leftColLine3: sessionData.leftColLine3,
            artists: {
              create: safeArtists.map((a: any) => ({
                name: a.name || 'Artista ' + Math.floor(Math.random() * 1000),
                photo: a.photo,
                bio: a.bio,
                youtube: a.youtube,
              })),
            },
          },
        });
        return NextResponse.json({ success: true, data: updatedSession });
      }
    }

    return NextResponse.json({ error: 'Página no válida' }, { status: 400 });

  } catch (error) {
    console.error('Error guardando en Base de Datos:', error);
    return NextResponse.json({ error: 'Hubo un error del servidor' }, { status: 500 });
  }
}
