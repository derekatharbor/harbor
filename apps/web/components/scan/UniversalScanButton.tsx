// apps/web/components/scan/UniversalScanButton.tsx
// Fixed: Persistent scan state, teal theme, better copy

'use client'

import { useState, useEffect } from 'react'
import { Loader2, Sparkles } from 'lucide-react'
import { useBrand } from '@/contexts/BrandContext'
import ScanProgressModal from './ScanProgressModal'

interface UniversalScanButtonProps {
  variant?: 'default' | 'large'
}

export default function UniversalScanButton({ variant = 'default' }: UniversalScanButtonProps) {
  const { currentDashboard } = useBrand()
  const [isScanning, setIsScanning] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [currentScanId, setCurrentScanId] = useState<string | null>(null)
  const [checkingStatus, setCheckingStatus] = useState(true)
  
  // Mock scan limits - replace with actual API call
  const scansUsed = 0
  const scansLimit = currentDashboard?.plan === 'solo' ? 1 : 8
  const scansRemaining = scansLimit - scansUsed

  // Check if there's an active scan on mount
  useEffect(() => {
    async function checkActiveScan() {
      if (!currentDashboard) {
        setCheckingStatus(false)
        return
      }

      try {
        // Check for any running scans
        const response = await fetch(`/api/scan/latest?dashboardId=${currentDashboard.id}`)
        if (response.ok) {
          const data = await response.json()
          
          // If last scan is still running, set state
          if (data.status === 'running' || data.status === 'queued') {
            setIsScanning(true)
            setCurrentScanId(data.scan_id)
          }
        }
      } catch (error) {
        console.error('Error checking scan status:', error)
      } finally {
        setCheckingStatus(false)
      }
    }

    checkActiveScan()
  }, [currentDashboard])

  const handleScan = async () => {
    if (!currentDashboard || isScanning) return
    
    setIsScanning(true)
    
    try {
      console.log('[Button] Starting scan for dashboard:', currentDashboard.id)
      
      // Step 1: Create the scan
      const response = await fetch('/api/scan/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          dashboardId: currentDashboard.id 
        })
      })
      
      if (!response.ok) {
        const error = await response.json()
        console.error('[Button] Scan creation failed:', error)
        throw new Error(error.error || 'Failed to start scan')
      }
      
      const data = await response.json()
      const scanId = data.scan.id
      console.log('[Button] Scan created:', scanId)
      
      // Step 2: Open modal immediately
      setCurrentScanId(scanId)
      setShowModal(true)
      
      // Step 3: Trigger the process endpoint (fire and forget)
      console.log('[Button] 🚀 Triggering scan process for scan:', scanId)
      
      fetch('/api/scan/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scanId })
      })
        .then(async res => {
          console.log('[Button] Process response status:', res.status)
          if (!res.ok) {
            const errorText = await res.text()
            console.error('[Button] ❌ Process trigger failed:', res.status, errorText)
          } else {
            const data = await res.json()
            console.log('[Button] ✅ Process triggered successfully:', data)
          }
        })
        .catch(err => {
          console.error('[Button] ❌ Process trigger error:', err.message)
        })
      
    } catch (error) {
      console.error('[Button] Scan error:', error)
      alert(`Failed to start scan: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setIsScanning(false)
    }
  }

  const handleModalClose = () => {
    setShowModal(false)
    // Keep isScanning true and currentScanId - scan is still running in background
  }

  const handleScanComplete = () => {
    setShowModal(false)
    setIsScanning(false)
    setCurrentScanId(null)
  }

  if (checkingStatus) {
    return (
      <div className="px-6 py-3 rounded-lg flex items-center justify-center bg-white/5">
        <Loader2 className="w-5 h-5 animate-spin text-secondary/40" />
      </div>
    )
  }

  if (variant === 'large') {
    return (
      <>
        <div className="flex flex-col gap-4">
          <button
            onClick={isScanning ? () => setShowModal(true) : handleScan}
            disabled={!isScanning && scansRemaining <= 0}
            className={`
              group relative
              px-8 py-4
              rounded-xl
              font-heading font-semibold text-lg
              transition-all duration-200
              flex items-center justify-center gap-3
              overflow-hidden
              ${isScanning 
                ? 'bg-[#009E92]/10 text-[#009E92] border-2 border-[#009E92]' 
                : 'bg-[#009E92] text-white hover:bg-[#008578]'
              }
              ${(!isScanning && scansRemaining <= 0) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            {isScanning ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" strokeWidth={2} />
                <span>Scan in Progress</span>
              </>
            ) : (
              <>
                <Sparkles className="w-6 h-6" strokeWidth={2} />
                <span>Run First Scan</span>
              </>
            )}
          </button>
          
          {isScanning && (
            <button
              onClick={() => setShowModal(true)}
              className="text-sm font-medium text-[#009E92] hover:text-[#008578] transition-colors"
            >
              View Progress →
            </button>
          )}

          {!isScanning && (
            <div className="flex items-center justify-center gap-2">
              {scansRemaining > 0 ? (
                <>
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <p className="text-sm text-secondary/60">
                    {scansRemaining} {scansRemaining === 1 ? 'scan' : 'scans'} available this {currentDashboard?.plan === 'solo' ? 'week' : 'month'}
                  </p>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <p className="text-sm text-red-500">
                    Scan limit reached
                  </p>
                </>
              )}
            </div>
          )}
        </div>

        <ScanProgressModal
          isOpen={showModal}
          onClose={handleModalClose}
          onComplete={handleScanComplete}
          scanId={currentScanId}
        />
      </>
    )
  }

  // Default variant
  return (
    <>
      <div className="flex flex-col items-start lg:items-end gap-2">
        <button
          onClick={isScanning ? () => setShowModal(true) : handleScan}
          disabled={!isScanning && scansRemaining <= 0}
          className={`
            px-5 py-2.5
            rounded-lg
            font-heading font-semibold text-sm
            transition-all duration-200
            flex items-center gap-2
            ${isScanning 
              ? 'bg-[#009E92]/10 text-[#009E92] border border-[#009E92]' 
              : 'bg-[#009E92] text-white hover:bg-[#008578]'
            }
            ${(!isScanning && scansRemaining <= 0) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          {isScanning ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} />
              <span>Scanning...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" strokeWidth={2} />
              <span>Run Scan</span>
            </>
          )}
        </button>
        
        <div className="flex items-center gap-1.5">
          {scansRemaining > 0 ? (
            <>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <p className="text-xs text-secondary/60">
                {scansRemaining} remaining
              </p>
            </>
          ) : (
            <>
              <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
              <p className="text-xs text-red-500">
                Limit reached
              </p>
            </>
          )}
        </div>
      </div>

      <ScanProgressModal
        isOpen={showModal}
        onClose={handleModalClose}
        onComplete={handleScanComplete}
        scanId={currentScanId}
      />
    </>
  )
}