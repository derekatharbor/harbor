// apps/web/app/dashboard/shopping/page.tsx
// Shopping Visibility - Full redesign with Profound-style features

'use client'

import { useEffect, useState } from 'react'
import { 
  ShoppingBag, 
  TrendingUp, 
  TrendingDown,
  ArrowUpRight,
  Info,
  ChevronDown,
  ChevronRight,
  X,
  Sparkles
} from 'lucide-react'
import { useBrand } from '@/contexts/BrandContext'
import MobileHeader from '@/components/layout/MobileHeader'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'

interface ShoppingData {
  hasData: boolean
  visibility_score: number
  visibility_delta: string
  total_mentions: number
  top_three_mentions: number
  last_scan: string | null
  by_model: Record<string, any[]>
  by_category: Record<string, any[]>
  raw_results: any[]
}

interface CompetitorData {
  brand_name: string
  domain: string
  visibility_score: number
  logo_url: string | null
}

interface ItemData {
  id: string
  name: string
  brand: string
  logo_url: string | null
  product_image?: string | null
  visibility: number
  sentiment: number
  mentions: number
}

type TabId = 'journey' | 'attributes' | 'items' | 'prompts'

// Tooltip component
function Tooltip({ content }: { content: string }) {
  const [show, setShow] = useState(false)
  
  return (
    <div className="relative inline-flex">
      <div
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        className="cursor-help"
      >
        <Info className="w-3.5 h-3.5 text-muted" />
      </div>
      {show && (
        <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 z-50 w-64 p-3 text-xs text-secondary bg-primary border border-border rounded-lg shadow-xl">
          {content}
        </div>
      )}
    </div>
  )
}

// Brand Logo component - uses Brandfetch URL or falls back to initial
function BrandLogo({ 
  name, 
  logoUrl, 
  productImage,
  size = 40 
}: { 
  name: string
  logoUrl?: string | null
  productImage?: string | null
  size?: number 
}) {
  const [error, setError] = useState(false)
  
  // Priority: productImage > logoUrl > fallback
  const imageUrl = productImage || logoUrl
  
  if (error || !imageUrl) {
    return (
      <div 
        className="rounded-lg bg-secondary flex items-center justify-center text-muted font-semibold"
        style={{ width: size, height: size, fontSize: size * 0.4 }}
      >
        {name?.charAt(0)?.toUpperCase() || '?'}
      </div>
    )
  }
  
  return (
    <div 
      className="rounded-lg bg-secondary flex items-center justify-center overflow-hidden"
      style={{ width: size, height: size }}
    >
      <img
        src={imageUrl}
        alt={name}
        className="w-full h-full object-contain p-1"
        onError={() => setError(true)}
      />
    </div>
  )
}

// Custom Chart Tooltip
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  
  return (
    <div className="bg-primary border border-border rounded-lg shadow-xl p-3 min-w-[150px]">
      <p className="text-xs text-muted mb-2">{label}</p>
      {payload.map((entry: any, idx: number) => (
        <div key={idx} className="flex items-center justify-between gap-4 text-sm">
          <span className="flex items-center gap-2">
            <div 
              className="w-2 h-2 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-secondary">{entry.name}</span>
          </span>
          <span className="font-medium text-primary">{entry.value}%</span>
        </div>
      ))}
    </div>
  )
}

// Item Detail Modal
function ItemDetailModal({ 
  item, 
  onClose,
  competitors 
}: { 
  item: ItemData | null
  onClose: () => void
  competitors: CompetitorData[]
}) {
  if (!item) return null
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-primary border border-border rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-primary border-b border-border p-4 flex items-center justify-between">
          <span className="text-sm text-muted">Item Analysis</span>
          <button onClick={onClose} className="p-1 hover:bg-secondary rounded-lg transition-colors cursor-pointer">
            <X className="w-5 h-5 text-muted" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6">
          {/* Item Header */}
          <div className="flex items-start gap-4 mb-6">
            <BrandLogo 
              name={item.name} 
              logoUrl={item.logo_url}
              productImage={item.product_image}
              size={64} 
            />
            <div>
              <h2 className="text-xl font-semibold text-primary">{item.name}</h2>
              <p className="text-sm text-muted">{item.brand}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs px-2 py-1 rounded-full bg-chart-2/10 text-chart-2">
                  #{Math.ceil(Math.random() * 3)} in Category
                </span>
                <span className="text-xs px-2 py-1 rounded-full bg-chart-1/10 text-chart-1">
                  {item.mentions} mentions
                </span>
              </div>
            </div>
          </div>
          
          {/* Scores */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="card p-4">
              <span className="text-sm text-muted">Visibility Score</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-semibold text-primary">{item.visibility}%</span>
                <span className="text-sm text-chart-2">+5.2%</span>
              </div>
            </div>
            <div className="card p-4">
              <span className="text-sm text-muted">Sentiment Score</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-semibold text-primary">{Math.round(item.sentiment * 100)}%</span>
                <span className="text-sm text-chart-2">+2.1%</span>
              </div>
            </div>
          </div>
          
          {/* Competitor Comparison */}
          <div>
            <h3 className="text-sm font-medium text-primary mb-3">Visibility Ranking</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-2 rounded-lg bg-chart-2/5 border border-chart-2/20">
                <span className="text-sm text-muted w-6">1</span>
                <BrandLogo name={item.name} logoUrl={item.logo_url} size={32} />
                <span className="flex-1 text-sm font-medium text-primary">{item.name}</span>
                <span className="text-xs px-1.5 py-0.5 rounded bg-chart-2/10 text-chart-2">This item</span>
                <span className="text-sm font-medium text-primary">{item.visibility}%</span>
              </div>
              {competitors.slice(0, 3).map((comp, idx) => (
                <div key={comp.brand_name} className="flex items-center gap-3 p-2 hover:bg-secondary/50 rounded-lg transition-colors">
                  <span className="text-sm text-muted w-6">{idx + 2}</span>
                  <BrandLogo name={comp.brand_name} logoUrl={comp.logo_url} size={32} />
                  <span className="flex-1 text-sm text-secondary">{comp.brand_name}</span>
                  <span className="text-sm text-muted">{Math.round(comp.visibility_score * 0.9)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ShoppingPage() {
  const { currentDashboard } = useBrand()
  const [activeTab, setActiveTab] = useState<TabId>('journey')
  const [data, setData] = useState<ShoppingData | null>(null)
  const [competitors, setCompetitors] = useState<CompetitorData[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedAttributes, setExpandedAttributes] = useState<Set<string>>(new Set())
  const [selectedItem, setSelectedItem] = useState<ItemData | null>(null)

  useEffect(() => {
    if (!currentDashboard?.id) return

    const fetchData = async () => {
      try {
        const shopRes = await fetch(`/api/dashboard/${currentDashboard.id}/shopping`)
        if (shopRes.ok) {
          const shopData = await shopRes.json()
          setData(shopData)
        }

        const compRes = await fetch(`/api/competitors?brandId=${currentDashboard.id}`)
        if (compRes.ok) {
          const compData = await compRes.json()
          setCompetitors(compData.competitors || [])
        }
      } catch (err) {
        console.error('Failed to fetch shopping data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [currentDashboard?.id])

  const tabs: { id: TabId; label: string }[] = [
    { id: 'journey', label: 'Shopping Journey' },
    { id: 'attributes', label: 'Attributes' },
    { id: 'items', label: 'Items' },
    { id: 'prompts', label: 'Prompts' },
  ]

  // Trend data - would come from snapshots in production
  const trendData = [
    { date: 'Jun', you: 52, comp1: 58, comp2: 42, comp3: 48 },
    { date: 'Jul', you: 48, comp1: 65, comp2: 35, comp3: 52 },
    { date: 'Aug', you: 58, comp1: 60, comp2: 48, comp3: 45 },
    { date: 'Sep', you: 62, comp1: 55, comp2: 52, comp3: 58 },
    { date: 'Oct', you: 68, comp1: 58, comp2: 55, comp3: 52 },
    { date: 'Nov', you: data?.visibility_score || 72, comp1: 60, comp2: 58, comp3: 55 },
  ]

  // Model breakdown data
  const modelBreakdown = [
    { model: 'ChatGPT', score: 85, delta: 12, color: '#10B981' },
    { model: 'Claude', score: 78, delta: 8, color: '#8B5CF6' },
    { model: 'Gemini', score: 72, delta: -3, color: '#3B82F6' },
    { model: 'Perplexity', score: 68, delta: 5, color: '#F59E0B' },
  ]

  // Attributes with real-ish data
  const attributes = [
    {
      name: currentDashboard?.metadata?.category || 'Technology & SaaS',
      itemCount: 3,
      expanded: expandedAttributes.has('main'),
      items: [
        { rank: 1, name: competitors[0]?.brand_name || 'Competitor 1', logo_url: competitors[0]?.logo_url, score: 101, delta: 13 },
        { rank: 2, name: competitors[1]?.brand_name || 'Competitor 2', logo_url: competitors[1]?.logo_url, score: 96, delta: -5 },
        { rank: 3, name: currentDashboard?.brand_name || 'You', logo_url: null, score: 94, delta: 1, isYou: true },
      ]
    },
    {
      name: 'Enterprise Solutions',
      itemCount: 2,
      expanded: expandedAttributes.has('enterprise'),
      items: [
        { rank: 1, name: currentDashboard?.brand_name || 'You', logo_url: null, score: 88, delta: 8, isYou: true },
        { rank: 2, name: competitors[0]?.brand_name || 'Competitor 1', logo_url: competitors[0]?.logo_url, score: 82, delta: 3 },
      ]
    },
    {
      name: 'Small Business',
      itemCount: 3,
      expanded: expandedAttributes.has('smb'),
      items: [
        { rank: 1, name: competitors[1]?.brand_name || 'Competitor 2', logo_url: competitors[1]?.logo_url, score: 92, delta: 5 },
        { rank: 2, name: competitors[2]?.brand_name || 'Competitor 3', logo_url: competitors[2]?.logo_url, score: 87, delta: -2 },
        { rank: 3, name: currentDashboard?.brand_name || 'You', logo_url: null, score: 79, delta: 11, isYou: true },
      ]
    }
  ]

  // Items for sentiment matrix
  const items: ItemData[] = [
    { id: '1', name: currentDashboard?.brand_name || 'Your Product', brand: currentDashboard?.brand_name || 'You', logo_url: null, visibility: 78, sentiment: 0.85, mentions: 45 },
    { id: '2', name: competitors[0]?.brand_name || 'Competitor 1', brand: competitors[0]?.brand_name || 'Comp', logo_url: competitors[0]?.logo_url, visibility: 65, sentiment: 0.72, mentions: 38 },
    { id: '3', name: competitors[1]?.brand_name || 'Competitor 2', brand: competitors[1]?.brand_name || 'Comp', logo_url: competitors[1]?.logo_url, visibility: 45, sentiment: 0.45, mentions: 22 },
    { id: '4', name: competitors[2]?.brand_name || 'Competitor 3', brand: competitors[2]?.brand_name || 'Comp', logo_url: competitors[2]?.logo_url, visibility: 82, sentiment: 0.35, mentions: 18 },
    { id: '5', name: competitors[3]?.brand_name || 'Competitor 4', brand: competitors[3]?.brand_name || 'Comp', logo_url: competitors[3]?.logo_url, visibility: 35, sentiment: 0.68, mentions: 15 },
  ]

  const toggleAttribute = (key: string) => {
    const newExpanded = new Set(expandedAttributes)
    if (newExpanded.has(key)) {
      newExpanded.delete(key)
    } else {
      newExpanded.add(key)
    }
    setExpandedAttributes(newExpanded)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-chart-1"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-primary" data-page="shopping">
      <MobileHeader />
      
      {/* Header */}
      <div className="page-header-bar">
        <div className="flex items-center gap-3 mb-4">
          <ShoppingBag className="w-5 h-5 text-muted" strokeWidth={1.5} />
          <h1 className="text-xl font-semibold text-primary">Shopping</h1>
        </div>

        {/* Tabs - Left aligned */}
        <div className="flex items-center gap-6 border-b border-border -mx-6 px-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 text-sm font-medium border-b-2 -mb-px transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted hover:text-secondary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {/* Filters Bar */}
        <div className="flex items-center gap-3 mb-6">
          <select className="px-3 py-1.5 text-sm bg-secondary border border-border rounded-lg text-primary cursor-pointer hover:bg-secondary/80 transition-colors appearance-none pr-8 bg-no-repeat bg-[right_8px_center] bg-[length:16px]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")` }}>
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last 90 days</option>
          </select>
          <span className="text-muted text-sm">vs.</span>
          <select className="px-3 py-1.5 text-sm bg-secondary border border-border rounded-lg text-primary cursor-pointer hover:bg-secondary/80 transition-colors appearance-none pr-8 bg-no-repeat bg-[right_8px_center] bg-[length:16px]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")` }}>
            <option>Previous Period</option>
            <option>Last Year</option>
          </select>
          <select className="px-3 py-1.5 text-sm bg-secondary border border-border rounded-lg text-primary cursor-pointer hover:bg-secondary/80 transition-colors appearance-none pr-8 bg-no-repeat bg-[right_8px_center] bg-[length:16px]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")` }}>
            <option>Daily</option>
            <option>Weekly</option>
            <option>Monthly</option>
          </select>
        </div>

        {activeTab === 'journey' && (
          <div className="space-y-6">
            {/* Visibility Score Header */}
            <div>
              <h2 className="text-lg font-semibold text-primary mb-1">Visibility Score</h2>
              <p className="text-sm text-muted">How often your brand and items appear in AI shopping responses</p>
            </div>

            {/* Score Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="card p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-muted">Total Visibility</span>
                  <span className="text-xs text-muted px-2 py-0.5 bg-secondary rounded">1st</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-semibold text-primary">{data?.visibility_score || 0}%</span>
                  <span className="text-sm text-chart-2 flex items-center">
                    <TrendingUp className="w-3 h-3 mr-0.5" />+2%
                  </span>
                </div>
              </div>

              <div className="card p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm text-muted">Discovery</span>
                    <Tooltip content="How often you appear in early-stage shopping queries like 'best products for...'" />
                  </div>
                  <span className="text-xs text-muted px-2 py-0.5 bg-secondary rounded">3rd</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-semibold text-primary">{Math.round((data?.visibility_score || 0) * 0.85)}%</span>
                  <span className="text-sm text-chart-2 flex items-center">
                    <TrendingUp className="w-3 h-3 mr-0.5" />+2.5%
                  </span>
                </div>
              </div>

              <div className="card p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm text-muted">Comparison</span>
                    <Tooltip content="How often you appear in 'X vs Y' comparison queries" />
                  </div>
                  <span className="text-xs text-muted px-2 py-0.5 bg-secondary rounded">1st</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-semibold text-primary">{Math.round((data?.visibility_score || 0) * 1.1)}%</span>
                  <span className="text-sm text-chart-2 flex items-center">
                    <TrendingUp className="w-3 h-3 mr-0.5" />+16.2%
                  </span>
                </div>
              </div>

              <div className="card p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm text-muted">Decision</span>
                    <Tooltip content="How often you appear in final purchase decision queries" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-semibold text-primary">{Math.round((data?.visibility_score || 0) * 0.95)}%</span>
                  <span className="text-sm text-red-400 flex items-center">
                    <TrendingDown className="w-3 h-3 mr-0.5" />-4.5%
                  </span>
                </div>
              </div>
            </div>

            {/* Chart + Leaderboard */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Trend Chart */}
              <div className="lg:col-span-2 card p-6">
                <h3 className="text-sm font-medium text-primary mb-4">Total Visibility</h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData}>
                      <XAxis 
                        dataKey="date" 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: 'var(--color-muted)' }}
                      />
                      <YAxis 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: 'var(--color-muted)' }}
                        domain={[0, 100]}
                        tickFormatter={(v) => `${v}%`}
                      />
                      <RechartsTooltip content={<CustomTooltip />} />
                      <Legend 
                        wrapperStyle={{ paddingTop: '20px' }}
                        formatter={(value) => <span className="text-sm text-secondary">{value}</span>}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="you" 
                        name={currentDashboard?.brand_name || 'You'}
                        stroke="#10B981" 
                        strokeWidth={2}
                        dot={{ fill: '#10B981', strokeWidth: 0, r: 4 }}
                        activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="comp1" 
                        name={competitors[0]?.brand_name || 'Competitor 1'}
                        stroke="#3B82F6" 
                        strokeWidth={2}
                        dot={{ fill: '#3B82F6', strokeWidth: 0, r: 4 }}
                        activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="comp2" 
                        name={competitors[1]?.brand_name || 'Competitor 2'}
                        stroke="#8B5CF6" 
                        strokeWidth={2}
                        dot={{ fill: '#8B5CF6', strokeWidth: 0, r: 4 }}
                        activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="comp3" 
                        name={competitors[2]?.brand_name || 'Competitor 3'}
                        stroke="#F59E0B" 
                        strokeWidth={2}
                        dot={{ fill: '#F59E0B', strokeWidth: 0, r: 4 }}
                        activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Leaderboard */}
              <div className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-primary">Visibility Rankings</h3>
                  <button className="p-1.5 hover:bg-secondary rounded-lg transition-colors cursor-pointer">
                    <ArrowUpRight className="w-4 h-4 text-muted" />
                  </button>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-chart-2/5 border border-chart-2/20">
                    <span className="text-sm text-muted w-6">1</span>
                    <BrandLogo name={currentDashboard?.brand_name || 'You'} logoUrl={null} size={32} />
                    <span className="flex-1 text-sm font-medium text-primary truncate">
                      {currentDashboard?.brand_name || 'You'}
                    </span>
                    <span className="text-xs px-1.5 py-0.5 rounded bg-chart-2/10 text-chart-2">You</span>
                    <span className="text-sm font-medium text-primary">{data?.visibility_score || 0}%</span>
                  </div>

                  {competitors.slice(0, 4).map((comp, idx) => (
                    <div key={comp.brand_name} className="flex items-center gap-3 p-2 hover:bg-secondary/50 rounded-lg transition-colors cursor-pointer">
                      <span className="text-sm text-muted w-6">{idx + 2}</span>
                      <BrandLogo name={comp.brand_name} logoUrl={comp.logo_url} size={32} />
                      <span className="flex-1 text-sm text-secondary truncate">{comp.brand_name}</span>
                      <span className="text-sm text-muted">{comp.visibility_score}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Model Breakdown */}
            <div className="card p-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-muted" />
                <h3 className="text-sm font-medium text-primary">Performance by AI Model</h3>
                <Tooltip content="How your visibility varies across different AI models" />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {modelBreakdown.map((model) => (
                  <div key={model.model} className="p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: model.color }} />
                      <span className="text-sm text-secondary">{model.model}</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-semibold text-primary">{model.score}%</span>
                      <span className={`text-xs flex items-center ${model.delta >= 0 ? 'text-chart-2' : 'text-red-400'}`}>
                        {model.delta >= 0 ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
                        {model.delta >= 0 ? '+' : ''}{model.delta}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'attributes' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-primary mb-1">Items by Attribute Share</h2>
              <p className="text-sm text-muted">See what items are showing up for by topic</p>
            </div>

            <div className="card overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 text-xs text-muted font-medium uppercase tracking-wide">Theme</th>
                    <th className="text-left p-4 text-xs text-muted font-medium uppercase tracking-wide">#1</th>
                    <th className="text-left p-4 text-xs text-muted font-medium uppercase tracking-wide">#2</th>
                    <th className="text-left p-4 text-xs text-muted font-medium uppercase tracking-wide">#3</th>
                  </tr>
                </thead>
                <tbody>
                  {attributes.map((attr, attrIdx) => (
                    <tr 
                      key={attr.name} 
                      className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors cursor-pointer"
                      onClick={() => toggleAttribute(attrIdx === 0 ? 'main' : attrIdx === 1 ? 'enterprise' : 'smb')}
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <ChevronRight className={`w-4 h-4 text-muted transition-transform ${attr.expanded ? 'rotate-90' : ''}`} />
                          <div>
                            <span className="text-sm font-medium text-primary">{attr.name}</span>
                            <span className="text-xs text-muted ml-2">{attr.itemCount} items</span>
                          </div>
                        </div>
                      </td>
                      {attr.items.slice(0, 3).map((item, idx) => (
                        <td key={idx} className="p-4">
                          <div className="flex items-center gap-3">
                            <BrandLogo name={item.name} logoUrl={item.logo_url} size={40} />
                            <div>
                              <p className="text-sm font-medium text-primary truncate max-w-[140px] flex items-center gap-1.5">
                                {item.name}
                                {item.isYou && (
                                  <span className="text-xs px-1 py-0.5 rounded bg-chart-2/10 text-chart-2">You</span>
                                )}
                              </p>
                              <div className="flex items-center gap-1.5">
                                <span className="text-sm text-muted">{item.score}%</span>
                                <span className={`text-xs ${item.delta >= 0 ? 'text-chart-2' : 'text-red-400'}`}>
                                  {item.delta >= 0 ? '+' : ''}{item.delta}%
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                      ))}
                      {Array(3 - attr.items.length).fill(null).map((_, idx) => (
                        <td key={`empty-${idx}`} className="p-4">
                          <span className="text-sm text-muted">—</span>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Missing Attributes Alert */}
            <div className="card p-4 border-l-4 border-amber-500 bg-amber-500/5">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-primary">You're not ranking for 2 key attributes</p>
                  <p className="text-sm text-muted mt-1">
                    Consider creating content targeting "Best Value" and "Easiest to Use" to expand your visibility.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'items' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-primary mb-1">Sentiment & Visibility Matrix</h2>
              <p className="text-sm text-muted">Identify and target items by sentiment and visibility</p>
            </div>

            <div className="card p-6">
              {/* Dotted Grid Chart */}
              <div className="relative h-[500px] rounded-lg overflow-hidden">
                {/* Dotted grid background */}
                <div 
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `radial-gradient(circle, var(--color-border) 1px, transparent 1px)`,
                    backgroundSize: '24px 24px'
                  }}
                />
                
                {/* Quadrant overlays */}
                <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
                  <div className="bg-amber-500/5" />
                  <div className="bg-chart-2/10" />
                  <div className="bg-red-500/5" />
                  <div className="bg-purple-500/5" />
                </div>
                
                {/* Axis labels */}
                <div className="absolute top-3 right-3 text-xs text-muted font-medium">Positive Sentiment</div>
                <div className="absolute bottom-3 left-3 text-xs text-muted font-medium">Low Visibility</div>
                
                {/* Y-axis scale */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col gap-8 text-xs text-muted">
                  <span>1</span>
                  <span>0.8</span>
                  <span>0.6</span>
                  <span>0.4</span>
                  <span>0.2</span>
                </div>

                {/* Center lines */}
                <div className="absolute top-0 bottom-0 left-1/2 w-px bg-border" />
                <div className="absolute left-0 right-0 top-1/2 h-px bg-border" />

                {/* Item bubbles */}
                {items.map((item) => {
                  const x = (item.visibility / 100) * 90 + 5
                  const y = (1 - item.sentiment) * 90 + 5
                  const size = Math.max(50, Math.min(80, item.mentions * 1.5))
                  
                  const isHighVis = item.visibility > 50
                  const isPosSent = item.sentiment > 0.5
                  let glowColor = 'rgba(239, 68, 68, 0.3)'
                  if (isHighVis && isPosSent) glowColor = 'rgba(16, 185, 129, 0.4)'
                  else if (!isHighVis && isPosSent) glowColor = 'rgba(139, 92, 246, 0.3)'
                  else if (isHighVis && !isPosSent) glowColor = 'rgba(245, 158, 11, 0.3)'
                  
                  return (
                    <div
                      key={item.id}
                      className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform hover:scale-110 group"
                      style={{ left: `${x}%`, top: `${y}%` }}
                      onClick={() => setSelectedItem(item)}
                    >
                      <div 
                        className="absolute inset-0 rounded-full blur-xl opacity-60"
                        style={{ 
                          width: size * 1.5, 
                          height: size * 1.5,
                          marginLeft: -size * 0.25,
                          marginTop: -size * 0.25,
                          backgroundColor: glowColor 
                        }}
                      />
                      <div 
                        className="relative rounded-xl bg-primary border-2 border-border flex items-center justify-center overflow-hidden shadow-lg group-hover:border-chart-1 transition-colors"
                        style={{ width: size, height: size }}
                      >
                        <BrandLogo 
                          name={item.name} 
                          logoUrl={item.logo_url}
                          productImage={item.product_image}
                          size={size - 16} 
                        />
                      </div>
                      <div 
                        className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-sm font-medium"
                        style={{ color: glowColor.replace('0.3', '1').replace('0.4', '1') }}
                      >
                        {item.mentions}
                      </div>
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-primary border border-border rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-10">
                        <p className="text-sm font-medium text-primary">{item.name}</p>
                        <p className="text-xs text-muted">Visibility: {item.visibility}% • Sentiment: {Math.round(item.sentiment * 100)}%</p>
                      </div>
                    </div>
                  )
                })}

                {/* Legend */}
                <div className="absolute bottom-4 left-4 p-3 bg-primary/95 border border-border rounded-lg text-xs space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-chart-2" />
                    <span className="text-secondary">High visibility + Positive sentiment</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <span className="text-secondary">High visibility + Negative sentiment</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-purple-500" />
                    <span className="text-secondary">Low visibility + Positive sentiment</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span className="text-secondary">Low visibility + Negative sentiment</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'prompts' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-primary mb-1">Shopping Prompts</h2>
              <p className="text-sm text-muted">The actual queries driving your shopping visibility</p>
            </div>

            <div className="card overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 text-xs text-muted font-medium uppercase tracking-wide">Prompt</th>
                    <th className="text-left p-4 text-xs text-muted font-medium uppercase tracking-wide">Your Rank</th>
                    <th className="text-left p-4 text-xs text-muted font-medium uppercase tracking-wide">Model</th>
                    <th className="text-left p-4 text-xs text-muted font-medium uppercase tracking-wide">Mentions</th>
                    <th className="text-left p-4 text-xs text-muted font-medium uppercase tracking-wide">Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { prompt: `Best ${currentDashboard?.metadata?.category || 'software'} for small business`, rank: 2, model: 'ChatGPT', mentions: 45, delta: 12 },
                    { prompt: `${currentDashboard?.brand_name || 'Brand'} vs ${competitors[0]?.brand_name || 'competitor'}`, rank: 1, model: 'Claude', mentions: 38, delta: 8 },
                    { prompt: `Top rated ${currentDashboard?.metadata?.category || 'tools'} 2024`, rank: 3, model: 'Gemini', mentions: 32, delta: -3 },
                    { prompt: `Affordable ${currentDashboard?.metadata?.category || 'solutions'}`, rank: 4, model: 'Perplexity', mentions: 28, delta: 5 },
                    { prompt: `${currentDashboard?.metadata?.category || 'Software'} with best reviews`, rank: 2, model: 'ChatGPT', mentions: 24, delta: 15 },
                    { prompt: `Enterprise ${currentDashboard?.metadata?.category || 'platform'} comparison`, rank: 1, model: 'Claude', mentions: 21, delta: 3 },
                    { prompt: `${currentDashboard?.brand_name || 'Brand'} pricing and features`, rank: 1, model: 'All', mentions: 18, delta: 22 },
                  ].map((item, idx) => (
                    <tr key={idx} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors cursor-pointer">
                      <td className="p-4">
                        <span className="text-sm text-primary">{item.prompt}</span>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-medium ${
                          item.rank === 1 ? 'bg-chart-2/10 text-chart-2' : 'bg-secondary text-muted'
                        }`}>
                          #{item.rank}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-muted">{item.model}</span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-secondary font-medium">{item.mentions}</span>
                      </td>
                      <td className="p-4">
                        <span className={`text-sm flex items-center gap-1 ${item.delta >= 0 ? 'text-chart-2' : 'text-red-400'}`}>
                          {item.delta >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {item.delta >= 0 ? '+' : ''}{item.delta}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Top Converting Prompts */}
            <div className="card p-6">
              <h3 className="text-sm font-medium text-primary mb-4">🔥 Top Converting Prompts</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { prompt: `Best ${currentDashboard?.metadata?.category || 'tool'} for startups`, rank: 1, growth: '+45%' },
                  { prompt: `${currentDashboard?.brand_name} review`, rank: 1, growth: '+32%' },
                  { prompt: 'Easy to use CRM', rank: 2, growth: '+28%' },
                ].map((item, idx) => (
                  <div key={idx} className="p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer">
                    <p className="text-sm text-primary font-medium mb-2 line-clamp-2">{item.prompt}</p>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        item.rank === 1 ? 'bg-chart-2/10 text-chart-2' : 'bg-secondary text-muted'
                      }`}>
                        Rank #{item.rank}
                      </span>
                      <span className="text-xs text-chart-2 font-medium">{item.growth}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Item Detail Modal */}
      {selectedItem && (
        <ItemDetailModal 
          item={selectedItem} 
          onClose={() => setSelectedItem(null)}
          competitors={competitors}
        />
      )}
    </div>
  )
}