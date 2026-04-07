import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import LayoutWrapper from "@/components/LayoutWrapper"
import { Analytics } from "@vercel/analytics/react"

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  metadataBase: new URL('https://www.regenerandoando.com'),
  title: {
    default: 'Regenerando Ando — Directorio mundial de ganaderos regenerativos',
    template: '%s | Regenerando Ando',
  },
  description: 'Encuentra ganaderos regenerativos en todo el mundo. Directorio con mapa interactivo, estadísticas y resultados de ganadería regenerativa en 27 países.',
  keywords: ['ganadería regenerativa', 'directorio ganaderos', 'pastoreo racional', 'manejo holístico', 'PRV', 'silvopastoril', 'ganadería sostenible', 'regenerative ranching'],
  authors: [{ name: 'Daniel Suárez', url: 'https://ganaderiaregenerativa.com' }],
  creator: 'Daniel Suárez — GanaderiaRegenerativa.com',
  openGraph: {
    type: 'website',
    locale: 'es_MX',
    url: 'https://www.regenerandoando.com',
    siteName: 'Regenerando Ando',
    title: 'Regenerando Ando — Directorio mundial de ganaderos regenerativos',
    description: 'Encuentra ganaderos regenerativos en todo el mundo. Directorio con mapa interactivo, estadísticas y resultados de ganadería regenerativa.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Regenerando Ando — Directorio mundial de ganaderos regenerativos',
    description: 'Encuentra ganaderos regenerativos en todo el mundo. Directorio, mapa interactivo y estadísticas.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large' as const,
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://www.regenerandoando.com',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <LayoutWrapper>{children}</LayoutWrapper>
        <Analytics />
      </body>
    </html>
  )
}
