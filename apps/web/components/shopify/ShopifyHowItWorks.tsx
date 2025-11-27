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
    <div className="relative w-full h-full flex items-center justify-center p-6 sm:p-8">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-5 sm:p-6 max-w-sm w-full">
        {/* App Store Header */}
        <div className="flex items-start gap-4 mb-6">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-[#101A31] flex items-center justify-center flex-shrink-0">
            <Image
              src="/logo-icon.png"
              alt="Harbor"
              width={40}
              height={40}
              className="w-8 h-8 sm:w-10 sm:h-10"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 text-base sm:text-lg">Harbor</h3>
            <p className="text-xs sm:text-sm text-gray-500">AI Visibility for Shopify</p>
            <div className="flex items-center gap-1 mt-1">
              {[1,2,3,4,5].map((star) => (
                <svg key={star} className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
              <span className="text-xs text-gray-400 ml-1">5.0</span>
            </div>
          </div>
        </div>

        {/* Install Button */}
        <button className="w-full py-3 px-6 bg-[#95BF47] text-white font-semibold rounded-lg flex items-center justify-center gap-2">
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
    <div className="relative w-full h-full flex items-center justify-center p-6 sm:p-8">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-5 sm:p-6 max-w-sm w-full">
        {/* Product Page Wireframe */}
        <div className="space-y-4">
          {/* Product Header */}
          <div className="flex gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-lg" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-100 rounded w-3/4" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
              <div className="h-4 bg-gray-200 rounded w-1/3" />
            </div>
          </div>

          {/* Schema Injection Highlights */}
          <div className="relative p-3 sm:p-4 border-2 border-[#95BF47] rounded-lg bg-[#95BF47]/5">
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

          <div className="relative p-3 sm:p-4 border-2 border-[#95BF47] rounded-lg bg-[#95BF47]/5">
            <div className="absolute -top-2 left-3 px-2 bg-white text-xs font-medium text-[#95BF47]">
              FAQ Added
            </div>
            <div className="space-y-2">
              <div className="h-2 bg-[#95BF47]/20 rounded w-full" />
              <div className="h-2 bg-[#95BF47]/20 rounded w-2/3" />
            </div>
            <div className="absolute -right-1 -top-1 w-3 h-3 bg-[#95BF47] rounded-full animate-ping" style={{ animationDelay: '0.5s' }} />
          </div>

          <div className="relative p-3 sm:p-4 border-2 border-[#95BF47] rounded-lg bg-[#95BF47]/5">
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

// Step 3 Visual: ChatGPT Answer Mockup
function RecommendedVisual() {
  return (
    <div className="relative w-full h-full flex items-center justify-center p-6 sm:p-8">
      <div className="bg-[#343541] rounded-2xl shadow-2xl overflow-hidden max-w-sm w-full">
        {/* ChatGPT Header - Dark with white logo */}
        <div className="flex items-center gap-2 px-4 py-3 bg-[#202123] border-b border-white/10">
          <Image
            src="/logos/chatgpt.svg"
            alt="ChatGPT"
            width={20}
            height={20}
            className="w-5 h-5"
          />
          <span className="text-sm font-medium text-white">ChatGPT</span>
        </div>

        {/* Chat Content */}
        <div className="p-4 sm:p-5 space-y-4">
          {/* Question */}
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-full bg-[#5436DA] flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-medium">U</span>
            </div>
            <p className="text-sm text-gray-300 pt-1">What's the best wireless headphone for running?</p>
          </div>

          {/* Answer */}
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-full bg-[#19C37D] flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.8956zm16.0993 3.8558L12.6 8.3829l2.02-1.1638a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z" />
              </svg>
            </div>
            <div className="flex-1 space-y-3 pt-1">
              <p className="text-sm text-gray-300">Based on my research, I'd recommend:</p>
              
              {/* Product Card */}
              <div className="relative p-3 sm:p-4 bg-[#444654] rounded-xl">
                <div className="absolute -top-2 -right-2">
                  <span className="px-2 py-1 bg-[#95BF47] text-white text-xs font-medium rounded-full flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Recommended
                  </span>
                </div>
                <div className="flex gap-3">
                  <div className="w-12 h-12 bg-[#565869] rounded-lg flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium text-white text-sm">Your Product Name</p>
                    <p className="text-xs text-gray-400">$149.00</p>
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

              <p className="text-sm text-gray-300">This product stands out for its comfort, battery life, and sweat resistance...</p>
            </div>
          </div>
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
  const [isLocked, setIsLocked] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)
  const lastScrollTime = useRef(0)

  const visuals = [
    <InstallVisual key="install" />,
    <OptimizeVisual key="optimize" />,
    <RecommendedVisual key="recommended" />,
  ]

  const icons = [InstallIcon, OptimizeIcon, RecommendedIcon]

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const handleScroll = () => {
      const rect = section.getBoundingClientRect()
      const sectionTop = rect.top
      const sectionBottom = rect.bottom
      const viewportHeight = window.innerHeight

      // Check if section is in view and should be locked
      const shouldLock = sectionTop <= 100 && sectionBottom >= viewportHeight

      if (shouldLock && !isLocked) {
        setIsLocked(true)
      } else if (!shouldLock && isLocked) {
        setIsLocked(false)
      }
    }

    const handleWheel = (e: WheelEvent) => {
      const rect = section.getBoundingClientRect()
      const sectionTop = rect.top
      const sectionBottom = rect.bottom
      const viewportHeight = window.innerHeight

      // Only hijack if section is properly in view
      const isInSection = sectionTop <= 100 && sectionBottom >= viewportHeight

      if (!isInSection) return

      // Throttle to prevent too-fast scrolling
      const now = Date.now()
      if (now - lastScrollTime.current < 400) {
        e.preventDefault()
        return
      }

      const direction = e.deltaY > 0 ? 1 : -1

      // Scrolling down
      if (direction > 0) {
        if (activeStep < steps.length - 1) {
          e.preventDefault()
          lastScrollTime.current = now
          setActiveStep(prev => prev + 1)
        }
        // If on last step, allow natural scroll to continue
      }
      // Scrolling up
      else {
        if (activeStep > 0) {
          e.preventDefault()
          lastScrollTime.current = now
          setActiveStep(prev => prev - 1)
        }
        // If on first step, allow natural scroll to go back
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('wheel', handleWheel, { passive: false })

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('wheel', handleWheel)
    }
  }, [activeStep, isLocked])

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
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
            
            {/* Left: Sticky Visual Panel */}
            <div className="hidden lg:block">
              <div className="sticky top-24">
                <div className="relative h-[500px] bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl overflow-hidden">
                  {visuals.map((Visual, index) => (
                    <div
                      key={index}
                      className={`absolute inset-0 transition-all duration-500 ${
                        activeStep === index 
                          ? 'opacity-100 scale-100' 
                          : 'opacity-0 scale-95 pointer-events-none'
                      }`}
                    >
                      {Visual}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Clickable Steps List */}
            <div className="space-y-4">
              {steps.map((step, index) => {
                const Icon = icons[index]
                const isActive = activeStep === index

                return (
                  <button
                    key={step.number}
                    onClick={() => setActiveStep(index)}
                    className={`relative w-full text-left pl-6 sm:pl-8 pr-4 sm:pr-6 py-6 sm:py-8 rounded-2xl transition-all duration-300 cursor-pointer ${
                      isActive 
                        ? 'bg-gray-50 shadow-sm' 
                        : 'bg-transparent hover:bg-gray-50/50'
                    }`}
                  >
                    {/* Active Indicator Line */}
                    <div 
                      className={`absolute left-0 top-6 sm:top-8 bottom-6 sm:bottom-8 w-1 rounded-full transition-all duration-300 ${
                        isActive ? 'bg-[#95BF47]' : 'bg-gray-200'
                      }`}
                    />

                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl transition-colors flex-shrink-0 ${
                        isActive ? 'bg-[#95BF47]/10' : 'bg-gray-100'
                      }`}>
                        <Icon active={isActive} />
                      </div>

                      <div className="flex-1 min-w-0">
                        {/* Step Number */}
                        <p className={`text-sm font-medium mb-1 transition-colors ${
                          isActive ? 'text-[#95BF47]' : 'text-gray-400'
                        }`}>
                          Step {step.number}
                        </p>

                        {/* Title */}
                        <h3 className={`text-xl sm:text-2xl font-heading font-bold mb-2 transition-colors ${
                          isActive ? 'text-[#101A31]' : 'text-gray-400'
                        }`}>
                          {step.title}
                        </h3>

                        {/* Description */}
                        <p className={`text-sm sm:text-base leading-relaxed transition-colors ${
                          isActive ? 'text-gray-600' : 'text-gray-400'
                        }`}>
                          {step.description}
                        </p>
                      </div>
                    </div>

                    {/* Mobile Visual (shown inline on mobile when active) */}
                    {isActive && (
                      <div className="lg:hidden mt-6">
                        <div className="relative h-[350px] bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl overflow-hidden">
                          {visuals[index]}
                        </div>
                      </div>
                    )}
                  </button>
                )
              })}
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}