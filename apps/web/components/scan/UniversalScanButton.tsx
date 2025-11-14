// apps/web/components/scan/UniversalScanButton.tsx

'use client'

import { useState } from 'react'
import { RotateCw } from 'lucide-react'
import { useBrand } from '@/contexts/BrandContext'

interface UniversalScanButtonProps {
  variant?: 'default' | 'large'
}

export default function UniversalScanButton({ variant = 'default' }: UniversalScanButtonProps) {
  const { currentDashboard } = useBrand()
  const [isScanning, setIsScanning] = useState(false)
  
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
        throw new Error('Failed to start scan')
      }
      
      const data = await response.json()
      
      // Reload page to show new scan data
      window.location.reload()
    } catch (error) {
      console.error('Scan error:', error)
      alert('Failed to start scan. Please try again.')
    } finally {
      setIsScanning(false)
    }
  }

  if (variant === 'large') {
    return (
      <div className="flex flex-col items-center">
        <button
          onClick={handleScan}
          disabled={isScanning || scansRemaining <= 0}
          className="
            group relative
            px-8 py-4
            bg-coral hover:bg-coral/90
            disabled:bg-border disabled:cursor-not-allowed
            text-white font-heading font-semibold text-base
            rounded-lg
            transition-all duration-200
            cursor-pointer
            flex items-center gap-3
          "
        >
          <RotateCw 
            className={`w-5 h-5 ${isScanning ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} 
            strokeWidth={2}
          />
          <span>
            {isScanning ? 'Scanning...' : 'Refresh Brand Intelligence'}
          </span>
        </button>
        
        {scansRemaining > 0 ? (
          <p className="text-xs text-secondary/60 mt-2">
            {scansRemaining} {scansRemaining === 1 ? 'scan' : 'scans'} remaining this {currentDashboard?.plan === 'solo' ? 'week' : 'month'}
          </p>
        ) : (
          <p className="text-xs text-red-400 mt-2">
            Scan limit reached
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-end">
      <button
        onClick={handleScan}
        disabled={isScanning || scansRemaining <= 0}
        className="
          group relative
          px-4 py-2
          bg-coral hover:bg-coral/90
          disabled:bg-border disabled:cursor-not-allowed
          text-white font-heading font-semibold text-sm
          rounded-lg
          transition-all duration-200
          cursor-pointer
          flex items-center gap-2
        "
      >
        <RotateCw 
          className={`w-4 h-4 ${isScanning ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} 
          strokeWidth={2}
        />
        <span>
          {isScanning ? 'Scanning...' : 'Refresh Brand Intelligence'}
        </span>
      </button>
      
      {scansRemaining > 0 ? (
        <p className="text-xs text-secondary/60 mt-1">
          {scansRemaining} {scansRemaining === 1 ? 'scan' : 'scans'} remaining
        </p>
      ) : (
        <p className="text-xs text-red-400 mt-1">
          Scan limit reached
        </p>
      )}
    </div>
  )
}