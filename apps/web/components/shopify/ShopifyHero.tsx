// components/shopify/ShopifyHero.tsx
'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { ArrowRight, Check, Copy, Linkedin, Twitter } from 'lucide-react'
import { useShopifyWaitlist } from './useShopifyWaitlist'

// AI Platform logos - same as landing hero
const AI_PLATFORMS = [
  { name: 'ChatGPT', logo: '/logos/chatgpt.svg' },
  { name: 'Claude', logo: '/logos/claude.svg' },
  { name: 'Gemini', logo: '/logos/gemini.svg' },
  { name: 'Perplexity', logo: '/logos/perplexity.svg' },
]

export default function ShopifyHero() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [mounted, setMounted] = useState(false)

  const {
    email,
    setEmail,
    isSubmitting,
    isSubmitted,
    position,
    error,
    handleSubmit,
    referralLink,
    copyReferralLink,
    copied,
    shareToLinkedIn,
    shareToTwitter,
    referralCount,
  } = useShopifyWaitlist()

  // Logo rotation animation
  useEffect(() => {
    setMounted(true)

    const interval = setInterval(() => {
      setIsAnimating(true)
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % AI_PLATFORMS.length)
        setIsAnimating(false)
      }, 300)
    }, 3500)

    return () => clearInterval(interval)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-[#101A31]">
      
      {/* Content Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Column - Content */}
          <div>
            
            {/* Shopify plugin by Harbor badge */}
            <div className="flex items-center gap-3 mb-8">
              {/* Shopify Logo Placeholder - replace src with your logo */}
              <div className="w-10 h-10 flex items-center justify-center">
                <Image
                  src="/logos/shopify-bag.png"
                  alt="Shopify"
                  width={40}
                  height={40}
                  className="w-10 h-10"
                />
              </div>
              <span className="text-xl md:text-2xl text-white">
                <span className="text-[#95BF47] font-semibold">shopify</span>
                {' '}
                <span className="text-white/60 font-light">plugin by</span>
                {' '}
                <span className="text-white font-bold">Harbor</span>
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-heading font-bold text-white leading-[1.1] mb-6">
              Get your products
              <br />
              recommended by
            </h1>

            {/* Rotating AI Logo Box */}
            <div className="border border-white/20 rounded-lg p-6 mb-6 h-[120px] flex items-center">
              <div
                className={`flex items-center gap-4 transition-all duration-300 ${
                  !mounted || isAnimating ? 'opacity-0 translate-y-3' : 'opacity-100 translate-y-0'
                }`}
              >
                <div className="w-12 h-12 md:w-14 md:h-14 flex items-center justify-center flex-shrink-0">
                  <Image
                    src={AI_PLATFORMS[currentIndex].logo}
                    alt={AI_PLATFORMS[currentIndex].name}
                    width={56}
                    height={56}
                    className="w-12 h-12 md:w-14 md:h-14 object-contain"
                  />
                </div>
                <span className="text-3xl md:text-4xl font-heading font-bold text-white">
                  {AI_PLATFORMS[currentIndex].name}
                </span>
              </div>
            </div>

            {/* Coming Soon Badge */}
            <div className="inline-block mb-4">
              <span className="px-4 py-2 bg-white text-[#101A31] text-sm font-semibold tracking-wider uppercase">
                Coming Soon
              </span>
            </div>

            {/* Share Label */}
            <p className="text-white/60 text-sm uppercase tracking-wider mb-4">Share</p>

            {/* CTA Row or Success State */}
            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-0 max-w-lg">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="flex-1 px-5 py-4 bg-[#1a2744] text-white placeholder-white/40 text-base focus:outline-none focus:ring-2 focus:ring-[#95BF47]/50 rounded-l-lg sm:rounded-r-none rounded-r-lg sm:rounded-l-lg"
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-4 bg-white text-[#101A31] font-semibold flex items-center justify-center gap-2 transition-all hover:bg-gray-100 disabled:opacity-50 rounded-r-lg sm:rounded-l-none rounded-l-lg sm:rounded-r-lg mt-3 sm:mt-0"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-[#101A31]/30 border-t-[#101A31] rounded-full animate-spin" />
                  ) : (
                    'Join the waitlist'
                  )}
                </button>
              </form>
            ) : (
              <div className="max-w-lg">
                <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-[#95BF47]/20 flex items-center justify-center">
                      <Check className="w-5 h-5 text-[#95BF47]" />
                    </div>
                    <div>
                      <p className="text-white font-semibold">You're on the list</p>
                      <p className="text-white/50 text-sm">Position #{position?.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-lg p-3 mb-4">
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

                  <div className="flex items-center gap-3">
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
                    <p className="mt-4 text-sm text-[#95BF47]">
                      {referralCount} {referralCount === 1 ? 'person' : 'people'} joined through your link
                    </p>
                  )}
                </div>
              </div>
            )}

            {error && (
              <p className="mt-4 text-red-400 text-sm">{error}</p>
            )}

          </div>

          {/* Right Column - Wireframe with Floating Sales Cards */}
          <div className="hidden lg:block relative h-[500px]">
            
            {/* Wireframe Background - Replace with your image */}
            <div 
              className="absolute inset-0"
              style={{
                backgroundImage: 'url(/images/shopify-wireframe.svg)',
                backgroundSize: 'contain',
                backgroundPosition: 'center right',
                backgroundRepeat: 'no-repeat',
              }}
            />

            {/* Floating Cards Container */}
            <div className="relative h-full animate-float">
              
              {/* Card 1 - Shopify Sale */}
              <div className="absolute top-12 left-8 bg-white rounded-xl shadow-xl border border-gray-100 p-4 transform -rotate-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#95BF47]/10 flex items-center justify-center">
                    <Image
                      src="/logos/shopify-bag.png"
                      alt="Shopify"
                      width={24}
                      height={24}
                      className="w-6 h-6"
                    />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">New sale</p>
                    <p className="text-lg font-bold text-[#95BF47]">+$159.00</p>
                  </div>
                </div>
              </div>

              {/* Card 2 - Revenue Total */}
              <div className="absolute top-1/3 right-4 bg-white rounded-xl shadow-xl border border-gray-100 p-4 transform rotate-1">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#101A31]/5 flex items-center justify-center">
                    <svg className="w-5 h-5 text-[#101A31]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">AI-driven revenue</p>
                    <p className="text-xl font-bold text-[#101A31]">$1,050</p>
                  </div>
                </div>
              </div>

              {/* Card 3 - Product Recommended */}
              <div className="absolute bottom-1/3 left-12 bg-white rounded-xl shadow-xl border border-gray-100 p-4 transform -rotate-1">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">ChatGPT cited</p>
                    <p className="text-sm font-semibold text-gray-900">Your product</p>
                  </div>
                </div>
              </div>

              {/* Card 4 - Conversion */}
              <div className="absolute bottom-16 right-8 bg-white rounded-xl shadow-xl border border-gray-100 p-4 transform rotate-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#95BF47]/10 flex items-center justify-center">
                    <svg className="w-5 h-5 text-[#95BF47]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">This week</p>
                    <p className="text-lg font-bold text-[#95BF47]">+$847</p>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* Float Animation */}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-8px);
          }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
      `}</style>
    </section>
  )
}