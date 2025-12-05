// components/landing-new/ProductShowcase.tsx
'use client'

import { useState } from 'react'
import { ArrowRight, BarChart3, Globe, Shield } from 'lucide-react'
import Link from 'next/link'

type TabType = 'visibility' | 'sentiment' | 'sources'

export default function ProductShowcase() {
  const [activeTab, setActiveTab] = useState<TabType>('visibility')
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null)

  const tabs: { id: TabType; label: string }[] = [
    { id: 'visibility', label: 'Visibility' },
    { id: 'sentiment', label: 'Sentiment' },
    { id: 'sources', label: 'Sources' },
  ]

  // Data for each tab
  const chartData = {
    visibility: {
      points: [25, 32, 45, 52, 68, 75],
      color: 'from-cyan-500 to-blue-500',
      strokeColor: '#22d3ee',
      label: 'Visibility Score',
      suffix: '%'
    },
    sentiment: {
      points: [72, 75, 71, 82, 88, 91],
      color: 'from-emerald-500 to-green-500',
      strokeColor: '#10b981',
      label: 'Positive Sentiment',
      suffix: '%'
    },
    sources: {
      points: [12, 18, 24, 31, 38, 42],
      color: 'from-purple-500 to-violet-500',
      strokeColor: '#a855f7',
      label: 'Citing Sources',
      suffix: ''
    },
  }

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
  const currentData = chartData[activeTab]

  // Generate SVG path from points
  const generatePath = (points: number[]) => {
    const height = 200
    const width = 400
    const padding = 40
    const usableWidth = width - (padding * 2)
    const usableHeight = height - 40
    
    const xStep = usableWidth / (points.length - 1)
    
    let path = `M ${padding} ${usableHeight - (points[0] / 100) * usableHeight + 20}`
    
    points.forEach((point, i) => {
      if (i === 0) return
      const x = padding + (i * xStep)
      const y = usableHeight - (point / 100) * usableHeight + 20
      const prevX = padding + ((i - 1) * xStep)
      const prevY = usableHeight - (points[i - 1] / 100) * usableHeight + 20
      
      // Smooth curve
      const cpX = (prevX + x) / 2
      path += ` C ${cpX} ${prevY}, ${cpX} ${y}, ${x} ${y}`
    })
    
    return path
  }

  // Get point position for tooltip
  const getPointPosition = (index: number, points: number[]) => {
    const width = 400
    const height = 200
    const padding = 40
    const usableWidth = width - (padding * 2)
    const usableHeight = height - 40
    
    const xStep = usableWidth / (points.length - 1)
    const x = padding + (index * xStep)
    const y = usableHeight - (points[index] / 100) * usableHeight + 20
    
    return { x, y }
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

          {/* Right - Interactive Chart */}
          <div className="relative">
            <div className="bg-[#111]/80 backdrop-blur-xl rounded-2xl border border-white/10 p-8 shadow-2xl">
              {/* Tab header */}
              <div className="flex gap-6 mb-8 border-b border-white/10 pb-4">
                {tabs.map((tab) => (
                  <button 
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`text-sm font-medium pb-2 border-b-2 transition-colors ${
                      activeTab === tab.id 
                        ? 'text-white border-cyan-400' 
                        : 'text-white/40 border-transparent hover:text-white/60'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Chart area */}
              <div className="relative h-64">
                {/* Y axis */}
                <div className="absolute left-0 top-0 bottom-8 w-12 flex flex-col justify-between text-right pr-4">
                  {['100%', '75%', '50%', '25%', '0%'].map((label) => (
                    <span key={label} className="text-white/30 text-xs">{label}</span>
                  ))}
                </div>
                
                {/* Chart */}
                <div className="ml-14 mr-4 h-full relative">
                  {/* Grid lines */}
                  <div className="absolute inset-0 flex flex-col justify-between pb-8">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <div key={i} className="border-t border-white/5" />
                    ))}
                  </div>
                  
                  {/* SVG Chart */}
                  <svg 
                    className="absolute inset-0 w-full h-full" 
                    viewBox="0 0 400 200" 
                    preserveAspectRatio="none"
                  >
                    <defs>
                      <linearGradient id={`lineGradient-${activeTab}`} x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor={currentData.strokeColor} />
                        <stop offset="100%" stopColor={currentData.strokeColor} stopOpacity="0.6" />
                      </linearGradient>
                      <linearGradient id={`areaGradient-${activeTab}`} x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor={currentData.strokeColor} stopOpacity="0.2" />
                        <stop offset="100%" stopColor={currentData.strokeColor} stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    
                    {/* Area fill */}
                    <path
                      d={`${generatePath(currentData.points)} L 360 180 L 40 180 Z`}
                      fill={`url(#areaGradient-${activeTab})`}
                    />
                    
                    {/* Line */}
                    <path
                      d={generatePath(currentData.points)}
                      fill="none"
                      stroke={`url(#lineGradient-${activeTab})`}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    
                    {/* Interactive points */}
                    {currentData.points.map((point, i) => {
                      const pos = getPointPosition(i, currentData.points)
                      return (
                        <g key={i}>
                          {/* Hover area */}
                          <circle
                            cx={pos.x}
                            cy={pos.y}
                            r="20"
                            fill="transparent"
                            className="cursor-pointer"
                            onMouseEnter={() => setHoveredPoint(i)}
                            onMouseLeave={() => setHoveredPoint(null)}
                          />
                          {/* Visible point */}
                          <circle
                            cx={pos.x}
                            cy={pos.y}
                            r={hoveredPoint === i ? 6 : 4}
                            fill={currentData.strokeColor}
                            className="transition-all duration-150"
                          />
                          {hoveredPoint === i && (
                            <circle
                              cx={pos.x}
                              cy={pos.y}
                              r="10"
                              fill={currentData.strokeColor}
                              fillOpacity="0.2"
                            />
                          )}
                        </g>
                      )
                    })}
                  </svg>

                  {/* Tooltip */}
                  {hoveredPoint !== null && (
                    <div 
                      className="absolute z-10 bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 shadow-xl pointer-events-none transform -translate-x-1/2 -translate-y-full"
                      style={{
                        left: `${((hoveredPoint / (currentData.points.length - 1)) * 100)}%`,
                        top: `${100 - currentData.points[hoveredPoint] - 15}%`,
                        marginLeft: '28px'
                      }}
                    >
                      <div className="text-white/50 text-xs mb-0.5">{months[hoveredPoint]} 2025</div>
                      <div className="text-white font-semibold text-sm">
                        {currentData.points[hoveredPoint]}{currentData.suffix}
                      </div>
                      <div className="text-white/40 text-xs">{currentData.label}</div>
                    </div>
                  )}

                  {/* X axis */}
                  <div className="absolute bottom-0 left-0 right-0 flex justify-between pt-3">
                    {months.map((month) => (
                      <span key={month} className="text-white/30 text-xs">{month}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}