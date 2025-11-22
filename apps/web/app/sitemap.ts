// apps/web/app/sitemap.ts
// Dynamic sitemap generation for all Harbor pages
// Auto-updates when new brands are added

import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const revalidate = 3600 // Regenerate every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://useharbor.io'

  // Fetch all brands from database
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: brands } = await supabase
    .from('ai_profiles')
    .select('slug, updated_at, created_at')
    .order('rank_global', { ascending: true })

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${siteUrl}/brands`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ]

  // Brand profile pages
  const brandPages: MetadataRoute.Sitemap = (brands || []).map((brand) => ({
    url: `${siteUrl}/brands/${brand.slug}`,
    lastModified: new Date(brand.updated_at || brand.created_at),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // AI Feed endpoints (for crawler discoverability)
  const feedPages: MetadataRoute.Sitemap = (brands || []).map((brand) => ({
    url: `${siteUrl}/brands/${brand.slug}/harbor.json`,
    lastModified: new Date(brand.updated_at || brand.created_at),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  return [...staticPages, ...brandPages, ...feedPages]
}
