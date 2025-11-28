// components/shopify/ShopifyHero.tsx
'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Check, Copy, Menu } from 'lucide-react'
import { useShopifyWaitlist } from './useShopifyWaitlist'
import FullscreenMenu from '@/components/landing/FullscreenMenu'

// AI Platform logos - same as landing hero
const AI_PLATFORMS = [
  { name: 'ChatGPT', logo: '/logos/chatgpt.svg' },
  { name: 'Claude', logo: '/logos/claude.svg' },
  { name: 'Gemini', logo: '/logos/gemini.svg' },
  { name: 'Perplexity', logo: '/logos/perplexity.svg' },
]

// Social share icons
function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  )
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  )
}

export default function ShopifyHero() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)

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

  // Scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0
      setScrollProgress(progress)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Share functions
  const shareToX = () => {
    const text = encodeURIComponent("Just joined the waitlist for Harbor's Shopify plugin — AI visibility for e-commerce")
    const url = encodeURIComponent(window.location.href)
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank')
  }

  const shareToLinkedIn = () => {
    const url = encodeURIComponent(window.location.href)
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank')
  }

  const shareToInstagram = () => {
    // Instagram doesn't have a share URL - copy link instead
    navigator.clipboard.writeText(window.location.href)
    alert('Link copied! Share it on Instagram.')
  }

  return (
    <>
      {/* Fixed Nav with Shopify Green Progress */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        {/* Progress Bar - Shopify Green */}
        <div className="h-1 bg-[#0a0f1a]">
          <div 
            className="h-full transition-all duration-150"
            style={{ 
              width: `${scrollProgress}%`,
              background: '#95BF47'
            }}
          />
        </div>

        <div className="bg-[#101A31]/80 backdrop-blur-xl border-b border-white/5">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center justify-between h-16">
              
              {/* Logo */}
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

              {/* Section Links - Desktop */}
              <div className="hidden md:flex items-center space-x-8">
                <button 
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="text-sm font-medium text-white"
                >
                  The Plugin
                </button>
                <button 
                  onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                  className="text-sm font-medium text-white/50 hover:text-white/80 transition-colors"
                >
                  How It Works
                </button>
                <button 
                  onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                  className="text-sm font-medium text-white/50 hover:text-white/80 transition-colors"
                >
                  Features
                </button>
                <button 
                  onClick={() => document.getElementById('get-early-access')?.scrollIntoView({ behavior: 'smooth' })}
                  className="text-sm font-medium text-white/50 hover:text-white/80 transition-colors"
                >
                  Get Early Access
                </button>
              </div>

              {/* Right Side */}
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
        </div>
      </nav>

      <FullscreenMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      {/* Hero Section */}
      <section className="relative min-h-[100svh] flex items-center overflow-hidden bg-[#101A31] pt-16 sm:pt-20">
        
        {/* Wireframe Background - Spans full right side of section */}
        <div 
          className="absolute top-0 right-0 bottom-0 w-1/2 hidden lg:block"
          style={{
            backgroundImage: 'url(/images/shopify-wireframe.svg)',
            backgroundSize: 'contain',
            backgroundPosition: 'center right',
            backgroundRepeat: 'no-repeat',
          }}
        />

        {/* Floating Sales Cards - Positioned over wireframe */}
        <div className="absolute top-0 right-0 bottom-0 w-1/2 hidden lg:block pointer-events-none">
          <div className="relative h-full animate-float">
            
            {/* Card 1 - Sale */}
            <div className="absolute top-[25%] left-[10%] bg-white rounded-xl shadow-xl border border-gray-100 p-4 transform -rotate-2 pointer-events-auto">
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

            {/* Card 2 - Sale */}
            <div className="absolute top-[42%] right-[5%] bg-white rounded-xl shadow-xl border border-gray-100 p-4 transform rotate-1 pointer-events-auto">
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
                  <p className="text-lg font-bold text-[#95BF47]">+$1,050</p>
                </div>
              </div>
            </div>

            {/* Card 3 - Sale */}
            <div className="absolute top-[58%] left-[5%] bg-white rounded-xl shadow-xl border border-gray-100 p-4 transform -rotate-1 pointer-events-auto">
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
                  <p className="text-lg font-bold text-[#95BF47]">+$89.00</p>
                </div>
              </div>
            </div>

            {/* Card 4 - This week total */}
            <div className="absolute top-[75%] right-[10%] bg-white rounded-xl shadow-xl border border-gray-100 p-4 transform rotate-2 pointer-events-auto">
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
                  <p className="text-xs text-gray-400">This week</p>
                  <p className="text-lg font-bold text-[#95BF47]">+$2,847</p>
                </div>
              </div>
            </div>

          </div>
        </div>
        
        {/* Content Container */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
          <div className="max-w-xl">
              
              {/* Shopify plugin by Harbor badge */}
              <div className="flex flex-wrap items-center gap-2 mb-6 sm:mb-8">
                <Image
                  src="/logos/shopify-logo.png"
                  alt="Shopify"
                  width={100}
                  height={28}
                  className="h-5 sm:h-7 w-auto"
                />
                <span className="text-base sm:text-xl text-white/60 font-light">plugin by</span>
                <span className="text-base sm:text-xl text-white font-bold">Harbor</span>
              </div>

              {/* Headline */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-white leading-[1.1] mb-2">
                Get your products
              </h1>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-white leading-[1.1] mb-4 sm:mb-6">
                recommended by
              </h1>

              {/* Rotating AI Logo - No box, just inline */}
              <div className="h-14 sm:h-20 md:h-24 mb-6 sm:mb-8">
                <div
                  className={`flex items-center gap-3 sm:gap-4 transition-all duration-300 ${
                    !mounted || isAnimating ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
                  }`}
                >
                  <Image
                    src={AI_PLATFORMS[currentIndex].logo}
                    alt={AI_PLATFORMS[currentIndex].name}
                    width={56}
                    height={56}
                    className="w-9 h-9 sm:w-12 sm:h-12 md:w-14 md:h-14"
                  />
                  <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-white">
                    {AI_PLATFORMS[currentIndex].name}
                  </span>
                </div>
              </div>

              {/* Coming Soon Badge */}
              <div className="inline-block mb-4 sm:mb-6">
                <span className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white text-[#101A31] text-xs sm:text-sm font-semibold tracking-wider uppercase">
                  Coming Soon
                </span>
              </div>

              {/* Share Icons */}
              <div className="flex items-center gap-3 sm:gap-4 mb-6">
                <span className="text-white/40 text-xs sm:text-sm uppercase tracking-wider">Share</span>
                <button
                  onClick={shareToX}
                  className="p-2 sm:p-2.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                  aria-label="Share on X"
                >
                  <XIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white/70" />
                </button>
                <button
                  onClick={shareToLinkedIn}
                  className="p-2 sm:p-2.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                  aria-label="Share on LinkedIn"
                >
                  <LinkedInIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white/70" />
                </button>
                <button
                  onClick={shareToInstagram}
                  className="p-2 sm:p-2.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                  aria-label="Share on Instagram"
                >
                  <InstagramIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white/70" />
                </button>
              </div>

              {/* CTA Row or Success State */}
              {!isSubmitted ? (
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-lg">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="flex-1 px-4 sm:px-5 py-3 sm:py-4 bg-[#1a2744] text-white placeholder-white/40 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#95BF47]/50 rounded-lg"
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 sm:px-6 py-3 sm:py-4 bg-white text-[#101A31] font-semibold text-sm sm:text-base flex items-center justify-center gap-2 transition-all hover:bg-gray-100 disabled:opacity-50 rounded-lg whitespace-nowrap"
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
                  <div className="bg-white/5 border border-white/10 rounded-lg p-4 sm:p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-[#95BF47]/20 flex items-center justify-center flex-shrink-0">
                        <Check className="w-5 h-5 text-[#95BF47]" />
                      </div>
                      <div>
                        <p className="text-white font-semibold text-sm sm:text-base">You're on the list</p>
                        <p className="text-white/50 text-xs sm:text-sm">Position #{position?.toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="bg-white/5 rounded-lg p-2 sm:p-3 mb-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={referralLink}
                          readOnly
                          className="flex-1 bg-transparent text-white/50 text-xs sm:text-sm truncate outline-none min-w-0"
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
                      <p className="text-xs sm:text-sm text-[#95BF47]">
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
    </>
  )
}