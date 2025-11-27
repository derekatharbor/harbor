// components/shopify/ShopifyHowItWorks.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'

const steps = [
  {
    number: '01',
    title: 'Install',
    description: 'Connect your store in under 60 seconds. Install Harbor\'s Shopify plugin directly from the App Store. No code. No setup. Your products sync instantly.',
  },
  {
    number: '02',
    title: 'Optimize',
    description: 'Harbor fixes what AI can\'t read. Product schema, FAQs, attributes, and AI-ready descriptions are auto-generated and injected into your theme — so models can finally understand your products.',
  },
  {
    number: '03',
    title: 'Get Recommended',
    description: 'Your products start showing up in AI answers. Harbor tracks when ChatGPT, Claude, Gemini, and Perplexity begin recommending your products — and shows you which queries they appear in.',
  },
]

// Step 1 Visual: App Store Install Mockup
function InstallVisual() {
  return (
    <div className="relative w-full h-full flex items-center justify-center p-8">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 max-w-sm w-full">
        {/* App Store Header */}
        <div className="flex items-start gap-4 mb-6">
          <div className="w-16 h-16 rounded-xl bg-[#101A31] flex items-center justify-center flex-shrink-0">
            <Image
              src="/logo-icon.png"
              alt="Harbor"
              width={40}
              height={40}
              className="w-10 h-10"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 text-lg">Harbor</h3>
            <p className="text-sm text-gray-500">AI Visibility for Shopify</p>
            <div className="flex items-center gap-1 mt-1">
              {[1,2,3,4,5].map((star) => (
                <svg key={star} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
              <span className="text-xs text-gray-400 ml-1">5.0</span>
            </div>
          </div>
        </div>

        {/* Install Button */}
        <button className="w-full py-3 px-6 bg-[#95BF47] text-white font-semibold rounded-lg flex items-center justify-center gap-2 animate-pulse">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Install App
        </button>

        {/* Features */}
        <div className="mt-6 space-y-3">
          {['Automatic product sync', 'Schema injection', 'AI tracking'].map((feature, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
              <svg className="w-4 h-4 text-[#95BF47]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              {feature}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Step 2 Visual: Schema Injection Mockup
function OptimizeVisual() {
  return (
    <div className="relative w-full h-full flex items-center justify-center p-8">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 max-w-sm w-full">
        {/* Product Page Wireframe */}
        <div className="space-y-4">
          {/* Product Header */}
          <div className="flex gap-4">
            <div className="w-20 h-20 bg-gray-100 rounded-lg" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-100 rounded w-3/4" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
              <div className="h-4 bg-gray-200 rounded w-1/3" />
            </div>
          </div>

          {/* Schema Injection Highlights */}
          <div className="relative p-4 border-2 border-[#95BF47] rounded-lg bg-[#95BF47]/5">
            <div className="absolute -top-2 left-3 px-2 bg-white text-xs font-medium text-[#95BF47]">
              Product Schema
            </div>
            <div className="space-y-2">
              <div className="h-2 bg-[#95BF47]/20 rounded w-full" />
              <div className="h-2 bg-[#95BF47]/20 rounded w-4/5" />
              <div className="h-2 bg-[#95BF47]/20 rounded w-3/5" />
            </div>
            <div className="absolute -right-1 -top-1 w-3 h-3 bg-[#95BF47] rounded-full animate-ping" />
          </div>

          <div className="relative p-4 border-2 border-[#95BF47] rounded-lg bg-[#95BF47]/5">
            <div className="absolute -top-2 left-3 px-2 bg-white text-xs font-medium text-[#95BF47]">
              FAQ Added
            </div>
            <div className="space-y-2">
              <div className="h-2 bg-[#95BF47]/20 rounded w-full" />
              <div className="h-2 bg-[#95BF47]/20 rounded w-2/3" />
            </div>
            <div className="absolute -right-1 -top-1 w-3 h-3 bg-[#95BF47] rounded-full animate-ping" style={{ animationDelay: '0.5s' }} />
          </div>

          <div className="relative p-4 border-2 border-[#95BF47] rounded-lg bg-[#95BF47]/5">
            <div className="absolute -top-2 left-3 px-2 bg-white text-xs font-medium text-[#95BF47]">
              AI-Ready Description
            </div>
            <div className="space-y-2">
              <div className="h-2 bg-[#95BF47]/20 rounded w-full" />
              <div className="h-2 bg-[#95BF47]/20 rounded w-5/6" />
              <div className="h-2 bg-[#95BF47]/20 rounded w-4/5" />
            </div>
            <div className="absolute -right-1 -top-1 w-3 h-3 bg-[#95BF47] rounded-full animate-ping" style={{ animationDelay: '1s' }} />
          </div>
        </div>
      </div>
    </div>
  )
}

// Step 3 Visual: AI Answer Mockup
function RecommendedVisual() {
  return (
    <div className="relative w-full h-full flex items-center justify-center p-8">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 max-w-sm w-full">
        {/* Fake AI Chat Interface */}
        <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-100">
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
            </svg>
          </div>
          <span className="text-sm font-medium text-gray-700">AI Assistant</span>
        </div>

        {/* Question */}
        <div className="mb-4">
          <p className="text-sm text-gray-500 mb-2">What's the best wireless headphone for running?</p>
        </div>

        {/* Answer */}
        <div className="space-y-3">
          <p className="text-sm text-gray-700">Based on my research, I'd recommend:</p>
          
          {/* Product Card */}
          <div className="relative p-4 bg-gray-50 rounded-xl border border-gray-100">
            <div className="absolute -top-2 -right-2">
              <span className="px-2 py-1 bg-[#95BF47] text-white text-xs font-medium rounded-full flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Recommended
              </span>
            </div>
            <div className="flex gap-3">
              <div className="w-12 h-12 bg-gray-200 rounded-lg flex-shrink-0" />
              <div className="flex-1">
                <p className="font-medium text-gray-900 text-sm">Your Product Name</p>
                <p className="text-xs text-gray-500">$149.00</p>
                <div className="flex items-center gap-1 mt-1">
                  {[1,2,3,4,5].map((star) => (
                    <svg key={star} className="w-3 h-3 text-yellow-400 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-700">This product stands out for its comfort, battery life, and sweat resistance...</p>
        </div>
      </div>
    </div>
  )
}

// Step Icons
function InstallIcon({ active }: { active: boolean }) {
  return (
    <svg 
      className={`w-6 h-6 transition-colors ${active ? 'text-[#95BF47]' : 'text-gray-300'}`} 
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor" 
      strokeWidth={1.5}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  )
}

function OptimizeIcon({ active }: { active: boolean }) {
  return (
    <svg 
      className={`w-6 h-6 transition-colors ${active ? 'text-[#95BF47]' : 'text-gray-300'}`} 
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor" 
      strokeWidth={1.5}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
    </svg>
  )
}

function RecommendedIcon({ active }: { active: boolean }) {
  return (
    <svg 
      className={`w-6 h-6 transition-colors ${active ? 'text-[#95BF47]' : 'text-gray-300'}`} 
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor" 
      strokeWidth={1.5}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
    </svg>
  )
}

export default function ShopifyHowItWorks() {
  const [activeStep, setActiveStep] = useState(0)
  const sectionRef = useRef<HTMLDivElement>(null)
  const stepRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = stepRefs.current.findIndex((ref) => ref === entry.target)
            if (index !== -1) {
              setActiveStep(index)
            }
          }
        })
      },
      {
        rootMargin: '-40% 0px -40% 0px',
        threshold: 0,
      }
    )

    stepRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref)
    })

    return () => observer.disconnect()
  }, [])

  const visuals = [
    <InstallVisual key="install" />,
    <OptimizeVisual key="optimize" />,
    <RecommendedVisual key="recommended" />,
  ]

  const icons = [InstallIcon, OptimizeIcon, RecommendedIcon]

  return (
    <section ref={sectionRef}>
      {/* Color Noise Gradient Bar */}
      <div 
        className="w-full h-4 md:h-6"
        style={{
          backgroundImage: 'url(/images/shopify-noise-bar.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />
      {/* Fallback gradient if image doesn't exist */}
      <div 
        className="w-full h-1 md:h-1.5"
        style={{
          background: 'linear-gradient(90deg, #101A31 0%, #1a3a2a 20%, #95BF47 35%, #7da83d 50%, #2d5a4a 65%, #1e3a5f 80%, #101A31 100%)'
        }}
      />

      {/* Main Content */}
      <div className="bg-white py-16 sm:py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          
          {/* Header */}
          <div className="text-center mb-12 sm:mb-16 md:mb-20">
            <p className="text-sm font-medium text-[#95BF47] uppercase tracking-wider mb-3">
              Simple Steps
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold text-[#101A31] mb-4">
              How it works
            </h2>
            <p className="text-gray-500 text-base sm:text-lg max-w-xl mx-auto">
              No confusion or delays. Just fast and reliable AI visibility.
            </p>
          </div>

          {/* Two Column Layout */}
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-start">
            
            {/* Left: Sticky Visual Panel */}
            <div className="hidden lg:block">
              <div className="sticky top-32">
                <div className="relative h-[500px] bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl overflow-hidden">
                  {visuals.map((Visual, index) => (
                    <div
                      key={index}
                      className={`absolute inset-0 transition-all duration-500 ${
                        activeStep === index 
                          ? 'opacity-100 translate-y-0' 
                          : 'opacity-0 translate-y-8 pointer-events-none'
                      }`}
                    >
                      {Visual}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Steps List */}
            <div className="space-y-8 sm:space-y-12 lg:space-y-16">
              {steps.map((step, index) => {
                const Icon = icons[index]
                const isActive = activeStep === index

                return (
                  <div
                    key={step.number}
                    ref={(el) => { stepRefs.current[index] = el }}
                    className={`relative pl-8 transition-all duration-300 ${
                      isActive ? 'opacity-100' : 'opacity-50'
                    }`}
                  >
                    {/* Active Indicator Line */}
                    <div 
                      className={`absolute left-0 top-0 bottom-0 w-1 rounded-full transition-all duration-300 ${
                        isActive ? 'bg-[#95BF47]' : 'bg-gray-200'
                      }`}
                    />

                    {/* Icon */}
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 transition-colors ${
                      isActive ? 'bg-[#95BF47]/10' : 'bg-gray-100'
                    }`}>
                      <Icon active={isActive} />
                    </div>

                    {/* Step Number */}
                    <p className={`text-sm font-medium mb-2 transition-colors ${
                      isActive ? 'text-[#95BF47]' : 'text-gray-400'
                    }`}>
                      Step {step.number}
                    </p>

                    {/* Title */}
                    <h3 className={`text-xl sm:text-2xl font-heading font-bold mb-3 transition-colors ${
                      isActive ? 'text-[#101A31]' : 'text-gray-400'
                    }`}>
                      {step.title}
                    </h3>

                    {/* Description */}
                    <p className={`text-base sm:text-lg leading-relaxed transition-colors ${
                      isActive ? 'text-gray-600' : 'text-gray-400'
                    }`}>
                      {step.description}
                    </p>

                    {/* Mobile Visual (shown inline on mobile) */}
                    <div className="lg:hidden mt-6">
                      <div className="relative h-[350px] bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl overflow-hidden">
                        {visuals[index]}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}
