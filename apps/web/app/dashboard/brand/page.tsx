'use client'

import { useEffect, useState } from 'react'
import { TrendingUp, MessageCircle, Tag, Award } from 'lucide-react'

interface BrandData {
  brand_score: number
  total_mentions: number
  positive_percentage: number
  descriptor_count: number
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
        
        // Map scan data to brand format
        const brandData: BrandData = {
          brand_score: scanData.brand_visibility || 82,
          total_mentions: scanData.total_mentions || 234,
          positive_percentage: scanData.positive_sentiment || 68,
          descriptor_count: scanData.brand_results?.length || 0,
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-softgray/60 font-body">Loading brand data...</div>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="stagger-children">
      {/* Page Header with Accent Line (Periwinkle) */}
      <div className="mb-8 page-header pt-8">
        <div className="flex items-center gap-3 mb-3">
          <Award className="w-8 h-8 text-accent" />
          <h1 className="text-3xl font-heading font-bold text-white">
            Brand Visibility
          </h1>
        </div>
        <p className="text-softgray/70 text-sm font-body">
          How AI describes and perceives your brand
        </p>
      </div>

      {/* Score Cards Row */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="card-L2 card-fade-in p-6">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-accent" />
            <div className="text-xs text-softgray/60 font-body uppercase">
              Brand Score
            </div>
          </div>
          <div className="text-4xl font-heading font-bold text-white">
            {data.brand_score}%
          </div>
          <div className="delta-positive text-sm mt-2">
            +3.1% vs last week
          </div>
        </div>

        <div className="card-L2 card-fade-in p-6">
          <div className="flex items-center gap-2 mb-2">
            <MessageCircle className="w-4 h-4 text-accent" />
            <div className="text-xs text-softgray/60 font-body uppercase">
              Total Mentions
            </div>
          </div>
          <div className="text-4xl font-heading font-bold text-white">
            {data.total_mentions}
          </div>
          <div className="delta-positive text-sm mt-2">
            +12 this week
          </div>
        </div>

        <div className="card-L2 card-fade-in p-6">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-4 h-4 text-accent" />
            <div className="text-xs text-softgray/60 font-body uppercase">
              Positive Sentiment
            </div>
          </div>
          <div className="text-4xl font-heading font-bold text-white">
            {data.positive_percentage}%
          </div>
          <div className="delta-positive text-sm mt-2">
            +2.3%
          </div>
        </div>

        <div className="card-L2 card-fade-in p-6">
          <div className="flex items-center gap-2 mb-2">
            <Tag className="w-4 h-4 text-accent" />
            <div className="text-xs text-softgray/60 font-body uppercase">
              Descriptors
            </div>
          </div>
          <div className="text-4xl font-heading font-bold text-white">
            {data.descriptor_count}
          </div>
          <div className="text-softgray/60 text-xs mt-2 font-body">
            Tracked terms
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-2 gap-8">
        {/* Left Column: Descriptor Cloud */}
        <div className="space-y-6">
          <div className="card-L2 card-fade-in p-6">
            <h2 className="text-lg font-heading font-semibold text-white mb-4 flex items-center gap-2">
              <Tag className="w-5 h-5 text-accent" />
              Brand Descriptors
            </h2>
            
            <div className="flex flex-wrap gap-2 mb-6">
              {data.descriptors.length > 0 ? (
                data.descriptors.map((descriptor, index) => (
                  <span
                    key={index}
                    className={`px-3 py-1.5 rounded-full text-sm font-body font-medium sentiment-${descriptor.sentiment}`}
                  >
                    {descriptor.descriptor || descriptor.word}
                  </span>
                ))
              ) : (
                <div className="text-softgray/60 text-sm font-body text-center w-full py-4">
                  No descriptors available yet
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
          <div className="card-L2 card-fade-in p-6">
            <h2 className="text-lg font-heading font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-accent" />
              Sentiment Breakdown
            </h2>
            
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-white font-body font-medium">
                    Positive
                  </div>
                  <div className="text-[#00C6B7] font-heading font-bold">
                    {data.sentiment_breakdown.positive}%
                  </div>
                </div>
                <div className="h-3 bg-navy-lighter rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#00C6B7] transition-all"
                    style={{ width: `${data.sentiment_breakdown.positive}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-white font-body font-medium">
                    Neutral
                  </div>
                  <div className="text-[#4EE4FF] font-heading font-bold">
                    {data.sentiment_breakdown.neutral}%
                  </div>
                </div>
                <div className="h-3 bg-navy-lighter rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#4EE4FF] transition-all"
                    style={{ width: `${data.sentiment_breakdown.neutral}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-white font-body font-medium">
                    Negative
                  </div>
                  <div className="text-[#FF4E70] font-heading font-bold">
                    {data.sentiment_breakdown.negative}%
                  </div>
                </div>
                <div className="h-3 bg-navy-lighter rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#FF4E70] transition-all"
                    style={{ width: `${data.sentiment_breakdown.negative}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Brand Analysis & Actions */}
        <div className="space-y-6">
          <div className="card-L2 card-fade-in p-6">
            <h2 className="text-lg font-heading font-semibold text-white mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-accent" />
              Brand Summary
            </h2>
            
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-navy-lighter/50">
                <div className="text-softgray/80 font-body leading-relaxed">
                  Your brand is consistently mentioned in relation to innovation, quality, and customer service. 
                  AI models frequently describe your products as reliable and well-designed.
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-navy-lighter/50">
                  <div className="text-softgray/60 text-xs font-body uppercase mb-1">
                    Top Association
                  </div>
                  <div className="text-white font-body font-bold">
                    Innovation
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-navy-lighter/50">
                  <div className="text-softgray/60 text-xs font-body uppercase mb-1">
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
          <div className="card-L2 card-fade-in p-6 border-l-2 border-accent">
            <h2 className="text-lg font-heading font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-accent" />
              Optimize Your Brand Perception
            </h2>
            
            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-navy-lighter/50 hover:bg-navy-lighter cursor-pointer transition-colors">
                <div className="text-white font-body font-medium mb-1">
                  Add Organization Schema
                </div>
                <div className="text-softgray/60 text-sm font-body mb-2">
                  Help AI understand your brand structure and offerings
                </div>
                <button className="btn-secondary text-sm py-2 px-4">
                  Generate Schema
                </button>
              </div>

              <div className="p-4 rounded-lg bg-navy-lighter/50 hover:bg-navy-lighter cursor-pointer transition-colors">
                <div className="text-white font-body font-medium mb-1">
                  Unify Brand Language
                </div>
                <div className="text-softgray/60 text-sm font-body mb-2">
                  Align messaging across About, Press, and landing pages
                </div>
                <button className="btn-secondary text-sm py-2 px-4">
                  Review Copy
                </button>
              </div>

              <div className="p-4 rounded-lg bg-navy-lighter/50 hover:bg-navy-lighter cursor-pointer transition-colors">
                <div className="text-white font-body font-medium mb-1">
                  Create Positioning Page
                </div>
                <div className="text-softgray/60 text-sm font-body mb-2">
                  Clarify your category and unique value proposition
                </div>
                <button className="btn-secondary text-sm py-2 px-4">
                  Get Template
                </button>
              </div>

              <div className="p-4 rounded-lg bg-navy-lighter/50 hover:bg-navy-lighter cursor-pointer transition-colors">
                <div className="text-white font-body font-medium mb-1">
                  Authority Sources
                </div>
                <div className="text-softgray/60 text-sm font-body mb-2">
                  Link to Wikipedia, Crunchbase, or industry databases
                </div>
                <button className="btn-secondary text-sm py-2 px-4">
                  View Options
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}