// apps/web/components/RescanButton.tsx
'use client'

import { useState, useEffect } from 'react'
import { Loader2, RefreshCw, Clock } from 'lucide-react'

interface RescanButtonProps {
  slug: string
  onSuccess?: (data: any) => void
}

interface RescanStatus {
  canRescan: boolean
  scansRemaining: number
  lastScannedAt: string | null
  cooldownEndsAt: string | null
  reason?: string
}

export function RescanButton({ slug, onSuccess }: RescanButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<RescanStatus | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [timeUntilCooldown, setTimeUntilCooldown] = useState<string>('')

  // Fetch re-scan availability status
  const fetchStatus = async () => {
    try {
      const res = await fetch(`/api/brands/${slug}/rescan`)
      const data = await res.json()
      setStatus(data)
    } catch (err) {
      console.error('Error fetching re-scan status:', err)
    }
  }

  useEffect(() => {
    fetchStatus()
  }, [slug])

  // Update cooldown timer
  useEffect(() => {
    if (!status?.cooldownEndsAt) {
      setTimeUntilCooldown('')
      return
    }

    const updateTimer = () => {
      const now = Date.now()
      const cooldownEnd = new Date(status.cooldownEndsAt).getTime()
      const diff = cooldownEnd - now

      if (diff <= 0) {
        setTimeUntilCooldown('')
        fetchStatus() // Refresh status
        return
      }

      const minutes = Math.floor(diff / 60000)
      const seconds = Math.floor((diff % 60000) / 1000)
      setTimeUntilCooldown(`${minutes}m ${seconds}s`)
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [status?.cooldownEndsAt])

  const handleRescan = async () => {
    setIsLoading(true)
    setError(null)
    setSuccessMessage(null)

    try {
      // Start the scan
      const res = await fetch(`/api/brands/${slug}/rescan`, {
        method: 'POST',
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Re-scan failed')
      }

      setSuccessMessage('Scanning... This takes 30-60 seconds.')

      // Poll scan status
      const scanId = data.scanId
      const pollInterval = setInterval(async () => {
        try {
          const statusRes = await fetch(data.statusUrl)
          const statusData = await statusRes.json()

          if (statusData.status === 'done' || statusData.status === 'partial') {
            clearInterval(pollInterval)

            // Update the score with scan results
            const updateRes = await fetch(`/api/brands/${slug}/update-score`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ scanId })
            })

            const updateData = await updateRes.json()

            if (updateRes.ok) {
              setSuccessMessage(updateData.message)
              if (onSuccess) {
                onSuccess(updateData.profile)
              }
              // Refresh page after 2 seconds
              setTimeout(() => window.location.reload(), 2000)
            } else {
              setError('Scan completed but failed to update score')
            }

            setIsLoading(false)
          } else if (statusData.status === 'failed') {
            clearInterval(pollInterval)
            setError('Scan failed. Please try again.')
            setIsLoading(false)
          }
        } catch (pollError) {
          console.error('Polling error:', pollError)
        }
      }, 5000) // Poll every 5 seconds

      // Timeout after 2 minutes
      setTimeout(() => {
        clearInterval(pollInterval)
        if (isLoading) {
          setError('Scan timed out. Please try again.')
          setIsLoading(false)
        }
      }, 120000)

    } catch (err: any) {
      setError(err.message)
      setIsLoading(false)
    }
  }

  if (!status) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>Checking re-scan availability...</span>
      </div>
    )
  }

  const isOnCooldown = status.cooldownEndsAt && timeUntilCooldown

  return (
    <div className="space-y-3">
      {/* Re-scan Button */}
      <button
        onClick={handleRescan}
        disabled={!status.canRescan || isLoading}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
          ${status.canRescan && !isLoading
            ? 'bg-[#FF6B4A] hover:bg-[#FF7A5A] text-white shadow-lg hover:shadow-xl'
            : 'bg-gray-700 text-gray-400 cursor-not-allowed'
          }
        `}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Scanning...</span>
          </>
        ) : (
          <>
            <RefreshCw className="w-4 h-4" />
            <span>Re-scan Profile</span>
          </>
        )}
      </button>

      {/* Status Info */}
      <div className="text-sm space-y-1">
        {/* Scans Remaining */}
        <div className="flex items-center gap-2 text-gray-300">
          <span className="font-mono">
            {status.scansRemaining}/5 scans remaining today
          </span>
        </div>

        {/* Cooldown Timer */}
        {isOnCooldown && (
          <div className="flex items-center gap-2 text-amber-400">
            <Clock className="w-4 h-4" />
            <span>Next scan available in {timeUntilCooldown}</span>
          </div>
        )}

        {/* Last Scanned */}
        {status.lastScannedAt && (
          <div className="text-gray-400 text-xs">
            Last scanned: {new Date(status.lastScannedAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit'
            })}
          </div>
        )}
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
          <p className="text-sm text-green-400">{successMessage}</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Info Text */}
      {!status.canRescan && !error && (
        <div className="p-3 bg-gray-800/50 border border-gray-700 rounded-lg">
          <p className="text-xs text-gray-400">
            {status.reason || 'Re-scan not available. Check back later.'}
          </p>
        </div>
      )}
    </div>
  )
}
