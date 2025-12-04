// POST /api/prompts/execute-batch
// Execute batch of seed prompts - called by cron job
// This is the main data collection engine

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
    const batchSize = body.batch_size || body.limit || 25 // Process 25 prompts per run to stay under timeout
    const batchType = body.batch_type || 'scheduled'

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

    // Get seed prompts that haven't been run recently (> 3 days ago)
    const { data: prompts, error: promptsError } = await supabase
      .from('seed_prompts')
      .select('id, prompt_text, topic')
      .eq('is_active', true)
      .order('created_at', { ascending: true })
      .limit(batchSize)

    if (promptsError) {
      throw new Error('Failed to fetch prompts')
    }

    if (!prompts || prompts.length === 0) {
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
        message: 'No prompts to execute',
        batch_id: batch.id
      })
    }

    // Track results
    let totalTokens = 0
    let completed = 0
    let failed = 0
    const errors: string[] = []

    // Execute each prompt
    for (const prompt of prompts) {
      try {
        const results = await executePromptAllModels(
          prompt.id,
          prompt.prompt_text
        )

        await storeExecutionResults(supabase, results)

        const promptTokens = results.reduce((sum, r) => sum + r.tokens_used, 0)
        totalTokens += promptTokens
        
        const promptErrors = results.filter(r => r.error)
        if (promptErrors.length === results.length) {
          failed++
          errors.push(`Prompt ${prompt.id}: All models failed`)
        } else {
          completed++
        }

        // Small delay between prompts to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 500))

      } catch (error) {
        failed++
        errors.push(`Prompt ${prompt.id}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    // Calculate estimated cost (updated for cheaper models)
    // GPT-4o-mini: ~$0.0004 per 1K tokens, Claude Haiku: ~$0.002, Gemini Flash: ~$0.0001, Perplexity Sonar: ~$0.001
    const estimatedCost = (totalTokens / 1000000) * 2 // rough average with cheaper models

    // Update batch record
    await supabase
      .from('prompt_execution_batches')
      .update({
        status: failed === prompts.length ? 'failed' : 'completed',
        prompts_total: prompts.length,
        prompts_completed: completed,
        prompts_failed: failed,
        total_tokens_used: totalTokens,
        estimated_cost_usd: estimatedCost,
        finished_at: new Date().toISOString(),
        error: errors.length > 0 ? errors.join('; ') : null
      })
      .eq('id', batch.id)

    // Update citation stats (aggregate)
    await supabase.rpc('update_citation_stats')

    return NextResponse.json({
      success: true,
      batch_id: batch.id,
      results: {
        prompts_total: prompts.length,
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

// GET endpoint to check batch status
export async function GET(request: NextRequest) {
  const supabase = getSupabase()
  const { searchParams } = new URL(request.url)
  const batchId = searchParams.get('batch_id')

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