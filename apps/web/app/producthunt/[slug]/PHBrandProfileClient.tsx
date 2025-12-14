// Path: apps/web/app/producthunt/[slug]/PHBrandProfileClient.tsx

'use client'

import { ExternalLink, TrendingUp, MessageSquare, Award } from 'lucide-react'
import Link from 'next/link'
import Nav from '@/components/landing-new/Nav'
import Footer from '@/components/landing-new/Footer'

const PH_ORANGE = '#DA552F'

interface PHProduct {
  id: string
  name: string
  slug: string
  domain: string
  category: string
}

interface PHStats {
  mention_count: number
  avg_position: number | null
  positive_mentions: number
  visibility_score: number
}

interface Props {
  product: PHProduct
  stats: PHStats | null
}

export default function PHBrandProfileClient({ product, stats }: Props) {
  const visibilityScore = stats?.visibility_score || 0
  const mentionCount = stats?.mention_count || 0
  const avgPosition = stats?.avg_position
  const positiveMentions = stats?.positive_mentions || 0

  // Construct PH URL from slug
  const phUrl = `https://www.producthunt.com/products/${product.slug}`
  
  // Use Clearbit for logo
  const logoUrl = `https://logo.clearbit.com/${product.domain}`

  return (
    <div className="min-h-screen bg-[#0B0B0C]">
      <Nav />

      {/* Spacer for fixed nav */}
      <div className="h-20" />

      {/* Profile Content */}
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-12">
        
        {/* Back button */}
        <Link 
          href="/producthunt"
          className="inline-flex items-center gap-2 text-white/40 hover:text-white/70 text-sm mb-8 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Product Hunt Leaderboard
        </Link>
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start gap-6 mb-10">
          {/* Logo */}
          <div className="w-20 h-20 rounded-xl overflow-hidden bg-white/5 flex items-center justify-center flex-shrink-0">
            <img
              src={logoUrl}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none'
                e.currentTarget.parentElement!.innerHTML = `<span class="text-2xl font-bold text-white/30">${product.name.charAt(0)}</span>`
              }}
            />
          </div>

          {/* Brand Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                {product.name}
              </h1>
              <a
                href={phUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-opacity hover:opacity-80"
                style={{ backgroundColor: `${PH_ORANGE}20`, color: PH_ORANGE }}
              >
                <svg width="14" height="14" viewBox="0 0 40 40" fill="none">
                  <path d="M22.5 15H17.5V20H22.5C23.88 20 25 18.88 25 17.5C25 16.12 23.88 15 22.5 15Z" fill={PH_ORANGE}/>
                  <path d="M20 8C13.373 8 8 13.373 8 20C8 26.627 13.373 32 20 32C26.627 32 32 26.627 32 20C32 13.373 26.627 8 20 8ZM22.5 23H17.5V27H14.5V13H22.5C25.537 13 28 15.463 28 18.5C28 21.537 25.537 23 22.5 23Z" fill={PH_ORANGE}/>
                </svg>
                Product Hunt
              </a>
            </div>
            <p className="text-white/50 mb-3">{product.category}</p>
            <a
              href={`https://${product.domain}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-white/40 hover:text-white/70 text-sm transition-colors"
            >
              {product.domain}
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Visibility Score Card */}
        <div 
          className="rounded-2xl border p-6 md:p-8 mb-6"
          style={{ 
            backgroundColor: `${PH_ORANGE}08`,
            borderColor: `${PH_ORANGE}20`
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">AI Visibility Score</h2>
            <span 
              className="text-4xl font-bold"
              style={{ color: PH_ORANGE }}
            >
              {visibilityScore}
            </span>
          </div>

          {/* Progress bar */}
          <div className="h-3 rounded-full bg-white/10 overflow-hidden mb-6">
            <div 
              className="h-full rounded-full transition-all duration-500"
              style={{ 
                width: `${visibilityScore}%`,
                backgroundColor: PH_ORANGE
              }}
            />
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/[0.03] rounded-xl p-4 text-center">
              <MessageSquare className="w-5 h-5 mx-auto mb-2 text-white/40" />
              <div className="text-2xl font-bold text-white mb-1">{mentionCount}</div>
              <div className="text-white/40 text-sm">Mentions</div>
            </div>
            <div className="bg-white/[0.03] rounded-xl p-4 text-center">
              <TrendingUp className="w-5 h-5 mx-auto mb-2 text-white/40" />
              <div className="text-2xl font-bold text-white mb-1">
                {avgPosition ? `#${avgPosition}` : '-'}
              </div>
              <div className="text-white/40 text-sm">Avg Position</div>
            </div>
            <div className="bg-white/[0.03] rounded-xl p-4 text-center">
              <Award className="w-5 h-5 mx-auto mb-2 text-white/40" />
              <div className="text-2xl font-bold text-white mb-1" style={{ color: positiveMentions > 0 ? '#22c55e' : undefined }}>
                {positiveMentions}
              </div>
              <div className="text-white/40 text-sm">Positive</div>
            </div>
          </div>
        </div>

        {/* What this means */}
        <div className="bg-white/[0.02] rounded-2xl border border-white/[0.08] p-6 md:p-8 mb-6">
          <h2 className="text-sm font-medium text-white/40 uppercase tracking-wide mb-4">
            What This Means
          </h2>
          
          {mentionCount > 0 ? (
            <div className="space-y-4">
              <p className="text-white/70">
                When we asked AI models like ChatGPT and Perplexity for recommendations in the{' '}
                <span className="text-white font-medium">{product.category}</span> category,{' '}
                <span className="text-white font-medium">{product.name}</span> was mentioned{' '}
                <span className="text-white font-medium">{mentionCount} time{mentionCount !== 1 ? 's' : ''}</span>.
              </p>
              {avgPosition && (
                <p className="text-white/70">
                  On average, it appeared at position <span className="text-white font-medium">#{avgPosition}</span> in recommendation lists.
                </p>
              )}
              {positiveMentions > 0 && (
                <p className="text-white/70">
                  <span className="text-green-400 font-medium">{positiveMentions}</span> of those mentions had positive sentiment.
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-white/70">
                <span className="text-white font-medium">{product.name}</span> wasn't mentioned when we asked AI models for{' '}
                <span className="text-white font-medium">{product.category}</span> recommendations.
              </p>
              <p className="text-white/50 text-sm">
                This doesn't mean AI doesn't know about your product — just that it wasn't top-of-mind for these specific queries. 
                Improving your AI visibility can help you get recommended more often.
              </p>
            </div>
          )}
        </div>

        {/* CTA Section */}
        <div className="bg-white/[0.02] rounded-2xl border border-white/[0.08] p-6 md:p-8">
          <h2 className="text-xl font-semibold text-white mb-3">
            Track your AI visibility over time
          </h2>
          <p className="text-white/50 mb-6">
            See exactly how ChatGPT, Perplexity, and Claude describe your product. 
            Get alerts when your visibility changes and recommendations to improve it.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href={`/signup?ref=producthunt&product=${product.slug}`}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-opacity hover:opacity-90"
              style={{ backgroundColor: PH_ORANGE, color: 'white' }}
            >
              Get detailed insights
            </Link>
            <a
              href={phUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium bg-white/[0.05] text-white hover:bg-white/[0.08] transition-colors"
            >
              View on Product Hunt
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* PH Offer */}
        <div className="mt-8 p-6 rounded-2xl border text-center" style={{ backgroundColor: `${PH_ORANGE}08`, borderColor: `${PH_ORANGE}20` }}>
          <p className="text-white/70 mb-2">
            <span className="font-medium text-white">Product Hunt founder?</span>{' '}
            Get 3 months of Harbor Pro free.
          </p>
          <Link
            href={`/signup?ref=producthunt&offer=pro3&product=${product.slug}`}
            className="text-sm font-medium hover:underline"
            style={{ color: PH_ORANGE }}
          >
            Claim your free Pro access →
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  )
}