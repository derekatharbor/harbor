// apps/web/app/dashboard/conversations/page.tsx

'use client'

import { useEffect, useState } from 'react'
import { MessageSquare, TrendingUp, Sparkles, Users, Target, ArrowRight, AlertCircle } from 'lucide-react'

interface ConversationsData {
  volume_index: number
  volume_delta: string
  top_questions_count: number
  questions_delta: string
  emerging_topics_count: number
  topics_delta: string
  co_mentions: number
  mentions_delta: string
  last_scan: string | null
  questions: Array<{
    text: string
    intent: 'how_to' | 'vs' | 'price' | 'trust' | 'features'
    frequency: number
    emerging: boolean
  }>
  intent_breakdown: {
    how_to: number
    vs: number
    price: number
    trust: number
    features: number
  }
  competitors: Array<{
    brand: string
    co_mentions: number
    context: string
  }>
  emerging_topics: Array<{
    topic: string
    growth: number
    volume: number
  }>
}

export default function ConversationVolumesPage() {
  const [data, setData] = useState<ConversationsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/scan/latest')
        if (!response.ok) throw new Error('Failed to fetch')
        
        const scanData = await response.json()
        
        const conversationsData: ConversationsData = {
          volume_index: scanData.conversation_volume || 847,
          volume_delta: '+12%',
          top_questions_count: 156,
          questions_delta: '+23',
          emerging_topics_count: 8,
          topics_delta: '+3',
          co_mentions: 89,
          mentions_delta: '+14',
          last_scan: scanData.last_scan,
          questions: [
            { text: 'How does this compare to traditional options?', intent: 'vs', frequency: 234, emerging: false },
            { text: 'What are the key features?', intent: 'features', frequency: 189, emerging: false },
            { text: 'How much does it cost?', intent: 'price', frequency: 167, emerging: false },
            { text: 'Is this company trustworthy?', intent: 'trust', frequency: 145, emerging: false },
            { text: 'How do I get started?', intent: 'how_to', frequency: 132, emerging: true },
            { text: 'What makes this different from competitors?', intent: 'vs', frequency: 118, emerging: false },
            { text: 'How does pricing work?', intent: 'price', frequency: 104, emerging: false },
            { text: 'What are the main benefits?', intent: 'features', frequency: 98, emerging: false },
            { text: 'How do I integrate this with my existing setup?', intent: 'how_to', frequency: 87, emerging: true },
            { text: 'Is there a free trial?', intent: 'price', frequency: 76, emerging: false },
            { text: 'What do customers say about reliability?', intent: 'trust', frequency: 68, emerging: false },
            { text: 'How does support work?', intent: 'how_to', frequency: 54, emerging: false },
          ],
          intent_breakdown: {
            how_to: 28,
            vs: 24,
            price: 22,
            trust: 14,
            features: 12
          },
          competitors: [
            { brand: 'Competitor A', co_mentions: 67, context: 'Alternative comparisons' },
            { brand: 'Competitor B', co_mentions: 54, context: 'Feature comparisons' },
            { brand: 'Competitor C', co_mentions: 43, context: 'Pricing discussions' },
          ],
          emerging_topics: [
            { topic: 'Integration capabilities', growth: 142, volume: 89 },
            { topic: 'Mobile functionality', growth: 118, volume: 76 },
            { topic: 'Security features', growth: 94, volume: 54 },
            { topic: 'API access', growth: 87, volume: 48 },
            { topic: 'Team collaboration', growth: 73, volume: 42 },
          ]
        }
        
        setData(conversationsData)
      } catch (error) {
        console.error('Error fetching conversations data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // CURSOR FIX
  useEffect(() => {
    const style = document.createElement('style')
    style.innerHTML = `
      .conversations-clickable { cursor: pointer !important; }
      .conversations-clickable:hover { cursor: pointer !important; }
    `
    document.head.appendChild(style)
    return () => {
      document.head.removeChild(style)
    }
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

  const getIntentColor = (intent: string) => {
    const colors = {
      how_to: 'bg-[#5A5AFF]/10 text-[#5A5AFF] border-[#5A5AFF]/30',
      vs: 'bg-[#00C6B7]/10 text-[#00C6B7] border-[#00C6B7]/30',
      price: 'bg-[#2979FF]/10 text-[#2979FF] border-[#2979FF]/30',
      trust: 'bg-[#4EE4FF]/10 text-[#4EE4FF] border-[#4EE4FF]/30',
      features: 'bg-softgray/10 text-softgray border-softgray/30'
    }
    return colors[intent as keyof typeof colors] || colors.features
  }

  const getIntentLabel = (intent: string) => {
    const labels = {
      how_to: 'How-To',
      vs: 'Comparison',
      price: 'Pricing',
      trust: 'Trust',
      features: 'Features'
    }
    return labels[intent as keyof typeof labels] || intent
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-softgray/60 font-body text-sm">Loading conversation data...</div>
      </div>
    )
  }

  if (!data) return null

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <MessageSquare className="w-8 h-8 text-[#5A5AFF]" strokeWidth={1.5} />
          <h1 className="text-4xl font-heading font-bold text-white">
            Conversation Volumes
          </h1>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-softgray/60 mb-2">
              What users ask AI about your brand and category
            </p>
            <p className="text-sm text-softgray/70 italic">
              {data.emerging_topics.length} emerging topics detected this week
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
        {/* Volume Index */}
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
                Volume Index
              </div>
              <div className="text-xs text-softgray/50">
                Relative query volume
              </div>
            </div>
          </div>
          <div className="text-4xl font-heading font-bold text-white tabular-nums mb-2">
            {data.volume_index}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-[#5A5AFF]">{data.volume_delta}</span>
            <span className="text-softgray/50">vs last week</span>
          </div>
        </div>

        {/* Top Questions */}
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
                Top Questions
              </div>
              <div className="text-xs text-softgray/50">
                Unique queries tracked
              </div>
            </div>
          </div>
          <div className="text-4xl font-heading font-bold text-white tabular-nums mb-2">
            {data.top_questions_count}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-[#5A5AFF]">{data.questions_delta}</span>
            <span className="text-softgray/50">new this week</span>
          </div>
        </div>

        {/* Emerging Topics */}
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
                Emerging Topics
              </div>
              <div className="text-xs text-softgray/50">
                Rising interest areas
              </div>
            </div>
          </div>
          <div className="text-4xl font-heading font-bold text-white tabular-nums mb-2">
            {data.emerging_topics_count}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-[#5A5AFF]">{data.topics_delta}</span>
            <span className="text-softgray/50">detected</span>
          </div>
        </div>

        {/* Co-mentions */}
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
                Co-mentions
              </div>
              <div className="text-xs text-softgray/50">
                With competitors
              </div>
            </div>
          </div>
          <div className="text-4xl font-heading font-bold text-white tabular-nums mb-2">
            {data.co_mentions}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-[#5A5AFF]">{data.mentions_delta}</span>
            <span className="text-softgray/50">this week</span>
          </div>
        </div>
      </div>

      {/* Two Column Grid - Context & Comparison */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        {/* Top Questions */}
        <div 
          className="bg-[#101C2C] rounded-lg p-6 border border-white/5"
          style={{ boxShadow: '0 0 4px rgba(0, 0, 0, 0.06)' }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-heading font-bold text-white">
              Top Questions
            </h2>
            <MessageSquare className="w-6 h-6 text-[#5A5AFF]" strokeWidth={1.5} />
          </div>
          
          <div className="space-y-2.5">
            {data.questions.map((question, index) => (
              <div 
                key={index} 
                className="conversations-clickable p-3.5 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
                style={{ cursor: 'pointer' }}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="text-white font-body text-sm flex-1">
                    {question.text}
                  </div>
                  {question.emerging && (
                    <span className="flex items-center gap-1 text-[#5A5AFF] text-xs px-2 py-0.5 bg-[#5A5AFF]/10 rounded font-medium whitespace-nowrap">
                      <Sparkles className="w-3 h-3" strokeWidth={2} />
                      New
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-xs px-2 py-0.5 rounded border font-medium ${getIntentColor(question.intent)}`}>
                    {getIntentLabel(question.intent)}
                  </span>
                  <span className="text-softgray/60 text-xs font-body tabular-nums">
                    {question.frequency} asks
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Competitor Co-mentions */}
        <div 
          className="bg-[#101C2C] rounded-lg p-6 border border-white/5"
          style={{ boxShadow: '0 0 4px rgba(0, 0, 0, 0.06)' }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-heading font-bold text-white">
              Competitor Co-mentions
            </h2>
            <Users className="w-6 h-6 text-[#5A5AFF]" strokeWidth={1.5} />
          </div>
          
          <div className="space-y-3">
            {data.competitors.map((competitor, index) => (
              <div 
                key={index} 
                className="conversations-clickable p-4 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
                style={{ cursor: 'pointer' }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="font-body font-medium text-white">
                    {competitor.brand}
                  </div>
                  <div className="text-[#5A5AFF] font-heading font-bold text-xl tabular-nums">
                    {competitor.co_mentions}
                  </div>
                </div>
                <div className="text-softgray/60 text-xs font-body">
                  {competitor.context}
                </div>
              </div>
            ))}
          </div>

          {/* Intent Breakdown */}
          <div className="mt-6 pt-6 border-t border-white/5">
            <h3 className="text-sm font-heading font-semibold text-white mb-4 uppercase tracking-wide text-softgray/80">
              Intent Breakdown
            </h3>
            <div className="space-y-3">
              {Object.entries(data.intent_breakdown).map(([intent, percentage]) => (
                <div key={intent}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-white font-body text-sm">
                      {getIntentLabel(intent)}
                    </span>
                    <span className="text-[#5A5AFF] font-heading font-bold text-sm tabular-nums">
                      {percentage}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-white/[0.03] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#5A5AFF] rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Emerging Topics - Full Width */}
      <div 
        className="bg-[#101C2C] rounded-lg p-6 border border-white/5 mb-8"
        style={{ boxShadow: '0 0 4px rgba(0, 0, 0, 0.06)' }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-heading font-bold text-white mb-2">
              Emerging Topics
            </h2>
            <p className="text-sm text-softgray/60 font-body">
              Rising interest areas with significant growth momentum
            </p>
          </div>
          <Sparkles className="w-6 h-6 text-[#5A5AFF]" strokeWidth={1.5} />
        </div>
        
        <div className="grid grid-cols-5 gap-4">
          {data.emerging_topics.map((topic, index) => (
            <div 
              key={index}
              className="conversations-clickable p-4 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-colors border border-white/5"
              style={{ cursor: 'pointer' }}
            >
              <div className="flex items-start justify-between mb-3">
                <AlertCircle className="w-4 h-4 text-[#5A5AFF]" strokeWidth={2} />
                <span className="text-[#5A5AFF] text-xs font-body font-medium">
                  +{topic.growth}%
                </span>
              </div>
              <div className="text-white font-body text-sm font-medium mb-2">
                {topic.topic}
              </div>
              <div className="text-softgray/60 text-xs font-body">
                {topic.volume} mentions
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Improvements - Distinct Bottom Section */}
      <div 
        className="rounded-lg p-6 border border-white/5"
        style={{ 
          background: 'rgba(255,255,255,0.02)',
          borderTop: '1px solid rgba(90, 90, 255, 0.25)',
          boxShadow: '0 0 4px rgba(0, 0, 0, 0.06)'
        }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-heading font-bold text-white mb-2">
              Recommended Improvements
            </h2>
            <p className="text-sm text-softgray/60 font-body">
              High-impact actions to address common user questions
            </p>
          </div>
          <Target className="w-6 h-6 text-[#5A5AFF]" strokeWidth={1.5} />
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div 
            className="conversations-clickable p-5 rounded-lg bg-[#101C2C] hover:bg-[#141E38] transition-colors group border border-white/5"
            style={{ cursor: 'pointer' }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="text-white font-body font-medium">
                Add FAQ Schema
              </div>
              <span className="text-[#5A5AFF] text-xs px-2 py-0.5 bg-[#5A5AFF]/10 rounded font-medium">
                High Impact
              </span>
            </div>
            <div className="text-softgray/60 text-sm font-body mb-4 leading-relaxed">
              Structure answers to your top questions for AI comprehension
            </div>
            <button className="flex items-center gap-2 text-[#5A5AFF] text-sm font-body font-medium group-hover:gap-3 transition-all">
              Generate Schema
              <ArrowRight className="w-4 h-4" strokeWidth={2} />
            </button>
          </div>

          <div 
            className="conversations-clickable p-5 rounded-lg bg-[#101C2C] hover:bg-[#141E38] transition-colors group border border-white/5"
            style={{ cursor: 'pointer' }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="text-white font-body font-medium">
                Build Comparison Pages
              </div>
              <span className="text-[#5A5AFF] text-xs px-2 py-0.5 bg-[#5A5AFF]/10 rounded font-medium">
                High Impact
              </span>
            </div>
            <div className="text-softgray/60 text-sm font-body mb-4 leading-relaxed">
              Create "vs" pages for competitor comparisons
            </div>
            <button className="flex items-center gap-2 text-[#5A5AFF] text-sm font-body font-medium group-hover:gap-3 transition-all">
              View Template
              <ArrowRight className="w-4 h-4" strokeWidth={2} />
            </button>
          </div>

          <div 
            className="conversations-clickable p-5 rounded-lg bg-[#101C2C] hover:bg-[#141E38] transition-colors group border border-white/5"
            style={{ cursor: 'pointer' }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="text-white font-body font-medium">
                Create How-To Docs
              </div>
              <span className="text-softgray/50 text-xs px-2 py-0.5 bg-white/5 rounded font-medium">
                Medium Impact
              </span>
            </div>
            <div className="text-softgray/60 text-sm font-body mb-4 leading-relaxed">
              Address setup and integration questions
            </div>
            <button className="flex items-center gap-2 text-[#5A5AFF] text-sm font-body font-medium group-hover:gap-3 transition-all">
              Get Started
              <ArrowRight className="w-4 h-4" strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}