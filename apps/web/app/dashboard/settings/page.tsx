// apps/web/app/dashboard/settings/page.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  Settings, 
  Building2, 
  CreditCard, 
  ChevronDown, 
  Check, 
  Loader2, 
  ExternalLink, 
  LifeBuoy,
  Users,
  Plus,
  X,
  Search,
  Trash2
} from 'lucide-react'
import { useBrand } from '@/contexts/BrandContext'
import MobileHeader from '@/components/layout/MobileHeader'

interface Competitor {
  id: string
  brand_name: string
  domain: string | null
  logo_url: string | null
  status: string
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

// Standardized industry list - keep in sync with ai_profiles and onboarding
const INDUSTRIES = [
  'Analytics & Business Intelligence',
  'Consulting & Professional Services',
  'Customer Support',
  'Cybersecurity',
  'Developer Tools',
  'E-commerce & Retail',
  'Education & E-learning',
  'Finance & Accounting',
  'Food & Beverage',
  'Healthcare & Medical',
  'HR & Recruiting',
  'Legal & Compliance',
  'Manufacturing & Logistics',
  'Marketing & Advertising',
  'Media & Entertainment',
  'Nonprofit & Government',
  'Project Management',
  'Real Estate',
  'Sales & CRM',
  'Technology & SaaS',
  'Travel & Hospitality',
]

export default function ControlCenterPage() {
  const { currentDashboard, isLoading: brandLoading, refreshDashboards } = useBrand()
  
  const [brandName, setBrandName] = useState('')
  const [domain, setDomain] = useState('')
  const [industry, setIndustry] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Competitor state
  const [competitors, setCompetitors] = useState<Competitor[]>([])
  const [suggested, setSuggested] = useState<SuggestedBrand[]>([])
  const [loadingCompetitors, setLoadingCompetitors] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [addingCompetitor, setAddingCompetitor] = useState<string | null>(null)
  const searchTimeout = useRef<NodeJS.Timeout | null>(null)

  // Initialize form with current dashboard values
  useEffect(() => {
    if (currentDashboard) {
      setBrandName(currentDashboard.brand_name || '')
      setDomain(currentDashboard.domain || '')
      setIndustry(currentDashboard.metadata?.category || '')
    }
  }, [currentDashboard])

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
        setLoadingCompetitors(false)
      }
    }
    
    fetchCompetitors()
  }, [currentDashboard?.id])

  // Search for brands
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
          // Filter out already tracked competitors
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
  }

  // Reject suggestion
  const rejectSuggestion = async (brand: SuggestedBrand) => {
    if (!currentDashboard?.id) return
    
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
    }
  }

  // Get plan limits
  const getPlanLimit = () => {
    const limits: Record<string, number> = { solo: 5, agency: 10, enterprise: 50 }
    return limits[currentDashboard?.plan || 'solo'] || 5
  }

  // Check if form has changes
  const hasChanges = currentDashboard && (
    brandName !== currentDashboard.brand_name ||
    domain !== currentDashboard.domain ||
    industry !== (currentDashboard.metadata?.category || '')
  )

  const handleSave = async () => {
    if (!currentDashboard || !hasChanges) return
    
    setSaving(true)
    setError(null)
    setSaved(false)

    try {
      const response = await fetch('/api/dashboard/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dashboardId: currentDashboard.id,
          brandName: brandName.trim(),
          domain: domain.trim().toLowerCase(),
          industry,
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save')
      }

      setSaved(true)
      await refreshDashboards()
      
      // Reset saved state after 2s
      setTimeout(() => setSaved(false), 2000)
    } catch (err: any) {
      setError(err.message || 'Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  // Loading state
  if (brandLoading) {
    return (
      <>
        <MobileHeader />
        <div className="max-w-screen-xl mx-auto pt-20 lg:pt-0 px-4 lg:px-0">
          <div className="animate-pulse space-y-8">
            <div className="h-10 w-64 bg-border rounded"></div>
            <div className="bg-card rounded-lg p-6 border border-border h-64"></div>
          </div>
        </div>
      </>
    )
  }

  if (!currentDashboard) {
    return (
      <>
        <MobileHeader />
        <div className="max-w-screen-xl mx-auto pt-20 lg:pt-0 px-4 lg:px-0">
          <p className="text-secondary/60">No dashboard found</p>
        </div>
      </>
    )
  }

  const logoUrl = `https://cdn.brandfetch.io/${currentDashboard.domain}`

  return (
    <>
      <MobileHeader />
      <div className="max-w-screen-xl mx-auto pt-20 lg:pt-0 px-4 lg:px-0">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Settings className="w-6 h-6 lg:w-8 lg:h-8 text-[#22D3EE]" strokeWidth={1.5} />
            <h1 className="text-2xl lg:text-4xl font-heading font-bold text-primary">
              Control Center
            </h1>
          </div>
          <p className="text-sm text-secondary/60">
            Manage your brand settings, plan, and account
          </p>
        </div>

        <div className="grid gap-6 lg:gap-8">
          {/* Brand Settings Card */}
          <div className="bg-card rounded-xl border border-border">
            <div className="p-6 border-b border-border">
              <div className="flex items-center gap-3">
                <Building2 className="w-5 h-5 text-primary" strokeWidth={1.5} />
                <h2 className="text-lg font-heading font-semibold text-primary">
                  Brand Settings
                </h2>
              </div>
            </div>
            
            <div className="p-6">
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Logo Preview */}
                <div className="flex flex-col items-center lg:items-start gap-3">
                  <div className="w-24 h-24 rounded-xl bg-white/5 border border-border overflow-hidden flex items-center justify-center">
                    <img 
                      src={logoUrl}
                      alt={`${brandName} logo`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                        target.parentElement!.innerHTML = `<span class="text-3xl font-bold text-secondary/40">${brandName.charAt(0)}</span>`
                      }}
                    />
                  </div>
                  <p className="text-xs text-secondary/40 text-center lg:text-left">
                    Logo via Brandfetch
                  </p>
                </div>

                {/* Form Fields */}
                <div className="flex-1 space-y-5">
                  {/* Brand Name */}
                  <div>
                    <label className="block text-xs font-medium text-secondary/60 mb-2 uppercase tracking-wider">
                      Brand Name
                    </label>
                    <input
                      type="text"
                      value={brandName}
                      onChange={(e) => setBrandName(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22D3EE] focus:border-transparent text-primary placeholder-secondary/30 font-mono"
                    />
                  </div>

                  {/* Domain */}
                  <div>
                    <label className="block text-xs font-medium text-secondary/60 mb-2 uppercase tracking-wider">
                      Website
                    </label>
                    <input
                      type="text"
                      value={domain}
                      onChange={(e) => setDomain(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22D3EE] focus:border-transparent text-primary placeholder-secondary/30 font-mono"
                    />
                  </div>

                  {/* Industry */}
                  <div>
                    <label className="block text-xs font-medium text-secondary/60 mb-2 uppercase tracking-wider">
                      Industry
                    </label>
                    <div className="relative">
                      <select
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22D3EE] focus:border-transparent text-primary font-mono appearance-none cursor-pointer"
                      >
                        <option value="" className="bg-card text-secondary/50">Select industry</option>
                        {INDUSTRIES.map((ind) => (
                          <option key={ind} value={ind} className="bg-card text-primary">
                            {ind}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary/50 pointer-events-none" />
                    </div>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <p className="text-sm text-red-400">{error}</p>
                    </div>
                  )}

                  {/* Save Button */}
                  <div className="flex items-center gap-4 pt-2">
                    <button
                      onClick={handleSave}
                      disabled={!hasChanges || saving}
                      className={`
                        px-6 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2
                        ${hasChanges && !saving
                          ? 'bg-[#22D3EE] text-[#0B1521] hover:bg-[#22D3EE]/90 cursor-pointer'
                          : 'bg-white/5 text-secondary/40 cursor-not-allowed'
                        }
                      `}
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Saving...
                        </>
                      ) : saved ? (
                        <>
                          <Check className="w-4 h-4" />
                          Saved
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </button>
                    
                    {hasChanges && !saving && (
                      <span className="text-xs text-secondary/40">Unsaved changes</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Plan Card */}
          <div className="bg-card rounded-xl border border-border">
            <div className="p-6 border-b border-border">
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-primary" strokeWidth={1.5} />
                <h2 className="text-lg font-heading font-semibold text-primary">
                  Plan & Billing
                </h2>
              </div>
            </div>
            
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-xl font-bold text-primary capitalize">
                      {currentDashboard.plan}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                      Active
                    </span>
                  </div>
                  <p className="text-sm text-secondary/60">
                    {currentDashboard.plan === 'solo' && '1 brand • 1 scan/week • 25 AI actions/day'}
                    {currentDashboard.plan === 'agency' && '5 brands • 8 scans/month • 100 AI actions/day'}
                    {currentDashboard.plan === 'enterprise' && 'Unlimited brands • Unlimited scans • API access'}
                  </p>
                </div>
                
                {currentDashboard.plan !== 'enterprise' && (
                  <a
                    href="/pricing"
                    className="px-4 py-2 rounded-lg border border-border text-secondary/80 hover:text-primary hover:border-primary/20 transition-colors flex items-center gap-2 text-sm"
                  >
                    Upgrade
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Competitors Card */}
          <div className="bg-card rounded-xl border border-border">
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-primary" strokeWidth={1.5} />
                  <h2 className="text-lg font-heading font-semibold text-primary">
                    Competitors
                  </h2>
                  <span className="text-xs text-muted px-2 py-0.5 bg-secondary rounded-full">
                    {competitors.length}/{getPlanLimit()}
                  </span>
                </div>
                <button
                  onClick={() => setShowAddModal(true)}
                  disabled={competitors.length >= getPlanLimit()}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    competitors.length >= getPlanLimit()
                      ? 'bg-secondary/50 text-muted cursor-not-allowed'
                      : 'bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer'
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {loadingCompetitors ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted" />
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Tracked Competitors */}
                  {competitors.length > 0 ? (
                    <div>
                      <h3 className="text-sm font-medium text-muted mb-3">Tracked Competitors</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {competitors.map((comp) => (
                          <div
                            key={comp.id}
                            className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 border border-border group hover:border-border/80 transition-colors"
                          >
                            <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center overflow-hidden flex-shrink-0">
                              {comp.logo_url ? (
                                <img 
                                  src={comp.logo_url} 
                                  alt={comp.brand_name}
                                  className="w-full h-full object-contain p-1"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement
                                    target.style.display = 'none'
                                    target.parentElement!.innerHTML = `<span class="text-lg font-bold text-gray-400">${comp.brand_name.charAt(0)}</span>`
                                  }}
                                />
                              ) : (
                                <span className="text-lg font-bold text-gray-400">{comp.brand_name.charAt(0)}</span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-primary truncate">{comp.brand_name}</p>
                              {comp.domain && (
                                <p className="text-xs text-muted truncate">{comp.domain}</p>
                              )}
                            </div>
                            <button
                              onClick={() => removeCompetitor(comp.id)}
                              className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/10 text-muted hover:text-red-400 transition-all cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <Users className="w-10 h-10 text-muted mx-auto mb-3" strokeWidth={1} />
                      <p className="text-sm text-muted mb-1">No competitors tracked yet</p>
                      <p className="text-xs text-muted/60">Add competitors to benchmark your AI visibility</p>
                    </div>
                  )}

                  {/* Suggested Competitors */}
                  {suggested.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-muted mb-3">
                        Suggested Competitors
                        <span className="text-xs text-muted/60 ml-2">Based on your industry</span>
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {suggested.slice(0, 6).map((brand) => (
                          <div
                            key={brand.domain}
                            className="flex items-center gap-3 p-3 rounded-lg border border-dashed border-border hover:border-border/80 transition-colors"
                          >
                            <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center overflow-hidden flex-shrink-0">
                              {brand.logo_url ? (
                                <img 
                                  src={brand.logo_url} 
                                  alt={brand.brand_name}
                                  className="w-full h-full object-contain p-1"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement
                                    target.style.display = 'none'
                                    target.parentElement!.innerHTML = `<span class="text-lg font-bold text-gray-400">${brand.brand_name.charAt(0)}</span>`
                                  }}
                                />
                              ) : (
                                <span className="text-lg font-bold text-gray-400">{brand.brand_name.charAt(0)}</span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-primary truncate">{brand.brand_name}</p>
                              <p className="text-xs text-muted truncate">{brand.domain}</p>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => addCompetitor(brand, 'suggested')}
                                disabled={addingCompetitor === brand.domain || competitors.length >= getPlanLimit()}
                                className="px-2.5 py-1 text-xs font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {addingCompetitor === brand.domain ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  'Track'
                                )}
                              </button>
                              <button
                                onClick={() => rejectSuggestion(brand)}
                                className="px-2.5 py-1 text-xs font-medium rounded-md text-muted hover:text-primary hover:bg-secondary transition-colors cursor-pointer"
                              >
                                Reject
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Support Card */}
          <div className="bg-card rounded-xl border border-border">
            <div className="p-6 border-b border-border">
              <div className="flex items-center gap-3">
                <LifeBuoy className="w-5 h-5 text-primary" strokeWidth={1.5} />
                <h2 className="text-lg font-heading font-semibold text-primary">
                  Support
                </h2>
              </div>
            </div>
            
            <div className="p-6">
              <p className="text-sm text-secondary/60 mb-4">
                Questions, feedback, or need help? We're here for you.
              </p>
              <a
                href="mailto:hello@useharbor.io"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#101A31] text-white hover:bg-[#1a2740] transition-colors text-sm font-medium"
              >
                Contact Support
              </a>
            </div>
          </div>
        </div>

        {/* Add Competitor Modal */}
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
                    className="w-full pl-10 pr-4 py-2.5 bg-secondary border border-border rounded-lg text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
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
                        className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors text-left cursor-pointer disabled:opacity-50"
                      >
                        <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center overflow-hidden flex-shrink-0">
                          {brand.logo_url ? (
                            <img 
                              src={brand.logo_url} 
                              alt={brand.brand_name}
                              className="w-full h-full object-contain p-1"
                            />
                          ) : (
                            <span className="text-lg font-bold text-gray-400">{brand.brand_name.charAt(0)}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-primary truncate">{brand.brand_name}</p>
                          <p className="text-xs text-muted truncate">{brand.domain}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {brand.industry && (
                            <span className="text-xs text-muted px-2 py-0.5 bg-secondary rounded hidden md:block">
                              {brand.industry}
                            </span>
                          )}
                          {addingCompetitor === brand.domain ? (
                            <Loader2 className="w-4 h-4 animate-spin text-primary" />
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
                        // Add as custom brand
                        const customDomain = searchQuery.includes('.') ? searchQuery : `${searchQuery.toLowerCase().replace(/\s+/g, '')}.com`
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
      </div>
    </>
  )
}