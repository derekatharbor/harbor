// apps/web/app/dashboard/overview/page.tsx
// Peec-style Overview Dashboard with Visibility/Sentiment/Position toggle
// MOCK DATA INCLUDED FOR LINKEDIN MOCKUP - set useMockData = false for production

'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { 
  TrendingUp,
  TrendingDown,
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
  Target
} from 'lucide-react'
import { useBrand } from '@/contexts/BrandContext'
import MobileHeader from '@/components/layout/MobileHeader'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

// ============================================================================
// MOCK DATA FOR LINKEDIN MOCKUP - Set useMockData = false for production
// ============================================================================

const MOCK_BRAND = {
  name: 'HubSpot',
  logo: 'https://cdn.brandfetch.io/hubspot.com/w/400/h/400',
}

const MOCK_COMPETITORS = [
  { name: 'HubSpot', color: '#FF7A59', logo: 'https://cdn.brandfetch.io/hubspot.com/w/400/h/400' },
  { name: 'Salesforce', color: '#00A1E0', logo: 'https://cdn.brandfetch.io/salesforce.com/w/400/h/400' },
  { name: 'Attio', color: '#6366F1', logo: 'https://cdn.brandfetch.io/attio.com/w/400/h/400' },
  { name: 'Pipedrive', color: '#22C55E', logo: 'https://cdn.brandfetch.io/pipedrive.com/w/400/h/400' },
  { name: 'Close', color: '#F59E0B', logo: 'https://cdn.brandfetch.io/close.com/w/400/h/400' },
]

const MOCK_CHART_DATA = [
  { date: 'Jan', HubSpot: 58, Salesforce: 52, Attio: 35, Pipedrive: 28, Close: 22 },
  { date: 'Feb', HubSpot: 62, Salesforce: 55, Attio: 38, Pipedrive: 30, Close: 25 },
  { date: 'Mar', HubSpot: 59, Salesforce: 58, Attio: 42, Pipedrive: 32, Close: 28 },
  { date: 'Apr', HubSpot: 65, Salesforce: 56, Attio: 45, Pipedrive: 35, Close: 30 },
  { date: 'May', HubSpot: 63, Salesforce: 60, Attio: 47, Pipedrive: 38, Close: 32 },
  { date: 'Jun', HubSpot: 68, Salesforce: 62, Attio: 48, Pipedrive: 41, Close: 35 },
]

const MOCK_COMPETITOR_TABLE = [
  { rank: 1, name: 'HubSpot', logo: 'https://cdn.brandfetch.io/hubspot.com/w/400/h/400', visibility: 68, visibilityDelta: null, sentiment: 86, sentimentDelta: null, position: 2.7, positionDelta: null, isUser: true },
  { rank: 2, name: 'Salesforce', logo: 'https://cdn.brandfetch.io/salesforce.com/w/400/h/400', visibility: 62, visibilityDelta: -0.2, sentiment: 62, sentimentDelta: null, position: 2.9, positionDelta: -0.1 },
  { rank: 3, name: 'Attio', logo: 'https://cdn.brandfetch.io/attio.com/w/400/h/400', visibility: 48, visibilityDelta: 0.3, sentiment: 89, sentimentDelta: null, position: 3.6, positionDelta: null },
  { rank: 4, name: 'Pipedrive', logo: 'https://cdn.brandfetch.io/pipedrive.com/w/400/h/400', visibility: 41, visibilityDelta: -0.3, sentiment: 76, sentimentDelta: null, position: 3.9, positionDelta: null },
  { rank: 5, name: 'Close', logo: 'https://cdn.brandfetch.io/close.com/w/400/h/400', visibility: 35, visibilityDelta: 0.4, sentiment: 88, sentimentDelta: null, position: 2.3, positionDelta: -0.2 },
]

const MOCK_SOURCES = [
  { domain: 'reddit.com', logo: 'https://www.google.com/s2/favicons?domain=reddit.com&sz=32', type: 'UGC', used: 32, avgCitations: 41 },
  { domain: 'techradar.com', logo: 'https://www.google.com/s2/favicons?domain=techradar.com&sz=32', type: 'Editorial', used: 43, avgCitations: 46 },
  { domain: 'g2.com', logo: 'https://www.google.com/s2/favicons?domain=g2.com&sz=32', type: 'Review', used: 38, avgCitations: 52 },
  { domain: 'hubspot.com', logo: 'https://www.google.com/s2/favicons?domain=hubspot.com&sz=32', type: 'Corporate', used: 28, avgCitations: 38 },
]

const MOCK_SOURCE_TYPES = { UGC: 32, Editorial: 43, Corporate: 25 }

// ============================================================================

const MODEL_NAMES: Record<string, string> = {
  all: 'All Models',
  chatgpt: 'ChatGPT',
  claude: 'Claude',
  perplexity: 'Perplexity',
}

export default function OverviewPage() {
  const { currentDashboard } = useBrand()
  
  const [loading, setLoading] = useState(true)
  
  // Filters
  const [selectedModel, setSelectedModel] = useState('all')
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false)
  const [tagsDropdownOpen, setTagsDropdownOpen] = useState(false)
  const modelDropdownRef = useRef<HTMLDivElement>(null)
  const tagsDropdownRef = useRef<HTMLDivElement>(null)
  
  // Chart toggle
  const [activeMetric, setActiveMetric] = useState<'visibility' | 'sentiment' | 'position'>('visibility')
  const [chartType, setChartType] = useState<'line' | 'bar'>('line')

  // ============================================================================
  // TOGGLE THIS FOR MOCK DATA vs REAL DATA
  // ============================================================================
  const useMockData = false // Set to true for mockups
  // ============================================================================

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

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 300)
    return () => clearTimeout(timer)
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

  const totalSourceCitations = Object.values(MOCK_SOURCE_TYPES).reduce((a, b) => a + b, 0)

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null
    
    return (
      <div className="bg-card border border-border rounded-lg shadow-lg p-3 min-w-[200px]">
        <div className="font-medium text-primary mb-2">{label} 2025</div>
        <div className="space-y-1.5">
          {payload.map((entry: any, idx: number) => (
            <div key={idx} className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: entry.color }} />
              <img 
                src={MOCK_COMPETITORS.find(c => c.name === entry.name)?.logo || ''}
                alt=""
                className="w-4 h-4 rounded"
                onError={(e) => { e.currentTarget.style.display = 'none' }}
              />
              <span className="text-secondary flex-1 text-sm">{entry.name}</span>
              <span className="font-medium text-primary text-sm">{entry.value}%</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

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

  const brandName = useMockData ? MOCK_BRAND.name : (currentDashboard?.brand_name || 'Brand')
  const brandLogo = useMockData ? MOCK_BRAND.logo : currentDashboard?.logo_url

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
          <span>{brandName}'s Visibility trending up by 5.2% this month</span>
        </div>
        <div className="status-banner-metrics">
          <span>Visibility: <strong className="text-primary">3/14</strong> <TrendingDown className="w-3 h-3 inline ml-0.5 text-negative" /></span>
          <span>•</span>
          <span>Sentiment: <strong className="text-primary">2/14</strong> <TrendingUp className="w-3 h-3 inline ml-0.5 text-positive" /></span>
          <span>•</span>
          <span>Position: <strong className="text-primary">5/14</strong> <TrendingUp className="w-3 h-3 inline ml-0.5 text-positive" /></span>
        </div>
      </div>

      {/* Main Content */}
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
              
              <div className="flex items-center gap-2">
                <button 
                  className={`expand-btn ${chartType === 'line' ? 'bg-hover border-muted' : ''}`}
                  onClick={() => setChartType('line')}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 12l6-6 4 4 8-8" />
                  </svg>
                </button>
                <button 
                  className={`expand-btn ${chartType === 'bar' ? 'bg-hover border-muted' : ''}`}
                  onClick={() => setChartType('bar')}
                >
                  <BarChart3 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-4 h-[360px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={MOCK_CHART_DATA} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
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
                    domain={[0, 100]}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  {MOCK_COMPETITORS.map((comp) => (
                    <Line 
                      key={comp.name}
                      type="monotone" 
                      dataKey={comp.name}
                      name={comp.name}
                      stroke={comp.color}
                      strokeWidth={2.5}
                      dot={false}
                      activeDot={{ r: 5, fill: comp.color }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Competitors Table */}
          <div className="card p-0 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div>
                <h3 className="font-semibold text-primary text-sm">{brandName}'s competitors</h3>
                <p className="text-xs text-muted mt-0.5">Compare {brandName} with its competitors</p>
              </div>
              <Link href="/dashboard/competitors/manage" className="expand-btn">
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-12 gap-1 px-4 py-2 text-xs text-muted border-b border-border bg-secondary">
              <div className="col-span-5 flex items-center gap-1">Visibility <ChevronDown className="w-3 h-3" /></div>
              <div className="col-span-3 text-center">Sentiment</div>
              <div className="col-span-4 text-right">Position</div>
            </div>

            <div className="divide-y divide-border max-h-[320px] overflow-y-auto">
              {MOCK_COMPETITOR_TABLE.map((comp) => (
                <div 
                  key={comp.name}
                  className={`grid grid-cols-12 gap-1 px-4 py-3 items-center hover:bg-hover ${comp.isUser ? 'bg-secondary/50' : ''}`}
                  style={{ borderColor: 'var(--border)' }}
                >
                  <div className="col-span-5 flex items-center gap-2">
                    <span className="text-muted text-sm w-4">{comp.rank}</span>
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: MOCK_COMPETITORS.find(c => c.name === comp.name)?.color }} />
                    <img src={comp.logo} alt="" className="w-5 h-5 rounded" onError={(e) => { e.currentTarget.style.display = 'none' }} />
                    <span className="text-sm font-medium text-primary truncate">{comp.name}</span>
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
                    <span className="text-muted">|</span>
                    <span className="ml-1 text-secondary">{comp.sentiment}</span>
                  </div>
                  
                  <div className="col-span-3 text-sm text-right">
                    <span className="text-muted">±</span>
                    <span className="ml-1 text-secondary">{comp.position}</span>
                    {comp.positionDelta !== null && (
                      <span className={`ml-1 text-xs ${comp.positionDelta < 0 ? 'text-positive' : 'text-negative'}`}>
                        {comp.positionDelta < 0 ? '↓' : '↑'} {Math.abs(comp.positionDelta)}
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
                  <th className="text-right">Used</th>
                  <th className="text-right">Avg. Citations</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_SOURCES.map((source, idx) => (
                  <tr key={source.domain}>
                    <td className="text-muted">{idx + 1}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <img src={source.logo} alt="" className="w-5 h-5 rounded" />
                        <span className="font-medium text-primary">{source.domain}</span>
                      </div>
                    </td>
                    <td>
                      <span 
                        className="badge text-xs"
                        style={{ backgroundColor: `${getSourceTypeColor(source.type)}15`, color: getSourceTypeColor(source.type) }}
                      >
                        {source.type}
                      </span>
                    </td>
                    <td className="text-right">{source.used}%</td>
                    <td className="text-right">{source.avgCitations}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="card p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-primary text-sm">Domains by Type</h3>
                <p className="text-xs text-muted mt-0.5">Most used domains categorized by type</p>
              </div>
              <button className="expand-btn"><ArrowUpRight className="w-4 h-4" /></button>
            </div>

            <div className="flex items-center justify-center py-6">
              <div className="relative">
                <svg width="180" height="180" viewBox="0 0 100 100">
                  {(() => {
                    let cumulativePercent = 0
                    return Object.entries(MOCK_SOURCE_TYPES).map(([type, count]) => {
                      const percent = (count / totalSourceCitations) * 100
                      const startAngle = cumulativePercent * 3.6 - 90
                      cumulativePercent += percent
                      const endAngle = cumulativePercent * 3.6 - 90
                      
                      const startRad = (startAngle * Math.PI) / 180
                      const endRad = (endAngle * Math.PI) / 180
                      
                      const x1 = 50 + 42 * Math.cos(startRad)
                      const y1 = 50 + 42 * Math.sin(startRad)
                      const x2 = 50 + 42 * Math.cos(endRad)
                      const y2 = 50 + 42 * Math.sin(endRad)
                      
                      return (
                        <path
                          key={type}
                          d={`M 50 50 L ${x1} ${y1} A 42 42 0 ${percent > 50 ? 1 : 0} 1 ${x2} ${y2} Z`}
                          fill={getSourceTypeColor(type)}
                          className="hover:opacity-80 transition-opacity"
                        />
                      )
                    })
                  })()}
                  <circle cx="50" cy="50" r="30" fill="var(--bg-card)" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-primary">12%</span>
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-4 mt-2">
              {Object.keys(MOCK_SOURCE_TYPES).map((type) => (
                <div key={type} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: getSourceTypeColor(type) }} />
                  <span className="text-xs text-muted">{type}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}