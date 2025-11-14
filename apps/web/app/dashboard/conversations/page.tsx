// apps/web/app/dashboard/conversations/page.tsx

'use client'

import { useEffect, useState } from 'react'
import { MessageSquare, TrendingUp, Sparkles, Users, Target, ArrowRight, AlertCircle } from 'lucide-react'
import ScanProgressModal from '@/components/scan/ScanProgressModal'
import { useBrand } from '@/contexts/BrandContext'

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
  // Brand context - automatically gets current dashboard
  const { currentDashboard } = useBrand()
  
  const [data, setData] = useState<ConversationsData | null>(null)
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
        
        // Check if user has any scans - API returns scan: null when no scans exist
        if (!scanData.scan) {
          setHasScans(false)
          setLoading(false)
          return
        }

        setHasScans(true)
        
        // Use real data from API
        const conversations = scanData.conversations || {}
        
        // Map intent to readable format
        const mapIntent = (intent: string): 'how_to' | 'vs' | 'price' | 'trust' | 'features' => {
          if (intent === 'how_to') return 'how_to'
          if (intent === 'vs') return 'vs'
          if (intent === 'price') return 'price'
          if (intent === 'trust') return 'trust'
          return 'features'
        }
        
        const conversationsData: ConversationsData = {
          volume_index: conversations.volume_index || 0,
          volume_delta: '+12%', // TODO: Calculate from previous scan
          top_questions_count: conversations.questions?.length || 0,
          questions_delta: '+23', // TODO: Calculate from previous scan
          emerging_topics_count: conversations.questions?.filter((q: any) => q.emerging).length || 0,
          topics_delta: '+3', // TODO: Calculate from previous scan
          co_mentions: 0, // TODO: Extract from competitor data
          mentions_delta: '+14', // TODO: Calculate from previous scan
          last_scan: scanData.scan?.finished_at || scanData.scan?.started_at,
          questions: (conversations.questions || []).map((q: any) => ({
            text: q.question,
            intent: mapIntent(q.intent),
            frequency: q.score || 0,
            emerging: q.emerging || false
          })),
          intent_breakdown: conversations.intent_breakdown || {
            how_to: 0,
            vs: 0,
            price: 0,
            trust: 0,
            features: 0
          },
          competitors: [], // TODO: Extract co-mention data
          emerging_topics: [] // TODO: Group by topic keywords
        }
        
        setData(conversationsData)
      } catch (error) {
        console.error('Error fetching conversations data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [currentDashboard]) // Re-fetch when brand changes!

  const handleStartScan = async () => {
    if (!currentDashboard) {
      console.error('No dashboard selected')
      return
    }

    try {
      const response = await fetch('/api/scan/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dashboardId: currentDashboard.id }),
      })

      const data = await response.json()

      if (data.scan) {
        setCurrentScanId(data.scan.id)
        setShowScanModal(true)
      }
    } catch (error) {
      console.error('Failed to start scan:', error)
    }
  }

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
    const colors: Record<string, string> = {
      how_to: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      vs: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
      price: 'bg-green-500/10 text-green-400 border-green-500/30',
      trust: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      features: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
    }
    return colors[intent] || 'bg-softgray/10 text-softgray/70 border-softgray/30'
  }

  const getIntentLabel = (intent: string) => {
    const labels: Record<string, string> = {
      how_to: 'How To',
      vs: 'Comparison',
      price: 'Pricing',
      trust: 'Trust',
      features: 'Features'
    }
    return labels[intent] || intent
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-softgray/60 font-body text-sm">Loading conversations data...</div>
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
              <MessageSquare className="w-8 h-8 text-[#FFB84D]" strokeWidth={1.5} />
              <h1 className="text-4xl font-heading font-bold text-white">
                Conversation Volumes
              </h1>
            </div>

            {/* Scan Button */}
            <div className="flex flex-col items-end gap-2">
              <button
                onClick={handleStartScan}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-transparent border border-[#FFB84D] text-[#FFB84D] hover:bg-[#FFB84D] hover:text-white rounded-lg font-body font-medium transition-all cursor-pointer text-sm"
              >
                <Sparkles className="w-4 h-4" strokeWidth={2} />
                Run Fresh Scan
              </button>
              <p className="text-xs text-softgray/50">1 scan remaining this week</p>
            </div>
          </div>
          
          <p className="text-sm text-softgray/60 mb-2">
            Common questions users ask AI models about your brand and category
          </p>
        </div>

        {/* Empty State */}
        <div 
          className="bg-[#101C2C] rounded-lg p-12 border border-white/5 text-center"
          style={{ boxShadow: '0 0 4px rgba(0, 0, 0, 0.06)' }}
        >
          <div className="max-w-md mx-auto">
            <MessageSquare className="w-16 h-16 text-[#FFB84D] mx-auto mb-6 opacity-40" strokeWidth={1.5} />
            <h2 className="text-2xl font-heading font-bold text-white mb-3">
              No Scan Data Yet
            </h2>
            <p className="text-softgray/60 font-body text-sm mb-6 leading-relaxed">
              Run your first scan to discover what questions users are asking AI models about your brand. 
              We'll analyze conversation patterns, intent, and emerging topics.
            </p>
            <button
              onClick={handleStartScan}
              className="inline-flex items-center gap-2 px-8 py-4 bg-transparent border-2 border-[#FFB84D] text-[#FFB84D] hover:bg-[#FFB84D] hover:text-white rounded-lg font-body font-medium transition-all cursor-pointer text-base"
            >
              <Sparkles className="w-5 h-5" strokeWidth={2} />
              Run Your First Scan
            </button>
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
            <MessageSquare className="w-8 h-8 text-[#FFB84D]" strokeWidth={1.5} />
            <h1 className="text-4xl font-heading font-bold text-white">
              Conversation Volumes
            </h1>
          </div>

          {/* Scan Button */}
          <div className="flex flex-col items-end gap-2">
            <button
              onClick={handleStartScan}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-transparent border border-[#FFB84D] text-[#FFB84D] hover:bg-[#FFB84D] hover:text-white rounded-lg font-body font-medium transition-all cursor-pointer text-sm"
            >
              <Sparkles className="w-4 h-4" strokeWidth={2} />
              Run Fresh Scan
            </button>
            <p className="text-xs text-softgray/50">1 scan remaining this week</p>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-softgray/60 mb-2">
              Common questions users ask AI models about your brand and category
            </p>
            <p className="text-sm text-softgray/70 italic">
              {data.top_questions_count > 0 
                ? `Tracking ${data.top_questions_count} unique questions across models`
                : 'Analyzing conversation patterns...'}
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
                Relative activity
              </div>
            </div>
          </div>
          <div className="text-4xl font-heading font-bold text-white tabular-nums mb-2">
            {data.volume_index}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-[#FFB84D]">{data.volume_delta}</span>
            <span className="text-softgray/50">this month</span>
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
                Unique queries
              </div>
            </div>
          </div>
          <div className="text-4xl font-heading font-bold text-white tabular-nums mb-2">
            {data.top_questions_count}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-[#FFB84D]">{data.questions_delta}</span>
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
                Growing interest
              </div>
            </div>
          </div>
          <div className="text-4xl font-heading font-bold text-white tabular-nums mb-2">
            {data.emerging_topics_count}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-[#FFB84D]">{data.topics_delta}</span>
            <span className="text-softgray/50">trending up</span>
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
            <span className="text-[#FFB84D]">{data.mentions_delta}</span>
            <span className="text-softgray/50">comparisons</span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        {/* Top Questions */}
        <div 
          className="bg-[#101C2C] rounded-lg p-6 border border-white/5"
          style={{ boxShadow: '0 0 4px rgba(0, 0, 0, 0.06)' }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-heading font-bold text-white">
                Top Questions
              </h2>
              <p className="text-sm text-softgray/60 font-body mt-1">
                Most frequent questions users ask AI models about your brand
              </p>
            </div>
            <MessageSquare className="w-6 h-6 text-[#FFB84D]" strokeWidth={1.5} />
          </div>
          
          {data.questions.length > 0 ? (
            <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-2">
              {data.questions.map((question, index) => (
                <div 
                  key={index}
                  className="p-3.5 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0 pr-3">
                      <div className="text-white font-body text-sm mb-2 leading-relaxed">
                        {question.text}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-body font-medium border ${getIntentColor(question.intent)}`}>
                          {getIntentLabel(question.intent)}
                        </span>
                        {question.emerging && (
                          <span className="px-2 py-0.5 rounded text-xs font-body font-medium bg-[#FFB84D]/10 text-[#FFB84D] border border-[#FFB84D]/30">
                            <Sparkles className="w-3 h-3 inline mr-1" strokeWidth={2} />
                            Emerging
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-[#FFB84D] font-heading font-bold text-lg tabular-nums">
                        {question.frequency}
                      </div>
                      <div className="text-softgray/50 text-xs font-body">
                        mentions
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-softgray/40 text-sm font-body mb-2">
                No questions detected yet
              </div>
              <div className="text-softgray/60 text-xs font-body">
                Question data will appear after your first scan
              </div>
            </div>
          )}
        </div>

        {/* Intent Breakdown */}
        <div 
          className="bg-[#101C2C] rounded-lg p-6 border border-white/5"
          style={{ boxShadow: '0 0 4px rgba(0, 0, 0, 0.06)' }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-heading font-bold text-white">
                Intent Breakdown
              </h2>
              <p className="text-sm text-softgray/60 font-body mt-1">
                What users are trying to learn when they ask about you
              </p>
            </div>
            <TrendingUp className="w-6 h-6 text-[#FFB84D]" strokeWidth={1.5} />
          </div>
          
          <div className="space-y-4">
            {Object.entries(data.intent_breakdown).map(([intent, percentage]) => (
              <div key={intent}>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-white font-body font-medium">
                    {getIntentLabel(intent)}
                  </div>
                  <div className="text-[#FFB84D] font-heading font-bold text-xl tabular-nums">
                    {percentage}%
                  </div>
                </div>
                <div className="h-2 bg-white/[0.03] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#FFB84D] rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {data.questions.length === 0 && (
            <div className="text-center py-12">
              <div className="text-softgray/40 text-sm font-body mb-2">
                No intent data yet
              </div>
              <div className="text-softgray/60 text-xs font-body">
                Intent breakdown will appear after your first scan
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Competitive Co-mentions - Full Width */}
      {data.competitors.length > 0 && (
        <div 
          className="bg-[#101C2C] rounded-lg p-6 border border-white/5 mb-8"
          style={{ boxShadow: '0 0 4px rgba(0, 0, 0, 0.06)' }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-heading font-bold text-white mb-2">
                Competitive Co-mentions
              </h2>
              <p className="text-sm text-softgray/60 font-body">
                Brands mentioned alongside yours in user queries
              </p>
            </div>
            <Users className="w-6 h-6 text-[#FFB84D]" strokeWidth={1.5} />
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            {data.competitors.map((competitor, index) => (
              <div 
                key={index}
                className="p-4 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="font-body font-medium text-white">
                    {competitor.brand}
                  </div>
                  <div className="text-[#FFB84D] font-heading font-bold text-xl tabular-nums">
                    {competitor.co_mentions}
                  </div>
                </div>
                <div className="text-softgray/60 text-sm font-body">
                  {competitor.context}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommended Improvements */}
      <div 
        className="rounded-lg p-6 border border-white/5"
        style={{ 
          background: 'rgba(255,255,255,0.02)',
          borderTop: '1px solid rgba(255, 184, 77, 0.25)',
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
          <Target className="w-6 h-6 text-[#FFB84D]" strokeWidth={1.5} />
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="p-5 rounded-lg bg-[#101C2C] hover:bg-[#141E38] cursor-pointer transition-colors group border border-white/5">
            <div className="flex items-start justify-between mb-3">
              <div className="text-white font-body font-medium">
                Add FAQPage Schema
              </div>
              <span className="text-[#FFB84D] text-xs px-2 py-0.5 bg-[#FFB84D]/10 rounded font-medium">
                High Impact
              </span>
            </div>
            <div className="text-softgray/60 text-sm font-body mb-4 leading-relaxed">
              Structure your top questions for better AI comprehension
            </div>
            <button className="flex items-center gap-2 text-[#FFB84D] text-sm font-body font-medium group-hover:gap-3 transition-all">
              Generate Schema
              <ArrowRight className="w-4 h-4" strokeWidth={2} />
            </button>
          </div>

          <div className="p-5 rounded-lg bg-[#101C2C] hover:bg-[#141E38] cursor-pointer transition-colors group border border-white/5">
            <div className="flex items-start justify-between mb-3">
              <div className="text-white font-body font-medium">
                Create Comparison Pages
              </div>
              <span className="text-[#FFB84D] text-xs px-2 py-0.5 bg-[#FFB84D]/10 rounded font-medium">
                High Impact
              </span>
            </div>
            <div className="text-softgray/60 text-sm font-body mb-4 leading-relaxed">
              Address "vs" questions with dedicated comparison content
            </div>
            <button className="flex items-center gap-2 text-[#FFB84D] text-sm font-body font-medium group-hover:gap-3 transition-all">
              View Suggestions
              <ArrowRight className="w-4 h-4" strokeWidth={2} />
            </button>
          </div>

          <div className="p-5 rounded-lg bg-[#101C2C] hover:bg-[#141E38] cursor-pointer transition-colors group border border-white/5">
            <div className="flex items-start justify-between mb-3">
              <div className="text-white font-body font-medium">
                Build How-to Guides
              </div>
              <span className="text-softgray/50 text-xs px-2 py-0.5 bg-white/5 rounded font-medium">
                Medium Impact
              </span>
            </div>
            <div className="text-softgray/60 text-sm font-body mb-4 leading-relaxed">
              Create documentation for common how-to questions
            </div>
            <button className="flex items-center gap-2 text-[#FFB84D] text-sm font-body font-medium group-hover:gap-3 transition-all">
              View Topics
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