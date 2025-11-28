// components/shopify/ShopifyCTA.tsx
'use client'

import { ArrowRight, Check, Copy } from 'lucide-react'
import { useShopifyWaitlist } from './useShopifyWaitlist'

export default function ShopifyCTA() {
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
    <>
      {/* Color Noise Transition - Shopify themed */}
      <div 
        className="w-full h-4 md:h-6"
        style={{
          backgroundImage: 'url(/shopify-noise-bar.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />

      <section id="get-early-access" className="relative py-20 sm:py-28 md:py-36 bg-[#101A31] overflow-hidden">
        
        {/* Radial Wireframe Background */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-10"
          style={{
            backgroundImage: 'url(/wireframe-hero.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            
            {/* Left - Headline */}
            <div>
              <p className="text-sm font-medium text-[#95BF47] uppercase tracking-wider mb-4">
                Coming Soon
              </p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold text-white leading-tight mb-6">
                Be first in line when we launch.
              </h2>
              <p className="text-base sm:text-lg text-white/50">
                Join the waitlist and get early access to Harbor's Shopify plugin. 
                The sooner you join, the sooner your products get recommended.
              </p>
            </div>

            {/* Right - Form Card */}
            <div className="relative">
              {/* Animated Gradient Border Effect - Shopify green + blue */}
              <div 
                className="absolute -inset-[2px] rounded-3xl"
                style={{
                  background: 'linear-gradient(135deg, #95BF47, #7da83d, #2d8a8a, #3b82f6, #95BF47)',
                  backgroundSize: '300% 300%',
                  animation: 'gradient-shift 8s ease infinite',
                }}
              />
              
              {/* Form Container */}
              <div className="relative bg-white rounded-3xl p-6 sm:p-8 md:p-10">
                
                {!isSubmitted ? (
                  <>
                    <h3 className="text-xl sm:text-2xl font-heading font-bold text-[#101A31] mb-2">
                      Get early access
                    </h3>
                    <p className="text-gray-500 text-sm mb-6">
                      We'll notify you the moment the plugin is ready.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        required
                        className="w-full px-4 sm:px-5 py-3 sm:py-4 rounded-xl border border-gray-200 text-[#101A31] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#95BF47]/30 focus:border-[#95BF47] text-base"
                      />

                      {error && (
                        <p className="text-red-500 text-sm">{error}</p>
                      )}

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full px-6 py-3 sm:py-4 rounded-xl bg-[#95BF47] text-white font-semibold hover:bg-[#85ac3d] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            Join the waitlist
                            <ArrowRight className="w-5 h-5" />
                          </>
                        )}
                      </button>
                    </form>

                    <p className="text-xs text-gray-400 mt-4 text-center">
                      No spam. Unsubscribe anytime.
                    </p>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <div className="w-16 h-16 rounded-full bg-[#95BF47]/10 flex items-center justify-center mx-auto mb-4">
                      <Check className="w-8 h-8 text-[#95BF47]" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-heading font-bold text-[#101A31] mb-2">
                      You're on the list!
                    </h3>
                    <p className="text-gray-500 text-sm mb-6">
                      You're #{position?.toLocaleString()} in line. Share to move up.
                    </p>

                    {/* Referral Link */}
                    <div className="bg-gray-50 rounded-xl p-3 mb-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={referralLink}
                          readOnly
                          className="flex-1 bg-transparent text-gray-600 text-sm truncate outline-none min-w-0"
                        />
                        <button
                          onClick={copyReferralLink}
                          className="p-2 rounded-lg hover:bg-gray-200 transition-colors flex-shrink-0"
                        >
                          {copied ? (
                            <Check className="w-4 h-4 text-[#95BF47]" />
                          ) : (
                            <Copy className="w-4 h-4 text-gray-400" />
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

        {/* Gradient Animation Keyframes */}
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
