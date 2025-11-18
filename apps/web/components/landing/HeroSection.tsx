'use client'

import { useState, useEffect } from 'react'

// Placeholder for logo imports - replace with actual assets
const AI_PLATFORMS = [
  { name: 'ChatGPT', color: '#10A37F' },
  { name: 'Claude', color: '#CC9B7A' },
  { name: 'Gemini', color: '#4285F4' },
  { name: 'Perplexity', color: '#20808D' },
]

export default function HeroSection() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true)
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % AI_PLATFORMS.length)
        setIsAnimating(false)
      }, 300)
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  return (
    <section className="relative min-h-[calc(100vh-5rem)] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-20">
      <div className="max-w-5xl mx-auto text-center">
        {/* Main Headline with Rotating Logo */}
        <div className="space-y-6 sm:space-y-8">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold text-white leading-tight">
            Get your brand mentioned by
          </h1>

          {/* Rotating AI Platform Display */}
          <div className="relative h-20 sm:h-24 md:h-28 overflow-hidden">
            <div
              className={`flex items-center justify-center space-x-4 transition-all duration-300 ${
                isAnimating ? 'opacity-0 -translate-y-8' : 'opacity-100 translate-y-0'
              }`}
            >
              {/* Logo Placeholder - Replace with actual logo component */}
              <div
                className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-xl flex items-center justify-center text-2xl font-bold"
                style={{ backgroundColor: AI_PLATFORMS[currentIndex].color }}
              >
                {AI_PLATFORMS[currentIndex].name[0]}
              </div>

              {/* Platform Name */}
              <span className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold text-white">
                {AI_PLATFORMS[currentIndex].name}
              </span>
            </div>
          </div>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl md:text-2xl text-white/75 max-w-3xl mx-auto leading-relaxed px-4">
            Harbor shows you exactly how ChatGPT, Claude, Gemini, and Perplexity talk about your brand—and what to do about it.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <a
              href="#early-access"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-lg bg-coral text-white text-lg font-medium hover:bg-coral/90 transition-all duration-200 hover:scale-105"
            >
              Request Early Access
            </a>
            <a
              href="#how-it-works"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-lg border border-white/20 text-white text-lg font-medium hover:bg-white/5 transition-all duration-200"
            >
              See How It Works
            </a>
          </div>

          {/* Trust Indicator */}
          <div className="pt-12 sm:pt-16">
            <p className="text-sm text-white/50 uppercase tracking-wider mb-6">
              Trusted by forward-thinking brands
            </p>
            <div className="flex items-center justify-center space-x-8 sm:space-x-12 opacity-30">
              {/* Placeholder for brand logos */}
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-20 h-8 sm:w-24 sm:h-10 bg-white/10 rounded"
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-2">
          <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
        </div>
      </div>
    </section>
  )
}
