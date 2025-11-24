// apps/web/components/landing/HowHarborWorksSection.tsx
'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Scan, Brain, TrendingUp, Plus, Minus } from 'lucide-react'

const steps = [
  {
    id: 'scan',
    icon: Scan,
    title: 'Scan',
    description: 'We query AI models the way your customers do.',
    expandedContent: 'Harbor asks ChatGPT, Claude, Gemini, and Perplexity the questions your buyers actually ask. We record every mention, recommendation, and competitor comparison.',
    image: '/previews/how-scan.png'
  },
  {
    id: 'interpret',
    icon: Brain,
    title: 'Interpret',
    description: 'Raw AI responses become a clear visibility profile.',
    expandedContent: 'You get a visibility score, sentiment breakdown, and the exact language models use to describe you. See where you rank and why.',
    image: '/previews/how-interpret.png'
  },
  {
    id: 'improve',
    icon: TrendingUp,
    title: 'Improve',
    description: 'Concrete tasks to strengthen your AI presence.',
    expandedContent: 'Harbor tells you what to fix: schema to add, content gaps to fill, pages to optimize. Make the changes, re-scan, and track your progress.',
    image: '/previews/how-improve.png'
  }
]

export default function HowHarborWorksSection() {
  const [activeStep, setActiveStep] = useState<string | null>('scan')

  const activeStepData = steps.find(s => s.id === activeStep) || steps[0]

  const handleStepClick = (stepId: string) => {
    setActiveStep(activeStep === stepId ? null : stepId)
  }

  return (
    <section className="relative bg-white py-20 md:py-32" data-nav-theme="light">
      <div className="max-w-7xl mx-auto px-6">

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-stretch">

          {/* Left: Image Preview */}
          <div className="relative order-2 lg:order-1 lg:sticky lg:top-32 lg:self-start">
            
            <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-black/10 border border-gray-200/50 min-h-[300px] lg:min-h-[500px]">
              
              <div 
                className="h-2"
                style={{
                  background: 'linear-gradient(90deg, #22d3ee, #3b82f6, #101A31)'
                }}
              />

              <div className="relative bg-[#f8fafc] h-[350px] md:h-[450px]">
                
                {steps.map((step) => (
                  <div
                    key={step.id}
                    className={`absolute inset-0 z-10 transition-opacity duration-300 ${
                      activeStep === step.id ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                  >
                    <Image
                      src={step.image}
                      alt={`Harbor ${step.title} step`}
                      fill
                      className="object-cover object-top"
                    />
                  </div>
                ))}

              </div>
            </div>

          </div>

          {/* Right: Copy + Accordion */}
          <div className="order-1 lg:order-2 min-w-0">

            {/* Eyebrow */}
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-[#101A31]/5 backdrop-blur-sm border border-[#101A31]/10 mb-6">
              <p className="text-sm font-mono uppercase tracking-wider text-[#101A31]/70">
                How it works
              </p>
            </div>

            {/* Headline */}
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-[#101A31] via-[#0891b2] to-[#2979FF] bg-clip-text text-transparent">
                See your AI presence clearly, then strengthen it
              </span>
            </h2>

            {/* Subhead */}
            <p className="text-lg text-gray-600 leading-relaxed mb-10">
              Three steps to understand and improve how AI represents your brand.
            </p>

            {/* Accordion */}
            <div className="space-y-4">
              {steps.map((step, index) => {
                const isActive = activeStep === step.id
                const Icon = step.icon

                return (
                  <div
                    key={step.id}
                    className={`border rounded-xl transition-all duration-200 overflow-hidden ${
                      isActive 
                        ? 'border-[#101A31]/20 bg-[#101A31]/[0.02]' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <button
                      onClick={() => handleStepClick(step.id)}
                      className="w-full flex items-start justify-between p-4 md:p-5 text-left cursor-pointer gap-3"
                    >
                      <div className="flex items-start gap-3 md:gap-4 min-w-0 flex-1">
                        <div className={`p-2 rounded-lg transition-colors flex-shrink-0 ${
                          isActive ? 'bg-[#101A31] text-white' : 'bg-gray-100 text-gray-500'
                        }`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <h3 className={`text-base md:text-lg font-semibold transition-colors ${
                            isActive ? 'text-[#101A31]' : 'text-gray-700'
                          }`}>
                            Step {index + 1}: {step.title}
                          </h3>
                          <p className="text-sm text-gray-500 mt-0.5 break-words">
                            {step.description}
                          </p>
                        </div>
                      </div>
                      <div className={`p-1 rounded transition-colors flex-shrink-0 ${
                        isActive ? 'text-[#101A31]' : 'text-gray-400'
                      }`}>
                        {isActive ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                      </div>
                    </button>

                    {/* Expanded Content */}
                    <div className={`transition-all duration-300 ${
                      isActive ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
                    }`}>
                      <div className="px-4 md:px-5 pb-4 md:pb-5 pt-0">
                        <p className="text-gray-600 leading-relaxed pl-11 md:pl-14 text-sm md:text-base">
                          {step.expandedContent}
                        </p>
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