import type { Metadata } from 'next'
import { Space_Mono, Outfit } from 'next/font/google'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Noise } from '@/components/ui/Noise'
import { Providers } from '@/components/Providers'
import { prisma } from '@/lib/prisma'
import './globals.css'
export const dynamic = 'force-dynamic'

const spaceMono = Space_Mono({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-space-mono',
})

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://tallerzero.com'),
  title: {
    template: '%s | Taller Zero',
    default: 'Taller Zero | Live Sessions',
  },
  description: 'Archivo visual y plataforma de música electrónica underground. Sesiones en formato RAW, sin censura ni fake shit. Techno, hardbounce, hypnotic techno y más desde Chile.',
  keywords: ['Taller Zero', 'Techno', 'set dj', 'raw techno', 'techno chile', 'hypnotic techno', 'hardbounce', 'bounce', 'musica electronica', 'musica electronica chile', 'live set', 'underground'],
  openGraph: {
    title: 'Taller Zero',
    description: 'Archivo visual y plataforma de música electrónica underground. Sesiones en formato RAW, sin censura ni fake shit. Techno, hardbounce, hypnotic techno y más desde Chile.',
    url: 'https://tallerzero.com',
    siteName: 'Taller Zero',
    images: [
      {
        url: '/placeholder.jpg', // Placeholder de Cloudinary si luego quieres subir el logo definitivo
        width: 1200,
        height: 630,
        alt: 'Taller Zero Portada',
      },
    ],
    locale: 'es_CL',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Taller Zero',
    description: 'Archivo visual y plataforma de música electrónica underground. Sesiones en formato RAW desde Chile.',
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const homeData = await prisma.homeContent.findUnique({
    where: { id: 'home-singleton' }
  })

  return (
    <html lang="es" className="dark scroll-smooth">
      <body className={`${spaceMono.variable} ${outfit.variable} font-sans antialiased bg-black text-white min-h-screen flex flex-col relative`}>
        <Providers>
          <Noise />
          <Navbar storeEnabled={homeData?.storeEnabled || false} />
          <div className="pt-20 flex-1 flex flex-col z-10 w-full">
            {children}
          </div>
          <Footer storeEnabled={homeData?.storeEnabled || false} />
        </Providers>
      </body>
    </html>
  )
}

