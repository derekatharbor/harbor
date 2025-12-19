// apps/web/app/sitemap.ts
// Dynamic sitemap generation for all Harbor pages
// Pulls from ai_profiles table and auto-updates when new brands are added

import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 3600 // Regenerate every hour
export const maxDuration = 60 // Allow up to 60 seconds for large sitemap

// Category mappings for /best pages
const CATEGORIES = [
  'crm', 'project-management', 'time-tracking', 'accounting', 'hr',
  'marketing-automation', 'email-marketing', 'customer-support', 'e-commerce',
  'inventory-management', 'analytics', 'cybersecurity', 'data-management',
  'communication', 'collaboration', 'erp', 'supply-chain', 'healthcare',
  'fintech', 'legal', 'real-estate', 'education', 'ai-ml', 'devops',
  'cloud-infrastructure', 'business-intelligence', 'payments', 'recruiting'
]

// Common integrations for /best/{category}-{integration}-integration pages
const COMMON_INTEGRATIONS = [
  'salesforce', 'slack', 'quickbooks', 'hubspot', 'shopify', 'zapier',
  'stripe', 'google', 'microsoft', 'aws', 'zoom', 'jira', 'github'
]

// Helper to fetch all rows with pagination
async function fetchAllBrands(supabase: any): Promise<{ slug: string; updated_at: string | null; created_at: string | null }[]> {
  const PAGE_SIZE = 10000
  let allBrands: any[] = []
  let page = 0
  let hasMore = true

  while (hasMore) {
    const { data, error } = await supabase
      .from('ai_profiles')
      .select('slug, updated_at, created_at')
      .order('created_at', { ascending: true })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)

    if (error) {
      console.error(`Sitemap: Error fetching brands page ${page}:`, error)
      break
    }

    if (data && data.length > 0) {
      allBrands = [...allBrands, ...data]
      console.log(`Sitemap: Fetched page ${page}, got ${data.length} brands (total: ${allBrands.length})`)
      hasMore = data.length === PAGE_SIZE
      page++
    } else {
      hasMore = false
    }
  }

  return allBrands
}

// Helper to fetch all enriched profiles with pagination
async function fetchAllEnriched(supabase: any): Promise<{ slug: string; brand_name: string; category: string | null; updated_at: string | null }[]> {
  const PAGE_SIZE = 10000
  let allEnriched: any[] = []
  let page = 0
  let hasMore = true

  while (hasMore) {
    const { data, error } = await supabase
      .from('ai_profiles')
      .select('slug, brand_name, category, updated_at')
      .not('enriched_at', 'is', null)
      .not('feed_data', 'is', null)
      .order('visibility_score', { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)

    if (error) {
      console.error(`Sitemap: Error fetching enriched page ${page}:`, error)
      break
    }

    if (data && data.length > 0) {
      allEnriched = [...allEnriched, ...data]
      hasMore = data.length === PAGE_SIZE
      page++
    } else {
      hasMore = false
    }
  }

  return allEnriched
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://useharbor.io'
  const now = new Date().toISOString()

  // Static pages
  const staticUrls: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/brands`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ]

  // Check environment variables
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Sitemap: Missing Supabase environment variables')
    return staticUrls
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  // Fetch ALL enriched profiles with pagination
  const enriched = await fetchAllEnriched(supabase)
  console.log(`Sitemap: Found ${enriched.length} enriched profiles`)

  // Fetch ALL brands with pagination
  const brands = await fetchAllBrands(supabase)
  console.log(`Sitemap: Found ${brands.length} total brands`)

  // Generate /best category pages
  const bestUrls: MetadataRoute.Sitemap = CATEGORIES.map(category => ({
    url: `${baseUrl}/best/${category}`,
    lastModified: now,
    changeFrequency: 'daily' as const,
    priority: 0.85,
  }))

  // Generate /best integration pages (category + integration combos)
  const integrationUrls: MetadataRoute.Sitemap = []
  for (const category of CATEGORIES.slice(0, 10)) { // Top 10 categories
    for (const integration of COMMON_INTEGRATIONS.slice(0, 5)) { // Top 5 integrations
      integrationUrls.push({
        url: `${baseUrl}/best/${category}-${integration}-integration`,
        lastModified: now,
        changeFrequency: 'weekly' as const,
        priority: 0.75,
      })
    }
  }

  // Generate /alternatives pages (one per enriched profile)
  const alternativesUrls: MetadataRoute.Sitemap = enriched.map(profile => ({
    url: `${baseUrl}/alternatives/${profile.slug}`,
    lastModified: profile.updated_at || now,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // Generate /compare pages (top products in same category)
  // Limit to avoid explosion - only compare within top 20 of each category
  const compareUrls: MetadataRoute.Sitemap = []
  const categoryGroups: Record<string, typeof enriched> = {}
  
  for (const profile of enriched) {
    const cat = profile.category?.toLowerCase() || 'other'
    if (!categoryGroups[cat]) categoryGroups[cat] = []
    if (categoryGroups[cat].length < 20) {
      categoryGroups[cat].push(profile)
    }
  }

  for (const profiles of Object.values(categoryGroups)) {
    // Generate comparisons for first 5 products in each category
    for (let i = 0; i < Math.min(5, profiles.length); i++) {
      for (let j = i + 1; j < Math.min(10, profiles.length); j++) {
        compareUrls.push({
          url: `${baseUrl}/compare/${profiles[i].slug}-vs-${profiles[j].slug}`,
          lastModified: now,
          changeFrequency: 'weekly' as const,
          priority: 0.7,
        })
      }
    }
  }

  // Brand profile URLs and harbor.json feeds
  const brandUrls: MetadataRoute.Sitemap = brands.flatMap((brand) => {
    const lastMod = brand.updated_at || brand.created_at || now
    return [
      {
        url: `${baseUrl}/brands/${brand.slug}`,
        lastModified: lastMod,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      },
      {
        url: `${baseUrl}/brands/${brand.slug}/harbor.json`,
        lastModified: lastMod,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      },
    ]
  })

  const totalUrls = staticUrls.length + bestUrls.length + integrationUrls.length + 
                    alternativesUrls.length + compareUrls.length + brandUrls.length

  console.log(`Sitemap: Generating ${totalUrls} total URLs`)
  console.log(`  - Static: ${staticUrls.length}`)
  console.log(`  - /best: ${bestUrls.length}`)
  console.log(`  - Integration: ${integrationUrls.length}`)
  console.log(`  - /alternatives: ${alternativesUrls.length}`)
  console.log(`  - /compare: ${compareUrls.length}`)
  console.log(`  - /brands (HTML + JSON): ${brandUrls.length}`)

  return [
    ...staticUrls,
    ...bestUrls,
    ...integrationUrls,
    ...alternativesUrls,
    ...compareUrls,
    ...brandUrls,
  ]
}