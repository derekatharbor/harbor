// apps/web/app/dashboard/opportunities/page.tsx
// Personalized action recommendations with real data

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
  Check
} from 'lucide-react'
import { useBrand } from '@/contexts/BrandContext'
import MobileHeader from '@/components/layout/MobileHeader'

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

// Tooltip component
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

// Favicon component with fallback
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

export default function OpportunitiesPage() {
  const { currentDashboard } = useBrand()
  const [selectedAction, setSelectedAction] = useState<ActionId>('comparison')
  const [data, setData] = useState<OpportunityData | null>(null)
  const [loading, setLoading] = useState(true)
  const [copiedPhrase, setCopiedPhrase] = useState<string | null>(null)

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
          <TrendingUp className="w-5 h-5 text-muted" strokeWidth={1.5} />
          <div>
            <h1 className="text-lg font-semibold text-primary">Opportunities</h1>
            <p className="text-sm text-muted">
              {data?.brand?.name ? `Actions to improve ${data.brand.name}'s AI visibility` : 'Actions to improve your AI visibility'}
            </p>
          </div>
        </div>
      </div>

      {/* Three-column layout */}
      <div className="flex h-[calc(100vh-73px)]">
        
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
              <span>Opportunities</span>
              <span className="opacity-40">›</span>
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
    </div>
  )
}