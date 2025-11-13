// components/scan/ScanButton.tsx

'use client'

import { useState, useEffect } from 'react'
import { RefreshCw, Zap, Lock } from 'lucide-react'

interface ScanButtonProps {
  onScanStart: () => void
  className?: string
}

interface ScanStatus {
  canScan: boolean
  reason: 'ready' | 'scanning' | 'cooldown' | 'limit_reached'
  scansRemaining: number
  totalScans: number
  nextAvailableAt: string | null
  planTier: 'free' | 'pro' | 'premium'
  hasUsedFreeScan: boolean
}

export default function ScanButton({ onScanStart, className = '' }: ScanButtonProps) {
  const [status, setStatus] = useState<ScanStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [cooldownTime, setCooldownTime] = useState<string>('')

  useEffect(() => {
    fetchScanStatus()
  }, [])

  // Poll for status updates while scanning
  useEffect(() => {
    if (status?.reason !== 'scanning') return

    const pollInterval = setInterval(() => {
      fetchScanStatus()
    }, 3000) // Poll every 3 seconds while scanning

    return () => clearInterval(pollInterval)
  }, [status?.reason])

  // Countdown timer for cooldown
  useEffect(() => {
    if (!status?.nextAvailableAt) return

    const interval = setInterval(() => {
      const now = new Date()
      const nextScan = new Date(status.nextAvailableAt!)
      const diff = nextScan.getTime() - now.getTime()

      if (diff <= 0) {
        setCooldownTime('')
        fetchScanStatus() // Refresh status
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60))
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        setCooldownTime(`${hours}h ${minutes}m`)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [status?.nextAvailableAt])

  const fetchScanStatus = async () => {
    try {
      const response = await fetch('/api/scan/status')
      const data = await response.json()
      setStatus(data)
    } catch (error) {
      console.error('Failed to fetch scan status:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleScan = async () => {
    if (!status?.canScan) return

    try {
      onScanStart()
      // Wait a moment before refreshing to let backend update
      setTimeout(() => {
        fetchScanStatus()
      }, 500)
    } catch (error) {
      console.error('Failed to start scan:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg">
        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
        <span className="text-sm text-softgray/60 font-body">Loading...</span>
      </div>
    )
  }

  if (!status) return null

  // FREE TIER - Used their one scan
  if (status.planTier === 'free' && status.hasUsedFreeScan) {
    return (
      <div className={`flex flex-col gap-2 ${className}`}>
        <button
          disabled
          className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg opacity-50 cursor-not-allowed"
        >
          <Lock className="w-4 h-4 text-softgray/40" strokeWidth={2} />
          <span className="text-sm font-body font-medium text-softgray/40">
            Upgrade to Scan
          </span>
        </button>
        <div className="text-xs text-softgray/60 font-body">
          You've used your free scan.{' '}
          <a href="/pricing" className="text-[var(--pageAccent)] hover:underline font-medium">
            Upgrade to Pro
          </a>
          {' '}for 10 scans/month
        </div>
      </div>
    )
  }

  // LIMIT REACHED
  if (status.reason === 'limit_reached') {
    return (
      <div className={`flex flex-col gap-2 ${className}`}>
        <button
          disabled
          className="flex items-center gap-2 px-4 py-2.5 bg-coral/10 border border-coral/30 rounded-lg opacity-60 cursor-not-allowed"
        >
          <Lock className="w-4 h-4 text-coral" strokeWidth={2} />
          <span className="text-sm font-body font-medium text-coral">
            Scan Limit Reached
          </span>
        </button>
        <div className="text-xs text-softgray/60 font-body">
          {status.scansRemaining} of {status.totalScans} scans used this month.{' '}
          {status.planTier === 'pro' ? (
            <a href="/pricing" className="text-[var(--pageAccent)] hover:underline font-medium">
              Upgrade to Premium
            </a>
          ) : (
            <span>Resets next month</span>
          )}
        </div>
      </div>
    )
  }

  // COOLDOWN
  if (status.reason === 'cooldown') {
    return (
      <div className={`flex flex-col gap-2 ${className}`}>
        <button
          disabled
          className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg opacity-60 cursor-not-allowed"
        >
          <RefreshCw className="w-4 h-4 text-softgray/40" strokeWidth={2} />
          <span className="text-sm font-body font-medium text-softgray/60">
            Next scan in {cooldownTime}
          </span>
        </button>
        <div className="text-xs text-softgray/60 font-body">
          {status.scansRemaining} of {status.totalScans} scans remaining this month
        </div>
      </div>
    )
  }

  // SCANNING
  if (status.reason === 'scanning') {
    return (
      <div className={`flex flex-col gap-2 ${className}`}>
        <button
          disabled
          className="flex items-center gap-2 px-4 py-2.5 bg-[var(--pageAccent)]/20 border border-[var(--pageAccent)]/40 rounded-lg cursor-not-allowed"
        >
          <RefreshCw className="w-4 h-4 text-[var(--pageAccent)] animate-spin" strokeWidth={2} />
          <span className="text-sm font-body font-medium text-[var(--pageAccent)]">
            Scanning...
          </span>
        </button>
        <div className="text-xs text-softgray/60 font-body">
          This may take 2-3 minutes
        </div>
      </div>
    )
  }

  // READY TO SCAN
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <button
        onClick={handleScan}
        className="flex items-center gap-2 px-4 py-2.5 bg-transparent hover:bg-[var(--pageAccent)] border border-[var(--pageAccent)]/40 hover:border-[var(--pageAccent)] rounded-lg transition-all cursor-pointer group outline-none focus:ring-2 focus:ring-[var(--pageAccent)]/50"
      >
        <Zap className="w-4 h-4 text-[var(--pageAccent)] group-hover:text-white group-hover:scale-110 transition-all" strokeWidth={2} />
        <span className="text-sm font-body font-medium text-[var(--pageAccent)] group-hover:text-white transition-colors">
          Run Fresh Scan
        </span>
      </button>
      <div className="text-xs text-softgray/60 font-body">
        {status.scansRemaining} of {status.totalScans} scans remaining this month
      </div>
    </div>
  )
}