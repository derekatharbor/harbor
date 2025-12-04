// app/api/dashboard/[id]/brand-visibility/route.ts
// Aggregate brand mention data for the Brand Visibility page

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: dashboardId } = await params
    const supabase = getSupabase()

    // Get dashboard info
    const { data: dashboard, error: dashError } = await supabase
      .from('dashboards')
      .select('brand_name, domain')
      .eq('id', dashboardId)
      .single()

    if (dashError || !dashboard) {
      return NextResponse.json({ error: 'Dashboard not found' }, { status: 404 })
    }

    const brandName = dashboard.brand_name.toLowerCase()

    // Get all executions for brand mention analysis
    const { data: executions, error: execError } = await supabase
      .from('prompt_executions')
      .select(`
        id,
        model,
        executed_at,
        prompt_brand_mentions (
          brand_name,
          position,
          sentiment
        )
      `)
      .is('error', null)
      .order('executed_at', { ascending: false })

    if (execError) {
      console.error('Error fetching executions:', execError)
      return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
    }

    // Process the data
    let totalMentions = 0
    let positiveSentiment = 0
    let neutralSentiment = 0
    let negativeSentiment = 0
    const modelBreakdown: Record<string, { mentions: number; sentiment: number[] }> = {
      chatgpt: { mentions: 0, sentiment: [] },
      claude: { mentions: 0, sentiment: [] },
      perplexity: { mentions: 0, sentiment: [] }
    }
    const descriptorMap = new Map<string, { count: number; sentiment: string }>()
    const positionSum = { total: 0, count: 0 }

    // Count mentions of the user's brand
    executions?.forEach(exec => {
      const mentions = exec.prompt_brand_mentions || []
      
      mentions.forEach((mention: any) => {
        // Check if this mention is for the user's brand (case-insensitive)
        const mentionBrand = mention.brand_name?.toLowerCase()
        if (mentionBrand && (
          mentionBrand.includes(brandName) || 
          brandName.includes(mentionBrand) ||
          mentionBrand === brandName
        )) {
          totalMentions++
          
          // Track position
          if (mention.position) {
            positionSum.total += mention.position
            positionSum.count++
          }

          // Track sentiment
          const sentiment = mention.sentiment?.toLowerCase() || 'neutral'
          if (sentiment === 'positive' || sentiment === 'pos') {
            positiveSentiment++
          } else if (sentiment === 'negative' || sentiment === 'neg') {
            negativeSentiment++
          } else {
            neutralSentiment++
          }

          // Track by model
          const model = exec.model?.toLowerCase() || 'unknown'
          if (modelBreakdown[model]) {
            modelBreakdown[model].mentions++
          }
        }
      })
    })

    // Calculate sentiment percentages
    const totalSentiment = positiveSentiment + neutralSentiment + negativeSentiment
    const sentimentBreakdown = {
      positive: totalSentiment > 0 ? Math.round((positiveSentiment / totalSentiment) * 100) : 0,
      neutral: totalSentiment > 0 ? Math.round((neutralSentiment / totalSentiment) * 100) : 0,
      negative: totalSentiment > 0 ? Math.round((negativeSentiment / totalSentiment) * 100) : 0
    }

    // Calculate visibility index (mentions * position factor)
    const avgPosition = positionSum.count > 0 ? positionSum.total / positionSum.count : 5
    const positionFactor = Math.max(0.2, 1 - (avgPosition - 1) * 0.15) // Higher position = higher factor
    const visibilityIndex = Math.min(100, Math.round(
      (totalMentions * 2 * positionFactor) + (sentimentBreakdown.positive * 0.5)
    ))

    // Format model breakdown
    const modelData = Object.entries(modelBreakdown)
      .filter(([_, data]) => data.mentions > 0)
      .map(([model, data]) => ({
        model: model === 'chatgpt' ? 'ChatGPT' : 
               model === 'claude' ? 'Claude' : 
               model === 'perplexity' ? 'Perplexity' : model,
        mentions: data.mentions,
        sentiment: sentimentBreakdown.positive // Use overall for now
      }))
      .sort((a, b) => b.mentions - a.mentions)

    // For now, generate placeholder descriptors based on brand type
    // In the future, this would come from LLM analysis
    const descriptors = [
      { word: 'trusted', sentiment: 'positive', weight: 85, count: Math.round(totalMentions * 0.3) },
      { word: 'reliable', sentiment: 'positive', weight: 78, count: Math.round(totalMentions * 0.25) },
      { word: 'professional', sentiment: 'neutral', weight: 72, count: Math.round(totalMentions * 0.2) },
      { word: 'established', sentiment: 'neutral', weight: 65, count: Math.round(totalMentions * 0.15) },
    ].filter(d => d.count > 0)

    return NextResponse.json({
      brand_name: dashboard.brand_name,
      visibility_index: visibilityIndex,
      visibility_delta: 0, // Would need historical data to calculate
      total_mentions: totalMentions,
      mentions_delta: 0,
      sentiment_score: sentimentBreakdown.positive,
      sentiment_delta: 0,
      sentiment_breakdown: sentimentBreakdown,
      model_breakdown: modelData,
      descriptors,
      avg_position: avgPosition.toFixed(1),
      associations: [], // Would need additional analysis
      has_data: totalMentions > 0
    })

  } catch (error) {
    console.error('Error in brand visibility API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
