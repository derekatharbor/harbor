// apps/web/app/sitemap.ts
// Dynamic sitemap generation for all Harbor pages
// Pulls from ai_profiles table and auto-updates when new brands are added

import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 3600 // Regenerate every hour

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

  // Fetch enriched profiles for alternatives and comparisons
  const { data: enrichedProfiles, error: enrichedError } = await supabase
    .from('ai_profiles')
    .select('slug, brand_name, category, updated_at')
    .not('enriched_at', 'is', null)
    .not('feed_data', 'is', null)
    .order('visibility_score', { ascending: false })

  if (enrichedError) {
    console.error('Sitemap: Error fetching enriched profiles:', enrichedError)
  }

  const enriched = enrichedProfiles || []
  console.log(`Sitemap: Found ${enriched.length} enriched profiles`)

  // Fetch all brands for brand pages
  const { data: allBrands, error: brandsError } = await supabase
    .from('ai_profiles')
    .select('slug, updated_at, created_at')
    .order('rank_global', { ascending: true })

  if (brandsError) {
    console.error('Sitemap: Error fetching brands:', brandsError)
  }

  const brands = allBrands || []
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

  // Brand profile and feed URLs
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

  console.log(`Sitemap: ${bestUrls.length} /best, ${integrationUrls.length} integration, ${alternativesUrls.length} /alternatives, ${compareUrls.length} /compare, ${brandUrls.length / 2} brands`)

  return [
    ...staticUrls,
    ...bestUrls,
    ...integrationUrls,
    ...alternativesUrls,
    ...compareUrls,
    ...brandUrls,
  ]
}