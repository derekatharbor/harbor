// DESTINATION: ~/Claude Harbor/apps/web/app/api/agencies/audit/route.ts
// API endpoint to run agency audits - streams progress updates

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
// AI EXECUTION
// ============================================================================

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

async function executeClaude(prompt: string): Promise<string> {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  
  const response = await anthropic.messages.create({
    model: 'claude-3-5-haiku-20241022',
    max_tokens: 1000,
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
      max_tokens: 1000
    })
  })
  
  if (!response.ok) {
    throw new Error(`Perplexity API error: ${response.status}`)
  }
  
  const data = await response.json()
  return data.choices?.[0]?.message?.content || ''
}

// ============================================================================
// BRAND EXTRACTION
// ============================================================================

async function extractBrandInfo(domain: string): Promise<{
  brand_name: string
  category: string
  description: string
}> {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  
  const response = await anthropic.messages.create({
    model: 'claude-3-5-haiku-20241022',
    max_tokens: 500,
    messages: [{
      role: 'user',
      content: `Given this domain: ${domain}

Extract the following information. If you're not sure, make a reasonable guess based on the domain name.

Return a JSON object with:
- brand_name: The company/brand name (e.g., "Notion" from notion.so)
- category: The industry/category they're in (e.g., "productivity software", "e-commerce", "SaaS")
- description: A brief 1-sentence description of what they likely do

JSON only, no explanation:`
    }]
  })
  
  const text = response.content[0]?.type === 'text' ? response.content[0].text : '{}'
  
  try {
    const cleaned = text.replace(/```json\n?|\n?```/g, '').trim()
    return JSON.parse(cleaned)
  } catch {
    // Fallback
    const namePart = domain.split('.')[0]
    return {
      brand_name: namePart.charAt(0).toUpperCase() + namePart.slice(1),
      category: 'unknown',
      description: `A company at ${domain}`
    }
  }
}

// ============================================================================
// COMPETITOR EXTRACTION
// ============================================================================

async function extractCompetitorsFromResponse(
  response: string, 
  brandName: string
): Promise<{ name: string; mentioned: boolean; sentiment: string }[]> {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  
  const extraction = await anthropic.messages.create({
    model: 'claude-3-5-haiku-20241022',
    max_tokens: 800,
    messages: [{
      role: 'user',
      content: `Extract all brand/company names mentioned in this AI response.

For each brand, provide:
- name: the brand name
- mentioned: true if "${brandName}" is mentioned (case insensitive)
- sentiment: "positive", "neutral", or "negative" based on how they're described

Response text:
${response.slice(0, 2000)}

Return JSON array only:
[{"name": "...", "mentioned": false, "sentiment": "..."}]`
    }]
  })
  
  const text = extraction.content[0]?.type === 'text' ? extraction.content[0].text : '[]'
  
  try {
    const cleaned = text.replace(/```json\n?|\n?```/g, '').trim()
    return JSON.parse(cleaned)
  } catch {
    return []
  }
}

// ============================================================================
// MAIN HANDLER
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
        
        // Phase 1: Extract brand info
        send({ phase: 'extracting' })
        
        const brandInfo = await extractBrandInfo(domain)
        send({ brand_name: brandInfo.brand_name })
        
        // Phase 2: Scan AI models
        send({ phase: 'scanning' })
        
        const modelStatus: Record<string, 'pending' | 'running' | 'complete'> = {
          chatgpt: 'pending',
          claude: 'pending',
          perplexity: 'pending'
        }
        
        // Generate prompts based on category
        const prompts = [
          `What are the best ${brandInfo.category} companies?`,
          `Tell me about ${brandInfo.brand_name}`,
          `${brandInfo.brand_name} alternatives and competitors`
        ]
        
        const results: {
          model: string
          responses: string[]
          mentioned: boolean
          competitors: { name: string; mentioned: boolean; sentiment: string }[]
        }[] = []
        
        // Execute on each model
        for (const model of ['chatgpt', 'claude', 'perplexity']) {
          modelStatus[model] = 'running'
          send({ model_status: { ...modelStatus } })
          
          const responses: string[] = []
          let mentioned = false
          const allCompetitors: { name: string; mentioned: boolean; sentiment: string }[] = []
          
          for (const prompt of prompts) {
            try {
              let response = ''
              
              switch (model) {
                case 'chatgpt':
                  response = await executeChatGPT(prompt)
                  break
                case 'claude':
                  response = await executeClaude(prompt)
                  break
                case 'perplexity':
                  response = await executePerplexity(prompt)
                  break
              }
              
              responses.push(response)
              
              // Check if brand is mentioned
              if (response.toLowerCase().includes(brandInfo.brand_name.toLowerCase())) {
                mentioned = true
              }
              
              // Extract competitors (only for first prompt to save time)
              if (prompt.includes('best') || prompt.includes('alternatives')) {
                const competitors = await extractCompetitorsFromResponse(response, brandInfo.brand_name)
                allCompetitors.push(...competitors)
              }
              
            } catch (err) {
              console.error(`Error executing ${model}:`, err)
              responses.push('')
            }
          }
          
          // Dedupe competitors
          const uniqueCompetitors = Array.from(
            new Map(allCompetitors.map(c => [c.name.toLowerCase(), c])).values()
          ).slice(0, 10)
          
          results.push({
            model,
            responses,
            mentioned,
            competitors: uniqueCompetitors
          })
          
          modelStatus[model] = 'complete'
          send({ model_status: { ...modelStatus } })
          
          // Small delay between models
          await new Promise(resolve => setTimeout(resolve, 300))
        }
        
        // Calculate scores
        const modelsWithMention = results.filter(r => r.mentioned).length
        const visibilityScore = Math.round((modelsWithMention / 3) * 100)
        
        // Aggregate competitors across all models
        const allCompetitors = results.flatMap(r => r.competitors)
        const competitorCounts = new Map<string, { count: number; sentiment: string }>()
        
        for (const comp of allCompetitors) {
          const key = comp.name.toLowerCase()
          const existing = competitorCounts.get(key) || { count: 0, sentiment: 'neutral' }
          existing.count++
          if (comp.sentiment === 'positive') existing.sentiment = 'positive'
          competitorCounts.set(key, existing)
        }
        
        const topCompetitors = Array.from(competitorCounts.entries())
          .map(([name, data]) => ({
            name: name.charAt(0).toUpperCase() + name.slice(1),
            mentions: data.count,
            sentiment: data.sentiment
          }))
          .sort((a, b) => b.mentions - a.mentions)
          .slice(0, 5)
        
        // Save to database
        const { error: saveError } = await supabase
          .from('agency_audits')
          .insert({
            id: auditId,
            url,
            domain,
            brand_name: brandInfo.brand_name,
            category: brandInfo.category,
            description: brandInfo.description,
            visibility_score: visibilityScore,
            model_results: results.map(r => ({
              model: r.model,
              mentioned: r.mentioned,
              response_count: r.responses.length
            })),
            competitors: topCompetitors,
            created_at: new Date().toISOString()
          })
        
        if (saveError) {
          console.error('Error saving audit:', saveError)
        }
        
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