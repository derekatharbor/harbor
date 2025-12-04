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
  ArrowUpRight,
  ChevronDown,
  Calendar,
  FileCode,
  Search,
  ExternalLink,
  Code,
  FileText,
  Layers,
  TrendingUp,
  TrendingDown
} from 'lucide-react'
import { useBrand } from '@/contexts/BrandContext'
import MobileHeader from '@/components/layout/MobileHeader'

interface WebsiteData {
  readability_score: number
  readability_delta: number
  pages_scanned: number
  schema_coverage: number
  issues_count: {
    high: number
    medium: number
    low: number
  }
  schema_types: Array<{
    type: string
    count: number
    percentage: number
  }>
  pages: Array<{
    url: string
    title: string
    readability: number
    schema_types: string[]
    issues: Array<{
      type: string
      severity: 'high' | 'medium' | 'low'
      message: string
    }>
    last_scanned: string
  }>
  recommendations: Array<{
    title: string
    description: string
    impact: 'high' | 'medium' | 'low'
    affected_pages: number
  }>
}

// Mock data
const MOCK_DATA: WebsiteData = {
  readability_score: 76,
  readability_delta: 4.2,
  pages_scanned: 142,
  schema_coverage: 68,
  issues_count: {
    high: 3,
    medium: 12,
    low: 8
  },
  schema_types: [
    { type: 'Organization', count: 1, percentage: 100 },
    { type: 'Product', count: 24, percentage: 85 },
    { type: 'FAQPage', count: 8, percentage: 32 },
    { type: 'Article', count: 45, percentage: 78 },
    { type: 'BreadcrumbList', count: 120, percentage: 85 },
    { type: 'Review', count: 12, percentage: 42 },
  ],
  pages: [
    { 
      url: '/pricing', 
      title: 'Pricing - Plans & Features',
      readability: 92, 
      schema_types: ['Organization', 'BreadcrumbList'],
      issues: [],
      last_scanned: '2024-12-03'
    },
    { 
      url: '/products/crm', 
      title: 'CRM Software | Sales Hub',
      readability: 88, 
      schema_types: ['Product', 'BreadcrumbList', 'FAQPage'],
      issues: [
        { type: 'missing_schema', severity: 'low', message: 'Missing Review schema' }
      ],
      last_scanned: '2024-12-03'
    },
    { 
      url: '/blog/sales-tips', 
      title: '25 Sales Tips for 2024',
      readability: 74, 
      schema_types: ['Article', 'BreadcrumbList'],
      issues: [
        { type: 'thin_content', severity: 'medium', message: 'Content may be too brief for topic depth' }
      ],
      last_scanned: '2024-12-03'
    },
    { 
      url: '/about', 
      title: 'About Us | Company History',
      readability: 65, 
      schema_types: ['Organization'],
      issues: [
        { type: 'missing_schema', severity: 'high', message: 'Missing key schema types' },
        { type: 'no_faq', severity: 'medium', message: 'No FAQ section found' }
      ],
      last_scanned: '2024-12-02'
    },
    { 
      url: '/features', 
      title: 'Features Overview',
      readability: 58, 
      schema_types: ['BreadcrumbList'],
      issues: [
        { type: 'missing_schema', severity: 'high', message: 'Missing Product schema' },
        { type: 'no_meta', severity: 'high', message: 'Meta description missing' },
        { type: 'thin_content', severity: 'medium', message: 'Low content-to-code ratio' }
      ],
      last_scanned: '2024-12-02'
    },
  ],
  recommendations: [
    {
      title: 'Add Product schema to feature pages',
      description: 'Product pages are missing structured data that helps AI understand your offerings.',
      impact: 'high',
      affected_pages: 8
    },
    {
      title: 'Create FAQ sections for top landing pages',
      description: 'FAQ content with proper schema helps AI answer user questions about your product.',
      impact: 'high',
      affected_pages: 12
    },
    {
      title: 'Fix missing meta descriptions',
      description: 'Meta descriptions help AI understand page purpose and relevance.',
      impact: 'medium',
      affected_pages: 5
    }
  ]
}

const SEVERITY_STYLES = {
  high: 'bg-negative/10 text-negative',
  medium: 'bg-warning/10 text-warning',
  low: 'bg-muted/10 text-muted'
}

function ScoreRing({ score, size = 120 }: { score: number; size?: number }) {
  const strokeWidth = 8
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (score / 100) * circumference

  const getColor = (score: number) => {
    if (score >= 80) return '#22C55E'
    if (score >= 60) return '#F59E0B'
    return '#EF4444'
  }

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="var(--bg-secondary)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={getColor(score)}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-primary">{score}</span>
        <span className="text-xs text-muted">/ 100</span>
      </div>
    </div>
  )
}

function PageRow({ page }: { page: WebsiteData['pages'][0] }) {
  const [expanded, setExpanded] = useState(false)
  const hasIssues = page.issues.length > 0
  const highIssues = page.issues.filter(i => i.severity === 'high').length

  return (
    <div className="border-b border-border last:border-0">
      <div 
        className="flex items-center gap-4 px-4 py-3 hover:bg-hover cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Status indicator */}
        <div className="flex-shrink-0">
          {highIssues > 0 ? (
            <XCircle className="w-4 h-4 text-negative" />
          ) : hasIssues ? (
            <AlertTriangle className="w-4 h-4 text-warning" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-positive" />
          )}
        </div>

        {/* URL and title */}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-primary truncate">{page.title}</div>
          <div className="text-xs text-muted truncate">{page.url}</div>
        </div>

        {/* Schema badges */}
        <div className="hidden lg:flex items-center gap-1.5">
          {page.schema_types.slice(0, 3).map((type, idx) => (
            <span key={idx} className="px-2 py-0.5 bg-secondary rounded text-xs text-muted">
              {type}
            </span>
          ))}
          {page.schema_types.length > 3 && (
            <span className="text-xs text-muted">+{page.schema_types.length - 3}</span>
          )}
        </div>

        {/* Readability score */}
        <div className="w-16 text-right">
          <span className={`text-sm font-medium ${
            page.readability >= 80 ? 'text-positive' :
            page.readability >= 60 ? 'text-warning' : 'text-negative'
          }`}>
            {page.readability}%
          </span>
        </div>

        {/* Expand */}
        <ChevronDown className={`w-4 h-4 text-muted transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </div>

      {expanded && page.issues.length > 0 && (
        <div className="px-4 pb-4 pl-12 space-y-2">
          {page.issues.map((issue, idx) => (
            <div key={idx} className={`flex items-center gap-2 px-3 py-2 rounded-lg ${SEVERITY_STYLES[issue.severity]}`}>
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="text-sm">{issue.message}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function WebsiteAnalyticsPage() {
  const { currentDashboard } = useBrand()
  const [data, setData] = useState<WebsiteData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'pages' | 'schema' | 'issues'>('pages')

  useEffect(() => {
    const timer = setTimeout(() => {
      setData(MOCK_DATA)
      setLoading(false)
    }, 300)
    return () => clearTimeout(timer)
  }, [])

  const brandName = currentDashboard?.brand_name || 'Your Website'
  const domain = currentDashboard?.domain || 'example.com'

  if (loading) {
    return (
      <div className="min-h-screen bg-primary" data-page="website">
        <MobileHeader />
        <div className="p-6 animate-pulse space-y-6">
          <div className="h-8 bg-card rounded w-48"></div>
          <div className="grid grid-cols-4 gap-4">
            {[1,2,3,4].map(i => <div key={i} className="h-28 bg-card rounded-lg"></div>)}
          </div>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-primary" data-page="website">
        <MobileHeader />
        <div className="p-6">
          <div className="card p-12 text-center">
            <Globe className="w-12 h-12 text-muted mx-auto mb-4 opacity-40" />
            <h2 className="text-xl font-semibold text-primary mb-2">No Website Data Yet</h2>
            <p className="text-sm text-muted">Run a scan to analyze your website's AI readability.</p>
          </div>
        </div>
      </div>
    )
  }

  const totalIssues = data.issues_count.high + data.issues_count.medium + data.issues_count.low

  return (
    <div className="min-h-screen bg-primary" data-page="website">
      <MobileHeader />

      {/* Header Bar */}
      <div className="page-header-bar">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary rounded-lg border border-border">
            <Globe className="w-4 h-4 text-muted" />
            <span className="font-medium text-primary text-sm">{domain}</span>
          </div>

          <button className="dropdown-trigger">
            <Calendar className="w-4 h-4 text-muted" />
            <span>Last scan</span>
            <ChevronDown className="w-4 h-4 text-muted" />
          </button>
        </div>
      </div>

      {/* Status Banner */}
      <div className="status-banner">
        <div className="status-banner-text flex items-center gap-2">
          <FileCode className="w-4 h-4" />
          <span className="font-medium text-primary">Website Analytics</span>
          <span className="mx-1">•</span>
          <span>How AI-readable is your website content and structure</span>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Top Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Score Ring */}
          <div className="card p-6 flex flex-col items-center justify-center">
            <ScoreRing score={data.readability_score} />
            <div className="mt-4 text-center">
              <div className="text-sm font-medium text-primary">AI Readability Score</div>
              <div className="flex items-center justify-center gap-1 mt-1">
                {data.readability_delta > 0 ? (
                  <TrendingUp className="w-3 h-3 text-positive" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-negative" />
                )}
                <span className={`text-xs ${data.readability_delta > 0 ? 'text-positive' : 'text-negative'}`}>
                  {data.readability_delta > 0 ? '+' : ''}{data.readability_delta}% vs last scan
                </span>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-muted" />
              <span className="text-xs text-muted uppercase tracking-wide">Pages Scanned</span>
            </div>
            <div className="text-3xl font-bold text-primary">{data.pages_scanned}</div>
          </div>

          <div className="card p-5">
            <div className="flex items-center gap-2 mb-3">
              <Layers className="w-4 h-4 text-muted" />
              <span className="text-xs text-muted uppercase tracking-wide">Schema Coverage</span>
            </div>
            <div className="text-3xl font-bold text-primary">{data.schema_coverage}%</div>
          </div>

          <div className="card p-5">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-muted" />
              <span className="text-xs text-muted uppercase tracking-wide">Issues Found</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-primary">{totalIssues}</span>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-negative">{data.issues_count.high} critical</span>
                <span className="text-muted">•</span>
                <span className="text-warning">{data.issues_count.medium} warnings</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs + Content */}
        <div className="card p-0 overflow-hidden">
          {/* Tab header */}
          <div className="flex items-center gap-4 px-4 pt-4 border-b border-border">
            <button 
              onClick={() => setActiveTab('pages')}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'pages' 
                  ? 'text-primary border-primary' 
                  : 'text-muted border-transparent hover:text-secondary'
              }`}
            >
              Pages ({data.pages.length})
            </button>
            <button 
              onClick={() => setActiveTab('schema')}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'schema' 
                  ? 'text-primary border-primary' 
                  : 'text-muted border-transparent hover:text-secondary'
              }`}
            >
              Schema Types
            </button>
            <button 
              onClick={() => setActiveTab('issues')}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'issues' 
                  ? 'text-primary border-primary' 
                  : 'text-muted border-transparent hover:text-secondary'
              }`}
            >
              Issues
              {data.issues_count.high > 0 && (
                <span className="px-1.5 py-0.5 text-xs rounded-full bg-negative/10 text-negative">
                  {data.issues_count.high}
                </span>
              )}
            </button>
          </div>

          {/* Tab content */}
          {activeTab === 'pages' && (
            <div>
              {/* Table header */}
              <div className="flex items-center gap-4 px-4 py-2 text-xs text-muted border-b border-border bg-secondary/30">
                <div className="w-4"></div>
                <div className="flex-1">Page</div>
                <div className="hidden lg:block w-48">Schema</div>
                <div className="w-16 text-right">Score</div>
                <div className="w-4"></div>
              </div>
              {data.pages.map((page, idx) => (
                <PageRow key={idx} page={page} />
              ))}
            </div>
          )}

          {activeTab === 'schema' && (
            <div className="p-4 space-y-4">
              {data.schema_types.map((schema, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <div className="w-32">
                    <span className="text-sm font-medium text-primary">{schema.type}</span>
                  </div>
                  <div className="flex-1">
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-positive rounded-full transition-all"
                        style={{ width: `${schema.percentage}%` }}
                      />
                    </div>
                  </div>
                  <div className="w-24 text-right">
                    <span className="text-sm text-secondary">{schema.count} pages</span>
                    <span className="text-xs text-muted ml-2">({schema.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'issues' && (
            <div className="p-4 space-y-4">
              {data.recommendations.map((rec, idx) => (
                <div key={idx} className="p-4 rounded-lg bg-secondary/30 border border-border">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 text-xs rounded font-medium ${SEVERITY_STYLES[rec.impact]}`}>
                          {rec.impact} impact
                        </span>
                        <span className="text-xs text-muted">{rec.affected_pages} pages affected</span>
                      </div>
                      <h4 className="text-sm font-medium text-primary mb-1">{rec.title}</h4>
                      <p className="text-sm text-secondary">{rec.description}</p>
                    </div>
                    <Link href="/dashboard/improve" className="expand-btn flex-shrink-0">
                      <ArrowUpRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}