// apps/web/components/manage/CompetitorModule.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { TrendingUp, Lock, ExternalLink } from 'lucide-react'

interface Competitor {
  id: string
  slug: string
  brand_name: string
  industry: string
  visibility_score: number
  rank_global?: number
  logo_url: string
}

interface CompetitorModuleProps {
  competitors: Competitor[]
  userRank: number
  totalInCategory: number
  category: string
  isPro?: boolean
  onUpgrade?: () => void
}

export default function CompetitorModule({
  competitors,
  userRank,
  totalInCategory,
  category,
  isPro = false,
  onUpgrade
}: CompetitorModuleProps) {
  
  const topThree = competitors.slice(0, 3)
  const displayCompetitors = topThree // Only show top 3
  const avgTopThreeScore = topThree.length > 0
    ? parseFloat((topThree.reduce((sum, c) => sum + c.visibility_score, 0) / topThree.length).toFixed(1))
    : 0
  
  return (
    <div className="bg-[#0C1422] rounded-xl border border-white/5 p-6 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            Your Competitive Position
          </h2>
          <p className="text-white/60 text-sm mt-1">
            Top 3 competitors in {category}
          </p>
        </div>
        
        {!isPro && (
          <button
            onClick={onUpgrade}
            className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1"
          >
            <Lock className="w-3 h-3" />
            Unlock Details
          </button>
        )}
      </div>

      {/* Competitor List */}
      <div className="space-y-6 mb-6">
        {displayCompetitors.length === 0 ? (
          <div className="text-center py-8 text-white/40">
            <p>No competitors found in {category}</p>
            <p className="text-sm mt-2">You're one of the first in this category!</p>
          </div>
        ) : (
          displayCompetitors.map((comp, index) => (
            <div
              key={comp.id}
              className="flex items-center justify-between p-4 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-colors border border-white/5"
            >
              {/* Left: Logo + Name + Rank */}
              <div className="flex items-center gap-4 flex-1">
                {/* Logo */}
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-white/5 flex-shrink-0 relative">
                  <img 
                    src={comp.logo_url} 
                    alt={comp.brand_name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback to initials if logo fails to load
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        parent.classList.add('flex', 'items-center', 'justify-center');
                        parent.innerHTML = `<span class="text-white/60 text-sm font-medium">${comp.brand_name.charAt(0)}</span>`;
                      }
                    }}
                  />
                </div>
                
                {/* Name + Industry + Rank Badge */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <div className="text-white font-medium truncate">
                      {comp.brand_name}
                    </div>
                    <div className="px-2 py-0.5 rounded bg-white/5 text-white/60 text-xs font-mono flex-shrink-0">
                      #{index + 1}
                    </div>
                  </div>
                  <div className="text-white/40 text-xs">
                    {comp.industry}
                  </div>
                </div>
              </div>

              {/* Right: Score or Lock */}
              {isPro ? (
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-white font-bold">
                      {comp.visibility_score.toFixed(1)}%
                    </div>
                    <div className="text-white/40 text-xs">
                      Score
                    </div>
                  </div>
                  <Link
                    href={`/brands/${comp.slug}`}
                    className="text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
              ) : (
                <button
                  onClick={onUpgrade}
                  className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-white/60 hover:text-white text-sm flex items-center gap-2"
                >
                  <Lock className="w-3 h-3" />
                  See Details
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* User Position Summary */}
      {displayCompetitors.length > 0 && (
        <div className="p-4 rounded-lg bg-cyan-500/5 border border-cyan-500/20">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-white/90 text-sm mb-1">
                You rank <span className="font-bold text-white">#{userRank}</span> out of {totalInCategory} brands in {category}
              </p>
              {avgTopThreeScore > 0 && (
                <p className="text-white/60 text-xs">
                  Top 3 average score: {avgTopThreeScore}%
                </p>
              )}
            </div>
            
            <TrendingUp className="w-5 h-5 text-cyan-400 flex-shrink-0" />
          </div>
        </div>
      )}

      {/* Pro Upgrade CTA */}
      {!isPro && displayCompetitors.length > 0 && (
        <div className="mt-6 pt-6 border-t border-white/5">
          <div className="text-center">
            <h3 className="text-white font-semibold mb-2">
              Unlock Full Competitive Intelligence
            </h3>
            <p className="text-white/60 text-sm mb-4">
              See competitor scores, historical trends, and detailed analysis
            </p>
            <button
              onClick={onUpgrade}
              className="px-6 py-3 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-white font-medium transition-colors"
            >
              Upgrade to Harbor Pro
            </button>
          </div>
        </div>
      )}
    </div>
  )
}