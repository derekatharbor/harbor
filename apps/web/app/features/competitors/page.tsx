// app/features/competitors/page.tsx
'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Check, TrendingUp, BarChart3, Eye, Activity, ChevronDown, Lightbulb } from 'lucide-react'
import StickyNav from '@/components/marketing/StickyNav'
import MainNav from '@/components/marketing/MainNav'

// =============================================================================
// BRAND MARQUEE DATA
// =============================================================================

const MARQUEE_BRANDS = [
  ['linear.app', 'vercel.com', 'supabase.com', 'stripe.com', 'notion.so', 'figma.com', 'asana.com', 'hubspot.com', 'salesforce.com', 'planetscale.com', 'railway.app', 'render.com'],
  ['shopify.com', 'squarespace.com', 'webflow.com', 'framer.com', 'canva.com', 'miro.com', 'loom.com', 'calendly.com', 'typeform.com', 'airtable.com', 'monday.com', 'clickup.com'],
]

// =============================================================================
// HERO SECTION
// =============================================================================

function Hero() {
  return (
    <section className="relative bg-[#F6F5F3] overflow-hidden">
      <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 py-20 sm:py-28">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          {/* Left - Content */}
          <div>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 mb-6">
              <div className="w-3 h-3 rounded-sm bg-blue-500" />
              <span className="text-sm font-medium text-black uppercase tracking-wider font-source-sans">Competitor Intelligence</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-bold text-black leading-[1.1] mb-8 font-source-sans">
              See how you stack up against competitors in AI
            </h1>

            {/* Bullet points */}
            <ul className="space-y-4 mb-10">
              <li className="flex items-start sm:items-center gap-3">
                <Check className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5 sm:mt-0" />
                <span className="text-[#6C6C6B] text-base sm:text-lg font-source-sans">Track visibility across ChatGPT, Claude, Gemini & Perplexity</span>
              </li>
              <li className="flex items-start sm:items-center gap-3">
                <Check className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5 sm:mt-0" />
                <span className="text-[#6C6C6B] text-base sm:text-lg font-source-sans">Monitor share of voice in your category</span>
              </li>
              <li className="flex items-start sm:items-center gap-3">
                <Check className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5 sm:mt-0" />
                <span className="text-[#6C6C6B] text-base sm:text-lg font-source-sans">Get alerts when competitors gain ground</span>
              </li>
            </ul>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/signup"
                className="px-6 py-3.5 rounded-lg bg-black text-white font-semibold text-sm hover:bg-black/80 transition-all flex items-center justify-center gap-2 font-source-sans"
              >
                Start free trial
              </Link>
              <Link
                href="/demo"
                className="px-6 py-3.5 rounded-lg bg-white border border-[#E0E0E0] text-black font-semibold text-sm hover:bg-[#F6F5F3] transition-all flex items-center justify-center gap-2 font-source-sans"
              >
                Book a demo
              </Link>
            </div>
          </div>

          {/* Right - Dashboard Image */}
          <div className="relative">
            <Image 
              src="/images/competitors/hero-dashboard.png" 
              alt="Harbor Competitor Intelligence Dashboard" 
              width={800} 
              height={600} 
              className="w-full h-auto"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

// =============================================================================
// FEATURES GRID
// =============================================================================

const features = [
  {
    icon: Eye,
    title: 'Visibility Comparison',
    description: 'See exactly how often you and your competitors are mentioned across all major AI platforms.',
  },
  {
    icon: BarChart3,
    title: 'Share of Voice',
    description: 'Track your category presence over time. Know when you\'re gaining or losing ground.',
  },
  {
    icon: Activity,
    title: 'Sentiment Analysis',
    description: 'Understand how AI models describe you vs competitors. Spot perception gaps.',
  },
  {
    icon: TrendingUp,
    title: 'Trend Tracking',
    description: 'Monitor shifts week over week. Get notified when competitors make moves.',
  },
]

function Features() {
  return (
    <section className="relative bg-white py-20 sm:py-28">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-black mb-4 font-source-sans">
            Know where you stand
          </h2>
          <p className="text-[#6C6C6B] text-base max-w-xl mx-auto font-source-sans">
            Stop guessing. Get real data on how AI models rank you against competitors.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div 
                key={index}
                className="group relative p-6 sm:p-8 rounded-2xl bg-[#F6F5F3] border border-[#EFEEED] hover:border-blue-500/30 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition-colors">
                  <Icon className="w-6 h-6 text-blue-500" />
                </div>
                <h3 className="text-lg font-semibold text-black mb-2 font-source-sans">
                  {feature.title}
                </h3>
                <p className="text-[#6C6C6B] text-sm leading-relaxed font-source-sans">
                  {feature.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// =============================================================================
// ALTERNATING SECTIONS
// =============================================================================

function AlternatingSections() {
  return (
    <section className="relative bg-[#F6F5F3] py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-6 space-y-24">
        
        {/* Section 1 - Image Left */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="relative">
            <Image 
              src="/images/competitors/section-1.png" 
              alt="Competitor visibility tracking" 
              width={600} 
              height={450} 
              className="w-full h-auto rounded-xl"
            />
          </div>
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-black mb-6 font-source-sans">
              Real-time competitive monitoring
            </h2>
            <p className="text-[#6C6C6B] text-lg mb-6 font-source-sans">
              Track how AI models talk about your competitors in real-time. See which brands are getting recommended, what language AI uses to describe them, and where you have opportunities to improve.
            </p>
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <span className="text-[#6C6C6B] font-source-sans">Daily visibility snapshots</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <span className="text-[#6C6C6B] font-source-sans">Side-by-side brand comparisons</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <span className="text-[#6C6C6B] font-source-sans">Automated alerting</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Section 2 - Image Right */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="order-2 lg:order-1">
            <h2 className="text-3xl sm:text-4xl font-bold text-black mb-6 font-source-sans">
              Benchmark against category leaders
            </h2>
            <p className="text-[#6C6C6B] text-lg mb-6 font-source-sans">
              Don't just track direct competitors. See how you compare to category leaders and rising challengers. Understand what makes top-performing brands visible in AI search.
            </p>
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <span className="text-[#6C6C6B] font-source-sans">Category-wide rankings</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <span className="text-[#6C6C6B] font-source-sans">Visibility score benchmarks</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <span className="text-[#6C6C6B] font-source-sans">Competitive gap analysis</span>
              </li>
            </ul>
          </div>
          <div className="relative order-1 lg:order-2">
            <Image 
              src="/images/competitors/section-2.png" 
              alt="Category benchmarking" 
              width={600} 
              height={450} 
              className="w-full h-auto rounded-xl"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

// =============================================================================
// COMPARISON TABLE
// =============================================================================

const comparisonFeatures = [
  { feature: 'Multi-model tracking (ChatGPT, Claude, Gemini, Perplexity)', harbor: true, scrunch: false, profound: true, peec: false },
  { feature: 'Real-time visibility monitoring', harbor: true, scrunch: true, profound: false, peec: true },
  { feature: 'Competitor benchmarking', harbor: true, scrunch: true, profound: true, peec: false },
  { feature: 'Share of voice analytics', harbor: true, scrunch: false, profound: true, peec: false },
  { feature: 'Sentiment analysis', harbor: true, scrunch: false, profound: false, peec: true },
  { feature: 'Source citation tracking', harbor: true, scrunch: false, profound: false, peec: false },
  { feature: 'Custom prompt monitoring', harbor: true, scrunch: false, profound: true, peec: false },
  { feature: 'API access', harbor: true, scrunch: true, profound: true, peec: false },
  { feature: 'White-label reporting', harbor: true, scrunch: false, profound: false, peec: false },
]

function ComparisonTable() {
  return (
    <section className="relative bg-white py-20 sm:py-28">
      <div className="max-w-5xl mx-auto px-6">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-black mb-4 font-source-sans">
            How Harbor compares
          </h2>
          <p className="text-[#6C6C6B] text-base max-w-xl mx-auto font-source-sans">
            See why teams choose Harbor for AI visibility intelligence.
          </p>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#EFEEED]">
                <th className="text-left py-4 pr-4 font-source-sans font-semibold text-black">Features</th>
                <th className="py-4 px-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Image src="/images/harbor-logo-black.svg" alt="Harbor" width={24} height={24} className="h-6 w-6" />
                    <span className="font-source-sans font-semibold text-black text-sm">Harbor</span>
                  </div>
                </th>
                <th className="py-4 px-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-6 h-6 rounded-md overflow-hidden bg-black flex-shrink-0">
                      <Image src="/images/competitors/logo-scrunch.svg" alt="Scrunch" width={24} height={24} className="w-full h-full object-cover" />
                    </div>
                    <span className="font-source-sans font-medium text-[#6C6C6B] text-sm">Scrunch</span>
                  </div>
                </th>
                <th className="py-4 px-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-6 h-6 rounded-md overflow-hidden bg-black flex-shrink-0">
                      <Image src="/images/competitors/logo-profound.jpeg" alt="Profound" width={24} height={24} className="w-full h-full object-cover" />
                    </div>
                    <span className="font-source-sans font-medium text-[#6C6C6B] text-sm">Profound</span>
                  </div>
                </th>
                <th className="py-4 px-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-6 h-6 rounded-md overflow-hidden bg-black flex-shrink-0">
                      <Image src="/images/competitors/logo-peec.png" alt="Peec" width={24} height={24} className="w-full h-full object-cover" />
                    </div>
                    <span className="font-source-sans font-medium text-[#6C6C6B] text-sm">Peec</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {comparisonFeatures.map((row, index) => (
                <tr key={index} className="border-b border-[#EFEEED]">
                  <td className="py-4 pr-4 text-sm text-[#6C6C6B] font-source-sans">{row.feature}</td>
                  <td className="py-4 px-4 text-center">
                    {row.harbor ? (
                      <Check className="w-5 h-5 text-green-500 mx-auto" />
                    ) : (
                      <span className="text-[#D0D0D0]">—</span>
                    )}
                  </td>
                  <td className="py-4 px-4 text-center">
                    {row.scrunch ? (
                      <Check className="w-5 h-5 text-green-500 mx-auto" />
                    ) : (
                      <span className="text-[#D0D0D0]">—</span>
                    )}
                  </td>
                  <td className="py-4 px-4 text-center">
                    {row.profound ? (
                      <Check className="w-5 h-5 text-green-500 mx-auto" />
                    ) : (
                      <span className="text-[#D0D0D0]">—</span>
                    )}
                  </td>
                  <td className="py-4 px-4 text-center">
                    {row.peec ? (
                      <Check className="w-5 h-5 text-green-500 mx-auto" />
                    ) : (
                      <span className="text-[#D0D0D0]">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

// =============================================================================
// TIPS CALLOUT
// =============================================================================

function TipsCallout() {
  return (
    <section className="relative bg-[#F6F5F3] py-20 sm:py-28">
      <div className="max-w-4xl mx-auto px-6">
        <div className="bg-blue-500 rounded-2xl p-8 sm:p-12">
          <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <Lightbulb className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 font-source-sans">
                Tips for competitive intelligence
              </h3>
              <p className="text-white/80 font-source-sans mb-6">
                The best brands don't just track competitors—they use competitive data to find opportunities. Set up alerts for competitor mentions, monitor category-level queries, and look for gaps where competitors aren't showing up.
              </p>
              <Link
                href="/blog/competitive-intelligence-guide"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-blue-500 rounded-lg font-semibold text-sm hover:bg-white/90 transition-colors font-source-sans"
              >
                Read the guide
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// =============================================================================
// BRAND MARQUEE
// =============================================================================

function MarqueeRow({ domains, direction, speed = 35 }: { domains: string[], direction: 'left' | 'right', speed?: number }) {
  const duplicatedDomains = [...domains, ...domains, ...domains]
  
  return (
    <div className="flex overflow-hidden py-2">
      <div 
        className={`flex gap-3 sm:gap-4 ${direction === 'left' ? 'animate-marquee-left' : 'animate-marquee-right'}`}
        style={{ animationDuration: `${speed}s` }}
      >
        {duplicatedDomains.map((domain, idx) => (
          <div 
            key={`${domain}-${idx}`}
            className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl flex-shrink-0 overflow-hidden bg-white border border-[#EFEEED]"
          >
            <img 
              src={`https://cdn.brandfetch.io/${domain}?c=1id1Fyz-h7an5-5KR_y`}
              alt={domain}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.opacity = '0'
              }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

function BrandMarquee() {
  return (
    <section className="relative bg-white py-16 overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 mb-8">
        <p className="text-center text-sm text-[#6C6C6B] font-source-sans">
          Tracking the brands you care about
        </p>
      </div>
      
      <div className="space-y-2">
        <MarqueeRow domains={MARQUEE_BRANDS[0]} direction="left" speed={40} />
        <MarqueeRow domains={MARQUEE_BRANDS[1]} direction="right" speed={45} />
      </div>

      {/* Marquee CSS */}
      <style jsx>{`
        @keyframes marquee-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
        
        @keyframes marquee-right {
          0% { transform: translateX(-33.333%); }
          100% { transform: translateX(0); }
        }
        
        :global(.animate-marquee-left) { animation: marquee-left linear infinite; }
        :global(.animate-marquee-right) { animation: marquee-right linear infinite; }
      `}</style>
    </section>
  )
}

// =============================================================================
// FAQ SECTION
// =============================================================================

const faqs = [
  {
    question: 'How does Harbor track competitor visibility?',
    answer: 'Harbor monitors mentions of your brand and competitors across ChatGPT, Claude, Gemini, and Perplexity. We run thousands of queries daily and track which brands get recommended, how they\'re described, and how often they appear.',
  },
  {
    question: 'How often is the data updated?',
    answer: 'Visibility data is updated daily. You\'ll see fresh snapshots each morning showing how your competitive position has changed.',
  },
  {
    question: 'Can I track competitors in different categories?',
    answer: 'Yes. You can set up multiple competitor groups and track different sets of brands for different use cases—direct competitors, category leaders, emerging players, etc.',
  },
  {
    question: 'What\'s included in the sentiment analysis?',
    answer: 'We analyze how AI models describe each brand—the adjectives used, the contexts they appear in, and the overall tone. This helps you understand perception gaps between you and competitors.',
  },
  {
    question: 'Do you offer alerts for competitive changes?',
    answer: 'Yes. You can set up alerts to get notified when a competitor\'s visibility score changes significantly, when they start appearing for new query types, or when your share of voice shifts.',
  },
]

function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section className="relative bg-[#F6F5F3] py-20 sm:py-28">
      <div className="max-w-3xl mx-auto px-6">
        
        {/* Header */}
        <div className="mb-12">
          <p className="text-sm font-medium text-[#6C6C6B] uppercase tracking-wider mb-3 font-source-sans">
            Questions? Answers.
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-black font-source-sans">
            Frequently asked questions
          </h2>
        </div>

        {/* FAQ Items */}
        <div className="space-y-2">
          {faqs.map((faq, index) => (
            <div key={index} className="border-b border-[#EFEEED]">
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between py-5 text-left"
              >
                <span className="text-black font-medium font-source-sans pr-4">{faq.question}</span>
                <ChevronDown 
                  className={`w-5 h-5 text-[#6C6C6B] flex-shrink-0 transition-transform ${
                    openIndex === index ? 'rotate-180' : ''
                  }`} 
                />
              </button>
              {openIndex === index && (
                <div className="pb-5">
                  <p className="text-[#6C6C6B] font-source-sans">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// =============================================================================
// FINAL CTA
// =============================================================================

function FinalCTA() {
  return (
    <section className="relative py-20 sm:py-28 bg-[#111111] overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-blue-500/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 font-source-sans">
          Start tracking your competitors today
        </h2>
        <p className="text-white/50 text-base max-w-xl mx-auto mb-8 font-source-sans">
          See how you stack up in AI search. Get started free, no credit card required.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/signup"
            className="px-8 py-4 rounded-lg bg-white text-black font-semibold text-sm hover:bg-white/90 transition-all flex items-center justify-center gap-2 font-source-sans"
          >
            Start free trial
          </Link>
          <Link
            href="/demo"
            className="px-8 py-4 rounded-lg bg-transparent border border-white/20 text-white font-semibold text-sm hover:bg-white/5 transition-all flex items-center justify-center gap-2 font-source-sans"
          >
            Book a demo
          </Link>
        </div>
      </div>
    </section>
  )
}

// =============================================================================
// FOOTER
// =============================================================================

function Footer() {
  return (
    <footer className="relative py-12 px-6 bg-[#111111] border-t border-white/[0.05]">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Image
                src="/images/Harbor_White_Logo.png"
                alt="Harbor"
                width={32}
                height={32}
                className="h-8 w-8"
              />
            </Link>
            <p className="text-white/40 text-sm leading-relaxed max-w-xs font-source-sans">
              AI visibility intelligence. See how ChatGPT, Claude, Gemini, and Perplexity talk about your brand.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-white/60 font-medium text-sm mb-4 font-source-sans">Product</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/features/competitors" className="text-white/40 hover:text-white text-sm transition-colors font-source-sans">
                  Competitors
                </Link>
              </li>
              <li>
                <Link href="/features/analytics" className="text-white/40 hover:text-white text-sm transition-colors font-source-sans">
                  Analytics
                </Link>
              </li>
              <li>
                <Link href="/features/sources" className="text-white/40 hover:text-white text-sm transition-colors font-source-sans">
                  Sources
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-white/40 hover:text-white text-sm transition-colors font-source-sans">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white/60 font-medium text-sm mb-4 font-source-sans">Company</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="text-white/40 hover:text-white text-sm transition-colors font-source-sans">
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-white/40 hover:text-white text-sm transition-colors font-source-sans">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-white/40 hover:text-white text-sm transition-colors font-source-sans">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-white/40 hover:text-white text-sm transition-colors font-source-sans">
                  Terms
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-white/[0.05] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/30 text-sm font-source-sans">
            © {new Date().getFullYear()} Harbor. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a 
              href="https://twitter.com/useharbor" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-white/30 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a 
              href="https://linkedin.com/company/useharbor" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-white/30 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

// =============================================================================
// PAGE
// =============================================================================

export default function CompetitorsPage() {
  return (
    <div className="min-h-screen bg-[#F6F5F3]">
      {/* Nav with high z-index */}
      <div className="relative z-50">
        <StickyNav />
        <MainNav />
      </div>
      
      {/* Content */}
      <div className="relative z-0">
        <Hero />
        <Features />
        <AlternatingSections />
        <ComparisonTable />
        <TipsCallout />
        <BrandMarquee />
        <FAQ />
        <FinalCTA />
        <Footer />
      </div>
    </div>
  )
}
