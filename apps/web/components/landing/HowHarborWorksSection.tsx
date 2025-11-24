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
    description: 'We scan major AI models for your brand and competitors.',
    expandedContent: 'Harbor queries ChatGPT, Claude, Gemini, and Perplexity with the prompts your customers actually use. We capture how each model talks about your brand, what it recommends, and where you rank against competitors.',
    // Derek: Add screenshot at /public/previews/how-scan.png (recommended: 800x600px)
    image: '/previews/how-scan.png'
  },
  {
    id: 'interpret',
    icon: Brain,
    title: 'Interpret',
    description: 'We translate raw answers into a clear visibility and perception profile.',
    expandedContent: 'Raw AI responses become structured insights: your visibility score, sentiment analysis, competitor comparisons, and the specific phrases models use to describe you. No guesswork—just data.',
    // Derek: Add screenshot at /public/previews/how-interpret.png (recommended: 800x600px)
    image: '/previews/how-interpret.png'
  },
  {
    id: 'improve',
    icon: TrendingUp,
    title: 'Improve',
    description: 'We give you concrete tasks on your own site and content, then track progress over time.',
    expandedContent: 'Harbor generates specific, actionable recommendations: schema markup to add, content gaps to fill, pages to optimize. Complete tasks, re-scan, and watch your visibility improve.',
    // Derek: Add screenshot at /public/previews/how-improve.png (recommended: 800x600px)
    image: '/previews/how-improve.png'
  }
]

export default function HowHarborWorksSection() {
  const [activeStep, setActiveStep] = useState('scan')

  const activeStepData = steps.find(s => s.id === activeStep) || steps[0]

  return (
    <section className="relative bg-white py-20 md:py-32" data-nav-theme="light">
      <div className="max-w-7xl mx-auto px-6">

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">

          {/* Left: Image Preview */}
          <div className="relative order-2 lg:order-1">
            
            {/* Image Container with subtle shadow */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-black/10 border border-gray-200/50">
              
              {/* Gradient top bar - like Plaid's teal bar */}
              <div 
                className="h-2"
                style={{
                  background: 'linear-gradient(90deg, #22d3ee, #3b82f6, #101A31)'
                }}
              />

              {/* Image area */}
              <div className="relative bg-[#f8fafc] aspect-[4/3]">
                {/* 
                  Derek: Add your screenshots. They'll swap based on active accordion.
                  Recommended size: 800x600px each
                  Paths:
                  - /public/previews/how-scan.png
                  - /public/previews/how-interpret.png  
                  - /public/previews/how-improve.png
                */}
                
                {steps.map((step) => (
                  <div
                    key={step.id}
                    className={`absolute inset-0 transition-opacity duration-300 ${
                      activeStep === step.id ? 'opacity-100' : 'opacity-0'
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

                {/* Fallback placeholder if images don't exist */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <activeStepData.icon className="w-16 h-16 mx-auto mb-4 opacity-20" />
                    <p className="text-sm font-mono opacity-50">{activeStepData.image}</p>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Right: Copy + Accordion */}
          <div className="order-1 lg:order-2">

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
              Harbor gives you the visibility layer you've been missing. Three steps to understand and improve how AI models represent your brand.
            </p>

            {/* Accordion */}
            <div className="space-y-4">
              {steps.map((step) => {
                const isActive = activeStep === step.id
                const Icon = step.icon

                return (
                  <div
                    key={step.id}
                    className={`border rounded-xl transition-all duration-200 ${
                      isActive 
                        ? 'border-[#101A31]/20 bg-[#101A31]/[0.02]' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <button
                      onClick={() => setActiveStep(step.id)}
                      className="w-full flex items-center justify-between p-5 text-left cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg transition-colors ${
                          isActive ? 'bg-[#101A31] text-white' : 'bg-gray-100 text-gray-500'
                        }`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className={`text-lg font-semibold transition-colors ${
                            isActive ? 'text-[#101A31]' : 'text-gray-700'
                          }`}>
                            Step {steps.indexOf(step) + 1}: {step.title}
                          </h3>
                          <p className="text-sm text-gray-500 mt-0.5">
                            {step.description}
                          </p>
                        </div>
                      </div>
                      <div className={`p-1 rounded transition-colors ${
                        isActive ? 'text-[#101A31]' : 'text-gray-400'
                      }`}>
                        {isActive ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                      </div>
                    </button>

                    {/* Expanded Content */}
                    <div className={`overflow-hidden transition-all duration-300 ${
                      isActive ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
                    }`}>
                      <div className="px-5 pb-5 pt-0">
                        <p className="text-gray-600 leading-relaxed pl-14">
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
