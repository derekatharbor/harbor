// components/scan/ScanProgressModal.tsx

'use client'

import { useEffect, useState } from 'react'
import { X, CheckCircle, Loader2, AlertCircle } from 'lucide-react'

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

export default function ScanProgressModal({ isOpen, onClose, scanId }: ScanProgressModalProps) {
  const [progress, setProgress] = useState(0)
  const [currentMessage, setCurrentMessage] = useState('Initializing scan...')
  const [moduleStatus, setModuleStatus] = useState<ModuleStatus>({
    shopping: 'pending',
    brand: 'pending',
    conversations: 'pending',
    website: 'pending',
  })
  const [isComplete, setIsComplete] = useState(false)
  const [hasFailed, setHasFailed] = useState(false)

  useEffect(() => {
    if (!isOpen || !scanId) return

    // Poll for actual scan status
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/scan/status/${scanId}`)
        const data: ScanStatusResponse = await response.json()

        setProgress(data.progress)
        setCurrentMessage(data.message)
        setModuleStatus(data.modules)

        if (data.status === 'done') {
          setIsComplete(true)
          clearInterval(pollInterval)
        } else if (data.status === 'failed') {
          setHasFailed(true)
          clearInterval(pollInterval)
        }
      } catch (error) {
        console.error('Failed to fetch scan status:', error)
      }
    }, 2000) // Poll every 2 seconds

    return () => clearInterval(pollInterval)
  }, [isOpen, scanId])

  const getModuleIcon = (status: 'pending' | 'running' | 'done' | 'failed') => {
    if (status === 'done') return <CheckCircle className="w-5 h-5 text-[var(--pageAccent)]" strokeWidth={2} />
    if (status === 'failed') return <AlertCircle className="w-5 h-5 text-coral" strokeWidth={2} />
    if (status === 'running') return <Loader2 className="w-5 h-5 text-[var(--pageAccent)] animate-spin" strokeWidth={2} />
    return <div className="w-5 h-5 rounded-full border-2 border-white/10"></div>
  }

  const getModuleMessage = (module: string, status: 'pending' | 'running' | 'done' | 'failed') => {
    if (status === 'done') return 'Complete'
    if (status === 'failed') return 'Failed'
    if (status === 'pending') return 'Queued'
    
    // Running messages
    const messages: Record<string, string> = {
      shopping: 'Analyzing products...',
      brand: 'Gathering perception data...',
      conversations: 'Analyzing questions...',
      website: 'Validating schema...'
    }
    return messages[module] || 'Processing...'
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
            {isComplete ? 'Scan Complete!' : hasFailed ? 'Scan Failed' : 'Running Scan'}
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
              className={`h-full rounded-full transition-all duration-500 ease-out ${
                hasFailed ? 'bg-coral' : 'bg-[var(--pageAccent)]'
              }`}
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
                {getModuleMessage('shopping', moduleStatus.shopping)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02]">
            {getModuleIcon(moduleStatus.brand)}
            <div className="flex-1">
              <div className="text-sm font-body font-medium text-white">Brand Visibility</div>
              <div className="text-xs text-softgray/60 font-body">
                {getModuleMessage('brand', moduleStatus.brand)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02]">
            {getModuleIcon(moduleStatus.conversations)}
            <div className="flex-1">
              <div className="text-sm font-body font-medium text-white">Conversation Volumes</div>
              <div className="text-xs text-softgray/60 font-body">
                {getModuleMessage('conversations', moduleStatus.conversations)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02]">
            {getModuleIcon(moduleStatus.website)}
            <div className="flex-1">
              <div className="text-sm font-body font-medium text-white">Website Analytics</div>
              <div className="text-xs text-softgray/60 font-body">
                {getModuleMessage('website', moduleStatus.website)}
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
        ) : hasFailed ? (
          <div className="flex items-center justify-between p-4 rounded-lg bg-coral/10 border border-coral/30">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-coral" strokeWidth={2} />
              <div className="text-sm font-body text-white">
                Scan encountered errors
              </div>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-body font-medium transition-all cursor-pointer"
            >
              Close
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