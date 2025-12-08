// app/onboarding/page.tsx
// New onboarding flow inspired by Peec - Account type → Domain → Topics → Prompts → Analyzing
'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Loader2, 
  Search, 
  X, 
  Building2, 
  Users,
  ChevronDown,
  ChevronRight,
  Sparkles
} from 'lucide-react'

// ============================================================================
// TYPES
// ============================================================================

interface Topic {
  id: string
  name: string
  selected: boolean
  prompts: Prompt[]
  loading?: boolean
}

interface Prompt {
  id: string
  text: string
  topic: string
  selected: boolean
}

interface Competitor {
  id: string
  brand_name: string
  domain: string
  logo_url: string
}

// ============================================================================
// CONSTANTS
// ============================================================================

const COMPETITOR_LIMITS = {
  solo: 3,
  agency: 10,
  enterprise: 999
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

function OnboardingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClientComponentClient()
  
  const brandFromUrl = searchParams.get('brand') || ''
  
  // Flow state
  const [step, setStep] = useState(1)
  const [checking, setChecking] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Step 1: Account type
  const [accountType, setAccountType] = useState<'agency' | 'inhouse' | null>(null)
  
  // Step 2: Brand info
  const [brandName, setBrandName] = useState(brandFromUrl)
  const [domain, setDomain] = useState('')
  
  // Step 3: Topics (generated from domain)
  const [topics, setTopics] = useState<Topic[]>([])
  const [generatingTopics, setGeneratingTopics] = useState(false)
  
  // Step 4: Prompts (nested under topics)
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set())
  const [generatingPrompts, setGeneratingPrompts] = useState<Set<string>>(new Set())
  
  // Animated progress bar for topic generation
  const [topicGenProgress, setTopicGenProgress] = useState(0)
  
  // Step 5: Competitors (optional)
  const [competitorSearch, setCompetitorSearch] = useState('')
  const [competitorResults, setCompetitorResults] = useState<Competitor[]>([])
  const [selectedCompetitors, setSelectedCompetitors] = useState<Competitor[]>([])
  const [searchingCompetitors, setSearchingCompetitors] = useState(false)
  const [showCompetitorDropdown, setShowCompetitorDropdown] = useState(false)
  const competitorInputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  const [plan] = useState<'solo' | 'agency' | 'enterprise'>('solo')
  const competitorLimit = COMPETITOR_LIMITS[plan]

  // ============================================================================
  // AUTH CHECK
  // ============================================================================
  
  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }
      setChecking(false)
    }
    checkAuth()
  }, [supabase, router])

  // Animate progress bar during topic generation
  useEffect(() => {
    if (!generatingTopics) {
      setTopicGenProgress(0)
      return
    }
    
    // Animate from 0 to ~85% over ~3 seconds, then slow down
    const startTime = Date.now()
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime
      // Ease-out curve that approaches but never reaches 100%
      const progress = Math.min(92, (1 - Math.exp(-elapsed / 1500)) * 95)
      setTopicGenProgress(progress)
    }, 50)
    
    return () => clearInterval(interval)
  }, [generatingTopics])

  // ============================================================================
  // TOPIC GENERATION
  // ============================================================================
  
  const generateTopics = async () => {
    if (!domain.trim()) return
    
    setGeneratingTopics(true)
    setError(null)
    
    try {
      const response = await fetch('/api/onboarding/generate-topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          domain: domain.trim(),
          brandName: brandName.trim()
        })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate topics')
      }
      
      // Initialize topics with selection state
      const initialTopics: Topic[] = data.topics.map((t: any, i: number) => ({
        id: t.id || `topic-${i}`,
        name: t.name,
        selected: i < 3, // Pre-select first 3
        prompts: [],
        loading: false
      }))
      
      setTopics(initialTopics)
      setStep(3)
    } catch (err: any) {
      console.error('Topic generation error:', err)
      setError(err.message || 'Failed to generate topics')
    } finally {
      setGeneratingTopics(false)
    }
  }

  // ============================================================================
  // PROMPT GENERATION (per topic)
  // ============================================================================
  
  const generatePromptsForTopic = async (topicId: string, topicName: string) => {
    setGeneratingPrompts(prev => new Set(prev).add(topicId))
    
    try {
      const response = await fetch('/api/onboarding/generate-prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          topic: topicName,
          brandName: brandName.trim(),
          domain: domain.trim()
        })
      })
      
      const data = await response.json()
      
      if (response.ok && data.prompts) {
        setTopics(prev => prev.map(t => {
          if (t.id === topicId) {
            return {
              ...t,
              prompts: data.prompts.map((p: any, i: number) => ({
                id: p.id || `${topicId}-prompt-${i}`,
                text: p.text,
                topic: topicName,
                selected: i < 3 // Pre-select first 3
              }))
            }
          }
          return t
        }))
      }
    } catch (err) {
      console.error('Prompt generation error:', err)
    } finally {
      setGeneratingPrompts(prev => {
        const next = new Set(prev)
        next.delete(topicId)
        return next
      })
    }
  }

  // ============================================================================
  // TOPIC EXPANSION & TOGGLE
  // ============================================================================
  
  const toggleTopicExpanded = async (topicId: string) => {
    const topic = topics.find(t => t.id === topicId)
    if (!topic) return
    
    const isExpanding = !expandedTopics.has(topicId)
    
    setExpandedTopics(prev => {
      const next = new Set(prev)
      if (next.has(topicId)) {
        next.delete(topicId)
      } else {
        next.add(topicId)
      }
      return next
    })
    
    // Generate prompts if expanding and no prompts yet
    if (isExpanding && topic.prompts.length === 0 && !generatingPrompts.has(topicId)) {
      await generatePromptsForTopic(topicId, topic.name)
    }
  }
  
  const toggleTopicSelected = (topicId: string) => {
    setTopics(prev => prev.map(t => 
      t.id === topicId ? { ...t, selected: !t.selected } : t
    ))
  }
  
  const togglePromptSelected = (topicId: string, promptId: string) => {
    setTopics(prev => prev.map(t => {
      if (t.id === topicId) {
        return {
          ...t,
          prompts: t.prompts.map(p => 
            p.id === promptId ? { ...p, selected: !p.selected } : p
          )
        }
      }
      return t
    }))
  }

  // ============================================================================
  // COMPETITOR SEARCH
  // ============================================================================
  
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

  // ============================================================================
  // FINAL SUBMIT
  // ============================================================================
  
  const handleFinalSubmit = async () => {
    setLoading(true)
    setError(null)

    try {
      // Collect all selected prompts
      const selectedPromptData: { topic: string; text: string }[] = []
      topics.forEach(t => {
        if (t.selected) {
          t.prompts.forEach(p => {
            if (p.selected) {
              selectedPromptData.push({ topic: t.name, text: p.text })
            }
          })
        }
      })

      console.log('[Onboarding] Submitting with:', {
        brandName: brandName.trim(),
        domain: domain.trim(),
        accountType,
        topicsCount: topics.filter(t => t.selected).length,
        promptsCount: selectedPromptData.length,
        prompts: selectedPromptData.slice(0, 3) // Log first 3 for debug
      })

      const response = await fetch('/api/onboarding/create-dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandName: brandName.trim(),
          domain: domain.trim(),
          accountType,
          topics: topics.filter(t => t.selected).map(t => t.name),
          prompts: selectedPromptData,
          competitorProfileIds: selectedCompetitors.map(c => c.id)
        })
      })

      const data = await response.json()
      console.log('[Onboarding] Response:', data)

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create dashboard')
      }

      // Get first prompt for analyzing page
      const firstPrompt = selectedPromptData[0]
      
      if (firstPrompt) {
        const params = new URLSearchParams({
          brand: brandName.trim(),
          prompt: firstPrompt.text,
          dashboard_id: data.dashboardId || ''
        })
        router.push(`/onboarding/analyzing?${params.toString()}`)
      } else {
        router.push('/dashboard/overview')
      }
      
    } catch (err: any) {
      console.error('Onboarding error:', err)
      setError(err.message || 'Failed to create dashboard')
    } finally {
      setLoading(false)
    }
  }

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================
  
  const selectedTopicsCount = topics.filter(t => t.selected).length
  const selectedPromptsCount = topics.reduce((sum, t) => 
    sum + (t.selected ? t.prompts.filter(p => p.selected).length : 0), 0
  )
  
  const canProceedStep3 = selectedTopicsCount >= 1
  const canProceedStep4 = selectedPromptsCount >= 1

  // ============================================================================
  // LOADING STATE
  // ============================================================================
  
  if (checking) {
    return (
      <div className="min-h-screen bg-[#0B0B0C] flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-white/50 animate-spin" />
      </div>
    )
  }

  // ============================================================================
  // RENDER
  // ============================================================================
  
  return (
    <div className="min-h-screen bg-[#0B0B0C] flex flex-col">
      {/* Nav */}
      <nav className="p-6 flex items-center justify-between border-b border-white/5">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/images/Harbor_White_Logo.png"
            alt="Harbor"
            width={28}
            height={28}
            className="h-7 w-auto"
          />
          <span className="text-lg font-semibold text-white font-['Space_Grotesk']">Harbor</span>
        </Link>
        
        {/* Step indicator */}
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              className={`w-2 h-2 rounded-full transition-colors ${
                s === step ? 'bg-white' : s < step ? 'bg-white/40' : 'bg-white/10'
              }`}
            />
          ))}
        </div>
        
        <div className="text-sm text-white/40 font-['Source_Code_Pro']">
          Step {step} of 5
        </div>
      </nav>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        
        {/* ================================================================ */}
        {/* STEP 1: Account Type */}
        {/* ================================================================ */}
        {step === 1 && (
          <div className="w-full max-w-xl">
            <div className="text-center mb-8">
              <p className="text-white/40 text-sm font-['Source_Code_Pro'] mb-2">STEP 1/5</p>
              <h1 className="text-2xl font-semibold text-white font-['Space_Grotesk'] mb-2">
                Account type
              </h1>
              <p className="text-white/50 text-sm font-['Source_Code_Pro']">
                Track your brand visibility in AI responses
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              {/* Agency */}
              <button
                onClick={() => setAccountType('agency')}
                className={`p-6 rounded-xl border text-left transition-all ${
                  accountType === 'agency'
                    ? 'bg-white/5 border-white/20'
                    : 'bg-[#111213] border-white/5 hover:border-white/10'
                }`}
              >
                <div className={`w-5 h-5 rounded-full border-2 mb-4 flex items-center justify-center ${
                  accountType === 'agency' ? 'border-white bg-white' : 'border-white/20'
                }`}>
                  {accountType === 'agency' && <Check className="w-3 h-3 text-[#0B0B0C]" />}
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-white/60" />
                  <span className="font-medium text-white font-['Space_Grotesk']">Agency</span>
                </div>
                <p className="text-sm text-white/40 font-['Source_Code_Pro'] mb-4">
                  Manage AI visibility for multiple client brands
                </p>
                <div className="border-t border-dashed border-white/10 pt-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-white/50">
                    <Check className="w-3 h-3" /> Multiple projects
                  </div>
                  <div className="flex items-center gap-2 text-xs text-white/50">
                    <Check className="w-3 h-3" /> Client management
                  </div>
                  <div className="flex items-center gap-2 text-xs text-white/50">
                    <Check className="w-3 h-3" /> Multi-brand analytics
                  </div>
                </div>
              </button>

              {/* In-house */}
              <button
                onClick={() => setAccountType('inhouse')}
                className={`p-6 rounded-xl border text-left transition-all ${
                  accountType === 'inhouse'
                    ? 'bg-white/5 border-white/20'
                    : 'bg-[#111213] border-white/5 hover:border-white/10'
                }`}
              >
                <div className={`w-5 h-5 rounded-full border-2 mb-4 flex items-center justify-center ${
                  accountType === 'inhouse' ? 'border-white bg-white' : 'border-white/20'
                }`}>
                  {accountType === 'inhouse' && <Check className="w-3 h-3 text-[#0B0B0C]" />}
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="w-4 h-4 text-white/60" />
                  <span className="font-medium text-white font-['Space_Grotesk']">In-house</span>
                </div>
                <p className="text-sm text-white/40 font-['Source_Code_Pro'] mb-4">
                  Companies managing their own brand
                </p>
                <div className="border-t border-dashed border-white/10 pt-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-white/50">
                    <Check className="w-3 h-3" /> Single project
                  </div>
                  <div className="flex items-center gap-2 text-xs text-white/50">
                    <Check className="w-3 h-3" /> Company analytics
                  </div>
                  <div className="flex items-center gap-2 text-xs text-white/50">
                    <Check className="w-3 h-3" /> Brand optimisation
                  </div>
                </div>
              </button>
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!accountType}
              className="w-full py-3 px-4 bg-white text-[#0B0B0C] rounded-lg font-medium hover:bg-white/90 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 text-sm font-['Space_Grotesk']"
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ================================================================ */}
        {/* STEP 2: Brand Info + Generate Topics */}
        {/* ================================================================ */}
        {step === 2 && (
          <div className="w-full max-w-xl">
            <div className="text-center mb-8">
              <p className="text-white/40 text-sm font-['Source_Code_Pro'] mb-2">STEP 2/5</p>
              <h1 className="text-2xl font-semibold text-white font-['Space_Grotesk'] mb-2">
                Your brand
              </h1>
              <p className="text-white/50 text-sm font-['Source_Code_Pro']">
                We'll analyze your website to suggest relevant topics
              </p>
            </div>

            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2 font-['Source_Code_Pro']">
                  Website URL
                </label>
                <input
                  type="text"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="yourcompany.com"
                  className="w-full px-4 py-3 bg-[#111213] border border-white/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-white/20 text-white placeholder-white/30 font-['Source_Code_Pro']"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2 font-['Source_Code_Pro']">
                  Brand name
                </label>
                <input
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="Your Company"
                  className="w-full px-4 py-3 bg-[#111213] border border-white/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-white/20 text-white placeholder-white/30 font-['Source_Code_Pro']"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg mb-4">
                <p className="text-sm text-red-400 font-['Source_Code_Pro']">{error}</p>
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-3 text-white/60 hover:text-white transition-colors flex items-center gap-2 text-sm font-['Source_Code_Pro']"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              
              <button
                onClick={generateTopics}
                disabled={!domain.trim() || !brandName.trim() || generatingTopics}
                className="flex-1 py-3 px-4 bg-white text-[#0B0B0C] rounded-lg font-medium hover:bg-white/90 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 text-sm font-['Space_Grotesk']"
              >
                {generatingTopics ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* GENERATING TOPICS LOADER */}
        {/* ================================================================ */}
        {generatingTopics && (
          <div className="fixed inset-0 bg-[#0B0B0C] flex items-center justify-center z-50">
            <div className="text-center">
              <div className="mb-6">
                <Sparkles className="w-8 h-8 text-white/60 mx-auto animate-pulse" />
              </div>
              <p className="text-white/60 font-['Source_Code_Pro']">Generating topics...</p>
              <div className="w-48 h-1 bg-white/10 rounded-full mt-4 mx-auto overflow-hidden">
                <div 
                  className="h-full bg-white/40 rounded-full transition-all duration-150 ease-out" 
                  style={{ width: `${topicGenProgress}%` }} 
                />
              </div>
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* STEP 3: Review Topics */}
        {/* ================================================================ */}
        {step === 3 && (
          <div className="w-full max-w-xl">
            <div className="text-center mb-6">
              <p className="text-white/40 text-sm font-['Source_Code_Pro'] mb-2">STEP 3/5</p>
              <h1 className="text-2xl font-semibold text-white font-['Space_Grotesk'] mb-2">
                Review Topics
              </h1>
              <p className="text-white/50 text-sm font-['Source_Code_Pro']">
                We'll create targeted prompts for each topic to see how AI discusses these areas in relation to your brand — You can add topics later.
              </p>
            </div>

            <div className="mb-4 text-sm text-white/50 font-['Source_Code_Pro']">
              {selectedTopicsCount}/{topics.length} topics selected
            </div>

            <div className="space-y-2 mb-6 max-h-[400px] overflow-y-auto pr-2">
              {topics.map((topic) => (
                <button
                  key={topic.id}
                  onClick={() => toggleTopicSelected(topic.id)}
                  className={`w-full text-left px-4 py-4 rounded-xl border transition-all flex items-center gap-3 ${
                    topic.selected
                      ? 'bg-white/5 border-white/20'
                      : 'bg-[#111213] border-white/5 hover:border-white/10'
                  }`}
                >
                  <div className={`w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center ${
                    topic.selected ? 'bg-white border-white' : 'border-white/20'
                  }`}>
                    {topic.selected && <Check className="w-3 h-3 text-[#0B0B0C]" />}
                  </div>
                  <span className="text-white font-['Space_Grotesk']">{topic.name}</span>
                </button>
              ))}
            </div>

            {/* Add custom topic */}
            <button className="w-full px-4 py-3 border border-dashed border-white/10 rounded-xl text-white/40 hover:text-white/60 hover:border-white/20 transition-colors text-sm font-['Source_Code_Pro'] mb-6">
              + Add custom
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setStep(2)}
                className="px-4 py-3 text-white/60 hover:text-white transition-colors flex items-center gap-2 text-sm font-['Source_Code_Pro']"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              
              <button
                onClick={() => setStep(4)}
                disabled={!canProceedStep3}
                className="flex-1 py-3 px-4 bg-white text-[#0B0B0C] rounded-lg font-medium hover:bg-white/90 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 text-sm font-['Space_Grotesk']"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* STEP 4: Review Prompts (nested under topics) */}
        {/* ================================================================ */}
        {step === 4 && (
          <div className="w-full max-w-xl">
            <div className="text-center mb-6">
              <p className="text-white/40 text-sm font-['Source_Code_Pro'] mb-2">STEP 4/5</p>
              <h1 className="text-2xl font-semibold text-white font-['Space_Grotesk'] mb-2">
                Review Prompts
              </h1>
              <p className="text-white/50 text-sm font-['Source_Code_Pro']">
                We'll create targeted prompts for each topic to see how AI discusses these areas in relation to your brand.
              </p>
            </div>

            <div className="mb-4 text-sm text-white/50 font-['Source_Code_Pro']">
              {selectedPromptsCount} prompts selected
            </div>

            <div className="space-y-2 mb-6 max-h-[400px] overflow-y-auto pr-2">
              {topics.filter(t => t.selected).map((topic) => (
                <div key={topic.id} className="border border-white/5 rounded-xl overflow-hidden">
                  {/* Topic header */}
                  <button
                    onClick={() => toggleTopicExpanded(topic.id)}
                    className="w-full px-4 py-4 flex items-center justify-between bg-[#111213] hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-white font-['Space_Grotesk']">{topic.name}</span>
                      {topic.prompts.length > 0 && (
                        <span className="text-white/40 text-sm font-['Source_Code_Pro']">
                          {topic.prompts.filter(p => p.selected).length}
                        </span>
                      )}
                      {generatingPrompts.has(topic.id) && (
                        <Loader2 className="w-4 h-4 text-white/40 animate-spin" />
                      )}
                    </div>
                    {expandedTopics.has(topic.id) ? (
                      <ChevronDown className="w-4 h-4 text-white/40" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-white/40" />
                    )}
                  </button>
                  
                  {/* Prompts */}
                  {expandedTopics.has(topic.id) && (
                    <div className="border-t border-white/5 bg-[#0B0B0C]">
                      {topic.prompts.length === 0 && generatingPrompts.has(topic.id) ? (
                        <div className="px-4 py-6 text-center">
                          <Loader2 className="w-5 h-5 text-white/40 animate-spin mx-auto mb-2" />
                          <p className="text-sm text-white/40 font-['Source_Code_Pro']">Generating prompts...</p>
                        </div>
                      ) : topic.prompts.length === 0 ? (
                        <div className="px-4 py-6 text-center text-white/30 text-sm font-['Source_Code_Pro']">
                          No prompts generated yet
                        </div>
                      ) : (
                        <div className="p-2 space-y-1">
                          {topic.prompts.map((prompt) => (
                            <button
                              key={prompt.id}
                              onClick={() => togglePromptSelected(topic.id, prompt.id)}
                              className={`w-full text-left px-3 py-3 rounded-lg flex items-start gap-3 transition-colors ${
                                prompt.selected ? 'bg-white/5' : 'hover:bg-white/[0.02]'
                              }`}
                            >
                              <div className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center mt-0.5 ${
                                prompt.selected ? 'bg-white border-white' : 'border-white/20'
                              }`}>
                                {prompt.selected && <Check className="w-2.5 h-2.5 text-[#0B0B0C]" />}
                              </div>
                              <span className="text-sm text-white/70 font-['Source_Code_Pro']">{prompt.text}</span>
                            </button>
                          ))}
                          
                          {/* Add custom prompt */}
                          <button className="w-full px-3 py-2 text-left text-white/30 hover:text-white/50 text-sm font-['Source_Code_Pro'] transition-colors">
                            + Add custom
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setStep(3)}
                className="px-4 py-3 text-white/60 hover:text-white transition-colors flex items-center gap-2 text-sm font-['Source_Code_Pro']"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              
              <button
                onClick={() => setStep(5)}
                disabled={!canProceedStep4}
                className="flex-1 py-3 px-4 bg-white text-[#0B0B0C] rounded-lg font-medium hover:bg-white/90 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 text-sm font-['Space_Grotesk']"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* STEP 5: Competitors (Optional) */}
        {/* ================================================================ */}
        {step === 5 && (
          <div className="w-full max-w-xl">
            <div className="text-center mb-6">
              <p className="text-white/40 text-sm font-['Source_Code_Pro'] mb-2">STEP 5/5</p>
              <h1 className="text-2xl font-semibold text-white font-['Space_Grotesk'] mb-2">
                Add competitors
              </h1>
              <p className="text-white/50 text-sm font-['Source_Code_Pro']">
                Track how you compare to competitors in AI responses
              </p>
            </div>

            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                ref={competitorInputRef}
                type="text"
                value={competitorSearch}
                onChange={(e) => setCompetitorSearch(e.target.value)}
                placeholder="Search brands..."
                className="w-full pl-11 pr-4 py-3 bg-[#111213] border border-white/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-white/20 text-white placeholder-white/30 font-['Source_Code_Pro']"
              />
              {searchingCompetitors && (
                <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 animate-spin" />
              )}
              
              {/* Dropdown */}
              {showCompetitorDropdown && (
                <div
                  ref={dropdownRef}
                  className="absolute z-10 w-full mt-2 bg-[#161718] border border-white/10 rounded-xl shadow-lg max-h-60 overflow-y-auto"
                >
                  {competitorResults.map((brand) => (
                    <button
                      key={brand.id}
                      onClick={() => addCompetitor(brand)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left"
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
                        <div className="text-sm font-medium text-white truncate font-['Space_Grotesk']">{brand.brand_name}</div>
                        <div className="text-xs text-white/40 truncate font-['Source_Code_Pro']">{brand.domain}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="text-sm text-white/50 mb-4 font-['Source_Code_Pro']">
              {selectedCompetitors.length} of {competitorLimit} competitors
              {plan === 'solo' && selectedCompetitors.length >= competitorLimit && (
                <span className="text-white/30 ml-2">· Upgrade for more</span>
              )}
            </div>

            {/* Selected competitors */}
            {selectedCompetitors.length > 0 ? (
              <div className="space-y-2 mb-6">
                {selectedCompetitors.map((competitor) => (
                  <div
                    key={competitor.id}
                    className="flex items-center gap-3 px-4 py-3 bg-[#111213] border border-white/5 rounded-xl"
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
                      <div className="text-sm font-medium text-white truncate font-['Space_Grotesk']">{competitor.brand_name}</div>
                      <div className="text-xs text-white/40 truncate font-['Source_Code_Pro']">{competitor.domain}</div>
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
              <div className="text-center py-8 mb-6 border border-dashed border-white/10 rounded-xl">
                <p className="text-white/30 text-sm font-['Source_Code_Pro']">Search to add competitors</p>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg mb-4">
                <p className="text-sm text-red-400 font-['Source_Code_Pro']">{error}</p>
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                onClick={() => setStep(4)}
                className="px-4 py-3 text-white/60 hover:text-white transition-colors flex items-center gap-2 text-sm font-['Source_Code_Pro']"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              
              <button
                onClick={handleFinalSubmit}
                disabled={loading}
                className="flex-1 py-3 px-4 bg-white text-[#0B0B0C] rounded-lg font-medium hover:bg-white/90 disabled:opacity-50 transition-all flex items-center justify-center gap-2 text-sm font-['Space_Grotesk']"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Setting up...
                  </>
                ) : (
                  <>
                    {selectedCompetitors.length === 0 ? 'Skip for now' : 'Looks good'}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            <p className="text-center text-xs text-white/30 mt-4 font-['Source_Code_Pro']">
              You can always add competitors later
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================================================
// EXPORT WITH SUSPENSE
// ============================================================================

export default function OnboardingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0B0B0C] flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-white/50 animate-spin" />
      </div>
    }>
      <OnboardingContent />
    </Suspense>
  )
}