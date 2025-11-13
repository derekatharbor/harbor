'use client'

import { useEffect, useState } from 'react'
import { ShoppingBag, TrendingUp, Trophy, Target } from 'lucide-react'

interface ShoppingData {
  visibility_score: number
  total_mentions: number
  avg_rank: number
  market_position: number
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
        
        // Map scan data to shopping format
        const shoppingData: ShoppingData = {
          visibility_score: scanData.shopping_visibility || 87,
          total_mentions: scanData.total_mentions || 234,
          avg_rank: 2.3,
          market_position: 3,
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-softgray/60 font-body">Loading shopping data...</div>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="stagger-children">
      {/* Page Header with Accent Line (Aqua) */}
      <div className="mb-8 page-header pt-8">
        <div className="flex items-center gap-3 mb-3">
          <ShoppingBag className="w-8 h-8 text-accent" />
          <h1 className="text-3xl font-heading font-bold text-white">
            Shopping Visibility
          </h1>
        </div>
        <p className="text-softgray/70 text-sm font-body">
          How your products surface in AI shopping recommendations
        </p>
      </div>

      {/* Score Cards Row */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="card-L2 card-fade-in p-6">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-accent" />
            <div className="text-xs text-softgray/60 font-body uppercase">
              Visibility Score
            </div>
          </div>
          <div className="text-4xl font-heading font-bold text-white">
            {data.visibility_score}%
          </div>
          <div className="delta-positive text-sm mt-2">
            +2.3% vs last week
          </div>
        </div>

        <div className="card-L2 card-fade-in p-6">
          <div className="flex items-center gap-2 mb-2">
            <ShoppingBag className="w-4 h-4 text-accent" />
            <div className="text-xs text-softgray/60 font-body uppercase">
              Total Mentions
            </div>
          </div>
          <div className="text-4xl font-heading font-bold text-white">
            {data.total_mentions}
          </div>
          <div className="delta-positive text-sm mt-2">
            +18 this week
          </div>
        </div>

        <div className="card-L2 card-fade-in p-6">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-4 h-4 text-accent" />
            <div className="text-xs text-softgray/60 font-body uppercase">
              Avg Rank
            </div>
          </div>
          <div className="text-4xl font-heading font-bold text-white">
            #{data.avg_rank}
          </div>
          <div className="delta-positive text-sm mt-2">
            Improved
          </div>
        </div>

        <div className="card-L2 card-fade-in p-6">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-accent" />
            <div className="text-xs text-softgray/60 font-body uppercase">
              Market Position
            </div>
          </div>
          <div className="text-4xl font-heading font-bold text-white">
            #{data.market_position}
          </div>
          <div className="text-softgray/60 text-xs mt-2 font-body">
            In category
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-2 gap-8">
        {/* Left Column: Category Rankings */}
        <div className="space-y-6">
          <div className="card-L2 card-fade-in p-6">
            <h2 className="text-lg font-heading font-semibold text-white mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-accent" />
              Category Rankings
            </h2>
            
            <div className="space-y-3">
              {data.categories.length > 0 ? (
                data.categories.map((category, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-navy-lighter/50">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl font-heading font-bold text-accent">
                        #{category.rank}
                      </div>
                      <div>
                        <div className="text-white font-body font-medium">
                          {category.category}
                        </div>
                        <div className="text-softgray/60 text-xs font-body">
                          {category.mentions} mentions across {category.models?.length || 3} models
                        </div>
                      </div>
                    </div>
                    <div className="text-accent text-sm font-body">
                      {category.models?.join(', ') || 'ChatGPT, Claude'}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-softgray/60 text-sm font-body text-center py-4">
                  No category data available yet
                </div>
              )}
            </div>
          </div>

          {/* Model Breakdown */}
          <div className="card-L2 card-fade-in p-6">
            <h2 className="text-lg font-heading font-semibold text-white mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-accent" />
              Model Breakdown
            </h2>
            
            <div className="space-y-4">
              {data.models.map((model, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-white font-body font-medium">
                      {model.name}
                    </div>
                    <div className="text-softgray/60 text-sm font-body">
                      {model.mentions} mentions • {model.coverage}% coverage
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

        {/* Right Column: Competitive Analysis */}
        <div className="space-y-6">
          <div className="card-L2 card-fade-in p-6">
            <h2 className="text-lg font-heading font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-accent" />
              Competitive Rankings
            </h2>
            
            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-accent/10 border border-accent/30">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-white font-body font-bold">
                    Your Brand
                  </div>
                  <div className="text-accent font-heading font-bold text-xl">
                    #{data.avg_rank}
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-softgray/60 font-body">
                    {data.total_mentions} mentions
                  </span>
                  <span className="delta-positive">
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
                    <div className="text-softgray/70 font-heading font-bold text-xl">
                      #{competitor.avg_rank}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-softgray/60 font-body">
                      {competitor.mentions} mentions
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Optimize Actions */}
          <div className="card-L2 card-fade-in p-6 border-l-2 border-accent">
            <h2 className="text-lg font-heading font-semibold text-white mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-accent" />
              Optimize Your Visibility
            </h2>
            
            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-navy-lighter/50 hover:bg-navy-lighter cursor-pointer transition-colors">
                <div className="text-white font-body font-medium mb-1">
                  Add Product Schema
                </div>
                <div className="text-softgray/60 text-sm font-body mb-2">
                  Improve how AI understands your product catalog
                </div>
                <button className="btn-secondary text-sm py-2 px-4">
                  Generate Schema
                </button>
              </div>

              <div className="p-4 rounded-lg bg-navy-lighter/50 hover:bg-navy-lighter cursor-pointer transition-colors">
                <div className="text-white font-body font-medium mb-1">
                  Enrich Product Descriptions
                </div>
                <div className="text-softgray/60 text-sm font-body mb-2">
                  Make your products more AI-readable
                </div>
                <button className="btn-secondary text-sm py-2 px-4">
                  Generate Copy
                </button>
              </div>

              <div className="p-4 rounded-lg bg-navy-lighter/50 hover:bg-navy-lighter cursor-pointer transition-colors">
                <div className="text-white font-body font-medium mb-1">
                  Create Category Landing Pages
                </div>
                <div className="text-softgray/60 text-sm font-body mb-2">
                  Target uncovered but relevant categories
                </div>
                <button className="btn-secondary text-sm py-2 px-4">
                  View Suggestions
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}