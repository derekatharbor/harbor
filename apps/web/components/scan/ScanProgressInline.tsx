// components/scan/ScanProgressInline.tsx
// The climax moment - user's first scan is running. Make it count.

'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Loader2, AlertTriangle } from 'lucide-react'

interface ScanProgressInlineProps {
  scanId: string
}

interface ModuleStatus {
  shopping: 'pending' | 'running' | 'done' | 'failed'
  brand: 'pending' | 'running' | 'done' | 'failed'
  conversations: 'pending' | 'running' | 'done' | 'failed'
  website: 'pending' | 'running' | 'done' | 'failed'
}

const MODULE_CONFIG = {
  shopping: {
    label: 'Shopping Visibility',
    activeText: 'Analyzing product mentions across AI models...',
    doneText: 'Product analysis complete'
  },
  brand: {
    label: 'Brand Perception',
    activeText: 'Gathering brand perception data...',
    doneText: 'Brand perception mapped'
  },
  conversations: {
    label: 'Conversation Topics',
    activeText: 'Discovering conversation patterns...',
    doneText: 'Conversation topics identified'
  },
  website: {
    label: 'Website Structure',
    activeText: 'Validating schema and structure...',
    doneText: 'Website analysis complete'
  }
}

const MODULE_ORDER: (keyof typeof MODULE_CONFIG)[] = ['shopping', 'brand', 'conversations', 'website']

export default function ScanProgressInline({ scanId }: ScanProgressInlineProps) {
  const router = useRouter()
  const [targetProgress, setTargetProgress] = useState(0)
  const [displayProgress, setDisplayProgress] = useState(0)
  const [moduleStatus, setModuleStatus] = useState<ModuleStatus>({
    shopping: 'pending',
    brand: 'pending',
    conversations: 'pending',
    website: 'pending',
  })
  const [isComplete, setIsComplete] = useState(false)
  const [hasFailed, setHasFailed] = useState(false)
  const animationRef = useRef<number>()

  // Smooth progress animation using requestAnimationFrame
  useEffect(() => {
    const animate = () => {
      setDisplayProgress(prev => {
        const diff = targetProgress - prev
        if (Math.abs(diff) < 0.1) return targetProgress
        const step = diff * 0.08
        return prev + step
      })
      animationRef.current = requestAnimationFrame(animate)
    }
    
    animationRef.current = requestAnimationFrame(animate)
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [targetProgress])

  // Poll scan status
  useEffect(() => {
    if (!scanId) return

    const fetchStatus = async () => {
      try {
        const response = await fetch(`/api/scan/status/${scanId}`)
        if (!response.ok) return false
        
        const data = await response.json()
        
        setTargetProgress(data.progress || 0)
        setModuleStatus(data.modules || moduleStatus)

        if (data.status === 'done' && data.progress === 100) {
          setIsComplete(true)
          setTimeout(() => {
            window.location.reload()
          }, 2000)
          return true
        } else if (data.status === 'failed') {
          setHasFailed(true)
          return true
        }
        return false
      } catch (error) {
        console.error('Failed to fetch scan status:', error)
        return false
      }
    }

    fetchStatus()
    const pollInterval = setInterval(async () => {
      const shouldStop = await fetchStatus()
      if (shouldStop) clearInterval(pollInterval)
    }, 1200)

    return () => clearInterval(pollInterval)
  }, [scanId, router])

  const completedCount = Object.values(moduleStatus).filter(s => s === 'done').length
  const currentModule = MODULE_ORDER.find(m => moduleStatus[m] === 'running')

  return (
    <div className="w-full">
      {/* Main Progress Card - respects light/dark mode */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
        {/* Content */}
        <div className="relative z-10 p-8 lg:p-10">
          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <h2 className="text-2xl lg:text-3xl font-heading font-bold text-primary mb-2">
                {isComplete ? 'Analysis Complete' : hasFailed ? 'Scan Failed' : 'Analyzing Your Brand'}
              </h2>
              <p className="text-secondary/60 text-base lg:text-lg">
                {isComplete 
                  ? 'Your AI visibility report is ready. Loading results...'
                  : hasFailed
                  ? 'Something went wrong. Please try again.'
                  : 'Scanning ChatGPT, Claude, Gemini, and Perplexity'
                }
              </p>
            </div>
            
            {/* Percentage */}
            <div className="text-right">
              <div className="text-4xl lg:text-5xl font-heading font-bold text-primary tabular-nums">
                {Math.round(displayProgress)}%
              </div>
              <div className="text-secondary/40 text-sm mt-1">
                {completedCount} of 4 complete
              </div>
            </div>
          </div>

          {/* Main Progress Bar */}
          <div className="mb-10">
            <div className="h-4 rounded-full overflow-hidden bg-border/50">
              <div
                className="h-full rounded-full relative overflow-hidden"
                style={{ 
                  width: `${displayProgress}%`,
                  background: hasFailed 
                    ? '#EF4444' 
                    : 'linear-gradient(90deg, #3B82F6 0%, #8B5CF6 40%, #EC4899 100%)',
                  transition: 'none'
                }}
              >
                {/* Shimmer effect */}
                {!isComplete && !hasFailed && (
                  <div 
                    className="absolute inset-0"
                    style={{
                      background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
                      backgroundSize: '200% 100%',
                      animation: 'shimmer 2s infinite linear'
                    }}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Module Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MODULE_ORDER.map((module) => {
              const config = MODULE_CONFIG[module]
              const status = moduleStatus[module]
              const isActive = status === 'running'
              const isDone = status === 'done'
              const isFailed = status === 'failed'
              
              return (
                <div
                  key={module}
                  className={`
                    relative p-5 rounded-xl transition-all duration-500 border
                    ${isActive ? 'bg-blue-500/5 border-blue-500/20' : 'bg-muted/30 border-transparent'}
                    ${isDone ? 'bg-emerald-500/5 border-emerald-500/20' : ''}
                  `}
                >
                  <div className="flex items-center gap-4">
                    {/* Status Indicator */}
                    <div className="flex-shrink-0">
                      {isDone && (
                        <div className="w-10 h-10 rounded-full bg-emerald-500/15 flex items-center justify-center">
                          <Check className="w-5 h-5 text-emerald-500" strokeWidth={2.5} />
                        </div>
                      )}
                      {isActive && (
                        <div className="w-10 h-10 rounded-full bg-blue-500/15 flex items-center justify-center">
                          <Loader2 className="w-5 h-5 text-blue-500 animate-spin" strokeWidth={2.5} />
                        </div>
                      )}
                      {isFailed && (
                        <div className="w-10 h-10 rounded-full bg-red-500/15 flex items-center justify-center">
                          <AlertTriangle className="w-5 h-5 text-red-500" strokeWidth={2.5} />
                        </div>
                      )}
                      {status === 'pending' && (
                        <div className="w-10 h-10 rounded-full border-2 border-border" />
                      )}
                    </div>

                    {/* Module Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`font-semibold ${isDone ? 'text-emerald-600 dark:text-emerald-400' : 'text-primary'}`}>
                          {config.label}
                        </span>
                        {isDone && (
                          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Done</span>
                        )}
                      </div>
                      <p className="text-sm text-secondary/50 truncate">
                        {isDone 
                          ? config.doneText 
                          : isActive 
                          ? config.activeText
                          : isFailed
                          ? 'Analysis failed'
                          : 'Waiting...'
                        }
                      </p>
                    </div>
                  </div>

                  {/* Individual Progress Bar for Active Module */}
                  {isActive && (
                    <div className="mt-4 h-2 rounded-full overflow-hidden bg-blue-500/10">
                      <div 
                        className="h-full rounded-full"
                        style={{ 
                          width: '70%',
                          background: 'linear-gradient(90deg, #3B82F6 0%, #8B5CF6 100%)',
                          animation: 'pulse 1.5s ease-in-out infinite'
                        }}
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-border flex items-center justify-between">
            <p className="text-secondary/40 text-sm">
              {isComplete 
                ? 'Preparing your dashboard...'
                : currentModule
                ? `Currently analyzing: ${MODULE_CONFIG[currentModule].label}`
                : 'Initializing scan...'
              }
            </p>
            {!isComplete && !hasFailed && (
              <p className="text-secondary/40 text-sm">
                Usually takes 2-3 minutes
              </p>
            )}
          </div>
        </div>

        {/* Success Overlay */}
        {isComplete && (
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/10 to-transparent pointer-events-none" />
        )}
      </div>

      {/* Global Keyframes */}
      <style jsx global>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
      `}</style>
    </div>
  )
}