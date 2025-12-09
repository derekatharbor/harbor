// app/dashboard/sources/page.tsx
// Sources page - Citation analysis with dashboard-specific data

'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import {
  Globe,
  ChevronRight,
  ChevronLeft,
  Search,
  Download,
  ArrowLeft,
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import MobileHeader from '@/components/layout/MobileHeader'
import { useBrand } from '@/contexts/BrandContext'

// Data structures matching the dashboard sources API
interface DomainSource {
  rank: number
  domain: string
  type: string
  citations: number
  color: string
}

interface UrlSource {
  url: string
  domain: string
  type: string
}

interface DistributionItem {
  type: string
  count: number
  color: string
  percentage: number
}

const TYPE_LABELS: Record<string, string> = {
  'Editorial': 'Editorial',
  'Corporate': 'Corporate',
  'Institutional': 'Institutional',
  'UGC': 'UGC',
  'Review': 'Review',
  'Reference': 'Reference',
  'Other': 'Other'
}

const TYPE_COLORS: Record<string, string> = {
  'Corporate': '#FF8C42',
  'Editorial': '#3B82F6',
  'Other': '#9CA3AF',
  'UGC': '#22D3EE',
  'Institutional': '#4ADE80',
  'Reference': '#A855F7'
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
  data: DistributionItem[]
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
      path: `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`,
      displayPercentage: Math.round(percentage * 100)
    }
  })

  const hoveredData = hoveredType ? data.find(d => d.type === hoveredType) : null
  // Colors per Harbor Design Spec
  const centerBg = isDark ? '#111213' : '#FFFFFF'
  const textColor = isDark ? '#F0F0F0' : '#1C1C1E'
  const mutedColor = isDark ? '#6B7280' : '#6B7280'

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
              style={{ backgroundColor: item.color }}
            />
            <span style={{ color: textColor }}>{TYPE_LABELS[item.type] || item.type}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// Source type badge
function SourceTypeBadge({ type, color }: { type: string; color?: string }) {
  const bgColor = color ? `${color}20` : 'rgba(156,163,175,0.2)'
  const textColor = color || '#9CA3AF'
  
  return (
    <span 
      className="text-xs px-2 py-0.5 rounded font-medium"
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      {TYPE_LABELS[type] || type}
    </span>
  )
}

function getBrandLogo(domain: string): string {
  const clean = domain.replace('www.', '')
  return `https://cdn.brandfetch.io/${clean}?c=1id1Fyz-h7an5-5KR_y`
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
      style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }}
    >
      <button
        onClick={() => onChange('historical')}
        className="px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer"
        style={{ 
          backgroundColor: view === 'historical' ? (isDark ? '#161718' : '#FFFFFF') : 'transparent',
          color: view === 'historical' ? (isDark ? '#F0F0F0' : '#1C1C1E') : '#6B7280',
        }}
      >
        Historical
      </button>
      <button
        onClick={() => onChange('total')}
        className="px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer"
        style={{ 
          backgroundColor: view === 'total' ? (isDark ? '#161718' : '#FFFFFF') : 'transparent',
          color: view === 'total' ? (isDark ? '#F0F0F0' : '#1C1C1E') : '#6B7280',
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
  
  const [domains, setDomains] = useState<DomainSource[]>([])
  const [urls, setUrls] = useState<UrlSource[]>([])
  const [distribution, setDistribution] = useState<DistributionItem[]>([])
  const [totalCitations, setTotalCitations] = useState(0)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'domains' | 'urls'>('domains')
  const [chartView, setChartView] = useState<'historical' | 'total'>('total')
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
    if (currentDashboard?.id) {
      fetchSources()
    }
  }, [currentDashboard?.id])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, activeTab])

  const fetchSources = async () => {
    if (!currentDashboard?.id) return
    
    setLoading(true)
    try {
      const res = await fetch(`/api/dashboard/${currentDashboard.id}/sources`)
      if (res.ok) {
        const data = await res.json()
        setDomains(data.domains || [])
        setUrls(data.urls || [])
        setDistribution(data.distribution || [])
        setTotalCitations(data.total || 0)
      }
    } catch (err) {
      console.error('Failed to fetch sources:', err)
    } finally {
      setLoading(false)
    }
  }

  const isDark = theme === 'dark'
  const colors = {
    // Surface colors per Harbor Design Spec 1.1, light mode matches Overview
    bg: isDark ? '#0B0B0C' : '#FAFBFC',
    card: isDark ? '#111213' : '#FFFFFF',
    // Text colors - dark mode max 94-96% brightness
    text: isDark ? '#F0F0F0' : '#1C1C1E',
    muted: isDark ? '#6B7280' : '#6B7280',
    // Border per spec 1.2: rgba(255,255,255,0.06)
    border: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
    hover: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
  }

  // Filter domains/urls
  const filteredDomains = domains.filter(d => {
    if (searchQuery && !d.domain.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  const filteredUrls = urls.filter(u => {
    if (searchQuery && !u.url.toLowerCase().includes(searchQuery.toLowerCase()) && !u.domain.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  // Pagination
  const totalPages = activeTab === 'domains' 
    ? Math.ceil(filteredDomains.length / ITEMS_PER_PAGE)
    : Math.ceil(filteredUrls.length / ITEMS_PER_PAGE)
  
  const paginatedDomains = filteredDomains.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const paginatedUrls = filteredUrls.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  // Top domains for charts
  const topDomains = domains.slice(0, 6)

  // Generate mock historical data for line chart (will be replaced with real API data)
  const historicalData = useMemo(() => {
    const days = ['Nov 28', 'Nov 29', 'Nov 30', 'Dec 1', 'Dec 2', 'Dec 3', 'Dec 4']
    return days.map((day, i) => {
      const dataPoint: Record<string, any> = { date: day }
      topDomains.forEach((source) => {
        // Simulate growth over time - last few days have data
        if (i < 4) {
          dataPoint[source.domain] = 0
        } else {
          const baseValue = totalCitations > 0 ? (source.citations / totalCitations) * 100 : 0
          const variance = Math.random() * 10 - 5
          dataPoint[source.domain] = Math.max(0, Math.round(baseValue + variance + (i - 4) * 5))
        }
      })
      return dataPoint
    })
  }, [topDomains, totalCitations])

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
      <div className="px-6 py-4" style={{ borderBottom: `1px solid ${colors.border}` }}>
        {/* Back navigation */}
        <Link
          href="/dashboard/overview"
          className="inline-flex items-center gap-2 mb-4 text-sm transition-colors"
          style={{ color: colors.muted }}
          onMouseEnter={(e) => e.currentTarget.style.color = colors.text}
          onMouseLeave={(e) => e.currentTarget.style.color = colors.muted}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Overview
        </Link>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5" style={{ color: colors.muted }} />
            <div>
              <h1 className="text-xl font-heading font-bold" style={{ color: colors.text }}>Sources</h1>
              <p className="text-sm mt-0.5" style={{ color: colors.muted }}>
                {totalCitations} citations from {domains.length} domains
              </p>
            </div>
          </div>
          
          <button 
            className="px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 transition-colors cursor-pointer"
            style={{ backgroundColor: colors.hover, color: colors.muted, border: `1px solid ${colors.border}` }}
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
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
          Domains ({domains.length})
        </button>
        <button
          onClick={() => setActiveTab('urls')}
          className="px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors cursor-pointer"
          style={{ 
            color: activeTab === 'urls' ? colors.text : colors.muted,
            borderColor: activeTab === 'urls' ? '#F97316' : 'transparent'
          }}
        >
          URLs ({urls.length})
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
                        backgroundColor: isDark ? '#161718' : '#FFFFFF',
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
                {topDomains.length === 0 ? (
                  <div className="text-center py-8" style={{ color: colors.muted }}>
                    No source data yet. Run prompts to collect citations.
                  </div>
                ) : (
                  topDomains.map((s, i) => {
                    const pct = totalCitations > 0 ? Math.round((s.citations / totalCitations) * 100) : 0
                    return (
                      <div key={s.domain} className="flex items-center gap-3">
                        <div className="flex-1 h-7 rounded-md overflow-hidden" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }}>
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
                        <span className="text-sm w-10 text-right font-medium" style={{ color: colors.text }}>{s.citations}</span>
                      </div>
                    )
                  })
                )}
              </div>
            )}
          </div>

          {/* Domain Type Card */}
          <div 
            className="rounded-xl p-6"
            style={{ backgroundColor: colors.card, border: `1px solid ${colors.border}` }}
          >
            <h3 className="text-sm font-medium mb-4" style={{ color: colors.text }}>
              Source Type Distribution
            </h3>
            {distribution.length > 0 ? (
              <DonutChart 
                data={distribution} 
                total={totalCitations}
                isDark={isDark}
                label="Citations"
              />
            ) : (
              <div className="flex items-center justify-center h-40" style={{ color: colors.muted }}>
                <p className="text-sm">No data yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Table Section */}
        <div 
          className="rounded-xl overflow-hidden"
          style={{ backgroundColor: colors.card, border: `1px solid ${colors.border}` }}
        >
          {/* Toolbar */}
          <div 
            className="px-4 py-4 flex items-center justify-between"
            style={{ borderBottom: `1px solid ${colors.border}` }}
          >
            <div className="flex items-center gap-4">
              <span className="text-sm" style={{ color: colors.text }}>
                {activeTab === 'domains' ? 'All Domains' : 'All URLs'}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: colors.muted }} />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-1.5 rounded-lg text-sm w-48 outline-none"
                  style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)', color: colors.text, border: `1px solid ${colors.border}` }}
                />
              </div>
              <span className="text-sm" style={{ color: colors.muted }}>
                {activeTab === 'domains' ? filteredDomains.length : filteredUrls.length} results
              </span>
            </div>
          </div>

          {/* Domains Table */}
          {activeTab === 'domains' && (
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: `1px solid ${colors.border}` }}>
                  <th className="text-left px-4 py-4 text-xs font-medium uppercase tracking-wider w-12" style={{ color: colors.muted }}>#</th>
                  <th className="text-left px-4 py-4 text-xs font-medium uppercase tracking-wider" style={{ color: colors.muted }}>Domain</th>
                  <th className="text-left px-4 py-4 text-xs font-medium uppercase tracking-wider" style={{ color: colors.muted }}>Type</th>
                  <th className="text-right px-4 py-4 text-xs font-medium uppercase tracking-wider" style={{ color: colors.muted }}>Citations</th>
                  <th className="text-right px-4 py-4 text-xs font-medium uppercase tracking-wider" style={{ color: colors.muted }}>Share</th>
                </tr>
              </thead>
              <tbody>
                {paginatedDomains.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center" style={{ color: colors.muted }}>
                      {searchQuery ? "No domains match your search." : "No source data yet. Run prompts to collect citations."}
                    </td>
                  </tr>
                ) : (
                  paginatedDomains.map((source, index) => {
                    const globalIndex = (currentPage - 1) * ITEMS_PER_PAGE + index + 1
                    const sharePercent = totalCitations > 0 ? Math.round((source.citations / totalCitations) * 100) : 0
                    
                    return (
                      <tr 
                        key={source.domain} 
                        style={{ borderBottom: `1px solid ${colors.border}` }}
                        className="transition-colors cursor-pointer"
                        onClick={() => window.location.href = `/dashboard/sources/${encodeURIComponent(source.domain)}`}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.hover}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <td className="px-4 py-4 text-sm" style={{ color: colors.muted }}>{globalIndex}</td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <img 
                              src={getBrandLogo(source.domain)} 
                              alt="" 
                              className="w-5 h-5 rounded object-contain"
                              onError={(e) => { (e.target as HTMLImageElement).src = `https://www.google.com/s2/favicons?domain=${source.domain}&sz=32` }}
                            />
                            <span className="font-medium text-sm" style={{ color: colors.text }}>{source.domain}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <SourceTypeBadge type={source.type} color={source.color} />
                        </td>
                        <td className="px-4 py-4 text-right text-sm" style={{ color: colors.text }}>{source.citations}</td>
                        <td className="px-4 py-4 text-right text-sm" style={{ color: colors.text }}>{sharePercent}%</td>
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
                  <th className="text-left px-4 py-4 text-xs font-medium uppercase tracking-wider" style={{ color: colors.muted }}>URL</th>
                  <th className="text-left px-4 py-4 text-xs font-medium uppercase tracking-wider" style={{ color: colors.muted }}>Domain</th>
                  <th className="text-left px-4 py-4 text-xs font-medium uppercase tracking-wider" style={{ color: colors.muted }}>Type</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUrls.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-12 text-center" style={{ color: colors.muted }}>
                      {searchQuery ? "No URLs match your search." : "No URL data yet. Run prompts with Perplexity to collect citations."}
                    </td>
                  </tr>
                ) : (
                  paginatedUrls.map((url, index) => (
                    <tr 
                      key={`${url.url}-${index}`}
                      style={{ borderBottom: `1px solid ${colors.border}` }}
                      className="transition-colors"
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.hover}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <td className="px-4 py-4">
                        <a
                          href={url.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-start gap-2 group"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="min-w-0">
                            <div 
                              className="text-sm truncate max-w-lg group-hover:underline transition-colors" 
                              style={{ color: colors.text }}
                            >
                              {url.url}
                            </div>
                          </div>
                        </a>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <img 
                            src={getBrandLogo(url.domain)} 
                            alt="" 
                            className="w-4 h-4 rounded object-contain"
                            onError={(e) => { (e.target as HTMLImageElement).src = `https://www.google.com/s2/favicons?domain=${url.domain}&sz=32` }}
                          />
                          <span className="text-sm" style={{ color: colors.muted }}>{url.domain}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <SourceTypeBadge type={url.type} color={TYPE_COLORS[url.type]} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-4" style={{ borderTop: `1px solid ${colors.border}` }}>
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
                        backgroundColor: currentPage === pageNum ? (isDark ? '#F0F0F0' : '#1C1C1E') : 'transparent',
                        color: currentPage === pageNum ? (isDark ? '#0B0B0C' : '#F7F7F8') : colors.text
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