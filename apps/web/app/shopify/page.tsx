// apps/web/app/shopify/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { 
  ArrowRight, 
  Check, 
  Copy,
  CheckCircle,
  Linkedin,
  Twitter,
  Menu
} from 'lucide-react'
import FullscreenMenu from '@/components/landing/FullscreenMenu'

export default function ShopifyWaitlistPage() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [position, setPosition] = useState<number | null>(null)
  const [referralCode, setReferralCode] = useState<string | null>(null)
  const [referralCount, setReferralCount] = useState(0)
  const [totalSignups, setTotalSignups] = useState(847)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const ref = params.get('ref')
    if (ref) {
      sessionStorage.setItem('shopify_referrer', ref)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const referredBy = sessionStorage.getItem('shopify_referrer')
      
      const response = await fetch('/api/waitlist/shopify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, referredBy })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong')
      }

      setPosition(data.position)
      setReferralCode(data.referralCode)
      setReferralCount(data.referralCount || 0)
      setTotalSignups(data.totalSignups || totalSignups + 1)
      setIsSubmitted(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const referralLink = referralCode 
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/shopify?ref=${referralCode}`
    : ''

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareToLinkedIn = () => {
    const url = encodeURIComponent(referralLink)
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank')
  }

  const shareToTwitter = () => {
    const text = encodeURIComponent("Just joined the waitlist for Harbor's Shopify plugin — AI visibility for e-commerce")
    const url = encodeURIComponent(referralLink)
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank')
  }

  return (
    <div className="min-h-screen bg-[#101A31]">
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#101A31]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-3">
              <Image 
                src="/logo-icon.png" 
                alt="Harbor" 
                width={32} 
                height={32}
                className="w-8 h-8"
              />
              <span className="text-xl font-bold text-white">Harbor</span>
            </Link>

            <div className="flex items-center space-x-3 md:space-x-4">
              <button
                onClick={() => setIsMenuOpen(true)}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Menu"
              >
                <Menu className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </button>
              
              <Link
                href="/auth/signup"
                className="inline-flex items-center px-4 md:px-5 py-2 md:py-2.5 rounded-lg bg-white text-[#101A31] text-sm font-medium hover:bg-gray-100 transition-all"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
        
        {/* Radial Wireframe Background */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div 
            className="w-[200%] md:w-[150%] max-w-[1800px] aspect-square opacity-20"
            style={{
              background: `
                repeating-radial-gradient(
                  circle at center,
                  transparent 0px,
                  transparent 59px,
                  rgba(255,255,255,0.08) 60px
                )
              `,
            }}
          />
        </div>

        {/* Gradient Overlay */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 0%, #101A31 70%)'
          }}
        />

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 mb-6 md:mb-8">
            <span className="w-2 h-2 rounded-full bg-[#95BF47]" />
            <span className="text-sm text-white/50 tracking-wide">Coming Q1 2026</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-heading font-bold mb-6 md:mb-8 leading-[1] md:leading-[0.95]">
            <span 
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: 'linear-gradient(135deg, #ffffff 0%, #e0e7ff 25%, #a5b4fc 50%, #22d3ee 75%, #ffffff 100%)'
              }}
            >
              AI Visibility
            </span>
            <br />
            <span className="text-white">
              for Shopify
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-base md:text-xl text-white/60 max-w-2xl mx-auto leading-relaxed px-2 mb-10 md:mb-12">
            Get your products cited and recommended by ChatGPT, Claude, Gemini, and Perplexity. 
            One-click optimization. No technical skills needed.
          </p>

          {/* Signup Form or Success State */}
          {!isSubmitted ? (
            <div className="max-w-md mx-auto">
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="flex-1 px-5 py-4 rounded-lg bg-white text-[#101A31] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-4 rounded-lg font-semibold bg-[#101A31] text-white border-2 border-white/20 flex items-center justify-center gap-2 transition-all hover:border-[#95BF47]/50 hover:bg-[#101A31] disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Join Waitlist
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
              {error && (
                <p className="mt-3 text-red-400 text-sm">{error}</p>
              )}
              <p className="mt-6 text-sm text-white/40">
                {totalSignups.toLocaleString()}+ store owners already on the list
              </p>
            </div>
          ) : (
            <div className="max-w-md mx-auto">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8">
                <div className="w-12 h-12 rounded-full bg-[#95BF47]/20 flex items-center justify-center mx-auto mb-4">
                  <Check className="w-6 h-6 text-[#95BF47]" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">You're on the list</h3>
                <p className="text-white/50 text-sm mb-6">
                  Position #{position?.toLocaleString()}. Share to move up.
                </p>

                {/* Referral Link */}
                <div className="bg-white/5 rounded-lg p-3 mb-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={referralLink}
                      readOnly
                      className="flex-1 bg-transparent text-white/60 text-sm truncate outline-none"
                    />
                    <button
                      onClick={copyReferralLink}
                      className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-[#95BF47]" />
                      ) : (
                        <Copy className="w-4 h-4 text-white/50" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Share Buttons */}
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={shareToLinkedIn}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 text-white text-sm font-medium hover:bg-white/20 transition-colors"
                  >
                    <Linkedin className="w-4 h-4" />
                    LinkedIn
                  </button>
                  <button
                    onClick={shareToTwitter}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 text-white text-sm font-medium hover:bg-white/20 transition-colors"
                  >
                    <Twitter className="w-4 h-4" />
                    Twitter
                  </button>
                </div>

                {referralCount > 0 && (
                  <p className="mt-4 text-sm text-[#95BF47]">
                    {referralCount} {referralCount === 1 ? 'person' : 'people'} joined through your link
                  </p>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 md:bottom-12 left-1/2 -translate-x-1/2 hidden md:block">
          <div className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-2">
            <div className="w-1 h-2 bg-white/40 rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* Color Noise Transition Bar */}
      <div 
        className="w-full h-4 md:h-6"
        style={{
          backgroundImage: 'url(/shopify-noise-bar.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />

      {/* The Shift Section - Light */}
      <section className="relative py-24 md:py-32 bg-[#f8fafc] overflow-hidden">
        
        {/* Subtle wave background */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{
            backgroundImage: 'url(/images/wireframe-wave.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />

        <div className="relative z-10 max-w-5xl mx-auto px-6">
          
          {/* Section Header */}
          <div className="text-center mb-16 md:mb-20">
            <p className="text-sm text-gray-400 uppercase tracking-wider mb-4">The Shift</p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-[#101A31] leading-tight">
              Discovery moved from search results
              <br />
              <span className="text-gray-400">to AI answers.</span>
            </h2>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-2 gap-12 md:gap-20 max-w-3xl mx-auto mb-20">
            <div className="text-center">
              <div className="text-6xl md:text-7xl font-heading font-light text-[#101A31] mb-2">
                76%
              </div>
              <p className="text-gray-500">
                of buyers use AI to research products or services
              </p>
            </div>
            <div className="text-center">
              <div className="text-6xl md:text-7xl font-heading font-light text-[#101A31] mb-2">
                1
              </div>
              <p className="text-gray-500">
                answer is all users see. AI models recommend what they understand.
              </p>
            </div>
          </div>

          {/* Three Columns */}
          <div className="grid md:grid-cols-3 gap-8 md:gap-12 text-center">
            <div>
              <h3 className="text-lg font-semibold text-[#101A31] mb-3">Install</h3>
              <p className="text-gray-500 leading-relaxed">
                Connect your Shopify store in under 60 seconds using our App Store listing.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#101A31] mb-3">Optimize</h3>
              <p className="text-gray-500 leading-relaxed">
                Harbor auto-generates product schema, FAQs, and AI-ready descriptions designed for generative models.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#101A31] mb-3">Track</h3>
              <p className="text-gray-500 leading-relaxed">
                See which products appear in AI answers and monitor your visibility over time.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* Why It Matters Section - Navy */}
      <section className="relative py-24 md:py-32 bg-[#101A31] overflow-hidden">
        
        {/* Subtle gradient sheen */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-50"
          style={{
            background: 'linear-gradient(180deg, rgba(34, 211, 238, 0.03) 0%, transparent 50%, rgba(168, 85, 247, 0.03) 100%)'
          }}
        />

        <div className="relative z-10 max-w-6xl mx-auto px-6">
          
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            
            {/* Left - Dark Card */}
            <div className="relative">
              <div 
                className="rounded-2xl p-8 md:p-10"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
                  border: '1px solid rgba(255,255,255,0.08)'
                }}
              >
                <p className="text-sm text-white/40 uppercase tracking-wider mb-6">The Problem</p>
                <p className="text-xl md:text-2xl text-white/90 leading-relaxed mb-6">
                  When someone asks ChatGPT for the "best running shoes" or "top inventory apps" — where does your product appear?
                </p>
                <p className="text-white/50 leading-relaxed">
                  AI models recommend what they understand. Structured data is their language. 
                  Without proper schema and optimization, your products are invisible to generative search.
                </p>
              </div>
              
              {/* Subtle green accent line */}
              <div 
                className="absolute -bottom-px left-8 right-8 h-px"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, rgba(149,191,71,0.5) 50%, transparent 100%)'
                }}
              />
            </div>

            {/* Right - Content */}
            <div>
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-6 leading-tight">
                Structured data is the new SEO.
              </h2>
              <p className="text-white/60 text-lg leading-relaxed mb-8">
                Harbor for Shopify automatically optimizes your store for AI discovery. 
                Product schema, FAQ markup, and AI-ready descriptions — all generated and injected without touching your theme code.
              </p>
              
              <div className="space-y-4">
                {[
                  'Products with proper schema are cited more frequently',
                  'AI search queries are growing 40% quarter over quarter',
                  'Early adopters establish presence before competitors',
                ].map((point, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#95BF47] mt-2.5 flex-shrink-0" />
                    <span className="text-white/70">{point}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Features Section - Soft Gradient */}
      <section className="relative py-24 md:py-32 bg-gradient-to-b from-[#f8fafc] via-[#f1f5f9] to-white overflow-hidden">
        
        <div className="relative z-10 max-w-6xl mx-auto px-6">
          
          <div className="text-center mb-16">
            <p className="text-sm text-gray-400 uppercase tracking-wider mb-4">Capabilities</p>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-[#101A31]">
              What Harbor for Shopify includes
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                title: 'Automatic Schema Injection',
                description: 'Product, Organization, FAQ, and Review schema added to your theme without code changes.'
              },
              {
                title: 'AI-Ready Descriptions',
                description: 'Generate clear, factual product copy that AI models can parse and cite accurately.'
              },
              {
                title: 'Visibility Dashboard',
                description: 'Track which products appear in AI answers across ChatGPT, Claude, Gemini, and Perplexity.'
              },
              {
                title: 'Competitor Monitoring',
                description: 'See when competitors appear for queries in your category. Understand the landscape.'
              },
              {
                title: 'FAQ Generation',
                description: 'Auto-create FAQ pages from real questions users ask AI about products like yours.'
              },
              {
                title: 'One-Click Fixes',
                description: 'When issues are detected, resolve them instantly. No developer required.'
              },
            ].map((feature, i) => (
              <div 
                key={i} 
                className="bg-white rounded-xl p-6 border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#95BF47] mt-2.5 flex-shrink-0" />
                  <h3 className="text-lg font-semibold text-[#101A31]">{feature.title}</h3>
                </div>
                <p className="text-gray-500 text-sm leading-relaxed pl-[18px]">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section - Navy */}
      <section className="relative py-24 md:py-32 bg-[#101A31] overflow-hidden">
        
        {/* Top gradient border */}
        <div 
          className="absolute top-0 left-0 right-0 h-px"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(168,85,247,0.3) 25%, rgba(34,211,238,0.3) 50%, rgba(236,72,153,0.3) 75%, transparent 100%)'
          }}
        />

        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-white mb-6">
            Be first to AI search.
          </h2>
          <p className="text-lg text-white/50 mb-10 max-w-xl mx-auto">
            The stores that optimize for AI now establish the positions that matter. 
            Join the waitlist for early access.
          </p>

          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="flex-1 px-5 py-4 rounded-lg bg-white text-[#101A31] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-4 rounded-lg font-semibold bg-[#101A31] text-white border-2 border-white/20 flex items-center justify-center gap-2 transition-all hover:border-[#95BF47]/50 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Join Waitlist
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
              {error && (
                <p className="mt-3 text-red-400 text-sm">{error}</p>
              )}
            </form>
          ) : (
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-white/5 border border-white/10">
              <Check className="w-5 h-5 text-[#95BF47]" />
              <span className="text-white">You're #{position?.toLocaleString()} on the waitlist</span>
            </div>
          )}

        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#101A31] border-t border-white/5 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-white/40 text-sm">
            <Image 
              src="/logo-icon.png" 
              alt="Harbor" 
              width={20}
              height={20}
              className="opacity-40"
            />
            <span>© 2025 Harbor. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-white/40">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </footer>

      {/* Fullscreen Menu */}
      <FullscreenMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </div>
  )
}