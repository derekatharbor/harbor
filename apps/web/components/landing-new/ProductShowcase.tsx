// components/landing-new/ProductShowcase.tsx
'use client'

import { useState } from 'react'
import { ArrowRight, BarChart3, Globe, Shield } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

type TabType = 'visibility' | 'sentiment' | 'sources'

export default function ProductShowcase() {
  const [activeTab, setActiveTab] = useState<TabType>('visibility')

  const tabs: { id: TabType; label: string }[] = [
    { id: 'visibility', label: 'Visibility' },
    { id: 'sentiment', label: 'Sentiment' },
    { id: 'sources', label: 'Sources' },
  ]

  return (
    <section className="relative py-24 bg-[#0a0a0a] overflow-hidden">
      {/* Gradient accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 blur-[100px] pointer-events-none" />
      
      <div className="relative max-w-6xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left - Content */}
          <div>
            <div className="text-cyan-400 text-sm font-medium mb-4 uppercase tracking-wider">
              Deep Analytics
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6 leading-tight">
              Understand exactly how AI sees your brand
            </h2>
            <p className="text-white/50 text-lg mb-8 leading-relaxed">
              Go beyond surface-level metrics. See the exact prompts where you appear, 
              track sentiment over time, and understand which sources AI models cite about you.
            </p>

            <div className="space-y-4">
              {[
                { icon: BarChart3, label: 'Visibility trends across all major AI models' },
                { icon: Globe, label: 'Source citation analysis and authority signals' },
                { icon: Shield, label: 'Sentiment tracking and reputation monitoring' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                    <item.icon className="w-4 h-4 text-cyan-400" />
                  </div>
                  <span className="text-white/70 text-sm">{item.label}</span>
                </div>
              ))}
            </div>

            <Link 
              href="/signup" 
              className="inline-flex items-center gap-2 mt-8 px-6 py-3 bg-white text-black font-semibold rounded-lg hover:bg-white/90 transition-colors"
            >
              Start tracking
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Right - Dashboard Preview */}
          <div className="relative">
            <div className="bg-white/[0.02] backdrop-blur-xl rounded-2xl border border-white/[0.08] shadow-2xl overflow-hidden">
              {/* Tab header */}
              <div className="flex gap-6 px-8 pt-6 border-b border-white/[0.06]">
                {tabs.map((tab) => (
                  <button 
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`text-sm font-medium pb-4 border-b-2 transition-colors ${
                      activeTab === tab.id 
                        ? 'text-white border-white/40' 
                        : 'text-white/30 border-transparent hover:text-white/50'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <div className="p-8">
                {/* VISIBILITY TAB - Multi-line chart like Linear's Cycle chart */}
                {activeTab === 'visibility' && (
                  <div>
                    {/* Legend */}
                    <div className="flex flex-wrap gap-6 mb-8">
                      {[
                        { name: 'ChatGPT', color: '#6b7280' },
                        { name: 'Claude', color: '#d97706' },
                        { name: 'Gemini', color: '#6366f1' },
                        { name: 'Perplexity', color: '#6366f1', dashed: true },
                      ].map((item) => (
                        <div key={item.name} className="flex items-center gap-2">
                          <div 
                            className={`w-3 h-3 rounded-sm ${item.dashed ? 'border-2 border-dashed' : ''}`}
                            style={{ 
                              backgroundColor: item.dashed ? 'transparent' : item.color,
                              borderColor: item.dashed ? item.color : 'transparent'
                            }}
                          />
                          <span className="text-white/40 text-sm">{item.name}</span>
                        </div>
                      ))}
                    </div>

                    {/* Chart */}
                    <div className="relative h-52">
                      {/* SVG Lines */}
                      <svg className="w-full h-full" viewBox="0 0 400 180" preserveAspectRatio="none">
                        {/* ChatGPT - gray, top line */}
                        <path
                          d="M 0 140 C 30 138, 50 130, 80 125 C 110 120, 140 118, 180 100 C 220 82, 260 75, 300 60 C 340 45, 370 38, 400 30"
                          fill="none"
                          stroke="#6b7280"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                        {/* Claude - amber/gold, middle line */}
                        <path
                          d="M 0 165 C 40 160, 70 155, 100 145 C 140 132, 180 125, 220 110 C 260 95, 300 85, 340 70 C 370 60, 390 55, 400 50"
                          fill="none"
                          stroke="#d97706"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                        {/* Gemini - indigo, solid bottom line */}
                        <path
                          d="M 0 175 C 50 172, 80 168, 120 158 C 160 148, 200 140, 240 125 C 280 110, 320 100, 360 85 C 380 78, 395 72, 400 68"
                          fill="none"
                          stroke="#6366f1"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                        {/* Perplexity - indigo dashed, projection line */}
                        <path
                          d="M 200 140 C 240 128, 280 115, 320 98 C 360 81, 390 68, 400 60"
                          fill="none"
                          stroke="#6366f1"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeDasharray="6 6"
                        />
                      </svg>

                      {/* X axis labels */}
                      <div className="absolute bottom-0 left-0 right-0 flex justify-between text-white/20 text-xs">
                        <span>Jan</span>
                        <span>Feb</span>
                        <span>Mar</span>
                        <span>Apr</span>
                        <span>May</span>
                        <span>Jun</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* SENTIMENT TAB - Descriptor pills like brand visibility page */}
                {activeTab === 'sentiment' && (
                  <div className="space-y-6">
                    {[
                      { 
                        name: 'ChatGPT', 
                        logo: '/logos/chatgpt.svg', 
                        descriptors: [
                          { text: 'Innovative', sentiment: 'positive' },
                          { text: 'Reliable', sentiment: 'positive' },
                          { text: 'Enterprise-ready', sentiment: 'positive' },
                          { text: 'Complex', sentiment: 'neutral' },
                        ]
                      },
                      { 
                        name: 'Claude', 
                        logo: '/logos/claude.svg', 
                        descriptors: [
                          { text: 'Trusted', sentiment: 'positive' },
                          { text: 'Scalable', sentiment: 'positive' },
                          { text: 'Established', sentiment: 'neutral' },
                        ]
                      },
                      { 
                        name: 'Gemini', 
                        logo: '/logos/gemini.svg', 
                        descriptors: [
                          { text: 'Fast', sentiment: 'positive' },
                          { text: 'Modern', sentiment: 'positive' },
                          { text: 'Growing', sentiment: 'positive' },
                          { text: 'Expensive', sentiment: 'negative' },
                        ]
                      },
                      { 
                        name: 'Perplexity', 
                        logo: '/logos/perplexity.svg', 
                        descriptors: [
                          { text: 'User-friendly', sentiment: 'positive' },
                          { text: 'Affordable', sentiment: 'positive' },
                          { text: 'Limited integrations', sentiment: 'negative' },
                        ]
                      },
                    ].map((model) => (
                      <div key={model.name} className="flex items-start gap-4">
                        {/* Model */}
                        <div className="flex items-center gap-2 w-28 flex-shrink-0 pt-1">
                          <Image src={model.logo} alt={model.name} width={18} height={18} className="w-[18px] h-[18px] opacity-70" />
                          <span className="text-white/60 text-sm">{model.name}</span>
                        </div>
                        
                        {/* Descriptor pills */}
                        <div className="flex flex-wrap gap-2">
                          {model.descriptors.map((desc, idx) => (
                            <span
                              key={idx}
                              className={`px-3 py-1 rounded-full border text-xs font-medium ${
                                desc.sentiment === 'positive' 
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                  : desc.sentiment === 'negative'
                                  ? 'bg-red-500/10 text-red-400 border-red-500/20'
                                  : 'bg-white/[0.03] text-white/50 border-white/10'
                              }`}
                            >
                              {desc.text}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* SOURCES TAB - Domain list with Brandfetch logos */}
                {activeTab === 'sources' && (
                  <div>
                    {/* Header */}
                    <div className="grid grid-cols-12 gap-4 pb-3 border-b border-white/[0.06] text-xs text-white/30 uppercase tracking-wider">
                      <div className="col-span-1">#</div>
                      <div className="col-span-5">Domain</div>
                      <div className="col-span-3">Type</div>
                      <div className="col-span-3 text-right">Citations</div>
                    </div>
                    
                    {/* Rows */}
                    {[
                      { rank: 1, domain: 'reddit.com', type: 'UGC', typeColor: 'bg-orange-500/10 text-orange-400/80 border border-orange-500/20', citations: '32%' },
                      { rank: 2, domain: 'techradar.com', type: 'Editorial', typeColor: 'bg-blue-500/10 text-blue-400/80 border border-blue-500/20', citations: '28%' },
                      { rank: 3, domain: 'g2.com', type: 'Review', typeColor: 'bg-emerald-500/10 text-emerald-400/80 border border-emerald-500/20', citations: '24%' },
                      { rank: 4, domain: 'wikipedia.org', type: 'Reference', typeColor: 'bg-purple-500/10 text-purple-400/80 border border-purple-500/20', citations: '18%' },
                      { rank: 5, domain: 'forbes.com', type: 'Editorial', typeColor: 'bg-blue-500/10 text-blue-400/80 border border-blue-500/20', citations: '14%' },
                    ].map((source) => (
                      <div key={source.rank} className="grid grid-cols-12 gap-4 py-3.5 border-b border-white/[0.04] items-center">
                        <div className="col-span-1 text-white/20 text-sm">{source.rank}</div>
                        <div className="col-span-5 flex items-center gap-3">
                          <img 
                            src={`https://cdn.brandfetch.io/${source.domain}?c=1id1Fyz-h7an5-5KR_y`}
                            alt=""
                            className="w-5 h-5 rounded"
                          />
                          <span className="text-white/70 text-sm">{source.domain}</span>
                        </div>
                        <div className="col-span-3">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${source.typeColor}`}>
                            {source.type}
                          </span>
                        </div>
                        <div className="col-span-3 text-right text-white/40 text-sm">{source.citations}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}