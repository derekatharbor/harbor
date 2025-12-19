// apps/web/app/dashboard/competitors/page.tsx
// Competitive Intelligence - matches Overview page patterns

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
  Minus,
  Check,
  ArrowUpRight,
  AlertCircle,
  ChevronLeft
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
  const [activeView, setActiveView] = useState<'leaderboard' | 'tracked'>('leaderboard')

  const brandName = currentDashboard?.brand_name || 'Your Brand'

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
        // Refresh data
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
    
    try {
      const response = await fetch(
        `/api/dashboard/${currentDashboard.id}/competitors?competitor_id=${competitor.id}`,
        { method: 'DELETE' }
      )
      
      if (response.ok) {
        // Refresh data
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
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-primary" data-page="competitors">
        <MobileHeader />
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-card rounded-lg w-full"></div>
            <div className="grid grid-cols-5 gap-4">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="h-36 bg-card rounded-lg"></div>
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
          {/* View Toggle */}
          <div className="pill-group">
            <button 
              className={`pill flex items-center gap-1.5 ${activeView === 'leaderboard' ? 'active' : ''}`}
              onClick={() => setActiveView('leaderboard')}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              Leaderboard
            </button>
            <button 
              className={`pill flex items-center gap-1.5 ${activeView === 'tracked' ? 'active' : ''}`}
              onClick={() => setActiveView('tracked')}
            >
              <Target className="w-3.5 h-3.5" />
              Tracked ({tracked.length})
            </button>
          </div>

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
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-secondary hover:text-primary transition-colors"
        >
          Manage
          <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Page Title */}
      <div className="px-6 pt-4 pb-2 flex items-center gap-2">
        <Users className="w-4 h-4 text-muted" />
        <h1 className="text-sm font-medium text-secondary">Competitive Intelligence</h1>
        <span className="text-muted">•</span>
        <span className="text-sm text-muted">{totalBrands} brands found in AI responses</span>
      </div>

      {!hasTrackedOrLeaderboard ? (
        <div className="p-6">
          <div className="card p-12 text-center">
            <AlertCircle className="w-12 h-12 text-muted mx-auto mb-4 opacity-40" />
            <h2 className="text-lg font-semibold text-primary mb-2">No competitor data yet</h2>
            <p className="text-sm text-muted mb-6">
              Run prompts to see which brands AI mentions alongside yours, or add competitors manually.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link 
                href="/dashboard/prompts"
                className="inline-flex items-center gap-2 px-4 py-2 bg-secondary rounded-lg text-sm font-medium text-primary hover:bg-hover transition-colors"
              >
                Go to Prompts
                <ArrowUpRight className="w-4 h-4" />
              </Link>
              <Link 
                href="/dashboard/competitors/manage"
                className="inline-flex items-center gap-2 px-4 py-2 bg-secondary rounded-lg text-sm font-medium text-primary hover:bg-hover transition-colors"
              >
                Add Manually
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6 space-y-6">
          
          {/* Tracked Competitors - Always visible */}
          <div className="card p-0 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div>
                <h3 className="font-semibold text-primary text-sm">Tracked Competitors</h3>
                <p className="text-xs text-muted mt-0.5">
                  {planLimits ? `${tracked.length}/${planLimits.max} slots used` : `${tracked.length} tracked`}
                </p>
              </div>
              <Link href="/dashboard/competitors/manage" className="expand-btn">
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="p-4">
              {tracked.length === 0 ? (
                <div className="text-center py-6 bg-secondary rounded-lg">
                  <p className="text-sm text-muted mb-1">No competitors tracked yet</p>
                  <p className="text-xs text-muted">
                    {hasLeaderboardData 
                      ? "Click + on any brand below to start tracking"
                      : "Use the Manage page to add competitors manually"
                    }
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  {tracked.map((comp) => (
                    <div 
                      key={comp.id}
                      className="group relative p-3 bg-secondary rounded-lg hover:bg-hover transition-colors"
                    >
                      {/* Remove button */}
                      <button
                        onClick={() => handleUntrackBrand(comp)}
                        className="absolute top-2 right-2 p-1 opacity-0 group-hover:opacity-100 text-muted hover:text-red-500 rounded transition-all"
                        title="Stop tracking"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      
                      <div className="flex items-center gap-2 mb-2">
                        <img 
                          src={comp.logo_url}
                          alt=""
                          className="w-8 h-8 rounded"
                          onError={(e) => { 
                            e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(comp.brand_name)}&background=1a1a1a&color=fff&size=64`
                          }}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-primary text-sm truncate">{comp.brand_name}</div>
                          <div className="text-xs text-muted truncate">{comp.domain}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted">Visibility</span>
                        <span className="font-medium text-primary">{comp.visibility}%</span>
                      </div>
                      <div className="w-full h-1 bg-primary/20 rounded-full mt-1 overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${comp.visibility}%` }}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between text-xs mt-2">
                        <span className="text-muted">Mentions</span>
                        <span className="font-medium text-primary">{comp.mentions}</span>
                      </div>

                      {/* vs You */}
                      {userData && (
                        <div className="flex items-center justify-between text-xs mt-2 pt-2 border-t border-border">
                          <span className="text-muted">vs You</span>
                          {comp.visibility > userData.visibility ? (
                            <span className="text-red-500 flex items-center gap-0.5">
                              <TrendingDown className="w-3 h-3" />
                              {comp.visibility - userData.visibility}%
                            </span>
                          ) : comp.visibility < userData.visibility ? (
                            <span className="text-green-500 flex items-center gap-0.5">
                              <TrendingUp className="w-3 h-3" />
                              {userData.visibility - comp.visibility}%
                            </span>
                          ) : (
                            <span className="text-muted">Tied</span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {/* Add More */}
                  {canTrackMore && (
                    <Link
                      href="/dashboard/competitors/manage"
                      className="p-3 border border-dashed border-border rounded-lg hover:border-muted hover:bg-secondary/50 transition-all flex flex-col items-center justify-center text-center min-h-[120px]"
                    >
                      <Plus className="w-5 h-5 text-muted mb-1" />
                      <span className="text-xs text-muted">Add more</span>
                      {planLimits && (
                        <span className="text-xs text-muted mt-0.5">{planLimits.max - tracked.length} left</span>
                      )}
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Full Leaderboard */}
          <div className="card p-0 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div>
                <h3 className="font-semibold text-primary text-sm">All Brands in AI Responses</h3>
                <p className="text-xs text-muted mt-0.5">Ranked by visibility across all prompts</p>
              </div>
            </div>

            {!hasLeaderboardData ? (
              <div className="p-8 text-center">
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
                <div className="grid grid-cols-12 gap-2 px-4 py-2 text-xs text-muted border-b border-border bg-secondary">
                  <div className="col-span-1">#</div>
                  <div className="col-span-5">Brand</div>
                  <div className="col-span-2 text-center">Visibility</div>
                  <div className="col-span-2 text-center">Mentions</div>
                  <div className="col-span-2 text-center">Sentiment</div>
                </div>

                {/* Table Body */}
                <div className="max-h-[500px] overflow-y-auto">
                  {competitors.map((comp, idx) => {
                    const isTracking = trackingBrand === comp.name
                
                return (
                  <div 
                    key={comp.name}
                    className={`grid grid-cols-12 gap-2 px-4 py-3 items-center hover:bg-hover transition-colors ${comp.isUser ? 'bg-secondary/50' : ''}`}
                    style={{ 
                      borderTop: idx > 0 ? '1px solid var(--border)' : 'none'
                    }}
                  >
                    {/* Rank */}
                    <div className="col-span-1 text-sm text-muted tabular-nums">
                      {comp.rank}
                    </div>
                    
                    {/* Brand */}
                    <div className="col-span-5 flex items-center gap-2 min-w-0">
                      <div 
                        className="w-2 h-2 rounded-full flex-shrink-0" 
                        style={{ backgroundColor: comp.color }} 
                      />
                      <img 
                        src={comp.logo}
                        alt=""
                        className="w-6 h-6 rounded flex-shrink-0"
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
                            <span className="text-xs bg-accent/20 text-accent px-1.5 py-0.5 rounded">YOU</span>
                          )}
                          {comp.isTracked && !comp.isUser && (
                            <Check className="w-3 h-3 text-green-500 flex-shrink-0" />
                          )}
                        </div>
                        <span className="text-xs text-muted truncate">{comp.domain}</span>
                      </div>
                    </div>
                    
                    {/* Visibility */}
                    <div className="col-span-2 flex items-center justify-center gap-2">
                      <div className="w-12 h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full"
                          style={{ width: `${comp.visibility}%`, backgroundColor: comp.color }}
                        />
                      </div>
                      <span className="text-sm text-primary tabular-nums w-8">{comp.visibility}%</span>
                    </div>
                    
                    {/* Mentions */}
                    <div className="col-span-2 text-center">
                      <span className="text-sm text-primary tabular-nums">{comp.mentions}</span>
                    </div>
                    
                    {/* Sentiment + Track Button */}
                    <div className="col-span-2 flex items-center justify-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${getSentimentBg(comp.sentiment)} ${getSentimentColor(comp.sentiment)}`}>
                        {comp.sentiment}
                      </span>
                      
                      {!comp.isUser && !comp.isTracked && canTrackMore && (
                        <button
                          onClick={() => handleTrackBrand(comp)}
                          disabled={isTracking}
                          className="p-1 text-muted hover:text-primary hover:bg-secondary rounded transition-all disabled:opacity-50"
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