import type { Metadata } from 'next'
import { Space_Mono, Outfit } from 'next/font/google'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Noise } from '@/components/ui/Noise'
import { Providers } from '@/components/Providers'
import { prisma } from '@/lib/prisma'
import './globals.css'
export const dynamic = 'force-dynamic'
import { Analytics } from "@vercel/analytics/react"


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
  metadataBase: new URL('https://taller-zero.cl'),
  title: {
    template: '%s | Taller Zero',
    default: 'Taller Zero | Sesiones de Techno en Vivo desde Chile',
  },
  description: 'Taller Zero: plataforma de música electrónica underground desde Chile. DJ sets en vivo de techno, hypnotic techno, hardgroove y hardbounce. Sets RAW sin censura desde locaciones industriales. Los mejores DJs chilenos.',
  keywords: [
    // Marca
    'Taller Zero', 'taller zero', 'taller 0', 'taller-zero', 'tallerzero',
    // Nacional ES
    'techno Chile', 'dj set Chile', 'sesiones techno Chile', 'djs chilenos',
    'techno Santiago', 'hardgroove Chile', 'hypnotic techno Chile', 'hardbounce Chile',
    'música electrónica Chile', 'artistas locales techno', 'djs techno chilenos',
    'underground Chile', 'sets en vivo Chile', 'sesiones en vivo Chile', 'techno nacional',
    'sets dj Chile', 'artistas underground Chile', 'sesiones de techno',
    'dj set techno', 'techno hardgroove', 'groove techno Chile',
    // Internacional EN
    'techno', 'techno music', 'dj set', 'live set techno', 'underground techno',
    'hypnotic techno', 'hardgroove', 'hard groove', 'hardhouse', 'hard house',
    'raw techno', 'industrial techno', 'groovy techno', 'techno sessions',
    'electronic music', 'techno artists', 'groove techno', 'techno set', 'techno live',
    'techno underground', 'bounce techno', 'dark techno', 'techno archive',
    'dj techno', 'techno mix', 'techno dj', 'hard techno', 'techno latino',
    'latin techno', 'south american techno', 'techno south america'
  ],
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  alternates: { canonical: 'https://taller-zero.cl' },
  openGraph: {
    title: 'Taller Zero',
    description: 'Plataforma de música electrónica underground desde Chile. DJ sets RAW de techno, hypnotic techno, hardgroove y más.',
    url: 'https://taller-zero.cl',
    siteName: 'Taller Zero',
    images: [
      {
        url: '/placeholder.jpg',
        width: 1200,
        height: 630,
        alt: 'Taller Zero - Sesiones de Techno en Vivo',
      },
    ],
    locale: 'es_CL',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Taller Zero',
    description: 'Plataforma de música electrónica underground desde Chile. Sets RAW de techno y más.',
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
            <Analytics />
          </div>
          <Footer storeEnabled={homeData?.storeEnabled || false} />
        </Providers>
      </body>
    </html>
  )
}

