// app/api/prompts/[id]/route.ts
// Fetch single prompt with all execution details

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabase()
    const promptId = params.id

    // Get the seed prompt
    const { data: prompt, error: promptError } = await supabase
      .from('seed_prompts')
      .select('*')
      .eq('id', promptId)
      .single()

    if (promptError || !prompt) {
      return NextResponse.json({ error: 'Prompt not found' }, { status: 404 })
    }

    // Get all executions for this prompt
    const { data: executions } = await supabase
      .from('prompt_executions')
      .select('*')
      .eq('prompt_id', promptId)
      .is('error', null)
      .order('executed_at', { ascending: false })

    // Get execution IDs
    const executionIds = executions?.map(e => e.id) || []

    // Get brand mentions
    const { data: mentions } = await supabase
      .from('prompt_brand_mentions')
      .select('*')
      .in('execution_id', executionIds)

    // Get citations
    const { data: citations } = await supabase
      .from('prompt_citations')
      .select('*')
      .in('execution_id', executionIds)

    // Build execution objects with their mentions and citations
    const executionsWithData = executions?.map(exec => {
      const execMentions = mentions?.filter(m => m.execution_id === exec.id) || []
      const execCitations = citations?.filter(c => c.execution_id === exec.id) || []
      
      return {
        id: exec.id,
        model: exec.model,
        response_text: exec.response_text,
        executed_at: exec.executed_at,
        tokens_used: exec.tokens_used,
        brands_mentioned: execMentions.map(m => m.brand_name),
        citations: execCitations.map(c => ({
          url: c.url,
          domain: c.domain,
          source_type: c.source_type
        }))
      }
    }) || []

    // Calculate brand visibility stats
    const brandStats: Record<string, { 
      mentions: number
      positions: number[]
      sentiments: string[]
    }> = {}

    mentions?.forEach(m => {
      if (!brandStats[m.brand_name]) {
        brandStats[m.brand_name] = { mentions: 0, positions: [], sentiments: [] }
      }
      brandStats[m.brand_name].mentions++
      if (m.position) brandStats[m.brand_name].positions.push(m.position)
      if (m.sentiment) brandStats[m.brand_name].sentiments.push(m.sentiment)
    })

    const totalExecutions = executions?.length || 1
    const brands = Object.entries(brandStats)
      .map(([name, stats]) => {
        const avgPosition = stats.positions.length > 0
          ? Math.round(stats.positions.reduce((a, b) => a + b, 0) / stats.positions.length)
          : null
        
        // Determine dominant sentiment
        const sentimentCounts = { positive: 0, neutral: 0, negative: 0 }
        stats.sentiments.forEach(s => {
          if (s in sentimentCounts) sentimentCounts[s as keyof typeof sentimentCounts]++
        })
        const dominantSentiment = Object.entries(sentimentCounts)
          .sort((a, b) => b[1] - a[1])[0]?.[0] as 'positive' | 'neutral' | 'negative' | null

        return {
          brand_name: name,
          visibility_pct: Math.round((stats.mentions / totalExecutions) * 100),
          sentiment: dominantSentiment,
          avg_position: avgPosition
        }
      })
      .sort((a, b) => b.visibility_pct - a.visibility_pct)

    // Calculate source stats
    const sourceStats: Record<string, {
      count: number
      source_type: string
    }> = {}

    citations?.forEach(c => {
      if (!sourceStats[c.domain]) {
        sourceStats[c.domain] = { count: 0, source_type: c.source_type }
      }
      sourceStats[c.domain].count++
    })

    const sources = Object.entries(sourceStats)
      .map(([domain, stats]) => ({
        domain,
        used_pct: Math.round((stats.count / Math.max(totalExecutions, 1)) * 100),
        avg_citations: stats.count / Math.max(totalExecutions, 1),
        source_type: stats.source_type
      }))
      .sort((a, b) => b.used_pct - a.used_pct)
      .slice(0, 10)

    return NextResponse.json({
      id: prompt.id,
      prompt_text: prompt.prompt_text,
      topic: prompt.topic,
      status: prompt.is_active ? 'active' : 'inactive',
      created_at: prompt.created_at,
      executions: executionsWithData,
      brands,
      sources
    })

  } catch (error) {
    console.error('Error fetching prompt detail:', error)
    return NextResponse.json(
      { error: 'Failed to fetch prompt', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    )
  }
}
