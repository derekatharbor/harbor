'use client'

import { CheckCircle2 } from 'lucide-react'

interface ProfileCompletenessBarProps {
  completeness: number
  className?: string
}

export function ProfileCompletenessBar({ completeness, className = '' }: ProfileCompletenessBarProps) {
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
    <div className={`p-6 bg-white/[0.02] border border-white/5 rounded-lg ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-white font-mono text-sm mb-1">Profile Completeness</h3>
          <p className={`font-mono text-xs ${getStatusColor(completeness)}`}>
            {getStatusMessage(completeness)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {completeness === 100 && (
            <CheckCircle2 className="w-5 h-5 text-[#2DD4BF]" />
          )}
          <span className="text-white text-2xl font-light">{completeness}%</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-[#2DD4BF] to-[#14B8A6] transition-all duration-500"
          style={{ width: `${completeness}%` }}
        />
      </div>

      {completeness < 100 && (
        <p className="text-white/30 font-mono text-xs mt-3">
          Complete your profile to improve AI model accuracy
        </p>
      )}
    </div>
  )
}
