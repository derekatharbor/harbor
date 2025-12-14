// API Route: /api/producthunt/crawl
// Executes prompts against ChatGPT + Perplexity and stores results
// 
// GET - Check crawl status
// POST - Run crawl (optionally pass {"limit": 5} to limit prompts)

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'

export const runtime = 'nodejs'
export const maxDuration = 300 // 5 minutes

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// Execute ChatGPT
async function executeChatGPT(prompt: string): Promise<string> {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 1000,
    temperature: 0.7
  })
  
  return response.choices[0]?.message?.content || ''
}

// Execute Perplexity
async function executePerplexity(prompt: string): Promise<string> {
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
  return data.choices?.[0]?.message?.content || ''
}

// Extract brand mentions using Claude
async function extractBrands(text: string, products: Array<{ name: string; domain: string }>): Promise<Array<{ name: string; position: number; sentiment: string }>> {
  if (!text || text.length < 50) return []
  
  const productNames = products.map(p => p.name).join(', ')
  
  try {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    
    const response = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 800,
      messages: [{
        role: 'user',
        content: `Given this list of products: ${productNames}

Find which of these products are mentioned in the text below. For each mention, note:
- The exact product name from the list
- Position (1 = first mentioned, 2 = second, etc.)
- Sentiment: "positive" (recommended/praised), "neutral" (just mentioned), "negative" (criticized)

Return ONLY a JSON array: [{"name": "Product", "position": 1, "sentiment": "positive"}]
If none found, return [].

Text:
${text.slice(0, 2500)}

JSON array:`
      }]
    })
    
    const content = response.content[0]?.type === 'text' ? response.content[0].text : '[]'
    const cleaned = content.trim().replace(/```json\n?|\n?```/g, '')
    const brands = JSON.parse(cleaned)
    
    if (Array.isArray(brands)) {
      return brands
        .filter((b): b is { name: string; position: number; sentiment: string } => 
          typeof b === 'object' &&
          typeof b.name === 'string' &&
          typeof b.position === 'number'
        )
        .slice(0, 20)
    }
    
    return []
  } catch (err) {
    console.error('[extractBrands] Error:', err)
    return []
  }
}

// GET - Status
export async function GET() {
  const supabase = getSupabase()
  
  const { count: promptCount } = await supabase
    .from('ph_prompts')
    .select('*', { count: 'exact', head: true })
    .eq('enabled', true)
  
  const { count: resultCount } = await supabase
    .from('ph_results')
    .select('*', { count: 'exact', head: true })
  
  const { data: lastResult } = await supabase
    .from('ph_results')
    .select('executed_at, model')
    .order('executed_at', { ascending: false })
    .limit(1)
    .single()
  
  // Get results by model
  const { data: modelCounts } = await supabase
    .from('ph_results')
    .select('model')
  
  const byChatGPT = modelCounts?.filter(r => r.model === 'chatgpt').length || 0
  const byPerplexity = modelCounts?.filter(r => r.model === 'perplexity').length || 0
  
  return NextResponse.json({
    status: 'ok',
    prompts_enabled: promptCount || 0,
    total_results: resultCount || 0,
    results_chatgpt: byChatGPT,
    results_perplexity: byPerplexity,
    last_crawl: lastResult?.executed_at || 'never',
    hint: 'POST to run crawl. Use {"limit": 5} to test with fewer prompts.'
  })
}

// POST - Run crawl
export async function POST(request: NextRequest) {
  const supabase = getSupabase()
  const body = await request.json().catch(() => ({}))
  const limit = body.limit || 100
  const modelsToRun = body.models || ['chatgpt', 'perplexity']
  
  const results = {
    prompts_processed: 0,
    chatgpt_calls: 0,
    perplexity_calls: 0,
    total_mentions: 0,
    errors: [] as string[]
  }
  
  console.log(`🚀 Starting Product Hunt crawl (limit: ${limit})...`)
  
  // Get products
  const { data: products, error: productsError } = await supabase
    .from('ph_products')
    .select('name, domain')
  
  if (productsError || !products?.length) {
    return NextResponse.json({ error: 'No products found. Run setup first.' }, { status: 400 })
  }
  
  // Get prompts
  const { data: prompts, error: promptsError } = await supabase
    .from('ph_prompts')
    .select('id, prompt_text')
    .eq('enabled', true)
    .limit(limit)
  
  if (promptsError || !prompts?.length) {
    return NextResponse.json({ error: 'No prompts found. Run setup first.' }, { status: 400 })
  }
  
  console.log(`📝 Processing ${prompts.length} prompts against ${products.length} products`)
  
  // Process each prompt
  for (const prompt of prompts) {
    console.log(`\n▶ "${prompt.prompt_text.slice(0, 50)}..."`)
    
    // ChatGPT
    if (modelsToRun.includes('chatgpt')) {
      try {
        const response = await executeChatGPT(prompt.prompt_text)
        results.chatgpt_calls++
        
        const mentions = await extractBrands(response, products)
        results.total_mentions += mentions.length
        
        await supabase
          .from('ph_results')
          .insert({
            prompt_id: prompt.id,
            model: 'chatgpt',
            response_text: response,
            brands_mentioned: mentions,
            executed_at: new Date().toISOString()
          })
        
        console.log(`  ChatGPT: ${mentions.length} products mentioned`)
        
      } catch (err: any) {
        console.error(`  ChatGPT error:`, err.message)
        results.errors.push(`chatgpt/${prompt.id}: ${err.message}`)
      }
    }
    
    // Perplexity
    if (modelsToRun.includes('perplexity')) {
      try {
        const response = await executePerplexity(prompt.prompt_text)
        results.perplexity_calls++
        
        const mentions = await extractBrands(response, products)
        results.total_mentions += mentions.length
        
        await supabase
          .from('ph_results')
          .insert({
            prompt_id: prompt.id,
            model: 'perplexity',
            response_text: response,
            brands_mentioned: mentions,
            executed_at: new Date().toISOString()
          })
        
        console.log(`  Perplexity: ${mentions.length} products mentioned`)
        
      } catch (err: any) {
        console.error(`  Perplexity error:`, err.message)
        results.errors.push(`perplexity/${prompt.id}: ${err.message}`)
      }
    }
    
    results.prompts_processed++
    
    // Rate limiting
    await new Promise(r => setTimeout(r, 500))
  }
  
  console.log('\n✅ Crawl complete:', results)
  
  return NextResponse.json({
    success: true,
    results
  })
}
