// Path: /apps/web/app/brands/[slug]/BrandProfileClient.tsx

'use client'

import { useState, useEffect } from 'react'
import { X, Shield, ExternalLink } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import CompleteSignupModal from '@/components/auth/CompleteSignupModal'
import LoginModal from '@/components/auth/LoginModal'
import Nav from '@/components/landing-new/Nav'
import Footer from '@/components/landing-new/Footer'

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
    <div className="min-h-screen bg-[#0a0a0a]">
      <Nav />

      {/* Spacer for fixed nav */}
      <div className="h-20" />

      {/* Profile Content */}
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-12 relative z-10">
        
        {/* Back button */}
        <Link 
          href="/brands"
          className="inline-flex items-center gap-2 text-white/40 hover:text-white/70 text-sm mb-8 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to index
        </Link>
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start gap-6 mb-10">
          {/* Logo */}
          <div className="w-20 h-20 rounded-xl overflow-hidden bg-white/5 flex items-center justify-center flex-shrink-0">
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
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                {brand.brand_name}
              </h1>
              {brand.claimed && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-400/10 text-emerald-400 text-xs font-medium">
                  <Shield className="w-3.5 h-3.5" />
                  Claimed
                </div>
              )}
            </div>
            <div className="flex items-center gap-3 text-white/40 text-sm">
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
        <div className="bg-white/[0.02] rounded-2xl border border-white/[0.08] p-6 md:p-8 mb-6">
          <h2 className="text-sm font-medium text-white/40 uppercase tracking-wide mb-4">
            What AI says about {brand.brand_name}
          </h2>
          {feedData.short_description ? (
            <p className="text-white/80 text-lg leading-relaxed">
              {feedData.short_description}
            </p>
          ) : (
            <p className="text-white/40 text-lg italic">
              No description available. AI models are forming their own interpretation.
            </p>
          )}
        </div>

        {/* AI Accuracy Report - Teaser for unclaimed profiles */}
        {brand.audit_data?.has_issues && !brand.claimed && (
          <div className="bg-amber-400/[0.03] rounded-2xl border border-amber-400/20 p-6 md:p-8 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-semibold text-white">
                    AI Accuracy: {brand.audit_data.overall_accuracy}%
                  </h3>
                </div>
                <p className="text-white/50 text-sm mb-4">
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
                          !responded ? 'text-white/30' :
                          (audit?.accuracy_score ?? 0) >= 70 ? 'text-emerald-400' :
                          (audit?.accuracy_score ?? 0) >= 50 ? 'text-amber-400' : 'text-red-400'
                        }`}>
                          {responded ? `${audit?.accuracy_score}%` : '—'}
                        </div>
                        <div className="text-white/40 text-xs">{label}</div>
                      </div>
                    )
                  })}
                </div>

                {/* Issues preview */}
                {brand.audit_data.consensus_issues.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-white/30 text-xs uppercase tracking-wide">Issues found:</p>
                    <div className="flex flex-wrap gap-2">
                      {brand.audit_data.consensus_issues.slice(0, 3).map((issue, idx) => (
                        <span key={idx} className="px-3 py-1.5 rounded-lg bg-red-400/10 text-red-400/80 text-sm">
                          {issue === 'pricing' ? 'Pricing' :
                           issue === 'features' ? 'Features' :
                           issue === 'icp' ? 'Target customer' :
                           issue === 'description' ? 'Description' :
                           issue === 'integrations' ? 'Integrations' :
                           issue.charAt(0).toUpperCase() + issue.slice(1)}
                        </span>
                      ))}
                      {brand.audit_data.consensus_issues.length > 3 && (
                        <span className="px-3 py-1.5 rounded-lg bg-white/[0.04] text-white/40 text-sm">
                          +{brand.audit_data.consensus_issues.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={() => setShowClaimModal(true)}
                className="px-6 py-3 rounded-xl bg-white text-black font-medium hover:bg-white/90 transition-all flex-shrink-0"
              >
                Claim to fix
              </button>
            </div>
          </div>
        )}

        {/* What's Missing + Claim CTA - Combined */}
        {!brand.claimed ? (
          <div className="bg-white/[0.02] rounded-2xl border border-white/[0.08] p-6 md:p-8 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-white mb-2">
                  Is this your brand?
                </h3>
                <p className="text-white/50 text-sm mb-4">
                  Claim this profile to keep your information accurate and add what's missing.
                </p>
                
                {missingItems.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-white/30 text-xs uppercase tracking-wide">Not in this profile yet:</p>
                    <div className="flex flex-wrap gap-2">
                      {missingItems.map((item, idx) => (
                        <span key={idx} className="px-3 py-1.5 rounded-lg bg-amber-400/10 text-amber-400/80 text-sm">
                          {item.label}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={() => setShowClaimModal(true)}
                className="px-6 py-3 rounded-xl bg-white text-black font-medium hover:bg-white/90 transition-all flex-shrink-0"
              >
                Claim profile
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-emerald-400/[0.03] rounded-2xl border border-emerald-400/10 p-6 md:p-8 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="text-white font-medium">
                    This profile is claimed
                  </h3>
                  <p className="text-white/50 text-sm">
                    Managed by {brand.brand_name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowClaimModal(true)}
                className="px-6 py-3 rounded-xl bg-white/[0.06] text-white font-medium hover:bg-white/[0.1] transition-all flex-shrink-0"
              >
                Sign in to manage
              </button>
            </div>
          </div>
        )}

        {/* Pricing - Show if available */}
        {feedData.pricing && feedData.pricing.length > 0 && (
          <div className="bg-white/[0.02] rounded-2xl border border-white/[0.08] p-6 md:p-8 mb-6">
            <h2 className="text-sm font-medium text-white/40 uppercase tracking-wide mb-4">
              Pricing
            </h2>
            <div className="space-y-3">
              {feedData.pricing.map((tier: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-white/[0.03] rounded-lg border border-white/[0.06]">
                  <div>
                    <div className="text-white font-medium">{tier.name || tier.tier}</div>
                    {tier.description && (
                      <div className="text-white/40 text-sm">{tier.description}</div>
                    )}
                  </div>
                  <div className="text-white font-medium">
                    {tier.price || 'Contact'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Offerings */}
        {feedData.offerings && feedData.offerings.length > 0 && (
          <div className="bg-white/[0.02] rounded-2xl border border-white/[0.08] p-6 md:p-8 mb-6">
            <h2 className="text-sm font-medium text-white/40 uppercase tracking-wide mb-4">
              Products & Services
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {feedData.offerings.map((offering: any, idx: number) => (
                <div key={idx} className="bg-white/[0.03] rounded-lg p-4 border border-white/[0.06]">
                  <h3 className="text-white font-medium mb-1">{offering.name}</h3>
                  <p className="text-white/50 text-sm">{offering.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FAQs */}
        {feedData.faqs && feedData.faqs.length > 0 && (
          <div className="bg-white/[0.02] rounded-2xl border border-white/[0.08] p-6 md:p-8 mb-6">
            <h2 className="text-sm font-medium text-white/40 uppercase tracking-wide mb-4">
              Common Questions
            </h2>
            <div className="space-y-3">
              {feedData.faqs.map((faq: any, idx: number) => (
                <div key={idx} className="bg-white/[0.03] rounded-lg p-4 border border-white/[0.06]">
                  <h3 className="text-white font-medium mb-1">{faq.question}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Company Info */}
        {feedData.company_info && (
          <div className="bg-white/[0.02] rounded-2xl border border-white/[0.08] p-6 md:p-8 mb-6">
            <h2 className="text-sm font-medium text-white/40 uppercase tracking-wide mb-4">
              Company Information
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {feedData.company_info.founded_year && (
                <div>
                  <div className="text-white/40 text-sm mb-1">Founded</div>
                  <div className="text-white font-medium">{feedData.company_info.founded_year}</div>
                </div>
              )}
              {feedData.company_info.hq_location && (
                <div>
                  <div className="text-white/40 text-sm mb-1">Headquarters</div>
                  <div className="text-white font-medium">{feedData.company_info.hq_location}</div>
                </div>
              )}
              {feedData.company_info.employee_band && (
                <div>
                  <div className="text-white/40 text-sm mb-1">Employees</div>
                  <div className="text-white font-medium">{feedData.company_info.employee_band}</div>
                </div>
              )}
              {feedData.company_info.industry_tags && feedData.company_info.industry_tags.length > 0 && (
                <div>
                  <div className="text-white/40 text-sm mb-1">Industries</div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {feedData.company_info.industry_tags.map((tag: string, idx: number) => (
                      <span key={idx} className="px-2 py-1 rounded bg-white/[0.05] text-white text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 pt-6 border-t border-white/[0.06]">
              <a
                href={`https://${brand.domain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm"
              >
                Visit {brand.brand_name}
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <Footer />

      {/* Claim Modal */}
      {showClaimModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowClaimModal(false)}
          />

          {/* Modal */}
          <div className="relative bg-[#111213] rounded-2xl border border-white/[0.08] w-full max-w-md p-8">
            {/* Close button */}
            <button
              onClick={() => setShowClaimModal(false)}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5 text-white/50" />
            </button>

            {/* Email Step */}
            {claimStep === 'email' && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  {brand.claimed ? 'Sign in to manage' : 'Claim this Profile'}
                </h2>
                <p className="text-white/50 text-sm mb-6">
                  {brand.claimed 
                    ? 'Enter your company email to access the management dashboard:'
                    : 'To verify ownership, enter an email with this domain:'
                  }
                </p>

                <div className="mb-4">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/[0.03] border border-white/[0.08] mb-4">
                    <span className="text-white/40">@</span>
                    <span className="text-white font-mono">{brand.domain}</span>
                  </div>

                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={`you@${brand.domain}`}
                    className="w-full px-4 py-3 rounded-lg bg-white/[0.03] border border-white/[0.08] text-white placeholder-white/30 focus:outline-none focus:border-white/20 transition-colors"
                    disabled={claimLoading}
                  />
                </div>

                {error && (
                  <div className="mb-4 p-3 rounded-lg bg-red-400/10 border border-red-400/20 text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <button
                  onClick={handleSendCode}
                  disabled={claimLoading || !email}
                  className="w-full px-6 py-3 rounded-lg bg-white text-black font-medium hover:bg-white/90 transition-all disabled:opacity-50"
                >
                  {claimLoading ? 'Sending...' : 'Send verification code'}
                </button>
              </div>
            )}

            {/* Code Step */}
            {claimStep === 'code' && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Verify your email
                </h2>
                <p className="text-white/50 text-sm mb-6">
                  We sent a 6-digit code to <span className="text-white font-mono">{email}</span>
                </p>

                <div className="mb-4">
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    className="w-full px-4 py-3 rounded-lg bg-white/[0.03] border border-white/[0.08] text-white text-center text-2xl tracking-widest placeholder-white/30 focus:outline-none focus:border-white/20 transition-colors font-mono"
                    maxLength={6}
                    disabled={claimLoading}
                  />
                </div>

                {error && (
                  <div className="mb-4 p-3 rounded-lg bg-red-400/10 border border-red-400/20 text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <button
                  onClick={handleVerifyCode}
                  disabled={claimLoading || code.length !== 6}
                  className="w-full px-6 py-3 rounded-lg bg-white text-black font-medium hover:bg-white/90 transition-all disabled:opacity-50 mb-3"
                >
                  {claimLoading ? 'Verifying...' : 'Verify'}
                </button>

                <button
                  onClick={() => setClaimStep('email')}
                  className="w-full text-white/50 text-sm hover:text-white transition-colors"
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