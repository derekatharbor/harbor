// apps/web/app/onboarding/analyzing/page.tsx
// Live execution transition - shows real-time AI analysis

'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Check, Loader2, AlertCircle, ArrowRight, Sparkles } from 'lucide-react'

interface ModelStatus {
  model: string
  status: 'pending' | 'running' | 'complete' | 'error'
  response_text?: string
  brands_found?: string[]
  citations?: { url: string; domain: string }[]
  duration_ms?: number
  error?: string
}

interface Summary {
  successful: number
  failed: number
  total_tokens: number
  estimated_cost_usd: number
  unique_brands: number
  brands: string[]
}

const MODEL_INFO: Record<string, { name: string; logo: string; color: string }> = {
  chatgpt: { 
    name: 'ChatGPT', 
    logo: '/models/openai.svg',
    color: 'bg-emerald-500'
  },
  claude: { 
    name: 'Claude', 
    logo: '/models/anthropic.svg',
    color: 'bg-orange-500'
  },
  gemini: { 
    name: 'Gemini', 
    logo: '/models/google.svg',
    color: 'bg-blue-500'
  },
  perplexity: { 
    name: 'Perplexity', 
    logo: '/models/perplexity.svg',
    color: 'bg-purple-500'
  }
}

function ModelCard({ status, brandName }: { status: ModelStatus; brandName: string }) {
  const info = MODEL_INFO[status.model] || { name: status.model, logo: '', color: 'bg-gray-500' }
  const isMentioned = status.brands_found?.some(
    b => b.toLowerCase().includes(brandName.toLowerCase()) || 
         brandName.toLowerCase().includes(b.toLowerCase())
  )

  return (
    <div className={`
      p-4 rounded-xl border transition-all duration-300
      ${status.status === 'complete' 
        ? 'bg-card border-border' 
        : status.status === 'running'
        ? 'bg-card border-accent/30 shadow-lg shadow-accent/5'
        : status.status === 'error'
        ? 'bg-card border-red-500/30'
        : 'bg-secondary/50 border-border opacity-60'
      }
    `}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            status.status === 'pending' ? 'bg-secondary' : 'bg-white dark:bg-gray-800'
          }`}>
            <img 
              src={info.logo} 
              alt={info.name}
              className="w-5 h-5 object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none'
              }}
            />
          </div>
          <span className="font-medium text-primary">{info.name}</span>
        </div>
        
        <div className="flex items-center gap-2">
          {status.status === 'pending' && (
            <span className="text-xs text-muted">Waiting...</span>
          )}
          {status.status === 'running' && (
            <Loader2 className="w-4 h-4 text-accent animate-spin" />
          )}
          {status.status === 'complete' && (
            <div className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-500" />
              <span className="text-xs text-muted">{status.duration_ms}ms</span>
            </div>
          )}
          {status.status === 'error' && (
            <AlertCircle className="w-4 h-4 text-red-400" />
          )}
        </div>
      </div>

      {status.status === 'complete' && (
        <div className="space-y-2">
          {/* Mention status */}
          <div className={`
            inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium
            ${isMentioned 
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
              : 'bg-secondary text-muted'
            }
          `}>
            {isMentioned ? (
              <>
                <Check className="w-3 h-3" />
                Your brand was mentioned
              </>
            ) : (
              'Not mentioned in this response'
            )}
          </div>

          {/* Brands found */}
          {status.brands_found && status.brands_found.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {status.brands_found.slice(0, 5).map((brand, i) => (
                <span 
                  key={i}
                  className={`
                    text-xs px-2 py-0.5 rounded
                    ${brand.toLowerCase().includes(brandName.toLowerCase())
                      ? 'bg-accent/20 text-accent font-medium'
                      : 'bg-secondary text-muted'
                    }
                  `}
                >
                  {brand}
                </span>
              ))}
              {status.brands_found.length > 5 && (
                <span className="text-xs text-muted">
                  +{status.brands_found.length - 5} more
                </span>
              )}
            </div>
          )}

          {/* Response preview */}
          {status.response_text && (
            <p className="text-xs text-muted line-clamp-2 mt-2">
              {status.response_text.slice(0, 150)}...
            </p>
          )}
        </div>
      )}

      {status.status === 'error' && (
        <p className="text-xs text-red-400">{status.error}</p>
      )}
    </div>
  )
}

export default function AnalyzingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-white/50 animate-spin" />
      </div>
    }>
      <AnalyzingContent />
    </Suspense>
  )
}

function AnalyzingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [models, setModels] = useState<Record<string, ModelStatus>>({})
  const [summary, setSummary] = useState<Summary | null>(null)
  const [isComplete, setIsComplete] = useState(false)
  const [canSkip, setCanSkip] = useState(false)
  const eventSourceRef = useRef<EventSource | null>(null)

  const brandName = searchParams.get('brand') || 'Your brand'
  const promptText = searchParams.get('prompt')
  const promptId = searchParams.get('prompt_id') || ''
  const dashboardId = searchParams.get('dashboard_id') || ''
  
  // Track if params have been checked (to avoid redirect on initial hydration)
  const [paramsChecked, setParamsChecked] = useState(false)

  useEffect(() => {
    // Wait a tick for searchParams to hydrate
    const timer = setTimeout(() => setParamsChecked(true), 100)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    // Don't do anything until params have been checked
    if (!paramsChecked) return
    
    // Allow skip after 3 seconds
    const skipTimer = setTimeout(() => setCanSkip(true), 3000)

    // Start the execution stream
    const startExecution = async () => {
      try {
        const response = await fetch('/api/prompts/execute-stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt_id: promptId,
            prompt_text: promptText,
            dashboard_id: dashboardId
          })
        })

        const reader = response.body?.getReader()
        const decoder = new TextDecoder()

        if (!reader) return

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const text = decoder.decode(value)
          const lines = text.split('\n').filter(line => line.startsWith('data: '))

          for (const line of lines) {
            try {
              const data = JSON.parse(line.slice(6))
              
              if (data.type === 'init') {
                setModels(data.models)
              } else if (data.type === 'update') {
                setModels(prev => ({
                  ...prev,
                  [data.model]: data
                }))
              } else if (data.type === 'complete') {
                setSummary(data.summary)
                setIsComplete(true)
              }
            } catch (e) {
              // Ignore parse errors
            }
          }
        }
      } catch (error) {
        console.error('Execution stream error:', error)
        setIsComplete(true)
      }
    }

    if (promptText) {
      startExecution()
    } else {
      // No prompt - redirect to dashboard
      router.push('/dashboard')
    }

    return () => {
      clearTimeout(skipTimer)
      eventSourceRef.current?.close()
    }
  }, [promptText, promptId, dashboardId, router, paramsChecked])

  const handleContinue = () => {
    router.push('/dashboard/prompts')
  }

  const completedCount = Object.values(models).filter(m => m.status === 'complete').length
  const progress = (completedCount / 4) * 100

  return (
    <div className="min-h-screen bg-page flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-accent/10 text-accent rounded-full text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            Analyzing visibility
          </div>
          
          <h1 className="text-2xl font-semibold text-primary mb-2">
            {isComplete ? 'Analysis Complete' : 'Analyzing your brand visibility...'}
          </h1>
          
          <p className="text-secondary max-w-md mx-auto">
            {isComplete 
              ? `Found ${summary?.unique_brands || 0} brands mentioned across ${summary?.successful || 0} AI models`
              : 'Running your prompt across ChatGPT, Claude, Gemini, and Perplexity'
            }
          </p>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
            <div 
              className="h-full bg-accent transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Prompt being analyzed */}
        {promptText && (
          <div className="bg-secondary/50 rounded-lg p-4 mb-6">
            <p className="text-xs text-muted uppercase tracking-wide mb-1">Prompt</p>
            <p className="text-primary">{promptText}</p>
          </div>
        )}

        {/* Model cards */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {['chatgpt', 'claude', 'gemini', 'perplexity'].map(model => (
            <ModelCard 
              key={model}
              status={models[model] || { model, status: 'pending' }}
              brandName={brandName}
            />
          ))}
        </div>

        {/* Summary (when complete) */}
        {isComplete && summary && (
          <div className="bg-card border border-border rounded-xl p-6 mb-6">
            <h3 className="font-medium text-primary mb-4">Quick Insights</h3>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-semibold text-primary">{summary.successful}/4</p>
                <p className="text-sm text-muted">Models analyzed</p>
              </div>
              <div>
                <p className="text-2xl font-semibold text-primary">{summary.unique_brands}</p>
                <p className="text-sm text-muted">Brands found</p>
              </div>
              <div>
                <p className="text-2xl font-semibold text-primary">
                  {summary.brands.some(b => 
                    b.toLowerCase().includes(brandName.toLowerCase())
                  ) ? (
                    <span className="text-emerald-500">Yes</span>
                  ) : (
                    <span className="text-muted">No</span>
                  )}
                </p>
                <p className="text-sm text-muted">You're mentioned</p>
              </div>
            </div>

            {summary.brands.length > 0 && (
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-sm text-muted mb-2">Top competitors mentioned:</p>
                <div className="flex flex-wrap gap-2">
                  {summary.brands.slice(0, 8).map((brand, i) => (
                    <span 
                      key={i}
                      className={`
                        text-sm px-2.5 py-1 rounded-md
                        ${brand.toLowerCase().includes(brandName.toLowerCase())
                          ? 'bg-accent/20 text-accent font-medium'
                          : 'bg-secondary text-secondary'
                        }
                      `}
                    >
                      {brand}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-center gap-4">
          {canSkip && !isComplete && (
            <button
              onClick={handleContinue}
              className="px-4 py-2 text-sm text-muted hover:text-primary transition-colors"
            >
              Skip for now
            </button>
          )}
          
          <button
            onClick={handleContinue}
            disabled={!isComplete && !canSkip}
            className={`
              flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium transition-all
              ${isComplete
                ? 'bg-[#1a1a1a] text-white dark:bg-white dark:text-[#1a1a1a] hover:opacity-90'
                : 'bg-secondary text-muted cursor-not-allowed'
              }
            `}
          >
            Continue to Dashboard
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}