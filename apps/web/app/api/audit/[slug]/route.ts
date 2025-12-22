// app/api/audit/[slug]/route.ts
// Audit a single brand against multiple AI models

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'

export const dynamic = 'force-dynamic'

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

function generateEmailHook(brandName: string, consensusIssues: string[], models: Record<string, ModelAudit>): string {
  const modelCount = Object.keys(models).length
  const modelsWithIssues = Object.values(models).filter(m => m.findings.length > 0).length
  
  if (consensusIssues.length === 0) {
    return `We checked how ChatGPT, Claude, and Perplexity describe ${brandName} — minor gaps found.`
  }
  
  const issueList = consensusIssues.slice(0, 2).join(' and ')
  
  if (modelsWithIssues === modelCount) {
    return `Asked ChatGPT, Claude, and Perplexity about ${brandName} — all 3 models got your ${issueList} wrong.`
  } else if (modelsWithIssues >= 2) {
    return `${modelsWithIssues} out of 3 AI models we tested have incorrect info about ${brandName}'s ${issueList}.`
  } else {
    return `Found gaps in how AI models describe ${brandName}'s ${issueList}. This affects how prospects research you.`
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const supabase = getSupabase()

  // Check if we have cached audit data
  const { data: brand, error } = await supabase
    .from('ai_profiles')
    .select('slug, brand_name, domain, category, feed_data, audit_data')
    .eq('slug', slug)
    .single()

  if (error || !brand) {
    return NextResponse.json({ error: 'Brand not found' }, { status: 404 })
  }

  // Return cached if exists and recent (within 7 days)
  if (brand.audit_data?.checked_at) {
    const checkedAt = new Date(brand.audit_data.checked_at)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    
    if (checkedAt > sevenDaysAgo) {
      return NextResponse.json({
        slug: brand.slug,
        brand_name: brand.brand_name,
        cached: true,
        ...brand.audit_data
      })
    }
  }

  // Run fresh audit
  const anthropic = new Anthropic()
  const openai = new OpenAI()
  
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
  }

  const prompt = buildPrompt(brand.brand_name, brand.domain, harborContext)

  try {
    // Run all 3 audits in parallel
    const [claudeRes, gptRes, perplexityRes] = await Promise.all([
      // Claude
      anthropic.messages.create({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }]
      }).then(r => parseAuditResponse(r.content[0].type === 'text' ? r.content[0].text : ''))
        .catch(() => ({ ai_description: null, findings: [], accuracy_score: 0 })),
      
      // GPT
      openai.chat.completions.create({
        model: 'gpt-4o-mini',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }]
      }).then(r => parseAuditResponse(r.choices[0]?.message?.content || ''))
        .catch(() => ({ ai_description: null, findings: [], accuracy_score: 0 })),
      
      // Perplexity
      process.env.PERPLEXITY_API_KEY 
        ? fetch('https://api.perplexity.ai/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              model: 'sonar',
              max_tokens: 1000,
              messages: [{ role: 'user', content: prompt }]
            })
          }).then(async r => {
            if (!r.ok) {
              const errText = await r.text()
              console.error('Perplexity API error:', r.status, errText)
              return { ai_description: null, findings: [], accuracy_score: 0 }
            }
            return r.json()
          })
            .then(d => {
              if (d.choices?.[0]?.message?.content) {
                return parseAuditResponse(d.choices[0].message.content)
              }
              console.error('Perplexity empty response:', JSON.stringify(d))
              return { ai_description: null, findings: [], accuracy_score: 0 }
            })
            .catch(err => {
              console.error('Perplexity fetch error:', err)
              return { ai_description: null, findings: [], accuracy_score: 0 }
            })
        : Promise.resolve({ ai_description: null, findings: [], accuracy_score: 0 })
    ])

    const models: Record<string, ModelAudit> = {
      claude: { model: 'claude', ...claudeRes },
      chatgpt: { model: 'chatgpt', ...gptRes },
      perplexity: { model: 'perplexity', ...perplexityRes }
    }

    // Find consensus issues
    const fieldIssueCount: Record<string, number> = {}
    const allFindings: ModelFinding[] = []
    
    for (const audit of Object.values(models)) {
      for (const finding of audit.findings) {
        fieldIssueCount[finding.field] = (fieldIssueCount[finding.field] || 0) + 1
        allFindings.push(finding)
      }
    }

    const consensusIssues = Object.entries(fieldIssueCount)
      .filter(([_, count]) => count >= 2)
      .sort((a, b) => b[1] - a[1])
      .map(([field]) => field)

    const worstIssues = allFindings
      .filter(f => consensusIssues.includes(f.field) || f.severity === 'high')
      .slice(0, 5)

    const hasIssues = allFindings.length > 0
    const overallAccuracy = Math.round(
      Object.values(models).reduce((sum, m) => sum + m.accuracy_score, 0) / 3
    )

    const emailHook = generateEmailHook(brand.brand_name, consensusIssues, models)

    const auditData = {
      models,
      consensus_issues: consensusIssues,
      worst_issues: worstIssues,
      has_issues: hasIssues,
      overall_accuracy: overallAccuracy,
      email_hook: emailHook,
      checked_at: new Date().toISOString()
    }

    // Cache the result
    await supabase
      .from('ai_profiles')
      .update({ audit_data: auditData })
      .eq('slug', slug)

    return NextResponse.json({
      slug: brand.slug,
      brand_name: brand.brand_name,
      cached: false,
      ...auditData
    })

  } catch (error) {
    console.error('Audit error:', error)
    return NextResponse.json({ error: 'Audit failed' }, { status: 500 })
  }
}