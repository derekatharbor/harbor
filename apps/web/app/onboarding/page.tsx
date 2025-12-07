// app/onboarding/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, ArrowLeft, ChevronDown, Check, Loader2, Search } from 'lucide-react'

// Standardized industry list
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

interface Prompt {
  id: string
  prompt_text: string
  topic: string
  intent?: string
}

export default function OnboardingPage() {
  const searchParams = useSearchParams()
  const brandFromUrl = searchParams.get('brand') || ''
  
  // Step state
  const [step, setStep] = useState(1)
  
  // Step 1: Brand info
  const [brandName, setBrandName] = useState(brandFromUrl)
  const [domain, setDomain] = useState('')
  const [industry, setIndustry] = useState('')
  
  // Step 2: Prompts
  const [availablePrompts, setAvailablePrompts] = useState<Prompt[]>([])
  const [selectedPrompts, setSelectedPrompts] = useState<Set<string>>(new Set())
  const [loadingPrompts, setLoadingPrompts] = useState(false)
  const [promptSearch, setPromptSearch] = useState('')
  
  // General state
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [checking, setChecking] = useState(true)

  const router = useRouter()
  const supabase = createClientComponentClient()

  // Check if user is logged in
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

  // Fetch prompts when industry is selected and moving to step 2
  useEffect(() => {
    async function fetchPrompts() {
      if (step !== 2 || !industry) return
      
      setLoadingPrompts(true)
      try {
        const response = await fetch(`/api/prompts/by-industry?industry=${encodeURIComponent(industry)}`)
        if (response.ok) {
          const data = await response.json()
          setAvailablePrompts(data.prompts || [])
          
          // Pre-select first 8 prompts
          const initialSelection = new Set(
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

  const togglePrompt = (promptId: string) => {
    const newSelected = new Set(selectedPrompts)
    if (newSelected.has(promptId)) {
      newSelected.delete(promptId)
    } else {
      newSelected.add(promptId)
    }
    setSelectedPrompts(newSelected)
  }

  const selectAll = () => {
    setSelectedPrompts(new Set(filteredPrompts.map(p => p.id)))
  }

  const deselectAll = () => {
    setSelectedPrompts(new Set())
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
          selectedPromptIds: Array.from(selectedPrompts)
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

  // Filter prompts by search
  const filteredPrompts = promptSearch
    ? availablePrompts.filter(p => 
        p.prompt_text.toLowerCase().includes(promptSearch.toLowerCase())
      )
    : availablePrompts

  // Loading state
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
        
        {/* Step indicator */}
        <div className="flex items-center gap-2">
          <div className={`w-8 h-1 rounded-full ${step >= 1 ? 'bg-white' : 'bg-white/20'}`} />
          <div className={`w-8 h-1 rounded-full ${step >= 2 ? 'bg-white' : 'bg-white/20'}`} />
        </div>
      </nav>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-6 pb-12">
        {step === 1 ? (
          /* Step 1: Brand Info */
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-white mb-2">Tell us about your brand</h1>
              <p className="text-white/50 text-sm">We'll start tracking how AI sees you immediately</p>
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
                className="w-full py-3 px-4 bg-white text-black rounded-lg font-medium hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0a0a0a] focus:ring-white disabled:opacity-50 transition-all flex items-center justify-center gap-2 text-sm mt-6"
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        ) : (
          /* Step 2: Prompt Selection */
          <div className="w-full max-w-2xl">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-white mb-2">Pick prompts to track</h1>
              <p className="text-white/50 text-sm">
                These are questions people ask AI about your industry. We'll show you where {brandName} appears.
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
                  <button
                    onClick={selectAll}
                    className="px-3 py-2 text-xs text-white/60 hover:text-white transition-colors"
                  >
                    Select all
                  </button>
                  <button
                    onClick={deselectAll}
                    className="px-3 py-2 text-xs text-white/60 hover:text-white transition-colors"
                  >
                    Clear
                  </button>
                </div>

                {/* Selected count */}
                <div className="mb-4 text-sm text-white/50">
                  {selectedPrompts.size} of {availablePrompts.length} prompts selected
                </div>

                {/* Prompts grid */}
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

                {/* Error message */}
                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg mb-4">
                    <p className="text-sm text-red-400">{error}</p>
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
                    onClick={handleFinalSubmit}
                    disabled={loading || selectedPrompts.size === 0}
                    className="flex-1 py-3 px-4 bg-white text-black rounded-lg font-medium hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0a0a0a] focus:ring-white disabled:opacity-50 transition-all flex items-center justify-center gap-2 text-sm"
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