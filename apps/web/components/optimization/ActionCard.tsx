// components/optimization/ActionCard.tsx
'use client'

import { ArrowRight } from 'lucide-react'
import { OptimizationTask } from '@/lib/optimization/tasks'
import * as LucideIcons from 'lucide-react'

interface ProductInsight {
  product_name: string
  categories: string[]
  avg_rank: number
  mention_count: number
  best_rank: number
  worst_rank: number
}

interface ActionCardProps {
  task: OptimizationTask
  onClick: () => void
  context?: {
    affected_products?: ProductInsight[]
    affected_categories?: string[]
    product_count?: number
    missing_categories?: string[]
    current_mentions?: number
    [key: string]: any
  }
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

  // Build smart title with product context
  const buildSmartTitle = () => {
    const products = context?.affected_products || []
    
    if (products.length === 0) {
      return task.title // Generic fallback
    }
    
    if (products.length === 1) {
      return `${task.title} for ${products[0].product_name}`
    }
    
    if (products.length === 2) {
      return `${task.title} for ${products[0].product_name} and ${products[1].product_name}`
    }
    
    // 3+ products
    return `${task.title} (${products.length} products)`
  }

  // Build smart description
  const buildSmartDescription = () => {
    const products = context?.affected_products || []
    
    if (products.length === 0) {
      return task.description
    }
    
    if (products.length === 1) {
      const p = products[0]
      return `${task.description} • Appears in ${p.categories.length} ${p.categories.length === 1 ? 'category' : 'categories'}`
    }
    
    const totalCategories = new Set(products.flatMap(p => p.categories)).size
    return `${task.description} • ${products.length} products across ${totalCategories} ${totalCategories === 1 ? 'category' : 'categories'}`
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
            {buildSmartTitle()}
          </h3>
          <span className={`text-xs px-2 py-1 rounded-full ${getImpactBadgeColor(task.impact)} whitespace-nowrap`}>
            {task.impact.toUpperCase()}
          </span>
        </div>
        
        <p className="text-sm text-secondary/70 mb-3 leading-relaxed">
          {buildSmartDescription()}
        </p>
        
        {/* Product-specific context pills */}
        {context && (
          <div className="mb-3 flex flex-wrap gap-2">
            {context.affected_products && context.affected_products.length > 0 && (
              <div className="text-xs px-3 py-1.5 bg-[#00C6B7]/10 border border-[#00C6B7]/30 rounded text-[#00C6B7] font-medium">
                {context.affected_products.length === 1 
                  ? context.affected_products[0].product_name
                  : `${context.affected_products.length} products: ${context.affected_products.map(p => p.product_name).join(', ')}`
                }
              </div>
            )}
            
            {context.affected_categories && context.affected_categories.length > 0 && (
              <div className="text-xs px-2 py-1 bg-secondary/5 border border-border rounded text-secondary/80">
                {context.affected_categories.length} {context.affected_categories.length === 1 ? 'category' : 'categories'}
              </div>
            )}
            
            {context.missing_categories && context.missing_categories.length > 0 && (
              <div className="text-xs px-2 py-1 bg-orange-500/10 border border-orange-500/30 rounded text-orange-400">
                {context.missing_categories.length} missing {context.missing_categories.length === 1 ? 'category' : 'categories'}
              </div>
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