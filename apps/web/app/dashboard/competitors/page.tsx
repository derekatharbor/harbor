// apps/web/app/dashboard/competitors/page.tsx
// Competitive Intelligence - All brands mentioned in AI responses

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Users,
  TrendingUp,
  TrendingDown,
  Target,
  Crown,
  Minus,
  Search,
  BarChart3,
  Zap
} from 'lucide-react'
import { useBrand } from '@/contexts/BrandContext'
import MobileHeader from '@/components/layout/MobileHeader'

// ============================================================================
// TYPES
// ============================================================================

interface CompetitorData {
  rank: number
  name: string
  domain: string | null
  logo: string
  visibility: number
  visibilityDelta: number | null
  sentiment: number
  sentimentDelta: number | null
  position: number | null  // Changed to allow null
  positionDelta: number | null
  mentions: number
  isUser: boolean
  color: string
}

interface ApiResponse {
  competitors: CompetitorData[]
  total_brands_found: number
  user_rank: number | null
}

// Colors
const USER_COLOR = '#EC4899'
const BAR_COLOR = '#3B82F6' // Blue

// Build Brandfetch logo URL - always request 128px for quality
function getBrandLogo(name: string): string {
  if (!name) return ''
  const cleanName = name.toLowerCase().trim()
  
  // If name already has a TLD, use it directly
  if (cleanName.includes('.com') || cleanName.includes('.io') || cleanName.includes('.co')) {
    const domain = cleanName.replace(/[^a-z0-9.]/g, '')
    return `https://cdn.brandfetch.io/${domain}/w/128/h/128`
  }
  
  // Otherwise, assume .com
  const slug = cleanName.replace(/[^a-z0-9]/g, '')
  return `https://cdn.brandfetch.io/${slug}.com/w/128/h/128`
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function CompetitorsPage() {
  const { currentDashboard } = useBrand()
  const [loading, setLoading] = useState(true)
  const [competitors, setCompetitors] = useState<CompetitorData[]>([])
  const [totalBrands, setTotalBrands] = useState(0)
  const [userRank, setUserRank] = useState<number | null>(null)
  const [selectedCompetitor, setSelectedCompetitor] = useState<CompetitorData | null>(null)
  const [activeView, setActiveView] = useState<'leaderboard' | 'compare' | 'gaps'>('leaderboard')
  const [searchQuery, setSearchQuery] = useState('')

  const brandName = currentDashboard?.brand_name || 'Your Brand'

  useEffect(() => {
    async function fetchCompetitors() {
      if (!currentDashboard?.id) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const response = await fetch(`/api/dashboard/${currentDashboard.id}/competitors?limit=25`)
        
        if (!response.ok) throw new Error('Failed to fetch')

        const data: ApiResponse = await response.json()
        
        setCompetitors(data.competitors || [])
        setTotalBrands(data.total_brands_found || 0)
        setUserRank(data.user_rank)
        
        // Default select first non-user competitor
        const firstCompetitor = data.competitors?.find(c => !c.isUser)
        if (firstCompetitor) {
          setSelectedCompetitor(firstCompetitor)
        }
        
      } catch (err) {
        console.error('Error fetching competitors:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchCompetitors()
  }, [currentDashboard?.id])

  // Get user's data - create fallback if not in list
  const foundUserData = competitors.find(c => c.isUser)
  const userData: CompetitorData = foundUserData || {
    rank: totalBrands + 1,
    name: brandName,
    domain: null,
    logo: '',
    visibility: 0,
    visibilityDelta: null,
    sentiment: 0,
    sentimentDelta: null,
    position: null,  // Changed from 0 to null
    positionDelta: null,
    mentions: 0,
    isUser: true,
    color: USER_COLOR
  }
  const nonUserCompetitors = competitors.filter(c => !c.isUser)
  
  // Filter competitors by search
  const filteredCompetitors = searchQuery 
    ? competitors.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : competitors

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-primary" data-page="competitors">
        <MobileHeader />
        <div className="page-header-bar">
          <div className="animate-pulse h-5 bg-secondary rounded w-48"></div>
        </div>
        <div className="status-banner">
          <div className="animate-pulse h-4 bg-hover rounded w-64"></div>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-4 gap-4">
            {[1,2,3,4].map(i => <div key={i} className="card h-20 animate-pulse"></div>)}
          </div>
          <div className="card h-96 animate-pulse"></div>
        </div>
      </div>
    )
  }

  // Empty state
  if (competitors.length === 0) {
    return (
      <div className="min-h-screen bg-primary" data-page="competitors">
        <MobileHeader />
        <div className="page-header-bar">
          <span className="page-title">Competitive Intelligence</span>
        </div>
        <div className="p-6">
          <div className="card p-12 text-center">
            <Users className="w-12 h-12 text-muted mx-auto mb-4 opacity-40" />
            <h2 className="text-xl font-semibold text-primary mb-2">No Competitor Data</h2>
            <p className="text-sm text-muted mb-6 max-w-md mx-auto">
              Run prompts to see which brands AI mentions alongside yours. This page shows all brands 
              found in AI responses to your tracked prompts.
            </p>
            <Link href="/dashboard/prompts" className="btn-secondary inline-flex items-center gap-2">
              <Target className="w-4 h-4" />
              View Prompts
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-primary" data-page="competitors">
      <MobileHeader />

      {/* Header Bar */}
      <div className="page-header-bar">
        <div className="flex items-center gap-4">
          <span className="page-title">Competitive Intelligence</span>
          <div className="pill-group">
            {(['leaderboard', 'compare', 'gaps'] as const).map(view => (
              <button
                key={view}
                onClick={() => setActiveView(view)}
                className={`pill capitalize ${activeView === view ? 'active' : ''}`}
              >
                {view === 'gaps' ? 'Gap Analysis' : view}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {userRank && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary rounded-lg">
              <Crown className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-primary">#{userRank}</span>
              <span className="text-xs text-muted">of {totalBrands}</span>
            </div>
          )}
        </div>
      </div>

      {/* Status Banner */}
      <div className="status-banner">
        <div className="status-banner-text flex items-center gap-2">
          <Users className="w-4 h-4" />
          <span className="font-medium text-primary">Brand Landscape</span>
          <span className="mx-1">•</span>
          <span>{totalBrands} brands found in AI responses</span>
        </div>
        <div className="status-banner-metrics">
          {foundUserData ? (
            <>
              <span>Your visibility: <strong className="text-primary">{userData.visibility ?? 0}%</strong></span>
              <span>Sentiment: <strong className="text-primary">{userData.sentiment ?? 0}%</strong></span>
            </>
          ) : (
            <span className="text-muted">Your brand not detected in responses</span>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="p-6 pb-0">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card p-4">
            <div className="text-xs text-muted uppercase tracking-wide mb-2">Your Visibility</div>
            <div className="metric-value">{userData.visibility ?? 0}%</div>
            <div className="text-xs text-muted mt-1">relative to top brand</div>
          </div>
          <div className="card p-4">
            <div className="text-xs text-muted uppercase tracking-wide mb-2">Your Mentions</div>
            <div className="metric-value">{userData.mentions ?? 0}</div>
            <div className="text-xs text-muted mt-1">in AI responses</div>
          </div>
          <div className="card p-4">
            <div className="text-xs text-muted uppercase tracking-wide mb-2">Avg Position</div>
            <div className="metric-value">{userData.position != null && userData.position > 0 ? userData.position.toFixed(1) : '—'}</div>
            <div className="text-xs text-muted mt-1">when mentioned (1 = first)</div>
          </div>
          <div className="card p-4">
            <div className="text-xs text-muted uppercase tracking-wide mb-2">Sentiment</div>
            <div className="metric-value">{userData.sentiment ?? 0}%</div>
            <div className="text-xs text-muted mt-1">positive mentions</div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        
        {/* LEADERBOARD VIEW */}
        {activeView === 'leaderboard' && (
          <>
            {/* Top Section: Horizontal Bars + Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Top 10 Horizontal Bar Chart */}
              <div className="lg:col-span-2 card p-0 overflow-hidden">
                <div className="p-4 border-b border-border">
                  <h3 className="font-semibold text-primary text-sm">Top 10 Brands by Mentions</h3>
                  <p className="text-xs text-muted mt-0.5">How often each brand appears in AI responses</p>
                </div>
                <div className="p-4 space-y-1">
                  {competitors.slice(0, 10).map((comp, idx) => {
                    const maxMentions = competitors[0]?.mentions || 1
                    const barWidth = (comp.mentions / maxMentions) * 100
                    
                    return (
                      <div key={comp.name} className="flex items-center gap-3 py-1.5">
                        <span className="text-xs text-muted w-5 tabular-nums text-right">{idx + 1}</span>
                        <img 
                          src={getBrandLogo(comp.name)}
                          alt=""
                          className="w-5 h-5 rounded object-contain flex-shrink-0"
                          onError={(e) => { e.currentTarget.style.display = 'none' }}
                        />
                        <div className="w-28 flex-shrink-0">
                          <span className={`text-sm truncate ${comp.isUser ? 'font-medium text-primary' : 'text-secondary'}`}>
                            {comp.name}
                          </span>
                        </div>
                        <div className="flex-1 h-5 bg-secondary/30 rounded overflow-hidden relative">
                          <div 
                            className="h-full rounded transition-all duration-500"
                            style={{ 
                              width: `${barWidth}%`,
                              backgroundColor: comp.isUser ? USER_COLOR : BAR_COLOR,
                              opacity: comp.isUser ? 1 : 0.9 - (idx * 0.05)
                            }}
                          />
                        </div>
                        <span className="text-sm tabular-nums text-primary w-12 text-right font-medium">
                          {comp.mentions}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Insights Panel */}
              <div className="card p-0 overflow-hidden">
                <div className="p-4 border-b border-border">
                  <h3 className="font-semibold text-primary text-sm">Quick Insights</h3>
                  <p className="text-xs text-muted mt-0.5">Key competitive signals</p>
                </div>
                <div className="divide-y divide-border-light">
                  {/* Most Mentioned */}
                  <div className="px-4 py-3">
                    <div className="text-[10px] text-muted uppercase tracking-wide mb-1.5">Most Mentioned</div>
                    <div className="flex items-center gap-2">
                      <img 
                        src={getBrandLogo(competitors[0]?.name || '')}
                        alt=""
                        className="w-5 h-5 rounded object-contain"
                        onError={(e) => { e.currentTarget.style.display = 'none' }}
                      />
                      <span className="font-medium text-primary text-sm">{competitors[0]?.name || '—'}</span>
                    </div>
                    <div className="text-xs text-muted mt-0.5">{competitors[0]?.mentions ?? 0} mentions</div>
                  </div>

                  {/* Best Sentiment */}
                  {(() => {
                    const bestSentiment = [...competitors].sort((a, b) => (b.sentiment ?? 0) - (a.sentiment ?? 0))[0]
                    return (
                      <div className="px-4 py-3">
                        <div className="text-[10px] text-muted uppercase tracking-wide mb-1.5">Best Sentiment</div>
                        <div className="flex items-center gap-2">
                          <img 
                            src={getBrandLogo(bestSentiment?.name || '')}
                            alt=""
                            className="w-5 h-5 rounded object-contain"
                            onError={(e) => { e.currentTarget.style.display = 'none' }}
                          />
                          <span className="font-medium text-primary text-sm">{bestSentiment?.name || '—'}</span>
                        </div>
                        <div className="text-xs text-muted mt-0.5">{bestSentiment?.sentiment ?? 0}% positive</div>
                      </div>
                    )
                  })()}

                  {/* Best Position */}
                  {(() => {
                    const bestPosition = [...competitors].filter(c => c.position != null && c.position > 0).sort((a, b) => (a.position ?? 999) - (b.position ?? 999))[0]
                    return (
                      <div className="px-4 py-3">
                        <div className="text-[10px] text-muted uppercase tracking-wide mb-1.5">Best Avg Position</div>
                        <div className="flex items-center gap-2">
                          <img 
                            src={getBrandLogo(bestPosition?.name || '')}
                            alt=""
                            className="w-5 h-5 rounded object-contain"
                            onError={(e) => { e.currentTarget.style.display = 'none' }}
                          />
                          <span className="font-medium text-primary text-sm">{bestPosition?.name || '—'}</span>
                        </div>
                        <div className="text-xs text-muted mt-0.5">Position {bestPosition?.position?.toFixed(1) ?? '—'} avg</div>
                      </div>
                    )
                  })()}

                  {/* Your Gap to #1 */}
                  <div className="px-4 py-3 bg-secondary/30">
                    <div className="text-[10px] text-muted uppercase tracking-wide mb-1">Your Gap to #1</div>
                    {foundUserData ? (
                      <>
                        <div className="text-xl font-semibold text-primary">
                          {(competitors[0]?.mentions ?? 0) - (userData.mentions ?? 0)}
                        </div>
                        <div className="text-xs text-muted">mentions behind {competitors[0]?.name}</div>
                      </>
                    ) : (
                      <>
                        <div className="text-xl font-semibold text-primary">
                          {competitors[0]?.mentions ?? 0}
                        </div>
                        <div className="text-xs text-muted">mentions to match {competitors[0]?.name}</div>
                      </>
                    )}
                  </div>

                  {/* Market Concentration */}
                  {(() => {
                    const totalMentions = competitors.reduce((sum, c) => sum + (c.mentions ?? 0), 0)
                    const top3Mentions = competitors.slice(0, 3).reduce((sum, c) => sum + (c.mentions ?? 0), 0)
                    const concentration = totalMentions > 0 ? Math.round((top3Mentions / totalMentions) * 100) : 0
                    return (
                      <div className="px-4 py-3">
                        <div className="text-[10px] text-muted uppercase tracking-wide mb-1">Market Concentration</div>
                        <div className="text-xl font-semibold text-primary">{concentration}%</div>
                        <div className="text-xs text-muted">of mentions go to top 3 brands</div>
                      </div>
                    )
                  })()}
                </div>
              </div>
            </div>

            {/* Full Leaderboard Table */}
            <div className="card p-0 overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h3 className="font-semibold text-primary text-sm">Full Leaderboard</h3>
                <div className="relative">
                  <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text"
                    placeholder="Search brands..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="input pl-9 w-48 text-sm"
                  />
                </div>
              </div>
              
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: 50 }}>#</th>
                    <th>Brand</th>
                    <th>Visibility</th>
                    <th>Mentions</th>
                    <th>Sentiment</th>
                    <th>Position</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCompetitors.map((comp) => (
                    <tr 
                      key={comp.name}
                      onClick={() => !comp.isUser && setSelectedCompetitor(comp)}
                      className={`cursor-pointer transition-colors ${
                        comp.isUser 
                          ? 'bg-[rgba(236,72,153,0.05)]' 
                          : selectedCompetitor?.name === comp.name 
                            ? 'bg-hover' 
                            : ''
                      }`}
                    >
                      <td>
                        <span className={`font-medium ${comp.isUser ? 'text-[#EC4899]' : 'text-muted'}`}>
                          {comp.rank}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <img 
                            src={getBrandLogo(comp.name)}
                            alt=""
                            className="w-6 h-6 rounded object-contain"
                            onError={(e) => { e.currentTarget.style.display = 'none' }}
                          />
                          <span className="font-medium text-primary">{comp.name}</span>
                          {comp.isUser && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[rgba(236,72,153,0.1)] text-[#EC4899] font-medium">YOU</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden">
                            <div 
                              className="h-full rounded-full"
                              style={{ 
                                width: `${comp.visibility ?? 0}%`,
                                backgroundColor: comp.isUser ? USER_COLOR : BAR_COLOR,
                                opacity: comp.isUser ? 1 : 0.6
                              }}
                            />
                          </div>
                          <span className="text-sm tabular-nums text-secondary">{comp.visibility ?? 0}%</span>
                        </div>
                      </td>
                      <td className="tabular-nums">{comp.mentions ?? 0}</td>
                      <td>
                        <span className={`text-sm tabular-nums ${
                          (comp.sentiment ?? 0) >= 60 ? 'text-primary' : 
                          (comp.sentiment ?? 0) >= 40 ? 'text-secondary' : 'text-muted'
                        }`}>
                          {comp.sentiment ?? 0}%
                        </span>
                      </td>
                      <td className="tabular-nums">{comp.position?.toFixed(1) ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* COMPARE VIEW */}
        {activeView === 'compare' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Competitor Selector */}
            <div className="card p-0 overflow-hidden">
              <div className="p-4 border-b border-border">
                <h3 className="font-semibold text-primary text-sm">Select Competitor</h3>
                <p className="text-xs text-muted mt-0.5">Click to compare</p>
              </div>
              <div className="divide-y divide-border-light max-h-[500px] overflow-y-auto">
                {nonUserCompetitors.map(comp => (
                  <button
                    key={comp.name}
                    onClick={() => setSelectedCompetitor(comp)}
                    className={`w-full px-4 py-2 flex items-center gap-2 text-left transition-colors hover:bg-hover ${
                      selectedCompetitor?.name === comp.name ? 'bg-hover' : ''
                    }`}
                  >
                    <span className="text-xs text-muted w-5 tabular-nums">#{comp.rank}</span>
                    <img 
                      src={getBrandLogo(comp.name)}
                      alt=""
                      className="w-5 h-5 rounded object-contain flex-shrink-0"
                      onError={(e) => { e.currentTarget.style.display = 'none' }}
                    />
                    <span className="text-sm text-primary truncate flex-1">{comp.name}</span>
                    <span className="text-xs text-muted tabular-nums">{comp.mentions}</span>
                    {selectedCompetitor?.name === comp.name && (
                      <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Comparison Panel */}
            <div className="lg:col-span-2 space-y-6">
              {selectedCompetitor ? (
                <>
                  {/* Head to Head Header */}
                  <div className="card p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center mb-2 overflow-hidden">
                            <img 
                              src={getBrandLogo(currentDashboard?.domain || brandName)}
                              alt=""
                              className="w-full h-full object-contain"
                              onError={(e) => { 
                                e.currentTarget.style.display = 'none'
                                if (e.currentTarget.parentElement) {
                                  e.currentTarget.parentElement.innerHTML = `<span class="text-lg font-bold text-primary">${brandName.charAt(0)}</span>`
                                }
                              }}
                            />
                          </div>
                          <div className="text-sm font-medium text-primary">{brandName}</div>
                          <div className="text-xs text-muted">You</div>
                        </div>
                        <div className="text-2xl text-muted">vs</div>
                        <div className="text-center">
                          <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center mb-2 overflow-hidden">
                            <img 
                              src={getBrandLogo(selectedCompetitor.name)}
                              alt=""
                              className="w-full h-full object-contain"
                              onError={(e) => { 
                                e.currentTarget.style.display = 'none'
                                if (e.currentTarget.parentElement) {
                                  e.currentTarget.parentElement.innerHTML = `<span class="text-lg font-bold text-secondary">${selectedCompetitor.name.charAt(0)}</span>`
                                }
                              }}
                            />
                          </div>
                          <div className="text-sm font-medium text-primary">{selectedCompetitor.name}</div>
                          <div className="text-xs text-muted">#{selectedCompetitor.rank}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        {(userData.visibility ?? 0) > (selectedCompetitor.visibility ?? 0) ? (
                          <div className="text-primary">
                            <TrendingUp className="w-5 h-5 inline mr-1 opacity-60" />
                            <span className="text-sm font-medium">You lead</span>
                          </div>
                        ) : (userData.visibility ?? 0) < (selectedCompetitor.visibility ?? 0) ? (
                          <div className="text-secondary">
                            <TrendingDown className="w-5 h-5 inline mr-1 opacity-60" />
                            <span className="text-sm font-medium">They lead</span>
                          </div>
                        ) : (
                          <div className="text-muted">
                            <Minus className="w-5 h-5 inline mr-1" />
                            <span className="text-sm font-medium">Tied</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Comparison Bars */}
                    <div className="space-y-4">
                      {[
                        { label: 'Visibility', userVal: userData.visibility ?? 0, compVal: selectedCompetitor.visibility ?? 0, suffix: '%' },
                        { label: 'Mentions', userVal: userData.mentions ?? 0, compVal: selectedCompetitor.mentions ?? 0, suffix: '' },
                        { label: 'Sentiment', userVal: userData.sentiment ?? 0, compVal: selectedCompetitor.sentiment ?? 0, suffix: '%' },
                        { label: 'Avg Position', userVal: userData.position ?? 0, compVal: selectedCompetitor.position ?? 0, suffix: '', inverse: true }
                      ].map(metric => {
                        const userWins = metric.inverse 
                          ? metric.userVal < metric.compVal 
                          : metric.userVal > metric.compVal
                        const total = metric.userVal + metric.compVal || 1
                        const userPct = (metric.userVal / total) * 100
                        const compPct = (metric.compVal / total) * 100

                        return (
                          <div key={metric.label}>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-muted">{metric.label}</span>
                              <div className="flex gap-4">
                                <span className={userWins ? 'text-primary font-medium' : 'text-secondary'}>
                                  {metric.suffix === '%' 
                                    ? `${metric.userVal}${metric.suffix}`
                                    : metric.label === 'Avg Position'
                                      ? (metric.userVal > 0 ? metric.userVal.toFixed(1) : '—')
                                      : metric.userVal.toLocaleString()
                                  }
                                </span>
                                <span className={!userWins && metric.userVal !== metric.compVal ? 'text-primary font-medium' : 'text-secondary'}>
                                  {metric.suffix === '%' 
                                    ? `${metric.compVal}${metric.suffix}`
                                    : metric.label === 'Avg Position'
                                      ? (metric.compVal > 0 ? metric.compVal.toFixed(1) : '—')
                                      : metric.compVal.toLocaleString()
                                  }
                                </span>
                              </div>
                            </div>
                            <div className="flex h-2 rounded-full overflow-hidden bg-border">
                              <div 
                                className="transition-all"
                                style={{ width: `${userPct}%`, backgroundColor: USER_COLOR }}
                              />
                              <div 
                                className="transition-all"
                                style={{ width: `${compPct}%`, backgroundColor: BAR_COLOR, opacity: 0.5 }}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="card p-6">
                    <h4 className="font-medium text-primary mb-3">Summary</h4>
                    <div className="text-sm text-secondary leading-relaxed">
                      {(userData.visibility ?? 0) > (selectedCompetitor.visibility ?? 0) ? (
                        <p>
                          <strong className="text-primary">{brandName}</strong> has higher visibility than <strong className="text-primary">{selectedCompetitor.name}</strong> in AI responses. 
                          You appear in {userData.mentions ?? 0} responses vs their {selectedCompetitor.mentions ?? 0}. 
                          {(userData.sentiment ?? 0) > (selectedCompetitor.sentiment ?? 0) 
                            ? ' Your sentiment is also stronger.'
                            : (userData.sentiment ?? 0) < (selectedCompetitor.sentiment ?? 0) 
                              ? ' However, they have better sentiment scores.'
                              : ''}
                        </p>
                      ) : (userData.visibility ?? 0) < (selectedCompetitor.visibility ?? 0) ? (
                        <p>
                          <strong className="text-primary">{selectedCompetitor.name}</strong> currently has higher visibility than <strong className="text-primary">{brandName}</strong>. 
                          They appear in {selectedCompetitor.mentions ?? 0} responses vs your {userData.mentions ?? 0}. 
                          Consider running more prompts in your category to identify opportunities.
                        </p>
                      ) : (
                        <p>
                          <strong className="text-primary">{brandName}</strong> and <strong className="text-primary">{selectedCompetitor.name}</strong> have similar visibility in AI responses.
                        </p>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="card p-12 text-center">
                  <Users className="w-10 h-10 text-muted mx-auto mb-3 opacity-40" />
                  <p className="text-sm text-muted">Select a competitor to compare</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* GAP ANALYSIS VIEW */}
        {activeView === 'gaps' && (
          <div className="card p-0 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div>
                <h3 className="font-semibold text-primary text-sm">Gap Analysis</h3>
                <p className="text-xs text-muted mt-0.5">Prompts where competitors appear but you don't</p>
              </div>
              <span className="badge badge-neutral">Coming Soon</span>
            </div>
            <div className="p-12 text-center">
              <Zap className="w-12 h-12 text-muted mx-auto mb-4 opacity-40" />
              <h3 className="text-lg font-semibold text-primary mb-2">Gap Analysis Coming Soon</h3>
              <p className="text-sm text-muted max-w-md mx-auto mb-6">
                We're building a feature to show you which prompts mention your competitors but not your brand. 
                This will help you identify opportunities to improve your visibility.
              </p>
              <div className="inline-flex items-center gap-2 text-xs text-muted bg-secondary px-3 py-2 rounded-lg">
                <BarChart3 className="w-4 h-4" />
                <span>Analyzing {totalBrands} brands across your prompts</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}