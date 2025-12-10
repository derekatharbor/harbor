// Weekly index cron - executes prompts against ChatGPT + Perplexity for featured brands
// Updates the public Brand Index leaderboard with real visibility data
//
// Schedule: Weekly (add to vercel.json)

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'

export const runtime = 'nodejs'
export const maxDuration = 300 // 5 minutes max

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

function verifyCronSecret(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  
  const { searchParams } = new URL(request.url)
  if (searchParams.get('manual') === 'true') return true
  
  if (!cronSecret) return true
  return authHeader === `Bearer ${cronSecret}`
}

// ============================================================================
// MODEL EXECUTION
// ============================================================================

async function executeChatGPT(prompt: string): Promise<{ text: string; tokens: number }> {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 1000,
    temperature: 0.7
  })
  
  return {
    text: response.choices[0]?.message?.content || '',
    tokens: response.usage?.total_tokens || 0
  }
}

async function executePerplexity(prompt: string): Promise<{ text: string; tokens: number }> {
  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'sonar',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1000
    })
  })
  
  if (!response.ok) {
    throw new Error(`Perplexity API error: ${response.status}`)
  }
  
  const data = await response.json()
  return {
    text: data.choices?.[0]?.message?.content || '',
    tokens: data.usage?.total_tokens || 0
  }
}

// ============================================================================
// BRAND EXTRACTION (matches execute-single)
// ============================================================================

interface ExtractedBrand {
  name: string
  sentiment: 'positive' | 'neutral' | 'negative'
}

async function extractBrands(text: string): Promise<ExtractedBrand[]> {
  if (!text || text.length < 50) return []
  
  try {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    
    const response = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 800,
      messages: [{
        role: 'user',
        content: `Extract all brand names, company names, product names, and website names mentioned in this text. For each, determine the sentiment:
- "positive": recommended, praised, highlighted as good/best
- "neutral": just mentioned factually
- "negative": criticized, compared unfavorably

Return ONLY a JSON array: [{"name": "Brand", "sentiment": "positive"}]
If none found, return [].

Text:
${text.slice(0, 2000)}

JSON array:`
      }]
    })
    
    const content = response.content[0]?.type === 'text' ? response.content[0].text : '[]'
    const cleaned = content.trim().replace(/```json\n?|\n?```/g, '')
    const brands = JSON.parse(cleaned)
    
    if (Array.isArray(brands)) {
      const seen = new Set<string>()
      return brands
        .filter((b): b is { name: string; sentiment: string } => 
          typeof b === 'object' &&
          typeof b.name === 'string' && 
          b.name.length > 1 && 
          b.name.length < 50
        )
        .filter(b => {
          const lower = b.name.toLowerCase()
          if (seen.has(lower)) return false
          seen.add(lower)
          return true
        })
        .map(b => ({
          name: b.name,
          sentiment: (['positive', 'neutral', 'negative'].includes(b.sentiment) 
            ? b.sentiment 
            : 'neutral') as 'positive' | 'neutral' | 'negative'
        }))
        .slice(0, 15)
    }
    
    return []
  } catch (err) {
    console.error('[extractBrands] Error:', err)
    return []
  }
}

// ============================================================================
// MATCH BRANDS TO FEATURED
// ============================================================================

function matchToFeaturedBrands(
  extractedBrands: ExtractedBrand[],
  featuredBrands: Array<{ profile_id: string; brand_name: string; domain: string }>
): Array<{ profile_id: string; position: number; sentiment: string; brand_name: string }> {
  const matches: Array<{ profile_id: string; position: number; sentiment: string; brand_name: string }> = []
  
  for (const extracted of extractedBrands) {
    const extractedLower = extracted.name.toLowerCase()
    
    for (const featured of featuredBrands) {
      const brandLower = featured.brand_name.toLowerCase()
      const domainBase = featured.domain.replace(/\.(com|io|ai|co|org|net)$/, '').toLowerCase()
      
      // Match by name or domain
      if (extractedLower.includes(brandLower) || 
          brandLower.includes(extractedLower) ||
          extractedLower.includes(domainBase) ||
          domainBase.includes(extractedLower)) {
        
        const position = extractedBrands.findIndex(b => b.name === extracted.name) + 1
        matches.push({
          profile_id: featured.profile_id,
          position,
          sentiment: extracted.sentiment,
          brand_name: featured.brand_name
        })
        break
      }
    }
  }
  
  return matches
}

// ============================================================================
// GET HANDLER - Status check
// ============================================================================

export async function GET(request: NextRequest) {
  const supabase = getSupabase()
  
  const { data: prompts } = await supabase
    .from('index_prompts')
    .select('id, industry')
    .eq('enabled', true)
  
  const { data: featured } = await supabase
    .from('featured_brands')
    .select('id, industry')
    .eq('enabled', true)
  
  const { data: lastExec } = await supabase
    .from('prompt_executions')
    .select('executed_at')
    .order('executed_at', { ascending: false })
    .limit(1)
    .single()
  
  // Count by industry
  const industries = [...new Set([
    ...(prompts || []).map(p => p.industry),
    ...(featured || []).map(f => f.industry)
  ])]
  
  return NextResponse.json({
    status: 'ok',
    index_prompts: prompts?.length || 0,
    featured_brands: featured?.length || 0,
    industries,
    last_execution: lastExec?.executed_at || 'never',
    hint: 'POST to execute index prompts'
  })
}

// ============================================================================
// POST HANDLER - Execute prompts
// ============================================================================

export async function POST(request: NextRequest) {
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const supabase = getSupabase()
  const today = new Date().toISOString().split('T')[0]
  
  const body = await request.json().catch(() => ({}))
  const industryFilter = body.industry // Optional: run for specific industry
  const limitPrompts = body.limit || 100
  
  const results = {
    prompts_executed: 0,
    brands_matched: 0,
    chatgpt_calls: 0,
    perplexity_calls: 0,
    errors: [] as string[]
  }
  
  try {
    // 1. Get enabled prompts
    let promptsQuery = supabase
      .from('index_prompts')
      .select('*')
      .eq('enabled', true)
    
    if (industryFilter) {
      promptsQuery = promptsQuery.eq('industry', industryFilter)
    }
    
    const { data: prompts, error: promptsError } = await promptsQuery.limit(limitPrompts)
    
    if (promptsError || !prompts?.length) {
      return NextResponse.json({ 
        error: 'No prompts found', 
        details: promptsError?.message 
      }, { status: 400 })
    }
    
    // 2. Get featured brands with profile info
    const { data: featuredRaw } = await supabase
      .from('featured_brands')
      .select(`
        profile_id,
        industry,
        profile:ai_profiles(id, brand_name, domain)
      `)
      .eq('enabled', true)
    
    const featuredBrands = (featuredRaw || []).map(f => ({
      profile_id: f.profile_id,
      industry: f.industry,
      brand_name: (f.profile as any)?.brand_name || '',
      domain: (f.profile as any)?.domain || ''
    }))
    
    console.log(`[weekly-index] Running ${prompts.length} prompts against ${featuredBrands.length} featured brands`)
    
    // 3. Execute each prompt on both models
    for (const prompt of prompts) {
      console.log(`\n▶ Prompt: "${prompt.prompt_text.slice(0, 50)}..." (${prompt.industry})`)
      
      // Filter to brands in this industry
      const relevantBrands = featuredBrands.filter(b => b.industry === prompt.industry)
      
      // ChatGPT
      try {
        const response = await executeChatGPT(prompt.prompt_text)
        results.chatgpt_calls++
        
        // Extract brands
        const extracted = await extractBrands(response.text)
        
        // Match to featured brands
        const matches = matchToFeaturedBrands(extracted, relevantBrands)
        
        // Save execution
        const { data: execution } = await supabase
          .from('prompt_executions')
          .insert({
            prompt_id: prompt.id,
            model: 'chatgpt',
            response_text: response.text,
            tokens_used: response.tokens,
            executed_at: new Date().toISOString()
          })
          .select()
          .single()
        
        // Save brand mentions
        if (execution && matches.length > 0) {
          await supabase
            .from('prompt_brand_mentions')
            .insert(matches.map(m => ({
              execution_id: execution.id,
              profile_id: m.profile_id,
              brand_name: m.brand_name,
              position: m.position,
              sentiment: m.sentiment
            })))
          
          results.brands_matched += matches.length
        }
        
        console.log(`  ChatGPT: ${extracted.length} brands found, ${matches.length} featured matched`)
        
      } catch (err: any) {
        console.error(`  ChatGPT error:`, err.message)
        results.errors.push(`ChatGPT/${prompt.id}: ${err.message}`)
      }
      
      // Perplexity
      try {
        const response = await executePerplexity(prompt.prompt_text)
        results.perplexity_calls++
        
        const extracted = await extractBrands(response.text)
        const matches = matchToFeaturedBrands(extracted, relevantBrands)
        
        const { data: execution } = await supabase
          .from('prompt_executions')
          .insert({
            prompt_id: prompt.id,
            model: 'perplexity',
            response_text: response.text,
            tokens_used: response.tokens,
            executed_at: new Date().toISOString()
          })
          .select()
          .single()
        
        if (execution && matches.length > 0) {
          await supabase
            .from('prompt_brand_mentions')
            .insert(matches.map(m => ({
              execution_id: execution.id,
              profile_id: m.profile_id,
              brand_name: m.brand_name,
              position: m.position,
              sentiment: m.sentiment
            })))
          
          results.brands_matched += matches.length
        }
        
        console.log(`  Perplexity: ${extracted.length} brands found, ${matches.length} featured matched`)
        
      } catch (err: any) {
        console.error(`  Perplexity error:`, err.message)
        results.errors.push(`Perplexity/${prompt.id}: ${err.message}`)
      }
      
      results.prompts_executed++
      
      // Rate limiting
      await new Promise(r => setTimeout(r, 500))
    }
    
    // 4. Aggregate visibility scores for featured brands
    console.log('\n📊 Aggregating visibility scores...')
    
    for (const brand of featuredBrands) {
      // Get recent mentions for this brand (last 7 days)
      const { data: mentions } = await supabase
        .from('prompt_brand_mentions')
        .select(`
          position,
          sentiment,
          execution:prompt_executions(model, executed_at)
        `)
        .eq('profile_id', brand.profile_id)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      
      // Get total prompts for this industry
      const { count: totalPrompts } = await supabase
        .from('prompt_executions')
        .select('*', { count: 'exact', head: true })
        .gte('executed_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      
      const mentionCount = mentions?.length || 0
      const total = totalPrompts || 1
      
      // Calculate visibility score
      const mentionRate = (mentionCount / total) * 100
      const avgPosition = mentionCount > 0
        ? mentions!.reduce((sum, m) => sum + (m.position || 5), 0) / mentionCount
        : 0
      const positionScore = avgPosition > 0 ? Math.max(0, 100 - ((avgPosition - 1) * 20)) : 0
      const visibilityScore = Math.round((mentionRate * 0.6) + (positionScore * 0.4))
      
      // Upsert to brand_visibility_snapshots
      await supabase
        .from('brand_visibility_snapshots')
        .upsert({
          profile_id: brand.profile_id,
          snapshot_date: today,
          visibility_score: visibilityScore,
          total_mentions: mentionCount,
          avg_position: avgPosition || null
        }, {
          onConflict: 'profile_id,snapshot_date'
        })
    }
    
    return NextResponse.json({
      success: true,
      date: today,
      results
    })
    
  } catch (error: any) {
    console.error('Weekly index cron error:', error)
    return NextResponse.json(
      { error: 'Cron failed', details: error.message },
      { status: 500 }
    )
  }
}
