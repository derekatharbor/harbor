// apps/web/app/about/AboutClient.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { Menu, ArrowRight, TrendingUp, MessageSquare, Globe, Shield } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import FullscreenMenu from '@/components/landing/FullscreenMenu'

const sections = [
  { id: 'vision', label: 'The Vision' },
  { id: 'score', label: 'Harbor Score' },
  { id: 'platform', label: 'The Platform' },
  { id: 'get-started', label: 'Get Started' },
]

const scoreAttributes = [
  'Brand mentions',
  'Sentiment analysis',
  'Competitor rank',
  'Category coverage',
  'Response accuracy',
  'Recommendation rate',
  'Citation frequency',
  'Model consistency',
]

const platformFeatures = [
  {
    icon: TrendingUp,
    title: 'Track visibility over time',
    description: 'Weekly scans show how your AI presence changes. See what\'s working and what needs attention.',
  },
  {
    icon: MessageSquare,
    title: 'Understand the conversation',
    description: 'Know exactly what AI models say about you, what questions trigger your brand, and how you compare.',
  },
  {
    icon: Globe,
    title: 'Optimize your presence',
    description: 'Get actionable recommendations to improve how AI represents your brand. Schema, content, structure.',
  },
]

export default function AboutClient() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('vision')
  const [scrollProgress, setScrollProgress] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  // Track scroll progress and active section
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = (scrollTop / docHeight) * 100
      setScrollProgress(progress)

      // Determine active section
      sections.forEach(({ id }) => {
        const element = document.getElementById(id)
        if (element) {
          const rect = element.getBoundingClientRect()
          if (rect.top <= 200 && rect.bottom >= 200) {
            setActiveSection(id)
          }
        }
      })
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-[#101A31]">
      
      {/* Fixed Nav with Progress */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        {/* Progress Bar */}
        <div className="h-1 bg-[#0a0f1a]">
          <div 
            className="h-full transition-all duration-150"
            style={{ 
              width: `${scrollProgress}%`,
              background: 'linear-gradient(90deg, #22d3ee, #3b82f6, #a855f7, #ec4899)'
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
                {sections.map(({ id, label }) => (
                  <button
                    key={id}
                    onClick={() => scrollToSection(id)}
                    className={`text-sm font-medium transition-colors ${
                      activeSection === id ? 'text-white' : 'text-white/50 hover:text-white/80'
                    }`}
                  >
                    {label}
                  </button>
                ))}
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

      {/* Hero Section */}
      <section id="vision" className="relative min-h-[90vh] md:min-h-screen flex items-center justify-center pt-20 pb-12 md:pb-0 overflow-hidden">
        
        {/* Radial Wireframe Background */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div 
            className="w-[200%] md:w-[150%] max-w-[1800px] aspect-square opacity-20"
            style={{
              background: `
                repeating-radial-gradient(
                  circle at center,
                  transparent 0px,
                  transparent 59px,
                  rgba(255,255,255,0.1) 60px
                )
              `,
            }}
          />
        </div>

        {/* Gradient Overlay */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 0%, #101A31 70%)'
          }}
        />

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          
          {/* Year Tag */}
          <div className="mb-4 md:mb-6">
            <span className="text-white/40 text-base md:text-lg font-light tracking-widest">2025</span>
          </div>

          {/* Main Headline - Gradient Text */}
          <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-heading font-bold mb-6 md:mb-8 leading-[1] md:leading-[0.95]">
            <span 
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: 'linear-gradient(135deg, #ffffff 0%, #e0e7ff 25%, #a5b4fc 50%, #22d3ee 75%, #ffffff 100%)'
              }}
            >
              The AI Visibility
            </span>
            <br />
            <span 
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: 'linear-gradient(135deg, #22d3ee 0%, #a5b4fc 25%, #f0abfc 50%, #fda4af 75%, #fef08a 100%)'
              }}
            >
              Standard
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-base md:text-xl text-white/60 max-w-2xl mx-auto leading-relaxed px-2">
            Harbor is building the infrastructure for how brands are represented across AI. One score. Every model. Complete visibility.
          </p>

        </div>

        {/* Scroll Indicator - Hidden on mobile */}
        <div className="absolute bottom-8 md:bottom-12 left-1/2 -translate-x-1/2 hidden md:block">
          <div className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-2">
            <div className="w-1 h-2 bg-white/40 rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* Color Noise Transition */}
      <div 
        className="w-full h-4 md:h-6"
        style={{
          backgroundImage: 'url(/color-noise-bar.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />

      {/* Stats Section - Light */}
      <section className="relative py-24 md:py-32 bg-[#f8fafc] overflow-hidden">
        
        {/* Flowing Wave Background */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{
            backgroundImage: 'url(/images/wireframe-wave.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />

        <div className="relative z-10 max-w-6xl mx-auto px-6">
          
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-[#101A31] leading-tight">
              A new way to measure brand presence,
              <br />
              <span className="text-gray-400">powered by real AI data.</span>
            </h2>
          </div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            <div className="text-center">
              <div className="text-6xl md:text-7xl font-heading font-light text-[#101A31] mb-2">
                4
              </div>
              <p className="text-gray-600">
                AI models tracked continuously
              </p>
            </div>
            <div className="text-center">
              <div className="text-6xl md:text-7xl font-heading font-light text-[#101A31] mb-2">
                15K+
              </div>
              <p className="text-gray-600">
                brands indexed in Harbor
              </p>
            </div>
            <div className="text-center">
              <div className="text-6xl md:text-7xl font-heading font-light text-[#101A31] mb-2">
                100%
              </div>
              <p className="text-gray-600">
                visibility into AI perception
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Harbor Score Section */}
      <section id="score" className="relative py-24 md:py-32 bg-gradient-to-b from-[#e0f2fe] via-[#ddd6fe] to-[#fce7f3] overflow-hidden">
        
        {/* Flowing Lines Background */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{
            backgroundImage: 'url(/images/wireframe-wave.png)',
            backgroundSize: '200% 200%',
            backgroundPosition: 'center',
          }}
        />

        <div className="relative z-10 max-w-6xl mx-auto px-6">
          
          {/* Score Visualization */}
          <div className="flex flex-col items-center justify-center mb-16">
            
            {/* Floating Attribute Pills - Left Side */}
            <div className="hidden lg:block absolute left-[5%] top-1/2 -translate-y-1/2 space-y-4">
              {scoreAttributes.slice(0, 4).map((attr, i) => (
                <div 
                  key={attr}
                  className="px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full text-sm text-gray-600 border border-gray-200/50 shadow-sm"
                  style={{ transform: `translateX(${i % 2 === 0 ? '0' : '20'}px)` }}
                >
                  {attr}
                </div>
              ))}
            </div>

            {/* Floating Attribute Pills - Right Side */}
            <div className="hidden lg:block absolute right-[5%] top-1/2 -translate-y-1/2 space-y-4">
              {scoreAttributes.slice(4).map((attr, i) => (
                <div 
                  key={attr}
                  className="px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full text-sm text-gray-600 border border-gray-200/50 shadow-sm"
                  style={{ transform: `translateX(${i % 2 === 0 ? '0' : '-20'}px)` }}
                >
                  {attr}
                </div>
              ))}
            </div>

            {/* Score Circle */}
            <div className="relative">
              {/* Outer Glow */}
              <div 
                className="absolute inset-0 rounded-full blur-3xl opacity-50"
                style={{
                  background: 'linear-gradient(135deg, #22d3ee, #a855f7, #ec4899)',
                  transform: 'scale(1.2)'
                }}
              />
              
              {/* Score Container */}
              <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-full bg-white shadow-2xl flex flex-col items-center justify-center">
                
                {/* Progress Ring - Placeholder, you'll add SVG */}
                <div 
                  className="absolute inset-2 rounded-full"
                  style={{
                    background: `conic-gradient(
                      #22d3ee 0deg,
                      #3b82f6 90deg,
                      #a855f7 180deg,
                      #ec4899 270deg,
                      rgba(0,0,0,0.05) 270deg
                    )`,
                    mask: 'radial-gradient(farthest-side, transparent calc(100% - 8px), white calc(100% - 8px))',
                    WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 8px), white calc(100% - 8px))'
                  }}
                />

                {/* Inner Content */}
                <div className="relative z-10 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Image src="/logo-icon.png" alt="Harbor" width={24} height={24} />
                    <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Harbor Score</span>
                  </div>
                  <div className="text-7xl md:text-8xl font-heading font-light text-[#101A31]">
                    86
                  </div>
                  <div className="mt-2 px-4 py-1 bg-gray-100 rounded-full">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Out of 100</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Score Description */}
          <div className="text-center max-w-2xl mx-auto">
            <h3 className="text-2xl md:text-3xl font-heading font-bold text-[#101A31] mb-4">
              One number that tells the whole story
            </h3>
            <p className="text-gray-600 leading-relaxed">
              The Harbor Score measures how AI models perceive and represent your brand. 
              It combines mentions, sentiment, accuracy, and competitive position into a single, 
              trackable metric that shows exactly where you stand.
            </p>
          </div>
        </div>
      </section>

      {/* Platform Section - Dark */}
      <section id="platform" className="relative py-24 md:py-32 bg-[#101A31] overflow-hidden">
        
        {/* Wireframe Background */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-[0.06]"
          style={{
            backgroundImage: 'url(/wireframe-hero.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />

        <div className="relative z-10 max-w-6xl mx-auto px-6">
          
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-white mb-6">
              The platform behind the score
            </h2>
            <p className="text-lg text-white/60 max-w-2xl mx-auto">
              Harbor gives you everything you need to understand and improve your AI visibility.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            {platformFeatures.map((feature) => {
              const Icon = feature.icon
              return (
                <div key={feature.title} className="text-center">
                  {/* Icon Placeholder - You can add custom imagery */}
                  <div className="relative w-48 h-48 mx-auto mb-6">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/5 to-transparent" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center">
                        <Icon className="w-8 h-8 text-white/60" strokeWidth={1.5} />
                      </div>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-heading font-bold text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-white/60 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Watch Deep Dive CTA - Optional, placeholder for now */}
      <section className="relative py-16 bg-gradient-to-r from-[#dbeafe] via-[#e0e7ff] to-[#ede9fe]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 p-8 md:p-12 rounded-3xl bg-gradient-to-r from-[#0ea5e9]/20 to-[#8b5cf6]/20 backdrop-blur-sm border border-white/50">
            <h3 className="text-2xl md:text-3xl font-heading font-bold text-[#101A31]">
              See Harbor in action
            </h3>
            <Link
              href="/brands"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#101A31] text-white font-semibold hover:bg-[#1a2a4a] transition-all"
            >
              Browse the Index
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Color Noise Transition */}
      <div 
        className="w-full h-4 md:h-6"
        style={{
          backgroundImage: 'url(/color-noise-bar.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />

      {/* Get Started CTA Section - Dark with Form */}
      <section id="get-started" className="relative py-24 md:py-32 bg-[#101A31] overflow-hidden">
        
        {/* Radial Wireframe */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-10"
          style={{
            backgroundImage: 'url(/wireframe-hero.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />

        <div className="relative z-10 max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            
            {/* Left - Headline */}
            <div>
              <h2 className="text-4xl md:text-5xl font-heading font-bold text-white leading-tight mb-6">
                Ready to see how AI sees you?
              </h2>
              <p className="text-lg text-white/60">
                Join thousands of brands already tracking their AI visibility with Harbor.
              </p>
            </div>

            {/* Right - Form Card */}
            <div className="relative">
              {/* Gradient Border Effect */}
              <div 
                className="absolute -inset-[2px] rounded-3xl"
                style={{
                  background: 'linear-gradient(135deg, #22d3ee, #3b82f6, #a855f7, #ec4899, #22d3ee)',
                  backgroundSize: '300% 300%',
                  animation: 'gradient-shift 8s ease infinite',
                }}
              />
              
              {/* Form Container */}
              <div className="relative bg-white rounded-3xl p-8 md:p-10">
                <h3 className="text-2xl font-heading font-bold text-[#101A31] mb-6">
                  Let's get started
                </h3>

                <form className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="First name"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[#101A31] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#101A31]/20 focus:border-[#101A31]"
                    />
                    <input
                      type="text"
                      placeholder="Last name"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[#101A31] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#101A31]/20 focus:border-[#101A31]"
                    />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Company name"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[#101A31] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#101A31]/20 focus:border-[#101A31]"
                    />
                    <input
                      type="email"
                      placeholder="Work email"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[#101A31] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#101A31]/20 focus:border-[#101A31]"
                    />
                  </div>

                  <p className="text-xs text-gray-500">
                    By submitting this form, I confirm that I have read and understood Harbor's{' '}
                    <Link href="/privacy" className="underline">Privacy Policy</Link>.
                  </p>

                  <button
                    type="submit"
                    className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#101A31] text-white font-semibold hover:bg-[#1a2a4a] transition-all flex items-center justify-center gap-2"
                  >
                    Get started free
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer with Rounded Top */}
      <footer className="relative py-12 px-6 rounded-t-[2rem] md:rounded-t-[3rem] bg-[#0a0f1a] border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <Image src="/logo-icon.png" alt="Harbor" width={32} height={32} className="w-8 h-8" />
                <span className="text-xl font-bold text-white font-heading">Harbor</span>
              </div>
              <p className="text-[#A4B1C3] text-sm leading-relaxed">
                The AI visibility standard. See how ChatGPT, Claude, Gemini, and Perplexity talk about your brand.
              </p>
            </div>

            <div>
              <h3 className="text-white font-heading font-semibold mb-4">Product</h3>
              <ul className="space-y-3">
                <li><Link href="/brands" className="text-[#A4B1C3] hover:text-white transition-colors text-sm">Brand Index</Link></li>
                <li><Link href="/pricing" className="text-[#A4B1C3] hover:text-white transition-colors text-sm">Pricing</Link></li>
                <li><Link href="/#how-it-works" className="text-[#A4B1C3] hover:text-white transition-colors text-sm">How It Works</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-heading font-semibold mb-4">Company</h3>
              <ul className="space-y-3">
                <li><Link href="/about" className="text-[#A4B1C3] hover:text-white transition-colors text-sm">About</Link></li>
                <li><Link href="/contact" className="text-[#A4B1C3] hover:text-white transition-colors text-sm">Contact</Link></li>
                <li><Link href="/privacy" className="text-[#A4B1C3] hover:text-white transition-colors text-sm">Privacy</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/5 text-center md:text-left">
            <div className="text-sm text-[#A4B1C3]">
              © {new Date().getFullYear()} Harbor. All rights reserved.
            </div>
          </div>
        </div>
      </footer>

      {/* Fullscreen Menu */}
      <FullscreenMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      {/* Gradient Animation Keyframes */}
      <style jsx>{`
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
    </div>
  )
}