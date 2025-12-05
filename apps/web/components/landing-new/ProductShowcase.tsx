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

  const models = [
    { name: 'ChatGPT', color: '#10a37f', logo: '/logos/chatgpt.svg', data: [20, 35, 42, 55, 62, 68] },
    { name: 'Claude', color: '#d4a574', logo: '/logos/claude.svg', data: [15, 28, 38, 45, 58, 65] },
    { name: 'Gemini', color: '#4285f4', logo: '/logos/gemini.svg', data: [10, 22, 30, 38, 48, 55] },
    { name: 'Perplexity', color: '#20b8cd', logo: '/logos/perplexity.svg', data: [8, 18, 25, 35, 42, 50] },
  ]

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']

  // Generate smooth SVG path
  const generatePath = (data: number[], index: number) => {
    const height = 180
    const width = 320
    const paddingX = 0
    const paddingY = 10
    const usableHeight = height - paddingY * 2
    const xStep = width / (data.length - 1)
    
    let path = `M ${paddingX} ${usableHeight - (data[0] / 100) * usableHeight + paddingY}`
    
    data.forEach((point, i) => {
      if (i === 0) return
      const x = paddingX + (i * xStep)
      const y = usableHeight - (point / 100) * usableHeight + paddingY
      const prevX = paddingX + ((i - 1) * xStep)
      const prevY = usableHeight - (data[i - 1] / 100) * usableHeight + paddingY
      const cpX = (prevX + x) / 2
      path += ` C ${cpX} ${prevY}, ${cpX} ${y}, ${x} ${y}`
    })
    
    return path
  }

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
            <div className="bg-[#111]/80 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
              {/* Tab header */}
              <div className="flex gap-6 px-8 pt-6 border-b border-white/10">
                {tabs.map((tab) => (
                  <button 
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`text-sm font-medium pb-4 border-b-2 transition-colors ${
                      activeTab === tab.id 
                        ? 'text-white border-cyan-400' 
                        : 'text-white/40 border-transparent hover:text-white/60'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <div className="p-8">
                {/* VISIBILITY TAB - Multi-line chart per model */}
                {activeTab === 'visibility' && (
                  <div>
                    {/* Legend */}
                    <div className="flex flex-wrap gap-4 mb-6">
                      {models.map((model) => (
                        <div key={model.name} className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: model.color }}
                          />
                          <span className="text-white/60 text-xs">{model.name}</span>
                        </div>
                      ))}
                    </div>

                    {/* Chart */}
                    <div className="relative h-48">
                      {/* Y axis */}
                      <div className="absolute left-0 top-0 bottom-6 w-8 flex flex-col justify-between text-right">
                        {['100%', '50%', '0%'].map((label) => (
                          <span key={label} className="text-white/30 text-xs">{label}</span>
                        ))}
                      </div>
                      
                      {/* Chart area */}
                      <div className="ml-10 h-full">
                        {/* Grid lines */}
                        <div className="absolute left-10 right-0 top-0 bottom-6 flex flex-col justify-between">
                          {[0, 1, 2].map((i) => (
                            <div key={i} className="border-t border-white/5" />
                          ))}
                        </div>
                        
                        {/* SVG Lines */}
                        <svg className="w-full h-[calc(100%-24px)]" viewBox="0 0 320 180" preserveAspectRatio="none">
                          {models.map((model, idx) => (
                            <path
                              key={model.name}
                              d={generatePath(model.data, idx)}
                              fill="none"
                              stroke={model.color}
                              strokeWidth="2"
                              strokeLinecap="round"
                            />
                          ))}
                        </svg>

                        {/* X axis */}
                        <div className="flex justify-between pt-2">
                          {months.map((month) => (
                            <span key={month} className="text-white/30 text-xs">{month}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* SENTIMENT TAB - Sentiment breakdown per model */}
                {activeTab === 'sentiment' && (
                  <div className="space-y-4">
                    {models.map((model) => (
                      <div key={model.name} className="flex items-center gap-4">
                        {/* Model */}
                        <div className="flex items-center gap-2 w-28">
                          <Image src={model.logo} alt={model.name} width={20} height={20} className="w-5 h-5" />
                          <span className="text-white/70 text-sm">{model.name}</span>
                        </div>
                        
                        {/* Sentiment bar */}
                        <div className="flex-1 flex h-6 rounded-lg overflow-hidden bg-white/5">
                          <div 
                            className="bg-emerald-500/80 flex items-center justify-center"
                            style={{ width: `${60 + Math.random() * 20}%` }}
                          >
                            <span className="text-white text-xs font-medium">Positive</span>
                          </div>
                          <div 
                            className="bg-white/20 flex items-center justify-center"
                            style={{ width: `${15 + Math.random() * 10}%` }}
                          >
                            <span className="text-white/60 text-xs">Neutral</span>
                          </div>
                          <div 
                            className="bg-red-500/60 flex items-center justify-center"
                            style={{ width: `${5 + Math.random() * 10}%` }}
                          >
                          </div>
                        </div>
                        
                        {/* Score */}
                        <div className="w-12 text-right">
                          <span className="text-emerald-400 text-sm font-medium">
                            {Math.floor(75 + Math.random() * 20)}%
                          </span>
                        </div>
                      </div>
                    ))}
                    
                    {/* Legend */}
                    <div className="flex items-center gap-6 pt-4 mt-4 border-t border-white/5">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-emerald-500" />
                        <span className="text-white/40 text-xs">Positive</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-white/30" />
                        <span className="text-white/40 text-xs">Neutral</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500/80" />
                        <span className="text-white/40 text-xs">Negative</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* SOURCES TAB - Domain list like Sources page */}
                {activeTab === 'sources' && (
                  <div>
                    {/* Header */}
                    <div className="grid grid-cols-12 gap-4 pb-3 border-b border-white/10 text-xs text-white/40 uppercase tracking-wider">
                      <div className="col-span-1">#</div>
                      <div className="col-span-5">Domain</div>
                      <div className="col-span-3">Type</div>
                      <div className="col-span-3 text-right">Citations</div>
                    </div>
                    
                    {/* Rows */}
                    {[
                      { rank: 1, domain: 'reddit.com', icon: '🔴', type: 'UGC', typeColor: 'bg-orange-500/20 text-orange-400', citations: '32%' },
                      { rank: 2, domain: 'techradar.com', icon: '📡', type: 'Editorial', typeColor: 'bg-blue-500/20 text-blue-400', citations: '28%' },
                      { rank: 3, domain: 'g2.com', icon: '⭐', type: 'Review', typeColor: 'bg-emerald-500/20 text-emerald-400', citations: '24%' },
                      { rank: 4, domain: 'wikipedia.org', icon: '📚', type: 'Reference', typeColor: 'bg-purple-500/20 text-purple-400', citations: '18%' },
                      { rank: 5, domain: 'forbes.com', icon: '📰', type: 'Editorial', typeColor: 'bg-blue-500/20 text-blue-400', citations: '14%' },
                    ].map((source) => (
                      <div key={source.rank} className="grid grid-cols-12 gap-4 py-3 border-b border-white/5 items-center">
                        <div className="col-span-1 text-white/30 text-sm">{source.rank}</div>
                        <div className="col-span-5 flex items-center gap-2">
                          <span className="text-sm">{source.icon}</span>
                          <span className="text-white text-sm">{source.domain}</span>
                        </div>
                        <div className="col-span-3">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${source.typeColor}`}>
                            {source.type}
                          </span>
                        </div>
                        <div className="col-span-3 text-right text-white/60 text-sm">{source.citations}</div>
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