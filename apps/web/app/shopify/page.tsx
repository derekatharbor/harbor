// app/solutions/ecommerce/shopify/page.tsx
'use client'

import { useState, useEffect, useRef, createContext, useContext, ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Check, Copy, ShoppingBag, Code, FileText, BarChart3, RefreshCw, Download, Zap, TrendingUp } from 'lucide-react'
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
    <section className="relative min-h-[85vh] flex items-center bg-[#F6F5F3] overflow-hidden">
      {/* Subtle gradient orb */}
      <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-[#95BF47]/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-32 pt-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          {/* Left - Content */}
          <div>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#95BF47]/10 border border-[#95BF47]/30 mb-6">
              <ShoppingBag className="w-4 h-4 text-[#95BF47]" />
              <span className="text-sm font-medium text-[#5a7a2a] font-source-sans">Shopify Plugin</span>
              <span className="text-xs text-[#6C6C6B]">Coming Soon</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-black leading-[1.1] mb-6 font-source-sans">
              Your products are invisible to{' '}
              <span className="text-[#6C6C6B]">AI search.</span>
            </h1>

            <p className="text-lg text-[#6C6C6B] leading-relaxed mb-8 max-w-xl font-source-sans">
              When customers ask ChatGPT, Claude, or Perplexity for product recommendations, 
              Shopify stores don't show up. Harbor changes that.
            </p>

            {/* CTA to scroll */}
            <a 
              href="#get-early-access" 
              className="inline-flex items-center gap-2 text-[#5a7a2a] hover:text-[#95BF47] transition-colors font-source-sans font-medium"
            >
              <span className="text-sm">Join the waitlist</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          {/* Right - Waitlist Form */}
          <div className="relative">
            {/* Card glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-[#95BF47]/20 to-transparent rounded-2xl blur-xl opacity-30" />
            
            {/* Form Card */}
            <div className="relative bg-white border border-[#EFEEED] rounded-2xl p-6 sm:p-8 shadow-sm">
              {!isSubmitted ? (
                <>
                  <h3 className="text-xl font-semibold text-black mb-2 font-source-sans">
                    Get early access
                  </h3>
                  <p className="text-[#6C6C6B] text-sm mb-6 font-source-sans">
                    Be first in line when the plugin launches.
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                      className="w-full px-4 py-3 rounded-lg bg-[#F6F5F3] border border-[#EFEEED] text-black placeholder:text-[#A0A0A0] focus:outline-none focus:border-[#95BF47] text-sm transition-colors font-source-sans"
                    />

                    {error && (
                      <p className="text-red-500 text-sm">{error}</p>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full px-6 py-3 rounded-lg bg-[#95BF47] text-white font-semibold text-sm hover:bg-[#7da33a] transition-all flex items-center justify-center gap-2 disabled:opacity-50 font-source-sans"
                    >
                      {isSubmitting ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          Join waitlist
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>

                  <p className="text-xs text-[#A0A0A0] mt-4 text-center font-source-sans">
                    No spam. Unsubscribe anytime.
                  </p>
                </>
              ) : (
                <div className="text-center py-4">
                  <div className="w-14 h-14 rounded-full bg-[#95BF47]/10 flex items-center justify-center mx-auto mb-4">
                    <Check className="w-7 h-7 text-[#95BF47]" />
                  </div>
                  <h3 className="text-xl font-semibold text-black mb-2 font-source-sans">
                    You're on the list!
                  </h3>
                  <p className="text-[#6C6C6B] text-sm mb-6 font-source-sans">
                    You're #{position?.toLocaleString()} in line. Share to move up.
                  </p>

                  {/* Referral Link */}
                  <div className="bg-[#F6F5F3] border border-[#EFEEED] rounded-lg p-3 mb-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={referralLink}
                        readOnly
                        className="flex-1 bg-transparent text-[#6C6C6B] text-sm truncate outline-none min-w-0 font-source-sans"
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
            Everything you need.{' '}
            <span className="text-[#6C6C6B]">Nothing you don't.</span>
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

        {/* Stats */}
        <div className={`grid grid-cols-3 gap-6 mt-16 transition-all duration-1000 delay-300 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          {[
            { value: '40%', label: 'of product searches start with AI' },
            { value: '73%', label: 'of AI answers cite zero Shopify products' },
            { value: '<5min', label: 'to install and configure' },
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <p className="text-2xl sm:text-3xl font-bold text-[#95BF47] mb-1 font-source-sans">
                {stat.value}
              </p>
              <p className="text-[#6C6C6B] text-xs sm:text-sm font-source-sans">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// =============================================================================
// HOW IT WORKS SECTION
// =============================================================================

const steps = [
  {
    number: '01',
    icon: Download,
    title: 'Install the plugin',
    description: 'One-click install from the Shopify App Store. No code, no developers, no configuration needed.',
    detail: 'Works with any Shopify theme',
  },
  {
    number: '02',
    icon: Zap,
    title: 'Harbor scans your store',
    description: 'We analyze your products, descriptions, and metadata to generate AI-optimized structured data.',
    detail: 'Schema, JSON-LD, FAQs auto-generated',
  },
  {
    number: '03',
    icon: BarChart3,
    title: 'Track your visibility',
    description: 'See when ChatGPT, Claude, Gemini, or Perplexity mentions your products and for which queries.',
    detail: 'Real-time monitoring dashboard',
  },
  {
    number: '04',
    icon: TrendingUp,
    title: 'Get recommended',
    description: 'As AI models crawl your optimized store, your products start appearing in recommendations.',
    detail: 'Automatic sync keeps data current',
  },
]

function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0)

  return (
    <>
      {/* Gradient transition bar */}
      <div 
        className="w-full h-1"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, #95BF47 50%, transparent 100%)',
          opacity: 0.4,
        }}
      />

      <section className="relative bg-white py-20 sm:py-28 overflow-hidden">

        <div className="relative z-10 max-w-6xl mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-16">
            <p className="text-sm font-medium text-[#95BF47] uppercase tracking-wider mb-3 font-source-sans">
              How It Works
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-black mb-4 font-source-sans">
              Four steps to AI visibility
            </h2>
            <p className="text-[#6C6C6B] text-base max-w-xl mx-auto font-source-sans">
              Install once. Harbor handles the rest automatically.
            </p>
          </div>

          {/* Steps */}
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-start">
            {/* Left - Step list */}
            <div className="space-y-2">
              {steps.map((step, index) => {
                const Icon = step.icon
                const isActive = index === activeStep
                
                return (
                  <button
                    key={index}
                    onClick={() => setActiveStep(index)}
                    className={`w-full text-left p-5 rounded-xl border transition-all duration-300 ${
                      isActive 
                        ? 'bg-[#F6F5F3] border-[#95BF47]/30' 
                        : 'bg-white border-[#EFEEED] hover:border-[#D9D9D9]'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Number */}
                      <span className={`text-sm font-mono transition-colors ${
                        isActive ? 'text-[#95BF47]' : 'text-[#A0A0A0]'
                      }`}>
                        {step.number}
                      </span>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-semibold mb-1 transition-colors font-source-sans ${
                          isActive ? 'text-black' : 'text-[#6C6C6B]'
                        }`}>
                          {step.title}
                        </h3>
                        <p className={`text-sm transition-colors font-source-sans ${
                          isActive ? 'text-[#6C6C6B]' : 'text-[#A0A0A0]'
                        }`}>
                          {step.description}
                        </p>
                      </div>

                      {/* Icon */}
                      <div className={`p-2 rounded-lg transition-colors ${
                        isActive ? 'bg-[#95BF47]/10' : 'bg-[#F6F5F3]'
                      }`}>
                        <Icon className={`w-5 h-5 transition-colors ${
                          isActive ? 'text-[#95BF47]' : 'text-[#A0A0A0]'
                        }`} />
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Right - Visual */}
            <div className="relative">
              <div className="relative bg-[#F6F5F3] border border-[#EFEEED] rounded-2xl p-6 sm:p-8 min-h-[320px]">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-[#95BF47]/10">
                    {(() => {
                      const Icon = steps[activeStep].icon
                      return <Icon className="w-5 h-5 text-[#95BF47]" />
                    })()}
                  </div>
                  <div>
                    <p className="text-black font-medium font-source-sans">{steps[activeStep].title}</p>
                    <p className="text-[#6C6C6B] text-sm font-source-sans">{steps[activeStep].detail}</p>
                  </div>
                </div>

                {/* Step-specific visuals */}
                {activeStep === 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-white border border-[#EFEEED] rounded-xl">
                      <div className="w-12 h-12 bg-[#95BF47]/10 rounded-lg flex items-center justify-center">
                        <Download className="w-6 h-6 text-[#95BF47]" />
                      </div>
                      <div className="flex-1">
                        <p className="text-black text-sm font-medium font-source-sans">Harbor for Shopify</p>
                        <p className="text-[#6C6C6B] text-xs font-source-sans">One-click install</p>
                      </div>
                      <div className="px-3 py-1.5 bg-[#95BF47] rounded-lg text-white text-xs font-semibold">
                        Install
                      </div>
                    </div>
                    <p className="text-[#A0A0A0] text-xs text-center font-source-sans">No code changes required</p>
                  </div>
                )}

                {activeStep === 1 && (
                  <div className="space-y-3">
                    {['Products analyzed', 'Schema generated', 'FAQs created', 'Metadata optimized'].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-white border border-[#EFEEED] rounded-lg">
                        <div className="w-6 h-6 rounded-full bg-[#95BF47]/20 flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-[#95BF47]" />
                        </div>
                        <span className="text-[#6C6C6B] text-sm font-source-sans">{item}</span>
                        <span className="ml-auto text-[#95BF47] text-xs">✓</span>
                      </div>
                    ))}
                  </div>
                )}

                {activeStep === 2 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: 'ChatGPT', value: '—' },
                        { label: 'Claude', value: '—' },
                        { label: 'Perplexity', value: '—' },
                      ].map((stat, i) => (
                        <div key={i} className="p-3 bg-white border border-[#EFEEED] rounded-lg text-center">
                          <p className="text-2xl font-bold text-black font-source-sans">{stat.value}</p>
                          <p className="text-[#6C6C6B] text-xs font-source-sans">{stat.label}</p>
                        </div>
                      ))}
                    </div>
                    <p className="text-[#A0A0A0] text-xs text-center font-source-sans">Mentions tracked in real-time</p>
                  </div>
                )}

                {activeStep === 3 && (
                  <div className="space-y-4">
                    <div className="relative h-24">
                      <svg className="w-full h-full" viewBox="0 0 200 80" preserveAspectRatio="none">
                        <line x1="0" y1="20" x2="200" y2="20" stroke="rgba(0,0,0,0.05)" strokeWidth="1" />
                        <line x1="0" y1="40" x2="200" y2="40" stroke="rgba(0,0,0,0.05)" strokeWidth="1" />
                        <line x1="0" y1="60" x2="200" y2="60" stroke="rgba(0,0,0,0.05)" strokeWidth="1" />
                        <path 
                          d="M 0 70 L 25 62 L 50 55 L 75 45 L 100 38 L 125 30 L 150 22 L 175 15 L 200 10 L 200 80 L 0 80 Z" 
                          fill="url(#greenGradientLight)" 
                        />
                        <path 
                          d="M 0 70 L 25 62 L 50 55 L 75 45 L 100 38 L 125 30 L 150 22 L 175 15 L 200 10" 
                          fill="none" 
                          stroke="#95BF47" 
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <defs>
                          <linearGradient id="greenGradientLight" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#95BF47" stopOpacity="0.2" />
                            <stop offset="100%" stopColor="#95BF47" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>
                    <div className="flex items-center justify-between text-xs text-[#6C6C6B] font-source-sans">
                      <span>Week 1</span>
                      <span className="text-[#95BF47]">Growing visibility</span>
                      <span>Week 8</span>
                    </div>
                  </div>
                )}

                {/* Progress indicator */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {steps.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveStep(index)}
                      className={`w-1.5 h-1.5 rounded-full transition-colors ${
                        index === activeStep ? 'bg-[#95BF47]' : 'bg-[#D9D9D9]'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
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
                <Link href="/solutions/ecommerce/shopify" className="text-white/40 hover:text-white text-sm transition-colors flex items-center gap-2 font-source-sans">
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
        <StickyNav />
        <MainNav />
        
        <Hero />
        <Features />
        <HowItWorks />
        <div id="dark-section">
          <CTA />
          <Footer />
        </div>
      </div>
    </WaitlistProvider>
  )
}