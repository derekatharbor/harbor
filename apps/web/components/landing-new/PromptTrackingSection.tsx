// components/landing-new/PromptTrackingSection.tsx
'use client'

import { RefreshCw, Upload, MapPin, TrendingUp, Tag, BarChart3, Globe } from 'lucide-react'
import Image from 'next/image'

// AI Model logos for Mentions column
const AI_MODELS = [
  { name: 'ChatGPT', logo: '/logos/chatgpt.svg' },
  { name: 'Claude', logo: '/logos/claude.svg' },
  { name: 'Gemini', logo: '/logos/gemini.svg' },
  { name: 'Perplexity', logo: '/logos/perplexity.svg' },
]

export default function PromptTrackingSection() {
  return (
    <section className="relative py-32 bg-[#0a0a0a] overflow-hidden">
      {/* Subtle gradient */}
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-purple-500/10 to-transparent blur-[120px] pointer-events-none" />
      
      <div className="relative max-w-6xl mx-auto px-6">
        {/* Header - Two column like Peec */}
        <div className="grid lg:grid-cols-2 gap-12 mb-20">
          <h2 className="text-4xl sm:text-5xl font-bold text-white leading-tight">
            Turn AI search insights into new customers with Harbor
          </h2>
          <div className="flex items-start lg:pl-8 lg:border-l lg:border-white/10">
            <p className="text-white/50 text-lg leading-relaxed lg:pt-2">
              Identify the prompts that matter, monitor your rankings, and act before your competitors do.
            </p>
          </div>
        </div>

        {/* Two cards */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Card - Set up Prompts */}
          <div className="bg-white/[0.02] backdrop-blur-xl rounded-2xl border border-white/[0.08] p-6 lg:p-8">
            <h3 className="text-xl font-semibold text-white mb-3">Set up Prompts</h3>
            <p className="text-white/40 text-sm mb-6 leading-relaxed max-w-md">
              Prompts are the foundation of your AI search strategy. Uncover and organize the prompts that matter most for your AI search strategy.
            </p>

            {/* Mock table */}
            <div className="bg-white/[0.02] rounded-xl border border-white/[0.06] overflow-hidden mb-5">
              {/* Table header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
                <div className="flex items-center gap-2 text-white/60 text-sm">
                  <RefreshCw className="w-4 h-4" />
                  <span>Tracked Prompts</span>
                </div>
                <div className="flex items-center gap-3">
                  <button className="text-white/40 text-xs hover:text-white/60 transition-colors hidden sm:block">Add Prompt Manually</button>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 rounded-lg text-white/70 text-xs">
                    <Upload className="w-3 h-3" />
                    Bulk Import CSV
                  </button>
                </div>
              </div>

              {/* Column headers */}
              <div className="grid grid-cols-12 gap-2 px-4 py-2.5 text-[10px] text-white/30 uppercase tracking-wider border-b border-white/[0.04]">
                <div className="col-span-5">Prompt</div>
                <div className="col-span-2">Visibility</div>
                <div className="col-span-2">Mentions</div>
                <div className="col-span-1">Created</div>
                <div className="col-span-2">Tags</div>
              </div>

              {/* Rows - Mentions now show AI model logos */}
              {[
                { prompt: 'Best AI-native CRM 2025', visibility: '84%', models: [0, 1, 2], created: '1d ago', tag: 'Corporate' },
                { prompt: 'CRM software with advanced workflow automation', visibility: '78%', models: [0, 2, 3], created: '1d ago', tag: 'Corporate' },
                { prompt: 'Top-rated CRM platforms with analytics', visibility: '71%', models: [1, 3], created: '2d ago', tag: 'Corporate' },
              ].map((row, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 px-4 py-3 items-center border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors">
                  <div className="col-span-5 text-white/70 text-sm truncate">{row.prompt}</div>
                  <div className="col-span-2 text-white/60 text-sm">{row.visibility}</div>
                  <div className="col-span-2 flex items-center">
                    <div className="flex -space-x-1">
                      {row.models.map((modelIdx) => (
                        <div 
                          key={modelIdx} 
                          className="w-5 h-5 rounded-full bg-white/10 border border-[#0a0a0a] flex items-center justify-center overflow-hidden"
                        >
                          <Image 
                            src={AI_MODELS[modelIdx].logo}
                            alt={AI_MODELS[modelIdx].name}
                            width={14}
                            height={14}
                            className="w-3.5 h-3.5 object-contain"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="col-span-1 text-white/40 text-xs">{row.created}</div>
                  <div className="col-span-2">
                    <span className="px-2 py-1 bg-blue-500/10 text-blue-400/80 text-xs rounded border border-blue-500/20">{row.tag}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Floating detail card - more breathing room */}
            <div className="bg-white/[0.03] backdrop-blur-xl rounded-xl border border-white/[0.08] p-5 shadow-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white text-sm font-medium">What are the best CRMs for fast growing companies?</span>
                <div className="w-6 h-6 rounded bg-white/5 flex items-center justify-center flex-shrink-0 ml-3">
                  <span className="text-white/30 text-xs">−</span>
                </div>
              </div>
              <div className="text-white/40 text-xs mb-5">2 Unique Tags · US IP address · Rising Position · Positive Sentiment</div>
              
              {/* 3 column grid with more padding and better proportions */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white/[0.02] rounded-lg p-4 border border-white/[0.06]">
                  <div className="flex items-center gap-1.5 text-white/50 text-xs mb-2">
                    <Tag className="w-3 h-3" />
                    <span>Tags</span>
                  </div>
                  <div className="text-white/30 text-[11px] mb-3 leading-relaxed">Choose which tags are important.</div>
                  <div className="flex flex-col gap-1.5">
                    <span className="px-2 py-1.5 bg-orange-500/20 text-orange-400 text-xs rounded inline-block w-fit">Problem-aware</span>
                    <span className="text-white/40 text-xs">Mid-market</span>
                  </div>
                </div>
                <div className="bg-white/[0.02] rounded-lg p-4 border border-white/[0.06]">
                  <div className="flex items-center gap-1.5 text-white/50 text-xs mb-2">
                    <Globe className="w-3 h-3" />
                    <span>Location</span>
                  </div>
                  <div className="text-white/30 text-[11px] mb-3 leading-relaxed">Set your prompt IP address.</div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white/70 text-sm font-medium">US</span>
                  </div>
                  <span className="text-cyan-400 text-xs cursor-pointer hover:text-cyan-300">Edit Location</span>
                </div>
                <div className="bg-white/[0.02] rounded-lg p-4 border border-white/[0.06]">
                  <div className="flex items-center gap-1.5 text-white/50 text-xs mb-2">
                    <BarChart3 className="w-3 h-3" />
                    <span>Estimated Volume</span>
                  </div>
                  <div className="text-white/30 text-[11px] mb-3 leading-relaxed">See demand trends for this prompt.</div>
                  <div className="flex flex-col gap-1">
                    <span className="text-white/50 text-xs">Median Volume</span>
                    <span className="flex items-center gap-1 text-emerald-400 text-xs">
                      <TrendingUp className="w-3 h-3" />
                      Rising 7d
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Card - Use Data to Pick Winners */}
          <div className="bg-white/[0.02] backdrop-blur-xl rounded-2xl border border-white/[0.08] p-6 lg:p-8 relative">
            <h3 className="text-xl font-semibold text-white mb-3">Use Data to Pick Winners</h3>
            <p className="text-white/40 text-sm mb-6 leading-relaxed max-w-md">
              Leverage AI-suggested prompts and search volumes to focus on the biggest opportunities.
            </p>

            {/* Tilted suggested prompts - tilted BACK like index */}
            <div className="relative" style={{ perspective: '1500px' }}>
              <div 
                style={{ 
                  transform: 'rotateX(12deg)',
                  transformOrigin: 'center top'
                }}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-2 px-1">
                  <div className="flex items-center gap-2">
                    <span className="text-white/60 text-sm font-medium">Suggested Prompts</span>
                    <span className="text-white/30 text-xs">(14)</span>
                  </div>
                </div>
                <div className="text-white/30 text-xs mb-4 px-1">Based on what users are actually asking</div>

                {/* Stacked prompt cards */}
                <div className="space-y-3">
                  {[
                    { 
                      prompt: 'Best CRM software with intuitive user interfaces and customizable workflows', 
                      tags: ['Auto-generated Tags', 'Feature-aware'],
                      volume: 'High Volume',
                      volumeColor: 'text-rose-400 bg-rose-500/10 border-rose-500/20'
                    },
                    { 
                      prompt: 'What are top CRM systems that provide data-driven insights and automation?', 
                      tags: ['Solution Aware'],
                      volume: 'Estimated Volume',
                      volumeColor: 'text-white/40 bg-white/5 border-white/10'
                    },
                    { 
                      prompt: 'CRM platforms with advanced analytics and reporting capabilities', 
                      tags: ['Auto-generated'],
                      volume: 'Medium Volume',
                      volumeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                    },
                  ].map((card, idx) => (
                    <div 
                      key={idx}
                      className="bg-white/[0.03] backdrop-blur-xl rounded-xl border border-white/[0.08] p-4 shadow-lg"
                    >
                      <div className="text-white/80 text-sm mb-3 leading-relaxed">{card.prompt}</div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {card.tags.map((tag, i) => (
                          <span key={i} className="px-2 py-1 bg-purple-500/10 text-purple-400/80 text-xs rounded border border-purple-500/20">{tag}</span>
                        ))}
                        <span className={`px-2 py-1 text-xs rounded border ${card.volumeColor}`}>{card.volume}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fade overlay - taller and starts from card background color */}
              <div 
                className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none z-10"
                style={{
                  background: 'linear-gradient(to top, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.02) 20%, transparent 100%)'
                }}
              />
            </div>
            
            {/* Additional fade that matches card bg to page bg */}
            <div 
              className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none rounded-b-2xl"
              style={{
                background: 'linear-gradient(to top, #0a0a0a 0%, transparent 100%)'
              }}
            />
          </div>
        </div>
      </div>
    </section>
  )
}