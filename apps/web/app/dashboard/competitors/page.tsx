// apps/web/app/dashboard/competitors/page.tsx
// Competitive Intelligence - Premium feature for tracking competitors

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Users,
  TrendingUp,
  TrendingDown,
  Target,
  Eye,
  BarChart3,
  Plus,
  ArrowUpRight,
  AlertCircle,
  MessageSquare,
  X
} from 'lucide-react'
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

interface SuggestedBrand {
  rank: number
  brand_name: string
  domain: string
  logo_url: string
  mentions: number
  visibility: number
  sentiment: string
  profile_id: string | null
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
  suggested: SuggestedBrand[]
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
// COMPETITOR CARD COMPONENT
// ============================================================================

function CompetitorCard({ 
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
    <div className="group card p-0 overflow-hidden hover:border-border-light transition-all">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center gap-3">
        <img 
          src={competitor.logo_url}
          alt=""
          className="w-10 h-10 rounded-lg bg-secondary"
          onError={(e) => { 
            e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(competitor.brand_name)}&background=1a1a1a&color=fff&size=64`
          }}
        />
        <div className="flex-1 min-w-0">
          <div className="font-medium text-primary truncate">{competitor.brand_name}</div>
          <div className="text-xs text-muted truncate">{competitor.domain}</div>
        </div>
        <button
          onClick={onUntrack}
          disabled={isUntracking}
          className="p-2 rounded-lg text-muted opacity-0 group-hover:opacity-100 hover:text-red-500 hover:bg-red-500/10 transition-all disabled:opacity-50"
          title="Stop tracking"
        >
          {isUntracking ? (
            <div className="w-4 h-4 border-2 border-muted border-t-transparent rounded-full animate-spin" />
          ) : (
            <X className="w-4 h-4" />
          )}
        </button>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 divide-x divide-border">
        {/* Visibility */}
        <div className="p-4">
          <div className="flex items-center gap-1.5 text-xs text-muted mb-2">
            <Eye className="w-3.5 h-3.5" />
            Visibility
          </div>
          <div className="text-2xl font-semibold text-primary tabular-nums">
            {competitor.visibility}%
          </div>
          <div className="mt-2 h-1.5 bg-secondary rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 rounded-full transition-all"
              style={{ width: `${competitor.visibility}%` }}
            />
          </div>
        </div>
        
        {/* Mentions */}
        <div className="p-4">
          <div className="flex items-center gap-1.5 text-xs text-muted mb-2">
            <MessageSquare className="w-3.5 h-3.5" />
            Mentions
          </div>
          <div className="text-2xl font-semibold text-primary tabular-nums">
            {competitor.mentions}
          </div>
          <div className="text-xs text-muted mt-2">
            across tracked prompts
          </div>
        </div>
      </div>
      
      {/* vs You Comparison */}
      {userData && (
        <div className="p-4 bg-secondary/50 border-t border-border">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted">vs You</span>
            {isTied ? (
              <span className="text-sm text-muted font-medium">Tied</span>
            ) : isWinning ? (
              <span className="flex items-center gap-1.5 text-sm text-green-500 font-medium">
                <TrendingUp className="w-4 h-4" />
                You're ahead by {Math.abs(visibilityDiff)}%
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-sm text-red-500 font-medium">
                <TrendingDown className="w-4 h-4" />
                Behind by {Math.abs(visibilityDiff)}%
              </span>
            )}
          </div>
        </div>
      )}
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
  const [suggested, setSuggested] = useState<SuggestedBrand[]>([])
  const [userData, setUserData] = useState<ApiResponse['user_data'] | null>(null)
  const [planLimits, setPlanLimits] = useState<ApiResponse['plan_limits'] | null>(null)
  const [totalBrands, setTotalBrands] = useState(0)
  const [userRank, setUserRank] = useState<number | null>(null)
  const [trackingBrand, setTrackingBrand] = useState<string | null>(null)
  const [untrackingId, setUntrackingId] = useState<string | null>(null)

  // Fetch data
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
        setTracked(data.tracked || [])
        setSuggested(data.suggested || [])
        setUserData(data.user_data || null)
        setPlanLimits(data.plan_limits || null)
        setTotalBrands(data.total_brands_found || 0)
        setUserRank(data.user_rank || null)
        
      } catch (err) {
        console.error('Error fetching competitors:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchCompetitors()
  }, [currentDashboard?.id])

  // Track a brand
  async function handleTrackBrand(brand: SuggestedBrand | CompetitorData) {
    if (!currentDashboard?.id) return
    if (planLimits && tracked.length >= planLimits.max) return
    
    const brandNameToTrack = 'brand_name' in brand ? brand.brand_name : brand.name
    setTrackingBrand(brandNameToTrack)
    
    try {
      const response = await fetch(`/api/dashboard/${currentDashboard.id}/competitors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile_id: brand.profile_id,
          brand_name: brandNameToTrack,
          domain: brand.domain
        })
      })
      
      if (response.ok) {
        const refreshRes = await fetch(`/api/dashboard/${currentDashboard.id}/competitors?limit=25`)
        if (refreshRes.ok) {
          const data = await refreshRes.json()
          setCompetitors(data.competitors || [])
          setTracked(data.tracked || [])
          setSuggested(data.suggested || [])
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
          setSuggested(data.suggested || [])
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
            <div className="h-16 bg-card rounded-lg w-full"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1,2,3].map(i => (
                <div key={i} className="h-52 bg-card rounded-lg"></div>
              ))}
            </div>
            <div className="h-96 bg-card rounded-lg"></div>
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
          
          {userRank && (
            <>
              <span className="text-muted">•</span>
              <span className="text-sm text-muted">
                Your rank: <span className="text-primary font-medium">#{userRank}</span> of {totalBrands}
              </span>
            </>
          )}
        </div>

        <Link 
          href="/dashboard/competitors/manage"
          className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg text-secondary hover:text-primary hover:bg-secondary transition-colors"
        >
          Manage Competitors
          <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>

      {!hasTrackedOrLeaderboard ? (
        <div className="p-6">
          <div className="card p-12 text-center">
            <AlertCircle className="w-12 h-12 text-muted mx-auto mb-4 opacity-40" />
            <h2 className="text-lg font-semibold text-primary mb-2">No competitor data yet</h2>
            <p className="text-sm text-muted mb-6 max-w-md mx-auto">
              Run prompts to see which brands AI mentions alongside yours, or add competitors manually to start tracking.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link 
                href="/dashboard/prompts"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-accent text-accent-foreground rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors"
              >
                Run Prompts
                <ArrowUpRight className="w-4 h-4" />
              </Link>
              <Link 
                href="/dashboard/competitors/manage"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-secondary rounded-lg text-sm font-medium text-primary hover:bg-hover transition-colors"
              >
                Add Manually
                <Plus className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6 space-y-6">
          
          {/* Your Position Summary */}
          {userData && (
            <div className="card p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
                    <Target className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <div className="text-sm text-muted">Your Position</div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-2xl font-semibold text-primary">
                        #{userRank || '—'}
                      </span>
                      <span className="text-muted">of {totalBrands} brands</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-6 sm:gap-8">
                  <div className="text-center sm:text-right">
                    <div className="text-xs text-muted uppercase tracking-wide">Visibility</div>
                    <div className="text-xl font-semibold text-primary tabular-nums">{userData.visibility}%</div>
                  </div>
                  <div className="text-center sm:text-right">
                    <div className="text-xs text-muted uppercase tracking-wide">Mentions</div>
                    <div className="text-xl font-semibold text-primary tabular-nums">{userData.mentions}</div>
                  </div>
                  <div className="text-center sm:text-right">
                    <div className="text-xs text-muted uppercase tracking-wide">Sentiment</div>
                    <div className={`text-xl font-semibold capitalize ${getSentimentColor(userData.sentiment)}`}>
                      {userData.sentiment}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Tracked Competitors */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-primary">Tracked Competitors</h2>
                <p className="text-xs text-muted mt-0.5">
                  {planLimits ? `${tracked.length} of ${planLimits.max} slots used` : `${tracked.length} tracked`}
                </p>
              </div>
              {canTrackMore && (
                <Link 
                  href="/dashboard/competitors/manage"
                  className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg border border-dashed border-border text-muted hover:text-primary hover:border-muted hover:bg-secondary transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Add Competitor
                  {planLimits && (
                    <span className="text-xs text-muted">({planLimits.max - tracked.length} left)</span>
                  )}
                </Link>
              )}
            </div>

            {tracked.length === 0 ? (
              <div className="card p-8 text-center">
                <Users className="w-10 h-10 text-muted mx-auto mb-3 opacity-40" />
                <p className="text-sm text-muted mb-1">No competitors tracked yet</p>
                <p className="text-xs text-muted mb-4">
                  {hasLeaderboardData 
                    ? "Click + on any brand in the leaderboard to start tracking"
                    : "Add competitors to see how you compare"
                  }
                </p>
                <Link 
                  href="/dashboard/competitors/manage"
                  className="inline-flex items-center gap-2 text-sm text-accent hover:text-accent/80 hover:underline transition-colors"
                >
                  Add your first competitor <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tracked.map((comp) => (
                  <CompetitorCard
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

          {/* All Brands Leaderboard */}
          <div className="card p-0 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div>
                <h3 className="font-semibold text-primary text-sm">All Brands in AI Responses</h3>
                <p className="text-xs text-muted mt-0.5">
                  Every brand mentioned across your tracked prompts, ranked by visibility
                </p>
              </div>
            </div>

            {!hasLeaderboardData ? (
              <div className="p-8 text-center">
                <BarChart3 className="w-10 h-10 text-muted mx-auto mb-3 opacity-40" />
                <p className="text-sm text-muted mb-2">No AI response data yet</p>
                <p className="text-xs text-muted mb-4">Run prompts to discover which brands AI recommends in your space</p>
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
                <div className="max-h-[500px] overflow-y-auto">
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
                                <span className="text-xs bg-accent/20 text-accent px-1.5 py-0.5 rounded font-medium">YOU</span>
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
                              style={{ width: `${comp.visibility}%`, backgroundColor: comp.isUser ? 'var(--accent)' : comp.color }}
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