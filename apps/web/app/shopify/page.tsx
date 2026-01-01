// app/solutions/ecommerce/shopify/page.tsx
'use client'

import { useState, useEffect, useRef, createContext, useContext, ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Check, Copy, ShoppingBag, Code, FileText, BarChart3, RefreshCw } from 'lucide-react'
import StickyNav from '@/components/marketing/StickyNav'
import MainNav from '@/components/marketing/MainNav'

// =============================================================================
// WAITLIST CONTEXT
// =============================================================================

interface WaitlistState {
  email: string
  setEmail: (email: string) => void
  isSubmitting: boolean
  isSubmitted: boolean
  position: number | null
  referralCode: string | null
  referralCount: number
  error: string | null
  handleSubmit: (e: React.FormEvent) => Promise<void>
  referralLink: string
  copyReferralLink: () => void
  copied: boolean
}

const WaitlistContext = createContext<WaitlistState | null>(null)

function WaitlistProvider({ children }: { children: ReactNode }) {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [position, setPosition] = useState<number | null>(null)
  const [referralCode, setReferralCode] = useState<string | null>(null)
  const [referralCount, setReferralCount] = useState(0)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
      setIsSubmitted(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const referralLink = referralCode 
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/solutions/ecommerce/shopify?ref=${referralCode}`
    : ''

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <WaitlistContext.Provider value={{
      email,
      setEmail,
      isSubmitting,
      isSubmitted,
      position,
      referralCode,
      referralCount,
      error,
      handleSubmit,
      referralLink,
      copyReferralLink,
      copied,
    }}>
      {children}
    </WaitlistContext.Provider>
  )
}

function useWaitlist() {
  const context = useContext(WaitlistContext)
  if (!context) {
    throw new Error('useWaitlist must be used within WaitlistProvider')
  }
  return context
}

// =============================================================================
// HERO SECTION
// =============================================================================

function Hero() {
  const {
    email,
    setEmail,
    isSubmitting,
    isSubmitted,
    error,
    position,
    referralLink,
    referralCount,
    handleSubmit,
    copyReferralLink,
    copied,
  } = useWaitlist()

  return (
    <section className="relative bg-[#F6F5F3] overflow-hidden">
      {/* Subtle gradient orb */}
      <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-[#95BF47]/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 py-20 sm:py-28">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          {/* Left - Content + Form */}
          <div>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 mb-6">
              <div className="w-3 h-3 rounded-sm bg-[#95BF47]" />
              <span className="text-sm font-medium text-black uppercase tracking-wider font-source-sans">Shopify Plugin</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-bold text-black leading-[1.1] mb-8 font-source-sans">
              Turn AI search into your next sales channel
            </h1>

            {/* Bullet points */}
            <ul className="space-y-4 mb-10">
              <li className="flex items-start sm:items-center gap-3">
                <Check className="w-5 h-5 text-[#95BF47] flex-shrink-0 mt-0.5 sm:mt-0" />
                <span className="text-[#6C6C6B] text-base sm:text-lg font-source-sans">Auto-generated schema & structured data</span>
              </li>
              <li className="flex items-start sm:items-center gap-3">
                <Check className="w-5 h-5 text-[#95BF47] flex-shrink-0 mt-0.5 sm:mt-0" />
                <span className="text-[#6C6C6B] text-base sm:text-lg font-source-sans">Track mentions across ChatGPT, Claude & Perplexity</span>
              </li>
              <li className="flex items-start sm:items-center gap-3">
                <Check className="w-5 h-5 text-[#95BF47] flex-shrink-0 mt-0.5 sm:mt-0" />
                <span className="text-[#6C6C6B] text-base sm:text-lg font-source-sans">One-click install, zero maintenance</span>
              </li>
            </ul>

            {/* Email capture form */}
            {!isSubmitted ? (
              <>
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 mb-4">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="flex-1 px-4 py-3.5 rounded-lg bg-white border border-[#E0E0E0] text-black placeholder:text-[#A0A0A0] focus:outline-none focus:border-[#95BF47] text-sm transition-colors font-source-sans"
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-3.5 rounded-lg bg-black text-white font-semibold text-sm hover:bg-black/80 transition-all flex items-center justify-center gap-2 disabled:opacity-50 font-source-sans whitespace-nowrap"
                  >
                    {isSubmitting ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      'Join waitlist'
                    )}
                  </button>
                </form>

                {error && (
                  <p className="text-red-500 text-sm mb-4">{error}</p>
                )}

                {/* Social proof */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 pt-2">
                  {/* Avatar stack */}
                  <div className="flex -space-x-2">
                    <Image src="/images/shopify/avatar-1.png" alt="" width={32} height={32} className="w-8 h-8 rounded-full border-2 border-[#F6F5F3]" />
                    <Image src="/images/shopify/avatar-2.png" alt="" width={32} height={32} className="w-8 h-8 rounded-full border-2 border-[#F6F5F3]" />
                    <Image src="/images/shopify/avatar-3.png" alt="" width={32} height={32} className="w-8 h-8 rounded-full border-2 border-[#F6F5F3]" />
                    <Image src="/images/shopify/avatar-4.png" alt="" width={32} height={32} className="w-8 h-8 rounded-full border-2 border-[#F6F5F3]" />
                  </div>
                  <div className="hidden sm:block h-6 w-px bg-[#E0E0E0]" />
                  <span className="text-sm text-[#6C6C6B] font-source-sans">Join 500+ Shopify merchants on the waitlist</span>
                </div>
              </>
            ) : (
              <div className="bg-white border border-[#EFEEED] rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-[#95BF47]/10 flex items-center justify-center">
                    <Check className="w-5 h-5 text-[#95BF47]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-black font-source-sans">You're on the list!</h3>
                    <p className="text-[#6C6C6B] text-sm font-source-sans">Position #{position?.toLocaleString()}</p>
                  </div>
                </div>

                {/* Referral Link */}
                <p className="text-sm text-[#6C6C6B] mb-2 font-source-sans">Share to move up:</p>
                <div className="flex items-center gap-2 bg-[#F6F5F3] rounded-lg p-2">
                  <input
                    type="text"
                    value={referralLink}
                    readOnly
                    className="flex-1 bg-transparent text-[#6C6C6B] text-sm truncate outline-none min-w-0 font-source-sans px-2"
                  />
                  <button
                    onClick={copyReferralLink}
                    className="p-2 rounded-lg hover:bg-[#EFEEED] transition-colors flex-shrink-0"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-[#95BF47]" />
                    ) : (
                      <Copy className="w-4 h-4 text-[#6C6C6B]" />
                    )}
                  </button>
                </div>

                {referralCount > 0 && (
                  <p className="text-sm text-[#95BF47] font-medium mt-3 font-source-sans">
                    {referralCount} {referralCount === 1 ? 'person' : 'people'} joined through your link!
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Right - Dashboard Image */}
          <div className="relative">
            <Image 
              src="/images/shopify/hero-dashboard.png" 
              alt="Harbor Shopify Dashboard" 
              width={800} 
              height={600} 
              className="w-full h-auto"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

// =============================================================================
// FEATURES SECTION
// =============================================================================

const features = [
  {
    icon: Code,
    title: 'Auto-Generated Schema',
    description: 'Product JSON-LD, FAQs, and structured data injected into your theme automatically. No dev work required.',
  },
  {
    icon: FileText,
    title: 'AI-Ready Descriptions',
    description: 'Your product copy rewritten for how AI models parse and recommend — clear, factual, attribute-rich.',
  },
  {
    icon: BarChart3,
    title: 'Visibility Tracking',
    description: 'See exactly when ChatGPT, Claude, Gemini, and Perplexity mention your products — and for which queries.',
  },
  {
    icon: RefreshCw,
    title: 'Always In Sync',
    description: 'New products, price changes, inventory updates — Harbor keeps your AI presence current automatically.',
  },
]

function Features() {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.2 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} className="relative bg-[#F6F5F3] py-20 sm:py-28 overflow-hidden">

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-sm font-medium text-[#95BF47] uppercase tracking-wider mb-3 font-source-sans">
            Features
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-black mb-4 font-source-sans">
            Built for Shopify merchants
          </h2>
          <p className="text-[#6C6C6B] text-base max-w-xl mx-auto font-source-sans">
            One install. Zero maintenance. Your products start showing up in AI recommendations.
          </p>
        </div>

        {/* Features Grid */}
        <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div 
                key={index}
                className="group relative p-6 sm:p-8 rounded-2xl bg-white border border-[#EFEEED] hover:border-[#95BF47]/30 transition-all duration-300"
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                {/* Icon */}
                <div className="w-12 h-12 rounded-xl bg-[#95BF47]/10 flex items-center justify-center mb-4 group-hover:bg-[#95BF47]/20 transition-colors">
                  <Icon className="w-6 h-6 text-[#95BF47]" />
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold text-black mb-2 font-source-sans">
                  {feature.title}
                </h3>
                <p className="text-[#6C6C6B] text-sm leading-relaxed font-source-sans">
                  {feature.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// =============================================================================
// HOW IT WORKS SECTION
// =============================================================================

function HowItWorks() {
  return (
    <section id="dark-section" className="relative bg-[#111111] py-20 sm:py-28 overflow-hidden">

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 font-source-sans">
            How it works
          </h2>
        </div>

        {/* Content */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Image - shows second on mobile, first on desktop */}
          <div className="relative order-2 lg:order-1">
            <Image 
              src="/images/shopify/how-it-works.png" 
              alt="Harbor Shopify Integration" 
              width={800} 
              height={600} 
              className="w-full h-auto rounded-xl"
            />
          </div>

          {/* Numbered steps - shows first on mobile, second on desktop */}
          <div className="space-y-6 sm:space-y-8 order-1 lg:order-2">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#95BF47]/20 flex items-center justify-center">
                <span className="text-[#95BF47] text-sm font-semibold font-source-sans">1</span>
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg mb-2 font-source-sans">Install the plugin</h3>
                <p className="text-white/50 font-source-sans">One-click install from the Shopify App Store. No code, no developers, no configuration.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#95BF47]/20 flex items-center justify-center">
                <span className="text-[#95BF47] text-sm font-semibold font-source-sans">2</span>
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg mb-2 font-source-sans">Harbor scans your store</h3>
                <p className="text-white/50 font-source-sans">We analyze your products and generate AI-optimized structured data automatically.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#95BF47]/20 flex items-center justify-center">
                <span className="text-[#95BF47] text-sm font-semibold font-source-sans">3</span>
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg mb-2 font-source-sans">Track your visibility</h3>
                <p className="text-white/50 font-source-sans">See when ChatGPT, Claude, Gemini, or Perplexity mentions your products and for which queries.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#95BF47]/20 flex items-center justify-center">
                <span className="text-[#95BF47] text-sm font-semibold font-source-sans">4</span>
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg mb-2 font-source-sans">Get recommended</h3>
                <p className="text-white/50 font-source-sans">As AI models crawl your optimized store, your products start appearing in recommendations.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// =============================================================================
// CTA SECTION
// =============================================================================

function CTA() {
  const {
    email,
    setEmail,
    isSubmitting,
    isSubmitted,
    error,
    position,
    referralLink,
    referralCount,
    handleSubmit,
    copyReferralLink,
    copied,
  } = useWaitlist()

  return (
    <>
      {/* Gradient transition bar */}
      <div 
        className="w-full h-1"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, #95BF47 50%, transparent 100%)',
          opacity: 0.3,
        }}
      />

      <section id="get-early-access" className="relative py-20 sm:py-28 bg-[#111111] overflow-hidden">
        
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[#95BF47]/5 rounded-full blur-[150px] pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto px-6">
          <div className="text-center mb-10">
            <p className="text-sm font-medium text-[#95BF47] uppercase tracking-wider mb-3 font-source-sans">
              Coming Soon
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 font-source-sans">
              Be first in line when we launch.
            </h2>
            <p className="text-white/50 text-base max-w-xl mx-auto font-source-sans">
              Join the waitlist and get early access to Harbor's Shopify plugin. 
              The sooner you join, the sooner your products get recommended.
            </p>
          </div>

          {/* Form Card */}
          <div className="max-w-md mx-auto">
            <div className="relative">
              {/* Animated border */}
              <div 
                className="absolute -inset-[1px] rounded-2xl opacity-50"
                style={{
                  background: 'linear-gradient(135deg, #95BF47, #111111, #95BF47)',
                  backgroundSize: '200% 200%',
                  animation: 'gradient-shift 4s ease infinite',
                }}
              />
              
              {/* Form Container */}
              <div className="relative bg-[#1a1a1a] rounded-2xl p-6 sm:p-8 border border-white/10">
                
                {!isSubmitted ? (
                  <>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        required
                        className="w-full px-4 py-3.5 rounded-xl bg-white/[0.05] border border-white/[0.1] text-white placeholder:text-white/30 focus:outline-none focus:border-[#95BF47]/50 text-sm transition-colors font-source-sans"
                      />

                      {error && (
                        <p className="text-red-400 text-sm">{error}</p>
                      )}

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full px-6 py-3.5 rounded-xl bg-[#95BF47] text-white font-semibold text-sm hover:bg-[#7da33a] transition-all flex items-center justify-center gap-2 disabled:opacity-50 font-source-sans"
                      >
                        {isSubmitting ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            Join the waitlist
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </form>

                    <p className="text-xs text-white/30 mt-4 text-center font-source-sans">
                      No spam. Unsubscribe anytime.
                    </p>
                  </>
                ) : (
                  <div className="text-center py-2">
                    <div className="w-14 h-14 rounded-full bg-[#95BF47]/10 flex items-center justify-center mx-auto mb-4">
                      <Check className="w-7 h-7 text-[#95BF47]" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2 font-source-sans">
                      You're on the list!
                    </h3>
                    <p className="text-white/50 text-sm mb-6 font-source-sans">
                      You're #{position?.toLocaleString()} in line. Share to move up.
                    </p>

                    {/* Referral Link */}
                    <div className="bg-white/[0.05] rounded-xl p-3 mb-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={referralLink}
                          readOnly
                          className="flex-1 bg-transparent text-white/60 text-sm truncate outline-none min-w-0 font-source-sans"
                        />
                        <button
                          onClick={copyReferralLink}
                          className="p-2 rounded-lg hover:bg-white/10 transition-colors flex-shrink-0"
                        >
                          {copied ? (
                            <Check className="w-4 h-4 text-[#95BF47]" />
                          ) : (
                            <Copy className="w-4 h-4 text-white/40" />
                          )}
                        </button>
                      </div>
                    </div>

                    {referralCount > 0 && (
                      <p className="text-sm text-[#95BF47] font-medium font-source-sans">
                        {referralCount} {referralCount === 1 ? 'person' : 'people'} joined through your link!
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes gradient-shift {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
        `}</style>
      </section>
    </>
  )
}

// =============================================================================
// FOOTER
// =============================================================================

function Footer() {
  return (
    <footer className="relative py-12 px-6 bg-[#111111] border-t border-white/[0.05]">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Image
                src="/images/Harbor_White_Logo.png"
                alt="Harbor"
                width={32}
                height={32}
                className="h-8 w-8"
              />
            </Link>
            <p className="text-white/40 text-sm leading-relaxed max-w-xs font-source-sans">
              AI visibility intelligence. See how ChatGPT, Claude, Gemini, and Perplexity talk about your brand.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-white/60 font-medium text-sm mb-4 font-source-sans">Product</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/features" className="text-white/40 hover:text-white text-sm transition-colors font-source-sans">
                  Platform
                </Link>
              </li>
              <li>
                <Link href="/brands" className="text-white/40 hover:text-white text-sm transition-colors font-source-sans">
                  Brand Index
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-white/40 hover:text-white text-sm transition-colors font-source-sans">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/shopify" className="text-white/40 hover:text-white text-sm transition-colors flex items-center gap-2 font-source-sans">
                  Shopify Plugin
                  <span className="px-1.5 py-0.5 text-[9px] font-medium uppercase bg-[#95BF47]/20 text-[#95BF47] rounded">
                    Soon
                  </span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white/60 font-medium text-sm mb-4 font-source-sans">Company</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="text-white/40 hover:text-white text-sm transition-colors font-source-sans">
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-white/40 hover:text-white text-sm transition-colors font-source-sans">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-white/40 hover:text-white text-sm transition-colors font-source-sans">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-white/40 hover:text-white text-sm transition-colors font-source-sans">
                  Terms
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-white/[0.05] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/30 text-sm font-source-sans">
            © {new Date().getFullYear()} Harbor. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a 
              href="https://twitter.com/useharbor" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-white/30 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a 
              href="https://linkedin.com/company/useharbor" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-white/30 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

// =============================================================================
// PAGE
// =============================================================================

export default function ShopifyPage() {
  return (
    <WaitlistProvider>
      <div className="min-h-screen bg-[#F6F5F3]">
        {/* Nav with high z-index */}
        <div className="relative z-50">
          <StickyNav />
          <MainNav />
        </div>
        
        {/* Content with lower z-index */}
        <div className="relative z-0">
          <Hero />
          <Features />
          <HowItWorks />
          <CTA />
          <Footer />
        </div>
      </div>
    </WaitlistProvider>
  )
}