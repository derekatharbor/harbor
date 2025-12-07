// app/product/competitors/page.tsx
import Nav from '@/components/landing-new/Nav'
import Footer from '@/components/landing-new/Footer'
import Link from 'next/link'
import { Users, Trophy, TrendingUp, Target, BarChart3, ArrowRight, Crown, Zap } from 'lucide-react'

export const metadata = {
  title: 'Competitor Intelligence | Harbor',
  description: 'See how you stack up against competitors in AI responses. Track rankings, visibility gaps, and opportunities to outperform.',
}

// Mock leaderboard visualization
function LeaderboardMock() {
  const competitors = [
    { rank: 1, name: 'Notion', visibility: 94.2, delta: '+2.1', isLeader: true },
    { rank: 2, name: 'Coda', visibility: 87.8, delta: '+1.3', isLeader: false },
    { rank: 3, name: 'Your Brand', visibility: 72.4, delta: '+8.2', isUser: true },
    { rank: 4, name: 'Airtable', visibility: 68.9, delta: '-0.4', isLeader: false },
    { rank: 5, name: 'Monday.com', visibility: 61.2, delta: '+3.1', isLeader: false },
    { rank: 6, name: 'ClickUp', visibility: 54.8, delta: '+1.8', isLeader: false },
  ]

  return (
    <div className="relative w-full max-w-5xl mx-auto">
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-red-500/20 blur-3xl opacity-30" />
      
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
            <div className="px-4 py-1 bg-white/5 rounded-lg text-xs text-white/40">harbor.app/dashboard/competitors</div>
          </div>
        </div>

        {/* Dashboard content */}
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-white/60" />
              <span className="font-semibold text-white">Competitor Intelligence</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-white/40">
              <span>Project Management Tools</span>
              <span>•</span>
              <span>24 brands tracked</span>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
              <div className="text-xs text-white/40 mb-1">Your Rank</div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-white">#3</span>
                <span className="text-xs text-emerald-400">↑2 positions</span>
              </div>
            </div>
            <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
              <div className="text-xs text-white/40 mb-1">Gap to Leader</div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-white">21.8</span>
                <span className="text-xs text-white/40">points</span>
              </div>
            </div>
            <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
              <div className="text-xs text-white/40 mb-1">Share of Voice</div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-white">18%</span>
                <span className="text-xs text-emerald-400">+3%</span>
              </div>
            </div>
          </div>

          {/* Leaderboard table */}
          <div className="bg-white/[0.03] border border-white/5 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-white/5">
              <span className="text-sm font-medium text-white">Visibility Leaderboard</span>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-4 py-3 text-xs font-medium text-white/40 uppercase tracking-wide">Rank</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-white/40 uppercase tracking-wide">Brand</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-white/40 uppercase tracking-wide">Visibility</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-white/40 uppercase tracking-wide">Change</th>
                </tr>
              </thead>
              <tbody>
                {competitors.map((c) => (
                  <tr 
                    key={c.rank} 
                    className={`border-b border-white/5 ${c.isUser ? 'bg-pink-500/10' : ''}`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {c.rank === 1 && <Crown className="w-4 h-4 text-amber-400" />}
                        <span className={`text-sm font-medium ${c.isUser ? 'text-pink-400' : 'text-white'}`}>
                          {c.rank}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-medium ${
                          c.isUser ? 'bg-pink-500 text-white' : 'bg-white/10 text-white/60'
                        }`}>
                          {c.name.charAt(0)}
                        </div>
                        <span className={`text-sm font-medium ${c.isUser ? 'text-pink-400' : 'text-white'}`}>
                          {c.name}
                          {c.isUser && <span className="ml-2 text-xs text-pink-400/60">(You)</span>}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${c.isUser ? 'bg-pink-500' : 'bg-blue-500'}`}
                            style={{ width: `${c.visibility}%` }}
                          />
                        </div>
                        <span className="text-sm text-white w-12 text-right">{c.visibility}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`text-xs font-medium ${
                        c.delta.startsWith('+') ? 'text-emerald-400' : 'text-red-400'
                      }`}>
                        {c.delta}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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

export default function CompetitorIntelPage() {
  return (
    <main className="bg-[#0a0a0a] min-h-screen">
      <Nav />
      
      {/* Hero */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white/60 mb-6">
            <Users className="w-3.5 h-3.5" />
            Competitor Intelligence
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Know where you stand<br />against competitors
          </h1>
          
          <p className="text-lg text-white/50 max-w-2xl mx-auto mb-8">
            See exactly how you rank against every competitor in your space. 
            Track visibility gaps, share of voice, and identify opportunities to climb the leaderboard.
          </p>
          
          <div className="flex items-center justify-center gap-4">
            <Link 
              href="/auth/signup" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-semibold rounded-lg hover:bg-white/90 transition-colors"
            >
              See your ranking
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link 
              href="/brands" 
              className="inline-flex items-center gap-2 px-6 py-3 text-white/70 hover:text-white font-medium transition-colors"
            >
              Browse all brands
            </Link>
          </div>
        </div>
      </section>

      {/* Dashboard visualization */}
      <section className="pb-24 px-6">
        <LeaderboardMock />
      </section>

      {/* Features */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">
              Competitive intelligence that actually helps
            </h2>
            <p className="text-white/50 max-w-2xl mx-auto">
              Stop guessing where you stand. Get real data on how AI ranks you versus the competition.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              icon={Trophy}
              title="Visibility Rankings"
              description="See your position in the leaderboard and track how it changes over time."
            />
            <FeatureCard
              icon={Target}
              title="Gap Analysis"
              description="Identify exactly what's keeping you from outranking your competitors."
            />
            <FeatureCard
              icon={BarChart3}
              title="Share of Voice"
              description="Measure what percentage of AI mentions in your category go to your brand."
            />
            <FeatureCard
              icon={Zap}
              title="Opportunity Alerts"
              description="Get notified when competitors drop or new opportunities emerge."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to outrank your competitors?
          </h2>
          <p className="text-white/50 mb-8">
            Start tracking your competitive position in AI search today.
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
