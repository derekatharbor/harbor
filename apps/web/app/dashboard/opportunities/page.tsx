// apps/web/app/dashboard/opportunities/page.tsx
// Aggregated optimization tasks from all modules

'use client'

import { useEffect, useState } from 'react'
import { Lightbulb, CheckCircle2, Circle, ArrowRight, Zap } from 'lucide-react'
import { useBrand } from '@/contexts/BrandContext'
import MobileHeader from '@/components/layout/MobileHeader'
import Link from 'next/link'

interface Opportunity {
  id: string
  module: 'shopping' | 'brand' | 'website' | 'prompts'
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  status: 'pending' | 'in_progress' | 'done'
  action_url?: string
}

export default function OpportunitiesPage() {
  const { currentDashboard } = useBrand()
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // TODO: Fetch real opportunities from optimization_tasks table
    // For now, show placeholder
    setLoading(false)
  }, [currentDashboard])

  const moduleColors = {
    shopping: '#10B981',
    brand: '#06B6D4',
    website: '#8B5CF6',
    prompts: '#F59E0B'
  }

  const impactLabels = {
    high: { label: 'High Impact', color: 'text-green-400 bg-green-400/10' },
    medium: { label: 'Medium', color: 'text-amber-400 bg-amber-400/10' },
    low: { label: 'Low', color: 'text-gray-400 bg-gray-400/10' }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-chart-1"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-primary" data-page="opportunities">
      <MobileHeader />
      
      {/* Header */}
      <div className="page-header-bar">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
            <Lightbulb className="w-4 h-4 text-orange-500" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-primary">Opportunities</h1>
            <p className="text-sm text-muted">Prioritized actions to improve your AI visibility</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {opportunities.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-chart-1/10 flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-chart-1" />
            </div>
            <h2 className="text-xl font-semibold text-primary mb-2">No opportunities yet</h2>
            <p className="text-secondary mb-6 max-w-md mx-auto">
              Run a scan to analyze your brand's AI visibility. We'll identify specific actions you can take to improve.
            </p>
            <Link 
              href="/dashboard/overview"
              className="inline-flex items-center gap-2 px-4 py-2 bg-chart-1 text-white rounded-lg hover:bg-chart-1/90 transition-colors"
            >
              Go to Overview
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {opportunities.map((opp) => (
              <div key={opp.id} className="card p-4 flex items-center gap-4">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${moduleColors[opp.module]}15` }}
                >
                  {opp.status === 'done' ? (
                    <CheckCircle2 className="w-5 h-5" style={{ color: moduleColors[opp.module] }} />
                  ) : (
                    <Circle className="w-5 h-5" style={{ color: moduleColors[opp.module] }} />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-primary">{opp.title}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${impactLabels[opp.impact].color}`}>
                      {impactLabels[opp.impact].label}
                    </span>
                  </div>
                  <p className="text-sm text-secondary">{opp.description}</p>
                </div>
                {opp.action_url && (
                  <Link 
                    href={opp.action_url}
                    className="text-sm text-chart-1 hover:underline flex items-center gap-1"
                  >
                    Fix <ArrowRight className="w-3 h-3" />
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
