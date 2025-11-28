// components/shopify/ShopifyFeatures.tsx
'use client'

import { useEffect, useRef, useState } from 'react'

const stats = [
  { value: '40%', label: 'of product searches now start with AI' },
  { value: '0%', label: 'of Shopify stores are optimized for it' },
  { value: '73%', label: 'of AI answers cite zero Shopify products' },
]

const features = [
  {
    icon: 'schema',
    title: 'Auto-Generated Schema',
    description: 'Product JSON-LD, FAQs, and structured data injected into your theme automatically. No dev work required.',
  },
  {
    icon: 'descriptions',
    title: 'AI-Ready Descriptions',
    description: 'Your product copy rewritten for how AI models parse and recommend — clear, factual, attribute-rich.',
  },
  {
    icon: 'tracking',
    title: 'Visibility Tracking',
    description: 'See exactly when ChatGPT, Claude, Gemini, and Perplexity mention your products — and for which queries.',
  },
  {
    icon: 'sync',
    title: 'Always In Sync',
    description: 'New products, price changes, inventory updates — Harbor keeps your AI presence current automatically.',
  },
]

function SchemaIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
    </svg>
  )
}

function DescriptionsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  )
}

function TrackingIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
    </svg>
  )
}

function SyncIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg>
  )
}

const iconMap: Record<string, React.FC<{ className?: string }>> = {
  schema: SchemaIcon,
  descriptions: DescriptionsIcon,
  tracking: TrackingIcon,
  sync: SyncIcon,
}

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
    <section ref={sectionRef} className="relative bg-[#101A31] py-20 sm:py-28 md:py-36 overflow-hidden">
      
      {/* Subtle grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="text-center mb-16 sm:mb-20">
          <p className="text-sm font-medium text-[#95BF47] uppercase tracking-wider mb-3">
            The Reality
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold text-white mb-6">
            AI is the new search.<br className="hidden sm:block" />
            <span className="text-white/40">Your store isn't ready.</span>
          </h2>
          <p className="text-white/50 text-base sm:text-lg max-w-2xl mx-auto">
            Shopify stores are invisible to AI models. No schema, no structure, no recommendations. 
            While your competitors figure this out, your products stay hidden.
          </p>
        </div>

        {/* Stats Row */}
        <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-20 sm:mb-28 transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          {stats.map((stat, index) => (
            <div 
              key={index}
              className="relative p-6 sm:p-8 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-center"
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              <p className="text-4xl sm:text-5xl md:text-6xl font-heading font-bold text-[#95BF47] mb-2">
                {stat.value}
              </p>
              <p className="text-white/50 text-sm sm:text-base">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Features Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h3 className="text-2xl sm:text-3xl font-heading font-bold text-white mb-4">
            Harbor fixes this. Automatically.
          </h3>
          <p className="text-white/50 text-base sm:text-lg max-w-xl mx-auto">
            One install. Zero maintenance. Your products start showing up.
          </p>
        </div>

        {/* Features Grid */}
        <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 transition-all duration-1000 delay-300 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          {features.map((feature, index) => {
            const Icon = iconMap[feature.icon]
            return (
              <div 
                key={index}
                className="group relative p-6 sm:p-8 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] hover:border-[#95BF47]/20 transition-all duration-300"
              >
                {/* Icon */}
                <div className="w-12 h-12 rounded-xl bg-[#95BF47]/10 flex items-center justify-center mb-4 group-hover:bg-[#95BF47]/20 transition-colors">
                  <Icon className="w-6 h-6 text-[#95BF47]" />
                </div>

                {/* Content */}
                <h4 className="text-lg sm:text-xl font-heading font-bold text-white mb-2">
                  {feature.title}
                </h4>
                <p className="text-white/50 text-sm sm:text-base leading-relaxed">
                  {feature.description}
                </p>
              </div>
            )
          })}
        </div>

        {/* Bottom CTA hint */}
        <div className="text-center mt-16 sm:mt-20">
          <p className="text-white/30 text-sm">
            Join the waitlist. Be first when we launch.
          </p>
        </div>

      </div>
    </section>
  )
}
