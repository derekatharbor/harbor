import { ReactNode } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface MetricCardProps {
  title: string
  value: string | number
  delta?: number
  deltaLabel?: string
  description?: string
  icon?: ReactNode
  chart?: ReactNode
}

export function MetricCard({ 
  title, 
  value, 
  delta, 
  deltaLabel = 'vs last week',
  description,
  icon,
  chart 
}: MetricCardProps) {
  const isPositive = delta && delta > 0
  const isNegative = delta && delta < 0

  return (
    <div className="harbor-card">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {icon && <div className="text-softgray opacity-75">{icon}</div>}
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
          <div className="text-4xl font-heading font-bold text-white mb-2">
            {value}
          </div>
          {delta !== undefined && (
            <div className="flex items-center gap-2">
              {isPositive && (
                <div className="flex items-center gap-1 text-cerulean text-sm">
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
