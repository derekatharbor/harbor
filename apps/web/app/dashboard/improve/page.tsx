// apps/web/app/dashboard/improve/page.tsx
// Actionable recommendation cards with impact/effort, steps, and tracking

'use client'

import { useState, useEffect } from 'react'
import { 
  Lightbulb,
  Link2,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Sparkles
} from 'lucide-react'
import { useBrand } from '@/contexts/BrandContext'
import MobileHeader from '@/components/layout/MobileHeader'

interface Recommendation {
  id: string
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  effort: 'high' | 'medium' | 'low'
  sources: Array<{ domain: string; url?: string }>
  steps: string[]
  module: 'brand' | 'website' | 'shopping' | 'conversations'
  status: 'pending' | 'in_progress' | 'done' | 'discarded'
}

// Mock recommendations - will be replaced with API data
const MOCK_RECOMMENDATIONS: Recommendation[] = [
  {
    id: '1',
    title: 'Strengthen partnerships with fintech-focused review platforms',
    description: 'Platforms like NerdWallet and FitSmallBusiness are highly cited, indicating their influence in fintech decision-making. Optimize your presence on these platforms to drive credibility and customer acquisition.',
    impact: 'high',
    effort: 'low',
    sources: [
      { domain: 'fitsmallbusiness.com', url: 'https://fitsmallbusiness.com' },
      { domain: 'nerdwallet.com', url: 'https://nerdwallet.com' }
    ],
    steps: [
      'Conduct interviews with CFOs to identify key challenges in accounts payable.',
      'Publish whitepapers, webinars, and blog posts tailored to CFOs on topics like cost optimization and automation.',
      'Promote content through LinkedIn and CFO-specific forums.'
    ],
    module: 'brand',
    status: 'pending'
  },
  {
    id: '2',
    title: 'Leverage high-authority media coverage to enhance brand credibility',
    description: 'Forbes.com has the highest citation volume, indicating strong media presence. Capitalize on this by securing more thought leadership content and PR placements.',
    impact: 'low',
    effort: 'high',
    sources: [
      { domain: 'forbes.com', url: 'https://forbes.com' }
    ],
    steps: [
      'Develop a media outreach strategy targeting Forbes and similar high-authority publications.',
      'Publish executive thought leadership articles on fintech trends and innovations.',
      'Create data-driven research reports that journalists can cite.'
    ],
    module: 'brand',
    status: 'pending'
  },
  {
    id: '3',
    title: 'Add Organization schema to your homepage',
    description: 'Your homepage is missing Organization JSON-LD structured data. This helps AI models understand your brand identity, founding info, and social links.',
    impact: 'high',
    effort: 'low',
    sources: [
      { domain: 'schema.org', url: 'https://schema.org/Organization' }
    ],
    steps: [
      'Generate Organization JSON-LD with your brand name, logo, and description.',
      'Add sameAs links for your social profiles (LinkedIn, Twitter, etc.).',
      'Validate with Google Rich Results Test.',
      'Deploy to your homepage <head> section.'
    ],
    module: 'website',
    status: 'pending'
  },
  {
    id: '4',
    title: 'Create comparison pages for top competitor queries',
    description: 'Users frequently ask AI to compare your product with alternatives. Creating dedicated comparison pages ensures AI has accurate, favorable content to cite.',
    impact: 'high',
    effort: 'medium',
    sources: [
      { domain: 'g2.com', url: 'https://g2.com' },
      { domain: 'capterra.com', url: 'https://capterra.com' }
    ],
    steps: [
      'Identify your top 5 competitor comparison queries from Prompts data.',
      'Create a landing page for each: "[Your Brand] vs [Competitor]".',
      'Include feature comparison tables, pricing differences, and use case recommendations.',
      'Add FAQPage schema for common comparison questions.'
    ],
    module: 'shopping',
    status: 'pending'
  },
  {
    id: '5',
    title: 'Expand FAQ coverage for emerging user questions',
    description: 'New questions are emerging about your product capabilities. Adding FAQ content ensures AI can accurately answer these queries.',
    impact: 'medium',
    effort: 'low',
    sources: [],
    steps: [
      'Review the Prompts page for recent high-volume questions.',
      'Create FAQ entries for the top 10 unanswered questions.',
      'Add FAQPage schema markup to your FAQ page.',
      'Verify with a re-scan after deployment.'
    ],
    module: 'conversations',
    status: 'pending'
  }
]

function ImpactEffortIndicator({ impact, effort }: { impact: string; effort: string }) {
  const getColor = (level: string, isImpact: boolean) => {
    if (isImpact) {
      return level === 'high' ? 'bg-positive' : level === 'medium' ? 'bg-warning' : 'bg-negative'
    } else {
      return level === 'low' ? 'bg-positive' : level === 'medium' ? 'bg-warning' : 'bg-negative'
    }
  }

  const impactDots = impact === 'high' ? 4 : impact === 'medium' ? 3 : 2
  const effortDots = effort === 'high' ? 4 : effort === 'medium' ? 3 : 2

  return (
    <div className="flex items-center gap-1.5 text-sm text-muted">
      {/* Impact dots */}
      <div className="flex gap-0.5">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={`impact-${i}`}
            className={`w-1.5 h-1.5 rounded-full ${i <= impactDots ? getColor(impact, true) : 'bg-border'}`}
          />
        ))}
      </div>
      <span className="capitalize">{impact} impact,</span>
      
      {/* Effort dots */}
      <div className="flex gap-0.5">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={`effort-${i}`}
            className={`w-1.5 h-1.5 rounded-full ${i <= effortDots ? getColor(effort, false) : 'bg-border'}`}
          />
        ))}
      </div>
      <span className="capitalize">{effort} effort</span>
    </div>
  )
}

function RecommendationCard({ 
  recommendation, 
  onMarkDone, 
  onDiscard,
  isExpanded,
  onToggleExpand
}: { 
  recommendation: Recommendation
  onMarkDone: () => void
  onDiscard: () => void
  isExpanded: boolean
  onToggleExpand: () => void
}) {
  const [checkedSteps, setCheckedSteps] = useState<Set<number>>(new Set())

  const toggleStep = (index: number) => {
    const newChecked = new Set(checkedSteps)
    if (newChecked.has(index)) {
      newChecked.delete(index)
    } else {
      newChecked.add(index)
    }
    setCheckedSteps(newChecked)
  }

  const allStepsCompleted = checkedSteps.size === recommendation.steps.length

  return (
    <div className="card p-0 overflow-hidden">
      {/* Main content area */}
      <div className="grid grid-cols-1 lg:grid-cols-5">
        {/* Left: Title, description, sources */}
        <div className="lg:col-span-3 p-6 border-b lg:border-b-0 lg:border-r border-border">
          <ImpactEffortIndicator impact={recommendation.impact} effort={recommendation.effort} />
          
          <h3 className="text-primary font-semibold text-lg mt-3 mb-2">
            {recommendation.title}
          </h3>
          
          <p className="text-secondary text-sm leading-relaxed mb-4">
            {recommendation.description}
          </p>

          {recommendation.sources.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {recommendation.sources.map((source, idx) => (
                <a
                  key={idx}
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-secondary rounded-lg text-sm text-secondary hover:text-primary hover:bg-hover transition-colors"
                >
                  <Link2 className="w-3.5 h-3.5" />
                  {source.domain}
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Right: Steps */}
        <div className="lg:col-span-2 p-6 bg-secondary/30">
          <h4 className="text-primary font-semibold mb-4">Steps</h4>
          <div className="space-y-3">
            {recommendation.steps.map((step, idx) => (
              <label
                key={idx}
                className="flex items-start gap-3 cursor-pointer group"
              >
                <div className="mt-0.5">
                  <div
                    onClick={(e) => {
                      e.preventDefault()
                      toggleStep(idx)
                    }}
                    className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                      checkedSteps.has(idx)
                        ? 'bg-primary border-primary'
                        : 'border-muted group-hover:border-secondary'
                    }`}
                  >
                    {checkedSteps.has(idx) && (
                      <Check className="w-3 h-3 text-primary-foreground" />
                    )}
                  </div>
                </div>
                <span className={`text-sm leading-relaxed ${
                  checkedSteps.has(idx) ? 'text-muted line-through' : 'text-secondary'
                }`}>
                  {step}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Footer actions */}
      <div className="flex items-center justify-end gap-3 px-6 py-4 bg-secondary/50 border-t border-border">
        <button
          onClick={onDiscard}
          className="px-4 py-2 text-sm font-medium text-secondary hover:text-primary transition-colors"
        >
          Discard
        </button>
        <button
          onClick={onMarkDone}
          className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
            allStepsCompleted
              ? 'bg-primary text-primary-foreground border-primary hover:bg-primary/90'
              : 'bg-card text-primary border-border hover:bg-hover'
          }`}
        >
          Mark as done
        </button>
      </div>
    </div>
  )
}

export default function ImprovePage() {
  const { currentDashboard } = useBrand()
  const [recommendations, setRecommendations] = useState<Recommendation[]>(MOCK_RECOMMENDATIONS)
  const [loading, setLoading] = useState(true)
  const [expandedCard, setExpandedCard] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'high' | 'quick-wins'>('all')

  useEffect(() => {
    // Simulate loading - replace with real API call
    const timer = setTimeout(() => setLoading(false), 300)
    return () => clearTimeout(timer)
  }, [])

  const handleMarkDone = (id: string) => {
    setRecommendations(recs => 
      recs.map(r => r.id === id ? { ...r, status: 'done' as const } : r)
    )
  }

  const handleDiscard = (id: string) => {
    setRecommendations(recs => 
      recs.map(r => r.id === id ? { ...r, status: 'discarded' as const } : r)
    )
  }

  const filteredRecommendations = recommendations.filter(r => {
    if (r.status === 'done' || r.status === 'discarded') return false
    if (filter === 'high') return r.impact === 'high'
    if (filter === 'quick-wins') return r.impact === 'high' && r.effort === 'low'
    return true
  })

  const completedCount = recommendations.filter(r => r.status === 'done').length
  const pendingCount = recommendations.filter(r => r.status === 'pending' || r.status === 'in_progress').length

  if (loading) {
    return (
      <div className="min-h-screen bg-primary" data-page="improve">
        <MobileHeader />
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-card rounded w-48"></div>
            <div className="h-4 bg-card rounded w-96"></div>
            <div className="space-y-6 mt-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-64 bg-card rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const brandName = currentDashboard?.brand_name || 'Your brand'

  return (
    <div className="min-h-screen bg-primary" data-page="improve">
      <MobileHeader />

      {/* Header */}
      <div className="page-header-bar">
        <div className="flex items-center gap-3">
          <div className="text-sm text-muted">
            {brandName} <span className="mx-2">›</span> Overview
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-primary mb-2">Improve</h1>
          <div className="flex items-center gap-4 text-sm text-muted">
            <span>{pendingCount} recommendations</span>
            <span>•</span>
            <span>{completedCount} completed</span>
          </div>
        </div>

        {/* Filter pills */}
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`pill ${filter === 'all' ? 'active' : ''}`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('quick-wins')}
            className={`pill ${filter === 'quick-wins' ? 'active' : ''}`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Quick wins
          </button>
          <button
            onClick={() => setFilter('high')}
            className={`pill ${filter === 'high' ? 'active' : ''}`}
          >
            High impact
          </button>
        </div>

        {/* Recommendation cards */}
        <div className="space-y-6">
          {filteredRecommendations.length === 0 ? (
            <div className="card p-12 text-center">
              <Lightbulb className="w-12 h-12 text-muted mx-auto mb-4 opacity-40" />
              <h3 className="text-lg font-medium text-primary mb-2">
                {filter === 'all' ? 'All caught up!' : 'No matching recommendations'}
              </h3>
              <p className="text-sm text-muted">
                {filter === 'all' 
                  ? "You've addressed all current recommendations. Run a new scan to find more opportunities."
                  : 'Try adjusting your filter to see more recommendations.'
                }
              </p>
            </div>
          ) : (
            filteredRecommendations.map((rec) => (
              <RecommendationCard
                key={rec.id}
                recommendation={rec}
                onMarkDone={() => handleMarkDone(rec.id)}
                onDiscard={() => handleDiscard(rec.id)}
                isExpanded={expandedCard === rec.id}
                onToggleExpand={() => setExpandedCard(expandedCard === rec.id ? null : rec.id)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}
