// POST /api/cron/university-scan
// Weekly university prompt execution + snapshot
// Designed to run within Vercel's 60s timeout

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { executePromptAllModels, storeExecutionResults } from '@/lib/prompts/execution-engine'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// Verify cron secret
function verifyCronSecret(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  
  const { searchParams } = new URL(request.url)
  if (searchParams.get('manual') === 'true') return true
  
  if (!cronSecret) return true
  return authHeader === `Bearer ${cronSecret}`
}

export async function POST(request: NextRequest) {
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = getSupabase()
  const startTime = Date.now()
  const MAX_RUNTIME_MS = 50000 // 50s to leave buffer for cleanup

  try {
    // Get stale university prompts (not run in 7 days)
    const { data: prompts, error: promptsError } = await supabase
      .from('seed_prompts')
      .select('id, prompt_text')
      .eq('is_active', true)
      .eq('topic', 'universities')
      .or('last_executed_at.is.null,last_executed_at.lt.' + new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('last_executed_at', { ascending: true, nullsFirst: true })
      .limit(10) // Small batch to fit in timeout

    if (promptsError || !prompts || prompts.length === 0) {
      // No stale prompts - just update scores and maybe snapshot
      await updateScoresAndSnapshot(supabase)
      return NextResponse.json({
        success: true,
        message: 'No stale prompts - scores updated',
        prompts_remaining: 0
      })
    }

    // Execute prompts until we run out of time
    let completed = 0
    let failed = 0
    const executedIds: string[] = []

    for (const prompt of prompts) {
      // Check if we're running low on time
      if (Date.now() - startTime > MAX_RUNTIME_MS) {
        console.log('Time limit approaching, stopping early')
        break
      }

      try {
        const results = await executePromptAllModels(prompt.id, prompt.prompt_text)
        await storeExecutionResults(supabase, results)
        completed++
        executedIds.push(prompt.id)
      } catch (error) {
        console.error(`Failed prompt ${prompt.id}:`, error)
        failed++
      }
    }

    // Update last_executed_at for completed prompts
    if (executedIds.length > 0) {
      await supabase
        .from('seed_prompts')
        .update({ last_executed_at: new Date().toISOString() })
        .in('id', executedIds)
    }

    // Update scores and check if we should snapshot
    await updateScoresAndSnapshot(supabase)

    // Count remaining stale prompts
    const { count } = await supabase
      .from('seed_prompts')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
      .eq('topic', 'universities')
      .or('last_executed_at.is.null,last_executed_at.lt.' + new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

    return NextResponse.json({
      success: true,
      completed,
      failed,
      prompts_remaining: count || 0,
      runtime_ms: Date.now() - startTime
    })

  } catch (error) {
    console.error('University cron error:', error)
    return NextResponse.json(
      { error: 'Cron failed', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    )
  }
}

async function updateScoresAndSnapshot(supabase: ReturnType<typeof getSupabase>) {
  // Update visibility scores
  try {
    await supabase.rpc('update_university_visibility')
  } catch (e) {
    console.log('update_university_visibility not available')
  }

  // Take weekly snapshot on Sundays
  const today = new Date()
  if (today.getUTCDay() === 0) { // Sunday
    try {
      // Check if we already snapshotted today
      const { data: existing } = await supabase
        .from('university_score_snapshots')
        .select('id')
        .eq('snapshot_date', today.toISOString().split('T')[0])
        .limit(1)

      if (!existing || existing.length === 0) {
        await supabase.rpc('snapshot_university_scores')
        console.log('Weekly snapshot taken')
      }
    } catch (e) {
      console.log('Snapshot error:', e)
    }
  }
}

// GET to check status
export async function GET(request: NextRequest) {
  const supabase = getSupabase()

  const { count: staleCount } = await supabase
    .from('seed_prompts')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)
    .eq('topic', 'universities')
    .or('last_executed_at.is.null,last_executed_at.lt.' + new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

  const { count: totalCount } = await supabase
    .from('seed_prompts')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)
    .eq('topic', 'universities')

  const { data: lastSnapshot } = await supabase
    .from('university_score_snapshots')
    .select('snapshot_date')
    .order('snapshot_date', { ascending: false })
    .limit(1)
    .single()

  return NextResponse.json({
    total_prompts: totalCount,
    stale_prompts: staleCount,
    last_snapshot: lastSnapshot?.snapshot_date || null,
    next_snapshot: 'Sunday'
  })
}
