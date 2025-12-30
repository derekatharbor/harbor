// apps/web/app/dashboard/competitors/page.tsx
// Competitive Intelligence - Premium feature for tracking competitors

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { 
  Users,
  TrendingUp,
  TrendingDown,
  Plus,
  ArrowUpRight,
  AlertCircle,
  X,
  Eye,
  MessageSquare,
  BarChart3
} from 'lucide-react'
import { XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'
import { useBrand } from '@/contexts/BrandContext'
import MobileHeader from '@/components/layout/MobileHeader'

// ============================================================================
// TYPES
// ============================================================================

interface TrackedCompetitor {
  id: string
  profile_id: string
  brand_name: string
  domain: string
  logo_url: string
  mentions: number
  visibility: number
  sentiment: string
  avg_position: number | null
}

interface CompetitorData {
  rank: number
  name: string
  domain: string
  logo: string
  fallbackLogo: string
  visibility: number
  sentiment: string
  position: number | null
  mentions: number
  isUser: boolean
  isTracked: boolean
  color: string
  profile_id: string | null
}

interface ApiResponse {
  competitors: CompetitorData[]
  tracked: TrackedCompetitor[]
  suggested: any[]
  user_data: {
    brand_name: string
    category: string | null
    visibility: number
    mentions: number
    sentiment: string
    position: number | null
  }
  total_brands_found: number
  user_rank: number | null
  plan_limits: {
    current: number
    max: number
    plan: string
  }
}

// ============================================================================
// HELPERS
// ============================================================================

function getSentimentColor(sentiment: string): string {
  switch (sentiment) {
    case 'positive': return 'text-green-500'
    case 'negative': return 'text-red-500'
    default: return 'text-muted'
  }
}

function getSentimentBg(sentiment: string): string {
  switch (sentiment) {
    case 'positive': return 'bg-green-500/10'
    case 'negative': return 'bg-red-500/10'
    default: return 'bg-secondary'
  }
}

// ============================================================================
// STAT CARD COMPONENT
// ============================================================================

function StatCard({ 
  label, 
  value, 
  subValue,
  trend,
  icon
}: { 
  label: string
  value: string | number
  subValue?: string
  trend?: { value: number; positive: boolean } | null
  icon?: string
}) {
  return (
    <div className="bg-card rounded-xl border border-border p-4 hover:border-border-light transition-colors">
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs text-muted uppercase tracking-wide">{label}</span>
        {icon && (
          <Image 
            src={`/icons/${icon}`} 
            alt="" 
            width={24} 
            height={24} 
            className="opacity-60"
          />
        )}
      </div>
      <div className="flex items-end justify-between">
        <div>
          <div className="text-2xl font-semibold text-primary tabular-nums">{value}</div>
          {subValue && (
            <div className="text-xs text-muted mt-0.5">{subValue}</div>
          )}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm font-medium ${trend.positive ? 'text-green-500' : 'text-red-500'}`}>
            {trend.positive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {trend.value}%
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================================================
// TRACKED COMPETITOR ROW
// ============================================================================

function TrackedCompetitorRow({ 
  competitor, 
  userData, 
  onUntrack,
  isUntracking 
}: { 
  competitor: TrackedCompetitor
  userData: ApiResponse['user_data'] | null
  onUntrack: () => void
  isUntracking: boolean
}) {
  const visibilityDiff = userData ? competitor.visibility - userData.visibility : 0
  const isWinning = visibilityDiff < 0
  const isTied = visibilityDiff === 0
  
  return (
    <div className="group flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors">
      <img 
        src={competitor.logo_url}
        alt=""
        className="w-8 h-8 rounded-lg bg-secondary flex-shrink-0"
        onError={(e) => { 
          e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(competitor.brand_name)}&background=1a1a1a&color=fff&size=64`
        }}
      />
      <div className="flex-1 min-w-0">
        <div className="font-medium text-primary text-sm truncate">{competitor.brand_name}</div>
        <div className="text-xs text-muted">{competitor.visibility}% visibility</div>
      </div>
      <div className="flex items-center gap-2">
        {userData && !isTied && (
          <span className={`text-xs font-medium ${isWinning ? 'text-green-500' : 'text-red-500'}`}>
            {isWinning ? '+' : ''}{-visibilityDiff}%
          </span>
        )}
        <button
          onClick={onUntrack}
          disabled={isUntracking}
          className="p-1.5 rounded-lg text-muted opacity-0 group-hover:opacity-100 hover:text-red-500 hover:bg-red-500/10 transition-all disabled:opacity-50"
          title="Stop tracking"
        >
          {isUntracking ? (
            <div className="w-3.5 h-3.5 border-2 border-muted border-t-transparent rounded-full animate-spin" />
          ) : (
            <X className="w-3.5 h-3.5" />
          )}
        </button>
      </div>
    </div>
  )
}

// ============================================================================
// CUSTOM CHART TOOLTIP
// ============================================================================

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload) return null
  
  return (
    <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
      <div className="text-xs text-muted mb-2">{label}</div>
      {payload.map((entry: any, idx: number) => (
        <div key={idx} className="flex items-center gap-2 text-sm">
          <div 
            className="w-2 h-2 rounded-full" 
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-muted capitalize">{entry.dataKey}:</span>
          <span className="font-medium text-primary">{entry.value}%</span>
        </div>
      ))}
    </div>
  )
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function CompetitorsPage() {
  const { currentDashboard } = useBrand()
  const [loading, setLoading] = useState(true)
  const [competitors, setCompetitors] = useState<CompetitorData[]>([])
  const [tracked, setTracked] = useState<TrackedCompetitor[]>([])
  const [userData, setUserData] = useState<ApiResponse['user_data'] | null>(null)
  const [planLimits, setPlanLimits] = useState<ApiResponse['plan_limits'] | null>(null)
  const [totalBrands, setTotalBrands] = useState(0)
  const [userRank, setUserRank] = useState<number | null>(null)
  const [trackingBrand, setTrackingBrand] = useState<string | null>(null)
  const [untrackingId, setUntrackingId] = useState<string | null>(null)
  const [trendData, setTrendData] = useState<Array<{ date: string; displayDate: string; you: number | null }>>([])
  const [hasTrendData, setHasTrendData] = useState(false)

  // Fetch data
  useEffect(() => {
    async function fetchCompetitors() {
      if (!currentDashboard?.id) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        
        // Fetch competitors data
        const response = await fetch(`/api/dashboard/${currentDashboard.id}/competitors?limit=25`)
        
        if (!response.ok) throw new Error('Failed to fetch')

        const data: ApiResponse = await response.json()
        
        setCompetitors(data.competitors || [])
        setTracked(data.tracked || [])
        setUserData(data.user_data || null)
        setPlanLimits(data.plan_limits || null)
        setTotalBrands(data.total_brands_found || 0)
        setUserRank(data.user_rank || null)
        
        // Fetch historical visibility data
        const historyResponse = await fetch(`/api/dashboard/${currentDashboard.id}/visibility-history?days=7`)
        if (historyResponse.ok) {
          const historyData = await historyResponse.json()
          if (historyData.history && historyData.has_data) {
            setTrendData(historyData.history.map((h: any) => ({
              date: h.date,
              displayDate: h.displayDate,
              you: h.visibility
            })))
            setHasTrendData(true)
          }
        }
        
      } catch (err) {
        console.error('Error fetching competitors:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchCompetitors()
  }, [currentDashboard?.id])

  // Track a brand
  async function handleTrackBrand(brand: CompetitorData) {
    if (!currentDashboard?.id) return
    if (planLimits && tracked.length >= planLimits.max) return
    
    setTrackingBrand(brand.name)
    
    try {
      const response = await fetch(`/api/dashboard/${currentDashboard.id}/competitors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile_id: brand.profile_id,
          brand_name: brand.name,
          domain: brand.domain
        })
      })
      
      if (response.ok) {
        const refreshRes = await fetch(`/api/dashboard/${currentDashboard.id}/competitors?limit=25`)
        if (refreshRes.ok) {
          const data = await refreshRes.json()
          setCompetitors(data.competitors || [])
          setTracked(data.tracked || [])
          setPlanLimits(data.plan_limits || null)
        }
      }
    } catch (err) {
      console.error('Error tracking brand:', err)
    } finally {
      setTrackingBrand(null)
    }
  }

  // Untrack a brand
  async function handleUntrackBrand(competitor: TrackedCompetitor) {
    if (!currentDashboard?.id) return
    
    setUntrackingId(competitor.id)
    
    try {
      const response = await fetch(
        `/api/dashboard/${currentDashboard.id}/competitors?competitor_id=${competitor.id}`,
        { method: 'DELETE' }
      )
      
      if (response.ok) {
        const refreshRes = await fetch(`/api/dashboard/${currentDashboard.id}/competitors?limit=25`)
        if (refreshRes.ok) {
          const data = await refreshRes.json()
          setCompetitors(data.competitors || [])
          setTracked(data.tracked || [])
          setPlanLimits(data.plan_limits || null)
        }
      }
    } catch (err) {
      console.error('Error untracking brand:', err)
    } finally {
      setUntrackingId(null)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-primary" data-page="competitors">
        <MobileHeader />
        <div className="p-6">
          <div className="animate-pulse space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[1,2,3,4].map(i => (
                <div key={i} className="h-24 bg-card rounded-xl"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 h-72 bg-card rounded-xl"></div>
              <div className="h-72 bg-card rounded-xl"></div>
            </div>
            <div className="h-96 bg-card rounded-xl"></div>
          </div>
        </div>
      </div>
    )
  }

  const hasLeaderboardData = competitors.length > 0
  const hasTrackedOrLeaderboard = tracked.length > 0 || competitors.length > 0
  const canTrackMore = planLimits ? tracked.length < planLimits.max : true

  return (
    <div className="min-h-screen bg-primary" data-page="competitors">
      <MobileHeader />

      {/* Header Bar */}
      <div className="page-header-bar">
        <div className="flex items-center gap-3">
          <Users className="w-4 h-4 text-muted" />
          <h1 className="text-sm font-medium text-secondary">Competitive Intelligence</h1>
        </div>

        <Link 
          href="/dashboard/competitors/manage"
          className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg text-secondary hover:text-primary hover:bg-secondary transition-colors"
        >
          Manage
          <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>

      {!hasTrackedOrLeaderboard ? (
        <div className="p-6">
          <div className="card p-12 text-center">
            {/* Empty state illustration placeholder */}
            <div className="w-64 h-64 mx-auto mb-6">
              <img 
                src="/images/empty-states/competitors.png" 
                alt="" 
                className="w-full h-full object-contain"
              />
            </div>
            <h2 className="text-lg font-semibold text-primary mb-2">No competitor data yet</h2>
            <p className="text-sm text-muted mb-6 max-w-md mx-auto">
              Run prompts to see which brands AI mentions alongside yours, or add competitors manually to start tracking.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link 
                href="/dashboard/prompts"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-black text-white rounded-lg text-sm font-medium hover:bg-neutral-800 active:bg-neutral-900 transition-colors"
              >
                Run Prompts
                <ArrowUpRight className="w-4 h-4" />
              </Link>
              <Link 
                href="/dashboard/competitors/manage"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-secondary border border-border rounded-lg text-sm font-medium text-primary hover:bg-hover active:bg-secondary transition-colors"
              >
                Add Manually
                <Plus className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6 space-y-6">
          
          {/* Stat Cards Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Your Rank"
              value={userRank ? `#${userRank}` : '—'}
              subValue={totalBrands ? `of ${totalBrands} brands` : undefined}
              icon="trophy.png"
            />
            <StatCard
              label="Visibility"
              value={userData?.visibility ? `${userData.visibility}%` : '—'}
              subValue="in AI responses"
              icon="visibility.png"
            />
            <StatCard
              label="Tracked"
              value={tracked.length}
              subValue={planLimits ? `of ${planLimits.max} slots` : undefined}
              icon="user.png"
            />
            <StatCard
              label="Mentions"
              value={userData?.mentions || 0}
              subValue="across all prompts"
              icon="mentions.png"
            />
          </div>
          
          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Visibility Trend Chart */}
            <div className="lg:col-span-2 card p-0 overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div>
                  <h3 className="font-semibold text-primary text-sm">Visibility Over Time</h3>
                  <p className="text-xs text-muted mt-0.5">Your AI visibility trend</p>
                </div>
                {hasTrendData && (
                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-1 rounded-full" style={{ background: 'linear-gradient(90deg, #06B6D4, #A855F7, #EC4899)' }} />
                      <span className="text-muted">You</span>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="p-4 h-64">
                {hasTrendData ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="holoGradient" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#06B6D4" />
                          <stop offset="50%" stopColor="#A855F7" />
                          <stop offset="100%" stopColor="#EC4899" />
                        </linearGradient>
                        <linearGradient id="holoFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#A855F7" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="#A855F7" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis 
                        dataKey="displayDate" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                        domain={[0, 100]}
                        tickFormatter={(v) => `${v}%`}
                      />
                      <Tooltip content={<ChartTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="you"
                        stroke="url(#holoGradient)"
                        strokeWidth={3}
                        fill="url(#holoFill)"
                        connectNulls
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <BarChart3 className="w-10 h-10 text-muted mb-3 opacity-40" />
                    <p className="text-sm text-muted mb-1">No trend data yet</p>
                    <p className="text-xs text-muted">Run prompts daily to build your visibility history</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Tracked Competitors Sidebar */}
            <div className="card p-0 overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div>
                  <h3 className="font-semibold text-primary text-sm">Tracked</h3>
                  <p className="text-xs text-muted mt-0.5">
                    {planLimits ? `${tracked.length}/${planLimits.max} slots` : `${tracked.length} competitors`}
                  </p>
                </div>
                {canTrackMore && (
                  <Link 
                    href="/dashboard/competitors/manage"
                    className="p-1.5 rounded-lg text-muted hover:text-primary hover:bg-secondary transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </Link>
                )}
              </div>
              
              <div className="max-h-[232px] overflow-y-auto">
                {tracked.length === 0 ? (
                  <div className="p-6 text-center">
                    <Users className="w-8 h-8 text-muted mx-auto mb-2 opacity-40" />
                    <p className="text-xs text-muted">No competitors tracked</p>
                    <Link 
                      href="/dashboard/competitors/manage"
                      className="inline-flex items-center gap-1 text-xs text-accent hover:underline mt-2"
                    >
                      Add one <ArrowUpRight className="w-3 h-3" />
                    </Link>
                  </div>
                ) : (
                  <div className="p-2">
                    {tracked.map((comp) => (
                      <TrackedCompetitorRow
                        key={comp.id}
                        competitor={comp}
                        userData={userData}
                        onUntrack={() => handleUntrackBrand(comp)}
                        isUntracking={untrackingId === comp.id}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Full Leaderboard */}
          <div className="card p-0 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div>
                <h3 className="font-semibold text-primary text-sm">All Brands in AI Responses</h3>
                <p className="text-xs text-muted mt-0.5">
                  {totalBrands} brands mentioned across your tracked prompts
                </p>
              </div>
            </div>

            {!hasLeaderboardData ? (
              <div className="p-8 text-center">
                <BarChart3 className="w-10 h-10 text-muted mx-auto mb-3 opacity-40" />
                <p className="text-sm text-muted mb-2">No AI response data yet</p>
                <p className="text-xs text-muted mb-4">Run prompts to discover which brands AI recommends</p>
                <Link 
                  href="/dashboard/prompts"
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-secondary rounded-lg text-xs font-medium text-primary hover:bg-hover transition-colors"
                >
                  Go to Prompts
                  <ArrowUpRight className="w-3 h-3" />
                </Link>
              </div>
            ) : (
              <>
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-2 px-4 py-3 text-xs text-muted border-b border-border bg-secondary/50">
                  <div className="col-span-1">#</div>
                  <div className="col-span-4">Brand</div>
                  <div className="col-span-2 text-right">Visibility</div>
                  <div className="col-span-2 text-right">Mentions</div>
                  <div className="col-span-2 text-center">Sentiment</div>
                  <div className="col-span-1"></div>
                </div>

                {/* Table Body */}
                <div className="max-h-[400px] overflow-y-auto">
                  {competitors.map((comp) => {
                    const isTracking = trackingBrand === comp.name
                    const isAlreadyTracked = comp.isTracked
                
                    return (
                      <div 
                        key={comp.name}
                        className={`
                          grid grid-cols-12 gap-2 px-4 py-3 items-center border-b border-border
                          transition-colors
                          ${comp.isUser ? 'bg-accent/5' : 'hover:bg-secondary/50'}
                        `}
                      >
                        {/* Rank */}
                        <div className="col-span-1 text-sm text-muted tabular-nums font-medium">
                          {comp.rank}
                        </div>
                        
                        {/* Brand */}
                        <div className="col-span-4 flex items-center gap-3 min-w-0">
                          <img 
                            src={comp.logo}
                            alt=""
                            className="w-8 h-8 rounded-lg flex-shrink-0 bg-secondary"
                            onError={(e) => { 
                              e.currentTarget.src = comp.fallbackLogo
                            }}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className={`text-sm truncate ${comp.isUser ? 'font-semibold text-primary' : 'text-primary'}`}>
                                {comp.name}
                              </span>
                              {comp.isUser && (
                                <span className="text-xs px-1.5 py-0.5 rounded font-medium" style={{ 
                                  background: 'linear-gradient(90deg, rgba(6,182,212,0.2), rgba(168,85,247,0.2), rgba(236,72,153,0.2))',
                                  color: '#A855F7'
                                }}>YOU</span>
                              )}
                              {isAlreadyTracked && !comp.isUser && (
                                <span className="text-xs bg-green-500/20 text-green-500 px-1.5 py-0.5 rounded">Tracked</span>
                              )}
                            </div>
                            <span className="text-xs text-muted truncate block">{comp.domain}</span>
                          </div>
                        </div>
                        
                        {/* Visibility */}
                        <div className="col-span-2 flex items-center justify-end gap-2">
                          <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden">
                            <div 
                              className="h-full rounded-full transition-all"
                              style={{ 
                                width: `${comp.visibility}%`, 
                                background: comp.isUser 
                                  ? 'linear-gradient(90deg, #06B6D4, #A855F7, #EC4899)' 
                                  : comp.color 
                              }}
                            />
                          </div>
                          <span className="text-sm text-primary tabular-nums w-10 text-right font-medium">{comp.visibility}%</span>
                        </div>
                        
                        {/* Mentions */}
                        <div className="col-span-2 text-right">
                          <span className="text-sm text-primary tabular-nums font-medium">{comp.mentions}</span>
                        </div>
                        
                        {/* Sentiment */}
                        <div className="col-span-2 flex items-center justify-center">
                          <span className={`text-xs px-2.5 py-1 rounded-full capitalize ${getSentimentBg(comp.sentiment)} ${getSentimentColor(comp.sentiment)}`}>
                            {comp.sentiment}
                          </span>
                        </div>
                        
                        {/* Action */}
                        <div className="col-span-1 flex items-center justify-end">
                          {!comp.isUser && !isAlreadyTracked && canTrackMore && (
                            <button
                              onClick={() => handleTrackBrand(comp)}
                              disabled={isTracking}
                              className="p-1.5 text-muted hover:text-primary hover:bg-secondary rounded-lg transition-all disabled:opacity-50"
                              title="Track competitor"
                            >
                              {isTracking ? (
                                <div className="w-4 h-4 border-2 border-muted border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <Plus className="w-4 h-4" />
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </div>

        </div>
      )}
    </div>
  )
}