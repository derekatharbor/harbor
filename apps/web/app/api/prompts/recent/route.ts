// app/api/prompts/recent/route.ts
// Get recent prompt executions for the dashboard

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

const MODEL_LOGOS: Record<string, { logo: string; name: string }> = {
  chatgpt: { 
    logo: 'https://cdn.brandfetch.io/idR3duQxYl/w/512/h/512/theme/dark/icon.png?c=1id1Fyz-h7an5-5KR_y', 
    name: 'ChatGPT' 
  },
  claude: { 
    logo: 'https://cdn.brandfetch.io/idtDuTgr6r/w/512/h/512/theme/dark/icon.png?c=1id1Fyz-h7an5-5KR_y', 
    name: 'Claude' 
  },
  perplexity: { 
    logo: 'https://cdn.brandfetch.io/id6eZ0cPwH/w/512/h/512/theme/dark/icon.png?c=1id1Fyz-h7an5-5KR_y', 
    name: 'Perplexity' 
  },
  gemini: { 
    logo: 'https://cdn.brandfetch.io/idXPSxKVRO/w/512/h/512/theme/dark/icon.png?c=1id1Fyz-h7an5-5KR_y', 
    name: 'Gemini' 
  }
}

export async function GET(request: NextRequest) {
  const supabase = getSupabase()
  const { searchParams } = new URL(request.url)
  
  const limit = parseInt(searchParams.get('limit') || '12')
  const brandFilter = searchParams.get('brand') // Filter to show only prompts mentioning this brand
  const dashboardId = searchParams.get('dashboard_id')

  try {
    // Step 1: Get non-university prompt IDs
    const { data: nonUniPrompts } = await supabase
      .from('seed_prompts')
      .select('id, prompt_text, topic')
      .neq('topic', 'universities')
    
    const promptMap = new Map(nonUniPrompts?.map(p => [p.id, p]) || [])
    const promptIds = Array.from(promptMap.keys())

    if (promptIds.length === 0) {
      return NextResponse.json({ prompts: [], total: 0 })
    }

    // Step 2: Get executions for those prompts
    const { data: executions, error } = await supabase
      .from('prompt_executions')
      .select('id, model, response_text, executed_at, prompt_id')
      .in('prompt_id', promptIds)
      .not('response_text', 'is', null)
      .order('executed_at', { ascending: false })
      .limit(100)

    if (error) throw error

    // Merge prompt data
    const executionsWithPrompts = executions?.map(e => ({
      ...e,
      seed_prompts: promptMap.get(e.prompt_id)
    })) || []

    // Get brand mentions and citations for each execution
    const executionIds = executionsWithPrompts?.map(e => e.id) || []
    
    if (executionIds.length === 0) {
      return NextResponse.json({ prompts: [], total: 0 })
    }
    
    const { data: mentions } = await supabase
      .from('prompt_brand_mentions')
      .select('execution_id, brand_name, position, sentiment')
      .in('execution_id', executionIds)

    const { data: citations } = await supabase
      .from('prompt_citations')
      .select('execution_id, domain, url')
      .in('execution_id', executionIds)

    // Group mentions and citations by execution
    const mentionsByExecution = new Map<string, any[]>()
    const citationsByExecution = new Map<string, any[]>()

    mentions?.forEach(m => {
      const existing = mentionsByExecution.get(m.execution_id) || []
      existing.push(m)
      mentionsByExecution.set(m.execution_id, existing)
    })

    citations?.forEach(c => {
      const existing = citationsByExecution.get(c.execution_id) || []
      existing.push(c)
      citationsByExecution.set(c.execution_id, existing)
    })

    // Build response
    let results = executionsWithPrompts?.map((exec: any) => {
      const execMentions = mentionsByExecution.get(exec.id) || []
      const execCitations = citationsByExecution.get(exec.id) || []
      
      // Get unique domains for favicons
      const uniqueDomains = [...new Set(execCitations.map(c => c.domain).filter(Boolean))].slice(0, 4)
      
      // Get unique brands mentioned
      const uniqueBrands = [...new Set(execMentions.map(m => m.brand_name).filter(Boolean))]

      const modelInfo = MODEL_LOGOS[exec.model] || { logo: '', name: exec.model }

      return {
        id: exec.id,
        prompt: exec.seed_prompts?.prompt_text || 'Unknown prompt',
        topic: exec.seed_prompts?.topic || 'Unknown',
        model: exec.model,
        modelName: modelInfo.name,
        modelLogo: modelInfo.logo,
        responsePreview: exec.response_text?.slice(0, 180) + (exec.response_text?.length > 180 ? '...' : ''),
        responseText: exec.response_text,
        executedAt: exec.executed_at,
        timeAgo: getTimeAgo(new Date(exec.executed_at)),
        brandsCount: uniqueBrands.length,
        brands: uniqueBrands,
        citationsCount: execCitations.length,
        citationDomains: uniqueDomains,
        citationFavicons: uniqueDomains.map(d => `https://www.google.com/s2/favicons?domain=${d}&sz=32`)
      }
    }) || []

    // Filter by brand if specified
    if (brandFilter) {
      const brandLower = brandFilter.toLowerCase()
      results = results.filter(r => 
        r.brands.some((b: string) => b.toLowerCase().includes(brandLower))
      )
    }

    // Limit results
    results = results.slice(0, limit)

    return NextResponse.json({
      prompts: results,
      total: results.length
    })

  } catch (error) {
    console.error('Recent prompts API error:', error)
    return NextResponse.json({ error: 'Failed to fetch prompts' }, { status: 500 })
  }
}

function getTimeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHours / 24)

  if (diffHours < 1) return 'Just now'
  if (diffHours < 24) return `${diffHours} hr. ago`
  if (diffDays === 1) return '1 day ago'
  if (diffDays < 7) return `${diffDays} days ago`
  return date.toLocaleDateString()
}