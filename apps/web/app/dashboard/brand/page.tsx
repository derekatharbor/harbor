// app/dashboard/brand/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Star, TrendingUp, Users, AlertCircle } from 'lucide-react'

export default function BrandVisibilityPage() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch('/api/scan/latest')
        const scanData = await response.json()

        if (!scanData.hasScans) {
          router.push('/dashboard')
          return
        }

        setData(scanData)
      } catch (error) {
        console.error('Failed to load brand data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#101A31] flex items-center justify-center">
        <div className="text-white font-body">Loading brand visibility...</div>
      </div>
    )
  }

  if (!data || !data.hasScans) {
    return null
  }

  const descriptors = data.results?.brand || []
  const brandScore = data.scores?.brand_score || 0
  const brandMentions = data.scores?.brand_mentions || 0

  if (descriptors.length === 0) {
    return (
      <div className="min-h-screen bg-[#101A31] p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-[#141E38] rounded-xl border border-white/5 p-12 text-center">
            <AlertCircle className="w-12 h-12 text-coral mx-auto mb-4" />
            <h2 className="text-xl font-heading font-semibold text-white mb-2">
              No brand data yet
            </h2>
            <p className="text-softgray font-body">
              Run a scan to see how AI describes your brand
            </p>
          </div>
        </div>
      </div>
    )
  }

  const sentimentCounts = {
    pos: descriptors.filter((d: any) => d.sentiment === 'pos').length,
    neu: descriptors.filter((d: any) => d.sentiment === 'neu').length,
    neg: descriptors.filter((d: any) => d.sentiment === 'neg').length,
  }

  const sentimentPercentage = {
    pos: (sentimentCounts.pos / descriptors.length) * 100,
    neu: (sentimentCounts.neu / descriptors.length) * 100,
    neg: (sentimentCounts.neg / descriptors.length) * 100,
  }

  return (
    <div className="min-h-screen bg-[#101A31]">
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <Star className="w-8 h-8 text-coral" />
            <h1 className="text-3xl font-heading font-bold text-white">
              Brand Visibility
            </h1>
          </div>
          <p className="text-softgray font-body text-lg mb-2">
            How AI describes and associates your brand
          </p>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1 bg-teal/20 border border-teal/30 rounded-full">
              <div className="w-2 h-2 bg-teal rounded-full animate-pulse" />
              <span className="text-teal text-xs font-body uppercase tracking-wide">Live</span>
            </div>
            <p className="text-softgray/60 text-sm font-body">
              Last scan: {new Date(data.scan?.finishedAt || '').toLocaleString()}
            </p>
          </div>
        </div>

        {/* Score Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-[#141E38] rounded-lg border border-white/5 p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-coral/5 rounded-full blur-2xl" />
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-softgray text-sm font-body uppercase tracking-wide">
                  Brand Score
                </span>
                <Star className="w-4 h-4 text-coral" />
              </div>
              <div className="text-3xl font-heading font-bold text-white mb-1">
                {brandScore.toFixed(1)}%
              </div>
              <div className="flex items-center gap-1 text-teal text-sm font-body">
                <TrendingUp className="w-3 h-3" />
                <span>+5.2% vs last scan</span>
              </div>
            </div>
          </div>

          <div className="bg-[#141E38] rounded-lg border border-white/5 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-softgray text-sm font-body uppercase tracking-wide">
                Total Mentions
              </span>
            </div>
            <div className="text-3xl font-heading font-bold text-white mb-1">
              {brandMentions}
            </div>
            <div className="text-softgray text-sm font-body">
              Across all models
            </div>
          </div>

          <div className="bg-[#141E38] rounded-lg border border-white/5 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-softgray text-sm font-body uppercase tracking-wide">
                Positive Sentiment
              </span>
            </div>
            <div className="text-3xl font-heading font-bold text-white mb-1">
              {sentimentPercentage.pos.toFixed(0)}%
            </div>
            <div className="text-softgray text-sm font-body">
              {sentimentCounts.pos} descriptors
            </div>
          </div>

          <div className="bg-[#141E38] rounded-lg border border-white/5 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-softgray text-sm font-body uppercase tracking-wide">
                Descriptors
              </span>
              <Users className="w-4 h-4 text-softgray" />
            </div>
            <div className="text-3xl font-heading font-bold text-white mb-1">
              {descriptors.length}
            </div>
            <div className="text-softgray text-sm font-body">
              Total identified
            </div>
          </div>
        </div>

        {/* Descriptor Cloud */}
        <div className="bg-[#141E38] rounded-lg border border-white/5 p-6 mb-8">
          <h3 className="text-xl font-heading font-semibold text-white mb-6">
            Brand Descriptors
          </h3>

          <div className="flex flex-wrap gap-3 mb-8">
            {descriptors.slice(0, 24).map((desc: any, idx: number) => {
              const sizeClass = desc.weight > 15 ? 'text-xl' : desc.weight > 10 ? 'text-lg' : 'text-base'
              const colorClass =
                desc.sentiment === 'pos'
                  ? 'bg-cerulean/20 text-cerulean border-cerulean/30'
                  : desc.sentiment === 'neg'
                  ? 'bg-coral/20 text-coral border-coral/30'
                  : 'bg-softgray/20 text-softgray border-softgray/30'

              return (
                <div
                  key={idx}
                  className={`px-4 py-2 rounded-full border ${colorClass} ${sizeClass} font-body font-medium transition-all hover:scale-110 cursor-default`}
                >
                  {desc.descriptor}
                </div>
              )
            })}
          </div>

          {/* Sentiment Breakdown */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-[#101A31] rounded-lg p-4 border border-cerulean/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-cerulean text-sm font-body uppercase tracking-wide">
                  Positive
                </span>
                <span className="text-2xl font-heading font-bold text-cerulean">
                  {sentimentCounts.pos}
                </span>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {descriptors
                  .filter((d: any) => d.sentiment === 'pos')
                  .slice(0, 6)
                  .map((d: any, i: number) => (
                    <span key={i} className="text-xs text-cerulean/80 font-body">
                      {d.descriptor}
                    </span>
                  ))}
              </div>
              <div className="h-2 bg-navy rounded-full overflow-hidden mt-4">
                <div
                  className="h-full bg-cerulean rounded-full transition-all duration-1000"
                  style={{ width: `${sentimentPercentage.pos}%` }}
                />
              </div>
            </div>

            <div className="bg-[#101A31] rounded-lg p-4 border border-softgray/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-softgray text-sm font-body uppercase tracking-wide">
                  Neutral
                </span>
                <span className="text-2xl font-heading font-bold text-softgray">
                  {sentimentCounts.neu}
                </span>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {descriptors
                  .filter((d: any) => d.sentiment === 'neu')
                  .slice(0, 6)
                  .map((d: any, i: number) => (
                    <span key={i} className="text-xs text-softgray/80 font-body">
                      {d.descriptor}
                    </span>
                  ))}
              </div>
              <div className="h-2 bg-navy rounded-full overflow-hidden mt-4">
                <div
                  className="h-full bg-softgray rounded-full transition-all duration-1000"
                  style={{ width: `${sentimentPercentage.neu}%` }}
                />
              </div>
            </div>

            <div className="bg-[#101A31] rounded-lg p-4 border border-coral/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-coral text-sm font-body uppercase tracking-wide">
                  Negative
                </span>
                <span className="text-2xl font-heading font-bold text-coral">
                  {sentimentCounts.neg}
                </span>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {descriptors
                  .filter((d: any) => d.sentiment === 'neg')
                  .slice(0, 6)
                  .map((d: any, i: number) => (
                    <span key={i} className="text-xs text-coral/80 font-body">
                      {d.descriptor}
                    </span>
                  ))}
              </div>
              <div className="h-2 bg-navy rounded-full overflow-hidden mt-4">
                <div
                  className="h-full bg-coral rounded-full transition-all duration-1000"
                  style={{ width: `${sentimentPercentage.neg}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}