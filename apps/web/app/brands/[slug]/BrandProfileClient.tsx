'use client'

import { useState, useEffect } from 'react'
import { X, Check, AlertCircle, TrendingUp, TrendingDown, Shield } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

interface Brand {
  id: string
  brand_name: string
  slug: string
  domain: string
  logo_url: string
  visibility_score: number
  industry: string
  rank_global: number
  claimed: boolean
  accesses_last_30_days: number
}

interface Props {
  brand: Brand
}

export default function BrandProfileClient({ brand: initialBrand }: Props) {
  const [brand, setBrand] = useState<Brand>(initialBrand)
  const [loading, setLoading] = useState(initialBrand.brand_name === 'Loading...')
  const [showClaimModal, setShowClaimModal] = useState(false)
  const [claimStep, setClaimStep] = useState<'email' | 'code'>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [claimLoading, setClaimLoading] = useState(false)
  const [error, setError] = useState('')

  // Fetch brand data if not provided
  useEffect(() => {
    if (initialBrand.brand_name === 'Loading...') {
      fetch(`/api/brands/${initialBrand.slug}`)
        .then(res => res.json())
        .then(data => {
          setBrand(data)
          setLoading(false)
        })
        .catch(err => {
          console.error('Failed to fetch brand:', err)
          setLoading(false)
        })
    }
  }, [initialBrand])

  const handleSendCode = async () => {
    setError('')
    
    // Validate domain
    const emailDomain = email.split('@')[1]
    if (!emailDomain || emailDomain !== brand.domain) {
      setError(`You must use an email ending in @${brand.domain}`)
      return
    }

    setClaimLoading(true)
    
    try {
      const res = await fetch('/api/claim/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brandId: brand.id, email })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send code')
      }

      setClaimStep('code')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setClaimLoading(false)
    }
  }

  const handleVerifyCode = async () => {
    setError('')
    setClaimLoading(true)

    try {
      const res = await fetch('/api/claim/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brandId: brand.id, email, code })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Invalid or expired code')
      }

      // Redirect to dashboard
      window.location.href = `/dashboard/brand/${brand.id}`
    } catch (err: any) {
      setError(err.message)
    } finally {
      setClaimLoading(false)
    }
  }

  // Mock delta calculation
  const delta = brand.rank_global <= 10 ? 5.8 : -1.2
  const isPositive = delta > 0

  return (
    <div className="min-h-screen bg-[#101A31]">
      {/* Nav */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-3rem)] max-w-[1400px]">
        <div 
          className="backdrop-blur-xl bg-white/15 rounded-2xl shadow-2xl border border-white/10"
          style={{ backdropFilter: 'blur(12px)' }}
        >
          <div className="px-4 md:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14 md:h-16">
              <Link href="/" className="flex items-center space-x-2 md:space-x-3">
                <Image 
                  src="/logo-icon.png" 
                  alt="Harbor" 
                  width={32} 
                  height={32}
                  className="w-7 h-7 md:w-8 md:h-8"
                />
                <span className="text-lg md:text-xl font-bold text-white">Harbor</span>
              </Link>

              <div className="flex items-center space-x-2 md:space-x-4">
                <Link 
                  href="/brands" 
                  className="text-white/70 text-sm md:text-base hover:text-white transition-colors duration-200"
                >
                  ← Back to Index
                </Link>
                
                <Link
                  href="/dashboard"
                  className="inline-flex items-center px-4 md:px-5 py-2 md:py-2.5 rounded-lg bg-white text-black text-sm md:text-base font-medium hover:bg-white/90 transition-all duration-200"
                >
                  Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Spacer */}
      <div className="h-28" />

      {/* Profile Content */}
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-12 relative z-10">
        
        {/* Header Card */}
        <div className="bg-[#0C1422] rounded-2xl border border-white/5 p-8 md:p-12 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-8 mb-8">
            {/* Logo */}
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden bg-white/5 flex items-center justify-center flex-shrink-0">
              <Image
                src={brand.logo_url}
                alt={brand.brand_name}
                width={96}
                height={96}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none'
                }}
              />
            </div>

            {/* Brand Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl md:text-5xl font-bold text-white">
                  {brand.brand_name}
                </h1>
                {brand.claimed && (
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-400/10 text-green-400 text-sm font-medium">
                    <Shield className="w-4 h-4" />
                    Verified
                  </div>
                )}
              </div>
              <div className="flex items-center gap-4 text-white/50 text-sm md:text-base">
                <span>{brand.domain}</span>
                <span>•</span>
                <span>{brand.industry}</span>
                <span>•</span>
                <span>Rank #{brand.rank_global}</span>
              </div>
            </div>
          </div>

          {/* Visibility Score */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/5 rounded-xl p-6">
              <div className="flex items-center gap-2 text-white/50 text-sm mb-2">
                <div className="w-3 h-3 rounded-full bg-white/20" />
                Visibility Score
              </div>
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold text-white">
                  {brand.visibility_score.toFixed(1)}%
                </span>
                <span className={`text-lg font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                  {isPositive ? '+' : ''}{delta.toFixed(1)}%
                </span>
              </div>
            </div>

            <div className="bg-white/5 rounded-xl p-6">
              <div className="text-white/50 text-sm mb-2">Global Rank</div>
              <div className="text-4xl font-bold text-white">
                #{brand.rank_global}
              </div>
            </div>

            <div className="bg-white/5 rounded-xl p-6">
              <div className="text-white/50 text-sm mb-2">Profile Views (30d)</div>
              <div className="text-4xl font-bold text-white">
                {brand.accesses_last_30_days.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Unclaimed Notice / Claim Button */}
          {!brand.claimed && (
            <div className="mt-8 p-6 bg-[#FF6B4A]/10 border border-[#FF6B4A]/20 rounded-xl">
              <div className="flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-[#FF6B4A] flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white mb-2">
                    This profile is unclaimed
                  </h3>
                  <p className="text-white/70 text-sm mb-4">
                    Are you from {brand.brand_name}? Claim this profile to manage how AI models see your brand.
                  </p>
                  <button
                    onClick={() => setShowClaimModal(true)}
                    className="px-6 py-3 rounded-lg bg-[#FF6B4A] text-white font-medium hover:bg-[#FF6B4A]/90 transition-all"
                  >
                    Claim this profile
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* AI Profile Data (placeholder for now) */}
        <div className="bg-[#0C1422] rounded-2xl border border-white/5 p-8 md:p-12">
          <h2 className="text-2xl font-bold text-white mb-6">AI Visibility Profile</h2>
          <p className="text-white/50 font-mono text-sm">
            Full AI profile data coming soon. This will show how ChatGPT, Claude, Gemini, 
            and Perplexity describe {brand.brand_name}.
          </p>
        </div>
      </div>

      {/* Claim Modal */}
      {showClaimModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowClaimModal(false)}
          />

          {/* Modal */}
          <div className="relative bg-[#0C1422] rounded-2xl border border-white/10 w-full max-w-md p-8">
            {/* Close button */}
            <button
              onClick={() => setShowClaimModal(false)}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5 text-white/50" />
            </button>

            {/* Email Step */}
            {claimStep === 'email' && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Claim this Profile
                </h2>
                <p className="text-white/60 text-sm mb-6">
                  To verify ownership, enter an email with this domain:
                </p>

                <div className="mb-4">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 mb-4">
                    <span className="text-white/40">@</span>
                    <span className="text-white font-mono">{brand.domain}</span>
                  </div>

                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={`you@${brand.domain}`}
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#FF6B4A] transition-colors"
                    disabled={claimLoading}
                  />
                </div>

                {error && (
                  <div className="mb-4 p-3 rounded-lg bg-red-400/10 border border-red-400/20 text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <button
                  onClick={handleSendCode}
                  disabled={claimLoading || !email}
                  className="w-full px-6 py-3 rounded-lg bg-[#FF6B4A] text-white font-medium hover:bg-[#FF6B4A]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {claimLoading ? 'Sending...' : 'Send verification code'}
                </button>
              </div>
            )}

            {/* Code Step */}
            {claimStep === 'code' && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Verify your email
                </h2>
                <p className="text-white/60 text-sm mb-6">
                  We sent a 6-digit code to <span className="text-white font-mono">{email}</span>
                </p>

                <div className="mb-4">
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white text-center text-2xl tracking-widest placeholder-white/40 focus:outline-none focus:border-[#FF6B4A] transition-colors font-mono"
                    maxLength={6}
                    disabled={claimLoading}
                  />
                </div>

                {error && (
                  <div className="mb-4 p-3 rounded-lg bg-red-400/10 border border-red-400/20 text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <button
                  onClick={handleVerifyCode}
                  disabled={claimLoading || code.length !== 6}
                  className="w-full px-6 py-3 rounded-lg bg-[#FF6B4A] text-white font-medium hover:bg-[#FF6B4A]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-3"
                >
                  {claimLoading ? 'Verifying...' : 'Verify'}
                </button>

                <button
                  onClick={() => setClaimStep('email')}
                  className="w-full text-white/50 text-sm hover:text-white transition-colors"
                >
                  ← Use a different email
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}