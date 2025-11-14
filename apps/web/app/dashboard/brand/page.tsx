// apps/web/app/dashboard/brand/page.tsx

'use client'

import { useEffect, useState } from 'react'
import { Sparkles, TrendingUp, MessageSquare, Users, Target, ArrowRight } from 'lucide-react'
import ScanButton from '@/components/scan/ScanButton'
import ScanProgressModal from '@/components/scan/ScanProgressModal'
import { useBrand } from '@/contexts/BrandContext'

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
  // Brand context - automatically gets current dashboard
  const { currentDashboard } = useBrand()
  
  const [data, setData] = useState<BrandData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showScanModal, setShowScanModal] = useState(false)
  const [currentScanId, setCurrentScanId] = useState<string | null>(null)
  const [hasScans, setHasScans] = useState(false)

  useEffect(() => {
    async function fetchData() {
      // Don't fetch if no dashboard selected yet
      if (!currentDashboard) {
        setLoading(false)
        return
      }

      try {
        // Add dashboardId to API call - this makes it brand-aware!
        const response = await fetch(`/api/scan/latest?dashboardId=${currentDashboard.id}`)
        if (!response.ok) throw new Error('Failed to fetch')
        
        const scanData = await response.json()
        
        // Check if user has any scans
        if (!scanData.hasScans) {
          setHasScans(false)
          setLoading(false)
          return
        }

        setHasScans(true)
        
        // Use real data from API
        const brand = scanData.brand || {}
        
        // Calculate total mentions from descriptors
        const totalMentions = brand.descriptors?.reduce((sum: number, d: any) => sum + d.weight, 0) || 0
        
        // Map sentiment from API format ('pos'/'neu'/'neg') to page format ('positive'/'neutral'/'negative')
        const mapSentiment = (s: string): 'positive' | 'neutral' | 'negative' => {
          if (s === 'pos') return 'positive'
          if (s === 'neg') return 'negative'
          return 'neutral'
        }
        
        // Calculate sentiment score (0-10 scale)
        const sentimentBreakdown = brand.sentiment_breakdown || { positive: 0, neutral: 0, negative: 0 }
        const total = sentimentBreakdown.positive + sentimentBreakdown.neutral + sentimentBreakdown.negative
        const sentimentScore = total > 0
          ? ((sentimentBreakdown.positive * 10 + sentimentBreakdown.neutral * 5 - sentimentBreakdown.negative * 3) / total) / 10
          : 5.0
        
        const brandData: BrandData = {
          visibility_index: brand.visibility_index || 0,
          visibility_delta: '+1.2%', // TODO: Calculate from previous scan
          total_mentions: totalMentions,
          mentions_delta: '+83', // TODO: Calculate from previous scan
          sentiment_score: Number(sentimentScore.toFixed(1)),
          sentiment_delta: '+0.3', // TODO: Calculate from previous scan
          descriptor_count: brand.descriptors?.length || 0,
          descriptor_delta: '+4', // TODO: Calculate from previous scan
          last_scan: scanData.last_scan,
          descriptors: (brand.descriptors || []).map((d: any) => ({
            word: d.word,
            sentiment: mapSentiment(d.sentiment),
            weight: d.weight
          })),
          sentiment_distribution: {
            positive: sentimentBreakdown.positive || 0,
            neutral: sentimentBreakdown.neutral || 0,
            negative: sentimentBreakdown.negative || 0
          },
          competitors: [] // TODO: Add competitor brand data from shopping results
        }
        
        setData(brandData)
      } catch (error) {
        console.error('Error fetching brand data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [currentDashboard]) // Re-fetch when brand changes!

  // Helper functions below (no handleStartScan needed)

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

  // Empty state - no scans yet
  if (!hasScans || !data) {
    return (
      <div>
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-[#4EE4FF]" strokeWidth={1.5} />
              <h1 className="text-4xl font-heading font-bold text-white">
                Brand Visibility
              </h1>
            </div>

            {/* Scan Button */}
            <ScanButton />
          </div>
          
          <p className="text-sm text-softgray/60 mb-2">
            How AI models describe and associate your brand across contexts
          </p>
        </div>

        {/* Empty State */}
        <div 
          className="bg-[#101C2C] rounded-lg p-12 border border-white/5 text-center"
          style={{ boxShadow: '0 0 4px rgba(0, 0, 0, 0.06)' }}
        >
          <div className="max-w-md mx-auto">
            <Sparkles className="w-16 h-16 text-[#4EE4FF] mx-auto mb-6 opacity-40" strokeWidth={1.5} />
            <h2 className="text-2xl font-heading font-bold text-white mb-3">
              No Scan Data Yet
            </h2>
            <p className="text-softgray/60 font-body text-sm mb-6 leading-relaxed">
              Run your first scan to see how AI models perceive your brand. We'll analyze 
              sentiment, descriptors, and brand associations across ChatGPT, Claude, and Gemini.
            </p>
            {/* Empty state uses ScanButton component instead of custom button */}
            <div className="flex justify-center">
              <ScanButton variant="large" />
            </div>
          </div>
        </div>

        {/* Scan Progress Modal */}
        <ScanProgressModal
          isOpen={showScanModal}
          onClose={() => setShowScanModal(false)}
          scanId={currentScanId}
        />
      </div>
    )
  }

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-[#4EE4FF]" strokeWidth={1.5} />
            <h1 className="text-4xl font-heading font-bold text-white">
              Brand Visibility
            </h1>
          </div>

          {/* Scan Button */}
          <ScanButton />
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
                Weighted frequency
              </div>
            </div>
          </div>
          <div className="text-4xl font-heading font-bold text-white tabular-nums mb-2">
            {data.total_mentions.toLocaleString()}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-[#4EE4FF]">{data.mentions_delta}</span>
            <span className="text-softgray/50">this month</span>
          </div>
        </div>

        {/* Sentiment Score */}
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
            <span className="text-softgray/50">improving</span>
          </div>
        </div>

        {/* Descriptor Count */}
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
                Descriptors
              </div>
              <div className="text-xs text-softgray/50">
                Unique attributes
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

      {/* Main Content Grid */}
      <div className="grid grid-cols-2 gap-6 mb-8">
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
            <div className="flex flex-wrap gap-2 max-h-[480px] overflow-y-auto pr-2">
              {data.descriptors.map((descriptor, index) => (
                <div
                  key={index}
                  className={`px-3 py-2 rounded-lg font-body text-sm font-medium ${getSentimentColor(descriptor.sentiment)}`}
                >
                  <span>{descriptor.word}</span>
                  <span className="ml-2 text-xs opacity-60">
                    {descriptor.weight}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-softgray/40 text-sm font-body mb-2">
                No descriptors yet
              </div>
              <div className="text-softgray/60 text-xs font-body">
                Brand descriptors will appear after your first scan
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
              Competitive Mentions
            </h2>
            <TrendingUp className="w-6 h-6 text-[#4EE4FF]" strokeWidth={1.5} />
          </div>
          
          {data.competitors.length > 0 ? (
            <div className="space-y-3">
              {/* Your Brand (Always First) */}
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
          ) : (
            <div className="text-center py-12">
              <div className="text-softgray/40 text-sm font-body mb-2">
                No competitor data yet
              </div>
              <div className="text-softgray/60 text-xs font-body">
                Competitive analysis will appear after your first scan
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sentiment Distribution - Full Width */}
      {data.descriptors.length > 0 && (
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
      )}

      {/* Recommended Improvements */}
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
              Recommended Improvements
            </h2>
            <p className="text-sm text-softgray/60 font-body">
              High-impact actions to strengthen your brand perception
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

      {/* Scan Progress Modal */}
      <ScanProgressModal
        isOpen={showScanModal}
        onClose={() => setShowScanModal(false)}
        scanId={currentScanId}
      />
    </div>
  )
}