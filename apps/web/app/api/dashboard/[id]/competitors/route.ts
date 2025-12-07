// app/api/dashboard/[id]/competitors/route.ts
// Aggregate competitor data scoped to user's selected prompts

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

interface CompetitorData {
  rank: number
  name: string
  domain: string | null
  logo: string
  visibility: number
  visibilityDelta: number | null
  sentiment: number
  sentimentDelta: number | null
  position: number
  positionDelta: number | null
  mentions: number
  isUser: boolean
  isTrackedCompetitor: boolean
  color: string
}

const COLORS = [
  '#FF6B4A', // Coral (user's brand)
  '#3B82F6', // Blue
  '#22C55E', // Green
  '#8B5CF6', // Purple
  '#F59E0B', // Amber
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#EF4444', // Red
]

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: dashboardId } = await params
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    
    const supabase = getSupabase()

    // 1. Get dashboard info
    const { data: dashboard, error: dashError } = await supabase
      .from('dashboards')
      .select('brand_name, domain')
      .eq('id', dashboardId)
      .single()

    if (dashError || !dashboard) {
      return NextResponse.json({ error: 'Dashboard not found' }, { status: 404 })
    }

    const userBrandName = dashboard.brand_name.toLowerCase()

    // 2. Get user's selected prompts
    const { data: dashboardPrompts } = await supabase
      .from('dashboard_prompts')
      .select('prompt_id')
      .eq('dashboard_id', dashboardId)

    const selectedPromptIds = dashboardPrompts?.map(dp => dp.prompt_id) || []

    // 3. Get user's selected competitors (from ai_profiles)
    const { data: dashboardCompetitors } = await supabase
      .from('dashboard_competitors')
      .select(`
        profile_id,
        ai_profiles:profile_id (
          id,
          brand_name,
          domain,
          logo_url
        )
      `)
      .eq('dashboard_id', dashboardId)

    // Build map of tracked competitor names (lowercase for matching)
    const trackedCompetitors = new Map<string, { name: string; domain: string; logo: string }>()
    dashboardCompetitors?.forEach((dc: any) => {
      if (dc.ai_profiles) {
        const name = dc.ai_profiles.brand_name
        trackedCompetitors.set(name.toLowerCase(), {
          name,
          domain: dc.ai_profiles.domain,
          logo: dc.ai_profiles.logo_url || `https://cdn.brandfetch.io/${dc.ai_profiles.domain}?c=1id1Fyz-h7an5-5KR_y`
        })
      }
    })

    // 4. If no prompts selected, return empty with just competitors
    if (selectedPromptIds.length === 0) {
      // Show user's brand and competitors with 0 data
      const competitors: CompetitorData[] = []
      
      // Add user's brand
      competitors.push({
        rank: 1,
        name: dashboard.brand_name,
        domain: dashboard.domain,
        logo: `https://cdn.brandfetch.io/${dashboard.domain}?c=1id1Fyz-h7an5-5KR_y`,
        visibility: 0,
        visibilityDelta: null,
        sentiment: 0,
        sentimentDelta: null,
        position: 0,
        positionDelta: null,
        mentions: 0,
        isUser: true,
        isTrackedCompetitor: false,
        color: COLORS[0]
      })

      // Add tracked competitors
      let idx = 1
      trackedCompetitors.forEach((comp) => {
        competitors.push({
          rank: idx + 1,
          name: comp.name,
          domain: comp.domain,
          logo: comp.logo,
          visibility: 0,
          visibilityDelta: null,
          sentiment: 0,
          sentimentDelta: null,
          position: 0,
          positionDelta: null,
          mentions: 0,
          isUser: false,
          isTrackedCompetitor: true,
          color: COLORS[idx % COLORS.length]
        })
        idx++
      })

      return NextResponse.json({
        competitors,
        total_brands_found: 0,
        user_rank: null,
        no_prompts_selected: true
      })
    }

    // 5. Get executions for selected prompts
    const { data: executions } = await supabase
      .from('prompt_executions')
      .select('id')
      .in('prompt_id', selectedPromptIds)

    const executionIds = executions?.map(e => e.id) || []

    if (executionIds.length === 0) {
      // Prompts selected but no executions yet
      const competitors: CompetitorData[] = []
      
      competitors.push({
        rank: 1,
        name: dashboard.brand_name,
        domain: dashboard.domain,
        logo: `https://cdn.brandfetch.io/${dashboard.domain}?c=1id1Fyz-h7an5-5KR_y`,
        visibility: 0,
        visibilityDelta: null,
        sentiment: 0,
        sentimentDelta: null,
        position: 0,
        positionDelta: null,
        mentions: 0,
        isUser: true,
        isTrackedCompetitor: false,
        color: COLORS[0]
      })

      let idx = 1
      trackedCompetitors.forEach((comp) => {
        competitors.push({
          rank: idx + 1,
          name: comp.name,
          domain: comp.domain,
          logo: comp.logo,
          visibility: 0,
          visibilityDelta: null,
          sentiment: 0,
          sentimentDelta: null,
          position: 0,
          positionDelta: null,
          mentions: 0,
          isUser: false,
          isTrackedCompetitor: true,
          color: COLORS[idx % COLORS.length]
        })
        idx++
      })

      return NextResponse.json({
        competitors,
        total_brands_found: 0,
        user_rank: null,
        no_executions_yet: true
      })
    }

    // 6. Get brand mentions ONLY from those executions
    const { data: mentions, error: mentionsError } = await supabase
      .from('prompt_brand_mentions')
      .select('brand_name, position, sentiment')
      .in('execution_id', executionIds)

    if (mentionsError) {
      console.error('Error fetching mentions:', mentionsError)
      return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
    }

    // 7. Aggregate by brand
    const brandStats = new Map<string, {
      mentions: number
      positions: number[]
      sentiments: { positive: number; neutral: number; negative: number }
    }>()

    mentions?.forEach((mention: any) => {
      const brandName = mention.brand_name?.trim()
      if (!brandName) return

      const existing = brandStats.get(brandName) || {
        mentions: 0,
        positions: [],
        sentiments: { positive: 0, neutral: 0, negative: 0 }
      }

      existing.mentions++
      
      if (mention.position) {
        existing.positions.push(mention.position)
      }

      const sentiment = (mention.sentiment || 'neutral').toLowerCase()
      if (sentiment === 'positive' || sentiment === 'pos') {
        existing.sentiments.positive++
      } else if (sentiment === 'negative' || sentiment === 'neg') {
        existing.sentiments.negative++
      } else {
        existing.sentiments.neutral++
      }

      brandStats.set(brandName, existing)
    })

    // 8. Convert to array and calculate scores
    const brandsArray = Array.from(brandStats.entries()).map(([name, stats]) => {
      const avgPosition = stats.positions.length > 0
        ? stats.positions.reduce((a, b) => a + b, 0) / stats.positions.length
        : 5

      const totalSentimentVotes = stats.sentiments.positive + stats.sentiments.neutral + stats.sentiments.negative
      const sentimentScore = totalSentimentVotes > 0
        ? Math.round((stats.sentiments.positive / totalSentimentVotes) * 100)
        : 50

      const nameLower = name.toLowerCase()
      const isUser = nameLower === userBrandName || 
                     nameLower.includes(userBrandName) ||
                     userBrandName.includes(nameLower)
      const isTrackedCompetitor = trackedCompetitors.has(nameLower)

      return {
        name,
        mentions: stats.mentions,
        sentiment: sentimentScore,
        position: Math.round(avgPosition * 10) / 10,
        visibility: 0,
        isUser,
        isTrackedCompetitor
      }
    })

    // Sort by mentions
    brandsArray.sort((a, b) => b.mentions - a.mentions)

    // Calculate visibility relative to top brand
    const maxMentions = brandsArray.length > 0 ? brandsArray[0].mentions : 1
    brandsArray.forEach(brand => {
      brand.visibility = Math.round((brand.mentions / maxMentions) * 100)
    })

    // 9. Build final list: user + tracked competitors + top mentioned brands
    const competitors: CompetitorData[] = []
    const addedNames = new Set<string>()

    // Always add user's brand first
    const userBrand = brandsArray.find(b => b.isUser)
    competitors.push({
      rank: userBrand ? brandsArray.indexOf(userBrand) + 1 : 0,
      name: dashboard.brand_name,
      domain: dashboard.domain,
      logo: `https://cdn.brandfetch.io/${dashboard.domain}?c=1id1Fyz-h7an5-5KR_y`,
      visibility: userBrand?.visibility || 0,
      visibilityDelta: null,
      sentiment: userBrand?.sentiment || 0,
      sentimentDelta: null,
      position: userBrand?.position || 0,
      positionDelta: null,
      mentions: userBrand?.mentions || 0,
      isUser: true,
      isTrackedCompetitor: false,
      color: COLORS[0]
    })
    addedNames.add(userBrandName)

    // Add tracked competitors (even if 0 mentions)
    let colorIdx = 1
    trackedCompetitors.forEach((comp, nameLower) => {
      const found = brandsArray.find(b => b.name.toLowerCase() === nameLower)
      competitors.push({
        rank: found ? brandsArray.indexOf(found) + 1 : 0,
        name: comp.name,
        domain: comp.domain,
        logo: comp.logo,
        visibility: found?.visibility || 0,
        visibilityDelta: null,
        sentiment: found?.sentiment || 0,
        sentimentDelta: null,
        position: found?.position || 0,
        positionDelta: null,
        mentions: found?.mentions || 0,
        isUser: false,
        isTrackedCompetitor: true,
        color: COLORS[colorIdx % COLORS.length]
      })
      addedNames.add(nameLower)
      colorIdx++
    })

    // Fill remaining slots with top mentioned brands
    for (const brand of brandsArray) {
      if (competitors.length >= limit) break
      if (addedNames.has(brand.name.toLowerCase())) continue
      
      competitors.push({
        rank: brandsArray.indexOf(brand) + 1,
        name: brand.name,
        domain: null,
        logo: `https://cdn.brandfetch.io/${brand.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com?c=1id1Fyz-h7an5-5KR_y`,
        visibility: brand.visibility,
        visibilityDelta: null,
        sentiment: brand.sentiment,
        sentimentDelta: null,
        position: brand.position,
        positionDelta: null,
        mentions: brand.mentions,
        isUser: false,
        isTrackedCompetitor: false,
        color: COLORS[colorIdx % COLORS.length]
      })
      colorIdx++
    }

    // Sort: user first, then tracked competitors, then by mentions
    competitors.sort((a, b) => {
      if (a.isUser) return -1
      if (b.isUser) return 1
      if (a.isTrackedCompetitor && !b.isTrackedCompetitor) return -1
      if (!a.isTrackedCompetitor && b.isTrackedCompetitor) return 1
      return b.mentions - a.mentions
    })

    return NextResponse.json({
      competitors,
      total_brands_found: brandsArray.length,
      user_rank: userBrand ? brandsArray.indexOf(userBrand) + 1 : null
    })

  } catch (error) {
    console.error('Error in competitors API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}