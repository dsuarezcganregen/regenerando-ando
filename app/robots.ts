import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/mi-perfil/', '/api/', '/auth/'],
      },
    ],
    sitemap: 'https://www.regenerandoando.com/sitemap.xml',
  }
}
