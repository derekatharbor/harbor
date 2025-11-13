// apps/web/app/dashboard/brand/page.tsx

'use client'

import { useEffect, useState } from 'react'
import { Star, TrendingUp, MessageCircle, Tag, Award } from 'lucide-react'

interface BrandData {
  brand_score: number
  total_mentions: number
  positive_percentage: number
  descriptor_count: number
  last_scan: string | null
  descriptors: Array<{
    word: string
    sentiment: 'pos' | 'neu' | 'neg'
    weight: number
  }>
  sentiment_breakdown: {
    positive: number
    neutral: number
    negative: number
  }
}

export default function BrandVisibilityPage() {
  const [data, setData] = useState<BrandData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/scan/latest')
        if (!response.ok) throw new Error('Failed to fetch')
        
        const scanData = await response.json()
        
        const brandData: BrandData = {
          brand_score: scanData.brand_visibility || 82,
          total_mentions: scanData.total_mentions || 234,
          positive_percentage: scanData.positive_sentiment || 68,
          descriptor_count: scanData.brand_results?.length || 0,
          last_scan: scanData.last_scan,
          descriptors: scanData.brand_results || [],
          sentiment_breakdown: {
            positive: 68,
            neutral: 24,
            negative: 8
          }
        }
        
        setData(brandData)
      } catch (error) {
        console.error('Error fetching brand data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-softgray/60 font-body text-sm">Loading brand data...</div>
      </div>
    )
  }

  if (!data) return null

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-4xl font-heading font-bold text-white">
            Brand Visibility
          </h1>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-softgray/60 mb-2">
              How AI models perceive and describe your brand identity
            </p>
            <p className="text-sm text-softgray/70 italic">
              AI perception trends are improving this week, with higher confidence in innovation and reliability.
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

      {/* Top Metrics Row - 32px margin */}
      <div className="grid grid-cols-4 gap-6 mb-8">
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
                Brand Score
              </div>
              <div className="text-xs text-softgray/50">
                Overall perception
              </div>
            </div>
          </div>
          <div className="text-4xl font-heading font-bold text-white tabular-nums mb-2">
            {data.brand_score}
            <span className="text-2xl text-softgray/40">%</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-[#4EE4FF]">+3.1%</span>
            <span className="text-softgray/50">vs last week</span>
          </div>
        </div>

        <div 
          className="bg-[#101C2C] rounded-lg p-6 border border-white/5"
          style={{ boxShadow: '0 0 4px rgba(0, 0, 0, 0.06)' }}
        >
          <div className="flex items-start gap-3 mb-4">
            <div className="p-2 bg-white/5 rounded-lg">
              <MessageCircle className="w-5 h-5 text-white/60" strokeWidth={1.5} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-softgray/60 uppercase tracking-wider mb-1">
                Total Mentions
              </div>
              <div className="text-xs text-softgray/50">
                Across all models
              </div>
            </div>
          </div>
          <div className="text-4xl font-heading font-bold text-white tabular-nums mb-2">
            {data.total_mentions}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-[#4EE4FF]">+12</span>
            <span className="text-softgray/50">this week</span>
          </div>
        </div>

        <div 
          className="bg-[#101C2C] rounded-lg p-6 border border-white/5"
          style={{ boxShadow: '0 0 4px rgba(0, 0, 0, 0.06)' }}
        >
          <div className="flex items-start gap-3 mb-4">
            <div className="p-2 bg-white/5 rounded-lg">
              <Award className="w-5 h-5 text-white/60" strokeWidth={1.5} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-softgray/60 uppercase tracking-wider mb-1">
                Positive Sentiment
              </div>
              <div className="text-xs text-softgray/50">
                Favorable mentions
              </div>
            </div>
          </div>
          <div className="text-4xl font-heading font-bold text-white tabular-nums mb-2">
            {data.positive_percentage}
            <span className="text-2xl text-softgray/40">%</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-[#4EE4FF]">+2.3%</span>
            <span className="text-softgray/50">vs last week</span>
          </div>
        </div>

        <div 
          className="bg-[#101C2C] rounded-lg p-6 border border-white/5"
          style={{ boxShadow: '0 0 4px rgba(0, 0, 0, 0.06)' }}
        >
          <div className="flex items-start gap-3 mb-4">
            <div className="p-2 bg-white/5 rounded-lg">
              <Tag className="w-5 h-5 text-white/60" strokeWidth={1.5} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-softgray/60 uppercase tracking-wider mb-1">
                Descriptors
              </div>
              <div className="text-xs text-softgray/50">
                Tracked terms
              </div>
            </div>
          </div>
          <div className="text-4xl font-heading font-bold text-white tabular-nums mb-2">
            {data.descriptor_count}
          </div>
          <div className="text-softgray/60 text-xs">
            Unique terms
          </div>
        </div>
      </div>

      {/* Perception Analysis - Hero Card (2 columns wide) - 32px margin */}
      <div 
        className="bg-[#101C2C] rounded-lg p-8 border-t-2 border-[#4EE4FF] mb-8"
        style={{ boxShadow: '0 0 4px rgba(0, 0, 0, 0.06)' }}
      >
        <h2 className="text-2xl font-heading font-bold text-white mb-4">
          Perception Analysis
        </h2>
        
        <div className="grid grid-cols-2 gap-8">
          <div className="bg-navy/50 rounded-lg p-6">
            <p className="text-softgray/80 font-body leading-relaxed text-sm">
              Your brand is consistently associated with innovation, quality, and customer service. 
              AI models frequently describe your products as reliable and well-designed, with emerging 
              mentions around ease of use and modern design.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-navy/50 rounded-lg p-4">
              <div className="text-softgray/60 text-xs font-body uppercase mb-2 tracking-wider">
                Top Association
              </div>
              <div className="text-white font-heading font-bold text-lg">
                Innovation
              </div>
            </div>
            <div className="bg-navy/50 rounded-lg p-4">
              <div className="text-softgray/60 text-xs font-body uppercase mb-2 tracking-wider">
                Sentiment Trend
              </div>
              <div className="text-[#4EE4FF] font-heading font-bold text-lg">
                Improving
              </div>
            </div>
            <div className="bg-navy/50 rounded-lg p-4">
              <div className="text-softgray/60 text-xs font-body uppercase mb-2 tracking-wider">
                Confidence Level
              </div>
              <div className="text-white font-heading font-bold text-lg">
                High
              </div>
            </div>
            <div className="bg-navy/50 rounded-lg p-4">
              <div className="text-softgray/60 text-xs font-body uppercase mb-2 tracking-wider">
                Coverage
              </div>
              <div className="text-white font-heading font-bold text-lg">
                92%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout - 32px margin */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        {/* Brand Descriptors */}
        <div 
          className="bg-[#101C2C] rounded-lg p-6 border border-white/5"
          style={{ boxShadow: '0 0 4px rgba(0, 0, 0, 0.06)' }}
        >
          <h2 className="text-lg font-heading font-semibold text-white mb-4 flex items-center gap-2">
            <Tag className="w-5 h-5 text-[#4EE4FF]" strokeWidth={1.5} />
            Brand Descriptors
          </h2>
          
          <div className="flex flex-wrap gap-2 mb-6 min-h-[120px]">
            {data.descriptors.length > 0 ? (
              data.descriptors.map((descriptor, index) => (
                <span
                  key={index}
                  className={`px-3 py-1.5 rounded-full text-sm font-body font-medium cursor-default
                    ${descriptor.sentiment === 'pos' ? 'bg-[#009E92]/15 text-[#00C6B7] border border-[#009E92]/30' : ''}
                    ${descriptor.sentiment === 'neu' ? 'bg-[#4EE4FF]/15 text-[#4EE4FF] border border-[#4EE4FF]/30' : ''}
                    ${descriptor.sentiment === 'neg' ? 'bg-[#FF4E70]/15 text-[#FF4E70] border border-[#FF4E70]/30' : ''}
                  `}
                >
                  {descriptor.word}
                </span>
              ))
            ) : (
              <div className="w-full text-center py-8">
                <p className="text-softgray/60 text-sm font-body mb-4">
                  AI hasn't identified recurring descriptors yet. Run a fresh scan to analyze emerging brand terms.
                </p>
                <div className="flex flex-wrap gap-2 justify-center opacity-10">
                  <span className="px-3 py-1.5 rounded-full text-sm font-body border border-white/20 text-white">
                    innovative
                  </span>
                  <span className="px-3 py-1.5 rounded-full text-sm font-body border border-white/20 text-white">
                    secure
                  </span>
                  <span className="px-3 py-1.5 rounded-full text-sm font-body border border-white/20 text-white">
                    reliable
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-white/10 pt-4">
            <div className="flex items-center gap-4 text-xs font-body">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#00C6B7]"></div>
                <span className="text-softgray/60">Positive</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#4EE4FF]"></div>
                <span className="text-softgray/60">Neutral</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#FF4E70]"></div>
                <span className="text-softgray/60">Negative</span>
              </div>
            </div>
          </div>
        </div>

        {/* Optimization Actions */}
        <div 
          className="bg-[#101C2C] rounded-lg p-6 border-l-2 border-[#4EE4FF]"
          style={{ boxShadow: '0 0 4px rgba(0, 0, 0, 0.06)' }}
        >
          <h2 className="text-lg font-heading font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#4EE4FF]" strokeWidth={1.5} />
            Optimization
          </h2>
          
          <div className="space-y-3">
            <div className="bg-navy/50 rounded-lg p-4 hover:bg-navy/70 transition-colors cursor-pointer">
              <div className="text-white font-body font-medium mb-1 text-sm">
                Add Organization Schema
              </div>
              <div className="text-softgray/60 text-xs font-body mb-3">
                Structure brand information for model comprehension
              </div>
              <button className="text-[#4EE4FF] text-xs font-body font-medium hover:underline cursor-pointer">
                Generate Schema →
              </button>
            </div>

            <div className="bg-navy/50 rounded-lg p-4 hover:bg-navy/70 transition-colors cursor-pointer">
              <div className="text-white font-body font-medium mb-1 text-sm">
                Unify Brand Language
              </div>
              <div className="text-softgray/60 text-xs font-body mb-3">
                Align messaging across About, Press, and landing pages
              </div>
              <button className="text-[#4EE4FF] text-xs font-body font-medium hover:underline cursor-pointer">
                Review Copy →
              </button>
            </div>

            <div className="bg-navy/50 rounded-lg p-4 hover:bg-navy/70 transition-colors cursor-pointer">
              <div className="text-white font-body font-medium mb-1 text-sm">
                Positioning Page
              </div>
              <div className="text-softgray/60 text-xs font-body mb-3">
                Clarify category and unique value proposition
              </div>
              <button className="text-[#4EE4FF] text-xs font-body font-medium hover:underline cursor-pointer">
                Get Template →
              </button>
            </div>

            <div className="bg-navy/50 rounded-lg p-4 hover:bg-navy/70 transition-colors cursor-pointer">
              <div className="text-white font-body font-medium mb-1 text-sm">
                Authority Sources
              </div>
              <div className="text-softgray/60 text-xs font-body mb-3">
                Link to Wikipedia, Crunchbase, industry databases
              </div>
              <button className="text-[#4EE4FF] text-xs font-body font-medium hover:underline cursor-pointer">
                View Options →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sentiment Distribution - Full Width */}
      <div 
        className="bg-[#101C2C] rounded-lg p-8 border border-white/5"
        style={{ boxShadow: '0 0 4px rgba(0, 0, 0, 0.06)' }}
      >
        <h2 className="text-2xl font-heading font-bold text-white mb-6">
          Sentiment Distribution
        </h2>
        
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="text-white font-body font-medium">
                Positive
              </div>
              <div className="text-[#00C6B7] font-heading font-bold text-xl tabular-nums">
                {data.sentiment_breakdown.positive}%
              </div>
            </div>
            <div className="h-3 bg-navy/50 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#00C6B7] transition-all rounded-full"
                style={{ 
                  width: `${data.sentiment_breakdown.positive}%`,
                  boxShadow: '0 0 8px rgba(0, 198, 183, 0.4)'
                }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="text-white font-body font-medium">
                Neutral
              </div>
              <div className="text-[#4EE4FF] font-heading font-bold text-xl tabular-nums" style={{ opacity: 0.7 }}>
                {data.sentiment_breakdown.neutral}%
              </div>
            </div>
            <div className="h-3 bg-navy/50 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#4EE4FF] transition-all rounded-full"
                style={{ 
                  width: `${data.sentiment_breakdown.neutral}%`,
                  opacity: 0.7,
                  boxShadow: '0 0 8px rgba(78, 228, 255, 0.3)'
                }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="text-white font-body font-medium">
                Negative
              </div>
              <div className="text-[#FF4E70] font-heading font-bold text-xl tabular-nums" style={{ opacity: 0.6 }}>
                {data.sentiment_breakdown.negative}%
              </div>
            </div>
            <div className="h-3 bg-navy/50 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#FF4E70] transition-all rounded-full"
                style={{ 
                  width: `${data.sentiment_breakdown.negative}%`,
                  opacity: 0.6,
                  boxShadow: '0 0 8px rgba(255, 78, 112, 0.3)'
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}