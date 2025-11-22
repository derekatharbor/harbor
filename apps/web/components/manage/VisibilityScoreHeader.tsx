// apps/web/components/manage/VisibilityScoreHeader.tsx
// Full-width score header that frames the entire manage experience

'use client'

import { useState, useEffect } from 'react'
import { RefreshCw, TrendingUp, TrendingDown, Award, Zap } from 'lucide-react'

interface ScoreContribution {
  field: string
  points: number
  completed: boolean
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
  const [scoreDelta, setScoreDelta] = useState<number | null>(null)

  // Calculate profile completeness
  const contributions: ScoreContribution[] = [
    { field: 'Brand Description', points: 15, completed: hasDescription },
    { field: 'Products & Services', points: 10, completed: hasOfferings },
    { field: 'FAQs', points: 10, completed: hasFaqs },
    { field: 'Company Information', points: 5, completed: hasCompanyInfo }
  ]

  const completedPoints = contributions
    .filter(c => c.completed)
    .reduce((sum, c) => sum + c.points, 0)
  const totalPoints = contributions.reduce((sum, c) => sum + c.points, 0)
  const completenessPercent = (completedPoints / totalPoints) * 100

  // Get score color based on Harbor's palette
  const getScoreColor = () => {
    if (!score) return 'text-white/40'
    if (score >= 85) return 'text-[#58E0C0]' // Greenish-blue
    if (score >= 70) return 'text-[#6BC6FF]' // Harbor blue
    if (score >= 50) return 'text-[#FFC766]' // Amber
    return 'text-[#F25A5A]' // Soft red
  }

  // Get messaging based on score
  const getMessage = () => {
    if (!score) return 'AI doesn\'t know your brand yet - run your first scan'
    if (score >= 85) return 'AI has strong clarity on your brand'
    if (score >= 70) return 'Visibility improving - small updates unlock major gains'
    if (score >= 50) return 'You\'re partially understood - filling in the gaps boosts accuracy'
    return 'AI is unsure about parts of your brand'
  }

  // Get scan button text
  const getScanButtonText = () => {
    if (isScanning) return 'Scanning...'
    if (!lastScanAt) return 'Run your first scan'
    return 'Re-scan to update your score'
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

  // Calculate potential score increase
  const potentialIncrease = contributions
    .filter(c => !c.completed)
    .reduce((sum, c) => sum + c.points, 0)

  return (
    <div className="bg-[#0C1422] border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        
        {/* Main Score Display */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-6">
          
          {/* Left: Score & Messaging */}
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-3">
              {score !== null ? (
                <>
                  <div className={`text-6xl font-bold ${getScoreColor()}`}>
                    {Math.round(score)}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-white/40 text-sm">Visibility Score</span>
                    {scoreDelta && (
                      <span className={`text-sm font-medium flex items-center gap-1 ${
                        scoreDelta > 0 ? 'text-[#58E0C0]' : 'text-[#F25A5A]'
                      }`}>
                        {scoreDelta > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        {scoreDelta > 0 ? '+' : ''}{scoreDelta} since last scan
                      </span>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                    <Zap className="w-8 h-8 text-white/40" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white/60">Not scanned yet</div>
                    <div className="text-white/40 text-sm">Run your first scan to see how AI sees you</div>
                  </div>
                </div>
              )}
            </div>
            
            <p className={`text-base ${score && score >= 70 ? 'text-white/80' : 'text-white/60'}`}>
              {getMessage()}
            </p>
          </div>

          {/* Right: Rank & CTA */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            {rankGlobal && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-white/5 border border-white/10">
                <Award className="w-5 h-5 text-[#6BC6FF]" />
                <div>
                  <div className="text-white/40 text-xs">Global Rank</div>
                  <div className="text-white font-bold">#{rankGlobal}</div>
                </div>
              </div>
            )}
            
            <button
              onClick={handleRunScan}
              disabled={isScanning}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[#FF6B4A] hover:bg-[#FF6B4A]/90 text-white font-medium transition-all disabled:opacity-50 whitespace-nowrap"
            >
              <RefreshCw className={`w-5 h-5 ${isScanning ? 'animate-spin' : ''}`} />
              {getScanButtonText()}
            </button>
          </div>
        </div>

        {/* Profile Completeness Bar */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/60">Profile Completeness</span>
            <span className="text-white/80 font-medium">{Math.round(completenessPercent)}%</span>
          </div>
          
          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#6BC6FF] to-[#58E0C0] transition-all duration-500"
              style={{ width: `${completenessPercent}%` }}
            />
          </div>

          {/* Score Contributions - What to do next */}
          {potentialIncrease > 0 && (
            <div className="pt-2">
              <p className="text-white/60 text-sm mb-2">
                Add these to gain <span className="text-[#6BC6FF] font-medium">+{potentialIncrease} points</span> after next scan:
              </p>
              <div className="flex flex-wrap gap-2">
                {contributions
                  .filter(c => !c.completed)
                  .map((contribution, idx) => (
                    <div 
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm"
                    >
                      <span className="text-white/70">{contribution.field}</span>
                      <span className="text-[#6BC6FF] font-medium">+{contribution.points}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {completenessPercent === 100 && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#58E0C0]/10 border border-[#58E0C0]/20">
              <Zap className="w-4 h-4 text-[#58E0C0]" />
              <span className="text-[#58E0C0] text-sm font-medium">
                Profile complete - re-scan to see your updated score
              </span>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}