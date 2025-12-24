// DESTINATION: ~/Claude Harbor/apps/web/app/api/agencies/audit/route.ts
// API endpoint to run agency audits - FAST version

import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'
import crypto from 'crypto'

export const maxDuration = 60

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// ============================================================================
// AI EXECUTION WITH TIMEOUT
// ============================================================================

async function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  const timeout = new Promise<T>((_, reject) => 
    setTimeout(() => reject(new Error('Timeout')), ms)
  )
  try {
    return await Promise.race([promise, timeout])
  } catch {
    return fallback
  }
}

async function executeChatGPT(prompt: string): Promise<string> {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 500,
    temperature: 0.7
  })
  
  return response.choices[0]?.message?.content || ''
}

async function executeClaude(prompt: string): Promise<string> {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  
  const response = await anthropic.messages.create({
    model: 'claude-3-5-haiku-20241022',
    max_tokens: 500,
    messages: [{ role: 'user', content: prompt }]
  })
  
  return response.content[0]?.type === 'text' ? response.content[0].text : ''
}

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
      max_tokens: 500
    })
  })
  
  if (!response.ok) return ''
  
  const data = await response.json()
  return data.choices?.[0]?.message?.content || ''
}

// ============================================================================
// MAIN HANDLER - FAST VERSION
// ============================================================================

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder()
  
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: any) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
      }
      
      try {
        const { url, domain } = await request.json()
        
        if (!domain) {
          send({ error: 'No domain provided' })
          controller.close()
          return
        }
        
        const supabase = getSupabase()
        const auditId = crypto.randomUUID()
        
        // Extract brand name from domain (simple, no API call)
        const brandName = domain
          .replace(/^www\./, '')
          .split('.')[0]
          .replace(/-/g, ' ')
          .replace(/\b\w/g, (c: string) => c.toUpperCase())
        
        send({ phase: 'scanning', brand_name: brandName })
        
        const modelStatus: Record<string, 'pending' | 'running' | 'complete'> = {
          chatgpt: 'pending',
          claude: 'pending',
          perplexity: 'pending'
        }
        
        // Single prompt - just ask about the brand
        const prompt = `Tell me about ${brandName}. What does this company do and who are their main competitors?`
        
        const results: { model: string; response: string; mentioned: boolean }[] = []
        
        // Run all models in PARALLEL with 15s timeout each
        const modelPromises = [
          {
            model: 'chatgpt',
            execute: () => withTimeout(executeChatGPT(prompt), 15000, '')
          },
          {
            model: 'claude', 
            execute: () => withTimeout(executeClaude(prompt), 15000, '')
          },
          {
            model: 'perplexity',
            execute: () => withTimeout(executePerplexity(prompt), 15000, '')
          }
        ]
        
        // Start all models
        for (const m of modelPromises) {
          modelStatus[m.model] = 'running'
        }
        send({ model_status: { ...modelStatus } })
        
        // Execute in parallel
        const responses = await Promise.all(
          modelPromises.map(async (m) => {
            try {
              const response = await m.execute()
              modelStatus[m.model] = 'complete'
              send({ model_status: { ...modelStatus } })
              
              const mentioned = response.toLowerCase().includes(brandName.toLowerCase())
              return { model: m.model, response, mentioned }
            } catch {
              modelStatus[m.model] = 'complete'
              send({ model_status: { ...modelStatus } })
              return { model: m.model, response: '', mentioned: false }
            }
          })
        )
        
        results.push(...responses)
        
        // Calculate visibility
        const modelsWithMention = results.filter(r => r.mentioned).length
        const visibilityScore = Math.round((modelsWithMention / 3) * 100)
        
        // Extract competitors from responses (simple regex, no API call)
        const allText = results.map(r => r.response).join(' ')
        const competitorMatches = allText.match(/competitors?(?:\s+(?:include|are|like))?\s*:?\s*([^.]+)/i)
        const competitors: { name: string; mentions: number; sentiment: string }[] = []
        
        if (competitorMatches) {
          const names = competitorMatches[1]
            .split(/,|and|\//i)
            .map(s => s.trim())
            .filter(s => s.length > 2 && s.length < 30)
            .slice(0, 5)
          
          for (const name of names) {
            competitors.push({ name, mentions: 1, sentiment: 'neutral' })
          }
        }
        
        // Save to database
        await supabase
          .from('agency_audits')
          .insert({
            id: auditId,
            url,
            domain,
            brand_name: brandName,
            category: 'unknown',
            description: '',
            visibility_score: visibilityScore,
            model_results: results.map(r => ({
              model: r.model,
              mentioned: r.mentioned,
              response_count: 1
            })),
            competitors,
            created_at: new Date().toISOString()
          })
        
        // Complete
        send({ phase: 'complete', audit_id: auditId })
        
      } catch (error) {
        console.error('Audit error:', error)
        send({ error: 'Failed to complete audit' })
      } finally {
        controller.close()
      }
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