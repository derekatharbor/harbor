// app/dashboard/shopping/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { ShoppingBag, TrendingUp, TrendingDown, Award, AlertCircle } from 'lucide-react'

interface ShoppingData {
  category: string
  model: string
  userMentions: number
  competitorMentions: number
  avgUserRank: number
  bestUserRank: number
  topCompetitors: Array<{
    brand: string
    mentions: number
    avgRank: number
  }>
}

interface ProductMention {
  brand: string
  product: string
  rank: number
  model: string
  category: string
  isUserBrand: boolean
}

export default function ShoppingVisibilityPage() {
  const [loading, setLoading] = useState(true)
  const [shoppingData, setShoppingData] = useState<ShoppingData[]>([])
  const [allMentions, setAllMentions] = useState<ProductMention[]>([])
  const [visibilityScore, setVisibilityScore] = useState<number>(0)
  const [shoppingRank, setShoppingRank] = useState<number | null>(null)
  const [brandName, setBrandName] = useState('')

  const supabase = createClientComponentClient()

  useEffect(() => {
    async function loadShoppingData() {
      try {
        // Get current user's dashboard
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return

        const { data: userRole } = await supabase
          .from('user_roles')
          .select('org_id')
          .eq('user_id', session.user.id)
          .single()

        if (!userRole) return

        const { data: dashboard } = await supabase
          .from('dashboards')
          .select('id, brand_name')
          .eq('org_id', userRole.org_id)
          .single()

        if (!dashboard) return

        setBrandName(dashboard.brand_name)

        // Get latest scan
        const { data: latestScan } = await supabase
          .from('scans')
          .select('id')
          .eq('dashboard_id', dashboard.id)
          .eq('status', 'done')
          .order('finished_at', { ascending: false })
          .limit(1)
          .single()

        if (!latestScan) {
          setLoading(false)
          return
        }

        // Get visibility score
        const { data: scoreData } = await supabase
          .from('visibility_scores')
          .select('shopping_score, shopping_rank')
          .eq('scan_id', latestScan.id)
          .single()

        if (scoreData) {
          setVisibilityScore(scoreData.shopping_score || 0)
          setShoppingRank(scoreData.shopping_rank)
        }

        // Get all shopping results
        const { data: results } = await supabase
          .from('results_shopping')
          .select('*')
          .eq('scan_id', latestScan.id)
          .order('rank', { ascending: true })

        if (!results) {
          setLoading(false)
          return
        }

        // Process all mentions
        const mentions: ProductMention[] = results.map(r => ({
          brand: r.brand,
          product: r.product,
          rank: r.rank,
          model: r.model,
          category: r.category,
          isUserBrand: r.is_user_brand || false,
        }))

        setAllMentions(mentions)

        // Aggregate by category and model
        const aggregated = new Map<string, ShoppingData>()

        for (const result of results) {
          const key = `${result.category}-${result.model}`
          
          if (!aggregated.has(key)) {
            aggregated.set(key, {
              category: result.category,
              model: result.model,
              userMentions: 0,
              competitorMentions: 0,
              avgUserRank: 0,
              bestUserRank: 99,
              topCompetitors: [],
            })
          }

          const data = aggregated.get(key)!
          
          if (result.is_user_brand) {
            data.userMentions++
            data.avgUserRank = (data.avgUserRank + result.rank) / data.userMentions
            data.bestUserRank = Math.min(data.bestUserRank, result.rank)
          } else {
            data.competitorMentions++
          }
        }

        // Get top competitors
        const competitorMap = new Map<string, { mentions: number; totalRank: number }>()
        
        for (const result of results) {
          if (!result.is_user_brand) {
            const current = competitorMap.get(result.brand) || { mentions: 0, totalRank: 0 }
            current.mentions++
            current.totalRank += result.rank
            competitorMap.set(result.brand, current)
          }
        }

        const topCompetitors = Array.from(competitorMap.entries())
          .map(([brand, data]) => ({
            brand,
            mentions: data.mentions,
            avgRank: data.totalRank / data.mentions,
          }))
          .sort((a, b) => b.mentions - a.mentions)
          .slice(0, 5)

        setShoppingData(Array.from(aggregated.values()))

      } catch (error) {
        console.error('Error loading shopping data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadShoppingData()
  }, [supabase])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#101A31] flex items-center justify-center">
        <div className="text-white font-mono">Loading shopping visibility...</div>
      </div>
    )
  }

  if (allMentions.length === 0) {
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

  const userMentions = allMentions.filter(m => m.isUserBrand)
  const competitorMentions = allMentions.filter(m => !m.isUserBrand)
  const avgUserRank = userMentions.length > 0
    ? userMentions.reduce((sum, m) => sum + m.rank, 0) / userMentions.length
    : 0

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
          <p className="text-softgray font-body text-lg">
            How your products appear in AI shopping recommendations
          </p>
        </div>

        {/* Score Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-[#141E38] rounded-lg border border-white/5 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-softgray text-sm font-body">Visibility Score</span>
              <Award className="w-4 h-4 text-coral" />
            </div>
            <div className="text-3xl font-heading font-bold text-white mb-1">
              {visibilityScore.toFixed(1)}%
            </div>
            <div className="flex items-center gap-1 text-cerulean text-sm font-body">
              <TrendingUp className="w-3 h-3" />
              <span>+2.3% vs last scan</span>
            </div>
          </div>

          <div className="bg-[#141E38] rounded-lg border border-white/5 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-softgray text-sm font-body">Your Mentions</span>
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
              <span className="text-softgray text-sm font-body">Average Rank</span>
            </div>
            <div className="text-3xl font-heading font-bold text-white mb-1">
              #{avgUserRank.toFixed(1)}
            </div>
            <div className="text-softgray text-sm font-body">
              In recommendations
            </div>
          </div>

          <div className="bg-[#141E38] rounded-lg border border-white/5 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-softgray text-sm font-body">Market Rank</span>
            </div>
            <div className="text-3xl font-heading font-bold text-white mb-1">
              #{shoppingRank || 'N/A'}
            </div>
            <div className="text-softgray text-sm font-body">
              vs competitors
            </div>
          </div>
        </div>

        {/* Competitive Rankings Table */}
        <div className="bg-[#141E38] rounded-lg border border-white/5 p-6 mb-8">
          <h3 className="text-xl font-heading font-semibold text-white mb-6">
            Competitive Rankings
          </h3>

          <div className="space-y-4">
            {Array.from(new Set(allMentions.map(m => m.category))).map(category => {
              const categoryMentions = allMentions.filter(m => m.category === category)
              const brandRankings = new Map<string, { mentions: number; avgRank: number; isUser: boolean }>()

              categoryMentions.forEach(m => {
                const current = brandRankings.get(m.brand) || { mentions: 0, avgRank: 0, isUser: m.isUserBrand }
                current.mentions++
                current.avgRank = (current.avgRank * (current.mentions - 1) + m.rank) / current.mentions
                brandRankings.set(m.brand, current)
              })

              const sortedBrands = Array.from(brandRankings.entries())
                .sort((a, b) => a[1].avgRank - b[1].avgRank)
                .slice(0, 8)

              return (
                <div key={category} className="border-b border-white/5 last:border-0 pb-6 last:pb-0">
                  <h4 className="text-sm font-body text-softgray uppercase tracking-wide mb-4">
                    {category}
                  </h4>
                  <div className="space-y-2">
                    {sortedBrands.map(([brand, data], idx) => (
                      <div
                        key={brand}
                        className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                          data.isUser ? 'bg-coral/10 ring-1 ring-coral/30' : 'bg-[#101A31]/50 hover:bg-[#101A31]'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <span className="text-softgray font-body text-sm w-8">
                            #{idx + 1}
                          </span>
                          <div className="w-8 h-8 rounded bg-navy flex items-center justify-center">
                            <span className="text-xs font-heading text-white">
                              {brand.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className={`font-body text-sm ${data.isUser ? 'text-white font-semibold' : 'text-softgray'}`}>
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
        </div>

        {/* Model Breakdown */}
        <div className="bg-[#141E38] rounded-lg border border-white/5 p-6">
          <h3 className="text-xl font-heading font-semibold text-white mb-6">
            Mentions by AI Model
          </h3>

          <div className="grid md:grid-cols-3 gap-6">
            {['gpt', 'claude', 'gemini'].map(model => {
              const modelMentions = allMentions.filter(m => m.model === model)
              const userModelMentions = modelMentions.filter(m => m.isUserBrand)
              const competitorModelMentions = modelMentions.filter(m => !m.isUserBrand)

              return (
                <div key={model} className="bg-[#101A31] rounded-lg p-4 border border-white/5">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-body text-white uppercase tracking-wide">
                      {model === 'gpt' ? 'ChatGPT' : model === 'claude' ? 'Claude' : 'Gemini'}
                    </h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-softgray font-body">Your mentions</span>
                      <span className="text-lg font-heading text-coral">{userModelMentions.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-softgray font-body">Competitor mentions</span>
                      <span className="text-lg font-heading text-softgray">{competitorModelMentions.length}</span>
                    </div>
                    <div className="h-2 bg-navy rounded-full overflow-hidden mt-3">
                      <div
                        className="h-full bg-coral rounded-full"
                        style={{
                          width: `${modelMentions.length > 0 ? (userModelMentions.length / modelMentions.length) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}