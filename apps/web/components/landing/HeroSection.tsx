'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

// Placeholder for logo imports - replace with actual assets
const AI_PLATFORMS = [
  { name: 'ChatGPT', icon: '/logos/chatgpt.svg' },
  { name: 'Claude', icon: '/logos/claude.svg' },
  { name: 'Gemini', icon: '/logos/gemini.svg' },
  { name: 'Perplexity', icon: '/logos/perplexity.svg' },
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
      }, 400)
    }, 3500)

    return () => clearInterval(interval)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center px-6 lg:px-12">
      <div className="max-w-[90rem] mx-auto w-full">
        <div className="text-center max-w-6xl mx-auto">
          {/* Main Headline */}
          <h1 className="text-[clamp(3rem,10vw,9.375rem)] font-heading font-bold text-white leading-[1.1] tracking-tight mb-8">
            Get your brand mentioned by
          </h1>

          {/* Rotating AI Platform */}
          <div className="relative h-[clamp(4rem,12vw,10rem)] mb-12 flex items-center justify-center overflow-hidden">
            <div
              className={`flex items-center justify-center space-x-6 transition-all duration-400 ${
                isAnimating ? 'opacity-0 translate-y-8' : 'opacity-100 translate-y-0'
              }`}
            >
              {/* Platform Logo */}
              <div className="w-[clamp(3rem,8vw,6rem)] h-[clamp(3rem,8vw,6rem)] relative flex-shrink-0">
                <Image
                  src={AI_PLATFORMS[currentIndex].icon}
                  alt={AI_PLATFORMS[currentIndex].name}
                  width={96}
                  height={96}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Platform Name */}
              <span className="text-[clamp(3rem,10vw,9.375rem)] font-heading font-bold text-white leading-none">
                {AI_PLATFORMS[currentIndex].name}
              </span>
            </div>
          </div>

          {/* Subheadline - Monospace */}
          <p className="text-[clamp(1.125rem,3vw,3.125rem)] font-mono text-white/80 max-w-5xl mx-auto leading-relaxed mb-16">
            Harbor shows you exactly how ChatGPT, Claude, Gemini, and
            <br className="hidden lg:block" />
            Perplexity talk about your brand—and what to do about it.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#early-access"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-lg bg-white text-black text-lg font-medium hover:bg-white/90 transition-all duration-200"
            >
              Get started
            </a>
            <a
              href="#how-it-works"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-lg border border-white/30 text-white text-lg font-medium hover:bg-white/5 transition-all duration-200"
            >
              Learn more
            </a>
          </div>
        </div>
      </div>

      {/* Wave Lines at Bottom */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
        <Image
          src="/waves.svg"
          alt=""
          width={3840}
          height={479}
          className="w-full h-auto"
          priority
        />
      </div>
    </section>
  )
}