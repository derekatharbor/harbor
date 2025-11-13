// components/scan/ScanToast.tsx
'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, X, Loader2 } from 'lucide-react'

interface ScanToastProps {
  isVisible: boolean
  isComplete: boolean
  onDismiss: () => void
  onViewResults: () => void
}

export default function ScanToast({ 
  isVisible, 
  isComplete, 
  onDismiss, 
  onViewResults 
}: ScanToastProps) {
  if (!isVisible) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-2">
      <div className="bg-[#0B1521] border border-white/10 rounded-lg p-4 shadow-2xl min-w-[320px]">
        <div className="flex items-start gap-3">
          {isComplete ? (
            <CheckCircle className="w-5 h-5 text-[var(--pageAccent)] flex-shrink-0 mt-0.5" strokeWidth={2} />
          ) : (
            <Loader2 className="w-5 h-5 text-[var(--pageAccent)] animate-spin flex-shrink-0 mt-0.5" strokeWidth={2} />
          )}
          
          <div className="flex-1 min-w-0">
            <div className="text-sm font-body font-medium text-white mb-1">
              {isComplete ? 'Scan Complete!' : 'Scan Running in Background'}
            </div>
            <div className="text-xs text-softgray/60 font-body">
              {isComplete 
                ? 'Your results are ready to view' 
                : 'You can close this and we\'ll notify you when done'}
            </div>
          </div>

          <button
            onClick={onDismiss}
            className="p-1 hover:bg-white/5 rounded transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4 text-softgray/60" strokeWidth={2} />
          </button>
        </div>

        {isComplete && (
          <button
            onClick={onViewResults}
            className="w-full mt-3 px-3 py-2 bg-[var(--pageAccent)] hover:brightness-110 text-white rounded text-sm font-body font-medium transition-all cursor-pointer"
          >
            View Results
          </button>
        )}
      </div>
    </div>
  )
}
