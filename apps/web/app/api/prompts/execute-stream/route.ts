// app/api/prompts/execute-stream/route.ts
// Stream execution results in real-time using Server-Sent Events
// Supports 3 models: ChatGPT, Claude, Perplexity (no Gemini)

import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

interface ModelResult {
  model: string
  status: 'pending' | 'running' | 'complete' | 'error'
  response_text?: string
  brands_found?: string[]
  mentioned?: boolean
  citations?: { url: string; domain: string }[]
  tokens_used?: number
  error?: string
  duration_ms?: number
  snippet?: string
}

// Execute against individual models
async function executeChatGPT(promptText: string): Promise<{ text: string; tokens: number }> {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'You are a helpful assistant providing recommendations. Be specific about names and include relevant details.' },
      { role: 'user', content: promptText }
    ],
    max_tokens: 1000,
    temperature: 0.7
  })

  return {
    text: response.choices[0]?.message?.content || '',
    tokens: response.usage?.total_tokens || 0
  }
}

async function executeClaude(promptText: string): Promise<{ text: string; tokens: number }> {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  
  const response = await anthropic.messages.create({
    model: 'claude-3-5-haiku-20241022',
    max_tokens: 1000,
    system: 'You are a helpful assistant providing recommendations. Be specific about names and include relevant details.',
    messages: [{ role: 'user', content: promptText }]
  })

  const text = response.content[0]?.type === 'text' ? response.content[0].text : ''
  return { text, tokens: response.usage.input_tokens + response.usage.output_tokens }
}

async function executePerplexity(promptText: string): Promise<{ text: string; tokens: number; citations: string[] }> {
  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'sonar',
      messages: [
        { role: 'system', content: 'You are a helpful assistant providing recommendations. Be specific about names and include relevant details.' },
        { role: 'user', content: promptText }
      ],
      max_tokens: 1000,
      return_citations: true
    })
  })

  const data = await response.json()
  return {
    text: data.choices?.[0]?.message?.content || '',
    tokens: data.usage?.total_tokens || 0,
    citations: data.citations || []
  }
}

// Extract brand names from response text
function extractBrands(text: string): string[] {
  const brandPatterns = [
    /\*\*([A-Z][a-zA-Z0-9.]+(?:\s+[A-Z][a-zA-Z0-9.]+)?)\*\*/g,
    /^(?:\d+\.\s*)?([A-Z][a-zA-Z0-9.]+(?:\s+[A-Z][a-zA-Z0-9.]+)?)\s*[-–:]/gm,
  ]
  
  const brands = new Set<string>()
  for (const pattern of brandPatterns) {
    let match
    while ((match = pattern.exec(text)) !== null) {
      const brand = match[1].trim()
      if (brand.length > 2 && brand.length < 30) {
        brands.add(brand)
      }
    }
  }
  
  return Array.from(brands).slice(0, 10)
}

// Check if brand is mentioned in text
function checkBrandMentioned(text: string, brandName: string): boolean {
  if (!brandName) return false
  const lowerText = text.toLowerCase()
  const lowerBrand = brandName.toLowerCase()
  
  // Check for exact match or common variations
  const variations = [
    lowerBrand,
    lowerBrand.replace(/\s+/g, ''),
    lowerBrand.replace(/\s+/g, '-'),
    lowerBrand.replace(/\s+/g, '_'),
  ]
  
  return variations.some(v => lowerText.includes(v))
}

// Get snippet around brand mention
function getSnippet(text: string, brandName: string, maxLength: number = 150): string {
  if (!brandName) return text.slice(0, maxLength)
  
  const lowerText = text.toLowerCase()
  const lowerBrand = brandName.toLowerCase()
  const index = lowerText.indexOf(lowerBrand)
  
  if (index === -1) return text.slice(0, maxLength)
  
  const start = Math.max(0, index - 50)
  const end = Math.min(text.length, index + brandName.length + 100)
  
  let snippet = text.slice(start, end)
  if (start > 0) snippet = '...' + snippet
  if (end < text.length) snippet = snippet + '...'
  
  return snippet
}

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder()
  
  let body
  try {
    body = await request.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  const { prompt, prompt_text, brand, prompt_id, dashboard_id } = body
  const actualPromptText = prompt || prompt_text

  if (!actualPromptText) {
    return new Response(JSON.stringify({ error: 'prompt or prompt_text is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
      }

      const supabase = getSupabase()
      // Only 3 models - no Gemini
      const models = ['chatgpt', 'claude', 'perplexity'] as const
      const results: Record<string, ModelResult> = {}
      
      // Initialize all as pending
      for (const model of models) {
        results[model] = { model, status: 'pending' }
        send({ model, status: 'pending' })
      }

      // Execute all models in parallel
      const executions = models.map(async (model) => {
        const startTime = Date.now()
        results[model] = { model, status: 'running' }
        send({ model, status: 'running' })

        try {
          let response: { text: string; tokens: number; citations?: string[] }

          switch (model) {
            case 'chatgpt':
              response = await executeChatGPT(actualPromptText)
              break
            case 'claude':
              response = await executeClaude(actualPromptText)
              break
            case 'perplexity':
              response = await executePerplexity(actualPromptText)
              break
          }

          const brands = extractBrands(response.text)
          const mentioned = brand ? checkBrandMentioned(response.text, brand) : false
          const snippet = getSnippet(response.text, brand || '')
          
          const citations = model === 'perplexity' && response.citations
            ? response.citations.map(url => {
                try {
                  return { url, domain: new URL(url).hostname.replace('www.', '') }
                } catch {
                  return { url, domain: url }
                }
              })
            : []

          results[model] = {
            model,
            status: 'complete',
            response_text: response.text,
            brands_found: brands,
            mentioned,
            snippet,
            citations,
            tokens_used: response.tokens,
            duration_ms: Date.now() - startTime
          }

          send({
            model,
            status: 'complete',
            mentioned,
            brands,
            snippet,
            duration_ms: results[model].duration_ms
          })

          // Store in database if prompt_id provided
          if (prompt_id) {
            const { data: execution } = await supabase
              .from('prompt_executions')
              .insert({
                prompt_id,
                model,
                response_text: response.text,
                tokens_used: response.tokens,
                executed_at: new Date().toISOString()
              })
              .select('id')
              .single()

            if (execution) {
              for (let i = 0; i < brands.length; i++) {
                await supabase.from('prompt_brand_mentions').insert({
                  execution_id: execution.id,
                  brand_name: brands[i],
                  position: i + 1,
                  sentiment: 'neutral'
                })
              }

              for (const citation of citations) {
                await supabase.from('prompt_citations').insert({
                  execution_id: execution.id,
                  url: citation.url,
                  domain: citation.domain,
                  source_type: 'unknown'
                })
              }
            }
          }

        } catch (error) {
          results[model] = {
            model,
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error',
            duration_ms: Date.now() - startTime
          }
          send({ model, status: 'error', error: results[model].error })
        }
      })

      // Wait for all to complete
      await Promise.allSettled(executions)

      // Send final completion signal
      const successful = Object.values(results).filter(r => r.status === 'complete').length
      const mentionedCount = Object.values(results).filter(r => r.mentioned).length
      const allBrands = [...new Set(
        Object.values(results).flatMap(r => r.brands_found || [])
      )]

      send({
        complete: true,
        summary: {
          successful,
          failed: models.length - successful,
          mentioned_count: mentionedCount,
          unique_brands: allBrands.length,
          brands: allBrands
        }
      })

      controller.close()
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  })
}