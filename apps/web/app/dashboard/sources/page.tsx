// app/dashboard/sources/page.tsx
// Sources page - Citation analysis with gap analysis

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Globe,
  ChevronRight,
  ChevronLeft,
  Search,
  Download,
  HelpCircle,
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

// Type label formatting
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

// Donut chart component
function DonutChart({ 
  data, 
  activeType, 
  onTypeClick,
  total,
  isDark
}: { 
  data: TypeBreakdown[]
  activeType: string | null
  onTypeClick: (type: string | null) => void
  total: number
  isDark: boolean
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

  const activeData = hoveredType ? data.find(d => d.type === hoveredType) : 
                     activeType ? data.find(d => d.type === activeType) : null

  const centerBg = isDark ? '#1A1F26' : '#FFFFFF'
  const textColor = isDark ? '#F9FAFB' : '#111827'
  const mutedColor = isDark ? '#6B7280' : '#9CA3AF'

  return (
    <div className="flex items-center gap-6">
      {/* Donut */}
      <div className="relative">
        <svg viewBox="0 0 100 100" className="w-36 h-36">
          {arcs.map((arc) => (
            <path
              key={arc.type}
              d={arc.path}
              fill={arc.color}
              className="cursor-pointer transition-opacity"
              opacity={activeType === null || activeType === arc.type || hoveredType === arc.type ? 1 : 0.3}
              onClick={() => onTypeClick(activeType === arc.type ? null : arc.type)}
              onMouseEnter={() => setHoveredType(arc.type)}
              onMouseLeave={() => setHoveredType(null)}
            />
          ))}
          <circle cx="50" cy="50" r="28" fill={centerBg} />
        </svg>
        
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-bold" style={{ color: textColor }}>
            {activeData ? `${activeData.percentage}%` : total}
          </span>
          <span className="text-xs" style={{ color: mutedColor }}>
            {activeData ? TYPE_LABELS[activeData.type] : 'Citations'}
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        {data.map((item) => (
          <button
            key={item.type}
            onClick={() => onTypeClick(activeType === item.type ? null : item.type)}
            className="flex items-center gap-2 text-sm py-1 cursor-pointer hover:opacity-80 transition-opacity"
            style={{ opacity: activeType === null || activeType === item.type ? 1 : 0.5 }}
          >
            <div 
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: TYPE_COLORS[item.type] || TYPE_COLORS.other }}
            />
            <span style={{ color: textColor }}>{TYPE_LABELS[item.type]}</span>
          </button>
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

// Get logo URL with fallback
function getBrandLogo(domain: string): string {
  const clean = domain.replace('www.', '')
  return `https://cdn.brandfetch.io/${clean}?c=1id1Fyz-h7an5-5KR_y`
}

// Toggle component with tooltip
function Toggle({ 
  enabled, 
  onChange, 
  label,
  tooltip,
  isDark
}: { 
  enabled: boolean
  onChange: (v: boolean) => void
  label: string
  tooltip: string
  isDark: boolean
}) {
  const [showTooltip, setShowTooltip] = useState(false)
  
  return (
    <div className="flex items-center gap-2 relative">
      <span className="text-sm" style={{ color: isDark ? '#F9FAFB' : '#111827' }}>{label}</span>
      
      {/* Toggle switch */}
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
      
      {/* Help icon with tooltip */}
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
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 rounded-lg text-xs w-64 z-50 shadow-lg"
            style={{ 
              backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
              color: isDark ? '#F9FAFB' : '#111827',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB'}`
            }}
          >
            {tooltip}
            <div 
              className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 -mt-1"
              style={{ backgroundColor: isDark ? '#1F2937' : '#FFFFFF', borderRight: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB'}`, borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB'}` }}
            />
          </div>
        )}
      </div>
    </div>
  )
}

const ITEMS_PER_PAGE = 25

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
  }, [activeType, searchQuery, gapAnalysis])

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
    if (activeType && s.sourceType !== activeType) return false
    if (searchQuery && !s.domain.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  // Pagination
  const totalPages = Math.ceil(filteredSources.length / ITEMS_PER_PAGE)
  const paginatedSources = filteredSources.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  // Get top domains for the bar chart
  const topDomains = sources.slice(0, 6)

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
          <h1 className="text-xl font-heading font-bold" style={{ color: colors.text }}>
            Sources
          </h1>
        </div>
        
        <button 
          className="px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 transition-colors cursor-pointer"
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

      {/* Stats Row */}
      <div className="px-6 py-4 flex items-center gap-8" style={{ borderBottom: `1px solid ${colors.border}` }}>
        <div>
          <span className="text-2xl font-bold" style={{ color: colors.text }}>{totals.totalCitations}</span>
          <span className="text-sm ml-2" style={{ color: colors.muted }}>Total citations</span>
        </div>
        <div>
          <span className="text-2xl font-bold" style={{ color: colors.text }}>{totals.uniqueDomains}</span>
          <span className="text-sm ml-2" style={{ color: colors.muted }}>Unique sources</span>
        </div>
        <div>
          <span className="text-2xl font-bold" style={{ color: colors.text }}>{totals.highAuthority}</span>
          <span className="text-sm ml-2" style={{ color: colors.muted }}>High authority</span>
        </div>
      </div>

      {/* Charts Section - Source Usage + Donut */}
      <div className="p-6">
        <div 
          className="rounded-xl p-6 mb-6"
          style={{ backgroundColor: colors.card, border: `1px solid ${colors.border}` }}
        >
          <div className="flex items-start justify-between">
            {/* Source Usage by Domain - Bar Chart */}
            <div className="flex-1 mr-8">
              <h3 className="text-sm font-medium mb-4" style={{ color: colors.text }}>Source Usage by Domain</h3>
              
              {/* Legend */}
              <div className="flex items-center gap-4 mb-4 flex-wrap">
                {topDomains.map((s) => (
                  <div key={s.domain} className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: TYPE_COLORS[s.sourceType] || TYPE_COLORS.other }} />
                    <span className="text-xs" style={{ color: colors.muted }}>{s.domain}</span>
                  </div>
                ))}
              </div>
              
              {/* Simple horizontal bar representation */}
              <div className="space-y-3">
                {topDomains.map((s) => {
                  const pct = Math.round((s.totalCitations / totals.totalCitations) * 100)
                  return (
                    <div key={s.domain} className="flex items-center gap-3">
                      <img 
                        src={getBrandLogo(s.domain)}
                        alt=""
                        className="w-5 h-5 rounded object-contain flex-shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://www.google.com/s2/favicons?domain=${s.domain}&sz=32`
                        }}
                      />
                      <div className="flex-1">
                        <div 
                          className="h-6 rounded-md flex items-center px-2"
                          style={{ 
                            width: `${Math.max(pct * 2, 10)}%`,
                            backgroundColor: TYPE_COLORS[s.sourceType] || TYPE_COLORS.other,
                            opacity: 0.8
                          }}
                        >
                          <span className="text-xs text-white font-medium">{pct}%</span>
                        </div>
                      </div>
                      <span className="text-xs w-16 text-right" style={{ color: colors.muted }}>{s.totalCitations}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Domain Type Donut */}
            <div className="flex-shrink-0">
              <h3 className="text-sm font-medium mb-4" style={{ color: colors.text }}>Domain type</h3>
              <DonutChart 
                data={typeBreakdown} 
                activeType={activeType}
                onTypeClick={setActiveType}
                total={totals.totalCitations}
                isDark={isDark}
              />
            </div>
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
              {/* All Domain Types button */}
              <button
                onClick={() => setActiveType(null)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors cursor-pointer"
                style={{ 
                  backgroundColor: activeType === null ? (isDark ? '#374151' : '#E5E7EB') : 'transparent',
                  color: colors.text,
                  border: `1px solid ${colors.border}`
                }}
              >
                <Globe className="w-4 h-4" />
                All Domain Types
              </button>
              
              {/* Gap Analysis Toggle */}
              <Toggle
                enabled={gapAnalysis}
                onChange={setGapAnalysis}
                label="Gap Analysis"
                tooltip="Shows sources where your competitors are cited but your brand is not. These are opportunities to get your brand mentioned by creating content or reaching out to these sources."
                isDark={isDark}
              />
            </div>

            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: colors.muted }} />
                <input
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-1.5 rounded-lg text-sm w-48 outline-none"
                  style={{ 
                    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F3F4F6',
                    color: colors.text,
                    border: `1px solid ${colors.border}`
                  }}
                />
              </div>

              {/* Count */}
              <span className="text-sm" style={{ color: colors.muted }}>
                {filteredSources.length} sources
              </span>
            </div>
          </div>

          {/* Table */}
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
                    {gapAnalysis 
                      ? "No gap opportunities found."
                      : "No sources found. Run more prompts to collect citation data."
                    }
                  </td>
                </tr>
              ) : (
                paginatedSources.map((source, index) => {
                  const globalIndex = (currentPage - 1) * ITEMS_PER_PAGE + index + 1
                  const usedPercentage = totals.totalCitations > 0 
                    ? Math.round((source.totalCitations / totals.totalCitations) * 100)
                    : 0
                  
                  return (
                    <tr 
                      key={source.domain}
                      style={{ borderBottom: `1px solid ${colors.border}` }}
                    >
                      <td className="px-4 py-3 text-sm" style={{ color: colors.muted }}>
                        {globalIndex}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/dashboard/sources/${encodeURIComponent(source.domain)}`}
                          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                        >
                          <img 
                            src={getBrandLogo(source.domain)} 
                            alt="" 
                            className="w-5 h-5 rounded object-contain"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = `https://www.google.com/s2/favicons?domain=${source.domain}&sz=32`
                            }}
                          />
                          <span className="font-medium text-sm" style={{ color: colors.text }}>{source.domain}</span>
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <SourceTypeBadge type={source.sourceType} />
                      </td>
                      <td className="px-4 py-3 text-right text-sm" style={{ color: colors.text }}>
                        {usedPercentage}%
                      </td>
                      <td className="px-4 py-3 text-right text-sm" style={{ color: colors.text }}>
                        {(source.totalCitations / Math.max(source.uniqueUrls, 1)).toFixed(1)}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div 
              className="flex items-center justify-between px-4 py-3"
              style={{ borderTop: `1px solid ${colors.border}` }}
            >
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
                  if (totalPages <= 5) {
                    pageNum = i + 1
                  } else if (currentPage <= 3) {
                    pageNum = i + 1
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i
                  } else {
                    pageNum = currentPage - 2 + i
                  }
                  
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