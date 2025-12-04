// apps/web/app/dashboard/website/page.tsx
// Website Analytics - Technical analysis of your website's AI-readability

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
  ExternalLink,
  Code,
  Layers,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Eye,
  ArrowUpRight,
  Check,
  Zap,
  Search,
  Bot,
  FileText,
  Shield
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
// MAIN COMPONENT
// ============================================================================

export default function WebsitePage() {
  const { currentDashboard } = useBrand()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [data, setData] = useState<WebsiteData | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  const [activeView, setActiveView] = useState<'overview' | 'pages' | 'technical' | 'schemas'>('overview')
  const [expandedPages, setExpandedPages] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [issueFilter, setIssueFilter] = useState<'all' | 'high' | 'med' | 'low'>('all')

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
        throw new Error(err.message || 'Failed to crawl')
      }

      setData(await response.json())
      setError(null)
    } catch (err) {
      console.error('Error:', err)
      setError(err instanceof Error ? err.message : 'Failed to load')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [currentDashboard?.id])

  const togglePage = (url: string) => {
    const next = new Set(expandedPages)
    next.has(url) ? next.delete(url) : next.add(url)
    setExpandedPages(next)
  }

  // Derived data with defensive checks
  const issuesCount = data?.issues_count || { high: 0, medium: 0, low: 0 }
  const totalIssues = issuesCount.high + issuesCount.medium + issuesCount.low
  const schemaTypesList = data?.schema_types ? Object.entries(data.schema_types) : []
  const readabilityScore = data?.readability_score ?? 0
  const schemaCoverage = data?.schema_coverage ?? 0
  const pagesScanned = data?.pages_scanned ?? 0
  const recommendations = data?.recommendations || []
  const pages = data?.pages || []
  const filteredPages = pages.filter(p => {
    if (searchQuery && !p.url.toLowerCase().includes(searchQuery.toLowerCase())) return false
    if (issueFilter === 'all') return true
    return p.issues.some(i => i.severity === issueFilter)
  })

  const brandName = currentDashboard?.brand_name || 'Your Website'

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-primary" data-page="website">
        <MobileHeader />
        <div className="page-header-bar">
          <div className="animate-pulse h-5 bg-secondary rounded w-48"></div>
        </div>
        <div className="status-banner">
          <div className="animate-pulse h-4 bg-hover rounded w-64"></div>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-6 gap-4">
            {[1,2,3,4,5,6].map(i => <div key={i} className="card h-20 animate-pulse"></div>)}
          </div>
          <div className="card h-96 animate-pulse"></div>
        </div>
      </div>
    )
  }

  // Empty / Error state
  if (!data?.has_data || error) {
    return (
      <div className="min-h-screen bg-primary" data-page="website">
        <MobileHeader />
        <div className="page-header-bar">
          <div className="flex items-center gap-4">
            <span className="page-title">Website Analytics</span>
          </div>
        </div>
        <div className="p-6">
          <div className="card p-12 text-center">
            <Globe className="w-12 h-12 text-muted mx-auto mb-4 opacity-40" />
            <h2 className="text-xl font-semibold text-primary mb-2">
              {error ? 'Crawl Failed' : 'No Website Data'}
            </h2>
            <p className="text-sm text-muted mb-6 max-w-md mx-auto">
              {error || 'Run a crawl to analyze your website\'s AI-readability, schema coverage, and technical health.'}
            </p>
            <button 
              onClick={() => fetchData(true)}
              disabled={refreshing}
              className="btn-secondary inline-flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Crawling...' : 'Run Website Crawl'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-primary" data-page="website">
      <MobileHeader />

      {/* Header Bar */}
      <div className="page-header-bar">
        <div className="flex items-center gap-4">
          <span className="page-title">Website Analytics</span>
          <div className="pill-group">
            {(['overview', 'pages', 'technical', 'schemas'] as const).map(view => (
              <button
                key={view}
                onClick={() => setActiveView(view)}
                className={`pill capitalize ${activeView === view ? 'active' : ''}`}
              >
                {view}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => fetchData(true)} 
            disabled={refreshing}
            className="btn-secondary inline-flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Crawling...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Status Banner */}
      <div className="status-banner">
        <div className="status-banner-text flex items-center gap-2">
          <Globe className="w-4 h-4" />
          <span className="font-medium text-primary">Technical Analysis</span>
          <span className="mx-1">•</span>
          <span>{pagesScanned} pages analyzed</span>
          {data?.cached && data?.crawled_at && (
            <>
              <span className="mx-1">•</span>
              <span>Last crawled {new Date(data?.crawled_at || '').toLocaleDateString()}</span>
            </>
          )}
        </div>
        <div className="status-banner-metrics">
          {issuesCount.high > 0 && <span className="text-negative">{issuesCount.high} critical</span>}
          {issuesCount.medium > 0 && <span className="text-warning">{issuesCount.medium} warnings</span>}
          {totalIssues === 0 && <span className="text-positive">All clear</span>}
        </div>
      </div>

      {/* Metrics Row - Profound style */}
      <div className="p-6 pb-0">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="card p-4">
            <div className="text-xs text-muted uppercase tracking-wide mb-2">AI Readability</div>
            <div className={`metric-value ${readabilityScore >= 80 ? 'text-positive' : readabilityScore >= 50 ? 'text-warning' : 'text-negative'}`}>
              {readabilityScore}
            </div>
          </div>
          <div className="card p-4">
            <div className="text-xs text-muted uppercase tracking-wide mb-2">Schema Coverage</div>
            <div className={`metric-value ${schemaCoverage >= 70 ? 'text-positive' : schemaCoverage >= 40 ? 'text-warning' : 'text-negative'}`}>
              {schemaCoverage}%
            </div>
          </div>
          <div className="card p-4">
            <div className="text-xs text-muted uppercase tracking-wide mb-2">Pages</div>
            <div className="metric-value">{pagesScanned}</div>
          </div>
          <div className="card p-4">
            <div className="text-xs text-muted uppercase tracking-wide mb-2">Critical</div>
            <div className={`metric-value ${issuesCount.high > 0 ? 'text-negative' : 'text-positive'}`}>
              {issuesCount.high}
            </div>
          </div>
          <div className="card p-4">
            <div className="text-xs text-muted uppercase tracking-wide mb-2">Warnings</div>
            <div className={`metric-value ${issuesCount.medium > 0 ? 'text-warning' : 'text-positive'}`}>
              {issuesCount.medium}
            </div>
          </div>
          <div className="card p-4">
            <div className="text-xs text-muted uppercase tracking-wide mb-2">Schema Types</div>
            <div className="metric-value">{schemaTypesList.length}</div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        
        {/* OVERVIEW VIEW */}
        {activeView === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recommendations */}
            <div className="lg:col-span-2 card p-0 overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div>
                  <h3 className="font-semibold text-primary text-sm">Issues & Recommendations</h3>
                  <p className="text-xs text-muted mt-0.5">Prioritized fixes to improve AI visibility</p>
                </div>
                <Link href="/dashboard/improve" className="expand-btn">
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
              {recommendations.length > 0 ? (
                <div className="divide-y divide-border-light">
                  {recommendations.map((rec, idx) => (
                    <div key={idx} className="p-4 hover:bg-hover transition-colors">
                      <div className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                          rec.impact === 'high' ? 'bg-negative' : rec.impact === 'medium' ? 'bg-warning' : 'bg-muted'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-primary">{rec.title}</span>
                            <span className={`badge ${rec.impact === 'high' ? 'badge-negative' : rec.impact === 'medium' ? 'badge-warning' : 'badge-neutral'}`}>
                              {rec.impact}
                            </span>
                          </div>
                          <p className="text-xs text-muted">{rec.description}</p>
                          <p className="text-xs text-muted mt-1">{rec.pages_affected} page{rec.pages_affected !== 1 ? 's' : ''} affected</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <CheckCircle2 className="w-10 h-10 text-positive mx-auto mb-2 opacity-60" />
                  <p className="text-sm font-medium text-primary">All Clear</p>
                  <p className="text-xs text-muted mt-1">No critical issues found</p>
                </div>
              )}
            </div>

            {/* Schema Types */}
            <div className="card p-0 overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h3 className="font-semibold text-primary text-sm">Schema Types</h3>
                <button onClick={() => setActiveView('schemas')} className="expand-btn">
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
              {schemaTypesList.length > 0 ? (
                <div className="divide-y divide-border-light">
                  {schemaTypesList.map(([type, counts]) => (
                    <div key={type} className="p-3 flex items-center justify-between hover:bg-hover transition-colors">
                      <div className="flex items-center gap-2">
                        <Code className="w-4 h-4 text-muted" />
                        <span className="text-sm text-primary">{type}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted">{counts.found}</span>
                        {counts.complete === counts.found ? (
                          <CheckCircle2 className="w-4 h-4 text-positive" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-warning" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center">
                  <Code className="w-8 h-8 text-muted mx-auto mb-2 opacity-40" />
                  <p className="text-xs text-muted">No schemas detected</p>
                </div>
              )}
            </div>

            {/* AI Crawler Activity - Coming Soon */}
            <div className="lg:col-span-3 card p-0 overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-muted" />
                  <h3 className="font-semibold text-primary text-sm">AI Crawler Activity</h3>
                  <span className="badge badge-neutral">Coming Soon</span>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { name: 'OpenAI', icon: '◯' },
                    { name: 'Anthropic', icon: '◎' },
                    { name: 'Google', icon: 'G' },
                    { name: 'Perplexity', icon: '⟁' }
                  ].map(bot => (
                    <div key={bot.name} className="text-center p-4 rounded-lg bg-secondary">
                      <div className="text-2xl font-semibold text-muted mb-1">--</div>
                      <div className="text-xs text-muted">{bot.name}</div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted text-center mt-4">Track which AI crawlers are indexing your pages</p>
              </div>
            </div>
          </div>
        )}

        {/* PAGES VIEW */}
        {activeView === 'pages' && (
          <div className="card p-0 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border gap-4 flex-wrap">
              <div className="relative">
                <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text"
                  placeholder="Search pages..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="input pl-9 w-64"
                />
              </div>
              <div className="pill-group">
                {(['all', 'high', 'med', 'low'] as const).map(f => (
                  <button 
                    key={f} 
                    onClick={() => setIssueFilter(f)}
                    className={`pill ${issueFilter === f ? 'active' : ''}`}
                  >
                    {f === 'all' ? 'All' : f === 'high' ? 'Critical' : f === 'med' ? 'Warning' : 'Low'}
                  </button>
                ))}
              </div>
            </div>

            <table className="data-table">
              <thead>
                <tr>
                  <th>Page</th>
                  <th>Schemas</th>
                  <th>Issues</th>
                  <th>Score</th>
                  <th style={{ width: 50 }}></th>
                </tr>
              </thead>
              <tbody>
                {filteredPages.length > 0 ? filteredPages.map((page) => (
                  <>
                    <tr 
                      key={page.url} 
                      onClick={() => togglePage(page.url)}
                      className="cursor-pointer"
                    >
                      <td>
                        <div className="flex items-center gap-2">
                          {expandedPages.has(page.url) ? (
                            <ChevronDown className="w-4 h-4 text-muted shrink-0" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-muted shrink-0" />
                          )}
                          <span className="text-primary font-medium truncate max-w-xs">{page.url}</span>
                        </div>
                      </td>
                      <td>
                        {page.schemas.length > 0 ? (
                          <div className="flex gap-1 flex-wrap">
                            {page.schemas.slice(0, 2).map((s, i) => (
                              <span key={i} className={`badge ${s.complete ? 'badge-positive' : 'badge-warning'}`}>
                                {s.type}
                              </span>
                            ))}
                            {page.schemas.length > 2 && (
                              <span className="badge badge-neutral">+{page.schemas.length - 2}</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted text-xs">None</span>
                        )}
                      </td>
                      <td>
                        {page.issues.length > 0 ? (
                          <span className={`text-sm font-medium ${
                            page.issues.some(i => i.severity === 'high') ? 'text-negative' :
                            page.issues.some(i => i.severity === 'med') ? 'text-warning' : 'text-muted'
                          }`}>
                            {page.issues.length}
                          </span>
                        ) : (
                          <CheckCircle2 className="w-4 h-4 text-positive" />
                        )}
                      </td>
                      <td>
                        <span className={`text-sm font-medium tabular-nums ${
                          (page.readability_score || 0) >= 80 ? 'text-positive' :
                          (page.readability_score || 0) >= 50 ? 'text-warning' : 'text-negative'
                        }`}>
                          {page.readability_score ?? '--'}
                        </span>
                      </td>
                      <td>
                        <a
                          href={`https://${currentDashboard?.domain}${page.url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={e => e.stopPropagation()}
                          className="expand-btn"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </td>
                    </tr>
                    {expandedPages.has(page.url) && (
                      <tr key={`${page.url}-expanded`}>
                        <td colSpan={5} className="bg-secondary p-0">
                          <div className="p-4 grid grid-cols-2 gap-6">
                            <div>
                              <div className="text-xs text-muted uppercase tracking-wide mb-2">Detected Schemas</div>
                              {page.schemas.length > 0 ? (
                                <div className="space-y-2">
                                  {page.schemas.map((s, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                      {s.complete ? (
                                        <CheckCircle2 className="w-4 h-4 text-positive" />
                                      ) : (
                                        <AlertTriangle className="w-4 h-4 text-warning" />
                                      )}
                                      <span className="text-sm text-primary">{s.type}</span>
                                      {!s.complete && s.missing_fields && (
                                        <span className="text-xs text-muted">Missing: {s.missing_fields.join(', ')}</span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-xs text-muted">No schemas found</p>
                              )}
                            </div>
                            <div>
                              <div className="text-xs text-muted uppercase tracking-wide mb-2">Issues</div>
                              {page.issues.length > 0 ? (
                                <div className="space-y-2">
                                  {page.issues.map((issue, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                      <span className={`badge ${
                                        issue.severity === 'high' ? 'badge-negative' :
                                        issue.severity === 'med' ? 'badge-warning' : 'badge-neutral'
                                      }`}>
                                        {issue.severity === 'high' ? 'Critical' : issue.severity === 'med' ? 'Warning' : 'Low'}
                                      </span>
                                      <span className="text-sm text-secondary">{issue.issue_code.replace(/_/g, ' ')}</span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <CheckCircle2 className="w-4 h-4 text-positive" />
                                  <span className="text-sm text-positive">No issues</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                )) : (
                  <tr>
                    <td colSpan={5} className="text-center py-8">
                      <p className="text-sm text-muted">No pages match your filter</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TECHNICAL VIEW - Profound style */}
        {activeView === 'technical' && (
          <div className="space-y-6">
            {/* Score Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { label: 'Performance', value: readabilityScore, hasValue: true },
                { label: 'Best practices', value: schemaCoverage, hasValue: true },
                { label: 'SEO', value: null, hasValue: false },
                { label: 'Speed', value: null, hasValue: false },
                { label: 'Key content', value: null, hasValue: false },
                { label: 'Wording', value: null, hasValue: false }
              ].map((metric, i) => (
                <div key={i} className="card p-4">
                  <div className="text-xs text-muted mb-2">{metric.label}</div>
                  <div className={`metric-value ${
                    metric.hasValue 
                      ? ((metric.value || 0) >= 80 ? 'text-positive' : (metric.value || 0) >= 50 ? 'text-warning' : 'text-negative')
                      : 'text-muted'
                  }`}>
                    {metric.hasValue ? metric.value : '--'}
                  </div>
                </div>
              ))}
            </div>

            {/* Code Preview - Profound style */}
            <div className="card p-0 overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-muted" />
                  <h3 className="font-semibold text-primary text-sm">Preview</h3>
                </div>
                <span className="text-xs text-muted">Homepage source</span>
              </div>
              <div className="bg-secondary overflow-x-auto">
                <pre className="p-4 text-xs font-mono leading-relaxed">
                  <code>
                    <span className="text-muted select-none mr-4">1</span><span className="text-blue-400">&lt;!DOCTYPE html&gt;</span>{'\n'}
                    <span className="text-muted select-none mr-4">2</span><span className="text-blue-400">&lt;html</span> <span className="text-green-400">lang</span>=<span className="text-yellow-400">"en"</span><span className="text-blue-400">&gt;</span>{'\n'}
                    <span className="text-muted select-none mr-4">3</span><span className="text-blue-400">&lt;head&gt;</span>{'\n'}
                    <span className="text-muted select-none mr-4">4</span>    <span className="text-blue-400">&lt;meta</span> <span className="text-green-400">charset</span>=<span className="text-yellow-400">"UTF-8"</span><span className="text-blue-400">&gt;</span>{'\n'}
                    <span className="text-muted select-none mr-4">5</span>    <span className="text-blue-400">&lt;meta</span> <span className="text-green-400">name</span>=<span className="text-yellow-400">"viewport"</span> <span className="text-green-400">content</span>=<span className="text-yellow-400">"width=device-width, initial-scale=1.0"</span><span className="text-blue-400">&gt;</span>{'\n'}
                    <span className="text-muted select-none mr-4">6</span>    <span className="text-blue-400">&lt;title&gt;</span><span className="text-primary">{currentDashboard?.brand_name || 'Your Site'}</span><span className="text-blue-400">&lt;/title&gt;</span>{'\n'}
                    <span className="text-muted select-none mr-4">7</span>    <span className="text-gray-500">{'<!-- JSON-LD Schema -->'}</span>{'\n'}
                    <span className="text-muted select-none mr-4">8</span>    <span className="text-blue-400">&lt;script</span> <span className="text-green-400">type</span>=<span className="text-yellow-400">"application/ld+json"</span><span className="text-blue-400">&gt;</span>{'\n'}
                    <span className="text-muted select-none mr-4">9</span>    {'{'}{'\n'}
                    <span className="text-muted select-none mr-3">10</span>      <span className="text-green-400">"@context"</span>: <span className="text-yellow-400">"https://schema.org"</span>,{'\n'}
                    <span className="text-muted select-none mr-3">11</span>      <span className="text-green-400">"@type"</span>: <span className="text-yellow-400">"Organization"</span>,{'\n'}
                    <span className="text-muted select-none mr-3">12</span>      <span className="text-green-400">"name"</span>: <span className="text-yellow-400">"{currentDashboard?.brand_name || 'Your Brand'}"</span>{'\n'}
                    <span className="text-muted select-none mr-3">13</span>    {'}'}{'\n'}
                    <span className="text-muted select-none mr-3">14</span>    <span className="text-blue-400">&lt;/script&gt;</span>{'\n'}
                    <span className="text-muted select-none mr-3">15</span><span className="text-blue-400">&lt;/head&gt;</span>{'\n'}
                    <span className="text-muted select-none mr-3">16</span><span className="text-blue-400">&lt;body&gt;</span>{'\n'}
                    <span className="text-muted select-none mr-3">17</span>    <span className="text-gray-500">{'<!-- Page content -->'}</span>{'\n'}
                    <span className="text-muted select-none mr-3">18</span><span className="text-blue-400">&lt;/body&gt;</span>{'\n'}
                    <span className="text-muted select-none mr-3">19</span><span className="text-blue-400">&lt;/html&gt;</span>
                  </code>
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* SCHEMAS VIEW */}
        {activeView === 'schemas' && (
          <div className="card p-0 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-semibold text-primary text-sm">Schema Coverage by Type</h3>
              <span className="text-xs text-muted">{schemaTypesList.length} types detected</span>
            </div>
            {schemaTypesList.length > 0 ? (
              <div className="p-4 space-y-4">
                {schemaTypesList.map(([type, counts]) => {
                  const pct = Math.round((counts.complete / counts.found) * 100)
                  return (
                    <div key={type}>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-medium text-primary">{type}</span>
                        <span className="text-muted tabular-nums">{counts.complete}/{counts.found} complete ({pct}%)</span>
                      </div>
                      <div className="progress-bar">
                        <div 
                          className="progress-bar-fill"
                          style={{ 
                            width: `${pct}%`,
                            backgroundColor: pct === 100 ? 'var(--positive)' : pct >= 50 ? 'var(--warning)' : 'var(--negative)'
                          }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="p-12 text-center">
                <Code className="w-12 h-12 text-muted mx-auto mb-4 opacity-40" />
                <h3 className="text-lg font-semibold text-primary mb-2">No Schemas Detected</h3>
                <p className="text-sm text-muted max-w-md mx-auto mb-4">
                  Structured data (JSON-LD) helps AI models understand your content. Add Organization, Product, or FAQ schemas.
                </p>
                <Link href="/dashboard/improve" className="btn-secondary inline-flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Learn How
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}