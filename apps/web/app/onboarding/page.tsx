// app/onboarding/page.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, ArrowLeft, ChevronDown, Check, Loader2, Search, X, Users } from 'lucide-react'

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

const COMPETITOR_LIMITS = {
  solo: 3,
  agency: 10,
  enterprise: 999
}

interface Competitor {
  id: string
  brand_name: string
  domain: string
  logo_url: string
}

interface Prompt {
  id: string
  prompt_text: string
  topic: string
  intent?: string
}

export default function OnboardingPage() {
  const searchParams = useSearchParams()
  const brandFromUrl = searchParams.get('brand') || ''
  
  const [step, setStep] = useState(1)
  const [plan] = useState<'solo' | 'agency' | 'enterprise'>('solo') // Default for new users
  
  // Step 1: Brand info
  const [brandName, setBrandName] = useState(brandFromUrl)
  const [domain, setDomain] = useState('')
  const [industry, setIndustry] = useState('')
  
  // Step 2: Competitors
  const [competitorSearch, setCompetitorSearch] = useState('')
  const [competitorResults, setCompetitorResults] = useState<Competitor[]>([])
  const [selectedCompetitors, setSelectedCompetitors] = useState<Competitor[]>([])
  const [searchingCompetitors, setSearchingCompetitors] = useState(false)
  const [showCompetitorDropdown, setShowCompetitorDropdown] = useState(false)
  const competitorInputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  // Step 3: Prompts
  const [availablePrompts, setAvailablePrompts] = useState<Prompt[]>([])
  const [selectedPrompts, setSelectedPrompts] = useState<Set<string>>(new Set<string>())
  const [loadingPrompts, setLoadingPrompts] = useState(false)
  const [promptSearch, setPromptSearch] = useState('')
  
  // General state
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [checking, setChecking] = useState(true)

  const router = useRouter()
  const supabase = createClientComponentClient()
  
  const competitorLimit = COMPETITOR_LIMITS[plan]

  // Check auth
  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/auth/login')
        return
      }
      setChecking(false)
    }
    checkAuth()
  }, [supabase, router])

  // Search competitors
  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (competitorSearch.length < 2) {
        setCompetitorResults([])
        setShowCompetitorDropdown(false)
        return
      }

      setSearchingCompetitors(true)
      try {
        const cleanDomain = domain.trim().toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/.*$/, '')
        const response = await fetch(`/api/brands/search?q=${encodeURIComponent(competitorSearch)}&exclude=${cleanDomain}`)
        if (response.ok) {
          const data = await response.json()
          // Filter out already selected competitors
          const selectedIds = new Set(selectedCompetitors.map(c => c.id))
          const filtered = (data || []).filter((b: Competitor) => !selectedIds.has(b.id))
          setCompetitorResults(filtered)
          setShowCompetitorDropdown(filtered.length > 0)
        }
      } catch (err) {
        console.error('Competitor search error:', err)
      } finally {
        setSearchingCompetitors(false)
      }
    }, 300)

    return () => clearTimeout(searchTimeout)
  }, [competitorSearch, domain, selectedCompetitors])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          competitorInputRef.current && !competitorInputRef.current.contains(event.target as Node)) {
        setShowCompetitorDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Fetch prompts when moving to step 3
  useEffect(() => {
    async function fetchPrompts() {
      if (step !== 3 || !industry) return
      
      setLoadingPrompts(true)
      try {
        const response = await fetch(`/api/prompts/by-industry?industry=${encodeURIComponent(industry)}`)
        if (response.ok) {
          const data = await response.json()
          setAvailablePrompts(data.prompts || [])
          const initialSelection = new Set<string>(
            data.prompts.slice(0, 8).map((p: Prompt) => p.id)
          )
          setSelectedPrompts(initialSelection)
        }
      } catch (err) {
        console.error('Error fetching prompts:', err)
      } finally {
        setLoadingPrompts(false)
      }
    }
    fetchPrompts()
  }, [step, industry])

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!brandName.trim() || !domain.trim() || !industry) return
    setStep(2)
  }

  const addCompetitor = (competitor: Competitor) => {
    if (selectedCompetitors.length >= competitorLimit) return
    setSelectedCompetitors([...selectedCompetitors, competitor])
    setCompetitorSearch('')
    setCompetitorResults([])
    setShowCompetitorDropdown(false)
  }

  const removeCompetitor = (id: string) => {
    setSelectedCompetitors(selectedCompetitors.filter(c => c.id !== id))
  }

  const togglePrompt = (promptId: string) => {
    const newSelected = new Set<string>(selectedPrompts)
    if (newSelected.has(promptId)) {
      newSelected.delete(promptId)
    } else {
      newSelected.add(promptId)
    }
    setSelectedPrompts(newSelected)
  }

  const selectAllPrompts = () => {
    setSelectedPrompts(new Set<string>(filteredPrompts.map(p => p.id)))
  }

  const deselectAllPrompts = () => {
    setSelectedPrompts(new Set<string>())
  }

  const handleFinalSubmit = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/onboarding/create-dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandName: brandName.trim(),
          domain: domain.trim(),
          industry: industry,
          selectedPromptIds: Array.from(selectedPrompts),
          competitorProfileIds: selectedCompetitors.map(c => c.id)
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create dashboard')
      }

      router.push('/dashboard')
      router.refresh()
      
    } catch (err: any) {
      console.error('Onboarding error:', err)
      setError(err.message || 'Failed to create dashboard')
    } finally {
      setLoading(false)
    }
  }

  const filteredPrompts = promptSearch
    ? availablePrompts.filter(p => 
        p.prompt_text.toLowerCase().includes(promptSearch.toLowerCase())
      )
    : availablePrompts

  if (checking) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-white/50 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      {/* Nav */}
      <nav className="p-6 flex items-center justify-between">
        <Link href="/" className="inline-block">
          <Image
            src="/images/harbor-logo-white.svg"
            alt="Harbor"
            width={100}
            height={28}
            className="h-7 w-auto"
          />
        </Link>
        
        {/* Step indicator - 3 steps now */}
        <div className="flex items-center gap-2">
          <div className={`w-8 h-1 rounded-full ${step >= 1 ? 'bg-emerald-500' : 'bg-white/20'}`} />
          <div className={`w-8 h-1 rounded-full ${step >= 2 ? 'bg-emerald-500' : 'bg-white/20'}`} />
          <div className={`w-8 h-1 rounded-full ${step >= 3 ? 'bg-emerald-500' : 'bg-white/20'}`} />
        </div>
      </nav>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-6 pb-12">
        
        {/* Step 1: Brand Info */}
        {step === 1 && (
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-white mb-2">Tell us about your brand</h1>
              <p className="text-white/50 text-sm">We'll start tracking how AI sees you</p>
            </div>

            <form onSubmit={handleStep1Submit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              <div>
                <label htmlFor="brandName" className="block text-xs font-medium text-white/50 mb-2 uppercase tracking-wide">
                  Brand Name
                </label>
                <input
                  id="brandName"
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  required
                  autoFocus
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent text-white placeholder-white/30 text-sm"
                  placeholder="Acme Inc"
                />
              </div>

              <div>
                <label htmlFor="domain" className="block text-xs font-medium text-white/50 mb-2 uppercase tracking-wide">
                  Website
                </label>
                <input
                  id="domain"
                  type="text"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent text-white placeholder-white/30 text-sm"
                  placeholder="acme.com"
                />
              </div>

              <div>
                <label htmlFor="industry" className="block text-xs font-medium text-white/50 mb-2 uppercase tracking-wide">
                  Industry
                </label>
                <div className="relative">
                  <select
                    id="industry"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent text-white text-sm appearance-none cursor-pointer"
                  >
                    <option value="" className="bg-[#0a0a0a] text-white/50">Select your industry</option>
                    {INDUSTRIES.map((ind) => (
                      <option key={ind} value={ind} className="bg-[#0a0a0a] text-white">
                        {ind}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 pointer-events-none" />
                </div>
              </div>

              <button
                type="submit"
                disabled={!brandName.trim() || !domain.trim() || !industry}
                className="w-full py-3 px-4 bg-white text-black rounded-lg font-medium hover:bg-white/90 disabled:opacity-50 transition-all flex items-center justify-center gap-2 text-sm mt-6"
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* Step 2: Competitors */}
        {step === 2 && (
          <div className="w-full max-w-lg">
            <div className="text-center mb-8">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-white/60" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Who are your competitors?</h1>
              <p className="text-white/50 text-sm">
                We'll track their visibility alongside yours so you can see where you stand
              </p>
            </div>

            {/* Search input */}
            <div className="relative mb-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                ref={competitorInputRef}
                type="text"
                value={competitorSearch}
                onChange={(e) => setCompetitorSearch(e.target.value)}
                placeholder="Search for a brand..."
                disabled={selectedCompetitors.length >= competitorLimit}
                className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/20 text-white placeholder-white/30 text-sm disabled:opacity-50"
              />
              {searchingCompetitors && (
                <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 animate-spin" />
              )}
              
              {/* Dropdown results */}
              {showCompetitorDropdown && (
                <div 
                  ref={dropdownRef}
                  className="absolute top-full left-0 right-0 mt-2 bg-[#141414] border border-white/10 rounded-lg overflow-hidden z-10 shadow-xl"
                >
                  {competitorResults.map((brand) => (
                    <button
                      key={brand.id}
                      onClick={() => addCompetitor(brand)}
                      className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/5 transition-colors text-left"
                    >
                      <img 
                        src={brand.logo_url || `https://cdn.brandfetch.io/${brand.domain}?c=1id1Fyz-h7an5-5KR_y`}
                        alt={brand.brand_name}
                        className="w-8 h-8 rounded bg-white/10 object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(brand.brand_name)}&background=1a1a1a&color=fff&size=32`
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-white truncate">{brand.brand_name}</div>
                        <div className="text-xs text-white/40 truncate">{brand.domain}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Selected count */}
            <div className="text-sm text-white/50 mb-4">
              {selectedCompetitors.length} of {competitorLimit} competitors
              {plan === 'solo' && selectedCompetitors.length >= competitorLimit && (
                <span className="text-white/30 ml-2">· Upgrade for more</span>
              )}
            </div>

            {/* Selected competitors pills */}
            {selectedCompetitors.length > 0 ? (
              <div className="space-y-2 mb-6">
                {selectedCompetitors.map((competitor) => (
                  <div
                    key={competitor.id}
                    className="flex items-center gap-3 px-4 py-3 bg-white/5 border border-white/10 rounded-lg"
                  >
                    <img 
                      src={competitor.logo_url || `https://cdn.brandfetch.io/${competitor.domain}?c=1id1Fyz-h7an5-5KR_y`}
                      alt={competitor.brand_name}
                      className="w-8 h-8 rounded bg-white/10 object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(competitor.brand_name)}&background=1a1a1a&color=fff&size=32`
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white truncate">{competitor.brand_name}</div>
                      <div className="text-xs text-white/40 truncate">{competitor.domain}</div>
                    </div>
                    <button
                      onClick={() => removeCompetitor(competitor.id)}
                      className="p-1 hover:bg-white/10 rounded transition-colors"
                    >
                      <X className="w-4 h-4 text-white/40 hover:text-white" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 mb-6 border border-dashed border-white/10 rounded-lg">
                <p className="text-white/30 text-sm">Search to add competitors</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-3 text-white/60 hover:text-white transition-colors flex items-center gap-2 text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              
              <button
                onClick={() => setStep(3)}
                className="flex-1 py-3 px-4 bg-white text-black rounded-lg font-medium hover:bg-white/90 transition-all flex items-center justify-center gap-2 text-sm"
              >
                {selectedCompetitors.length === 0 ? 'Skip for now' : 'Continue'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <p className="text-center text-xs text-white/30 mt-4">
              You can always add competitors later
            </p>
          </div>
        )}

        {/* Step 3: Prompts */}
        {step === 3 && (
          <div className="w-full max-w-2xl">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-white mb-2">Pick prompts to track</h1>
              <p className="text-white/50 text-sm">
                Questions people ask AI about your industry. We'll show where you and competitors appear.
              </p>
            </div>

            {loadingPrompts ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 text-white/50 animate-spin" />
              </div>
            ) : (
              <>
                {/* Search and controls */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input
                      type="text"
                      value={promptSearch}
                      onChange={(e) => setPromptSearch(e.target.value)}
                      placeholder="Search prompts..."
                      className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/20 text-white placeholder-white/30 text-sm"
                    />
                  </div>
                  <button onClick={selectAllPrompts} className="px-3 py-2 text-xs text-white/60 hover:text-white transition-colors">
                    Select all
                  </button>
                  <button onClick={deselectAllPrompts} className="px-3 py-2 text-xs text-white/60 hover:text-white transition-colors">
                    Clear
                  </button>
                </div>

                <div className="mb-4 text-sm text-white/50">
                  {selectedPrompts.size} of {availablePrompts.length} prompts selected
                </div>

                <div className="max-h-[400px] overflow-y-auto space-y-2 mb-6 pr-2">
                  {filteredPrompts.length === 0 ? (
                    <div className="text-center py-8 text-white/40 text-sm">
                      {promptSearch ? 'No prompts match your search' : 'No prompts available for this industry yet'}
                    </div>
                  ) : (
                    filteredPrompts.map((prompt) => (
                      <button
                        key={prompt.id}
                        onClick={() => togglePrompt(prompt.id)}
                        className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
                          selectedPrompts.has(prompt.id)
                            ? 'bg-white/10 border-white/20'
                            : 'bg-white/[0.02] border-white/5 hover:border-white/10'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center mt-0.5 ${
                            selectedPrompts.has(prompt.id)
                              ? 'bg-white border-white'
                              : 'border-white/20'
                          }`}>
                            {selectedPrompts.has(prompt.id) && (
                              <Check className="w-3 h-3 text-black" />
                            )}
                          </div>
                          <span className="text-sm text-white/80">{prompt.prompt_text}</span>
                        </div>
                      </button>
                    ))
                  )}
                </div>

                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg mb-4">
                    <p className="text-sm text-red-400">{error}</p>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setStep(2)}
                    className="px-4 py-3 text-white/60 hover:text-white transition-colors flex items-center gap-2 text-sm"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </button>
                  
                  <button
                    onClick={handleFinalSubmit}
                    disabled={loading || selectedPrompts.size === 0}
                    className="flex-1 py-3 px-4 bg-white text-black rounded-lg font-medium hover:bg-white/90 disabled:opacity-50 transition-all flex items-center justify-center gap-2 text-sm"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Setting up...
                      </>
                    ) : (
                      <>
                        Start tracking
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>

                <p className="text-center text-xs text-white/30 mt-4">
                  You can always add or remove prompts later
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}