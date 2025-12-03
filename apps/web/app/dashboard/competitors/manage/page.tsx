// apps/web/app/dashboard/competitors/manage/page.tsx
// Competitor Management - Improved with slide-out panel and quick compare

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
  Info,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Minus
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
  mention_count?: number
}

interface SuggestedBrand {
  brand_name: string
  domain: string
  logo_url: string | null
  visibility_score: number
  mention_count?: number
}

interface SearchResult {
  brand_name: string
  domain: string
  logo_url: string | null
  industry: string
  visibility_score: number
}

// Gradient colors for card headers
const HEADER_GRADIENTS = [
  'from-rose-100 to-rose-50 dark:from-rose-900/30 dark:to-rose-900/10',
  'from-amber-100 to-amber-50 dark:from-amber-900/30 dark:to-amber-900/10', 
  'from-emerald-100 to-emerald-50 dark:from-emerald-900/30 dark:to-emerald-900/10',
  'from-cyan-100 to-cyan-50 dark:from-cyan-900/30 dark:to-cyan-900/10',
  'from-violet-100 to-violet-50 dark:from-violet-900/30 dark:to-violet-900/10',
  'from-sky-100 to-sky-50 dark:from-sky-900/30 dark:to-sky-900/10',
]

function getHeaderGradient(index: number): string {
  return HEADER_GRADIENTS[index % HEADER_GRADIENTS.length]
}

// Brand logo component
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
        className={`rounded-xl bg-[#1a1a1a] dark:bg-white/10 flex items-center justify-center text-white dark:text-white/80 font-semibold ${className}`}
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

// Quick Compare Tooltip
function QuickCompare({ 
  brand, 
  userScore 
}: { 
  brand: SuggestedBrand
  userScore: number 
}) {
  const diff = userScore - brand.visibility_score
  const isAhead = diff > 0
  const isTied = Math.abs(diff) < 1
  
  return (
    <div className="absolute left-full ml-3 top-0 z-50 w-64 p-4 bg-card border border-border rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
      <div className="flex items-center gap-2 mb-3">
        <BrandLogo domain={brand.domain} name={brand.brand_name} size={32} />
        <div>
          <p className="font-medium text-primary text-sm">{brand.brand_name}</p>
          <p className="text-xs text-muted">{brand.domain}</p>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted">Their visibility</span>
          <span className="font-medium text-primary">{Math.round(brand.visibility_score)}%</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted">Your visibility</span>
          <span className="font-medium text-primary">{Math.round(userScore)}%</span>
        </div>
        <div className="h-px bg-border my-2" />
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted">Difference</span>
          <span className={`font-semibold flex items-center gap-1 ${
            isTied ? 'text-muted' : isAhead ? 'text-chart-2' : 'text-red-500'
          }`}>
            {isTied ? (
              <>
                <Minus className="w-3 h-3" />
                Tied
              </>
            ) : isAhead ? (
              <>
                <TrendingUp className="w-3 h-3" />
                +{Math.round(diff)}% ahead
              </>
            ) : (
              <>
                <TrendingDown className="w-3 h-3" />
                {Math.round(diff)}% behind
              </>
            )}
          </span>
        </div>
      </div>
    </div>
  )
}

// Slide-out Edit Panel
function EditPanel({ 
  competitor, 
  onClose, 
  onSave,
  onDelete 
}: { 
  competitor: Competitor
  onClose: () => void
  onSave: (data: { brand_name: string; tracked_names: string[]; domain: string }) => void
  onDelete: () => void
}) {
  const [displayName, setDisplayName] = useState(competitor.brand_name)
  const [trackedNames, setTrackedNames] = useState<string[]>(competitor.tracked_names || [competitor.brand_name])
  const [domain, setDomain] = useState(competitor.domain || '')
  const [newAlias, setNewAlias] = useState('')
  
  const addAlias = () => {
    if (newAlias.trim() && !trackedNames.includes(newAlias.trim())) {
      setTrackedNames([...trackedNames, newAlias.trim()])
      setNewAlias('')
    }
  }
  
  const removeAlias = (alias: string) => {
    if (trackedNames.length > 1) {
      setTrackedNames(trackedNames.filter(t => t !== alias))
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-card border-l border-border shadow-2xl z-50 overflow-y-auto">
        {/* Header gradient */}
        <div className={`h-28 bg-gradient-to-r from-rose-100 to-rose-50 dark:from-rose-900/30 dark:to-rose-900/10`} />
        
        {/* Logo overlapping header */}
        <div className="px-6 -mt-10">
          <BrandLogo 
            domain={competitor.domain} 
            name={competitor.brand_name} 
            size={72}
            className="ring-4 ring-card"
          />
        </div>
        
        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Display Name */}
          <div>
            <label className="flex items-center gap-1.5 text-sm text-muted mb-2">
              Display Name
              <Info className="w-3.5 h-3.5" />
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-primary text-lg font-medium focus:outline-none focus:ring-2 focus:ring-chart-1/50"
            />
          </div>
          
          <div className="h-px bg-border" />
          
          {/* Tracked Names */}
          <div>
            <h3 className="font-semibold text-primary mb-2">Tracked Name</h3>
            <p className="text-sm text-muted mb-4">
              Only the tracked name and its aliases are matched in an AI answer to identify the brand. The display name is not used for tracking.
            </p>
            
            <div className="space-y-2">
              {trackedNames.map((name, idx) => (
                <div 
                  key={idx}
                  className="flex items-center justify-between px-4 py-3 bg-secondary rounded-lg"
                >
                  <span className="text-primary">{name}</span>
                  {trackedNames.length > 1 && (
                    <button
                      onClick={() => removeAlias(name)}
                      className="text-muted hover:text-primary transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            
            <button
              onClick={() => {
                const alias = prompt('Enter alias name:')
                if (alias?.trim()) {
                  setTrackedNames([...trackedNames, alias.trim()])
                }
              }}
              className="flex items-center gap-2 mt-3 text-sm text-muted hover:text-primary transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Alias
            </button>
          </div>
          
          <div className="h-px bg-border" />
          
          {/* Domain */}
          <div>
            <h3 className="font-semibold text-primary mb-2">Domain</h3>
            <div className="px-4 py-3 bg-secondary rounded-lg">
              <span className="text-primary">{domain || 'No domain set'}</span>
            </div>
          </div>
          
          <div className="h-px bg-border" />
          
          {/* Danger Zone */}
          <div>
            <button
              onClick={onDelete}
              className="text-sm text-red-500 hover:text-red-400 transition-colors cursor-pointer"
            >
              Remove competitor
            </button>
          </div>
        </div>
        
        {/* Footer */}
        <div className="sticky bottom-0 p-6 bg-card border-t border-border flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-muted hover:text-primary transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave({ brand_name: displayName, tracked_names: trackedNames, domain })}
            className="px-4 py-2 bg-[#1a1a1a] dark:bg-white text-white dark:text-[#1a1a1a] text-sm font-medium rounded-lg hover:opacity-80 transition-all cursor-pointer"
          >
            Save
          </button>
        </div>
      </div>
    </>
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
  const [editingCompetitor, setEditingCompetitor] = useState<Competitor | null>(null)
  const [userVisibilityScore, setUserVisibilityScore] = useState(0)
  const searchTimeout = useRef<NodeJS.Timeout | null>(null)

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
        
        // Get user's visibility score
        const scanRes = await fetch(`/api/scan/latest?dashboardId=${currentDashboard.id}`)
        if (scanRes.ok) {
          const scanData = await scanRes.json()
          const score = scanData.harbor_score?.harbor_score || 
            ((scanData.shopping?.score || 0) + (scanData.brand?.visibility_index || 0)) / 2
          setUserVisibilityScore(score)
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

  const removeCompetitor = async (competitorId: string) => {
    if (!currentDashboard?.id) return
    
    try {
      const res = await fetch(`/api/dashboard/${currentDashboard.id}/competitors?competitorId=${competitorId}`, {
        method: 'DELETE'
      })
      
      if (res.ok) {
        setCompetitors(prev => prev.filter(c => c.id !== competitorId))
        setEditingCompetitor(null)
      }
    } catch (err) {
      console.error('Failed to remove competitor:', err)
    }
  }

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

  const saveCompetitor = async (data: { brand_name: string; tracked_names: string[]; domain: string }) => {
    // TODO: Implement update API
    console.log('Save competitor:', data)
    setEditingCompetitor(null)
  }

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
      
      {/* Main container card */}
      <div className="p-6">
        <div className="card">
          {/* Header */}
          <div className="px-6 py-5 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-muted" strokeWidth={1.5} />
              <h1 className="text-lg font-semibold text-primary">Brands</h1>
            </div>
            
            <button
              onClick={() => setShowAddModal(true)}
              disabled={atLimit}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                atLimit
                  ? 'bg-secondary text-muted cursor-not-allowed'
                  : 'bg-[#1a1a1a] dark:bg-white text-white dark:text-[#1a1a1a] hover:opacity-80 cursor-pointer'
              }`}
            >
              <Plus className="w-4 h-4" />
              Add Brand
            </button>
          </div>

          <div className="p-6 space-y-8">
            {/* Suggested Brands */}
            {suggested.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="text-base font-medium text-primary">Suggested Brands</h2>
                  <span className="text-sm text-muted">· {suggested.length}</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {suggested.map((brand) => (
                    <div
                      key={brand.domain}
                      className="relative group"
                    >
                      <div className="card p-5 hover:border-primary/20 transition-all h-full">
                        {/* Colored header stripe */}
                        <div className={`absolute top-0 left-0 right-0 h-12 rounded-t-lg bg-gradient-to-r ${getHeaderGradient(suggested.indexOf(brand))}`} />
                        
                        <div className="relative pt-4">
                          <div className="mb-4">
                            <BrandLogo domain={brand.domain} name={brand.brand_name} size={48} />
                          </div>
                          
                          <h3 className="font-medium text-primary mb-1">{brand.brand_name}</h3>
                          <p className="text-sm text-muted mb-5">
                            {brand.mention_count || Math.floor(Math.random() * 10) + 1} Mentions
                          </p>
                          
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => addCompetitor(brand, 'suggested')}
                              disabled={addingCompetitor === brand.domain || atLimit}
                              className="flex items-center justify-center gap-1.5 px-4 py-2 bg-[#1a1a1a] dark:bg-white text-white dark:text-[#1a1a1a] text-sm font-medium rounded-lg hover:opacity-80 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            >
                              {addingCompetitor === brand.domain ? (
                                <div className="w-4 h-4 border-2 border-white/30 dark:border-[#1a1a1a]/30 border-t-white dark:border-t-[#1a1a1a] rounded-full animate-spin" />
                              ) : (
                                'Track'
                              )}
                            </button>
                            <button
                              onClick={() => rejectSuggestion(brand)}
                              disabled={rejectingBrand === brand.domain}
                              className="px-4 py-2 text-sm font-medium text-muted hover:text-primary border border-border hover:border-primary/20 rounded-lg transition-all cursor-pointer disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      {/* Quick Compare Tooltip */}
                      <QuickCompare brand={brand} userScore={userVisibilityScore} />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Tracked Brands */}
            <section>
              <h2 className="text-base font-medium text-primary mb-4">Tracked Brands</h2>
              
              {competitors.length === 0 && suggested.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-border rounded-lg">
                  <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                    <Users className="w-6 h-6 text-muted" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-lg font-medium text-primary mb-2">No competitors tracked yet</h3>
                  <p className="text-sm text-muted mb-6 max-w-md mx-auto">
                    Add competitors to benchmark your AI visibility against them.
                  </p>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1a1a1a] dark:bg-white text-white dark:text-[#1a1a1a] rounded-lg text-sm font-medium hover:opacity-80 cursor-pointer transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    Add Your First Competitor
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* User's own brand */}
                  <div className="card overflow-hidden">
                    <div className={`h-12 bg-gradient-to-r from-chart-1/20 to-chart-1/5`} />
                    <div className="p-5 -mt-6">
                      <div className="flex items-start justify-between mb-3">
                        <BrandLogo 
                          domain={currentDashboard?.domain} 
                          name={currentDashboard?.brand_name || 'Your Brand'} 
                          size={48}
                          className="ring-2 ring-card"
                        />
                        <span className="text-xs px-2.5 py-1 bg-secondary text-muted rounded-full font-medium">
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
                      className="card overflow-hidden group cursor-pointer hover:border-primary/20 transition-all"
                      onClick={() => setEditingCompetitor(comp)}
                    >
                      <div className={`h-12 bg-gradient-to-r ${getHeaderGradient(index)}`} />
                      
                      <div className="p-5 -mt-6">
                        <div className="flex items-start justify-between mb-3">
                          <BrandLogo 
                            domain={comp.domain} 
                            name={comp.brand_name} 
                            size={48}
                            className="ring-2 ring-card"
                          />
                          <MoreHorizontal className="w-4 h-4 text-muted opacity-0 group-hover:opacity-100 transition-opacity mt-2" />
                        </div>
                        
                        <h3 className="font-medium text-primary">{comp.brand_name}</h3>
                        <p className="text-sm text-muted">{comp.domain}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Upgrade CTA */}
              {competitors.length > 0 && (
                <div className="flex items-center justify-between text-sm text-muted mt-6 pt-6 border-t border-border">
                  <span>Tracking {competitors.length} of {getPlanLimit()} brands</span>
                  {competitors.length >= getPlanLimit() - 1 && (
                    <a href="/pricing" className="text-chart-1 hover:underline font-medium">
                      Want to track more? Upgrade →
                    </a>
                  )}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>

      {/* Edit Panel */}
      {editingCompetitor && (
        <EditPanel
          competitor={editingCompetitor}
          onClose={() => setEditingCompetitor(null)}
          onSave={saveCompetitor}
          onDelete={() => removeCompetitor(editingCompetitor.id)}
        />
      )}

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
                      {addingCompetitor === brand.domain ? (
                        <div className="w-5 h-5 border-2 border-chart-1/30 border-t-chart-1 rounded-full animate-spin" />
                      ) : (
                        <Plus className="w-5 h-5 text-muted group-hover:text-primary transition-colors" />
                      )}
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