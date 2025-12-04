// app/dashboard/sources/page.tsx
// Sources page - Citation analysis with gap analysis

'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import {
  Globe,
  ChevronRight,
  ChevronLeft,
  Search,
  Download,
  HelpCircle,
  Check,
  X,
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import MobileHeader from '@/components/layout/MobileHeader'
import { useBrand } from '@/contexts/BrandContext'

interface Source {
  domain: string
  sourceType: string
  authority: 'high' | 'medium' | 'low'
  totalCitations: number
  uniqueUrls: number
  brandMentions: Record<string, number>
  topBrands: { name: string; count: number }[]
  recentCitations: number
  trend: 'up' | 'down' | 'stable'
  favicon: string
}

interface TypeBreakdown {
  type: string
  count: number
  percentage: number
  topDomains: string[]
}

const TYPE_LABELS: Record<string, string> = {
  editorial: 'Editorial',
  corporate: 'Corporate',
  institutional: 'Institutional',
  ugc: 'UGC',
  review: 'Review',
  reference: 'Reference',
  other: 'Other'
}

const TYPE_COLORS: Record<string, string> = {
  editorial: '#3B82F6',
  corporate: '#F97316',
  institutional: '#22C55E',
  ugc: '#06B6D4',
  review: '#A855F7',
  reference: '#EC4899',
  other: '#6B7280'
}

// Line colors for top domains
const LINE_COLORS = ['#3B82F6', '#F97316', '#06B6D4', '#A855F7', '#EC4899', '#22C55E']

// Donut chart component
function DonutChart({ 
  data, 
  total,
  isDark,
  label
}: { 
  data: TypeBreakdown[]
  total: number
  isDark: boolean
  label: string
}) {
  const [hoveredType, setHoveredType] = useState<string | null>(null)

  let currentAngle = 0
  const arcs = data.map((item) => {
    const percentage = item.count / Math.max(total, 1)
    const startAngle = currentAngle
    const endAngle = currentAngle + percentage * 360
    currentAngle = endAngle

    const startRad = (startAngle - 90) * (Math.PI / 180)
    const endRad = (endAngle - 90) * (Math.PI / 180)
    
    const x1 = 50 + 40 * Math.cos(startRad)
    const y1 = 50 + 40 * Math.sin(startRad)
    const x2 = 50 + 40 * Math.cos(endRad)
    const y2 = 50 + 40 * Math.sin(endRad)
    
    const largeArc = percentage > 0.5 ? 1 : 0

    return {
      ...item,
      color: TYPE_COLORS[item.type] || TYPE_COLORS.other,
      path: `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`,
      percentage: Math.round(percentage * 100)
    }
  })

  const hoveredData = hoveredType ? data.find(d => d.type === hoveredType) : null
  const centerBg = isDark ? '#1A1F26' : '#FFFFFF'
  const textColor = isDark ? '#F9FAFB' : '#111827'
  const mutedColor = isDark ? '#9CA3AF' : '#6B7280'

  return (
    <div className="flex flex-col items-center">
      <div className="relative mb-4">
        <svg viewBox="0 0 100 100" className="w-36 h-36">
          {arcs.map((arc) => (
            <path
              key={arc.type}
              d={arc.path}
              fill={arc.color}
              className="cursor-pointer transition-opacity"
              opacity={hoveredType === null || hoveredType === arc.type ? 1 : 0.3}
              onMouseEnter={() => setHoveredType(arc.type)}
              onMouseLeave={() => setHoveredType(null)}
            />
          ))}
          <circle cx="50" cy="50" r="28" fill={centerBg} />
        </svg>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-bold" style={{ color: textColor }}>
            {hoveredData ? hoveredData.count : total}
          </span>
          <span className="text-xs" style={{ color: mutedColor }}>
            {hoveredData ? TYPE_LABELS[hoveredData.type] : label}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-x-3 gap-y-1">
        {data.filter(d => d.count > 0).map((item) => (
          <div
            key={item.type}
            className="flex items-center gap-1.5 text-xs cursor-pointer"
            style={{ opacity: hoveredType === null || hoveredType === item.type ? 1 : 0.5 }}
            onMouseEnter={() => setHoveredType(item.type)}
            onMouseLeave={() => setHoveredType(null)}
          >
            <div 
              className="w-2 h-2 rounded-sm flex-shrink-0"
              style={{ backgroundColor: TYPE_COLORS[item.type] || TYPE_COLORS.other }}
            />
            <span style={{ color: textColor }}>{TYPE_LABELS[item.type]}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// Source type badge
function SourceTypeBadge({ type }: { type: string }) {
  const colors: Record<string, string> = {
    editorial: 'bg-blue-100 text-blue-700',
    corporate: 'bg-orange-100 text-orange-700',
    institutional: 'bg-green-100 text-green-700',
    ugc: 'bg-cyan-100 text-cyan-700',
    review: 'bg-purple-100 text-purple-700',
    reference: 'bg-pink-100 text-pink-700',
    other: 'bg-gray-100 text-gray-700'
  }
  
  return (
    <span className={`text-xs px-2 py-0.5 rounded font-medium ${colors[type] || colors.other}`}>
      {TYPE_LABELS[type] || 'Other'}
    </span>
  )
}

// URL type badge
function UrlTypeBadge({ type }: { type: string }) {
  const colors: Record<string, string> = {
    listicle: 'bg-cyan-100 text-cyan-700',
    'how-to': 'bg-emerald-100 text-emerald-700',
    article: 'bg-green-100 text-green-700',
    comparison: 'bg-blue-100 text-blue-700',
    product: 'bg-purple-100 text-purple-700',
    profile: 'bg-pink-100 text-pink-700',
    homepage: 'bg-orange-100 text-orange-700',
    other: 'bg-gray-100 text-gray-700'
  }
  
  const labels: Record<string, string> = {
    listicle: 'Listicle',
    'how-to': 'How-To Guide',
    article: 'Article',
    comparison: 'Comparison',
    product: 'Product Page',
    profile: 'Profile',
    homepage: 'Homepage',
    other: 'Other'
  }
  
  return (
    <span className={`text-xs px-2 py-0.5 rounded font-medium ${colors[type] || colors.other}`}>
      {labels[type] || 'Other'}
    </span>
  )
}

function getBrandLogo(domain: string): string {
  const clean = domain.replace('www.', '')
  return `https://cdn.brandfetch.io/${clean}?c=1id1Fyz-h7an5-5KR_y`
}

// Toggle with tooltip - fixed z-index
function GapToggle({ 
  enabled, 
  onChange, 
  isDark
}: { 
  enabled: boolean
  onChange: (v: boolean) => void
  isDark: boolean
}) {
  const [showTooltip, setShowTooltip] = useState(false)
  
  return (
    <div className="flex items-center gap-2 relative">
      <span className="text-sm" style={{ color: isDark ? '#F9FAFB' : '#111827' }}>Gap Analysis</span>
      
      <button
        onClick={() => onChange(!enabled)}
        className="relative w-10 h-5 rounded-full transition-colors cursor-pointer"
        style={{ backgroundColor: enabled ? '#F97316' : (isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB') }}
      >
        <div 
          className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform"
          style={{ transform: enabled ? 'translateX(22px)' : 'translateX(2px)' }}
        />
      </button>
      
      <div 
        className="relative"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <HelpCircle 
          className="w-4 h-4 cursor-help" 
          style={{ color: isDark ? '#6B7280' : '#9CA3AF' }}
        />
        
        {showTooltip && (
          <div 
            className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-3 py-2 rounded-lg text-xs w-64 shadow-xl"
            style={{ 
              backgroundColor: isDark ? '#374151' : '#FFFFFF',
              color: isDark ? '#F9FAFB' : '#111827',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.2)' : '#E5E7EB'}`,
              zIndex: 9999,
            }}
          >
            Shows sources where your competitors are cited but your brand is not. Target these for content opportunities.
            <div 
              className="absolute right-full top-1/2 -translate-y-1/2 w-0 h-0"
              style={{ 
                borderTop: '6px solid transparent',
                borderBottom: '6px solid transparent',
                borderRight: `6px solid ${isDark ? '#374151' : '#FFFFFF'}`,
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}

// Chart view toggle
function ChartViewToggle({
  view,
  onChange,
  isDark
}: {
  view: 'historical' | 'total'
  onChange: (v: 'historical' | 'total') => void
  isDark: boolean
}) {
  return (
    <div 
      className="inline-flex rounded-lg p-0.5"
      style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F3F4F6' }}
    >
      <button
        onClick={() => onChange('historical')}
        className="px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer"
        style={{ 
          backgroundColor: view === 'historical' ? (isDark ? '#374151' : '#FFFFFF') : 'transparent',
          color: view === 'historical' ? (isDark ? '#F9FAFB' : '#111827') : (isDark ? '#9CA3AF' : '#6B7280'),
        }}
      >
        Historical
      </button>
      <button
        onClick={() => onChange('total')}
        className="px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer"
        style={{ 
          backgroundColor: view === 'total' ? (isDark ? '#374151' : '#FFFFFF') : 'transparent',
          color: view === 'total' ? (isDark ? '#F9FAFB' : '#111827') : (isDark ? '#9CA3AF' : '#6B7280'),
        }}
      >
        Total
      </button>
    </div>
  )
}

const ITEMS_PER_PAGE = 20

export default function SourcesPage() {
  const { currentDashboard } = useBrand()
  
  const [sources, setSources] = useState<Source[]>([])
  const [typeBreakdown, setTypeBreakdown] = useState<TypeBreakdown[]>([])
  const [totals, setTotals] = useState({ totalCitations: 0, uniqueDomains: 0, highAuthority: 0 })
  const [loading, setLoading] = useState(true)
  const [gapAnalysis, setGapAnalysis] = useState(false)
  const [activeTab, setActiveTab] = useState<'domains' | 'urls'>('domains')
  const [chartView, setChartView] = useState<'historical' | 'total'>('historical')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')

  useEffect(() => {
    const savedTheme = localStorage.getItem('harbor-theme') as 'light' | 'dark' | null
    setTheme(savedTheme || 'dark')
    
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'data-theme') {
          setTheme(document.documentElement.getAttribute('data-theme') as 'light' | 'dark' || 'dark')
        }
      })
    })
    observer.observe(document.documentElement, { attributes: true })
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    fetchSources()
  }, [gapAnalysis, currentDashboard])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, gapAnalysis, activeTab])

  const fetchSources = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        limit: '500',
        ...(gapAnalysis && currentDashboard?.brand_name && {
          gap: 'true',
          brand: currentDashboard.brand_name
        })
      })
      
      const res = await fetch(`/api/sources?${params}`)
      if (res.ok) {
        const data = await res.json()
        setSources(data.sources || [])
        setTypeBreakdown(data.typeBreakdown || [])
        setTotals(data.totals || {})
      }
    } catch (err) {
      console.error('Failed to fetch sources:', err)
    } finally {
      setLoading(false)
    }
  }

  const isDark = theme === 'dark'
  const colors = {
    bg: isDark ? '#0F1419' : '#FAFBFC',
    card: isDark ? '#1A1F26' : '#FFFFFF',
    text: isDark ? '#F9FAFB' : '#111827',
    muted: isDark ? '#6B7280' : '#9CA3AF',
    border: isDark ? 'rgba(255,255,255,0.08)' : '#E5E7EB',
    hover: isDark ? 'rgba(255,255,255,0.05)' : '#F3F4F6',
  }

  // Filter sources
  const filteredSources = sources.filter(s => {
    if (searchQuery && !s.domain.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  // Pagination
  const totalPages = Math.ceil(filteredSources.length / ITEMS_PER_PAGE)
  const paginatedSources = filteredSources.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  // Top domains for charts
  const topDomains = sources.slice(0, 6)

  // Generate mock historical data for line chart (will be replaced with real API data)
  const historicalData = useMemo(() => {
    const days = ['Nov 28', 'Nov 29', 'Nov 30', 'Dec 1', 'Dec 2', 'Dec 3', 'Dec 4']
    return days.map((day, i) => {
      const dataPoint: Record<string, any> = { date: day }
      topDomains.forEach((source, j) => {
        // Simulate growth over time - last few days have data
        if (i < 4) {
          dataPoint[source.domain] = 0
        } else {
          const baseValue = (source.totalCitations / totals.totalCitations) * 100
          const variance = Math.random() * 10 - 5
          dataPoint[source.domain] = Math.max(0, Math.round(baseValue + variance + (i - 4) * 5))
        }
      })
      return dataPoint
    })
  }, [topDomains, totals.totalCitations])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.bg }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: colors.text }}></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.bg }}>
      <MobileHeader />
      
      {/* Header */}
      <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: `1px solid ${colors.border}` }}>
        <div className="flex items-center gap-3">
          <Globe className="w-5 h-5" style={{ color: colors.muted }} />
          <h1 className="text-xl font-heading font-bold" style={{ color: colors.text }}>Sources</h1>
        </div>
        
        <button 
          className="px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 transition-colors cursor-pointer"
          style={{ backgroundColor: colors.hover, color: colors.muted, border: `1px solid ${colors.border}` }}
        >
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>

      {/* Tabs */}
      <div className="px-6 pt-4 flex items-center gap-1" style={{ borderBottom: `1px solid ${colors.border}` }}>
        <button
          onClick={() => setActiveTab('domains')}
          className="px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors cursor-pointer"
          style={{ 
            color: activeTab === 'domains' ? colors.text : colors.muted,
            borderColor: activeTab === 'domains' ? '#F97316' : 'transparent'
          }}
        >
          Domains
        </button>
        <button
          onClick={() => setActiveTab('urls')}
          className="px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors cursor-pointer"
          style={{ 
            color: activeTab === 'urls' ? colors.text : colors.muted,
            borderColor: activeTab === 'urls' ? '#F97316' : 'transparent'
          }}
        >
          URLs
        </button>
      </div>

      <div className="p-6">
        {/* Charts Row */}
        <div className="grid grid-cols-3 gap-6 mb-6">
          {/* Source Usage Card */}
          <div 
            className="col-span-2 rounded-xl p-6"
            style={{ backgroundColor: colors.card, border: `1px solid ${colors.border}` }}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-medium" style={{ color: colors.text }}>Source Usage by Domain</h3>
                {chartView === 'historical' && (
                  <p className="text-xs mt-0.5" style={{ color: colors.muted }}>Usage % over time</p>
                )}
              </div>
              <ChartViewToggle view={chartView} onChange={setChartView} isDark={isDark} />
            </div>
            
            {/* Legend */}
            <div className="flex items-center gap-4 mb-4 flex-wrap">
              {topDomains.map((s, i) => (
                <div key={s.domain} className="flex items-center gap-1.5">
                  <div 
                    className="w-2 h-2 rounded-sm" 
                    style={{ backgroundColor: LINE_COLORS[i % LINE_COLORS.length] }} 
                  />
                  <img 
                    src={getBrandLogo(s.domain)}
                    alt=""
                    className="w-4 h-4 rounded object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://www.google.com/s2/favicons?domain=${s.domain}&sz=32`
                    }}
                  />
                  <span className="text-xs" style={{ color: colors.muted }}>{s.domain}</span>
                </div>
              ))}
            </div>
            
            {chartView === 'historical' ? (
              /* Line Chart */
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={historicalData}>
                    <XAxis 
                      dataKey="date" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: colors.muted, fontSize: 11 }}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: colors.muted, fontSize: 11 }}
                      tickFormatter={(v) => `${v}%`}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                        border: `1px solid ${colors.border}`,
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                      labelStyle={{ color: colors.text, fontWeight: 600 }}
                      formatter={(value: number, name: string) => [`${value}%`, name]}
                    />
                    {topDomains.map((source, i) => (
                      <Line
                        key={source.domain}
                        type="monotone"
                        dataKey={source.domain}
                        stroke={LINE_COLORS[i % LINE_COLORS.length]}
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4 }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              /* Bar Chart */
              <div className="space-y-3">
                {topDomains.map((s, i) => {
                  const pct = Math.round((s.totalCitations / totals.totalCitations) * 100)
                  return (
                    <div key={s.domain} className="flex items-center gap-3">
                      <div className="flex-1 h-7 rounded-md overflow-hidden" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F3F4F6' }}>
                        <div 
                          className="h-full rounded-md flex items-center px-2 transition-all"
                          style={{ 
                            width: `${Math.max(pct * 1.5, 8)}%`,
                            backgroundColor: LINE_COLORS[i % LINE_COLORS.length],
                          }}
                        >
                          <span className="text-xs text-white font-medium">{pct}%</span>
                        </div>
                      </div>
                      <span className="text-sm w-10 text-right font-medium" style={{ color: colors.text }}>{s.totalCitations}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Domain/URL Type Card */}
          <div 
            className="rounded-xl p-6"
            style={{ backgroundColor: colors.card, border: `1px solid ${colors.border}` }}
          >
            <h3 className="text-sm font-medium mb-4" style={{ color: colors.text }}>
              {activeTab === 'domains' ? 'Domain type' : 'URL type'}
            </h3>
            <DonutChart 
              data={typeBreakdown} 
              total={totals.totalCitations}
              isDark={isDark}
              label="Citations"
            />
          </div>
        </div>

        {/* Table Section */}
        <div 
          className="rounded-xl overflow-hidden"
          style={{ backgroundColor: colors.card, border: `1px solid ${colors.border}` }}
        >
          {/* Toolbar */}
          <div 
            className="px-4 py-3 flex items-center justify-between"
            style={{ borderBottom: `1px solid ${colors.border}` }}
          >
            <div className="flex items-center gap-4">
              <button
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors cursor-pointer"
                style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F3F4F6', color: colors.text, border: `1px solid ${colors.border}` }}
              >
                <Globe className="w-4 h-4" />
                {activeTab === 'domains' ? 'All Domain Types' : 'All URL Types'}
              </button>
              
              <GapToggle enabled={gapAnalysis} onChange={setGapAnalysis} isDark={isDark} />
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: colors.muted }} />
                <input
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-1.5 rounded-lg text-sm w-48 outline-none"
                  style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F3F4F6', color: colors.text, border: `1px solid ${colors.border}` }}
                />
              </div>
              <span className="text-sm" style={{ color: colors.muted }}>{filteredSources.length} sources</span>
            </div>
          </div>

          {/* Domains Table */}
          {activeTab === 'domains' && (
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: `1px solid ${colors.border}` }}>
                  <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider w-12" style={{ color: colors.muted }}>#</th>
                  <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: colors.muted }}>Source</th>
                  <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: colors.muted }}>Domain Type</th>
                  <th className="text-right px-4 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: colors.muted }}>Used</th>
                  <th className="text-right px-4 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: colors.muted }}>Avg. Citations</th>
                </tr>
              </thead>
              <tbody>
                {paginatedSources.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center" style={{ color: colors.muted }}>
                      {gapAnalysis ? "No gap opportunities found." : "No sources found. Run more prompts to collect citation data."}
                    </td>
                  </tr>
                ) : (
                  paginatedSources.map((source, index) => {
                    const globalIndex = (currentPage - 1) * ITEMS_PER_PAGE + index + 1
                    const usedPercentage = totals.totalCitations > 0 ? Math.round((source.totalCitations / totals.totalCitations) * 100) : 0
                    
                    return (
                      <tr key={source.domain} style={{ borderBottom: `1px solid ${colors.border}` }}>
                        <td className="px-4 py-3 text-sm" style={{ color: colors.muted }}>{globalIndex}</td>
                        <td className="px-4 py-3">
                          <Link href={`/dashboard/sources/${encodeURIComponent(source.domain)}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                            <img 
                              src={getBrandLogo(source.domain)} 
                              alt="" 
                              className="w-5 h-5 rounded object-contain"
                              onError={(e) => { (e.target as HTMLImageElement).src = `https://www.google.com/s2/favicons?domain=${source.domain}&sz=32` }}
                            />
                            <span className="font-medium text-sm" style={{ color: colors.text }}>{source.domain}</span>
                          </Link>
                        </td>
                        <td className="px-4 py-3"><SourceTypeBadge type={source.sourceType} /></td>
                        <td className="px-4 py-3 text-right text-sm" style={{ color: colors.text }}>{usedPercentage}%</td>
                        <td className="px-4 py-3 text-right text-sm" style={{ color: colors.text }}>{(source.totalCitations / Math.max(source.uniqueUrls, 1)).toFixed(1)}</td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          )}

          {/* URLs Table */}
          {activeTab === 'urls' && (
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: `1px solid ${colors.border}` }}>
                  <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: colors.muted }}>URL</th>
                  <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: colors.muted }}>URL Type</th>
                  <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: colors.muted }}>
                    <div className="flex items-center gap-1">
                      {currentDashboard?.domain && (
                        <img 
                          src={getBrandLogo(currentDashboard.domain)}
                          alt=""
                          className="w-4 h-4 rounded object-contain"
                        />
                      )}
                      Mentioned
                    </div>
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: colors.muted }}>Mentions</th>
                  <th className="text-right px-4 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: colors.muted }}>Used Total</th>
                  <th className="text-right px-4 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: colors.muted }}>Avg. Citations</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center" style={{ color: colors.muted }}>
                    URL-level data coming soon. Click on a domain above to see its URLs.
                  </td>
                </tr>
              </tbody>
            </table>
          )}

          {/* Pagination */}
          {activeTab === 'domains' && totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3" style={{ borderTop: `1px solid ${colors.border}` }}>
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-3 py-1.5 rounded text-sm disabled:opacity-40 transition-colors cursor-pointer disabled:cursor-not-allowed"
                style={{ color: colors.text }}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNum: number
                  if (totalPages <= 5) pageNum = i + 1
                  else if (currentPage <= 3) pageNum = i + 1
                  else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i
                  else pageNum = currentPage - 2 + i
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className="w-8 h-8 rounded text-sm font-medium transition-colors cursor-pointer"
                      style={{ 
                        backgroundColor: currentPage === pageNum ? (isDark ? '#F9FAFB' : '#111827') : 'transparent',
                        color: currentPage === pageNum ? (isDark ? '#111827' : '#F9FAFB') : colors.text
                      }}
                    >
                      {pageNum}
                    </button>
                  )
                })}
              </div>

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 px-3 py-1.5 rounded text-sm disabled:opacity-40 transition-colors cursor-pointer disabled:cursor-not-allowed"
                style={{ color: colors.text }}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}