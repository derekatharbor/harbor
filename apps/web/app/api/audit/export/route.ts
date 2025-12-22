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
  const minSeverity = searchParams.get('min_severity') || 'low' // low, medium, high

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

  // Filter to only those with issues and map severity
  const severityOrder = { low: 1, medium: 2, high: 3 }
  const minSeverityNum = severityOrder[minSeverity as keyof typeof severityOrder] || 1

  const brandsWithIssues = (brands || [])
    .filter(b => b.audit_data?.has_issues)
    .map(b => {
      const findings = b.audit_data?.findings || []
      const topFinding = findings
        .filter((f: any) => severityOrder[f.severity as keyof typeof severityOrder] >= minSeverityNum)
        .sort((a: any, b: any) => severityOrder[b.severity as keyof typeof severityOrder] - severityOrder[a.severity as keyof typeof severityOrder])[0]

      return {
        slug: b.slug,
        brand_name: b.brand_name,
        domain: b.domain,
        category: b.category,
        visibility_score: b.visibility_score,
        finding_count: findings.length,
        top_finding_field: topFinding?.field || null,
        top_finding_type: topFinding?.type || null,
        top_finding_severity: topFinding?.severity || null,
        ai_said: topFinding?.ai_said || null,
        harbor_says: topFinding?.harbor_says || null,
        email_hook: topFinding?.email_hook || null,
        profile_url: `https://useharbor.io/brands/${b.slug}`,
        accuracy_score: b.audit_data?.accuracy_score,
        checked_at: b.audit_data?.checked_at
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
      'finding_count',
      'top_finding_field',
      'top_finding_type',
      'top_finding_severity',
      'ai_said',
      'harbor_says',
      'email_hook',
      'profile_url',
      'accuracy_score',
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
    min_severity: minSeverity,
    brands: brandsWithIssues
  })
}
