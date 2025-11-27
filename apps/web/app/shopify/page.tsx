// apps/web/app/shopify/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { 
  ArrowRight, 
  Check, 
  Copy,
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
    <div className="min-h-screen bg-[#0a0f1a]">
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-transparent">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-20">
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
                className="hidden sm:inline-flex items-center px-5 py-2.5 rounded-lg bg-white text-[#0a0f1a] text-sm font-medium hover:bg-gray-100 transition-all"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Cinematic */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        
        {/* Halo Arc Effect */}
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Main arc glow */}
          <div 
            className="absolute w-[140%] md:w-[100%] max-w-[1400px] aspect-square"
            style={{
              background: `
                radial-gradient(
                  ellipse 80% 50% at 50% 100%,
                  rgba(139, 92, 246, 0.15) 0%,
                  rgba(34, 211, 238, 0.08) 30%,
                  rgba(149, 191, 71, 0.05) 50%,
                  transparent 70%
                )
              `,
              transform: 'translateY(30%)',
            }}
          />
          {/* Secondary inner glow */}
          <div 
            className="absolute w-[100%] md:w-[70%] max-w-[1000px] aspect-square"
            style={{
              background: `
                radial-gradient(
                  ellipse 70% 40% at 50% 100%,
                  rgba(139, 92, 246, 0.2) 0%,
                  rgba(236, 72, 153, 0.1) 40%,
                  transparent 60%
                )
              `,
              transform: 'translateY(40%)',
            }}
          />
          {/* Subtle green accent at the edge */}
          <div 
            className="absolute w-[160%] md:w-[110%] max-w-[1600px] aspect-square opacity-40"
            style={{
              background: `
                radial-gradient(
                  ellipse 90% 50% at 50% 100%,
                  transparent 60%,
                  rgba(149, 191, 71, 0.1) 70%,
                  transparent 80%
                )
              `,
              transform: 'translateY(25%)',
            }}
          />
        </div>

        {/* Wave line motif */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'url(/images/wireframe-wave.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center bottom',
          }}
        />

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center pt-20">
          
          {/* Early Access Badge */}
          <div className="inline-flex items-center gap-2.5 mb-10 md:mb-12">
            <span className="w-2 h-2 rounded-full bg-[#95BF47] animate-pulse" />
            <span className="text-sm text-white/50 tracking-widest uppercase">Coming Q1 2026</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-heading font-bold mb-8 leading-[1.1]">
            <span className="text-white">
              Get your products recommended
            </span>
            <br />
            <span className="text-white">
              by AI.{' '}
            </span>
            <span 
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: 'linear-gradient(135deg, #a5b4fc 0%, #22d3ee 50%, #a5b4fc 100%)'
              }}
            >
              Automatically.
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto leading-relaxed mb-12 md:mb-14">
            Harbor generates and injects product schema, FAQs, and AI-ready descriptions 
            so ChatGPT, Claude, Gemini, and Perplexity actually understand your products.
          </p>

          {/* Signup Form or Success State */}
          {!isSubmitted ? (
            <div className="max-w-lg mx-auto">
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="flex-1 px-6 py-4 rounded-xl bg-white text-[#0a0f1a] placeholder-gray-400 text-base focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-4 rounded-xl font-semibold bg-[#101A31] text-white border border-white/10 flex items-center justify-center gap-2 transition-all hover:border-[#95BF47]/40 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Get early access
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
              {error && (
                <p className="mt-4 text-red-400 text-sm">{error}</p>
              )}
              <p className="mt-6 text-sm text-white/30">
                {totalSignups.toLocaleString()}+ store owners on the waitlist
              </p>
            </div>
          ) : (
            <div className="max-w-md mx-auto">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
                <div className="w-12 h-12 rounded-full bg-[#95BF47]/20 flex items-center justify-center mx-auto mb-5">
                  <Check className="w-6 h-6 text-[#95BF47]" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">You're on the list</h3>
                <p className="text-white/40 text-sm mb-6">
                  Position #{position?.toLocaleString()}. Share to move up.
                </p>

                <div className="bg-white/5 rounded-lg p-3 mb-5">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={referralLink}
                      readOnly
                      className="flex-1 bg-transparent text-white/50 text-sm truncate outline-none"
                    />
                    <button
                      onClick={copyReferralLink}
                      className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-[#95BF47]" />
                      ) : (
                        <Copy className="w-4 h-4 text-white/40" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={shareToLinkedIn}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 text-white/70 text-sm font-medium hover:bg-white/10 transition-colors"
                  >
                    <Linkedin className="w-4 h-4" />
                    LinkedIn
                  </button>
                  <button
                    onClick={shareToTwitter}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 text-white/70 text-sm font-medium hover:bg-white/10 transition-colors"
                  >
                    <Twitter className="w-4 h-4" />
                    Twitter
                  </button>
                </div>

                {referralCount > 0 && (
                  <p className="mt-5 text-sm text-[#95BF47]">
                    {referralCount} {referralCount === 1 ? 'person' : 'people'} joined through your link
                  </p>
                )}
              </div>
            </div>
          )}

        </div>
      </section>

      {/* Color Noise Transition Bar */}
      <div 
        className="w-full h-4 md:h-5"
        style={{
          backgroundImage: 'url(/shopify-noise-bar.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />

      {/* The Shift Section */}
      <section className="relative py-28 md:py-36 bg-[#fafbfc] overflow-hidden">
        
        <div 
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{
            backgroundImage: 'url(/images/wireframe-wave.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />

        <div className="relative z-10 max-w-5xl mx-auto px-6">
          
          {/* Header */}
          <div className="text-center mb-20 md:mb-24">
            <p className="text-xs text-gray-400 uppercase tracking-[0.2em] mb-5">The Shift</p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-[#0a0f1a] leading-tight">
              Discovery moved from search results to AI answers.
              <br />
              <span className="text-gray-400">Your products need to show up there.</span>
            </h2>
          </div>

          {/* Stats - Cinematic Cards */}
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 max-w-3xl mx-auto mb-24">
            <div className="bg-white rounded-2xl p-10 shadow-sm border border-gray-100">
              <div className="text-7xl md:text-8xl font-heading font-light text-[#0a0f1a] mb-3">
                76%
              </div>
              <p className="text-gray-500 text-lg">
                of buyers use AI to research products
              </p>
            </div>
            <div className="bg-white rounded-2xl p-10 shadow-sm border border-gray-100">
              <div className="text-7xl md:text-8xl font-heading font-light text-[#0a0f1a] mb-3">
                1
              </div>
              <p className="text-gray-500 text-lg">
                answer is all users see. AI models recommend what they parse.
              </p>
            </div>
          </div>

          {/* Three Columns */}
          <div className="grid md:grid-cols-3 gap-12 md:gap-16 text-center max-w-4xl mx-auto">
            <div>
              <h3 className="text-lg font-semibold text-[#0a0f1a] mb-3">Install</h3>
              <p className="text-gray-500 leading-relaxed">
                Connect your Shopify store in under 60 seconds from the App Store.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#0a0f1a] mb-3">Optimize</h3>
              <p className="text-gray-500 leading-relaxed">
                Auto-generate product schema, FAQs, and AI-ready descriptions designed for generative models.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#0a0f1a] mb-3">Track</h3>
              <p className="text-gray-500 leading-relaxed">
                Monitor which products appear in AI answers and measure visibility over time.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* The Problem Section */}
      <section className="relative py-28 md:py-36 bg-[#0a0f1a] overflow-hidden">
        
        <div 
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{
            background: 'linear-gradient(180deg, rgba(139, 92, 246, 0.03) 0%, transparent 50%, rgba(34, 211, 238, 0.02) 100%)'
          }}
        />

        <div className="relative z-10 max-w-6xl mx-auto px-6">
          
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            
            {/* Left - Problem Card */}
            <div className="relative">
              <div 
                className="rounded-2xl p-10 md:p-12"
                style={{
                  background: 'linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
                  border: '1px solid rgba(255,255,255,0.06)'
                }}
              >
                <p className="text-xs text-white/30 uppercase tracking-[0.2em] mb-8">The Problem</p>
                <p className="text-2xl md:text-3xl text-white leading-snug">
                  AI answers are the new product shelf.
                  <br /><br />
                  <span className="text-white/50">
                    If AI models don't understand your products, they'll never recommend them.
                  </span>
                </p>
              </div>
              
              {/* Subtle green accent glow at bottom */}
              <div 
                className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-2/3 h-1 rounded-full blur-sm"
                style={{
                  background: 'rgba(149, 191, 71, 0.4)'
                }}
              />
            </div>

            {/* Right - Solution */}
            <div>
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-6 leading-tight">
                Products need structure to be seen by AI.
                <br />
                <span className="text-white/40">Most stores don't have it.</span>
              </h2>
              <p className="text-white/50 text-lg leading-relaxed mb-10">
                AI models recommend what they can parse. Without proper schema, FAQs, and structured 
                product descriptions, your products are invisible to generative search.
              </p>
              
              <div className="space-y-5">
                {[
                  'Products with correct schema are cited more often in AI answers',
                  'AI-driven product discovery is growing every quarter',
                  'Early optimizers win category position',
                ].map((point, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#95BF47] mt-2.5 flex-shrink-0" />
                    <span className="text-white/60">{point}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Capabilities Section */}
      <section className="relative py-28 md:py-36 overflow-hidden" style={{ background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 50%, #fafbfc 100%)' }}>
        
        <div className="relative z-10 max-w-6xl mx-auto px-6">
          
          <div className="text-center mb-16 md:mb-20">
            <p className="text-xs text-gray-400 uppercase tracking-[0.2em] mb-5">Capabilities</p>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-[#0a0f1a]">
              What Harbor for Shopify includes
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                title: 'Automatic Schema Injection',
                description: 'Product, Organization, FAQ, and Review schema added to your theme automatically.'
              },
              {
                title: 'AI-Ready Descriptions',
                description: 'Factual product copy that AI models can parse and cite.'
              },
              {
                title: 'Visibility Dashboard',
                description: 'Track which products appear in AI answers across ChatGPT, Claude, Gemini, and Perplexity.'
              },
              {
                title: 'Competitor Monitoring',
                description: 'See which stores appear alongside yours in generative answers.'
              },
              {
                title: 'FAQ Generation',
                description: 'Turn real AI-user questions into structured FAQ pages.'
              },
              {
                title: 'One-Click Fixes',
                description: 'Resolve schema and citation issues instantly — no developer needed.'
              },
            ].map((feature, i) => (
              <div 
                key={i} 
                className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#95BF47] mt-2 flex-shrink-0" />
                  <h3 className="text-lg font-semibold text-[#0a0f1a]">{feature.title}</h3>
                </div>
                <p className="text-gray-500 leading-relaxed pl-[18px]">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative py-28 md:py-36 bg-[#0a0f1a] overflow-hidden">
        
        {/* Gradient top border */}
        <div 
          className="absolute top-0 left-0 right-0 h-px"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(139, 92, 246, 0.4) 25%, rgba(34, 211, 238, 0.4) 50%, rgba(236, 72, 153, 0.4) 75%, transparent 100%)'
          }}
        />

        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-white mb-6">
            Be first to AI search.
          </h2>
          <p className="text-lg text-white/40 mb-12 max-w-xl mx-auto leading-relaxed">
            The stores that optimize for AI now establish the positions that matter. 
            Join the waitlist for early access.
          </p>

          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="max-w-lg mx-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="flex-1 px-6 py-4 rounded-xl bg-white text-[#0a0f1a] placeholder-gray-400 text-base focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-4 rounded-xl font-semibold bg-[#101A31] text-white border border-white/10 flex items-center justify-center gap-2 transition-all hover:border-[#95BF47]/40 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Get early access
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
              {error && (
                <p className="mt-4 text-red-400 text-sm">{error}</p>
              )}
            </form>
          ) : (
            <div className="inline-flex items-center gap-3 px-6 py-4 rounded-xl bg-white/5 border border-white/10">
              <Check className="w-5 h-5 text-[#95BF47]" />
              <span className="text-white">You're #{position?.toLocaleString()} on the waitlist</span>
            </div>
          )}

        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0a0f1a] border-t border-white/5 py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-white/30 text-sm">
            <Image 
              src="/logo-icon.png" 
              alt="Harbor" 
              width={20}
              height={20}
              className="opacity-30"
            />
            <span>© 2025 Harbor. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-8 text-sm text-white/30">
            <Link href="/privacy" className="hover:text-white/60 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white/60 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </footer>

      {/* Fullscreen Menu */}
      <FullscreenMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </div>
  )
}