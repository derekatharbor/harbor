// components/scan/ScanProgressModal.tsx
// Redesigned to match Harbor landing page aesthetic

'use client'

import { useEffect, useState } from 'react'
import { X, Check, Loader2, AlertTriangle } from 'lucide-react'

interface ScanProgressModalProps {
  isOpen: boolean
  onClose: () => void
  scanId: string | null
}

interface ModuleStatus {
  shopping: 'pending' | 'running' | 'done' | 'failed'
  brand: 'pending' | 'running' | 'done' | 'failed'
  conversations: 'pending' | 'running' | 'done' | 'failed'
  website: 'pending' | 'running' | 'done' | 'failed'
}

interface ScanStatusResponse {
  status: 'queued' | 'running' | 'partial' | 'failed' | 'done'
  progress: number
  currentModule: string | null
  modules: ModuleStatus
  message: string
}

const MODULE_LABELS = {
  shopping: 'Shopping Visibility',
  brand: 'Brand Visibility',
  conversations: 'Conversation Volumes',
  website: 'Website Analytics'
}

const MODULE_MESSAGES = {
  shopping: {
    running: 'Analyzing product mentions',
    done: 'Products analyzed',
    failed: 'Analysis failed',
    pending: 'Queued'
  },
  brand: {
    running: 'Gathering brand perception',
    done: 'Perception mapped',
    failed: 'Analysis failed',
    pending: 'Queued'
  },
  conversations: {
    running: 'Analyzing conversation topics',
    done: 'Topics identified',
    failed: 'Analysis failed',
    pending: 'Queued'
  },
  website: {
    running: 'Validating website structure',
    done: 'Structure validated',
    failed: 'Validation failed',
    pending: 'Queued'
  }
}

export default function ScanProgressModal({ isOpen, onClose, scanId }: ScanProgressModalProps) {
  const [progress, setProgress] = useState(0)
  const [targetProgress, setTargetProgress] = useState(0)
  const [currentMessage, setCurrentMessage] = useState('Initializing scan')
  const [moduleStatus, setModuleStatus] = useState<ModuleStatus>({
    shopping: 'pending',
    brand: 'pending',
    conversations: 'pending',
    website: 'pending',
  })
  const [isComplete, setIsComplete] = useState(false)
  const [hasFailed, setHasFailed] = useState(false)

  // Smooth progress animation
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev < targetProgress) {
          const diff = targetProgress - prev
          return prev + Math.min(diff * 0.15, 2)
        }
        return prev
      })
    }, 50)

    return () => clearInterval(interval)
  }, [targetProgress])

  // Poll scan status
  useEffect(() => {
    if (!isOpen || !scanId) return

    const fetchStatus = async () => {
      try {
        const response = await fetch(`/api/scan/status/${scanId}`)
        const data: ScanStatusResponse = await response.json()

        setTargetProgress(data.progress)
        setCurrentMessage(data.message)
        setModuleStatus(data.modules)

        if (data.status === 'done' && data.progress === 100) {
          setIsComplete(true)
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
    }, 2000)

    return () => clearInterval(pollInterval)
  }, [isOpen, scanId])

  const handleClose = () => {
    if (isComplete) {
      window.location.reload()
    } else {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={!isComplete && !hasFailed ? handleClose : undefined}
      />

      {/* Modal */}
      <div 
        className="relative w-full max-w-md rounded-xl overflow-hidden shadow-2xl"
        style={{ 
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-strong)'
        }}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center justify-between mb-2">
            <h2 
              className="text-xl font-heading font-semibold"
              style={{ color: 'var(--text-primary)' }}
            >
              {isComplete ? 'Scan Complete' : hasFailed ? 'Scan Failed' : 'Running Scan'}
            </h2>
            <button
              onClick={handleClose}
              className="p-1.5 rounded-lg transition-all hover:bg-white/5"
              style={{ color: 'var(--text-muted)' }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p 
            className="text-sm"
            style={{ color: 'var(--text-secondary)' }}
          >
            {isComplete 
              ? 'Your AI visibility data is ready'
              : hasFailed
              ? 'An error occurred during the scan'
              : 'Analyzing your brand across AI models'}
          </p>
        </div>

        {/* Progress Bar */}
        {!isComplete && !hasFailed && (
          <div className="px-6 pb-4">
            <div className="flex items-center justify-between mb-2">
              <span 
                className="text-sm font-medium"
                style={{ color: 'var(--text-secondary)' }}
              >
                {currentMessage}
              </span>
              <span 
                className="text-sm font-bold tabular-nums"
                style={{ color: 'var(--accent-teal)' }}
              >
                {Math.round(progress)}%
              </span>
            </div>
            <div 
              className="h-1.5 rounded-full overflow-hidden"
              style={{ backgroundColor: 'var(--bg-muted)' }}
            >
              <div
                className="h-full rounded-full transition-all duration-300 ease-out"
                style={{ 
                  width: `${progress}%`,
                  backgroundColor: hasFailed ? '#EF4444' : 'var(--accent-teal)'
                }}
              />
            </div>
          </div>
        )}

        {/* Module List */}
        <div className="px-6 pb-6 space-y-2">
          {Object.entries(moduleStatus).map(([module, status]) => (
            <div
              key={module}
              className="flex items-center gap-3 p-3 rounded-lg transition-colors"
              style={{ 
                backgroundColor: status === 'running' ? 'rgba(34, 211, 238, 0.05)' : 'var(--bg-muted)'
              }}
            >
              {/* Status Icon */}
              <div className="flex-shrink-0">
                {status === 'done' && (
                  <div 
                    className="w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)' }}
                  >
                    <Check className="w-3.5 h-3.5" style={{ color: '#10B981' }} strokeWidth={2.5} />
                  </div>
                )}
                {status === 'running' && (
                  <Loader2 
                    className="w-5 h-5 animate-spin" 
                    style={{ color: 'var(--accent-teal)' }}
                    strokeWidth={2}
                  />
                )}
                {status === 'failed' && (
                  <div 
                    className="w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)' }}
                  >
                    <AlertTriangle className="w-3.5 h-3.5" style={{ color: '#EF4444' }} strokeWidth={2.5} />
                  </div>
                )}
                {status === 'pending' && (
                  <div 
                    className="w-5 h-5 rounded-full"
                    style={{ border: '2px solid var(--border)' }}
                  />
                )}
              </div>

              {/* Module Info */}
              <div className="flex-1 min-w-0">
                <div 
                  className="text-sm font-medium mb-0.5"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {MODULE_LABELS[module as keyof typeof MODULE_LABELS]}
                </div>
                <div 
                  className="text-xs"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {MODULE_MESSAGES[module as keyof typeof MODULE_MESSAGES][status as keyof typeof MODULE_MESSAGES[keyof typeof MODULE_MESSAGES]]}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        {isComplete && (
          <div 
            className="px-6 pb-6"
            style={{ borderTop: '1px solid var(--border)' }}
          >
            <div className="pt-4">
              <button
                onClick={handleClose}
                className="w-full py-3 rounded-lg font-medium transition-all"
                style={{
                  backgroundColor: 'var(--accent-teal)',
                  color: '#0F172A'
                }}
              >
                View Results
              </button>
            </div>
          </div>
        )}

        {hasFailed && (
          <div 
            className="px-6 pb-6"
            style={{ borderTop: '1px solid var(--border)' }}
          >
            <div className="pt-4 space-y-3">
              <p 
                className="text-sm text-center"
                style={{ color: 'var(--text-secondary)' }}
              >
                Please try again or contact support if the issue persists.
              </p>
              <button
                onClick={onClose}
                className="w-full py-3 rounded-lg font-medium transition-all"
                style={{
                  backgroundColor: 'var(--bg-muted)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border)'
                }}
              >
                Close
              </button>
            </div>
          </div>
        )}

        {!isComplete && !hasFailed && (
          <div 
            className="px-6 pb-6"
            style={{ borderTop: '1px solid var(--border)' }}
          >
            <div className="pt-4">
              <p 
                className="text-xs text-center"
                style={{ color: 'var(--text-muted)' }}
              >
                This typically takes 2-3 minutes. You can close this window safely.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}