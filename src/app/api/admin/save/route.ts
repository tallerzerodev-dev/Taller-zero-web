import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
// Sanitizador simple compatible con CJS/ESM: elimina etiquetas HTML
function sanitizeStr(val: string) {
  return typeof val === 'string' ? val.replace(/<[^>]*>?/gm, '') : val;
}

const HomeContentSchema = z.object({
  heroTitle: z.string().optional().default('').transform(sanitizeStr),
  heroSubtitle: z.string().optional().default('').transform(sanitizeStr),
  heroBackground: z.string().optional().default(''),
  tickerText: z.string().optional().default('').transform(sanitizeStr),
  featuredSessionId: z.string().optional().default('').transform(sanitizeStr),
  featuredSessionTitle: z.string().optional().default('').transform(sanitizeStr),
  featuredSessionGif: z.string().optional().default(''),
  featuredItemImage: z.string().optional().default(''),
  featuredItemTitle: z.string().optional().default('').transform(sanitizeStr),
  featuredItemSubtitle: z.string().optional().default('').transform(sanitizeStr),
  storeEnabled: z.boolean().optional().default(false),
});

const AboutContentSchema = z.object({
  title: z.string().optional().default('').transform(sanitizeStr),
  content: z.string().optional().default('').transform(sanitizeStr),
  coverImage: z.string().optional().default(''),
});

const ArtistSchema = z.object({
  name: z.string().optional().transform(v => v ? sanitizeStr(v) : v),
  photo: z.string().nullish(),
  bio: z.string().nullish().transform(v => v ? sanitizeStr(v) : v),
  youtube: z.string().nullish(), // URL, no es necesario purificar HTML, el parseo de URL bastaría si es estricto
});

const SessionContentSchema = z.object({
  id: z.string().optional(),
  title: z.string().transform(sanitizeStr),
  sessionNumber: z.string().optional().transform(v => v ? sanitizeStr(v) : v),
  dateText: z.string().optional().default('').transform(sanitizeStr),
  gifUrl: z.string().optional(),
  trailerUrl: z.string().optional(),
  spinup: z.string().optional().transform(v => v ? sanitizeStr(v) : v),
  showLeftColInfo: z.boolean().optional(),
  leftColLine1: z.string().optional().transform(v => v ? sanitizeStr(v) : v),
  leftColLine2: z.string().optional().transform(v => v ? sanitizeStr(v) : v),
  leftColLine3: z.string().optional().transform(v => v ? sanitizeStr(v) : v),
  artists: z.array(ArtistSchema).optional().default([]),
});

const SaveActionSchema = z.discriminatedUnion('page', [
  z.object({
    page: z.literal('home'),
    action: z.string().optional(),
    content: HomeContentSchema,
  }),
  z.object({
    page: z.literal('about'),
    action: z.string().optional(),
    content: AboutContentSchema,
  }),
  z.object({
    page: z.literal('sessions'),
    action: z.string().optional(),
    content: SessionContentSchema,
  }),
]);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('ADMIN/SAVE: Body recibido:', JSON.stringify(body));

    // Validación con Zod (SafeParse para manejo resiliente de errores)
    const result = SaveActionSchema.safeParse(body);
    console.log('ADMIN/SAVE: Resultado validación:', JSON.stringify(result, null, 2));

    if (!result.success) {
      console.log('ADMIN/SAVE: Error de validación:', JSON.stringify(result.error.flatten(), null, 2));
      return NextResponse.json(
        { error: 'Payload inválido', details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { page, action, content } = result.data;
    console.log('ADMIN/SAVE: Page:', page, 'Action:', action, 'Content:', JSON.stringify(content));

    // 1. Guardar Home
    if (page === 'home') {
      console.log('ADMIN/SAVE: Guardando HOME', JSON.stringify(content));
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
      console.log('ADMIN/SAVE: HOME guardado:', JSON.stringify(saved));
      return NextResponse.json({ success: true, data: saved });
    }

    // 2. Guardar About
    if (page === 'about') {
      console.log('ADMIN/SAVE: Guardando ABOUT', JSON.stringify(content));
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
      console.log('ADMIN/SAVE: ABOUT guardado:', JSON.stringify(saved));
      return NextResponse.json({ success: true, data: saved });
    }

    // 3. Guardar Sesión (Nueva o Editada)
    if (page === 'sessions') {
      const { artists, id, ...sessionData } = content;
      const safeArtists = Array.isArray(artists) ? artists : [];
      console.log('ADMIN/SAVE: Guardando SESION', { id, sessionData, safeArtists });

      if (action === 'new') {
        const newSession = await prisma.session.create({
          data: {
            title: sessionData.title,
            sessionNumber: sessionData.sessionNumber || '',
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
        console.log('ADMIN/SAVE: SESION nueva guardada:', JSON.stringify(newSession));
        return NextResponse.json({ success: true, data: newSession });
      } else {
        if (!id) {
          console.log('ADMIN/SAVE: Falta ID para editar sesión');
          return NextResponse.json({ error: 'Falta ID para editar' }, { status: 400 });
        }

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
        console.log('ADMIN/SAVE: SESION editada guardada:', JSON.stringify(updatedSession));
        return NextResponse.json({ success: true, data: updatedSession });
      }
    }

    console.log('ADMIN/SAVE: Página no válida:', page);
    return NextResponse.json({ error: 'Página no válida' }, { status: 400 });

  } catch (error) {
    console.error('Error guardando en Base de Datos:', error);
    return NextResponse.json({ error: 'Hubo un error del servidor' }, { status: 500 });
  }
}
