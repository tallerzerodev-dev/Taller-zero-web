import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function destroyCloudinaryFile(url: string | null | undefined) {
  if (!url || !url.includes('res.cloudinary.com')) return;
  try {
    const parts = url.split('/');
    const uploadIndex = parts.indexOf('upload');
    if (uploadIndex === -1) return;
    const pathParts = parts.slice(uploadIndex + 2);
    const fullPath = pathParts.join('/');
    const publicId = fullPath.substring(0, fullPath.lastIndexOf('.')) || fullPath;
    
    const isVideo = url.toLowerCase().endsWith('.mp4') || url.toLowerCase().endsWith('.webm') || url.toLowerCase().endsWith('.mov');
    await cloudinary.uploader.destroy(publicId, { resource_type: isVideo ? 'video' : 'image' });
    console.log('ADMIN/SAVE: Archivo eliminado de Cloudinary:', publicId);
  } catch (err) {
    console.error('ADMIN/SAVE: Error eliminando archivo de Cloudinary:', err);
  }
}
// Sanitizador simple compatible con CJS/ESM: elimina etiquetas HTML
function sanitizeStr(val: string) {
  return typeof val === 'string' ? val.replace(/<[^>]*>?/gm, '') : val;
}

const HomeContentSchema = z.object({
  heroTitle: z.string().nullish().transform(v => v ? sanitizeStr(v) : ''),
  heroSubtitle: z.string().nullish().transform(v => v ? sanitizeStr(v) : ''),
  heroBackground: z.string().nullish().transform(v => v || ''),
  tickerText: z.string().nullish().transform(v => v ? sanitizeStr(v) : ''),
  featuredSessionId: z.string().nullish().transform(v => v ? sanitizeStr(v) : ''),
  featuredSessionTitle: z.string().nullish().transform(v => v ? sanitizeStr(v) : ''),
  featuredSessionGif: z.string().nullish().transform(v => v || ''),
  featuredItemImage: z.string().nullish().transform(v => v || ''),
  featuredItemTitle: z.string().nullish().transform(v => v ? sanitizeStr(v) : ''),
  featuredItemSubtitle: z.string().nullish().transform(v => v ? sanitizeStr(v) : ''),
  storeEnabled: z.boolean().nullish().transform(v => Boolean(v)),
});

const AboutContentSchema = z.object({
  title: z.string().nullish().transform(v => v ? sanitizeStr(v) : ''),
  content: z.string().nullish().transform(v => v ? sanitizeStr(v) : ''),
  coverImage: z.string().nullish().transform(v => v || ''),
});

const ArtistSchema = z.object({
  name: z.string().nullish().transform(v => v ? sanitizeStr(v) : ''),
  photo: z.string().nullish(),
  profilePhoto: z.string().nullish(),
  bio: z.string().nullish().transform(v => v ? sanitizeStr(v) : ''),
  youtube: z.string().nullish(), // URL, no es necesario purificar HTML, el parseo de URL bastaría si es estricto
});

const SessionContentSchema = z.object({
  id: z.string().nullish().transform(v => v || ''),
  title: z.string().nullish().transform(v => v ? sanitizeStr(v) : ''),
  sessionNumber: z.string().nullish().transform(v => v ? sanitizeStr(v) : ''),
  dateText: z.string().nullish().transform(v => v ? sanitizeStr(v) : ''),
  gifUrl: z.string().nullish().transform(v => v || ''),
  trailerUrl: z.string().nullish().transform(v => v || ''),
  spinup: z.string().nullish().transform(v => v ? sanitizeStr(v) : ''),
  showLeftColInfo: z.boolean().nullish().transform(v => Boolean(v)),
  leftColLine1: z.string().nullish().transform(v => v ? sanitizeStr(v) : ''),
  leftColLine2: z.string().nullish().transform(v => v ? sanitizeStr(v) : ''),
  leftColLine3: z.string().nullish().transform(v => v ? sanitizeStr(v) : ''),
  artists: z.array(ArtistSchema).nullish().transform(v => v || []),
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
      const existing = await prisma.homeContent.findUnique({ where: { id: 'home-singleton' } });
      if (existing) {
        if (existing.heroBackground && existing.heroBackground !== content.heroBackground) await destroyCloudinaryFile(existing.heroBackground);
        if (existing.featuredSessionGif && existing.featuredSessionGif !== content.featuredSessionGif) await destroyCloudinaryFile(existing.featuredSessionGif);
        if (existing.featuredItemImage && existing.featuredItemImage !== content.featuredItemImage) await destroyCloudinaryFile(existing.featuredItemImage);
      }
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
      const existing = await prisma.aboutContent.findUnique({ where: { id: 'about-singleton' } });
      if (existing) {
        if (existing.coverImage && existing.coverImage !== content.coverImage) await destroyCloudinaryFile(existing.coverImage);
      }
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
                profilePhoto: a.profilePhoto,
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

        // Eliminamos fotos de Cloudinary viejas
        const existingSession = await prisma.session.findUnique({
          where: { id: id },
          include: { artists: true }
        });
        if (existingSession) {
          if (existingSession.gifUrl && existingSession.gifUrl !== sessionData.gifUrl) await destroyCloudinaryFile(existingSession.gifUrl);
          if (existingSession.trailerUrl && existingSession.trailerUrl !== sessionData.trailerUrl) await destroyCloudinaryFile(existingSession.trailerUrl);
          
          const newPhotos = new Set(safeArtists.map((a: any) => a.photo).filter(Boolean));
          const newProfilePhotos = new Set(safeArtists.map((a: any) => a.profilePhoto).filter(Boolean));
          
          for (const oldArtist of existingSession.artists as any[]) {
            if (oldArtist.photo && !newPhotos.has(oldArtist.photo)) await destroyCloudinaryFile(oldArtist.photo);
            if (oldArtist.profilePhoto && !newProfilePhotos.has(oldArtist.profilePhoto)) await destroyCloudinaryFile(oldArtist.profilePhoto);
          }
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
                profilePhoto: a.profilePhoto,
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
