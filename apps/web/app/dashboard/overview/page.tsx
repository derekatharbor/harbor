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
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts'
import { useBrand } from '@/contexts/BrandContext'
import MobileHeader from '@/components/layout/MobileHeader'

// ============================================================================
// TYPES
// ============================================================================

interface CompetitorData {
  rank: number
  name: string
  logo: string
  fallbackLogo?: string
  visibility: number
  visibilityDelta: number | null
  sentiment: 'positive' | 'neutral' | 'negative'
  sentimentDelta: number | null
  position: number | null
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
  color: string
}

interface SourceDistribution {
  type: string
  count: number
  color: string
  percentage: number
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

interface QuickWin {
  id: string
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  pages_affected?: number
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
  const [sourceDistribution, setSourceDistribution] = useState<SourceDistribution[]>([])
  const [totalCitations, setTotalCitations] = useState(0)
  const [userRank, setUserRank] = useState<number | null>(null)
  const [totalBrands, setTotalBrands] = useState(0)
  
  // Visibility history for chart
  const [visibilityHistory, setVisibilityHistory] = useState<{
    date: string
    displayDate: string
    visibility: number | null
    position: number | null
    sentiment: number | null
  }[]>([])
  const [hasHistoricalData, setHasHistoricalData] = useState(false)
  
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
  
  // Quick wins from website analytics
  const [quickWins, setQuickWins] = useState<QuickWin[]>([])

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
        const sourcesRes = await fetch(`/api/dashboard/${currentDashboard.id}/sources`)
        if (sourcesRes.ok) {
          const data = await sourcesRes.json()
          setSources(data.domains || [])
          setSourceDistribution(data.distribution || [])
          setTotalCitations(data.total || 0)
        }
        
        // Fetch visibility history for chart
        const historyRes = await fetch(`/api/dashboard/${currentDashboard.id}/visibility-history?days=7`)
        if (historyRes.ok) {
          const data = await historyRes.json()
          setVisibilityHistory(data.history || [])
          setHasHistoricalData(data.has_data || false)
        }
        
        // Fetch quick wins from website analytics (recommendations)
        const websiteRes = await fetch(`/api/dashboard/${currentDashboard.id}/website-analytics`)
        if (websiteRes.ok) {
          const data = await websiteRes.json()
          // Get top 3 high/medium impact recommendations
          const recs = (data.recommendations || [])
            .filter((r: QuickWin) => r.impact === 'high' || r.impact === 'medium')
            .slice(0, 3)
          setQuickWins(recs)
        }
      } catch (err) {
        console.error('Error fetching overview data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [currentDashboard?.id])

  // Fetch recent prompts - using prompts/recent which joins with executions
  useEffect(() => {
    async function fetchPrompts() {
      if (!currentDashboard?.id) {
        console.log('[Overview] No dashboard ID, skipping prompts fetch')
        return
      }
      
      console.log('[Overview] Fetching prompts for dashboard:', currentDashboard.id)
      setPromptsLoading(true)
      
      try {
        const params = new URLSearchParams({ 
          limit: '12',
          dashboard_id: currentDashboard.id
        })
        if (brandMentionedOnly && currentDashboard?.brand_name) {
          params.set('brand', currentDashboard.brand_name)
        }

        const res = await fetch(`/api/prompts/recent?${params}`)
        if (res.ok) {
          const data = await res.json()
          console.log('[Overview] Prompts response:', data)
          setRecentPrompts(data.prompts || [])
        }
      } catch (error) {
        console.error('Failed to fetch prompts:', error)
      } finally {
        setPromptsLoading(false)
      }
    }

    fetchPrompts()
  }, [brandMentionedOnly, currentDashboard?.id, currentDashboard?.brand_name])

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
      case 'corporate': return '#FF8C42'    // Orange
      case 'editorial': return '#3B82F6'    // Blue
      case 'ugc': return '#22D3EE'          // Cyan
      case 'institutional': return '#4ADE80' // Green
      case 'reference': return '#A855F7'    // Purple
      default: return '#9CA3AF'             // Gray (Other)
    }
  }

  const brandName = currentDashboard?.brand_name || 'Your Brand'
  const brandLogo = currentDashboard?.logo_url
  
  // Get user's own data from competitors array
  const userData = competitors.find(c => c.isUser)
  const userVisibility = userData?.visibility || 0
  const userSentiment = userData?.sentiment || 'neutral'

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

      {/* User Stats Summary */}
      {hasData && (
        <div className="px-6 pb-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Visibility */}
            <div className="card p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted uppercase tracking-wide">Visibility</span>
                <Eye className="w-3.5 h-3.5 text-muted" />
              </div>
              <div className="text-2xl font-semibold text-primary">{userVisibility}%</div>
              <p className="text-xs text-muted mt-1">Mentioned in {userVisibility}% of tracked prompts</p>
            </div>
            
            {/* Rank */}
            <div className="card p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted uppercase tracking-wide">Rank</span>
                <Target className="w-3.5 h-3.5 text-muted" />
              </div>
              <div className="text-2xl font-semibold text-primary">
                {userRank ? `#${userRank}` : '—'}
              </div>
              <p className="text-xs text-muted mt-1">
                {userRank ? `Out of ${totalBrands} brands in your space` : 'Not yet ranked'}
              </p>
            </div>
            
            {/* Sentiment */}
            <div className="card p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted uppercase tracking-wide">Sentiment</span>
                <MessageSquare className="w-3.5 h-3.5 text-muted" />
              </div>
              <div className={`text-2xl font-semibold capitalize ${
                userSentiment === 'positive' ? 'text-green-500' : 
                userSentiment === 'negative' ? 'text-red-500' : 'text-primary'
              }`}>
                {userSentiment}
              </div>
              <p className="text-xs text-muted mt-1">How AI portrays your brand</p>
            </div>
            
            {/* Citations */}
            <div className="card p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted uppercase tracking-wide">Sources</span>
                <Globe className="w-3.5 h-3.5 text-muted" />
              </div>
              <div className="text-2xl font-semibold text-primary">{totalCitations}</div>
              <p className="text-xs text-muted mt-1">Domains cited in AI responses</p>
            </div>
          </div>
        </div>
      )}

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
        {/* Quick Wins */}
        {quickWins.length > 0 && (
          <div className="card p-0 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div>
                <h3 className="font-semibold text-primary text-sm">Quick Wins</h3>
                <p className="text-xs text-muted mt-0.5">High-impact improvements you can make now</p>
              </div>
              <Link href="/dashboard/website" className="expand-btn">
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="divide-y divide-border">
              {quickWins.map((win) => (
                <div key={win.id} className="px-4 py-3 flex items-start gap-3 hover:bg-hover transition-colors">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                    win.impact === 'high' ? 'bg-red-500' : 'bg-amber-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-primary">{win.title}</div>
                    <div className="text-xs text-muted mt-0.5 line-clamp-1">{win.description}</div>
                  </div>
                  {win.pages_affected && (
                    <span className="text-xs text-muted flex-shrink-0">
                      {win.pages_affected} page{win.pages_affected !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chart + Competitors */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Chart - 7 columns */}
          <div className="lg:col-span-7 card p-0 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2">
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
                <span className="text-xs text-muted ml-2">
                  · {activeMetric === 'visibility' ? 'Percentage of chats mentioning each brand' : 
                     activeMetric === 'sentiment' ? 'How brands are portrayed in responses' : 
                     'Average ranking position'}
                </span>
              </div>
              <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-secondary border border-border rounded-lg hover:bg-secondary transition-colors">
                <Download className="w-3.5 h-3.5" />
                Export
              </button>
            </div>

            <div className="p-4 h-[360px]">
              <VisibilityChart 
                brandName={brandName}
                competitors={competitors}
                metric={activeMetric}
                history={visibilityHistory}
                hasHistoricalData={hasHistoricalData}
              />
            </div>
          </div>

          {/* Competitors Table - 5 columns */}
          <div className="lg:col-span-5 card p-0 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div>
                <h3 className="font-semibold text-primary text-sm">Top Brands in AI Responses</h3>
                <p className="text-xs text-muted mt-0.5">Brands mentioned alongside {brandName}</p>
              </div>
              <Link href="/dashboard/competitors" className="expand-btn">
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-12 gap-2 px-4 py-2 text-xs text-muted border-b border-border bg-secondary">
              <div className="col-span-6">Brand</div>
              <div className="col-span-3 text-center">Visibility</div>
              <div className="col-span-3 text-center">Sentiment</div>
            </div>

            <div className="max-h-[320px] overflow-y-auto">
              {competitors.map((comp, idx) => (
                <div 
                  key={comp.name}
                  className={`grid grid-cols-12 gap-2 px-4 py-3 items-center hover:bg-hover ${comp.isUser ? 'bg-secondary/50' : ''}`}
                  style={{ 
                    borderTop: idx > 0 ? '1px solid rgba(255,255,255,0.06)' : 'none'
                  }}
                >
                  {/* Brand - 6 cols */}
                  <div className="col-span-6 flex items-center gap-2 min-w-0">
                    <span className="text-muted text-xs w-4 flex-shrink-0">{comp.rank}</span>
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: comp.color }} />
                    <img 
                      src={comp.logo} 
                      alt="" 
                      className="w-5 h-5 rounded flex-shrink-0" 
                      onError={(e) => { 
                        const target = e.currentTarget
                        if (comp.fallbackLogo && target.src !== comp.fallbackLogo) {
                          target.src = comp.fallbackLogo
                        } else {
                          target.style.display = 'none'
                        }
                      }} 
                    />
                    <span className="text-sm font-medium text-primary truncate">{comp.name}</span>
                    {comp.isUser && <span className="text-xs text-muted flex-shrink-0">(you)</span>}
                  </div>
                  
                  {/* Visibility - 3 cols */}
                  <div className="col-span-3 text-center">
                    <span className="text-sm text-secondary">{comp.visibility}%</span>
                  </div>
                  
                  {/* Sentiment - 3 cols */}
                  <div className="col-span-3 flex justify-center">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                      comp.sentiment === 'positive' 
                        ? 'bg-[#6B8AFD]/15 text-[#6B8AFD]' 
                        : comp.sentiment === 'negative'
                        ? 'bg-[#F6C177]/15 text-[#F6C177]'
                        : 'bg-white/5 text-white/40'
                    }`}>
                      {comp.sentiment === 'positive' && '↑'}
                      {comp.sentiment === 'negative' && '↓'}
                      {comp.sentiment === 'neutral' && '–'}
                      <span className="capitalize">{comp.sentiment}</span>
                    </span>
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
              Recent Prompts
            </h3>
            
            {currentDashboard?.brand_name && (
              <label className="flex items-center gap-2 text-sm text-muted cursor-pointer">
                <div 
                  className={`relative w-9 h-5 rounded-full transition-colors cursor-pointer ${
                    brandMentionedOnly ? 'bg-accent' : 'bg-[#D1D5DB] dark:bg-[#4B5563]'
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

          <div className="p-4 bg-secondary">
            {promptsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-hover rounded-lg h-36" />
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
                {recentPrompts.map((prompt) => {
                  const isMentioned = prompt.brands.some(
                    b => b.toLowerCase() === brandName.toLowerCase()
                  )
                  return (
                  <div 
                    key={prompt.id}
                    onClick={() => setSelectedPrompt(prompt)}
                    className={`bg-card border rounded-lg p-4 transition-all cursor-pointer shadow-sm hover:shadow-md hover:-translate-y-0.5 ${
                      isMentioned ? 'border-green-500/30 hover:border-green-500/50' : 'border-border hover:border-muted'
                    }`}
                  >
                    {/* Header: Model logo + prompt + mentioned badge */}
                    <div className="flex items-start gap-3 mb-3">
                      <img 
                        src={prompt.modelLogo} 
                        alt={prompt.modelName}
                        className="w-6 h-6 rounded-md flex-shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/24'
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          {isMentioned && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium bg-green-500/10 text-green-500 rounded">
                              <Check className="w-2.5 h-2.5" />
                              Mentioned
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm font-medium text-primary line-clamp-2">
                          {prompt.prompt}
                        </h4>
                      </div>
                    </div>

                    {/* Response preview */}
                    <p className="text-sm text-muted line-clamp-3 mb-4">
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
                          <span className="text-xs text-muted ml-1">
                            +{prompt.citationsCount - 3}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-muted">{prompt.timeAgo}</span>
                    </div>
                  </div>
                )})}
              </div>
            )}
          </div>
        </div>

        {/* Sources + Donut */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2 card p-0 overflow-hidden">
            <div className="flex items-center justify-between px-4 pt-4">
              <div className="flex items-center gap-4">
                <button className="pb-2 text-sm font-medium text-primary border-b-2 border-primary">Domains</button>
                <button className="pb-2 text-sm font-medium text-muted hover:text-secondary">URLs</button>
              </div>
              {sources.length > 5 && (
                <Link href="/dashboard/sources" className="text-xs text-muted hover:text-primary transition-colors">
                  See all →
                </Link>
              )}
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
                {sources.length > 0 ? sources.slice(0, 5).map((source, idx) => (
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
                <p className="text-xs text-muted mt-0.5">By domain type</p>
              </div>
            </div>

            {sourceDistribution.length > 0 ? (
              <div className="flex flex-col items-center">
                <div className="relative w-48 h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={sourceDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={75}
                        paddingAngle={2}
                        dataKey="count"
                      >
                        {sourceDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-semibold text-primary">{totalCitations}</span>
                    <span className="text-xs text-muted">Citations</span>
                  </div>
                </div>
                
                <div className="flex flex-wrap justify-center gap-3 mt-4">
                  {sourceDistribution.map((item) => (
                    <div key={item.type} className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: item.color }} />
                      <span className="text-xs text-secondary">{item.type}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center py-12">
                <p className="text-sm text-muted">Run more prompts to see source analysis</p>
              </div>
            )}
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
// VISIBILITY CHART COMPONENT
// ============================================================================

function VisibilityChart({ 
  brandName, 
  competitors,
  metric,
  history,
  hasHistoricalData
}: { 
  brandName: string
  competitors: CompetitorData[]
  metric: 'visibility' | 'sentiment' | 'position'
  history: { date: string; displayDate: string; visibility: number | null; position: number | null; sentiment: number | null }[]
  hasHistoricalData: boolean
}) {
  // Convert sentiment to numeric for chart
  const sentimentToNumber = (s: string) => {
    if (s === 'positive') return 100
    if (s === 'negative') return 0
    return 50 // neutral
  }
  
  const getValue = (comp: CompetitorData) => {
    if (metric === 'visibility') return comp.visibility
    if (metric === 'sentiment') return sentimentToNumber(comp.sentiment)
    return comp.position || 0
  }
  
  // Get user's brand and top 4 competitors
  const userBrand = competitors.find(c => c.isUser)
  const topCompetitors = competitors.filter(c => !c.isUser).slice(0, 4)
  const charted = [userBrand, ...topCompetitors].filter(Boolean) as CompetitorData[]

  // Generate chart data using real history for user brand, flatline for competitors
  const chartData = history.map(h => {
    const point: Record<string, string | number | null> = { date: h.displayDate }
    
    charted.forEach(comp => {
      if (comp.isUser && hasHistoricalData) {
        // Use real historical data for user's brand
        if (metric === 'visibility') point[comp.name] = h.visibility
        else if (metric === 'sentiment') point[comp.name] = h.sentiment
        else point[comp.name] = h.position
      } else {
        // Flatline competitors at current value (no historical data for them yet)
        point[comp.name] = getValue(comp)
      }
    })
    
    return point
  })
  
  // Fallback if no history data - generate last 7 days
  const fallbackData = () => {
    const dates = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const point: Record<string, string | number> = { 
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) 
      }
      charted.forEach(comp => {
        point[comp.name] = getValue(comp)
      })
      dates.push(point)
    }
    return dates
  }
  
  const finalChartData = chartData.length > 0 ? chartData : fallbackData()

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={finalChartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid 
          strokeDasharray="3 3" 
          vertical={true}
          stroke="var(--border)"
        />
        <XAxis 
          dataKey="date" 
          axisLine={false}
          tickLine={false}
          tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
          dy={10}
        />
        <YAxis 
          axisLine={false}
          tickLine={false}
          tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
          domain={metric === 'position' ? [0, 10] : [0, 100]}
          tickFormatter={(value) => metric === 'position' ? value : `${value}%`}
          dx={-10}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#111213',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px',
            boxShadow: '0 4px 18px rgba(0,0,0,0.22)',
          }}
          labelStyle={{ color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}
          itemStyle={{ padding: '2px 0' }}
          formatter={(value: any, name: string) => [
            value === null ? 'No data' : (metric === 'position' ? Number(value).toFixed(1) : `${value}%`),
            name
          ]}
        />
        <Legend 
          verticalAlign="top" 
          height={36}
          iconType="line"
          iconSize={10}
          wrapperStyle={{ fontSize: '11px', color: 'var(--text-muted)' }}
        />
        {charted.map((comp) => (
          <Line
            key={comp.name}
            type="monotone"
            dataKey={comp.name}
            stroke={comp.color}
            strokeWidth={comp.isUser ? 2 : 1.5}
            strokeDasharray={comp.isUser ? undefined : '4 4'}
            dot={false}
            activeDot={{ r: 3, fill: comp.color }}
            connectNulls={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}

// ============================================================================
// PROMPT MODAL COMPONENT
// ============================================================================

function PromptModal({ prompt, onClose }: { prompt: PromptExecution; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-card rounded-2xl shadow-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden flex flex-col border border-border">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-secondary">
          <div className="flex items-center gap-3">
            <img 
              src={prompt.modelLogo} 
              alt={prompt.modelName}
              className="w-8 h-8 rounded-lg"
            />
            <div>
              <span className="text-sm font-medium text-primary">{prompt.modelName}</span>
              <span className="mx-2 text-muted">•</span>
              <span className="text-sm text-muted">{prompt.topic}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={onClose}
              className="p-2 hover:bg-hover rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-muted" />
            </button>
          </div>
        </div>

        {/* Content area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Main content */}
          <div className="flex-1 overflow-y-auto p-6 bg-card">
            {/* User query */}
            <div className="flex items-start gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-hover flex items-center justify-center flex-shrink-0">
                <span className="text-sm">👤</span>
              </div>
              <div className="bg-hover rounded-2xl px-4 py-3 max-w-lg">
                <p className="text-primary">{prompt.prompt}</p>
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
          <div className="w-72 border-l border-border bg-secondary p-4 overflow-y-auto">
            {/* Brands section */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-primary mb-2 flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Brands
              </h4>
              {prompt.brands.length === 0 ? (
                <p className="text-sm text-muted flex items-center gap-2">
                  <span className="opacity-50">∅</span> No Brands
                </p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {prompt.brands.map((brand, i) => (
                    <span 
                      key={i}
                      className="text-xs bg-card border border-border rounded-full px-2.5 py-1 text-secondary"
                    >
                      {brand}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Sources section */}
            <div>
              <h4 className="text-sm font-medium text-primary mb-2 flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Sources
              </h4>
              {prompt.citationDomains.length === 0 ? (
                <p className="text-sm text-muted">No sources cited</p>
              ) : (
                <div className="space-y-2">
                  {prompt.citationDomains.map((domain, i) => (
                    <a 
                      key={i}
                      href={`https://${domain}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-secondary hover:text-accent transition-colors"
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
            <p key={idx} className="text-secondary text-sm leading-relaxed">
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
      className="text-secondary text-sm leading-relaxed space-y-3"
      dangerouslySetInnerHTML={{ 
        __html: text
          .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-primary">$1</strong>')
          .replace(/\n\n/g, '</p><p class="mt-3">')
          .replace(/\n/g, '<br />')
          .replace(/\[(\d+)\]/g, '<sup class="text-xs text-accent">$1</sup>')
      }}
    />
  )
}

// Parse and render markdown table
function MarkdownTable({ content }: { content: string }) {
  const lines = content.trim().split('\n').filter(line => line.trim())
  
  if (lines.length < 2) return <p className="text-sm text-secondary">{content}</p>
  
  // Parse header
  const headerCells = lines[0].split('|').map(cell => cell.trim()).filter(Boolean)
  
  // Skip separator line (index 1)
  // Parse body rows
  const bodyRows = lines.slice(2).map(line => 
    line.split('|').map(cell => cell.trim()).filter(Boolean)
  )

  return (
    <div className="overflow-x-auto my-4">
      <table className="min-w-full text-sm border border-border rounded-lg overflow-hidden">
        <thead className="bg-secondary">
          <tr>
            {headerCells.map((cell, i) => (
              <th key={i} className="px-3 py-2 text-left font-medium text-primary border-b border-border">
                {cell.replace(/\*\*/g, '')}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {bodyRows.map((row, rowIdx) => (
            <tr key={rowIdx} className={rowIdx % 2 === 0 ? 'bg-card' : 'bg-secondary'}>
              {row.map((cell, cellIdx) => (
                <td key={cellIdx} className="px-3 py-2 text-secondary border-b border-border">
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
      return <strong key={i} className="font-semibold text-primary">{part.slice(2, -2)}</strong>
    }
    if (/^\[\d+\]$/.test(part)) {
      return <sup key={i} className="text-xs text-accent">{part}</sup>
    }
    return part
  })
}