// apps/web/components/scan/ScanButton.tsx

'use client'

import { useState, useEffect } from 'react'
import { Play, Clock, Ban } from 'lucide-react'
import ScanProgressModal from './ScanProgressModal'
import { useBrand } from '@/contexts/BrandContext'

interface ScanButtonProps {
  variant?: 'default' | 'large'
}

export default function ScanButton({ variant = 'default' }: ScanButtonProps) {
  const { currentDashboard } = useBrand()
  const [isScanning, setIsScanning] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [currentScanId, setCurrentScanId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isOnCooldown, setIsOnCooldown] = useState(false)
  const [limitReached, setLimitReached] = useState(false)
  const [cooldownMessage, setCooldownMessage] = useState<string>('')

  // Check for active scan on mount
  useEffect(() => {
    if (!currentDashboard) return
    checkActiveScan()
  }, [currentDashboard])

  const checkActiveScan = async () => {
    if (!currentDashboard) return

    try {
      const res = await fetch(`/api/scan/latest?dashboardId=${currentDashboard.id}`)
      const data = await res.json()

      if (data.scan?.status === 'running' || data.scan?.status === 'queued') {
        setIsScanning(true)
        setCurrentScanId(data.scan.id)
      }
    } catch (error) {
      console.error('Error checking active scan:', error)
    }
  }

  const handleStartScan = async () => {
    if (!currentDashboard) {
      setError('No dashboard selected')
      return
    }

    setError(null)
    setIsScanning(true)

    try {
      const res = await fetch('/api/scan/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dashboardId: currentDashboard.id }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (res.status === 429) {
          setLimitReached(true)
          setCooldownMessage(data.error)
          setIsOnCooldown(true)
        }
        throw new Error(data.error || 'Failed to start scan')
      }

      setCurrentScanId(data.scan.id)
      setShowModal(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start scan')
      setIsScanning(false)
    }
  }

  const handleScanComplete = () => {
    setIsScanning(false)
    setShowModal(false)
    setCurrentScanId(null)
    window.location.reload() // Refresh to show new data
  }

  const handleCloseModal = () => {
    setShowModal(false)
    // Scan continues in background
  }

  if (!currentDashboard) {
    return (
      <button
        disabled
        className="px-6 py-3 bg-white/5 text-softgray/40 rounded-lg cursor-not-allowed"
      >
        No dashboard selected
      </button>
    )
  }

  if (limitReached || isOnCooldown) {
    return (
      <div className="flex items-center gap-3">
        <button
          disabled
          className="flex items-center gap-2 px-6 py-3 bg-white/5 text-softgray/40 rounded-lg cursor-not-allowed"
        >
          <Ban className="w-4 h-4" />
          <span>Limit Reached</span>
        </button>
        {cooldownMessage && (
          <p className="text-sm text-softgray/60">{cooldownMessage}</p>
        )}
      </div>
    )
  }

  if (isScanning) {
    return (
      <>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-cerulean/20 text-cerulean rounded-lg hover:bg-cerulean/30 transition-colors"
        >
          <Clock className="w-4 h-4 animate-spin" />
          <span>Scanning...</span>
        </button>

        {currentScanId && (
          <ScanProgressModal
            scanId={currentScanId}
            isOpen={showModal}
            onClose={handleCloseModal}
            onComplete={handleScanComplete}
          />
        )}
      </>
    )
  }

  return (
    <>
      <button
        onClick={handleStartScan}
        className={`
          flex items-center justify-center gap-2 rounded-lg font-medium
          transition-all cursor-pointer
          bg-coral hover:bg-coral/90 text-white
          ${variant === 'large' ? 'px-8 py-4 text-base' : 'px-6 py-3 text-sm'}
        `}
      >
        <Play className="w-4 h-4" fill="currentColor" />
        <span>Run Fresh Scan</span>
      </button>

      {error && (
        <p className="text-sm text-coral mt-2">{error}</p>
      )}
    </>
  )
}