// apps/web/app/dashboard/website/page.tsx

'use client'

import { useEffect, useState } from 'react'
import { Globe, TrendingUp, CheckCircle, AlertTriangle, XCircle, Target, ChevronDown, ChevronRight, FileCode } from 'lucide-react'
import ScanProgressModal from '@/components/scan/ScanProgressModal'
import ActionCard from '@/components/optimization/ActionCard'
import ActionModal from '@/components/optimization/ActionModal'
import { analyzeWebsiteData, TaskRecommendation } from '@/lib/optimization/generator'
import { OptimizationTask } from '@/lib/optimization/tasks'
import { useBrand } from '@/contexts/BrandContext'
import MobileHeader from '@/components/layout/MobileHeader'

interface WebsiteIssue {
  url: string
  issue_code: string
  severity: string
  message: string
  schema_found: boolean
}

interface WebsiteData {
  readability_score: number
  schema_coverage: number
  issues: WebsiteIssue[]
}

interface GroupedIssues {
  code: string
  title: string
  severity: string
  count: number
  urls: string[]
  message: string
}

export default function WebsiteAnalyticsPage() {
  const { currentDashboard } = useBrand()
  
  const [data, setData] = useState<WebsiteData | null>(null)
  const [scanData, setScanData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showScanModal, setShowScanModal] = useState(false)
  const [currentScanId, setCurrentScanId] = useState<string | null>(null)
  
  // Recommendations state
  const [recommendations, setRecommendations] = useState<TaskRecommendation[]>([])
  const [selectedTask, setSelectedTask] = useState<OptimizationTask | null>(null)
  const [showActionModal, setShowActionModal] = useState(false)
  
  // UI state for collapsible sections
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    high: true,
    med: false,
    low: false
  })

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
        
        if (!result.scan) {
          setData(null)
          setLoading(false)
          return
        }
        
        console.log('📊 [Website] Raw data:', result.website)
        console.log('📊 [Website] Issues sample:', result.website?.issues?.slice(0, 3))
        
        // Generate recommendations AND update data with normalized issues
        if (result.website && result.website.issues) {
          // Ensure issues have message field (API might send it as details)
          const normalizedIssues = result.website.issues.map((issue: any) => {
            let message = issue.message
            
            // If no message, try to extract from details
            if (!message && issue.details) {
              try {
                message = typeof issue.details === 'string' 
                  ? JSON.parse(issue.details).message 
                  : issue.details.message
              } catch (e) {
                console.warn('Failed to parse details:', issue.details)
                message = ''
              }
            }
            
            // Infer issue_code from message if missing
            let issueCode = issue.issue_code
            if (!issueCode && message) {
              if (message.includes('Missing Product schema')) {
                issueCode = 'missing_product_schema'
              } else if (message.includes('No structured data found')) {
                issueCode = 'no_schema'
              } else if (message.includes('Content is complex') || message.includes('simplify for AI parsing')) {
                issueCode = 'low_readability'
              } else if (message.includes('Multiple H1 tags')) {
                issueCode = 'multiple_h1'
              } else if (message.includes('Missing meta description')) {
                issueCode = 'missing_meta_description'
              } else if (message.includes('Missing FAQ schema')) {
                issueCode = 'missing_faq_schema'
              } else {
                issueCode = 'unknown'
              }
            }
            
            return {
              ...issue,
              message: message || '',
              issue_code: issueCode || 'unknown'
            }
          })
          
          console.log('📊 [Website] Normalized issues sample:', normalizedIssues.slice(0, 3))
          
          const normalizedData = {
            ...result.website,
            issues: normalizedIssues
          }
          
          // Update data state with normalized issues
          setData(normalizedData)
          
          const tasks = analyzeWebsiteData(normalizedData)
          setRecommendations(tasks)
          console.log('📋 [Website] Recommendations:', tasks.length)
        } else {
          setData(result.website)
        }
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

  const groupIssuesByCode = (issues: WebsiteIssue[]): GroupedIssues[] => {
    const groups = new Map<string, GroupedIssues>()
    
    for (const issue of issues) {
      // Skip issues without issue_code
      if (!issue.issue_code) {
        console.warn('Issue without code:', issue)
        continue
      }
      
      const existing = groups.get(issue.issue_code)
      
      if (existing) {
        existing.count++
        existing.urls.push(issue.url)
      } else {
        const title = formatIssueTitle(issue.issue_code)
        if (title === 'Unknown Issue' || issue.issue_code === 'unknown') {
          console.log('Unknown issue code:', issue.issue_code, 'Message:', issue.message)
        }
        
        groups.set(issue.issue_code, {
          code: issue.issue_code,
          title,
          severity: issue.severity,
          count: 1,
          urls: [issue.url],
          message: issue.message || ''
        })
      }
    }
    
    return Array.from(groups.values()).sort((a, b) => b.count - a.count)
  }

  const formatIssueTitle = (code: string): string => {
    if (!code) return 'Unknown Issue'
    
    const titles: Record<string, string> = {
      no_schema: 'Missing Schema Markup',
      low_readability: 'Low Content Readability',
      multiple_h1: 'Multiple H1 Tags',
      missing_meta_description: 'Missing Meta Description',
      missing_faq_schema: 'Missing FAQ Schema',
      missing_org_schema: 'Missing Organization Schema',
      missing_product_schema: 'Missing Product Schema',
      missing_breadcrumb_schema: 'Missing Breadcrumb Schema',
      invalid_schema: 'Invalid Schema Markup',
      duplicate_content: 'Duplicate Content',
      missing_canonical: 'Missing Canonical Tag',
      broken_links: 'Broken Internal Links',
      // Handle variations
      'missing-product-schema': 'Missing Product Schema',
      'no-schema': 'Missing Schema Markup',
      'low-readability': 'Low Content Readability',
      'multiple-h1': 'Multiple H1 Tags'
    }
    
    // Return mapped title or format the code
    return titles[code] || titles[code.replace(/_/g, '-')] || code.split(/[_-]/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
  }

  const getSeverityColor = (severity: string) => {
    if (severity === 'high') return 'text-red-400'
    if (severity === 'med') return 'text-amber-400'
    return 'text-blue-400'
  }

  const toggleSection = (severity: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [severity]: !prev[severity]
    }))
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
        </div>
      </>
    )
  }

  // Empty state
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
  
  const groupedIssues = {
    high: groupIssuesByCode(data.issues.filter(i => i.severity === 'high')),
    med: groupIssuesByCode(data.issues.filter(i => i.severity === 'med')),
    low: groupIssuesByCode(data.issues.filter(i => i.severity === 'low'))
  }

  // Main content
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

        {/* Grouped Issues */}
        <div className="bg-card rounded-lg border border-border mb-8">
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-heading font-bold text-primary">
              Technical Issues
            </h2>
            <p className="text-sm text-secondary/60 mt-1">
              Grouped by type and severity
            </p>
          </div>

          <div className="divide-y divide-border">
            {/* High Severity Section */}
            {highSeverity > 0 && (
              <div>
                <button
                  onClick={() => toggleSection('high')}
                  className="w-full p-6 flex items-center justify-between hover:bg-hover transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {expandedSections.high ? (
                      <ChevronDown className="w-5 h-5 text-secondary/60" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-secondary/60" />
                    )}
                    <XCircle className="w-5 h-5 text-red-400" strokeWidth={1.5} />
                    <span className="font-heading font-semibold text-primary">
                      High Priority Issues
                    </span>
                    <span className="px-2 py-0.5 bg-red-500/10 text-red-400 text-sm font-medium rounded">
                      {highSeverity}
                    </span>
                  </div>
                </button>
                
                {expandedSections.high && (
                  <div className="px-6 pb-6 space-y-3">
                    {groupedIssues.high.map((group, idx) => (
                      <details key={idx} className="group">
                        <summary className="cursor-pointer p-4 bg-background rounded-lg border border-border hover:border-red-500/30 transition-colors">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-primary">{group.title}</span>
                            <span className="text-sm text-secondary/60">{group.count} pages</span>
                          </div>
                        </summary>
                        <div className="mt-2 p-4 bg-background/50 rounded-lg border border-border/50">
                          <p className="text-sm text-secondary/70 mb-3">{group.message}</p>
                          <div className="space-y-1 max-h-40 overflow-y-auto">
                            {group.urls.slice(0, 10).map((url, i) => (
                              <div key={i} className="text-xs font-mono text-secondary/60 truncate">
                                {url}
                              </div>
                            ))}
                            {group.urls.length > 10 && (
                              <div className="text-xs text-secondary/50 italic">
                                +{group.urls.length - 10} more pages
                              </div>
                            )}
                          </div>
                        </div>
                      </details>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Medium Severity Section */}
            {medSeverity > 0 && (
              <div>
                <button
                  onClick={() => toggleSection('med')}
                  className="w-full p-6 flex items-center justify-between hover:bg-hover transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {expandedSections.med ? (
                      <ChevronDown className="w-5 h-5 text-secondary/60" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-secondary/60" />
                    )}
                    <AlertTriangle className="w-5 h-5 text-amber-400" strokeWidth={1.5} />
                    <span className="font-heading font-semibold text-primary">
                      Medium Priority Issues
                    </span>
                    <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 text-sm font-medium rounded">
                      {medSeverity}
                    </span>
                  </div>
                </button>
                
                {expandedSections.med && (
                  <div className="px-6 pb-6 space-y-3">
                    {groupedIssues.med.map((group, idx) => (
                      <details key={idx} className="group">
                        <summary className="cursor-pointer p-4 bg-background rounded-lg border border-border hover:border-amber-500/30 transition-colors">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-primary">{group.title}</span>
                            <span className="text-sm text-secondary/60">{group.count} pages</span>
                          </div>
                        </summary>
                        <div className="mt-2 p-4 bg-background/50 rounded-lg border border-border/50">
                          <p className="text-sm text-secondary/70 mb-3">{group.message}</p>
                          <div className="space-y-1 max-h-40 overflow-y-auto">
                            {group.urls.slice(0, 10).map((url, i) => (
                              <div key={i} className="text-xs font-mono text-secondary/60 truncate">
                                {url}
                              </div>
                            ))}
                            {group.urls.length > 10 && (
                              <div className="text-xs text-secondary/50 italic">
                                +{group.urls.length - 10} more pages
                              </div>
                            )}
                          </div>
                        </div>
                      </details>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Low Severity Section */}
            {lowSeverity > 0 && (
              <div>
                <button
                  onClick={() => toggleSection('low')}
                  className="w-full p-6 flex items-center justify-between hover:bg-hover transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {expandedSections.low ? (
                      <ChevronDown className="w-5 h-5 text-secondary/60" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-secondary/60" />
                    )}
                    <CheckCircle className="w-5 h-5 text-blue-400" strokeWidth={1.5} />
                    <span className="font-heading font-semibold text-primary">
                      Low Priority Issues
                    </span>
                    <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-sm font-medium rounded">
                      {lowSeverity}
                    </span>
                  </div>
                </button>
                
                {expandedSections.low && (
                  <div className="px-6 pb-6 space-y-3">
                    {groupedIssues.low.map((group, idx) => (
                      <details key={idx} className="group">
                        <summary className="cursor-pointer p-4 bg-background rounded-lg border border-border hover:border-blue-500/30 transition-colors">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-primary">{group.title}</span>
                            <span className="text-sm text-secondary/60">{group.count} pages</span>
                          </div>
                        </summary>
                        <div className="mt-2 p-4 bg-background/50 rounded-lg border border-border/50">
                          <p className="text-sm text-secondary/70 mb-3">{group.message}</p>
                          <div className="space-y-1 max-h-40 overflow-y-auto">
                            {group.urls.slice(0, 10).map((url, i) => (
                              <div key={i} className="text-xs font-mono text-secondary/60 truncate">
                                {url}
                              </div>
                            ))}
                            {group.urls.length > 10 && (
                              <div className="text-xs text-secondary/50 italic">
                                +{group.urls.length - 10} more pages
                              </div>
                            )}
                          </div>
                        </div>
                      </details>
                    ))}
                  </div>
                )}
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
              {recommendations.length > 0 
                ? `${recommendations.length} recommended action${recommendations.length === 1 ? '' : 's'} to improve AI readability`
                : 'Actions to improve AI readability'}
            </p>
          </div>
          <div className="p-6">
            {recommendations.length > 0 ? (
              <div className="space-y-4">
                {recommendations.map((rec) => (
                  <ActionCard
                    key={rec.task.id}
                    task={rec.task}
                    onClick={() => {
                      setSelectedTask(rec.task)
                      setShowActionModal(true)
                    }}
                    context={rec.context}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-secondary/60">
                <p className="mb-2">No specific recommendations at this time.</p>
                <p className="text-sm">Run another scan after implementing changes to see updated suggestions.</p>
              </div>
            )}
          </div>
        </div>

        {/* Action Modal */}
        {selectedTask && (
          <ActionModal
            isOpen={showActionModal}
            onClose={() => {
              setShowActionModal(false)
              setSelectedTask(null)
            }}
            task={selectedTask}
            dashboardId={currentDashboard?.id || ''}
            brandName={currentDashboard?.brand_name || ''}
            context={recommendations.find(r => r.task.id === selectedTask.id)?.context}
          />
        )}

        <ScanProgressModal
          isOpen={showScanModal}
          onClose={() => setShowScanModal(false)}
          scanId={currentScanId}
        />
      </div>
    </>
  )
}