'use client'

import { CheckCircle2, Circle, Lock } from 'lucide-react'

interface Opportunity {
  id: string
  title: string
  description: string
  impact_points: number
  status: 'open' | 'completed' | 'dismissed'
}

interface CategoryGroup {
  title: string
  max_points: number
  earned_points: number
  opportunities: Opportunity[]
}

interface VisibilityOpportunitiesProps {
  opportunities: Record<string, CategoryGroup>
  loading?: boolean
}

export function VisibilityOpportunities({ opportunities, loading }: VisibilityOpportunitiesProps) {
  if (loading) {
    return (
      <div className="p-8 bg-white/[0.02] border border-white/5 rounded-lg">
        <div className="text-white/40 font-mono text-sm animate-pulse">
          Loading opportunities...
        </div>
      </div>
    )
  }

  const categories = Object.entries(opportunities)

  return (
    <div className="p-8 bg-white/[0.02] border border-white/5 rounded-lg">
      <div className="mb-6">
        <h3 className="text-white text-xl font-light mb-2">
          Visibility Opportunities
        </h3>
        <p className="text-white/40 font-mono text-sm">
          Complete these actions to improve your AI visibility score
        </p>
      </div>

      <div className="space-y-6">
        {categories.map(([key, category]) => {
          const progress = (category.earned_points / category.max_points) * 100
          const hasOpenOpportunities = category.opportunities.some(opp => opp.status === 'open')

          return (
            <div key={key} className="border border-white/5 rounded-lg overflow-hidden">
              {/* Category Header */}
              <div className="p-4 bg-white/[0.02] border-b border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-white font-mono text-sm">{category.title}</h4>
                  <div className="text-white/70 font-mono text-sm">
                    {category.earned_points}/{category.max_points} pts
                  </div>
                </div>
                {/* Progress Bar */}
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#2DD4BF] to-[#14B8A6] transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Opportunities List */}
              <div className="divide-y divide-white/5">
                {category.opportunities.length === 0 ? (
                  <div className="p-4 flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#2DD4BF] flex-shrink-0" />
                    <div>
                      <div className="text-white/70 font-mono text-sm">
                        All opportunities completed!
                      </div>
                      <div className="text-white/40 font-mono text-xs mt-1">
                        You've maxed out this category
                      </div>
                    </div>
                  </div>
                ) : (
                  category.opportunities.map((opp) => (
                    <div 
                      key={opp.id}
                      className="p-4 flex items-start gap-3 hover:bg-white/[0.01] transition-colors"
                    >
                      {/* Status Icon */}
                      <div className="flex-shrink-0 mt-0.5">
                        {opp.status === 'completed' ? (
                          <CheckCircle2 className="w-5 h-5 text-[#2DD4BF]" />
                        ) : (
                          <Circle className="w-5 h-5 text-white/20" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-1">
                          <h5 className="text-white/90 font-mono text-sm">{opp.title}</h5>
                          <span className="text-[#2DD4BF] font-mono text-xs flex-shrink-0">
                            +{opp.impact_points} pts
                          </span>
                        </div>
                        <p className="text-white/50 font-mono text-xs leading-relaxed">
                          {opp.description}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Helper Text */}
      <div className="mt-6 p-4 bg-white/[0.01] border border-white/5 rounded">
        <p className="text-white/40 font-mono text-xs leading-relaxed">
          <strong className="text-white/60">Tip:</strong> Fixing missing items above increases your 
          Visibility Score across all AI models. Changes take effect after your next scan.
        </p>
      </div>
    </div>
  )
}
