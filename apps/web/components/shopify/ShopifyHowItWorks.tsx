// components/shopify/ShopifyHowItWorks.tsx
'use client'

import { useState } from 'react'
import { Download, Zap, BarChart3, TrendingUp } from 'lucide-react'

const steps = [
  {
    number: '01',
    icon: Download,
    title: 'Install the plugin',
    description: 'One-click install from the Shopify App Store. No code, no developers, no configuration needed.',
    detail: 'Works with any Shopify theme',
  },
  {
    number: '02',
    icon: Zap,
    title: 'Harbor scans your store',
    description: 'We analyze your products, descriptions, and metadata to generate AI-optimized structured data.',
    detail: 'Schema, JSON-LD, FAQs auto-generated',
  },
  {
    number: '03',
    icon: BarChart3,
    title: 'Track your visibility',
    description: 'See when ChatGPT, Claude, Gemini, or Perplexity mentions your products and for which queries.',
    detail: 'Real-time monitoring dashboard',
  },
  {
    number: '04',
    icon: TrendingUp,
    title: 'Get recommended',
    description: 'As AI models crawl your optimized store, your products start appearing in recommendations.',
    detail: 'Automatic sync keeps data current',
  },
]

export default function ShopifyHowItWorks() {
  const [activeStep, setActiveStep] = useState(0)

  return (
    <>
      {/* Gradient transition bar */}
      <div 
        className="w-full h-1"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, #95BF47 50%, transparent 100%)',
          opacity: 0.4,
        }}
      />

      <section className="relative bg-[#0a0a0a] py-20 sm:py-28 overflow-hidden">
        {/* Background grid */}
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
              How It Works
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Four steps to AI visibility
            </h2>
            <p className="text-white/50 text-base max-w-xl mx-auto">
              Install once. Harbor handles the rest automatically.
            </p>
          </div>

          {/* Steps */}
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-start">
            {/* Left - Step list */}
            <div className="space-y-2">
              {steps.map((step, index) => {
                const Icon = step.icon
                const isActive = index === activeStep
                
                return (
                  <button
                    key={index}
                    onClick={() => setActiveStep(index)}
                    className={`w-full text-left p-5 rounded-xl border transition-all duration-300 ${
                      isActive 
                        ? 'bg-white/[0.05] border-[#95BF47]/30' 
                        : 'bg-transparent border-white/[0.05] hover:border-white/[0.1]'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Number */}
                      <span className={`text-sm font-mono transition-colors ${
                        isActive ? 'text-[#95BF47]' : 'text-white/20'
                      }`}>
                        {step.number}
                      </span>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-semibold mb-1 transition-colors ${
                          isActive ? 'text-white' : 'text-white/60'
                        }`}>
                          {step.title}
                        </h3>
                        <p className={`text-sm transition-colors ${
                          isActive ? 'text-white/50' : 'text-white/30'
                        }`}>
                          {step.description}
                        </p>
                      </div>

                      {/* Icon */}
                      <div className={`p-2 rounded-lg transition-colors ${
                        isActive ? 'bg-[#95BF47]/10' : 'bg-white/[0.03]'
                      }`}>
                        <Icon className={`w-5 h-5 transition-colors ${
                          isActive ? 'text-[#95BF47]' : 'text-white/30'
                        }`} />
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Right - Visual */}
            <div className="relative">
              {/* Mock dashboard/visual for active step */}
              <div className="relative bg-white/[0.02] border border-white/[0.08] rounded-2xl p-6 sm:p-8 min-h-[320px]">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-[#95BF47]/10">
                    {(() => {
                      const Icon = steps[activeStep].icon
                      return <Icon className="w-5 h-5 text-[#95BF47]" />
                    })()}
                  </div>
                  <div>
                    <p className="text-white font-medium">{steps[activeStep].title}</p>
                    <p className="text-white/40 text-sm">{steps[activeStep].detail}</p>
                  </div>
                </div>

                {/* Step-specific visuals */}
                {activeStep === 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-white/[0.03] rounded-xl">
                      <div className="w-12 h-12 bg-[#95BF47]/10 rounded-lg flex items-center justify-center">
                        <Download className="w-6 h-6 text-[#95BF47]" />
                      </div>
                      <div className="flex-1">
                        <p className="text-white text-sm font-medium">Harbor for Shopify</p>
                        <p className="text-white/40 text-xs">One-click install</p>
                      </div>
                      <div className="px-3 py-1.5 bg-[#95BF47] rounded-lg text-black text-xs font-semibold">
                        Install
                      </div>
                    </div>
                    <p className="text-white/30 text-xs text-center">No code changes required</p>
                  </div>
                )}

                {activeStep === 1 && (
                  <div className="space-y-3">
                    {['Products analyzed', 'Schema generated', 'FAQs created', 'Metadata optimized'].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-white/[0.03] rounded-lg">
                        <div className="w-6 h-6 rounded-full bg-[#95BF47]/20 flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-[#95BF47]" />
                        </div>
                        <span className="text-white/70 text-sm">{item}</span>
                        <span className="ml-auto text-[#95BF47] text-xs">✓</span>
                      </div>
                    ))}
                  </div>
                )}

                {activeStep === 2 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: 'ChatGPT', value: '—' },
                        { label: 'Claude', value: '—' },
                        { label: 'Perplexity', value: '—' },
                      ].map((stat, i) => (
                        <div key={i} className="p-3 bg-white/[0.03] rounded-lg text-center">
                          <p className="text-2xl font-bold text-white">{stat.value}</p>
                          <p className="text-white/40 text-xs">{stat.label}</p>
                        </div>
                      ))}
                    </div>
                    <p className="text-white/30 text-xs text-center">Mentions tracked in real-time</p>
                  </div>
                )}

                {activeStep === 3 && (
                  <div className="space-y-4">
                    <div className="flex items-end gap-1 h-24">
                      {[20, 28, 35, 42, 48, 55, 62, 70].map((h, i) => (
                        <div 
                          key={i} 
                          className="flex-1 bg-gradient-to-t from-[#95BF47]/50 to-[#95BF47] rounded-t transition-all duration-500"
                          style={{ height: `${h}%` }}
                        />
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-xs text-white/40">
                      <span>Week 1</span>
                      <span className="text-[#95BF47]">Growing visibility</span>
                      <span>Week 8</span>
                    </div>
                  </div>
                )}

                {/* Progress indicator */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {steps.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveStep(index)}
                      className={`w-1.5 h-1.5 rounded-full transition-colors ${
                        index === activeStep ? 'bg-[#95BF47]' : 'bg-white/20'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}