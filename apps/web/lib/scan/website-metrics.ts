// lib/scan/website-metrics.ts
// Helper to calculate website metrics from scan results

export interface WebsiteMetrics {
  readability_score: number
  schema_coverage: number
  issues: Array<{
    url: string
    code: string
    severity: string
    message: string
    schema_found: boolean
  }>
}

export async function calculateWebsiteMetrics(
  supabase: any,
  scanId: string
): Promise<WebsiteMetrics> {
  // Fetch all issues for this scan
  const { data: issues, error } = await supabase
    .from('results_site')
    .select('*')
    .eq('scan_id', scanId)

  if (error) {
    console.error('[WebsiteMetrics] Error fetching issues:', error)
    return {
      readability_score: 0,
      schema_coverage: 0,
      issues: [],
    }
  }

  if (!issues || issues.length === 0) {
    return {
      readability_score: 100,
      schema_coverage: 100,
      issues: [],
    }
  }

  // Get unique URLs analyzed
  const uniqueUrls = new Set(issues.map((i: any) => i.url))
  const totalPages = uniqueUrls.size

  // Count pages with schema
  const pagesWithSchema = new Set(
    issues.filter((i: any) => i.schema_found).map((i: any) => i.url)
  ).size

  // Calculate schema coverage
  const schema_coverage = totalPages > 0 
    ? Math.round((pagesWithSchema / totalPages) * 100)
    : 0

  // Calculate readability score (inverse of readability issues)
  const readabilityIssues = issues.filter(
    (i: any) => i.issue_code === 'low_readability'
  ).length

  const readability_score = totalPages > 0
    ? Math.round(((totalPages - readabilityIssues) / totalPages) * 100)
    : 100

  // Format issues for frontend
  const formattedIssues = issues.map((issue: any) => ({
    url: issue.url,
    code: issue.issue_code,
    severity: issue.severity,
    message: issue.details?.message || 'Unknown issue',
    schema_found: issue.schema_found,
  }))

  return {
    readability_score,
    schema_coverage,
    issues: formattedIssues,
  }
}
