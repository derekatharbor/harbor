// apps/web/app/page.tsx
// Harbor Homepage - Marketing landing page

import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import StickyNav from '@/components/marketing/StickyNav'
import PromptsMarquee from '@/components/marketing/PromptsMarquee'

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
      
      <div className="h-[1728px] bg-[#F6F5F3] relative overflow-hidden">
        {/* Hero Noise Hills Background */}
        <img 
          src="/images/hero-noise.png"
          alt=""
          className="absolute bottom-0 left-0 w-full pointer-events-none"
        />

        {/* Navigation */}
        <nav className="flex items-center justify-between px-14 py-6">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/images/harbor-logo-black.svg"
              alt="Harbor"
              width={140}
              height={32}
              className="h-8 w-auto"
            />
          </Link>

          {/* Nav Buttons */}
          <div className="flex items-center gap-2.5">
            <Link 
              href="/login"
              className="h-[41px] px-6 rounded-[7px] border border-[#B1B0AF] text-[15px] font-medium font-space tracking-[0.69px] text-black hover:bg-black/5 transition-colors flex items-center"
            >
              Login
            </Link>
            <Link 
              href="/signup"
              className="btn-black h-[41px] px-6 rounded-[7px] text-[15px] font-medium font-space tracking-[0.69px] flex items-center"
            >
              Get started
            </Link>
          </div>
        </nav>

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
          <form className="flex items-center mt-6 h-12 bg-white rounded-[10px] border border-[#F0F0EF] overflow-hidden">
            <input
              type="email"
              name="email"
              placeholder="Enter your company email"
              className="w-[320px] h-full px-4 text-[15px] font-medium font-source-sans tracking-[0.69px] text-black placeholder:text-[#A0A0A0] bg-transparent outline-none"
              required
            />
            <button 
              type="submit"
              className="btn-black h-[38px] px-6 mr-1.5 rounded-[7px] text-[15px] font-medium font-source-sans tracking-[0.69px] whitespace-nowrap"
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
                <span className="text-[#272625] text-[12px] font-semibold font-source-sans">NEW</span>
              </div>
              <span className="text-white text-[14px] font-normal font-source-code">Track competitors</span>
            </div>

            <h2 className="text-white text-4xl font-semibold font-source-sans tracking-[0.69px]">
              See how AI sees your brand
            </h2>
            <p className="text-[#6C6C6B] text-xl font-source-code tracking-[0.69px] mt-6 max-w-xl mx-auto">
              Track your visibility across ChatGPT, Claude, Perplexity, and Gemini in one dashboard.
            </p>
            <button className="mt-8 h-12 px-8 rounded-[7px] bg-white text-black text-[15px] font-medium font-source-sans tracking-[0.69px] hover:bg-gray-100 transition-colors">
              Start tracking for free
            </button>
          </div>

          {/* Dashboard Preview Container */}
          <div className="relative max-w-5xl mx-auto">
            {/* Dashboard Placeholder */}
            <div className="relative aspect-[16/10] bg-[#1a1a1a] rounded-xl border border-white/10 overflow-hidden">
              {/* Placeholder content - will be replaced with actual screenshot */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white/20 text-lg font-source-code">Dashboard Screenshot</span>
              </div>
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

        {/* Marquee Section */}
        <PromptsMarquee />
      </section>

      {/* Features Section - Light */}
      <section id="light-section" className="w-full bg-[#F6F5F3]">
        <div className="max-w-[1440px] mx-auto px-14 py-24">
          {/* Text Content */}
          <div className="max-w-xl mx-auto text-center mb-16">
            <h3 className="text-black text-3xl font-semibold font-source-sans tracking-[0.69px] leading-tight">
              Stop guessing,<br />start growing
            </h3>
            <p className="text-[#6C6C6B] text-lg font-source-code tracking-[0.5px] mt-6 leading-relaxed">
              See exactly how AI models describe your brand. Track sentiment, visibility scores, and competitor comparisons across every major AI platform.
            </p>
          </div>

          {/* Screenshot/Windows Placeholder */}
          <div className="w-full max-w-4xl mx-auto aspect-[16/9] bg-white rounded-xl border border-black/10 shadow-sm flex items-center justify-center">
            <span className="text-black/20 text-lg font-source-code">Stacked Windows Placeholder</span>
          </div>

          {/* CTA Card */}
          <div className="w-full max-w-[1368px] mx-auto mt-24 bg-black rounded-[15px] h-[509px] px-8 flex flex-col items-center justify-center">
            {/* Headline */}
            <h2 className="text-center font-source-sans font-black tracking-tight" style={{ fontSize: '100px', lineHeight: '1' }}>
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
                AI SEARCH
              </span>
              <span className="text-white"> IS</span>
              <br />
              <span className="text-white">THE NEW SEO</span>
            </h2>

            {/* Email Input */}
            <div className="flex items-center mt-12 h-[43px] bg-[rgba(17,17,17,0.85)] rounded-[10px] border border-[#282828]">
              <input
                type="email"
                placeholder="Enter your company email"
                className="w-[220px] h-full px-4 text-[15px] font-light font-source-sans text-white placeholder:text-[#A6A6A6] bg-transparent outline-none"
              />
              <button className="h-[28px] px-4 mr-2 bg-white rounded-[5px] text-[12px] font-semibold font-source-sans text-black hover:bg-gray-100 transition-colors whitespace-nowrap">
                Get started
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}