// apps/web/app/sitemap.ts
// Dynamic sitemap generation with automatic splitting for 50K URL limit

import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const maxDuration = 60

const URLS_PER_SITEMAP = 45000
const BRANDS_PER_SITEMAP = 22000 // Each brand = 2 URLs (HTML + JSON)

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
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return null
  }
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
}

// Hardcoded sitemap count - update when brand count significantly changes
// Current: ~170K brands = 8 brand sitemaps + 1 for alternatives/compare + 1 buffer
export async function generateSitemaps() {
  return Array.from({ length: 10 }, (_, i) => ({ id: i }))
}

export default async function sitemap({ id }: { id: number }): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://useharbor.io'
  const now = new Date().toISOString()
  const supabase = getSupabase()
  
  // Fallback if no DB connection
  if (!supabase) {
    return [
      { url: `${baseUrl}/`, lastModified: now, changeFrequency: 'daily', priority: 1 },
      { url: `${baseUrl}/brands`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    ]
  }
  
  // Sitemap 0: Static pages + first batch of brands
  if (id === 0) {
    const staticUrls: MetadataRoute.Sitemap = [
      { url: `${baseUrl}/`, lastModified: now, changeFrequency: 'daily', priority: 1 },
      { url: `${baseUrl}/brands`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
      { url: `${baseUrl}/pricing`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    ]
    
    const bestUrls: MetadataRoute.Sitemap = CATEGORIES.map(cat => ({
      url: `${baseUrl}/best/${cat}`,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 0.85,
    }))
    
    const integrationUrls: MetadataRoute.Sitemap = []
    for (const cat of CATEGORIES.slice(0, 10)) {
      for (const int of COMMON_INTEGRATIONS.slice(0, 5)) {
        integrationUrls.push({
          url: `${baseUrl}/best/${cat}-${int}-integration`,
          lastModified: now,
          changeFrequency: 'weekly' as const,
          priority: 0.75,
        })
      }
    }
    
    const staticCount = staticUrls.length + bestUrls.length + integrationUrls.length
    const brandsInFirst = Math.floor((URLS_PER_SITEMAP - staticCount) / 2)
    
    const { data: brands } = await supabase
      .from('ai_profiles')
      .select('slug, updated_at, created_at')
      .order('created_at', { ascending: true })
      .range(0, brandsInFirst - 1)
    
    const brandUrls = (brands || []).flatMap(b => [
      { url: `${baseUrl}/brands/${b.slug}`, lastModified: b.updated_at || b.created_at || now, changeFrequency: 'weekly' as const, priority: 0.8 },
      { url: `${baseUrl}/brands/${b.slug}/harbor.json`, lastModified: b.updated_at || b.created_at || now, changeFrequency: 'weekly' as const, priority: 0.7 },
    ])
    
    return [...staticUrls, ...bestUrls, ...integrationUrls, ...brandUrls]
  }
  
  // Sitemap 9: Alternatives and compare pages
  if (id === 9) {
    const { data: enriched } = await supabase
      .from('ai_profiles')
      .select('slug, category, updated_at')
      .not('enriched_at', 'is', null)
      .not('feed_data', 'is', null)
      .order('visibility_score', { ascending: false })
      .limit(30000)
    
    const alternativesUrls: MetadataRoute.Sitemap = (enriched || []).map(p => ({
      url: `${baseUrl}/alternatives/${p.slug}`,
      lastModified: p.updated_at || now,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))
    
    // Compare pages
    const compareUrls: MetadataRoute.Sitemap = []
    const groups: Record<string, Array<{ slug: string; category: string | null; updated_at: string | null }>> = {}
    
    for (const p of enriched || []) {
      const cat = p.category?.toLowerCase() || 'other'
      if (!groups[cat]) groups[cat] = []
      if (groups[cat].length < 20) groups[cat].push(p)
    }
    
    for (const profiles of Object.values(groups)) {
      for (let i = 0; i < Math.min(5, profiles.length); i++) {
        for (let j = i + 1; j < Math.min(10, profiles.length); j++) {
          if (compareUrls.length < 5000) {
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
    
    return [...alternativesUrls, ...compareUrls]
  }
  
  // Sitemaps 1-8: Brand pages
  const brandsInFirst = Math.floor((URLS_PER_SITEMAP - 80) / 2) // ~22K
  const offset = brandsInFirst + ((id - 1) * BRANDS_PER_SITEMAP)
  
  const { data: brands } = await supabase
    .from('ai_profiles')
    .select('slug, updated_at, created_at')
    .order('created_at', { ascending: true })
    .range(offset, offset + BRANDS_PER_SITEMAP - 1)
  
  const brandUrls: MetadataRoute.Sitemap = (brands || []).flatMap(b => [
    { url: `${baseUrl}/brands/${b.slug}`, lastModified: b.updated_at || b.created_at || now, changeFrequency: 'weekly' as const, priority: 0.8 },
    { url: `${baseUrl}/brands/${b.slug}/harbor.json`, lastModified: b.updated_at || b.created_at || now, changeFrequency: 'weekly' as const, priority: 0.7 },
  ])
  
  return brandUrls
}