// components/landing-new/HeroSection.tsx
'use client'

import { useState, useEffect } from 'react'
import { ArrowRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

const AI_MODELS = [
  { name: 'ChatGPT', logo: '/logos/chatgpt.svg' },
  { name: 'Claude', logo: '/logos/claude.svg' },
  { name: 'Gemini', logo: '/logos/gemini.svg' },
  { name: 'Perplexity', logo: '/logos/perplexity.svg' },
]

export default function HeroSection() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true)
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % AI_MODELS.length)
        setIsAnimating(false)
      }, 200)
    }, 2500)

    return () => clearInterval(interval)
  }, [])

  const currentModel = AI_MODELS[currentIndex]

  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden bg-[#0a0a0a]">
      {/* Subtle gradient background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-white/[0.03] to-transparent rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col justify-center max-w-5xl mx-auto px-6 pt-32 pb-16">
        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] tracking-tight">
          See what{' '}
          <span className="relative inline-flex items-center gap-3">
            <span
              className={`inline-flex items-center gap-3 transition-all duration-400 ${
                isAnimating 
                  ? 'opacity-0 scale-95 blur-sm' 
                  : 'opacity-100 scale-100 blur-0'
              }`}
            >
              <Image
                src={currentModel.logo}
                alt={currentModel.name}
                width={56}
                height={56}
                className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14"
              />
              <span className="text-white">{currentModel.name}</span>
            </span>
          </span>
          <br />
          says about your brand
        </h1>

        {/* Subheadline */}
        <p className="mt-6 text-lg sm:text-xl text-white/50 max-w-2xl leading-relaxed">
          Track your visibility across AI search engines.
          <br className="hidden sm:block" />
          Understand how AI sees you. Optimize to get recommended.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Link
            href="/signup"
            className="px-6 py-3.5 bg-white text-black text-sm font-semibold rounded-lg hover:bg-white/90 transition-colors"
          >
            Start for free
          </Link>
          <Link
            href="/claim"
            className="group flex items-center gap-2 px-4 py-3.5 text-white/70 hover:text-white text-sm font-medium transition-colors"
          >
            Claim your brand
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Dashboard Screenshot - Contained width with strong fade */}
      <div className="relative w-full max-w-6xl mx-auto px-6">
        {/* Screenshot */}
        <div className="relative">
          <Image
            src="/images/dashboard-hero.png"
            alt="Harbor Dashboard"
            width={1600}
            height={1000}
            className="w-full h-auto rounded-xl border border-white/10"
            priority
          />
          
          {/* Fade overlay - starts 1/3 from bottom, completely hides bottom */}
          <div 
            className="absolute inset-x-0 bottom-0 pointer-events-none"
            style={{
              height: '50%',
              background: 'linear-gradient(to top, #0a0a0a 0%, #0a0a0a 30%, transparent 100%)'
            }}
          />
        </div>
      </div>

      {/* CSS for smooth animation */}
      <style jsx>{`
        .duration-400 {
          transition-duration: 400ms;
        }
      `}</style>
    </section>
  )
}