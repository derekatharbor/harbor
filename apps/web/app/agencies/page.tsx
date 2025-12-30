// DESTINATION: apps/web/app/agencies/page.tsx
// Agency landing page - free audit tool + Pitch Workspace teaser

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { 
  ArrowRight, 
  Target, 
  Zap, 
  TrendingUp, 
  CheckCircle2, 
  Users,
  BarChart3,
  FileText,
  Layers,
  Clock,
  PieChart,
  Send
} from 'lucide-react'

export default function AgenciesPage() {
  const router = useRouter()
  const [url, setUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!url.trim()) {
      setError('Please enter a website URL')
      return
    }

    // Basic URL validation
    let cleanUrl = url.trim()
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = 'https://' + cleanUrl
    }

    try {
      new URL(cleanUrl)
    } catch {
      setError('Please enter a valid URL')
      return
    }

    setIsLoading(true)
    router.push(`/agencies/audit?url=${encodeURIComponent(cleanUrl)}`)
  }

  return (
    <div className="min-h-screen bg-[#0B0B0C]">
      {/* Nav */}
      <nav className="p-6 flex items-center justify-between border-b border-white/5">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/images/Harbor_White_Logo.png"
            alt="Harbor"
            width={28}
            height={28}
            className="h-7 w-auto"
          />
          <span className="text-lg font-semibold text-white font-['Space_Grotesk']">Harbor</span>
        </Link>
        
        <div className="flex items-center gap-6">
          <Link 
            href="/pricing" 
            className="text-sm text-white/50 hover:text-white/70 transition-colors"
          >
            Pricing
          </Link>
          <Link 
            href="/auth/login" 
            className="text-sm text-white/50 hover:text-white/70 transition-colors"
          >
            Log in
          </Link>
          <Link 
            href="/auth/signup" 
            className="text-sm px-4 py-2 bg-white text-[#0B0B0C] rounded-lg font-medium hover:bg-white/90 transition-colors"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 mb-6">
              <Users className="w-3.5 h-3.5 text-white/50" />
              <span className="text-xs text-white/50">For Agencies</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-semibold text-white mb-5 font-['Space_Grotesk'] leading-[1.1]">
              Win GEO clients with free AI visibility audits
            </h1>
            
            <p className="text-lg text-white/40 mb-8 leading-relaxed">
              Show prospects how they're losing in AI search. Generate a competitive audit in under 5 minutes and close the deal with data.
            </p>

            {/* URL Input */}
            <form onSubmit={handleSubmit} className="mb-4">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Enter prospect's website"
                  className="flex-1 px-4 py-3.5 bg-[#111213] border border-white/10 rounded-xl text-white placeholder-white/30 text-sm focus:outline-none focus:border-white/20 transition-colors"
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-3.5 bg-white text-[#0B0B0C] rounded-xl font-medium text-sm hover:bg-white/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 flex-shrink-0"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-[#0B0B0C]/30 border-t-[#0B0B0C] rounded-full animate-spin" />
                      Scanning
                    </>
                  ) : (
                    <>
                      Run Free Audit
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
              {error && (
                <p className="text-red-400 text-xs mt-2">{error}</p>
              )}
            </form>

            <p className="text-xs text-white/30">
              No signup required. Results in under 5 minutes.
            </p>
          </div>

          {/* Hero Image/Mockup */}
          <div className="relative hidden lg:block">
            <div className="bg-[#111213] border border-white/10 rounded-2xl p-6 shadow-2xl">
              {/* Fake audit preview */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                  <Target className="w-5 h-5 text-white/50" />
                </div>
                <div>
                  <div className="text-sm font-medium text-white">AI Visibility Audit</div>
                  <div className="text-xs text-white/40">acme-corp.com</div>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-[#0B0B0C] rounded-lg p-3 text-center">
                  <div className="text-2xl font-semibold text-white">12%</div>
                  <div className="text-xs text-white/40">Visibility</div>
                </div>
                <div className="bg-[#0B0B0C] rounded-lg p-3 text-center">
                  <div className="text-2xl font-semibold text-amber-400">Mixed</div>
                  <div className="text-xs text-white/40">Sentiment</div>
                </div>
                <div className="bg-[#0B0B0C] rounded-lg p-3 text-center">
                  <div className="text-2xl font-semibold text-white">#8</div>
                  <div className="text-xs text-white/40">Rank</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/40">vs. Competitor A</span>
                  <span className="text-red-400">-24% behind</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/40">vs. Competitor B</span>
                  <span className="text-red-400">-18% behind</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/40">vs. Competitor C</span>
                  <span className="text-emerald-400">+3% ahead</span>
                </div>
              </div>
            </div>
            
            {/* Decorative gradient */}
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-3xl blur-3xl -z-10" />
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="border-t border-white/5 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-semibold text-white mb-4 font-['Space_Grotesk']">
              Close deals with data, not decks
            </h2>
            <p className="text-white/40 max-w-2xl mx-auto">
              Traditional pitches rely on promises. Harbor lets you show prospects their actual AI visibility gap before you even get on a call.
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                icon: Target,
                title: 'Enter their URL',
                description: 'Paste the website of a brand you want to pitch or upsell.'
              },
              {
                icon: Zap,
                title: 'We scan AI models',
                description: 'Harbor queries ChatGPT, Claude, Perplexity, and Gemini in real-time.'
              },
              {
                icon: BarChart3,
                title: 'See the gap',
                description: 'Get visibility scores, sentiment, and competitor comparisons instantly.'
              },
              {
                icon: Send,
                title: 'Send the report',
                description: 'Share a branded report that shows them exactly what they\'re missing.'
              }
            ].map((step, i) => (
              <div key={i} className="relative">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                  <step.icon className="w-5 h-5 text-white/50" />
                </div>
                <div className="text-xs text-white/30 mb-2">Step {i + 1}</div>
                <h3 className="text-base font-medium text-white mb-2 font-['Space_Grotesk']">{step.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{step.description}</p>
                
                {i < 3 && (
                  <div className="hidden md:block absolute top-5 left-full w-full h-px bg-gradient-to-r from-white/10 to-transparent -translate-x-4" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Value Props - Two Column */}
      <section className="border-t border-white/5 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-[#111213] border border-white/5 rounded-2xl p-8">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-5">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="text-xl font-medium text-white mb-3 font-['Space_Grotesk']">
                For pitching new clients
              </h3>
              <p className="text-white/40 text-sm mb-6 leading-relaxed">
                Stop competing on price. Win deals by showing prospects problems they didn't know they had.
              </p>
              <ul className="space-y-3">
                {[
                  'Show prospects their AI visibility gap',
                  'Compare them to competitors they care about',
                  'Demonstrate the problem before selling the solution',
                  'Stand out from agencies that only talk SEO'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-white/60">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-[#111213] border border-white/5 rounded-2xl p-8">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-5">
                <PieChart className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="text-xl font-medium text-white mb-3 font-['Space_Grotesk']">
                For upselling current clients
              </h3>
              <p className="text-white/40 text-sm mb-6 leading-relaxed">
                Add GEO as a new service line. Create recurring revenue from AI visibility tracking.
              </p>
              <ul className="space-y-3">
                {[
                  'Add GEO/AEO as a new service offering',
                  'Bill AI Search Monitoring as a monthly retainer',
                  'Show clients what competitors are doing in AI',
                  'Prove ROI with visibility trend reports'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-white/60">
                    <CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Pitch Workspace Section */}
      <section className="border-t border-white/5 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Content */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 mb-6">
                <Layers className="w-3.5 h-3.5 text-white/50" />
                <span className="text-xs text-white/50">Pitch Workspace</span>
              </div>
              
              <h2 className="text-3xl font-semibold text-white mb-5 font-['Space_Grotesk'] leading-tight">
                Manage your entire GEO pipeline in one place
              </h2>
              
              <p className="text-white/40 mb-8 leading-relaxed">
                Stop juggling spreadsheets and screenshots. Pitch Workspace gives agencies a dedicated space to track prospects, generate reports, and close deals faster.
              </p>

              <div className="space-y-4">
                {[
                  {
                    icon: Users,
                    title: 'Prospect Pipeline',
                    description: 'Track every prospect from lead to closed-won with kanban-style workflows.'
                  },
                  {
                    icon: Clock,
                    title: 'Historical Tracking',
                    description: 'Monitor prospect visibility over time, even before they become clients.'
                  },
                  {
                    icon: FileText,
                    title: 'One-Click Reports',
                    description: 'Generate branded audit reports instantly. Share via link or PDF.'
                  }
                ].map((feature, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                      <feature.icon className="w-4 h-4 text-white/50" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-white mb-1">{feature.title}</h4>
                      <p className="text-sm text-white/40">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <Link 
                  href="/auth/signup"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-[#0B0B0C] rounded-lg font-medium text-sm hover:bg-white/90 transition-colors"
                >
                  Get Early Access
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Right - Mockup */}
            <div className="relative hidden lg:block">
              <div className="bg-[#111213] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                {/* Workspace Header */}
                <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-white/50" />
                    <span className="text-sm font-medium text-white">Pitch Workspace</span>
                  </div>
                  <button className="text-xs px-3 py-1.5 bg-white text-[#0B0B0C] rounded-lg font-medium">
                    + New Prospect
                  </button>
                </div>
                
                {/* Pipeline Columns */}
                <div className="p-4 grid grid-cols-3 gap-3">
                  {/* Lead Column */}
                  <div>
                    <div className="text-xs text-white/40 mb-3 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-white/20" />
                      Lead
                      <span className="text-white/20">3</span>
                    </div>
                    <div className="space-y-2">
                      {['Acme Corp', 'TechStart', 'RetailMax'].map((name, i) => (
                        <div key={i} className="bg-[#0B0B0C] border border-white/5 rounded-lg p-3">
                          <div className="text-xs font-medium text-white mb-1">{name}</div>
                          <div className="text-[10px] text-white/30">12% visibility</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Pitched Column */}
                  <div>
                    <div className="text-xs text-white/40 mb-3 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-amber-500/50" />
                      Pitched
                      <span className="text-white/20">2</span>
                    </div>
                    <div className="space-y-2">
                      {['BigRetail', 'FinanceApp'].map((name, i) => (
                        <div key={i} className="bg-[#0B0B0C] border border-white/5 rounded-lg p-3">
                          <div className="text-xs font-medium text-white mb-1">{name}</div>
                          <div className="text-[10px] text-white/30">Report sent</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Won Column */}
                  <div>
                    <div className="text-xs text-white/40 mb-3 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500/50" />
                      Won
                      <span className="text-white/20">1</span>
                    </div>
                    <div className="space-y-2">
                      <div className="bg-[#0B0B0C] border border-emerald-500/20 rounded-lg p-3">
                        <div className="text-xs font-medium text-white mb-1">CloudSoft</div>
                        <div className="text-[10px] text-emerald-400">$2,400/mo</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Decorative gradient */}
              <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-3xl blur-3xl -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="border-t border-white/5 py-20">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-2xl font-semibold text-white mb-10 font-['Space_Grotesk']">
            Frequently asked questions
          </h2>
          
          <div className="space-y-6">
            {[
              {
                q: 'Is the audit tool really free?',
                a: 'Yes. Run unlimited audits without signing up. We want you to see the value before committing to anything.'
              },
              {
                q: 'What AI models do you scan?',
                a: 'We query ChatGPT, Claude, Perplexity, Gemini, and Google AI Overviews. Results reflect how each model perceives the brand.'
              },
              {
                q: 'Can I white-label reports for clients?',
                a: 'White-label exports are coming soon on Agency plans. For now, reports are Harbor-branded but fully shareable.'
              },
              {
                q: 'How is this different from SEO tools?',
                a: 'SEO tools track Google rankings. Harbor tracks how AI models talk about brands — a completely different (and increasingly important) channel.'
              },
              {
                q: 'What\'s included in Pitch Workspace?',
                a: 'Prospect pipeline management, historical visibility tracking, one-click report generation, and client portfolio views. Available on Agency plans.'
              }
            ].map((item, i) => (
              <div key={i} className="border-b border-white/5 pb-6">
                <h3 className="text-base font-medium text-white mb-2">{item.q}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="border-t border-white/5 py-20 bg-gradient-to-b from-transparent to-white/[0.02]">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-semibold text-white mb-4 font-['Space_Grotesk']">
            Start winning GEO clients today
          </h2>
          <p className="text-white/40 mb-8">
            Run your first audit free. No signup, no credit card, no demo calls.
          </p>
          
          <form onSubmit={handleSubmit} className="max-w-md mx-auto mb-4">
            <div className="flex gap-3">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Enter prospect's website"
                className="flex-1 px-4 py-3.5 bg-[#111213] border border-white/10 rounded-xl text-white placeholder-white/30 text-sm focus:outline-none focus:border-white/20 transition-colors"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-3.5 bg-white text-[#0B0B0C] rounded-xl font-medium text-sm hover:bg-white/90 transition-all disabled:opacity-50 flex items-center gap-2 flex-shrink-0"
              >
                Run Audit
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image
              src="/images/Harbor_White_Logo.png"
              alt="Harbor"
              width={20}
              height={20}
              className="h-5 w-auto opacity-50"
            />
            <span className="text-xs text-white/30">© 2025 Harbor</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/pricing" className="text-xs text-white/30 hover:text-white/50 transition-colors">
              Pricing
            </Link>
            <Link href="/privacy" className="text-xs text-white/30 hover:text-white/50 transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="text-xs text-white/30 hover:text-white/50 transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}