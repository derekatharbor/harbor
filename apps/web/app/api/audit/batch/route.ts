// app/api/audit/batch/route.ts
// Batch audit brands against AI models to find hallucinations
// Run this overnight for a vertical to generate outreach list

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'

export const dynamic = 'force-dynamic'
export const maxDuration = 300 // 5 minutes max for Vercel

interface AuditFinding {
  field: string
  type: 'missing' | 'incorrect' | 'outdated' | 'hallucination'
  ai_said: string
  harbor_says: string
  severity: 'high' | 'medium' | 'low'
  email_hook: string
}

interface AuditResult {
  findings: AuditFinding[]
  has_issues: boolean
  accuracy_score: number
  checked_at: string
  model_used: string
  raw_response?: string
}

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

async function auditBrand(
  anthropic: Anthropic,
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

  // Build context from harbor.json data
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

  const prompt = `You are auditing how AI models might describe a software company. Compare what you know about this company to the structured data provided.

Company: ${brand.brand_name}
Domain: ${brand.domain || 'unknown'}
Category: ${harborContext.category || 'unknown'}

Harbor Profile Data (source of truth):
${JSON.stringify(harborContext, null, 2)}

Your task:
1. Based on your training data, describe what you know about ${brand.brand_name}
2. Compare your knowledge to the Harbor profile data above
3. Identify specific discrepancies where your knowledge differs from or is missing compared to Harbor's data

Focus on these high-value fields:
- Company description/what they do
- Pricing (if available)
- Key features
- Target customer (ICP)
- Category classification

Respond in this exact JSON format:
{
  "ai_description": "Brief description of what you know about this company",
  "findings": [
    {
      "field": "pricing|description|category|features|icp",
      "type": "missing|incorrect|hallucination",
      "ai_said": "What you (the AI) would say",
      "harbor_says": "What Harbor's data says",
      "severity": "high|medium|low",
      "email_hook": "One sentence that could be used in outreach highlighting this issue"
    }
  ],
  "accuracy_score": 0-100
}

If you have no knowledge of this company, return findings with type "missing" for key fields.
If Harbor data is empty/null for a field, skip that field.
Only return real discrepancies, not minor wording differences.`

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }]
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    
    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return {
        findings: [],
        has_issues: false,
        accuracy_score: 0,
        checked_at: new Date().toISOString(),
        model_used: 'claude-3-5-haiku-20241022',
        raw_response: text
      }
    }

    const parsed = JSON.parse(jsonMatch[0])
    
    return {
      findings: parsed.findings || [],
      has_issues: (parsed.findings || []).length > 0,
      accuracy_score: parsed.accuracy_score || 100,
      checked_at: new Date().toISOString(),
      model_used: 'claude-3-5-haiku-20241022'
    }
  } catch (error) {
    console.error(`Audit error for ${brand.slug}:`, error)
    return {
      findings: [],
      has_issues: false,
      accuracy_score: 0,
      checked_at: new Date().toISOString(),
      model_used: 'claude-3-5-haiku-20241022',
      raw_response: `Error: ${error}`
    }
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
      category = null,        // Filter by category
      batch_size = 50,        // How many to process
      offset = 0,             // For pagination
      only_enriched = true,   // Only audit brands with feed_data
      force_reaudit = false   // Re-audit even if already done
    } = body

    const supabase = getSupabase()
    const anthropic = new Anthropic()

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
    const results: { slug: string; has_issues: boolean; finding_count: number }[] = []
    let withIssues = 0

    for (const brand of brands) {
      // Rate limiting - 500ms between calls
      await new Promise(resolve => setTimeout(resolve, 500))

      const audit = await auditBrand(anthropic, brand)
      
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
        finding_count: audit.findings.length
      })

      console.log(`Audited ${brand.brand_name}: ${audit.findings.length} findings`)
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

  // Count those with issues
  const withIssues = (data || []).filter(d => d.audit_data?.has_issues).length

  return NextResponse.json({
    total_audited: count,
    sample_with_issues: withIssues,
    sample: data?.slice(0, 10).map(d => ({
      slug: d.slug,
      brand_name: d.brand_name,
      has_issues: d.audit_data?.has_issues,
      finding_count: d.audit_data?.findings?.length || 0,
      top_finding: d.audit_data?.findings?.[0]?.email_hook
    }))
  })
}
