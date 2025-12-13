// Path: /apps/web/app/brands/HarborIndexClient.tsx
// Brand Index - Claim-focused landing with search-first UX

'use client'

import { useState, useEffect } from 'react'
import { Search, ArrowRight, Plus, AlertTriangle, CheckCircle, XCircle, HelpCircle } from 'lucide-react'
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

// Featured brand domains for marquee (brands monitoring visibility)
const MARQUEE_BRANDS = [
  // Row 1 (moves left)
  ['asana.com', 'hubspot.com', 'salesforce.com', 'stripe.com', 'notion.so', 'figma.com', 'linear.app', 'vercel.com', 'supabase.com', 'planetscale.com', 'railway.app', 'render.com'],
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
            className="w-12 h-12 rounded-xl flex-shrink-0 overflow-hidden bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.12] transition-colors"
          >
            <img 
              src={`https://cdn.brandfetch.io/${domain}?c=1id1Fyz-h7an5-5KR_y`}
              alt={domain}
              className="w-full h-full object-contain p-2"
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
  const [isSearching, setIsSearching] = useState(false)

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
      setIsSearching(true)
      const query = searchQuery.toLowerCase()
      const results = directory.filter(brand =>
        brand.brand_name.toLowerCase().includes(query) ||
        brand.domain.toLowerCase().includes(query)
      ).slice(0, 6)
      setSearchResults(results)
      setShowSearchDropdown(true)
      setIsSearching(false)
    } else {
      setSearchResults([])
      setShowSearchDropdown(false)
    }
  }, [searchQuery, directory])

  return (
    <div className="min-h-screen bg-[#0B0B0C]">
      {/* Inject keyframes for iridescent effect */}
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

      {/* Hero Section - Search Focused */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          {/* Headline */}
          <h1 className="font-semibold text-4xl md:text-5xl lg:text-[56px] text-white/[0.94] leading-[1.1] tracking-tight mb-5">
            AI is already talking about your brand
          </h1>

          {/* Subhead */}
          <p className="text-lg text-white/50 max-w-xl mx-auto mb-10 font-normal">
            See what ChatGPT, Claude, and Perplexity say about you—and claim your profile to correct it.
          </p>

          {/* Search Box */}
          <div className="relative max-w-xl mx-auto">
            <div className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
              <input
                type="text"
                placeholder="Search for your brand..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.length >= 2 && setShowSearchDropdown(true)}
                onBlur={() => setTimeout(() => setShowSearchDropdown(false), 200)}
                className="w-full pl-14 pr-5 py-4 bg-[#111213] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-white/[0.16] transition-all duration-100 text-base"
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
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#111213] rounded-xl border border-white/[0.08] shadow-xl p-6 text-center z-50">
                <p className="text-white/50 text-sm mb-4">No brand found for "{searchQuery}"</p>
                <Link
                  href={`/auth/signup?brand=${encodeURIComponent(searchQuery)}`}
                  className="iridescent-hover inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white text-black text-sm font-medium transition-all duration-100"
                >
                  <span className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Add "{searchQuery}" to the Index
                  </span>
                </Link>
              </div>
            )}
          </div>

          {/* Helper text */}
          <p className="text-white/30 text-sm mt-4">
            Can't find your brand? <Link href="/auth/signup" className="text-white/50 hover:text-white/70 underline underline-offset-2 transition-colors">Add it for free</Link>
          </p>
        </div>
      </section>

      {/* Problem Section - Why This Matters */}
      <section className="py-16 px-6 border-t border-white/[0.04]">
        <div className="max-w-5xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 mb-4">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-amber-400 text-xs font-medium">The Problem</span>
            </div>
            <h2 className="font-semibold text-2xl md:text-3xl text-white/90 mb-3">
              AI gets your brand wrong more than you think
            </h2>
            <p className="text-white/40 max-w-lg mx-auto">
              We tested GPT-4o on SMB pricing queries. The results were alarming.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            <div className="bg-[#111213] border border-white/[0.06] rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-red-400" />
                </div>
                <span className="text-3xl font-semibold text-white/90">30%</span>
              </div>
              <p className="text-white/40 text-sm">
                Confidently wrong answers when AI provided specific pricing
              </p>
            </div>

            <div className="bg-[#111213] border border-white/[0.06] rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <HelpCircle className="w-5 h-5 text-amber-400" />
                </div>
                <span className="text-3xl font-semibold text-white/90">50%</span>
              </div>
              <p className="text-white/40 text-sm">
                Of specific pricing answers were incorrect or misleading
              </p>
            </div>

            <div className="bg-[#111213] border border-white/[0.06] rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                </div>
                <span className="text-3xl font-semibold text-white/90">20%</span>
              </div>
              <p className="text-white/40 text-sm">
                Actually correct—the rest was wrong, vague, or refused
              </p>
            </div>
          </div>

          {/* Example Hallucinations */}
          <div className="bg-[#111213] border border-white/[0.06] rounded-xl p-6">
            <h3 className="text-white/70 text-sm font-medium mb-4">Real examples from our test:</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-4 pb-4 border-b border-white/[0.04]">
                <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <XCircle className="w-4 h-4 text-red-400" />
                </div>
                <div>
                  <p className="text-white/70 text-sm">
                    <span className="text-white/90 font-medium">100Devs pricing:</span> GPT said "free coding bootcamp" — actual price is <span className="text-emerald-400">$200/month</span>
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 pb-4 border-b border-white/[0.04]">
                <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <XCircle className="w-4 h-4 text-red-400" />
                </div>
                <div>
                  <p className="text-white/70 text-sm">
                    <span className="text-white/90 font-medium">ISSA certification:</span> GPT said "$600-1,200" — actual price is <span className="text-emerald-400">$49 down</span>
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <XCircle className="w-4 h-4 text-red-400" />
                </div>
                <div>
                  <p className="text-white/70 text-sm">
                    <span className="text-white/90 font-medium">10 Fitness membership:</span> GPT said "$10-30/month" — actual price is <span className="text-emerald-400">$7.95 bi-weekly</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-6 border-t border-white/[0.04]">
        <div className="max-w-5xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="font-semibold text-2xl md:text-3xl text-white/90 mb-3">
              Claim your brand in 2 minutes
            </h2>
            <p className="text-white/40 max-w-lg mx-auto">
              See what AI says, correct what's wrong, and monitor your visibility.
            </p>
          </div>

          {/* Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="bg-[#111213] border border-white/[0.06] rounded-xl p-6 text-center">
              <div className="w-20 h-20 mx-auto mb-5 rounded-2xl overflow-hidden">
                <Image
                  src="/icons/step-brand.png"
                  alt="Search"
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-white/30 text-xs font-medium mb-2">Step 1</div>
              <h3 className="text-white/90 font-medium mb-2">Search your brand</h3>
              <p className="text-white/40 text-sm">
                Find your company in our index or add it if it's not listed yet.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-[#111213] border border-white/[0.06] rounded-xl p-6 text-center">
              <div className="w-20 h-20 mx-auto mb-5 rounded-2xl overflow-hidden">
                <Image
                  src="/icons/step-products.png"
                  alt="Review"
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-white/30 text-xs font-medium mb-2">Step 2</div>
              <h3 className="text-white/90 font-medium mb-2">See what AI says</h3>
              <p className="text-white/40 text-sm">
                View how ChatGPT, Claude, and Perplexity describe your brand.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-[#111213] border border-white/[0.06] rounded-xl p-6 text-center">
              <div className="w-20 h-20 mx-auto mb-5 rounded-2xl overflow-hidden">
                <Image
                  src="/icons/step-faqs.png"
                  alt="Claim"
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-white/30 text-xs font-medium mb-2">Step 3</div>
              <h3 className="text-white/90 font-medium mb-2">Claim & correct</h3>
              <p className="text-white/40 text-sm">
                Verify ownership and update your pricing, features, and info.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof - Brand Marquee */}
      <section className="py-16 px-6 border-t border-white/[0.04]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <p className="text-white/30 text-sm font-medium">
              Brands monitoring their AI visibility
            </p>
          </div>
          
          <div className="space-y-2 opacity-60">
            <MarqueeRow domains={MARQUEE_BRANDS[0]} direction="left" speed={40} />
            <MarqueeRow domains={MARQUEE_BRANDS[1]} direction="right" speed={45} />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6 border-t border-white/[0.04]">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-semibold text-2xl md:text-3xl text-white/90 mb-4">
            Don't let AI speak for you
          </h2>
          
          <p className="text-white/40 mb-8 max-w-md mx-auto">
            Claim your brand profile for free. See what AI says, correct what's wrong.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/auth/signup"
              className="iridescent-hover px-6 py-3 bg-white text-black font-medium rounded-xl transition-all duration-100"
            >
              <span>Claim Your Brand</span>
            </Link>
            
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="px-6 py-3 bg-white/[0.04] border border-white/[0.08] text-white/70 font-medium rounded-xl hover:bg-white/[0.06] hover:text-white/90 transition-all duration-100"
            >
              Search the Index
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}