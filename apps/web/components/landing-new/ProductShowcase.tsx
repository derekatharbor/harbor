// components/landing-new/ProductShowcase.tsx
import { ArrowRight, BarChart3, Globe, Shield } from 'lucide-react'
import Link from 'next/link'

export default function ProductShowcase() {
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

          {/* Right - Visual */}
          <div className="relative">
            <div className="bg-[#111]/80 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-2xl">
              {/* Tab header */}
              <div className="flex gap-4 mb-6 border-b border-white/10 pb-4">
                {['Visibility', 'Sentiment', 'Sources'].map((tab, i) => (
                  <button 
                    key={tab}
                    className={`text-sm font-medium pb-2 border-b-2 transition-colors ${
                      i === 0 
                        ? 'text-white border-cyan-400' 
                        : 'text-white/40 border-transparent hover:text-white/60'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Chart area */}
              <div className="h-64 relative">
                {/* Y axis */}
                <div className="absolute left-0 top-0 bottom-8 w-12 flex flex-col justify-between text-right">
                  {['100%', '75%', '50%', '25%', '0%'].map((label) => (
                    <span key={label} className="text-white/30 text-xs">{label}</span>
                  ))}
                </div>
                
                {/* Chart */}
                <div className="ml-14 h-full relative">
                  {/* Grid lines */}
                  <div className="absolute inset-0 flex flex-col justify-between">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <div key={i} className="border-t border-white/5" />
                    ))}
                  </div>
                  
                  {/* Lines */}
                  <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#22d3ee" />
                        <stop offset="100%" stopColor="#3b82f6" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M0,180 Q50,160 100,140 T200,100 T300,80 T400,60"
                      fill="none"
                      stroke="url(#lineGradient)"
                      strokeWidth="2"
                    />
                  </svg>
                </div>

                {/* X axis */}
                <div className="ml-14 flex justify-between mt-2">
                  {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month) => (
                    <span key={month} className="text-white/30 text-xs">{month}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
