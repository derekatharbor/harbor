// apps/web/app/dashboard/competitors/page.tsx

'use client'

import { useEffect, useState } from 'react'
import { Users, TrendingUp, TrendingDown, ArrowRight, ExternalLink, Crown, Lock } from 'lucide-react'
import Link from 'next/link'
import { useBrand } from '@/contexts/BrandContext'
import MobileHeader from '@/components/layout/MobileHeader'

interface Competitor {
  id: string
  slug: string
  brand_name: string
  industry: string
  visibility_score: number
  rank_global?: number
  logo_url?: string
}

interface CompetitorData {
  competitors: Competitor[]
  userRank: number
  totalInCategory: number
  category: string
}

export default function CompetitorsPage() {
  const { currentDashboard } = useBrand()
  
  const [data, setData] = useState<CompetitorData | null>(null)
  const [loading, setLoading] = useState(true)
  const [userScore, setUserScore] = useState<number>(0)

  useEffect(() => {
    async function fetchData() {
      if (!currentDashboard) {
        setLoading(false)
        return
      }

      try {
        // Fetch competitor data
        const response = await fetch(`/api/competitors?brandId=${currentDashboard.id}`)
        if (!response.ok) throw new Error('Failed to fetch')
        
        const result = await response.json()
        setData(result)
        
        // Also get user's own score from latest scan
        const scanResponse = await fetch(`/api/scan/latest?dashboardId=${currentDashboard.id}`)
        if (scanResponse.ok) {
          const scanData = await scanResponse.json()
          if (scanData.shopping?.visibility_score) {
            setUserScore(scanData.shopping.visibility_score)
          } else if (scanData.brand?.visibility_index) {
            setUserScore(scanData.brand.visibility_index)
          }
        }
      } catch (error) {
        console.error('Error fetching competitor data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [currentDashboard])

  // Calculate average competitor score
  const avgCompetitorScore = data?.competitors.length 
    ? data.competitors.reduce((sum, c) => sum + c.visibility_score, 0) / data.competitors.length
    : 0

  // Determine if user is above or below average
  const vsAverage = userScore - avgCompetitorScore
  const isAboveAverage = vsAverage > 0

  // Loading skeleton
  if (loading) {
    return (
      <>
        <MobileHeader />
        <div className="max-w-screen-2xl mx-auto animate-pulse space-y-8 pt-20 lg:pt-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-border rounded-lg"></div>
              <div className="h-10 w-64 bg-border rounded"></div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card rounded-lg p-6 border border-border h-32"></div>
            ))}
          </div>

          <div className="bg-card rounded-lg p-6 border border-border h-96"></div>
        </div>
      </>
    )
  }

  // Empty state - no data
  if (!data || !currentDashboard) {
    return (
      <>
        <MobileHeader />
        <div className="max-w-screen-2xl mx-auto pt-20 lg:pt-0 px-4 lg:px-0">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Users className="w-6 h-6 lg:w-8 lg:h-8 text-[#A855F7]" strokeWidth={1.5} />
                <h1 className="text-2xl lg:text-4xl font-heading font-bold text-primary">
                  Competitive Intelligence
                </h1>
              </div>
            </div>
            
            <p className="text-sm text-secondary/60 mb-2">
              See how you stack up against competitors in your category
            </p>
          </div>

          <div className="bg-card rounded-lg p-8 lg:p-12 border border-border text-center">
            <Users className="w-12 h-12 lg:w-16 lg:h-16 text-[#A855F7] mx-auto mb-6 opacity-40" strokeWidth={1.5} />
            <h2 className="text-xl lg:text-2xl font-heading font-bold text-primary mb-3">
              No Competitor Data Yet
            </h2>
            <p className="text-secondary/60 font-body text-sm mb-6 leading-relaxed max-w-md mx-auto">
              Run your first scan to discover competitors in your category and see how your AI visibility compares.
            </p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <MobileHeader />
      <div className="max-w-screen-2xl mx-auto pt-20 lg:pt-0 px-4 lg:px-0">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6 lg:w-8 lg:h-8 text-[#A855F7]" strokeWidth={1.5} />
              <h1 className="text-2xl lg:text-4xl font-heading font-bold text-primary">
                Competitive Intelligence
              </h1>
            </div>
          </div>
          
          <p className="text-sm text-secondary/60">
            How you compare to other brands in <span className="text-primary font-medium">{data.category}</span>
          </p>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Your Rank */}
          <div className="bg-card rounded-lg p-6 border border-border">
            <div className="flex items-center gap-2 mb-4">
              <Crown className="w-5 h-5 text-[#A855F7]" strokeWidth={1.5} />
              <p className="text-xs text-secondary/60 uppercase tracking-wider">Your Rank</p>
            </div>
            <div className="text-4xl font-heading font-bold text-primary mb-2">
              #{data.userRank}
            </div>
            <p className="text-sm text-secondary/60">
              of {data.totalInCategory} in {data.category}
            </p>
          </div>

          {/* Your Score */}
          <div className="bg-card rounded-lg p-6 border border-border">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-[#A855F7]" strokeWidth={1.5} />
              <p className="text-xs text-secondary/60 uppercase tracking-wider">Your Score</p>
            </div>
            <div className="text-4xl font-heading font-bold text-primary mb-2">
              {userScore.toFixed(1)}<span className="text-2xl text-secondary/40">%</span>
            </div>
            <p className="text-sm text-secondary/60">
              AI visibility score
            </p>
          </div>

          {/* vs Average */}
          <div className="bg-card rounded-lg p-6 border border-border">
            <div className="flex items-center gap-2 mb-4">
              {isAboveAverage ? (
                <TrendingUp className="w-5 h-5 text-emerald-500" strokeWidth={1.5} />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-400" strokeWidth={1.5} />
              )}
              <p className="text-xs text-secondary/60 uppercase tracking-wider">vs Category Avg</p>
            </div>
            <div className={`text-4xl font-heading font-bold mb-2 ${isAboveAverage ? 'text-emerald-500' : 'text-red-400'}`}>
              {isAboveAverage ? '+' : ''}{vsAverage.toFixed(1)}<span className="text-2xl opacity-60">%</span>
            </div>
            <p className="text-sm text-secondary/60">
              {isAboveAverage ? 'Above' : 'Below'} category average
            </p>
          </div>
        </div>

        {/* Competitor Leaderboard */}
        <div className="bg-card rounded-lg border border-border mb-8">
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-heading font-bold text-primary">
              Category Leaderboard
            </h2>
            <p className="text-sm text-secondary/60 mt-1">
              Top brands in {data.category} by AI visibility
            </p>
          </div>
          
          <div className="divide-y divide-border">
            {/* User's Position (highlighted) */}
            <div className="p-4 lg:p-6 bg-[#A855F7]/5 border-l-2 border-[#A855F7]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg bg-[#A855F7]/20 flex items-center justify-center text-[#A855F7] font-bold text-sm">
                    #{data.userRank}
                  </div>
                  <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
                    {currentDashboard.logo_url ? (
                      <img 
                        src={currentDashboard.logo_url} 
                        alt={currentDashboard.brand_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-primary font-bold">
                        {currentDashboard.brand_name?.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="text-primary font-semibold flex items-center gap-2">
                      {currentDashboard.brand_name}
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[#A855F7]/20 text-[#A855F7]">You</span>
                    </div>
                    <div className="text-secondary/60 text-sm">{data.category}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-primary font-bold text-lg lg:text-xl">
                    {userScore.toFixed(1)}%
                  </div>
                  <div className="text-secondary/60 text-xs">Visibility</div>
                </div>
              </div>
            </div>

            {/* Competitors */}
            {data.competitors.map((comp, index) => {
              const diff = userScore - comp.visibility_score
              const isAhead = diff > 0
              
              return (
                <div key={comp.id} className="p-4 lg:p-6 hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg bg-white/5 flex items-center justify-center text-secondary/60 font-mono text-sm">
                        #{index + 1}
                      </div>
                      <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
                        {comp.logo_url ? (
                          <img 
                            src={comp.logo_url} 
                            alt={comp.brand_name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.style.display = 'none'
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-secondary/60 font-medium">
                            {comp.brand_name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="text-primary font-medium">{comp.brand_name}</div>
                        <div className="text-secondary/60 text-sm">{comp.industry}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 lg:gap-6">
                      {/* Difference from you */}
                      <div className="text-right hidden sm:block">
                        <div className={`text-sm font-medium ${isAhead ? 'text-emerald-500' : 'text-red-400'}`}>
                          {isAhead ? 'You lead by' : 'Ahead by'} {Math.abs(diff).toFixed(1)}%
                        </div>
                      </div>
                      
                      {/* Score */}
                      <div className="text-right">
                        <div className="text-primary font-bold text-lg">
                          {comp.visibility_score.toFixed(1)}%
                        </div>
                        <div className="text-secondary/60 text-xs">Visibility</div>
                      </div>
                      
                      {/* Link to profile */}
                      <Link
                        href={`/brands/${comp.slug}`}
                        className="p-2 rounded-lg hover:bg-white/5 transition-colors text-secondary/60 hover:text-primary"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Insights Section */}
        <div className="bg-card rounded-lg border border-border">
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-heading font-bold text-primary">
              Competitive Insights
            </h2>
            <p className="text-sm text-secondary/60 mt-1">
              Key takeaways from your competitive position
            </p>
          </div>
          
          <div className="p-6 space-y-4">
            {data.userRank === 1 ? (
              <div className="flex items-start gap-4 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <Crown className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-primary font-semibold mb-1">You're #1 in your category!</h3>
                  <p className="text-secondary/70 text-sm">
                    You have the highest AI visibility in {data.category}. Focus on maintaining your lead by continuing to optimize your AI presence.
                  </p>
                </div>
              </div>
            ) : data.userRank <= 3 ? (
              <div className="flex items-start gap-4 p-4 rounded-lg bg-[#A855F7]/10 border border-[#A855F7]/20">
                <TrendingUp className="w-5 h-5 text-[#A855F7] flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-primary font-semibold mb-1">You're in the top 3</h3>
                  <p className="text-secondary/70 text-sm">
                    Strong position! You're {(data.competitors[0]?.visibility_score - userScore).toFixed(1)}% behind the leader. 
                    Focus on the optimization tasks to close the gap.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-4 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <TrendingUp className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-primary font-semibold mb-1">Room to grow</h3>
                  <p className="text-secondary/70 text-sm">
                    You're currently #{data.userRank} in {data.category}. Check the optimization recommendations 
                    in other modules to improve your visibility score.
                  </p>
                </div>
              </div>
            )}

            {avgCompetitorScore > 0 && (
              <div className="flex items-start gap-4 p-4 rounded-lg bg-white/[0.02] border border-border">
                <Users className="w-5 h-5 text-secondary/60 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-primary font-semibold mb-1">Category benchmark</h3>
                  <p className="text-secondary/70 text-sm">
                    The average visibility score in {data.category} is {avgCompetitorScore.toFixed(1)}%. 
                    {isAboveAverage 
                      ? ` You're ${vsAverage.toFixed(1)}% above this benchmark.`
                      : ` Improving by ${Math.abs(vsAverage).toFixed(1)}% would bring you to average.`
                    }
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
