// app/api/audit/batch/route.ts
// Batch audit brands against MULTIPLE AI models to find hallucinations
// Queries ChatGPT, Claude, and Perplexity for stronger outreach hooks

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'

export const dynamic = 'force-dynamic'
export const maxDuration = 300 // 5 minutes max for Vercel

interface ModelFinding {
  field: string
  type: 'missing' | 'incorrect' | 'outdated' | 'incomplete'
  ai_said: string | null
  harbor_says: string
  severity: 'high' | 'medium' | 'low'
}

interface ModelAudit {
  model: string
  ai_description: string | null
  findings: ModelFinding[]
  accuracy_score: number
}

interface AuditResult {
  models: Record<string, ModelAudit>
  models_responded: string[]
  consensus_issues: string[]
  worst_issues: ModelFinding[]
  has_issues: boolean
  overall_accuracy: number
  email_hook: string
  checked_at: string
}

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

function buildPrompt(brandName: string, domain: string | null, harborContext: any): string {
  return `You are auditing how AI models describe a software company. Compare what you know about this company to the structured data provided.

Company: ${brandName}
Domain: ${domain || 'unknown'}
Category: ${harborContext.category || 'unknown'}

Harbor Profile Data (source of truth):
${JSON.stringify(harborContext, null, 2)}

Your task:
1. Based on your training data, describe what you know about ${brandName}
2. Compare your knowledge to the Harbor profile data above
3. Identify specific discrepancies where your knowledge differs from or is missing

Focus on: description, pricing, features, integrations, target customer (ICP)

Respond in this exact JSON format:
{
  "ai_description": "Brief description of what you know about this company",
  "findings": [
    {
      "field": "pricing|description|category|features|icp|integrations",
      "type": "missing|incorrect|incomplete",
      "ai_said": "What you would say (or null if unknown)",
      "harbor_says": "What Harbor's data says",
      "severity": "high|medium|low"
    }
  ],
  "accuracy_score": 0-100
}

Only return real discrepancies, not minor wording differences.
If you have no knowledge of this company, return findings with type "missing".
If Harbor data is empty/null for a field, skip that field.`
}

function parseAuditResponse(text: string): { ai_description: string | null; findings: ModelFinding[]; accuracy_score: number } {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return { ai_description: null, findings: [], accuracy_score: 0 }
    }
    const parsed = JSON.parse(jsonMatch[0])
    return {
      ai_description: parsed.ai_description || null,
      findings: parsed.findings || [],
      accuracy_score: parsed.accuracy_score || 0
    }
  } catch {
    return { ai_description: null, findings: [], accuracy_score: 0 }
  }
}

async function auditWithClaude(
  anthropic: Anthropic,
  brandName: string,
  domain: string | null,
  harborContext: any
): Promise<ModelAudit> {
  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 1000,
      messages: [{ role: 'user', content: buildPrompt(brandName, domain, harborContext) }]
    })
    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const parsed = parseAuditResponse(text)
    return { model: 'claude', ...parsed }
  } catch (error) {
    console.error('Claude audit error:', error)
    return { model: 'claude', ai_description: null, findings: [], accuracy_score: 0 }
  }
}

async function auditWithGPT(
  openai: OpenAI,
  brandName: string,
  domain: string | null,
  harborContext: any
): Promise<ModelAudit> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 1000,
      messages: [{ role: 'user', content: buildPrompt(brandName, domain, harborContext) }]
    })
    const text = response.choices[0]?.message?.content || ''
    const parsed = parseAuditResponse(text)
    return { model: 'chatgpt', ...parsed }
  } catch (error) {
    console.error('GPT audit error:', error)
    return { model: 'chatgpt', ai_description: null, findings: [], accuracy_score: 0 }
  }
}

async function auditWithPerplexity(
  brandName: string,
  domain: string | null,
  harborContext: any
): Promise<ModelAudit> {
  if (!process.env.PERPLEXITY_API_KEY) {
    console.warn('PERPLEXITY_API_KEY not configured')
    return { model: 'perplexity', ai_description: null, findings: [], accuracy_score: 0 }
  }
  
  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'sonar',
        max_tokens: 1000,
        messages: [{ role: 'user', content: buildPrompt(brandName, domain, harborContext) }]
      })
    })
    
    if (!response.ok) {
      const errText = await response.text()
      console.error('Perplexity API error:', response.status, errText)
      return { model: 'perplexity', ai_description: null, findings: [], accuracy_score: 0 }
    }
    
    const data = await response.json()
    const text = data.choices?.[0]?.message?.content || ''
    
    if (!text) {
      console.error('Perplexity empty response:', JSON.stringify(data))
      return { model: 'perplexity', ai_description: null, findings: [], accuracy_score: 0 }
    }
    
    const parsed = parseAuditResponse(text)
    return { model: 'perplexity', ...parsed }
  } catch (error) {
    console.error('Perplexity audit error:', error)
    return { model: 'perplexity', ai_description: null, findings: [], accuracy_score: 0 }
  }
}

function generateEmailHook(brandName: string, consensusIssues: string[], models: Record<string, ModelAudit>): string {
  // Only count models that actually returned data
  const respondingModels = Object.entries(models).filter(([_, m]) => 
    m.accuracy_score > 0 || m.findings.length > 0
  )
  const modelNames = respondingModels.map(([name]) => {
    if (name === 'chatgpt') return 'ChatGPT'
    if (name === 'claude') return 'Claude'
    if (name === 'perplexity') return 'Perplexity'
    return name
  })
  
  const modelsWithIssues = respondingModels.filter(([_, m]) => m.findings.length > 0)
  
  if (consensusIssues.length === 0 || modelsWithIssues.length === 0) {
    if (modelNames.length === 0) {
      return `We attempted to audit how AI models describe ${brandName} — check your profile for accuracy.`
    }
    return `We checked how ${modelNames.join(' and ')} describe ${brandName} — minor gaps found.`
  }
  
  const issueList = consensusIssues.slice(0, 2).join(' and ')
  const modelCount = respondingModels.length
  const issueCount = modelsWithIssues.length
  
  // Build model string based on what actually responded
  const modelString = modelNames.length === 3 
    ? 'ChatGPT, Claude, and Perplexity'
    : modelNames.length === 2
    ? `${modelNames[0]} and ${modelNames[1]}`
    : modelNames[0] || 'AI models'
  
  if (issueCount === modelCount && modelCount >= 2) {
    return `Asked ${modelString} about ${brandName} — ${modelCount === 3 ? 'all 3' : 'both'} got your ${issueList} wrong.`
  } else if (issueCount >= 2) {
    return `${issueCount} out of ${modelCount} AI models we tested have incorrect info about ${brandName}'s ${issueList}.`
  } else {
    return `Found gaps in how ${modelString} describe${modelCount === 1 ? 's' : ''} ${brandName}'s ${issueList}.`
  }
}

async function auditBrand(
  anthropic: Anthropic,
  openai: OpenAI,
  brand: {
    slug: string
    brand_name: string
    domain: string | null
    category: string | null
    feed_data: any
  }
): Promise<AuditResult> {
  const feedData = typeof brand.feed_data === 'string' 
    ? JSON.parse(brand.feed_data) 
    : brand.feed_data || {}

  const harborContext = {
    name: brand.brand_name,
    domain: brand.domain,
    category: brand.category || feedData.category,
    description: feedData.one_line_summary || feedData.short_description,
    pricing: feedData.pricing,
    features: feedData.features?.slice(0, 10),
    integrations: feedData.integrations?.slice(0, 10),
    icp: feedData.icp,
    offerings: feedData.offerings?.map((o: any) => o.name),
  }

  // Run all 3 audits in parallel
  const [claudeAudit, gptAudit, perplexityAudit] = await Promise.all([
    auditWithClaude(anthropic, brand.brand_name, brand.domain, harborContext),
    auditWithGPT(openai, brand.brand_name, brand.domain, harborContext),
    auditWithPerplexity(brand.brand_name, brand.domain, harborContext)
  ])

  const models: Record<string, ModelAudit> = {
    claude: claudeAudit,
    chatgpt: gptAudit,
    perplexity: perplexityAudit
  }

  // Find consensus issues (fields that multiple models got wrong)
  const fieldIssueCount: Record<string, number> = {}
  const allFindings: ModelFinding[] = []
  
  for (const audit of Object.values(models)) {
    for (const finding of audit.findings) {
      fieldIssueCount[finding.field] = (fieldIssueCount[finding.field] || 0) + 1
      allFindings.push(finding)
    }
  }

  // Consensus = 2+ models got it wrong
  const consensusIssues = Object.entries(fieldIssueCount)
    .filter(([_, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .map(([field]) => field)

  // Get worst issues (high severity, consensus)
  const worstIssues = allFindings
    .filter(f => consensusIssues.includes(f.field) || f.severity === 'high')
    .slice(0, 5)

  const hasIssues = allFindings.length > 0
  const overallAccuracy = Math.round(
    Object.values(models).reduce((sum, m) => sum + m.accuracy_score, 0) / 3
  )

  // Track which models actually responded
  const modelsResponded = Object.entries(models)
    .filter(([_, m]) => m.accuracy_score > 0 || m.findings.length > 0)
    .map(([name]) => name)

  const emailHook = generateEmailHook(brand.brand_name, consensusIssues, models)

  return {
    models,
    models_responded: modelsResponded,
    consensus_issues: consensusIssues,
    worst_issues: worstIssues,
    has_issues: hasIssues,
    overall_accuracy: overallAccuracy,
    email_hook: emailHook,
    checked_at: new Date().toISOString()
  }
}

export async function POST(request: NextRequest) {
  try {
    // Auth check
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      category = null,
      batch_size = 25,        // Smaller default since we're hitting 3 APIs
      offset = 0,
      only_enriched = true,
      force_reaudit = false
    } = body

    const supabase = getSupabase()
    const anthropic = new Anthropic()
    const openai = new OpenAI()

    // Check for required API keys
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'OPENAI_API_KEY not configured' }, { status: 500 })
    }
    if (!process.env.PERPLEXITY_API_KEY) {
      console.warn('PERPLEXITY_API_KEY not configured - will skip Perplexity')
    }

    // Build query
    let query = supabase
      .from('ai_profiles')
      .select('slug, brand_name, domain, category, feed_data, audit_data')
      .order('visibility_score', { ascending: false })
      .range(offset, offset + batch_size - 1)

    if (category) {
      query = query.ilike('category', `%${category}%`)
    }

    if (only_enriched) {
      query = query.not('feed_data', 'is', null)
    }

    if (!force_reaudit) {
      query = query.is('audit_data', null)
    }

    const { data: brands, error } = await query

    if (error) {
      console.error('Query error:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    if (!brands || brands.length === 0) {
      return NextResponse.json({ 
        message: 'No brands to audit',
        processed: 0,
        with_issues: 0
      })
    }

    // Process brands
    const results: { slug: string; has_issues: boolean; consensus_count: number; email_hook: string }[] = []
    let withIssues = 0

    for (const brand of brands) {
      // Rate limiting - 1s between brands (hitting 3 APIs)
      await new Promise(resolve => setTimeout(resolve, 1000))

      const audit = await auditBrand(anthropic, openai, brand)
      
      // Store result
      const { error: updateError } = await supabase
        .from('ai_profiles')
        .update({ audit_data: audit })
        .eq('slug', brand.slug)

      if (updateError) {
        console.error(`Update error for ${brand.slug}:`, updateError)
      }

      if (audit.has_issues) {
        withIssues++
      }

      results.push({
        slug: brand.slug,
        has_issues: audit.has_issues,
        consensus_count: audit.consensus_issues.length,
        email_hook: audit.email_hook
      })

      console.log(`Audited ${brand.brand_name}: ${audit.consensus_issues.length} consensus issues`)
    }

    return NextResponse.json({
      message: 'Batch audit complete',
      processed: results.length,
      with_issues: withIssues,
      next_offset: offset + batch_size,
      results
    })

  } catch (error) {
    console.error('Batch audit error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET endpoint to check audit status
export async function GET(request: NextRequest) {
  const supabase = getSupabase()
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')

  let query = supabase
    .from('ai_profiles')
    .select('slug, brand_name, category, audit_data', { count: 'exact' })
    .not('audit_data', 'is', null)

  if (category) {
    query = query.ilike('category', `%${category}%`)
  }

  const { data, count, error } = await query.limit(100)

  if (error) {
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }

  const withIssues = (data || []).filter(d => d.audit_data?.has_issues).length
  const withConsensus = (data || []).filter(d => (d.audit_data?.consensus_issues?.length || 0) >= 2).length

  return NextResponse.json({
    total_audited: count,
    sample_with_issues: withIssues,
    sample_with_consensus: withConsensus,
    sample: data?.slice(0, 10).map(d => ({
      slug: d.slug,
      brand_name: d.brand_name,
      has_issues: d.audit_data?.has_issues,
      consensus_issues: d.audit_data?.consensus_issues,
      email_hook: d.audit_data?.email_hook
    }))
  })
}