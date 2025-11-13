// apps/web/app/dashboard/website/page.tsx

'use client'

import { useEffect, useState } from 'react'
import { Globe, TrendingUp, CheckCircle, AlertTriangle, XCircle, Target, ArrowRight, FileCode } from 'lucide-react'

interface WebsiteData {
  readability_score: number
  readability_delta: string
  schema_coverage: number
  coverage_delta: string
  page_visibility: number
  visibility_delta: string
  technical_issues: number
  issues_delta: string
  last_scan: string | null
  pages: Array<{
    url: string
    schema_types: string[]
    status: 'pass' | 'warning' | 'fail'
    issues: number
  }>
  issues_by_severity: {
    high: number
    medium: number
    low: number
  }
  issue_categories: Array<{
    category: string
    count: number
    severity: 'high' | 'medium' | 'low'
    description: string
  }>
}

export default function WebsiteAnalyticsPage() {
  const [data, setData] = useState<WebsiteData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/scan/latest')
        if (!response.ok) throw new Error('Failed to fetch')
        
        const scanData = await response.json()
        
        const websiteData: WebsiteData = {
          readability_score: scanData.ai_readability || 82.4,
          readability_delta: '+3.2%',
          schema_coverage: 68,
          coverage_delta: '+12%',
          page_visibility: 47,
          visibility_delta: '+8',
          technical_issues: 23,
          issues_delta: '-5',
          last_scan: scanData.last_scan,
          pages: [
            { url: '/products/business-cards', schema_types: ['Product', 'Offers'], status: 'pass', issues: 0 },
            { url: '/about', schema_types: ['Organization'], status: 'pass', issues: 0 },
            { url: '/products/corporate-banking', schema_types: ['Product'], status: 'warning', issues: 2 },
            { url: '/faq', schema_types: [], status: 'fail', issues: 3 },
            { url: '/pricing', schema_types: ['Product', 'Offers'], status: 'warning', issues: 1 },
            { url: '/contact', schema_types: ['Organization'], status: 'pass', issues: 0 },
            { url: '/blog/financial-tips', schema_types: ['Article'], status: 'pass', issues: 0 },
            { url: '/products/merchant-services', schema_types: ['Product'], status: 'warning', issues: 2 },
          ],
          issues_by_severity: {
            high: 5,
            medium: 9,
            low: 9
          },
          issue_categories: [
            { category: 'Missing Schema', count: 8, severity: 'high', description: 'Pages lack structured data' },
            { category: 'Duplicate Content', count: 6, severity: 'medium', description: 'Multiple pages with similar content' },
            { category: 'Missing Meta Descriptions', count: 5, severity: 'medium', description: 'Pages without meta descriptions' },
            { category: 'Broken Canonical Tags', count: 3, severity: 'medium', description: 'Incorrect or missing canonical URLs' },
            { category: 'Missing Alt Text', count: 4, severity: 'low', description: 'Images without alt attributes' },
          ]
        }
        
        setData(websiteData)
      } catch (error) {
        console.error('Error fetching website data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // CURSOR FIX
  useEffect(() => {
    const style = document.createElement('style')
    style.innerHTML = `
      .website-clickable { cursor: pointer !important; }
      .website-clickable:hover { cursor: pointer !important; }
    `
    document.head.appendChild(style)
    return () => {
      document.head.removeChild(style)
    }
  }, [])

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No recent scan'
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      })
    } catch {
      return 'No recent scan'
    }
  }

  const getStatusIcon = (status: 'pass' | 'warning' | 'fail') => {
    if (status === 'pass') return <CheckCircle className="w-4 h-4 text-[#2EE6D6]" strokeWidth={2} />
    if (status === 'warning') return <AlertTriangle className="w-4 h-4 text-[#FFB84D]" strokeWidth={2} />
    return <XCircle className="w-4 h-4 text-[#FF6B6B]" strokeWidth={2} />
  }

  const getSeverityColor = (severity: 'high' | 'medium' | 'low') => {
    if (severity === 'high') return 'bg-[#FF6B6B]/10 text-[#FF6B6B] border-[#FF6B6B]/30'
    if (severity === 'medium') return 'bg-[#FFB84D]/10 text-[#FFB84D] border-[#FFB84D]/30'
    return 'bg-softgray/10 text-softgray border-softgray/30'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-softgray/60 font-body text-sm">Loading website data...</div>
      </div>
    )
  }

  if (!data) return null

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Globe className="w-8 h-8 text-[#2EE6D6]" strokeWidth={1.5} />
          <h1 className="text-4xl font-heading font-bold text-white">
            Website Analytics
          </h1>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-softgray/60 mb-2">
              How AI crawlers read and understand your website structure
            </p>
            <p className="text-sm text-softgray/70 italic">
              {data.schema_coverage}% of your pages have structured data
            </p>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-softgray/60">
            <span>Last scan:</span>
            <span className="text-white">{formatDate(data.last_scan)}</span>
            <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></span>
              Live
            </span>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        {/* AI Readability Score */}
        <div 
          className="bg-[#101C2C] rounded-lg p-6 border border-white/5"
          style={{ boxShadow: '0 0 4px rgba(0, 0, 0, 0.06)' }}
        >
          <div className="flex items-start gap-3 mb-4">
            <div className="p-2 bg-white/5 rounded-lg">
              <TrendingUp className="w-5 h-5 text-white/60" strokeWidth={1.5} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-softgray/60 uppercase tracking-wider mb-1">
                AI Readability
              </div>
              <div className="text-xs text-softgray/50">
                Content clarity score
              </div>
            </div>
          </div>
          <div className="text-4xl font-heading font-bold text-white tabular-nums mb-2">
            {data.readability_score}<span className="text-2xl text-softgray/40">%</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-[#2EE6D6]">{data.readability_delta}</span>
            <span className="text-softgray/50">improved</span>
          </div>
        </div>

        {/* Schema Coverage */}
        <div 
          className="bg-[#101C2C] rounded-lg p-6 border border-white/5"
          style={{ boxShadow: '0 0 4px rgba(0, 0, 0, 0.06)' }}
        >
          <div className="flex items-start gap-3 mb-4">
            <div className="p-2 bg-white/5 rounded-lg">
              <FileCode className="w-5 h-5 text-white/60" strokeWidth={1.5} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-softgray/60 uppercase tracking-wider mb-1">
                Schema Coverage
              </div>
              <div className="text-xs text-softgray/50">
                Structured data presence
              </div>
            </div>
          </div>
          <div className="text-4xl font-heading font-bold text-white tabular-nums mb-2">
            {data.schema_coverage}<span className="text-2xl text-softgray/40">%</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-[#2EE6D6]">{data.coverage_delta}</span>
            <span className="text-softgray/50">vs last scan</span>
          </div>
        </div>

        {/* Page Visibility */}
        <div 
          className="bg-[#101C2C] rounded-lg p-6 border border-white/5"
          style={{ boxShadow: '0 0 4px rgba(0, 0, 0, 0.06)' }}
        >
          <div className="flex items-start gap-3 mb-4">
            <div className="p-2 bg-white/5 rounded-lg">
              <CheckCircle className="w-5 h-5 text-white/60" strokeWidth={1.5} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-softgray/60 uppercase tracking-wider mb-1">
                Page Visibility
              </div>
              <div className="text-xs text-softgray/50">
                Citation candidates
              </div>
            </div>
          </div>
          <div className="text-4xl font-heading font-bold text-white tabular-nums mb-2">
            {data.page_visibility}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-[#2EE6D6]">{data.visibility_delta}</span>
            <span className="text-softgray/50">pages indexed</span>
          </div>
        </div>

        {/* Technical Issues */}
        <div 
          className="bg-[#101C2C] rounded-lg p-6 border border-white/5"
          style={{ boxShadow: '0 0 4px rgba(0, 0, 0, 0.06)' }}
        >
          <div className="flex items-start gap-3 mb-4">
            <div className="p-2 bg-white/5 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-white/60" strokeWidth={1.5} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-softgray/60 uppercase tracking-wider mb-1">
                Technical Issues
              </div>
              <div className="text-xs text-softgray/50">
                Items to address
              </div>
            </div>
          </div>
          <div className="text-4xl font-heading font-bold text-white tabular-nums mb-2">
            {data.technical_issues}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-[#2EE6D6]">{data.issues_delta}</span>
            <span className="text-softgray/50">resolved</span>
          </div>
        </div>
      </div>

      {/* Two Column Grid - Context & Comparison */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        {/* Schema Coverage by Page */}
        <div 
          className="bg-[#101C2C] rounded-lg p-6 border border-white/5"
          style={{ boxShadow: '0 0 4px rgba(0, 0, 0, 0.06)' }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-heading font-bold text-white">
              Schema Coverage
            </h2>
            <FileCode className="w-6 h-6 text-[#2EE6D6]" strokeWidth={1.5} />
          </div>
          
          <div className="space-y-2.5">
            {data.pages.map((page, index) => (
              <div 
                key={index} 
                className="website-clickable p-3.5 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
                style={{ cursor: 'pointer' }}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {getStatusIcon(page.status)}
                    <div className="text-white font-body text-sm truncate">
                      {page.url}
                    </div>
                  </div>
                  {page.issues > 0 && (
                    <span className="text-[#FFB84D] text-xs px-2 py-0.5 bg-[#FFB84D]/10 rounded font-medium whitespace-nowrap">
                      {page.issues} issues
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 ml-6">
                  {page.schema_types.length > 0 ? (
                    page.schema_types.map((type, i) => (
                      <span key={i} className="text-xs px-2 py-0.5 bg-[#2EE6D6]/10 text-[#2EE6D6] rounded border border-[#2EE6D6]/30 font-medium">
                        {type}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-softgray/50 italic">No schema detected</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Technical Issues Breakdown */}
        <div 
          className="bg-[#101C2C] rounded-lg p-6 border border-white/5"
          style={{ boxShadow: '0 0 4px rgba(0, 0, 0, 0.06)' }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-heading font-bold text-white">
              Issue Breakdown
            </h2>
            <AlertTriangle className="w-6 h-6 text-[#2EE6D6]" strokeWidth={1.5} />
          </div>
          
          {/* Severity Summary */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="p-3 rounded-lg bg-[#FF6B6B]/10 border border-[#FF6B6B]/30">
              <div className="text-2xl font-heading font-bold text-[#FF6B6B] tabular-nums mb-1">
                {data.issues_by_severity.high}
              </div>
              <div className="text-xs text-softgray/60 font-body">High Priority</div>
            </div>
            <div className="p-3 rounded-lg bg-[#FFB84D]/10 border border-[#FFB84D]/30">
              <div className="text-2xl font-heading font-bold text-[#FFB84D] tabular-nums mb-1">
                {data.issues_by_severity.medium}
              </div>
              <div className="text-xs text-softgray/60 font-body">Medium</div>
            </div>
            <div className="p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="text-2xl font-heading font-bold text-softgray tabular-nums mb-1">
                {data.issues_by_severity.low}
              </div>
              <div className="text-xs text-softgray/60 font-body">Low Priority</div>
            </div>
          </div>

          {/* Issue Categories */}
          <div className="space-y-3">
            {data.issue_categories.map((issue, index) => (
              <div 
                key={index} 
                className="website-clickable p-3.5 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
                style={{ cursor: 'pointer' }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="font-body font-medium text-white text-sm">
                    {issue.category}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded border font-medium ${getSeverityColor(issue.severity)}`}>
                      {issue.severity}
                    </span>
                    <span className="text-white font-heading font-bold text-lg tabular-nums">
                      {issue.count}
                    </span>
                  </div>
                </div>
                <div className="text-softgray/60 text-xs font-body">
                  {issue.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recommended Improvements - Distinct Bottom Section */}
      <div 
        className="rounded-lg p-6 border border-white/5"
        style={{ 
          background: 'rgba(255,255,255,0.02)',
          borderTop: '1px solid rgba(46, 230, 214, 0.25)',
          boxShadow: '0 0 4px rgba(0, 0, 0, 0.06)'
        }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-heading font-bold text-white mb-2">
              Recommended Improvements
            </h2>
            <p className="text-sm text-softgray/60 font-body">
              High-impact fixes to improve AI crawlability and comprehension
            </p>
          </div>
          <Target className="w-6 h-6 text-[#2EE6D6]" strokeWidth={1.5} />
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div 
            className="website-clickable p-5 rounded-lg bg-[#101C2C] hover:bg-[#141E38] transition-colors group border border-white/5"
            style={{ cursor: 'pointer' }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="text-white font-body font-medium">
                Add Missing Schema
              </div>
              <span className="text-[#2EE6D6] text-xs px-2 py-0.5 bg-[#2EE6D6]/10 rounded font-medium">
                High Impact
              </span>
            </div>
            <div className="text-softgray/60 text-sm font-body mb-4 leading-relaxed">
              Implement structured data on 8 pages missing JSON-LD
            </div>
            <button className="flex items-center gap-2 text-[#2EE6D6] text-sm font-body font-medium group-hover:gap-3 transition-all">
              Generate Schema
              <ArrowRight className="w-4 h-4" strokeWidth={2} />
            </button>
          </div>

          <div 
            className="website-clickable p-5 rounded-lg bg-[#101C2C] hover:bg-[#141E38] transition-colors group border border-white/5"
            style={{ cursor: 'pointer' }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="text-white font-body font-medium">
                Fix Canonical Tags
              </div>
              <span className="text-[#2EE6D6] text-xs px-2 py-0.5 bg-[#2EE6D6]/10 rounded font-medium">
                High Impact
              </span>
            </div>
            <div className="text-softgray/60 text-sm font-body mb-4 leading-relaxed">
              Resolve duplicate content issues with proper canonicals
            </div>
            <button className="flex items-center gap-2 text-[#2EE6D6] text-sm font-body font-medium group-hover:gap-3 transition-all">
              View Issues
              <ArrowRight className="w-4 h-4" strokeWidth={2} />
            </button>
          </div>

          <div 
            className="website-clickable p-5 rounded-lg bg-[#101C2C] hover:bg-[#141E38] transition-colors group border border-white/5"
            style={{ cursor: 'pointer' }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="text-white font-body font-medium">
                Optimize Meta Descriptions
              </div>
              <span className="text-softgray/50 text-xs px-2 py-0.5 bg-white/5 rounded font-medium">
                Medium Impact
              </span>
            </div>
            <div className="text-softgray/60 text-sm font-body mb-4 leading-relaxed">
              Write clear, concise descriptions for 5 pages
            </div>
            <button className="flex items-center gap-2 text-[#2EE6D6] text-sm font-body font-medium group-hover:gap-3 transition-all">
              Generate Descriptions
              <ArrowRight className="w-4 h-4" strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}