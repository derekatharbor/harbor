// app/api/audit/[slug]/route.ts
// Audit a single brand - useful for testing and on-demand checks

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'

export const dynamic = 'force-dynamic'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
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
    
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ 
        error: 'Failed to parse audit response',
        raw: text 
      }, { status: 500 })
    }

    const parsed = JSON.parse(jsonMatch[0])
    
    const auditData = {
      findings: parsed.findings || [],
      has_issues: (parsed.findings || []).length > 0,
      accuracy_score: parsed.accuracy_score || 100,
      ai_description: parsed.ai_description,
      checked_at: new Date().toISOString(),
      model_used: 'claude-3-5-haiku-20241022'
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
