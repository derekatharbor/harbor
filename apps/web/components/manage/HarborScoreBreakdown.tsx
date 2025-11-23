// apps/web/components/manage/HarborScoreBreakdown.tsx
'use client'

import { TrendingUp, TrendingDown, Minus, Info } from 'lucide-react'
import { useState } from 'react'

interface HarborScoreBreakdownProps {
  harborScore: number
  visibilityScore: number
  websiteReadiness: number
  previousHarborScore?: number | null
  scoreChange?: number | null
  className?: string
}

export function HarborScoreBreakdown({
  harborScore,
  visibilityScore,
  websiteReadiness,
  previousHarborScore,
  scoreChange,
  className = ''
}: HarborScoreBreakdownProps) {
  const [showTooltip, setShowTooltip] = useState(false)

  // Calculate delta if not provided
  const delta = scoreChange ?? (previousHarborScore ? harborScore - previousHarborScore : null)
  
  const isPositive = delta && delta > 0
  const isNegative = delta && delta < 0
  const isNeutral = delta === 0

  return (
    <div className={`bg-[#0C1422] rounded-xl border border-white/5 p-6 md:p-8 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white mb-1">Your Harbor Score</h2>
          <p className="text-white/60 text-sm">
            Combined measure of your AI presence
          </p>
        </div>
        
        {/* Info tooltip */}
        <div className="relative">
          <button
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            <Info className="w-4 h-4 text-white/60" />
          </button>
          
          {showTooltip && (
            <div className="absolute right-0 top-full mt-2 w-64 p-3 bg-[#0C1422] border border-white/10 rounded-lg shadow-xl z-10">
              <p className="text-white/80 text-xs leading-relaxed">
                Your Harbor Score combines what AI knows about you (40%) with how well your website is optimized (60%).
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Main Score Display */}
      <div className="flex flex-col items-start gap-2 mb-6">
        <div className="flex items-baseline gap-2">
          <span className="font-bold font-['Space_Grotesk'] text-white text-6xl">
            {harborScore.toFixed(1)}
          </span>
          <span className="text-white/40 text-base">/ 100</span>
        </div>

        {/* Delta Indicator */}
        {delta !== null && delta !== undefined && (
          <div className={`
            flex items-center gap-1.5 px-3 py-1 rounded-full
            ${isPositive ? 'bg-[#2DD4BF]/10 text-[#2DD4BF]' : ''}
            ${isNegative ? 'bg-[#F25A5A]/10 text-[#F25A5A]' : ''}
            ${isNeutral ? 'bg-white/5 text-white/40' : ''}
          `}>
            {isPositive && <TrendingUp className="w-4 h-4" />}
            {isNegative && <TrendingDown className="w-4 h-4" />}
            {isNeutral && <Minus className="w-4 h-4" />}
            
            <span className="font-mono font-medium text-sm">
              {isPositive && '+'}
              {delta.toFixed(1)}%
            </span>
            
            {previousHarborScore && (
              <span className="text-white/40 text-sm">
                vs last scan
              </span>
            )}
          </div>
        )}
      </div>

      {/* Breakdown */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-white/60">How it breaks down:</span>
        </div>

        {/* AI Visibility Component */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#2979FF]"></div>
              <span className="text-white/90 text-sm">AI Visibility</span>
            </div>
            <span className="text-white font-mono text-sm">{visibilityScore.toFixed(1)}%</span>
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#2979FF] transition-all duration-500"
              style={{ width: `${visibilityScore}%` }}
            />
          </div>
          <p className="text-white/40 text-xs">
            What AI models know about you (40% of Harbor Score)
          </p>
        </div>

        {/* Website Readiness Component */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#2DD4BF]"></div>
              <span className="text-white/90 text-sm">Website Readiness</span>
            </div>
            <span className="text-white font-mono text-sm">{websiteReadiness.toFixed(1)}%</span>
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#2DD4BF] to-[#14B8A6] transition-all duration-500"
              style={{ width: `${websiteReadiness}%` }}
            />
          </div>
          <p className="text-white/40 text-xs">
            How optimized your site is for AI (60% of Harbor Score)
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="mt-6 pt-6 border-t border-white/5">
        <p className="text-white/70 text-sm">
          💡 Improve your Harbor Score by completing your profile below
        </p>
      </div>
    </div>
  )
}
