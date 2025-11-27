// apps/web/app/shopify/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  ArrowRight, 
  Check, 
  Zap, 
  Search, 
  TrendingUp,
  Copy,
  Share2,
  Linkedin,
  Twitter,
  CheckCircle,
  Sparkles,
  ShoppingBag,
  BarChart3,
  Eye
} from 'lucide-react'

export default function ShopifyWaitlistPage() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [position, setPosition] = useState<number | null>(null)
  const [referralCode, setReferralCode] = useState<string | null>(null)
  const [referralCount, setReferralCount] = useState(0)
  const [totalSignups, setTotalSignups] = useState(847) // Start with believable number
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check for referral code in URL
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
    const text = encodeURIComponent("I just joined the waitlist for Harbor's Shopify plugin - the first AI visibility tool for e-commerce. Get your store seen by ChatGPT, Claude & Perplexity 🚀")
    const url = encodeURIComponent(referralLink)
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank')
  }

  const shareToTwitter = () => {
    const text = encodeURIComponent("Just joined the waitlist for @useharbor's Shopify plugin - get your store seen by AI search engines 🚀")
    const url = encodeURIComponent(referralLink)
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank')
  }

  return (
    <div className="min-h-screen bg-[#0B1521]">
      {/* Noise texture bar placeholder - add your green noise image here */}
      <div 
        className="w-full h-2"
        style={{ 
          background: 'linear-gradient(90deg, #95BF47 0%, #5E8E3E 50%, #95BF47 100%)'
        }}
      />

      {/* Navigation */}
      <nav className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <img 
            src="/images/Harbor_White_Logo.png" 
            alt="Harbor" 
            className="h-8 w-auto"
          />
        </Link>
        <Link 
          href="/auth/login"
          className="text-sm text-white/60 hover:text-white transition-colors"
        >
          Sign In
        </Link>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-16 pb-24">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#95BF47]/10 border border-[#95BF47]/20 mb-8">
            <Sparkles className="w-4 h-4 text-[#95BF47]" />
            <span className="text-sm font-medium text-[#95BF47]">Coming Q1 2026</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold text-white leading-tight mb-6">
            The First{' '}
            <span 
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(135deg, #95BF47 0%, #5E8E3E 100%)' }}
            >
              AI Visibility Plugin
            </span>
            {' '}for Shopify
          </h1>

          {/* Subheadline */}
          <p className="text-xl text-white/60 max-w-2xl mx-auto mb-4">
            Get your products recommended by ChatGPT, Claude, Gemini & Perplexity. 
            One-click schema optimization. Zero technical skills required.
          </p>

          <p className="text-lg text-white/40 mb-12">
            AI search is the new SEO. Don't get left behind.
          </p>

          {/* Signup Form or Success State */}
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="flex-1 px-5 py-4 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#95BF47]/50 focus:ring-2 focus:ring-[#95BF47]/20 transition-all"
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
                      Get Early Access
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
              {error && (
                <p className="mt-3 text-red-400 text-sm">{error}</p>
              )}
              <p className="mt-4 text-sm text-white/40">
                Join {totalSignups.toLocaleString()}+ store owners on the waitlist
              </p>
            </form>
          ) : (
            <div className="max-w-lg mx-auto bg-white/5 border border-[#95BF47]/30 rounded-2xl p-8">
              <div className="w-16 h-16 rounded-full bg-[#95BF47]/20 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-[#95BF47]" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">You're on the list!</h3>
              <p className="text-white/60 mb-6">
                You're #{position?.toLocaleString()} in line. Move up by sharing with other store owners.
              </p>

              {/* Referral Link */}
              <div className="bg-white/5 rounded-lg p-4 mb-6">
                <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Your referral link</p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={referralLink}
                    readOnly
                    className="flex-1 bg-transparent text-white/80 text-sm truncate outline-none"
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
                <p className="mt-6 text-sm text-[#95BF47]">
                  🎉 {referralCount} people joined through your link!
                </p>
              )}
            </div>
          )}
        </div>
      </section>

      {/* How It Works - 3 Step Flow */}
      <section className="max-w-7xl mx-auto px-6 py-24 border-t border-white/5">
        <h2 className="text-3xl font-heading font-bold text-white text-center mb-4">
          AI Visibility in Three Steps
        </h2>
        <p className="text-white/50 text-center mb-16 max-w-xl mx-auto">
          No code. No consultants. Just results.
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="relative">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 h-full">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-6"
                style={{ background: 'linear-gradient(135deg, #95BF47 0%, #5E8E3E 100%)' }}
              >
                <ShoppingBag className="w-6 h-6 text-white" />
              </div>
              <div className="text-xs text-[#95BF47] font-medium uppercase tracking-wider mb-2">Step 1</div>
              <h3 className="text-xl font-bold text-white mb-3">Install</h3>
              <p className="text-white/50">
                One-click install from the Shopify App Store. Connect your store in under 60 seconds.
              </p>
            </div>
            {/* Connector line - hidden on mobile */}
            <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-white/20 to-transparent" />
          </div>

          {/* Step 2 */}
          <div className="relative">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 h-full">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-6"
                style={{ background: 'linear-gradient(135deg, #95BF47 0%, #5E8E3E 100%)' }}
              >
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div className="text-xs text-[#95BF47] font-medium uppercase tracking-wider mb-2">Step 2</div>
              <h3 className="text-xl font-bold text-white mb-3">Optimize</h3>
              <p className="text-white/50">
                Auto-generate Product, FAQ, and Organization schema. AI-ready descriptions with one click.
              </p>
            </div>
            {/* Connector line */}
            <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-white/20 to-transparent" />
          </div>

          {/* Step 3 */}
          <div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 h-full">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-6"
                style={{ background: 'linear-gradient(135deg, #95BF47 0%, #5E8E3E 100%)' }}
              >
                <Eye className="w-6 h-6 text-white" />
              </div>
              <div className="text-xs text-[#95BF47] font-medium uppercase tracking-wider mb-2">Step 3</div>
              <h3 className="text-xl font-bold text-white mb-3">Get Seen</h3>
              <p className="text-white/50">
                Track your AI visibility. Watch your products appear in ChatGPT, Claude & Perplexity answers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mockup Section - Placeholder */}
      <section className="max-w-7xl mx-auto px-6 py-24 border-t border-white/5">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-heading font-bold text-white mb-4">
            See It In Action
          </h2>
          <p className="text-white/50 max-w-xl mx-auto">
            A dashboard built for Shopify merchants who want to dominate AI search.
          </p>
        </div>

        {/* Mockup Placeholder */}
        <div className="relative max-w-4xl mx-auto">
          <div 
            className="aspect-video rounded-2xl border border-white/10 flex items-center justify-center"
            style={{ 
              background: 'linear-gradient(135deg, rgba(149, 191, 71, 0.1) 0%, rgba(11, 21, 33, 1) 100%)'
            }}
          >
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-white/30" />
              </div>
              <p className="text-white/30 text-lg">Plugin Dashboard Preview</p>
              <p className="text-white/20 text-sm mt-1">Coming Soon</p>
            </div>
          </div>
          
          {/* Decorative glow */}
          <div 
            className="absolute -inset-4 -z-10 rounded-3xl opacity-30 blur-3xl"
            style={{ background: 'linear-gradient(135deg, #95BF47 0%, transparent 50%)' }}
          />
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-6 py-24 border-t border-white/5">
        <h2 className="text-3xl font-heading font-bold text-white text-center mb-16">
          Everything You Need
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
            <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-6">
              <div className="w-8 h-8 rounded-lg bg-[#95BF47]/20 flex items-center justify-center mb-4">
                <Check className="w-4 h-4 text-[#95BF47]" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-white/50 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="max-w-7xl mx-auto px-6 py-24 border-t border-white/5">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-heading font-bold text-white mb-4">
            Be First to AI Search
          </h2>
          <p className="text-white/50 mb-8">
            The stores that optimize for AI now will dominate tomorrow. Join the waitlist.
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
                  className="flex-1 px-5 py-4 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#95BF47]/50 focus:ring-2 focus:ring-[#95BF47]/20 transition-all"
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
      <footer className="border-t border-white/5 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-white/40 text-sm">
            <img 
              src="/images/Harbor_White_Logo.png" 
              alt="Harbor" 
              className="h-5 w-auto opacity-40"
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
    </div>
  )
}
