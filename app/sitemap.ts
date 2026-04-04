import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Get all approved profiles with slugs
  const { data: profiles } = await supabase
    .from('profiles')
    .select('slug, updated_at')
    .eq('status', 'aprobado')
    .eq('consent_publish', true)
    .not('slug', 'is', null)

  const ranchPages: MetadataRoute.Sitemap = (profiles || []).map((profile) => ({
    url: `https://www.regenerandoando.com/rancho/${profile.slug}`,
    lastModified: profile.updated_at || new Date().toISOString(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  return [
    {
      url: 'https://www.regenerandoando.com',
      lastModified: new Date().toISOString(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: 'https://www.regenerandoando.com/directorio',
      lastModified: new Date().toISOString(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: 'https://www.regenerandoando.com/mapa',
      lastModified: new Date().toISOString(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: 'https://www.regenerandoando.com/dashboard',
      lastModified: new Date().toISOString(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: 'https://www.regenerandoando.com/privacidad',
      lastModified: '2026-04-03',
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    ...ranchPages,
  ]
}
