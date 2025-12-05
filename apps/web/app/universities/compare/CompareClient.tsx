// app/universities/compare/CompareClient.tsx
'use client'

import { useState } from 'react'
import { ArrowLeft, Share2, Download, Trophy, TrendingUp, TrendingDown, Check, X, Swords } from 'lucide-react'
import Link from 'next/link'
import Nav from '@/components/landing-new/Nav'
import Footer from '@/components/landing-new/Footer'

interface University {
  id: string
  name: string
  short_name: string | null
  slug: string
  domain: string | null
  logo_url: string | null
  city: string | null
  state: string | null
  institution_type: string | null
  enrollment: number | null
  acceptance_rate: number | null
  graduation_rate: number | null
  us_news_rank: number | null
  athletic_conference: string | null
  visibility_score: number | null
  total_mentions: number | null
  sentiment_score: number | null
  known_for: string[] | null
}

interface Props {
  universityA: University
  universityB: University
}

// Comparison metrics
const COMPARISON_METRICS = [
  { key: 'visibility_score', label: 'AI Visibility Score', suffix: '%', higherBetter: true },
  { key: 'sentiment_score', label: 'AI Sentiment', suffix: '%', higherBetter: true },
  { key: 'total_mentions', label: 'AI Mentions', suffix: '', higherBetter: true },
  { key: 'us_news_rank', label: 'US News Rank', suffix: '', higherBetter: false },
  { key: 'acceptance_rate', label: 'Acceptance Rate', suffix: '%', higherBetter: false },
  { key: 'graduation_rate', label: 'Graduation Rate', suffix: '%', higherBetter: true },
  { key: 'enrollment', label: 'Enrollment', suffix: '', higherBetter: null },
]

export default function CompareClient({ universityA, universityB }: Props) {
  const [copied, setCopied] = useState(false)

  // Get logo URL with Brandfetch fallback
  const getLogoUrl = (uni: University) => {
    if (uni.logo_url) return uni.logo_url
    if (uni.domain) return `https://cdn.brandfetch.io/${uni.domain}?c=1id1Fyz-h7an5-5KR_y`
    return null
  }

  const logoA = getLogoUrl(universityA)
  const logoB = getLogoUrl(universityB)

  const nameA = universityA.short_name || universityA.name
  const nameB = universityB.short_name || universityB.name

  // Determine overall winner
  const scoreA = universityA.visibility_score || 0
  const scoreB = universityB.visibility_score || 0
  const winner = scoreA > scoreB ? 'A' : scoreA < scoreB ? 'B' : 'tie'
  const scoreDiff = Math.abs(scoreA - scoreB).toFixed(1)

  // Handle share
  const handleShare = async () => {
    const url = window.location.href
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${nameA} vs ${nameB} - AI Visibility Matchup`,
          text: `Compare AI visibility scores: ${nameA} (${scoreA.toFixed(1)}%) vs ${nameB} (${scoreB.toFixed(1)}%)`,
          url: url,
        })
      } catch (err) {
        // User cancelled or share failed
      }
    } else {
      // Fallback to clipboard
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // Get value comparison
  const getComparison = (metric: typeof COMPARISON_METRICS[0]) => {
    const valA = (universityA as any)[metric.key]
    const valB = (universityB as any)[metric.key]

    if (valA == null || valB == null) return { winner: null, valA, valB }
    
    if (metric.higherBetter === null) {
      return { winner: null, valA, valB }
    }

    if (metric.higherBetter) {
      return { winner: valA > valB ? 'A' : valA < valB ? 'B' : null, valA, valB }
    } else {
      return { winner: valA < valB ? 'A' : valA > valB ? 'B' : null, valA, valB }
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Nav />

      {/* Hero */}
      <section className="relative pt-32 pb-8 md:pt-40 md:pb-12 px-6 overflow-hidden">
        {/* Background glow */}
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(59, 130, 246, 0.1) 0%, transparent 70%)'
          }}
        />

        <div className="relative max-w-4xl mx-auto">
          {/* Back link */}
          <Link 
            href="/universities"
            className="inline-flex items-center gap-2 text-white/50 hover:text-white/70 transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Rankings
          </Link>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full mb-4">
              <Swords className="w-4 h-4 text-white/50" />
              <span className="text-white/60 text-sm">AI Visibility Matchup</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              {nameA} vs {nameB}
            </h1>
          </div>
        </div>
      </section>

      {/* Comparison Card */}
      <section className="pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-6 md:p-10">
            
            {/* Main Score Comparison */}
            <div className="grid md:grid-cols-[1fr,auto,1fr] gap-8 items-center mb-10">
              {/* University A */}
              <div className="text-center">
                <div className={`w-24 h-24 rounded-2xl overflow-hidden flex items-center justify-center mx-auto mb-4 ${
                  winner === 'A' ? 'bg-emerald-500/10 border-2 border-emerald-500/30' : 'bg-white/5'
                }`}>
                  {logoA ? (
                    <img src={logoA} alt={nameA} className="w-20 h-20 object-contain" />
                  ) : (
                    <span className="text-2xl font-bold text-white/40">{nameA.slice(0, 2)}</span>
                  )}
                </div>
                <h2 className="text-xl font-semibold text-white mb-1">{nameA}</h2>
                <p className="text-white/40 text-sm mb-4">{universityA.city}, {universityA.state}</p>
                <div className={`text-5xl font-bold mb-2 ${winner === 'A' ? 'text-emerald-400' : 'text-white'}`}>
                  {scoreA.toFixed(1)}%
                </div>
                <p className="text-white/50 text-sm">AI Visibility Score</p>
                {winner === 'A' && (
                  <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-full">
                    <Trophy className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400 text-sm font-medium">Leader</span>
                  </div>
                )}
              </div>

              {/* VS Divider */}
              <div className="flex flex-col items-center justify-center gap-4">
                <div className="hidden md:block w-px h-16 bg-white/10" />
                <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                  <span className="text-white/60 font-bold">VS</span>
                </div>
                <div className="hidden md:block w-px h-16 bg-white/10" />
              </div>

              {/* University B */}
              <div className="text-center">
                <div className={`w-24 h-24 rounded-2xl overflow-hidden flex items-center justify-center mx-auto mb-4 ${
                  winner === 'B' ? 'bg-emerald-500/10 border-2 border-emerald-500/30' : 'bg-white/5'
                }`}>
                  {logoB ? (
                    <img src={logoB} alt={nameB} className="w-20 h-20 object-contain" />
                  ) : (
                    <span className="text-2xl font-bold text-white/40">{nameB.slice(0, 2)}</span>
                  )}
                </div>
                <h2 className="text-xl font-semibold text-white mb-1">{nameB}</h2>
                <p className="text-white/40 text-sm mb-4">{universityB.city}, {universityB.state}</p>
                <div className={`text-5xl font-bold mb-2 ${winner === 'B' ? 'text-emerald-400' : 'text-white'}`}>
                  {scoreB.toFixed(1)}%
                </div>
                <p className="text-white/50 text-sm">AI Visibility Score</p>
                {winner === 'B' && (
                  <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-full">
                    <Trophy className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400 text-sm font-medium">Leader</span>
                  </div>
                )}
              </div>
            </div>

            {/* Winner Banner */}
            {winner !== 'tie' && (
              <div className="mb-10 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center">
                <p className="text-emerald-400 font-medium">
                  {winner === 'A' ? nameA : nameB} leads by {scoreDiff} points in AI visibility
                </p>
              </div>
            )}

            {/* Detailed Metrics */}
            <div className="border-t border-white/[0.08] pt-8">
              <h3 className="text-lg font-semibold text-white mb-6">Detailed Comparison</h3>
              
              <div className="space-y-4">
                {COMPARISON_METRICS.map(metric => {
                  const comparison = getComparison(metric)
                  
                  return (
                    <div 
                      key={metric.key}
                      className="grid grid-cols-[1fr,2fr,1fr] gap-4 items-center py-3 border-b border-white/[0.04]"
                    >
                      {/* Value A */}
                      <div className={`text-right font-semibold ${
                        comparison.winner === 'A' ? 'text-emerald-400' : 'text-white'
                      }`}>
                        {comparison.valA != null 
                          ? `${metric.key === 'enrollment' ? comparison.valA.toLocaleString() : comparison.valA}${metric.suffix}`
                          : '—'
                        }
                        {comparison.winner === 'A' && <Check className="inline w-4 h-4 ml-1" />}
                      </div>

                      {/* Label */}
                      <div className="text-center text-white/50 text-sm">
                        {metric.label}
                      </div>

                      {/* Value B */}
                      <div className={`text-left font-semibold ${
                        comparison.winner === 'B' ? 'text-emerald-400' : 'text-white'
                      }`}>
                        {comparison.winner === 'B' && <Check className="inline w-4 h-4 mr-1" />}
                        {comparison.valB != null 
                          ? `${metric.key === 'enrollment' ? comparison.valB.toLocaleString() : comparison.valB}${metric.suffix}`
                          : '—'
                        }
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Share Actions */}
            <div className="mt-10 flex items-center justify-center gap-4">
              <button 
                onClick={handleShare}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-black font-medium rounded-xl hover:bg-white/90 transition-colors"
              >
                <Share2 className="w-4 h-4" />
                {copied ? 'Link Copied!' : 'Share Matchup'}
              </button>
              <Link
                href="/universities"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 text-white font-medium rounded-xl hover:bg-white/10 transition-colors"
              >
                Compare Others
              </Link>
            </div>
          </div>

          {/* Individual Profile Links */}
          <div className="mt-8 grid md:grid-cols-2 gap-4">
            <Link
              href={`/universities/${universityA.slug}`}
              className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/[0.08] rounded-xl hover:bg-white/[0.04] transition-colors"
            >
              <span className="text-white">View {nameA} Profile</span>
              <TrendingUp className="w-4 h-4 text-white/40" />
            </Link>
            <Link
              href={`/universities/${universityB.slug}`}
              className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/[0.08] rounded-xl hover:bg-white/[0.04] transition-colors"
            >
              <span className="text-white">View {nameB} Profile</span>
              <TrendingUp className="w-4 h-4 text-white/40" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
