// POST /api/prompts/backfill-extraction
// Reprocess existing executions to extract universities (and brands from ai_profiles)
// Run this once to populate university_mentions

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { extractEntities, storeExtractionResults } from '@/lib/prompts/unified-extraction'

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
    const topic = body.topic || null // Optional: only reprocess specific topic
    const limit = body.limit || 100  // Process in batches
    const offset = body.offset || 0

    // Fetch executions that need processing
    let query = supabase
      .from('prompt_executions')
      .select(`
        id, 
        response_text, 
        prompt_id,
        executed_at,
        seed_prompts!inner(topic)
      `)
      .not('response_text', 'is', null)
      .order('executed_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (topic) {
      query = query.eq('seed_prompts.topic', topic)
    }

    const { data: executions, error: fetchError } = await query

    if (fetchError) {
      throw new Error(`Failed to fetch executions: ${fetchError.message}`)
    }

    if (!executions || executions.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No executions to process',
        processed: 0,
        offset,
        limit
      })
    }

    let processed = 0
    let brandsFound = 0
    let universitiesFound = 0
    const errors: string[] = []

    for (const execution of executions) {
      if (!execution.response_text) continue

      try {
        const entities = await extractEntities(supabase, execution.response_text)
        await storeExtractionResults(supabase, execution.id, entities)

        processed++
        brandsFound += entities.brands.length
        universitiesFound += entities.universities.length

      } catch (error) {
        errors.push(`Execution ${execution.id}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    // Update aggregate stats if we found universities
    if (universitiesFound > 0) {
      try {
        await supabase.rpc('update_university_visibility')
      } catch {
        // RPC might not exist yet
      }
    }

    return NextResponse.json({
      success: true,
      processed,
      brands_found: brandsFound,
      universities_found: universitiesFound,
      offset,
      limit,
      has_more: executions.length === limit,
      next_offset: offset + limit,
      errors: errors.length > 0 ? errors : undefined
    })

  } catch (error) {
    console.error('Backfill error:', error)
    return NextResponse.json(
      { error: 'Backfill failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// GET to check backfill status
export async function GET(request: NextRequest) {
  const supabase = getSupabase()

  const [
    { count: totalExecutions },
    { count: brandMentions },
    { count: universityMentions }
  ] = await Promise.all([
    supabase.from('prompt_executions').select('*', { count: 'exact', head: true }),
    supabase.from('prompt_brand_mentions').select('*', { count: 'exact', head: true }),
    supabase.from('university_mentions').select('*', { count: 'exact', head: true })
  ])

  return NextResponse.json({
    total_executions: totalExecutions,
    brand_mentions: brandMentions,
    university_mentions: universityMentions,
    extraction_rate: {
      brands: totalExecutions ? Math.round((brandMentions || 0) / totalExecutions * 100) : 0,
      universities: totalExecutions ? Math.round((universityMentions || 0) / totalExecutions * 100) : 0
    }
  })
}
