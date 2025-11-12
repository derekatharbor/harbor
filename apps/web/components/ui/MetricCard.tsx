'use client'

import { ReactNode } from 'react'
import { TrendingUp, TrendingDown, Info } from 'lucide-react'

interface MetricCardProps {
  title: string
  value: string | number
  delta?: number
  deltaLabel?: string
  description?: string
  icon?: ReactNode
  chart?: ReactNode
  onClick?: () => void
  tooltip?: string
}

export function MetricCard({ 
  title, 
  value, 
  delta, 
  deltaLabel = 'vs last week',
  description,
  icon,
  chart,
  onClick,
  tooltip
}: MetricCardProps) {
  const isPositive = delta && delta > 0
  const isNegative = delta && delta < 0
  const isClickable = !!onClick

  return (
    <div 
      className={`
        harbor-card group relative
        transition-all duration-200
        ${isClickable ? 'cursor-pointer hover:shadow-xl hover:translate-y-[-2px]' : ''}
      `}
      onClick={onClick}
    >
      {/* Tooltip */}
      {tooltip && (
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="relative group/tooltip">
            <Info size={14} className="text-softgray opacity-60 cursor-help" />
            <div className="absolute right-0 top-6 w-64 p-3 bg-navy-lighter rounded-lg border border-coral opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-10">
              <p className="text-xs text-softgray">{tooltip}</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {icon && (
              <div className="text-softgray opacity-75 group-hover:text-coral group-hover:opacity-100 transition-colors">
                {icon}
              </div>
            )}
            <h3 className="text-sm font-body text-softgray opacity-75 uppercase tracking-wide">
              {title}
            </h3>
          </div>
          {description && (
            <p className="text-xs text-softgray opacity-60 mt-1">{description}</p>
          )}
        </div>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <div className="text-4xl font-heading font-bold text-white mb-2 group-hover:text-cerulean transition-colors">
            {value}
          </div>
          {delta !== undefined && (
            <div className="flex items-center gap-2 group-hover:translate-y-[-2px] transition-transform">
              {isPositive && (
                <div className="flex items-center gap-1 text-sm" style={{ color: '#4DA3FF' }}>
                  <TrendingUp size={16} />
                  <span className="font-body font-medium">+{delta}%</span>
                </div>
              )}
              {isNegative && (
                <div className="flex items-center gap-1 text-coral text-sm">
                  <TrendingDown size={16} />
                  <span className="font-body font-medium">{delta}%</span>
                </div>
              )}
              <span className="text-softgray text-xs opacity-60">{deltaLabel}</span>
            </div>
          )}
        </div>
        {chart && <div className="ml-4">{chart}</div>}
      </div>
    </div>
  )
}