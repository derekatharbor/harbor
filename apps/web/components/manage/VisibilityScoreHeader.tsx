// apps/web/components/manage/VisibilityScoreHeader.tsx
// Clinical visibility score header - no gamification

'use client'

import { useState } from 'react'
import { RefreshCw, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react'

interface FieldStatus {
  field: string
  status: 'missing' | 'partial' | 'complete'
  label: string
}

interface VisibilityScoreHeaderProps {
  score: number | null
  rankGlobal: number | null
  lastScanAt: string | null
  slug: string
  hasDescription: boolean
  hasOfferings: boolean
  hasFaqs: boolean
  hasCompanyInfo: boolean
  onRunScan?: () => void
}

export default function VisibilityScoreHeader({
  score,
  rankGlobal,
  lastScanAt,
  slug,
  hasDescription,
  hasOfferings,
  hasFaqs,
  hasCompanyInfo,
  onRunScan
}: VisibilityScoreHeaderProps) {
  const [isScanning, setIsScanning] = useState(false)

  // Calculate actual profile completeness based on required fields
  const fieldStatuses: FieldStatus[] = [
    { 
      field: 'Brand Description', 
      status: hasDescription ? 'complete' : 'missing',
      label: hasDescription ? 'Complete' : 'Missing'
    },
    { 
      field: 'Products & Services', 
      status: hasOfferings ? 'complete' : 'missing',
      label: hasOfferings ? 'Complete' : 'Missing'
    },
    { 
      field: 'FAQs', 
      status: hasFaqs ? 'complete' : 'missing',
      label: hasFaqs ? 'Complete' : 'Missing'
    },
    { 
      field: 'Company Information', 
      status: hasCompanyInfo ? 'complete' : 'missing',
      label: hasCompanyInfo ? 'Complete' : 'Optional'
    }
  ]

  const requiredFields = fieldStatuses.filter(f => f.field !== 'Company Information')
  const completedRequired = requiredFields.filter(f => f.status === 'complete').length
  const completenessPercent = Math.round((completedRequired / requiredFields.length) * 100)

  // Get missing required fields
  const missingFields = fieldStatuses.filter(f => f.status === 'missing' && f.field !== 'Company Information')

  // Get score color - Harbor blue palette
  const getScoreColor = () => {
    if (!score) return 'text-white/40'
    if (score >= 85) return 'text-[#58E0C0]'
    if (score >= 70) return 'text-[#6BC6FF]'
    if (score >= 50) return 'text-[#FFC766]'
    return 'text-[#F25A5A]'
  }

  // Get scan button text
  const getScanButtonText = () => {
    if (isScanning) return 'Scanning...'
    if (!lastScanAt) return 'Run initial scan'
    return 'Run scan'
  }

  // Handle scan
  const handleRunScan = async () => {
    if (onRunScan) {
      onRunScan()
    } else {
      setIsScanning(true)
      try {
        const res = await fetch(`/api/scan/start`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug })
        })
        
        if (res.ok) {
          window.location.reload()
        }
      } catch (error) {
        console.error('Failed to start scan:', error)
      } finally {
        setIsScanning(false)
      }
    }
  }

  return (
    <div className="bg-[#0C1422] border-b border-white/5">
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-6">
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          
          {/* Left: Score */}
          <div>
            <div className="text-white/40 text-xs uppercase tracking-wider mb-2">AI Visibility Score</div>
            {score !== null ? (
              <>
                <div className={`text-5xl font-bold mb-1 ${getScoreColor()}`}>
                  {Math.round(score)}
                </div>
                <div className="text-white/60 text-sm">
                  Reflects how AI models interpret and surface your brand
                </div>
              </>
            ) : (
              <div className="text-white/40 text-sm">No scan data available</div>
            )}
          </div>

          {/* Middle: Completeness */}
          <div>
            <div className="text-white/40 text-xs uppercase tracking-wider mb-2">Profile Completeness</div>
            <div className="text-white text-2xl font-bold mb-2">{completenessPercent}%</div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mb-2">
              <div 
                className="h-full bg-[#6BC6FF] transition-all duration-500"
                style={{ width: `${completenessPercent}%` }}
              />
            </div>
            <div className="text-white/60 text-xs">
              {completedRequired} of {requiredFields.length} required fields complete
            </div>
          </div>

          {/* Right: Rank & Action */}
          <div className="flex flex-col justify-between">
            {rankGlobal && (
              <div className="mb-3">
                <div className="text-white/40 text-xs uppercase tracking-wider mb-1">Global Rank</div>
                <div className="text-white text-xl font-bold">#{rankGlobal}</div>
              </div>
            )}
            
            <button
              onClick={handleRunScan}
              disabled={isScanning}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#FF6B4A] hover:bg-[#FF6B4A]/90 text-white text-sm font-medium transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
              {getScanButtonText()}
            </button>
          </div>
        </div>

        {/* Missing Fields Alert */}
        {missingFields.length > 0 && (
          <div className="border-t border-white/5 pt-4">
            <div className="flex items-start gap-3 px-4 py-3 rounded-lg bg-white/5 border border-white/10">
              <AlertCircle className="w-5 h-5 text-white/60 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-white text-sm font-medium mb-1">
                  Missing information reduces AI accuracy
                </div>
                <div className="text-white/60 text-sm">
                  These fields are currently missing: {missingFields.map(f => f.field).join(', ')}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Last Scan Info */}
        {lastScanAt && (
          <div className="border-t border-white/5 pt-4 mt-4">
            <div className="text-white/40 text-xs">
              Last scanned: {new Date(lastScanAt).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}