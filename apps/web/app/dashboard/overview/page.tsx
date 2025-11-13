'use client'

import { useEffect, useState } from 'react'
import { LayoutDashboard, TrendingUp, Activity, Zap } from 'lucide-react'
import Link from 'next/link'

interface ScanData {
  overall_score: number
  shopping_visibility: number
  brand_visibility: number
  conversation_volume: number
  website_readability: number
  last_scan: string
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-softgray/60 font-body">Loading scan data...</div>
      </div>
    )
  }

  if (!scanData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-softgray/60 font-body">No scan data available</div>
      </div>
    )
  }

  const modules = [
    {
      name: 'Shopping Visibility',
      score: scanData.shopping_visibility,
      href: '/dashboard/shopping',
      icon: '🛍️',
      description: 'Product mentions & rankings',
      metric: `${scanData.total_mentions} mentions`,
      color: 'aqua'
    },
    {
      name: 'Brand Visibility',
      score: scanData.brand_visibility,
      href: '/dashboard/brand',
      icon: '⭐',
      description: 'Brand perception & sentiment',
      metric: `${scanData.positive_sentiment}% positive`,
      color: 'periwinkle'
    },
    {
      name: 'Conversation Volumes',
      score: scanData.conversation_volume,
      href: '/dashboard/conversations',
      icon: '💬',
      description: 'Questions & intent analysis',
      metric: `${scanData.active_questions} questions`,
      color: 'indigo'
    },
    {
      name: 'Website Analytics',
      score: scanData.website_readability,
      href: '/dashboard/website',
      icon: '🌐',
      description: 'AI readability & structure',
      metric: 'Schema coverage',
      color: 'cyan'
    }
  ]

  return (
    <div className="stagger-children">
      {/* Page Header with Accent Line */}
      <div className="mb-8 page-header pt-8">
        <div className="flex items-center gap-3 mb-3">
          <LayoutDashboard className="w-8 h-8 text-accent" />
          <h1 className="text-3xl font-heading font-bold text-white">
            Intelligence Overview
          </h1>
        </div>
        <p className="text-softgray/70 text-sm font-body mb-2">
          How AI sees your brand across all channels
        </p>
        <p className="text-softgray/50 text-xs font-body">
          Last scan: {new Date(scanData.last_scan).toLocaleString()}
        </p>
      </div>

      {/* Overall Visibility Score - Hero Card */}
      <div className="card-L2 card-fade-in p-8 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl"></div>
        <div className="relative">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-accent" />
            <h2 className="text-lg font-heading font-semibold text-white">
              Overall Visibility Score
            </h2>
          </div>
          <div className="flex items-baseline gap-4">
            <div className="text-6xl font-heading font-bold text-white">
              {scanData.overall_score}
              <span className="text-2xl text-softgray/40">%</span>
            </div>
            <div className="delta-positive text-xl">
              +2.3%
            </div>
          </div>
          <p className="text-softgray/60 text-sm font-body mt-4">
            Your brand's aggregate presence in AI-generated answers
          </p>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="card-L2 card-fade-in p-6">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-accent" />
            <div className="text-xs text-softgray/60 font-body uppercase">
              Total Mentions
            </div>
          </div>
          <div className="text-3xl font-heading font-bold text-white">
            {scanData.total_mentions}
          </div>
          <div className="delta-positive text-sm mt-1">
            +12 this week
          </div>
        </div>

        <div className="card-L2 card-fade-in p-6">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-accent" />
            <div className="text-xs text-softgray/60 font-body uppercase">
              Positive Sentiment
            </div>
          </div>
          <div className="text-3xl font-heading font-bold text-white">
            {scanData.positive_sentiment}%
          </div>
          <div className="delta-positive text-sm mt-1">
            +3.2%
          </div>
        </div>

        <div className="card-L2 card-fade-in p-6">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-accent" />
            <div className="text-xs text-softgray/60 font-body uppercase">
              Active Questions
            </div>
          </div>
          <div className="text-3xl font-heading font-bold text-white">
            {scanData.active_questions}
          </div>
          <div className="delta-neutral text-sm mt-1">
            Stable
          </div>
        </div>
      </div>

      {/* Module Cards Grid */}
      <div className="grid grid-cols-2 gap-6">
        {modules.map((module, index) => (
          <Link 
            key={module.name} 
            href={module.href}
            className="card-L2 card-fade-in p-6 hover:card-L3 cursor-pointer group"
            style={{ animationDelay: `${(index + 4) * 100}ms` }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-3xl">{module.icon}</div>
                <div>
                  <h3 className="text-lg font-heading font-semibold text-white group-hover:text-accent transition-colors">
                    {module.name}
                  </h3>
                  <p className="text-sm text-softgray/60 font-body mt-1">
                    {module.description}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-heading font-bold text-white">
                  {module.score}
                  <span className="text-lg text-softgray/40">%</span>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="progress-bar mb-3">
              <div 
                className="progress-bar-fill"
                style={{ width: `${module.score}%` }}
              ></div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-softgray/60 font-body">{module.metric}</span>
              <span className="text-accent group-hover:underline font-body">
                View details →
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Bottom Action */}
      <div className="card-L2 card-fade-in p-6 mt-8 text-center" style={{ animationDelay: '800ms' }}>
        <p className="text-softgray/70 font-body mb-4">
          Last full scan: {new Date(scanData.last_scan).toLocaleDateString()}
        </p>
        <button className="btn-primary">
          Run Fresh Scan
        </button>
      </div>
    </div>
  )
}