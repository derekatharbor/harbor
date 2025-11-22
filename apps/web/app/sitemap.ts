// apps/web/app/sitemap.ts
// Dynamic sitemap generation for all Harbor pages
// Pulls from ai_profiles table and auto-updates when new brands are added

import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 3600 // Regenerate every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://useharbor.io'

  // Static pages
  const staticUrls: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/brands`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ]

  // Check environment variables
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Sitemap: Missing Supabase environment variables')
    return staticUrls
  }

  // Fetch all brands from ai_profiles
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  const { data: brands, error } = await supabase
    .from('ai_profiles')
    .select('slug, updated_at, created_at')
    .order('rank_global', { ascending: true })

  if (error) {
    console.error('Sitemap: Error fetching brands:', error)
    return staticUrls
  }

  if (!brands || brands.length === 0) {
    console.warn('Sitemap: No brands found in ai_profiles table')
    return staticUrls
  }

  console.log(`Sitemap: Found ${brands.length} brands`)

  // Dynamic brand + feed URLs
  const dynamicUrls: MetadataRoute.Sitemap = brands.flatMap((brand) => {
    const lastMod = brand.updated_at || brand.created_at || new Date().toISOString()

    return [
      // Brand profile page
      {
        url: `${baseUrl}/brands/${brand.slug}`,
        lastModified: lastMod,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      },
      // Brand feed (harbor.json)
      {
        url: `${baseUrl}/brands/${brand.slug}/harbor.json`,
        lastModified: lastMod,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      },
    ]
  })

  return [...staticUrls, ...dynamicUrls]
}