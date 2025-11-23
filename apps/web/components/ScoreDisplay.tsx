// apps/web/components/ScoreDisplay.tsx
'use client'

import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface ScoreDisplayProps {
  score: number
  previousScore?: number | null
  scoreChange?: number | null
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
}

export function ScoreDisplay({
  score,
  previousScore,
  scoreChange,
  size = 'md',
  showLabel = true,
  className = ''
}: ScoreDisplayProps) {
  // Calculate delta if not provided
  const delta = scoreChange ?? (previousScore ? score - previousScore : null)
  
  const isPositive = delta && delta > 0
  const isNegative = delta && delta < 0
  const isNeutral = delta === 0

  // Size variants
  const sizes = {
    sm: {
      score: 'text-2xl',
      label: 'text-xs',
      delta: 'text-xs',
      icon: 'w-3 h-3'
    },
    md: {
      score: 'text-4xl',
      label: 'text-sm',
      delta: 'text-sm',
      icon: 'w-4 h-4'
    },
    lg: {
      score: 'text-6xl',
      label: 'text-base',
      delta: 'text-base',
      icon: 'w-5 h-5'
    }
  }

  const sizeClasses = sizes[size]

  return (
    <div className={`flex flex-col items-start gap-1 ${className}`}>
      {/* Main Score */}
      <div className="flex items-baseline gap-2">
        <span className={`font-bold font-['Space_Grotesk'] text-white ${sizeClasses.score}`}>
          {score.toFixed(1)}
        </span>
        {showLabel && (
          <span className={`text-gray-400 ${sizeClasses.label}`}>
            / 100
          </span>
        )}
      </div>

      {/* Delta Indicator */}
      {delta !== null && delta !== undefined && (
        <div className={`
          flex items-center gap-1.5 px-2 py-0.5 rounded-full
          ${isPositive ? 'bg-green-500/10 text-green-400' : ''}
          ${isNegative ? 'bg-red-500/10 text-red-400' : ''}
          ${isNeutral ? 'bg-gray-500/10 text-gray-400' : ''}
        `}>
          {isPositive && <TrendingUp className={sizeClasses.icon} />}
          {isNegative && <TrendingDown className={sizeClasses.icon} />}
          {isNeutral && <Minus className={sizeClasses.icon} />}
          
          <span className={`font-mono font-medium ${sizeClasses.delta}`}>
            {isPositive && '+'}
            {delta.toFixed(1)}%
          </span>
          
          {previousScore && (
            <span className={`text-gray-500 ${sizeClasses.delta}`}>
              (from {previousScore.toFixed(1)})
            </span>
          )}
        </div>
      )}

      {/* Label */}
      {showLabel && (
        <span className={`text-gray-400 ${sizeClasses.label} uppercase tracking-wider`}>
          AI Visibility Score
        </span>
      )}
    </div>
  )
}

// Compact version for use in tables/lists
export function ScoreDelta({ 
  delta, 
  size = 'sm' 
}: { 
  delta: number | null | undefined
  size?: 'sm' | 'md'
}) {
  if (!delta && delta !== 0) return null

  const isPositive = delta > 0
  const isNegative = delta < 0
  const isNeutral = delta === 0

  const sizeClass = size === 'sm' ? 'text-xs' : 'text-sm'
  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'

  return (
    <span className={`
      inline-flex items-center gap-1 font-mono font-medium
      ${isPositive ? 'text-green-400' : ''}
      ${isNegative ? 'text-red-400' : ''}
      ${isNeutral ? 'text-gray-400' : ''}
      ${sizeClass}
    `}>
      {isPositive && <TrendingUp className={iconSize} />}
      {isNegative && <TrendingDown className={iconSize} />}
      {isNeutral && <Minus className={iconSize} />}
      {isPositive && '+'}
      {delta.toFixed(1)}%
    </span>
  )
}

// Score badge with color coding
export function ScoreBadge({ 
  score,
  size = 'md'
}: { 
  score: number
  size?: 'sm' | 'md' | 'lg'
}) {
  // Color coding based on score ranges
  const getColor = (score: number) => {
    if (score >= 80) return 'bg-green-500/20 text-green-400 border-green-500/30'
    if (score >= 60) return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    if (score >= 40) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
    return 'bg-red-500/20 text-red-400 border-red-500/30'
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5'
  }

  return (
    <span className={`
      inline-flex items-center gap-1.5 rounded-full border font-mono font-bold
      ${getColor(score)}
      ${sizeClasses[size]}
    `}>
      {score.toFixed(1)}
    </span>
  )
}
