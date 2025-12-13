// Path: /apps/web/app/brands/HarborIndexClient.tsx
// Brand Index - Claim-focused landing with search-first UX
// Design: Yelp's claim flow + Linear's calm confidence

'use client'

import { useState, useEffect } from 'react'
import { Search, ArrowRight, Plus } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import Nav from '@/components/landing-new/Nav'
import Footer from '@/components/landing-new/Footer'

interface DirectoryBrand {
  id: string
  brand_name: string
  slug: string
  domain: string
  logo_url: string
  industry: string
}

interface Props {
  initialDirectory?: DirectoryBrand[]
}

// Featured brand domains for marquee
const MARQUEE_BRANDS = [
  // Row 1 (moves left)
  ['linear.app', 'vercel.com', 'supabase.com', 'stripe.com', 'notion.so', 'figma.com', 'asana.com', 'hubspot.com', 'salesforce.com', 'planetscale.com', 'railway.app', 'render.com'],
  // Row 2 (moves right)  
  ['shopify.com', 'squarespace.com', 'webflow.com', 'framer.com', 'canva.com', 'miro.com', 'loom.com', 'calendly.com', 'typeform.com', 'airtable.com', 'monday.com', 'clickup.com'],
]

// Marquee Row Component
function MarqueeRow({ domains, direction, speed = 35 }: { domains: string[], direction: 'left' | 'right', speed?: number }) {
  const duplicatedDomains = [...domains, ...domains, ...domains]
  
  return (
    <div className="flex overflow-hidden py-2">
      <div 
        className={`flex gap-4 ${direction === 'left' ? 'animate-marquee-left' : 'animate-marquee-right'}`}
        style={{ animationDuration: `${speed}s` }}
      >
        {duplicatedDomains.map((domain, idx) => (
          <div 
            key={`${domain}-${idx}`}
            className="w-12 h-12 rounded-xl flex-shrink-0 overflow-hidden bg-white/[0.03] border border-white/[0.06]"
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

export default function HarborIndexClient({ initialDirectory = [] }: Props) {
  const [directory, setDirectory] = useState<DirectoryBrand[]>(initialDirectory)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<DirectoryBrand[]>([])
  const [showSearchDropdown, setShowSearchDropdown] = useState(false)

  // Fetch directory on mount if not provided
  useEffect(() => {
    if (initialDirectory.length === 0) {
      fetch('/api/index/brands')
        .then(res => res.json())
        .then(data => {
          if (data.directory) setDirectory(data.directory)
        })
        .catch(err => console.error('Failed to fetch brands:', err))
    }
  }, [initialDirectory.length])

  // Handle search
  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      const query = searchQuery.toLowerCase()
      const results = directory.filter(brand =>
        brand.brand_name.toLowerCase().includes(query) ||
        brand.domain.toLowerCase().includes(query)
      ).slice(0, 6)
      setSearchResults(results)
      setShowSearchDropdown(true)
    } else {
      setSearchResults([])
      setShowSearchDropdown(false)
    }
  }, [searchQuery, directory])

  return (
    <div className="min-h-screen bg-[#0B0B0C]">
      {/* Inject keyframes */}
      <style jsx global>{`
        @keyframes iridescent-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        @keyframes marquee-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
        
        @keyframes marquee-right {
          0% { transform: translateX(-33.333%); }
          100% { transform: translateX(0); }
        }
        
        .animate-marquee-left {
          animation: marquee-left linear infinite;
        }
        
        .animate-marquee-right {
          animation: marquee-right linear infinite;
        }
        
        .iridescent-hover {
          position: relative;
          overflow: hidden;
        }
        
        .iridescent-hover::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(
            135deg,
            rgba(102, 126, 234, 0.9) 0%,
            rgba(118, 75, 162, 0.9) 25%,
            rgba(240, 147, 251, 0.9) 50%,
            rgba(94, 231, 223, 0.9) 75%,
            rgba(102, 126, 234, 0.9) 100%
          );
          background-size: 300% 300%;
          opacity: 0;
          transition: opacity 120ms ease-out;
          animation: iridescent-shift 4s ease infinite;
        }
        
        .iridescent-hover:hover::before {
          opacity: 1;
        }
        
        .iridescent-hover:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 32px rgba(102, 126, 234, 0.25);
        }
        
        .iridescent-hover span {
          position: relative;
          z-index: 1;
        }
      `}</style>

      <Nav />

      {/* Hero Section - Search Dominates */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-2xl mx-auto text-center">
          {/* Headline */}
          <h1 className="font-semibold text-4xl md:text-5xl lg:text-[52px] text-white/[0.94] leading-[1.1] tracking-tight mb-4">
            AI is already talking about your brand
          </h1>

          {/* Subhead - Operational, not abstract */}
          <p className="text-lg text-white/40 mb-10">
            Search the index. See what models say. Claim your brand.
          </p>

          {/* Search Box - The focal point */}
          <div className="relative max-w-lg mx-auto mb-4">
            <div className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
              <input
                type="text"
                placeholder="Search for your brand..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.length >= 2 && setShowSearchDropdown(true)}
                onBlur={() => setTimeout(() => setShowSearchDropdown(false), 200)}
                className="w-full pl-14 pr-5 py-4 bg-[#111213] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/10 transition-all duration-100 text-base"
              />
            </div>

            {/* Search Dropdown */}
            {showSearchDropdown && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#111213] rounded-xl border border-white/[0.08] shadow-xl overflow-hidden z-50">
                {searchResults.map((brand) => (
                  <Link
                    key={brand.id}
                    href={`/brands/${brand.slug}`}
                    className="flex items-center gap-4 px-5 py-3 hover:bg-white/[0.04] transition-colors duration-100"
                  >
                    <div className="w-10 h-10 rounded-lg bg-white overflow-hidden flex-shrink-0">
                      <Image
                        src={brand.logo_url}
                        alt={brand.brand_name}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder-logo.svg'
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white/90 font-medium text-sm truncate">{brand.brand_name}</div>
                      <div className="text-white/40 text-xs truncate">{brand.domain}</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-white/30" />
                  </Link>
                ))}
              </div>
            )}

            {/* No Results State */}
            {showSearchDropdown && searchQuery.length >= 2 && searchResults.length === 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#111213] rounded-xl border border-white/[0.08] shadow-xl p-5 text-center z-50">
                <p className="text-white/40 text-sm mb-3">Not in the index yet</p>
                <Link
                  href={`/auth/signup?brand=${encodeURIComponent(searchQuery)}`}
                  className="iridescent-hover inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-black text-sm font-medium transition-all duration-100"
                >
                  <span className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Add {searchQuery}
                  </span>
                </Link>
              </div>
            )}
          </div>

          {/* Trust reinforcement */}
          <p className="text-white/20 text-sm">
            50,000+ brands indexed across every industry
          </p>
        </div>
      </section>

      {/* Problem Section - Compressed to one stat + one line */}
      <section className="py-12 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-6 px-6 py-4 bg-[#111213] border border-white/[0.06] rounded-xl">
            <span className="text-3xl font-semibold text-white/90">30%</span>
            <span className="text-white/40 text-sm text-left max-w-xs">
              of AI pricing answers are confidently wrong. Your customers are seeing bad data.
            </span>
          </div>
        </div>
      </section>

      {/* How It Works - Declarative, inevitable */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-10">
            <h2 className="font-semibold text-2xl text-white/90">
              Claim your brand in 2 minutes
            </h2>
          </div>

          {/* Steps - Horizontal flow, smaller icons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-xl overflow-hidden">
                <Image
                  src="/icons/step-brand.png"
                  alt="Search"
                  width={56}
                  height={56}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-white/80 font-medium text-sm mb-1">Search the index</h3>
              <p className="text-white/30 text-xs">Find your brand</p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-xl overflow-hidden">
                <Image
                  src="/icons/step-products.png"
                  alt="Review"
                  width={56}
                  height={56}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-white/80 font-medium text-sm mb-1">See what AI says</h3>
              <p className="text-white/30 text-xs">Review model outputs</p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-xl overflow-hidden">
                <Image
                  src="/icons/step-faqs.png"
                  alt="Claim"
                  width={56}
                  height={56}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-white/80 font-medium text-sm mb-1">Claim and correct</h3>
              <p className="text-white/30 text-xs">Fix what's wrong</p>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Marquee - Changed copy */}
      <section className="py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-6">
            <p className="text-white/20 text-sm">
              Indexed across every industry
            </p>
          </div>
          
          <div className="space-y-3 opacity-50">
            <MarqueeRow domains={MARQUEE_BRANDS[0]} direction="left" speed={40} />
            <MarqueeRow domains={MARQUEE_BRANDS[1]} direction="right" speed={45} />
          </div>
        </div>
      </section>

      {/* Final CTA - Single action */}
      <section className="py-20 px-6">
        <div className="max-w-xl mx-auto text-center">
          <Link
            href="/auth/signup"
            className="iridescent-hover inline-flex items-center gap-2 px-8 py-4 bg-white text-black font-medium rounded-xl transition-all duration-100"
          >
            <span>Claim Your Brand</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}