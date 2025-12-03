// apps/web/app/dashboard/competitors/manage/page.tsx
// Competitor Management - Peec-inspired design, Harbor styling

'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  Users, 
  Plus, 
  X, 
  Search, 
  MoreHorizontal,
  Trash2,
  Check,
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

// Gradient colors for tracked brand card headers (Peec-style)
const HEADER_GRADIENTS = [
  'from-rose-100 to-rose-50',
  'from-amber-100 to-amber-50', 
  'from-emerald-100 to-emerald-50',
  'from-cyan-100 to-cyan-50',
  'from-violet-100 to-violet-50',
  'from-pink-100 to-pink-50',
  'from-sky-100 to-sky-50',
  'from-orange-100 to-orange-50',
]

// Dark mode variants
const HEADER_GRADIENTS_DARK = [
  'dark:from-rose-900/40 dark:to-rose-900/20',
  'dark:from-amber-900/40 dark:to-amber-900/20',
  'dark:from-emerald-900/40 dark:to-emerald-900/20', 
  'dark:from-cyan-900/40 dark:to-cyan-900/20',
  'dark:from-violet-900/40 dark:to-violet-900/20',
  'dark:from-pink-900/40 dark:to-pink-900/20',
  'dark:from-sky-900/40 dark:to-sky-900/20',
  'dark:from-orange-900/40 dark:to-orange-900/20',
]

function getHeaderGradient(index: number): string {
  const light = HEADER_GRADIENTS[index % HEADER_GRADIENTS.length]
  const dark = HEADER_GRADIENTS_DARK[index % HEADER_GRADIENTS_DARK.length]
  return `${light} ${dark}`
}

// Tooltip component (matching Shopping page)
function Tooltip({ content }: { content: string }) {
  const [show, setShow] = useState(false)
  
  return (
    <div className="relative inline-flex">
      <div
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        className="cursor-help"
      >
        <Info className="w-3.5 h-3.5 text-muted" />
      </div>
      {show && (
        <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 z-50 w-64 p-3 text-xs text-secondary bg-primary border border-border rounded-lg shadow-xl">
          {content}
        </div>
      )}
    </div>
  )
}

// Brand logo with Brandfetch fallback
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
        className={`rounded-xl bg-secondary flex items-center justify-center text-muted font-semibold ${className}`}
        style={{ width: size, height: size, fontSize: size * 0.4 }}
      >
        {name?.charAt(0)?.toUpperCase() || '?'}
      </div>
    )
  }
  
  return (
    <div 
      className={`rounded-xl bg-white flex items-center justify-center overflow-hidden shadow-sm ${className}`}
      style={{ width: size, height: size }}
    >
      <img
        src={logoUrl}
        alt={name}
        className="w-full h-full object-contain p-2"
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
    const limits: Record<string, number> = { solo: 5, agency: 10, enterprise: 50 }
    return limits[currentDashboard?.plan || 'solo'] || 5
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

  // Search brands with debounce
  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current)
    
    if (searchQuery.length < 2) {
      setSearchResults([])
      setSearching(false)
      return
    }
    
    setSearching(true)
    
    searchTimeout.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/brands/search?q=${encodeURIComponent(searchQuery)}&limit=10`)
        if (res.ok) {
          const data = await res.json()
          const trackedDomains = new Set(competitors.map(c => c.domain))
          const ownDomain = currentDashboard?.domain
          setSearchResults(
            (data.brands || []).filter((b: SearchResult) => 
              !trackedDomains.has(b.domain) && b.domain !== ownDomain
            )
          )
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
  }, [searchQuery, competitors, currentDashboard?.domain])

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
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-chart-1"></div>
      </div>
    )
  }

  const atLimit = competitors.length >= getPlanLimit()

  return (
    <div className="min-h-screen bg-primary">
      <MobileHeader />
      
      {/* Header */}
      <div className="border-b border-border bg-primary">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-muted" strokeWidth={1.5} />
              <h1 className="text-xl font-semibold text-primary">Brands</h1>
            </div>
            
            <button
              onClick={() => setShowAddModal(true)}
              disabled={atLimit}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                atLimit
                  ? 'bg-secondary text-muted cursor-not-allowed'
                  : 'bg-primary text-primary-foreground hover:opacity-90 cursor-pointer border border-border hover:border-primary/30'
              }`}
            >
              <Plus className="w-4 h-4" />
              Add Brand
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-10">
        {/* Suggested Brands Section */}
        {suggested.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-5">
              <h2 className="text-base font-medium text-primary">Suggested Brands</h2>
              <span className="text-sm text-muted">· {suggested.length}</span>
              <Tooltip content="Brands in your category that frequently appear in AI responses. Track them to benchmark your visibility." />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {suggested.map((brand) => (
                <div
                  key={brand.domain}
                  className="card p-5 hover:border-border/80 transition-all group"
                >
                  <div className="mb-4">
                    <BrandLogo domain={brand.domain} name={brand.brand_name} size={52} />
                  </div>
                  
                  <h3 className="font-medium text-primary mb-1">{brand.brand_name}</h3>
                  <p className="text-sm text-muted mb-5">{brand.domain}</p>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => addCompetitor(brand, 'suggested')}
                      disabled={addingCompetitor === brand.domain || atLimit}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-[#1a1a1a] dark:bg-white text-white dark:text-[#1a1a1a] text-sm font-medium rounded-lg hover:opacity-80 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {addingCompetitor === brand.domain ? (
                        <div className="w-4 h-4 border-2 border-white/30 dark:border-[#1a1a1a]/30 border-t-white dark:border-t-[#1a1a1a] rounded-full animate-spin" />
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          Start Tracking
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => rejectSuggestion(brand)}
                      disabled={rejectingBrand === brand.domain}
                      className="px-3 py-2 text-sm font-medium text-muted hover:text-primary hover:bg-secondary rounded-lg transition-all cursor-pointer disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Tracked Brands Section */}
        <section>
          <div className="flex items-center gap-3 mb-5">
            <h2 className="text-base font-medium text-primary">Tracked Brands</h2>
            <Tooltip content="These competitors are tracked across all your prompts. You'll see how your visibility compares to theirs." />
          </div>
          
          {competitors.length === 0 && suggested.length === 0 ? (
            <div className="card p-12 text-center border-dashed">
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-muted" strokeWidth={1.5} />
              </div>
              <h3 className="text-lg font-medium text-primary mb-2">No competitors tracked yet</h3>
              <p className="text-sm text-muted mb-6 max-w-md mx-auto">
                Add competitors to benchmark your AI visibility against them. Track up to {getPlanLimit()} brands on your plan.
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 cursor-pointer transition-all"
              >
                <Plus className="w-4 h-4" />
                Add Your First Competitor
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* User's own brand card */}
              <div className="card overflow-hidden">
                <div className={`h-14 bg-gradient-to-r from-chart-1/20 to-chart-1/5`} />
                <div className="p-5 -mt-7">
                  <div className="flex items-start justify-between mb-4">
                    <BrandLogo 
                      domain={currentDashboard?.domain} 
                      name={currentDashboard?.brand_name || 'Your Brand'} 
                      size={52}
                      className="ring-2 ring-card"
                    />
                    <span className="text-xs px-2.5 py-1 bg-chart-1/20 text-chart-1 rounded-full font-medium mt-2">
                      Your brand
                    </span>
                  </div>
                  <h3 className="font-medium text-primary">{currentDashboard?.brand_name}</h3>
                  <p className="text-sm text-muted">{currentDashboard?.domain}</p>
                </div>
              </div>

              {/* Competitor cards */}
              {competitors.map((comp, index) => (
                <div 
                  key={comp.id} 
                  className="card overflow-hidden group"
                >
                  <div className={`h-14 bg-gradient-to-r ${getHeaderGradient(index)}`} />
                  
                  <div className="p-5 -mt-7">
                    <div className="flex items-start justify-between mb-4">
                      <BrandLogo 
                        domain={comp.domain} 
                        name={comp.brand_name} 
                        size={52}
                        className="ring-2 ring-card"
                      />
                      
                      {/* 3-dot menu */}
                      <div className="relative mt-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setOpenMenuId(openMenuId === comp.id ? null : comp.id)
                          }}
                          className="p-1.5 rounded-lg hover:bg-secondary/80 text-muted hover:text-primary transition-all cursor-pointer opacity-0 group-hover:opacity-100"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                        
                        {openMenuId === comp.id && (
                          <>
                            <div 
                              className="fixed inset-0 z-40"
                              onClick={() => setOpenMenuId(null)}
                            />
                            <div className="absolute right-0 top-full mt-1 z-50 w-36 bg-card border border-border rounded-lg shadow-xl py-1">
                              <button
                                onClick={() => removeCompetitor(comp.id)}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-secondary transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                Remove
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <h3 className="font-medium text-primary">{comp.brand_name}</h3>
                    <p className="text-sm text-muted mb-3">{comp.domain}</p>
                    
                    {/* Actively Tracking badge */}
                    <div className="flex items-center gap-1.5 text-xs text-chart-2">
                      <Check className="w-3.5 h-3.5" />
                      <span>Actively Tracking</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Upgrade CTA - show when approaching or at limit */}
        {competitors.length > 0 && (
          <div className="flex items-center justify-between text-sm text-muted">
            <span>Tracking {competitors.length} of {getPlanLimit()} brands</span>
            {competitors.length >= getPlanLimit() - 1 && (
              <a href="/pricing" className="text-chart-1 hover:underline font-medium">
                Want to track more? Upgrade →
              </a>
            )}
          </div>
        )}
      </div>

      {/* Add Brand Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => {
              setShowAddModal(false)
              setSearchQuery('')
              setSearchResults([])
            }}
          />
          <div className="relative bg-card border border-border rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-border">
              <div>
                <h3 className="text-lg font-semibold text-primary">Add Competitor</h3>
                <p className="text-sm text-muted mt-0.5">Search from 60,000+ brands</p>
              </div>
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setSearchQuery('')
                  setSearchResults([])
                }}
                className="p-2 rounded-lg hover:bg-secondary text-muted hover:text-primary transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input */}
            <div className="p-5 border-b border-border">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by company name or domain..."
                  className="w-full pl-11 pr-4 py-3 bg-secondary border border-border rounded-lg text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-chart-1/50 focus:border-chart-1/50 transition-all"
                  autoFocus
                />
                {searching && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-muted/30 border-t-muted rounded-full animate-spin" />
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
                      className="w-full flex items-center gap-4 p-3 rounded-lg hover:bg-secondary transition-colors text-left cursor-pointer disabled:opacity-50 group"
                    >
                      <BrandLogo domain={brand.domain} name={brand.brand_name} size={44} />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-primary truncate">{brand.brand_name}</p>
                        <p className="text-sm text-muted truncate">{brand.domain}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        {brand.industry && (
                          <span className="text-xs text-muted px-2 py-1 bg-secondary rounded hidden sm:block">
                            {brand.industry}
                          </span>
                        )}
                        {addingCompetitor === brand.domain ? (
                          <div className="w-5 h-5 border-2 border-chart-1/30 border-t-chart-1 rounded-full animate-spin" />
                        ) : (
                          <Plus className="w-5 h-5 text-muted group-hover:text-primary transition-colors" />
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
                        ? searchQuery.toLowerCase().trim()
                        : `${searchQuery.toLowerCase().replace(/\s+/g, '').trim()}.com`
                      addCompetitor({
                        brand_name: searchQuery.trim(),
                        domain: customDomain,
                        logo_url: null
                      })
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-secondary hover:bg-secondary/80 text-primary transition-colors text-sm cursor-pointer font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    Add "{searchQuery}" manually
                  </button>
                </div>
              ) : searchQuery.length < 2 ? (
                <div className="p-10 text-center">
                  <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                    <Search className="w-5 h-5 text-muted" />
                  </div>
                  <p className="text-sm text-muted">Type at least 2 characters to search</p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}