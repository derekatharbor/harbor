// apps/web/app/api/prompts/execute-stream/route.ts
// Stream execution results in real-time using Server-Sent Events

import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'
import { GoogleGenerativeAI } from '@google/generative-ai'

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
  citations?: { url: string; domain: string }[]
  tokens_used?: number
  error?: string
  duration_ms?: number
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

async function executeGemini(promptText: string): Promise<{ text: string; tokens: number }> {
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '')
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
  
  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: promptText }] }],
    generationConfig: { maxOutputTokens: 1000, temperature: 0.7 }
  })

  const text = result.response.text()
  return { text, tokens: Math.ceil((promptText.length + text.length) / 4) }
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

// Extract brand names from response text (simple extraction)
function extractBrands(text: string): string[] {
  // Common brand patterns - can be enhanced with the unified extraction system
  const brandPatterns = [
    /\*\*([A-Z][a-zA-Z0-9.]+(?:\s+[A-Z][a-zA-Z0-9.]+)?)\*\*/g,  // **Brand Name**
    /^(?:\d+\.\s*)?([A-Z][a-zA-Z0-9.]+(?:\s+[A-Z][a-zA-Z0-9.]+)?)\s*[-–:]/gm,  // 1. Brand Name:
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

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder()
  const { prompt_id, prompt_text, dashboard_id } = await request.json()

  if (!prompt_text) {
    return new Response(JSON.stringify({ error: 'prompt_text is required' }), {
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
      const models = ['chatgpt', 'claude', 'gemini', 'perplexity'] as const
      const results: Record<string, ModelResult> = {}
      
      // Initialize all as pending
      for (const model of models) {
        results[model] = { model, status: 'pending' }
      }
      send({ type: 'init', models: results })

      // Execute all models in parallel, streaming updates as each completes
      const executions = models.map(async (model) => {
        const startTime = Date.now()
        results[model] = { model, status: 'running' }
        send({ type: 'update', model, status: 'running' })

        try {
          let response: { text: string; tokens: number; citations?: string[] }

          switch (model) {
            case 'chatgpt':
              response = await executeChatGPT(prompt_text)
              break
            case 'claude':
              response = await executeClaude(prompt_text)
              break
            case 'gemini':
              response = await executeGemini(prompt_text)
              break
            case 'perplexity':
              response = await executePerplexity(prompt_text)
              break
          }

          const brands = extractBrands(response.text)
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
            citations,
            tokens_used: response.tokens,
            duration_ms: Date.now() - startTime
          }

          send({ type: 'update', ...results[model] })

          // Store in database
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
              // Store brand mentions
              for (let i = 0; i < brands.length; i++) {
                await supabase.from('prompt_brand_mentions').insert({
                  execution_id: execution.id,
                  brand_name: brands[i],
                  position: i + 1,
                  sentiment: 'neutral'
                })
              }

              // Store citations
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
          send({ type: 'update', ...results[model] })
        }
      })

      // Wait for all to complete
      await Promise.allSettled(executions)

      // Send final summary
      const successful = Object.values(results).filter(r => r.status === 'complete').length
      const allBrands = [...new Set(
        Object.values(results)
          .flatMap(r => r.brands_found || [])
      )]
      const totalTokens = Object.values(results)
        .reduce((sum, r) => sum + (r.tokens_used || 0), 0)

      send({
        type: 'complete',
        summary: {
          successful,
          failed: 4 - successful,
          total_tokens: totalTokens,
          estimated_cost_usd: (totalTokens / 1000000) * 10,
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
