// apps/web/components/scan/UniversalScanButton.tsx

'use client'

import { useEffect, useState } from 'react'
import { Sparkles } from 'lucide-react'
import { useBrand } from '@/contexts/BrandContext'

interface UniversalScanButtonProps {
  variant?: 'default' | 'large'
}

export default function UniversalScanButton({ variant = 'default' }: UniversalScanButtonProps) {
  const { currentDashboard } = useBrand()
  const [canScan, setCanScan] = useState(true)
  const [scansRemaining, setScansRemaining] = useState(0)
  const [scanStatusReason, setScanStatusReason] = useState<string>('ready')
  const [isCheckingStatus, setIsCheckingStatus] = useState(true)

  // Fetch scan status
  useEffect(() => {
    async function fetchScanStatus() {
      if (!currentDashboard) {
        setIsCheckingStatus(false)
        return
      }

      try {
        const response = await fetch('/api/scan/status')
        if (!response.ok) throw new Error('Failed to fetch scan status')
        
        const status = await response.json()
        setCanScan(status.canScan)
        setScansRemaining(status.scansRemaining)
        setScanStatusReason(status.reason)
      } catch (error) {
        console.error('Error fetching scan status:', error)
        setCanScan(true) // Default to allowing scan if status check fails
      } finally {
        setIsCheckingStatus(false)
      }
    }

    fetchScanStatus()
  }, [currentDashboard])

  const handleStartScan = async () => {
    if (!currentDashboard) {
      console.error('No dashboard selected')
      return
    }

    try {
      const response = await fetch('/api/scan/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dashboardId: currentDashboard.id }),
      })

      const data = await response.json()

      if (data.scan) {
        // Trigger a page reload to show scan progress
        window.location.reload()
      }
    } catch (error) {
      console.error('Failed to start scan:', error)
    }
  }

  const isLarge = variant === 'large'

  if (isLarge) {
    return (
      <button
        onClick={handleStartScan}
        disabled={!canScan || isCheckingStatus}
        className={`
          inline-flex items-center gap-2 px-8 py-4 rounded-lg font-body font-medium transition-all text-base
          ${canScan && !isCheckingStatus
            ? 'bg-transparent border-2 border-[#00C6B7] text-[#00C6B7] hover:bg-[#00C6B7] hover:text-white cursor-pointer'
            : 'bg-transparent border-2 border-border text-secondary/30 cursor-not-allowed'
          }
        `}
      >
        <Sparkles className="w-5 h-5" strokeWidth={2} />
        {isCheckingStatus ? 'Checking...' : scanStatusReason === 'scanning' ? 'Scanning...' : !canScan ? 'Scan Limit Reached' : 'Run Your First Scan'}
      </button>
    )
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        onClick={handleStartScan}
        disabled={!canScan || isCheckingStatus}
        className={`
          inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-body font-medium transition-all text-sm
          ${canScan && !isCheckingStatus
            ? 'bg-transparent border border-[#00C6B7] text-[#00C6B7] hover:bg-[#00C6B7] hover:text-white cursor-pointer'
            : 'bg-transparent border border-border text-secondary/30 cursor-not-allowed'
          }
        `}
      >
        <Sparkles className="w-4 h-4" strokeWidth={2} />
        {isCheckingStatus ? 'Checking...' : scanStatusReason === 'scanning' ? 'Scanning...' : 'Run Fresh Scan'}
      </button>
      <p className="text-xs text-secondary/50">
        {isCheckingStatus ? 'Loading...' : canScan ? `${scansRemaining} scan${scansRemaining !== 1 ? 's' : ''} remaining this week` : 'Scan limit reached'}
      </p>
    </div>
  )
}
