// app/api/dashboard/[id]/benchmarks/route.ts
// Returns category benchmarks for comparing user's metrics against peers

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

interface CategoryBenchmark {
  category: string
  avg_visibility: number
  median_visibility: number
  top_quartile_visibility: number
  avg_rank: number
  brand_count: number
  positive_sentiment_pct: number
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: dashboardId } = await params
  const supabase = getSupabase()

  try {
    // Get dashboard's category
    const { data: dashboard } = await supabase
      .from('dashboards')
      .select('id, metadata, brand_name')
      .eq('id', dashboardId)
      .single()

    const userCategory = dashboard?.metadata?.category || null

    // Fetch all profiles with visibility scores grouped by category
    const { data: profiles, error } = await supabase
      .from('ai_profiles')
      .select('category, visibility_score, feed_data')
      .not('visibility_score', 'is', null)
      .gt('visibility_score', 0)

    if (error) {
      console.error('Benchmarks error:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    // Group by category and calculate benchmarks
    const categoryMap = new Map<string, number[]>()

    for (const profile of profiles || []) {
      const feedData = typeof profile.feed_data === 'string'
        ? JSON.parse(profile.feed_data)
        : profile.feed_data

      const category = profile.category || feedData?.category || 'Software'
      const normalized = category.trim()

      if (!normalized || !profile.visibility_score) continue

      if (!categoryMap.has(normalized)) {
        categoryMap.set(normalized, [])
      }
      categoryMap.get(normalized)!.push(profile.visibility_score)
    }

    // Calculate benchmarks per category
    const benchmarks: Record<string, CategoryBenchmark> = {}

    categoryMap.forEach((scores, category) => {
      if (scores.length < 3) return // Need minimum sample size

      const sorted = [...scores].sort((a, b) => a - b)
      const sum = scores.reduce((a, b) => a + b, 0)
      const avg = Math.round(sum / scores.length)
      const median = sorted[Math.floor(sorted.length / 2)]
      const topQuartileIdx = Math.floor(sorted.length * 0.75)
      const topQuartile = sorted[topQuartileIdx] || median

      // Estimate average rank (middle of the pack)
      const avgRank = Math.round(scores.length / 2)

      benchmarks[category] = {
        category,
        avg_visibility: avg,
        median_visibility: median,
        top_quartile_visibility: topQuartile,
        avg_rank: avgRank,
        brand_count: scores.length,
        positive_sentiment_pct: 65 // Placeholder until we track sentiment aggregates
      }
    })

    // Global benchmark (all categories combined)
    const allScores = Array.from(categoryMap.values()).flat()
    let globalBenchmark: CategoryBenchmark | null = null

    if (allScores.length >= 10) {
      const sorted = [...allScores].sort((a, b) => a - b)
      const sum = allScores.reduce((a, b) => a + b, 0)
      const avg = Math.round(sum / allScores.length)
      const median = sorted[Math.floor(sorted.length / 2)]
      const topQuartileIdx = Math.floor(sorted.length * 0.75)
      const topQuartile = sorted[topQuartileIdx] || median

      globalBenchmark = {
        category: 'All Categories',
        avg_visibility: avg,
        median_visibility: median,
        top_quartile_visibility: topQuartile,
        avg_rank: Math.round(allScores.length / 2),
        brand_count: allScores.length,
        positive_sentiment_pct: 65
      }
    }

    // Get user's specific category benchmark
    const userBenchmark = userCategory ? benchmarks[userCategory] : null

    // Provide context labels
    function getVisibilityContext(userVisibility: number, benchmark: CategoryBenchmark) {
      if (userVisibility >= benchmark.top_quartile_visibility) {
        return { label: 'Top performer', color: 'green', percentile: '75th+' }
      }
      if (userVisibility >= benchmark.avg_visibility) {
        return { label: 'Above average', color: 'green', percentile: '50th+' }
      }
      if (userVisibility >= benchmark.avg_visibility * 0.7) {
        return { label: 'Average', color: 'gray', percentile: '~50th' }
      }
      return { label: 'Below average', color: 'amber', percentile: '<50th' }
    }

    function getRankContext(userRank: number, totalBrands: number) {
      const percentile = ((totalBrands - userRank) / totalBrands) * 100
      if (percentile >= 90) return { label: 'Top 10%', color: 'green' }
      if (percentile >= 75) return { label: 'Top 25%', color: 'green' }
      if (percentile >= 50) return { label: 'Top half', color: 'gray' }
      return { label: 'Room to grow', color: 'amber' }
    }

    return NextResponse.json({
      user_category: userCategory,
      user_benchmark: userBenchmark,
      global_benchmark: globalBenchmark,
      all_benchmarks: benchmarks,
      helpers: {
        getVisibilityContext: 'Use userVisibility and benchmark to determine context',
        getRankContext: 'Use userRank and totalBrands to determine context'
      },
      meta: {
        generated_at: new Date().toISOString(),
        total_categories: Object.keys(benchmarks).length,
        total_brands_analyzed: allScores.length
      }
    }, {
      headers: {
        'Cache-Control': 'public, max-age=3600, s-maxage=3600' // Cache for 1 hour
      }
    })

  } catch (error) {
    console.error('Benchmarks API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
