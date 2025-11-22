'use client'

import { AlertCircle, TrendingUp, TrendingDown, Minus, Play } from 'lucide-react'
import Image from 'next/image'

interface ProfileSummaryCardProps {
  brand: {
    brand_name: string
    logo_url: string
    domain: string
    industry: string
    visibility_score: number
    rank_global: number
    last_scan_at?: string
    next_scan_scheduled_at?: string
  }
  onScanClick: () => void
  scanInProgress?: boolean
}

export function ProfileSummaryCard({ brand, onScanClick, scanInProgress }: ProfileSummaryCardProps) {
  const lastScanDate = brand.last_scan_at ? new Date(brand.last_scan_at) : null
  const nextScanDate = brand.next_scan_scheduled_at ? new Date(brand.next_scan_scheduled_at) : null
  
  const getTimeUntilNextScan = () => {
    if (!nextScanDate) return null
    const now = new Date()
    const diffMs = nextScanDate.getTime() - now.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    
    if (diffDays > 0) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''}, ${diffHours} hour${diffHours !== 1 ? 's' : ''}`
    }
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''}`
  }

  const formatLastScanDate = () => {
    if (!lastScanDate) return 'Never scanned'
    const now = new Date()
    const diffMs = now.getTime() - lastScanDate.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`
    
    return lastScanDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getPercentileMessage = (rank: number) => {
    if (rank <= 10) return 'Top 1%'
    if (rank <= 50) return 'Top 5%'
    if (rank <= 100) return 'Top 10%'
    return 'Top 25%'
  }

  return (
    <div className="p-8 bg-white/[0.02] border border-white/5 rounded-lg">
      <div className="flex items-start justify-between gap-8 mb-8">
        {/* Left: Brand Info */}
        <div className="flex items-start gap-6">
          <div className="w-16 h-16 rounded-lg bg-white/5 flex items-center justify-center overflow-hidden flex-shrink-0">
            {brand.logo_url ? (
              <Image
                src={brand.logo_url}
                alt={brand.brand_name}
                width={64}
                height={64}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="text-white/40 font-mono text-2xl">
                {brand.brand_name.charAt(0)}
              </div>
            )}
          </div>
          <div>
            <h2 className="text-white text-2xl font-light mb-2">{brand.brand_name}</h2>
            <div className="flex items-center gap-4 text-white/50 font-mono text-sm">
              <span>{brand.domain}</span>
              <span className="text-white/20">•</span>
              <span>{brand.industry}</span>
            </div>
          </div>
        </div>

        {/* Right: Scan Button */}
        <button
          onClick={onScanClick}
          disabled={scanInProgress}
          className={`px-6 py-3 rounded font-mono text-sm flex items-center gap-2 transition-all ${
            scanInProgress
              ? 'bg-white/5 text-white/40 cursor-not-allowed'
              : 'bg-[#2DD4BF] text-[#0A0F1E] hover:bg-[#14B8A6]'
          }`}
        >
          <Play className={`w-4 h-4 ${scanInProgress ? 'animate-pulse' : ''}`} />
          {scanInProgress ? 'Scanning...' : 'Run New Scan'}
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-6">
        {/* Visibility Score */}
        <div className="p-6 bg-white/[0.02] border border-white/5 rounded">
          <div className="text-white/50 font-mono text-xs mb-2">Visibility Score</div>
          <div className="text-white text-3xl font-light mb-1">
            {brand.visibility_score.toFixed(1)}%
          </div>
          <div className="flex items-center gap-1 text-[#2DD4BF] font-mono text-xs">
            <TrendingUp className="w-3 h-3" />
            <span>+2.3% vs last scan</span>
          </div>
        </div>

        {/* Global Rank */}
        <div className="p-6 bg-white/[0.02] border border-white/5 rounded">
          <div className="text-white/50 font-mono text-xs mb-2">Global Rank</div>
          <div className="text-white text-3xl font-light mb-1">
            #{brand.rank_global}
          </div>
          <div className="text-white/40 font-mono text-xs">
            {getPercentileMessage(brand.rank_global)}
          </div>
        </div>

        {/* Last Scanned */}
        <div className="p-6 bg-white/[0.02] border border-white/5 rounded">
          <div className="text-white/50 font-mono text-xs mb-2">Last Scanned</div>
          <div className="text-white text-lg font-light mb-1">
            {formatLastScanDate()}
          </div>
          {nextScanDate && (
            <div className="text-white/40 font-mono text-xs">
              Next in {getTimeUntilNextScan()}
            </div>
          )}
        </div>
      </div>

      {/* Verified Badge */}
      <div className="mt-6 pt-6 border-t border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-[#2DD4BF] flex items-center justify-center">
            <svg className="w-3 h-3 text-[#0A0F1E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span className="text-white/70 font-mono text-sm">Verified Owner</span>
        </div>
      </div>
    </div>
  )
}
