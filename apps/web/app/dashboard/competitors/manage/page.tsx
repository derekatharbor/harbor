// apps/web/app/dashboard/competitors/manage/page.tsx
// Competitor Management - Peec-inspired layout

'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  Users, 
  Plus, 
  X, 
  Search, 
  Loader2, 
  MoreHorizontal,
  Trash2,
  Check,
  ExternalLink,
  Info
} from 'lucide-react'
import { useBrand } from '@/contexts/BrandContext'
import MobileHeader from '@/components/layout/MobileHeader'

interface Competitor {
  id: string
  brand_name: string
  domain: string | null
  logo_url: string | null
  status: string
  tracked_names?: string[]
}

interface SuggestedBrand {
  brand_name: string
  domain: string
  logo_url: string | null
  visibility_score: number
}

interface SearchResult {
  brand_name: string
  domain: string
  logo_url: string | null
  industry: string
  visibility_score: number
}

// Gradient colors for tracked brand card headers (like Peec)
const HEADER_COLORS = [
  'from-rose-200/80 to-rose-100/40 dark:from-rose-500/20 dark:to-rose-500/5',
  'from-amber-200/80 to-amber-100/40 dark:from-amber-500/20 dark:to-amber-500/5',
  'from-emerald-200/80 to-emerald-100/40 dark:from-emerald-500/20 dark:to-emerald-500/5',
  'from-cyan-200/80 to-cyan-100/40 dark:from-cyan-500/20 dark:to-cyan-500/5',
  'from-violet-200/80 to-violet-100/40 dark:from-violet-500/20 dark:to-violet-500/5',
  'from-pink-200/80 to-pink-100/40 dark:from-pink-500/20 dark:to-pink-500/5',
  'from-sky-200/80 to-sky-100/40 dark:from-sky-500/20 dark:to-sky-500/5',
  'from-orange-200/80 to-orange-100/40 dark:from-orange-500/20 dark:to-orange-500/5',
]

function getHeaderColor(index: number): string {
  return HEADER_COLORS[index % HEADER_COLORS.length]
}

// Brand logo component with fallback
function BrandLogo({ 
  domain, 
  name, 
  size = 48,
  className = ''
}: { 
  domain?: string | null
  name: string
  size?: number
  className?: string
}) {
  const [error, setError] = useState(false)
  const logoUrl = domain ? `https://cdn.brandfetch.io/${domain}?c=1id1Fyz-h7an5-5KR_y` : null
  
  if (error || !logoUrl) {
    return (
      <div 
        className={`rounded-xl bg-secondary flex items-center justify-center text-primary font-bold ${className}`}
        style={{ width: size, height: size, fontSize: size * 0.4 }}
      >
        {name.charAt(0).toUpperCase()}
      </div>
    )
  }
  
  return (
    <div className={`rounded-xl overflow-hidden bg-white ${className}`} style={{ width: size, height: size }}>
      <img
        src={logoUrl}
        alt={name}
        className="w-full h-full object-contain p-1.5"
        onError={() => setError(true)}
      />
    </div>
  )
}

export default function CompetitorManagePage() {
  const { currentDashboard, isLoading: brandLoading } = useBrand()
  
  const [competitors, setCompetitors] = useState<Competitor[]>([])
  const [suggested, setSuggested] = useState<SuggestedBrand[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [addingCompetitor, setAddingCompetitor] = useState<string | null>(null)
  const [rejectingBrand, setRejectingBrand] = useState<string | null>(null)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const searchTimeout = useRef<NodeJS.Timeout | null>(null)

  // Plan limits
  const getPlanLimit = () => {
    const limits: Record<string, number> = { free: 3, solo: 5, agency: 10, enterprise: 50 }
    return limits[currentDashboard?.plan || 'free'] || 3
  }

  // Fetch competitors
  useEffect(() => {
    if (!currentDashboard?.id) return
    
    const fetchCompetitors = async () => {
      try {
        const res = await fetch(`/api/dashboard/${currentDashboard.id}/competitors`)
        if (res.ok) {
          const data = await res.json()
          setCompetitors(data.competitors || [])
          setSuggested(data.suggested || [])
        }
      } catch (err) {
        console.error('Failed to fetch competitors:', err)
      } finally {
        setLoading(false)
      }
    }
    
    fetchCompetitors()
  }, [currentDashboard?.id])

  // Search brands
  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current)
    
    if (searchQuery.length < 2) {
      setSearchResults([])
      return
    }
    
    searchTimeout.current = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await fetch(`/api/brands/search?q=${encodeURIComponent(searchQuery)}&limit=8`)
        if (res.ok) {
          const data = await res.json()
          const trackedDomains = new Set(competitors.map(c => c.domain))
          setSearchResults((data.brands || []).filter((b: SearchResult) => !trackedDomains.has(b.domain)))
        }
      } catch (err) {
        console.error('Search failed:', err)
      } finally {
        setSearching(false)
      }
    }, 300)
    
    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current)
    }
  }, [searchQuery, competitors])

  // Add competitor
  const addCompetitor = async (brand: { brand_name: string; domain: string; logo_url?: string | null }, source = 'manual') => {
    if (!currentDashboard?.id) return
    setAddingCompetitor(brand.domain)
    
    try {
      const res = await fetch(`/api/dashboard/${currentDashboard.id}/competitors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand_name: brand.brand_name,
          domain: brand.domain,
          logo_url: brand.logo_url,
          source
        })
      })
      
      if (res.ok) {
        const data = await res.json()
        setCompetitors(prev => [...prev, data.competitor])
        setSuggested(prev => prev.filter(s => s.domain !== brand.domain))
        setSearchQuery('')
        setSearchResults([])
        setShowAddModal(false)
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to add competitor')
      }
    } catch (err) {
      console.error('Failed to add competitor:', err)
    } finally {
      setAddingCompetitor(null)
    }
  }

  // Remove competitor
  const removeCompetitor = async (competitorId: string) => {
    if (!currentDashboard?.id) return
    
    try {
      const res = await fetch(`/api/dashboard/${currentDashboard.id}/competitors?competitorId=${competitorId}`, {
        method: 'DELETE'
      })
      
      if (res.ok) {
        setCompetitors(prev => prev.filter(c => c.id !== competitorId))
      }
    } catch (err) {
      console.error('Failed to remove competitor:', err)
    }
    setOpenMenuId(null)
  }

  // Reject suggestion
  const rejectSuggestion = async (brand: SuggestedBrand) => {
    if (!currentDashboard?.id) return
    setRejectingBrand(brand.domain)
    
    try {
      await fetch(`/api/dashboard/${currentDashboard.id}/competitors`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domain: brand.domain,
          brand_name: brand.brand_name,
          action: 'reject'
        })
      })
      
      setSuggested(prev => prev.filter(s => s.domain !== brand.domain))
    } catch (err) {
      console.error('Failed to reject suggestion:', err)
    } finally {
      setRejectingBrand(null)
    }
  }

  // Loading state
  if (loading || brandLoading) {
    return (
      <>
        <MobileHeader />
        <div className="max-w-screen-xl mx-auto pt-20 lg:pt-0 px-4 lg:px-0">
          <div className="animate-pulse space-y-8">
            <div className="h-10 w-48 bg-secondary rounded-lg" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1,2,3,4].map(i => (
                <div key={i} className="h-40 bg-secondary rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </>
    )
  }

  const atLimit = competitors.length >= getPlanLimit()

  return (
    <>
      <MobileHeader />
      <div className="max-w-screen-xl mx-auto pt-20 lg:pt-0 px-4 lg:px-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 lg:w-8 lg:h-8 text-[#A855F7]" strokeWidth={1.5} />
            <h1 className="text-2xl lg:text-3xl font-heading font-bold text-primary">
              Brands
            </h1>
            <span className="text-sm text-muted px-2 py-0.5 bg-secondary rounded-full">
              {competitors.length}/{getPlanLimit()}
            </span>
          </div>
          
          <button
            onClick={() => setShowAddModal(true)}
            disabled={atLimit}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              atLimit
                ? 'bg-secondary text-muted cursor-not-allowed'
                : 'bg-primary text-primary-foreground hover:opacity-90 cursor-pointer'
            }`}
          >
            <Plus className="w-4 h-4" />
            Add Brand
          </button>
        </div>

        {/* Suggested Brands */}
        {suggested.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-lg font-semibold text-primary">Suggested Brands</h2>
              <span className="text-sm text-muted">· {suggested.length}</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {suggested.map((brand) => (
                <div
                  key={brand.domain}
                  className="bg-card border border-border rounded-xl p-4 hover:border-border/80 transition-colors"
                >
                  {/* Logo */}
                  <div className="mb-3">
                    <BrandLogo domain={brand.domain} name={brand.brand_name} size={48} />
                  </div>
                  
                  {/* Name & Mentions */}
                  <h3 className="font-semibold text-primary mb-0.5">{brand.brand_name}</h3>
                  <p className="text-sm text-muted mb-4">
                    {Math.round(brand.visibility_score)}% visibility
                  </p>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => addCompetitor(brand, 'suggested')}
                      disabled={addingCompetitor === brand.domain || atLimit}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {addingCompetitor === brand.domain ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        'Track'
                      )}
                    </button>
                    <button
                      onClick={() => rejectSuggestion(brand)}
                      disabled={rejectingBrand === brand.domain}
                      className="px-3 py-1.5 text-sm font-medium text-muted hover:text-primary hover:bg-secondary rounded-lg transition-all cursor-pointer disabled:opacity-50"
                    >
                      {rejectingBrand === brand.domain ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        'Reject'
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Tracked Brands */}
        <section>
          <h2 className="text-lg font-semibold text-primary mb-4">Tracked Brands</h2>
          
          {competitors.length === 0 ? (
            <div className="bg-card border border-dashed border-border rounded-xl p-12 text-center">
              <Users className="w-12 h-12 text-muted mx-auto mb-4" strokeWidth={1} />
              <h3 className="text-lg font-semibold text-primary mb-2">No competitors tracked yet</h3>
              <p className="text-sm text-muted mb-6 max-w-md mx-auto">
                Add competitors to benchmark your AI visibility against them. We'll track how you compare across all prompts.
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Add Your First Competitor
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* User's own brand card */}
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className={`h-16 bg-gradient-to-r from-[#A855F7]/30 to-[#A855F7]/10`} />
                <div className="p-4 -mt-6">
                  <div className="flex items-start justify-between mb-3">
                    <BrandLogo 
                      domain={currentDashboard?.domain} 
                      name={currentDashboard?.brand_name || 'You'} 
                      size={48}
                      className="border-2 border-card"
                    />
                    <span className="text-xs px-2 py-0.5 bg-[#A855F7]/20 text-[#A855F7] rounded-full font-medium">
                      Your brand
                    </span>
                  </div>
                  <h3 className="font-semibold text-primary">{currentDashboard?.brand_name}</h3>
                  <p className="text-sm text-muted">{currentDashboard?.domain}</p>
                </div>
              </div>

              {/* Competitor cards */}
              {competitors.map((comp, index) => (
                <div 
                  key={comp.id} 
                  className="bg-card border border-border rounded-xl overflow-hidden group"
                >
                  {/* Colored header bar */}
                  <div className={`h-16 bg-gradient-to-r ${getHeaderColor(index)}`} />
                  
                  <div className="p-4 -mt-6">
                    <div className="flex items-start justify-between mb-3">
                      <BrandLogo 
                        domain={comp.domain} 
                        name={comp.brand_name} 
                        size={48}
                        className="border-2 border-card"
                      />
                      
                      {/* Overflow menu */}
                      <div className="relative">
                        <button
                          onClick={() => setOpenMenuId(openMenuId === comp.id ? null : comp.id)}
                          className="p-1.5 rounded-lg hover:bg-secondary text-muted hover:text-primary transition-all cursor-pointer opacity-0 group-hover:opacity-100"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                        
                        {openMenuId === comp.id && (
                          <>
                            <div 
                              className="fixed inset-0 z-40"
                              onClick={() => setOpenMenuId(null)}
                            />
                            <div className="absolute right-0 top-full mt-1 z-50 w-40 bg-card border border-border rounded-lg shadow-xl py-1">
                              <button
                                onClick={() => removeCompetitor(comp.id)}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-secondary transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                                Remove
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <h3 className="font-semibold text-primary">{comp.brand_name}</h3>
                    <p className="text-sm text-muted">{comp.domain}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Plan limit notice */}
        {atLimit && (
          <div className="mt-8 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-primary font-medium">Competitor limit reached</p>
              <p className="text-sm text-muted mt-1">
                You're tracking {competitors.length} of {getPlanLimit()} competitors on your {currentDashboard?.plan || 'free'} plan.{' '}
                <a href="/pricing" className="text-[#A855F7] hover:underline">Upgrade</a> to track more.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Add Brand Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              setShowAddModal(false)
              setSearchQuery('')
              setSearchResults([])
            }}
          />
          <div className="relative bg-card border border-border rounded-xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="text-lg font-semibold text-primary">Add Competitor</h3>
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setSearchQuery('')
                  setSearchResults([])
                }}
                className="p-1.5 rounded-lg hover:bg-secondary text-muted hover:text-primary transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input */}
            <div className="p-4 border-b border-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by company name or domain..."
                  className="w-full pl-10 pr-4 py-2.5 bg-secondary border border-border rounded-lg text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-[#A855F7]/50 focus:border-transparent"
                  autoFocus
                />
                {searching && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted" />
                )}
              </div>
            </div>

            {/* Search Results */}
            <div className="max-h-80 overflow-y-auto">
              {searchResults.length > 0 ? (
                <div className="p-2">
                  {searchResults.map((brand) => (
                    <button
                      key={brand.domain}
                      onClick={() => addCompetitor(brand)}
                      disabled={addingCompetitor === brand.domain}
                      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-secondary transition-colors text-left cursor-pointer disabled:opacity-50"
                    >
                      <BrandLogo domain={brand.domain} name={brand.brand_name} size={40} />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-primary truncate">{brand.brand_name}</p>
                        <p className="text-sm text-muted truncate">{brand.domain}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {brand.industry && (
                          <span className="text-xs text-muted px-2 py-0.5 bg-secondary rounded hidden md:block">
                            {brand.industry}
                          </span>
                        )}
                        {addingCompetitor === brand.domain ? (
                          <Loader2 className="w-4 h-4 animate-spin text-[#A855F7]" />
                        ) : (
                          <Plus className="w-4 h-4 text-muted" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              ) : searchQuery.length >= 2 && !searching ? (
                <div className="p-8 text-center">
                  <p className="text-sm text-muted mb-4">No brands found for "{searchQuery}"</p>
                  <button
                    onClick={() => {
                      const customDomain = searchQuery.includes('.') 
                        ? searchQuery.toLowerCase()
                        : `${searchQuery.toLowerCase().replace(/\s+/g, '')}.com`
                      addCompetitor({
                        brand_name: searchQuery,
                        domain: customDomain,
                        logo_url: null
                      })
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-primary hover:bg-secondary/80 transition-colors text-sm cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Add "{searchQuery}" as custom competitor
                  </button>
                </div>
              ) : searchQuery.length < 2 ? (
                <div className="p-8 text-center">
                  <Search className="w-10 h-10 text-muted/50 mx-auto mb-3" />
                  <p className="text-sm text-muted">Search from 60,000+ brands</p>
                  <p className="text-xs text-muted/60 mt-1">Or enter a custom company name</p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
