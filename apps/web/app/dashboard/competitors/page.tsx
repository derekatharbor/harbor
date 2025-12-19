// apps/web/app/dashboard/competitors/page.tsx
// Competitive Intelligence - Always shows data based on category

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
  BarChart3,
  Plus,
  Settings,
  Eye,
  Check,
  ArrowRight,
  Sparkles
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
  domain: string | null
  logo_url: string | null
  mentions: number
  visibility: number
  sentiment: string
  avg_position: number | null
  added_at: string
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

interface ApiResponse {
  tracked: TrackedCompetitor[]
  suggested: SuggestedBrand[]
  user_data: {
    brand_name: string
    category: string | null
    visibility: number
    mentions: number
  }
  category_info: {
    category: string | null
    topics: string[]
  }
  total_brands_in_category: number
  plan_limits: {
    current: number
    max: number
    plan: string
  }
}

// ============================================================================
// HELPERS
// ============================================================================

function getBrandLogo(logoUrl: string | null, domain: string | null, brandName: string): string {
  if (logoUrl && !logoUrl.includes('undefined')) return logoUrl
  if (domain) return `https://cdn.brandfetch.io/${domain}?c=1id1Fyz-h7an5-5KR_y`
  const cleanName = brandName.toLowerCase().replace(/[^a-z0-9]/g, '')
  return `https://cdn.brandfetch.io/${cleanName}.com?c=1id1Fyz-h7an5-5KR_y`
}

function getSentimentColor(sentiment: string): string {
  switch (sentiment) {
    case 'positive': return 'text-green-500'
    case 'negative': return 'text-red-500'
    default: return 'text-muted'
  }
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function CompetitorsPage() {
  const { currentDashboard } = useBrand()
  const [loading, setLoading] = useState(true)
  const [tracked, setTracked] = useState<TrackedCompetitor[]>([])
  const [suggested, setSuggested] = useState<SuggestedBrand[]>([])
  const [userData, setUserData] = useState<ApiResponse['user_data'] | null>(null)
  const [categoryInfo, setCategoryInfo] = useState<ApiResponse['category_info'] | null>(null)
  const [planLimits, setPlanLimits] = useState<ApiResponse['plan_limits'] | null>(null)
  const [totalBrands, setTotalBrands] = useState(0)
  const [trackingBrand, setTrackingBrand] = useState<string | null>(null)

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
        const response = await fetch(`/api/dashboard/${currentDashboard.id}/competitors?limit=20`)
        
        if (!response.ok) throw new Error('Failed to fetch')

        const data: ApiResponse = await response.json()
        
        setTracked(data.tracked || [])
        setSuggested(data.suggested || [])
        setUserData(data.user_data || null)
        setCategoryInfo(data.category_info || null)
        setPlanLimits(data.plan_limits || null)
        setTotalBrands(data.total_brands_in_category || 0)
        
      } catch (err) {
        console.error('Error fetching competitors:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchCompetitors()
  }, [currentDashboard?.id])

  // Track a suggested brand
  async function handleTrackBrand(brand: SuggestedBrand) {
    if (!currentDashboard?.id) return
    if (planLimits && tracked.length >= planLimits.max) return
    
    setTrackingBrand(brand.brand_name)
    
    try {
      const response = await fetch(`/api/dashboard/${currentDashboard.id}/competitors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile_id: brand.profile_id,
          brand_name: brand.brand_name,
          domain: brand.domain
        })
      })
      
      if (response.ok) {
        // Move from suggested to tracked
        const newTracked: TrackedCompetitor = {
          id: crypto.randomUUID(),
          profile_id: brand.profile_id || '',
          brand_name: brand.brand_name,
          domain: brand.domain,
          logo_url: brand.logo_url,
          mentions: brand.mentions,
          visibility: brand.visibility,
          sentiment: brand.sentiment,
          avg_position: null,
          added_at: new Date().toISOString()
        }
        
        setTracked(prev => [...prev, newTracked])
        setSuggested(prev => prev.filter(s => s.brand_name !== brand.brand_name))
        setPlanLimits(prev => prev ? { ...prev, current: prev.current + 1 } : null)
      }
    } catch (err) {
      console.error('Error tracking brand:', err)
    } finally {
      setTrackingBrand(null)
    }
  }

  // Remove tracked brand
  async function handleUntrackBrand(competitor: TrackedCompetitor) {
    if (!currentDashboard?.id) return
    
    try {
      const response = await fetch(
        `/api/dashboard/${currentDashboard.id}/competitors?competitor_id=${competitor.id}`,
        { method: 'DELETE' }
      )
      
      if (response.ok) {
        setTracked(prev => prev.filter(t => t.id !== competitor.id))
        setPlanLimits(prev => prev ? { ...prev, current: prev.current - 1 } : null)
        
        // Add back to suggested
        const asSuggested: SuggestedBrand = {
          rank: 0,
          brand_name: competitor.brand_name,
          domain: competitor.domain || '',
          logo_url: competitor.logo_url || '',
          mentions: competitor.mentions,
          visibility: competitor.visibility,
          sentiment: competitor.sentiment,
          profile_id: competitor.profile_id
        }
        setSuggested(prev => [asSuggested, ...prev].sort((a, b) => b.mentions - a.mentions))
      }
    } catch (err) {
      console.error('Error untracking brand:', err)
    }
  }

  // Loading skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-primary" data-page="competitors">
        <MobileHeader />
        <div className="page-header-bar">
          <div className="animate-pulse h-5 bg-secondary rounded w-48"></div>
          <div className="animate-pulse h-9 bg-secondary rounded w-24"></div>
        </div>
        <div className="p-6 space-y-6">
          {/* Skeleton for tracked section */}
          <div className="card p-5">
            <div className="animate-pulse h-5 bg-secondary rounded w-40 mb-4"></div>
            <div className="grid grid-cols-3 gap-4">
              {[1,2,3].map(i => (
                <div key={i} className="h-32 bg-secondary rounded-lg animate-pulse"></div>
              ))}
            </div>
          </div>
          {/* Skeleton for suggested section */}
          <div className="card p-5">
            <div className="animate-pulse h-5 bg-secondary rounded w-56 mb-4"></div>
            <div className="space-y-3">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="h-14 bg-secondary rounded-lg animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const canTrackMore = planLimits ? tracked.length < planLimits.max : true
  const categoryName = categoryInfo?.category || 'your category'

  return (
    <div className="min-h-screen bg-primary" data-page="competitors">
      <MobileHeader />

      {/* Header Bar */}
      <div className="page-header-bar">
        <div className="flex items-center gap-4">
          <span className="page-title">Competitive Intelligence</span>
        </div>
        <Link 
          href="/dashboard/competitors/manage"
          className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-hover text-primary rounded-lg text-sm font-medium transition-colors"
        >
          <Settings className="w-4 h-4" />
          Manage
        </Link>
      </div>

      {/* Category Context Banner */}
      <div className="mx-6 mt-4 p-4 bg-secondary rounded-lg flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-muted" />
          </div>
          <div>
            <p className="text-sm font-medium text-primary">
              AI visibility in {categoryName}
            </p>
            <p className="text-xs text-muted">
              {totalBrands} brands tracked across {categoryInfo?.topics?.length || 0} topics
            </p>
          </div>
        </div>
        {userData && (
          <div className="text-right">
            <div className="text-lg font-semibold text-primary">{userData.visibility}%</div>
            <p className="text-xs text-muted">Your visibility</p>
          </div>
        )}
      </div>

      <div className="p-6 space-y-6">
        
        {/* TRACKED COMPETITORS */}
        <div className="card p-0 overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-primary flex items-center gap-2">
                <Target className="w-4 h-4" />
                Tracked Competitors
              </h3>
              <p className="text-xs text-muted mt-0.5">
                {planLimits 
                  ? `${tracked.length}/${planLimits.max} slots used`
                  : `${tracked.length} competitors tracked`
                }
              </p>
            </div>
            {!canTrackMore && (
              <Link 
                href="/dashboard/settings"
                className="text-xs text-muted hover:text-primary transition-colors"
              >
                Upgrade for more →
              </Link>
            )}
          </div>
          
          <div className="p-5">
            {tracked.length === 0 ? (
              <div className="text-center py-6 px-4 bg-secondary/50 rounded-lg">
                <p className="text-sm text-muted mb-1">No competitors tracked yet</p>
                <p className="text-xs text-muted">Click + on any brand below to start tracking</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {tracked.map((comp) => (
                  <div 
                    key={comp.id}
                    className="group relative p-4 bg-secondary rounded-lg hover:bg-hover transition-colors"
                  >
                    {/* Remove button */}
                    <button
                      onClick={() => handleUntrackBrand(comp)}
                      className="absolute top-2 right-2 p-1 opacity-0 group-hover:opacity-100 text-muted hover:text-red-500 transition-all"
                      title="Stop tracking"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center overflow-hidden flex-shrink-0">
                        <img 
                          src={getBrandLogo(comp.logo_url, comp.domain, comp.brand_name)}
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
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-primary text-sm truncate">{comp.brand_name}</div>
                        <div className="text-xs text-muted truncate">{comp.domain}</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted">Visibility</span>
                        <span className="font-medium text-primary">{comp.visibility}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-primary rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 rounded-full transition-all"
                          style={{ width: `${comp.visibility}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs pt-1">
                        <span className="text-muted">Mentions</span>
                        <span className="font-medium text-primary">{comp.mentions}</span>
                      </div>
                    </div>
                    
                    {/* Comparison vs You */}
                    {userData && userData.visibility > 0 && (
                      <div className="mt-3 pt-3 border-t border-border">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted">vs You</span>
                          {comp.visibility > userData.visibility ? (
                            <span className="text-red-500 flex items-center gap-1">
                              <TrendingDown className="w-3 h-3" />
                              -{comp.visibility - userData.visibility}%
                            </span>
                          ) : comp.visibility < userData.visibility ? (
                            <span className="text-green-500 flex items-center gap-1">
                              <TrendingUp className="w-3 h-3" />
                              +{userData.visibility - comp.visibility}%
                            </span>
                          ) : (
                            <span className="text-muted">Tied</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                
                {/* Add More Card */}
                {canTrackMore && (
                  <button
                    onClick={() => {
                      const firstSuggested = suggested[0]
                      if (firstSuggested) handleTrackBrand(firstSuggested)
                    }}
                    disabled={suggested.length === 0}
                    className="p-4 border-2 border-dashed border-border rounded-lg hover:border-muted hover:bg-secondary/30 transition-all flex flex-col items-center justify-center text-center min-h-[160px] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-6 h-6 text-muted mb-2" />
                    <span className="text-sm text-muted">Add Competitor</span>
                    {planLimits && (
                      <span className="text-xs text-muted mt-1">{planLimits.max - tracked.length} slots left</span>
                    )}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* SUGGESTED COMPETITORS */}
        <div className="card p-0 overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="font-semibold text-primary flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Top Brands in {categoryName}
            </h3>
            <p className="text-xs text-muted mt-0.5">
              Most mentioned brands in AI responses for your category
            </p>
          </div>
          
          <div className="divide-y divide-border">
            {/* Header Row */}
            <div className="grid grid-cols-12 gap-4 px-5 py-3 text-xs font-medium text-muted uppercase tracking-wide bg-secondary/30">
              <div className="col-span-1">#</div>
              <div className="col-span-5">Brand</div>
              <div className="col-span-2 text-right">Mentions</div>
              <div className="col-span-3 text-right">Visibility</div>
              <div className="col-span-1"></div>
            </div>
            
            {/* Brand Rows */}
            {suggested.map((brand, idx) => {
              const isTracked = tracked.some(t => t.brand_name.toLowerCase() === brand.brand_name.toLowerCase())
              const isTracking = trackingBrand === brand.brand_name
              
              return (
                <div 
                  key={brand.brand_name}
                  className="grid grid-cols-12 gap-4 px-5 py-3 items-center hover:bg-hover transition-colors"
                >
                  <div className="col-span-1 text-sm text-muted tabular-nums font-medium">
                    {idx + 1}
                  </div>
                  <div className="col-span-5 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center overflow-hidden flex-shrink-0">
                      <img 
                        src={getBrandLogo(brand.logo_url, brand.domain, brand.brand_name)}
                        alt=""
                        className="w-full h-full object-contain"
                        onError={(e) => { 
                          e.currentTarget.style.display = 'none'
                          if (e.currentTarget.parentElement) {
                            e.currentTarget.parentElement.innerHTML = `<span class="text-xs font-bold text-muted">${brand.brand_name.charAt(0)}</span>`
                          }
                        }}
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-primary text-sm truncate">{brand.brand_name}</div>
                      <div className="text-xs text-muted truncate">{brand.domain}</div>
                    </div>
                  </div>
                  <div className="col-span-2 text-right">
                    <span className="text-sm font-medium text-primary tabular-nums">{brand.mentions}</span>
                  </div>
                  <div className="col-span-3 text-right flex items-center justify-end gap-2">
                    <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${brand.visibility}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-primary tabular-nums w-10">{brand.visibility}%</span>
                  </div>
                  <div className="col-span-1 text-right">
                    {isTracked ? (
                      <span className="inline-flex items-center gap-1 text-xs text-green-500">
                        <Check className="w-4 h-4" />
                      </span>
                    ) : (
                      <button
                        onClick={() => handleTrackBrand(brand)}
                        disabled={isTracking || !canTrackMore}
                        className="p-1.5 text-muted hover:text-primary hover:bg-secondary rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        title={!canTrackMore ? 'Upgrade to track more' : 'Track competitor'}
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
            
            {suggested.length === 0 && (
              <div className="p-8 text-center">
                <p className="text-sm text-muted">
                  Collecting competitor data... Check back soon.
                </p>
              </div>
            )}
          </div>
          
          {/* View All Link */}
          {suggested.length >= 20 && (
            <div className="px-5 py-3 border-t border-border">
              <Link 
                href="/dashboard/competitors/manage"
                className="text-sm text-muted hover:text-primary flex items-center gap-1 transition-colors"
              >
                View all {totalBrands} brands
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}