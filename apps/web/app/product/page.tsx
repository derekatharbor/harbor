// app/product/page.tsx
import Nav from '@/components/landing-new/Nav'
import Footer from '@/components/landing-new/Footer'
import Link from 'next/link'
import { ArrowRight, Eye, TrendingUp, MessageSquare, Sparkles } from 'lucide-react'

export const metadata = {
  title: 'Brand Visibility | Harbor',
  description: 'Track how AI models describe your brand. See mentions, sentiment, and descriptors across ChatGPT, Claude, Gemini, and Perplexity.',
}

// Mock dashboard visualization
function DashboardMock() {
  const descriptors = [
    { word: 'innovative', sentiment: 'positive' },
    { word: 'reliable', sentiment: 'positive' },
    { word: 'enterprise', sentiment: 'neutral' },
    { word: 'expensive', sentiment: 'negative' },
    { word: 'scalable', sentiment: 'positive' },
    { word: 'complex', sentiment: 'neutral' },
    { word: 'leader', sentiment: 'positive' },
    { word: 'secure', sentiment: 'positive' },
  ]

  const models = [
    { name: 'ChatGPT', mentions: 847, color: '#10B981' },
    { name: 'Claude', mentions: 623, color: '#8B5CF6' },
    { name: 'Perplexity', mentions: 412, color: '#3B82F6' },
    { name: 'Gemini', mentions: 289, color: '#F59E0B' },
  ]

  return (
    <div className="relative w-full max-w-5xl mx-auto">
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-emerald-500/20 blur-3xl opacity-30" />
      
      {/* Dashboard frame */}
      <div className="relative bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        {/* Window controls */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-white/[0.02]">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-white/10" />
            <div className="w-3 h-3 rounded-full bg-white/10" />
            <div className="w-3 h-3 rounded-full bg-white/10" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="px-4 py-1 bg-white/5 rounded-lg text-xs text-white/40">harbor.app/dashboard/brand</div>
          </div>
        </div>

        {/* Dashboard content */}
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">A</div>
              <span className="font-semibold text-white">Acme Corp</span>
            </div>
            <div className="text-xs text-white/40">Last 7 days</div>
          </div>

          {/* Metric cards */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'Visibility Index', value: '78.4%', delta: '+4.2%', positive: true },
              { label: 'Total Mentions', value: '2,171', delta: '+156', positive: true },
              { label: 'Sentiment', value: '72%', delta: '+2%', positive: true },
              { label: 'Descriptors', value: '24', delta: '', positive: true },
            ].map((metric, i) => (
              <div key={i} className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
                <div className="text-xs text-white/40 mb-2">{metric.label}</div>
                <div className="flex items-end justify-between">
                  <span className="text-2xl font-bold text-white">{metric.value}</span>
                  {metric.delta && (
                    <span className={`text-xs ${metric.positive ? 'text-emerald-400' : 'text-red-400'}`}>
                      {metric.delta}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Two column layout */}
          <div className="grid grid-cols-5 gap-6">
            {/* Descriptors - 3 cols */}
            <div className="col-span-3 bg-white/[0.03] border border-white/5 rounded-xl p-4">
              <div className="text-sm font-medium text-white mb-3">Brand Descriptors</div>
              <div className="flex flex-wrap gap-2">
                {descriptors.map((desc, i) => (
                  <span
                    key={i}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                      desc.sentiment === 'positive' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      desc.sentiment === 'negative' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                      'bg-white/5 text-white/60 border border-white/10'
                    }`}
                  >
                    {desc.word}
                  </span>
                ))}
              </div>
            </div>

            {/* Sentiment donut - 2 cols */}
            <div className="col-span-2 bg-white/[0.03] border border-white/5 rounded-xl p-4">
              <div className="text-sm font-medium text-white mb-3">Sentiment</div>
              <div className="flex items-center gap-4">
                <div className="relative w-20 h-20">
                  <svg viewBox="0 0 36 36" className="w-20 h-20 -rotate-90">
                    <circle cx="18" cy="18" r="14" fill="none" stroke="#27272a" strokeWidth="4" />
                    <circle cx="18" cy="18" r="14" fill="none" stroke="#22C55E" strokeWidth="4" strokeDasharray="62 100" />
                    <circle cx="18" cy="18" r="14" fill="none" stroke="#71717A" strokeWidth="4" strokeDasharray="18 100" strokeDashoffset="-62" />
                    <circle cx="18" cy="18" r="14" fill="none" stroke="#EF4444" strokeWidth="4" strokeDasharray="10 100" strokeDashoffset="-80" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold text-white">72%</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-white/60">Positive</span>
                    <span className="text-white ml-auto">62%</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-2 h-2 rounded-full bg-zinc-500" />
                    <span className="text-white/60">Neutral</span>
                    <span className="text-white ml-auto">28%</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <span className="text-white/60">Negative</span>
                    <span className="text-white ml-auto">10%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Model breakdown */}
          <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
            <div className="text-sm font-medium text-white mb-4">Mentions by Model</div>
            <div className="space-y-3">
              {models.map((model, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-20 text-xs text-white/60">{model.name}</div>
                  <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all"
                      style={{ width: `${(model.mentions / 847) * 100}%`, backgroundColor: model.color }}
                    />
                  </div>
                  <div className="w-12 text-right text-xs text-white">{model.mentions}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function FeatureCard({ icon: Icon, title, description }: { icon: any, title: string, description: string }) {
  return (
    <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors">
      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-4">
        <Icon className="w-5 h-5 text-white/70" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-white/50 text-sm leading-relaxed">{description}</p>
    </div>
  )
}

export default function BrandVisibilityPage() {
  return (
    <main className="bg-[#0a0a0a] min-h-screen">
      <Nav />
      
      {/* Hero */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white/60 mb-6">
            <Eye className="w-3.5 h-3.5" />
            Brand Visibility
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            See how AI describes<br />your brand
          </h1>
          
          <p className="text-lg text-white/50 max-w-2xl mx-auto mb-8">
            Track mentions, sentiment, and descriptors across ChatGPT, Claude, Gemini, and Perplexity. 
            Understand your AI presence before your competitors do.
          </p>
          
          <div className="flex items-center justify-center gap-4">
            <Link 
              href="/auth/signup" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-semibold rounded-lg hover:bg-white/90 transition-colors"
            >
              Start tracking
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link 
              href="/brands" 
              className="inline-flex items-center gap-2 px-6 py-3 text-white/70 hover:text-white font-medium transition-colors"
            >
              Browse the index
            </Link>
          </div>
        </div>
      </section>

      {/* Dashboard visualization */}
      <section className="pb-24 px-6">
        <DashboardMock />
      </section>

      {/* Features */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">
              Everything you need to understand your AI presence
            </h2>
            <p className="text-white/50 max-w-2xl mx-auto">
              Get a complete picture of how AI models perceive your brand with real-time tracking and analysis.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              icon={Eye}
              title="Visibility Index"
              description="A single score that shows your overall AI presence across all major models."
            />
            <FeatureCard
              icon={TrendingUp}
              title="Trend Tracking"
              description="Watch how your visibility changes over time with weekly snapshots and deltas."
            />
            <FeatureCard
              icon={MessageSquare}
              title="Mention Analysis"
              description="See exactly when and how often AI mentions your brand in responses."
            />
            <FeatureCard
              icon={Sparkles}
              title="Descriptor Cloud"
              description="Discover the words AI uses to describe your brand, categorized by sentiment."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to see your AI visibility?
          </h2>
          <p className="text-white/50 mb-8">
            Join thousands of brands tracking their AI presence with Harbor.
          </p>
          <Link 
            href="/auth/signup" 
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black font-semibold rounded-lg hover:bg-white/90 transition-colors"
          >
            Get started free
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  )
}
