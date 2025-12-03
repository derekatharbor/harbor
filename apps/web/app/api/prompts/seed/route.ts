// Location: app/api/prompts/seed/route.ts
// Seed the database with our 125 SaaS prompts

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { SEED_PROMPTS, TOPICS, PROMPT_STATS } from '@/lib/seed-prompts'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const body = await request.json().catch(() => ({}))
    const force = body.force === true

    // Check if already seeded
    const { count } = await supabase
      .from('seed_prompts')
      .select('*', { count: 'exact', head: true })

    if (count && count > 0 && !force) {
      return NextResponse.json({
        success: false,
        message: `Database already has ${count} seed prompts. Pass force: true to re-seed.`,
        existing_count: count
      })
    }

    // Clear existing if force
    if (force && count && count > 0) {
      await supabase
        .from('seed_prompts')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000')
    }

    // Insert prompts
    const promptsToInsert = SEED_PROMPTS.map(p => ({
      prompt_text: p.prompt_text,
      topic: p.topic,
      intent: p.intent,
      is_active: true
    }))

    const { data, error } = await supabase
      .from('seed_prompts')
      .insert(promptsToInsert)
      .select('id, topic')

    if (error) {
      throw error
    }

    // Count by topic
    const topicCounts = data?.reduce((acc, p) => {
      acc[p.topic] = (acc[p.topic] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}

    return NextResponse.json({
      success: true,
      seeded: data?.length || 0,
      stats: PROMPT_STATS,
      by_topic: topicCounts,
      topics: TOPICS
    })

  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json(
      { error: 'Failed to seed prompts', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    )
  }
}

// GET to check current seed status
export async function GET() {
  const supabase = getSupabase()
  
  const { data: prompts, count } = await supabase
    .from('seed_prompts')
    .select('topic', { count: 'exact' })

  const topicCounts = prompts?.reduce((acc, p) => {
    acc[p.topic] = (acc[p.topic] || 0) + 1
    return acc
  }, {} as Record<string, number>) || {}

  // Get recent executions
  const { data: recentBatches } = await supabase
    .from('prompt_execution_batches')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5)

  return NextResponse.json({
    seeded_prompts: count || 0,
    by_topic: topicCounts,
    recent_batches: recentBatches,
    expected: PROMPT_STATS
  })
}