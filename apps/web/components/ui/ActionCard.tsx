import { ReactNode } from 'react'
import { ArrowRight, TrendingUp } from 'lucide-react'

interface ActionCardProps {
  title: string
  description: string
  icon: ReactNode
  trend?: string
  ctaText?: string
  onClick?: () => void
}

export function ActionCard({ 
  title, 
  description, 
  icon, 
  trend,
  ctaText = 'View Details',
  onClick 
}: ActionCardProps) {
  return (
    <div 
      className="harbor-card cursor-pointer group hover:shadow-teal-glow hover:translate-y-[-2px] transition-all duration-200"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="text-teal group-hover:scale-110 group-hover:rotate-2 transition-all duration-200">
            {icon}
          </div>
          <h3 className="text-lg font-heading font-semibold text-white group-hover:text-cerulean transition-colors">
            {title}
          </h3>
        </div>
        {trend && (
          <div 
            className="flex items-center gap-1 text-xs text-cyan opacity-90 group-hover:opacity-100 transition-all duration-200"
            style={{
              textShadow: '0 0 8px rgba(78,228,255,0.5)'
            }}
          >
            <TrendingUp size={12} />
            <span className="font-body font-medium">{trend}</span>
          </div>
        )}
      </div>

      <p className="text-softgray text-sm mb-4 opacity-75 line-clamp-2 leading-relaxed">
        {description}
      </p>

      <div className="flex items-center justify-between">
        <span className="text-cerulean text-sm font-body font-medium group-hover:translate-x-1 transition-transform inline-flex items-center gap-2">
          {ctaText}
          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </span>
      </div>
    </div>
  )
}