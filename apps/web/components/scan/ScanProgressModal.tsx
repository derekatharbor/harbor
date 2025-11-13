// components/scan/ScanProgressModal.tsx

'use client'

import { useEffect, useState } from 'react'
import { X, CheckCircle, Loader2 } from 'lucide-react'

interface ScanProgressModalProps {
  isOpen: boolean
  onClose: () => void
  scanId: string | null
}

interface ScanProgress {
  currentModule: string
  status: 'queued' | 'running' | 'done'
  progress: number
  message: string
  modules: {
    shopping: 'pending' | 'running' | 'done' | 'failed'
    brand: 'pending' | 'running' | 'done' | 'failed'
    conversations: 'pending' | 'running' | 'done' | 'failed'
    website: 'pending' | 'running' | 'done' | 'failed'
  }
}

const progressMessages = [
  { progress: 0, message: 'Initializing scan...', module: 'setup' },
  { progress: 10, message: 'Querying ChatGPT about your products...', module: 'shopping' },
  { progress: 20, message: 'Checking Claude for product mentions...', module: 'shopping' },
  { progress: 30, message: 'Analyzing Gemini recommendations...', module: 'shopping' },
  { progress: 40, message: 'Gathering brand perception data...', module: 'brand' },
  { progress: 50, message: 'Analyzing brand descriptors across models...', module: 'brand' },
  { progress: 60, message: 'Identifying conversation patterns...', module: 'conversations' },
  { progress: 70, message: 'Categorizing user questions by intent...', module: 'conversations' },
  { progress: 80, message: 'Crawling website structure...', module: 'website' },
  { progress: 90, message: 'Validating schema markup...', module: 'website' },
  { progress: 95, message: 'Computing visibility scores...', module: 'finalize' },
  { progress: 100, message: 'Scan complete!', module: 'done' },
]

export default function ScanProgressModal({ isOpen, onClose, scanId }: ScanProgressModalProps) {
  const [progress, setProgress] = useState(0)
  const [currentMessage, setCurrentMessage] = useState(progressMessages[0].message)
  const [moduleStatus, setModuleStatus] = useState<ScanProgress['modules']>({
    shopping: 'pending',
    brand: 'pending',
    conversations: 'pending',
    website: 'pending',
  })
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    if (!isOpen || !scanId) return

    // Simulate progress (in reality, we'd poll /api/scan/status/:scanId)
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsComplete(true)
          return 100
        }

        const nextProgress = Math.min(prev + 5, 100)
        
        // Update message based on progress
        const currentMsg = progressMessages.find(m => m.progress <= nextProgress && m.progress > prev)
        if (currentMsg) {
          setCurrentMessage(currentMsg.message)
          
          // Update module status
          if (currentMsg.module === 'shopping') {
            setModuleStatus(s => ({ ...s, shopping: 'running' }))
          } else if (currentMsg.module === 'brand') {
            setModuleStatus(s => ({ ...s, shopping: 'done', brand: 'running' }))
          } else if (currentMsg.module === 'conversations') {
            setModuleStatus(s => ({ ...s, brand: 'done', conversations: 'running' }))
          } else if (currentMsg.module === 'website') {
            setModuleStatus(s => ({ ...s, conversations: 'done', website: 'running' }))
          } else if (currentMsg.module === 'done') {
            setModuleStatus(s => ({ ...s, website: 'done' }))
          }
        }

        return nextProgress
      })
    }, 800) // Update every 800ms

    return () => clearInterval(interval)
  }, [isOpen, scanId])

  const getModuleIcon = (status: 'pending' | 'running' | 'done' | 'failed') => {
    if (status === 'done') return <CheckCircle className="w-5 h-5 text-[var(--pageAccent)]" strokeWidth={2} />
    if (status === 'running') return <Loader2 className="w-5 h-5 text-[var(--pageAccent)] animate-spin" strokeWidth={2} />
    return <div className="w-5 h-5 rounded-full border-2 border-white/10"></div>
  }

  const handleClose = () => {
    if (isComplete) {
      // Reload page to show new data
      window.location.reload()
    } else {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#0B1521] border border-white/10 rounded-lg max-w-lg w-full p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-heading font-bold text-white">
            {isComplete ? 'Scan Complete!' : 'Running Scan'}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 text-softgray/60" strokeWidth={2} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-body text-white">{currentMessage}</span>
            <span className="text-sm font-body font-bold text-[var(--pageAccent)] tabular-nums">
              {progress}%
            </span>
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--pageAccent)] rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Module Status */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02]">
            {getModuleIcon(moduleStatus.shopping)}
            <div className="flex-1">
              <div className="text-sm font-body font-medium text-white">Shopping Visibility</div>
              <div className="text-xs text-softgray/60 font-body">
                {moduleStatus.shopping === 'done' ? 'Complete' : moduleStatus.shopping === 'running' ? 'Analyzing products...' : 'Queued'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02]">
            {getModuleIcon(moduleStatus.brand)}
            <div className="flex-1">
              <div className="text-sm font-body font-medium text-white">Brand Visibility</div>
              <div className="text-xs text-softgray/60 font-body">
                {moduleStatus.brand === 'done' ? 'Complete' : moduleStatus.brand === 'running' ? 'Gathering perception data...' : 'Queued'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02]">
            {getModuleIcon(moduleStatus.conversations)}
            <div className="flex-1">
              <div className="text-sm font-body font-medium text-white">Conversation Volumes</div>
              <div className="text-xs text-softgray/60 font-body">
                {moduleStatus.conversations === 'done' ? 'Complete' : moduleStatus.conversations === 'running' ? 'Analyzing questions...' : 'Queued'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02]">
            {getModuleIcon(moduleStatus.website)}
            <div className="flex-1">
              <div className="text-sm font-body font-medium text-white">Website Analytics</div>
              <div className="text-xs text-softgray/60 font-body">
                {moduleStatus.website === 'done' ? 'Complete' : moduleStatus.website === 'running' ? 'Validating schema...' : 'Queued'}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        {isComplete ? (
          <div className="flex items-center justify-between p-4 rounded-lg bg-[var(--pageAccent)]/10 border border-[var(--pageAccent)]/30">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-[var(--pageAccent)]" strokeWidth={2} />
              <div className="text-sm font-body text-white">
                All modules scanned successfully
              </div>
            </div>
            <button
              onClick={handleClose}
              className="px-4 py-2 bg-[var(--pageAccent)] hover:brightness-110 text-white rounded-lg text-sm font-body font-medium transition-all cursor-pointer"
            >
              View Results
            </button>
          </div>
        ) : (
          <div className="text-xs text-softgray/60 font-body text-center">
            This may take 2-3 minutes. You can close this window and we'll notify you when complete.
          </div>
        )}
      </div>
    </div>
  )
}
