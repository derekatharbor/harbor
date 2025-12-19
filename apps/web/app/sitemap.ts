// apps/web/app/sitemap.ts
// Dynamic sitemap generation with automatic splitting for 50K URL limit
// Next.js App Router supports generateSitemaps() for sitemap index

import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 3600
export const maxDuration = 60

const URLS_PER_SITEMAP = 45000 // Stay under 50K limit with buffer

// Category mappings for /best pages
const CATEGORIES = [
  'crm', 'project-management', 'time-tracking', 'accounting', 'hr',
  'marketing-automation', 'email-marketing', 'customer-support', 'e-commerce',
  'inventory-management', 'analytics', 'cybersecurity', 'data-management',
  'communication', 'collaboration', 'erp', 'supply-chain', 'healthcare',
  'fintech', 'legal', 'real-estate', 'education', 'ai-ml', 'devops',
  'cloud-infrastructure', 'business-intelligence', 'payments', 'recruiting'
]

const COMMON_INTEGRATIONS = [
  'salesforce', 'slack', 'quickbooks', 'hubspot', 'shopify', 'zapier',
  'stripe', 'google', 'microsoft', 'aws', 'zoom', 'jira', 'github'
]

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// Generate sitemap index - tells Next.js how many sitemaps we need
export async function generateSitemaps() {
  const supabase = getSupabase()
  
  // Get total count of brands
  const { count: brandCount } = await supabase
    .from('ai_profiles')
    .select('*', { count: 'exact', head: true })
  
  const { count: enrichedCount } = await supabase
    .from('ai_profiles')
    .select('*', { count: 'exact', head: true })
    .not('enriched_at', 'is', null)
    .not('feed_data', 'is', null)
  
  // Estimate total URLs:
  // - Static: ~80 (best pages, integrations, etc.)
  // - Brands: brandCount * 2 (HTML + harbor.json)
  // - Alternatives: enrichedCount
  // - Compare: ~2000 estimated
  const staticUrls = 80
  const brandUrls = (brandCount || 0) * 2
  const alternativeUrls = enrichedCount || 0
  const compareUrls = 2000
  
  const totalUrls = staticUrls + brandUrls + alternativeUrls + compareUrls
  const numSitemaps = Math.ceil(totalUrls / URLS_PER_SITEMAP)
  
  console.log(`Sitemap index: ${totalUrls} total URLs, ${numSitemaps} sitemaps needed`)
  
  // Return array of sitemap IDs
  return Array.from({ length: numSitemaps }, (_, i) => ({ id: i }))
}

export default async function sitemap({ id }: { id: number }): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://useharbor.io'
  const now = new Date().toISOString()
  const supabase = getSupabase()
  
  // Calculate offset for this sitemap chunk
  const offset = id * URLS_PER_SITEMAP
  
  console.log(`Generating sitemap ${id}, offset ${offset}`)
  
  // For sitemap 0: include static pages, best pages, and start of brands
  if (id === 0) {
    // Static pages
    const staticUrls: MetadataRoute.Sitemap = [
      { url: `${baseUrl}/`, lastModified: now, changeFrequency: 'daily', priority: 1 },
      { url: `${baseUrl}/brands`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
      { url: `${baseUrl}/pricing`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    ]
    
    // /best category pages
    const bestUrls: MetadataRoute.Sitemap = CATEGORIES.map(category => ({
      url: `${baseUrl}/best/${category}`,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 0.85,
    }))
    
    // Integration pages
    const integrationUrls: MetadataRoute.Sitemap = []
    for (const category of CATEGORIES.slice(0, 10)) {
      for (const integration of COMMON_INTEGRATIONS.slice(0, 5)) {
        integrationUrls.push({
          url: `${baseUrl}/best/${category}-${integration}-integration`,
          lastModified: now,
          changeFrequency: 'weekly' as const,
          priority: 0.75,
        })
      }
    }
    
    const staticCount = staticUrls.length + bestUrls.length + integrationUrls.length
    const brandsToFetch = URLS_PER_SITEMAP - staticCount
    
    // Fetch first batch of brands (divided by 2 since each brand = 2 URLs)
    const { data: brands } = await supabase
      .from('ai_profiles')
      .select('slug, updated_at, created_at')
      .order('created_at', { ascending: true })
      .range(0, Math.floor(brandsToFetch / 2) - 1)
    
    const brandUrls: MetadataRoute.Sitemap = (brands || []).flatMap((brand) => {
      const lastMod = brand.updated_at || brand.created_at || now
      return [
        { url: `${baseUrl}/brands/${brand.slug}`, lastModified: lastMod, changeFrequency: 'weekly' as const, priority: 0.8 },
        { url: `${baseUrl}/brands/${brand.slug}/harbor.json`, lastModified: lastMod, changeFrequency: 'weekly' as const, priority: 0.7 },
      ]
    })
    
    console.log(`Sitemap 0: ${staticUrls.length} static, ${bestUrls.length} best, ${integrationUrls.length} integration, ${brandUrls.length} brand URLs`)
    
    return [...staticUrls, ...bestUrls, ...integrationUrls, ...brandUrls]
  }
  
  // For subsequent sitemaps: just brands, alternatives, compare pages
  // Calculate which brands to fetch based on sitemap ID
  
  // Account for static URLs in sitemap 0 (~80)
  const staticUrlsInFirst = 80
  const brandStartOffset = (id === 1) 
    ? Math.floor((URLS_PER_SITEMAP - staticUrlsInFirst) / 2)
    : Math.floor((URLS_PER_SITEMAP - staticUrlsInFirst) / 2) + ((id - 1) * Math.floor(URLS_PER_SITEMAP / 2))
  
  const { data: brands } = await supabase
    .from('ai_profiles')
    .select('slug, updated_at, created_at')
    .order('created_at', { ascending: true })
    .range(brandStartOffset, brandStartOffset + Math.floor(URLS_PER_SITEMAP / 2) - 1)
  
  const brandUrls: MetadataRoute.Sitemap = (brands || []).flatMap((brand) => {
    const lastMod = brand.updated_at || brand.created_at || now
    return [
      { url: `${baseUrl}/brands/${brand.slug}`, lastModified: lastMod, changeFrequency: 'weekly' as const, priority: 0.8 },
      { url: `${baseUrl}/brands/${brand.slug}/harbor.json`, lastModified: lastMod, changeFrequency: 'weekly' as const, priority: 0.7 },
    ]
  })
  
  console.log(`Sitemap ${id}: ${brandUrls.length} brand URLs (offset ${brandStartOffset})`)
  
  // For the last sitemap, include alternatives and compare pages
  const { count: totalBrands } = await supabase
    .from('ai_profiles')
    .select('*', { count: 'exact', head: true })
  
  const isLastBrandSitemap = brandStartOffset + Math.floor(URLS_PER_SITEMAP / 2) >= (totalBrands || 0)
  
  if (isLastBrandSitemap && brandUrls.length < URLS_PER_SITEMAP) {
    // Add alternatives pages
    const remainingSlots = URLS_PER_SITEMAP - brandUrls.length
    
    const { data: enriched } = await supabase
      .from('ai_profiles')
      .select('slug, category, updated_at')
      .not('enriched_at', 'is', null)
      .not('feed_data', 'is', null)
      .order('visibility_score', { ascending: false })
      .limit(remainingSlots)
    
    const alternativesUrls: MetadataRoute.Sitemap = (enriched || []).map(profile => ({
      url: `${baseUrl}/alternatives/${profile.slug}`,
      lastModified: profile.updated_at || now,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))
    
    // Generate compare pages from enriched profiles
    const compareUrls: MetadataRoute.Sitemap = []
    const categoryGroups: Record<string, typeof enriched> = {}
    
    for (const profile of enriched || []) {
      const cat = profile.category?.toLowerCase() || 'other'
      if (!categoryGroups[cat]) categoryGroups[cat] = []
      if (categoryGroups[cat].length < 20) {
        categoryGroups[cat].push(profile)
      }
    }
    
    for (const profiles of Object.values(categoryGroups)) {
      for (let i = 0; i < Math.min(5, profiles.length); i++) {
        for (let j = i + 1; j < Math.min(10, profiles.length); j++) {
          if (compareUrls.length < 3000) { // Cap compare URLs
            compareUrls.push({
              url: `${baseUrl}/compare/${profiles[i].slug}-vs-${profiles[j].slug}`,
              lastModified: now,
              changeFrequency: 'weekly' as const,
              priority: 0.7,
            })
          }
        }
      }
    }
    
    console.log(`Sitemap ${id} (last): adding ${alternativesUrls.length} alternatives, ${compareUrls.length} compare URLs`)
    
    return [...brandUrls, ...alternativesUrls, ...compareUrls]
  }
  
  return brandUrls
}