// app/api/prompts/execute-single/route.ts
// Execute a single prompt on a single model and save results

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'

export const maxDuration = 30

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// ============================================================================
// MODEL EXECUTION FUNCTIONS
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

async function executeClaude(prompt: string): Promise<{ text: string; tokens: number }> {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  
  const response = await anthropic.messages.create({
    model: 'claude-3-5-haiku-20241022',
    max_tokens: 1000,
    messages: [{ role: 'user', content: prompt }]
  })
  
  const text = response.content[0]?.type === 'text' ? response.content[0].text : ''
  return {
    text,
    tokens: (response.usage?.input_tokens || 0) + (response.usage?.output_tokens || 0)
  }
}

async function executePerplexity(prompt: string): Promise<{ text: string; tokens: number; citations?: string[] }> {
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
    tokens: data.usage?.total_tokens || 0,
    citations: data.citations || []
  }
}

// ============================================================================
// BRAND MENTION DETECTION
// ============================================================================

function checkBrandMentioned(text: string, brandName: string): { mentioned: boolean; snippet: string | null } {
  if (!text || !brandName) return { mentioned: false, snippet: null }
  
  const textLower = text.toLowerCase()
  const brandLower = brandName.toLowerCase()
  
  // Check various forms of the brand name
  const variations = [
    brandLower,
    brandLower.replace(/\s+/g, ''),  // No spaces
    brandLower.replace(/\s+/g, '-'), // Hyphenated
  ]
  
  for (const variant of variations) {
    const index = textLower.indexOf(variant)
    if (index !== -1) {
      // Extract snippet around the mention
      const start = Math.max(0, index - 50)
      const end = Math.min(text.length, index + variant.length + 100)
      const snippet = text.slice(start, end)
      return { mentioned: true, snippet: (start > 0 ? '...' : '') + snippet + (end < text.length ? '...' : '') }
    }
  }
  
  return { mentioned: false, snippet: null }
}

// ============================================================================
// EXTRACT BRANDS FROM RESPONSE - Uses Claude for accuracy + sentiment
// ============================================================================

interface ExtractedBrand {
  name: string
  sentiment: 'positive' | 'neutral' | 'negative'
}

async function extractBrands(text: string, userBrand: string): Promise<ExtractedBrand[]> {
  console.log('[extractBrands] Starting extraction, text length:', text?.length || 0)
  
  if (!text || text.length < 50) {
    console.log('[extractBrands] Text too short, skipping')
    return []
  }
  
  // Use Claude to extract brand/company/website names with sentiment
  try {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    
    console.log('[extractBrands] Calling Claude...')
    
    const response = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 800,
      messages: [{
        role: 'user',
        content: `Extract all brand names, company names, product names, and website names mentioned in this text. For each, determine the sentiment based on how it's portrayed:
- "positive": recommended, praised, highlighted as good/best, featured favorably
- "neutral": just mentioned factually, listed without opinion
- "negative": criticized, mentioned as inferior, compared unfavorably

Return ONLY a JSON array of objects with "name" and "sentiment" fields. Example:
[{"name": "Notion", "sentiment": "positive"}, {"name": "Trello", "sentiment": "neutral"}]

If no brands found, return [].

Text:
${text.slice(0, 2000)}

JSON array:`
      }]
    })
    
    const content = response.content[0]?.type === 'text' ? response.content[0].text : '[]'
    console.log('[extractBrands] Claude response:', content.slice(0, 300))
    
    // Parse the JSON array
    const cleaned = content.trim().replace(/```json\n?|\n?```/g, '')
    const brands = JSON.parse(cleaned)
    
    if (Array.isArray(brands)) {
      // Remove duplicates but KEEP the user's brand (we need it for visibility tracking)
      const seen = new Set<string>()
      
      const filtered = brands
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
      
      console.log('[extractBrands] Extracted brands:', filtered)
      return filtered
    }
    
    console.log('[extractBrands] Response was not an array')
    return []
  } catch (err) {
    console.error('[extractBrands] Error:', err)
    return []
  }
}

// ============================================================================
// MAIN HANDLER
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const { prompt_id, prompt_text, model, brand, dashboard_id, skip_extraction } = await request.json()
    
    if (!prompt_id || !prompt_text || !model) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    const supabase = getSupabase()
    const startTime = Date.now()
    
    // Execute on the specified model
    let response: { text: string; tokens: number; citations?: string[] }
    
    try {
      switch (model) {
        case 'chatgpt':
          response = await executeChatGPT(prompt_text)
          break
        case 'claude':
          response = await executeClaude(prompt_text)
          break
        case 'perplexity':
          response = await executePerplexity(prompt_text)
          break
        default:
          return NextResponse.json({ error: 'Invalid model' }, { status: 400 })
      }
    } catch (execError: any) {
      console.error(`Error executing ${model}:`, execError)
      return NextResponse.json({ 
        error: execError.message,
        model,
        prompt_id 
      }, { status: 500 })
    }
    
    const duration = Date.now() - startTime
    
    // Check if brand was mentioned
    const { mentioned, snippet } = brand 
      ? checkBrandMentioned(response.text, brand)
      : { mentioned: false, snippet: null }
    
    // Extract brands from response (uses Claude) - skip in batch mode to save time
    const brandsFound = skip_extraction ? [] : await extractBrands(response.text, brand || '')
    
    // Save to prompt_executions
    const { data: execution, error: execError } = await supabase
      .from('prompt_executions')
      .insert({
        prompt_id,
        model,
        response_text: response.text,
        tokens_used: response.tokens,
        executed_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (execError) {
      console.error('Error saving execution:', execError)
      // Don't fail - still return results
    }
    
    // Save brand mentions if we found any
    if (execution && brandsFound.length > 0) {
      const mentionInserts = brandsFound.map((brand, idx) => ({
        execution_id: execution.id,
        brand_name: brand.name,
        position: idx + 1,
        sentiment: brand.sentiment
      }))
      
      console.log('[execute-single] Saving brand mentions:', mentionInserts.length)
      
      await supabase
        .from('prompt_brand_mentions')
        .insert(mentionInserts)
        .then(({ error }) => {
          if (error) console.error('Error saving brand mentions:', error)
          else console.log('[execute-single] Brand mentions saved successfully')
        })
    }
    
    // Save citations if available (Perplexity)
    if (execution && response.citations && response.citations.length > 0) {
      const citationInserts = response.citations.slice(0, 10).map((url: string) => {
        let domain = ''
        try {
          domain = new URL(url).hostname.replace('www.', '')
        } catch {
          domain = url
        }
        return {
          execution_id: execution.id,
          url,
          domain
        }
      })
      
      await supabase
        .from('prompt_citations')
        .insert(citationInserts)
        .then(({ error }) => {
          if (error) console.error('Error saving citations:', error)
        })
    }
    
    return NextResponse.json({
      success: true,
      model,
      prompt_id,
      mentioned,
      snippet,
      brands_found: brandsFound,
      tokens: response.tokens,
      duration_ms: duration
    })
    
  } catch (error: any) {
    console.error('Execute single error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}