// apps/web/app/sitemap.ts
// Dynamic sitemap generation for all Harbor pages
// Pulls from ai_profiles table and auto-updates when new brands are added

import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'
import { readdirSync, statSync } from 'fs'
import { join } from 'path'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 3600 // Regenerate every hour

// Get all generated pages from a directory
function getGeneratedPages(dir: string, urlPrefix: string): { url: string; lastModified: Date }[] {
  try {
    const fullPath = join(process.cwd(), dir)
    const entries = readdirSync(fullPath, { withFileTypes: true })
    
    return entries
      .filter(entry => entry.isDirectory())
      .map(entry => {
        const pagePath = join(fullPath, entry.name, 'page.tsx')
        try {
          const stats = statSync(pagePath)
          return {
            url: `${urlPrefix}/${entry.name}`,
            lastModified: stats.mtime,
          }
        } catch {
          return {
            url: `${urlPrefix}/${entry.name}`,
            lastModified: new Date(),
          }
        }
      })
  } catch {
    return []
  }
}

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
    {
      url: `${baseUrl}/best`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/alternatives`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/compare`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ]

  // Generated listicle pages
  const bestPages = getGeneratedPages('app/best', `${baseUrl}/best`)
  const alternativesPages = getGeneratedPages('app/alternatives', `${baseUrl}/alternatives`)
  const comparePages = getGeneratedPages('app/compare', `${baseUrl}/compare`)
  
  const generatedUrls: MetadataRoute.Sitemap = [
    ...bestPages.map(page => ({
      url: page.url,
      lastModified: page.lastModified.toISOString(),
      changeFrequency: 'daily' as const,
      priority: 0.85,
    })),
    ...alternativesPages.map(page => ({
      url: page.url,
      lastModified: page.lastModified.toISOString(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    })),
    ...comparePages.map(page => ({
      url: page.url,
      lastModified: page.lastModified.toISOString(),
      changeFrequency: 'daily' as const,
      priority: 0.75,
    })),
  ]
  
  console.log(`Sitemap: Found ${bestPages.length} /best, ${alternativesPages.length} /alternatives, ${comparePages.length} /compare pages`)

  // Check environment variables
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Sitemap: Missing Supabase environment variables')
    return [...staticUrls, ...generatedUrls]
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
    return [...staticUrls, ...generatedUrls]
  }

  if (!brands || brands.length === 0) {
    console.warn('Sitemap: No brands found in ai_profiles table')
    return [...staticUrls, ...generatedUrls]
  }

  console.log(`Sitemap: Found ${brands.length} brands`)

  // Dynamic brand + feed URLs
  const dynamicUrls: MetadataRoute.Sitemap = brands.flatMap((brand) => {
    // Use updated_at if available, otherwise created_at
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

  return [...staticUrls, ...generatedUrls, ...dynamicUrls]
}