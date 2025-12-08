// app/onboarding/analyzing/page.tsx
'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Loader2, ArrowRight, Check, TrendingUp, Sparkles, Target } from 'lucide-react'

// ============================================================================
// TYPES
// ============================================================================

interface ModelResult {
  model: string
  status: 'pending' | 'running' | 'complete' | 'error'
  mentioned: boolean
  brands: string[]
  snippet?: string
}

// ============================================================================
// MODEL CONFIG
// ============================================================================

const MODELS = [
  { 
    id: 'chatgpt', 
    name: 'ChatGPT', 
    logo: '/models/chatgpt-logo.png',
    angle: 270 // Top
  },
  { 
    id: 'claude', 
    name: 'Claude', 
    logo: '/models/claude-logo.png',
    angle: 30 // Bottom-right
  },
  { 
    id: 'perplexity', 
    name: 'Perplexity', 
    logo: '/models/perplexity-logo.png',
    angle: 150 // Bottom-left
  }
]

// ============================================================================
// ANALYZING CONTENT
// ============================================================================

function AnalyzingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const brand = searchParams.get('brand') || ''
  const prompt = searchParams.get('prompt') || ''
  const dashboardId = searchParams.get('dashboard_id') || ''
  
  const [phase, setPhase] = useState<'retrieving' | 'analyzing' | 'complete'>('retrieving')
  const [progress, setProgress] = useState(0)
  const [rotation, setRotation] = useState(0)
  const [results, setResults] = useState<ModelResult[]>(
    MODELS.map(m => ({ 
      model: m.id, 
      status: 'pending', 
      mentioned: false, 
      brands: [] 
    }))
  )
  const [canSkip, setCanSkip] = useState(false)
  const [paramsChecked, setParamsChecked] = useState(false)

  // Check params after hydration
  useEffect(() => {
    const timer = setTimeout(() => setParamsChecked(true), 100)
    return () => clearTimeout(timer)
  }, [])

  // Redirect if no params
  useEffect(() => {
    if (paramsChecked && (!brand || !prompt)) {
      router.push('/dashboard/overview')
    }
  }, [paramsChecked, brand, prompt, router])

  // Enable skip after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => setCanSkip(true), 3000)
    return () => clearTimeout(timer)
  }, [])

  // Rotation animation (slower, smoother)
  useEffect(() => {
    const interval = setInterval(() => {
      setRotation(prev => (prev + 0.3) % 360)
    }, 50)
    return () => clearInterval(interval)
  }, [])

  // Execute prompts
  useEffect(() => {
    if (!paramsChecked || !brand || !prompt) return
    
    const executePrompts = async () => {
      try {
        // Phase 1: Retrieving
        setPhase('retrieving')
        
        const response = await fetch('/api/prompts/execute-stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt, brand })
        })

        if (!response.ok) {
          throw new Error('Failed to execute')
        }

        setPhase('analyzing')

        const reader = response.body?.getReader()
        if (!reader) throw new Error('No reader')

        const decoder = new TextDecoder()
        let completedModels = 0

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split('\n').filter(l => l.startsWith('data: '))

          for (const line of lines) {
            try {
              const data = JSON.parse(line.replace('data: ', ''))
              
              if (data.model) {
                setResults(prev => prev.map(r => {
                  if (r.model === data.model) {
                    return {
                      ...r,
                      status: data.status || r.status,
                      mentioned: data.mentioned ?? r.mentioned,
                      brands: data.brands || r.brands,
                      snippet: data.snippet || r.snippet
                    }
                  }
                  return r
                }))

                if (data.status === 'complete' || data.status === 'error') {
                  completedModels++
                  setProgress(Math.round((completedModels / MODELS.length) * 100))
                }
              }

              if (data.complete) {
                setPhase('complete')
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }

        setPhase('complete')
        setProgress(100)

      } catch (error) {
        console.error('Execution error:', error)
        setPhase('complete')
        setProgress(100)
      }
    }

    executePrompts()
  }, [paramsChecked, brand, prompt])

  const handleContinue = () => {
    router.push('/dashboard/overview')
  }

  const handleSkip = () => {
    router.push('/dashboard/overview')
  }

  // Calculate position on orbit
  const getOrbitPosition = (baseAngle: number, orbitRadius: number) => {
    const angle = ((baseAngle + rotation) * Math.PI) / 180
    return {
      x: Math.cos(angle) * orbitRadius,
      y: Math.sin(angle) * orbitRadius
    }
  }

  const isComplete = phase === 'complete'
  const mentionedCount = results.filter(r => r.mentioned).length
  const completedCount = results.filter(r => r.status === 'complete').length
  
  // Calculate opportunity score (higher = more opportunity)
  // If not mentioned, there's opportunity. If mentioned, less opportunity needed.
  const opportunityScore = Math.round(((MODELS.length - mentionedCount) / MODELS.length) * 100)
  
  // Get all brands mentioned by competitors (for opportunity framing)
  const competitorBrands = [...new Set(results.flatMap(r => r.brands))].filter(b => 
    b.toLowerCase() !== brand.toLowerCase()
  ).slice(0, 5)

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
        
        {canSkip && !isComplete && (
          <button
            onClick={handleSkip}
            className="text-sm text-white/40 hover:text-white/60 transition-colors font-['Source_Code_Pro']"
          >
            Skip for now
          </button>
        )}
      </nav>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        
        {/* Orbit visualization */}
        <div className="relative w-80 h-80 mb-8">
          {/* Orbit rings */}
          <div className="absolute inset-6 rounded-full border border-white/[0.03]" />
          <div className="absolute inset-12 rounded-full border border-white/[0.05]" />
          
          {/* Center */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-500 ${
              isComplete ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-white/5'
            }`}>
              {isComplete ? (
                <Check className="w-8 h-8 text-emerald-400" />
              ) : (
                <Loader2 className="w-8 h-8 text-white/30 animate-spin" />
              )}
            </div>
          </div>

          {/* Orbiting model logos */}
          {MODELS.map((model) => {
            const result = results.find(r => r.model === model.id)
            const pos = getOrbitPosition(model.angle, 110)
            const isRunning = result?.status === 'running'
            const isDone = result?.status === 'complete'
            const hasError = result?.status === 'error'
            
            return (
              <div
                key={model.id}
                className="absolute left-1/2 top-1/2 transition-all duration-75"
                style={{
                  transform: `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px))`
                }}
              >
                {/* Logo container - circular, logo fills entirely */}
                <div className={`
                  relative w-14 h-14 rounded-full overflow-hidden
                  transition-all duration-300
                  ${isRunning ? 'ring-2 ring-white/20 ring-offset-2 ring-offset-[#0B0B0C]' : ''}
                  ${isDone ? 'ring-2 ring-emerald-500/50 ring-offset-2 ring-offset-[#0B0B0C]' : ''}
                  ${hasError ? 'ring-2 ring-red-500/30 ring-offset-2 ring-offset-[#0B0B0C]' : ''}
                  ${!isDone && !isRunning && !hasError ? 'ring-1 ring-white/10' : ''}
                `}>
                  {/* Logo fills entire circle */}
                  <Image
                    src={model.logo}
                    alt={model.name}
                    width={56}
                    height={56}
                    className={`w-full h-full object-cover transition-opacity ${
                      isDone || isRunning ? 'opacity-100' : 'opacity-50'
                    }`}
                  />
                </div>
                
                {/* Status indicator - green check when complete */}
                {isDone && (
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  </div>
                )}
                {hasError && (
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                    <span className="text-white/60 text-xs">!</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Status text */}
        <div className="text-center mb-6">
          {!isComplete ? (
            <>
              <h2 className="text-xl font-semibold text-white mb-2 font-['Space_Grotesk']">
                {phase === 'retrieving' ? 'Retrieving sources' : 'Analyzing responses'}
              </h2>
              <p className="text-white/40 text-sm font-['Source_Code_Pro']">
                Checking AI visibility across {MODELS.length} models
              </p>
            </>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-white mb-2 font-['Space_Grotesk']">
                Analysis complete
              </h2>
              
              {/* Opportunity-focused messaging */}
              {mentionedCount === 0 ? (
                <p className="text-white/50 text-sm font-['Source_Code_Pro'] max-w-md">
                  We've identified visibility opportunities for {brand} across all {MODELS.length} AI models
                </p>
              ) : mentionedCount === MODELS.length ? (
                <p className="text-emerald-400/80 text-sm font-['Source_Code_Pro'] max-w-md">
                  {brand} is visible across all {MODELS.length} AI models
                </p>
              ) : (
                <p className="text-white/50 text-sm font-['Source_Code_Pro'] max-w-md">
                  {brand} appeared in {mentionedCount} of {MODELS.length} models — opportunities identified
                </p>
              )}
            </>
          )}
        </div>

        {/* Progress bar */}
        <div className="w-64 mb-8">
          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ease-out ${
                isComplete ? 'bg-emerald-500/60' : 'bg-white/40'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Results when complete */}
        {isComplete && (
          <div className="w-full max-w-md space-y-4 mb-8">
            
            {/* Opportunity Score Card */}
            {mentionedCount < MODELS.length && (
              <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <Target className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white font-['Space_Grotesk']">
                      Opportunity Score
                    </div>
                    <div className="text-xs text-white/40 font-['Source_Code_Pro']">
                      Room for visibility improvement
                    </div>
                  </div>
                  <div className="ml-auto text-2xl font-semibold text-emerald-400 font-['Space_Grotesk']">
                    {opportunityScore}%
                  </div>
                </div>
                
                {competitorBrands.length > 0 && (
                  <p className="text-xs text-white/40 font-['Source_Code_Pro'] mt-3 pt-3 border-t border-white/5">
                    Competitors appearing: {competitorBrands.slice(0, 3).join(', ')}
                    {competitorBrands.length > 3 && ` +${competitorBrands.length - 3} more`}
                  </p>
                )}
              </div>
            )}

            {/* Model Results */}
            <div className="bg-[#111213] border border-white/5 rounded-xl p-4 space-y-3">
              {results.map((result) => {
                const model = MODELS.find(m => m.id === result.model)
                if (!model) return null
                
                return (
                  <div key={result.model} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                      <Image
                        src={model.logo}
                        alt={model.name}
                        width={32}
                        height={32}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="text-sm text-white/70 font-['Source_Code_Pro'] flex-1">
                      {model.name}
                    </span>
                    {result.status === 'error' ? (
                      <span className="text-xs text-white/30 font-['Source_Code_Pro']">Error</span>
                    ) : result.mentioned ? (
                      <span className="text-xs text-emerald-400 font-['Source_Code_Pro'] flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        Visible
                      </span>
                    ) : (
                      <span className="text-xs text-white/30 font-['Source_Code_Pro']">Opportunity</span>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Insight message */}
            <p className="text-center text-xs text-white/30 font-['Source_Code_Pro']">
              {mentionedCount < MODELS.length 
                ? "Your dashboard shows specific actions to improve AI visibility"
                : "Track your visibility over time from your dashboard"
              }
            </p>
          </div>
        )}

        {/* Continue button */}
        {isComplete && (
          <button
            onClick={handleContinue}
            className="px-8 py-3 bg-white text-[#0B0B0C] rounded-lg font-medium hover:bg-white/90 transition-all flex items-center gap-2 text-sm font-['Space_Grotesk']"
          >
            View Your Dashboard
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}

// ============================================================================
// EXPORT WITH SUSPENSE
// ============================================================================

export default function AnalyzingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0B0B0C] flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-white/50 animate-spin" />
      </div>
    }>
      <AnalyzingContent />
    </Suspense>
  )
}