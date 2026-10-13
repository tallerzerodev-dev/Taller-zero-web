import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'
import { SITE_URL } from '@/lib/site'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_URL

  // Rutas estáticas
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/sessions`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/galeria`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ]

  // Rutas dinámicas de sesiones y artistas
  let dynamicRoutes: MetadataRoute.Sitemap = []
  try {
    const sessions = await prisma.session.findMany({
      include: { artists: true },
      orderBy: { createdAt: 'desc' },
    })

    for (const session of sessions) {
      // Página de sesión
      dynamicRoutes.push({
        url: `${baseUrl}/sessions/${session.id}`,
        lastModified: session.updatedAt ?? new Date(),
        changeFrequency: 'monthly',
        priority: 0.85,
      })

      // Páginas de cada artista
      for (const artist of session.artists) {
        dynamicRoutes.push({
          url: `${baseUrl}/sessions/${session.id}/artist/${artist.id}`,
          lastModified: session.updatedAt ?? new Date(),
          changeFrequency: 'monthly',
          priority: 0.75,
        })
      }
    }
  } catch (e) {
    console.error('Sitemap: error fetching sessions', e)
  }

  try {
    const events = await prisma.event.findMany({
      where: { status: 'PUBLISHED', startsAt: { gte: new Date() } },
      select: { slug: true, updatedAt: true },
    })
    if (events.length > 0) {
      dynamicRoutes.push({ url: `${baseUrl}/eventos`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 })
    }
    for (const event of events) {
      dynamicRoutes.push({
        url: `${baseUrl}/eventos/${event.slug}`,
        lastModified: event.updatedAt,
        changeFrequency: 'daily',
        priority: 0.9,
      })
    }
  } catch (e) {
    console.error('Sitemap: error fetching events', e)
  }

  return [...staticRoutes, ...dynamicRoutes]
}
