// apps/web/app/dashboard/website/page.tsx

'use client'

import { useEffect, useState } from 'react'
import { Globe, TrendingUp, CheckCircle, AlertTriangle, XCircle, Target, ArrowRight, FileCode } from 'lucide-react'
import ScanButton from '@/components/scan/ScanButton'
import ScanProgressModal from '@/components/scan/ScanProgressModal'

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
  const [showScanModal, setShowScanModal] = useState(false)
  const [currentScanId, setCurrentScanId] = useState<string | null>(null)
  const [hasScans, setHasScans] = useState(false)

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/scan/latest')
        if (!response.ok) throw new Error('Failed to fetch')
        
        const scanData = await response.json()
        
        // Check if user has any scans
        if (!scanData.hasScans) {
          setHasScans(false)
          setLoading(false)
          return
        }

        setHasScans(true)
        
        // Use real data from API
        const website = scanData.website || {}
        
        // Group issues by URL for page breakdown
        const pageMap = new Map<string, any>()
        
        ;(website.issues || []).forEach((issue: any) => {
          if (!pageMap.has(issue.url)) {
            pageMap.set(issue.url, {
              url: issue.url,
              schema_types: [],
              issues_list: [],
              high_count: 0,
              medium_count: 0,
              low_count: 0
            })
          }
          
          const page = pageMap.get(issue.url)
          page.issues_list.push(issue)
          
          if (issue.severity === 'high') page.high_count++
          if (issue.severity === 'med') page.medium_count++
          if (issue.severity === 'low') page.low_count++
          
          if (issue.schema_found && !page.schema_types.includes(issue.code)) {
            // Extract schema type from issue code if present
            // This is a simplification - real crawler would provide this
          }
        })
        
        const pages = Array.from(pageMap.values()).map(page => {
          let status: 'pass' | 'warning' | 'fail' = 'pass'
          if (page.high_count > 0) status = 'fail'
          else if (page.medium_count > 0 || page.low_count > 0) status = 'warning'
          
          return {
            url: page.url,
            schema_types: page.schema_types,
            status,
            issues: page.issues_list.length
          }
        })
        
        // Count issues by severity
        const high = (website.issues || []).filter((i: any) => i.severity === 'high').length
        const medium = (website.issues || []).filter((i: any) => i.severity === 'med').length
        const low = (website.issues || []).filter((i: any) => i.severity === 'low').length
        
        // Group issues by category (issue_code)
        const categoryMap = new Map<string, any>()
        
        ;(website.issues || []).forEach((issue: any) => {
          const code = issue.code || issue.issue_code || 'unknown'
          
          if (!categoryMap.has(code)) {
            categoryMap.set(code, {
              category: formatIssueCode(code),
              count: 0,
              severity: issue.severity === 'med' ? 'medium' : issue.severity,
              description: issue.details?.message || 'Issue detected'
            })
          }
          
          categoryMap.get(code).count++
        })
        
        const issue_categories = Array.from(categoryMap.values())
          .sort((a, b) => {
            const severityOrder = { high: 0, medium: 1, low: 2 }
            return severityOrder[a.severity as keyof typeof severityOrder] - severityOrder[b.severity as keyof typeof severityOrder]
          })
        
        const websiteData: WebsiteData = {
          readability_score: website.readability_score || 0,
          readability_delta: '+3.2%', // TODO: Calculate from previous scan
          schema_coverage: website.schema_coverage || 0,
          coverage_delta: '+12%', // TODO: Calculate from previous scan
          page_visibility: pages.length,
          visibility_delta: '+8', // TODO: Calculate from previous scan
          technical_issues: (website.issues || []).length,
          issues_delta: '-5', // TODO: Calculate from previous scan
          last_scan: scanData.last_scan,
          pages,
          issues_by_severity: { high, medium, low },
          issue_categories
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

  const handleStartScan = async () => {
    try {
      const response = await fetch('/api/scan/start', {
        method: 'POST',
      })

      const data = await response.json()

      if (data.success) {
        setCurrentScanId(data.scanId)
        setShowScanModal(true)
      }
    } catch (error) {
      console.error('Failed to start scan:', error)
    }
  }

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

  const formatIssueCode = (code: string): string => {
    return code
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  const getStatusIcon = (status: 'pass' | 'warning' | 'fail') => {
    if (status === 'pass') return <CheckCircle className="w-4 h-4 text-[#E879F9]" strokeWidth={2} />
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

  // Empty state - no scans yet
  if (!hasScans || !data) {
    return (
      <div>
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Globe className="w-8 h-8 text-[#E879F9]" strokeWidth={1.5} />
              <h1 className="text-4xl font-heading font-bold text-white">
                Website Analytics
              </h1>
            </div>

            {/* Scan Button */}
            <ScanButton onScanStart={handleStartScan} />
          </div>
          
          <p className="text-sm text-softgray/60 mb-2">
            How AI crawlers read and understand your website structure
          </p>
        </div>

        {/* Empty State */}
        <div 
          className="bg-[#101C2C] rounded-lg p-12 border border-white/5 text-center"
          style={{ boxShadow: '0 0 4px rgba(0, 0, 0, 0.06)' }}
        >
          <div className="max-w-md mx-auto">
            <Globe className="w-16 h-16 text-[#E879F9] mx-auto mb-6 opacity-40" strokeWidth={1.5} />
            <h2 className="text-2xl font-heading font-bold text-white mb-3">
              No Scan Data Yet
            </h2>
            <p className="text-softgray/60 font-body text-sm mb-6 leading-relaxed">
              Run your first scan to analyze how AI models read your website. We'll check schema markup, 
              meta tags, content structure, and technical SEO factors.
            </p>
            <button
              onClick={handleStartScan}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#E879F9] hover:brightness-110 text-white rounded-lg font-body font-medium transition-all cursor-pointer"
            >
              <FileCode className="w-5 h-5" strokeWidth={2} />
              Run Your First Scan
            </button>
          </div>
        </div>

        {/* Scan Progress Modal */}
        <ScanProgressModal
          isOpen={showScanModal}
          onClose={() => setShowScanModal(false)}
          scanId={currentScanId}
        />
      </div>
    )
  }

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Globe className="w-8 h-8 text-[#E879F9]" strokeWidth={1.5} />
            <h1 className="text-4xl font-heading font-bold text-white">
              Website Analytics
            </h1>
          </div>

          {/* Scan Button */}
          <ScanButton onScanStart={handleStartScan} />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-softgray/60 mb-2">
              How AI crawlers read and understand your website structure
            </p>
            <p className="text-sm text-softgray/70 italic">
              {data.schema_coverage > 0 
                ? `${data.schema_coverage}% of your pages have structured data`
                : 'Analyzing website structure...'}
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
                Content clarity
              </div>
            </div>
          </div>
          <div className="text-4xl font-heading font-bold text-white tabular-nums mb-2">
            {data.readability_score}<span className="text-2xl text-softgray/40">%</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-[#E879F9]">{data.readability_delta}</span>
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
                Structured data
              </div>
            </div>
          </div>
          <div className="text-4xl font-heading font-bold text-white tabular-nums mb-2">
            {data.schema_coverage}<span className="text-2xl text-softgray/40">%</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-[#E879F9]">{data.coverage_delta}</span>
            <span className="text-softgray/50">increase</span>
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
                Pages Analyzed
              </div>
              <div className="text-xs text-softgray/50">
                Crawled URLs
              </div>
            </div>
          </div>
          <div className="text-4xl font-heading font-bold text-white tabular-nums mb-2">
            {data.page_visibility}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-[#E879F9]">{data.visibility_delta}</span>
            <span className="text-softgray/50">new pages</span>
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
                Issues Found
              </div>
              <div className="text-xs text-softgray/50">
                Needs attention
              </div>
            </div>
          </div>
          <div className="text-4xl font-heading font-bold text-white tabular-nums mb-2">
            {data.technical_issues}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-[#E879F9]">{data.issues_delta}</span>
            <span className="text-softgray/50">resolved</span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        {/* Page Status */}
        <div 
          className="bg-[#101C2C] rounded-lg p-6 border border-white/5"
          style={{ boxShadow: '0 0 4px rgba(0, 0, 0, 0.06)' }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-heading font-bold text-white">
                Page Status
              </h2>
              <p className="text-sm text-softgray/60 font-body mt-1">
                Schema validation and issues per URL
              </p>
            </div>
            <Globe className="w-6 h-6 text-[#E879F9]" strokeWidth={1.5} />
          </div>
          
          {data.pages.length > 0 ? (
            <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-2">
              {data.pages.map((page, index) => (
                <div 
                  key={index}
                  className="p-3.5 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0 pr-3">
                      <div className="text-white font-body text-sm mb-2 truncate">
                        {page.url}
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {page.schema_types.length > 0 ? (
                          page.schema_types.map((type, i) => (
                            <span 
                              key={i}
                              className="px-2 py-0.5 rounded text-xs font-body font-medium bg-[#E879F9]/10 text-[#E879F9] border border-[#E879F9]/30"
                            >
                              {type}
                            </span>
                          ))
                        ) : (
                          <span className="px-2 py-0.5 rounded text-xs font-body font-medium bg-softgray/10 text-softgray/60 border border-softgray/30">
                            No Schema
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {getStatusIcon(page.status)}
                      {page.issues > 0 && (
                        <div className="text-softgray/60 text-xs font-body">
                          {page.issues} {page.issues === 1 ? 'issue' : 'issues'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-softgray/40 text-sm font-body mb-2">
                No pages analyzed yet
              </div>
              <div className="text-softgray/60 text-xs font-body">
                Page analysis will appear after your first scan
              </div>
            </div>
          )}
        </div>

        {/* Issue Categories */}
        <div 
          className="bg-[#101C2C] rounded-lg p-6 border border-white/5"
          style={{ boxShadow: '0 0 4px rgba(0, 0, 0, 0.06)' }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-heading font-bold text-white">
                Issue Categories
              </h2>
              <p className="text-sm text-softgray/60 font-body mt-1">
                Common problems affecting AI readability
              </p>
            </div>
            <AlertTriangle className="w-6 h-6 text-[#E879F9]" strokeWidth={1.5} />
          </div>
          
          {data.issue_categories.length > 0 ? (
            <div className="space-y-3">
              {data.issue_categories.map((category, index) => (
                <div 
                  key={index}
                  className="p-4 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] cursor-pointer transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0 pr-3">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="text-white font-body font-medium text-sm">
                          {category.category}
                        </div>
                        <span className={`px-2 py-0.5 rounded text-xs font-body font-medium border ${getSeverityColor(category.severity)}`}>
                          {category.severity}
                        </span>
                      </div>
                      <div className="text-softgray/60 text-xs font-body">
                        {category.description}
                      </div>
                    </div>
                    <div className="text-[#E879F9] font-heading font-bold text-xl tabular-nums flex-shrink-0">
                      {category.count}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-softgray/40 text-sm font-body mb-2">
                No issues detected yet
              </div>
              <div className="text-softgray/60 text-xs font-body">
                Issue analysis will appear after your first scan
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Issues by Severity - Full Width */}
      {data.technical_issues > 0 && (
        <div 
          className="bg-[#101C2C] rounded-lg p-6 border border-white/5 mb-8"
          style={{ boxShadow: '0 0 4px rgba(0, 0, 0, 0.06)' }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-heading font-bold text-white mb-2">
                Issues by Severity
              </h2>
              <p className="text-sm text-softgray/60 font-body">
                Distribution of technical problems across priority levels
              </p>
            </div>
            <TrendingUp className="w-6 h-6 text-[#E879F9]" strokeWidth={1.5} />
          </div>
          
          <div className="grid grid-cols-3 gap-8">
            {/* High Severity */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="text-white font-body font-medium text-lg">
                  High Priority
                </div>
                <div className="text-[#FF6B6B] font-heading font-bold text-2xl tabular-nums">
                  {data.issues_by_severity.high}
                </div>
              </div>
              <div className="h-2 bg-white/[0.03] rounded-full overflow-hidden mb-2">
                <div 
                  className="h-full bg-[#FF6B6B] rounded-full transition-all duration-500"
                  style={{ 
                    width: `${data.technical_issues > 0 ? (data.issues_by_severity.high / data.technical_issues) * 100 : 0}%` 
                  }}
                />
              </div>
              <div className="text-softgray/60 text-sm font-body">
                Requires immediate attention
              </div>
            </div>

            {/* Medium Severity */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="text-white font-body font-medium text-lg">
                  Medium Priority
                </div>
                <div className="text-[#FFB84D] font-heading font-bold text-2xl tabular-nums">
                  {data.issues_by_severity.medium}
                </div>
              </div>
              <div className="h-2 bg-white/[0.03] rounded-full overflow-hidden mb-2">
                <div 
                  className="h-full bg-[#FFB84D] rounded-full transition-all duration-500"
                  style={{ 
                    width: `${data.technical_issues > 0 ? (data.issues_by_severity.medium / data.technical_issues) * 100 : 0}%` 
                  }}
                />
              </div>
              <div className="text-softgray/60 text-sm font-body">
                Should be addressed soon
              </div>
            </div>

            {/* Low Severity */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="text-white font-body font-medium text-lg">
                  Low Priority
                </div>
                <div className="text-softgray/70 font-heading font-bold text-2xl tabular-nums">
                  {data.issues_by_severity.low}
                </div>
              </div>
              <div className="h-2 bg-white/[0.03] rounded-full overflow-hidden mb-2">
                <div 
                  className="h-full bg-softgray/50 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${data.technical_issues > 0 ? (data.issues_by_severity.low / data.technical_issues) * 100 : 0}%` 
                  }}
                />
              </div>
              <div className="text-softgray/60 text-sm font-body">
                Minor improvements
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recommended Improvements */}
      <div 
        className="rounded-lg p-6 border border-white/5"
        style={{ 
          background: 'rgba(255,255,255,0.02)',
          borderTop: '1px solid rgba(232, 121, 249, 0.25)',
          boxShadow: '0 0 4px rgba(0, 0, 0, 0.06)'
        }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-heading font-bold text-white mb-2">
              Recommended Improvements
            </h2>
            <p className="text-sm text-softgray/60 font-body">
              High-impact technical fixes to improve AI comprehension
            </p>
          </div>
          <Target className="w-6 h-6 text-[#E879F9]" strokeWidth={1.5} />
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="p-5 rounded-lg bg-[#101C2C] hover:bg-[#141E38] cursor-pointer transition-colors group border border-white/5">
            <div className="flex items-start justify-between mb-3">
              <div className="text-white font-body font-medium">
                Fix Missing Schema
              </div>
              <span className="text-[#E879F9] text-xs px-2 py-0.5 bg-[#E879F9]/10 rounded font-medium">
                High Impact
              </span>
            </div>
            <div className="text-softgray/60 text-sm font-body mb-4 leading-relaxed">
              Add structured data to pages without JSON-LD markup
            </div>
            <button className="flex items-center gap-2 text-[#E879F9] text-sm font-body font-medium group-hover:gap-3 transition-all">
              View Issues
              <ArrowRight className="w-4 h-4" strokeWidth={2} />
            </button>
          </div>

          <div className="p-5 rounded-lg bg-[#101C2C] hover:bg-[#141E38] cursor-pointer transition-colors group border border-white/5">
            <div className="flex items-start justify-between mb-3">
              <div className="text-white font-body font-medium">
                Optimize Meta Tags
              </div>
              <span className="text-[#E879F9] text-xs px-2 py-0.5 bg-[#E879F9]/10 rounded font-medium">
                High Impact
              </span>
            </div>
            <div className="text-softgray/60 text-sm font-body mb-4 leading-relaxed">
              Add or improve meta descriptions for better AI understanding
            </div>
            <button className="flex items-center gap-2 text-[#E879F9] text-sm font-body font-medium group-hover:gap-3 transition-all">
              Generate Tags
              <ArrowRight className="w-4 h-4" strokeWidth={2} />
            </button>
          </div>

          <div className="p-5 rounded-lg bg-[#101C2C] hover:bg-[#141E38] cursor-pointer transition-colors group border border-white/5">
            <div className="flex items-start justify-between mb-3">
              <div className="text-white font-body font-medium">
                Fix Canonical Tags
              </div>
              <span className="text-softgray/50 text-xs px-2 py-0.5 bg-white/5 rounded font-medium">
                Medium Impact
              </span>
            </div>
            <div className="text-softgray/60 text-sm font-body mb-4 leading-relaxed">
              Resolve duplicate content issues with proper canonicals
            </div>
            <button className="flex items-center gap-2 text-[#E879F9] text-sm font-body font-medium group-hover:gap-3 transition-all">
              View Pages
              <ArrowRight className="w-4 h-4" strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>

      {/* Scan Progress Modal */}
      <ScanProgressModal
        isOpen={showScanModal}
        onClose={() => setShowScanModal(false)}
        scanId={currentScanId}
      />
    </div>
  )
}