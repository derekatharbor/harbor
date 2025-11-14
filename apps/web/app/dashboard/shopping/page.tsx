// apps/web/app/dashboard/shopping/page.tsx

'use client'

import { useEffect, useState } from 'react'
import { ShoppingBag, TrendingUp, Trophy, Target, Sparkles, ArrowRight } from 'lucide-react'
import ScanButton from '@/components/scan/ScanButton'
import ScanProgressModal from '@/components/scan/ScanProgressModal'
import { useBrand } from '@/contexts/BrandContext'

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
  const { currentDashboard } = useBrand()
  
  const [data, setData] = useState<ShoppingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showScanModal, setShowScanModal] = useState(false)
  const [currentScanId, setCurrentScanId] = useState<string | null>(null)
  const [hasScans, setHasScans] = useState(false)

  useEffect(() => {
    async function fetchData() {
      if (!currentDashboard) {
        setLoading(false)
        return
      }

      try {
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
        const shopping = scanData.shopping || {}
        
        const shoppingData: ShoppingData = {
          visibility_score: shopping.shopping_visibility || 0,
          visibility_delta: '+2.3%', // TODO: Calculate from previous scan
          total_mentions: shopping.total_mentions || 0,
          mentions_delta: '+18', // TODO: Calculate from previous scan
          avg_rank: shopping.competitors?.find((c: any) => c.isUser)?.avg_rank || 0,
          rank_delta: 'Improved', // TODO: Calculate from previous scan
          market_position: shopping.competitors?.findIndex((c: any) => c.isUser) + 1 || 0,
          position_delta: 'Holding', // TODO: Calculate from previous scan
          last_scan: scanData.last_scan,
          categories: shopping.categories || [],
          competitors: shopping.competitors || [],
          models: shopping.models || []
        }
        
        setData(shoppingData)
      } catch (error) {
        console.error('Error fetching shopping data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [currentDashboard])

  const handleStartScan = async () => {
    try {
      const response = await fetch('/api/scan/start', {
        method: 'POST',
      })

      const data = await response.json()

      if (data.success) {
        setCurrentScanId(data.scanId)
        setShowScanModal(true)
      }
    } catch (error) {
      console.error('Failed to start scan:', error)
    }
  }

  // NUCLEAR CURSOR FIX
  useEffect(() => {
    const style = document.createElement('style')
    style.innerHTML = `
      .shopping-clickable { cursor: pointer !important; }
      .shopping-clickable:hover { cursor: pointer !important; }
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

  // Empty state - no scans yet
  if (!hasScans || !data) {
    return (
      <div>
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-8 h-8 text-[#00C6B7]" strokeWidth={1.5} />
              <h1 className="text-4xl font-heading font-bold text-white">
                Shopping Visibility
              </h1>
            </div>

            {/* Scan Button */}
            <ScanButton onScanStart={handleStartScan} />
          </div>
          
          <p className="text-sm text-softgray/60 mb-2">
            How your products surface in AI shopping recommendations across models
          </p>
        </div>

        {/* Empty State */}
        <div 
          className="bg-[#101C2C] rounded-lg p-12 border border-white/5 text-center"
          style={{ boxShadow: '0 0 4px rgba(0, 0, 0, 0.06)' }}
        >
          <div className="max-w-md mx-auto">
            <ShoppingBag className="w-16 h-16 text-[#00C6B7] mx-auto mb-6 opacity-40" strokeWidth={1.5} />
            <h2 className="text-2xl font-heading font-bold text-white mb-3">
              No Scan Data Yet
            </h2>
            <p className="text-softgray/60 font-body text-sm mb-6 leading-relaxed">
              Run your first scan to see how AI models recommend your products across shopping queries. 
              We'll analyze ChatGPT, Claude, and Gemini to show where your brand appears.
            </p>
            <button
              onClick={handleStartScan}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#00C6B7] hover:brightness-110 text-white rounded-lg font-body font-medium transition-all cursor-pointer"
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
            <ShoppingBag className="w-8 h-8 text-[#00C6B7]" strokeWidth={1.5} />
            <h1 className="text-4xl font-heading font-bold text-white">
              Shopping Visibility
            </h1>
          </div>

          {/* Scan Button */}
          <ScanButton onScanStart={handleStartScan} />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-softgray/60 mb-2">
              How your products surface in AI shopping recommendations across models
            </p>
            <p className="text-sm text-softgray/70 italic">
              {data.categories.length > 0 
                ? `AI models recommend your brand in ${data.categories.length} product categories`
                : 'Analyzing product category coverage...'}
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
              <div className="text-softgray/60 text-xs font-body mb-1">
                Visibility Score
              </div>
              <div className="text-3xl font-heading font-bold text-white tabular-nums">
                {data.visibility_score.toFixed(1)}%
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-sm">
            <span className="text-[#00C6B7] font-body font-medium">
              {data.visibility_delta}
            </span>
            <span className="text-softgray/50 text-xs">vs last scan</span>
          </div>
        </div>

        {/* Total Mentions */}
        <div 
          className="bg-[#101C2C] rounded-lg p-6 border border-white/5"
          style={{ boxShadow: '0 0 4px rgba(0, 0, 0, 0.06)' }}
        >
          <div className="flex items-start gap-3 mb-4">
            <div className="p-2 bg-white/5 rounded-lg">
              <Trophy className="w-5 h-5 text-white/60" strokeWidth={1.5} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-softgray/60 text-xs font-body mb-1">
                Total Mentions
              </div>
              <div className="text-3xl font-heading font-bold text-white tabular-nums">
                {data.total_mentions}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-sm">
            <span className="text-[#00C6B7] font-body font-medium">
              {data.mentions_delta}
            </span>
            <span className="text-softgray/50 text-xs">vs last scan</span>
          </div>
        </div>

        {/* Average Rank */}
        <div 
          className="bg-[#101C2C] rounded-lg p-6 border border-white/5"
          style={{ boxShadow: '0 0 4px rgba(0, 0, 0, 0.06)' }}
        >
          <div className="flex items-start gap-3 mb-4">
            <div className="p-2 bg-white/5 rounded-lg">
              <Target className="w-5 h-5 text-white/60" strokeWidth={1.5} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-softgray/60 text-xs font-body mb-1">
                Average Rank
              </div>
              <div className="text-3xl font-heading font-bold text-white tabular-nums">
                #{data.avg_rank.toFixed(1)}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-sm">
            <span className="text-[#00C6B7] font-body font-medium">
              {data.rank_delta}
            </span>
            <span className="text-softgray/50 text-xs">trending</span>
          </div>
        </div>

        {/* Market Position */}
        <div 
          className="bg-[#101C2C] rounded-lg p-6 border border-white/5"
          style={{ boxShadow: '0 0 4px rgba(0, 0, 0, 0.06)' }}
        >
          <div className="flex items-start gap-3 mb-4">
            <div className="p-2 bg-white/5 rounded-lg">
              <Sparkles className="w-5 h-5 text-white/60" strokeWidth={1.5} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-softgray/60 text-xs font-body mb-1">
                Market Position
              </div>
              <div className="text-3xl font-heading font-bold text-white tabular-nums">
                #{data.market_position}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-sm">
            <span className="text-[#00C6B7] font-body font-medium">
              {data.position_delta}
            </span>
            <span className="text-softgray/50 text-xs">position</span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-2 gap-6 mb-8">
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
            <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-2">
              {data.categories.map((category, index) => (
                <div 
                  key={index}
                  className="p-3.5 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-body font-medium text-sm mb-1 truncate">
                        {category.name}
                      </div>
                      <div className="flex items-center gap-3 text-xs">
                        <span className="text-softgray/60 font-body">
                          Rank #{category.rank}
                        </span>
                        <span className="text-softgray/40">•</span>
                        <span className="text-softgray/60 font-body">
                          {category.mentions} mentions
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-softgray/50 text-xs font-body">
                      {category.models.slice(0, 2).join(', ')}
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
          
          {data.competitors.length > 0 ? (
            <div className="space-y-2.5">
              {data.competitors.map((competitor, index) => (
                <div 
                  key={index} 
                  className={competitor.isUser ? '' : 'shopping-clickable'}
                  style={{ cursor: competitor.isUser ? 'default' : 'pointer' }}
                >
                  <div className={`p-3.5 rounded-lg ${
                    competitor.isUser 
                      ? 'bg-[#00C6B7]/10 border border-[#00C6B7]/30' 
                      : 'bg-white/[0.02] hover:bg-white/[0.04]'
                  } transition-colors`}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className={`font-body text-sm ${competitor.isUser ? 'font-bold text-white' : 'font-medium text-white'}`}>
                        {competitor.brand}
                      </div>
                      <div className={`font-heading font-bold text-xl tabular-nums ${
                        competitor.isUser ? 'text-[#00C6B7]' : 'text-softgray/70'
                      }`}>
                        #{competitor.avg_rank}
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-softgray/60 font-body text-xs">
                        {competitor.mentions} mentions
                      </span>
                      {competitor.isUser && (
                        <span className="text-[#00C6B7] text-xs font-body font-medium">
                          Your brand
                        </span>
                      )}
                    </div>
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

      {/* Model Coverage - Full Width */}
      {data.models.length > 0 && (
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
      )}

      {/* Recommended Improvements - Distinct Bottom Section */}
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
              Recommended Improvements
            </h2>
            <p className="text-sm text-softgray/60 font-body">
              High-impact actions to strengthen your shopping visibility
            </p>
          </div>
          <Target className="w-6 h-6 text-[#00C6B7]" strokeWidth={1.5} />
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div 
            className="shopping-clickable p-5 rounded-lg bg-[#101C2C] hover:bg-[#141E38] transition-colors group border border-white/5"
            style={{ cursor: 'pointer' }}
          >
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

          <div 
            className="shopping-clickable p-5 rounded-lg bg-[#101C2C] hover:bg-[#141E38] transition-colors group border border-white/5"
            style={{ cursor: 'pointer' }}
          >
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

          <div 
            className="shopping-clickable p-5 rounded-lg bg-[#101C2C] hover:bg-[#141E38] transition-colors group border border-white/5"
            style={{ cursor: 'pointer' }}
          >
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

      {/* Scan Progress Modal */}
      <ScanProgressModal
        isOpen={showScanModal}
        onClose={() => setShowScanModal(false)}
        scanId={currentScanId}
      />
    </div>
  )
}