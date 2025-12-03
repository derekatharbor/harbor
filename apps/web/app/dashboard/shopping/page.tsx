// apps/web/app/dashboard/shopping/page.tsx
// Shopping Visibility - Redesigned with Profound-style tabs

'use client'

import { useEffect, useState } from 'react'
import { 
  ShoppingBag, 
  TrendingUp, 
  TrendingDown,
  ArrowUpRight,
  Info,
  ChevronRight
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
  visibility_score: number
  logo_url: string | null
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

// Favicon component
function Favicon({ domain, size = 20 }: { domain: string; size?: number }) {
  const [error, setError] = useState(false)
  const cleanDomain = domain?.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0] || ''
  
  if (error || !cleanDomain) {
    return (
      <div 
        className="rounded bg-secondary flex items-center justify-center text-muted font-medium"
        style={{ width: size, height: size, fontSize: size * 0.5 }}
      >
        {cleanDomain.charAt(0).toUpperCase() || '?'}
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

export default function ShoppingPage() {
  const { currentDashboard } = useBrand()
  const [activeTab, setActiveTab] = useState<TabId>('journey')
  const [data, setData] = useState<ShoppingData | null>(null)
  const [competitors, setCompetitors] = useState<CompetitorData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!currentDashboard?.id) return

    const fetchData = async () => {
      try {
        // Fetch shopping data
        const shopRes = await fetch(`/api/dashboard/${currentDashboard.id}/shopping`)
        if (shopRes.ok) {
          const shopData = await shopRes.json()
          setData(shopData)
        }

        // Fetch competitors
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

  // Mock trend data - in production this would come from snapshots
  const trendData = [
    { date: 'May', you: 45, comp1: 62, comp2: 38, comp3: 55 },
    { date: 'Jun', you: 52, comp1: 58, comp2: 42, comp3: 48 },
    { date: 'Jul', you: 48, comp1: 65, comp2: 35, comp3: 52 },
    { date: 'Aug', you: 58, comp1: 60, comp2: 48, comp3: 45 },
    { date: 'Sep', you: 62, comp1: 55, comp2: 52, comp3: 58 },
    { date: 'Oct', you: 68, comp1: 58, comp2: 55, comp3: 52 },
    { date: 'Nov', you: data?.visibility_score || 72, comp1: 60, comp2: 58, comp3: 55 },
  ]

  // Category attributes from data
  const attributes = Object.entries(data?.by_category || {}).map(([category, items]) => ({
    name: category,
    items: items.slice(0, 3).map((item: any, idx: number) => ({
      rank: idx + 1,
      name: item.product || item.brand || 'Unknown',
      score: Math.round((item.confidence || 50) + Math.random() * 30),
      delta: Math.round((Math.random() - 0.3) * 20)
    }))
  }))

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
      <div className="page-header-bar border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-5 h-5 text-muted" strokeWidth={1.5} />
            <div>
              <h1 className="text-lg font-semibold text-primary">Shopping</h1>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-6 mt-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
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
          <select className="px-3 py-1.5 text-sm bg-secondary border border-border rounded-lg text-primary">
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last 90 days</option>
          </select>
          <span className="text-muted text-sm">vs.</span>
          <select className="px-3 py-1.5 text-sm bg-secondary border border-border rounded-lg text-primary">
            <option>Previous Period</option>
            <option>Last Year</option>
          </select>
          <select className="px-3 py-1.5 text-sm bg-secondary border border-border rounded-lg text-primary">
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
              {/* Total Visibility */}
              <div className="card p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-muted">Total Visibility</span>
                  <span className="text-xs text-muted px-2 py-0.5 bg-secondary rounded">1st</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-semibold text-primary">
                    {data?.visibility_score || 0}%
                  </span>
                  <span className="text-sm text-chart-2 flex items-center">
                    <TrendingUp className="w-3 h-3 mr-0.5" />
                    +2%
                  </span>
                </div>
              </div>

              {/* Discovery Visibility */}
              <div className="card p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm text-muted">Discovery Visibility</span>
                    <Tooltip content="How often you appear in early-stage shopping queries like 'best products for...'" />
                  </div>
                  <span className="text-xs text-muted px-2 py-0.5 bg-secondary rounded">3rd</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-semibold text-primary">
                    {Math.round((data?.visibility_score || 0) * 0.85)}%
                  </span>
                  <span className="text-sm text-chart-2 flex items-center">
                    <TrendingUp className="w-3 h-3 mr-0.5" />
                    +2.5%
                  </span>
                </div>
              </div>

              {/* Comparison Visibility */}
              <div className="card p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm text-muted">Comparison Visibility</span>
                    <Tooltip content="How often you appear in 'X vs Y' comparison queries" />
                  </div>
                  <span className="text-xs text-muted px-2 py-0.5 bg-secondary rounded">1st</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-semibold text-primary">
                    {Math.round((data?.visibility_score || 0) * 1.1)}%
                  </span>
                  <span className="text-sm text-chart-2 flex items-center">
                    <TrendingUp className="w-3 h-3 mr-0.5" />
                    +16.2%
                  </span>
                </div>
              </div>

              {/* Decision Visibility */}
              <div className="card p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm text-muted">Decision Visibility</span>
                    <Tooltip content="How often you appear in final purchase decision queries" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-semibold text-primary">
                    {Math.round((data?.visibility_score || 0) * 0.95)}%
                  </span>
                  <span className="text-sm text-red-400 flex items-center">
                    <TrendingDown className="w-3 h-3 mr-0.5" />
                    -4.5%
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
                      <RechartsTooltip 
                        contentStyle={{
                          backgroundColor: 'var(--color-card)',
                          border: '1px solid var(--color-border)',
                          borderRadius: '8px',
                          fontSize: '12px'
                        }}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="you" 
                        name={currentDashboard?.brand_name || 'You'}
                        stroke="#10B981" 
                        strokeWidth={2}
                        dot={{ fill: '#10B981', strokeWidth: 0, r: 4 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="comp1" 
                        name={competitors[0]?.brand_name || 'Competitor 1'}
                        stroke="#3B82F6" 
                        strokeWidth={2}
                        dot={{ fill: '#3B82F6', strokeWidth: 0, r: 4 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="comp2" 
                        name={competitors[1]?.brand_name || 'Competitor 2'}
                        stroke="#8B5CF6" 
                        strokeWidth={2}
                        dot={{ fill: '#8B5CF6', strokeWidth: 0, r: 4 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="comp3" 
                        name={competitors[2]?.brand_name || 'Competitor 3'}
                        stroke="#F59E0B" 
                        strokeWidth={2}
                        dot={{ fill: '#F59E0B', strokeWidth: 0, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Leaderboard */}
              <div className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-medium text-primary">Visibility Score Rankings</h3>
                  </div>
                  <button className="p-1.5 hover:bg-secondary rounded-lg transition-colors">
                    <ArrowUpRight className="w-4 h-4 text-muted" />
                  </button>
                </div>
                <div className="space-y-3">
                  {/* Current user */}
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-chart-2/5 border border-chart-2/20">
                    <span className="text-sm text-muted w-6">1</span>
                    <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-xs font-medium text-muted">
                      {currentDashboard?.brand_name?.charAt(0) || 'Y'}
                    </div>
                    <span className="flex-1 text-sm font-medium text-primary">
                      {currentDashboard?.brand_name || 'You'}
                    </span>
                    <span className="text-xs px-1.5 py-0.5 rounded bg-chart-2/10 text-chart-2">You</span>
                    <span className="text-sm font-medium text-primary">{data?.visibility_score || 0}%</span>
                  </div>

                  {/* Competitors */}
                  {competitors.slice(0, 4).map((comp, idx) => (
                    <div key={comp.brand_name} className="flex items-center gap-3 p-2 hover:bg-secondary/50 rounded-lg transition-colors">
                      <span className="text-sm text-muted w-6">{idx + 2}</span>
                      {comp.logo_url ? (
                        <img src={comp.logo_url} alt={comp.brand_name} className="w-8 h-8 rounded-lg object-contain" />
                      ) : (
                        <Favicon domain={comp.brand_name} size={32} />
                      )}
                      <span className="flex-1 text-sm text-secondary truncate">{comp.brand_name}</span>
                      <span className="text-sm text-muted">{comp.visibility_score}%</span>
                    </div>
                  ))}
                </div>
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

            {attributes.length > 0 ? (
              <div className="card overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-4 text-xs text-muted font-medium">Theme</th>
                      <th className="text-left p-4 text-xs text-muted font-medium">#1</th>
                      <th className="text-left p-4 text-xs text-muted font-medium">#2</th>
                      <th className="text-left p-4 text-xs text-muted font-medium">#3</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attributes.map((attr) => (
                      <tr key={attr.name} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <ChevronRight className="w-4 h-4 text-muted" />
                            <div>
                              <span className="text-sm font-medium text-primary">{attr.name}</span>
                              <span className="text-xs text-muted ml-2">{attr.items.length} items</span>
                            </div>
                          </div>
                        </td>
                        {attr.items.map((item, idx) => (
                          <td key={idx} className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                                <Favicon domain={item.name} size={24} />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-primary truncate max-w-[150px]">{item.name}</p>
                                <div className="flex items-center gap-1">
                                  <span className="text-sm text-muted">{item.score}%</span>
                                  <span className={`text-xs ${item.delta >= 0 ? 'text-chart-2' : 'text-red-400'}`}>
                                    {item.delta >= 0 ? '+' : ''}{item.delta}%
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>
                        ))}
                        {/* Fill empty cells */}
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
            ) : (
              <div className="card p-12 text-center">
                <p className="text-muted">No attribute data available. Run a scan to populate this view.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'items' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-primary mb-1">Sentiment & Visibility Matrix</h2>
              <p className="text-sm text-muted">Identify and target items by sentiment and visibility</p>
            </div>

            <div className="card p-6">
              {/* Quadrant Chart - Simplified version */}
              <div className="relative h-96 border border-border rounded-lg overflow-hidden">
                {/* Quadrant backgrounds */}
                <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
                  <div className="bg-amber-500/5"></div>
                  <div className="bg-chart-2/10"></div>
                  <div className="bg-red-500/5"></div>
                  <div className="bg-purple-500/5"></div>
                </div>
                
                {/* Axis labels */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 text-xs text-muted">Positive Sentiment</div>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-muted">Negative Sentiment</div>
                <div className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted rotate-[-90deg]">Low Visibility</div>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted rotate-90">High Visibility</div>

                {/* Center lines */}
                <div className="absolute top-0 bottom-0 left-1/2 w-px bg-border"></div>
                <div className="absolute left-0 right-0 top-1/2 h-px bg-border"></div>

                {/* Placeholder items */}
                <div className="absolute top-[20%] right-[15%] w-12 h-12 rounded-full bg-chart-2/20 flex items-center justify-center border-2 border-chart-2">
                  <span className="text-xs font-medium text-chart-2">45</span>
                </div>
                <div className="absolute top-[35%] right-[25%] w-10 h-10 rounded-full bg-chart-1/20 flex items-center justify-center border-2 border-chart-1">
                  <span className="text-xs font-medium text-chart-1">32</span>
                </div>
                <div className="absolute top-[60%] left-[30%] w-14 h-14 rounded-full bg-amber-500/20 flex items-center justify-center border-2 border-amber-500">
                  <span className="text-xs font-medium text-amber-500">87</span>
                </div>
                <div className="absolute bottom-[25%] right-[35%] w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center border-2 border-purple-500">
                  <span className="text-xs font-medium text-purple-500">19</span>
                </div>

                {/* Info box */}
                <div className="absolute bottom-4 left-4 p-3 bg-primary/90 border border-border rounded-lg text-xs text-muted max-w-xs">
                  <p><strong>Top Right:</strong> High visibility + positive sentiment = your winners</p>
                  <p className="mt-1"><strong>Bottom Left:</strong> Low visibility + negative sentiment = needs attention</p>
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
                    <th className="text-left p-4 text-xs text-muted font-medium">Prompt</th>
                    <th className="text-left p-4 text-xs text-muted font-medium">Your Rank</th>
                    <th className="text-left p-4 text-xs text-muted font-medium">Mentions</th>
                    <th className="text-left p-4 text-xs text-muted font-medium">Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { prompt: `Best ${currentDashboard?.metadata?.category || 'software'} for small business`, rank: 2, mentions: 45, delta: 12 },
                    { prompt: `${currentDashboard?.brand_name || 'Brand'} vs competitors`, rank: 1, mentions: 38, delta: 8 },
                    { prompt: `Top rated ${currentDashboard?.metadata?.category || 'tools'} 2024`, rank: 3, mentions: 32, delta: -3 },
                    { prompt: `Affordable ${currentDashboard?.metadata?.category || 'solutions'}`, rank: 4, mentions: 28, delta: 5 },
                    { prompt: `${currentDashboard?.metadata?.category || 'Software'} with best reviews`, rank: 2, mentions: 24, delta: 15 },
                  ].map((item, idx) => (
                    <tr key={idx} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                      <td className="p-4">
                        <span className="text-sm text-primary">{item.prompt}</span>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${
                          item.rank === 1 ? 'bg-chart-2/10 text-chart-2' : 'bg-secondary text-muted'
                        }`}>
                          {item.rank}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-muted">{item.mentions}</span>
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
          </div>
        )}
      </div>
    </div>
  )
}