// apps/web/app/dashboard/brand-hub/page.tsx
// Brand Hub - Dashboard interface to manage your AI profile (syncs with /brands/[slug]/manage)

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { 
  Layers, 
  Package, 
  FileText, 
  Building2,
  Save,
  Plus,
  Trash2,
  ExternalLink,
  Check,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Sparkles
} from 'lucide-react'
import { useBrand } from '@/contexts/BrandContext'
import MobileHeader from '@/components/layout/MobileHeader'

// ============================================================================
// TYPES
// ============================================================================

interface Offering {
  name: string
  type?: string
  description: string
  price?: string
  status?: 'active' | 'inactive' | 'discontinued'
}

interface FAQ {
  question: string
  answer: string
}

interface CompanyInfo {
  founded_year?: number | null
  hq_location?: string | null
  employee_band?: string
  industry_tags?: string[]
}

interface ProfileData {
  id: string
  slug: string
  brand_name: string
  domain: string
  claimed: boolean
  visibility_score: number | null
  feed_data: {
    short_description?: string
    one_line_summary?: string
    category?: string
    icp?: string
    company_info?: CompanyInfo
    offerings?: Offering[]
    faqs?: FAQ[]
    integrations?: string[]
    pricing?: {
      price_model?: string
      starting_price?: string | null
      has_free_tier?: boolean
    }
  } | null
}

// ============================================================================
// COMPONENTS
// ============================================================================

function SectionCard({ 
  title, 
  description, 
  icon: Icon, 
  children, 
  defaultOpen = false,
  badge
}: { 
  title: string
  description: string
  icon: any
  children: React.ReactNode
  defaultOpen?: boolean
  badge?: { label: string; color: string }
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  
  return (
    <div className="card overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-hover transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-chart-1/10 flex items-center justify-center">
            <Icon className="w-4.5 h-4.5 text-chart-1" />
          </div>
          <div className="text-left">
            <h3 className="font-medium text-primary">{title}</h3>
            <p className="text-sm text-muted">{description}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {badge && (
            <span className={`text-xs px-2 py-1 rounded-full ${badge.color}`}>
              {badge.label}
            </span>
          )}
          {isOpen ? (
            <ChevronUp className="w-5 h-5 text-muted" />
          ) : (
            <ChevronDown className="w-5 h-5 text-muted" />
          )}
        </div>
      </button>
      {isOpen && (
        <div className="px-6 pb-6 pt-2 border-t border-border">
          {children}
        </div>
      )}
    </div>
  )
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function BrandHubPage() {
  const { currentDashboard } = useBrand()
  
  // Profile state
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  
  // Editable fields
  const [description, setDescription] = useState('')
  const [oneLiner, setOneLiner] = useState('')
  const [category, setCategory] = useState('')
  const [icp, setIcp] = useState('')
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({})
  const [offerings, setOfferings] = useState<Offering[]>([])
  const [faqs, setFaqs] = useState<FAQ[]>([])

  // ============================================================================
  // LOAD DATA
  // ============================================================================
  
  useEffect(() => {
    async function loadProfile() {
      if (!currentDashboard?.domain) {
        setLoading(false)
        return
      }

      try {
        // Fetch the ai_profile linked to this dashboard's domain
        const domain = currentDashboard.domain.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0]
        const res = await fetch(`/api/brands?domain=${encodeURIComponent(domain)}`)
        
        if (res.ok) {
          const data = await res.json()
          if (data.profile) {
            setProfile(data.profile)
            
            // Populate editable state from feed_data
            const fd = data.profile.feed_data || {}
            setDescription(fd.short_description || '')
            setOneLiner(fd.one_line_summary || '')
            setCategory(fd.category || '')
            setIcp(fd.icp || '')
            setCompanyInfo(fd.company_info || {})
            setOfferings(fd.offerings || [])
            setFaqs(fd.faqs || [])
          }
        }
      } catch (error) {
        console.error('Failed to load profile:', error)
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [currentDashboard?.domain])

  // ============================================================================
  // HANDLERS
  // ============================================================================
  
  function markChanged() {
    setHasChanges(true)
    setMessage(null)
  }

  async function handleSave() {
    if (!profile?.slug) return
    
    setSaving(true)
    setMessage(null)

    try {
      const res = await fetch(`/api/brands/${profile.slug}/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description,
          one_line_summary: oneLiner,
          category,
          icp,
          companyInfo,
          offerings: offerings.map(o => ({
            name: o.name,
            type: o.type || 'product',
            description: o.description,
            price: o.price,
            status: o.status || 'active'
          })),
          faqs
        })
      })

      if (!res.ok) throw new Error('Failed to save')
      
      setHasChanges(false)
      setMessage({ type: 'success', text: 'Saved!' })
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save' })
    } finally {
      setSaving(false)
    }
  }

  // Product handlers
  function addProduct() {
    setOfferings([...offerings, { name: '', description: '', status: 'active' }])
    markChanged()
  }

  function updateProduct(index: number, field: string, value: string) {
    const updated = [...offerings]
    updated[index] = { ...updated[index], [field]: value }
    setOfferings(updated)
    markChanged()
  }

  function removeProduct(index: number) {
    setOfferings(offerings.filter((_, i) => i !== index))
    markChanged()
  }

  // FAQ handlers
  function addFaq() {
    setFaqs([...faqs, { question: '', answer: '' }])
    markChanged()
  }

  function updateFaq(index: number, field: 'question' | 'answer', value: string) {
    const updated = [...faqs]
    updated[index] = { ...updated[index], [field]: value }
    setFaqs(updated)
    markChanged()
  }

  function removeFaq(index: number) {
    setFaqs(faqs.filter((_, i) => i !== index))
    markChanged()
  }

  // ============================================================================
  // COMPUTED
  // ============================================================================
  
  const completionScore = (() => {
    let score = 0
    let total = 5
    if (description) score++
    if (oneLiner) score++
    if (offerings.length > 0) score++
    if (faqs.length > 0) score++
    if (companyInfo.hq_location || companyInfo.founded_year) score++
    return Math.round((score / total) * 100)
  })()

  const getBadge = (count: number) => {
    if (count === 0) return { label: 'Not started', color: 'bg-gray-400/10 text-gray-400' }
    return { label: `${count} items`, color: 'bg-green-400/10 text-green-400' }
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-chart-1"></div>
      </div>
    )
  }

  // No profile linked - prompt to claim
  if (!profile) {
    return (
      <div className="min-h-screen bg-primary" data-page="brand-hub">
        <MobileHeader />
        <div className="page-header-bar">
          <div className="flex items-center gap-3">
            <Layers className="w-5 h-5 text-muted" />
            <h1 className="text-lg font-semibold text-primary">Brand Hub</h1>
          </div>
        </div>
        <div className="p-6">
          <div className="card p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-chart-1/10 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-chart-1" />
            </div>
            <h2 className="text-xl font-semibold text-primary mb-2">Claim Your Brand Profile</h2>
            <p className="text-sm text-muted mb-6 max-w-md mx-auto">
              Your brand doesn't have an AI profile yet. Claim it to control how AI models describe your company.
            </p>
            <Link 
              href={`/brands?search=${encodeURIComponent(currentDashboard?.brand_name || '')}`}
              className="btn-primary inline-flex items-center gap-2"
            >
              Find & Claim Profile
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-primary" data-page="brand-hub">
      <MobileHeader />
      
      {/* Header */}
      <div className="page-header-bar">
        <div className="flex items-center gap-3">
          <Layers className="w-5 h-5 text-muted" />
          <div>
            <h1 className="text-lg font-semibold text-primary">Brand Hub</h1>
            <p className="text-sm text-muted">Manage your AI profile</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {profile.slug && (
            <Link
              href={`/brands/${profile.slug}`}
              target="_blank"
              className="text-sm text-muted hover:text-primary flex items-center gap-1.5 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              View Public Profile
            </Link>
          )}
        </div>
      </div>

      {/* Status Banner */}
      <div className="status-banner">
        <div className="status-banner-text flex items-center gap-2">
          {profile.claimed ? (
            <>
              <Check className="w-4 h-4 text-green-500" />
              <span className="text-green-600 dark:text-green-400 font-medium">Profile Claimed</span>
            </>
          ) : (
            <>
              <AlertCircle className="w-4 h-4 text-amber-500" />
              <span className="text-amber-600 dark:text-amber-400 font-medium">Profile Unclaimed</span>
            </>
          )}
          <span className="mx-2 text-border">•</span>
          <span>{completionScore}% complete</span>
        </div>
        <div className="status-banner-metrics">
          {profile.visibility_score != null && (
            <span>Visibility Score: <strong className="text-primary">{profile.visibility_score.toFixed(0)}</strong></span>
          )}
        </div>
      </div>

      <div className="p-6 space-y-4 max-w-5xl">
        
        {/* Brand Identity Section */}
        <SectionCard
          title="Brand Identity"
          description="Core information about your brand"
          icon={Building2}
          defaultOpen={true}
          badge={description || oneLiner ? { label: 'Complete', color: 'bg-green-400/10 text-green-400' } : { label: 'Incomplete', color: 'bg-amber-400/10 text-amber-400' }}
        >
          <div className="space-y-4">
            {/* One-liner */}
            <div>
              <label className="block text-sm font-medium text-primary mb-1.5">
                One-Line Summary
              </label>
              <input
                type="text"
                value={oneLiner}
                onChange={(e) => { setOneLiner(e.target.value); markChanged() }}
                placeholder="A concise tagline for your brand"
                className="input w-full"
                maxLength={150}
              />
              <p className="text-xs text-muted mt-1">{oneLiner.length}/150 characters</p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-primary mb-1.5">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => { setDescription(e.target.value); markChanged() }}
                placeholder="What does your company do? Who do you serve?"
                className="input w-full min-h-[100px] resize-y"
                maxLength={500}
              />
              <p className="text-xs text-muted mt-1">{description.length}/500 characters</p>
            </div>

            {/* Category & ICP */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-primary mb-1.5">
                  Industry/Category
                </label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => { setCategory(e.target.value); markChanged() }}
                  placeholder="e.g., SaaS, E-commerce, Fintech"
                  className="input w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary mb-1.5">
                  Target Audience (ICP)
                </label>
                <input
                  type="text"
                  value={icp}
                  onChange={(e) => { setIcp(e.target.value); markChanged() }}
                  placeholder="e.g., B2B startups, Enterprise marketing teams"
                  className="input w-full"
                />
              </div>
            </div>

            {/* Company Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-primary mb-1.5">
                  Headquarters
                </label>
                <input
                  type="text"
                  value={companyInfo.hq_location || ''}
                  onChange={(e) => { setCompanyInfo({ ...companyInfo, hq_location: e.target.value }); markChanged() }}
                  placeholder="e.g., San Francisco, CA"
                  className="input w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary mb-1.5">
                  Founded Year
                </label>
                <input
                  type="number"
                  value={companyInfo.founded_year || ''}
                  onChange={(e) => { setCompanyInfo({ ...companyInfo, founded_year: e.target.value ? parseInt(e.target.value) : null }); markChanged() }}
                  placeholder="e.g., 2020"
                  className="input w-full"
                  min={1900}
                  max={new Date().getFullYear()}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary mb-1.5">
                  Company Size
                </label>
                <select
                  value={companyInfo.employee_band || ''}
                  onChange={(e) => { setCompanyInfo({ ...companyInfo, employee_band: e.target.value }); markChanged() }}
                  className="input w-full"
                >
                  <option value="">Select size</option>
                  <option value="1-10">1-10 employees</option>
                  <option value="11-50">11-50 employees</option>
                  <option value="51-200">51-200 employees</option>
                  <option value="201-1000">201-1000 employees</option>
                  <option value="1000+">1000+ employees</option>
                </select>
              </div>
            </div>
          </div>
        </SectionCard>

        {/* Products Section */}
        <SectionCard
          title="Products & Services"
          description="What you offer to customers"
          icon={Package}
          badge={getBadge(offerings.length)}
        >
          <div className="space-y-4">
            {offerings.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-border rounded-lg">
                <Package className="w-8 h-8 text-muted mx-auto mb-2 opacity-40" />
                <p className="text-sm text-muted mb-3">No products added yet</p>
                <button onClick={addProduct} className="btn-secondary text-sm">
                  <Plus className="w-4 h-4 mr-1.5" />
                  Add Product
                </button>
              </div>
            ) : (
              <>
                {offerings.map((product, index) => (
                  <div key={index} className="p-4 bg-secondary/30 rounded-lg space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <input
                        type="text"
                        value={product.name}
                        onChange={(e) => updateProduct(index, 'name', e.target.value)}
                        placeholder="Product name"
                        className="input flex-1 font-medium"
                      />
                      <button
                        onClick={() => removeProduct(index)}
                        className="p-2 text-muted hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <textarea
                      value={product.description}
                      onChange={(e) => updateProduct(index, 'description', e.target.value)}
                      placeholder="Describe this product or service..."
                      className="input w-full min-h-[80px] resize-y text-sm"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={product.price || ''}
                        onChange={(e) => updateProduct(index, 'price', e.target.value)}
                        placeholder="Price (e.g., $99/mo)"
                        className="input text-sm"
                      />
                      <select
                        value={product.status || 'active'}
                        onChange={(e) => updateProduct(index, 'status', e.target.value)}
                        className="input text-sm"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="discontinued">Discontinued</option>
                      </select>
                    </div>
                  </div>
                ))}
                <button onClick={addProduct} className="btn-secondary text-sm w-full">
                  <Plus className="w-4 h-4 mr-1.5" />
                  Add Another Product
                </button>
              </>
            )}
          </div>
        </SectionCard>

        {/* FAQs Section */}
        <SectionCard
          title="FAQs"
          description="Canonical answers AI should use"
          icon={FileText}
          badge={getBadge(faqs.length)}
        >
          <div className="space-y-4">
            {faqs.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-border rounded-lg">
                <FileText className="w-8 h-8 text-muted mx-auto mb-2 opacity-40" />
                <p className="text-sm text-muted mb-3">No FAQs added yet</p>
                <button onClick={addFaq} className="btn-secondary text-sm">
                  <Plus className="w-4 h-4 mr-1.5" />
                  Add FAQ
                </button>
              </div>
            ) : (
              <>
                {faqs.map((faq, index) => (
                  <div key={index} className="p-4 bg-secondary/30 rounded-lg space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <input
                        type="text"
                        value={faq.question}
                        onChange={(e) => updateFaq(index, 'question', e.target.value)}
                        placeholder="Question"
                        className="input flex-1 font-medium"
                      />
                      <button
                        onClick={() => removeFaq(index)}
                        className="p-2 text-muted hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <textarea
                      value={faq.answer}
                      onChange={(e) => updateFaq(index, 'answer', e.target.value)}
                      placeholder="Answer"
                      className="input w-full min-h-[80px] resize-y text-sm"
                    />
                  </div>
                ))}
                <button onClick={addFaq} className="btn-secondary text-sm w-full">
                  <Plus className="w-4 h-4 mr-1.5" />
                  Add Another FAQ
                </button>
              </>
            )}
          </div>
        </SectionCard>

        {/* JSON Preview */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-primary">Your AI Profile</h3>
              <p className="text-sm text-muted">This is what AI models see</p>
            </div>
            {profile.slug && (
              <Link
                href={`/brands/${profile.slug}/harbor.json`}
                target="_blank"
                className="text-sm text-chart-1 hover:underline flex items-center gap-1"
              >
                View JSON <ExternalLink className="w-3 h-3" />
              </Link>
            )}
          </div>
          <div className="bg-[#0a0a0a] rounded-lg p-4 font-mono text-xs text-gray-400 overflow-x-auto max-h-64 overflow-y-auto">
            <pre>{JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: profile.brand_name,
              url: `https://${profile.domain}`,
              description: description || undefined,
              slogan: oneLiner || undefined,
              ...(category && { industry: category }),
              ...(icp && { audience: icp }),
              ...(companyInfo.founded_year && { foundingDate: String(companyInfo.founded_year) }),
              ...(companyInfo.hq_location && { 
                address: { "@type": "PostalAddress", addressLocality: companyInfo.hq_location }
              }),
              ...(offerings.length > 0 && {
                hasOfferCatalog: {
                  "@type": "OfferCatalog",
                  itemListElement: offerings.filter(o => o.name).map(o => ({
                    "@type": "Offer",
                    name: o.name,
                    description: o.description,
                    ...(o.price && { price: o.price })
                  }))
                }
              }),
              ...(faqs.length > 0 && {
                mainEntity: faqs.filter(f => f.question && f.answer).map(f => ({
                  "@type": "Question",
                  name: f.question,
                  acceptedAnswer: { "@type": "Answer", text: f.answer }
                }))
              })
            }, null, 2)}</pre>
          </div>
        </div>
      </div>

      {/* Floating Save Bar - positioned within content flow */}
      {hasChanges && (
        <div className="sticky bottom-0 bg-card border-t border-border p-4 -mx-6 mt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {message && (
                <span className={`text-sm ${message.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
                  {message.text}
                </span>
              )}
              {!message && <span className="text-sm text-muted">Unsaved changes</span>}
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}