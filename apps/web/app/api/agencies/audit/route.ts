// DESTINATION: ~/Claude Harbor/apps/web/app/api/agencies/audit/route.ts
// Comprehensive agency audit - the "golden ticket"

import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'
import crypto from 'crypto'

export const maxDuration = 120 // 2 minutes max

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// ============================================================================
// TYPES
// ============================================================================

interface CompetitorMention {
  name: string
  count: number
  positions: number[] // 1 = first mentioned, 2 = second, etc.
  sentiment: 'positive' | 'neutral' | 'negative'
}

interface HallucinationAlert {
  claim: string
  model: string
  severity: 'high' | 'medium' | 'low'
  category: 'pricing' | 'feature' | 'founding' | 'product' | 'other'
}

interface ModelResult {
  model: string
  shareOfVoice: number // percentage of mentions vs competitors
  position: number | null // average position when mentioned (1 = first)
  mentioned: boolean
  sentiment: 'positive' | 'neutral' | 'negative'
  rawResponses: {
    category: string
    brand: string
    comparison: string
  }
}

// ============================================================================
// HELPERS
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

async function fetchLogo(domain: string): Promise<string | null> {
  try {
    // Try Brandfetch
    const res = await fetch(`https://api.brandfetch.io/v2/brands/${domain}`, {
      headers: {
        'Authorization': `Bearer ${process.env.BRANDFETCH_API_KEY}`
      }
    })
    
    if (res.ok) {
      const data = await res.json()
      const logo = data.logos?.find((l: any) => l.type === 'icon' || l.type === 'logo')
      if (logo?.formats?.[0]?.src) {
        return logo.formats[0].src
      }
    }
  } catch (e) {
    console.error('Brandfetch error:', e)
  }
  
  // Fallback to clearbit
  return `https://logo.clearbit.com/${domain}`
}

async function checkSchemaHealth(domain: string): Promise<{
  hasSchema: boolean
  schemaTypes: string[]
  issues: string[]
}> {
  try {
    const res = await fetch(`https://${domain}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; HarborBot/1.0)' }
    })
    
    if (!res.ok) {
      return { hasSchema: false, schemaTypes: [], issues: ['Website not accessible'] }
    }
    
    const html = await res.text()
    const issues: string[] = []
    const schemaTypes: string[] = []
    
    // Check for JSON-LD
    const jsonLdMatches = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)
    
    if (!jsonLdMatches || jsonLdMatches.length === 0) {
      issues.push('No JSON-LD structured data found')
    } else {
      for (const match of jsonLdMatches) {
        try {
          const jsonContent = match.replace(/<script[^>]*>|<\/script>/gi, '')
          const parsed = JSON.parse(jsonContent)
          const type = parsed['@type'] || (Array.isArray(parsed['@graph']) ? 'Graph' : 'Unknown')
          schemaTypes.push(type)
        } catch {
          issues.push('Malformed JSON-LD detected')
        }
      }
    }
    
    // Check for Organization schema
    if (!schemaTypes.includes('Organization') && !schemaTypes.includes('LocalBusiness')) {
      issues.push('Missing Organization schema')
    }
    
    // Check for Product schema (if e-commerce)
    const hasProducts = html.toLowerCase().includes('product') || html.toLowerCase().includes('price')
    if (hasProducts && !schemaTypes.includes('Product')) {
      issues.push('Product pages may be missing Product schema')
    }
    
    return {
      hasSchema: schemaTypes.length > 0,
      schemaTypes,
      issues
    }
  } catch (e) {
    return { hasSchema: false, schemaTypes: [], issues: ['Could not analyze website'] }
  }
}

// ============================================================================
// AI EXECUTION
// ============================================================================

async function executeChatGPT(prompt: string): Promise<string> {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 800,
    temperature: 0.7
  })
  
  return response.choices[0]?.message?.content || ''
}

async function executeClaude(prompt: string): Promise<string> {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  
  const response = await anthropic.messages.create({
    model: 'claude-3-5-haiku-20241022',
    max_tokens: 800,
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
      max_tokens: 800
    })
  })
  
  if (!response.ok) return ''
  const data = await response.json()
  return data.choices?.[0]?.message?.content || ''
}

type ModelExecutor = (prompt: string) => Promise<string>

const MODEL_EXECUTORS: Record<string, ModelExecutor> = {
  chatgpt: executeChatGPT,
  claude: executeClaude,
  perplexity: executePerplexity
}

// ============================================================================
// ANALYSIS FUNCTIONS
// ============================================================================

async function analyzeResponse(
  response: string,
  brandName: string,
  promptType: 'category' | 'brand' | 'comparison'
): Promise<{
  mentioned: boolean
  position: number | null
  competitors: { name: string; position: number }[]
  sentiment: 'positive' | 'neutral' | 'negative'
  claims: string[]
}> {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  
  const analysisPrompt = promptType === 'brand' 
    ? `Analyze this AI response about "${brandName}". Extract:
1. Any specific claims about pricing, founding date, features, or products (list each claim)
2. Overall sentiment toward the brand (positive/neutral/negative)

Response to analyze:
${response.slice(0, 2000)}

Return JSON only:
{
  "claims": ["claim 1", "claim 2"],
  "sentiment": "positive|neutral|negative"
}`
    : `Analyze this AI response for brand mentions. 

Target brand: "${brandName}"

For each company/brand mentioned, note:
1. The brand name
2. Its position in the response (1 = mentioned first, 2 = second, etc.)
3. Whether "${brandName}" specifically was mentioned
4. Sentiment toward "${brandName}" if mentioned

Response to analyze:
${response.slice(0, 2000)}

Return JSON only:
{
  "target_mentioned": true/false,
  "target_position": number or null,
  "target_sentiment": "positive|neutral|negative",
  "competitors": [{"name": "...", "position": 1}, {"name": "...", "position": 2}]
}`

  try {
    const result = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 500,
      messages: [{ role: 'user', content: analysisPrompt }]
    })
    
    const text = result.content[0]?.type === 'text' ? result.content[0].text : '{}'
    const cleaned = text.replace(/```json\n?|\n?```/g, '').trim()
    const parsed = JSON.parse(cleaned)
    
    if (promptType === 'brand') {
      return {
        mentioned: true,
        position: null,
        competitors: [],
        sentiment: parsed.sentiment || 'neutral',
        claims: parsed.claims || []
      }
    }
    
    return {
      mentioned: parsed.target_mentioned || false,
      position: parsed.target_position || null,
      competitors: parsed.competitors || [],
      sentiment: parsed.target_sentiment || 'neutral',
      claims: []
    }
  } catch {
    // Fallback to simple check
    const mentioned = response.toLowerCase().includes(brandName.toLowerCase())
    return {
      mentioned,
      position: mentioned ? 1 : null,
      competitors: [],
      sentiment: 'neutral',
      claims: []
    }
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
        
        // Extract brand name from domain
        const brandName = domain
          .replace(/^www\./, '')
          .split('.')[0]
          .replace(/-/g, ' ')
          .replace(/\b\w/g, (c: string) => c.toUpperCase())
        
        send({ phase: 'init', brand_name: brandName })
        
        // ====== PARALLEL PHASE 1: Logo + Schema ======
        send({ phase: 'fetching', step: 'Fetching brand assets...' })
        
        const [logo, schemaHealth] = await Promise.all([
          withTimeout(fetchLogo(domain), 5000, null),
          withTimeout(checkSchemaHealth(domain), 8000, { hasSchema: false, schemaTypes: [], issues: ['Timeout'] })
        ])
        
        send({ logo, schema_status: schemaHealth.hasSchema ? 'found' : 'missing' })
        
        // ====== PHASE 2: Detect Category ======
        send({ phase: 'analyzing', step: 'Detecting category...' })
        
        const categoryPrompt = `What industry/category is ${brandName} (${domain}) in? Reply with just the category name, e.g., "design software", "e-commerce platform", "CRM software". One or two words only.`
        const category = await withTimeout(executeChatGPT(categoryPrompt), 8000, 'software')
        const cleanCategory = category.replace(/['"]/g, '').trim().toLowerCase()
        
        send({ category: cleanCategory })
        
        // ====== PHASE 3: Run AI Prompts ======
        const prompts = {
          category: `What are the best ${cleanCategory} tools and platforms? List the top recommendations.`,
          brand: `Tell me about ${brandName}. What do they do, when were they founded, what's their pricing, and what are their main features?`,
          comparison: `Compare ${brandName} to its competitors. What are the pros and cons of each?`
        }
        
        const modelStatus: Record<string, 'pending' | 'running' | 'complete'> = {
          chatgpt: 'pending',
          claude: 'pending',
          perplexity: 'pending'
        }
        
        send({ phase: 'scanning', model_status: modelStatus })
        
        const modelResults: ModelResult[] = []
        const allCompetitors: Map<string, CompetitorMention> = new Map()
        const allClaims: { claim: string; model: string }[] = []
        
        // Run all models in parallel
        const modelPromises = Object.entries(MODEL_EXECUTORS).map(async ([model, executor]) => {
          modelStatus[model] = 'running'
          send({ model_status: { ...modelStatus } })
          
          try {
            // Execute all 3 prompts for this model in parallel
            const [categoryRes, brandRes, comparisonRes] = await Promise.all([
              withTimeout(executor(prompts.category), 20000, ''),
              withTimeout(executor(prompts.brand), 20000, ''),
              withTimeout(executor(prompts.comparison), 20000, '')
            ])
            
            // Analyze responses
            const [categoryAnalysis, brandAnalysis, comparisonAnalysis] = await Promise.all([
              analyzeResponse(categoryRes, brandName, 'category'),
              analyzeResponse(brandRes, brandName, 'brand'),
              analyzeResponse(comparisonRes, brandName, 'comparison')
            ])
            
            // Collect competitors
            const competitors = [...categoryAnalysis.competitors, ...comparisonAnalysis.competitors]
            for (const comp of competitors) {
              if (comp.name.toLowerCase() === brandName.toLowerCase()) continue
              
              const existing = allCompetitors.get(comp.name.toLowerCase())
              if (existing) {
                existing.count++
                existing.positions.push(comp.position)
              } else {
                allCompetitors.set(comp.name.toLowerCase(), {
                  name: comp.name,
                  count: 1,
                  positions: [comp.position],
                  sentiment: 'neutral'
                })
              }
            }
            
            // Collect claims for hallucination check
            for (const claim of brandAnalysis.claims) {
              allClaims.push({ claim, model })
            }
            
            // Calculate metrics for this model
            const totalMentions = competitors.length + (categoryAnalysis.mentioned ? 1 : 0)
            const brandMentions = categoryAnalysis.mentioned || comparisonAnalysis.mentioned ? 1 : 0
            const shareOfVoice = totalMentions > 0 ? Math.round((brandMentions / Math.max(totalMentions, 1)) * 100) : 0
            
            const positions = [categoryAnalysis.position, comparisonAnalysis.position].filter(p => p !== null) as number[]
            const avgPosition = positions.length > 0 ? Math.round(positions.reduce((a, b) => a + b, 0) / positions.length) : null
            
            modelStatus[model] = 'complete'
            send({ model_status: { ...modelStatus } })
            
            return {
              model,
              shareOfVoice,
              position: avgPosition,
              mentioned: categoryAnalysis.mentioned || comparisonAnalysis.mentioned || brandAnalysis.mentioned,
              sentiment: brandAnalysis.sentiment || categoryAnalysis.sentiment || 'neutral',
              rawResponses: {
                category: categoryRes.slice(0, 500),
                brand: brandRes.slice(0, 500),
                comparison: comparisonRes.slice(0, 500)
              }
            }
          } catch (e) {
            console.error(`Error with ${model}:`, e)
            modelStatus[model] = 'complete'
            send({ model_status: { ...modelStatus } })
            
            return {
              model,
              shareOfVoice: 0,
              position: null,
              mentioned: false,
              sentiment: 'neutral' as const,
              rawResponses: { category: '', brand: '', comparison: '' }
            }
          }
        })
        
        const results = await Promise.all(modelPromises)
        modelResults.push(...results)
        
        // ====== PHASE 4: Calculate Final Metrics ======
        send({ phase: 'calculating', step: 'Calculating final metrics...' })
        
        // Overall visibility score
        const mentionedCount = modelResults.filter(r => r.mentioned).length
        const visibilityScore = Math.round((mentionedCount / 3) * 100)
        
        // Average share of voice
        const avgShareOfVoice = Math.round(
          modelResults.reduce((sum, r) => sum + r.shareOfVoice, 0) / 3
        )
        
        // Top competitors
        const topCompetitors = Array.from(allCompetitors.values())
          .sort((a, b) => b.count - a.count)
          .slice(0, 5)
          .map(c => ({
            ...c,
            avgPosition: Math.round(c.positions.reduce((a, b) => a + b, 0) / c.positions.length)
          }))
        
        // Identify potential hallucinations (claims that seem specific)
        const hallucinations: HallucinationAlert[] = []
        for (const { claim, model } of allClaims) {
          const lowerClaim = claim.toLowerCase()
          
          // Flag specific types of claims
          if (lowerClaim.includes('price') || lowerClaim.includes('$') || lowerClaim.includes('cost')) {
            hallucinations.push({ claim, model, severity: 'high', category: 'pricing' })
          } else if (lowerClaim.includes('founded') || lowerClaim.includes('started') || /\b(19|20)\d{2}\b/.test(claim)) {
            hallucinations.push({ claim, model, severity: 'medium', category: 'founding' })
          } else if (lowerClaim.includes('feature') || lowerClaim.includes('includes') || lowerClaim.includes('offers')) {
            hallucinations.push({ claim, model, severity: 'medium', category: 'feature' })
          }
        }
        
        // Limit to top 5 hallucinations
        const topHallucinations = hallucinations.slice(0, 5)
        
        // ====== SAVE TO DATABASE ======
        const auditData = {
          id: auditId,
          url,
          domain,
          brand_name: brandName,
          category: cleanCategory,
          logo_url: logo,
          visibility_score: visibilityScore,
          share_of_voice: avgShareOfVoice,
          model_results: modelResults.map(r => ({
            model: r.model,
            mentioned: r.mentioned,
            share_of_voice: r.shareOfVoice,
            position: r.position,
            sentiment: r.sentiment
          })),
          competitors: topCompetitors,
          hallucinations: topHallucinations,
          schema_health: schemaHealth,
          raw_responses: modelResults.reduce((acc, r) => {
            acc[r.model] = r.rawResponses
            return acc
          }, {} as Record<string, any>),
          created_at: new Date().toISOString()
        }
        
        await supabase.from('agency_audits').insert(auditData)
        
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