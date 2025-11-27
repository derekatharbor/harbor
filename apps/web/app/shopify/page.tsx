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
  ShoppingBag,
  Zap,
  Eye,
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
    const text = encodeURIComponent("Just joined the waitlist for @useharbor's Shopify plugin - get your store seen by AI search engines 🚀")
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
                src="/images/Harbor_White_Logo.png" 
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

      {/* Hero Section - Dark */}
      <section className="relative min-h-[90vh] md:min-h-screen flex items-center justify-center pt-20 pb-12 md:pb-0 overflow-hidden">
        
        {/* Radial Wireframe Background */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div 
            className="w-[200%] md:w-[150%] max-w-[1800px] aspect-square opacity-15"
            style={{
              background: `
                repeating-radial-gradient(
                  circle at center,
                  transparent 0px,
                  transparent 59px,
                  rgba(149,191,71,0.15) 60px
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
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#95BF47]/10 border border-[#95BF47]/20 mb-6 md:mb-8">
            <span className="w-2 h-2 rounded-full bg-[#95BF47] animate-pulse" />
            <span className="text-sm font-medium text-[#95BF47]">Coming Q1 2026</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-heading font-bold mb-6 md:mb-8 leading-[1] md:leading-[0.95]">
            <span className="text-white">
              AI Visibility
            </span>
            <br />
            <span 
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: 'linear-gradient(135deg, #95BF47 0%, #5E8E3E 50%, #95BF47 100%)'
              }}
            >
              for Shopify
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-base md:text-xl text-white/60 max-w-2xl mx-auto leading-relaxed px-2 mb-10 md:mb-12">
            Get your products recommended by ChatGPT, Claude, Gemini & Perplexity. 
            One-click optimization. Zero technical skills. The first AI visibility plugin for e-commerce.
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
                  className="flex-1 px-5 py-4 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-[#95BF47]/50 focus:bg-white/15 transition-all"
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-4 rounded-lg font-semibold text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #95BF47 0%, #5E8E3E 100%)' }}
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
              <p className="mt-4 text-sm text-white/40">
                Join {totalSignups.toLocaleString()}+ store owners on the waitlist
              </p>
            </div>
          ) : (
            <div className="max-w-md mx-auto bg-white/5 border border-[#95BF47]/30 rounded-2xl p-6 md:p-8">
              <div className="w-14 h-14 rounded-full bg-[#95BF47]/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-7 h-7 text-[#95BF47]" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">You're on the list!</h3>
              <p className="text-white/60 text-sm mb-6">
                Position #{position?.toLocaleString()}. Share to move up.
              </p>

              {/* Referral Link */}
              <div className="bg-white/5 rounded-lg p-3 mb-4">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={referralLink}
                    readOnly
                    className="flex-1 bg-transparent text-white/70 text-sm truncate outline-none"
                  />
                  <button
                    onClick={copyReferralLink}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-[#95BF47]" />
                    ) : (
                      <Copy className="w-4 h-4 text-white/60" />
                    )}
                  </button>
                </div>
              </div>

              {/* Share Buttons */}
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={shareToLinkedIn}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0A66C2] text-white text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  <Linkedin className="w-4 h-4" />
                  Share
                </button>
                <button
                  onClick={shareToTwitter}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 text-white text-sm font-medium hover:bg-white/20 transition-colors"
                >
                  <Twitter className="w-4 h-4" />
                  Tweet
                </button>
              </div>

              {referralCount > 0 && (
                <p className="mt-4 text-sm text-[#95BF47]">
                  🎉 {referralCount} people joined through your link!
                </p>
              )}
            </div>
          )}

        </div>
      </section>

      {/* Color Noise Transition Bar - Green version */}
      {/* Replace with your green noise texture: /public/shopify-noise-bar.png */}
      <div 
        className="w-full h-4 md:h-6"
        style={{
          backgroundImage: 'url(/shopify-noise-bar.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          // Fallback gradient if image not loaded
          background: 'linear-gradient(90deg, #5E8E3E 0%, #95BF47 25%, #B4D455 50%, #95BF47 75%, #5E8E3E 100%)'
        }}
      />

      {/* How It Works Section - Light */}
      <section className="relative py-24 md:py-32 bg-[#f8fafc] overflow-hidden">
        
        {/* Subtle Wireframe Background */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{
            backgroundImage: 'url(/images/wireframe-wave.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />

        <div className="relative z-10 max-w-6xl mx-auto px-6">
          
          {/* Section Header */}
          <div className="text-center mb-16 md:mb-20">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-[#101A31] leading-tight mb-4">
              Three steps to AI visibility.
            </h2>
            <p className="text-lg text-gray-500 max-w-xl mx-auto">
              No code. No consultants. Just results.
            </p>
          </div>

          {/* Steps */}
          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            
            {/* Step 1 */}
            <div className="text-center">
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
                style={{ background: 'linear-gradient(135deg, #95BF47 0%, #5E8E3E 100%)' }}
              >
                <ShoppingBag className="w-8 h-8 text-white" />
              </div>
              <div className="text-sm font-medium text-[#95BF47] uppercase tracking-wider mb-2">Step 1</div>
              <h3 className="text-xl font-bold text-[#101A31] mb-3">Install</h3>
              <p className="text-gray-500">
                One-click install from the Shopify App Store. Connect your store in under 60 seconds.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
                style={{ background: 'linear-gradient(135deg, #95BF47 0%, #5E8E3E 100%)' }}
              >
                <Zap className="w-8 h-8 text-white" />
              </div>
              <div className="text-sm font-medium text-[#95BF47] uppercase tracking-wider mb-2">Step 2</div>
              <h3 className="text-xl font-bold text-[#101A31] mb-3">Optimize</h3>
              <p className="text-gray-500">
                Auto-generate Product, FAQ, and Organization schema. AI-ready descriptions with one click.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
                style={{ background: 'linear-gradient(135deg, #95BF47 0%, #5E8E3E 100%)' }}
              >
                <Eye className="w-8 h-8 text-white" />
              </div>
              <div className="text-sm font-medium text-[#95BF47] uppercase tracking-wider mb-2">Step 3</div>
              <h3 className="text-xl font-bold text-[#101A31] mb-3">Get Seen</h3>
              <p className="text-gray-500">
                Track your AI visibility. Watch your products appear in ChatGPT, Claude & Perplexity answers.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Why It Matters Section - Gradient */}
      <section className="relative py-24 md:py-32 bg-gradient-to-b from-[#e8f5e9] via-[#f1f8e9] to-white overflow-hidden">
        
        <div className="relative z-10 max-w-6xl mx-auto px-6">
          
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            
            {/* Left - Content */}
            <div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-[#101A31] leading-tight mb-6">
                AI is the new search.
                <br />
                <span className="text-gray-400">Don't get left behind.</span>
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                When someone asks ChatGPT "best running shoes" or "top Shopify apps for inventory" — 
                where does your product show up? AI models recommend what they understand. 
                Structured data is their language.
              </p>
              <div className="space-y-4">
                {[
                  'Products with schema are 3x more likely to be cited',
                  'AI search is growing 40% quarter over quarter',
                  'First-mover advantage matters — early optimizers win',
                ].map((point, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#95BF47]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-[#95BF47]" />
                    </div>
                    <span className="text-gray-700">{point}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right - Mockup Placeholder */}
            <div className="relative">
              <div 
                className="aspect-[4/3] rounded-2xl border border-gray-200 shadow-xl flex items-center justify-center bg-white"
              >
                <div className="text-center p-8">
                  <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                    <ShoppingBag className="w-8 h-8 text-gray-300" />
                  </div>
                  <p className="text-gray-400 text-lg font-medium">Plugin Dashboard Preview</p>
                  <p className="text-gray-300 text-sm mt-1">Coming Soon</p>
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-[#95BF47]/10 rounded-full blur-2xl" />
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-[#95BF47]/10 rounded-full blur-2xl" />
            </div>

          </div>
        </div>
      </section>

      {/* Features Section - White */}
      <section className="relative py-24 md:py-32 bg-white overflow-hidden">
        
        <div className="relative z-10 max-w-6xl mx-auto px-6">
          
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-[#101A31] mb-4">
              Everything you need
            </h2>
            <p className="text-lg text-gray-500">
              Built for Shopify merchants who want to dominate AI search.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: 'Auto Schema Injection',
                description: 'Product, Organization, FAQ, and Review schema added to your theme automatically.'
              },
              {
                title: 'AI-Ready Descriptions',
                description: 'Generate clear, factual product descriptions that AI models understand and cite.'
              },
              {
                title: 'Visibility Tracking',
                description: 'See which products appear in AI answers and track improvements over time.'
              },
              {
                title: 'Competitor Monitoring',
                description: 'Know when competitors show up for your categories. Stay ahead.'
              },
              {
                title: 'FAQ Generation',
                description: 'Auto-create FAQ pages from real questions users ask AI about your products.'
              },
              {
                title: 'One-Click Fixes',
                description: 'Issues detected? Fix them with a single click. No developer needed.'
              },
            ].map((feature, i) => (
              <div key={i} className="p-6 rounded-xl border border-gray-100 hover:border-[#95BF47]/30 hover:shadow-lg transition-all">
                <div className="w-10 h-10 rounded-xl bg-[#95BF47]/10 flex items-center justify-center mb-4">
                  <Check className="w-5 h-5 text-[#95BF47]" />
                </div>
                <h3 className="text-lg font-semibold text-[#101A31] mb-2">{feature.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section - Dark */}
      <section className="relative py-24 md:py-32 bg-[#101A31] overflow-hidden">
        
        {/* Subtle radial gradient */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center top, rgba(149,191,71,0.1) 0%, transparent 50%)'
          }}
        />

        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-white mb-6">
            Be first to AI search.
          </h2>
          <p className="text-lg text-white/60 mb-10 max-w-xl mx-auto">
            The stores that optimize for AI now will dominate tomorrow. 
            Join the waitlist and get early access.
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
                  className="flex-1 px-5 py-4 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-[#95BF47]/50 focus:bg-white/15 transition-all"
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-4 rounded-lg font-semibold text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #95BF47 0%, #5E8E3E 100%)' }}
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
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#95BF47]/20 text-[#95BF47]">
              <CheckCircle className="w-5 h-5" />
              <span>You're #{position?.toLocaleString()} on the waitlist!</span>
            </div>
          )}

        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#101A31] border-t border-white/5 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-white/40 text-sm">
            <Image 
              src="/images/Harbor_White_Logo.png" 
              alt="Harbor" 
              width={20}
              height={20}
              className="opacity-40"
            />
            <span>© 2025 Harbor</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-white/40">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <a href="mailto:hello@useharbor.io" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>

      {/* Fullscreen Menu */}
      <FullscreenMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </div>
  )
}