// app/api/dashboard/[id]/competitors/route.ts
// Aggregate competitor data from prompt_brand_mentions for Overview page

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
  color: string
}

// Color palette for chart lines
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

    // Get dashboard info
    const { data: dashboard, error: dashError } = await supabase
      .from('dashboards')
      .select('brand_name, domain')
      .eq('id', dashboardId)
      .single()

    if (dashError || !dashboard) {
      return NextResponse.json({ error: 'Dashboard not found' }, { status: 404 })
    }

    const userBrandName = dashboard.brand_name.toLowerCase()

    // Get all brand mentions with execution data
    const { data: mentions, error: mentionsError } = await supabase
      .from('prompt_brand_mentions')
      .select(`
        brand_name,
        position,
        sentiment,
        prompt_executions!inner (
          id,
          executed_at
        )
      `)

    if (mentionsError) {
      console.error('Error fetching mentions:', mentionsError)
      return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
    }

    // Aggregate by brand
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

    // Convert to array and calculate scores
    const brandsArray = Array.from(brandStats.entries()).map(([name, stats]) => {
      const avgPosition = stats.positions.length > 0
        ? stats.positions.reduce((a, b) => a + b, 0) / stats.positions.length
        : 5

      const totalSentimentVotes = stats.sentiments.positive + stats.sentiments.neutral + stats.sentiments.negative
      const sentimentScore = totalSentimentVotes > 0
        ? Math.round((stats.sentiments.positive / totalSentimentVotes) * 100)
        : 50

      return {
        name,
        mentions: stats.mentions,
        sentiment: sentimentScore,
        position: Math.round(avgPosition * 10) / 10,
        visibility: 0, // Will be calculated below
        isUser: name.toLowerCase() === userBrandName || 
                name.toLowerCase().includes(userBrandName) ||
                userBrandName.includes(name.toLowerCase())
      }
    })

    // Sort by mentions (most mentioned first)
    brandsArray.sort((a, b) => b.mentions - a.mentions)

    // Calculate visibility RELATIVE to top brand
    const maxMentions = brandsArray.length > 0 ? brandsArray[0].mentions : 1
    brandsArray.forEach(brand => {
      brand.visibility = Math.round((brand.mentions / maxMentions) * 100)
    })

    // Take top N
    const topBrands = brandsArray.slice(0, limit)

    // Format for UI
    const competitors: CompetitorData[] = topBrands.map((brand, idx) => ({
      rank: idx + 1,
      name: brand.name,
      domain: null, // Could look up from ai_profiles
      logo: `/logos/${brand.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.png`,
      visibility: brand.visibility,
      visibilityDelta: null, // Need historical data
      sentiment: brand.sentiment,
      sentimentDelta: null,
      position: brand.position,
      positionDelta: null,
      mentions: brand.mentions,
      isUser: brand.isUser,
      color: brand.isUser ? COLORS[0] : COLORS[(idx % (COLORS.length - 1)) + 1]
    }))

    // If user's brand isn't in top N, add them
    const userInList = competitors.some(c => c.isUser)
    if (!userInList) {
      const userBrand = brandsArray.find(b => b.isUser)
      if (userBrand) {
        const userRank = brandsArray.findIndex(b => b.isUser) + 1
        competitors.unshift({
          rank: userRank,
          name: userBrand.name,
          domain: dashboard.domain,
          logo: `/logos/${userBrand.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.png`,
          visibility: userBrand.visibility,
          visibilityDelta: null,
          sentiment: userBrand.sentiment,
          sentimentDelta: null,
          position: userBrand.position,
          positionDelta: null,
          mentions: userBrand.mentions,
          isUser: true,
          color: COLORS[0]
        })
      }
    }

    // Re-sort to put user first if they exist
    competitors.sort((a, b) => {
      if (a.isUser) return -1
      if (b.isUser) return 1
      return a.rank - b.rank
    })

    return NextResponse.json({
      competitors,
      total_brands_found: brandsArray.length,
      user_rank: brandsArray.findIndex(b => b.isUser) + 1 || null
    })

  } catch (error) {
    console.error('Error in competitors API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}