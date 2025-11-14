// app/api/dashboard/[id]/conversations/route.ts

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

    // Get conversation results
    const { data: conversationResults } = await supabase
      .from('results_conversations')
      .select('*')
      .eq('scan_id', latestScan.id)
      .order('score', { ascending: false })

    // Calculate volume index (sum of scores)
    const volumeIndex = conversationResults?.reduce((sum, item) => sum + item.score, 0) || 0

    // Group by intent
    const byIntent = conversationResults?.reduce((acc: any, item) => {
      if (!acc[item.intent]) acc[item.intent] = []
      acc[item.intent].push(item)
      return acc
    }, {})

    // Emerging questions
    const emergingQuestions = conversationResults?.filter(r => r.emerging) || []

    // Top questions
    const topQuestions = conversationResults?.slice(0, 10) || []

    return NextResponse.json({
      hasData: true,
      volume_index: volumeIndex,
      volume_delta: '+0%', // TODO: Calculate from previous scan
      total_questions: conversationResults?.length || 0,
      emerging_count: emergingQuestions.length,
      last_scan: latestScan.finished_at,
      by_intent: byIntent || {},
      top_questions: topQuestions,
      emerging_questions: emergingQuestions,
      raw_results: conversationResults || [],
    })

  } catch (error) {
    console.error('Error fetching conversations data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch conversation data' },
      { status: 500 }
    )
  }
}
