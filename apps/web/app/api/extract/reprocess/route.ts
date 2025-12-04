// app/api/extract/reprocess/route.ts
// Reprocess existing executions to extract university mentions
// Run this after setting up university_profiles table

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// Simple extraction without the full module (for quick deployment)
async function extractUniversities(supabase: any, responseText: string) {
  // Get all university names/short names
  const { data: universities } = await supabase
    .from('university_profiles')
    .select('id, name, short_name')
    .eq('is_active', true)
  
  if (!universities) return []
  
  const found: Array<{
    university_id: string
    name: string
    position: number
    sentiment: string
    context: string
  }> = []
  
  const textLower = responseText.toLowerCase()
  let position = 1
  
  for (const uni of universities) {
    // Check full name
    const nameLower = uni.name.toLowerCase()
    let matchIndex = textLower.indexOf(nameLower)
    
    // Check short name if full name not found
    if (matchIndex === -1 && uni.short_name) {
      const shortLower = uni.short_name.toLowerCase()
      // Use word boundary check for short names
      const regex = new RegExp(`\\b${shortLower}\\b`, 'i')
      const match = regex.exec(textLower)
      if (match) {
        matchIndex = match.index
      }
    }
    
    if (matchIndex !== -1) {
      // Extract context
      const start = Math.max(0, matchIndex - 80)
      const end = Math.min(responseText.length, matchIndex + 80)
      const context = responseText.slice(start, end).replace(/\n/g, ' ')
      
      // Detect sentiment
      const contextLower = context.toLowerCase()
      const positive = ['best', 'top', 'leading', 'excellent', 'renowned', 'prestigious', 'highly ranked', 'recommended'].some(w => contextLower.includes(w))
      const negative = ['worst', 'poor', 'declining', 'struggling', 'overrated'].some(w => contextLower.includes(w))
      
      found.push({
        university_id: uni.id,
        name: uni.name,
        position: position++,
        sentiment: positive ? 'positive' : negative ? 'negative' : 'neutral',
        context: context.slice(0, 200)
      })
    }
  }
  
  return found
}

export async function POST(request: NextRequest) {
  const supabase = getSupabase()
  
  try {
    const body = await request.json().catch(() => ({}))
    const topic = body.topic || 'universities'
    const limit = body.limit || 500
    
    // Get executions for the topic
    const { data: executions, error: fetchError } = await supabase
      .from('prompt_executions')
      .select(`
        id,
        response_text,
        prompt_id,
        seed_prompts!inner(topic)
      `)
      .eq('seed_prompts.topic', topic)
      .not('response_text', 'is', null)
      .limit(limit)
    
    if (fetchError) {
      throw new Error(`Failed to fetch executions: ${fetchError.message}`)
    }
    
    if (!executions || executions.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No executions to process',
        topic
      })
    }
    
    let processed = 0
    let totalMentions = 0
    const mentionCounts: Record<string, number> = {}
    
    for (const execution of executions) {
      if (!execution.response_text) continue
      
      const universities = await extractUniversities(supabase, execution.response_text)
      
      if (universities.length > 0) {
        // Insert mentions
        const mentions = universities.map(u => ({
          execution_id: execution.id,
          university_id: u.university_id,
          position: u.position,
          sentiment: u.sentiment,
          context: u.context
        }))
        
        const { error: insertError } = await supabase
          .from('university_mentions')
          .upsert(mentions, { 
            onConflict: 'execution_id,university_id',
            ignoreDuplicates: true 
          })
        
        if (!insertError) {
          totalMentions += universities.length
          universities.forEach(u => {
            mentionCounts[u.name] = (mentionCounts[u.name] || 0) + 1
          })
        }
      }
      
      processed++
    }
    
    // Update visibility scores
    await supabase.rpc('update_university_visibility')
    
    // Sort by mentions
    const topMentions = Object.entries(mentionCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([name, count]) => ({ name, count }))
    
    return NextResponse.json({
      success: true,
      topic,
      results: {
        executions_processed: processed,
        total_mentions: totalMentions,
        unique_universities: Object.keys(mentionCounts).length,
        top_mentions: topMentions
      }
    })
    
  } catch (error) {
    console.error('Reprocess error:', error)
    return NextResponse.json(
      { error: 'Reprocessing failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// GET endpoint to check university mention stats
export async function GET(request: NextRequest) {
  const supabase = getSupabase()
  
  const { data: stats } = await supabase
    .from('university_mentions')
    .select(`
      university_id,
      university_profiles!inner(name, short_name),
      sentiment
    `)
  
  if (!stats || stats.length === 0) {
    return NextResponse.json({ 
      message: 'No university mentions yet',
      hint: 'POST to this endpoint with { "topic": "universities" } to extract mentions'
    })
  }
  
  // Aggregate
  const counts: Record<string, { name: string, mentions: number, positive: number, neutral: number, negative: number }> = {}
  
  for (const row of stats) {
    const name = (row.university_profiles as any)?.name || 'Unknown'
    if (!counts[name]) {
      counts[name] = { name, mentions: 0, positive: 0, neutral: 0, negative: 0 }
    }
    counts[name].mentions++
    counts[name][row.sentiment as 'positive' | 'neutral' | 'negative']++
  }
  
  const leaderboard = Object.values(counts)
    .sort((a, b) => b.mentions - a.mentions)
    .slice(0, 25)
  
  return NextResponse.json({
    total_mentions: stats.length,
    unique_universities: Object.keys(counts).length,
    leaderboard
  })
}
