import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/login', '/entradas/', '/scan/', '/eventos/resultado/'],
      },
    ],
    sitemap: 'https://taller-zero.cl/sitemap.xml',
  }
}
