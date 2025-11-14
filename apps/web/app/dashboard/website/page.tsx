// apps/web/app/dashboard/website/page.tsx

'use client'

import { useEffect, useState } from 'react'
import { Globe, TrendingUp, CheckCircle, AlertTriangle, XCircle, Target, ArrowRight, FileCode } from 'lucide-react'
import ScanProgressModal from '@/components/scan/ScanProgressModal'
import UniversalScanButton from '@/components/scan/UniversalScanButton'
import { useBrand } from '@/contexts/BrandContext'
import MobileHeader from '@/components/layout/MobileHeader'

interface WebsiteData {
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

export default function WebsiteAnalyticsPage() {
  const { currentDashboard } = useBrand()
  
  const [data, setData] = useState<WebsiteData | null>(null)
  const [scanData, setScanData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showScanModal, setShowScanModal] = useState(false)
  const [currentScanId, setCurrentScanId] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      if (!currentDashboard) {
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/scan/latest?dashboardId=${currentDashboard.id}`)
        if (!response.ok) throw new Error('Failed to fetch')
        
        const result = await response.json()
        setScanData(result)
        
        // If no scan exists, don't set data
        if (!result.scan) {
          setData(null)
          setLoading(false)
          return
        }
        
        // Map website data from API
        setData(result.website)
      } catch (error) {
        console.error('Error fetching website data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [currentDashboard])

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

  const getSeverityIcon = (severity: string) => {
    if (severity === 'high') return <XCircle className="w-5 h-5 text-red-400" strokeWidth={1.5} />
    if (severity === 'med') return <AlertTriangle className="w-5 h-5 text-amber-400" strokeWidth={1.5} />
    return <CheckCircle className="w-5 h-5 text-blue-400" strokeWidth={1.5} />
  }

  const getSeverityColor = (severity: string) => {
    if (severity === 'high') return 'bg-red-500/10 text-red-400 border-red-500/30'
    if (severity === 'med') return 'bg-amber-500/10 text-amber-400 border-amber-500/30'
    return 'bg-blue-500/10 text-blue-400 border-blue-500/30'
  }

  // Loading skeleton
  if (loading) {
    return (
      <>
        <MobileHeader />
        <div className="max-w-screen-2xl mx-auto animate-pulse space-y-8 pt-20 lg:pt-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-border rounded-lg"></div>
              <div className="h-10 w-64 bg-border rounded"></div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-card rounded-lg p-6 border border-border h-32"></div>
            ))}
          </div>

          <div className="bg-card rounded-lg p-6 border border-border h-64"></div>
        </div>
      </>
    )
  }

  // Empty state - no scans yet
  if (!data || !scanData?.scan) {
    return (
      <>
        <MobileHeader />
        <div className="max-w-screen-2xl mx-auto pt-20 lg:pt-0 px-4 lg:px-0">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Globe className="w-6 h-6 lg:w-8 lg:h-8 text-[#E879F9]" strokeWidth={1.5} />
                <h1 className="text-2xl lg:text-4xl font-heading font-bold text-primary">
                  Website Analytics
                </h1>
              </div>
            </div>
            
            <p className="text-sm text-secondary/60 mb-2">
              How AI crawlers read and understand your website structure
            </p>
          </div>

          <div className="bg-card rounded-lg p-8 lg:p-12 border border-border text-center">
            <Globe className="w-12 h-12 lg:w-16 lg:h-16 text-[#E879F9] mx-auto mb-6 opacity-40" strokeWidth={1.5} />
            <h2 className="text-xl lg:text-2xl font-heading font-bold text-primary mb-3">
              No Scan Data Yet
            </h2>
            <p className="text-secondary/60 font-body text-sm mb-6 leading-relaxed max-w-md mx-auto">
              Run your first scan to analyze schema markup, meta tags, content structure, and technical SEO for AI readability.
            </p>
          </div>

          <ScanProgressModal
            isOpen={showScanModal}
            onClose={() => setShowScanModal(false)}
            scanId={currentScanId}
          />
        </div>
      </>
    )
  }

  const highSeverity = data.issues.filter(i => i.severity === 'high').length
  const medSeverity = data.issues.filter(i => i.severity === 'med').length
  const lowSeverity = data.issues.filter(i => i.severity === 'low').length

  // Main content with data
  return (
    <>
      <MobileHeader />
      <div className="max-w-screen-2xl mx-auto pt-20 lg:pt-0 px-4 lg:px-0">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Globe className="w-6 h-6 lg:w-8 lg:h-8 text-[#E879F9]" strokeWidth={1.5} />
              <h1 className="text-2xl lg:text-4xl font-heading font-bold text-primary">
                Website Analytics
              </h1>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-secondary/60 mb-2">
                How AI crawlers read and understand your website structure
              </p>
              <p className="text-sm text-secondary/70 italic">
                Last scan: {formatDate(scanData.scan.finished_at || scanData.scan.started_at)}
              </p>
            </div>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-card rounded-lg p-6 border border-border">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-[#E879F9]" strokeWidth={1.5} />
            <p className="text-xs text-secondary/60 uppercase tracking-wider">Readability Score</p>
          </div>
          <div className="text-4xl font-heading font-bold text-primary mb-2">
            {data.readability_score}<span className="text-2xl text-secondary/40">%</span>
          </div>
          <p className="text-sm text-secondary/60">AI optimization</p>
        </div>

        <div className="bg-card rounded-lg p-6 border border-border">
          <div className="flex items-center gap-2 mb-4">
            <FileCode className="w-5 h-5 text-[#E879F9]" strokeWidth={1.5} />
            <p className="text-xs text-secondary/60 uppercase tracking-wider">Schema Coverage</p>
          </div>
          <div className="text-4xl font-heading font-bold text-primary mb-2">
            {data.schema_coverage}<span className="text-2xl text-secondary/40">%</span>
          </div>
          <p className="text-sm text-secondary/60">Pages with schema</p>
        </div>

        <div className="bg-card rounded-lg p-6 border border-border">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-[#E879F9]" strokeWidth={1.5} />
            <p className="text-xs text-secondary/60 uppercase tracking-wider">Total Issues</p>
          </div>
          <div className="text-4xl font-heading font-bold text-primary mb-2">
            {data.issues.length}
          </div>
          <p className="text-sm text-secondary/60">Across all pages</p>
        </div>

        <div className="bg-card rounded-lg p-6 border border-border">
          <div className="flex items-center gap-2 mb-4">
            <XCircle className="w-5 h-5 text-[#E879F9]" strokeWidth={1.5} />
            <p className="text-xs text-secondary/60 uppercase tracking-wider">High Priority</p>
          </div>
          <div className="text-4xl font-heading font-bold text-primary mb-2">
            {highSeverity}
          </div>
          <p className="text-sm text-secondary/60">Critical issues</p>
        </div>
      </div>

      {/* Issues Breakdown */}
      <div className="bg-card rounded-lg border border-border mb-8">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-heading font-bold text-primary">
            Issues by Severity
          </h2>
          <p className="text-sm text-secondary/60 mt-1">
            Technical issues affecting AI readability
          </p>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-heading font-bold text-red-400 mb-2">
                {highSeverity}
              </div>
              <p className="text-sm text-secondary/70">High Severity</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-heading font-bold text-amber-400 mb-2">
                {medSeverity}
              </div>
              <p className="text-sm text-secondary/70">Medium Severity</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-heading font-bold text-blue-400 mb-2">
                {lowSeverity}
              </div>
              <p className="text-sm text-secondary/70">Low Severity</p>
            </div>
          </div>
        </div>
      </div>

      {/* Issues Table */}
      <div className="bg-card rounded-lg border border-border mb-8">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-heading font-bold text-primary">
            Technical Issues
          </h2>
          <p className="text-sm text-secondary/60 mt-1">
            Schema markup and structural problems
          </p>
        </div>
        
        <div className="overflow-x-auto">
          {data.issues.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 text-xs text-secondary/60 uppercase tracking-wider font-medium">Severity</th>
                  <th className="text-left p-4 text-xs text-secondary/60 uppercase tracking-wider font-medium">URL</th>
                  <th className="text-left p-4 text-xs text-secondary/60 uppercase tracking-wider font-medium">Issue</th>
                  <th className="text-left p-4 text-xs text-secondary/60 uppercase tracking-wider font-medium">Schema</th>
                </tr>
              </thead>
              <tbody>
                {data.issues.map((issue, index) => (
                  <tr 
                    key={index}
                    className="border-b border-border last:border-0 hover:bg-hover transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {getSeverityIcon(issue.severity)}
                        <span className={`px-3 py-1 rounded-full border text-xs font-medium ${getSeverityColor(issue.severity)}`}>
                          {issue.severity === 'med' ? 'Medium' : issue.severity.charAt(0).toUpperCase() + issue.severity.slice(1)}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-secondary/80 text-sm font-mono truncate max-w-xs">
                      {issue.url}
                    </td>
                    <td className="p-4 text-primary text-sm">
                      {issue.message}
                    </td>
                    <td className="p-4">
                      {issue.schema_found ? (
                        <CheckCircle className="w-5 h-5 text-green-400" strokeWidth={1.5} />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-400" strokeWidth={1.5} />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center text-secondary/60">
              No issues found - great job!
            </div>
          )}
        </div>
      </div>

      {/* Optimize Section */}
      <div className="bg-card rounded-lg border border-border">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-heading font-bold text-primary">
            Optimize Website Structure
          </h2>
          <p className="text-sm text-secondary/60 mt-1">
            Actions to improve AI readability
          </p>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 rounded-lg border border-border hover:border-[#E879F9]/30 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-[#E879F9]/10 flex items-center justify-center flex-shrink-0">
                <FileCode className="w-5 h-5 text-[#E879F9]" strokeWidth={1.5} />
              </div>
              <div className="flex-1">
                <h3 className="font-heading font-semibold text-primary mb-1">
                  Fix Missing Schema
                </h3>
                <p className="text-sm text-secondary/70 mb-3">
                  Add JSON-LD schema markup to pages without it. Start with Organization, Product, and Breadcrumb schemas.
                </p>
                <button className="text-sm text-[#E879F9] hover:underline font-medium inline-flex items-center gap-1">
                  Learn how <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ScanProgressModal
        isOpen={showScanModal}
        onClose={() => setShowScanModal(false)}
        scanId={currentScanId}
      />
      </div>
    </>
  )
}