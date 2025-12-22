// components/shopify/ShopifyHero.tsx
'use client'

import { ArrowRight, Check, Copy, ShoppingBag } from 'lucide-react'
import { useShopifyWaitlist } from './useShopifyWaitlist'
import Link from 'next/link'
import Image from 'next/image'

export default function ShopifyHero() {
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
  } = useShopifyWaitlist()

  return (
    <section className="relative min-h-[90vh] flex items-center bg-[#0a0a0a] overflow-hidden">
      {/* Subtle grid */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}
      />

      {/* Gradient orb */}
      <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-[#95BF47]/5 rounded-full blur-[150px] pointer-events-none" />

      {/* Nav */}
      <nav className="absolute top-0 left-0 right-0 z-50 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/images/harbor-logo-white.svg"
                alt="Harbor"
                width={120}
                height={32}
                className="h-7 w-auto"
              />
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/brands" className="text-white/50 hover:text-white text-sm transition-colors">
                Brand Index
              </Link>
              <Link href="/pricing" className="text-white/50 hover:text-white text-sm transition-colors">
                Pricing
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-32">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          {/* Left - Content */}
          <div>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#95BF47]/10 border border-[#95BF47]/20 mb-6">
              <ShoppingBag className="w-4 h-4 text-[#95BF47]" />
              <span className="text-sm font-medium text-[#95BF47]">Shopify Plugin</span>
              <span className="text-xs text-white/40">Coming Soon</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] mb-6">
              Your products are invisible to{' '}
              <span className="text-white/40">AI search.</span>
            </h1>

            <p className="text-lg text-white/50 leading-relaxed mb-8 max-w-xl">
              When customers ask ChatGPT, Claude, or Perplexity for product recommendations, 
              Shopify stores don't show up. Harbor changes that.
            </p>

            {/* Stats row */}
            <div className="flex flex-wrap gap-8 mb-8">
              <div>
                <p className="text-3xl font-bold text-white">40%</p>
                <p className="text-sm text-white/40">of searches now start with AI</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-white">0%</p>
                <p className="text-sm text-white/40">of Shopify stores optimized</p>
              </div>
            </div>

            {/* CTA to scroll */}
            <a 
              href="#get-early-access" 
              className="inline-flex items-center gap-2 text-[#95BF47] hover:text-[#a8d454] transition-colors"
            >
              <span className="text-sm font-medium">Join the waitlist</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          {/* Right - Waitlist Form */}
          <div className="relative">
            {/* Card glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-[#95BF47]/20 to-transparent rounded-2xl blur-xl opacity-50" />
            
            {/* Form Card */}
            <div className="relative bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 sm:p-8">
              {!isSubmitted ? (
                <>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Get early access
                  </h3>
                  <p className="text-white/50 text-sm mb-6">
                    Be first in line when the plugin launches.
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                      className="w-full px-4 py-3 rounded-lg bg-white/[0.05] border border-white/[0.1] text-white placeholder:text-white/30 focus:outline-none focus:border-[#95BF47]/50 text-sm transition-colors"
                    />

                    {error && (
                      <p className="text-red-400 text-sm">{error}</p>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full px-6 py-3 rounded-lg bg-[#95BF47] text-black font-semibold text-sm hover:bg-[#a8d454] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                      ) : (
                        <>
                          Join waitlist
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>

                  <p className="text-xs text-white/30 mt-4 text-center">
                    No spam. Unsubscribe anytime.
                  </p>
                </>
              ) : (
                <div className="text-center py-4">
                  <div className="w-14 h-14 rounded-full bg-[#95BF47]/10 flex items-center justify-center mx-auto mb-4">
                    <Check className="w-7 h-7 text-[#95BF47]" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    You're on the list!
                  </h3>
                  <p className="text-white/50 text-sm mb-6">
                    You're #{position?.toLocaleString()} in line. Share to move up.
                  </p>

                  {/* Referral Link */}
                  <div className="bg-white/[0.05] rounded-lg p-3 mb-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={referralLink}
                        readOnly
                        className="flex-1 bg-transparent text-white/70 text-sm truncate outline-none min-w-0"
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
                    <p className="text-sm text-[#95BF47] font-medium">
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
