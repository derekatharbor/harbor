// apps/web/app/dashboard/overview/page.tsx
// Overview Dashboard with real data from APIs

'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { 
  ArrowUpRight,
  Download,
  Eye,
  Globe,
  ChevronDown,
  Check,
  MessageSquare,
  Calendar,
  Tag,
  BarChart3,
  Target,
  AlertCircle
} from 'lucide-react'
import { useBrand } from '@/contexts/BrandContext'
import MobileHeader from '@/components/layout/MobileHeader'

// ============================================================================
// TYPES
// ============================================================================

interface CompetitorData {
  rank: number
  name: string
  logo: string
  visibility: number
  visibilityDelta: number | null
  sentiment: number
  sentimentDelta: number | null
  position: number
  positionDelta: number | null
  mentions: number
  isUser: boolean
  color: string
}

interface SourceData {
  domain: string
  logo: string
  type: string
  citations: number
}

// ============================================================================
// COMPONENT
// ============================================================================

const MODEL_NAMES: Record<string, string> = {
  all: 'All Models',
  chatgpt: 'ChatGPT',
  claude: 'Claude',
  perplexity: 'Perplexity',
}

// Color palette for chart lines
const CHART_COLORS = [
  '#FF6B4A', // Coral (user's brand)
  '#3B82F6', // Blue
  '#22C55E', // Green
  '#8B5CF6', // Purple
  '#F59E0B', // Amber
]

export default function OverviewPage() {
  const { currentDashboard } = useBrand()
  
  const [loading, setLoading] = useState(true)
  const [competitors, setCompetitors] = useState<CompetitorData[]>([])
  const [sources, setSources] = useState<SourceData[]>([])
  const [userRank, setUserRank] = useState<number | null>(null)
  const [totalBrands, setTotalBrands] = useState(0)
  
  // Filters
  const [selectedModel, setSelectedModel] = useState('all')
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false)
  const [tagsDropdownOpen, setTagsDropdownOpen] = useState(false)
  const modelDropdownRef = useRef<HTMLDivElement>(null)
  const tagsDropdownRef = useRef<HTMLDivElement>(null)
  
  // Chart toggle
  const [activeMetric, setActiveMetric] = useState<'visibility' | 'sentiment' | 'position'>('visibility')

  // Fetch data
  useEffect(() => {
    async function fetchData() {
      if (!currentDashboard?.id) {
        setLoading(false)
        return
      }

      try {
        // Fetch competitors
        const competitorsRes = await fetch(`/api/dashboard/${currentDashboard.id}/competitors?limit=10`)
        if (competitorsRes.ok) {
          const data = await competitorsRes.json()
          setCompetitors(data.competitors || [])
          setUserRank(data.user_rank)
          setTotalBrands(data.total_brands_found || 0)
        }

        // Fetch sources
        const sourcesRes = await fetch(`/api/sources?limit=5`)
        if (sourcesRes.ok) {
          const data = await sourcesRes.json()
          setSources(data.sources || [])
        }
      } catch (err) {
        console.error('Error fetching overview data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [currentDashboard?.id])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modelDropdownRef.current && !modelDropdownRef.current.contains(event.target as Node)) {
        setModelDropdownOpen(false)
      }
      if (tagsDropdownRef.current && !tagsDropdownRef.current.contains(event.target as Node)) {
        setTagsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const getSourceTypeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'corporate': return '#F59E0B'
      case 'editorial': return '#3B82F6'
      case 'ugc': return '#22C55E'
      case 'review': return '#EC4899'
      default: return '#71717A'
    }
  }

  const brandName = currentDashboard?.brand_name || 'Your Brand'
  const brandLogo = currentDashboard?.logo_url

  if (loading) {
    return (
      <div className="min-h-screen bg-primary" data-page="overview">
        <MobileHeader />
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-16 bg-card rounded-lg w-full"></div>
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 h-96 bg-card rounded-lg"></div>
              <div className="h-96 bg-card rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Empty state check
  const hasData = competitors.length > 0

  return (
    <div className="min-h-screen bg-primary" data-page="overview">
      <MobileHeader />
      
      {/* Header Bar */}
      <div className="page-header-bar">
        <div className="flex items-center gap-3">
          {/* Brand badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary rounded-lg border border-border">
            {brandLogo ? (
              <img src={brandLogo} alt={brandName} className="w-5 h-5 rounded" onError={(e) => { e.currentTarget.style.display = 'none' }} />
            ) : (
              <div className="w-5 h-5 rounded bg-hover flex items-center justify-center text-xs font-medium text-muted">
                {brandName.charAt(0)}
              </div>
            )}
            <span className="font-medium text-primary text-sm">{brandName}</span>
          </div>

          {/* Time Range */}
          <button className="dropdown-trigger">
            <Calendar className="w-4 h-4 text-muted" />
            <span>Last 7 days</span>
            <ChevronDown className="w-4 h-4 text-muted" />
          </button>

          {/* Tags */}
          <div className="relative" ref={tagsDropdownRef}>
            <button className="dropdown-trigger" onClick={() => setTagsDropdownOpen(!tagsDropdownOpen)}>
              <Tag className="w-4 h-4 text-muted" />
              <span>All tags</span>
              <ChevronDown className={`w-4 h-4 text-muted transition-transform ${tagsDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Models */}
          <div className="relative" ref={modelDropdownRef}>
            <button className="dropdown-trigger" onClick={() => setModelDropdownOpen(!modelDropdownOpen)}>
              <Globe className="w-4 h-4 text-muted" />
              <span>{MODEL_NAMES[selectedModel]}</span>
              <ChevronDown className={`w-4 h-4 text-muted transition-transform ${modelDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {modelDropdownOpen && (
              <div className="dropdown-menu">
                {Object.entries(MODEL_NAMES).map(([key, name]) => (
                  <div
                    key={key}
                    className={`dropdown-item ${selectedModel === key ? 'active' : ''}`}
                    onClick={() => { setSelectedModel(key); setModelDropdownOpen(false) }}
                  >
                    <span className="flex-1">{name}</span>
                    {selectedModel === key && <Check className="w-4 h-4" />}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="dropdown-trigger">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Status Banner */}
      <div className="status-banner">
        <div className="status-banner-text flex items-center gap-2">
          <Eye className="w-4 h-4" />
          <span className="font-medium text-primary">Overview</span>
          <span className="mx-1">•</span>
          {hasData ? (
            <span>
              {userRank ? `${brandName} is ranked #${userRank} of ${totalBrands} brands` : `${totalBrands} brands found in AI responses`}
            </span>
          ) : (
            <span>Run prompts to see your brand's visibility</span>
          )}
        </div>
        {hasData && userRank && (
          <div className="status-banner-metrics">
            <span>Rank: <strong className="text-primary">#{userRank}/{totalBrands}</strong></span>
          </div>
        )}
      </div>

      {/* Main Content */}
      {!hasData ? (
        <div className="p-6">
          <div className="card p-12 text-center">
            <AlertCircle className="w-12 h-12 text-muted mx-auto mb-4 opacity-40" />
            <h2 className="text-xl font-semibold text-primary mb-2">No Data Yet</h2>
            <p className="text-sm text-muted mb-6">
              Run prompts to see how AI models mention your brand and competitors.
            </p>
            <Link 
              href="/dashboard/prompts"
              className="inline-flex items-center gap-2 px-4 py-2 bg-secondary rounded-lg text-sm font-medium text-primary hover:bg-hover transition-colors"
            >
              Go to Prompts
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
      <div className="p-6 space-y-6">
        {/* Chart + Competitors */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart */}
          <div className="lg:col-span-2 card p-0 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="pill-group">
                <button 
                  className={`pill flex items-center gap-1.5 ${activeMetric === 'visibility' ? 'active' : ''}`}
                  onClick={() => setActiveMetric('visibility')}
                >
                  <Eye className="w-3.5 h-3.5" />
                  Visibility
                </button>
                <button 
                  className={`pill flex items-center gap-1.5 ${activeMetric === 'sentiment' ? 'active' : ''}`}
                  onClick={() => setActiveMetric('sentiment')}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Sentiment
                </button>
                <button 
                  className={`pill flex items-center gap-1.5 ${activeMetric === 'position' ? 'active' : ''}`}
                  onClick={() => setActiveMetric('position')}
                >
                  <Target className="w-3.5 h-3.5" />
                  Position
                </button>
              </div>
            </div>

            <div className="p-4 h-[360px]">
              {competitors.length > 1 ? (
                <div className="flex items-center justify-center h-full text-center">
                  <div>
                    <BarChart3 className="w-12 h-12 text-muted mx-auto mb-4 opacity-40" />
                    <p className="text-sm text-muted">Historical trend data coming soon</p>
                    <p className="text-xs text-muted mt-1">We need more data points to show trends</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-center">
                  <div>
                    <BarChart3 className="w-12 h-12 text-muted mx-auto mb-4 opacity-40" />
                    <p className="text-sm text-muted">Run more prompts to see trends</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Competitors Table */}
          <div className="card p-0 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div>
                <h3 className="font-semibold text-primary text-sm">Top Brands in AI Responses</h3>
                <p className="text-xs text-muted mt-0.5">Brands mentioned alongside {brandName}</p>
              </div>
              <Link href="/dashboard/competitors" className="expand-btn">
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-12 gap-1 px-4 py-2 text-xs text-muted border-b border-border bg-secondary">
              <div className="col-span-5 flex items-center gap-1">Visibility <ChevronDown className="w-3 h-3" /></div>
              <div className="col-span-3 text-center">Sentiment</div>
              <div className="col-span-4 text-right">Position</div>
            </div>

            <div className="max-h-[320px] overflow-y-auto">
              {competitors.map((comp, idx) => (
                <div 
                  key={comp.name}
                  className={`grid grid-cols-12 gap-1 px-4 py-3 items-center hover:bg-hover ${comp.isUser ? 'bg-secondary/50' : ''}`}
                  style={{ 
                    borderTop: idx > 0 ? '1px solid rgba(255,255,255,0.06)' : 'none'
                  }}
                >
                  <div className="col-span-5 flex items-center gap-2">
                    <span className="text-muted text-sm w-4">{comp.rank}</span>
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: comp.color }} />
                    <img 
                      src={`https://cdn.brandfetch.io/${comp.name.toLowerCase().replace(/\s+/g, '').replace(/\.com$/i, '')}.com/w/400/h/400`} 
                      alt="" 
                      className="w-5 h-5 rounded" 
                      onError={(e) => { e.currentTarget.style.display = 'none' }} 
                    />
                    <span className="text-sm font-medium text-primary truncate">{comp.name}</span>
                    {comp.isUser && <span className="text-xs text-muted">(you)</span>}
                  </div>
                  
                  <div className="col-span-2 text-sm">
                    <span className="text-secondary">{comp.visibility}%</span>
                    {comp.visibilityDelta !== null && (
                      <span className={`ml-1 text-xs ${comp.visibilityDelta > 0 ? 'text-positive' : 'text-negative'}`}>
                        {comp.visibilityDelta > 0 ? '↑' : '↓'} {Math.abs(comp.visibilityDelta)}
                      </span>
                    )}
                  </div>
                  
                  <div className="col-span-2 text-sm text-center">
                    <span className="text-secondary">{comp.sentiment}%</span>
                    {comp.sentimentDelta !== null && (
                      <span className={`ml-1 text-xs ${comp.sentimentDelta > 0 ? 'text-positive' : 'text-negative'}`}>
                        {comp.sentimentDelta > 0 ? '↑' : '↓'} {Math.abs(comp.sentimentDelta)}
                      </span>
                    )}
                  </div>
                  
                  <div className="col-span-3 text-sm text-right">
                    <span className="text-secondary">{comp.position}</span>
                    {comp.positionDelta !== null && (
                      <span className={`ml-1 text-xs ${comp.positionDelta < 0 ? 'text-positive' : 'text-negative'}`}>
                        {comp.positionDelta < 0 ? '↑' : '↓'} {Math.abs(comp.positionDelta)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sources + Donut */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 card p-0 overflow-hidden">
            <div className="flex items-center gap-4 px-4 pt-4">
              <button className="pb-2 text-sm font-medium text-primary border-b-2 border-primary">Domains</button>
              <button className="pb-2 text-sm font-medium text-muted hover:text-secondary">URLs</button>
            </div>

            <table className="data-table">
              <thead>
                <tr>
                  <th className="w-8">#</th>
                  <th>Domain</th>
                  <th>Type</th>
                  <th className="text-right">Citations</th>
                </tr>
              </thead>
              <tbody>
                {sources.length > 0 ? sources.map((source, idx) => (
                  <tr key={source.domain}>
                    <td className="text-muted">{idx + 1}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <img 
                          src={`https://www.google.com/s2/favicons?domain=${source.domain}&sz=32`} 
                          alt="" 
                          className="w-5 h-5 rounded" 
                        />
                        <span className="font-medium text-primary">{source.domain}</span>
                      </div>
                    </td>
                    <td>
                      <span 
                        className="badge text-xs"
                        style={{ backgroundColor: `${getSourceTypeColor(source.type)}15`, color: getSourceTypeColor(source.type) }}
                      >
                        {source.type || 'Other'}
                      </span>
                    </td>
                    <td className="text-right">{source.citations}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-muted">
                      No sources data yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="card p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-primary text-sm">Source Distribution</h3>
                <p className="text-xs text-muted mt-0.5">Coming soon</p>
              </div>
            </div>

            <div className="flex items-center justify-center py-12">
              <p className="text-sm text-muted">Run more prompts to see source analysis</p>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  )
}