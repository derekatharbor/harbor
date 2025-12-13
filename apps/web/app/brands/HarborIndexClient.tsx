// Path: /apps/web/app/brands/HarborIndexClient.tsx
// Brand Index - Comprehensive explanation page
// Reference: Linear's landing page density + Yelp's claim clarity

'use client'

import { useState, useEffect } from 'react'
import { Search, ArrowRight, Plus, BarChart3, GitCompare, Bell, X } from 'lucide-react'
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
  ['linear.app', 'vercel.com', 'supabase.com', 'stripe.com', 'notion.so', 'figma.com', 'asana.com', 'hubspot.com', 'salesforce.com', 'planetscale.com', 'railway.app', 'render.com'],
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
            className="w-11 h-11 rounded-xl flex-shrink-0 overflow-hidden bg-white/[0.03] border border-white/[0.06]"
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
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<DirectoryBrand[]>([])
  const [showSearchDropdown, setShowSearchDropdown] = useState(false)
  const [activeModal, setActiveModal] = useState<string | null>(null)

  useEffect(() => {
    if (initialDirectory.length === 0) {
      fetch('/api/index/brands')
        .then(res => res.json())
        .then(data => {
          console.log('Fetched brands:', data.directory?.length || 0)
          if (data.directory) setDirectory(data.directory)
          setLoading(false)
        })
        .catch(err => {
          console.error('Failed to fetch brands:', err)
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
  }, [initialDirectory.length])

  useEffect(() => {
    if (searchQuery.trim().length >= 2 && !loading) {
      const query = searchQuery.toLowerCase()
      const results = directory.filter(brand =>
        brand.brand_name.toLowerCase().includes(query) ||
        brand.domain.toLowerCase().includes(query)
      ).slice(0, 6)
      console.log('Search results for', query, ':', results.length)
      setSearchResults(results)
      setShowSearchDropdown(true)
    } else {
      setSearchResults([])
      setShowSearchDropdown(false)
    }
  }, [searchQuery, directory, loading])

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
      <section className="pt-40 pb-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          {/* Clear definition */}
          <h1 className="font-semibold text-4xl md:text-5xl text-white/[0.94] leading-[1.15] tracking-tight mb-4">
            Claim your brand's AI profile
          </h1>

          {/* Supporting context - calm, not persuasive */}
          <p className="text-lg text-white/40 max-w-xl mx-auto mb-10">
            Create the structured profile AI systems reference when answering questions about your brand.
          </p>

          {/* Search - Primary action */}
          <div className="relative max-w-lg mx-auto mb-3">
            <div className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
              <input
                type="text"
                placeholder={loading ? "Loading brands..." : "Search for your brand..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.length >= 2 && !loading && setShowSearchDropdown(true)}
                onBlur={() => setTimeout(() => setShowSearchDropdown(false), 300)}
                disabled={loading}
                className="w-full pl-14 pr-5 py-4 bg-[#111213] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/10 transition-all duration-100 text-base disabled:opacity-50"
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
                {/* Can't find it link */}
                <div className="border-t border-white/[0.06] px-5 py-3">
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
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#111213] rounded-xl border border-white/[0.08] shadow-xl p-5 text-center z-50">
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

          <div className="flex items-center justify-center gap-3 mt-6">
            {/* Overlapping brand logos */}
            <div className="flex -space-x-2">
              {['nike.com', 'stripe.com', 'patagonia.com', 'figma.com', 'notion.so'].map((domain, idx) => (
                <div 
                  key={domain}
                  className="w-9 h-9 rounded-full overflow-hidden border-2 border-[#0B0B0C] bg-white"
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
            <p className="text-white/20 text-sm">
              Brands already being referenced by AI
            </p>
          </div>
        </div>
      </section>

      {/* ============================================
          SECTION B: Why This Matters (Linear-style cards)
          ============================================ */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          {/* Header row */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-10">
            <h2 className="font-semibold text-3xl md:text-4xl text-white/90 max-w-md">
              AI is changing how people find brands
            </h2>
            <p className="text-white/40 max-w-sm text-sm leading-relaxed">
              More people are asking AI for recommendations instead of searching Google. Harbor helps you understand and manage how you appear in those conversations.
            </p>
          </div>

          {/* Three cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <button
              onClick={() => setActiveModal('ai-search')}
              className="group relative bg-[#141516] border border-white/[0.06] rounded-2xl overflow-hidden text-left hover:border-white/[0.12] transition-colors duration-100"
            >
              <div className="aspect-[4/3] relative m-5 mb-0 rounded-xl overflow-hidden">
                <Image
                  src="/images/card-ai-search.png"
                  alt="People discover brands through AI"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-7 pt-6 flex items-end justify-between">
                <h3 className="text-white/90 font-medium text-xl leading-snug">
                  People discover brands through AI answers now
                </h3>
                <div className="w-10 h-10 rounded-full bg-white/[0.06] flex items-center justify-center group-hover:bg-white/[0.1] transition-colors flex-shrink-0 ml-4">
                  <Plus className="w-5 h-5 text-white/40" />
                </div>
              </div>
            </button>

            {/* Card 2 */}
            <button
              onClick={() => setActiveModal('not-found')}
              className="group relative bg-[#141516] border border-white/[0.06] rounded-2xl overflow-hidden text-left hover:border-white/[0.12] transition-colors duration-100"
            >
              <div className="aspect-[4/3] relative m-5 mb-0 rounded-xl overflow-hidden">
                <Image
                  src="/images/card-not-found.png"
                  alt="AI doesn't understand most websites"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-7 pt-6 flex items-end justify-between">
                <h3 className="text-white/90 font-medium text-xl leading-snug">
                  AI doesn't understand most brand websites
                </h3>
                <div className="w-10 h-10 rounded-full bg-white/[0.06] flex items-center justify-center group-hover:bg-white/[0.1] transition-colors flex-shrink-0 ml-4">
                  <Plus className="w-5 h-5 text-white/40" />
                </div>
              </div>
            </button>

            {/* Card 3 */}
            <button
              onClick={() => setActiveModal('outdated')}
              className="group relative bg-[#141516] border border-white/[0.06] rounded-2xl overflow-hidden text-left hover:border-white/[0.12] transition-colors duration-100"
            >
              <div className="aspect-[4/3] relative m-5 mb-0 rounded-xl overflow-hidden">
                <Image
                  src="/images/card-outdated.png"
                  alt="AI pulls from third-party sources"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-7 pt-6 flex items-end justify-between">
                <h3 className="text-white/90 font-medium text-xl leading-snug">
                  AI pulls brand data from third-party sources
                </h3>
                <div className="w-10 h-10 rounded-full bg-white/[0.06] flex items-center justify-center group-hover:bg-white/[0.1] transition-colors flex-shrink-0 ml-4">
                  <Plus className="w-5 h-5 text-white/40" />
                </div>
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* Modals */}
      {activeModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm"
          onClick={() => setActiveModal(null)}
        >
          <div 
            className="bg-[#111213] border border-white/[0.08] rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl"
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
                    Most websites are built for humans, not machines. AI models struggle to extract structured information like pricing, product details, and company facts from typical marketing pages.
                  </p>
                  <p className="text-white/40 text-sm leading-relaxed">
                    Without clear, machine-readable data, AI either skips your brand entirely or makes assumptions based on incomplete information.
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
                    AI assembles answers from scattered sources: old blog posts, competitor comparisons, review sites, Wikipedia entries. The result is often a patchwork of information you never approved.
                  </p>
                  <p className="text-white/40 text-sm leading-relaxed">
                    Pricing changes, product updates, and company pivots often aren't reflected in AI responses for months—or ever.
                  </p>
                </div>
              </>
            )}
            <div className="px-6 pb-6">
              <button 
                onClick={() => setActiveModal(null)}
                className="w-full py-3 bg-white/[0.06] hover:bg-white/[0.1] text-white/70 text-sm font-medium rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================
          SECTION C: Product Object Preview
          ============================================ */}
      <section className="py-20 px-6 bg-[#0a0a0a]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-semibold text-2xl md:text-3xl text-white/90 mb-3">
              A dashboard for your AI presence
            </h2>
            <p className="text-white/40 max-w-lg mx-auto">
              Harbor gives you visibility into how AI models perceive and describe your brand across different contexts.
            </p>
          </div>

          {/* Main product screenshot */}
          <div className="rounded-2xl overflow-hidden border border-white/[0.06] shadow-2xl mb-12">
            <Image
              src="/previews/how-interpret.png"
              alt="Harbor brand visibility dashboard"
              width={1200}
              height={675}
              className="w-full"
              priority
            />
          </div>

          {/* Feature grid */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-[#111213] border border-white/[0.06] rounded-xl p-5">
              <div className="w-9 h-9 rounded-lg bg-white/[0.04] flex items-center justify-center mb-4">
                <BarChart3 className="w-4.5 h-4.5 text-white/50" />
              </div>
              <h3 className="text-white/80 font-medium text-sm mb-2">Visibility index</h3>
              <p className="text-white/30 text-sm leading-relaxed">
                A composite score showing how prominently your brand appears across AI model responses.
              </p>
            </div>
            <div className="bg-[#111213] border border-white/[0.06] rounded-xl p-5">
              <div className="w-9 h-9 rounded-lg bg-white/[0.04] flex items-center justify-center mb-4">
                <GitCompare className="w-4.5 h-4.5 text-white/50" />
              </div>
              <h3 className="text-white/80 font-medium text-sm mb-2">Model comparison</h3>
              <p className="text-white/30 text-sm leading-relaxed">
                See how descriptions differ between ChatGPT, Claude, Gemini, and Perplexity.
              </p>
            </div>
            <div className="bg-[#111213] border border-white/[0.06] rounded-xl p-5">
              <div className="w-9 h-9 rounded-lg bg-white/[0.04] flex items-center justify-center mb-4">
                <Bell className="w-4.5 h-4.5 text-white/50" />
              </div>
              <h3 className="text-white/80 font-medium text-sm mb-2">Change monitoring</h3>
              <p className="text-white/30 text-sm leading-relaxed">
                Track how AI descriptions evolve over time and get notified of significant shifts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          SECTION D: What You Can Do After Claiming
          ============================================ */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left: Screenshot */}
            <div className="order-2 md:order-1 rounded-2xl overflow-hidden border border-white/[0.06]">
              <Image
                src="/previews/brand.png"
                alt="Brand profile editing"
                width={800}
                height={600}
                className="w-full"
              />
            </div>

            {/* Right: Actions list */}
            <div className="order-1 md:order-2">
              <h2 className="font-semibold text-2xl md:text-3xl text-white/90 mb-6">
                After you claim
              </h2>
              
              <div className="space-y-5">
                <div className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-white/[0.06] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white/40 text-xs font-medium">1</span>
                  </div>
                  <div>
                    <div className="text-white/80 font-medium text-sm mb-1">Review AI descriptions</div>
                    <div className="text-white/30 text-sm">See the exact language each model uses to describe your brand, products, and positioning.</div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-white/[0.06] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white/40 text-xs font-medium">2</span>
                  </div>
                  <div>
                    <div className="text-white/80 font-medium text-sm mb-1">Update official data</div>
                    <div className="text-white/30 text-sm">Edit your pricing, product lines, descriptions, and FAQs in a structured format.</div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-white/[0.06] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white/40 text-xs font-medium">3</span>
                  </div>
                  <div>
                    <div className="text-white/80 font-medium text-sm mb-1">Track changes over time</div>
                    <div className="text-white/30 text-sm">Monitor how AI outputs evolve and whether your updates are reflected.</div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-white/[0.06] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white/40 text-xs font-medium">4</span>
                  </div>
                  <div>
                    <div className="text-white/80 font-medium text-sm mb-1">See model disagreements</div>
                    <div className="text-white/30 text-sm">Identify where different AI systems give conflicting information about you.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          SECTION E: How Claiming Works (Process)
          ============================================ */}
      <section className="py-20 px-6 bg-[#0a0a0a]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-semibold text-2xl md:text-3xl text-white/90 mb-3">
              Claim your brand in minutes
            </h2>
            <p className="text-white/40">
              No credit card required. Start with visibility, upgrade when you need more.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
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
              <p className="text-white/30 text-xs leading-relaxed">
                Search the index to see if your brand is already being tracked. If not, add it.
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
              <p className="text-white/30 text-xs leading-relaxed">
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
              <p className="text-white/30 text-xs leading-relaxed">
                Review AI outputs, edit your profile, and monitor changes going forward.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          SECTION F: Proof Without Overreach
          ============================================ */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <p className="text-white/20 text-sm">
              Brands indexed across every industry
            </p>
          </div>
          
          <div className="space-y-3 opacity-40">
            <MarqueeRow domains={MARQUEE_BRANDS[0]} direction="left" speed={45} />
            <MarqueeRow domains={MARQUEE_BRANDS[1]} direction="right" speed={50} />
          </div>
        </div>
      </section>

      {/* ============================================
          SECTION G: Final CTA (Reframed)
          ============================================ */}
      <section className="py-20 px-6">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="font-semibold text-2xl text-white/90 mb-3">
            Start seeing what AI sees
          </h2>
          <p className="text-white/40 text-sm mb-8">
            Claim your brand to access visibility data and update your canonical profile.
          </p>
          
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