// components/optimization/ActionCard.tsx

'use client'

import { OptimizationTask } from '@/lib/optimization/tasks'
import * as LucideIcons from 'lucide-react'
import { ArrowRight } from 'lucide-react'

interface ActionCardProps {
  task: OptimizationTask
  onClick: () => void
  context?: any
}

export default function ActionCard({ task, onClick, context }: ActionCardProps) {
  // @ts-ignore - Dynamic icon import
  const Icon = LucideIcons[task.icon] || LucideIcons.AlertCircle

  // Format context for display based on task type
  const getContextDisplay = () => {
    if (!context) return null

    // SHOPPING CONTEXT
    if (task.module === 'shopping') {
      if (context.affected_products && context.affected_products.length > 0) {
        return (
          <div className="mt-2 text-sm text-secondary/70">
            <span className="font-medium text-[#00C6B7]">
              {context.affected_products.length} product{context.affected_products.length === 1 ? '' : 's'}
            </span>
            {' '}need attention: {context.affected_products.slice(0, 3).map((p: any) => p.product_name).join(', ')}
            {context.affected_products.length > 3 && ` +${context.affected_products.length - 3} more`}
          </div>
        )
      }
      
      if (context.missing_categories && context.missing_categories.length > 0) {
        return (
          <div className="mt-2 text-sm text-secondary/70">
            Missing from <span className="font-medium text-[#00C6B7]">{context.missing_categories.length} categor{context.missing_categories.length === 1 ? 'y' : 'ies'}</span>: {context.missing_categories.slice(0, 2).join(', ')}
            {context.missing_categories.length > 2 && ` +${context.missing_categories.length - 2} more`}
          </div>
        )
      }
    }

    // BRAND CONTEXT
    if (task.module === 'brand') {
      // Negative sentiment task
      if (task.id === 'improve-negative-sentiment' && context.negative_descriptors) {
        return (
          <div className="mt-2 text-sm text-secondary/70">
            <span className="font-medium text-red-400">{context.negative_count} negative descriptor{context.negative_count === 1 ? '' : 's'}</span>
            {' '}found: {context.negative_descriptors.slice(0, 3).join(', ')}
            {context.negative_descriptors.length > 3 && ` +${context.negative_descriptors.length - 3} more`}
          </div>
        )
      }

      // Positive descriptors task
      if (task.id === 'boost-positive-descriptors' && context.positive_descriptors) {
        return (
          <div className="mt-2 text-sm text-secondary/70">
            <span className="font-medium text-[#00C6B7]">{context.positive_count} positive descriptor{context.positive_count === 1 ? '' : 's'}</span>
            {' '}to reinforce: {context.positive_descriptors.slice(0, 3).join(', ')}
            {context.positive_descriptors.length > 3 && ` +${context.positive_descriptors.length - 3} more`}
          </div>
        )
      }

      // Organization schema task
      if (task.id === 'add-organization-schema' && context.current_visibility !== undefined) {
        return (
          <div className="mt-2 text-sm text-secondary/70">
            Current visibility: <span className="font-medium text-[#4EE4FF]">{context.current_visibility}</span>
            {context.current_visibility < 50 && ' • Low visibility'}
          </div>
        )
      }

      // Unify brand language task
      if (task.id === 'unify-brand-language' && context.descriptor_count) {
        return (
          <div className="mt-2 text-sm text-secondary/70">
            <span className="font-medium text-blue-400">{context.descriptor_count} different descriptor{context.descriptor_count === 1 ? '' : 's'}</span>
            {' '}• {context.scattered ? 'Language is scattered' : 'Some consolidation needed'}
          </div>
        )
      }

      // Authority links task
      if (task.id === 'add-brand-authority-links' && context.current_visibility !== undefined) {
        return (
          <div className="mt-2 text-sm text-secondary/70">
            Visibility: <span className="font-medium text-[#4EE4FF]">{context.current_visibility}</span>
            {context.current_visibility < 60 && ' • Authority links will help'}
          </div>
        )
      }
    }

    return null
  }

  return (
    <button
      onClick={onClick}
      className="w-full flex items-start gap-4 p-4 rounded-lg border border-border hover:border-[#4EE4FF]/30 transition-all bg-card hover:bg-card/80 text-left group"
    >
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
        task.module === 'shopping' ? 'bg-[#00C6B7]/10' :
        task.module === 'brand' ? 'bg-[#4EE4FF]/10' :
        task.module === 'conversations' ? 'bg-purple-500/10' :
        'bg-blue-500/10'
      }`}>
        <Icon className={`w-5 h-5 ${
          task.module === 'shopping' ? 'text-[#00C6B7]' :
          task.module === 'brand' ? 'text-[#4EE4FF]' :
          task.module === 'conversations' ? 'text-purple-400' :
          'text-blue-400'
        }`} strokeWidth={1.5} />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-heading font-semibold text-primary group-hover:text-[#4EE4FF] transition-colors">
            {task.title}
          </h3>
          {task.impact === 'high' && (
            <span className="px-2 py-0.5 bg-[#FF6B4A]/10 text-[#FF6B4A] text-xs rounded-full font-medium uppercase tracking-wider">
              High Impact
            </span>
          )}
        </div>
        <p className="text-sm text-secondary/70 mb-1">
          {task.description}
        </p>
        {getContextDisplay()}
      </div>
      
      <div className="flex-shrink-0 text-secondary/40 group-hover:text-[#4EE4FF] transition-colors">
        <ArrowRight className="w-5 h-5" />
      </div>
    </button>
  )
}