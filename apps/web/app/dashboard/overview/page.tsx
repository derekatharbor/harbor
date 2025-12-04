// apps/web/app/dashboard/overview/page.tsx
// Peec-inspired Overview Dashboard with Models filter, Prompts, Sources

'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  Download,
  Eye,
  Globe,
  ChevronDown,
  Minus,
  Check,
  MessageSquare,
  Link2,
  Calendar,
  Sparkles
} from 'lucide-react'
import { useBrand } from '@/contexts/BrandContext'
import MobileHeader from '@/components/layout/MobileHeader'
import ScanProgressInline from '@/components/scan/ScanProgressInline'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts'

// Model logos
const MODEL_LOGOS: Record<string, string> = {
  chatgpt: '/models/chatgpt-logo.png',
  claude: '/models/claude-logo.png',
  perplexity: '/models/perplexity-logo.png',
  gemini: '/logos/gemini.svg',
}

const MODEL_NAMES: Record<string, string> = {
  all: 'All Models',
  chatgpt: 'ChatGPT',
  claude: 'Claude',
  perplexity: 'Perplexity',
  gemini: 'Gemini',
}

interface BrandMention {
  brand_name: string
  mention_count: number
  avg_position: number
  sentiment?: string
}

interface SourceData {
  domain: string
  citation_count: number
  avg_citations: number
  type: string
}

interface PromptExecution {
  id: string
  prompt_text: string
  category: string
  model: string
  response_text: string
  executed_at: string
  brand_mentions?: BrandMention[]
}

export default function OverviewPage() {
  const { currentDashboard } = useBrand()
  const router = useRouter()
  
  const [loading, setLoading] = useState(true)
  const [scanStatus, setScanStatus] = useState<'none' | 'running' | 'done'>('none')
  const [currentScanId, setCurrentScanId] = useState<string | null>(null)
  
  // Filters
  const [timeRange, setTimeRange] = useState('7d')
  const [selectedModel, setSelectedModel] = useState('all')
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false)
  const modelDropdownRef = useRef<HTMLDivElement>(null)
  
  // Data
  const [visibilityData, setVisibilityData] = useState<any[]>([])
  const [brandMentions, setBrandMentions] = useState<BrandMention[]>([])
  const [topSources, setTopSources] = useState<SourceData[]>([])
  const [recentPrompts, setRecentPrompts] = useState<PromptExecution[]>([])
  const [stats, setStats] = useState({
    totalExecutions: 0,
    avgVisibility: 0,
    totalCitations: 0,
  })

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modelDropdownRef.current && !modelDropdownRef.current.contains(event.target as Node)) {
        setModelDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    async function fetchData() {
      if (!currentDashboard) {
        setLoading(false)
        return
      }

      try {
        // Fetch prompt executions with brand mentions
        const promptsRes = await fetch(`/api/prompts/list?limit=100&model=${selectedModel === 'all' ? '' : selectedModel}`)
        if (promptsRes.ok) {
          const data = await promptsRes.json()
          
          // Get recent prompts for the widget
          setRecentPrompts(data.prompts?.slice(0, 5) || [])
          
          // Calculate stats
          const executions = data.prompts || []
          setStats({
            totalExecutions: executions.length,
            avgVisibility: 0, // Will calculate from mentions
            totalCitations: 0,
          })
          
          // Aggregate brand mentions across all executions
          const mentionMap = new Map<string, { count: number, positions: number[], sentiment: string }>()
          executions.forEach((exec: PromptExecution) => {
            exec.brand_mentions?.forEach((mention: BrandMention) => {
              const existing = mentionMap.get(mention.brand_name) || { count: 0, positions: [], sentiment: 'neutral' }
              existing.count += mention.mention_count
              if (mention.avg_position) existing.positions.push(mention.avg_position)
              mentionMap.set(mention.brand_name, existing)
            })
          })
          
          const mentions = Array.from(mentionMap.entries())
            .map(([name, data]) => ({
              brand_name: name,
              mention_count: data.count,
              avg_position: data.positions.length > 0 
                ? data.positions.reduce((a, b) => a + b, 0) / data.positions.length 
                : 0,
              sentiment: data.sentiment
            }))
            .sort((a, b) => b.mention_count - a.mention_count)
            .slice(0, 10)
          
          setBrandMentions(mentions)
          
          // Build visibility chart data (group by date)
          const dateMap = new Map<string, number>()
          executions.forEach((exec: PromptExecution) => {
            const date = new Date(exec.executed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            dateMap.set(date, (dateMap.get(date) || 0) + 1)
          })
          
          const chartData = Array.from(dateMap.entries())
            .map(([date, count]) => ({ date, executions: count }))
            .slice(-7)
          
          setVisibilityData(chartData)
        }

        // Fetch sources data
        const sourcesRes = await fetch('/api/sources?limit=5')
        if (sourcesRes.ok) {
          const sourcesData = await sourcesRes.json()
          setTopSources(sourcesData.sources || [])
        }

        setScanStatus('done')
      } catch (error) {
        console.error('Failed to fetch overview data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [currentDashboard, selectedModel, timeRange])

  // Get source type color
  const getSourceTypeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'corporate': return '#F59E0B'
      case 'editorial': return '#3B82F6'
      case 'ugc': return '#22C55E'
      case 'review': return '#EC4899'
      case 'reference': return '#8B5CF6'
      default: return '#6B7280'
    }
  }

  // Donut chart for source types
  const sourceTypeBreakdown = topSources.reduce((acc, source) => {
    const type = source.type || 'Other'
    acc[type] = (acc[type] || 0) + source.citation_count
    return acc
  }, {} as Record<string, number>)

  const totalCitations = Object.values(sourceTypeBreakdown).reduce((a, b) => a + b, 0)

  if (loading) {
    return (
      <div className="min-h-screen bg-primary" data-page="overview">
        <MobileHeader />
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-16 bg-card rounded-lg w-full"></div>
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 h-80 bg-card rounded-lg"></div>
              <div className="h-80 bg-card rounded-lg"></div>
            </div>
            <div className="h-64 bg-card rounded-lg w-full"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-primary" data-page="overview">
      <MobileHeader />
      
      {/* Header Bar - Peec style with filters */}
      <div className="page-header-bar">
        <div className="flex items-center gap-3">
          {/* Brand badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary rounded-lg border border-border">
            {currentDashboard?.logo_url ? (
              <img 
                src={currentDashboard.logo_url} 
                alt={currentDashboard.brand_name}
                className="w-5 h-5 rounded"
              />
            ) : (
              <div className="w-5 h-5 rounded bg-hover flex items-center justify-center text-xs font-medium text-muted">
                {currentDashboard?.brand_name?.charAt(0) || 'B'}
              </div>
            )}
            <span className="font-medium text-primary text-sm">{currentDashboard?.brand_name || 'Brand'}</span>
          </div>

          {/* Time Range */}
          <div className="pill-group">
            <button className={`pill flex items-center gap-1.5 ${timeRange === '7d' ? 'active' : ''}`} onClick={() => setTimeRange('7d')}>
              <Calendar className="w-3.5 h-3.5" />
              Last 7 days
            </button>
            <button className={`pill ${timeRange === '30d' ? 'active' : ''}`} onClick={() => setTimeRange('30d')}>
              Last 30 days
            </button>
          </div>

          {/* Models Dropdown */}
          <div className="relative" ref={modelDropdownRef}>
            <button 
              className="dropdown-trigger"
              onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
            >
              {selectedModel !== 'all' && MODEL_LOGOS[selectedModel] && (
                <img src={MODEL_LOGOS[selectedModel]} alt="" className="w-4 h-4" />
              )}
              {selectedModel === 'all' && <Globe className="w-4 h-4 text-muted" />}
              <span>{MODEL_NAMES[selectedModel]}</span>
              <ChevronDown className={`w-4 h-4 text-muted transition-transform ${modelDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {modelDropdownOpen && (
              <div className="dropdown-menu">
                {Object.entries(MODEL_NAMES).map(([key, name]) => (
                  <div
                    key={key}
                    className={`dropdown-item ${selectedModel === key ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedModel(key)
                      setModelDropdownOpen(false)
                    }}
                  >
                    {key !== 'all' && MODEL_LOGOS[key] ? (
                      <img src={MODEL_LOGOS[key]} alt="" className="w-5 h-5" />
                    ) : (
                      <Globe className="w-5 h-5 text-muted" />
                    )}
                    <span className="flex-1">{name}</span>
                    {selectedModel === key && <Check className="w-4 h-4 text-info" />}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="btn-secondary flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Status Banner */}
      <div className="status-banner">
        <div className="status-banner-text flex items-center gap-2">
          <Eye className="w-4 h-4" />
          <span className="font-medium text-primary">Overview</span>
          <span className="mx-1">•</span>
          <span>Percentage of chats mentioning each brand</span>
        </div>
        <div className="status-banner-metrics">
          <span>Executions: <strong className="text-primary">{stats.totalExecutions}</strong></span>
          <span>•</span>
          <span>Brands tracked: <strong className="text-primary">{brandMentions.length}</strong></span>
        </div>
      </div>

      {/* Scan Running State */}
      {scanStatus === 'running' && currentScanId && (
        <div className="p-6">
          <ScanProgressInline scanId={currentScanId} />
        </div>
      )}

      {/* Main Content */}
      <div className="p-6 space-y-6">
        {/* Top Row: Visibility Chart + Brands Table */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Visibility Chart */}
          <div className="lg:col-span-2 card p-0 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-muted" />
                <span className="font-medium text-primary">Visibility</span>
                <span className="text-muted text-sm">• Percentage of chats mentioning each brand</span>
              </div>
              <button className="expand-btn">
                <Download className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 h-[300px]">
              {visibilityData.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-muted gap-3">
                  <MessageSquare className="w-8 h-8 opacity-50" />
                  <p>Run prompts to start tracking visibility</p>
                  <Link href="/dashboard/prompts" className="btn-primary text-sm">
                    Go to Prompts
                  </Link>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={visibilityData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                    />
                    <Tooltip 
                      contentStyle={{
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="executions" 
                      name="Executions"
                      stroke="#3B82F6" 
                      strokeWidth={2}
                      dot={{ fill: '#3B82F6', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Brands Table */}
          <div className="card p-0 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-muted" />
                <span className="font-medium text-primary">Brands</span>
                <span className="text-muted text-sm">• Highest visibility</span>
              </div>
              <Link href="/dashboard/brand" className="expand-btn">
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="divide-y divide-border-light max-h-[300px] overflow-y-auto">
              {/* Header */}
              <div className="grid grid-cols-12 gap-2 px-4 py-2 text-xs text-muted uppercase tracking-wide bg-secondary">
                <div className="col-span-1">#</div>
                <div className="col-span-5">Brand</div>
                <div className="col-span-3 text-right">Visibility</div>
                <div className="col-span-3 text-right">Position</div>
              </div>

              {brandMentions.length === 0 ? (
                <div className="p-6 text-center text-muted text-sm">
                  <p>No brand mentions yet</p>
                  <Link href="/dashboard/prompts" className="text-info hover:underline">Run some prompts</Link>
                </div>
              ) : (
                brandMentions.map((brand, idx) => (
                  <div key={brand.brand_name} className="grid grid-cols-12 gap-2 px-4 py-3 hover:bg-hover items-center">
                    <div className="col-span-1 text-muted text-sm">{idx + 1}</div>
                    <div className="col-span-5 flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-secondary flex items-center justify-center text-xs font-medium">
                        {brand.brand_name.charAt(0)}
                      </div>
                      <span className="text-sm font-medium text-primary truncate">{brand.brand_name}</span>
                    </div>
                    <div className="col-span-3 text-right text-sm text-secondary">
                      {brand.mention_count}
                    </div>
                    <div className="col-span-3 text-right text-sm text-muted">
                      {brand.avg_position > 0 ? brand.avg_position.toFixed(1) : '—'}
                    </div>
                  </div>
                ))
              )}

              {/* Add Brands CTA */}
              <div className="p-3 border-t border-border">
                <button className="w-full py-2 text-sm text-muted hover:text-primary border border-dashed border-border rounded-lg hover:border-muted transition-colors">
                  + Add Brands
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Second Row: Top Sources */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Donut Chart */}
          <div className="card p-4">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="w-4 h-4 text-muted" />
              <span className="font-medium text-primary">Domain type</span>
            </div>

            <div className="flex items-center justify-center py-4">
              <div className="relative">
                <svg width="160" height="160" viewBox="0 0 100 100">
                  {(() => {
                    let cumulativePercent = 0
                    const types = Object.entries(sourceTypeBreakdown)
                    
                    return types.map(([type, count], idx) => {
                      const percent = totalCitations > 0 ? (count / totalCitations) * 100 : 0
                      const startAngle = cumulativePercent * 3.6 - 90
                      cumulativePercent += percent
                      const endAngle = cumulativePercent * 3.6 - 90
                      
                      const startRad = (startAngle * Math.PI) / 180
                      const endRad = (endAngle * Math.PI) / 180
                      
                      const x1 = 50 + 40 * Math.cos(startRad)
                      const y1 = 50 + 40 * Math.sin(startRad)
                      const x2 = 50 + 40 * Math.cos(endRad)
                      const y2 = 50 + 40 * Math.sin(endRad)
                      
                      const largeArc = percent > 50 ? 1 : 0
                      
                      return (
                        <path
                          key={type}
                          d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`}
                          fill={getSourceTypeColor(type)}
                          className="transition-opacity hover:opacity-80"
                        />
                      )
                    })
                  })()}
                  <circle cx="50" cy="50" r="28" fill="var(--bg-card)" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-primary">{totalCitations}</span>
                  <span className="text-xs text-muted">Citations</span>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-2">
              {Object.entries(sourceTypeBreakdown).map(([type, count]) => (
                <div key={type} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: getSourceTypeColor(type) }} />
                  <span className="text-xs text-muted">{type}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sources Table */}
          <div className="lg:col-span-2 card p-0 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Link2 className="w-4 h-4 text-muted" />
                <span className="font-medium text-primary">Top Sources</span>
                <span className="text-muted text-sm">• Sources across active models</span>
              </div>
              <Link href="/dashboard/sources" className="text-sm text-info hover:underline flex items-center gap-1">
                Show All <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <table className="data-table">
              <thead>
                <tr>
                  <th className="w-12"></th>
                  <th>Domain</th>
                  <th className="text-right">Used</th>
                  <th className="text-right">Avg. Citations</th>
                  <th>Type</th>
                </tr>
              </thead>
              <tbody>
                {topSources.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-muted">
                      No source data yet. Run prompts to collect citation data.
                    </td>
                  </tr>
                ) : (
                  topSources.map((source, idx) => (
                    <tr key={source.domain}>
                      <td>
                        <img 
                          src={`https://www.google.com/s2/favicons?domain=${source.domain}&sz=32`}
                          alt=""
                          className="w-5 h-5 rounded"
                        />
                      </td>
                      <td className="font-medium text-primary">{source.domain}</td>
                      <td className="text-right">{source.citation_count}%</td>
                      <td className="text-right">{source.avg_citations?.toFixed(1) || '—'}</td>
                      <td>
                        <span 
                          className="badge text-xs"
                          style={{ 
                            backgroundColor: `${getSourceTypeColor(source.type)}20`,
                            color: getSourceTypeColor(source.type)
                          }}
                        >
                          {source.type || 'Other'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Third Row: Suggested Prompts */}
        <div className="card p-0 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-muted" />
              <span className="font-medium text-primary">Suggested Prompts</span>
              <span className="text-muted text-sm">({recentPrompts.length})</span>
            </div>
            <Link href="/dashboard/prompts" className="text-sm text-info hover:underline flex items-center gap-1">
              View All <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-4">
            <p className="text-sm text-muted mb-4">Based on what users are actually asking</p>
            
            {recentPrompts.length === 0 ? (
              <div className="text-center py-8 text-muted">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No prompts executed yet</p>
                <Link href="/dashboard/prompts" className="text-info hover:underline text-sm">Add prompts to track</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentPrompts.map((prompt) => (
                  <Link 
                    key={prompt.id}
                    href={`/dashboard/prompts/${prompt.id}`}
                    className="prompt-card block"
                  >
                    <p className="prompt-text line-clamp-2 mb-3">{prompt.prompt_text}</p>
                    <div className="flex items-center gap-3">
                      <span className="volume-badge volume-high">High Volume</span>
                      <span className="badge badge-purple">{prompt.category}</span>
                      {prompt.model && (
                        <span className="prompt-meta flex items-center gap-1">
                          {MODEL_LOGOS[prompt.model] && (
                            <img src={MODEL_LOGOS[prompt.model]} alt="" className="w-3.5 h-3.5" />
                          )}
                          {MODEL_NAMES[prompt.model] || prompt.model}
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}