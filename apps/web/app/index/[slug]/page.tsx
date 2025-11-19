'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, ExternalLink, Check, Copy, TrendingUp, Clock } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

interface BrandProfile {
  id: string
  brand_name: string
  slug: string
  domain: string
  logo_url: string
  visibility_score: number
  industry: string
  rank_global: number
  rank_in_industry: number
  claimed: boolean
  feed_url: string
  feed_data: any
  accesses_last_30_days: number
  last_updated_at: string
}

export default function BrandProfilePage({ params }: { params: { slug: string } }) {
  const [profile, setProfile] = useState<BrandProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [showClaimModal, setShowClaimModal] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await fetch(`/api/index/brands/${params.slug}`)
        const data = await response.json()
        setProfile(data)
      } catch (error) {
        console.error('Failed to load profile:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [params.slug])

  const copyFeedUrl = () => {
    if (profile) {
      navigator.clipboard.writeText(profile.feed_url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0F1A] flex items-center justify-center">
        <div className="inline-block w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#0A0F1A] flex items-center justify-center px-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Brand not found</h1>
          <Link href="/index" className="text-white/50 hover:text-white transition-colors">
            ← Back to index
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0A0F1A]">
      {/* Header */}
      <div className="border-b border-white/5">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <Link
            href="/index"
            className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to index
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <section className="px-6 py-12">
        <div className="max-w-5xl mx-auto">
          {/* Brand Header Card */}
          <div className="rounded-2xl bg-[#0C1422] border border-white/5 p-8 mb-8">
            <div className="flex items-start gap-6 mb-8">
              {/* Logo */}
              <div className="w-20 h-20 rounded-xl overflow-hidden bg-white/5 flex items-center justify-center flex-shrink-0">
                <Image
                  src={profile.logo_url}
                  alt={profile.brand_name}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none'
                  }}
                />
              </div>

              {/* Brand Info */}
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-white mb-2">
                  {profile.brand_name}
                </h1>
                
                <div className="flex items-center gap-4 text-white/50 mb-4">
                  <span>#{profile.rank_global} globally</span>
                  {profile.rank_in_industry && (
                    <span>#{profile.rank_in_industry} in {profile.industry}</span>
                  )}
                </div>

                <a
                  href={`https://${profile.domain}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors"
                >
                  {profile.domain}
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>

              {/* Status Badge */}
              <div>
                {profile.claimed ? (
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-400/10 text-green-400 font-medium">
                    <Check className="w-5 h-5" />
                    Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 text-white/50 border border-white/10">
                    Unverified
                  </span>
                )}
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-white/5">
              {/* Visibility Score */}
              <div>
                <div className="text-sm text-white/50 mb-2">Visibility Score</div>
                <div className="flex items-center gap-3">
                  <div className="text-4xl font-bold text-white">
                    {profile.visibility_score.toFixed(1)}%
                  </div>
                  {profile.visibility_score >= 80 && (
                    <TrendingUp className="w-6 h-6 text-green-400" />
                  )}
                </div>
                <div className="mt-3 h-2 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#2979FF] to-[#00C9FF] rounded-full"
                    style={{ width: `${profile.visibility_score}%` }}
                  />
                </div>
              </div>

              {/* AI Access Count */}
              <div>
                <div className="text-sm text-white/50 mb-2">AI System Access</div>
                <div className="text-4xl font-bold text-white">
                  {profile.accesses_last_30_days.toLocaleString()}
                </div>
                <div className="text-sm text-white/40 mt-1">Last 30 days</div>
              </div>

              {/* Last Updated */}
              <div>
                <div className="text-sm text-white/50 mb-2">Last Updated</div>
                <div className="flex items-center gap-2 text-white">
                  <Clock className="w-5 h-5 text-white/40" />
                  <span>
                    {new Date(profile.last_updated_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* AI Profile Section */}
          <div className="rounded-2xl bg-[#0C1422] border border-white/5 p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">AI Profile</h2>
              <button
                onClick={copyFeedUrl}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all text-sm"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy Feed URL
                  </>
                )}
              </button>
            </div>

            <div className="space-y-4">
              {/* Feed URL */}
              <div>
                <div className="text-sm text-white/50 mb-2">Feed Endpoint</div>
                <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-[#0F1B2C] border border-white/5 font-mono text-sm text-white/70">
                  {profile.feed_url}
                </div>
              </div>

              {/* Description */}
              {profile.feed_data?.description && (
                <div>
                  <div className="text-sm text-white/50 mb-2">Description</div>
                  <p className="text-white/80 leading-relaxed">
                    {profile.feed_data.description}
                  </p>
                </div>
              )}

              {/* Products */}
              {profile.feed_data?.products && profile.feed_data.products.length > 0 && (
                <div>
                  <div className="text-sm text-white/50 mb-3">Products</div>
                  <div className="space-y-2">
                    {profile.feed_data.products.slice(0, 3).map((product: any, i: number) => (
                      <div
                        key={i}
                        className="px-4 py-3 rounded-lg bg-[#0F1B2C] border border-white/5"
                      >
                        <div className="font-medium text-white mb-1">{product.name}</div>
                        <div className="text-sm text-white/50">{product.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* View Full Profile */}
              <a
                href={profile.feed_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors"
              >
                View full JSON profile
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Claim CTA */}
          {!profile.claimed && (
            <div className="rounded-2xl bg-gradient-to-br from-[#0C1422] to-[#0F1B2C] border border-white/10 p-8">
              <div className="max-w-2xl">
                <h3 className="text-2xl font-bold text-white mb-3">
                  Are you from {profile.brand_name}?
                </h3>
                <p className="text-white/70 mb-6 leading-relaxed">
                  Claim this profile to update information, track which AI systems access you, 
                  and optimize your visibility across ChatGPT, Claude, Gemini, and Perplexity.
                </p>
                <button
                  onClick={() => setShowClaimModal(true)}
                  className="inline-flex items-center px-8 py-3.5 rounded-lg bg-white text-black text-base font-medium hover:bg-white/90 transition-all duration-200"
                >
                  Claim This Profile
                </button>
              </div>
            </div>
          )}

          {profile.claimed && (
            <div className="rounded-2xl bg-[#0C1422] border border-white/5 p-8">
              <div className="flex items-center gap-3 text-green-400">
                <Check className="w-6 h-6" />
                <span className="text-lg font-medium">
                  This profile has been claimed and verified by {profile.brand_name}
                </span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Claim Modal */}
      {showClaimModal && (
        <ClaimModal
          brandName={profile.brand_name}
          domain={profile.domain}
          profileId={profile.id}
          onClose={() => setShowClaimModal(false)}
        />
      )}
    </div>
  )
}

// Claim Modal Component
function ClaimModal({
  brandName,
  domain,
  profileId,
  onClose,
}: {
  brandName: string
  domain: string
  profileId: string
  onClose: () => void
}) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleClaim() {
    setError('')
    setLoading(true)

    // Validate email domain
    const emailDomain = email.split('@')[1]
    if (emailDomain !== domain) {
      setError(`Email must be from @${domain}`)
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/profiles/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile_id: profileId, email }),
      })

      if (response.ok) {
        setSent(true)
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to send verification email')
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEscape)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-[#0C1422] border border-white/10 p-8">
        {sent ? (
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-green-400/10 flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Check your email</h3>
            <p className="text-white/70 mb-6">
              We sent a verification link to <strong>{email}</strong>
            </p>
            <button
              onClick={onClose}
              className="text-white/50 hover:text-white transition-colors"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <h3 className="text-2xl font-bold text-white mb-2">
              Claim {brandName}
            </h3>
            <p className="text-white/70 mb-6">
              Verify your email to claim this profile
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-white/70 mb-2">Work Email</label>
                <input
                  type="email"
                  placeholder={`you@${domain}`}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-[#0F1B2C] border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-white/30 transition-colors"
                />
                <p className="text-xs text-white/40 mt-2">
                  Must be from @{domain}
                </p>
              </div>

              {error && (
                <div className="px-4 py-3 rounded-lg bg-red-400/10 border border-red-400/20 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleClaim}
                  disabled={loading || !email}
                  className="flex-1 px-6 py-3 rounded-lg bg-white text-black font-medium hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {loading ? 'Sending...' : 'Send Verification Email'}
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-3 rounded-lg bg-white/5 text-white hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}