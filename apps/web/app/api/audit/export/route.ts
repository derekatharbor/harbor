// app/api/audit/export/route.ts
// Export audited brands with issues as CSV for outreach

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  const format = searchParams.get('format') || 'json'
  const limit = parseInt(searchParams.get('limit') || '1000')
  const minConsensus = parseInt(searchParams.get('min_consensus') || '2') // Minimum models that agree on issue

  const supabase = getSupabase()

  // Query brands with audit issues
  let query = supabase
    .from('ai_profiles')
    .select('slug, brand_name, domain, category, visibility_score, audit_data')
    .not('audit_data', 'is', null)
    .order('visibility_score', { ascending: false })
    .limit(limit)

  if (category) {
    query = query.ilike('category', `%${category}%`)
  }

  const { data: brands, error } = await query

  if (error) {
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }

  // Filter to those with consensus issues and map for export
  const brandsWithIssues = (brands || [])
    .filter(b => {
      const consensusCount = b.audit_data?.consensus_issues?.length || 0
      return b.audit_data?.has_issues && consensusCount >= minConsensus
    })
    .map(b => {
      const audit = b.audit_data
      const consensusIssues = audit?.consensus_issues || []
      const worstIssues = audit?.worst_issues || []
      
      // Get model-specific accuracy
      const models = audit?.models || {}
      
      return {
        slug: b.slug,
        brand_name: b.brand_name,
        domain: b.domain,
        category: b.category,
        visibility_score: b.visibility_score,
        overall_accuracy: audit?.overall_accuracy,
        consensus_issues: consensusIssues.join(', '),
        consensus_count: consensusIssues.length,
        
        // Model-specific scores
        claude_accuracy: models.claude?.accuracy_score || null,
        chatgpt_accuracy: models.chatgpt?.accuracy_score || null,
        perplexity_accuracy: models.perplexity?.accuracy_score || null,
        
        // Top issue details
        top_issue_field: worstIssues[0]?.field || null,
        top_issue_type: worstIssues[0]?.type || null,
        top_issue_ai_said: worstIssues[0]?.ai_said || null,
        top_issue_harbor_says: typeof worstIssues[0]?.harbor_says === 'object' 
          ? JSON.stringify(worstIssues[0]?.harbor_says)
          : worstIssues[0]?.harbor_says || null,
        
        // Ready-to-use outreach
        email_hook: audit?.email_hook || null,
        
        // Links
        profile_url: `https://useharbor.io/brands/${b.slug}`,
        checked_at: audit?.checked_at
      }
    })
    .filter(b => b.email_hook) // Only include if we have an email hook

  if (format === 'csv') {
    // Generate CSV
    const headers = [
      'slug',
      'brand_name', 
      'domain',
      'category',
      'visibility_score',
      'overall_accuracy',
      'consensus_issues',
      'consensus_count',
      'claude_accuracy',
      'chatgpt_accuracy',
      'perplexity_accuracy',
      'top_issue_field',
      'top_issue_type',
      'top_issue_ai_said',
      'top_issue_harbor_says',
      'email_hook',
      'profile_url',
      'checked_at'
    ]

    const csvRows = [
      headers.join(','),
      ...brandsWithIssues.map(b => 
        headers.map(h => {
          const val = b[h as keyof typeof b]
          if (val === null || val === undefined) return ''
          // Escape quotes and wrap in quotes if contains comma or quote
          const str = String(val)
          if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`
          }
          return str
        }).join(',')
      )
    ]

    return new NextResponse(csvRows.join('\n'), {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="harbor-audit-${category || 'all'}-${new Date().toISOString().split('T')[0]}.csv"`
      }
    })
  }

  return NextResponse.json({
    total: brandsWithIssues.length,
    category: category || 'all',
    min_consensus: minConsensus,
    brands: brandsWithIssues
  })
}