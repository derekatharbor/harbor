// app/product/sources/page.tsx
import Nav from '@/components/landing-new/Nav'
import Footer from '@/components/landing-new/Footer'
import Link from 'next/link'
import { ArrowRight, Globe, Link2, Search, Filter } from 'lucide-react'

export const metadata = {
  title: 'Citation Sources | Harbor',
  description: 'Discover which websites AI models cite when answering questions about your industry. Find untapped opportunities.',
}

// Mock dashboard visualization
function DashboardMock() {
  const sources = [
    { domain: 'techcrunch.com', type: 'Editorial', used: '24%', avg: '3.2', favicon: '📰' },
    { domain: 'g2.com', type: 'Review', used: '18%', avg: '2.8', favicon: '⭐' },
    { domain: 'forbes.com', type: 'Editorial', used: '15%', avg: '2.1', favicon: '📊' },
    { domain: 'capterra.com', type: 'Review', used: '12%', avg: '4.1', favicon: '🔍' },
    { domain: 'wikipedia.org', type: 'Reference', used: '9%', avg: '1.8', favicon: '📚' },
  ]

  const types = [
    { name: 'Editorial', count: 847, color: '#3B82F6', pct: 38 },
    { name: 'Review', count: 523, color: '#A855F7', pct: 24 },
    { name: 'Corporate', count: 412, color: '#F97316', pct: 19 },
    { name: 'Reference', count: 289, color: '#EC4899', pct: 13 },
    { name: 'UGC', count: 134, color: '#06B6D4', pct: 6 },
  ]

  return (
    <div className="relative w-full max-w-5xl mx-auto">
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 blur-3xl opacity-30" />
      
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
            <div className="px-4 py-1 bg-white/5 rounded-lg text-xs text-white/40">harbor.app/dashboard/sources</div>
          </div>
        </div>

        {/* Dashboard content */}
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-white">Citation Sources</h2>
              <span className="text-xs text-white/40 px-2 py-0.5 bg-white/5 rounded">2,205 sources tracked</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="px-3 py-1.5 bg-white/5 rounded-lg text-xs text-white/60 flex items-center gap-2">
                <Search className="w-3.5 h-3.5" />
                Search
              </div>
              <div className="px-3 py-1.5 bg-white/5 rounded-lg text-xs text-white/60 flex items-center gap-2">
                <Filter className="w-3.5 h-3.5" />
                Filter
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
              <div className="text-xs text-white/40 mb-1">Total Citations</div>
              <div className="text-2xl font-bold text-white">12,847</div>
            </div>
            <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
              <div className="text-xs text-white/40 mb-1">Unique Domains</div>
              <div className="text-2xl font-bold text-white">2,205</div>
            </div>
            <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
              <div className="text-xs text-white/40 mb-1">Gap Opportunities</div>
              <div className="text-2xl font-bold text-emerald-400">47</div>
            </div>
          </div>

          {/* Two column layout */}
          <div className="grid grid-cols-3 gap-6">
            {/* Domain Type Chart */}
            <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
              <div className="text-sm font-medium text-white mb-4">Domain Types</div>
              <div className="flex items-center gap-4">
                <div className="relative w-24 h-24">
                  <svg viewBox="0 0 36 36" className="w-24 h-24 -rotate-90">
                    <circle cx="18" cy="18" r="14" fill="none" stroke="#27272a" strokeWidth="4" />
                    {types.map((type, i) => {
                      const offset = types.slice(0, i).reduce((acc, t) => acc + t.pct, 0)
                      return (
                        <circle 
                          key={type.name}
                          cx="18" cy="18" r="14" 
                          fill="none" 
                          stroke={type.color} 
                          strokeWidth="4" 
                          strokeDasharray={`${type.pct} 100`}
                          strokeDashoffset={-offset}
                        />
                      )
                    })}
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-bold text-white">2.2K</span>
                  </div>
                </div>
                <div className="space-y-1.5 flex-1">
                  {types.slice(0, 4).map(type => (
                    <div key={type.name} className="flex items-center gap-2 text-xs">
                      <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: type.color }} />
                      <span className="text-white/60 flex-1">{type.name}</span>
                      <span className="text-white">{type.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sources table */}
            <div className="col-span-2 bg-white/[0.03] border border-white/5 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left text-xs text-white/40 font-medium px-4 py-3">#</th>
                    <th className="text-left text-xs text-white/40 font-medium px-4 py-3">Source</th>
                    <th className="text-left text-xs text-white/40 font-medium px-4 py-3">Type</th>
                    <th className="text-right text-xs text-white/40 font-medium px-4 py-3">Used</th>
                    <th className="text-right text-xs text-white/40 font-medium px-4 py-3">Avg</th>
                  </tr>
                </thead>
                <tbody>
                  {sources.map((source, i) => (
                    <tr key={i} className="border-b border-white/5 last:border-0">
                      <td className="px-4 py-3 text-xs text-white/40">{i + 1}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{source.favicon}</span>
                          <span className="text-sm text-white font-medium">{source.domain}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                          source.type === 'Editorial' ? 'bg-blue-500/10 text-blue-400' :
                          source.type === 'Review' ? 'bg-purple-500/10 text-purple-400' :
                          'bg-pink-500/10 text-pink-400'
                        }`}>
                          {source.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-white">{source.used}</td>
                      <td className="px-4 py-3 text-right text-sm text-white">{source.avg}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
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

export default function SourcesPage() {
  return (
    <main className="bg-[#0a0a0a] min-h-screen">
      <Nav />
      
      {/* Hero */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white/60 mb-6">
            <Globe className="w-3.5 h-3.5" />
            Citation Sources
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Know where AI gets<br />its information
          </h1>
          
          <p className="text-lg text-white/50 max-w-2xl mx-auto mb-8">
            Discover which websites AI models cite when answering questions about your industry. 
            Find the sources that matter and the gaps you can fill.
          </p>
          
          <div className="flex items-center justify-center gap-4">
            <Link 
              href="/auth/signup" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-semibold rounded-lg hover:bg-white/90 transition-colors"
            >
              Explore sources
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link 
              href="/product" 
              className="inline-flex items-center gap-2 px-6 py-3 text-white/70 hover:text-white font-medium transition-colors"
            >
              See all features
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
              Understand the AI citation landscape
            </h2>
            <p className="text-white/50 max-w-2xl mx-auto">
              See which sources AI trusts for your industry and find opportunities to get cited.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              icon={Globe}
              title="Domain Tracking"
              description="Monitor thousands of domains that AI models cite when answering industry questions."
            />
            <FeatureCard
              icon={Link2}
              title="Gap Analysis"
              description="Find sources where competitors appear but you don't—your biggest opportunities."
            />
            <FeatureCard
              icon={Search}
              title="URL Breakdown"
              description="Drill into specific pages and content types that drive the most citations."
            />
            <FeatureCard
              icon={Filter}
              title="Source Types"
              description="Filter by editorial, review, corporate, UGC, and more to focus your strategy."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Find your citation opportunities
          </h2>
          <p className="text-white/50 mb-8">
            See which sources AI uses for your industry and where you should be appearing.
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
