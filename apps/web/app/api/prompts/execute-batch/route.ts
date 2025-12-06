// POST /api/prompts/execute-batch
// Execute batch of seed prompts - called by cron job
// This is the main data collection engine
// 
// NEW: Respects priority and frequency_days to avoid re-running fresh prompts

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { executePromptAllModels, storeExecutionResults } from '@/lib/prompts/execution-engine'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// Verify cron secret to prevent unauthorized calls
function verifyCronSecret(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  
  // Allow bypass with manual=true for testing (remove in production if needed)
  const { searchParams } = new URL(request.url)
  if (searchParams.get('manual') === 'true') return true
  
  if (!cronSecret) return true // Allow in development
  return authHeader === `Bearer ${cronSecret}`
}

export async function POST(request: NextRequest) {
  // Verify this is a legitimate cron call
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = getSupabase()

  try {
    const body = await request.json().catch(() => ({}))
    const batchSize = body.batch_size || body.limit || 25
    const batchType = body.batch_type || 'scheduled'
    const topic = body.topic || null
    const priority = body.priority || null // NEW: Filter by priority (core, standard, long-tail)
    const force = body.force || false // NEW: Skip freshness check if true

    // Create batch record
    const { data: batch, error: batchError } = await supabase
      .from('prompt_execution_batches')
      .insert({
        batch_type: batchType,
        status: 'running',
        started_at: new Date().toISOString()
      })
      .select('id')
      .single()

    if (batchError || !batch) {
      throw new Error('Failed to create batch record')
    }

    // Fetch prompts that need execution
    // Uses a raw query to handle the freshness logic properly
    let queryText = `
      SELECT id, prompt_text, topic, priority, frequency_days, last_executed_at
      FROM seed_prompts
      WHERE is_active = true
    `
    const queryParams: any[] = []
    let paramIndex = 1

    // Filter by topic if provided
    if (topic) {
      queryText += ` AND topic = $${paramIndex}`
      queryParams.push(topic)
      paramIndex++
    }

    // Filter by priority if provided
    if (priority) {
      queryText += ` AND priority = $${paramIndex}`
      queryParams.push(priority)
      paramIndex++
    }

    // Freshness check: only get prompts that are stale (unless force=true)
    if (!force) {
      queryText += `
        AND (
          last_executed_at IS NULL
          OR last_executed_at < NOW() - (COALESCE(frequency_days, 30) || ' days')::INTERVAL
        )
      `
    }

    // Order: prioritize never-run prompts, then oldest executions
    queryText += `
      ORDER BY 
        CASE WHEN last_executed_at IS NULL THEN 0 ELSE 1 END,
        last_executed_at ASC NULLS FIRST
      LIMIT $${paramIndex}
    `
    queryParams.push(batchSize)

    const { data: prompts, error: promptsError } = await supabase
      .rpc('execute_raw_query', { query_text: queryText, query_params: queryParams })

    // Fallback if RPC doesn't exist - use standard query
    let promptsToRun = prompts
    if (promptsError || !prompts) {
      // Simpler fallback query without the interval math
      let fallbackQuery = supabase
        .from('seed_prompts')
        .select('id, prompt_text, topic, priority, frequency_days, last_executed_at')
        .eq('is_active', true)

      if (topic) {
        fallbackQuery = fallbackQuery.eq('topic', topic)
      }
      if (priority) {
        fallbackQuery = fallbackQuery.eq('priority', priority)
      }
      if (!force) {
        // Get prompts that haven't been run OR were run more than 7 days ago (safe default)
        fallbackQuery = fallbackQuery.or('last_executed_at.is.null,last_executed_at.lt.' + new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      }

      const { data: fallbackPrompts, error: fallbackError } = await fallbackQuery
        .order('last_executed_at', { ascending: true, nullsFirst: true })
        .limit(batchSize)

      if (fallbackError) {
        throw new Error('Failed to fetch prompts: ' + fallbackError.message)
      }
      promptsToRun = fallbackPrompts
    }

    if (!promptsToRun || promptsToRun.length === 0) {
      // Update batch as completed with no work
      await supabase
        .from('prompt_execution_batches')
        .update({
          status: 'completed',
          prompts_total: 0,
          finished_at: new Date().toISOString()
        })
        .eq('id', batch.id)

      return NextResponse.json({
        success: true,
        message: 'No stale prompts to execute - all prompts are fresh',
        batch_id: batch.id,
        topic: topic || 'all',
        priority: priority || 'all',
        hint: 'Use force=true to run regardless of freshness'
      })
    }

    // Track results
    let totalTokens = 0
    let completed = 0
    let failed = 0
    const errors: string[] = []
    const executedPromptIds: string[] = []

    // Execute each prompt
    for (const prompt of promptsToRun) {
      try {
        const results = await executePromptAllModels(
          prompt.id,
          prompt.prompt_text
        )

        await storeExecutionResults(supabase, results)

        const promptTokens = results.reduce((sum: number, r: any) => sum + r.tokens_used, 0)
        totalTokens += promptTokens
        
        const promptErrors = results.filter((r: any) => r.error)
        if (promptErrors.length === results.length) {
          failed++
          errors.push(`Prompt ${prompt.id}: All models failed`)
        } else {
          completed++
          executedPromptIds.push(prompt.id)
        }

        // Small delay between prompts to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 500))

      } catch (error) {
        failed++
        errors.push(`Prompt ${prompt.id}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    // UPDATE: Mark executed prompts with new last_executed_at
    if (executedPromptIds.length > 0) {
      await supabase
        .from('seed_prompts')
        .update({ last_executed_at: new Date().toISOString() })
        .in('id', executedPromptIds)
    }

    // Calculate estimated cost
    const estimatedCost = (totalTokens / 1000000) * 2

    // Update batch record
    await supabase
      .from('prompt_execution_batches')
      .update({
        status: failed === promptsToRun.length ? 'failed' : 'completed',
        prompts_total: promptsToRun.length,
        prompts_completed: completed,
        prompts_failed: failed,
        total_tokens_used: totalTokens,
        estimated_cost_usd: estimatedCost,
        finished_at: new Date().toISOString(),
        error: errors.length > 0 ? errors.join('; ') : null
      })
      .eq('id', batch.id)

    // Update citation stats (aggregate)
    try {
      await supabase.rpc('update_citation_stats')
    } catch {
      // Ignore if RPC doesn't exist
    }

    // Update brand visibility scores
    try {
      await supabase.rpc('update_brand_visibility')
    } catch {
      // Ignore if RPC doesn't exist yet
    }

    // Update university visibility scores
    try {
      await supabase.rpc('update_university_visibility')
    } catch {
      // Ignore if RPC doesn't exist
    }

    return NextResponse.json({
      success: true,
      batch_id: batch.id,
      topic: topic || 'all',
      priority: priority || 'all',
      results: {
        prompts_total: promptsToRun.length,
        completed,
        failed,
        total_tokens: totalTokens,
        estimated_cost_usd: estimatedCost.toFixed(4)
      },
      errors: errors.length > 0 ? errors : undefined
    })

  } catch (error) {
    console.error('Batch execution error:', error)
    return NextResponse.json(
      { error: 'Batch execution failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// GET endpoint to check batch status or see what's stale
export async function GET(request: NextRequest) {
  const supabase = getSupabase()
  const { searchParams } = new URL(request.url)
  const batchId = searchParams.get('batch_id')
  const checkStale = searchParams.get('check_stale')

  // Check what prompts are stale and ready to run
  if (checkStale === 'true') {
    const topic = searchParams.get('topic')
    
    let query = supabase
      .from('seed_prompts')
      .select('id, prompt_text, topic, priority, frequency_days, last_executed_at')
      .eq('is_active', true)
      .or('last_executed_at.is.null,last_executed_at.lt.' + new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

    if (topic) {
      query = query.eq('topic', topic)
    }

    const { data: stalePrompts, error } = await query
      .order('last_executed_at', { ascending: true, nullsFirst: true })
      .limit(100)

    // Also get summary by topic
    const { data: summary } = await supabase
      .from('seed_prompts')
      .select('topic, priority')
      .eq('is_active', true)
      .or('last_executed_at.is.null,last_executed_at.lt.' + new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

    const topicCounts: Record<string, number> = {}
    const priorityCounts: Record<string, number> = {}
    summary?.forEach(p => {
      topicCounts[p.topic] = (topicCounts[p.topic] || 0) + 1
      priorityCounts[p.priority || 'standard'] = (priorityCounts[p.priority || 'standard'] || 0) + 1
    })

    return NextResponse.json({
      stale_count: stalePrompts?.length || 0,
      by_topic: topicCounts,
      by_priority: priorityCounts,
      sample: stalePrompts?.slice(0, 10).map(p => ({
        id: p.id,
        prompt: p.prompt_text.slice(0, 60) + '...',
        topic: p.topic,
        priority: p.priority,
        last_run: p.last_executed_at
      }))
    })
  }

  if (batchId) {
    const { data: batch } = await supabase
      .from('prompt_execution_batches')
      .select('*')
      .eq('id', batchId)
      .single()

    return NextResponse.json({ batch })
  }

  // Return recent batches
  const { data: batches } = await supabase
    .from('prompt_execution_batches')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10)

  return NextResponse.json({ batches })
}