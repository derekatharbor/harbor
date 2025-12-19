// app/api/dashboard/[id]/competitors/route.ts
// Returns competitors data - backward compatible for Overview + new features for Competitors page

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

// Known brand -> domain mappings
const DOMAIN_MAP: Record<string, string> = {
  'asana': 'asana.com',
  'monday.com': 'monday.com',
  'monday': 'monday.com',
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
  'microsoft teams': 'microsoft.com',
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

function guessDomain(brandName: string): string {
  const clean = brandName.toLowerCase().trim()
  if (DOMAIN_MAP[clean]) return DOMAIN_MAP[clean]
  return clean.replace(/[^a-z0-9]/g, '') + '.com'
}

function getBrandLogo(brandName: string): string {
  const domain = guessDomain(brandName)
  return `https://cdn.brandfetch.io/${domain}?c=1id1Fyz-h7an5-5KR_y`
}

// Chart colors
const CHART_COLORS = [
  '#FF6B4A', // Coral (user's brand)
  '#3B82F6', // Blue
  '#22C55E', // Green
  '#8B5CF6', // Purple
  '#F59E0B', // Amber
  '#06B6D4', // Cyan
  '#EC4899', // Pink
  '#14B8A6', // Teal
]

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: dashboardId } = await params
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '25')
    
    const supabase = getSupabase()

    // 1. Get dashboard info
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
    const userBrandName = dashboard.brand_name || ''
    const userBrandLower = userBrandName.toLowerCase()

    // 2. Get tracked competitors
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

    const trackedNames = new Set(
      (trackedData || []).map(t => ((t.ai_profiles as any)?.brand_name || '').toLowerCase())
    )

    // Build tracked array early (needed for early return)
    const tracked: {
      id: string
      profile_id: string
      brand_name: string
      domain: string
      logo_url: string
      added_at: string
      mentions: number
      visibility: number
      sentiment: string
      avg_position: number | null
    }[] = (trackedData || []).map(t => {
      const brandName = (t.ai_profiles as any)?.brand_name || 'Unknown'
      return {
        id: t.id,
        profile_id: t.profile_id,
        brand_name: brandName,
        domain: (t.ai_profiles as any)?.domain || guessDomain(brandName),
        logo_url: (t.ai_profiles as any)?.logo_url || getBrandLogo(brandName),
        added_at: t.added_at,
        mentions: 0,
        visibility: 0,
        sentiment: 'neutral' as string,
        avg_position: null as number | null
      }
    })

    // 3. Get brand mentions from USER'S OWN prompts first
    // Join: user_prompts -> prompt_executions -> prompt_brand_mentions
    const { data: userPrompts } = await supabase
      .from('user_prompts')
      .select('id')
      .eq('dashboard_id', dashboardId)

    const userPromptIds = (userPrompts || []).map(p => p.id)

    let allMentions: any[] = []

    if (userPromptIds.length > 0) {
      // Get executions for user's prompts
      const { data: userExecutions } = await supabase
        .from('prompt_executions')
        .select('id')
        .in('prompt_id', userPromptIds)

      const executionIds = (userExecutions || []).map(e => e.id)

      if (executionIds.length > 0) {
        // Get brand mentions from user's executions
        const { data: userMentions } = await supabase
          .from('prompt_brand_mentions')
          .select('brand_name, position, sentiment, profile_id')
          .in('execution_id', executionIds)

        allMentions = userMentions || []
      }
    }

    // If user has no prompt data, return empty (don't show random SaaS brands)
    if (allMentions.length === 0) {
      return NextResponse.json({
        competitors: [],
        total_brands_found: 0,
        user_rank: null,
        tracked,
        suggested: [],
        user_data: {
          brand_name: userBrandName,
          category: dashboard.metadata?.category || null,
          visibility: 0,
          mentions: 0,
          sentiment: 'neutral',
          position: null
        },
        plan_limits: {
          current: tracked.length,
          max: maxCompetitors,
          plan: plan
        },
        message: 'Run prompts to discover competitors in your space'
      })
    }

    // 4. Aggregate by brand name
    const brandCounts = new Map<string, {
      mentions: number
      totalPosition: number
      positionCount: number
      sentiments: { positive: number; neutral: number; negative: number }
      profile_id: string | null
    }>()

    allMentions?.forEach((m: any) => {
      const name = m.brand_name?.trim()
      if (!name) return

      const existing = brandCounts.get(name) || {
        mentions: 0,
        totalPosition: 0,
        positionCount: 0,
        sentiments: { positive: 0, neutral: 0, negative: 0 },
        profile_id: m.profile_id || null
      }

      existing.mentions++
      if (m.position) {
        existing.totalPosition += m.position
        existing.positionCount++
      }

      const sentiment = m.sentiment as 'positive' | 'neutral' | 'negative'
      if (sentiment && existing.sentiments[sentiment] !== undefined) {
        existing.sentiments[sentiment]++
      } else {
        existing.sentiments.neutral++
      }

      brandCounts.set(name, existing)
    })

    // 5. Calculate user's stats
    let userMentions = 0
    let userPosition = 0
    let userSentiment = 'neutral'

    brandCounts.forEach((data, name) => {
      const nameLower = name.toLowerCase()
      if (nameLower.includes(userBrandLower) || userBrandLower.includes(nameLower)) {
        userMentions = data.mentions
        userPosition = data.positionCount > 0 ? data.totalPosition / data.positionCount : 0
        const s = data.sentiments
        userSentiment = s.positive >= s.neutral && s.positive >= s.negative ? 'positive' :
                        s.negative > s.positive && s.negative >= s.neutral ? 'negative' : 'neutral'
        brandCounts.delete(name) // Remove user from competitor list
      }
    })

    // 6. Sort by mentions and build competitors array
    const sortedBrands = Array.from(brandCounts.entries())
      .sort((a, b) => b[1].mentions - a[1].mentions)
      .slice(0, limit)

    const maxMentions = sortedBrands.length > 0 ? sortedBrands[0][1].mentions : 1

    // 7. Build backward-compatible competitors array (for Overview page)
    const competitors = sortedBrands.map(([name, data], idx) => {
      const s = data.sentiments
      const sentiment = s.positive >= s.neutral && s.positive >= s.negative ? 'positive' :
                        s.negative > s.positive && s.negative >= s.neutral ? 'negative' : 'neutral'
      const avgPosition = data.positionCount > 0 ? Math.round((data.totalPosition / data.positionCount) * 10) / 10 : null
      const visibility = Math.round((data.mentions / maxMentions) * 100)
      const domain = guessDomain(name)

      return {
        rank: idx + 1,
        name: name,
        domain: domain,
        logo: getBrandLogo(name),
        fallbackLogo: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1a1a1a&color=fff&size=64`,
        visibility: visibility,
        visibilityDelta: null,
        sentiment: sentiment,
        sentimentDelta: null,
        position: avgPosition,
        positionDelta: null,
        mentions: data.mentions,
        isUser: false,
        isTracked: trackedNames.has(name.toLowerCase()),
        color: CHART_COLORS[(idx + 1) % CHART_COLORS.length],
        profile_id: data.profile_id
      }
    })

    // 8. Add user's brand at position based on mentions
    const userVisibility = maxMentions > 0 ? Math.round((userMentions / maxMentions) * 100) : 0
    const userRankCalc = competitors.filter(c => c.mentions > userMentions).length + 1
    
    // Insert user at correct rank position
    const userEntry = {
      rank: userRankCalc,
      name: userBrandName,
      domain: dashboard.domain || guessDomain(userBrandName),
      logo: getBrandLogo(userBrandName),
      fallbackLogo: `https://ui-avatars.com/api/?name=${encodeURIComponent(userBrandName)}&background=1a1a1a&color=fff&size=64`,
      visibility: userVisibility,
      visibilityDelta: null,
      sentiment: userSentiment,
      sentimentDelta: null,
      position: userPosition > 0 ? Math.round(userPosition * 10) / 10 : null,
      positionDelta: null,
      mentions: userMentions,
      isUser: true,
      isTracked: false,
      color: CHART_COLORS[0],
      profile_id: null
    }

    // Insert user into the list at correct position and re-rank
    competitors.splice(userRankCalc - 1, 0, userEntry)
    competitors.forEach((c, i) => { c.rank = i + 1 })

    // 9. Update tracked array with mention data from competitors
    tracked.forEach(t => {
      const matchedComp = competitors.find(c => c.name.toLowerCase() === t.brand_name.toLowerCase())
      if (matchedComp) {
        t.mentions = matchedComp.mentions
        t.visibility = matchedComp.visibility
        t.sentiment = matchedComp.sentiment
        t.avg_position = matchedComp.position
      }
    })

    // 10. Build suggested array (non-tracked, non-user brands)
    const suggested = competitors
      .filter(c => !c.isUser && !c.isTracked)
      .slice(0, 20)
      .map(c => ({
        rank: c.rank,
        brand_name: c.name,
        domain: c.domain,
        logo_url: c.logo,
        mentions: c.mentions,
        visibility: c.visibility,
        sentiment: c.sentiment,
        profile_id: c.profile_id
      }))

    return NextResponse.json({
      // Backward compatible (for Overview page)
      competitors: competitors.slice(0, limit),
      total_brands_found: brandCounts.size + 1,
      user_rank: userRankCalc,
      
      // New fields (for Competitors page)
      tracked,
      suggested,
      user_data: {
        brand_name: userBrandName,
        category: dashboard.metadata?.category || null,
        visibility: userVisibility,
        mentions: userMentions,
        sentiment: userSentiment,
        position: userPosition > 0 ? Math.round(userPosition * 10) / 10 : null
      },
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

// POST - Add a competitor to tracking
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: dashboardId } = await params
    const body = await request.json()
    const { profile_id, brand_name, domain } = body

    console.log('[Competitors POST] Request:', { dashboardId, profile_id, brand_name, domain })

    if (!profile_id && !brand_name) {
      console.log('[Competitors POST] Error: Missing profile_id and brand_name')
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

    let finalProfileId = profile_id

    // If no profile_id, try to find or create profile
    if (!finalProfileId && brand_name) {
      // Try to find existing profile by name
      const { data: existingProfile } = await supabase
        .from('ai_profiles')
        .select('id')
        .ilike('brand_name', brand_name)
        .limit(1)
        .maybeSingle()

      if (existingProfile) {
        finalProfileId = existingProfile.id
      } else if (domain) {
        // Try by domain
        const { data: domainProfile } = await supabase
          .from('ai_profiles')
          .select('id')
          .eq('domain', domain)
          .limit(1)
          .maybeSingle()
        
        if (domainProfile) {
          finalProfileId = domainProfile.id
        }
      }
      
      // Still no profile? Create one
      if (!finalProfileId) {
        const newDomain = domain || guessDomain(brand_name)
        const slug = brand_name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
        
        const { data: newProfile, error: insertError } = await supabase
          .from('ai_profiles')
          .insert({
            brand_name,
            domain: newDomain,
            slug: slug,
            logo_url: getBrandLogo(brand_name)
          })
          .select('id')
          .single()

        if (insertError) {
          // If slug conflict, try with random suffix
          const { data: retryProfile, error: retryError } = await supabase
            .from('ai_profiles')
            .insert({
              brand_name,
              domain: newDomain,
              slug: `${slug}-${Date.now()}`,
              logo_url: getBrandLogo(brand_name)
            })
            .select('id')
            .single()
          
          if (retryProfile) {
            finalProfileId = retryProfile.id
          } else {
            console.error('Failed to create profile:', retryError)
          }
        } else if (newProfile) {
          finalProfileId = newProfile.id
        }
      }
    }

    if (!finalProfileId) {
      console.log('[Competitors POST] Error: Could not resolve profile for', { brand_name, domain })
      return NextResponse.json({ 
        error: 'Could not resolve profile',
        details: { brand_name, domain }
      }, { status: 400 })
    }

    // Check if already tracking
    const { data: existing } = await supabase
      .from('dashboard_competitors')
      .select('id')
      .eq('dashboard_id', dashboardId)
      .eq('profile_id', finalProfileId)
      .maybeSingle()

    if (existing) {
      console.log('[Competitors POST] Already tracking:', finalProfileId)
      return NextResponse.json({ error: 'Already tracking this competitor' }, { status: 409 })
    }

    console.log('[Competitors POST] Adding competitor with profile_id:', finalProfileId)

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