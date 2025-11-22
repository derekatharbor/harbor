// apps/web/components/manage/VisibilityScoreCard.tsx
// Visibility Score Card for manage page

'use client'

import { useState } from 'react'
import { TrendingUp, TrendingDown, Minus, RefreshCw, ExternalLink, Award } from 'lucide-react'

interface VisibilityScoreCardProps {
  score: number | null
  rankGlobal: number | null
  rankInIndustry: number | null
  industry: string | null
  lastScanAt: string | null
  slug: string
  onRunScan?: () => void
}

export default function VisibilityScoreCard({
  score,
  rankGlobal,
  rankInIndustry,
  industry,
  lastScanAt,
  slug,
  onRunScan
}: VisibilityScoreCardProps) {
  const [isScanning, setIsScanning] = useState(false)

  // Calculate days since last scan
  const getDaysSinceLastScan = (): number | null => {
    if (!lastScanAt) return null
    const lastScan = new Date(lastScanAt)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - lastScan.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const daysSinceLastScan = getDaysSinceLastScan()

  // Determine status based on score
  const getStatus = () => {
    if (!score) return { text: 'Not scanned yet', color: 'text-white/60' }
    if (score >= 80) return { text: 'Strong AI visibility', color: 'text-green-400' }
    if (score >= 50) return { text: 'Moderate visibility - room to improve', color: 'text-yellow-400' }
    return { text: 'Limited visibility - optimize your profile', color: 'text-red-400' }
  }

  const status = getStatus()

  // Determine if scan is stale
  const isStale = daysSinceLastScan !== null && daysSinceLastScan > 7

  // Get color for score
  const getScoreColor = () => {
    if (!score) return 'text-white/40'
    if (score >= 80) return 'text-green-400'
    if (score >= 50) return 'text-yellow-400'
    return 'text-red-400'
  }

  // Handle scan button click
  const handleRunScan = async () => {
    if (onRunScan) {
      onRunScan()
    } else {
      // Default behavior - call scan API
      setIsScanning(true)
      try {
        const res = await fetch(`/api/scan/start`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug })
        })
        
        if (res.ok) {
          // Reload page to show updated scan
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
    <div className="bg-[#0C1422] rounded-2xl border border-white/5 p-6 space-y-6 lg:sticky lg:top-32">
      
      {/* Header */}
      <div className="flex items-center gap-2 pb-4 border-b border-white/5">
        <Award className="w-5 h-5 text-[#2979FF]" />
        <h3 className="text-lg font-bold text-white">AI Visibility Score</h3>
      </div>

      {/* Score Display */}
      {score !== null && score !== undefined ? (
        <div className="text-center py-4">
          <div className={`text-5xl font-bold mb-2 ${getScoreColor()}`}>
            {Math.round(score)}
          </div>
          <div className="text-white/40 text-sm">out of 100</div>
          
          {/* Status Message */}
          <div className={`mt-4 px-4 py-2 rounded-lg bg-white/5 border border-white/10 ${status.color} text-sm font-medium`}>
            {status.text}
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
            <RefreshCw className="w-8 h-8 text-white/40" />
          </div>
          <div className="text-white/60 text-sm mb-2">No scan data yet</div>
          <div className="text-white/40 text-xs">Run your first scan to see your visibility score</div>
        </div>
      )}

      {/* Rank Display */}
      {(rankInIndustry || rankGlobal) && (
        <div className="space-y-3 pt-2 border-t border-white/5">
          {rankInIndustry && industry && (
            <div className="flex items-center justify-between">
              <span className="text-white/60 text-sm">Industry Rank</span>
              <span className="text-white font-medium">
                #{rankInIndustry}
                <span className="text-white/40 text-xs ml-1">in {industry}</span>
              </span>
            </div>
          )}
          {rankGlobal && (
            <div className="flex items-center justify-between">
              <span className="text-white/60 text-sm">Global Rank</span>
              <span className="text-white font-medium">#{rankGlobal}</span>
            </div>
          )}
        </div>
      )}

      {/* Last Scan Info */}
      <div className="pt-2 border-t border-white/5">
        {lastScanAt ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/60">Last scanned</span>
              <span className="text-white/80">
                {daysSinceLastScan === 0 && 'Today'}
                {daysSinceLastScan === 1 && 'Yesterday'}
                {daysSinceLastScan && daysSinceLastScan > 1 && `${daysSinceLastScan} days ago`}
              </span>
            </div>
            {isStale && (
              <div className="px-3 py-2 rounded-lg bg-yellow-400/10 border border-yellow-400/20">
                <p className="text-yellow-400 text-xs font-medium">
                  Data may be outdated - run a new scan
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center text-white/40 text-sm">
            Never scanned
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 pt-2">
        {(!lastScanAt || isStale) ? (
          <button
            onClick={handleRunScan}
            disabled={isScanning}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-[#FF6B4A] hover:bg-[#FF6B4A]/90 text-white font-medium transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
            {isScanning ? 'Scanning...' : lastScanAt ? 'Run New Scan' : 'Run Your First Scan'}
          </button>
        ) : (
          <button
            onClick={handleRunScan}
            disabled={isScanning}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
            {isScanning ? 'Scanning...' : 'Update Scan'}
          </button>
        )}

        {score !== null && (
          <a
            href={`/brands/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white font-medium transition-all"
          >
            View Full Report
            <ExternalLink className="w-4 h-4" />
          </a>
        )}
      </div>

      {/* Info Note */}
      <div className="pt-4 border-t border-white/5">
        <p className="text-white/40 text-xs leading-relaxed">
          Your visibility score reflects how AI models like ChatGPT, Claude, and Gemini perceive and reference your brand.
        </p>
      </div>

    </div>
  )
}
