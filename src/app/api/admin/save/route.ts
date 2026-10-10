import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { v2 as cloudinary } from 'cloudinary';
import { requireAdmin } from '@/lib/require-admin'
import { UPLOAD_FOLDER } from '@/lib/upload-rules'

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const OWN_CLOUDINARY_PREFIX = `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/`;

async function destroyCloudinaryFile(url: string | null | undefined) {
  if (!url || !url.startsWith(OWN_CLOUDINARY_PREFIX) || !url.includes(`/${UPLOAD_FOLDER}/`)) return;
  try {
    const parts = url.split('/');
    const uploadIndex = parts.indexOf('upload');
    if (uploadIndex === -1) return;
    const pathParts = parts.slice(uploadIndex + 2);
    const fullPath = pathParts.join('/');
    const publicId = fullPath.substring(0, fullPath.lastIndexOf('.')) || fullPath;
    
    const isVideo = url.toLowerCase().endsWith('.mp4') || url.toLowerCase().endsWith('.webm') || url.toLowerCase().endsWith('.mov');
    await cloudinary.uploader.destroy(publicId, { resource_type: isVideo ? 'video' : 'image' });
  } catch (err) {
    console.error('ADMIN/SAVE: Error eliminando archivo de Cloudinary:', err);
  }
}
// Sanitizador simple compatible con CJS/ESM: elimina etiquetas HTML
function sanitizeStr(val: string) {
  return typeof val === 'string' ? val.replace(/<[^>]*>?/gm, '') : val;
}

const isSafeUrl = (v: string) => v === '' || v.startsWith('https://') || (v.startsWith('/') && !v.startsWith('//'));
const mediaUrl = z.string().max(2000).nullish().transform(v => v || '').refine(isSafeUrl, 'URL no permitida');

function parseInfoSquares(value: unknown) {
  if (!value) return undefined;
  let raw = value;
  if (typeof raw === 'string') {
    try { raw = JSON.parse(raw); } catch { return undefined; }
  }
  const parsed = z.array(InfoSquareSchema).max(20).safeParse(raw);
  return parsed.success ? parsed.data : undefined;
}

const HomeContentSchema = z.object({
  heroTitle: z.string().nullish().transform(v => v ? sanitizeStr(v) : ''),
  heroSubtitle: z.string().nullish().transform(v => v ? sanitizeStr(v) : ''),
  heroBackground: mediaUrl,
  tickerText: z.string().nullish().transform(v => v ? sanitizeStr(v) : ''),
  featuredSessionId: z.string().nullish().transform(v => v ? sanitizeStr(v) : ''),
  featuredSessionTitle: z.string().nullish().transform(v => v ? sanitizeStr(v) : ''),
  featuredSessionGif: mediaUrl,
  featuredItemImage: mediaUrl,
  featuredItemTitle: z.string().nullish().transform(v => v ? sanitizeStr(v) : ''),
  featuredItemSubtitle: z.string().nullish().transform(v => v ? sanitizeStr(v) : ''),
  storeEnabled: z.boolean().nullish().transform(v => Boolean(v)),
  applicationsEnabled: z.boolean().nullish().transform(v => Boolean(v)),
});

const InfoSquareSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  bgColor: z.string().optional(),
}).catch({}); // Fallback en caso de que un elemento esté mal formado

const AboutContentSchema = z.object({
  title: z.string().nullish().transform(v => v ? sanitizeStr(v) : ''),
  content: z.string().nullish().transform(v => v ? sanitizeStr(v) : ''),
  coverImage: mediaUrl,
  showMarquee: z.boolean().nullish().transform(v => v === null || v === undefined ? true : Boolean(v)),
  marqueeText: z.string().nullish().transform(v => v ? sanitizeStr(v) : ''),
  infoSquares: z.union([z.string(), z.array(InfoSquareSchema), z.unknown()]).nullish(),
});

const ArtistSchema = z.object({
  name: z.string().nullish().transform(v => v ? sanitizeStr(v) : ''),
  photo: mediaUrl,
  profilePhoto: mediaUrl,
  bio: z.string().nullish().transform(v => v ? sanitizeStr(v) : ''),
  youtube: mediaUrl,
});

const SessionContentSchema = z.object({
  id: z.string().nullish().transform(v => v || ''),
  title: z.string().nullish().transform(v => v ? sanitizeStr(v) : ''),
  sessionNumber: z.string().nullish().transform(v => v ? sanitizeStr(v) : ''),
  dateText: z.string().nullish().transform(v => v ? sanitizeStr(v) : ''),
  gifUrl: mediaUrl,
  trailerUrl: mediaUrl,
  spinup: z.string().nullish().transform(v => v ? sanitizeStr(v) : ''),
  showLeftColInfo: z.boolean().nullish().transform(v => Boolean(v)),
  leftColLine1: z.string().nullish().transform(v => v ? sanitizeStr(v) : ''),
  leftColLine2: z.string().nullish().transform(v => v ? sanitizeStr(v) : ''),
  leftColLine3: z.string().nullish().transform(v => v ? sanitizeStr(v) : ''),
  artists: z.array(ArtistSchema).nullish().transform(v => v || []),
});

const VipEventContentSchema = z.object({
  title: z.string().nullish().transform(v => v ? sanitizeStr(v) : ''),
  dateText: z.string().nullish().transform(v => v ? sanitizeStr(v) : ''),
  location: z.string().nullish().transform(v => v ? sanitizeStr(v) : ''),
  rules: z.string().nullish().transform(v => v ? sanitizeStr(v) : ''),
  lineup: z.string().nullish().transform(v => v ? sanitizeStr(v) : ''),
  welcomeImage: mediaUrl,
  welcomeText: z.string().nullish().transform(v => v ? sanitizeStr(v) : ''),
  infoImage: mediaUrl,
  farewellText: z.string().nullish().transform(v => v ? sanitizeStr(v) : ''),
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
  z.object({
    page: z.literal('vip'),
    action: z.string().optional(),
    content: VipEventContentSchema,
  }),
  z.object({
    page: z.literal('winner'),
    action: z.string().optional(),
    content: VipEventContentSchema, // Usa el mismo esquema porque los campos son idénticos
  }),
  z.object({
    page: z.literal('email'),
    action: z.string().optional(),
    content: z.object({
      subjectGuest: z.string().nullish().transform(v => v ? sanitizeStr(v) : ''),
      titleGuest: z.string().nullish().transform(v => v ? sanitizeStr(v) : ''),
      messageGuest: z.string().nullish().transform(v => v ? sanitizeStr(v) : ''),
      subjectWinner: z.string().nullish().transform(v => v ? sanitizeStr(v) : ''),
      titleWinner: z.string().nullish().transform(v => v ? sanitizeStr(v) : ''),
      messageWinner: z.string().nullish().transform(v => v ? sanitizeStr(v) : ''),
      footer: z.string().nullish().transform(v => v ? sanitizeStr(v) : ''),
    }),
  }),
]);

export async function POST(request: Request) {
  try {
    const auth = await requireAdmin()
    if (auth.response) return auth.response

    const body = await request.json().catch(() => null);

    // Validación con Zod (SafeParse para manejo resiliente de errores)
    const result = SaveActionSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Payload inválido', details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { page, action, content } = result.data;

    // 1. Guardar Home
    if (page === 'home') {
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
          applicationsEnabled: content.applicationsEnabled,
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
          applicationsEnabled: Boolean(content.applicationsEnabled),
        },
      });
      return NextResponse.json({ success: true, data: saved });
    }

    // 2. Guardar About
    if (page === 'about') {
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
          showMarquee: content.showMarquee,
          marqueeText: content.marqueeText,
          infoSquares: parseInfoSquares(content.infoSquares),
        },
        create: {
          id: 'about-singleton',
          title: content.title || '',
          content: content.content || '',
          coverImage: content.coverImage || '',
          showMarquee: content.showMarquee !== undefined ? content.showMarquee : true,
          marqueeText: content.marqueeText || '',
          infoSquares: parseInfoSquares(content.infoSquares),
        },
      });
      return NextResponse.json({ success: true, data: saved });
    }

    // 3. Guardar Sesión (Nueva o Editada)
    if (page === 'sessions') {
      const { artists, id, ...sessionData } = content;
      const safeArtists = Array.isArray(artists) ? artists : [];

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
        return NextResponse.json({ success: true, data: newSession });
      } else {
        if (!id) {
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

        // Eliminamos los artistas antiguos y los reemplazamos por los nuevos de forma segura usando una transacción
        const updatedSession = await prisma.$transaction(async (tx) => {
          await tx.artist.deleteMany({
            where: { sessionId: id }
          });

          return tx.session.update({
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
        });
        return NextResponse.json({ success: true, data: updatedSession });
      }
    }


    // 4. Guardar VipEventContent
    if (page === 'vip') {
      const existing = await prisma.vipEventContent.findUnique({ where: { id: 'vip-singleton' } });
      if (existing) {
        if (existing.welcomeImage && existing.welcomeImage !== content.welcomeImage) await destroyCloudinaryFile(existing.welcomeImage);
        if (existing.infoImage && existing.infoImage !== content.infoImage) await destroyCloudinaryFile(existing.infoImage);
      }
      const saved = await prisma.vipEventContent.upsert({
        where: { id: 'vip-singleton' },
        update: {
          title: content.title,
          dateText: content.dateText,
          location: content.location,
          rules: content.rules,
          lineup: content.lineup,
          welcomeImage: content.welcomeImage,
          welcomeText: content.welcomeText,
          infoImage: content.infoImage,
          farewellText: content.farewellText,
        },
        create: {
          id: 'vip-singleton',
          title: content.title || '',
          dateText: content.dateText || '',
          location: content.location || '',
          rules: content.rules || '',
          lineup: content.lineup || '',
          welcomeImage: content.welcomeImage || '',
          welcomeText: content.welcomeText || '',
          infoImage: content.infoImage || '',
          farewellText: content.farewellText || '',
        },
      });
      return NextResponse.json({ success: true, data: saved });
    }

    // 5. Guardar WinnerEventContent
    if (page === 'winner') {
      const existing = await prisma.winnerEventContent.findUnique({ where: { id: 'winner-singleton' } });
      if (existing) {
        if (existing.welcomeImage && existing.welcomeImage !== content.welcomeImage) await destroyCloudinaryFile(existing.welcomeImage);
        if (existing.infoImage && existing.infoImage !== content.infoImage) await destroyCloudinaryFile(existing.infoImage);
      }
      const saved = await prisma.winnerEventContent.upsert({
        where: { id: 'winner-singleton' },
        update: {
          title: content.title,
          dateText: content.dateText,
          location: content.location,
          rules: content.rules,
          lineup: content.lineup,
          welcomeImage: content.welcomeImage,
          welcomeText: content.welcomeText,
          infoImage: content.infoImage,
          farewellText: content.farewellText,
        },
        create: {
          id: 'winner-singleton',
          title: content.title || '',
          dateText: content.dateText || '',
          location: content.location || '',
          rules: content.rules || '',
          lineup: content.lineup || '',
          welcomeImage: content.welcomeImage || '',
          welcomeText: content.welcomeText || '',
          infoImage: content.infoImage || '',
          farewellText: content.farewellText || '',
        },
      });
      return NextResponse.json({ success: true, data: saved });
    }

    // 6. Guardar EmailTemplateContent
    if (page === 'email') {
      const saved = await prisma.emailTemplateContent.upsert({
        where: { id: 'email-singleton' },
        update: {
          subjectGuest: content.subjectGuest,
          titleGuest: content.titleGuest,
          messageGuest: content.messageGuest,
          subjectWinner: content.subjectWinner,
          titleWinner: content.titleWinner,
          messageWinner: content.messageWinner,
          footer: content.footer,
        },
        create: {
          id: 'email-singleton',
          subjectGuest: content.subjectGuest || '',
          titleGuest: content.titleGuest || '',
          messageGuest: content.messageGuest || '',
          subjectWinner: content.subjectWinner || '',
          titleWinner: content.titleWinner || '',
          messageWinner: content.messageWinner || '',
          footer: content.footer || '',
        },
      });
      return NextResponse.json({ success: true, data: saved });
    }

    return NextResponse.json({ error: 'Página no válida' }, { status: 400 });

  } catch (error) {
    console.error('Error guardando en Base de Datos:', error);
    return NextResponse.json({ error: 'Hubo un error del servidor' }, { status: 500 });
  }
}
