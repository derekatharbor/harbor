// app/onboarding/analyzing/page.tsx
'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Loader2, ArrowRight, Check, X } from 'lucide-react'

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
    angle: 0 // Top
  },
  { 
    id: 'claude', 
    name: 'Claude', 
    logo: '/models/claude-logo.png',
    angle: 120 // Bottom-left
  },
  { 
    id: 'perplexity', 
    name: 'Perplexity', 
    logo: '/models/perplexity-logo.png',
    angle: 240 // Bottom-right
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
      router.push('/dashboard')
    }
  }, [paramsChecked, brand, prompt, router])

  // Enable skip after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => setCanSkip(true), 3000)
    return () => clearTimeout(timer)
  }, [])

  // Rotation animation
  useEffect(() => {
    const interval = setInterval(() => {
      setRotation(prev => (prev + 0.5) % 360)
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
    router.push('/dashboard/prompts')
  }

  const handleSkip = () => {
    router.push('/dashboard')
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
        <div className="relative w-72 h-72 mb-8">
          {/* Orbit ring */}
          <div className="absolute inset-8 rounded-full border border-white/5" />
          <div className="absolute inset-16 rounded-full border border-white/5" />
          
          {/* Center */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
              {isComplete ? (
                <Check className="w-6 h-6 text-white/60" />
              ) : (
                <Loader2 className="w-6 h-6 text-white/40 animate-spin" />
              )}
            </div>
          </div>

          {/* Orbiting model logos */}
          {MODELS.map((model, i) => {
            const result = results.find(r => r.model === model.id)
            const pos = getOrbitPosition(model.angle, 100)
            const isRunning = result?.status === 'running'
            const isDone = result?.status === 'complete'
            const hasError = result?.status === 'error'
            
            return (
              <div
                key={model.id}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-100"
                style={{
                  transform: `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px))`
                }}
              >
                <div className={`
                  w-12 h-12 rounded-full bg-[#161718] border flex items-center justify-center
                  transition-all duration-300
                  ${isRunning ? 'border-white/30 shadow-lg shadow-white/5' : ''}
                  ${isDone ? 'border-white/20' : 'border-white/5'}
                  ${hasError ? 'border-red-500/30' : ''}
                `}>
                  <Image
                    src={model.logo}
                    alt={model.name}
                    width={24}
                    height={24}
                    className={`w-6 h-6 object-contain ${isDone || hasError ? 'opacity-100' : 'opacity-60'}`}
                  />
                  
                  {/* Status indicator */}
                  {isDone && result?.mentioned && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-white" />
                    </div>
                  )}
                  {isDone && !result?.mentioned && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-white/20 flex items-center justify-center">
                      <X className="w-2.5 h-2.5 text-white/60" />
                    </div>
                  )}
                  {hasError && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-red-500/50 flex items-center justify-center">
                      <X className="w-2.5 h-2.5 text-white" />
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Status text */}
        <div className="text-center mb-8">
          <h2 className="text-xl font-semibold text-white mb-2 font-['Space_Grotesk']">
            {phase === 'retrieving' && 'Retrieving sources'}
            {phase === 'analyzing' && 'Analyzing responses'}
            {phase === 'complete' && 'Analysis complete'}
          </h2>
          
          {!isComplete && (
            <p className="text-white/40 text-sm font-['Source_Code_Pro']">
              Checking how AI models respond to your prompts
            </p>
          )}
          
          {isComplete && (
            <p className="text-white/50 text-sm font-['Source_Code_Pro']">
              {mentionedCount > 0 
                ? `${brand} was mentioned in ${mentionedCount} of ${MODELS.length} models`
                : `${brand} was not mentioned in any responses`
              }
            </p>
          )}
        </div>

        {/* Progress bar */}
        <div className="w-64 mb-8">
          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white/60 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Results summary (when complete) */}
        {isComplete && (
          <div className="w-full max-w-md mb-8">
            <div className="bg-[#111213] border border-white/5 rounded-xl p-4 space-y-3">
              {results.map((result) => {
                const model = MODELS.find(m => m.id === result.model)
                if (!model) return null
                
                return (
                  <div key={result.model} className="flex items-center gap-3">
                    <Image
                      src={model.logo}
                      alt={model.name}
                      width={20}
                      height={20}
                      className="w-5 h-5 object-contain"
                    />
                    <span className="text-sm text-white/70 font-['Source_Code_Pro'] flex-1">
                      {model.name}
                    </span>
                    {result.status === 'error' ? (
                      <span className="text-xs text-white/30 font-['Source_Code_Pro']">Error</span>
                    ) : result.mentioned ? (
                      <span className="text-xs text-emerald-400 font-['Source_Code_Pro']">Mentioned</span>
                    ) : (
                      <span className="text-xs text-white/30 font-['Source_Code_Pro']">Not mentioned</span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Continue button */}
        {isComplete && (
          <button
            onClick={handleContinue}
            className="px-8 py-3 bg-white text-[#0B0B0C] rounded-lg font-medium hover:bg-white/90 transition-all flex items-center gap-2 text-sm font-['Space_Grotesk']"
          >
            Continue to Dashboard
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