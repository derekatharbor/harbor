// Path: /apps/web/app/brands/HarborIndexClient.tsx
// Brand Index with inline create profile modal - Marketing site styling

'use client'

import { useState, useEffect } from 'react'
import { Search, ArrowRight, Plus, ArrowLeft, Loader2, CheckCircle } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import StickyNav from '@/components/marketing/StickyNav'
import MainNav from '@/components/marketing/MainNav'

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
  const [createCompanyName, setCreateCompanyName] = useState('')
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
        setCreateCompanyName('')
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
      const domainPart = term.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0]
      setCreateDomain(domainPart)
    } else {
      setCreateCompanyName(searchTerm.trim())
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
          companyName: createCompanyName,
          domain: createDomain,
          email: createEmail,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setCreateError(data.error || 'Failed to create profile')
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
    <div className="min-h-screen">
      <style jsx global>{`
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
      `}</style>

      <StickyNav />

      {/* Hero - Two-tone background */}
      <section className="relative overflow-hidden min-h-[700px]">
        {/* Top half - solid color */}
        <div className="absolute top-0 left-0 right-0 h-[50%] bg-[#FBFAF9]" />
        {/* Bottom half - holographic image covering full area */}
        <div 
          className="absolute top-[50%] left-0 right-0 h-[50%]"
          style={{
            backgroundImage: 'url(/images/index-hero-bg.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center top'
          }}
        />
        
        <MainNav />

        <div className="relative z-10 max-w-3xl mx-auto text-center pt-12 lg:pt-20 pb-16 lg:pb-24 px-6">
          {/* Badge */}
          <Link href="/brands" className="inline-flex items-center gap-1.5 h-8 px-2 bg-white rounded-[7px] shadow-[0px_2px_2px_rgba(120,120,120,0.25)] mb-6 lg:mb-8 hover:shadow-[0px_3px_6px_rgba(120,120,120,0.3)] transition-shadow">
            <span className="px-2 py-0.5 bg-black rounded-[3px] text-[12px] font-semibold font-source-code tracking-[0.69px] text-white">NEW</span>
            <span className="text-[12px] font-semibold font-source-sans tracking-[0.69px] text-black">AI Visibility Index</span>
          </Link>

          <h1 className="max-w-[448px] mx-auto text-[32px] lg:text-[50px] font-semibold font-source-sans tracking-[0.69px] text-black leading-[1.04] mb-4">
            Your brand has an AI profile. Claim it.
          </h1>

          <p className="max-w-[456px] mx-auto text-[16px] lg:text-[20px] font-normal font-source-sans tracking-[0.69px] text-[#6C6C6B] mb-8 lg:mb-10">
            Create the structured profile AI systems reference when answering questions about your brand.
          </p>

          {/* Unified Search Container */}
          <div 
            className="mx-auto overflow-hidden"
            style={{
              width: '450px',
              background: 'white',
              borderRadius: '10px',
              border: '1px solid #F0F0EF'
            }}
          >
            {/* Search Row */}
            <div className="flex items-center px-2" style={{ height: '48px' }}>
              <input
                type="text"
                placeholder="Search for your brand"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.length >= 2 && setShowSearchDropdown(true)}
                onBlur={() => setTimeout(() => setShowSearchDropdown(false), 300)}
                className="flex-1 h-full px-3 bg-transparent outline-none"
                style={{
                  color: 'black',
                  fontSize: '15px',
                  fontFamily: 'Source Sans 3, sans-serif',
                  fontWeight: '500',
                  letterSpacing: '0.69px'
                }}
              />
              {searching && (
                <div className="mr-2">
                  <div className="w-4 h-4 border-2 border-black/20 border-t-black/60 rounded-full animate-spin" />
                </div>
              )}
              <button 
                type="button"
                className="flex items-center justify-center"
                style={{
                  width: '112px',
                  height: '38px',
                  background: 'black',
                  borderRadius: '7px',
                  color: 'white',
                  fontSize: '15px',
                  fontFamily: 'Source Sans 3, sans-serif',
                  fontWeight: '500',
                  letterSpacing: '0.69px'
                }}
              >
                Get started
              </button>
            </div>
            
            {/* Brands Row - Gray bg inside same container */}
            <div 
              className="flex items-center justify-center gap-3"
              style={{
                height: '88px',
                background: '#F4F3F2'
              }}
            >
              <div className="flex -space-x-2">
                {['nike.com', 'stripe.com', 'patagonia.com', 'figma.com', 'notion.so'].map((domain, idx) => (
                  <div key={domain} className="w-[42px] h-[42px] rounded-full overflow-hidden border-[3px] border-[#F4F3F2] bg-white" style={{ zIndex: 5 - idx }}>
                    <img src={`https://cdn.brandfetch.io/${domain}?c=1id1Fyz-h7an5-5KR_y`} alt={domain} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              <div style={{ width: '1px', height: '20px', background: '#D9D9D9' }} />
              <p 
                style={{
                  color: '#3E3E3E',
                  fontSize: '15px',
                  fontFamily: 'Source Sans 3, sans-serif',
                  fontWeight: '500',
                  letterSpacing: '0.69px'
                }}
              >
                100,000+ brands indexed
              </p>
            </div>
          </div>

          {/* Search Dropdown */}
          {showSearchDropdown && searchResults.length > 0 && (
            <div className="absolute left-1/2 -translate-x-1/2 w-[450px] mt-2 bg-white rounded-[10px] border border-[#E8E8E7] shadow-lg overflow-hidden z-[100]">
              {searchResults.map((brand) => (
                <Link
                  key={brand.id}
                  href={`/brands/${brand.slug}`}
                  className="flex items-center gap-4 px-5 py-3 hover:bg-[#F6F5F3] transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-white overflow-hidden flex-shrink-0 border border-[#EFEEED]">
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
                    <div className="text-black font-medium text-sm truncate">{brand.brand_name}</div>
                    <div className="text-[#6C6C6B] text-xs truncate">{brand.domain}</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#A0A0A0] flex-shrink-0" />
                </Link>
              ))}
              <button
                onClick={() => {
                  setShowSearchDropdown(false)
                  setClaimSearchQuery(searchQuery)
                  setShowClaimModal(true)
                  handleStartCreate(searchQuery)
                }}
                className="w-full border-t border-[#EFEEED] px-5 py-3 text-left hover:bg-[#F6F5F3] transition-colors"
              >
                <span className="text-[#6C6C6B] text-sm">
                  Can&apos;t find your brand? <span className="text-black underline underline-offset-2">Create your free profile</span>
                </span>
              </button>
            </div>
          )}

          {showSearchDropdown && searchQuery.length >= 2 && searchResults.length === 0 && !searching && (
            <div className="absolute left-1/2 -translate-x-1/2 w-[450px] mt-2 bg-white rounded-[10px] border border-[#E8E8E7] shadow-lg p-5 text-center z-[100]">
              <p className="text-[#6C6C6B] text-sm mb-3">&quot;{searchQuery}&quot; isn&apos;t in the index yet</p>
              <button
                onClick={() => {
                  setShowSearchDropdown(false)
                  setClaimSearchQuery(searchQuery)
                  setShowClaimModal(true)
                  handleStartCreate(searchQuery)
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-[7px] bg-black text-white text-sm font-medium hover:bg-black/90 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create free profile
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Why This Matters - Dark */}
      <section className="bg-[#111111] py-16 lg:py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 md:gap-6 mb-10 lg:mb-14">
            <h2 className="text-[28px] lg:text-[42px] font-semibold font-source-sans text-white leading-tight max-w-md">AI is changing how people find brands</h2>
            <p className="text-white/50 max-w-sm text-[15px] font-source-code leading-relaxed">More people are asking AI for recommendations instead of searching Google. Harbor helps you understand and manage how you appear in those conversations.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[
              { key: 'ai-search', img: '/images/card-ai-search.png', title: 'People discover brands through AI answers now' },
              { key: 'not-found', img: '/images/card-not-found.png', title: "AI doesn't understand most brand websites" },
              { key: 'outdated', img: '/images/card-outdated.png', title: 'AI pulls brand data from third-party sources' },
            ].map((card, i) => (
              <button
                key={card.key}
                onClick={() => setActiveModal(card.key)}
                className={`group relative bg-[#1a1a1a] border border-white/10 rounded-[15px] overflow-hidden text-left hover:border-white/20 transition-colors ${i === 2 ? 'sm:col-span-2 lg:col-span-1' : ''}`}
              >
                <div className="aspect-[4/3] relative m-4 sm:m-5 mb-0 rounded-xl overflow-hidden">
                  <Image src={card.img} alt={card.title} fill className="object-cover" />
                </div>
                <div className="p-5 sm:p-7 pt-4 sm:pt-6 flex items-end justify-between">
                  <h3 className="text-white font-medium text-base sm:text-xl leading-snug font-source-sans">{card.title}</h3>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors flex-shrink-0 ml-3 sm:ml-4">
                    <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-white/60" />
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
          <div className="bg-white rounded-[15px] max-w-lg w-full overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {activeModal === 'ai-search' && (
              <>
                <div className="aspect-video relative"><Image src="/images/card-ai-search.png" alt="" fill className="object-cover" /></div>
                <div className="p-6">
                  <h3 className="text-black font-semibold text-lg mb-3 font-source-sans">People discover brands through AI answers now</h3>
                  <p className="text-[#6F6E6E] text-sm leading-relaxed mb-4 font-source-code">Instead of scrolling through links, people are asking ChatGPT, Perplexity, and Claude for direct answers.</p>
                  <p className="text-[#6F6E6E] text-sm leading-relaxed font-source-code">This shift means your SEO strategy alone won&apos;t determine whether you get recommended. AI models form opinions based on the data they&apos;ve seen—and that data might not include you.</p>
                </div>
              </>
            )}
            {activeModal === 'not-found' && (
              <>
                <div className="aspect-video relative"><Image src="/images/card-not-found.png" alt="" fill className="object-cover" /></div>
                <div className="p-6">
                  <h3 className="text-black font-semibold text-lg mb-3 font-source-sans">AI doesn&apos;t understand most brand websites</h3>
                  <p className="text-[#6F6E6E] text-sm leading-relaxed mb-4 font-source-code">Your website was built for humans—with animations, carousels, and marketing copy. AI crawlers parse text, not experiences.</p>
                  <p className="text-[#6F6E6E] text-sm leading-relaxed font-source-code">Harbor gives you a clean, structured profile that AI can actually read.</p>
                </div>
              </>
            )}
            {activeModal === 'outdated' && (
              <>
                <div className="aspect-video relative"><Image src="/images/card-outdated.png" alt="" fill className="object-cover" /></div>
                <div className="p-6">
                  <h3 className="text-black font-semibold text-lg mb-3 font-source-sans">AI pulls brand data from third-party sources</h3>
                  <p className="text-[#6F6E6E] text-sm leading-relaxed mb-4 font-source-code">When AI answers questions about your company, it often cites third-party sources rather than your own website.</p>
                  <p className="text-[#6F6E6E] text-sm leading-relaxed font-source-code">Harbor becomes that third-party source, but one you actually control.</p>
                </div>
              </>
            )}
            <button onClick={() => setActiveModal(null)} className="w-full py-4 text-[#6C6C6B] text-sm font-medium hover:text-black transition-colors border-t border-[#EFEEED] font-source-sans">Close</button>
          </div>
        </div>
      )}

      {/* What You Get - Light */}
      <section className="bg-[#F6F5F3] py-16 lg:py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 lg:mb-14">
            <h2 className="text-[28px] lg:text-[42px] font-semibold font-source-sans text-black mb-3">What claiming gets you</h2>
            <p className="text-[#6C6C6B] text-[15px] font-source-code max-w-md mx-auto">A structured profile for AI, plus tools to see how you&apos;re being represented.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
            <div className="bg-white rounded-[15px] border border-[#EFEEED] p-6 sm:p-8">
              <div className="w-14 h-14 rounded-xl bg-[#F6F5F3] flex items-center justify-center mb-5">
                <svg className="w-7 h-7 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
              </div>
              <h3 className="text-black font-semibold text-[20px] mb-2 font-source-sans">AI-Readable Profile</h3>
              <p className="text-[#6F6E6E] text-[15px] font-source-code leading-relaxed mb-5">A schema.org formatted profile with your brand info, products, pricing, and FAQs.</p>
              <ul className="space-y-2">
                {['Brand description & positioning', 'Products and services', 'Pricing information', 'FAQs in structured format'].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-[#6F6E6E] text-sm font-source-code"><span className="text-black">✓</span>{item}</li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-[15px] border border-[#EFEEED] p-6 sm:p-8">
              <div className="w-14 h-14 rounded-xl bg-[#F6F5F3] flex items-center justify-center mb-5">
                <svg className="w-7 h-7 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>
              </div>
              <h3 className="text-black font-semibold text-[20px] mb-2 font-source-sans">Visibility Analytics</h3>
              <p className="text-[#6F6E6E] text-[15px] font-source-code leading-relaxed mb-5">See how AI models describe your brand. Track mentions, compare to competitors, and monitor changes.</p>
              <ul className="space-y-2">
                {['AI model responses about your brand', 'Citation source tracking', 'Competitor comparison', 'Historical visibility trends'].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-[#6F6E6E] text-sm font-source-code"><span className="text-black">✓</span>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Dark */}
      <section className="bg-[#111111] py-16 lg:py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10 lg:mb-14">
            <h2 className="text-[28px] lg:text-[42px] font-semibold font-source-sans text-white">Three steps to claim</h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-10 sm:gap-8">
            {[
              { img: '/icons/claim-search.png', title: 'Find your brand', desc: 'Search the index to see if your brand profile already exists.' },
              { img: '/icons/claim-verify.png', title: 'Verify ownership', desc: 'Confirm you represent the brand via email domain or DNS verification.' },
              { img: '/icons/claim-dashboard.png', title: 'Access your dashboard', desc: 'Review AI outputs, edit your profile, and monitor changes going forward.' },
            ].map((step) => (
              <div key={step.title} className="text-center">
                <div className="w-14 h-14 mx-auto mb-5 rounded-xl overflow-hidden bg-white/10">
                  <Image src={step.img} alt={step.title} width={56} height={56} className="w-full h-full object-cover" />
                </div>
                <h3 className="text-white font-medium text-base mb-2 font-source-sans">{step.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed max-w-[240px] mx-auto font-source-code">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Brand Marquee - Light */}
      <section className="bg-[#F6F5F3] py-12 lg:py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-6 lg:mb-8"><p className="text-[#6C6C6B] text-sm font-source-code">Brands indexed across every industry</p></div>
          <div className="relative">
            <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-24 bg-gradient-to-r from-[#F6F5F3] to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-24 bg-gradient-to-l from-[#F6F5F3] to-transparent z-10 pointer-events-none" />
            <div className="space-y-3 opacity-60">
              <MarqueeRow domains={MARQUEE_BRANDS[0]} direction="left" speed={45} />
              <MarqueeRow domains={MARQUEE_BRANDS[1]} direction="right" speed={50} />
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA - Dark */}
      <section className="bg-[#111111] py-16 lg:py-24 px-6">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-[28px] lg:text-[42px] font-semibold font-source-sans text-white mb-3">Find your brand</h2>
          <p className="text-white/50 text-[15px] font-source-code mb-6 sm:mb-8">Search the index to see your profile and claim it.</p>
          <button onClick={() => setShowClaimModal(true)} className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black font-semibold rounded-[10px] hover:bg-gray-100 transition-colors font-source-sans">
            <span>Claim Your Brand</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Claim / Create Profile Modal */}
      {showClaimModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm" onClick={() => setShowClaimModal(false)}>
          <div className="bg-white rounded-[15px] max-w-md w-full overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            
            {/* Search Step */}
            {modalStep === 'search' && (
              <>
                <div className="p-6 pb-4">
                  <h3 className="text-black font-semibold text-xl mb-2 font-source-sans">Find your brand</h3>
                  <p className="text-[#6C6C6B] text-sm font-source-code">Search for your brand to claim it and access your AI visibility dashboard.</p>
                </div>

                <div className="px-6 pb-4">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A0A0A0]" />
                    <input
                      type="text"
                      placeholder="Search for your brand..."
                      value={claimSearchQuery}
                      onChange={(e) => setClaimSearchQuery(e.target.value)}
                      autoFocus
                      className="w-full pl-12 pr-5 py-3 bg-[#F6F5F3] border border-[#E8E8E7] rounded-[10px] text-black placeholder:text-[#A0A0A0] focus:outline-none focus:border-black/20 focus:ring-1 focus:ring-black/10 transition-all text-base font-source-sans"
                    />
                    {claimSearching && <div className="absolute right-4 top-1/2 -translate-y-1/2"><div className="w-4 h-4 border-2 border-black/20 border-t-black/60 rounded-full animate-spin" /></div>}
                  </div>
                </div>

                <div className="px-6 pb-6">
                  {claimSearchQuery.length >= 2 && (
                    <div className="bg-[#F6F5F3] border border-[#E8E8E7] rounded-[10px] overflow-hidden">
                      {claimSearchResults.length > 0 ? (
                        <>
                          {claimSearchResults.slice(0, 5).map((brand) => (
                            <Link key={brand.id} href={`/brands/${brand.slug}?claim=true`} className="flex items-center gap-3 px-4 py-3 hover:bg-[#EFEEED] transition-colors border-b border-[#E8E8E7] last:border-b-0">
                              <div className="w-9 h-9 rounded-lg bg-white overflow-hidden flex-shrink-0 border border-[#EFEEED]">
                                <Image src={brand.logo_url} alt={brand.brand_name} width={72} height={72} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-logo.svg' }} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-black font-medium text-sm truncate">{brand.brand_name}</div>
                                <div className="text-[#6C6C6B] text-xs truncate">{brand.domain}</div>
                              </div>
                              <ArrowRight className="w-4 h-4 text-[#A0A0A0] flex-shrink-0" />
                            </Link>
                          ))}
                          <button onClick={() => handleStartCreate(claimSearchQuery)} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#EFEEED] transition-colors border-t border-[#E8E8E7] text-left">
                            <div className="w-9 h-9 rounded-lg bg-white border border-[#EFEEED] flex items-center justify-center flex-shrink-0"><Plus className="w-4 h-4 text-[#6C6C6B]" /></div>
                            <div className="flex-1 min-w-0">
                              <div className="text-[#6C6C6B] text-sm">Don&apos;t see your brand?</div>
                              <div className="text-[#A0A0A0] text-xs">Create a new profile</div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-[#A0A0A0] flex-shrink-0" />
                          </button>
                        </>
                      ) : !claimSearching ? (
                        <div className="p-4 text-center">
                          <p className="text-[#6C6C6B] text-sm mb-3">No brands found for &quot;{claimSearchQuery}&quot;</p>
                          <button onClick={() => handleStartCreate(claimSearchQuery)} className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-medium rounded-[7px] hover:bg-black/90 transition-colors">
                            <Plus className="w-4 h-4" />Create free profile
                          </button>
                        </div>
                      ) : null}
                    </div>
                  )}
                  {claimSearchQuery.length < 2 && <p className="text-[#A0A0A0] text-sm text-center py-4 font-source-code">Type at least 2 characters to search</p>}
                </div>

                <div className="px-6 pb-6 space-y-3">
                  <button onClick={() => setShowClaimModal(false)} className="w-full py-3 bg-[#F6F5F3] hover:bg-[#EFEEED] text-[#6C6C6B] text-sm font-medium rounded-[10px] transition-colors">Cancel</button>
                  <p className="text-[#A0A0A0] text-xs text-center font-source-code">
                    Need help? <a href="mailto:hello@useharbor.io" className="text-[#6C6C6B] underline hover:text-black">Contact us</a>
                  </p>
                </div>
              </>
            )}

            {/* Create Step */}
            {modalStep === 'create' && (
              <>
                <div className="p-6 pb-4">
                  <button onClick={() => setModalStep('search')} className="flex items-center gap-1 text-[#6C6C6B] text-sm hover:text-black transition-colors mb-4">
                    <ArrowLeft className="w-4 h-4" />Back
                  </button>
                  <h3 className="text-black font-semibold text-xl mb-2 font-source-sans">Create your profile</h3>
                  <p className="text-[#6C6C6B] text-sm font-source-code">Enter your company details to get started.</p>
                </div>

                <div className="px-6 pb-6 space-y-4">
                  <div>
                    <label className="block text-[#6C6C6B] text-sm mb-2 font-source-code">Company name</label>
                    <input type="text" placeholder="Acme Inc" value={createCompanyName} onChange={(e) => setCreateCompanyName(e.target.value)} className="w-full px-4 py-3 bg-[#F6F5F3] border border-[#E8E8E7] rounded-[10px] text-black placeholder:text-[#A0A0A0] focus:outline-none focus:border-black/20 focus:ring-1 focus:ring-black/10 transition-all text-base font-source-sans" />
                  </div>

                  <div>
                    <label className="block text-[#6C6C6B] text-sm mb-2 font-source-code">Company domain</label>
                    <input type="text" placeholder="acme.com" value={createDomain} onChange={(e) => setCreateDomain(e.target.value.toLowerCase().trim())} className="w-full px-4 py-3 bg-[#F6F5F3] border border-[#E8E8E7] rounded-[10px] text-black placeholder:text-[#A0A0A0] focus:outline-none focus:border-black/20 focus:ring-1 focus:ring-black/10 transition-all text-base font-source-sans" />
                  </div>

                  <div>
                    <label className="block text-[#6C6C6B] text-sm mb-2 font-source-code">Work email</label>
                    <input type="email" placeholder={emailDomainHint ? `you${emailDomainHint}` : 'you@company.com'} value={createEmail} onChange={(e) => setCreateEmail(e.target.value.toLowerCase().trim())} className="w-full px-4 py-3 bg-[#F6F5F3] border border-[#E8E8E7] rounded-[10px] text-black placeholder:text-[#A0A0A0] focus:outline-none focus:border-black/20 focus:ring-1 focus:ring-black/10 transition-all text-base font-source-sans" />
                    {createDomain && <p className="text-[#A0A0A0] text-xs mt-2 font-source-code">Must be an email ending in @{createDomain}</p>}
                  </div>

                  {createError && <div className="p-3 rounded-[10px] bg-red-50 border border-red-200 text-red-600 text-sm">{createError}</div>}

                  <button onClick={handleCreateProfile} disabled={createLoading || !createCompanyName || !createDomain || !createEmail} className="w-full py-3 bg-black text-white font-medium rounded-[10px] hover:bg-black/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-source-sans">
                    {createLoading ? <><Loader2 className="w-4 h-4 animate-spin" />Creating...</> : 'Continue'}
                  </button>

                  <button onClick={() => setShowClaimModal(false)} className="w-full py-3 bg-[#F6F5F3] hover:bg-[#EFEEED] text-[#6C6C6B] text-sm font-medium rounded-[10px] transition-colors">Cancel</button>
                  
                  <p className="text-[#A0A0A0] text-xs text-center font-source-code">
                    Need help? <a href="mailto:hello@useharbor.io" className="text-[#6C6C6B] underline hover:text-black">Contact us</a>
                  </p>
                </div>
              </>
            )}

            {/* Verify Step */}
            {modalStep === 'verify' && pendingProfile && (
              <>
                <div className="p-6 pb-4">
                  <h3 className="text-black font-semibold text-xl mb-2 font-source-sans">Check your email</h3>
                  <p className="text-[#6C6C6B] text-sm font-source-code">We sent a 6-digit code to <span className="text-black">{createEmail}</span></p>
                </div>

                <div className="px-6 pb-6 space-y-4">
                  <div>
                    <label className="block text-[#6C6C6B] text-sm mb-2 font-source-code">Verification code</label>
                    <input type="text" placeholder="000000" value={verifyCode} onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, '').slice(0, 6))} maxLength={6} autoFocus className="w-full px-4 py-3 bg-[#F6F5F3] border border-[#E8E8E7] rounded-[10px] text-black placeholder:text-[#A0A0A0] focus:outline-none focus:border-black/20 focus:ring-1 focus:ring-black/10 transition-all text-base text-center font-mono text-2xl tracking-[0.5em]" />
                  </div>

                  {verifyError && <div className="p-3 rounded-[10px] bg-red-50 border border-red-200 text-red-600 text-sm">{verifyError}</div>}

                  <button onClick={handleVerifyCode} disabled={verifyLoading || verifyCode.length !== 6} className="w-full py-3 bg-black text-white font-medium rounded-[10px] hover:bg-black/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-source-sans">
                    {verifyLoading ? <><Loader2 className="w-4 h-4 animate-spin" />Verifying...</> : 'Verify'}
                  </button>

                  <p className="text-[#A0A0A0] text-xs text-center font-source-code">
                    Didn&apos;t receive it? Check spam or <button onClick={() => setModalStep('create')} className="text-[#6C6C6B] underline hover:text-black">try again</button>
                  </p>
                  
                  <p className="text-[#A0A0A0] text-xs text-center font-source-code">
                    Need help? <a href="mailto:hello@useharbor.io" className="text-[#6C6C6B] underline hover:text-black">Contact us</a>
                  </p>
                </div>
              </>
            )}

            {/* Success Step */}
            {modalStep === 'success' && pendingProfile && (
              <div className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-50 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-emerald-500" />
                </div>
                <h3 className="text-black font-semibold text-xl mb-2 font-source-sans">Profile created!</h3>
                <p className="text-[#6C6C6B] text-sm mb-4 font-source-code">Taking you to your dashboard...</p>
                <div className="w-6 h-6 mx-auto border-2 border-black/20 border-t-black/60 rounded-full animate-spin" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="w-full bg-[#111111] pt-16 pb-8 border-t border-[#222]">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-14">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-16 mb-12 lg:mb-16">
            <div className="col-span-2 lg:col-span-1 flex justify-center lg:justify-start mb-4 lg:mb-0">
              <img src="/images/Harbor_White_Logo.png" alt="Harbor" className="w-10 h-10" />
            </div>
            <div>
              <h4 className="text-white text-[16px] lg:text-[18px] font-semibold font-source-sans mb-4 lg:mb-6">Product</h4>
              <ul className="space-y-3 lg:space-y-4">
                <li><Link href="/features/brand-visibility" className="text-[#888] text-[14px] lg:text-[15px] font-source-sans hover:text-white transition-colors">Brand Visibility</Link></li>
                <li><Link href="/features/shopping" className="text-[#888] text-[14px] lg:text-[15px] font-source-sans hover:text-white transition-colors">Shopping Intelligence</Link></li>
                <li><Link href="/features/conversations" className="text-[#888] text-[14px] lg:text-[15px] font-source-sans hover:text-white transition-colors">Conversation Tracking</Link></li>
                <li><Link href="/features/analytics" className="text-[#888] text-[14px] lg:text-[15px] font-source-sans hover:text-white transition-colors">Website Analytics</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white text-[16px] lg:text-[18px] font-semibold font-source-sans mb-4 lg:mb-6">Company</h4>
              <ul className="space-y-3 lg:space-y-4">
                <li><Link href="/pricing" className="text-[#888] text-[14px] lg:text-[15px] font-source-sans hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/about" className="text-[#888] text-[14px] lg:text-[15px] font-source-sans hover:text-white transition-colors">About us</Link></li>
                <li><Link href="/blog" className="text-[#888] text-[14px] lg:text-[15px] font-source-sans hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="/contact" className="text-[#888] text-[14px] lg:text-[15px] font-source-sans hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white text-[16px] lg:text-[18px] font-semibold font-source-sans mb-4 lg:mb-6">Resources</h4>
              <ul className="space-y-3 lg:space-y-4">
                <li><Link href="/index" className="text-[#888] text-[14px] lg:text-[15px] font-source-sans hover:text-white transition-colors">Brand Index</Link></li>
                <li><Link href="/docs" className="text-[#888] text-[14px] lg:text-[15px] font-source-sans hover:text-white transition-colors">Documentation</Link></li>
                <li><Link href="/help" className="text-[#888] text-[14px] lg:text-[15px] font-source-sans hover:text-white transition-colors">Help Center</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white text-[16px] lg:text-[18px] font-semibold font-source-sans mb-4 lg:mb-6">Contact</h4>
              <ul className="space-y-3 lg:space-y-4">
                <li><a href="mailto:hello@useharbor.io" className="text-[#888] text-[14px] lg:text-[15px] font-source-sans hover:text-white transition-colors">hello@useharbor.io</a></li>
                <li><a href="https://twitter.com/useharbor" target="_blank" rel="noopener noreferrer" className="text-[#888] text-[14px] lg:text-[15px] font-source-sans hover:text-white transition-colors">Twitter / X</a></li>
                <li><a href="https://linkedin.com/company/useharbor" target="_blank" rel="noopener noreferrer" className="text-[#888] text-[14px] lg:text-[15px] font-source-sans hover:text-white transition-colors">LinkedIn</a></li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row items-center justify-between pt-8 border-t border-[#222] gap-4">
            <p className="text-[#666] text-[14px] font-source-sans">© 2025 Harbor</p>
            <div className="flex items-center gap-6 lg:gap-8">
              <Link href="/privacy" className="text-[#666] text-[14px] font-source-sans hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="text-[#666] text-[14px] font-source-sans hover:text-white transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}