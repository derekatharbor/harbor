// components/landing-new/FeatureCards.tsx
'use client'

import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import Image from 'next/image'

const AI_PROMPTS = [
  { model: 'ChatGPT', logo: '/logos/chatgpt.svg', prompt: 'What\'s the best CRM for startups?' },
  { model: 'Claude', logo: '/logos/claude.svg', prompt: 'Compare HubSpot vs Salesforce' },
  { model: 'Gemini', logo: '/logos/gemini.svg', prompt: 'Top marketing automation tools 2025' },
  { model: 'Perplexity', logo: '/logos/perplexity.svg', prompt: 'Best project management software' },
]

const FEATURES = [
  {
    id: 'visibility',
    title: 'Track AI visibility',
    subtitle: 'across every model',
    modalTitle: 'Real-time AI Visibility Tracking',
    modalDescription: 'See exactly how often AI models recommend your brand. Track mentions across ChatGPT, Claude, Gemini, and Perplexity in real-time. Understand which prompts surface your brand and which don\'t.',
    modalBullets: [
      'Monitor mentions across all major AI models',
      'Track visibility trends over time',
      'See the exact prompts where you appear',
      'Benchmark against industry averages',
    ],
  },
  {
    id: 'competitors',
    title: 'Outrank your',
    subtitle: 'competitors',
    modalTitle: 'Competitive Intelligence',
    modalDescription: 'Know exactly where you stand against competitors in AI recommendations. See who\'s winning share of voice and identify opportunities to close the gap.',
    modalBullets: [
      'Side-by-side competitor comparisons',
      'Share of voice analysis',
      'Gap identification and opportunities',
      'Track competitor movement over time',
    ],
  },
  {
    id: 'optimize',
    title: 'Optimize to get',
    subtitle: 'recommended',
    modalTitle: 'Actionable Optimization',
    modalDescription: 'Get specific, prioritized recommendations to improve your AI visibility. From schema markup to content optimization, know exactly what to fix and why it matters.',
    modalBullets: [
      'Prioritized action items',
      'Schema markup generators',
      'Content optimization suggestions',
      'Track improvement over time',
    ],
  },
]

// Floating AI Prompt Card Component
function FloatingPromptCard({ 
  model, 
  logo, 
  prompt, 
  className = '',
  style = {}
}: { 
  model: string
  logo: string
  prompt: string
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <div 
      className={`absolute bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-xl p-4 shadow-2xl ${className}`}
      style={style}
    >
      <div className="flex items-center gap-2 mb-2">
        <Image src={logo} alt={model} width={20} height={20} className="w-5 h-5" />
        <span className="text-white/60 text-xs font-medium">{model}</span>
      </div>
      <p className="text-white/80 text-sm leading-relaxed">{prompt}</p>
    </div>
  )
}

// Feature Card Component
function FeatureCard({ 
  feature, 
  children,
  onClick 
}: { 
  feature: typeof FEATURES[0]
  children: React.ReactNode
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="group relative bg-[#111] hover:bg-[#151515] border border-white/[0.08] hover:border-white/[0.15] rounded-2xl overflow-hidden transition-all duration-300 text-left h-[420px] flex flex-col"
    >
      {/* Visual area */}
      <div className="flex-1 relative overflow-hidden">
        {children}
      </div>
      
      {/* Title area */}
      <div className="p-6 flex items-end justify-between">
        <div>
          <h3 className="text-white text-xl font-semibold leading-tight">
            {feature.title}
            <br />
            {feature.subtitle}
          </h3>
        </div>
        <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:border-white/30 transition-colors">
          <Plus className="w-5 h-5 text-white/40 group-hover:text-white/70 transition-colors" />
        </div>
      </div>
    </button>
  )
}

// Modal Component
function FeatureModal({ 
  feature, 
  isOpen, 
  onClose 
}: { 
  feature: typeof FEATURES[0] | null
  isOpen: boolean
  onClose: () => void
}) {
  if (!isOpen || !feature) return null

  // Render the visual based on feature id
  const renderVisual = () => {
    switch (feature.id) {
      case 'visibility':
        return (
          <div className="relative h-56 bg-[#111] rounded-xl overflow-hidden mb-6 border border-white/[0.08]">
            {/* Wireframe grid - same as card */}
            <div 
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage: `
                  linear-gradient(to right, white 1px, transparent 1px),
                  linear-gradient(to bottom, white 1px, transparent 1px)
                `,
                backgroundSize: '40px 40px'
              }}
            />
            {/* Floating cards - same positioning as card */}
            <div 
              className="absolute bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-xl p-4 w-48"
              style={{ top: '8%', left: '5%', transform: 'rotate(-2deg)' }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Image src="/logos/chatgpt.svg" alt="ChatGPT" width={20} height={20} className="w-5 h-5" />
                <span className="text-white/60 text-xs font-medium">ChatGPT</span>
              </div>
              <p className="text-white/80 text-sm leading-relaxed">What's the best CRM for startups?</p>
            </div>
            <div 
              className="absolute bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-xl p-4 w-48"
              style={{ top: '12%', right: '3%', transform: 'rotate(3deg)' }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Image src="/logos/claude.svg" alt="Claude" width={20} height={20} className="w-5 h-5" />
                <span className="text-white/60 text-xs font-medium">Claude</span>
              </div>
              <p className="text-white/80 text-sm leading-relaxed">Compare HubSpot vs Salesforce</p>
            </div>
            <div 
              className="absolute bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-xl p-4 w-48"
              style={{ bottom: '15%', left: '20%', transform: 'rotate(1deg)' }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Image src="/logos/gemini.svg" alt="Gemini" width={20} height={20} className="w-5 h-5" />
                <span className="text-white/60 text-xs font-medium">Gemini</span>
              </div>
              <p className="text-white/80 text-sm leading-relaxed">Top marketing automation tools 2025</p>
            </div>
          </div>
        )
      case 'competitors':
        return (
          <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-xl p-5 mb-6">
            <div className="space-y-4">
              {[
                { label: 'Your Brand', width: '85%', highlight: true },
                { label: 'Competitor A', width: '62%', highlight: false },
                { label: 'Competitor B', width: '45%', highlight: false },
              ].map((bar, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className={bar.highlight ? 'text-white/80' : 'text-white/40'}>{bar.label}</span>
                    <span className={bar.highlight ? 'text-cyan-400' : 'text-white/30'}>{bar.width}</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${bar.highlight ? 'bg-gradient-to-r from-cyan-500 to-blue-500' : 'bg-white/10'}`}
                      style={{ width: bar.width }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      case 'optimize':
        return (
          <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-xl p-4 mb-6">
            <div className="space-y-2">
              {[
                { task: 'Add Organization schema', done: true },
                { task: 'Optimize product descriptions', done: true },
                { task: 'Update meta descriptions', done: false },
                { task: 'Add FAQ schema', done: false },
              ].map((item, i) => (
                <div 
                  key={i} 
                  className={`flex items-center gap-3 p-2.5 rounded-lg ${item.done ? 'bg-white/[0.02]' : ''}`}
                >
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                    item.done 
                      ? 'bg-emerald-500/20 text-emerald-400' 
                      : 'bg-white/5 text-white/30 border border-white/10'
                  }`}>
                    {item.done ? '✓' : ''}
                  </div>
                  <span className={`text-sm ${item.done ? 'text-white/40 line-through' : 'text-white/70'}`}>
                    {item.task}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      
      {/* Modal */}
      <div 
        className="relative bg-[#111] border border-white/10 rounded-2xl max-w-lg w-full p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4 text-white/60" />
        </button>

        <h2 className="text-2xl font-bold text-white mb-4">{feature.modalTitle}</h2>
        
        {/* Visual from card */}
        {renderVisual()}
        
        <p className="text-white/50 leading-relaxed mb-6">{feature.modalDescription}</p>
        
        <ul className="space-y-3">
          {feature.modalBullets.map((bullet, i) => (
            <li key={i} className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              </div>
              <span className="text-white/70 text-sm">{bullet}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default function FeatureCards() {
  const [activeModal, setActiveModal] = useState<typeof FEATURES[0] | null>(null)

  return (
    <>
      <section className="relative py-24 bg-[#0a0a0a]">
        <div className="max-w-6xl mx-auto px-6">
          {/* Header */}
          <div className="grid lg:grid-cols-2 gap-8 mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-white leading-tight">
              Built for the<br />AI search era
            </h2>
            <p className="text-white/50 text-lg leading-relaxed lg:pt-2">
              AI is reshaping how customers discover brands. Harbor gives you the visibility and tools to thrive in this new landscape.
            </p>
          </div>

          {/* Cards */}
          <div className="grid md:grid-cols-3 gap-4">
            {/* Card 1: AI Visibility with floating prompts */}
            <FeatureCard 
              feature={FEATURES[0]}
              onClick={() => setActiveModal(FEATURES[0])}
            >
              {/* Wireframe grid background */}
              <div 
                className="absolute inset-0 opacity-[0.03]"
                style={{
                  backgroundImage: `
                    linear-gradient(to right, white 1px, transparent 1px),
                    linear-gradient(to bottom, white 1px, transparent 1px)
                  `,
                  backgroundSize: '40px 40px'
                }}
              />
              
              {/* Floating prompt cards - less overlap */}
              <FloatingPromptCard
                {...AI_PROMPTS[0]}
                className="w-48"
                style={{ top: '8%', left: '5%', transform: 'rotate(-2deg)' }}
              />
              <FloatingPromptCard
                {...AI_PROMPTS[1]}
                className="w-48"
                style={{ top: '12%', right: '3%', transform: 'rotate(3deg)' }}
              />
              <FloatingPromptCard
                {...AI_PROMPTS[2]}
                className="w-48"
                style={{ bottom: '15%', left: '20%', transform: 'rotate(1deg)' }}
              />
            </FeatureCard>

            {/* Card 2: Competitors - frosted glass container */}
            <FeatureCard 
              feature={FEATURES[1]}
              onClick={() => setActiveModal(FEATURES[1])}
            >
              {/* Placeholder: Comparison bars in frosted card */}
              <div className="absolute inset-0 flex items-center justify-center p-6">
                <div className="w-full bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-xl p-5">
                  <div className="space-y-4">
                    {[
                      { label: 'Your Brand', width: '85%', highlight: true },
                      { label: 'Competitor A', width: '62%', highlight: false },
                      { label: 'Competitor B', width: '45%', highlight: false },
                    ].map((bar, i) => (
                      <div key={i} className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className={bar.highlight ? 'text-white/80' : 'text-white/40'}>{bar.label}</span>
                          <span className={bar.highlight ? 'text-cyan-400' : 'text-white/30'}>{bar.width}</span>
                        </div>
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${bar.highlight ? 'bg-gradient-to-r from-cyan-500 to-blue-500' : 'bg-white/10'}`}
                            style={{ width: bar.width }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </FeatureCard>

            {/* Card 3: Optimize - frosted glass container */}
            <FeatureCard 
              feature={FEATURES[2]}
              onClick={() => setActiveModal(FEATURES[2])}
            >
              {/* Placeholder: Task list in frosted card */}
              <div className="absolute inset-0 flex items-center justify-center p-6">
                <div className="w-full bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-xl p-4">
                  <div className="space-y-2">
                    {[
                      { task: 'Add Organization schema', done: true },
                      { task: 'Optimize product descriptions', done: true },
                      { task: 'Update meta descriptions', done: false },
                      { task: 'Add FAQ schema', done: false },
                    ].map((item, i) => (
                      <div 
                        key={i} 
                        className={`flex items-center gap-3 p-2.5 rounded-lg ${
                          item.done 
                            ? 'bg-white/[0.02]' 
                            : 'bg-transparent'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                          item.done 
                            ? 'bg-emerald-500/20 text-emerald-400' 
                            : 'bg-white/5 text-white/30 border border-white/10'
                        }`}>
                          {item.done ? '✓' : ''}
                        </div>
                        <span className={`text-sm ${
                          item.done ? 'text-white/40 line-through' : 'text-white/70'
                        }`}>
                          {item.task}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </FeatureCard>
          </div>
        </div>
      </section>

      {/* Modal */}
      <FeatureModal
        feature={activeModal}
        isOpen={!!activeModal}
        onClose={() => setActiveModal(null)}
      />
    </>
  )
}