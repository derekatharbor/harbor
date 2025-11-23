// apps/web/components/manage/HarborScoreBreakdown.tsx
'use client'

import { TrendingUp, TrendingDown, Minus, Info, RefreshCw } from 'lucide-react'
import { useState } from 'react'

interface HarborScoreBreakdownProps {
  harborScore: number
  visibilityScore: number
  websiteReadiness: number
  previousHarborScore?: number | null
  scoreChange?: number | null
  lastScanAt?: string | null
  onRescan?: () => void
  rescanning?: boolean
  className?: string
}

export function HarborScoreBreakdown({
  harborScore,
  visibilityScore,
  websiteReadiness,
  previousHarborScore,
  scoreChange,
  lastScanAt,
  onRescan,
  rescanning = false,
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
      {/* Horizontal Layout */}
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left: Main Score */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
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
                    Your Harbor Score reflects your overall AI visibility and website optimization.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Score Display */}
          <div className="flex flex-col items-start gap-2 mb-6">
            <div className="flex items-baseline gap-2">
              <span className="font-bold font-['Space_Grotesk'] text-white text-5xl">
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
                
                <span className="text-white/40 text-sm">vs last scan</span>
              </div>
            )}
          </div>

          {/* Breakdown Bars */}
          <div className="space-y-4">
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
            </div>
          </div>
        </div>

        {/* Right: Rescan Section */}
        <div className="lg:w-64 flex flex-col justify-center lg:border-l lg:border-white/5 lg:pl-8">
          <h3 className="text-lg font-semibold text-white mb-2">Update Your Score</h3>
          <p className="text-white/60 text-sm mb-4">
            Made improvements? Re-scan to see your updated Harbor Score.
          </p>
          <button
            onClick={onRescan}
            disabled={rescanning}
            style={{ cursor: rescanning ? 'not-allowed' : 'pointer' }}
            className="px-6 py-3 rounded-lg bg-[#2DD4BF] hover:bg-[#2DD4BF]/90 text-[#0C1422] font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${rescanning ? 'animate-spin' : ''}`} />
            {rescanning ? 'Scanning...' : 'Re-scan Now'}
          </button>
          {lastScanAt && (
            <p className="mt-3 text-sm text-white/40 text-center">
              Last: {new Date(lastScanAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit'
              })}
            </p>
          )}
        </div>

      </div>
    </div>
  )
}