// apps/web/app/dashboard/brand/page.tsx

'use client'

import { useEffect, useState } from 'react'
import { TrendingUp, MessageCircle, Tag, Award, RefreshCw, Calendar } from 'lucide-react'

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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No recent scan'
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    } catch {
      return 'No recent scan'
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
    <div className="stagger-children">
      {/* Page Header - Consistent Padding */}
      <div className="page-header pt-6 pb-5 px-7 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Award className="w-6 h-6 text-accent" strokeWidth={1.5} />
              <h1 className="text-3xl font-heading font-bold text-white tracking-tight">
                Brand Visibility
              </h1>
            </div>
            <p className="text-softgray/70 text-sm font-body mt-2">
              How AI models perceive and describe your brand identity
            </p>
          </div>
          
          <button className="flex items-center gap-2 px-4 py-2.5 bg-accent/10 hover:bg-accent/20 border border-accent/30 rounded-lg transition-all text-accent font-body text-sm font-medium">
            <RefreshCw className="w-4 h-4" strokeWidth={2} />
            Run Fresh Scan
          </button>
        </div>
        
        <div className="flex items-center gap-2 mt-4 text-softgray/50 text-xs font-body">
          <Calendar className="w-3.5 h-3.5" strokeWidth={1.5} />
          Last scan: {formatDate(data.last_scan)}
        </div>
      </div>

      {/* Score Cards Row */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="card-L2 p-5">
          <div className="flex items-center gap-2 mb-2 text-softgray/60">
            <TrendingUp className="w-4 h-4" strokeWidth={1.5} />
            <div className="text-xs font-body uppercase tracking-wide">
              Brand Score
            </div>
          </div>
          <div className="text-4xl font-heading font-bold text-white tabular-nums">
            {data.brand_score}
            <span className="text-xl text-softgray/40">%</span>
          </div>
          <div className="delta-positive text-sm mt-2 font-body" style={{ textShadow: '0 0 8px rgba(var(--pageAccent-rgb), 0.5)' }}>
            +3.1%
          </div>
        </div>

        <div className="card-L2 p-5">
          <div className="flex items-center gap-2 mb-2 text-softgray/60">
            <MessageCircle className="w-4 h-4" strokeWidth={1.5} />
            <div className="text-xs font-body uppercase tracking-wide">
              Total Mentions
            </div>
          </div>
          <div className="text-4xl font-heading font-bold text-white tabular-nums">
            {data.total_mentions}
          </div>
          <div className="delta-positive text-sm mt-2 font-body">
            +12 this week
          </div>
        </div>

        <div className="card-L2 p-5">
          <div className="flex items-center gap-2 mb-2 text-softgray/60">
            <Award className="w-4 h-4" strokeWidth={1.5} />
            <div className="text-xs font-body uppercase tracking-wide">
              Positive Sentiment
            </div>
          </div>
          <div className="text-4xl font-heading font-bold text-white tabular-nums">
            {data.positive_percentage}
            <span className="text-xl text-softgray/40">%</span>
          </div>
          <div className="delta-positive text-sm mt-2 font-body">
            +2.3%
          </div>
        </div>

        <div className="card-L2 p-5">
          <div className="flex items-center gap-2 mb-2 text-softgray/60">
            <Tag className="w-4 h-4" strokeWidth={1.5} />
            <div className="text-xs font-body uppercase tracking-wide">
              Descriptors
            </div>
          </div>
          <div className="text-4xl font-heading font-bold text-white tabular-nums">
            {data.descriptor_count}
          </div>
          <div className="text-softgray/60 text-xs mt-2 font-body">
            Tracked terms
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Descriptor Cloud */}
          <div className="card-L2 p-6">
            <h2 className="text-base font-heading font-semibold text-white mb-4 flex items-center gap-2 uppercase tracking-wide text-softgray/80">
              <Tag className="w-5 h-5 text-accent" strokeWidth={1.5} />
              Brand Descriptors
            </h2>
            
            <div className="flex flex-wrap gap-2 mb-6">
              {data.descriptors.length > 0 ? (
                data.descriptors.map((descriptor, index) => (
                  <span
                    key={index}
                    className={`px-3 py-1.5 rounded-full text-sm font-body font-medium sentiment-${descriptor.sentiment}`}
                  >
                    {descriptor.word}
                  </span>
                ))
              ) : (
                <div className="text-softgray/60 text-sm font-body text-center w-full py-8">
                  No descriptors yet — data updates after next scan
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

          {/* Sentiment Breakdown */}
          <div className="card-L2 p-6">
            <h2 className="text-base font-heading font-semibold text-white mb-4 flex items-center gap-2 uppercase tracking-wide text-softgray/80">
              <TrendingUp className="w-5 h-5 text-accent" strokeWidth={1.5} />
              Sentiment Distribution
            </h2>
            
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-white font-body font-medium text-sm">
                    Positive
                  </div>
                  <div className="text-[#00C6B7] font-heading font-bold tabular-nums">
                    {data.sentiment_breakdown.positive}%
                  </div>
                </div>
                <div className="h-2 bg-navy-lighter rounded-full overflow-hidden">
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
                <div className="flex items-center justify-between mb-2">
                  <div className="text-white font-body font-medium text-sm">
                    Neutral
                  </div>
                  <div className="text-[#4EE4FF] font-heading font-bold tabular-nums">
                    {data.sentiment_breakdown.neutral}%
                  </div>
                </div>
                <div className="h-2 bg-navy-lighter rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#4EE4FF] transition-all rounded-full"
                    style={{ 
                      width: `${data.sentiment_breakdown.neutral}%`,
                      boxShadow: '0 0 8px rgba(78, 228, 255, 0.4)'
                    }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-white font-body font-medium text-sm">
                    Negative
                  </div>
                  <div className="text-[#FF4E70] font-heading font-bold tabular-nums">
                    {data.sentiment_breakdown.negative}%
                  </div>
                </div>
                <div className="h-2 bg-navy-lighter rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#FF4E70] transition-all rounded-full"
                    style={{ 
                      width: `${data.sentiment_breakdown.negative}%`,
                      boxShadow: '0 0 8px rgba(255, 78, 112, 0.4)'
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Brand Analysis */}
          <div className="card-L2 p-6">
            <h2 className="text-base font-heading font-semibold text-white mb-4 flex items-center gap-2 uppercase tracking-wide text-softgray/80">
              <Award className="w-5 h-5 text-accent" strokeWidth={1.5} />
              Perception Analysis
            </h2>
            
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-navy-lighter/50">
                <div className="text-softgray/80 font-body leading-relaxed text-sm">
                  Your brand is consistently associated with innovation, quality, and customer service. 
                  AI models frequently describe your products as reliable and well-designed.
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-navy-lighter/50">
                  <div className="text-softgray/60 text-xs font-body uppercase mb-1 tracking-wide">
                    Top Association
                  </div>
                  <div className="text-white font-body font-bold">
                    Innovation
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-navy-lighter/50">
                  <div className="text-softgray/60 text-xs font-body uppercase mb-1 tracking-wide">
                    Sentiment Trend
                  </div>
                  <div className="text-accent font-body font-bold">
                    Improving
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Optimize Actions */}
          <div className="card-L2 p-6 border-l-2 border-accent">
            <h2 className="text-base font-heading font-semibold text-white mb-4 flex items-center gap-2 uppercase tracking-wide text-softgray/80">
              <TrendingUp className="w-5 h-5 text-accent" strokeWidth={1.5} />
              Optimization
            </h2>
            
            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-navy-lighter/50 hover:bg-navy-lighter cursor-pointer transition-colors">
                <div className="text-white font-body font-medium mb-1 text-sm">
                  Add Organization Schema
                </div>
                <div className="text-softgray/60 text-xs font-body mb-3">
                  Structure brand information for model comprehension
                </div>
                <button className="text-accent text-xs font-body font-medium hover:underline">
                  Generate Schema →
                </button>
              </div>

              <div className="p-4 rounded-lg bg-navy-lighter/50 hover:bg-navy-lighter cursor-pointer transition-colors">
                <div className="text-white font-body font-medium mb-1 text-sm">
                  Unify Brand Language
                </div>
                <div className="text-softgray/60 text-xs font-body mb-3">
                  Align messaging across About, Press, and landing pages
                </div>
                <button className="text-accent text-xs font-body font-medium hover:underline">
                  Review Copy →
                </button>
              </div>

              <div className="p-4 rounded-lg bg-navy-lighter/50 hover:bg-navy-lighter cursor-pointer transition-colors">
                <div className="text-white font-body font-medium mb-1 text-sm">
                  Positioning Page
                </div>
                <div className="text-softgray/60 text-xs font-body mb-3">
                  Clarify category and unique value proposition
                </div>
                <button className="text-accent text-xs font-body font-medium hover:underline">
                  Get Template →
                </button>
              </div>

              <div className="p-4 rounded-lg bg-navy-lighter/50 hover:bg-navy-lighter cursor-pointer transition-colors">
                <div className="text-white font-body font-medium mb-1 text-sm">
                  Authority Sources
                </div>
                <div className="text-softgray/60 text-xs font-body mb-3">
                  Link to Wikipedia, Crunchbase, industry databases
                </div>
                <button className="text-accent text-xs font-body font-medium hover:underline">
                  View Options →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}