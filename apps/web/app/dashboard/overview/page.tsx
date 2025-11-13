// apps/web/app/dashboard/overview/page.tsx

'use client'

import { useEffect, useState } from 'react'
import { LayoutDashboard, TrendingUp, Activity, RefreshCw, Calendar } from 'lucide-react'
import Link from 'next/link'

interface ScanData {
  overall_score: number
  shopping_visibility: number
  brand_visibility: number
  conversation_volume: number
  website_readability: number
  last_scan: string | null
  total_mentions: number
  positive_sentiment: number
  active_questions: number
}

export default function OverviewPage() {
  const [scanData, setScanData] = useState<ScanData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchLatestScan() {
      try {
        const response = await fetch('/api/scan/latest')
        
        if (!response.ok) {
          throw new Error('Failed to fetch scan data')
        }
        
        const data = await response.json()
        setScanData(data)
      } catch (error) {
        console.error('Error fetching scan:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchLatestScan()
  }, [])

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No recent scan'
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return 'No recent scan'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-softgray/60 font-body text-sm">Loading intelligence data...</div>
      </div>
    )
  }

  if (!scanData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-softgray/60 font-body text-sm">No scan data available</div>
      </div>
    )
  }

  const modules = [
    {
      name: 'Shopping Visibility',
      score: scanData.shopping_visibility,
      href: '/dashboard/shopping',
      description: 'Product mentions across AI responses',
      metric: `${scanData.total_mentions} mentions`,
    },
    {
      name: 'Brand Visibility',
      score: scanData.brand_visibility,
      href: '/dashboard/brand',
      description: 'How AI perceives your brand identity',
      metric: `${scanData.positive_sentiment}% positive`,
    },
    {
      name: 'Conversation Volumes',
      score: scanData.conversation_volume,
      href: '/dashboard/conversations',
      description: 'Questions users ask AI about you',
      metric: `${scanData.active_questions} questions`,
    },
    {
      name: 'Website Analytics',
      score: scanData.website_readability,
      href: '/dashboard/website',
      description: 'How readable your site is to AI models',
      metric: 'Schema coverage',
    }
  ]

  return (
    <div className="stagger-children">
      {/* Page Header - Consistent Padding */}
      <div className="page-header pt-6 pb-5 px-7 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <LayoutDashboard className="w-6 h-6 text-accent" strokeWidth={1.5} />
              <h1 className="text-3xl font-heading font-bold text-white tracking-tight">
                Intelligence Overview
              </h1>
            </div>
            <p className="text-softgray/70 text-sm font-body mt-2">
              How AI models understand and represent your brand
            </p>
          </div>
          
          {/* Run Scan - Top Right */}
          <button className="flex items-center gap-2 px-4 py-2.5 bg-accent/10 hover:bg-accent/20 border border-accent/30 rounded-lg transition-all text-accent font-body text-sm font-medium">
            <RefreshCw className="w-4 h-4" strokeWidth={2} />
            Run Fresh Scan
          </button>
        </div>
        
        <div className="flex items-center gap-2 mt-4 text-softgray/50 text-xs font-body">
          <Calendar className="w-3.5 h-3.5" strokeWidth={1.5} />
          Last scan: {formatDate(scanData.last_scan)}
        </div>
      </div>

      {/* Hero Card - Overall Visibility Score - NO HOVER */}
      <div className="card-L2 p-8 mb-10 relative overflow-hidden" style={{ minHeight: '200px' }}>
        <div className="relative">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-accent" strokeWidth={1.5} />
            <h2 className="text-sm font-heading font-semibold text-softgray/60 uppercase tracking-wider">
              Overall Visibility
            </h2>
          </div>
          
          <div className="flex items-baseline gap-4 mb-3">
            <div className="text-7xl font-heading font-bold text-white tabular-nums">
              {scanData.overall_score}
              <span className="text-3xl text-softgray/40 ml-1">%</span>
            </div>
            <div className="delta-positive text-2xl font-heading tabular-nums">
              +2.3%
            </div>
          </div>
          
          <p className="text-softgray/60 text-sm font-body max-w-2xl">
            Your aggregate presence across generative AI responses
          </p>
        </div>
      </div>

      {/* Quick Stats Row - NO HOVER */}
      <div className="grid grid-cols-3 gap-6 mb-10">
        <div className="card-L2 p-6">
          <div className="flex items-center gap-2 mb-2 text-softgray/60">
            <TrendingUp className="w-4 h-4" strokeWidth={1.5} />
            <div className="text-xs font-body uppercase tracking-wide">
              Total Mentions
            </div>
          </div>
          <div className="text-4xl font-heading font-bold text-white tabular-nums">
            {scanData.total_mentions}
          </div>
          <div className="delta-positive text-sm mt-1.5 font-body">
            +12 this week
          </div>
        </div>

        <div className="card-L2 p-6">
          <div className="flex items-center gap-2 mb-2 text-softgray/60">
            <Activity className="w-4 h-4" strokeWidth={1.5} />
            <div className="text-xs font-body uppercase tracking-wide">
              Positive Sentiment
            </div>
          </div>
          <div className="text-4xl font-heading font-bold text-white tabular-nums">
            {scanData.positive_sentiment}
            <span className="text-xl text-softgray/40">%</span>
          </div>
          <div className="delta-positive text-sm mt-1.5 font-body">
            +3.2%
          </div>
        </div>

        <div className="card-L2 p-6">
          <div className="flex items-center gap-2 mb-2 text-softgray/60">
            <Activity className="w-4 h-4" strokeWidth={1.5} />
            <div className="text-xs font-body uppercase tracking-wide">
              Active Questions
            </div>
          </div>
          <div className="text-4xl font-heading font-bold text-white tabular-nums">
            {scanData.active_questions}
          </div>
          <div className="delta-neutral text-sm mt-1.5 font-body">
            Stable
          </div>
        </div>
      </div>

      {/* Module Cards Grid - INTERACTIVE */}
      <div className="grid grid-cols-2 gap-6">
        {modules.map((module, index) => (
          <Link 
            key={module.name} 
            href={module.href}
            className="card-L2 p-6 cursor-pointer group transition-all duration-100"
            style={{ animationDelay: `${(index + 4) * 100}ms` }}
            data-interactive="true"
          >
            <div className="flex items-start justify-between mb-5">
              <div>
                <h3 className="text-lg font-heading font-semibold text-white group-hover:text-accent transition-colors mb-2">
                  {module.name}
                </h3>
                <p className="text-sm text-softgray/60 font-body">
                  {module.description}
                </p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-heading font-bold text-white tabular-nums">
                  {module.score}
                  <span className="text-xl text-softgray/40">%</span>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="progress-bar mb-4">
              <div 
                className="progress-bar-fill"
                style={{ width: `${module.score}%` }}
              ></div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-softgray/60 font-body">{module.metric}</span>
              <span className="text-accent group-hover:underline font-body text-sm">
                View details →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}