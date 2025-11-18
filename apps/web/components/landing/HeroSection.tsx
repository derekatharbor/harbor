'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

// AI Platform logos
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
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 py-20">
      {/* Main Content Container - MAX 900px */}
      <div className="w-full max-w-[900px] mx-auto text-center">
        
        {/* Headline */}
        <h1 className="text-[clamp(2rem,5vw,4rem)] font-heading font-bold text-white leading-[1.15] tracking-tight mb-10">
          Get your brand mentioned by
        </h1>

        {/* Rotating AI Platform Logo */}
        <div className="flex items-center justify-center mb-8">
          <div
            className={`transition-all duration-400 ${
              isAnimating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
            }`}
          >
            <div className="flex items-center justify-center space-x-4">
              {/* Logo */}
              <div className="h-12 w-auto flex items-center">
                <Image
                  src={AI_PLATFORMS[currentIndex].icon}
                  alt={AI_PLATFORMS[currentIndex].name}
                  width={48}
                  height={48}
                  className="h-12 w-auto object-contain"
                />
              </div>

              {/* Platform Name */}
              <span className="text-[clamp(2rem,5vw,4rem)] font-heading font-bold text-white leading-none">
                {AI_PLATFORMS[currentIndex].name}
              </span>
            </div>
          </div>
        </div>

        {/* Subheadline */}
        <p className="text-lg text-[#CBD4E1] leading-relaxed mb-12 font-mono max-w-[800px] mx-auto">
          Harbor shows you exactly how ChatGPT, Claude, Gemini, and Perplexity talk about your brand—and what to do about it.
        </p>

        {/* CTA Buttons */}
        <div className="flex items-center justify-center gap-4">
          <a
            href="#early-access"
            className="inline-flex items-center justify-center px-8 py-3.5 rounded-lg bg-white text-black text-base font-medium hover:bg-white/90 transition-all duration-200"
          >
            Get started
          </a>
          <a
            href="#how-it-works"
            className="inline-flex items-center justify-center px-8 py-3.5 rounded-lg border border-white/30 text-white text-base font-medium hover:bg-white/5 transition-all duration-200"
          >
            Learn more
          </a>
        </div>
      </div>

      {/* Wave Lines at Bottom */}
      <div className="relative w-full mt-16">
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
}