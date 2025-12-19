// apps/web/app/dashboard/competitors/page.tsx
// Competitive Intelligence - Tracked competitors + discovered brands

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
  Zap,
  Plus,
  Settings,
  Eye,
  X,
  Check
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
  logo_url: string | null
  mentions: number
  visibility: number
  sentiment: string
  avg_position: number | null
  added_at: string
}

interface DiscoveredBrand {
  rank: number
  name: string
  domain: string | null
  logo: string
  visibility: number
  sentiment: string
  position: number | null
  mentions: number
  isUser: boolean
  isTracked: boolean
  profile_id?: string
}

interface ApiResponse {
  tracked: TrackedCompetitor[]
  discovered: DiscoveredBrand[]
  user_data: {
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

// Build Brandfetch logo URL
function getBrandLogo(domain: string | null, fallbackName: string): string {
  if (domain) {
    return `https://cdn.brandfetch.io/${domain}?c=1id1Fyz-h7an5-5KR_y`
  }
  // Fallback: guess domain from name
  const cleanName = fallbackName.toLowerCase().replace(/[^a-z0-9]/g, '')
  return `https://cdn.brandfetch.io/${cleanName}.com?c=1id1Fyz-h7an5-5KR_y`
}

// Sentiment to color
function getSentimentColor(sentiment: string): string {
  switch (sentiment) {
    case 'positive': return 'text-green-500'
    case 'negative': return 'text-red-500'
    default: return 'text-muted'
  }
}

// Sentiment to label
function getSentimentLabel(sentiment: string): string {
  switch (sentiment) {
    case 'positive': return 'Positive'
    case 'negative': return 'Negative'
    default: return 'Neutral'
  }
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function CompetitorsPage() {
  const { currentDashboard } = useBrand()
  const [loading, setLoading] = useState(true)
  const [tracked, setTracked] = useState<TrackedCompetitor[]>([])
  const [discovered, setDiscovered] = useState<DiscoveredBrand[]>([])
  const [userData, setUserData] = useState<ApiResponse['user_data'] | null>(null)
  const [totalBrands, setTotalBrands] = useState(0)
  const [userRank, setUserRank] = useState<number | null>(null)
  const [planLimits, setPlanLimits] = useState<ApiResponse['plan_limits'] | null>(null)
  const [activeView, setActiveView] = useState<'overview' | 'compare' | 'gaps'>('overview')
  const [addingBrand, setAddingBrand] = useState<string | null>(null)

  const brandName = currentDashboard?.brand_name || 'Your Brand'

  useEffect(() => {
    async function fetchCompetitors() {
      if (!currentDashboard?.id) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const response = await fetch(`/api/dashboard/${currentDashboard.id}/competitors?include_tracked=true&limit=25`)
        
        if (!response.ok) throw new Error('Failed to fetch')

        const data: ApiResponse = await response.json()
        
        setTracked(data.tracked || [])
        setDiscovered(data.discovered || [])
        setUserData(data.user_data || null)
        setTotalBrands(data.total_brands_found || 0)
        setUserRank(data.user_rank)
        setPlanLimits(data.plan_limits || null)
        
      } catch (err) {
        console.error('Error fetching competitors:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchCompetitors()
  }, [currentDashboard?.id])

  // Add a discovered brand to tracked
  async function handleTrackBrand(brand: DiscoveredBrand) {
    if (!currentDashboard?.id || !brand.profile_id) return
    
    setAddingBrand(brand.name)
    
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
        // Move from discovered to tracked
        setDiscovered(prev => prev.map(d => 
          d.name === brand.name ? { ...d, isTracked: true } : d
        ))
        
        // Refresh data
        const refreshResponse = await fetch(`/api/dashboard/${currentDashboard.id}/competitors?include_tracked=true&limit=25`)
        if (refreshResponse.ok) {
          const data = await refreshResponse.json()
          setTracked(data.tracked || [])
          setPlanLimits(data.plan_limits || null)
        }
      }
    } catch (err) {
      console.error('Error tracking brand:', err)
    } finally {
      setAddingBrand(null)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-primary" data-page="competitors">
        <MobileHeader />
        <div className="page-header-bar">
          <div className="animate-pulse h-5 bg-secondary rounded w-48"></div>
          <div className="animate-pulse h-9 bg-secondary rounded w-24"></div>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-4 gap-4">
            {[1,2,3,4].map(i => <div key={i} className="card h-20 animate-pulse"></div>)}
          </div>
          <div className="card h-48 animate-pulse"></div>
          <div className="card h-96 animate-pulse"></div>
        </div>
      </div>
    )
  }

  // Check if we have any data at all
  const hasNoData = tracked.length === 0 && discovered.length === 0

  return (
    <div className="min-h-screen bg-primary" data-page="competitors">
      <MobileHeader />

      {/* Header Bar */}
      <div className="page-header-bar">
        <div className="flex items-center gap-4">
          <span className="page-title">Competitive Intelligence</span>
          {!hasNoData && (
            <div className="pill-group">
              {(['overview', 'compare', 'gaps'] as const).map(view => (
                <button
                  key={view}
                  onClick={() => setActiveView(view)}
                  className={`pill capitalize ${activeView === view ? 'active' : ''}`}
                >
                  {view === 'gaps' ? 'Gap Analysis' : view}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          {userRank && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary rounded-lg">
              <Crown className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-medium text-primary">#{userRank}</span>
              <span className="text-xs text-muted">of {totalBrands}</span>
            </div>
          )}
          <Link 
            href="/dashboard/competitors/manage"
            className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] dark:bg-white text-white dark:text-[#1a1a1a] rounded-lg text-sm font-medium hover:opacity-90 transition-all"
          >
            <Plus className="w-4 h-4" />
            Manage
          </Link>
        </div>
      </div>

      {/* Empty State */}
      {hasNoData ? (
        <div className="p-6">
          <div className="card p-12 text-center">
            <Users className="w-12 h-12 text-muted mx-auto mb-4 opacity-40" />
            <h2 className="text-xl font-semibold text-primary mb-2">No Competitor Data Yet</h2>
            <p className="text-sm text-muted mb-6 max-w-md mx-auto">
              Add competitors to track how you compare in AI responses, or run prompts to discover which brands AI mentions alongside yours.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link 
                href="/dashboard/competitors/manage" 
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1a1a1a] dark:bg-white text-white dark:text-[#1a1a1a] rounded-lg text-sm font-medium hover:opacity-90 transition-all"
              >
                <Plus className="w-4 h-4" />
                Add Competitors
              </Link>
              <Link href="/dashboard/prompts" className="btn-secondary inline-flex items-center gap-2">
                <Target className="w-4 h-4" />
                Run Prompts
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Your Stats Banner */}
          <div className="status-banner">
            <div className="status-banner-text flex items-center gap-2">
              <Eye className="w-4 h-4" />
              <span className="font-medium text-primary">{brandName}</span>
              <span className="mx-1">•</span>
              <span>Your visibility: <strong className="text-primary">{userData?.visibility ?? 0}%</strong></span>
              <span className="mx-1">•</span>
              <span>Mentions: <strong className="text-primary">{userData?.mentions ?? 0}</strong></span>
            </div>
            <div className="status-banner-metrics">
              <span>{totalBrands} brands discovered in AI responses</span>
            </div>
          </div>

          {/* Main Content */}
          <div className="p-6 space-y-6">
            
            {/* TRACKED COMPETITORS SECTION */}
            <div className="card p-0 overflow-hidden">
              <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-primary">Tracked Competitors</h3>
                  <p className="text-xs text-muted mt-0.5">
                    {planLimits 
                      ? `${tracked.length}/${planLimits.max} slots used`
                      : `${tracked.length} competitors tracked`
                    }
                  </p>
                </div>
                <Link 
                  href="/dashboard/competitors/manage"
                  className="text-sm text-muted hover:text-primary flex items-center gap-1.5 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  Manage
                </Link>
              </div>
              
              {tracked.length === 0 ? (
                <div className="p-8 text-center">
                  <Users className="w-8 h-8 text-muted mx-auto mb-2 opacity-40" />
                  <p className="text-sm text-muted mb-3">No competitors tracked yet</p>
                  <Link 
                    href="/dashboard/competitors/manage"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary bg-secondary hover:bg-hover rounded-lg transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    Add Competitor
                  </Link>
                </div>
              ) : (
                <div className="p-5">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {tracked.map((comp) => (
                      <div 
                        key={comp.id}
                        className="p-4 bg-secondary rounded-lg hover:bg-hover transition-colors"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center overflow-hidden flex-shrink-0">
                            <img 
                              src={getBrandLogo(comp.domain, comp.brand_name)}
                              alt=""
                              className="w-full h-full object-contain"
                              onError={(e) => { 
                                e.currentTarget.style.display = 'none'
                                if (e.currentTarget.parentElement) {
                                  e.currentTarget.parentElement.innerHTML = `<span class="text-sm font-bold text-primary">${comp.brand_name.charAt(0)}</span>`
                                }
                              }}
                            />
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-primary text-sm truncate">{comp.brand_name}</div>
                            <div className="text-xs text-muted truncate">{comp.domain}</div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted">Visibility</span>
                            <span className="font-medium text-primary">{comp.visibility}%</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-muted">Mentions</span>
                            <span className="font-medium text-primary">{comp.mentions}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-muted">Sentiment</span>
                            <span className={`font-medium ${getSentimentColor(comp.sentiment)}`}>
                              {getSentimentLabel(comp.sentiment)}
                            </span>
                          </div>
                          {comp.avg_position && (
                            <div className="flex justify-between text-xs">
                              <span className="text-muted">Avg Position</span>
                              <span className="font-medium text-primary">#{comp.avg_position.toFixed(1)}</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Comparison vs You */}
                        {userData && (
                          <div className="mt-3 pt-3 border-t border-border">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted">vs You</span>
                              {comp.visibility > userData.visibility ? (
                                <span className="text-red-500 flex items-center gap-1">
                                  <TrendingDown className="w-3 h-3" />
                                  They lead
                                </span>
                              ) : comp.visibility < userData.visibility ? (
                                <span className="text-green-500 flex items-center gap-1">
                                  <TrendingUp className="w-3 h-3" />
                                  You lead
                                </span>
                              ) : (
                                <span className="text-muted flex items-center gap-1">
                                  <Minus className="w-3 h-3" />
                                  Tied
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {/* Add More Card */}
                    {planLimits && tracked.length < planLimits.max && (
                      <Link
                        href="/dashboard/competitors/manage"
                        className="p-4 border-2 border-dashed border-border rounded-lg hover:border-muted transition-colors flex flex-col items-center justify-center text-center min-h-[160px]"
                      >
                        <Plus className="w-6 h-6 text-muted mb-2" />
                        <span className="text-sm text-muted">Add Competitor</span>
                        <span className="text-xs text-muted mt-1">{planLimits.max - tracked.length} slots left</span>
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* DISCOVERED BRANDS SECTION */}
            <div className="card p-0 overflow-hidden">
              <div className="px-5 py-4 border-b border-border">
                <h3 className="font-semibold text-primary">Discovered in AI Responses</h3>
                <p className="text-xs text-muted mt-0.5">
                  Brands mentioned alongside yours — click + to track
                </p>
              </div>
              
              {discovered.length === 0 ? (
                <div className="p-8 text-center">
                  <BarChart3 className="w-8 h-8 text-muted mx-auto mb-2 opacity-40" />
                  <p className="text-sm text-muted mb-1">No brands discovered yet</p>
                  <p className="text-xs text-muted">Run prompts to see which brands AI mentions in your category</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {/* Header Row */}
                  <div className="grid grid-cols-12 gap-4 px-5 py-3 text-xs font-medium text-muted uppercase tracking-wide bg-secondary/50">
                    <div className="col-span-1">#</div>
                    <div className="col-span-4">Brand</div>
                    <div className="col-span-2 text-right">Mentions</div>
                    <div className="col-span-2 text-right">Visibility</div>
                    <div className="col-span-2 text-center">Sentiment</div>
                    <div className="col-span-1"></div>
                  </div>
                  
                  {/* Brand Rows */}
                  {discovered.filter(d => !d.isUser).map((brand, idx) => (
                    <div 
                      key={brand.name}
                      className="grid grid-cols-12 gap-4 px-5 py-3 items-center hover:bg-hover transition-colors"
                    >
                      <div className="col-span-1 text-sm text-muted tabular-nums">
                        {idx + 1}
                      </div>
                      <div className="col-span-4 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center overflow-hidden flex-shrink-0">
                          <img 
                            src={getBrandLogo(brand.domain, brand.name)}
                            alt=""
                            className="w-full h-full object-contain"
                            onError={(e) => { 
                              e.currentTarget.style.display = 'none'
                              if (e.currentTarget.parentElement) {
                                e.currentTarget.parentElement.innerHTML = `<span class="text-xs font-bold text-muted">${brand.name.charAt(0)}</span>`
                              }
                            }}
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-primary text-sm truncate">{brand.name}</div>
                          {brand.domain && (
                            <div className="text-xs text-muted truncate">{brand.domain}</div>
                          )}
                        </div>
                      </div>
                      <div className="col-span-2 text-right">
                        <span className="text-sm font-medium text-primary tabular-nums">{brand.mentions}</span>
                      </div>
                      <div className="col-span-2 text-right">
                        <span className="text-sm font-medium text-primary tabular-nums">{brand.visibility}%</span>
                      </div>
                      <div className="col-span-2 text-center">
                        <span className={`text-sm ${getSentimentColor(brand.sentiment)}`}>
                          {getSentimentLabel(brand.sentiment)}
                        </span>
                      </div>
                      <div className="col-span-1 text-right">
                        {brand.isTracked ? (
                          <span className="inline-flex items-center gap-1 text-xs text-green-500">
                            <Check className="w-3 h-3" />
                          </span>
                        ) : (
                          <button
                            onClick={() => handleTrackBrand(brand)}
                            disabled={addingBrand === brand.name || (planLimits && tracked.length >= planLimits.max)}
                            className="p-1.5 text-muted hover:text-primary hover:bg-secondary rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title={planLimits && tracked.length >= planLimits.max ? 'Upgrade to track more' : 'Track competitor'}
                          >
                            {addingBrand === brand.name ? (
                              <div className="w-4 h-4 border-2 border-muted border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Plus className="w-4 h-4" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

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
        </>
      )}
    </div>
  )
}