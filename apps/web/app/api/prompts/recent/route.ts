// app/api/prompts/recent/route.ts
// Get recent prompt executions - supports BOTH old (seed_prompts) and new (user_prompts) flows

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
    logo: '/models/chatgpt-logo.png', 
    name: 'ChatGPT' 
  },
  claude: { 
    logo: '/models/claude-logo.png', 
    name: 'Claude' 
  },
  perplexity: { 
    logo: '/models/perplexity-logo.png', 
    name: 'Perplexity' 
  },
  gemini: { 
    logo: '/models/gemini-logo.png', 
    name: 'Gemini' 
  }
}

export async function GET(request: NextRequest) {
  const supabase = getSupabase()
  const { searchParams } = new URL(request.url)
  
  const limit = parseInt(searchParams.get('limit') || '12')
  const brandFilter = searchParams.get('brand')
  const dashboardId = searchParams.get('dashboard_id')

  try {
    // =========================================================================
    // STEP 1: Get prompts based on context
    // =========================================================================
    
    // Map to store all prompts: id -> { prompt_text, topic, source }
    const promptMap = new Map<string, { prompt_text: string; topic: string; source: string }>()
    
    // If dashboard_id provided, ONLY get that dashboard's user_prompts
    // (Don't mix in global seed_prompts - those are suggestions, not tracked)
    if (dashboardId) {
      const { data: userPrompts } = await supabase
        .from('user_prompts')
        .select('id, prompt_text, topic, dashboard_id')
        .eq('dashboard_id', dashboardId)
        .eq('is_active', true)
      
      userPrompts?.forEach(p => {
        promptMap.set(p.id, { prompt_text: p.prompt_text, topic: p.topic || 'Custom', source: 'user' })
      })

      // If no user prompts, return empty with helpful message
      if (promptMap.size === 0) {
        return NextResponse.json({ 
          prompts: [], 
          total: 0,
          message: 'No prompts found for this dashboard'
        })
      }
    } else {
      // No dashboard_id - return global seed_prompts (legacy behavior)
      const { data: seedPrompts } = await supabase
        .from('seed_prompts')
        .select('id, prompt_text, topic')
        .neq('topic', 'universities')
      
      seedPrompts?.forEach(p => {
        promptMap.set(p.id, { prompt_text: p.prompt_text, topic: p.topic || 'General', source: 'seed' })
      })
    }

    const promptIds = Array.from(promptMap.keys())

    if (promptIds.length === 0) {
      return NextResponse.json({ prompts: [], total: 0 })
    }

    // =========================================================================
    // STEP 2: Get executions for those prompts
    // =========================================================================
    
    const { data: executions, error } = await supabase
      .from('prompt_executions')
      .select('id, model, response_text, executed_at, prompt_id')
      .in('prompt_id', promptIds)
      .not('response_text', 'is', null)
      .order('executed_at', { ascending: false })
      .limit(100)

    if (error) throw error

    // =========================================================================
    // STEP 3: Get brand mentions and citations
    // =========================================================================
    
    const executionIds = executions?.map(e => e.id) || []
    
    let mentionsByExecution = new Map<string, any[]>()
    let citationsByExecution = new Map<string, any[]>()

    if (executionIds.length > 0) {
      const { data: mentions } = await supabase
        .from('prompt_brand_mentions')
        .select('execution_id, brand_name, position, sentiment')
        .in('execution_id', executionIds)

      const { data: citations } = await supabase
        .from('prompt_citations')
        .select('execution_id, domain, url')
        .in('execution_id', executionIds)

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
    }

    // =========================================================================
    // STEP 4: Build results - merge prompts with their latest execution
    // =========================================================================
    
    const seenPrompts = new Set<string>()
    let results: any[] = []

    // First, add prompts that have executions
    executions?.forEach((exec: any) => {
      const promptData = promptMap.get(exec.prompt_id)
      if (!promptData) return
      
      const promptText = promptData.prompt_text
      if (seenPrompts.has(promptText)) return
      seenPrompts.add(promptText)

      const execMentions = mentionsByExecution.get(exec.id) || []
      const execCitations = citationsByExecution.get(exec.id) || []
      
      const uniqueDomains = [...new Set(execCitations.map(c => c.domain).filter(Boolean))].slice(0, 4)
      const uniqueBrands = [...new Set(execMentions.map(m => m.brand_name).filter(Boolean))]

      const modelInfo = MODEL_LOGOS[exec.model] || { logo: '', name: exec.model }

      results.push({
        id: exec.id,
        prompt_id: exec.prompt_id,
        prompt: promptText,
        topic: promptData.topic,
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
        citationFavicons: uniqueDomains.map(d => `https://www.google.com/s2/favicons?domain=${d}&sz=32`),
        source: promptData.source,
        status: 'executed'
      })
    })

    // Then, add prompts that haven't been executed yet (from promptMap)
    promptMap.forEach((promptData, promptId) => {
      if (seenPrompts.has(promptData.prompt_text)) return
      seenPrompts.add(promptData.prompt_text)

      results.push({
        id: promptId,
        prompt_id: promptId,
        prompt: promptData.prompt_text,
        topic: promptData.topic,
        model: null,
        modelName: 'Pending',
        modelLogo: null,
        responsePreview: 'Awaiting first scan...',
        responseText: null,
        executedAt: null,
        timeAgo: 'Pending',
        brandsCount: 0,
        brands: [],
        citationsCount: 0,
        citationDomains: [],
        citationFavicons: [],
        source: promptData.source,
        status: 'pending'
      })
    })

    // =========================================================================
    // STEP 5: Filter and limit
    // =========================================================================
    
    // Filter by brand if specified
    if (brandFilter) {
      const brandLower = brandFilter.toLowerCase()
      results = results.filter(r => 
        r.brands.some((b: string) => b.toLowerCase().includes(brandLower))
      )
    }

    // Sort: executed first (by date), then pending
    results.sort((a, b) => {
      if (a.status === 'pending' && b.status !== 'pending') return 1
      if (a.status !== 'pending' && b.status === 'pending') return -1
      if (a.executedAt && b.executedAt) {
        return new Date(b.executedAt).getTime() - new Date(a.executedAt).getTime()
      }
      return 0
    })

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