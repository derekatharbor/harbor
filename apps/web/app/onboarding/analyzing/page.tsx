// app/onboarding/analyzing/page.tsx
'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Loader2, ArrowRight, Check, Target } from 'lucide-react'

// ============================================================================
// TYPES
// ============================================================================

interface PromptResult {
  prompt_id: string
  prompt_text: string
  model: string
  status: 'pending' | 'running' | 'complete' | 'error'
  mentioned: boolean
}

interface ModelStatus {
  model: string
  status: 'pending' | 'running' | 'complete'
  promptsComplete: number
  promptsTotal: number
  mentionedCount: number
}

// ============================================================================
// MODEL CONFIG
// ============================================================================

const MODELS = [
  { 
    id: 'chatgpt', 
    name: 'ChatGPT', 
    logo: '/models/chatgpt-logo.png',
    angle: 270
  },
  { 
    id: 'claude', 
    name: 'Claude', 
    logo: '/models/claude-logo.png',
    angle: 30
  },
  { 
    id: 'perplexity', 
    name: 'Perplexity', 
    logo: '/models/perplexity-logo.png',
    angle: 150
  }
]

// ============================================================================
// ANALYZING CONTENT
// ============================================================================

function AnalyzingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const dashboardId = searchParams.get('dashboard_id') || ''
  const brand = searchParams.get('brand') || ''
  
  const [phase, setPhase] = useState<'loading' | 'executing' | 'complete'>('loading')
  const [prompts, setPrompts] = useState<{ id: string; prompt_text: string }[]>([])
  const [modelStatus, setModelStatus] = useState<ModelStatus[]>(
    MODELS.map(m => ({ 
      model: m.id, 
      status: 'pending', 
      promptsComplete: 0, 
      promptsTotal: 0,
      mentionedCount: 0
    }))
  )
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0)
  const [rotation, setRotation] = useState(0)
  const [canSkip, setCanSkip] = useState(false)
  const [paramsChecked, setParamsChecked] = useState(false)
  const [totalMentioned, setTotalMentioned] = useState(0)

  // Check params after hydration
  useEffect(() => {
    const timer = setTimeout(() => setParamsChecked(true), 100)
    return () => clearTimeout(timer)
  }, [])

  // Redirect if no dashboard_id
  useEffect(() => {
    if (paramsChecked && !dashboardId) {
      router.push('/dashboard/overview')
    }
  }, [paramsChecked, dashboardId, router])

  // Enable skip after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => setCanSkip(true), 5000)
    return () => clearTimeout(timer)
  }, [])

  // Rotation animation
  useEffect(() => {
    const interval = setInterval(() => {
      setRotation(prev => (prev + 0.3) % 360)
    }, 50)
    return () => clearInterval(interval)
  }, [])

  // Fetch prompts and execute them
  useEffect(() => {
    if (!paramsChecked || !dashboardId) return
    
    async function fetchAndExecute() {
      try {
        // Step 1: Fetch all user_prompts for this dashboard
        setPhase('loading')
        
        const promptsRes = await fetch(`/api/prompts/list?dashboard_id=${dashboardId}`)
        if (!promptsRes.ok) throw new Error('Failed to fetch prompts')
        
        const promptsData = await promptsRes.json()
        const userPrompts = (promptsData.prompts || []).map((p: any) => ({
          id: p.id,
          prompt_text: p.prompt_text
        }))
        
        if (userPrompts.length === 0) {
          // No prompts to execute, go to dashboard
          router.push('/dashboard/overview')
          return
        }
        
        setPrompts(userPrompts)
        setModelStatus(prev => prev.map(m => ({ ...m, promptsTotal: userPrompts.length })))
        setPhase('executing')
        
        // Step 2: Execute all prompts
        // We'll execute model by model for better UX (each logo lights up when done)
        for (const model of MODELS) {
          // Mark model as running
          setModelStatus(prev => prev.map(m => 
            m.model === model.id ? { ...m, status: 'running' } : m
          ))
          
          let mentionedForModel = 0
          
          // Execute all prompts for this model in parallel
          const execPromises = userPrompts.map(async (prompt: any, idx: number) => {
            try {
              const res = await fetch('/api/prompts/execute-single', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  prompt_id: prompt.id,
                  prompt_text: prompt.prompt_text,
                  model: model.id,
                  brand,
                  dashboard_id: dashboardId
                })
              })
              
              if (res.ok) {
                const data = await res.json()
                if (data.mentioned) mentionedForModel++
                
                // Update progress
                setModelStatus(prev => prev.map(m => 
                  m.model === model.id 
                    ? { ...m, promptsComplete: m.promptsComplete + 1 }
                    : m
                ))
              }
            } catch (err) {
              console.error(`Error executing prompt ${prompt.id} on ${model.id}:`, err)
              // Still increment to show progress
              setModelStatus(prev => prev.map(m => 
                m.model === model.id 
                  ? { ...m, promptsComplete: m.promptsComplete + 1 }
                  : m
              ))
            }
          })
          
          // Wait for all prompts to complete for this model
          await Promise.all(execPromises)
          
          // Mark model as complete
          setModelStatus(prev => prev.map(m => 
            m.model === model.id 
              ? { ...m, status: 'complete', mentionedCount: mentionedForModel }
              : m
          ))
          
          setTotalMentioned(prev => prev + mentionedForModel)
        }
        
        setPhase('complete')
        
      } catch (error) {
        console.error('Execution error:', error)
        setPhase('complete')
      }
    }

    fetchAndExecute()
  }, [paramsChecked, dashboardId, brand, router])

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
  const totalPrompts = prompts.length
  const totalExecutions = totalPrompts * MODELS.length
  const completedExecutions = modelStatus.reduce((sum, m) => sum + m.promptsComplete, 0)
  const progress = totalExecutions > 0 ? Math.round((completedExecutions / totalExecutions) * 100) : 0

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
            const status = modelStatus.find(m => m.model === model.id)
            const pos = getOrbitPosition(model.angle, 110)
            const isRunning = status?.status === 'running'
            const isDone = status?.status === 'complete'
            
            return (
              <div
                key={model.id}
                className="absolute left-1/2 top-1/2 transition-all duration-75"
                style={{
                  transform: `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px))`
                }}
              >
                {/* Logo container - rounded square */}
                <div className={`
                  relative w-12 h-12 rounded-xl overflow-hidden
                  transition-all duration-300
                  ${isRunning ? 'ring-2 ring-white/30 ring-offset-2 ring-offset-[#0B0B0C]' : ''}
                  ${isDone ? 'ring-2 ring-emerald-500/50 ring-offset-2 ring-offset-[#0B0B0C]' : ''}
                  ${!isDone && !isRunning ? 'ring-1 ring-white/10' : ''}
                `}>
                  <Image
                    src={model.logo}
                    alt={model.name}
                    width={48}
                    height={48}
                    className={`w-full h-full object-cover transition-opacity ${
                      isDone || isRunning ? 'opacity-100' : 'opacity-50'
                    }`}
                  />
                </div>
                
                {/* Status indicator */}
                {isDone && (
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  </div>
                )}
                
                {/* Progress for running model */}
                {isRunning && status && (
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px] text-white font-medium">
                    {status.promptsComplete}/{status.promptsTotal}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Status text */}
        <div className="text-center mb-6">
          {phase === 'loading' ? (
            <>
              <h2 className="text-xl font-semibold text-white mb-2 font-['Space_Grotesk']">
                Loading prompts...
              </h2>
            </>
          ) : !isComplete ? (
            <>
              <h2 className="text-xl font-semibold text-white mb-2 font-['Space_Grotesk']">
                Analyzing AI visibility
              </h2>
              <p className="text-white/40 text-sm font-['Source_Code_Pro']">
                Running {totalPrompts} prompts across {MODELS.length} models
              </p>
            </>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-white mb-2 font-['Space_Grotesk']">
                Analysis complete
              </h2>
              <p className="text-white/50 text-sm font-['Source_Code_Pro'] max-w-md">
                {totalMentioned > 0 
                  ? `${brand} was mentioned ${totalMentioned} times across ${totalPrompts * MODELS.length} queries`
                  : `We've identified visibility opportunities for ${brand}`
                }
              </p>
            </>
          )}
        </div>

        {/* Progress bar */}
        <div className="w-64 mb-8">
          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-300 ease-out ${
                isComplete ? 'bg-emerald-500/60' : 'bg-white/40'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
          {!isComplete && (
            <p className="text-center text-xs text-white/30 mt-2 font-['Source_Code_Pro']">
              {completedExecutions} / {totalExecutions} queries complete
            </p>
          )}
        </div>

        {/* Results when complete */}
        {isComplete && (
          <div className="w-full max-w-md space-y-4 mb-8">
            {/* Model Results */}
            <div className="bg-[#111213] border border-white/5 rounded-xl p-4 space-y-3">
              {modelStatus.map((status) => {
                const model = MODELS.find(m => m.id === status.model)
                if (!model) return null
                
                return (
                  <div key={status.model} className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={model.logo}
                        alt={model.name}
                        width={28}
                        height={28}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="text-sm text-white/70 font-['Source_Code_Pro'] flex-1">
                      {model.name}
                    </span>
                    <span className="text-xs text-white/40 font-['Source_Code_Pro']">
                      {status.mentionedCount > 0 ? (
                        <span className="text-emerald-400">
                          {status.mentionedCount} mention{status.mentionedCount !== 1 ? 's' : ''}
                        </span>
                      ) : (
                        'Opportunities found'
                      )}
                    </span>
                  </div>
                )
              })}
            </div>

            <p className="text-center text-xs text-white/30 font-['Source_Code_Pro']">
              View detailed results in your dashboard
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