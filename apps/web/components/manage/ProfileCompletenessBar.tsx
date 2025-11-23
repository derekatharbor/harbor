// apps/web/components/manage/ProfileCompletenessBar.tsx
'use client'

import { CheckCircle2, ArrowRight } from 'lucide-react'

interface ProfileCompletenessBarProps {
  completeness: number
  potentialImprovement?: number
  suggestions?: string[]
  className?: string
}

export function ProfileCompletenessBar({ 
  completeness, 
  potentialImprovement,
  suggestions = [],
  className = '' 
}: ProfileCompletenessBarProps) {
  const getStatusMessage = (score: number) => {
    if (score === 100) return 'Profile Complete!'
    if (score >= 75) return 'Almost there'
    if (score >= 50) return 'Good progress'
    if (score >= 25) return 'Getting started'
    return 'Just beginning'
  }

  const getStatusColor = (score: number) => {
    if (score === 100) return 'text-[#2DD4BF]'
    if (score >= 75) return 'text-[#2DD4BF]'
    if (score >= 50) return 'text-[#F59E0B]'
    return 'text-white/50'
  }

  return (
    <div className={`bg-[#0C1422] rounded-xl border border-white/5 p-6 md:p-8 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-white font-bold text-lg mb-1">Profile Completeness</h3>
          <p className={`font-mono text-sm ${getStatusColor(completeness)}`}>
            {getStatusMessage(completeness)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {completeness === 100 && (
            <CheckCircle2 className="w-6 h-6 text-[#2DD4BF]" />
          )}
          <span className="text-white text-3xl font-light">{completeness}%</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-3 bg-white/5 rounded-full overflow-hidden mb-4">
        <div 
          className="h-full bg-gradient-to-r from-[#2DD4BF] to-[#14B8A6] transition-all duration-500"
          style={{ width: `${completeness}%` }}
        />
      </div>

      {completeness < 100 && potentialImprovement && (
        <div className="p-3 bg-[#2DD4BF]/5 border border-[#2DD4BF]/20 rounded-lg mb-4">
          <div className="flex items-center gap-2 mb-2">
            <ArrowRight className="w-4 h-4 text-[#2DD4BF]" />
            <span className="text-[#2DD4BF] text-sm font-medium">
              +{potentialImprovement.toFixed(1)}% potential Harbor Score improvement
            </span>
          </div>
          <p className="text-white/60 text-xs">
            Complete your profile to boost your Website Readiness score
          </p>
        </div>
      )}

      {suggestions.length > 0 && (
        <div className="space-y-2">
          <p className="text-white/70 text-sm font-medium mb-2">Next steps:</p>
          {suggestions.slice(0, 3).map((suggestion, idx) => (
            <div key={idx} className="flex items-start gap-2 text-white/60 text-sm">
              <span className="text-white/40 mt-0.5">•</span>
              <span>{suggestion}</span>
            </div>
          ))}
        </div>
      )}

      {completeness === 100 && (
        <p className="text-[#2DD4BF] font-mono text-sm">
          ✓ Profile optimized for AI discovery
        </p>
      )}
    </div>
  )
}