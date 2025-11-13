// apps/web/app/dashboard/shopping/page.tsx

'use client'

import { useEffect, useState } from 'react'
import { ShoppingBag, TrendingUp, Trophy, Target, RefreshCw, Calendar } from 'lucide-react'

interface ShoppingData {
  visibility_score: number
  total_mentions: number
  avg_rank: number
  market_position: number
  last_scan: string | null
  categories: Array<{
    name: string
    rank: number
    mentions: number
    models: string[]
  }>
  competitors: Array<{
    brand: string
    mentions: number
    avg_rank: number
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
          visibility_score: scanData.shopping_visibility || 87,
          total_mentions: scanData.total_mentions || 234,
          avg_rank: 2.3,
          market_position: 3,
          last_scan: scanData.last_scan,
          categories: scanData.shopping_results?.slice(0, 8) || [],
          competitors: [
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
        year: 'numeric'
      })
    } catch {
      return 'No recent scan'
    }
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
    <div className="stagger-children">
      {/* Page Header - Consistent Padding */}
      <div className="page-header pt-6 pb-5 px-7 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <ShoppingBag className="w-6 h-6 text-accent" strokeWidth={1.5} />
              <h1 className="text-3xl font-heading font-bold text-white tracking-tight">
                Shopping Visibility
              </h1>
            </div>
            <p className="text-softgray/70 text-sm font-body mt-2">
              How your products surface in AI shopping recommendations
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
              Visibility Score
            </div>
          </div>
          <div className="text-4xl font-heading font-bold text-white tabular-nums">
            {data.visibility_score}
            <span className="text-xl text-softgray/40">%</span>
          </div>
          <div className="delta-positive text-sm mt-2 font-body" style={{ textShadow: '0 0 8px rgba(var(--pageAccent-rgb), 0.5)' }}>
            +2.3%
          </div>
        </div>

        <div className="card-L2 p-5">
          <div className="flex items-center gap-2 mb-2 text-softgray/60">
            <ShoppingBag className="w-4 h-4" strokeWidth={1.5} />
            <div className="text-xs font-body uppercase tracking-wide">
              Total Mentions
            </div>
          </div>
          <div className="text-4xl font-heading font-bold text-white tabular-nums">
            {data.total_mentions}
          </div>
          <div className="delta-positive text-sm mt-2 font-body">
            +18 this week
          </div>
        </div>

        <div className="card-L2 p-5">
          <div className="flex items-center gap-2 mb-2 text-softgray/60">
            <Trophy className="w-4 h-4" strokeWidth={1.5} />
            <div className="text-xs font-body uppercase tracking-wide">
              Avg Rank
            </div>
          </div>
          <div className="text-4xl font-heading font-bold text-white tabular-nums">
            #{data.avg_rank}
          </div>
          <div className="delta-positive text-sm mt-2 font-body">
            Improved
          </div>
        </div>

        <div className="card-L2 p-5">
          <div className="flex items-center gap-2 mb-2 text-softgray/60">
            <Target className="w-4 h-4" strokeWidth={1.5} />
            <div className="text-xs font-body uppercase tracking-wide">
              Market Position
            </div>
          </div>
          <div className="text-4xl font-heading font-bold text-white tabular-nums">
            #{data.market_position}
          </div>
          <div className="text-softgray/60 text-xs mt-2 font-body">
            In category
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Category Rankings */}
          <div className="card-L2 p-6">
            <h2 className="text-base font-heading font-semibold text-white mb-4 flex items-center gap-2 uppercase tracking-wide text-softgray/80">
              <Trophy className="w-5 h-5 text-accent" strokeWidth={1.5} />
              Category Rankings
            </h2>
            
            <div className="space-y-3">
              {data.categories.length > 0 ? (
                data.categories.map((category, index) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-navy-lighter/50 hover:bg-navy-lighter transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="text-2xl font-heading font-bold text-accent tabular-nums">
                        #{category.rank}
                      </div>
                      <div>
                        <div className="text-white font-body font-medium mb-0.5">
                          {category.name}
                        </div>
                        <div className="text-softgray/60 text-xs font-body">
                          {category.mentions} mentions • {category.models?.length || 3} models
                        </div>
                      </div>
                    </div>
                    <div className="text-accent text-xs font-body">
                      {category.models?.join(', ') || 'ChatGPT, Claude'}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-softgray/60 text-sm font-body text-center py-8">
                  No category data yet — updates after next scan
                </div>
              )}
            </div>
          </div>

          {/* Model Breakdown */}
          <div className="card-L2 p-6">
            <h2 className="text-base font-heading font-semibold text-white mb-4 flex items-center gap-2 uppercase tracking-wide text-softgray/80">
              <Target className="w-5 h-5 text-accent" strokeWidth={1.5} />
              Model Coverage
            </h2>
            
            <div className="space-y-4">
              {data.models.map((model, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-white font-body font-medium text-sm">
                      {model.name}
                    </div>
                    <div className="text-softgray/60 text-xs font-body tabular-nums">
                      {model.mentions} mentions • {model.coverage}%
                    </div>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-bar-fill"
                      style={{ width: `${model.coverage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Competitive Rankings */}
          <div className="card-L2 p-6">
            <h2 className="text-base font-heading font-semibold text-white mb-4 flex items-center gap-2 uppercase tracking-wide text-softgray/80">
              <TrendingUp className="w-5 h-5 text-accent" strokeWidth={1.5} />
              Competitive Position
            </h2>
            
            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-accent/10 border border-accent/30">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-white font-body font-bold">
                    Your Brand
                  </div>
                  <div className="text-accent font-heading font-bold text-2xl tabular-nums">
                    #{data.avg_rank}
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-softgray/60 font-body">
                    {data.total_mentions} mentions
                  </span>
                  <span className="delta-positive font-body text-xs">
                    Market leader
                  </span>
                </div>
              </div>

              {data.competitors.map((competitor, index) => (
                <div key={index} className="p-4 rounded-lg bg-navy-lighter/50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-white font-body font-medium">
                      {competitor.brand}
                    </div>
                    <div className="text-softgray/70 font-heading font-bold text-xl tabular-nums">
                      #{competitor.avg_rank}
                    </div>
                  </div>
                  <div className="text-softgray/60 text-sm font-body">
                    {competitor.mentions} mentions
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Optimize Actions */}
          <div className="card-L2 p-6 border-l-2 border-accent">
            <h2 className="text-base font-heading font-semibold text-white mb-4 flex items-center gap-2 uppercase tracking-wide text-softgray/80">
              <Target className="w-5 h-5 text-accent" strokeWidth={1.5} />
              Optimization
            </h2>
            
            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-navy-lighter/50 hover:bg-navy-lighter cursor-pointer transition-colors">
                <div className="text-white font-body font-medium mb-1 text-sm">
                  Add Product Schema
                </div>
                <div className="text-softgray/60 text-xs font-body mb-3">
                  Structure your catalog for AI comprehension
                </div>
                <button className="text-accent text-xs font-body font-medium hover:underline">
                  Generate Schema →
                </button>
              </div>

              <div className="p-4 rounded-lg bg-navy-lighter/50 hover:bg-navy-lighter cursor-pointer transition-colors">
                <div className="text-white font-body font-medium mb-1 text-sm">
                  Enrich Descriptions
                </div>
                <div className="text-softgray/60 text-xs font-body mb-3">
                  Optimize product copy for model readability
                </div>
                <button className="text-accent text-xs font-body font-medium hover:underline">
                  Generate Copy →
                </button>
              </div>

              <div className="p-4 rounded-lg bg-navy-lighter/50 hover:bg-navy-lighter cursor-pointer transition-colors">
                <div className="text-white font-body font-medium mb-1 text-sm">
                  Category Coverage
                </div>
                <div className="text-softgray/60 text-xs font-body mb-3">
                  Target uncovered but relevant categories
                </div>
                <button className="text-accent text-xs font-body font-medium hover:underline">
                  View Suggestions →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}