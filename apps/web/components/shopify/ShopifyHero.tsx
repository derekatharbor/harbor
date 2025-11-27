// components/shopify/ShopifyHero.tsx
'use client'

import { ArrowRight, Check, Copy, Linkedin, Twitter } from 'lucide-react'
import { useShopifyWaitlist } from './useShopifyWaitlist'

export default function ShopifyHero() {
  const {
    email,
    setEmail,
    isSubmitting,
    isSubmitted,
    position,
    totalSignups,
    error,
    handleSubmit,
    referralLink,
    copyReferralLink,
    copied,
    shareToLinkedIn,
    shareToTwitter,
    referralCount,
  } = useShopifyWaitlist()

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-[#101A31]">
      
      {/* Wireframe wave pattern */}
      <div 
        className="absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage: 'url(/images/wireframe-wave.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* Neon green arc glow behind headline */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] md:w-[1000px] h-[400px] md:h-[500px] pointer-events-none"
        style={{
          background: `
            radial-gradient(
              ellipse 60% 40% at 50% 60%,
              rgba(149, 191, 71, 0.08) 0%,
              rgba(149, 191, 71, 0.03) 40%,
              transparent 70%
            )
          `,
        }}
      />

      {/* Optional: Faint Shopify bag watermark */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'url(/logos/shopify-bag.svg)',
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center pt-20">
        
        {/* Badge */}
        <div className="inline-flex items-center gap-2 mb-8 md:mb-10">
          <span className="w-2 h-2 rounded-full bg-[#95BF47]" />
          <span className="text-sm text-white/60 tracking-wide">For Shopify Stores</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-heading font-bold mb-6 leading-[1.1]">
          <span className="text-white">
            Get your Shopify products
          </span>
          <br />
          <span className="text-white">
            recommended by AI.
          </span>
          <br />
          <span 
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage: 'linear-gradient(135deg, #95BF47 0%, #b8d86b 50%, #95BF47 100%)'
            }}
          >
            Automatically.
          </span>
        </h1>

        {/* Subheadline */}
        <p className="text-base md:text-lg text-white/50 max-w-2xl mx-auto leading-relaxed mb-10 md:mb-12">
          Harbor's Shopify plugin injects product schema, FAQs, and AI-ready descriptions 
          so ChatGPT, Claude, Gemini, and Perplexity actually understand your products — and recommend them.
        </p>

        {/* CTA Row or Success State */}
        {!isSubmitted ? (
          <div className="max-w-xl mx-auto">
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 justify-center">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="flex-1 max-w-sm px-5 py-4 rounded-lg bg-white text-[#101A31] placeholder-gray-400 text-base focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-7 py-4 rounded-lg font-semibold bg-[#101A31] text-white border border-white/20 flex items-center justify-center gap-2 transition-all hover:border-[#95BF47]/60 hover:shadow-[0_0_20px_rgba(149,191,71,0.15)] disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Join the waitlist
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
            {error && (
              <p className="mt-4 text-red-400 text-sm">{error}</p>
            )}
            
            {/* Social Proof */}
            <p className="mt-6 text-sm text-white/40">
              {totalSignups.toLocaleString()}+ Shopify stores already on the waitlist
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
  )
}
