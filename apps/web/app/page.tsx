// app/page.tsx
// Harbor Homepage - Marketing landing page

import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import StickyNav from '@/components/marketing/StickyNav'
import MainNav from '@/components/marketing/MainNav'
import PromptsMarquee from '@/components/marketing/PromptsMarquee'
import AudienceTabs from '@/components/marketing/AudienceTabs'

export const metadata: Metadata = {
  title: 'Harbor - AI Visibility Analytics',
  description: 'Visibility analytics to win AI search. Measure your presence across AI answers and competitor comparisons. See how ChatGPT, Claude, and Perplexity describe your brand.',
  keywords: [
    'AI visibility',
    'AI search analytics',
    'brand visibility',
    'ChatGPT brand',
    'AI search optimization',
    'generative engine optimization',
    'GEO',
    'AI brand monitoring',
  ],
  openGraph: {
    title: 'Harbor - AI Visibility Analytics',
    description: 'Visibility analytics to win AI search. Measure your presence across AI answers and competitor comparisons.',
    url: 'https://useharbor.io',
    siteName: 'Harbor',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Harbor - AI Visibility Analytics',
    description: 'Visibility analytics to win AI search.',
  },
  alternates: {
    canonical: 'https://useharbor.io',
  },
}

export default function HomePage() {
  const siteUrl = 'https://useharbor.io'
  
  const schemaOrgData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    'name': 'Harbor',
    'description': 'AI visibility analytics. Measure your presence across AI answers and competitor comparisons.',
    'url': siteUrl,
    'publisher': {
      '@type': 'Organization',
      'name': 'Harbor',
      'url': siteUrl,
      'logo': `${siteUrl}/logo-icon.png`
    },
    'potentialAction': {
      '@type': 'SearchAction',
      'target': {
        '@type': 'EntryPoint',
        'urlTemplate': `${siteUrl}/brands/{search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    }
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schemaOrgData)
        }}
      />
      
      {/* Sticky Nav - appears on scroll */}
      <StickyNav />
      
      <div className="h-[1040px] bg-[#F6F5F3] relative overflow-hidden">
        {/* Hero Noise Hills Background */}
        <img 
          src="/images/hero-noise.png"
          alt=""
          className="absolute bottom-0 left-0 w-full pointer-events-none"
        />

        {/* Navigation */}
        <MainNav />

        {/* Hero Content */}
        <div className="flex flex-col items-center pt-[100px]">
          {/* NEW Badge */}
          <Link 
            href="/pitch"
            className="flex items-center gap-1.5 h-8 px-2 bg-white rounded-[7px] shadow-[0px_2px_2px_rgba(120,120,120,0.25)] mb-8 hover:shadow-[0px_3px_6px_rgba(120,120,120,0.3)] transition-shadow"
          >
            <span className="px-2 py-0.5 bg-black rounded-[3px] text-[12px] font-semibold font-source-code tracking-[0.69px] text-white">
              NEW
            </span>
            <span className="text-[12px] font-semibold font-source-sans tracking-[0.69px] text-black">
              Try our new Agency Pitch space
            </span>
          </Link>

          {/* Headline */}
          <h1 className="w-[448px] text-center text-[50px] font-semibold font-source-sans tracking-[0.69px] text-black leading-[1.04]">
            Visibility analytics to win AI search
          </h1>

          {/* Subheadline */}
          <p className="w-[448px] mt-6 text-center text-[20px] font-normal font-source-code tracking-[0.69px] text-[#6C6C6B]">
            Measure your presence across AI answers and competitor comparisons.
          </p>

          {/* Email Input + CTA */}
          <form className="flex items-center mt-8 h-14 bg-white rounded-[10px] border border-[#E8E8E7] shadow-sm">
            <input
              type="email"
              name="email"
              placeholder="Enter your company email"
              className="w-[340px] h-full px-5 text-[16px] font-normal font-source-sans tracking-[0.5px] text-black placeholder:text-[#A0A0A0] bg-transparent outline-none"
              required
            />
            <button 
              type="submit"
              className="btn-black h-[42px] px-7 mr-1.5 rounded-[7px] text-[15px] font-medium font-source-sans tracking-[0.69px] whitespace-nowrap"
            >
              Get started
            </button>
          </form>
        </div>

        {/* Dashboard Preview - placeholder for now */}
        {/* TODO: Add dashboard screenshot below the fold */}
        
      </div>

      {/* Dark Section */}
      <section id="dark-section" className="w-full bg-[#111111]">
        <div className="max-w-[1440px] mx-auto px-14 py-24">
          {/* Section Header */}
          <div className="text-center mb-16">
            {/* NEW Pill */}
            <div className="inline-flex items-center gap-2 h-[34px] px-3 bg-[#272625] rounded-[9px] mb-6">
              <div className="flex items-center justify-center w-[44px] h-[22px] rounded-[5px] overflow-hidden"
                style={{
                  backgroundImage: 'url(/images/holographic-bg.png)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                <span className="text-[10px] font-bold font-source-code text-black tracking-wider">NEW</span>
              </div>
              <span className="text-[13px] font-medium font-source-sans text-white/80">
                Competitor Intelligence
              </span>
            </div>

            {/* Headline */}
            <h2 className="text-[42px] font-semibold font-source-sans tracking-tight text-white leading-tight">
              See how you compare
            </h2>
            <p className="mt-4 text-[18px] font-normal font-source-code text-white/50 max-w-[500px] mx-auto">
              Track your brand visibility against competitors across all major AI platforms.
            </p>
          </div>

          {/* Dashboard Preview Container */}
          <div className="relative max-w-5xl mx-auto">
            {/* Dashboard Screenshot */}
            <div className="relative aspect-[16/10] bg-[#1a1a1a] rounded-xl border border-white/10 overflow-hidden">
              <img 
                src="/images/dashboard-preview.png"
                alt="Harbor Dashboard"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Hovering Prompt Card - Left */}
            <div className="absolute -left-8 top-1/4 animate-float-slow">
              <div className="flex items-start gap-3 p-4 bg-[#1a1a1a] rounded-xl border border-white/10 shadow-[0px_4px_20px_rgba(0,0,0,0.4)] max-w-[280px]">
                <div className="w-8 h-8 rounded-lg flex-shrink-0 overflow-hidden bg-white/5">
                  <img
                    src="https://cdn.brandfetch.io/openai.com?c=1id1Fyz-h7an5-5KR_y"
                    alt="ChatGPT"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="text-white text-sm font-medium leading-snug">Best CRM for small businesses?</p>
                  <p className="text-white/40 text-xs mt-1">ChatGPT • 2.4M monthly searches</p>
                </div>
              </div>
            </div>

            {/* Hovering Prompt Card - Right */}
            <div className="absolute -right-8 top-1/3 animate-float-delayed">
              <div className="flex items-start gap-3 p-4 bg-[#1a1a1a] rounded-xl border border-white/10 shadow-[0px_4px_20px_rgba(0,0,0,0.4)] max-w-[280px]">
                <div className="w-8 h-8 rounded-lg flex-shrink-0 overflow-hidden bg-white/5">
                  <img
                    src="https://cdn.brandfetch.io/perplexity.ai?c=1id1Fyz-h7an5-5KR_y"
                    alt="Perplexity"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="text-white text-sm font-medium leading-snug">Compare HubSpot vs Salesforce</p>
                  <p className="text-white/40 text-xs mt-1">Perplexity • 1.8M monthly searches</p>
                </div>
              </div>
            </div>

            {/* Hovering Prompt Card - Bottom Left */}
            <div className="absolute -left-4 bottom-1/4 animate-float">
              <div className="flex items-start gap-3 p-4 bg-[#1a1a1a] rounded-xl border border-white/10 shadow-[0px_4px_20px_rgba(0,0,0,0.4)] max-w-[260px]">
                <div className="w-8 h-8 rounded-lg flex-shrink-0 overflow-hidden bg-white/5">
                  <img
                    src="https://cdn.brandfetch.io/anthropic.com?c=1id1Fyz-h7an5-5KR_y"
                    alt="Claude"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="text-white text-sm font-medium leading-snug">What's the easiest CRM to use?</p>
                  <p className="text-white/40 text-xs mt-1">Claude • 890K monthly searches</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Prompts Marquee */}
        <PromptsMarquee />
      </section>

      {/* Light Section */}
      <section id="light-section" className="w-full bg-[#F6F5F3] py-24">
        <div className="max-w-[1200px] mx-auto px-14">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-[42px] font-semibold font-source-sans tracking-tight text-black leading-tight">
              See your brand through AI&apos;s eyes
            </h2>
            <p className="mt-4 text-[18px] font-normal font-source-code text-[#6F6E6E] max-w-[500px] mx-auto">
              Understand how ChatGPT, Claude, Perplexity, and Gemini describe your brand to millions of users.
            </p>
          </div>

          {/* Stacked Windows Visual Placeholder */}
          <div className="max-w-[800px] mx-auto h-[400px] bg-white rounded-xl border border-[#EFEEED] flex items-center justify-center text-[#6F6E6E] text-sm font-source-code">
            Stacked windows visual
          </div>
        </div>
      </section>

      {/* CTA Card Section */}
      <section className="w-full bg-[#F6F5F3] pb-24">
        <div className="max-w-[1200px] mx-auto px-14">
          <div 
            className="w-full rounded-[20px] py-16 px-12 flex flex-col items-center"
            style={{ backgroundColor: '#10054D' }}
          >
            {/* Headline */}
            <h2 className="text-center font-source-sans font-black tracking-tight mb-8" style={{ fontSize: '90px', lineHeight: '1' }}>
              <span 
                style={{
                  backgroundImage: 'url(/images/holographic-bg.png)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  filter: 'drop-shadow(0 0 30px rgba(255, 255, 255, 0.4))',
                }}
              >
                AI SEARCH
              </span>
              <br />
              <span className="text-white">IS THE NEW SEO</span>
            </h2>

            {/* Email Capture */}
            <div className="flex items-center h-[52px] bg-[#1a1a3e]/50 rounded-[10px] border border-white/20">
              <input
                type="email"
                placeholder="Enter your company email"
                className="w-[280px] h-full px-5 text-[15px] font-light font-source-sans text-white placeholder:text-white/50 bg-transparent outline-none"
              />
              <button className="h-[38px] px-5 mr-1.5 bg-white rounded-[6px] text-[13px] font-semibold font-source-sans text-black hover:bg-gray-100 transition-colors whitespace-nowrap">
                Get started
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Audience Tabs Section */}
      <AudienceTabs />

      {/* Features Grid Section */}
      <section className="w-full bg-[#F6F5F3] py-24">
        <div className="max-w-[1200px] mx-auto px-14">
          {/* Section Header */}
          <h2 className="text-[42px] font-medium font-source-sans tracking-tight text-black leading-tight mb-16 max-w-[500px]">
            Understand how AI sees your brand
          </h2>

          {/* 4 Cards Grid */}
          <div className="grid grid-cols-4 gap-4">
            {/* Card 1 */}
            <div className="bg-white rounded-[10px] p-6">
              <img src="/images/icons/icon-visibility.png" alt="" className="w-8 h-8 mb-5" />
              <h3 className="text-[22px] font-medium font-source-sans text-black leading-tight mb-3">
                Track AI visibility across platforms
              </h3>
              <p className="text-[16px] font-normal font-source-sans text-[#6F6E6E] leading-relaxed">
                Monitor how ChatGPT, Claude, Perplexity, and Gemini describe your brand in real-time.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-[10px] p-6">
              <img src="/images/icons/icon-benchmark.png" alt="" className="w-8 h-8 mb-5" />
              <h3 className="text-[22px] font-medium font-source-sans text-black leading-tight mb-3">
                Benchmark against competitors
              </h3>
              <p className="text-[16px] font-normal font-source-sans text-[#6F6E6E] leading-relaxed">
                See how you stack up against competitors in AI recommendations and brand perception.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-[10px] p-6">
              <img src="/images/icons/icon-insights.png" alt="" className="w-8 h-8 mb-5" />
              <h3 className="text-[22px] font-medium font-source-sans text-black leading-tight mb-3">
                Get actionable insights
              </h3>
              <p className="text-[16px] font-normal font-source-sans text-[#6F6E6E] leading-relaxed">
                Receive recommendations on how to improve your AI visibility and brand positioning.
              </p>
            </div>

            {/* Card 4 */}
            <div className="bg-white rounded-[10px] p-6">
              <img src="/images/icons/icon-sentiment.png" alt="" className="w-8 h-8 mb-5" />
              <h3 className="text-[22px] font-medium font-source-sans text-black leading-tight mb-3">
                Monitor brand sentiment
              </h3>
              <p className="text-[16px] font-normal font-source-sans text-[#6F6E6E] leading-relaxed">
                Track how AI models perceive your brand over time and catch issues before they spread.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="w-full bg-[#111111] py-24">
        <div className="max-w-[1200px] mx-auto px-14 flex flex-col items-center">
          {/* Headline - can be replaced with image */}
          <h2 className="text-center font-source-sans font-black tracking-tight mb-10" style={{ fontSize: '72px', lineHeight: '1' }}>
            <span className="text-white">UNLOCK YOUR</span>
            <br />
            <span 
              style={{
                backgroundImage: 'url(/images/holographic-bg.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              AI VISIBILITY
            </span>
          </h2>

          {/* Email Capture */}
          <div className="flex items-center h-[56px] bg-[#1a1a1a] rounded-[10px] border border-[#333]">
            <input
              type="email"
              placeholder="Enter your company email"
              className="w-[300px] h-full px-5 text-[16px] font-light font-source-sans text-white placeholder:text-[#666] bg-transparent outline-none"
            />
            <button className="h-[42px] px-6 mr-2 bg-white rounded-[7px] text-[14px] font-semibold font-source-sans text-black hover:bg-gray-100 transition-colors whitespace-nowrap">
              Get free trial
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-[#111111] pt-16 pb-8 border-t border-[#222]">

      {/* Floating card animations */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        .animate-float-slow {
          animation: float-slow 5s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 4.5s ease-in-out infinite 0.5s;
        }
      `}</style>
        <div className="max-w-[1200px] mx-auto px-14">
          {/* Footer Content */}
          <div className="flex gap-16 mb-16">
            {/* Logo Column */}
            <div className="w-[200px] flex-shrink-0">
              <img 
                src="/images/Harbor_White_Logo.png" 
                alt="Harbor" 
                className="w-10 h-10 mb-6"
              />
            </div>

            {/* Product Column */}
            <div className="flex-1">
              <h4 className="text-white text-[18px] font-semibold font-source-sans mb-6">Product</h4>
              <ul className="space-y-4">
                <li><Link href="/features/brand-visibility" className="text-[#888] text-[15px] font-source-sans hover:text-white transition-colors">Brand Visibility</Link></li>
                <li><Link href="/features/shopping" className="text-[#888] text-[15px] font-source-sans hover:text-white transition-colors">Shopping Intelligence</Link></li>
                <li><Link href="/features/conversations" className="text-[#888] text-[15px] font-source-sans hover:text-white transition-colors">Conversation Tracking</Link></li>
                <li><Link href="/features/analytics" className="text-[#888] text-[15px] font-source-sans hover:text-white transition-colors">Website Analytics</Link></li>
              </ul>
            </div>

            {/* Company Column */}
            <div className="flex-1">
              <h4 className="text-white text-[18px] font-semibold font-source-sans mb-6">Company</h4>
              <ul className="space-y-4">
                <li><Link href="/pricing" className="text-[#888] text-[15px] font-source-sans hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/about" className="text-[#888] text-[15px] font-source-sans hover:text-white transition-colors">About us</Link></li>
                <li><Link href="/blog" className="text-[#888] text-[15px] font-source-sans hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="/contact" className="text-[#888] text-[15px] font-source-sans hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>

            {/* Resources Column */}
            <div className="flex-1">
              <h4 className="text-white text-[18px] font-semibold font-source-sans mb-6">Resources</h4>
              <ul className="space-y-4">
                <li><Link href="/index" className="text-[#888] text-[15px] font-source-sans hover:text-white transition-colors">Brand Index</Link></li>
                <li><Link href="/docs" className="text-[#888] text-[15px] font-source-sans hover:text-white transition-colors">Documentation</Link></li>
                <li><Link href="/help" className="text-[#888] text-[15px] font-source-sans hover:text-white transition-colors">Help Center</Link></li>
              </ul>
            </div>

            {/* Contact Column */}
            <div className="flex-1">
              <h4 className="text-white text-[18px] font-semibold font-source-sans mb-6">Contact</h4>
              <ul className="space-y-4">
                <li><a href="mailto:hello@useharbor.io" className="text-[#888] text-[15px] font-source-sans hover:text-white transition-colors">hello@useharbor.io</a></li>
                <li><a href="https://twitter.com/useharbor" target="_blank" rel="noopener noreferrer" className="text-[#888] text-[15px] font-source-sans hover:text-white transition-colors">Twitter / X</a></li>
                <li><a href="https://linkedin.com/company/useharbor" target="_blank" rel="noopener noreferrer" className="text-[#888] text-[15px] font-source-sans hover:text-white transition-colors">LinkedIn</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="flex items-center justify-between pt-8 border-t border-[#222]">
            <p className="text-[#666] text-[14px] font-source-sans">
              © 2025 Harbor
            </p>
            <div className="flex items-center gap-8">
              <Link href="/privacy" className="text-[#666] text-[14px] font-source-sans hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="text-[#666] text-[14px] font-source-sans hover:text-white transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}