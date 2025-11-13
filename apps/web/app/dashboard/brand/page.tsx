// apps/web/app/dashboard/brand/page.tsx

'use client'

import { useEffect, useState } from 'react'
import { Sparkles, TrendingUp, MessageSquare, Users, Target, ArrowRight } from 'lucide-react'

interface BrandData {
  visibility_index: number
  visibility_delta: string
  total_mentions: number
  mentions_delta: string
  sentiment_score: number
  sentiment_delta: string
  descriptor_count: number
  descriptor_delta: string
  last_scan: string | null
  descriptors: Array<{
    word: string
    sentiment: 'positive' | 'neutral' | 'negative'
    weight: number
  }>
  sentiment_distribution: {
    positive: number
    neutral: number
    negative: number
  }
  competitors: Array<{
    brand: string
    mentions: number
    sentiment: number
  }>
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
          visibility_index: scanData.brand_visibility || 89.8,
          visibility_delta: '+1.2%',
          total_mentions: scanData.brand_mentions || 1247,
          mentions_delta: '+83',
          sentiment_score: 8.2,
          sentiment_delta: '+0.3',
          descriptor_count: 24,
          descriptor_delta: '+3',
          last_scan: scanData.last_scan,
          descriptors: [
            { word: 'Innovative', sentiment: 'positive', weight: 95 },
            { word: 'Reliable', sentiment: 'positive', weight: 89 },
            { word: 'Professional', sentiment: 'positive', weight: 84 },
            { word: 'Trusted', sentiment: 'positive', weight: 78 },
            { word: 'Modern', sentiment: 'positive', weight: 72 },
            { word: 'Efficient', sentiment: 'positive', weight: 68 },
            { word: 'Secure', sentiment: 'positive', weight: 65 },
            { word: 'Established', sentiment: 'neutral', weight: 58 },
            { word: 'Corporate', sentiment: 'neutral', weight: 52 },
            { word: 'Traditional', sentiment: 'neutral', weight: 45 },
          ],
          sentiment_distribution: {
            positive: 72,
            neutral: 24,
            negative: 4
          },
          competitors: [
            { brand: 'Competitor A', mentions: 1089, sentiment: 7.8 },
            { brand: 'Competitor B', mentions: 934, sentiment: 7.5 },
            { brand: 'Competitor C', mentions: 856, sentiment: 7.2 },
          ]
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
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      })
    } catch {
      return 'No recent scan'
    }
  }

  const getSentimentColor = (sentiment: 'positive' | 'neutral' | 'negative') => {
    if (sentiment === 'positive') return 'text-[#4EE4FF] bg-[#4EE4FF]/10'
    if (sentiment === 'neutral') return 'text-softgray/70 bg-white/5'
    return 'text-softgray/40 bg-white/[0.02]'
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
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="w-8 h-8 text-[#4EE4FF]" strokeWidth={1.5} />
          <h1 className="text-4xl font-heading font-bold text-white">
            Brand Visibility
          </h1>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-softgray/60 mb-2">
              How AI models describe and associate your brand across contexts
            </p>
            <p className="text-sm text-softgray/70 italic">
              Your brand appears with {data.sentiment_distribution.positive}% positive sentiment
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
        {/* Visibility Index */}
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
                Visibility Index
              </div>
              <div className="text-xs text-softgray/50">
                Brand prominence
              </div>
            </div>
          </div>
          <div className="text-4xl font-heading font-bold text-white tabular-nums mb-2">
            {data.visibility_index}<span className="text-2xl text-softgray/40">%</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-[#4EE4FF]">{data.visibility_delta}</span>
            <span className="text-softgray/50">vs last week</span>
          </div>
        </div>

        {/* Total Mentions */}
        <div 
          className="bg-[#101C2C] rounded-lg p-6 border border-white/5"
          style={{ boxShadow: '0 0 4px rgba(0, 0, 0, 0.06)' }}
        >
          <div className="flex items-start gap-3 mb-4">
            <div className="p-2 bg-white/5 rounded-lg">
              <MessageSquare className="w-5 h-5 text-white/60" strokeWidth={1.5} />
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
            {data.total_mentions.toLocaleString()}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-[#4EE4FF]">{data.mentions_delta}</span>
            <span className="text-softgray/50">this week</span>
          </div>
        </div>

        {/* Sentiment Score */}
        <div 
          className="bg-[#101C2C] rounded-lg p-6 border border-white/5"
          style={{ boxShadow: '0 0 4px rgba(0, 0, 0, 0.06)' }}
        >
          <div className="flex items-start gap-3 mb-4">
            <div className="p-2 bg-white/5 rounded-lg">
              <Sparkles className="w-5 h-5 text-white/60" strokeWidth={1.5} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-softgray/60 uppercase tracking-wider mb-1">
                Sentiment Score
              </div>
              <div className="text-xs text-softgray/50">
                Overall perception
              </div>
            </div>
          </div>
          <div className="text-4xl font-heading font-bold text-white tabular-nums mb-2">
            {data.sentiment_score}<span className="text-2xl text-softgray/40">/10</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-[#4EE4FF]">{data.sentiment_delta}</span>
            <span className="text-softgray/50">improved</span>
          </div>
        </div>

        {/* Descriptor Count */}
        <div 
          className="bg-[#101C2C] rounded-lg p-6 border border-white/5"
          style={{ boxShadow: '0 0 4px rgba(0, 0, 0, 0.06)' }}
        >
          <div className="flex items-start gap-3 mb-4">
            <div className="p-2 bg-white/5 rounded-lg">
              <Users className="w-5 h-5 text-white/60" strokeWidth={1.5} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-softgray/60 uppercase tracking-wider mb-1">
                Unique Descriptors
              </div>
              <div className="text-xs text-softgray/50">
                Brand attributes
              </div>
            </div>
          </div>
          <div className="text-4xl font-heading font-bold text-white tabular-nums mb-2">
            {data.descriptor_count}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-[#4EE4FF]">{data.descriptor_delta}</span>
            <span className="text-softgray/50">new terms</span>
          </div>
        </div>
      </div>

      {/* Two Column Grid - Context & Comparison */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        {/* Brand Descriptors */}
        <div 
          className="bg-[#101C2C] rounded-lg p-6 border border-white/5"
          style={{ boxShadow: '0 0 4px rgba(0, 0, 0, 0.06)' }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-heading font-bold text-white">
              Brand Descriptors
            </h2>
            <Sparkles className="w-6 h-6 text-[#4EE4FF]" strokeWidth={1.5} />
          </div>
          
          {data.descriptors.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {data.descriptors.map((descriptor, index) => (
                <div
                  key={index}
                  className={`px-3 py-2 rounded-lg font-body text-sm font-medium cursor-pointer hover:scale-105 transition-transform ${getSentimentColor(descriptor.sentiment)}`}
                  style={{ 
                    opacity: 0.5 + (descriptor.weight / 200)
                  }}
                >
                  {descriptor.word}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-softgray/40 text-sm font-body mb-2">
                No descriptors yet
              </div>
              <div className="text-softgray/60 text-xs font-body">
                Brand attributes will surface as mentions accumulate
              </div>
            </div>
          )}
        </div>

        {/* Competitive Mentions */}
        <div 
          className="bg-[#101C2C] rounded-lg p-6 border border-white/5"
          style={{ boxShadow: '0 0 4px rgba(0, 0, 0, 0.06)' }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-heading font-bold text-white">
              Competitive Landscape
            </h2>
            <TrendingUp className="w-6 h-6 text-[#4EE4FF]" strokeWidth={1.5} />
          </div>
          
          <div className="space-y-4">
            {/* User Brand */}
            <div className="p-4 rounded-lg bg-[#4EE4FF]/10 border border-[#4EE4FF]/30">
              <div className="flex items-center justify-between mb-2">
                <div className="font-body font-bold text-white">
                  Your Brand
                </div>
                <div className="text-[#4EE4FF] font-heading font-bold text-2xl tabular-nums">
                  {data.total_mentions.toLocaleString()}
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-softgray/60 font-body">
                  Sentiment: {data.sentiment_score}/10
                </span>
                <span className="text-[#4EE4FF] text-xs font-body font-medium">
                  Leading mentions
                </span>
              </div>
            </div>

            {/* Competitors */}
            {data.competitors.map((competitor, index) => (
              <div 
                key={index} 
                className="p-4 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="font-body font-medium text-white">
                    {competitor.brand}
                  </div>
                  <div className="text-softgray/70 font-heading font-bold text-xl tabular-nums">
                    {competitor.mentions.toLocaleString()}
                  </div>
                </div>
                <div className="text-softgray/60 text-sm font-body">
                  Sentiment: {competitor.sentiment}/10
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sentiment Distribution - Full Width */}
      <div 
        className="bg-[#101C2C] rounded-lg p-6 border border-white/5 mb-8"
        style={{ boxShadow: '0 0 4px rgba(0, 0, 0, 0.06)' }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-heading font-bold text-white mb-2">
              Sentiment Distribution
            </h2>
            <p className="text-sm text-softgray/60 font-body">
              Overall sentiment balance across all brand mentions
            </p>
          </div>
          <MessageSquare className="w-6 h-6 text-[#4EE4FF]" strokeWidth={1.5} />
        </div>
        
        <div className="grid grid-cols-3 gap-8">
          {/* Positive */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="text-white font-body font-medium text-lg">
                Positive
              </div>
              <div className="text-[#4EE4FF] font-heading font-bold text-2xl tabular-nums">
                {data.sentiment_distribution.positive}%
              </div>
            </div>
            <div className="h-2 bg-white/[0.03] rounded-full overflow-hidden mb-2">
              <div 
                className="h-full bg-[#4EE4FF] rounded-full transition-all duration-500"
                style={{ width: `${data.sentiment_distribution.positive}%` }}
              />
            </div>
            <div className="text-softgray/60 text-sm font-body">
              <span className="text-[#4EE4FF]">↑ 3%</span> vs last month
            </div>
          </div>

          {/* Neutral */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="text-white font-body font-medium text-lg">
                Neutral
              </div>
              <div className="text-softgray/70 font-heading font-bold text-2xl tabular-nums">
                {data.sentiment_distribution.neutral}%
              </div>
            </div>
            <div className="h-2 bg-white/[0.03] rounded-full overflow-hidden mb-2">
              <div 
                className="h-full bg-softgray/50 rounded-full transition-all duration-500"
                style={{ width: `${data.sentiment_distribution.neutral}%` }}
              />
            </div>
            <div className="text-softgray/60 text-sm font-body">
              <span className="text-softgray/60">—</span> Stable
            </div>
          </div>

          {/* Negative */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="text-white font-body font-medium text-lg">
                Negative
              </div>
              <div className="text-softgray/50 font-heading font-bold text-2xl tabular-nums">
                {data.sentiment_distribution.negative}%
              </div>
            </div>
            <div className="h-2 bg-white/[0.03] rounded-full overflow-hidden mb-2">
              <div 
                className="h-full bg-softgray/30 rounded-full transition-all duration-500"
                style={{ width: `${data.sentiment_distribution.negative}%` }}
              />
            </div>
            <div className="text-softgray/60 text-sm font-body">
              <span className="text-[#4EE4FF]">↓ 1%</span> Improving
            </div>
          </div>
        </div>
      </div>

      {/* Next Best Actions - Distinct Bottom Section */}
      <div 
        className="rounded-lg p-6 border border-white/5"
        style={{ 
          background: 'rgba(255,255,255,0.02)',
          borderTop: '1px solid rgba(78, 228, 255, 0.25)',
          boxShadow: '0 0 4px rgba(0, 0, 0, 0.06)'
        }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-heading font-bold text-white mb-2">
              Next Best Actions
            </h2>
            <p className="text-sm text-softgray/60 font-body">
              Recommended improvements based on your brand perception data
            </p>
          </div>
          <Target className="w-6 h-6 text-[#4EE4FF]" strokeWidth={1.5} />
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="p-5 rounded-lg bg-[#101C2C] hover:bg-[#141E38] cursor-pointer transition-colors group border border-white/5">
            <div className="flex items-start justify-between mb-3">
              <div className="text-white font-body font-medium">
                Add Organization Schema
              </div>
              <span className="text-[#4EE4FF] text-xs px-2 py-0.5 bg-[#4EE4FF]/10 rounded font-medium">
                High Impact
              </span>
            </div>
            <div className="text-softgray/60 text-sm font-body mb-4 leading-relaxed">
              Structure your brand identity with logo, links, and tagline
            </div>
            <button className="flex items-center gap-2 text-[#4EE4FF] text-sm font-body font-medium group-hover:gap-3 transition-all">
              Generate Schema
              <ArrowRight className="w-4 h-4" strokeWidth={2} />
            </button>
          </div>

          <div className="p-5 rounded-lg bg-[#101C2C] hover:bg-[#141E38] cursor-pointer transition-colors group border border-white/5">
            <div className="flex items-start justify-between mb-3">
              <div className="text-white font-body font-medium">
                Unify Brand Language
              </div>
              <span className="text-[#4EE4FF] text-xs px-2 py-0.5 bg-[#4EE4FF]/10 rounded font-medium">
                High Impact
              </span>
            </div>
            <div className="text-softgray/60 text-sm font-body mb-4 leading-relaxed">
              Align messaging across About, Press, and landing pages
            </div>
            <button className="flex items-center gap-2 text-[#4EE4FF] text-sm font-body font-medium group-hover:gap-3 transition-all">
              View Guidelines
              <ArrowRight className="w-4 h-4" strokeWidth={2} />
            </button>
          </div>

          <div className="p-5 rounded-lg bg-[#101C2C] hover:bg-[#141E38] cursor-pointer transition-colors group border border-white/5">
            <div className="flex items-start justify-between mb-3">
              <div className="text-white font-body font-medium">
                Build Authority Sources
              </div>
              <span className="text-softgray/50 text-xs px-2 py-0.5 bg-white/5 rounded font-medium">
                Medium Impact
              </span>
            </div>
            <div className="text-softgray/60 text-sm font-body mb-4 leading-relaxed">
              Connect Wikipedia, Crunchbase, and GS1 references
            </div>
            <button className="flex items-center gap-2 text-[#4EE4FF] text-sm font-body font-medium group-hover:gap-3 transition-all">
              View Checklist
              <ArrowRight className="w-4 h-4" strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}