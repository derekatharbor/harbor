// components/optimization/ActionCard.tsx
'use client'

import { ArrowRight } from 'lucide-react'
import { OptimizationTask } from '@/lib/optimization/tasks'
import * as LucideIcons from 'lucide-react'

interface ActionCardProps {
  task: OptimizationTask
  onClick: () => void
  context?: any
}

export default function ActionCard({ task, onClick, context }: ActionCardProps) {
  // Get the icon component dynamically
  const IconComponent = (LucideIcons as any)[task.icon] || LucideIcons.ShoppingBag

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-[#00C6B7]'
      case 'medium': return 'text-blue-400'
      case 'low': return 'text-secondary/60'
      default: return 'text-secondary/60'
    }
  }

  const getImpactBadgeColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-[#00C6B7]/10 text-[#00C6B7]'
      case 'medium': return 'bg-blue-500/10 text-blue-400'
      case 'low': return 'bg-secondary/10 text-secondary/60'
      default: return 'bg-secondary/10 text-secondary/60'
    }
  }

  return (
    <div 
      onClick={onClick}
      className="group flex items-start gap-4 p-5 rounded-lg border border-border hover:border-[#00C6B7]/30 bg-card hover:bg-hover transition-all cursor-pointer"
    >
      <div className={`w-12 h-12 rounded-lg bg-[#00C6B7]/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
        <IconComponent className={`w-6 h-6 ${getImpactColor(task.impact)}`} strokeWidth={1.5} />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-4 mb-2">
          <h3 className="font-heading font-semibold text-primary group-hover:text-[#00C6B7] transition-colors">
            {task.title}
          </h3>
          <span className={`text-xs px-2 py-1 rounded-full ${getImpactBadgeColor(task.impact)} whitespace-nowrap`}>
            {task.impact.toUpperCase()}
          </span>
        </div>
        
        <p className="text-sm text-secondary/70 mb-3 leading-relaxed">
          {task.description}
        </p>
        
        {/* Context info if available */}
        {context && (
          <div className="mb-3 flex flex-wrap gap-2">
            {context.affected_categories && (
              <span className="text-xs px-2 py-1 bg-secondary/5 border border-border rounded text-secondary/60">
                {context.affected_categories.length} categories
              </span>
            )}
            {context.missing_categories && (
              <span className="text-xs px-2 py-1 bg-secondary/5 border border-border rounded text-secondary/60">
                {context.missing_categories.length} missing categories
              </span>
            )}
            {context.current_mentions !== undefined && (
              <span className="text-xs px-2 py-1 bg-secondary/5 border border-border rounded text-secondary/60">
                {context.current_mentions} current mentions
              </span>
            )}
          </div>
        )}
        
        <button className="text-sm text-[#00C6B7] hover:text-[#00C6B7]/80 font-medium inline-flex items-center gap-1 group-hover:gap-2 transition-all">
          Get Started <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
