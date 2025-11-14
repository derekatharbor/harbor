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
import Link from 'next/link'
import { useBrand } from '@/contexts/BrandContext'

interface ScanData {
  shopping_visibility: number
  brand_mentions: number
  conversation_topics: number
  site_readability: number
  brand_visibility: number
  last_scan: string | null
}

export default function OverviewPage() {
  const { currentDashboard } = useBrand()
  const [scanData, setScanData] = useState<ScanData | null>(null)
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
        
        // Map API response to overview format
        const overviewData: ScanData = {
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
    if (!dateString) return '2 hours ago'
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
      return '2 hours ago'
    }
  }

  if (loading) {
    return (
      <div>
        {/* Header Skeleton */}
        <div className="mb-8 animate-pulse">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-white/5 rounded-lg"></div>
            <div className="h-10 w-48 bg-white/5 rounded"></div>
          </div>
          <div className="h-4 w-64 bg-white/5 rounded"></div>
        </div>

        {/* Metric Cards Skeleton */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-[#101C2C] rounded-lg p-6 border border-white/5 animate-pulse h-40"></div>
          ))}
        </div>

        {/* Brand Visibility Skeleton */}
        <div className="bg-[#101C2C] rounded-lg p-8 border border-white/5 mb-8 animate-pulse h-96"></div>

        {/* Actions Skeleton */}
        <div className="grid grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-[#101C2C] rounded-lg p-6 border border-white/5 animate-pulse h-48"></div>
          ))}
        </div>
      </div>
    )
  }

  const metrics = [
    {
      title: 'SHOPPING VISIBILITY',
      subtitle: 'Product mentions',
      value: scanData?.shopping_visibility || 89.8,
      unit: '%',
      change: '+1%',
      trend: 'vs last week',
      icon: ShoppingBag,
      isLead: true
    },
    {
      title: 'BRAND MENTIONS',
      subtitle: 'Estimated monthly volume',
      value: scanData?.brand_mentions || 2.7,
      unit: 'M',
      change: '+12%',
      trend: 'vs last week',
      icon: Star
    },
    {
      title: 'CONVERSATION TOPICS',
      subtitle: 'Tracked keywords',
      value: scanData?.conversation_topics || 156,
      unit: '',
      change: '+8%',
      trend: 'vs last week',
      icon: MessageSquare
    },
    {
      title: 'SITE READABILITY',
      subtitle: 'AI-optimized score',
      value: scanData?.site_readability || 94,
      unit: '%',
      change: '+3%',
      trend: 'vs last week',
      icon: Globe
    }
  ]

  const competitors = [
    { rank: 1, name: 'Chase', change: '+5%', score: 92 },
    { rank: 2, name: 'Demo Brand', change: '+1%', score: 89.8, isYou: true },
    { rank: 3, name: 'American Express', change: '-1%', score: 85 },
    { rank: 4, name: 'Capital on Tap', change: '+5%', score: 78 },
    { rank: 5, name: 'US Bank', change: '-2%', score: 76.9 }
  ]

  const actions = [
    {
      title: 'Improve Shopping Visibility',
      potential: '+1.9% potential',
      description: 'Optimize product schema and descriptions to improve AI comprehension',
      link: 'View Optimization',
      icon: TrendingUp
    },
    {
      title: 'Analyze Brand Mentions',
      growth: '+12% growth',
      description: 'Deep dive into how AI describes your brand and identify optimization opportunities',
      link: 'View Intelligence',
      icon: Search
    },
    {
      title: 'Review Readability Report',
      issues: '3 issues found',
      description: 'See which pages need optimization for better AI comprehension',
      link: 'View Report',
      icon: FileText
    }
  ]

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Home className="w-8 h-8 text-[#2979FF]" strokeWidth={1.5} />
          <h1 className="text-4xl font-heading font-bold text-white">
            Overview
          </h1>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-softgray/60">
            <span>Last scan:</span>
            <span className="text-white">{formatDate(scanData?.last_scan)}</span>
            <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></span>
              Live
            </span>
          </div>
          
          {/* Time Filter Pills */}
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 text-sm text-softgray/60 hover:text-white rounded-lg transition-colors cursor-pointer">
              Last 24 hours
            </button>
            <button className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg cursor-pointer">
              Last 7 days
            </button>
            <button className="px-3 py-1.5 text-sm text-softgray/60 hover:text-white rounded-lg transition-colors cursor-pointer">
              Last 30 days
            </button>
            <button className="px-3 py-1.5 text-sm text-softgray/60 hover:text-white rounded-lg transition-colors cursor-pointer">
              Custom range
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid - 32px margin below */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        {metrics.map((metric) => {
          const Icon = metric.icon
          return (
            <div 
              key={metric.title} 
              className="bg-[#101C2C] rounded-lg p-6 border border-white/5"
              style={{ 
                boxShadow: '0 0 4px rgba(0, 0, 0, 0.06)',
                opacity: metric.isLead ? 1 : 0.95
              }}
            >
              <div className="flex items-start gap-3 mb-4">
                <div className="p-2 bg-white/5 rounded-lg">
                  <Icon className="w-5 h-5 text-white/60" strokeWidth={1.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-softgray/60 uppercase tracking-wider mb-1">
                    {metric.title}
                  </div>
                  <div className="text-xs text-softgray/50">
                    {metric.subtitle}
                  </div>
                </div>
              </div>
              
              <div className="flex items-baseline gap-2 mb-2">
                <div 
                  className="font-heading font-bold text-white tabular-nums"
                  style={{ fontSize: metric.isLead ? '2.5rem' : '2.25rem' }}
                >
                  {metric.value}
                  {metric.unit && <span className="text-2xl text-softgray/40">{metric.unit}</span>}
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <span className="text-blue-400">{metric.change}</span>
                <span className="text-softgray/50">{metric.trend}</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Brand Visibility Section - 32px spacing */}
      <div className="bg-[#101C2C] rounded-lg p-8 border border-white/5 mb-8" style={{ boxShadow: '0 0 4px rgba(0, 0, 0, 0.06)' }}>
        <div className="mb-6">
          <h2 className="text-2xl font-heading font-bold text-white mb-2">
            Brand Visibility
          </h2>
          <p className="text-sm text-softgray/60">
            Percentage of AI answers about business credit cards that mention your brand
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8">
          {/* Chart - Left Column */}
          <div>
            <div className="mb-4">
              <div className="text-sm text-softgray/60 uppercase tracking-wider mb-2">
                VISIBILITY SCORE
              </div>
              <div className="flex items-baseline gap-3">
                <div className="text-5xl font-heading font-bold text-white tabular-nums">
                  {scanData?.brand_visibility || 89.8}%
                </div>
                <div className="text-lg text-blue-400">+1% vs last week</div>
              </div>
            </div>
            
            {/* Scanning Grid Pattern Chart Placeholder */}
            <div 
              className="h-48 rounded-lg border border-white/5 flex items-center justify-center relative overflow-hidden"
              style={{
                background: `
                  repeating-linear-gradient(
                    45deg,
                    rgba(255,255,255,0.03) 0,
                    rgba(255,255,255,0.03) 2px,
                    transparent 2px,
                    transparent 4px
                  ),
                  #0B1521
                `
              }}
            >
              <div className="text-softgray/40 text-sm">Chart visualization</div>
            </div>
            
            <button className="mt-4 px-4 py-2 bg-blue-600/20 text-blue-400 rounded-lg text-sm border border-blue-600/30 hover:bg-blue-600/30 transition-colors cursor-pointer">
              Compare to Industry
            </button>
          </div>

          {/* Vertical Divider */}
          <div className="relative">
            <div className="absolute left-0 top-0 bottom-0 w-px bg-white/5"></div>
            
            {/* Competitor Ranking - Right Column */}
            <div className="pl-8">
              <div className="text-sm text-softgray/60 uppercase tracking-wider mb-4">
                BRAND INDUSTRY RANKING
              </div>
              
              <div className="space-y-0">
                {competitors.map((comp, index) => (
                  <div 
                    key={comp.rank} 
                    className={`
                      flex items-center gap-4 p-4 rounded-lg
                      ${comp.isYou 
                        ? 'bg-[rgba(41,121,255,0.05)] border border-blue-500/30' 
                        : index % 2 === 0 ? 'bg-white/[0.02]' : 'bg-transparent'
                      }
                    `}
                  >
                    <div className="text-lg font-heading font-bold text-softgray/60 w-6 tabular-nums">
                      {comp.rank}
                    </div>
                    
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-8 h-8 bg-white/10 rounded flex items-center justify-center">
                        <span className="text-xs font-bold text-white">
                          {comp.name.substring(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="text-white font-medium text-sm">
                          {comp.name}
                        </div>
                      </div>
                    </div>
                    
                    <div className={`text-sm ${comp.change.startsWith('+') ? 'text-blue-400' : 'text-red-400'}`}>
                      {comp.change}
                    </div>
                    
                    <div className="text-white font-heading font-bold text-lg tabular-nums w-16 text-right">
                      {comp.score}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Next Best Actions - 32px spacing */}
      <div>
        <h2 className="text-2xl font-heading font-bold text-white mb-6">
          Next Best Actions
        </h2>
        
        <div className="grid grid-cols-3 gap-6">
          {actions.map((action, index) => {
            const Icon = action.icon
            return (
              <div 
                key={index} 
                className="bg-[#101C2C] rounded-lg p-6 border border-white/5 hover:border-white/10 transition-colors cursor-pointer"
                style={{ boxShadow: '0 0 4px rgba(0, 0, 0, 0.06)' }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-2 bg-white/5 rounded-lg">
                    <Icon className="w-5 h-5 text-blue-400" strokeWidth={1.5} />
                  </div>
                  <div className="text-sm text-blue-400">
                    {action.potential || action.growth || action.issues}
                  </div>
                </div>
                
                <h3 className="text-lg font-heading font-semibold text-white mb-2">
                  {action.title}
                </h3>
                
                <p className="text-sm text-softgray/60 mb-4 leading-relaxed">
                  {action.description}
                </p>
                
                <button className="text-blue-400 text-sm hover:underline cursor-pointer">
                  {action.link} →
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}