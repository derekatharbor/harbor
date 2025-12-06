// app/api/universities/reprocess/route.ts
// Reprocess existing prompt executions to extract university mentions
// Then calculate visibility scores

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { extractEntities, storeExtractionResults } from '@/lib/prompts/unified-extraction'

export const runtime = 'nodejs'
export const maxDuration = 300 // 5 minutes

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(request: NextRequest) {
  const supabase = getSupabase()
  
  try {
    const body = await request.json().catch(() => ({}))
    const limit = body.limit || 500
    const topicFilter = body.topic || 'universities' // Default to university prompts
    const force = body.force || false // Re-extract even if already processed

    console.log(`[Reprocess] Starting reprocessing - limit: ${limit}, topic: ${topicFilter}`)

    // Get executions that need processing
    let query = supabase
      .from('prompt_executions')
      .select(`
        id,
        response_text,
        prompt_id,
        seed_prompts!inner(topic)
      `)
      .not('response_text', 'is', null)
      .not('error', 'is', null)

    if (topicFilter) {
      query = query.eq('seed_prompts.topic', topicFilter)
    }

    // If not forcing, only get executions without university mentions
    if (!force) {
      // This is tricky - we need to left join and check for null
      // For now, just process all and let upsert handle duplicates
    }

    const { data: executions, error: fetchError } = await query.limit(limit)

    if (fetchError) {
      throw new Error(`Failed to fetch executions: ${fetchError.message}`)
    }

    if (!executions || executions.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No executions to process',
        processed: 0
      })
    }

    console.log(`[Reprocess] Found ${executions.length} executions to process`)

    let processed = 0
    let universitiesFound = 0
    let brandsFound = 0
    const errors: string[] = []

    // Process each execution
    for (const execution of executions) {
      try {
        if (!execution.response_text) continue

        const results = await extractEntities(supabase, execution.response_text)
        await storeExtractionResults(supabase, execution.id, results)

        processed++
        universitiesFound += results.universities.length
        brandsFound += results.brands.length

        // Log progress every 50
        if (processed % 50 === 0) {
          console.log(`[Reprocess] Progress: ${processed}/${executions.length}`)
        }

      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error'
        errors.push(`Execution ${execution.id}: ${msg}`)
      }
    }

    console.log(`[Reprocess] Extraction complete. Updating visibility scores...`)

    // Update visibility scores
    const { error: rpcError } = await supabase.rpc('update_university_visibility')
    
    if (rpcError) {
      console.error('[Reprocess] Failed to update visibility:', rpcError)
      errors.push(`Visibility update failed: ${rpcError.message}`)
    }

    // Get summary of results
    const { data: summary } = await supabase
      .from('university_profiles')
      .select('short_name, visibility_score, total_mentions')
      .gt('visibility_score', 0)
      .order('visibility_score', { ascending: false })
      .limit(10)

    return NextResponse.json({
      success: true,
      processed,
      universities_found: universitiesFound,
      brands_found: brandsFound,
      errors: errors.length > 0 ? errors.slice(0, 10) : undefined,
      top_universities: summary?.map(u => ({
        name: u.short_name,
        score: u.visibility_score,
        mentions: u.total_mentions
      }))
    })

  } catch (error) {
    console.error('[Reprocess] Fatal error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// GET endpoint to check current state
export async function GET() {
  const supabase = getSupabase()

  // Count executions by topic
  const { data: topicCounts } = await supabase
    .from('seed_prompts')
    .select('topic')
    .eq('is_active', true)

  const byTopic: Record<string, number> = {}
  topicCounts?.forEach(p => {
    byTopic[p.topic] = (byTopic[p.topic] || 0) + 1
  })

  // Count university mentions
  const { count: mentionCount } = await supabase
    .from('university_mentions')
    .select('*', { count: 'exact', head: true })

  // Get universities with scores
  const { data: scoredUniversities } = await supabase
    .from('university_profiles')
    .select('short_name, visibility_score, total_mentions')
    .gt('visibility_score', 0)
    .order('visibility_score', { ascending: false })
    .limit(20)

  // Count executions for university prompts
  const { count: uniExecutions } = await supabase
    .from('prompt_executions')
    .select('*, seed_prompts!inner(topic)', { count: 'exact', head: true })
    .eq('seed_prompts.topic', 'universities')

  return NextResponse.json({
    prompts_by_topic: byTopic,
    university_prompt_executions: uniExecutions || 0,
    university_mentions_stored: mentionCount || 0,
    universities_with_scores: scoredUniversities?.length || 0,
    top_universities: scoredUniversities
  })
}
