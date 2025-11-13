// app/dashboard/shopping/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShoppingBag, TrendingUp, Award, AlertCircle, ArrowRight } from 'lucide-react'

interface ShoppingResult {
  model: string
  category: string
  product: string
  brand: string
  rank: number
  confidence: number
}

interface CompetitorRanking {
  brand: string
  mentions: number
  avgRank: number
  isUser: boolean
}

export default function ShoppingVisibilityPage() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch('/api/scan/latest')
        const scanData = await response.json()

        if (!scanData.hasScans) {
          router.push('/dashboard')
          return
        }

        setData(scanData)
      } catch (error) {
        console.error('Failed to load shopping data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#101A31] flex items-center justify-center">
        <div className="text-white font-body">Loading shopping visibility...</div>
      </div>
    )
  }

  if (!data || !data.hasScans) {
    return null
  }

  const results: ShoppingResult[] = data.results?.shopping || []
  const brandName = data.dashboard?.brandName || 'Your Brand'
  const shoppingScore = data.scores?.shopping_score || 0
  const marketRank = data.scores?.shopping_rank || 0

  // Calculate user mentions
  const userMentions = results.filter(r => 
    r.brand.toLowerCase() === brandName.toLowerCase()
  )

  const avgRank = userMentions.length > 0
    ? userMentions.reduce((sum, r) => sum + r.rank, 0) / userMentions.length
    : 0

  // Group by category for competitive analysis
  const categories = Array.from(new Set(results.map(r => r.category)))
  
  // Calculate competitor rankings
  const competitorMap = new Map<string, { mentions: number; totalRank: number }>()
  results.forEach(r => {
    const current = competitorMap.get(r.brand) || { mentions: 0, totalRank: 0 }
    current.mentions++
    current.totalRank += r.rank
    competitorMap.set(r.brand, current)
  })

  const competitorRankings: CompetitorRanking[] = Array.from(competitorMap.entries())
    .map(([brand, data]) => ({
      brand,
      mentions: data.mentions,
      avgRank: data.totalRank / data.mentions,
      isUser: brand.toLowerCase() === brandName.toLowerCase(),
    }))
    .sort((a, b) => a.avgRank - b.avgRank)

  // Group by model
  const byModel: Record<string, ShoppingResult[]> = {}
  results.forEach(r => {
    if (!byModel[r.model]) byModel[r.model] = []
    byModel[r.model].push(r)
  })

  const models = Object.keys(byModel)

  if (results.length === 0) {
    return (
      <div className="min-h-screen bg-[#101A31] p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-[#141E38] rounded-xl border border-white/5 p-12 text-center">
            <AlertCircle className="w-12 h-12 text-coral mx-auto mb-4" />
            <h2 className="text-xl font-heading font-semibold text-white mb-2">
              No shopping data yet
            </h2>
            <p className="text-softgray font-body">
              Run a scan to see how your products appear in AI shopping recommendations
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#101A31]">
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <ShoppingBag className="w-8 h-8 text-coral" />
            <h1 className="text-3xl font-heading font-bold text-white">
              Shopping Visibility
            </h1>
          </div>
          <p className="text-softgray font-body text-lg mb-2">
            How your products appear in AI shopping recommendations
          </p>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1 bg-teal/20 border border-teal/30 rounded-full">
              <div className="w-2 h-2 bg-teal rounded-full animate-pulse" />
              <span className="text-teal text-xs font-body uppercase tracking-wide">Live</span>
            </div>
            <p className="text-softgray/60 text-sm font-body">
              Last scan: {new Date(data.scan?.finishedAt || '').toLocaleString()}
            </p>
          </div>
        </div>

        {/* Score Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-[#141E38] rounded-lg border border-white/5 p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-teal/5 rounded-full blur-2xl" />
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-softgray text-sm font-body uppercase tracking-wide">
                  Visibility Score
                </span>
                <Award className="w-4 h-4 text-coral" />
              </div>
              <div className="text-3xl font-heading font-bold text-white mb-1">
                {shoppingScore.toFixed(1)}%
              </div>
              <div className="flex items-center gap-1 text-teal text-sm font-body">
                <TrendingUp className="w-3 h-3" />
                <span>+2.3% vs last scan</span>
              </div>
            </div>
          </div>

          <div className="bg-[#141E38] rounded-lg border border-white/5 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-softgray text-sm font-body uppercase tracking-wide">
                Your Mentions
              </span>
            </div>
            <div className="text-3xl font-heading font-bold text-white mb-1">
              {userMentions.length}
            </div>
            <div className="text-softgray text-sm font-body">
              Across all models
            </div>
          </div>

          <div className="bg-[#141E38] rounded-lg border border-white/5 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-softgray text-sm font-body uppercase tracking-wide">
                Average Rank
              </span>
            </div>
            <div className="text-3xl font-heading font-bold text-white mb-1">
              #{avgRank > 0 ? avgRank.toFixed(1) : 'N/A'}
            </div>
            <div className="text-softgray text-sm font-body">
              In recommendations
            </div>
          </div>

          <div className="bg-[#141E38] rounded-lg border border-white/5 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-softgray text-sm font-body uppercase tracking-wide">
                Market Rank
              </span>
            </div>
            <div className="text-3xl font-heading font-bold text-white mb-1">
              #{marketRank || competitorRankings.findIndex(c => c.isUser) + 1}
            </div>
            <div className="text-softgray text-sm font-body">
              of {competitorRankings.length} brands
            </div>
          </div>
        </div>

        {/* Competitive Rankings */}
        <div className="bg-[#141E38] rounded-lg border border-white/5 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-heading font-semibold text-white">
              Competitive Rankings
            </h3>
            <span className="text-sm text-softgray font-body">
              {categories.length} categories analyzed
            </span>
          </div>

          {categories.map(category => {
            const categoryResults = results.filter(r => r.category === category)
            const categoryCompetitors = new Map<string, { mentions: number; avgRank: number; isUser: boolean }>()
            
            categoryResults.forEach(r => {
              const current = categoryCompetitors.get(r.brand) || { mentions: 0, avgRank: 0, isUser: false }
              current.mentions++
              current.avgRank = (current.avgRank * (current.mentions - 1) + r.rank) / current.mentions
              current.isUser = r.brand.toLowerCase() === brandName.toLowerCase()
              categoryCompetitors.set(r.brand, current)
            })

            const sortedBrands = Array.from(categoryCompetitors.entries())
              .sort((a, b) => a[1].avgRank - b[1].avgRank)
              .slice(0, 8)

            return (
              <div key={category} className="border-b border-white/5 last:border-0 pb-6 mb-6 last:mb-0">
                <h4 className="text-sm font-body text-softgray uppercase tracking-wide mb-4">
                  {category}
                </h4>
                <div className="space-y-2">
                  {sortedBrands.map(([brand, data], idx) => (
                    <div
                      key={brand}
                      className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                        data.isUser 
                          ? 'bg-coral/10 ring-1 ring-coral/30' 
                          : 'bg-[#101A31]/50 hover:bg-[#101A31]'
                      }`}
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <span className="text-softgray font-body text-sm w-8">
                          #{idx + 1}
                        </span>
                        <div className="w-8 h-8 rounded bg-navy flex items-center justify-center">
                          <span className="text-xs font-heading text-white">
                            {brand.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className={`font-body text-sm flex-1 ${
                          data.isUser ? 'text-white font-semibold' : 'text-softgray'
                        }`}>
                          {brand}
                          {data.isUser && (
                            <span className="ml-2 text-xs text-coral">(You)</span>
                          )}
                        </span>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <div className="text-xs text-softgray font-body mb-1">Avg Rank</div>
                          <div className="text-sm font-heading text-white">
                            #{data.avgRank.toFixed(1)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-softgray font-body mb-1">Mentions</div>
                          <div className="text-sm font-heading text-white">{data.mentions}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* Model Breakdown */}
        <div className="bg-[#141E38] rounded-lg border border-white/5 p-6 mb-8">
          <h3 className="text-xl font-heading font-semibold text-white mb-6">
            Product Mentions by Model
          </h3>

          <div className="grid md:grid-cols-3 gap-6">
            {models.map(model => {
              const modelResults = byModel[model]
              const userModelMentions = modelResults.filter(r => 
                r.brand.toLowerCase() === brandName.toLowerCase()
              )
              const competitorModelMentions = modelResults.filter(r => 
                r.brand.toLowerCase() !== brandName.toLowerCase()
              )

              const modelName = model === 'ChatGPT' ? 'ChatGPT' : 
                               model === 'Claude' ? 'Claude' : 
                               model === 'Gemini' ? 'Gemini' : model

              return (
                <div key={model} className="bg-[#101A31] rounded-lg p-4 border border-white/5">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-body text-white uppercase tracking-wide">
                      {modelName}
                    </h4>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-softgray font-body">Your mentions</span>
                      <span className="text-lg font-heading text-coral">
                        {userModelMentions.length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-softgray font-body">Competitor mentions</span>
                      <span className="text-lg font-heading text-softgray">
                        {competitorModelMentions.length}
                      </span>
                    </div>
                    <div className="h-2 bg-navy rounded-full overflow-hidden mt-3">
                      <div
                        className="h-full bg-coral rounded-full transition-all duration-1000"
                        style={{
                          width: `${modelResults.length > 0 
                            ? (userModelMentions.length / modelResults.length) * 100 
                            : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Optimize Section */}
        <div className="bg-[#141E38] rounded-lg border border-white/5 p-6">
          <h3 className="text-xl font-heading font-semibold text-white mb-2">
            Optimize Your Shopping Visibility
          </h3>
          <p className="text-softgray font-body text-sm mb-6">
            Recommended actions to improve your product mentions in AI shopping results
          </p>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-[#101A31] rounded-lg p-4 border border-white/5 hover:border-teal/30 transition-all cursor-pointer group">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-teal/20 flex items-center justify-center text-teal">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-teal/20 text-teal font-body">
                  +15% potential
                </span>
              </div>
              <h4 className="text-white font-body font-semibold mb-2 text-sm">
                Add Product Schema
              </h4>
              <p className="text-softgray text-xs font-body mb-3">
                Implement Product JSON-LD with name, brand, SKU, and pricing to...
              </p>
              <div className="flex items-center gap-2 text-teal text-xs font-body group-hover:gap-3 transition-all">
                <span>Generate Schema</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </div>

            <div className="bg-[#101A31] rounded-lg p-4 border border-white/5 hover:border-cerulean/30 transition-all cursor-pointer group">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-cerulean/20 flex items-center justify-center text-cerulean">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                  </svg>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-cerulean/20 text-cerulean font-body">
                  +8% potential
                </span>
              </div>
              <h4 className="text-white font-body font-semibold mb-2 text-sm">
                Enrich Descriptions
              </h4>
              <p className="text-softgray text-xs font-body mb-3">
                Expand product descriptions to 120-150 words with AI-readable...
              </p>
              <div className="flex items-center gap-2 text-cerulean text-xs font-body group-hover:gap-3 transition-all">
                <span>View Guide</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </div>

            <div className="bg-[#101A31] rounded-lg p-4 border border-white/5 hover:border-coral/30 transition-all cursor-pointer group">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-coral/20 flex items-center justify-center text-coral">
                  <Award className="w-5 h-5" />
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-coral/20 text-coral font-body">
                  +12% potential
                </span>
              </div>
              <h4 className="text-white font-body font-semibold mb-2 text-sm">
                Add Review Schema
              </h4>
              <p className="text-softgray text-xs font-body mb-3">
                Include aggregateRating and Review schema to build trust...
              </p>
              <div className="flex items-center gap-2 text-coral text-xs font-body group-hover:gap-3 transition-all">
                <span>Generate Schema</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}