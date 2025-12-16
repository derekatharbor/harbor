// Path: /apps/web/app/brands/HarborIndexClient.tsx
// Brand Index with inline create profile modal

'use client'

import { useState, useEffect } from 'react'
import { Search, ArrowRight, Plus, ArrowLeft, Loader2, CheckCircle } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
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

// Modal step type
type ModalStep = 'search' | 'create' | 'verify' | 'success'

export default function HarborIndexClient() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<DirectoryBrand[]>([])
  const [showSearchDropdown, setShowSearchDropdown] = useState(false)
  const [searching, setSearching] = useState(false)
  const [activeModal, setActiveModal] = useState<string | null>(null)
  
  // Claim modal state
  const [showClaimModal, setShowClaimModal] = useState(false)
  const [modalStep, setModalStep] = useState<ModalStep>('search')
  const [claimSearchQuery, setClaimSearchQuery] = useState('')
  const [claimSearchResults, setClaimSearchResults] = useState<DirectoryBrand[]>([])
  const [claimSearching, setClaimSearching] = useState(false)
  
  // Create profile state
  const [createDomain, setCreateDomain] = useState('')
  const [createEmail, setCreateEmail] = useState('')
  const [createLoading, setCreateLoading] = useState(false)
  const [createError, setCreateError] = useState('')
  const [pendingProfile, setPendingProfile] = useState<{
    id: string
    brandName: string
    slug: string
    domain: string
  } | null>(null)
  
  // Verification state
  const [verifyCode, setVerifyCode] = useState('')
  const [verifyLoading, setVerifyLoading] = useState(false)
  const [verifyError, setVerifyError] = useState('')

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

  // Reset modal state when closed
  useEffect(() => {
    if (!showClaimModal) {
      const timer = setTimeout(() => {
        setModalStep('search')
        setClaimSearchQuery('')
        setClaimSearchResults([])
        setCreateDomain('')
        setCreateEmail('')
        setCreateError('')
        setCreateLoading(false)
        setPendingProfile(null)
        setVerifyCode('')
        setVerifyError('')
        setVerifyLoading(false)
      }, 200)
      return () => clearTimeout(timer)
    }
  }, [showClaimModal])

  // Handle "Create Profile" button click
  const handleStartCreate = (searchTerm: string) => {
    const term = searchTerm.trim().toLowerCase()
    if (term.includes('.')) {
      setCreateDomain(term.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0])
    }
    setModalStep('create')
  }

  // Handle profile creation
  const handleCreateProfile = async () => {
    setCreateError('')
    setCreateLoading(true)

    try {
      const res = await fetch('/api/index/profiles/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domain: createDomain,
          email: createEmail,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (res.status === 409 && data.existingProfile) {
          setCreateError(`A profile for ${data.existingProfile.brandName} already exists. Search for it to claim.`)
        } else {
          setCreateError(data.error || 'Failed to create profile')
        }
        setCreateLoading(false)
        return
      }

      setPendingProfile(data.profile)
      setModalStep('verify')
    } catch (err) {
      console.error('Create profile error:', err)
      setCreateError('Something went wrong. Please try again.')
    }

    setCreateLoading(false)
  }

  // Handle verification
  const handleVerifyCode = async () => {
    if (!pendingProfile) return
    
    setVerifyError('')
    setVerifyLoading(true)

    try {
      const res = await fetch('/api/claim/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandId: pendingProfile.id,
          email: createEmail,
          code: verifyCode,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setVerifyError(data.error || 'Invalid code')
        setVerifyLoading(false)
        return
      }

      setModalStep('success')
      
      setTimeout(() => {
        router.push(`/brands/${pendingProfile.slug}/manage`)
      }, 1500)
    } catch (err) {
      console.error('Verify error:', err)
      setVerifyError('Something went wrong. Please try again.')
    }

    setVerifyLoading(false)
  }

  const emailDomainHint = createDomain ? `@${createDomain}` : ''

  return (
    <div className="min-h-screen bg-[#0B0B0C]">
      <style jsx global>{`
        @keyframes holographic-shift {
          0% { background-position: 0% 50%; filter: hue-rotate(0deg); }
          25% { background-position: 50% 0%; filter: hue-rotate(15deg); }
          50% { background-position: 100% 50%; filter: hue-rotate(0deg); }
          75% { background-position: 50% 100%; filter: hue-rotate(-15deg); }
          100% { background-position: 0% 50%; filter: hue-rotate(0deg); }
        }
        
        @keyframes marquee-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
        
        @keyframes marquee-right {
          0% { transform: translateX(-33.333%); }
          100% { transform: translateX(0); }
        }
        
        .animate-marquee-left { animation: marquee-left linear infinite; }
        .animate-marquee-right { animation: marquee-right linear infinite; }
        
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
        
        .iridescent-hover:hover::before { opacity: 1; }
        .iridescent-hover:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 20px rgba(180, 220, 255, 0.3), 0 8px 40px rgba(255, 180, 220, 0.2);
        }
        .iridescent-hover span { position: relative; z-index: 1; mix-blend-mode: multiply; }
      `}</style>

      <Nav />

      {/* Hero */}
      <section className="pt-28 sm:pt-32 lg:pt-40 pb-12 lg:pb-16 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="font-semibold text-3xl sm:text-4xl md:text-5xl text-white/[0.94] leading-[1.15] tracking-tight mb-4">
            Your brand has an AI profile. Claim it.
          </h1>

          <p className="text-base sm:text-lg text-white/40 max-w-xl mx-auto mb-8 sm:mb-10 px-2">
            Create the structured profile AI systems reference when answering questions about your brand.
          </p>

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
                        onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-logo.svg' }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white/90 font-medium text-sm truncate">{brand.brand_name}</div>
                      <div className="text-white/40 text-xs truncate">{brand.domain}</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-white/30 flex-shrink-0" />
                  </Link>
                ))}
                <button
                  onClick={() => {
                    setShowSearchDropdown(false)
                    setClaimSearchQuery(searchQuery)
                    setShowClaimModal(true)
                    handleStartCreate(searchQuery)
                  }}
                  className="w-full border-t border-white/[0.06] px-4 sm:px-5 py-3 text-left hover:bg-white/[0.04] transition-colors"
                >
                  <span className="text-white/40 text-sm">
                    Can't find your brand? <span className="text-white/60 underline underline-offset-2">Create your free profile</span>
                  </span>
                </button>
              </div>
            )}

            {showSearchDropdown && searchQuery.length >= 2 && searchResults.length === 0 && !searching && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#111213] rounded-xl border border-white/[0.08] shadow-xl p-4 sm:p-5 text-center z-50">
                <p className="text-white/40 text-sm mb-3">"{searchQuery}" isn't in the index yet</p>
                <button
                  onClick={() => {
                    setShowSearchDropdown(false)
                    setClaimSearchQuery(searchQuery)
                    setShowClaimModal(true)
                    handleStartCreate(searchQuery)
                  }}
                  className="iridescent-hover inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-black text-sm font-medium transition-all duration-100"
                >
                  <span className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Create free profile
                  </span>
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 mt-6">
            <div className="flex -space-x-2">
              {['nike.com', 'stripe.com', 'patagonia.com', 'figma.com', 'notion.so'].map((domain, idx) => (
                <div key={domain} className="w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden border-2 border-[#0B0B0C] bg-white" style={{ zIndex: 5 - idx }}>
                  <img src={`https://cdn.brandfetch.io/${domain}?c=1id1Fyz-h7an5-5KR_y`} alt={domain} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            <p className="text-white/20 text-xs sm:text-sm">100,000+ brands indexed</p>
          </div>
        </div>
      </section>

      {/* Why This Matters */}
      <section className="py-12 lg:py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 md:gap-6 mb-8 md:mb-10">
            <h2 className="font-semibold text-2xl sm:text-3xl md:text-4xl text-white/90 max-w-md">AI is changing how people find brands</h2>
            <p className="text-white/40 max-w-sm text-sm leading-relaxed">More people are asking AI for recommendations instead of searching Google. Harbor helps you understand and manage how you appear in those conversations.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[
              { key: 'ai-search', img: '/images/card-ai-search.png', title: 'People discover brands through AI answers now' },
              { key: 'not-found', img: '/images/card-not-found.png', title: 'AI doesn't understand most brand websites' },
              { key: 'outdated', img: '/images/card-outdated.png', title: 'AI pulls brand data from third-party sources' },
            ].map((card, i) => (
              <button
                key={card.key}
                onClick={() => setActiveModal(card.key)}
                className={`group relative bg-[#141516] border border-white/[0.06] rounded-2xl overflow-hidden text-left hover:border-white/[0.12] transition-colors duration-100 ${i === 2 ? 'sm:col-span-2 lg:col-span-1' : ''}`}
              >
                <div className="aspect-[4/3] relative m-4 sm:m-5 mb-0 rounded-xl overflow-hidden">
                  <Image src={card.img} alt={card.title} fill className="object-cover" />
                </div>
                <div className="p-5 sm:p-7 pt-4 sm:pt-6 flex items-end justify-between">
                  <h3 className="text-white/90 font-medium text-base sm:text-xl leading-snug">{card.title}</h3>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/[0.06] flex items-center justify-center group-hover:bg-white/[0.1] transition-colors flex-shrink-0 ml-3 sm:ml-4">
                    <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-white/40" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Info Modals */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm" onClick={() => setActiveModal(null)}>
          <div className="bg-[#111213] border border-white/[0.08] rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {activeModal === 'ai-search' && (
              <>
                <div className="aspect-video relative"><Image src="/images/card-ai-search.png" alt="" fill className="object-cover" /></div>
                <div className="p-6">
                  <h3 className="text-white/90 font-semibold text-lg mb-3">People discover brands through AI answers now</h3>
                  <p className="text-white/40 text-sm leading-relaxed mb-4">Instead of scrolling through links, people are asking ChatGPT, Perplexity, and Claude for direct answers.</p>
                  <p className="text-white/40 text-sm leading-relaxed">This shift means your SEO strategy alone won't determine whether you get recommended. AI models form opinions based on the data they've seen—and that data might not include you.</p>
                </div>
              </>
            )}
            {activeModal === 'not-found' && (
              <>
                <div className="aspect-video relative"><Image src="/images/card-not-found.png" alt="" fill className="object-cover" /></div>
                <div className="p-6">
                  <h3 className="text-white/90 font-semibold text-lg mb-3">AI doesn't understand most brand websites</h3>
                  <p className="text-white/40 text-sm leading-relaxed mb-4">Your website was built for humans—with animations, carousels, and marketing copy. AI crawlers parse text, not experiences.</p>
                  <p className="text-white/40 text-sm leading-relaxed">Harbor gives you a clean, structured profile that AI can actually read.</p>
                </div>
              </>
            )}
            {activeModal === 'outdated' && (
              <>
                <div className="aspect-video relative"><Image src="/images/card-outdated.png" alt="" fill className="object-cover" /></div>
                <div className="p-6">
                  <h3 className="text-white/90 font-semibold text-lg mb-3">AI pulls brand data from third-party sources</h3>
                  <p className="text-white/40 text-sm leading-relaxed mb-4">When AI answers questions about your company, it often cites third-party sources rather than your own website.</p>
                  <p className="text-white/40 text-sm leading-relaxed">Harbor becomes that third-party source, but one you actually control.</p>
                </div>
              </>
            )}
            <button onClick={() => setActiveModal(null)} className="w-full py-4 text-white/50 text-sm font-medium hover:text-white/70 transition-colors border-t border-white/[0.06]">Close</button>
          </div>
        </div>
      )}

      {/* What You Get */}
      <section className="py-12 lg:py-20 px-4 sm:px-6 border-t border-white/[0.04]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 lg:mb-14">
            <h2 className="font-semibold text-2xl sm:text-3xl text-white/90 mb-3">What claiming gets you</h2>
            <p className="text-white/40 text-sm max-w-md mx-auto">A structured profile for AI, plus tools to see how you're being represented.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
            <div className="bg-[#111213] rounded-2xl border border-white/[0.06] p-6 sm:p-8">
              <div className="w-12 h-12 rounded-xl bg-white/[0.04] flex items-center justify-center mb-5">
                <svg className="w-6 h-6 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
              </div>
              <h3 className="text-white/90 font-semibold text-lg mb-2">AI-Readable Profile</h3>
              <p className="text-white/40 text-sm leading-relaxed mb-5">A schema.org formatted profile with your brand info, products, pricing, and FAQs.</p>
              <ul className="space-y-2">
                {['Brand description & positioning', 'Products and services', 'Pricing information', 'FAQs in structured format'].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-white/50 text-sm"><div className="w-1 h-1 rounded-full bg-white/30" />{item}</li>
                ))}
              </ul>
            </div>

            <div className="bg-[#111213] rounded-2xl border border-white/[0.06] p-6 sm:p-8">
              <div className="w-12 h-12 rounded-xl bg-white/[0.04] flex items-center justify-center mb-5">
                <svg className="w-6 h-6 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>
              </div>
              <h3 className="text-white/90 font-semibold text-lg mb-2">Visibility Analytics</h3>
              <p className="text-white/40 text-sm leading-relaxed mb-5">See how AI models describe your brand. Track mentions, compare to competitors, and monitor changes.</p>
              <ul className="space-y-2">
                {['AI model responses about your brand', 'Citation source tracking', 'Competitor comparison', 'Historical visibility trends'].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-white/50 text-sm"><div className="w-1 h-1 rounded-full bg-white/30" />{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 lg:py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10 lg:mb-12">
            <h2 className="font-semibold text-2xl sm:text-3xl text-white/90">Three steps to claim</h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-10 sm:gap-8">
            {[
              { img: '/icons/claim-search.png', title: 'Find your brand', desc: 'Search the index to see if your brand profile already exists.' },
              { img: '/icons/claim-verify.png', title: 'Verify ownership', desc: 'Confirm you represent the brand via email domain or DNS verification.' },
              { img: '/icons/claim-dashboard.png', title: 'Access your dashboard', desc: 'Review AI outputs, edit your profile, and monitor changes going forward.' },
            ].map((step) => (
              <div key={step.title} className="text-center">
                <div className="w-14 h-14 mx-auto mb-5 rounded-xl overflow-hidden">
                  <Image src={step.img} alt={step.title} width={56} height={56} className="w-full h-full object-cover" />
                </div>
                <h3 className="text-white/80 font-medium text-base mb-2">{step.title}</h3>
                <p className="text-white/30 text-sm leading-relaxed max-w-[240px] mx-auto">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Brand Marquee */}
      <section className="py-12 lg:py-16 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-6 lg:mb-8"><p className="text-white/20 text-sm">Brands indexed across every industry</p></div>
          <div className="relative">
            <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-24 bg-gradient-to-r from-[#0B0B0C] to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-24 bg-gradient-to-l from-[#0B0B0C] to-transparent z-10 pointer-events-none" />
            <div className="space-y-3 opacity-40">
              <MarqueeRow domains={MARQUEE_BRANDS[0]} direction="left" speed={45} />
              <MarqueeRow domains={MARQUEE_BRANDS[1]} direction="right" speed={50} />
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-12 lg:py-20 px-4 sm:px-6">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="font-semibold text-xl sm:text-2xl text-white/90 mb-3">Find your brand</h2>
          <p className="text-white/40 text-sm mb-6 sm:mb-8">Search the index to see your profile and claim it.</p>
          <button onClick={() => setShowClaimModal(true)} className="iridescent-hover inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-white text-black font-medium rounded-xl transition-all duration-100">
            <span>Claim Your Brand</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* ============================================
          Claim / Create Profile Modal
          ============================================ */}
      {showClaimModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm" onClick={() => setShowClaimModal(false)}>
          <div className="bg-[#111213] border border-white/[0.08] rounded-2xl max-w-md w-full overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            
            {/* Search Step */}
            {modalStep === 'search' && (
              <>
                <div className="p-6 pb-4">
                  <h3 className="text-white/90 font-semibold text-xl mb-2">Find your brand</h3>
                  <p className="text-white/40 text-sm">Search for your brand to claim it and access your AI visibility dashboard.</p>
                </div>

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
                    {claimSearching && <div className="absolute right-4 top-1/2 -translate-y-1/2"><div className="w-4 h-4 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" /></div>}
                  </div>
                </div>

                <div className="px-6 pb-6">
                  {claimSearchQuery.length >= 2 && (
                    <div className="bg-[#0B0B0C] border border-white/[0.06] rounded-xl overflow-hidden">
                      {claimSearchResults.length > 0 ? (
                        <>
                          {claimSearchResults.slice(0, 5).map((brand) => (
                            <Link key={brand.id} href={`/brands/${brand.slug}?claim=true`} className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.04] transition-colors duration-100 border-b border-white/[0.04] last:border-b-0">
                              <div className="w-9 h-9 rounded-lg bg-white overflow-hidden flex-shrink-0">
                                <Image src={brand.logo_url} alt={brand.brand_name} width={72} height={72} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-logo.svg' }} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-white/90 font-medium text-sm truncate">{brand.brand_name}</div>
                                <div className="text-white/40 text-xs truncate">{brand.domain}</div>
                              </div>
                              <ArrowRight className="w-4 h-4 text-white/30 flex-shrink-0" />
                            </Link>
                          ))}
                          <button onClick={() => handleStartCreate(claimSearchQuery)} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/[0.04] transition-colors duration-100 border-t border-white/[0.06] text-left">
                            <div className="w-9 h-9 rounded-lg bg-white/[0.06] flex items-center justify-center flex-shrink-0"><Plus className="w-4 h-4 text-white/40" /></div>
                            <div className="flex-1 min-w-0">
                              <div className="text-white/70 text-sm">Don't see your brand?</div>
                              <div className="text-white/40 text-xs">Create a new profile</div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-white/30 flex-shrink-0" />
                          </button>
                        </>
                      ) : !claimSearching ? (
                        <div className="p-4 text-center">
                          <p className="text-white/40 text-sm mb-3">No brands found for "{claimSearchQuery}"</p>
                          <button onClick={() => handleStartCreate(claimSearchQuery)} className="iridescent-hover inline-flex items-center gap-2 px-4 py-2 bg-white text-black text-sm font-medium rounded-lg transition-all duration-100">
                            <Plus className="w-4 h-4" />Create free profile
                          </button>
                        </div>
                      ) : null}
                    </div>
                  )}
                  {claimSearchQuery.length < 2 && <p className="text-white/30 text-sm text-center py-4">Type at least 2 characters to search</p>}
                </div>

                <div className="px-6 pb-6">
                  <button onClick={() => setShowClaimModal(false)} className="w-full py-3 bg-white/[0.04] hover:bg-white/[0.08] text-white/50 text-sm font-medium rounded-xl transition-colors">Cancel</button>
                </div>
              </>
            )}

            {/* Create Step */}
            {modalStep === 'create' && (
              <>
                <div className="p-6 pb-4">
                  <button onClick={() => setModalStep('search')} className="flex items-center gap-1 text-white/40 text-sm hover:text-white/60 transition-colors mb-4">
                    <ArrowLeft className="w-4 h-4" />Back
                  </button>
                  <h3 className="text-white/90 font-semibold text-xl mb-2">Create your profile</h3>
                  <p className="text-white/40 text-sm">Enter your company domain and work email to get started.</p>
                </div>

                <div className="px-6 pb-6 space-y-4">
                  <div>
                    <label className="block text-white/50 text-sm mb-2">Company domain</label>
                    <input type="text" placeholder="acme.com" value={createDomain} onChange={(e) => setCreateDomain(e.target.value.toLowerCase().trim())} className="w-full px-4 py-3 bg-[#0B0B0C] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/10 transition-all duration-100 text-base" />
                  </div>

                  <div>
                    <label className="block text-white/50 text-sm mb-2">Work email</label>
                    <input type="email" placeholder={emailDomainHint ? `you${emailDomainHint}` : 'you@company.com'} value={createEmail} onChange={(e) => setCreateEmail(e.target.value.toLowerCase().trim())} className="w-full px-4 py-3 bg-[#0B0B0C] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/10 transition-all duration-100 text-base" />
                    {createDomain && <p className="text-white/30 text-xs mt-2">Must be an email ending in @{createDomain}</p>}
                  </div>

                  {createError && <div className="p-3 rounded-lg bg-red-400/10 border border-red-400/20 text-red-400 text-sm">{createError}</div>}

                  <button onClick={handleCreateProfile} disabled={createLoading || !createDomain || !createEmail} className="w-full py-3 bg-white text-black font-medium rounded-xl hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                    {createLoading ? <><Loader2 className="w-4 h-4 animate-spin" />Creating...</> : 'Continue'}
                  </button>

                  <button onClick={() => setShowClaimModal(false)} className="w-full py-3 bg-white/[0.04] hover:bg-white/[0.08] text-white/50 text-sm font-medium rounded-xl transition-colors">Cancel</button>
                </div>
              </>
            )}

            {/* Verify Step */}
            {modalStep === 'verify' && pendingProfile && (
              <>
                <div className="p-6 pb-4">
                  <h3 className="text-white/90 font-semibold text-xl mb-2">Check your email</h3>
                  <p className="text-white/40 text-sm">We sent a 6-digit code to <span className="text-white/70">{createEmail}</span></p>
                </div>

                <div className="px-6 pb-6 space-y-4">
                  <div>
                    <label className="block text-white/50 text-sm mb-2">Verification code</label>
                    <input type="text" placeholder="000000" value={verifyCode} onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, '').slice(0, 6))} maxLength={6} autoFocus className="w-full px-4 py-3 bg-[#0B0B0C] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/10 transition-all duration-100 text-base text-center font-mono text-2xl tracking-[0.5em]" />
                  </div>

                  {verifyError && <div className="p-3 rounded-lg bg-red-400/10 border border-red-400/20 text-red-400 text-sm">{verifyError}</div>}

                  <button onClick={handleVerifyCode} disabled={verifyLoading || verifyCode.length !== 6} className="w-full py-3 bg-white text-black font-medium rounded-xl hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                    {verifyLoading ? <><Loader2 className="w-4 h-4 animate-spin" />Verifying...</> : 'Verify'}
                  </button>

                  <p className="text-white/30 text-xs text-center">
                    Didn't receive it? Check spam or <button onClick={() => setModalStep('create')} className="text-white/50 underline hover:text-white/70">try again</button>
                  </p>
                </div>
              </>
            )}

            {/* Success Step */}
            {modalStep === 'success' && pendingProfile && (
              <div className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-400/10 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-emerald-400" />
                </div>
                <h3 className="text-white/90 font-semibold text-xl mb-2">Profile created!</h3>
                <p className="text-white/40 text-sm mb-4">Taking you to your dashboard...</p>
                <div className="w-6 h-6 mx-auto border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
              </div>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}