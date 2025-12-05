// components/landing-new/HeroSection.tsx
'use client'

import { useState, useEffect } from 'react'
import { ArrowRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

const AI_MODELS = [
  { name: 'ChatGPT', color: '#10a37f' },
  { name: 'Claude', color: '#d4a574' },
  { name: 'Gemini', color: '#4285f4' },
  { name: 'Perplexity', color: '#20b8cd' },
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
      }, 200) // Half of animation duration
    }, 2500) // Change every 2.5 seconds

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
          <span className="relative inline-block">
            <span
              className={`inline-block transition-all duration-400 ${
                isAnimating 
                  ? 'opacity-0 scale-95 blur-sm' 
                  : 'opacity-100 scale-100 blur-0'
              }`}
              style={{ color: currentModel.color }}
            >
              {currentModel.name}
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
            href="/brands"
            className="group flex items-center gap-2 px-4 py-3.5 text-white/70 hover:text-white text-sm font-medium transition-colors"
          >
            Browse 38,000+ brands
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* AI Model indicators */}
        <div className="mt-8 flex items-center gap-6">
          {AI_MODELS.map((model, index) => (
            <div
              key={model.name}
              className={`flex items-center gap-2 transition-opacity duration-300 ${
                index === currentIndex ? 'opacity-100' : 'opacity-30'
              }`}
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: model.color }}
              />
              <span className="text-white/60 text-sm font-medium">{model.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Dashboard Screenshot - Full width, flat, with fade */}
      <div className="relative w-full max-w-7xl mx-auto px-6">
        {/* Glow behind screenshot */}
        <div className="absolute -inset-4 bg-gradient-to-t from-cyan-500/20 via-blue-500/10 to-transparent blur-3xl opacity-40" />
        
        {/* Screenshot container */}
        <div className="relative rounded-xl overflow-hidden border border-white/10 shadow-2xl">
          {/* Browser chrome */}
          <div className="bg-[#1a1a1a] px-4 py-3 flex items-center gap-3 border-b border-white/10">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
              <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
              <div className="w-3 h-3 rounded-full bg-[#28ca41]" />
            </div>
            <div className="flex-1 max-w-md mx-auto">
              <div className="bg-white/5 rounded-md px-3 py-1.5 text-white/40 text-xs text-center">
                app.useharbor.io
              </div>
            </div>
            <div className="w-16" /> {/* Spacer for symmetry */}
          </div>

          {/* Screenshot image */}
          <div className="relative bg-[#0f0f0f]">
            <Image
              src="/images/dashboard-hero.png"
              alt="Harbor Dashboard"
              width={1600}
              height={1000}
              className="w-full h-auto"
              priority
            />
            
            {/* Fade to black at bottom - strong gradient */}
            <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent" />
          </div>
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