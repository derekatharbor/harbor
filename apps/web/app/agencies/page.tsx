// DESTINATION: apps/web/app/agencies/page.tsx
// Agency landing page - Amplemarket-style layout

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { 
  ArrowRight, 
  Target, 
  Zap, 
  BarChart3, 
  Send,
  CheckCircle2,
  Users,
  Clock,
  FileText,
  ChevronDown
} from 'lucide-react'
import Nav from '@/components/landing/Nav'
import Footer from '@/components/landing/Footer'

export default function AgenciesPage() {
  const router = useRouter()
  const [url, setUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!url.trim()) {
      setError('Please enter a website URL')
      return
    }

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

  const faqs = [
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
      a: 'SEO tools track Google rankings. Harbor tracks how AI models talk about brands — a completely different channel.'
    },
    {
      q: "What's included in Pitch Workspace?",
      a: 'Prospect pipeline management, historical visibility tracking, one-click report generation, and client portfolio views.'
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      <Nav />

      {/* Hero - White */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-24 px-6 bg-white" data-nav-theme="light">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Content */}
            <div>
              <p className="text-sm text-[#0B0B0C]/50 font-medium mb-4 uppercase tracking-wide">
                Harbor for Agencies
              </p>
              
              <h1 className="text-4xl md:text-5xl font-semibold text-[#0B0B0C] leading-[1.1] mb-5 font-['Space_Grotesk']">
                Win more GEO clients with AI visibility audits
              </h1>
              
              <p className="text-lg text-[#0B0B0C]/60 leading-relaxed mb-8">
                Show prospects their AI search gaps. Generate competitive audits in minutes and close deals with data, not decks.
              </p>

              {/* Input */}
              <form onSubmit={handleSubmit} className="mb-4">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Enter prospect's website"
                    className="flex-1 px-4 py-3 bg-[#F5F5F5] border border-[#E5E5E5] rounded-lg text-[#0B0B0C] placeholder-[#0B0B0C]/40 text-sm focus:outline-none focus:border-[#0B0B0C]/20 transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-5 py-3 bg-[#0B0B0C] text-white rounded-lg font-medium text-sm hover:bg-[#0B0B0C]/90 transition-all disabled:opacity-50 flex items-center gap-2 flex-shrink-0"
                  >
                    {isLoading ? 'Scanning...' : 'Run Free Audit'}
                  </button>
                </div>
                {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
              </form>

              <p className="text-xs text-[#0B0B0C]/40">
                No signup required · Results in under 5 minutes
              </p>
            </div>

            {/* Right - Screenshot placeholder */}
            <div className="hidden lg:block">
              <div className="relative">
                <Image
                  src="/previews/agency-audit-preview.png"
                  alt="Harbor AI Visibility Audit"
                  width={600}
                  height={450}
                  className="rounded-xl shadow-2xl border border-gray-200"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4-Column Features - White */}
      <section className="py-20 px-6 bg-[#FAFAFA] border-t border-gray-100" data-nav-theme="light">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-semibold text-[#0B0B0C] mb-4 font-['Space_Grotesk']">
            Close deals with data, not decks
          </h2>
          <p className="text-[#0B0B0C]/50 mb-12 max-w-2xl">
            Traditional pitches rely on promises. Harbor shows prospects their actual AI visibility gap.
          </p>
          
          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                icon: Target,
                title: 'Enter their URL',
                description: 'Paste the website of any brand you want to pitch or upsell.'
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
                description: "Share a branded report showing exactly what they're missing."
              }
            ].map((step, i) => (
              <div key={i}>
                <div className="w-10 h-10 rounded-lg bg-[#0B0B0C]/5 flex items-center justify-center mb-4">
                  <step.icon className="w-5 h-5 text-[#0B0B0C]/70" />
                </div>
                <h3 className="text-base font-semibold text-[#0B0B0C] mb-2 font-['Space_Grotesk']">
                  {step.title}
                </h3>
                <p className="text-sm text-[#0B0B0C]/50 leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Section 1 - Text Left, Image Right */}
      <section className="py-20 px-6 bg-white" data-nav-theme="light">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-semibold text-[#0B0B0C] mb-4 font-['Space_Grotesk']">
                Win pitches with proof, not promises
              </h2>
              <p className="text-[#0B0B0C]/60 mb-6 leading-relaxed">
                Stop competing on price. Show prospects problems they didn't know they had. When you can prove a brand is invisible in AI search, the sale makes itself.
              </p>
              <ul className="space-y-3">
                {[
                  'Show prospects their AI visibility gap',
                  'Compare them to competitors they care about',
                  'Demonstrate the problem before selling the solution',
                  'Stand out from agencies that only talk SEO'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-[#0B0B0C]/70">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="hidden lg:block">
              <Image
                src="/previews/agency-competitor-compare.png"
                alt="Competitor comparison"
                width={550}
                height={400}
                className="rounded-xl shadow-xl border border-gray-200"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section 2 - Image Left, Text Right */}
      <section className="py-20 px-6 bg-[#FAFAFA]" data-nav-theme="light">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="hidden lg:block order-1">
              <Image
                src="/previews/agency-upsell.png"
                alt="Upsell existing clients"
                width={550}
                height={400}
                className="rounded-xl shadow-xl border border-gray-200"
              />
            </div>
            <div className="order-2">
              <h2 className="text-2xl md:text-3xl font-semibold text-[#0B0B0C] mb-4 font-['Space_Grotesk']">
                Upsell existing clients with a new service line
              </h2>
              <p className="text-[#0B0B0C]/60 mb-6 leading-relaxed">
                Add GEO/AEO as a new offering. Create recurring revenue from AI visibility tracking that clients actually understand and value.
              </p>
              <ul className="space-y-3">
                {[
                  'Add GEO/AEO as a monthly retainer service',
                  'Bill AI Search Monitoring as a line item',
                  'Show clients what competitors are doing in AI',
                  'Prove ROI with visibility trend reports'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-[#0B0B0C]/70">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Pitch Workspace Section */}
      <section className="py-20 px-6 bg-white" data-nav-theme="light">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-sm text-[#0B0B0C]/50 font-medium mb-3 uppercase tracking-wide">
                Pitch Workspace
              </p>
              <h2 className="text-2xl md:text-3xl font-semibold text-[#0B0B0C] mb-4 font-['Space_Grotesk']">
                Manage your entire GEO pipeline
              </h2>
              <p className="text-[#0B0B0C]/60 mb-8 leading-relaxed">
                Stop juggling spreadsheets. Pitch Workspace gives agencies a dedicated space to track prospects, generate reports, and close deals faster.
              </p>

              <div className="space-y-5">
                {[
                  {
                    icon: Users,
                    title: 'Prospect Pipeline',
                    description: 'Track every prospect from lead to closed-won.'
                  },
                  {
                    icon: Clock,
                    title: 'Historical Tracking',
                    description: 'Monitor visibility over time, even before they become clients.'
                  },
                  {
                    icon: FileText,
                    title: 'One-Click Reports',
                    description: 'Generate branded audit reports instantly.'
                  }
                ].map((feature, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-10 h-10 rounded-lg bg-[#0B0B0C]/5 flex items-center justify-center flex-shrink-0">
                      <feature.icon className="w-5 h-5 text-[#0B0B0C]/60" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-[#0B0B0C] mb-0.5">{feature.title}</h4>
                      <p className="text-sm text-[#0B0B0C]/50">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="hidden lg:block">
              <Image
                src="/previews/pitch-workspace.png"
                alt="Pitch Workspace"
                width={550}
                height={400}
                className="rounded-xl shadow-xl border border-gray-200"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Dark CTA Banner */}
      <section className="py-16 px-6 bg-[#0B0B0C]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-semibold text-white mb-4 font-['Space_Grotesk']">
            Start winning GEO clients today
          </h2>
          <p className="text-white/50 mb-8">
            Run your first audit free. No signup, no credit card, no demo calls.
          </p>
          
          <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <div className="flex gap-3">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Enter prospect's website"
                className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 text-sm focus:outline-none focus:border-white/30 transition-colors"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="px-5 py-3 bg-white text-[#0B0B0C] rounded-lg font-medium text-sm hover:bg-white/90 transition-all disabled:opacity-50 flex items-center gap-2 flex-shrink-0"
              >
                Run Audit
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* FAQ - White */}
      <section className="py-20 px-6 bg-white" data-nav-theme="light">
        <div className="max-w-3xl mx-auto">
          <div className="mb-12">
            <p className="text-sm text-[#0B0B0C]/50 font-medium mb-2 uppercase tracking-wide">
              Questions & Answers
            </p>
            <h2 className="text-2xl md:text-3xl font-semibold text-[#0B0B0C] font-['Space_Grotesk']">
              Frequently asked questions
            </h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {faqs.map((faq, i) => (
              <div key={i} className="py-5">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between text-left"
                >
                  <span className="text-[#0B0B0C] font-medium pr-4">{faq.q}</span>
                  <ChevronDown 
                    className={`w-5 h-5 text-[#0B0B0C]/40 flex-shrink-0 transition-transform ${
                      openFaq === i ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <div className={`overflow-hidden transition-all duration-200 ${
                  openFaq === i ? 'max-h-32 opacity-100 mt-3' : 'max-h-0 opacity-0'
                }`}>
                  <p className="text-sm text-[#0B0B0C]/60 leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}