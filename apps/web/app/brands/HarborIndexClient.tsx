// Path: /apps/web/app/brands/HarborIndexClient.tsx
// Brand Index - Comprehensive explanation page
// Reference: Linear's landing page density + Yelp's claim clarity

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

// Featured brand domains for marquee
const MARQUEE_BRANDS = [
  ['linear.app', 'vercel.com', 'supabase.com', 'stripe.com', 'notion.so', 'figma.com', 'asana.com', 'hubspot.com', 'salesforce.com', 'planetscale.com', 'railway.app', 'render.com'],
  ['shopify.com', 'squarespace.com', 'webflow.com', 'framer.com', 'canva.com', 'miro.com', 'loom.com', 'calendly.com', 'typeform.com', 'airtable.com', 'monday.com', 'clickup.com'],
]

// Marquee Row Component
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
            className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl flex-shrink-0 overflow-hidden bg-white/[0.03] border border-white/[0.06]"
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

export default function HarborIndexClient() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<DirectoryBrand[]>([])
  const [showSearchDropdown, setShowSearchDropdown] = useState(false)
  const [searching, setSearching] = useState(false)
  const [activeModal, setActiveModal] = useState<string | null>(null)
  
  // Claim modal state
  const [showClaimModal, setShowClaimModal] = useState(false)
  const [claimSearchQuery, setClaimSearchQuery] = useState('')
  const [claimSearchResults, setClaimSearchResults] = useState<DirectoryBrand[]>([])
  const [claimSearching, setClaimSearching] = useState(false)

  // Server-side search with debounce
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([])
      setShowSearchDropdown(false)
      return
    }

    const debounceTimer = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await fetch(`/api/index/brands/search?q=${encodeURIComponent(searchQuery)}`)
        const data = await res.json()
        console.log('Search results for', searchQuery, ':', data.results?.length || 0)
        setSearchResults(data.results || [])
        setShowSearchDropdown(true)
      } catch (err) {
        console.error('Search failed:', err)
        setSearchResults([])
      }
      setSearching(false)
    }, 150)

    return () => clearTimeout(debounceTimer)
  }, [searchQuery])

  // Claim modal search with debounce
  useEffect(() => {
    if (claimSearchQuery.trim().length < 2) {
      setClaimSearchResults([])
      return
    }

    const debounceTimer = setTimeout(async () => {
      setClaimSearching(true)
      try {
        const res = await fetch(`/api/index/brands/search?q=${encodeURIComponent(claimSearchQuery)}`)
        const data = await res.json()
        setClaimSearchResults(data.results || [])
      } catch (err) {
        console.error('Claim search failed:', err)
        setClaimSearchResults([])
      }
      setClaimSearching(false)
    }, 150)

    return () => clearTimeout(debounceTimer)
  }, [claimSearchQuery])

  // Reset claim modal state when closed
  useEffect(() => {
    if (!showClaimModal) {
      setClaimSearchQuery('')
      setClaimSearchResults([])
    }
  }, [showClaimModal])

  return (
    <div className="min-h-screen bg-[#0B0B0C]">
      <style jsx global>{`
        @keyframes holographic-shift {
          0% { 
            background-position: 0% 50%;
            filter: hue-rotate(0deg);
          }
          25% { 
            background-position: 50% 0%;
            filter: hue-rotate(15deg);
          }
          50% { 
            background-position: 100% 50%;
            filter: hue-rotate(0deg);
          }
          75% { 
            background-position: 50% 100%;
            filter: hue-rotate(-15deg);
          }
          100% { 
            background-position: 0% 50%;
            filter: hue-rotate(0deg);
          }
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
          inset: -2px;
          background: radial-gradient(
            ellipse at 30% 40%,
            rgba(180, 220, 255, 0.95) 0%,
            rgba(200, 180, 255, 0.9) 20%,
            rgba(255, 180, 220, 0.9) 40%,
            rgba(255, 200, 180, 0.85) 60%,
            rgba(180, 255, 240, 0.9) 80%,
            rgba(180, 220, 255, 0.95) 100%
          );
          background-size: 200% 200%;
          opacity: 0;
          transition: opacity 150ms ease-out;
          animation: holographic-shift 3s ease-in-out infinite;
          border-radius: inherit;
        }
        
        .iridescent-hover:hover::before {
          opacity: 1;
        }
        
        .iridescent-hover:hover {
          transform: translateY(-1px);
          box-shadow: 
            0 4px 20px rgba(180, 220, 255, 0.3),
            0 8px 40px rgba(255, 180, 220, 0.2);
        }
        
        .iridescent-hover span {
          position: relative;
          z-index: 1;
          mix-blend-mode: multiply;
        }
      `}</style>

      <Nav />

      {/* ============================================
          SECTION A: Hero - Orientation, Not Persuasion
          ============================================ */}
      <section className="pt-28 sm:pt-32 lg:pt-40 pb-12 lg:pb-16 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          {/* Clear definition - UPDATED HERO */}
          <h1 className="font-semibold text-3xl sm:text-4xl md:text-5xl text-white/[0.94] leading-[1.15] tracking-tight mb-4">
            Your brand has an AI profile. Claim it.
          </h1>

          {/* Supporting context - calm, not persuasive */}
          <p className="text-base sm:text-lg text-white/40 max-w-xl mx-auto mb-8 sm:mb-10 px-2">
            Create the structured profile AI systems reference when answering questions about your brand.
          </p>

          {/* Search - Primary action */}
          <div className="relative max-w-lg mx-auto mb-3 px-2 sm:px-0">
            <div className="relative">
              <Search className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
              <input
                type="text"
                placeholder="Search for your brand..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.length >= 2 && setShowSearchDropdown(true)}
                onBlur={() => setTimeout(() => setShowSearchDropdown(false), 300)}
                className="w-full pl-12 sm:pl-14 pr-5 py-3 sm:py-4 bg-[#111213] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/10 transition-all duration-100 text-base"
              />
              {searching && (
                <div className="absolute right-5 top-1/2 -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
                </div>
              )}
            </div>

            {/* Search Dropdown */}
            {showSearchDropdown && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#111213] rounded-xl border border-white/[0.08] shadow-xl overflow-hidden z-50">
                {searchResults.map((brand) => (
                  <Link
                    key={brand.id}
                    href={`/brands/${brand.slug}`}
                    className="flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3 hover:bg-white/[0.04] transition-colors duration-100"
                  >
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-white overflow-hidden flex-shrink-0">
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
                    <ArrowRight className="w-4 h-4 text-white/30 flex-shrink-0" />
                  </Link>
                ))}
                {/* Can't find it link */}
                <div className="border-t border-white/[0.06] px-4 sm:px-5 py-3">
                  <Link
                    href="/auth/signup"
                    className="text-white/40 text-sm hover:text-white/60 transition-colors"
                  >
                    Can't find your brand? <span className="text-white/60 underline underline-offset-2">Create your free profile</span>
                  </Link>
                </div>
              </div>
            )}

            {/* No Results */}
            {showSearchDropdown && searchQuery.length >= 2 && searchResults.length === 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#111213] rounded-xl border border-white/[0.08] shadow-xl p-4 sm:p-5 text-center z-50">
                <p className="text-white/40 text-sm mb-3">"{searchQuery}" isn't in the index yet</p>
                <Link
                  href={`/auth/signup?brand=${encodeURIComponent(searchQuery)}`}
                  className="iridescent-hover inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-black text-sm font-medium transition-all duration-100"
                >
                  <span className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Create free profile
                  </span>
                </Link>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 mt-6">
            {/* Overlapping brand logos */}
            <div className="flex -space-x-2">
              {['nike.com', 'stripe.com', 'patagonia.com', 'figma.com', 'notion.so'].map((domain, idx) => (
                <div 
                  key={domain}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden border-2 border-[#0B0B0C] bg-white"
                  style={{ zIndex: 5 - idx }}
                >
                  <img 
                    src={`https://cdn.brandfetch.io/${domain}?c=1id1Fyz-h7an5-5KR_y`}
                    alt={domain}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
            <p className="text-white/20 text-xs sm:text-sm">
              100,000+ brands indexed
            </p>
          </div>
        </div>
      </section>

      {/* ============================================
          SECTION B: Why This Matters (Linear-style cards)
          ============================================ */}
      <section className="py-12 lg:py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          {/* Header row */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 md:gap-6 mb-8 md:mb-10">
            <h2 className="font-semibold text-2xl sm:text-3xl md:text-4xl text-white/90 max-w-md">
              AI is changing how people find brands
            </h2>
            <p className="text-white/40 max-w-sm text-sm leading-relaxed">
              More people are asking AI for recommendations instead of searching Google. Harbor helps you understand and manage how you appear in those conversations.
            </p>
          </div>

          {/* Three cards - stack on mobile */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Card 1 */}
            <button
              onClick={() => setActiveModal('ai-search')}
              className="group relative bg-[#141516] border border-white/[0.06] rounded-2xl overflow-hidden text-left hover:border-white/[0.12] transition-colors duration-100"
            >
              <div className="aspect-[4/3] relative m-4 sm:m-5 mb-0 rounded-xl overflow-hidden">
                <Image
                  src="/images/card-ai-search.png"
                  alt="People discover brands through AI"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-5 sm:p-7 pt-4 sm:pt-6 flex items-end justify-between">
                <h3 className="text-white/90 font-medium text-base sm:text-xl leading-snug">
                  People discover brands through AI answers now
                </h3>
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/[0.06] flex items-center justify-center group-hover:bg-white/[0.1] transition-colors flex-shrink-0 ml-3 sm:ml-4">
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-white/40" />
                </div>
              </div>
            </button>

            {/* Card 2 */}
            <button
              onClick={() => setActiveModal('not-found')}
              className="group relative bg-[#141516] border border-white/[0.06] rounded-2xl overflow-hidden text-left hover:border-white/[0.12] transition-colors duration-100"
            >
              <div className="aspect-[4/3] relative m-4 sm:m-5 mb-0 rounded-xl overflow-hidden">
                <Image
                  src="/images/card-not-found.png"
                  alt="AI doesn't understand most websites"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-5 sm:p-7 pt-4 sm:pt-6 flex items-end justify-between">
                <h3 className="text-white/90 font-medium text-base sm:text-xl leading-snug">
                  AI doesn't understand most brand websites
                </h3>
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/[0.06] flex items-center justify-center group-hover:bg-white/[0.1] transition-colors flex-shrink-0 ml-3 sm:ml-4">
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-white/40" />
                </div>
              </div>
            </button>

            {/* Card 3 */}
            <button
              onClick={() => setActiveModal('outdated')}
              className="group relative bg-[#141516] border border-white/[0.06] rounded-2xl overflow-hidden text-left hover:border-white/[0.12] transition-colors duration-100 sm:col-span-2 lg:col-span-1"
            >
              <div className="aspect-[4/3] relative m-4 sm:m-5 mb-0 rounded-xl overflow-hidden">
                <Image
                  src="/images/card-outdated.png"
                  alt="AI pulls from third-party sources"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-5 sm:p-7 pt-4 sm:pt-6 flex items-end justify-between">
                <h3 className="text-white/90 font-medium text-base sm:text-xl leading-snug">
                  AI pulls brand data from third-party sources
                </h3>
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/[0.06] flex items-center justify-center group-hover:bg-white/[0.1] transition-colors flex-shrink-0 ml-3 sm:ml-4">
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-white/40" />
                </div>
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* Modals */}
      {activeModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm"
          onClick={() => setActiveModal(null)}
        >
          <div 
            className="bg-[#111213] border border-white/[0.08] rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {activeModal === 'ai-search' && (
              <>
                <div className="aspect-video relative">
                  <Image src="/images/card-ai-search.png" alt="" fill className="object-cover" />
                </div>
                <div className="p-6">
                  <h3 className="text-white/90 font-semibold text-lg mb-3">People discover brands through AI answers now</h3>
                  <p className="text-white/40 text-sm leading-relaxed mb-4">
                    Instead of scrolling through links, people are asking ChatGPT, Perplexity, and Claude for direct answers. "What's the best CRM for startups?" now returns a conversational recommendation, not a list of ads.
                  </p>
                  <p className="text-white/40 text-sm leading-relaxed">
                    This shift means your SEO strategy alone won't determine whether you get recommended. AI models form opinions based on the data they've seen—and that data might not include you.
                  </p>
                </div>
              </>
            )}
            {activeModal === 'not-found' && (
              <>
                <div className="aspect-video relative">
                  <Image src="/images/card-not-found.png" alt="" fill className="object-cover" />
                </div>
                <div className="p-6">
                  <h3 className="text-white/90 font-semibold text-lg mb-3">AI doesn't understand most brand websites</h3>
                  <p className="text-white/40 text-sm leading-relaxed mb-4">
                    Your website was built for humans—with animations, carousels, and marketing copy. AI crawlers parse text, not experiences. They often leave with incomplete or confusing data.
                  </p>
                  <p className="text-white/40 text-sm leading-relaxed">
                    Harbor gives you a clean, structured profile that AI can actually read. Schema-formatted, consistently updated, and designed specifically for machine understanding.
                  </p>
                </div>
              </>
            )}
            {activeModal === 'outdated' && (
              <>
                <div className="aspect-video relative">
                  <Image src="/images/card-outdated.png" alt="" fill className="object-cover" />
                </div>
                <div className="p-6">
                  <h3 className="text-white/90 font-semibold text-lg mb-3">AI pulls brand data from third-party sources</h3>
                  <p className="text-white/40 text-sm leading-relaxed mb-4">
                    When AI answers questions about your company, it often cites third-party sources—review sites, directories, articles—rather than your own website.
                  </p>
                  <p className="text-white/40 text-sm leading-relaxed">
                    Harbor becomes that third-party source, but one you actually control. Your profile is structured data that AI models can reference with confidence.
                  </p>
                </div>
              </>
            )}
            <button 
              onClick={() => setActiveModal(null)}
              className="w-full py-4 text-white/50 text-sm font-medium hover:text-white/70 transition-colors border-t border-white/[0.06]"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ============================================
          SECTION C: What You Get
          ============================================ */}
      <section className="py-12 lg:py-20 px-4 sm:px-6 border-t border-white/[0.04]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 lg:mb-14">
            <h2 className="font-semibold text-2xl sm:text-3xl text-white/90 mb-3">
              What claiming gets you
            </h2>
            <p className="text-white/40 text-sm max-w-md mx-auto">
              A structured profile for AI, plus tools to see how you're being represented.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
            {/* Left: AI Profile */}
            <div className="bg-[#111213] rounded-2xl border border-white/[0.06] p-6 sm:p-8">
              <div className="w-12 h-12 rounded-xl bg-white/[0.04] flex items-center justify-center mb-5">
                <svg className="w-6 h-6 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </div>
              <h3 className="text-white/90 font-semibold text-lg mb-2">AI-Readable Profile</h3>
              <p className="text-white/40 text-sm leading-relaxed mb-5">
                A schema.org formatted profile with your brand info, products, pricing, and FAQs. Designed for AI crawlers to parse accurately.
              </p>
              <ul className="space-y-2">
                {['Brand description & positioning', 'Products and services', 'Pricing information', 'FAQs in structured format'].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-white/50 text-sm">
                    <div className="w-1 h-1 rounded-full bg-white/30" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Right: Visibility Dashboard */}
            <div className="bg-[#111213] rounded-2xl border border-white/[0.06] p-6 sm:p-8">
              <div className="w-12 h-12 rounded-xl bg-white/[0.04] flex items-center justify-center mb-5">
                <svg className="w-6 h-6 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                </svg>
              </div>
              <h3 className="text-white/90 font-semibold text-lg mb-2">Visibility Analytics</h3>
              <p className="text-white/40 text-sm leading-relaxed mb-5">
                See how AI models describe your brand. Track mentions, compare to competitors, and monitor changes over time.
              </p>
              <ul className="space-y-2">
                {['AI model responses about your brand', 'Citation source tracking', 'Competitor comparison', 'Historical visibility trends'].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-white/50 text-sm">
                    <div className="w-1 h-1 rounded-full bg-white/30" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          SECTION E: How It Works (Minimal)
          ============================================ */}
      <section className="py-12 lg:py-16 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8 lg:mb-10">
            <h2 className="font-semibold text-xl sm:text-2xl text-white/90">
              Three steps to claim
            </h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-8 sm:gap-6">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-xl overflow-hidden">
                <Image
                  src="/icons/claim-search.png"
                  alt="Search"
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-white/80 font-medium text-sm mb-2">Find your brand</h3>
              <p className="text-white/30 text-xs leading-relaxed max-w-[200px] mx-auto">
                Search the index to see if your brand profile already exists.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-xl overflow-hidden">
                <Image
                  src="/icons/claim-verify.png"
                  alt="Verify"
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-white/80 font-medium text-sm mb-2">Verify ownership</h3>
              <p className="text-white/30 text-xs leading-relaxed max-w-[200px] mx-auto">
                Confirm you represent the brand via email domain or DNS verification.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-xl overflow-hidden">
                <Image
                  src="/icons/claim-dashboard.png"
                  alt="Access"
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-white/80 font-medium text-sm mb-2">Access your dashboard</h3>
              <p className="text-white/30 text-xs leading-relaxed max-w-[200px] mx-auto">
                Review AI outputs, edit your profile, and monitor changes going forward.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          SECTION F: Proof Without Overreach
          ============================================ */}
      <section className="py-12 lg:py-16 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-6 lg:mb-8">
            <p className="text-white/20 text-sm">
              Brands indexed across every industry
            </p>
          </div>
          
          <div className="relative">
            {/* Left fade */}
            <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-24 bg-gradient-to-r from-[#0B0B0C] to-transparent z-10 pointer-events-none" />
            {/* Right fade */}
            <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-24 bg-gradient-to-l from-[#0B0B0C] to-transparent z-10 pointer-events-none" />
            
            <div className="space-y-3 opacity-40">
              <MarqueeRow domains={MARQUEE_BRANDS[0]} direction="left" speed={45} />
              <MarqueeRow domains={MARQUEE_BRANDS[1]} direction="right" speed={50} />
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          SECTION G: Final CTA (Reframed)
          ============================================ */}
      <section className="py-12 lg:py-20 px-4 sm:px-6">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="font-semibold text-xl sm:text-2xl text-white/90 mb-3">
            Find your brand
          </h2>
          <p className="text-white/40 text-sm mb-6 sm:mb-8">
            Search the index to see your profile and claim it.
          </p>
          
          <button
            onClick={() => setShowClaimModal(true)}
            className="iridescent-hover inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-white text-black font-medium rounded-xl transition-all duration-100"
          >
            <span>Claim Your Brand</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* ============================================
          Claim Modal
          ============================================ */}
      {showClaimModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm"
          onClick={() => setShowClaimModal(false)}
        >
          <div 
            className="bg-[#111213] border border-white/[0.08] rounded-2xl max-w-md w-full overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 pb-4">
              <h3 className="text-white/90 font-semibold text-xl mb-2">
                Find your brand
              </h3>
              <p className="text-white/40 text-sm">
                Search for your brand to claim it and access your AI visibility dashboard.
              </p>
            </div>

            {/* Search Input */}
            <div className="px-6 pb-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                <input
                  type="text"
                  placeholder="Search for your brand..."
                  value={claimSearchQuery}
                  onChange={(e) => setClaimSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full pl-12 pr-5 py-3 bg-[#0B0B0C] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/10 transition-all duration-100 text-base"
                />
                {claimSearching && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
                  </div>
                )}
              </div>
            </div>

            {/* Search Results */}
            <div className="px-6 pb-6">
              {claimSearchQuery.length >= 2 && (
                <div className="bg-[#0B0B0C] border border-white/[0.06] rounded-xl overflow-hidden">
                  {claimSearchResults.length > 0 ? (
                    <>
                      {claimSearchResults.slice(0, 5).map((brand) => (
                        <Link
                          key={brand.id}
                          href={`/brands/${brand.slug}?claim=true`}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.04] transition-colors duration-100 border-b border-white/[0.04] last:border-b-0"
                        >
                          <div className="w-9 h-9 rounded-lg bg-white overflow-hidden flex-shrink-0">
                            <Image
                              src={brand.logo_url}
                              alt={brand.brand_name}
                              width={72}
                              height={72}
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
                          <ArrowRight className="w-4 h-4 text-white/30 flex-shrink-0" />
                        </Link>
                      ))}
                      {/* Create new option at bottom */}
                      <Link
                        href={`/auth/signup?brand=${encodeURIComponent(claimSearchQuery)}&intent=claim`}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.04] transition-colors duration-100 border-t border-white/[0.06]"
                      >
                        <div className="w-9 h-9 rounded-lg bg-white/[0.06] flex items-center justify-center flex-shrink-0">
                          <Plus className="w-4 h-4 text-white/40" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-white/70 text-sm">Don't see your brand?</div>
                          <div className="text-white/40 text-xs">Create "{claimSearchQuery}"</div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-white/30 flex-shrink-0" />
                      </Link>
                    </>
                  ) : !claimSearching ? (
                    <div className="p-4 text-center">
                      <p className="text-white/40 text-sm mb-3">No brands found for "{claimSearchQuery}"</p>
                      <Link
                        href={`/auth/signup?brand=${encodeURIComponent(claimSearchQuery)}&intent=claim`}
                        className="iridescent-hover inline-flex items-center gap-2 px-4 py-2 bg-white text-black text-sm font-medium rounded-lg transition-all duration-100"
                      >
                        <Plus className="w-4 h-4" />
                        Create "{claimSearchQuery}"
                      </Link>
                    </div>
                  ) : null}
                </div>
              )}

              {claimSearchQuery.length < 2 && (
                <p className="text-white/30 text-sm text-center py-4">
                  Type at least 2 characters to search
                </p>
              )}
            </div>

            {/* Close button */}
            <div className="px-6 pb-6">
              <button 
                onClick={() => setShowClaimModal(false)}
                className="w-full py-3 bg-white/[0.04] hover:bg-white/[0.08] text-white/50 text-sm font-medium rounded-xl transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}