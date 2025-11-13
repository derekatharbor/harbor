// apps/web/app/dashboard/shopping/page.tsx

'use client'

import { useEffect, useState } from 'react'
import { ShoppingBag, TrendingUp, Trophy, Target, Sparkles, ArrowRight } from 'lucide-react'

interface ShoppingData {
  visibility_score: number
  visibility_delta: string
  total_mentions: number
  mentions_delta: string
  avg_rank: number
  rank_delta: string
  market_position: number
  position_delta: string
  last_scan: string | null
  categories: Array<{
    name: string
    rank: number
    mentions: number
    models: string[]
    trend: 'up' | 'down' | 'stable'
  }>
  competitors: Array<{
    brand: string
    mentions: number
    avg_rank: number
    isUser?: boolean
  }>
  models: Array<{
    name: string
    mentions: number
    coverage: number
  }>
}

export default function ShoppingVisibilityPage() {
  const [data, setData] = useState<ShoppingData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/scan/latest')
        if (!response.ok) throw new Error('Failed to fetch')
        
        const scanData = await response.json()
        
        const shoppingData: ShoppingData = {
          visibility_score: scanData.shopping_visibility || 87.2,
          visibility_delta: '+2.3%',
          total_mentions: scanData.total_mentions || 234,
          mentions_delta: '+18',
          avg_rank: 2.3,
          rank_delta: 'Improved',
          market_position: 3,
          position_delta: 'Holding',
          last_scan: scanData.last_scan,
          categories: [
            { name: 'Business Credit Cards', rank: 1, mentions: 89, models: ['ChatGPT', 'Claude', 'Gemini'], trend: 'up' },
            { name: 'Corporate Banking', rank: 2, mentions: 76, models: ['ChatGPT', 'Claude'], trend: 'up' },
            { name: 'Financial Services', rank: 3, mentions: 69, models: ['ChatGPT', 'Gemini'], trend: 'stable' },
            { name: 'Payment Solutions', rank: 4, mentions: 54, models: ['Claude', 'Gemini'], trend: 'up' },
            { name: 'Business Loans', rank: 5, mentions: 47, models: ['ChatGPT'], trend: 'stable' },
            { name: 'Merchant Services', rank: 6, mentions: 38, models: ['Gemini'], trend: 'down' },
            { name: 'Cash Management', rank: 7, mentions: 29, models: ['Claude'], trend: 'stable' },
            { name: 'Treasury Services', rank: 9, mentions: 18, models: ['ChatGPT'], trend: 'down' }
          ],
          competitors: [
            { brand: 'Your Brand', mentions: 234, avg_rank: 2.3, isUser: true },
            { brand: 'Competitor A', mentions: 189, avg_rank: 2.1 },
            { brand: 'Competitor B', mentions: 156, avg_rank: 2.8 },
            { brand: 'Competitor C', mentions: 143, avg_rank: 3.2 },
          ],
          models: [
            { name: 'ChatGPT', mentions: 89, coverage: 78 },
            { name: 'Claude', mentions: 76, coverage: 72 },
            { name: 'Gemini', mentions: 69, coverage: 65 },
          ]
        }
        
        setData(shoppingData)
      } catch (error) {
        console.error('Error fetching shopping data:', error)
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

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    if (trend === 'up') return '↑'
    if (trend === 'down') return '↓'
    return '—'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-softgray/60 font-body text-sm">Loading shopping data...</div>
      </div>
    )
  }

  if (!data) return null

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <ShoppingBag className="w-8 h-8 text-[#00C6B7]" strokeWidth={1.5} />
          <h1 className="text-4xl font-heading font-bold text-white">
            Shopping Visibility
          </h1>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-softgray/60 mb-2">
              How your products surface in AI shopping recommendations across models
            </p>
            <p className="text-sm text-softgray/70 italic">
              AI models recommend your brand in {data.categories.length} product categories
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
        {/* Visibility Score */}
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
                Visibility Score
              </div>
              <div className="text-xs text-softgray/50">
                Overall product presence
              </div>
            </div>
          </div>
          <div className="text-4xl font-heading font-bold text-white tabular-nums mb-2">
            {data.visibility_score}<span className="text-2xl text-softgray/40">%</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-[#00C6B7]">{data.visibility_delta}</span>
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
              <ShoppingBag className="w-5 h-5 text-white/60" strokeWidth={1.5} />
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
            <span className="text-[#00C6B7]">{data.mentions_delta}</span>
            <span className="text-softgray/50">this week</span>
          </div>
        </div>

        {/* Average Rank */}
        <div 
          className="bg-[#101C2C] rounded-lg p-6 border border-white/5"
          style={{ boxShadow: '0 0 4px rgba(0, 0, 0, 0.06)' }}
        >
          <div className="flex items-start gap-3 mb-4">
            <div className="p-2 bg-white/5 rounded-lg">
              <Trophy className="w-5 h-5 text-white/60" strokeWidth={1.5} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-softgray/60 uppercase tracking-wider mb-1">
                Average Rank
              </div>
              <div className="text-xs text-softgray/50">
                In recommendations
              </div>
            </div>
          </div>
          <div className="text-4xl font-heading font-bold text-white tabular-nums mb-2">
            #{data.avg_rank}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-[#00C6B7]">{data.rank_delta}</span>
            <span className="text-softgray/50">position</span>
          </div>
        </div>

        {/* Market Position */}
        <div 
          className="bg-[#101C2C] rounded-lg p-6 border border-white/5"
          style={{ boxShadow: '0 0 4px rgba(0, 0, 0, 0.06)' }}
        >
          <div className="flex items-start gap-3 mb-4">
            <div className="p-2 bg-white/5 rounded-lg">
              <Target className="w-5 h-5 text-white/60" strokeWidth={1.5} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-softgray/60 uppercase tracking-wider mb-1">
                Market Position
              </div>
              <div className="text-xs text-softgray/50">
                Category ranking
              </div>
            </div>
          </div>
          <div className="text-4xl font-heading font-bold text-white tabular-nums mb-2">
            #{data.market_position}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-softgray/60">{data.position_delta}</span>
          </div>
        </div>
      </div>

      {/* Two Column Grid - Context & Comparison */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        {/* Category Rankings */}
        <div 
          className="bg-[#101C2C] rounded-lg p-6 border border-white/5"
          style={{ boxShadow: '0 0 4px rgba(0, 0, 0, 0.06)' }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-heading font-bold text-white">
              Category Rankings
            </h2>
            <Trophy className="w-6 h-6 text-[#00C6B7]" strokeWidth={1.5} />
          </div>
          
          {data.categories.length > 0 ? (
            <div className="space-y-3">
              {data.categories.map((category, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-4 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="text-2xl font-heading font-bold text-[#00C6B7] tabular-nums min-w-[3rem]">
                      #{category.rank}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-body font-medium mb-1">
                        {category.name}
                      </div>
                      <div className="text-softgray/60 text-xs font-body">
                        {category.mentions} mentions • {category.models.length} models
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-softgray/50 text-xs font-body">
                      {category.models.join(', ')}
                    </div>
                    <span className={`text-sm ${
                      category.trend === 'up' ? 'text-[#00C6B7]' : 
                      category.trend === 'down' ? 'text-softgray/40' : 
                      'text-softgray/60'
                    }`}>
                      {getTrendIcon(category.trend)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-softgray/40 text-sm font-body mb-2">
                No category data yet
              </div>
              <div className="text-softgray/60 text-xs font-body">
                Rankings will appear after your first scan completes
              </div>
            </div>
          )}
        </div>

        {/* Competitive Position */}
        <div 
          className="bg-[#101C2C] rounded-lg p-6 border border-white/5"
          style={{ boxShadow: '0 0 4px rgba(0, 0, 0, 0.06)' }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-heading font-bold text-white">
              Competitive Position
            </h2>
            <TrendingUp className="w-6 h-6 text-[#00C6B7]" strokeWidth={1.5} />
          </div>
          
          <div className="space-y-3">
            {data.competitors.map((competitor, index) => (
              <div 
                key={index} 
                className={`p-4 rounded-lg ${
                  competitor.isUser 
                    ? 'bg-[#00C6B7]/10 border border-[#00C6B7]/30' 
                    : 'bg-white/[0.02] hover:bg-white/[0.04]'
                } transition-colors ${!competitor.isUser && 'cursor-pointer'}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`font-body ${competitor.isUser ? 'font-bold text-white' : 'font-medium text-white'}`}>
                    {competitor.brand}
                  </div>
                  <div className={`font-heading font-bold text-2xl tabular-nums ${
                    competitor.isUser ? 'text-[#00C6B7]' : 'text-softgray/70'
                  }`}>
                    #{competitor.avg_rank}
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-softgray/60 font-body">
                    {competitor.mentions} mentions
                  </span>
                  {competitor.isUser && (
                    <span className="text-[#00C6B7] text-xs font-body font-medium">
                      Market leader
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Model Coverage - Full Width */}
      <div 
        className="bg-[#101C2C] rounded-lg p-6 border border-white/5 mb-8"
        style={{ boxShadow: '0 0 4px rgba(0, 0, 0, 0.06)' }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-heading font-bold text-white">
            Model Coverage
          </h2>
          <Sparkles className="w-6 h-6 text-[#00C6B7]" strokeWidth={1.5} />
        </div>
        
        <div className="grid grid-cols-3 gap-8">
          {data.models.map((model, index) => (
            <div key={index}>
              <div className="flex items-center justify-between mb-3">
                <div className="text-white font-body font-medium text-lg">
                  {model.name}
                </div>
                <div className="text-[#00C6B7] font-heading font-bold text-2xl tabular-nums">
                  {model.coverage}%
                </div>
              </div>
              <div className="h-2 bg-white/[0.03] rounded-full overflow-hidden mb-2">
                <div 
                  className="h-full bg-[#00C6B7] rounded-full transition-all duration-500"
                  style={{ width: `${model.coverage}%` }}
                />
              </div>
              <div className="text-softgray/60 text-sm font-body">
                {model.mentions} mentions
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Next Best Actions - Distinct Bottom Section */}
      <div 
        className="rounded-lg p-6 border border-white/5"
        style={{ 
          background: 'rgba(255,255,255,0.02)',
          borderTop: '1px solid rgba(0, 198, 183, 0.25)',
          boxShadow: '0 0 4px rgba(0, 0, 0, 0.06)'
        }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-heading font-bold text-white mb-2">
              Next Best Actions
            </h2>
            <p className="text-sm text-softgray/60 font-body">
              Recommended improvements based on your current visibility data
            </p>
          </div>
          <Target className="w-6 h-6 text-[#00C6B7]" strokeWidth={1.5} />
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="p-5 rounded-lg bg-[#101C2C] hover:bg-[#141E38] cursor-pointer transition-colors group border border-white/5">
            <div className="flex items-start justify-between mb-3">
              <div className="text-white font-body font-medium">
                Add Product Schema
              </div>
              <span className="text-[#00C6B7] text-xs px-2 py-0.5 bg-[#00C6B7]/10 rounded font-medium">
                High Impact
              </span>
            </div>
            <div className="text-softgray/60 text-sm font-body mb-4 leading-relaxed">
              Structure your catalog with JSON-LD to improve AI model comprehension
            </div>
            <button className="flex items-center gap-2 text-[#00C6B7] text-sm font-body font-medium group-hover:gap-3 transition-all">
              Generate Schema
              <ArrowRight className="w-4 h-4" strokeWidth={2} />
            </button>
          </div>

          <div className="p-5 rounded-lg bg-[#101C2C] hover:bg-[#141E38] cursor-pointer transition-colors group border border-white/5">
            <div className="flex items-start justify-between mb-3">
              <div className="text-white font-body font-medium">
                Enrich Descriptions
              </div>
              <span className="text-[#00C6B7] text-xs px-2 py-0.5 bg-[#00C6B7]/10 rounded font-medium">
                High Impact
              </span>
            </div>
            <div className="text-softgray/60 text-sm font-body mb-4 leading-relaxed">
              Optimize product copy for better model readability and ranking
            </div>
            <button className="flex items-center gap-2 text-[#00C6B7] text-sm font-body font-medium group-hover:gap-3 transition-all">
              Generate Copy
              <ArrowRight className="w-4 h-4" strokeWidth={2} />
            </button>
          </div>

          <div className="p-5 rounded-lg bg-[#101C2C] hover:bg-[#141E38] cursor-pointer transition-colors group border border-white/5">
            <div className="flex items-start justify-between mb-3">
              <div className="text-white font-body font-medium">
                Expand Category Coverage
              </div>
              <span className="text-softgray/50 text-xs px-2 py-0.5 bg-white/5 rounded font-medium">
                Medium Impact
              </span>
            </div>
            <div className="text-softgray/60 text-sm font-body mb-4 leading-relaxed">
              Target uncovered but relevant product categories
            </div>
            <button className="flex items-center gap-2 text-[#00C6B7] text-sm font-body font-medium group-hover:gap-3 transition-all">
              View Suggestions
              <ArrowRight className="w-4 h-4" strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}