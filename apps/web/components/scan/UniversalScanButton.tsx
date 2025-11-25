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
      
      const response = await fetch('/api/scan/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          dashboardId: currentDashboard.id 
        })
      })
      
      if (!response.ok) {
        const error = await response.json()
        console.error('[Button] Scan failed:', error)
        throw new Error(error.error || 'Failed to start scan')
      }
      
      const data = await response.json()
      console.log('[Button] Scan started:', data.scan.id)
      
      // Immediately open the progress modal with the scan ID
      setCurrentScanId(data.scan.id)
      setShowModal(true)
      
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
      <div 
        className="px-6 py-3 rounded-lg flex items-center justify-center"
        style={{ backgroundColor: 'var(--bg-muted)' }}
      >
        <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--text-muted)' }} />
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
            className="
              group relative
              px-8 py-4
              rounded-xl
              font-heading font-semibold text-lg
              transition-all duration-300
              flex items-center justify-center gap-3
              overflow-hidden
            "
            style={{
              backgroundColor: isScanning ? 'rgba(34, 211, 238, 0.1)' : 'var(--accent-teal)',
              color: isScanning ? 'var(--accent-teal)' : '#0F172A',
              border: isScanning ? '2px solid var(--accent-teal)' : 'none',
              cursor: (!isScanning && scansRemaining <= 0) ? 'not-allowed' : 'pointer',
              opacity: (!isScanning && scansRemaining <= 0) ? 0.5 : 1
            }}
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
              className="text-sm font-medium transition-colors"
              style={{ color: 'var(--accent-teal)' }}
            >
              View Progress →
            </button>
          )}

          {!isScanning && (
            <div className="flex items-center justify-center gap-2">
              {scansRemaining > 0 ? (
                <>
                  <div 
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: 'var(--accent-green)' }}
                  />
                  <p 
                    className="text-sm font-medium"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {scansRemaining} {scansRemaining === 1 ? 'scan' : 'scans'} available this {currentDashboard?.plan === 'solo' ? 'week' : 'month'}
                  </p>
                </>
              ) : (
                <>
                  <div 
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: '#EF4444' }}
                  />
                  <p 
                    className="text-sm font-medium"
                    style={{ color: '#EF4444' }}
                  >
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
          className="
            px-5 py-2.5
            rounded-lg
            font-heading font-semibold text-sm
            transition-all duration-300
            flex items-center gap-2
          "
          style={{
            backgroundColor: isScanning ? 'rgba(34, 211, 238, 0.1)' : 'var(--accent-teal)',
            color: isScanning ? 'var(--accent-teal)' : '#0F172A',
            border: isScanning ? '1px solid var(--accent-teal)' : 'none',
            cursor: (!isScanning && scansRemaining <= 0) ? 'not-allowed' : 'pointer',
            opacity: (!isScanning && scansRemaining <= 0) ? 0.5 : 1
          }}
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
              <div 
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: 'var(--accent-green)' }}
              />
              <p 
                className="text-xs font-medium"
                style={{ color: 'var(--text-secondary)' }}
              >
                {scansRemaining} remaining
              </p>
            </>
          ) : (
            <>
              <div 
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: '#EF4444' }}
              />
              <p 
                className="text-xs font-medium"
                style={{ color: '#EF4444' }}
              >
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