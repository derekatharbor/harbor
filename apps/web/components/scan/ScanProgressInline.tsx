// components/scan/ScanProgressInline.tsx
// Inline progress display for overview page during first scan

'use client'

import { useEffect, useState } from 'react'
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
    description: 'Analyzing product mentions across AI models',
    doneText: 'Products analyzed'
  },
  brand: {
    label: 'Brand Visibility', 
    description: 'Gathering brand perception data',
    doneText: 'Perception mapped'
  },
  conversations: {
    label: 'Conversation Volumes',
    description: 'Analyzing conversation topics',
    doneText: 'Topics identified'
  },
  website: {
    label: 'Website Analytics',
    description: 'Validating website structure',
    doneText: 'Structure validated'
  }
}

export default function ScanProgressInline({ scanId }: ScanProgressInlineProps) {
  const router = useRouter()
  const [progress, setProgress] = useState(0)
  const [moduleStatus, setModuleStatus] = useState<ModuleStatus>({
    shopping: 'pending',
    brand: 'pending',
    conversations: 'pending',
    website: 'pending',
  })
  const [isComplete, setIsComplete] = useState(false)
  const [hasFailed, setHasFailed] = useState(false)

  // Poll scan status
  useEffect(() => {
    if (!scanId) return

    const fetchStatus = async () => {
      try {
        const response = await fetch(`/api/scan/status/${scanId}`)
        
        if (!response.ok) return false
        
        const data = await response.json()
        
        setProgress(data.progress || 0)
        setModuleStatus(data.modules || moduleStatus)

        if (data.status === 'done' && data.progress === 100) {
          setIsComplete(true)
          // Auto-refresh page after short delay
          setTimeout(() => {
            router.refresh()
            window.location.reload()
          }, 1500)
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
      if (shouldStop) {
        clearInterval(pollInterval)
      }
    }, 1500)

    return () => clearInterval(pollInterval)
  }, [scanId, router])

  const completedCount = Object.values(moduleStatus).filter(s => s === 'done').length

  return (
    <div className="max-w-3xl">
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-xl font-heading font-bold text-primary">
              {isComplete ? 'Scan Complete' : hasFailed ? 'Scan Failed' : 'Analyzing your brand'}
            </h2>
            <span className="text-sm font-semibold text-primary tabular-nums">
              {Math.round(progress)}%
            </span>
          </div>
          <p className="text-sm text-secondary/60">
            {isComplete 
              ? 'Your AI visibility data is ready. Loading results...'
              : hasFailed
              ? 'Something went wrong. Please try again.'
              : `Scanning across ChatGPT, Claude, Gemini, and Perplexity`
            }
          </p>
        </div>

        {/* Overall Progress Bar - Blue Gradient */}
        <div className="px-6 pb-4">
          <div className="h-2 rounded-full overflow-hidden bg-[#101A31]/10">
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{ 
                width: `${progress}%`,
                background: hasFailed 
                  ? '#EF4444' 
                  : 'linear-gradient(90deg, #3B82F6 0%, #8B5CF6 50%, #EC4899 100%)'
              }}
            />
          </div>
        </div>

        {/* Module Progress */}
        <div className="px-6 pb-6 space-y-3">
          {(Object.keys(MODULE_CONFIG) as Array<keyof typeof MODULE_CONFIG>).map((module) => {
            const config = MODULE_CONFIG[module]
            const status = moduleStatus[module]
            
            return (
              <div
                key={module}
                className={`
                  flex items-center gap-4 p-4 rounded-lg transition-all
                  ${status === 'running' ? 'bg-blue-500/5 border border-blue-500/20' : 'bg-[#F8FAFC]'}
                `}
              >
                {/* Status Icon */}
                <div className="flex-shrink-0">
                  {status === 'done' && (
                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                      <Check className="w-4 h-4 text-emerald-500" strokeWidth={2.5} />
                    </div>
                  )}
                  {status === 'running' && (
                    <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                      <Loader2 className="w-4 h-4 text-blue-500 animate-spin" strokeWidth={2.5} />
                    </div>
                  )}
                  {status === 'failed' && (
                    <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center">
                      <AlertTriangle className="w-4 h-4 text-red-500" strokeWidth={2.5} />
                    </div>
                  )}
                  {status === 'pending' && (
                    <div className="w-8 h-8 rounded-full border-2 border-gray-200" />
                  )}
                </div>

                {/* Module Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-primary">
                      {config.label}
                    </span>
                    {status === 'done' && (
                      <span className="text-xs text-emerald-600 font-medium">Complete</span>
                    )}
                  </div>
                  <p className="text-xs text-secondary/50 mt-0.5">
                    {status === 'done' 
                      ? config.doneText 
                      : status === 'running' 
                      ? config.description
                      : status === 'failed'
                      ? 'Analysis failed'
                      : 'Waiting...'
                    }
                  </p>
                </div>

                {/* Individual Progress Bar */}
                {status === 'running' && (
                  <div className="w-24 h-1.5 rounded-full overflow-hidden bg-blue-500/10">
                    <div 
                      className="h-full rounded-full animate-pulse"
                      style={{ 
                        width: '60%',
                        background: 'linear-gradient(90deg, #3B82F6 0%, #8B5CF6 100%)'
                      }}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#F8FAFC] border-t border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs text-secondary/50">
              {isComplete 
                ? 'Redirecting to your results...'
                : `${completedCount} of 4 modules complete`
              }
            </span>
            {!isComplete && !hasFailed && (
              <span className="text-xs text-secondary/50">
                Usually takes 2-3 minutes
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
