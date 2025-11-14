// app/api/dashboard/[id]/website/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables')
  }
  
  return createClient(supabaseUrl, supabaseKey)
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabaseClient()
    const dashboardId = params.id

    // Get most recent completed scan
    const { data: latestScan } = await supabase
      .from('scans')
      .select('id, finished_at')
      .eq('dashboard_id', dashboardId)
      .eq('status', 'done')
      .order('finished_at', { ascending: false })
      .limit(1)
      .single()

    if (!latestScan) {
      return NextResponse.json({
        hasData: false,
        message: 'No scan data available yet',
      })
    }

    // Get website results
    const { data: siteResults } = await supabase
      .from('results_site')
      .select('*')
      .eq('scan_id', latestScan.id)

    // Calculate readability score (pages with good schema / total pages)
    const totalPages = siteResults?.length || 0
    const pagesWithSchema = siteResults?.filter(r => r.schema_found).length || 0
    const readabilityScore = totalPages > 0 
      ? Math.round((pagesWithSchema / totalPages) * 100) 
      : 0

    // Schema coverage (percentage with schema)
    const schemaCoverage = totalPages > 0
      ? Math.round((pagesWithSchema / totalPages) * 100)
      : 0

    // Count issues by severity
    const issuesBySeverity = siteResults?.reduce((acc: any, item) => {
      if (!acc[item.severity]) acc[item.severity] = 0
      acc[item.severity]++
      return acc
    }, { low: 0, med: 0, high: 0 })

    const totalIssues = siteResults?.filter(r => r.issue_code).length || 0

    // Page visibility candidates (pages with schema)
    const visibilityCandidates = siteResults?.filter(r => r.schema_found) || []

    return NextResponse.json({
      hasData: true,
      readability_score: readabilityScore,
      readability_delta: '+0%', // TODO: Calculate from previous scan
      schema_coverage: schemaCoverage,
      coverage_delta: '+0%',
      page_visibility: visibilityCandidates.length,
      visibility_delta: '+0',
      technical_issues: totalIssues,
      issues_delta: '+0',
      last_scan: latestScan.finished_at,
      issues_by_severity: issuesBySeverity,
      visibility_candidates: visibilityCandidates,
      raw_results: siteResults || [],
    })

  } catch (error) {
    console.error('Error fetching website data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch website analytics data' },
      { status: 500 }
    )
  }
}
