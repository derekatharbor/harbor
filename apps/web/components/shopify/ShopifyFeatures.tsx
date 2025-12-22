// components/shopify/ShopifyFeatures.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import { Code, FileText, BarChart3, RefreshCw } from 'lucide-react'

const features = [
  {
    icon: Code,
    title: 'Auto-Generated Schema',
    description: 'Product JSON-LD, FAQs, and structured data injected into your theme automatically. No dev work required.',
  },
  {
    icon: FileText,
    title: 'AI-Ready Descriptions',
    description: 'Your product copy rewritten for how AI models parse and recommend — clear, factual, attribute-rich.',
  },
  {
    icon: BarChart3,
    title: 'Visibility Tracking',
    description: 'See exactly when ChatGPT, Claude, Gemini, and Perplexity mention your products — and for which queries.',
  },
  {
    icon: RefreshCw,
    title: 'Always In Sync',
    description: 'New products, price changes, inventory updates — Harbor keeps your AI presence current automatically.',
  },
]

export default function ShopifyFeatures() {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.2 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} className="relative bg-[#0a0a0a] py-20 sm:py-28 overflow-hidden">
      
      {/* Subtle grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-sm font-medium text-[#95BF47] uppercase tracking-wider mb-3">
            Features
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Everything you need.{' '}
            <span className="text-white/40">Nothing you don't.</span>
          </h2>
          <p className="text-white/50 text-base max-w-xl mx-auto">
            One install. Zero maintenance. Your products start showing up in AI recommendations.
          </p>
        </div>

        {/* Features Grid */}
        <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div 
                key={index}
                className="group relative p-6 sm:p-8 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] hover:border-[#95BF47]/20 transition-all duration-300"
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                {/* Icon */}
                <div className="w-12 h-12 rounded-xl bg-[#95BF47]/10 flex items-center justify-center mb-4 group-hover:bg-[#95BF47]/20 transition-colors">
                  <Icon className="w-6 h-6 text-[#95BF47]" />
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-white/50 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            )
          })}
        </div>

        {/* Stats */}
        <div className={`grid grid-cols-3 gap-6 mt-16 transition-all duration-1000 delay-300 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          {[
            { value: '40%', label: 'of product searches start with AI' },
            { value: '73%', label: 'of AI answers cite zero Shopify products' },
            { value: '<5min', label: 'to install and configure' },
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <p className="text-2xl sm:text-3xl font-bold text-[#95BF47] mb-1">
                {stat.value}
              </p>
              <p className="text-white/40 text-xs sm:text-sm">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
