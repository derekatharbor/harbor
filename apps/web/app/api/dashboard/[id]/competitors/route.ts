// app/api/dashboard/[id]/competitors/route.ts
// Returns tracked competitors + category-based suggestions from seed data

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// Plan limits for competitor tracking
const PLAN_LIMITS: Record<string, number> = {
  free: 3,
  solo: 5,
  growth: 10,
  agency: 25,
  enterprise: 50
}

// Map user categories to seed prompt topics
const CATEGORY_TO_TOPICS: Record<string, string[]> = {
  'Technology & SaaS': ['Project Management', 'Developer Tools', 'Analytics & BI', 'AI & Automation'],
  'Software': ['Project Management', 'Developer Tools', 'Analytics & BI'],
  'Marketing': ['Marketing & SEO', 'Marketing & Email', 'Analytics & BI'],
  'E-commerce': ['E-commerce & Retail', 'Marketing & SEO', 'Customer Support'],
  'Finance': ['Finance & Accounting', 'Analytics & BI'],
  'Healthcare': ['Security & Compliance', 'Communication & Collaboration'],
  'Education': ['universities', 'Communication & Collaboration'],
  'CRM': ['CRM & Sales', 'Marketing & Email'],
  'Sales': ['CRM & Sales', 'Communication & Collaboration'],
  'Design': ['Design & Creative', 'Project Management'],
  'Developer Tools': ['Developer Tools', 'Dev Tools & Infrastructure'],
  'HR': ['HR & Recruiting', 'Communication & Collaboration'],
  'Customer Support': ['Customer Support', 'Communication & Collaboration'],
  'Project Management': ['Project Management', 'Communication & Collaboration'],
  // Default fallback
  'default': ['Project Management', 'CRM & Sales', 'Marketing & SEO']
}

function getTopicsForCategory(category: string | null): string[] {
  if (!category) return CATEGORY_TO_TOPICS['default']
  
  // Try exact match first
  if (CATEGORY_TO_TOPICS[category]) {
    return CATEGORY_TO_TOPICS[category]
  }
  
  // Try partial match
  const lowerCategory = category.toLowerCase()
  for (const [key, topics] of Object.entries(CATEGORY_TO_TOPICS)) {
    if (lowerCategory.includes(key.toLowerCase()) || key.toLowerCase().includes(lowerCategory)) {
      return topics
    }
  }
  
  return CATEGORY_TO_TOPICS['default']
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: dashboardId } = await params
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '25')
    
    const supabase = getSupabase()

    // 1. Get dashboard info including category
    const { data: dashboard, error: dashError } = await supabase
      .from('dashboards')
      .select('brand_name, domain, plan, metadata')
      .eq('id', dashboardId)
      .single()

    if (dashError || !dashboard) {
      return NextResponse.json({ error: 'Dashboard not found' }, { status: 404 })
    }

    const plan = dashboard.plan || 'free'
    const maxCompetitors = PLAN_LIMITS[plan] || PLAN_LIMITS.free
    const userCategory = dashboard.metadata?.category || null
    const userBrandLower = dashboard.brand_name?.toLowerCase() || ''

    // 2. Get tracked competitors (joined with ai_profiles)
    const { data: trackedData } = await supabase
      .from('dashboard_competitors')
      .select(`
        id,
        profile_id,
        added_at,
        ai_profiles (
          brand_name,
          domain,
          logo_url
        )
      `)
      .eq('dashboard_id', dashboardId)
      .limit(maxCompetitors)

    const tracked = (trackedData || []).map(t => ({
      id: t.id,
      profile_id: t.profile_id,
      brand_name: (t.ai_profiles as any)?.brand_name || 'Unknown',
      domain: (t.ai_profiles as any)?.domain || null,
      logo_url: (t.ai_profiles as any)?.logo_url || null,
      added_at: t.added_at,
      mentions: 0,
      visibility: 0,
      sentiment: 'neutral',
      avg_position: null
    }))

    const trackedNames = new Set(tracked.map(t => t.brand_name.toLowerCase()))

    // 3. Get relevant topics for user's category
    const relevantTopics = getTopicsForCategory(userCategory)

    // 4. Get top brands from seed prompt data
    const { data: allMentions } = await supabase
      .from('prompt_brand_mentions')
      .select('brand_name, profile_id')
    
    // Aggregate by brand name
    const brandCounts = new Map<string, { count: number; profile_id: string | null }>()
    allMentions?.forEach((b: any) => {
      const name = b.brand_name?.trim()
      if (!name) return
      const existing = brandCounts.get(name) || { count: 0, profile_id: b.profile_id }
      existing.count++
      brandCounts.set(name, existing)
    })
    
    const suggestedBrands = Array.from(brandCounts.entries())
      .map(([name, data]) => ({ brand_name: name, mentions: data.count, profile_id: data.profile_id }))
      .sort((a, b) => b.mentions - a.mentions)
      .slice(0, 50)

    // 5. Calculate max mentions for visibility percentage
    const maxMentions = suggestedBrands.length > 0 
      ? Math.max(...suggestedBrands.map((b: any) => b.mentions || 0))
      : 1

    // 6. Build suggested list (exclude user's brand and already tracked)
    const suggested = suggestedBrands
      .filter((b: any) => {
        const nameLower = b.brand_name?.toLowerCase() || ''
        return !trackedNames.has(nameLower) && 
               !nameLower.includes(userBrandLower) &&
               !userBrandLower.includes(nameLower)
      })
      .slice(0, limit)
      .map((b: any, idx: number) => {
        const domain = guessDomain(b.brand_name)
        return {
          rank: idx + 1,
          brand_name: b.brand_name,
          domain: domain,
          logo_url: `https://cdn.brandfetch.io/${domain}?c=1id1Fyz-h7an5-5KR_y`,
          mentions: b.mentions || 0,
          visibility: Math.round(((b.mentions || 0) / maxMentions) * 100),
          sentiment: 'neutral',
          profile_id: b.profile_id || null
        }
      })

    // 7. Update tracked competitors with mention data from seed prompts
    for (const comp of tracked) {
      const matchedSuggested = suggestedBrands.find(
        (b: any) => b.brand_name?.toLowerCase() === comp.brand_name.toLowerCase()
      )
      if (matchedSuggested) {
        comp.mentions = matchedSuggested.mentions || 0
        comp.visibility = Math.round(((matchedSuggested.mentions || 0) / maxMentions) * 100)
      }
    }

    // 8. Get user's mentions from the data
    const userMentions = suggestedBrands.find(
      (b: any) => {
        const nameLower = b.brand_name?.toLowerCase() || ''
        return nameLower.includes(userBrandLower) || userBrandLower.includes(nameLower)
      }
    )?.mentions || 0

    return NextResponse.json({
      tracked,
      suggested,
      user_data: {
        brand_name: dashboard.brand_name,
        category: userCategory,
        visibility: maxMentions > 0 ? Math.round((userMentions / maxMentions) * 100) : 0,
        mentions: userMentions
      },
      category_info: {
        category: userCategory,
        topics: relevantTopics
      },
      total_brands_in_category: suggestedBrands.length,
      plan_limits: {
        current: tracked.length,
        max: maxCompetitors,
        plan: plan
      }
    })

  } catch (error) {
    console.error('Error in competitors API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Helper to guess domain from brand name
function guessDomain(brandName: string): string {
  const clean = brandName.toLowerCase()
    .replace(/\.com|\.io|\.co|\.ai/g, '')
    .replace(/[^a-z0-9]/g, '')
  
  // Known mappings
  const domainMap: Record<string, string> = {
    'mondaycom': 'monday.com',
    'monday': 'monday.com',
    'asana': 'asana.com',
    'clickup': 'clickup.com',
    'trello': 'trello.com',
    'notion': 'notion.so',
    'slack': 'slack.com',
    'basecamp': 'basecamp.com',
    'jira': 'atlassian.com',
    'linear': 'linear.app',
    'figma': 'figma.com',
    'hubspot': 'hubspot.com',
    'salesforce': 'salesforce.com',
    'pipedrive': 'pipedrive.com',
    'zoho': 'zoho.com',
    'close': 'close.com',
    'github': 'github.com',
    'microsoftteams': 'microsoft.com',
    'zapier': 'zapier.com',
    'zoom': 'zoom.us',
    'make': 'make.com',
    'airtable': 'airtable.com',
    'coda': 'coda.io',
    'height': 'height.app',
    'shortcut': 'shortcut.com',
    'wrike': 'wrike.com',
    'smartsheet': 'smartsheet.com',
  }
  
  return domainMap[clean] || `${clean}.com`
}

// POST - Add a competitor to tracking
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: dashboardId } = await params
    const body = await request.json()
    const { profile_id, brand_name, domain } = body

    if (!profile_id && !brand_name) {
      return NextResponse.json({ error: 'profile_id or brand_name required' }, { status: 400 })
    }

    const supabase = getSupabase()

    // Check dashboard exists and get plan
    const { data: dashboard } = await supabase
      .from('dashboards')
      .select('plan')
      .eq('id', dashboardId)
      .single()

    if (!dashboard) {
      return NextResponse.json({ error: 'Dashboard not found' }, { status: 404 })
    }

    const plan = dashboard.plan || 'free'
    const maxCompetitors = PLAN_LIMITS[plan] || PLAN_LIMITS.free

    // Check current count
    const { count } = await supabase
      .from('dashboard_competitors')
      .select('*', { count: 'exact', head: true })
      .eq('dashboard_id', dashboardId)

    if ((count || 0) >= maxCompetitors) {
      return NextResponse.json({ 
        error: 'Competitor limit reached', 
        limit: maxCompetitors,
        plan: plan 
      }, { status: 403 })
    }

    // If we have profile_id, use it directly
    let finalProfileId = profile_id

    // If no profile_id, try to find or create profile
    if (!finalProfileId && brand_name) {
      const { data: existingProfile } = await supabase
        .from('ai_profiles')
        .select('id')
        .ilike('brand_name', brand_name)
        .limit(1)
        .single()

      if (existingProfile) {
        finalProfileId = existingProfile.id
      } else {
        // Create new profile
        const newDomain = domain || guessDomain(brand_name)
        const { data: newProfile } = await supabase
          .from('ai_profiles')
          .insert({
            brand_name,
            domain: newDomain,
            slug: brand_name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            logo_url: `https://cdn.brandfetch.io/${newDomain}?c=1id1Fyz-h7an5-5KR_y`
          })
          .select('id')
          .single()

        if (newProfile) {
          finalProfileId = newProfile.id
        }
      }
    }

    if (!finalProfileId) {
      return NextResponse.json({ error: 'Could not resolve profile' }, { status: 400 })
    }

    // Check if already tracking
    const { data: existing } = await supabase
      .from('dashboard_competitors')
      .select('id')
      .eq('dashboard_id', dashboardId)
      .eq('profile_id', finalProfileId)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'Already tracking this competitor' }, { status: 409 })
    }

    // Add competitor
    const { data: competitor, error } = await supabase
      .from('dashboard_competitors')
      .insert({
        dashboard_id: dashboardId,
        profile_id: finalProfileId
      })
      .select('id')
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, competitor_id: competitor.id })

  } catch (error) {
    console.error('Error adding competitor:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Remove a competitor from tracking
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: dashboardId } = await params
    const { searchParams } = new URL(request.url)
    const competitorId = searchParams.get('competitor_id')
    const profileId = searchParams.get('profile_id')

    if (!competitorId && !profileId) {
      return NextResponse.json({ error: 'competitor_id or profile_id required' }, { status: 400 })
    }

    const supabase = getSupabase()

    let query = supabase
      .from('dashboard_competitors')
      .delete()
      .eq('dashboard_id', dashboardId)

    if (competitorId) {
      query = query.eq('id', competitorId)
    } else if (profileId) {
      query = query.eq('profile_id', profileId)
    }

    const { error } = await query

    if (error) throw error

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error removing competitor:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}