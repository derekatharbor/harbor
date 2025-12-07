// apps/web/app/dashboard/overview/page.tsx
// Overview Dashboard with real data from APIs

'use client'

import React, { useEffect, useState, useRef } from 'react'
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
  AlertCircle,
  MessageCircle,
  X
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

interface PromptExecution {
  id: string
  prompt: string
  topic: string
  model: string
  modelName: string
  modelLogo: string
  responsePreview: string
  responseText: string
  executedAt: string
  timeAgo: string
  brandsCount: number
  brands: string[]
  citationsCount: number
  citationDomains: string[]
  citationFavicons: string[]
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
  
  // Recent prompts state
  const [recentPrompts, setRecentPrompts] = useState<PromptExecution[]>([])
  const [promptsLoading, setPromptsLoading] = useState(true)
  const [brandMentionedOnly, setBrandMentionedOnly] = useState(false)
  const [selectedPrompt, setSelectedPrompt] = useState<PromptExecution | null>(null)
  
  // Filters
  const [selectedModel, setSelectedModel] = useState('all')
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false)
  const [tagsDropdownOpen, setTagsDropdownOpen] = useState(false)
  const modelDropdownRef = useRef<HTMLDivElement>(null)
  const tagsDropdownRef = useRef<HTMLDivElement>(null)
  
  // Chart toggle
  const [activeMetric, setActiveMetric] = useState<'visibility' | 'sentiment' | 'position'>('visibility')

  // Fetch main data
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

        // Fetch sources (filtered by dashboard's prompts)
        const sourcesRes = await fetch(`/api/sources?dashboard_id=${currentDashboard.id}&limit=5`)
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

  // Fetch recent prompts
  useEffect(() => {
    async function fetchPrompts() {
      setPromptsLoading(true)
      try {
        const params = new URLSearchParams({ limit: '12' })
        if (brandMentionedOnly && currentDashboard?.brand_name) {
          params.set('brand', currentDashboard.brand_name)
        }

        const res = await fetch(`/api/prompts/recent?${params}`)
        if (res.ok) {
          const data = await res.json()
          setRecentPrompts(data.prompts || [])
        }
      } catch (error) {
        console.error('Failed to fetch prompts:', error)
      } finally {
        setPromptsLoading(false)
      }
    }

    fetchPrompts()
  }, [brandMentionedOnly, currentDashboard?.brand_name])

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
            <button 
              className="dropdown-trigger"
              onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
            >
              <Globe className="w-4 h-4 text-muted" />
              <span>{MODEL_NAMES[selectedModel]}</span>
              <ChevronDown className={`w-4 h-4 text-muted transition-transform ${modelDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {modelDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 bg-card border border-border rounded-lg shadow-lg py-1 z-50 min-w-40">
                {Object.entries(MODEL_NAMES).map(([key, label]) => (
                  <button
                    key={key}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-hover flex items-center justify-between"
                    onClick={() => { setSelectedModel(key); setModelDropdownOpen(false) }}
                  >
                    <span className={selectedModel === key ? 'text-primary' : 'text-secondary'}>{label}</span>
                    {selectedModel === key && <Check className="w-4 h-4 text-accent" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-secondary hover:text-primary transition-colors">
          <Download className="w-4 h-4" />
          <span>Export</span>
        </button>
      </div>

      {/* Page Title */}
      <div className="px-6 pt-4 pb-2 flex items-center gap-2">
        <Eye className="w-4 h-4 text-muted" />
        <h1 className="text-sm font-medium text-secondary">Overview</h1>
        <span className="text-muted">•</span>
        <span className="text-sm text-muted">{totalBrands} brands found in AI responses</span>
      </div>

      {!hasData ? (
        <div className="p-6">
          <div className="card p-12 text-center">
            <AlertCircle className="w-12 h-12 text-muted mx-auto mb-4 opacity-40" />
            <h2 className="text-lg font-semibold text-primary mb-2">No data yet</h2>
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

        {/* Recent Prompts Section */}
        <div className="card p-0 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h3 className="font-semibold text-primary text-sm flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              Recent Chats
            </h3>
            
            {currentDashboard?.brand_name && (
              <label className="flex items-center gap-2 text-sm text-muted cursor-pointer">
                <div 
                  className={`relative w-9 h-5 rounded-full transition-colors cursor-pointer ${
                    brandMentionedOnly ? 'bg-accent' : 'bg-gray-300'
                  }`}
                  onClick={() => setBrandMentionedOnly(!brandMentionedOnly)}
                >
                  <div 
                    className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                      brandMentionedOnly ? 'translate-x-4' : 'translate-x-0.5'
                    }`}
                  />
                </div>
                <span>{currentDashboard.brand_name} mentioned</span>
              </label>
            )}
          </div>

          <div className="p-4" style={{ backgroundColor: '#FAFAFA' }}>
            {promptsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-gray-200 rounded-lg h-36" />
                ))}
              </div>
            ) : recentPrompts.length === 0 ? (
              <div className="text-center py-12 text-muted">
                <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No recent prompts found</p>
                {brandMentionedOnly && (
                  <p className="text-sm mt-1">Try turning off the brand filter</p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentPrompts.map((prompt) => (
                  <div 
                    key={prompt.id}
                    onClick={() => setSelectedPrompt(prompt)}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-all cursor-pointer shadow-sm"
                  >
                    {/* Header: Model logo + prompt */}
                    <div className="flex items-start gap-3 mb-3">
                      <img 
                        src={prompt.modelLogo} 
                        alt={prompt.modelName}
                        className="w-6 h-6 rounded-md flex-shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/24'
                        }}
                      />
                      <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
                        {prompt.prompt}
                      </h4>
                    </div>

                    {/* Response preview */}
                    <p className="text-sm text-gray-500 line-clamp-3 mb-4">
                      {prompt.responsePreview}
                    </p>

                    {/* Footer: Citations + time */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        {prompt.citationFavicons.slice(0, 3).map((favicon, i) => (
                          <img 
                            key={i}
                            src={favicon}
                            alt=""
                            className="w-4 h-4 rounded-sm"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none'
                            }}
                          />
                        ))}
                        {prompt.citationsCount > 3 && (
                          <span className="text-xs text-gray-400 ml-1">
                            +{prompt.citationsCount - 3}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-400">{prompt.timeAgo}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
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

      {/* Prompt Detail Modal */}
      {selectedPrompt && (
        <PromptModal 
          prompt={selectedPrompt} 
          onClose={() => setSelectedPrompt(null)} 
        />
      )}
    </div>
  )
}

// ============================================================================
// PROMPT MODAL COMPONENT
// ============================================================================

function PromptModal({ prompt, onClose }: { prompt: PromptExecution; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden flex flex-col border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3">
            <img 
              src={prompt.modelLogo} 
              alt={prompt.modelName}
              className="w-8 h-8 rounded-lg"
            />
            <div>
              <span className="text-sm font-medium text-gray-900">{prompt.modelName}</span>
              <span className="mx-2 text-gray-400">•</span>
              <span className="text-sm text-gray-500">{prompt.topic}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Main content */}
          <div className="flex-1 overflow-y-auto p-6 bg-white">
            {/* User query */}
            <div className="flex items-start gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                <span className="text-sm">👤</span>
              </div>
              <div className="bg-gray-100 rounded-2xl px-4 py-3 max-w-lg">
                <p className="text-gray-900">{prompt.prompt}</p>
              </div>
            </div>

            {/* AI response */}
            <div className="flex items-start gap-3">
              <img 
                src={prompt.modelLogo} 
                alt={prompt.modelName}
                className="w-8 h-8 rounded-lg flex-shrink-0"
              />
              <div className="flex-1 prose prose-sm max-w-none">
                <FormattedResponse text={prompt.responseText} />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-72 border-l border-gray-200 bg-gray-50 p-4 overflow-y-auto">
            {/* Brands section */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Brands
              </h4>
              {prompt.brands.length === 0 ? (
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <span className="opacity-50">∅</span> No Brands
                </p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {prompt.brands.map((brand, i) => (
                    <span 
                      key={i}
                      className="text-xs bg-white border border-gray-200 rounded-full px-2.5 py-1 text-gray-700"
                    >
                      {brand}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Sources section */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Sources
              </h4>
              {prompt.citationDomains.length === 0 ? (
                <p className="text-sm text-gray-500">No sources cited</p>
              ) : (
                <div className="space-y-2">
                  {prompt.citationDomains.map((domain, i) => (
                    <a 
                      key={i}
                      href={`https://${domain}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-gray-700 hover:text-blue-600 transition-colors"
                    >
                      <img 
                        src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
                        alt=""
                        className="w-4 h-4 rounded-sm"
                      />
                      <span className="truncate">{domain}</span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Format AI response - convert markdown to clean HTML
function FormattedResponse({ text }: { text: string }) {
  if (!text) return null

  // Check if response contains markdown table
  const hasTable = text.includes('|') && text.includes('---')
  
  if (hasTable) {
    // Parse markdown tables and other content
    const sections = text.split(/\n\n+/)
    
    return (
      <div className="space-y-4">
        {sections.map((section, idx) => {
          // Check if this section is a table
          if (section.includes('|') && section.split('\n').length > 2) {
            return <MarkdownTable key={idx} content={section} />
          }
          
          // Regular text - format it
          return (
            <p key={idx} className="text-gray-700 text-sm leading-relaxed">
              {formatTextContent(section)}
            </p>
          )
        })}
      </div>
    )
  }

  // No table - just format text
  return (
    <div 
      className="text-gray-700 text-sm leading-relaxed space-y-3"
      dangerouslySetInnerHTML={{ 
        __html: text
          .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
          .replace(/\n\n/g, '</p><p class="mt-3">')
          .replace(/\n/g, '<br />')
          .replace(/\[(\d+)\]/g, '<sup class="text-xs text-blue-500">$1</sup>')
      }}
    />
  )
}

// Parse and render markdown table
function MarkdownTable({ content }: { content: string }) {
  const lines = content.trim().split('\n').filter(line => line.trim())
  
  if (lines.length < 2) return <p className="text-sm text-gray-700">{content}</p>
  
  // Parse header
  const headerCells = lines[0].split('|').map(cell => cell.trim()).filter(Boolean)
  
  // Skip separator line (index 1)
  // Parse body rows
  const bodyRows = lines.slice(2).map(line => 
    line.split('|').map(cell => cell.trim()).filter(Boolean)
  )

  return (
    <div className="overflow-x-auto my-4">
      <table className="min-w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
        <thead className="bg-gray-50">
          <tr>
            {headerCells.map((cell, i) => (
              <th key={i} className="px-3 py-2 text-left font-medium text-gray-900 border-b border-gray-200">
                {cell.replace(/\*\*/g, '')}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {bodyRows.map((row, rowIdx) => (
            <tr key={rowIdx} className={rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              {row.map((cell, cellIdx) => (
                <td key={cellIdx} className="px-3 py-2 text-gray-700 border-b border-gray-100">
                  {cell.replace(/\*\*/g, '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function formatTextContent(text: string): React.ReactNode {
  // Simple formatting - bold and citations
  const parts = text.split(/(\*\*.*?\*\*|\[\d+\])/g)
  
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold text-gray-900">{part.slice(2, -2)}</strong>
    }
    if (/^\[\d+\]$/.test(part)) {
      return <sup key={i} className="text-xs text-blue-500">{part}</sup>
    }
    return part
  })
}