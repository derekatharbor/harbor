// app/api/dashboard/[id]/shopping/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables')
  }
  
  return createClient(supabaseUrl, supabaseKey)
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabaseClient()
    const dashboardId = params.id

    // Get most recent completed scan for this dashboard
    const { data: latestScan } = await supabase
      .from('scans')
      .select('id, finished_at')
      .eq('dashboard_id', dashboardId)
      .eq('status', 'done')
      .order('finished_at', { ascending: false })
      .limit(1)
      .single()

    if (!latestScan) {
      return NextResponse.json({
        hasData: false,
        message: 'No scan data available yet',
      })
    }

    // Get shopping visibility results
    const { data: shoppingResults } = await supabase
      .from('results_shopping')
      .select('*')
      .eq('scan_id', latestScan.id)

    // Calculate visibility score (percentage of top 3 mentions)
    const totalMentions = shoppingResults?.length || 0
    const topThreeMentions = shoppingResults?.filter(r => r.rank <= 3).length || 0
    const visibilityScore = totalMentions > 0 
      ? Math.round((topThreeMentions / totalMentions) * 100) 
      : 0

    // Group by model
    const byModel = shoppingResults?.reduce((acc: any, item) => {
      if (!acc[item.model]) acc[item.model] = []
      acc[item.model].push(item)
      return acc
    }, {})

    // Group by category
    const byCategory = shoppingResults?.reduce((acc: any, item) => {
      if (!acc[item.category]) acc[item.category] = []
      acc[item.category].push(item)
      return acc
    }, {})

    return NextResponse.json({
      hasData: true,
      visibility_score: visibilityScore,
      visibility_delta: '+0%', // TODO: Calculate from previous scan
      total_mentions: totalMentions,
      top_three_mentions: topThreeMentions,
      last_scan: latestScan.finished_at,
      by_model: byModel || {},
      by_category: byCategory || {},
      raw_results: shoppingResults || [],
    })

  } catch (error) {
    console.error('Error fetching shopping data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch shopping visibility data' },
      { status: 500 }
    )
  }
}
