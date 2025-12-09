// app/api/prompts/recent/route.ts
// Get recent prompt executions for a dashboard's user_prompts

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

export async function GET(request: NextRequest) {
  const supabase = getSupabase()
  const { searchParams } = new URL(request.url)
  
  const limit = parseInt(searchParams.get('limit') || '12')
  const brandFilter = searchParams.get('brand')
  const dashboardId = searchParams.get('dashboard_id')

  console.log('[prompts/recent] Request:', { dashboardId, limit, brandFilter })

  try {
    if (!dashboardId) {
      console.log('[prompts/recent] No dashboard_id provided')
      return NextResponse.json({ prompts: [], total: 0 })
    }

    // Step 1: Get user_prompts for this dashboard
    const { data: userPrompts, error: upError } = await supabase
      .from('user_prompts')
      .select('id, prompt_text, topic')
      .eq('dashboard_id', dashboardId)
      .eq('is_active', true)
    
    console.log('[prompts/recent] user_prompts:', userPrompts?.length || 0, upError?.message || 'ok')

    if (!userPrompts || userPrompts.length === 0) {
      return NextResponse.json({ prompts: [], total: 0 })
    }

    const promptIds = userPrompts.map(p => p.id)
    const promptMap = new Map(userPrompts.map(p => [p.id, p]))

    // Step 2: Get executions for these prompts
    const { data: executions, error: execError } = await supabase
      .from('prompt_executions')
      .select('id, prompt_id, model, response_text, executed_at')
      .in('prompt_id', promptIds)
      .not('response_text', 'is', null)
      .order('executed_at', { ascending: false })

    console.log('[prompts/recent] executions:', executions?.length || 0, execError?.message || 'ok')

    // Step 3: Get brand mentions and citations for executions
    const executionIds = executions?.map(e => e.id) || []
    
    let mentionsByExecution = new Map<string, any[]>()
    let citationsByExecution = new Map<string, any[]>()

    if (executionIds.length > 0) {
      const { data: mentions } = await supabase
        .from('prompt_brand_mentions')
        .select('execution_id, brand_name, position')
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

    // Step 4: Build results - show all executions (each model gets its own card)
    let results: any[] = []

    // Add all executions with full data
    executions?.forEach((exec) => {
      const prompt = promptMap.get(exec.prompt_id)
      if (!prompt) return

      const execMentions = mentionsByExecution.get(exec.id) || []
      const execCitations = citationsByExecution.get(exec.id) || []
      
      const uniqueDomains = [...new Set(execCitations.map(c => c.domain).filter(Boolean))].slice(0, 4)
      const uniqueBrands = [...new Set(execMentions.map(m => m.brand_name).filter(Boolean))]

      const modelInfo = MODEL_LOGOS[exec.model] || { logo: '/models/chatgpt-logo.png', name: exec.model }

      results.push({
        id: exec.id,
        prompt_id: exec.prompt_id,
        prompt: prompt.prompt_text,
        topic: prompt.topic || 'General',
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
        status: 'executed'
      })
    })

    // Add prompts that haven't been executed yet
    const executedPromptIds = new Set(executions?.map(e => e.prompt_id) || [])
    userPrompts.forEach(prompt => {
      if (executedPromptIds.has(prompt.id)) return
      
      results.push({
        id: prompt.id,
        prompt_id: prompt.id,
        prompt: prompt.prompt_text,
        topic: prompt.topic || 'General',
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
        status: 'pending'
      })
    })

    // Filter by brand if specified
    if (brandFilter) {
      const brandLower = brandFilter.toLowerCase()
      results = results.filter(r => 
        r.brands.some((b: string) => b.toLowerCase().includes(brandLower))
      )
    }

    // Sort: mix models together (group by prompt, interleave models)
    // This creates a more varied visual than row-by-row
    results.sort((a, b) => {
      // First by execution time (newest first)
      if (a.executedAt && b.executedAt) {
        const timeDiff = new Date(b.executedAt).getTime() - new Date(a.executedAt).getTime()
        // If within same second, vary by model to interleave
        if (Math.abs(timeDiff) < 1000) {
          const modelOrder: Record<string, number> = { chatgpt: 0, claude: 1, perplexity: 2 }
          return (modelOrder[a.model] || 0) - (modelOrder[b.model] || 0)
        }
        return timeDiff
      }
      // Pending items last
      if (a.status === 'pending' && b.status !== 'pending') return 1
      if (a.status !== 'pending' && b.status === 'pending') return -1
      return 0
    })

    // Interleave by prompt to avoid same-prompt clustering
    const byPrompt = new Map<string, any[]>()
    results.forEach(r => {
      const list = byPrompt.get(r.prompt_id) || []
      list.push(r)
      byPrompt.set(r.prompt_id, list)
    })
    
    // Round-robin through prompts
    const interleaved: any[] = []
    const promptLists = Array.from(byPrompt.values())
    const maxLen = Math.max(...promptLists.map(l => l.length))
    
    for (let i = 0; i < maxLen; i++) {
      for (const list of promptLists) {
        if (list[i]) interleaved.push(list[i])
      }
    }
    
    results = interleaved.slice(0, limit)

    console.log('[prompts/recent] Returning:', results.length, 'prompts')

    return NextResponse.json({
      prompts: results,
      total: results.length
    })

  } catch (error) {
    console.error('[prompts/recent] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch prompts' }, { status: 500 })
  }
}