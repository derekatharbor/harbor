// app/dashboard/sources/page.tsx
// Sources page - Citation analysis with gap analysis and priority ranking

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Globe,
  TrendingUp,
  TrendingDown,
  Minus,
  Target,
  ChevronRight,
  Search,
  Download,
  Filter,
  Sparkles,
  ArrowUpRight,
  Info,
  Shield,
  AlertCircle
} from 'lucide-react'
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

// Donut chart component
function DonutChart({ 
  data, 
  activeType, 
  onTypeClick 
}: { 
  data: TypeBreakdown[]
  activeType: string | null
  onTypeClick: (type: string | null) => void
}) {
  const colors: Record<string, string> = {
    editorial: '#3B82F6',    // Blue
    corporate: '#F97316',    // Orange
    institutional: '#22C55E', // Green
    ugc: '#A855F7',          // Purple
    review: '#06B6D4',       // Cyan
    reference: '#EC4899',    // Pink
    other: '#6B7280'         // Gray
  }

  const total = data.reduce((sum, d) => sum + d.count, 0)
  let currentAngle = 0

  // Calculate SVG arcs
  const arcs = data.map((item) => {
    const percentage = item.count / total
    const startAngle = currentAngle
    const endAngle = currentAngle + percentage * 360
    currentAngle = endAngle

    const startRad = (startAngle - 90) * (Math.PI / 180)
    const endRad = (endAngle - 90) * (Math.PI / 180)
    
    const x1 = 100 + 80 * Math.cos(startRad)
    const y1 = 100 + 80 * Math.sin(startRad)
    const x2 = 100 + 80 * Math.cos(endRad)
    const y2 = 100 + 80 * Math.sin(endRad)
    
    const largeArc = percentage > 0.5 ? 1 : 0

    return {
      ...item,
      color: colors[item.type] || colors.other,
      path: `M 100 100 L ${x1} ${y1} A 80 80 0 ${largeArc} 1 ${x2} ${y2} Z`,
      percentage: Math.round(percentage * 100)
    }
  })

  const activeData = activeType ? data.find(d => d.type === activeType) : null

  return (
    <div className="relative">
      <svg viewBox="0 0 200 200" className="w-48 h-48">
        {arcs.map((arc, i) => (
          <path
            key={arc.type}
            d={arc.path}
            fill={arc.color}
            className="cursor-pointer transition-opacity"
            opacity={activeType === null || activeType === arc.type ? 1 : 0.3}
            onClick={() => onTypeClick(activeType === arc.type ? null : arc.type)}
          />
        ))}
        {/* Inner circle for donut effect */}
        <circle cx="100" cy="100" r="50" fill="var(--bg-card)" />
      </svg>
      
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {activeData ? (
          <>
            <span className="text-2xl font-bold text-primary">{activeData.percentage}%</span>
            <span className="text-sm text-muted capitalize">{activeData.type}</span>
          </>
        ) : (
          <>
            <span className="text-2xl font-bold text-primary">{total}</span>
            <span className="text-sm text-muted">Citations</span>
          </>
        )}
      </div>
    </div>
  )
}

// Authority badge
function AuthorityBadge({ authority }: { authority: 'high' | 'medium' | 'low' }) {
  const config = {
    high: { color: 'text-chart-2 bg-chart-2/10', label: 'High', icon: Shield },
    medium: { color: 'text-warning bg-warning/10', label: 'Med', icon: Shield },
    low: { color: 'text-muted bg-secondary', label: 'Low', icon: Shield }
  }
  
  const { color, label } = config[authority]
  
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${color}`}>
      {label}
    </span>
  )
}

// Source type badge
function SourceTypeBadge({ type }: { type: string }) {
  const colors: Record<string, string> = {
    editorial: 'bg-blue-100 text-blue-700',
    corporate: 'bg-orange-100 text-orange-700',
    institutional: 'bg-green-100 text-green-700',
    ugc: 'bg-purple-100 text-purple-700',
    review: 'bg-cyan-100 text-cyan-700',
    reference: 'bg-pink-100 text-pink-700',
    other: 'bg-gray-100 text-gray-700'
  }
  
  return (
    <span className={`text-xs px-2 py-1 rounded-md font-medium capitalize ${colors[type] || colors.other}`}>
      {type}
    </span>
  )
}

// Trend indicator
function TrendIndicator({ trend }: { trend: 'up' | 'down' | 'stable' }) {
  if (trend === 'up') return <TrendingUp className="w-4 h-4 text-chart-2" />
  if (trend === 'down') return <TrendingDown className="w-4 h-4 text-red-400" />
  return <Minus className="w-4 h-4 text-muted" />
}

export default function SourcesPage() {
  const router = useRouter()
  const { currentDashboard } = useBrand()
  
  const [sources, setSources] = useState<Source[]>([])
  const [typeBreakdown, setTypeBreakdown] = useState<TypeBreakdown[]>([])
  const [totals, setTotals] = useState({ totalCitations: 0, uniqueDomains: 0, highAuthority: 0 })
  const [loading, setLoading] = useState(true)
  const [gapAnalysis, setGapAnalysis] = useState(false)
  const [activeType, setActiveType] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
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

  const fetchSources = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        limit: '100',
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
    if (activeType && s.sourceType !== activeType) return false
    if (searchQuery && !s.domain.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  // Priority sources (high authority with good citation counts)
  const prioritySources = filteredSources
    .filter(s => s.authority === 'high' || s.totalCitations >= 5)
    .slice(0, 5)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.bg }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.bg }}>
      <MobileHeader />
      
      {/* Header */}
      <div className="px-6 py-6" style={{ borderBottom: `1px solid ${colors.border}` }}>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-3">
            <Globe className="w-6 h-6" style={{ color: colors.muted }} />
            <h1 className="text-2xl font-heading font-bold" style={{ color: colors.text }}>
              Sources
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              className="px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 transition-colors"
              style={{ 
                backgroundColor: colors.hover,
                color: colors.muted,
                border: `1px solid ${colors.border}`
              }}
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
        <p style={{ color: colors.muted }} className="text-sm">
          Discover where AI models find information. Target high-authority sources to boost your visibility.
        </p>
      </div>

      <div className="p-6">
        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Citations', value: totals.totalCitations, icon: Globe },
            { label: 'Unique Sources', value: totals.uniqueDomains, icon: Target },
            { label: 'High Authority', value: totals.highAuthority, icon: Shield },
            { label: 'Gap Opportunities', value: gapAnalysis ? filteredSources.length : '—', icon: Sparkles },
          ].map((stat) => (
            <div 
              key={stat.label}
              className="rounded-xl p-4"
              style={{ backgroundColor: colors.card, border: `1px solid ${colors.border}` }}
            >
              <div className="flex items-center gap-2 mb-2">
                <stat.icon className="w-4 h-4" style={{ color: colors.muted }} />
                <span className="text-xs" style={{ color: colors.muted }}>{stat.label}</span>
              </div>
              <span className="text-2xl font-bold" style={{ color: colors.text }}>{stat.value}</span>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-3 gap-6">
          {/* Left: Donut Chart + Legend */}
          <div 
            className="rounded-xl p-6"
            style={{ backgroundColor: colors.card, border: `1px solid ${colors.border}` }}
          >
            <h2 className="font-semibold mb-4" style={{ color: colors.text }}>Source Types</h2>
            
            <div className="flex flex-col items-center">
              <DonutChart 
                data={typeBreakdown} 
                activeType={activeType}
                onTypeClick={setActiveType}
              />
              
              {/* Legend */}
              <div className="mt-6 w-full space-y-2">
                {typeBreakdown.map((item) => (
                  <button
                    key={item.type}
                    onClick={() => setActiveType(activeType === item.type ? null : item.type)}
                    className="w-full flex items-center justify-between p-2 rounded-lg transition-colors cursor-pointer"
                    style={{ 
                      backgroundColor: activeType === item.type ? colors.hover : 'transparent',
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <SourceTypeBadge type={item.type} />
                      <span className="text-sm" style={{ color: colors.text }}>{item.count}</span>
                    </div>
                    <span className="text-sm" style={{ color: colors.muted }}>{item.percentage}%</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Source List */}
          <div 
            className="col-span-2 rounded-xl"
            style={{ backgroundColor: colors.card, border: `1px solid ${colors.border}` }}
          >
            {/* Toolbar */}
            <div className="p-4 flex items-center justify-between" style={{ borderBottom: `1px solid ${colors.border}` }}>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: colors.muted }} />
                  <input
                    type="text"
                    placeholder="Search sources..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-4 py-1.5 rounded-lg text-sm w-64 outline-none"
                    style={{ 
                      backgroundColor: colors.hover,
                      color: colors.text,
                      border: `1px solid ${colors.border}`
                    }}
                  />
                </div>
                
                {/* Gap Analysis Toggle */}
                <button
                  onClick={() => setGapAnalysis(!gapAnalysis)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                  style={{ 
                    backgroundColor: gapAnalysis ? '#10B981' : colors.hover,
                    color: gapAnalysis ? '#FFFFFF' : colors.text,
                    border: `1px solid ${gapAnalysis ? '#10B981' : colors.border}`
                  }}
                >
                  <Target className="w-4 h-4" />
                  Gap Analysis
                </button>
              </div>

              {activeType && (
                <button
                  onClick={() => setActiveType(null)}
                  className="text-sm px-2 py-1 rounded"
                  style={{ color: colors.muted }}
                >
                  Clear filter
                </button>
              )}
            </div>

            {/* Gap Analysis Explanation */}
            {gapAnalysis && (
              <div 
                className="mx-4 mt-4 p-3 rounded-lg flex items-start gap-2"
                style={{ backgroundColor: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}
              >
                <Info className="w-4 h-4 text-chart-2 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-chart-2">
                  Showing sources where competitors are mentioned but <strong>{currentDashboard?.brand_name || 'your brand'}</strong> is not. 
                  Target these for content opportunities.
                </p>
              </div>
            )}

            {/* Priority Sources Section */}
            {!gapAnalysis && prioritySources.length > 0 && (
              <div className="p-4" style={{ borderBottom: `1px solid ${colors.border}` }}>
                <div className="flex items-center gap-2 mb-3">
                  <Target className="w-4 h-4 text-warning" />
                  <h3 className="text-sm font-semibold" style={{ color: colors.text }}>Priority Targets</h3>
                  <span className="text-xs px-2 py-0.5 rounded bg-warning/10 text-warning">Top opportunities</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {prioritySources.map((source) => (
                    <button
                      key={source.domain}
                      onClick={() => router.push(`/dashboard/sources/${encodeURIComponent(source.domain)}`)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors cursor-pointer"
                      style={{ 
                        backgroundColor: colors.hover,
                        border: `1px solid ${colors.border}`
                      }}
                    >
                      <img src={source.favicon} alt="" className="w-4 h-4 rounded" />
                      <span className="text-sm font-medium" style={{ color: colors.text }}>{source.domain}</span>
                      <AuthorityBadge authority={source.authority} />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Source Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: `1px solid ${colors.border}` }}>
                    <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: colors.muted }}>Source</th>
                    <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: colors.muted }}>Type</th>
                    <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: colors.muted }}>Authority</th>
                    <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: colors.muted }}>Citations</th>
                    <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: colors.muted }}>Top Brands</th>
                    <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: colors.muted }}>Trend</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSources.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center" style={{ color: colors.muted }}>
                        {gapAnalysis 
                          ? "Great job! No gap opportunities found - you're being cited alongside competitors."
                          : "No sources found. Run more prompts to collect citation data."
                        }
                      </td>
                    </tr>
                  ) : (
                    filteredSources.map((source) => (
                      <tr 
                        key={source.domain}
                        className="cursor-pointer transition-colors"
                        style={{ borderBottom: `1px solid ${colors.border}` }}
                        onClick={() => router.push(`/dashboard/sources/${encodeURIComponent(source.domain)}`)}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.hover}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <img src={source.favicon} alt="" className="w-5 h-5 rounded" />
                            <span className="font-medium" style={{ color: colors.text }}>{source.domain}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <SourceTypeBadge type={source.sourceType} />
                        </td>
                        <td className="px-4 py-3">
                          <AuthorityBadge authority={source.authority} />
                        </td>
                        <td className="px-4 py-3" style={{ color: colors.text }}>
                          {source.totalCitations}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            {source.topBrands.slice(0, 3).map((brand, i) => (
                              <span 
                                key={brand.name}
                                className="text-xs px-1.5 py-0.5 rounded"
                                style={{ backgroundColor: colors.hover, color: colors.text }}
                              >
                                {brand.name}
                              </span>
                            ))}
                            {source.topBrands.length > 3 && (
                              <span className="text-xs" style={{ color: colors.muted }}>
                                +{source.topBrands.length - 3}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <TrendIndicator trend={source.trend} />
                        </td>
                        <td className="px-4 py-3">
                          <ChevronRight className="w-4 h-4" style={{ color: colors.muted }} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
