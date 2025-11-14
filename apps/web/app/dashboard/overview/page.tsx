// apps/web/app/dashboard/overview/page.tsx

'use client'

import { useEffect, useState } from 'react'
import { 
  Home,
  ShoppingBag, 
  Star, 
  MessageSquare, 
  Globe,
  TrendingUp,
  FileText,
  Search
} from 'lucide-react'
import UniversalScanButton from '@/components/scan/UniversalScanButton'
import { useBrand } from '@/contexts/BrandContext'

interface OverviewData {
  shopping_visibility: number
  brand_visibility: number
  conversation_topics: number
  site_readability: number
  brand_mentions: number
  last_scan: string | null
}

export default function OverviewPage() {
  const { currentDashboard } = useBrand()
  const [scanData, setScanData] = useState<OverviewData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchLatestScan() {
      if (!currentDashboard) {
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/scan/latest?dashboardId=${currentDashboard.id}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch scan data')
        }
        
        const data = await response.json()
        
        // Check if scan exists
        if (!data.scan) {
          setScanData(null)
          setLoading(false)
          return
        }
        
        // Map API response to overview format
        const overviewData: OverviewData = {
          shopping_visibility: data.shopping?.score || 0,
          brand_mentions: data.brand?.total_mentions || 0,
          conversation_topics: data.conversations?.questions?.length || 0,
          site_readability: data.website?.readability_score || 0,
          brand_visibility: data.brand?.visibility_index || 0,
          last_scan: data.scan?.finished_at || data.scan?.started_at || null
        }
        
        setScanData(overviewData)
      } catch (error) {
        console.error('Error fetching scan:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchLatestScan()
  }, [currentDashboard])

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'No recent scan'
    try {
      const date = new Date(dateString)
      const now = new Date()
      const diffMs = now.getTime() - date.getTime()
      const diffHrs = Math.floor(diffMs / (1000 * 60 * 60))
      
      if (diffHrs < 1) return 'Just now'
      if (diffHrs < 24) return `${diffHrs} hours ago`
      const diffDays = Math.floor(diffHrs / 24)
      return `${diffDays} days ago`
    } catch {
      return 'No recent scan'
    }
  }

  // Loading skeleton
  if (loading) {
    return (
      <div className="max-w-screen-2xl mx-auto animate-pulse space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-border rounded-lg"></div>
            <div className="h-10 w-48 bg-border rounded"></div>
          </div>
          <div className="h-10 w-40 bg-border rounded-lg"></div>
        </div>

        <div className="grid grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-card rounded-lg p-6 border border-border h-40"></div>
          ))}
        </div>

        <div className="bg-card rounded-lg p-8 border border-border h-96"></div>
      </div>
    )
  }

  // Empty state - no scans yet
  if (!scanData) {
    return (
      <div className="max-w-screen-2xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Home className="w-8 h-8 text-[#2979FF]" strokeWidth={1.5} />
              <h1 className="text-4xl font-heading font-bold text-primary">
                Overview
              </h1>
            </div>
            <UniversalScanButton />
          </div>
        </div>

        <div className="bg-card rounded-lg p-12 border border-border text-center">
          <Home className="w-16 h-16 text-[#2979FF] mx-auto mb-6 opacity-40" strokeWidth={1.5} />
          <h2 className="text-2xl font-heading font-bold text-primary mb-3">
            No Scan Data Yet
          </h2>
          <p className="text-secondary/60 font-body text-sm mb-6 leading-relaxed max-w-md mx-auto">
            Run your first scan to see an overview of your brand's AI visibility across all modules.
          </p>
          <UniversalScanButton variant="large" />
        </div>
      </div>
    )
  }

  const metrics = [
    {
      title: 'SHOPPING VISIBILITY',
      subtitle: 'Product mentions',
      value: scanData.shopping_visibility,
      unit: '%',
      icon: ShoppingBag,
      isLead: true
    },
    {
      title: 'BRAND MENTIONS',
      subtitle: 'Total mentions',
      value: scanData.brand_mentions,
      unit: '',
      icon: Star
    },
    {
      title: 'CONVERSATION TOPICS',
      subtitle: 'Tracked keywords',
      value: scanData.conversation_topics,
      unit: '',
      icon: MessageSquare
    },
    {
      title: 'SITE READABILITY',
      subtitle: 'AI-optimized score',
      value: scanData.site_readability,
      unit: '%',
      icon: Globe
    }
  ]

  const actions = [
    {
      title: 'Improve Shopping Visibility',
      description: 'Optimize product schema and descriptions to improve AI comprehension',
      link: '/dashboard/shopping',
      icon: TrendingUp
    },
    {
      title: 'Analyze Brand Mentions',
      description: 'Deep dive into how AI describes your brand and identify optimization opportunities',
      link: '/dashboard/brand',
      icon: Search
    },
    {
      title: 'Review Readability Report',
      description: 'See which pages need optimization for better AI comprehension',
      link: '/dashboard/website',
      icon: FileText
    }
  ]

  return (
    <div className="max-w-screen-2xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Home className="w-8 h-8 text-[#2979FF]" strokeWidth={1.5} />
            <h1 className="text-4xl font-heading font-bold text-primary">
              Overview
            </h1>
          </div>
          <UniversalScanButton />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-secondary/60">
            <span>Last scan:</span>
            <span className="text-primary">{formatDate(scanData.last_scan)}</span>
            <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></span>
              Live
            </span>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        {metrics.map((metric) => {
          const Icon = metric.icon
          return (
            <div 
              key={metric.title} 
              className="bg-card rounded-lg p-6 border border-border"
            >
              <div className="flex items-start gap-3 mb-4">
                <div className="p-2 bg-white/5 rounded-lg">
                  <Icon className="w-5 h-5 text-secondary/60" strokeWidth={1.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-secondary/60 uppercase tracking-wider mb-1">
                    {metric.title}
                  </div>
                  <div className="text-xs text-secondary/50">
                    {metric.subtitle}
                  </div>
                </div>
              </div>
              
              <div className="flex items-baseline gap-2 mb-2">
                <div 
                  className="font-heading font-bold text-primary tabular-nums"
                  style={{ fontSize: metric.isLead ? '2.5rem' : '2.25rem' }}
                >
                  {metric.value}
                  {metric.unit && <span className="text-2xl text-secondary/40">{metric.unit}</span>}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Brand Visibility Section */}
      <div className="bg-card rounded-lg p-8 border border-border mb-8">
        <div className="mb-6">
          <h2 className="text-2xl font-heading font-bold text-primary mb-2">
            Brand Visibility
          </h2>
          <p className="text-sm text-secondary/60">
            Overall brand presence in AI responses
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8">
          {/* Score Display */}
          <div>
            <div className="mb-4">
              <div className="text-sm text-secondary/60 uppercase tracking-wider mb-2">
                VISIBILITY INDEX
              </div>
              <div className="flex items-baseline gap-3">
                <div className="text-5xl font-heading font-bold text-primary tabular-nums">
                  {scanData.brand_visibility}
                </div>
              </div>
            </div>
            
            {/* Chart placeholder */}
            <div 
              className="h-48 rounded-lg border border-border flex items-center justify-center relative overflow-hidden"
              style={{
                background: `
                  repeating-linear-gradient(
                    45deg,
                    rgba(var(--text-secondary), 0.03) 0,
                    rgba(var(--text-secondary), 0.03) 2px,
                    transparent 2px,
                    transparent 4px
                  ),
                  var(--bg-card)
                `
              }}
            >
              <div className="text-secondary/40 text-sm">Chart visualization</div>
            </div>
          </div>

          {/* Quick Stats */}
          <div>
            <div className="space-y-4">
              <div className="p-4 rounded-lg border border-border">
                <div className="text-sm text-secondary/60 mb-1">Total Mentions</div>
                <div className="text-2xl font-heading font-bold text-primary">{scanData.brand_mentions}</div>
              </div>
              <div className="p-4 rounded-lg border border-border">
                <div className="text-sm text-secondary/60 mb-1">Shopping Score</div>
                <div className="text-2xl font-heading font-bold text-primary">{scanData.shopping_visibility}%</div>
              </div>
              <div className="p-4 rounded-lg border border-border">
                <div className="text-sm text-secondary/60 mb-1">Site Readability</div>
                <div className="text-2xl font-heading font-bold text-primary">{scanData.site_readability}%</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Next Best Actions */}
      <div>
        <h2 className="text-2xl font-heading font-bold text-primary mb-6">
          Next Best Actions
        </h2>
        
        <div className="grid grid-cols-3 gap-6">
          {actions.map((action, index) => {
            const Icon = action.icon
            return (
              <a
                key={index}
                href={action.link}
                className="bg-card rounded-lg p-6 border border-border hover:border-[#2979FF]/30 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-2 bg-[#2979FF]/10 rounded-lg">
                    <Icon className="w-5 h-5 text-[#2979FF]" strokeWidth={1.5} />
                  </div>
                </div>
                
                <h3 className="text-lg font-heading font-semibold text-primary mb-2">
                  {action.title}
                </h3>
                
                <p className="text-sm text-secondary/60 leading-relaxed">
                  {action.description}
                </p>
              </a>
            )
          })}
        </div>
      </div>
    </div>
  )
}