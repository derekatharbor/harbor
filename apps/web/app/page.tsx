// apps/web/app/page.tsx
// Harbor Homepage - Marketing landing page

import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import StickyNav from '@/components/marketing/StickyNav'

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
      
      <div className="min-h-screen bg-[#F6F5F3]">
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
    </>
  )
}