// Path: /apps/web/app/brands/[slug]/BrandProfileClient.tsx

'use client'

import { useState, useEffect } from 'react'
import { X, Shield, ExternalLink } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import CompleteSignupModal from '@/components/auth/CompleteSignupModal'
import LoginModal from '@/components/auth/LoginModal'
import StickyNav from '@/components/marketing/StickyNav'
import MainNav from '@/components/marketing/MainNav'

interface Brand {
  id: string
  brand_name: string
  slug: string
  domain: string
  logo_url: string
  visibility_score: number
  industry: string
  rank_global: number
  claimed: boolean
  feed_data?: any
  audit_data?: {
    models: Record<string, { accuracy_score: number; findings: any[] }>
    models_responded?: string[]
    consensus_issues: string[]
    overall_accuracy: number
    has_issues: boolean
    checked_at: string
  }
}

interface Props {
  brand: Brand
}

export default function BrandProfileClient({ brand: initialBrand }: Props) {
  const router = useRouter()
  const [brand, setBrand] = useState<Brand>(initialBrand)
  const [loading, setLoading] = useState(initialBrand.brand_name === 'Loading...')
  const [showClaimModal, setShowClaimModal] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showSignupModal, setShowSignupModal] = useState(false)
  const [claimStep, setClaimStep] = useState<'email' | 'code'>('email')
  const [email, setEmail] = useState('')
  const [claimedEmail, setClaimedEmail] = useState('')
  const [code, setCode] = useState('')
  const [claimLoading, setClaimLoading] = useState(false)
  const [error, setError] = useState('')

  // Fetch brand data if not provided OR refresh on mount to get latest claimed status
  useEffect(() => {
    const fetchBrand = async () => {
      try {
        const res = await fetch(`/api/brands/${initialBrand.slug}`)
        const data = await res.json()
        setBrand(data)
        setLoading(false)
      } catch (err) {
        console.error('Failed to fetch brand:', err)
        setLoading(false)
      }
    }

    if (initialBrand.brand_name === 'Loading...') {
      fetchBrand()
    } else {
      // Always refresh on mount to get latest claimed status
      fetchBrand()
    }
  }, [initialBrand.slug])

  const handleSendCode = async () => {
    setError('')
    
    // Validate domain
    const emailDomain = email.split('@')[1]
    if (!emailDomain || emailDomain !== brand.domain) {
      setError(`You must use an email ending in @${brand.domain}`)
      return
    }

    setClaimLoading(true)
    
    try {
      const res = await fetch('/api/claim/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brandId: brand.id, email })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send code')
      }

      setClaimStep('code')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setClaimLoading(false)
    }
  }

  const handleVerifyCode = async () => {
    setError('')
    setClaimLoading(true)

    try {
      const res = await fetch('/api/claim/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brandId: brand.id, email, code })
      })

      const data = await res.json()

      // Handle "already claimed by this email" as success
      if (!res.ok && data.error?.includes('already claimed by this email')) {
        // Profile already claimed by this user - redirect to manage
        router.push(`/brands/${brand.slug}/manage`)
        return
      }

      if (!res.ok) {
        throw new Error(data.error || 'Invalid or expired code')
      }

      // Check if user needs to complete signup
      if (data.needsSignup) {
        // Show signup modal
        setClaimedEmail(data.email)
        setShowSignupModal(true)
        setShowClaimModal(false)
      } else {
        // User already has auth account - redirect to manage
        router.push(`/brands/${brand.slug}/manage`)
      }
    } catch (err: any) {
      setError(err.message)
      setClaimLoading(false)
    }
  }

  // Parse feed data
  const feedData = brand.feed_data || {}
  
  // Calculate what's missing (the real hook)
  const missingItems = []
  if (!feedData.pricing || feedData.pricing.length === 0) {
    missingItems.push({ label: 'Pricing', description: 'AI models may guess or pull outdated pricing from third-party sites' })
  }
  if (!feedData.offerings || feedData.offerings.length === 0) {
    missingItems.push({ label: 'Products & Services', description: 'Without this, AI gives generic descriptions of what you offer' })
  }
  if (!feedData.faqs || feedData.faqs.length === 0) {
    missingItems.push({ label: 'FAQs', description: 'Common questions go unanswered or get filled in from forums' })
  }
  if (!feedData.company_info?.founded_year) {
    missingItems.push({ label: 'Company details', description: 'Founding date, location, size—AI often gets these wrong' })
  }

  // Check for ?claim=true query param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('claim') === 'true' && !brand.claimed) {
      setShowClaimModal(true)
    }
  }, [brand.claimed])

  return (
    <div className="min-h-screen bg-[#F6F5F3]">
      <StickyNav />
      <div className="relative z-50">
        <MainNav />
      </div>

      {/* Profile Content */}
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-12 relative z-0">
        
        {/* Back button */}
        <Link 
          href="/brands"
          className="inline-flex items-center gap-2 text-[#6C6C6B] hover:text-black text-sm mb-8 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to index
        </Link>
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start gap-6 mb-10">
          {/* Logo */}
          <div className="w-20 h-20 rounded-xl overflow-hidden bg-white border border-[#EFEEED] flex items-center justify-center flex-shrink-0">
            <Image
              src={brand.logo_url}
              alt={brand.brand_name}
              width={80}
              height={80}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none'
              }}
            />
          </div>

          {/* Brand Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl md:text-4xl font-bold text-black font-source-sans">
                {brand.brand_name}
              </h1>
              {brand.claimed && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-medium border border-emerald-200">
                  <Shield className="w-3.5 h-3.5" />
                  Claimed
                </div>
              )}
            </div>
            <div className="flex items-center gap-3 text-[#6C6C6B] text-sm font-source-code">
              <span>{brand.domain}</span>
              {brand.industry && (
                <>
                  <span>•</span>
                  <span>{brand.industry}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* What AI Says - The main content block */}
        <div className="bg-white rounded-2xl border border-[#EFEEED] p-6 md:p-8 mb-6">
          <h2 className="text-sm font-medium text-[#6C6C6B] uppercase tracking-wide mb-4 font-source-code">
            What AI says about {brand.brand_name}
          </h2>
          {feedData.short_description ? (
            <p className="text-black/80 text-lg leading-relaxed font-source-sans">
              {feedData.short_description}
            </p>
          ) : (
            <p className="text-[#6C6C6B] text-lg italic font-source-sans">
              No description available. AI models are forming their own interpretation.
            </p>
          )}
        </div>

        {/* AI Accuracy Report - Teaser for unclaimed profiles */}
        {brand.audit_data?.has_issues && !brand.claimed && (
          <div className="bg-amber-50 rounded-2xl border border-amber-200 p-6 md:p-8 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-semibold text-black font-source-sans">
                    AI Accuracy: {brand.audit_data.overall_accuracy}%
                  </h3>
                </div>
                <p className="text-[#6C6C6B] text-sm mb-4 font-source-code">
                  We audited how ChatGPT, Claude, and Perplexity describe this brand.
                </p>
                
                {/* Model scores */}
                <div className="flex gap-4 mb-4">
                  {['chatgpt', 'claude', 'perplexity'].map((model) => {
                    const audit = brand.audit_data?.models?.[model]
                    const responded = audit && (audit.accuracy_score > 0 || audit.findings.length > 0)
                    const label = model === 'chatgpt' ? 'ChatGPT' : model === 'claude' ? 'Claude' : 'Perplexity'
                    
                    return (
                      <div key={model} className="text-center">
                        <div className={`text-lg font-semibold ${
                          !responded ? 'text-[#A0A0A0]' :
                          (audit?.accuracy_score ?? 0) >= 70 ? 'text-emerald-600' :
                          (audit?.accuracy_score ?? 0) >= 50 ? 'text-amber-600' : 'text-red-600'
                        }`}>
                          {responded ? `${audit?.accuracy_score}%` : '—'}
                        </div>
                        <div className="text-[#6C6C6B] text-xs font-source-code">{label}</div>
                      </div>
                    )
                  })}
                </div>

                {/* Issues preview */}
                {brand.audit_data.consensus_issues.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[#A0A0A0] text-xs uppercase tracking-wide font-source-code">Issues found:</p>
                    <div className="flex flex-wrap gap-2">
                      {brand.audit_data.consensus_issues.slice(0, 3).map((issue, idx) => (
                        <span key={idx} className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-sm border border-red-200">
                          {issue === 'pricing' ? 'Pricing' :
                           issue === 'features' ? 'Features' :
                           issue === 'icp' ? 'Target customer' :
                           issue === 'description' ? 'Description' :
                           issue === 'integrations' ? 'Integrations' :
                           issue.charAt(0).toUpperCase() + issue.slice(1)}
                        </span>
                      ))}
                      {brand.audit_data.consensus_issues.length > 3 && (
                        <span className="px-3 py-1.5 rounded-lg bg-[#F6F5F3] text-[#6C6C6B] text-sm border border-[#EFEEED]">
                          +{brand.audit_data.consensus_issues.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={() => setShowClaimModal(true)}
                className="px-6 py-3 rounded-xl bg-black text-white font-medium hover:bg-black/80 transition-all flex-shrink-0"
              >
                Claim to fix
              </button>
            </div>
          </div>
        )}

        {/* What's Missing + Claim CTA - Combined */}
        {!brand.claimed ? (
          <div className="bg-white rounded-2xl border border-[#EFEEED] p-6 md:p-8 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-black mb-2 font-source-sans">
                  Is this your brand?
                </h3>
                <p className="text-[#6C6C6B] text-sm mb-4 font-source-code">
                  Claim this profile to keep your information accurate and add what's missing.
                </p>
                
                {missingItems.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[#A0A0A0] text-xs uppercase tracking-wide font-source-code">Not in this profile yet:</p>
                    <div className="flex flex-wrap gap-2">
                      {missingItems.map((item, idx) => (
                        <span key={idx} className="px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 text-sm border border-amber-200">
                          {item.label}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={() => setShowClaimModal(true)}
                className="px-6 py-3 rounded-xl bg-black text-white font-medium hover:bg-black/80 transition-all flex-shrink-0"
              >
                Claim profile
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-6 md:p-8 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-emerald-600" />
                <div>
                  <h3 className="text-black font-medium font-source-sans">
                    This profile is claimed
                  </h3>
                  <p className="text-[#6C6C6B] text-sm font-source-code">
                    Managed by {brand.brand_name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowClaimModal(true)}
                className="px-6 py-3 rounded-xl bg-[#F6F5F3] text-black font-medium hover:bg-[#EFEEED] transition-all flex-shrink-0 border border-[#EFEEED]"
              >
                Sign in to manage
              </button>
            </div>
          </div>
        )}

        {/* Pricing - Show if available */}
        {feedData.pricing && feedData.pricing.length > 0 && (
          <div className="bg-white rounded-2xl border border-[#EFEEED] p-6 md:p-8 mb-6">
            <h2 className="text-sm font-medium text-[#6C6C6B] uppercase tracking-wide mb-4 font-source-code">
              Pricing
            </h2>
            <div className="space-y-3">
              {feedData.pricing.map((tier: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-[#F6F5F3] rounded-lg border border-[#EFEEED]">
                  <div>
                    <div className="text-black font-medium font-source-sans">{tier.name || tier.tier}</div>
                    {tier.description && (
                      <div className="text-[#6C6C6B] text-sm font-source-code">{tier.description}</div>
                    )}
                  </div>
                  <div className="text-black font-medium font-source-sans">
                    {tier.price || 'Contact'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Offerings */}
        {feedData.offerings && feedData.offerings.length > 0 && (
          <div className="bg-white rounded-2xl border border-[#EFEEED] p-6 md:p-8 mb-6">
            <h2 className="text-sm font-medium text-[#6C6C6B] uppercase tracking-wide mb-4 font-source-code">
              Products & Services
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {feedData.offerings.map((offering: any, idx: number) => (
                <div key={idx} className="bg-[#F6F5F3] rounded-lg p-4 border border-[#EFEEED]">
                  <h3 className="text-black font-medium mb-1 font-source-sans">{offering.name}</h3>
                  <p className="text-[#6C6C6B] text-sm font-source-code">{offering.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FAQs */}
        {feedData.faqs && feedData.faqs.length > 0 && (
          <div className="bg-white rounded-2xl border border-[#EFEEED] p-6 md:p-8 mb-6">
            <h2 className="text-sm font-medium text-[#6C6C6B] uppercase tracking-wide mb-4 font-source-code">
              Common Questions
            </h2>
            <div className="space-y-3">
              {feedData.faqs.map((faq: any, idx: number) => (
                <div key={idx} className="bg-[#F6F5F3] rounded-lg p-4 border border-[#EFEEED]">
                  <h3 className="text-black font-medium mb-1 font-source-sans">{faq.question}</h3>
                  <p className="text-[#6C6C6B] text-sm leading-relaxed font-source-code">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Company Info */}
        {feedData.company_info && (
          <div className="bg-white rounded-2xl border border-[#EFEEED] p-6 md:p-8 mb-6">
            <h2 className="text-sm font-medium text-[#6C6C6B] uppercase tracking-wide mb-4 font-source-code">
              Company Information
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {feedData.company_info.founded_year && (
                <div>
                  <div className="text-[#6C6C6B] text-sm mb-1 font-source-code">Founded</div>
                  <div className="text-black font-medium font-source-sans">{feedData.company_info.founded_year}</div>
                </div>
              )}
              {feedData.company_info.hq_location && (
                <div>
                  <div className="text-[#6C6C6B] text-sm mb-1 font-source-code">Headquarters</div>
                  <div className="text-black font-medium font-source-sans">{feedData.company_info.hq_location}</div>
                </div>
              )}
              {feedData.company_info.employee_band && (
                <div>
                  <div className="text-[#6C6C6B] text-sm mb-1 font-source-code">Employees</div>
                  <div className="text-black font-medium font-source-sans">{feedData.company_info.employee_band}</div>
                </div>
              )}
              {feedData.company_info.industry_tags && feedData.company_info.industry_tags.length > 0 && (
                <div>
                  <div className="text-[#6C6C6B] text-sm mb-1 font-source-code">Industries</div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {feedData.company_info.industry_tags.map((tag: string, idx: number) => (
                      <span key={idx} className="px-2 py-1 rounded bg-[#F6F5F3] text-black text-xs border border-[#EFEEED]">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 pt-6 border-t border-[#EFEEED]">
              <a
                href={`https://${brand.domain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[#6C6C6B] hover:text-black transition-colors text-sm font-source-sans"
              >
                Visit {brand.brand_name}
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        )}
      </div>

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

      {/* Claim Modal */}
      {showClaimModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowClaimModal(false)}
          />

          {/* Modal */}
          <div className="relative bg-white rounded-2xl border border-[#EFEEED] w-full max-w-md p-8 shadow-xl">
            {/* Close button */}
            <button
              onClick={() => setShowClaimModal(false)}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-[#F6F5F3] transition-colors"
            >
              <X className="w-5 h-5 text-[#6C6C6B]" />
            </button>

            {/* Email Step */}
            {claimStep === 'email' && (
              <div>
                <h2 className="text-2xl font-bold text-black mb-2 font-source-sans">
                  {brand.claimed ? 'Sign in to manage' : 'Claim this Profile'}
                </h2>
                <p className="text-[#6C6C6B] text-sm mb-6 font-source-code">
                  {brand.claimed 
                    ? 'Enter your company email to access the management dashboard:'
                    : 'To verify ownership, enter an email with this domain:'
                  }
                </p>

                <div className="mb-4">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#F6F5F3] border border-[#EFEEED] mb-4">
                    <span className="text-[#6C6C6B]">@</span>
                    <span className="text-black font-mono">{brand.domain}</span>
                  </div>

                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={`you@${brand.domain}`}
                    className="w-full px-4 py-3 rounded-lg bg-[#F6F5F3] border border-[#EFEEED] text-black placeholder-[#A0A0A0] focus:outline-none focus:border-[#6C6C6B] transition-colors"
                    disabled={claimLoading}
                  />
                </div>

                {error && (
                  <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                    {error}
                  </div>
                )}

                <button
                  onClick={handleSendCode}
                  disabled={claimLoading || !email}
                  className="w-full px-6 py-3 rounded-lg bg-black text-white font-medium hover:bg-black/80 transition-all disabled:opacity-50"
                >
                  {claimLoading ? 'Sending...' : 'Send verification code'}
                </button>
              </div>
            )}

            {/* Code Step */}
            {claimStep === 'code' && (
              <div>
                <h2 className="text-2xl font-bold text-black mb-2 font-source-sans">
                  Verify your email
                </h2>
                <p className="text-[#6C6C6B] text-sm mb-6 font-source-code">
                  We sent a 6-digit code to <span className="text-black font-mono">{email}</span>
                </p>

                <div className="mb-4">
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    className="w-full px-4 py-3 rounded-lg bg-[#F6F5F3] border border-[#EFEEED] text-black text-center text-2xl tracking-widest placeholder-[#A0A0A0] focus:outline-none focus:border-[#6C6C6B] transition-colors font-mono"
                    maxLength={6}
                    disabled={claimLoading}
                  />
                </div>

                {error && (
                  <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                    {error}
                  </div>
                )}

                <button
                  onClick={handleVerifyCode}
                  disabled={claimLoading || code.length !== 6}
                  className="w-full px-6 py-3 rounded-lg bg-black text-white font-medium hover:bg-black/80 transition-all disabled:opacity-50 mb-3"
                >
                  {claimLoading ? 'Verifying...' : 'Verify'}
                </button>

                <button
                  onClick={() => setClaimStep('email')}
                  className="w-full text-[#6C6C6B] text-sm hover:text-black transition-colors"
                >
                  ← Use a different email
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        brandSlug={brand.slug}
        onClose={() => setShowLoginModal(false)}
      />

      {/* Complete Signup Modal */}
      <CompleteSignupModal
        isOpen={showSignupModal}
        email={claimedEmail}
        brandSlug={brand.slug}
        onSuccess={() => {
          router.push(`/brands/${brand.slug}/manage`)
        }}
        onClose={() => setShowSignupModal(false)}
      />
    </div>
  )
}