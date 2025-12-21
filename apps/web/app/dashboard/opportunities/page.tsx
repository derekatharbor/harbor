// apps/web/app/dashboard/opportunities/page.tsx
// Merged: Getting Started (static tasks) + Content Strategy (data-driven)

'use client'

import { useState, useEffect } from 'react'
import { 
  TrendingUp, 
  FileText, 
  GitCompare, 
  BookOpen, 
  List, 
  Package,
  MessageCircle,
  Linkedin,
  Star,
  Newspaper,
  CheckCircle2,
  Info,
  Copy,
  ExternalLink,
  Check,
  Sparkles,
  Lightbulb,
  Link2
} from 'lucide-react'
import { useBrand } from '@/contexts/BrandContext'
import MobileHeader from '@/components/layout/MobileHeader'

// ============================================================================
// TYPES
// ============================================================================

interface Recommendation {
  id: string
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  effort: 'high' | 'medium' | 'low'
  sources: Array<{ domain: string; url?: string }>
  steps: string[]
  status: 'pending' | 'done' | 'discarded'
}

interface OpportunityData {
  brand: {
    name: string
    domain: string
    category: string
  }
  competitors: Array<{
    name: string
    domain: string
    score: number
    logo_url: string | null
  }>
  topCompetitor: {
    name: string
    domain: string
    score: number
    logo_url: string | null
  } | null
  onPage: Record<string, ActionData>
  offPage: Record<string, ActionData>
  learn: Record<string, string>
  hasData: boolean
}

interface ActionData {
  actionItems: string[]
  phrases: Array<{ phrase: string; count: number }>
  topSources: Array<{ domain: string; count: number; logo_url: string | null }>
}

type ActionId = 'comparison' | 'article' | 'howto' | 'listicle' | 'product' | 'reddit' | 'linkedin' | 'reviews' | 'pr'

// ============================================================================
// CONSTANTS
// ============================================================================

const STATIC_RECOMMENDATIONS: Recommendation[] = [
  {
    id: 'ai-redirect',
    title: 'Redirect AI crawlers to your Harbor profile',
    description: 'AI models cite third-party sources 60% of the time over brand websites. By redirecting AI crawlers to your Harbor profile, you ensure they get accurate, structured data about your brand.',
    impact: 'high',
    effort: 'low',
    sources: [{ domain: 'useharbor.io', url: 'https://useharbor.io' }],
    steps: [
      'Go to the Website tab in your dashboard.',
      'Copy the redirect code for your platform (Cloudflare, nginx, or Next.js).',
      'Deploy to your server or edge worker.',
      'AI crawlers will now get your Harbor profile instead of your marketing site.'
    ],
    status: 'pending'
  },
  {
    id: 'complete-harbor-profile',
    title: 'Complete your Harbor profile',
    description: 'Your Harbor profile is what AI models see when redirected. A complete profile with pricing, FAQs, and products ensures AI gives accurate recommendations.',
    impact: 'high',
    effort: 'low',
    sources: [],
    steps: [
      'Add your current pricing and plans.',
      'List your products/services with descriptions.',
      'Add FAQs that answer common customer questions.',
      'Upload your logo and update company info.'
    ],
    status: 'pending'
  },
  {
    id: 'add-organization-schema',
    title: 'Add Organization schema to your homepage',
    description: 'Even with the redirect, having Organization schema on your site helps search engines and provides a fallback. This takes 5 minutes.',
    impact: 'medium',
    effort: 'low',
    sources: [{ domain: 'schema.org', url: 'https://schema.org/Organization' }],
    steps: [
      'Copy the generated Organization JSON-LD from your Settings page.',
      'Add it to your homepage <head> section.',
      'Validate with Google Rich Results Test.',
      'The schema links back to your Harbor profile as the authoritative source.'
    ],
    status: 'pending'
  },
  {
    id: 'monitor-prompts',
    title: 'Track prompts where competitors appear',
    description: 'See which AI queries mention your competitors but not you. These are opportunities to improve your visibility.',
    impact: 'medium',
    effort: 'low',
    sources: [],
    steps: [
      'Go to the Prompts page and review suggested prompts.',
      'Add prompts where competitors are mentioned.',
      'Track your visibility over time.',
      'Update your Harbor profile based on what AI is getting wrong.'
    ],
    status: 'pending'
  }
]

const actionMeta: Record<ActionId, { title: string; icon: any; category: 'on-page' | 'off-page' }> = {
  comparison: { title: 'Comparison', icon: GitCompare, category: 'on-page' },
  article: { title: 'Article', icon: FileText, category: 'on-page' },
  howto: { title: 'How-To Guide', icon: BookOpen, category: 'on-page' },
  listicle: { title: 'Listicle', icon: List, category: 'on-page' },
  product: { title: 'Product Page', icon: Package, category: 'on-page' },
  reddit: { title: 'Reddit', icon: MessageCircle, category: 'off-page' },
  linkedin: { title: 'LinkedIn', icon: Linkedin, category: 'off-page' },
  reviews: { title: 'Reviews', icon: Star, category: 'off-page' },
  pr: { title: 'Digital PR', icon: Newspaper, category: 'off-page' },
}

// ============================================================================
// SHARED COMPONENTS
// ============================================================================

function Tooltip({ children, content }: { children: React.ReactNode; content: string }) {
  const [show, setShow] = useState(false)
  
  return (
    <div className="relative inline-flex">
      <div
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        className="cursor-help"
      >
        {children}
      </div>
      {show && (
        <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 z-50 w-64 p-3 text-xs text-secondary bg-primary border border-border rounded-lg shadow-xl">
          {content}
          <div className="absolute right-full top-1/2 -translate-y-1/2 border-8 border-transparent border-r-border" />
        </div>
      )}
    </div>
  )
}

function Favicon({ domain, size = 16 }: { domain: string; size?: number }) {
  const [error, setError] = useState(false)
  const cleanDomain = domain.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0]
  
  if (error) {
    return (
      <div 
        className="rounded bg-secondary flex items-center justify-center text-muted"
        style={{ width: size, height: size, fontSize: size * 0.6 }}
      >
        {cleanDomain.charAt(0).toUpperCase()}
      </div>
    )
  }
  
  return (
    <img
      src={`https://www.google.com/s2/favicons?domain=${cleanDomain}&sz=${size * 2}`}
      alt={cleanDomain}
      width={size}
      height={size}
      className="rounded"
      onError={() => setError(true)}
    />
  )
}

// ============================================================================
// GETTING STARTED TAB COMPONENTS
// ============================================================================

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
      <div className="flex gap-0.5">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={`impact-${i}`}
            className={`w-1.5 h-1.5 rounded-full ${i <= impactDots ? getColor(impact, true) : 'bg-border'}`}
          />
        ))}
      </div>
      <span className="capitalize">{impact} impact,</span>
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
  onDiscard
}: { 
  recommendation: Recommendation
  onMarkDone: () => void
  onDiscard: () => void
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

function GettingStartedTab() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>(STATIC_RECOMMENDATIONS)
  const [filter, setFilter] = useState<'all' | 'high' | 'quick-wins'>('all')

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
  const pendingCount = recommendations.filter(r => r.status === 'pending').length

  return (
    <div className="p-6">
      {/* Stats */}
      <div className="flex items-center gap-4 text-sm text-muted mb-6">
        <span>{pendingCount} recommendations</span>
        <span>•</span>
        <span>{completedCount} completed</span>
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
                ? "You've addressed all setup tasks. Check the Content Strategy tab for ongoing opportunities."
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
            />
          ))
        )}
      </div>
    </div>
  )
}

// ============================================================================
// CONTENT STRATEGY TAB COMPONENTS
// ============================================================================

function ContentStrategyTab({ data }: { data: OpportunityData | null }) {
  const [selectedAction, setSelectedAction] = useState<ActionId>('comparison')
  const [copiedPhrase, setCopiedPhrase] = useState<string | null>(null)

  const copyPhrase = (phrase: string) => {
    navigator.clipboard.writeText(phrase)
    setCopiedPhrase(phrase)
    setTimeout(() => setCopiedPhrase(null), 2000)
  }

  const onPageActions = Object.entries(actionMeta)
    .filter(([_, meta]) => meta.category === 'on-page')
    .map(([id]) => id as ActionId)

  const offPageActions = Object.entries(actionMeta)
    .filter(([_, meta]) => meta.category === 'off-page')
    .map(([id]) => id as ActionId)

  const selectedMeta = actionMeta[selectedAction]
  const selectedCategory = selectedMeta.category
  const actionData = data?.[selectedCategory === 'on-page' ? 'onPage' : 'offPage']?.[selectedAction]
  const learnContent = data?.learn?.[selectedAction]

  return (
    <div className="flex h-[calc(100vh-180px)]">
      {/* Left Column - Navigation */}
      <div className="w-56 border-r border-border flex-shrink-0 overflow-y-auto bg-secondary/30">
        {/* On-Page Section */}
        <div className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-medium text-muted uppercase tracking-wide">On-Page</span>
            <Tooltip content="Content you create and control on your own website">
              <Info className="w-3 h-3 text-muted" />
            </Tooltip>
          </div>
          <div className="space-y-0.5">
            {onPageActions.map((actionId) => {
              const meta = actionMeta[actionId]
              const Icon = meta.icon
              const isSelected = selectedAction === actionId
              return (
                <button
                  key={actionId}
                  onClick={() => setSelectedAction(actionId)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${
                    isSelected 
                      ? 'bg-primary text-primary shadow-sm border border-border' 
                      : 'text-secondary hover:bg-primary/50 hover:text-primary'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0 opacity-60" strokeWidth={1.5} />
                  <span className="text-sm">{meta.title}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Off-Page Section */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-medium text-muted uppercase tracking-wide">Off-Page</span>
            <Tooltip content="Your presence and reputation across the web">
              <Info className="w-3 h-3 text-muted" />
            </Tooltip>
          </div>
          <div className="space-y-0.5">
            {offPageActions.map((actionId) => {
              const meta = actionMeta[actionId]
              const Icon = meta.icon
              const isSelected = selectedAction === actionId
              return (
                <button
                  key={actionId}
                  onClick={() => setSelectedAction(actionId)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${
                    isSelected 
                      ? 'bg-primary text-primary shadow-sm border border-border' 
                      : 'text-secondary hover:bg-primary/50 hover:text-primary'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0 opacity-60" strokeWidth={1.5} />
                  <span className="text-sm">{meta.title}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Right Content Area */}
      <div className="flex-1 overflow-y-auto">
        {/* Breadcrumb */}
        <div className="px-6 py-4 border-b border-border bg-secondary/20">
          <div className="flex items-center gap-2 text-sm text-muted">
            <span>{selectedCategory === 'on-page' ? 'On-Page' : 'Off-Page'}</span>
            <span className="opacity-40">›</span>
            <span className="text-primary font-medium">{selectedMeta.title}</span>
          </div>
        </div>

        {/* Two-column content */}
        <div className="grid lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-border">
          {/* Action Items */}
          <div className="p-6">
            <div className="flex items-center gap-2 mb-5">
              <CheckCircle2 className="w-4 h-4 text-muted" strokeWidth={1.5} />
              <h2 className="text-sm font-medium text-primary">Action Items</h2>
              <Tooltip content="Specific steps you can take to improve visibility for this opportunity type">
                <Info className="w-3 h-3 text-muted" />
              </Tooltip>
            </div>
            <ul className="space-y-4">
              {actionData?.actionItems.map((item, i) => (
                <li key={i} className="flex items-start gap-3 group">
                  <div className="w-5 h-5 rounded-full bg-chart-2/10 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-chart-2/20 transition-colors">
                    <CheckCircle2 className="w-3 h-3 text-chart-2" />
                  </div>
                  <span className="text-sm text-secondary leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Learn */}
          <div className="p-6 bg-secondary/20">
            <div className="flex items-center gap-2 mb-5">
              <Info className="w-4 h-4 text-muted" strokeWidth={1.5} />
              <h2 className="text-sm font-medium text-primary">Learn</h2>
            </div>
            <div className="text-sm text-secondary leading-relaxed whitespace-pre-line">
              {learnContent || 'Loading...'}
            </div>
          </div>
        </div>

        {/* Phrases and Sources */}
        <div className="border-t border-border">
          <div className="px-6 py-4 border-b border-border bg-secondary/10">
            <h3 className="text-sm font-medium text-primary">Phrases and Sources</h3>
            <p className="text-xs text-muted mt-0.5">Data based on your category: {data?.brand?.category || 'Unknown'}</p>
          </div>
          <div className="grid lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-border">
            {/* Common Phrases */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted uppercase tracking-wide font-medium">Common Phrases</span>
                  <Tooltip content="Search phrases and questions real users ask AI about this topic">
                    <Info className="w-3 h-3 text-muted" />
                  </Tooltip>
                </div>
              </div>
              <div className="space-y-1">
                {actionData?.phrases.map((phrase, i) => (
                  <div 
                    key={i} 
                    className="flex items-center justify-between py-2.5 px-3 -mx-3 rounded-lg hover:bg-secondary/50 transition-colors group cursor-pointer"
                    onClick={() => copyPhrase(phrase.phrase)}
                  >
                    <span className="text-sm text-secondary truncate pr-4 flex-1">{phrase.phrase}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted tabular-nums font-medium">{phrase.count}</span>
                      {copiedPhrase === phrase.phrase ? (
                        <Check className="w-4 h-4 text-chart-2 opacity-100" />
                      ) : (
                        <Copy className="w-4 h-4 text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Sources */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted uppercase tracking-wide font-medium">Top Sources</span>
                  <Tooltip content="Websites frequently cited by AI for this type of content. Study these to understand what works.">
                    <Info className="w-3 h-3 text-muted" />
                  </Tooltip>
                </div>
              </div>
              <div className="space-y-1">
                {actionData?.topSources.map((source, i) => (
                  <a
                    key={i}
                    href={`https://${source.domain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between py-2.5 px-3 -mx-3 rounded-lg hover:bg-secondary/50 transition-colors group"
                  >
                    <span className="text-sm text-secondary flex items-center gap-2.5">
                      <Favicon domain={source.domain} size={16} />
                      <span className="group-hover:underline">{source.domain}</span>
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted tabular-nums font-medium">{source.count}</span>
                      <ExternalLink className="w-3.5 h-3.5 text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Competitor Context */}
        {data?.topCompetitor && (
          <div className="border-t border-border p-6 bg-secondary/10">
            <div className="flex items-center gap-3 p-4 rounded-lg border border-border bg-primary">
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center overflow-hidden">
                {data.topCompetitor.logo_url ? (
                  <img src={data.topCompetitor.logo_url} alt={data.topCompetitor.name} className="w-6 h-6 object-contain" />
                ) : (
                  <Favicon domain={data.topCompetitor.domain} size={24} />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm text-secondary">
                  <span className="font-medium text-primary">{data.topCompetitor.name}</span> is currently leading your category with a{' '}
                  <span className="font-medium text-chart-2">{data.topCompetitor.score}%</span> visibility score.
                  Study their approach at{' '}
                  <a 
                    href={`https://${data.topCompetitor.domain}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-chart-1 hover:underline"
                  >
                    {data.topCompetitor.domain}
                  </a>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function OpportunitiesPage() {
  const { currentDashboard } = useBrand()
  const [activeTab, setActiveTab] = useState<'getting-started' | 'content-strategy'>('getting-started')
  const [data, setData] = useState<OpportunityData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!currentDashboard?.id) return

    const fetchData = async () => {
      try {
        const res = await fetch(`/api/dashboard/${currentDashboard.id}/opportunities`)
        if (res.ok) {
          const json = await res.json()
          setData(json)
        }
      } catch (err) {
        console.error('Failed to fetch opportunities:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [currentDashboard?.id])

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
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-muted" strokeWidth={1.5} />
            <div>
              <h1 className="text-lg font-semibold text-primary">Opportunities</h1>
              <p className="text-sm text-muted">
                {data?.brand?.name ? `Improve ${data.brand.name}'s AI visibility` : 'Improve your AI visibility'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border bg-secondary/20">
        <div className="flex gap-0">
          <button
            onClick={() => setActiveTab('getting-started')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'getting-started'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted hover:text-secondary'
            }`}
          >
            Getting Started
          </button>
          <button
            onClick={() => setActiveTab('content-strategy')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'content-strategy'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted hover:text-secondary'
            }`}
          >
            Content Strategy
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'getting-started' ? (
        <GettingStartedTab />
      ) : (
        <ContentStrategyTab data={data} />
      )}
    </div>
  )
}