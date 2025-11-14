// app/api/dashboard/[id]/brand/route.ts

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

    // Get most recent completed scan
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

    // Get brand visibility results
    const { data: brandResults } = await supabase
      .from('results_brand')
      .select('*')
      .eq('scan_id', latestScan.id)

    // Calculate visibility index (weighted sum)
    const visibilityIndex = brandResults?.reduce((sum, item) => {
      const sentimentWeight = item.sentiment === 'pos' ? 1 : item.sentiment === 'neg' ? -0.5 : 0.5
      return sum + (item.weight * sentimentWeight)
    }, 0) || 0

    // Group by sentiment
    const bySentiment = brandResults?.reduce((acc: any, item) => {
      if (!acc[item.sentiment]) acc[item.sentiment] = []
      acc[item.sentiment].push(item)
      return acc
    }, { pos: [], neu: [], neg: [] })

    // Top descriptors
    const topDescriptors = brandResults
      ?.sort((a, b) => b.weight - a.weight)
      .slice(0, 10) || []

    return NextResponse.json({
      hasData: true,
      visibility_index: Math.round(visibilityIndex),
      visibility_delta: '+0%', // TODO: Calculate from previous scan
      total_descriptors: brandResults?.length || 0,
      last_scan: latestScan.finished_at,
      by_sentiment: bySentiment,
      top_descriptors: topDescriptors,
      raw_results: brandResults || [],
    })

  } catch (error) {
    console.error('Error fetching brand data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch brand visibility data' },
      { status: 500 }
    )
  }
}
