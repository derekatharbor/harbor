// apps/web/app/dashboard/website/page.tsx
// Website Analytics - How AI-readable is your website

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Globe,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  FileCode,
  Search,
  ExternalLink,
  Code,
  Layers,
  AlertCircle,
  ChevronDown,
  ChevronRight
} from 'lucide-react'
import { useBrand } from '@/contexts/BrandContext'
import MobileHeader from '@/components/layout/MobileHeader'

// ============================================================================
// TYPES
// ============================================================================

interface PageData {
  url: string
  schemas: Array<{
    type: string
    complete: boolean
    missing_fields?: string[]
  }>
  issues: Array<{
    url: string
    issue_code: string
    severity: 'high' | 'med' | 'low'
    details?: any
  }>
  readability_score?: number
  status?: 'good' | 'warning' | 'error'
}

interface Recommendation {
  id: string
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  pages_affected: number
}

interface WebsiteData {
  readability_score: number
  schema_coverage: number
  pages_scanned: number
  issues_count: {
    high: number
    medium: number
    low: number
  }
  schema_types: Record<string, { found: number; complete: number }>
  pages: PageData[]
  recommendations: Recommendation[]
  has_data: boolean
  cached: boolean
  crawled_at: string
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

function ScoreRing({ score, size = 120 }: { score: number; size?: number }) {
  const strokeWidth = 8
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (score / 100) * circumference
  
  const getColor = (score: number) => {
    if (score >= 80) return '#22C55E'
    if (score >= 50) return '#F59E0B'
    return '#EF4444'
  }

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-border"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={getColor(score)}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold text-primary">{score}</span>
      </div>
    </div>
  )
}

function SeverityBadge({ severity }: { severity: 'high' | 'med' | 'low' }) {
  const styles = {
    high: 'bg-red-500/10 text-red-400',
    med: 'bg-yellow-500/10 text-yellow-400',
    low: 'bg-blue-500/10 text-blue-400'
  }
  const labels = { high: 'High', med: 'Medium', low: 'Low' }
  
  return (
    <span className={`text-xs px-2 py-0.5 rounded ${styles[severity]}`}>
      {labels[severity]}
    </span>
  )
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function WebsitePage() {
  const { currentDashboard } = useBrand()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<WebsiteData | null>(null)
  const [expandedPages, setExpandedPages] = useState<Set<string>>(new Set())
  const [activeTab, setActiveTab] = useState<'overview' | 'pages' | 'schemas'>('overview')

  const fetchData = async (forceRefresh = false) => {
    if (!currentDashboard?.id) {
      setLoading(false)
      return
    }

    try {
      if (forceRefresh) setRefreshing(true)
      else setLoading(true)

      const url = `/api/dashboard/${currentDashboard.id}/website-analytics${forceRefresh ? '?refresh=true' : ''}`
      const response = await fetch(url)
      
      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.message || 'Failed to fetch website data')
      }

      const result = await response.json()
      setData(result)
      
    } catch (err) {
      console.error('Error fetching website data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [currentDashboard?.id])

  const togglePage = (url: string) => {
    const newExpanded = new Set(expandedPages)
    if (newExpanded.has(url)) {
      newExpanded.delete(url)
    } else {
      newExpanded.add(url)
    }
    setExpandedPages(newExpanded)
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-primary" data-page="website">
        <MobileHeader />
        <div className="p-6 animate-pulse space-y-6">
          <div className="h-8 bg-card rounded w-48"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => <div key={i} className="h-32 bg-card rounded-lg"></div>)}
          </div>
          <div className="h-96 bg-card rounded-lg"></div>
        </div>
      </div>
    )
  }

  // Empty/Error state
  if (!data || !data.has_data) {
    return (
      <div className="min-h-screen bg-primary" data-page="website">
        <MobileHeader />
        <div className="p-6">
          <h1 className="text-2xl font-semibold text-primary mb-6">Website Analytics</h1>
          <div className="card p-12 text-center">
            <Globe className="w-12 h-12 text-muted mx-auto mb-4" />
            <h3 className="text-lg font-medium text-primary mb-2">
              {error ? 'Crawl Failed' : 'No Website Data Yet'}
            </h3>
            <p className="text-secondary mb-6 max-w-md mx-auto">
              {error 
                ? `We couldn't crawl your website: ${error}`
                : 'Run a crawl to analyze your website\'s AI-readability, schema coverage, and content structure.'
              }
            </p>
            <button 
              onClick={() => fetchData(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Crawling...' : 'Run Website Crawl'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  const totalIssues = data.issues_count.high + data.issues_count.medium + data.issues_count.low
  const schemaTypesList = Object.entries(data.schema_types)

  return (
    <div className="min-h-screen bg-primary" data-page="website">
      <MobileHeader />

      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-primary">Website Analytics</h1>
            <p className="text-secondary mt-1">
              {data.pages_scanned} pages analyzed
              {data.cached && data.crawled_at && (
                <span className="text-muted ml-2">
                  · Last crawled {new Date(data.crawled_at).toLocaleDateString()}
                </span>
              )}
            </p>
          </div>
          <button
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg hover:bg-hover disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Crawling...' : 'Refresh'}
          </button>
        </div>

        {/* Score Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Readability Score */}
          <div className="card p-5 flex items-center gap-4">
            <ScoreRing score={data.readability_score} size={80} />
            <div>
              <div className="text-xs text-muted uppercase tracking-wider mb-1">AI Readability</div>
              <div className="text-lg font-semibold text-primary">{data.readability_score}%</div>
              <div className="text-xs text-muted">Overall score</div>
            </div>
          </div>

          {/* Schema Coverage */}
          <div className="card p-5">
            <div className="flex items-center gap-2 text-muted mb-3">
              <Code className="w-4 h-4" />
              <span className="text-xs uppercase tracking-wider">Schema Coverage</span>
            </div>
            <div className="text-3xl font-semibold text-primary">{data.schema_coverage}%</div>
            <div className="text-xs text-muted mt-1">{schemaTypesList.length} schema types found</div>
          </div>

          {/* Pages Scanned */}
          <div className="card p-5">
            <div className="flex items-center gap-2 text-muted mb-3">
              <Layers className="w-4 h-4" />
              <span className="text-xs uppercase tracking-wider">Pages Scanned</span>
            </div>
            <div className="text-3xl font-semibold text-primary">{data.pages_scanned}</div>
            <div className="text-xs text-muted mt-1">pages analyzed</div>
          </div>

          {/* Issues */}
          <div className="card p-5">
            <div className="flex items-center gap-2 text-muted mb-3">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-xs uppercase tracking-wider">Issues Found</span>
            </div>
            <div className="text-3xl font-semibold text-primary">{totalIssues}</div>
            <div className="flex gap-3 mt-2">
              {data.issues_count.high > 0 && (
                <span className="text-xs text-red-400">{data.issues_count.high} high</span>
              )}
              {data.issues_count.medium > 0 && (
                <span className="text-xs text-yellow-400">{data.issues_count.medium} med</span>
              )}
              {data.issues_count.low > 0 && (
                <span className="text-xs text-blue-400">{data.issues_count.low} low</span>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-card rounded-lg w-fit">
          {(['overview', 'pages', 'schemas'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-colors ${
                activeTab === tab 
                  ? 'bg-accent text-white' 
                  : 'text-secondary hover:text-primary'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recommendations */}
            <div className="card p-0 overflow-hidden">
              <div className="px-4 py-3 border-b border-border">
                <h3 className="font-medium text-primary">Recommendations</h3>
              </div>
              {data.recommendations.length > 0 ? (
                <div className="divide-y divide-border">
                  {data.recommendations.map((rec, idx) => (
                    <div key={idx} className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-primary">{rec.title}</h4>
                            <span className={`text-xs px-2 py-0.5 rounded ${
                              rec.impact === 'high' ? 'bg-red-500/10 text-red-400' :
                              rec.impact === 'medium' ? 'bg-yellow-500/10 text-yellow-400' :
                              'bg-blue-500/10 text-blue-400'
                            }`}>
                              {rec.impact} impact
                            </span>
                          </div>
                          <p className="text-sm text-secondary mt-1">{rec.description}</p>
                          <p className="text-xs text-muted mt-2">{rec.pages_affected} pages affected</p>
                        </div>
                        <Link
                          href="/dashboard/improve"
                          className="shrink-0 text-accent hover:underline text-sm"
                        >
                          Fix →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <CheckCircle2 className="w-10 h-10 text-positive mx-auto mb-3" />
                  <p className="text-secondary">No major issues found!</p>
                </div>
              )}
            </div>

            {/* Schema Types */}
            <div className="card p-0 overflow-hidden">
              <div className="px-4 py-3 border-b border-border">
                <h3 className="font-medium text-primary">Schema Types Found</h3>
              </div>
              {schemaTypesList.length > 0 ? (
                <div className="divide-y divide-border">
                  {schemaTypesList.map(([type, counts]) => (
                    <div key={type} className="px-4 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileCode className="w-4 h-4 text-muted" />
                        <span className="text-primary">{type}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-secondary">{counts.found} found</span>
                        {counts.complete < counts.found && (
                          <span className="text-xs text-yellow-400">
                            {counts.found - counts.complete} incomplete
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <AlertCircle className="w-10 h-10 text-muted mx-auto mb-3" />
                  <p className="text-secondary">No schemas detected</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'pages' && (
          <div className="card p-0 overflow-hidden">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <h3 className="font-medium text-primary">Pages ({data.pages.length})</h3>
            </div>
            <div className="divide-y divide-border max-h-[600px] overflow-y-auto">
              {data.pages.map((page) => (
                <div key={page.url}>
                  <button
                    onClick={() => togglePage(page.url)}
                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-hover text-left"
                  >
                    {expandedPages.has(page.url) ? (
                      <ChevronDown className="w-4 h-4 text-muted" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-muted" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-primary truncate">{page.url}</div>
                      <div className="flex items-center gap-3 mt-1">
                        {page.schemas.length > 0 && (
                          <span className="text-xs text-muted">
                            {page.schemas.length} schema{page.schemas.length !== 1 ? 's' : ''}
                          </span>
                        )}
                        {page.issues.length > 0 && (
                          <span className="text-xs text-yellow-400">
                            {page.issues.length} issue{page.issues.length !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {page.status === 'good' && <CheckCircle2 className="w-4 h-4 text-positive" />}
                      {page.status === 'warning' && <AlertTriangle className="w-4 h-4 text-yellow-400" />}
                      {page.status === 'error' && <XCircle className="w-4 h-4 text-red-400" />}
                      {page.readability_score !== undefined && (
                        <span className="text-sm text-muted">{page.readability_score}%</span>
                      )}
                    </div>
                  </button>
                  
                  {expandedPages.has(page.url) && (
                    <div className="px-4 pb-4 pl-11 space-y-3">
                      {/* Schemas */}
                      {page.schemas.length > 0 && (
                        <div>
                          <div className="text-xs text-muted uppercase tracking-wider mb-2">Schemas</div>
                          <div className="flex flex-wrap gap-2">
                            {page.schemas.map((schema, idx) => (
                              <span 
                                key={idx}
                                className={`text-xs px-2 py-1 rounded ${
                                  schema.complete 
                                    ? 'bg-positive/10 text-positive' 
                                    : 'bg-yellow-500/10 text-yellow-400'
                                }`}
                              >
                                {schema.type}
                                {!schema.complete && ' (incomplete)'}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Issues */}
                      {page.issues.length > 0 && (
                        <div>
                          <div className="text-xs text-muted uppercase tracking-wider mb-2">Issues</div>
                          <div className="space-y-2">
                            {page.issues.map((issue, idx) => (
                              <div key={idx} className="flex items-center gap-2">
                                <SeverityBadge severity={issue.severity} />
                                <span className="text-sm text-secondary">{issue.issue_code.replace(/_/g, ' ')}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <a
                        href={`https://${currentDashboard?.domain}${page.url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-accent hover:underline"
                      >
                        View page <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'schemas' && (
          <div className="card p-6">
            <h3 className="font-medium text-primary mb-4">Schema Coverage by Type</h3>
            <div className="space-y-4">
              {schemaTypesList.map(([type, counts]) => (
                <div key={type}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-primary">{type}</span>
                    <span className="text-muted">{counts.complete}/{counts.found} complete</span>
                  </div>
                  <div className="h-2 bg-border rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-accent rounded-full transition-all"
                      style={{ width: `${(counts.complete / counts.found) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
              {schemaTypesList.length === 0 && (
                <div className="text-center py-8">
                  <Code className="w-10 h-10 text-muted mx-auto mb-3" />
                  <p className="text-secondary">No schemas detected on your website</p>
                  <Link 
                    href="/dashboard/improve" 
                    className="text-accent hover:underline text-sm mt-2 inline-block"
                  >
                    Learn how to add schemas →
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}