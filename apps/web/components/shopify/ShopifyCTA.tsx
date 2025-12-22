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
      {/* Gradient transition bar */}
      <div 
        className="w-full h-1"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, #95BF47 50%, transparent 100%)',
          opacity: 0.3,
        }}
      />

      <section id="get-early-access" className="relative py-20 sm:py-28 bg-[#0a0a0a] overflow-hidden">
        
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[#95BF47]/5 rounded-full blur-[150px] pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto px-6">
          <div className="text-center mb-10">
            <p className="text-sm font-medium text-[#95BF47] uppercase tracking-wider mb-3">
              Coming Soon
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Be first in line when we launch.
            </h2>
            <p className="text-white/50 text-base max-w-xl mx-auto">
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
                  background: 'linear-gradient(135deg, #95BF47, #0a0a0a, #95BF47)',
                  backgroundSize: '200% 200%',
                  animation: 'gradient-shift 4s ease infinite',
                }}
              />
              
              {/* Form Container */}
              <div className="relative bg-[#111111] rounded-2xl p-6 sm:p-8">
                
                {!isSubmitted ? (
                  <>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        required
                        className="w-full px-4 py-3.5 rounded-xl bg-white/[0.05] border border-white/[0.1] text-white placeholder:text-white/30 focus:outline-none focus:border-[#95BF47]/50 text-sm transition-colors"
                      />

                      {error && (
                        <p className="text-red-400 text-sm">{error}</p>
                      )}

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full px-6 py-3.5 rounded-xl bg-[#95BF47] text-black font-semibold text-sm hover:bg-[#a8d454] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                        ) : (
                          <>
                            Join the waitlist
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
                  <div className="text-center py-2">
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
                    <div className="bg-white/[0.05] rounded-xl p-3 mb-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={referralLink}
                          readOnly
                          className="flex-1 bg-transparent text-white/60 text-sm truncate outline-none min-w-0"
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
