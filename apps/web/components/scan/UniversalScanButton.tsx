// apps/web/components/scan/UniversalScanButton.tsx

'use client'

import { useState } from 'react'
import { RotateCw, Activity } from 'lucide-react'
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
  
  // Mock scan limits - replace with actual API call
  const scansUsed = 0
  const scansLimit = currentDashboard?.plan === 'solo' ? 1 : 8
  const scansRemaining = scansLimit - scansUsed

  const handleScan = async () => {
    if (!currentDashboard || isScanning) return
    
    setIsScanning(true)
    
    try {
      const response = await fetch('/api/scan/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          dashboardId: currentDashboard.id 
        })
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to start scan')
      }
      
      const data = await response.json()
      
      // Open the progress modal with the scan ID
      setCurrentScanId(data.scan.id)
      setShowModal(true)
    } catch (error) {
      console.error('Scan error:', error)
      alert(`Failed to start scan: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setIsScanning(false)
    }
  }

  const handleModalClose = () => {
    setShowModal(false)
    setCurrentScanId(null)
    setIsScanning(false)
  }

  if (variant === 'large') {
    return (
      <>
        <div className="flex flex-col items-center">
          <button
            onClick={handleScan}
            disabled={isScanning || scansRemaining <= 0}
            className="
              group relative
              px-8 py-4
              bg-gradient-to-br from-[#FF6B4A] to-[#FF5533]
              hover:from-[#FF7A59] hover:to-[#FF6644]
              disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed
              text-white font-heading font-bold text-lg
              rounded-xl
              shadow-lg shadow-coral/25
              hover:shadow-xl hover:shadow-coral/35
              disabled:shadow-none
              transition-all duration-300
              cursor-pointer
              flex items-center gap-3
              border border-white/10
              overflow-hidden
            "
          >
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
            
            {/* Scan pulse animation when active */}
            {isScanning && (
              <div className="absolute inset-0 animate-pulse bg-white/10" />
            )}
            
            <div className="relative z-10 flex items-center gap-3">
              {isScanning ? (
                <Activity className="w-6 h-6 animate-pulse" strokeWidth={2.5} />
              ) : (
                <RotateCw 
                  className="w-6 h-6 group-hover:rotate-180 transition-transform duration-500" 
                  strokeWidth={2.5}
                />
              )}
              <span className="tracking-wide">
                {isScanning ? 'Starting Scan...' : 'Refresh Brand Intelligence'}
              </span>
            </div>
          </button>
          
          <div className="mt-3 flex items-center gap-2">
            {scansRemaining > 0 ? (
              <>
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <p className="text-sm text-secondary/80 font-medium">
                  {scansRemaining} {scansRemaining === 1 ? 'scan' : 'scans'} available this {currentDashboard?.plan === 'solo' ? 'week' : 'month'}
                </p>
              </>
            ) : (
              <>
                <div className="w-2 h-2 rounded-full bg-red-400" />
                <p className="text-sm text-red-500 dark:text-red-400 font-medium">
                  Scan limit reached
                </p>
              </>
            )}
          </div>
        </div>

        <ScanProgressModal
          isOpen={showModal}
          onClose={handleModalClose}
          scanId={currentScanId}
        />
      </>
    )
  }

  return (
    <>
      <div className="flex flex-col items-start lg:items-end gap-2">
        <button
          onClick={handleScan}
          disabled={isScanning || scansRemaining <= 0}
          className="
            group relative
            px-5 py-2.5
            bg-gradient-to-br from-[#FF6B4A] to-[#FF5533]
            hover:from-[#FF7A59] hover:to-[#FF6644]
            disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed
            text-white font-heading font-semibold text-sm
            rounded-lg
            shadow-md shadow-coral/20
            hover:shadow-lg hover:shadow-coral/30
            disabled:shadow-none
            transition-all duration-300
            cursor-pointer
            flex items-center gap-2
            border border-white/10
            overflow-hidden
          "
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
          
          {/* Scan pulse when active */}
          {isScanning && (
            <div className="absolute inset-0 animate-pulse bg-white/10" />
          )}
          
          <div className="relative z-10 flex items-center gap-2">
            {isScanning ? (
              <Activity className="w-4 h-4 animate-pulse" strokeWidth={2.5} />
            ) : (
              <RotateCw 
                className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" 
                strokeWidth={2.5}
              />
            )}
            <span>
              {isScanning ? 'Starting...' : 'Refresh Intelligence'}
            </span>
          </div>
        </button>
        
        <div className="flex items-center gap-1.5">
          {scansRemaining > 0 ? (
            <>
              <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
              <p className="text-xs text-secondary/70 font-medium">
                {scansRemaining} remaining
              </p>
            </>
          ) : (
            <>
              <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
              <p className="text-xs text-red-500 dark:text-red-400 font-medium">
                Limit reached
              </p>
            </>
          )}
        </div>
      </div>

      <ScanProgressModal
        isOpen={showModal}
        onClose={handleModalClose}
        scanId={currentScanId}
      />
    </>
  )
}