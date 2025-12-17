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
  count
}: { 
  title: string
  description: string
  icon: any
  children: React.ReactNode
  defaultOpen?: boolean
  count?: number
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  
  return (
    <div className="rounded-xl border border-border overflow-hidden bg-card">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-5 flex items-center justify-between hover:bg-hover/50 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
            <Icon className="w-5 h-5 text-muted" strokeWidth={1.5} />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-primary">{title}</h3>
            <p className="text-sm text-muted">{description}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {count !== undefined && (
            <span className="text-sm text-muted">{count} items</span>
          )}
          {isOpen ? (
            <ChevronUp className="w-5 h-5 text-muted" />
          ) : (
            <ChevronDown className="w-5 h-5 text-muted" />
          )}
        </div>
      </button>
      {isOpen && (
        <div className="px-6 pb-6 border-t border-border">
          <div className="pt-6">
            {children}
          </div>
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
        const domain = currentDashboard.domain.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0]
        const res = await fetch(`/api/brands?domain=${encodeURIComponent(domain)}`)
        
        if (res.ok) {
          const data = await res.json()
          if (data.profile) {
            setProfile(data.profile)
            
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
  // RENDER
  // ============================================================================

  // Input classes - white bg in light mode, dark bg in dark mode
  const inputClass = "w-full px-4 py-3 rounded-lg bg-white dark:bg-[#161718] border border-border text-primary placeholder:text-muted focus:outline-none focus:border-primary/30 focus:ring-2 focus:ring-primary/10 transition-all"
  const textareaClass = "w-full px-4 py-3 rounded-lg bg-white dark:bg-[#161718] border border-border text-primary placeholder:text-muted focus:outline-none focus:border-primary/30 focus:ring-2 focus:ring-primary/10 transition-all resize-none"

  if (loading) {
    return (
      <>
        <MobileHeader />
        <div className="max-w-4xl mx-auto p-8 pt-20 lg:pt-8 animate-pulse space-y-6">
          <div className="h-32 rounded-xl bg-secondary" />
          <div className="h-64 rounded-xl bg-secondary" />
        </div>
      </>
    )
  }

  // No profile linked - prompt to claim
  if (!profile) {
    return (
      <>
        <MobileHeader />
        <div className="max-w-4xl mx-auto p-8 pt-20 lg:pt-8">
          <div className="rounded-xl border border-border bg-card p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-muted" />
            </div>
            <h2 className="text-xl font-semibold text-primary mb-2">Claim Your Brand Profile</h2>
            <p className="text-sm text-muted mb-6 max-w-md mx-auto">
              Your brand doesn't have an AI profile yet. Claim it to control how AI models describe your company.
            </p>
            <Link 
              href={`/brands?search=${encodeURIComponent(currentDashboard?.brand_name || '')}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground font-medium rounded-lg hover:opacity-90 transition-opacity"
            >
              Find & Claim Profile
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <MobileHeader />
      <div className="max-w-4xl mx-auto p-8 pt-20 lg:pt-8 pb-32">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
              <Layers className="w-6 h-6 text-muted" strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-primary">Brand Hub</h1>
              <p className="text-sm text-muted">Manage your AI profile</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {profile.claimed ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 text-sm font-medium">
                <Check className="w-3.5 h-3.5" />
                Claimed
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-sm font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                Unclaimed
              </span>
            )}
            {profile.slug && (
              <Link
                href={`/brands/${profile.slug}`}
                target="_blank"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-sm text-muted hover:text-primary hover:border-primary/30 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                View Profile
              </Link>
            )}
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-4">
          
          {/* Brand Identity */}
          <SectionCard
            title="Brand Information"
            description="Core details about your brand"
            icon={Building2}
            defaultOpen={true}
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-primary mb-2">One-liner</label>
                <input
                  type="text"
                  value={oneLiner}
                  onChange={(e) => { setOneLiner(e.target.value); markChanged() }}
                  placeholder="A single sentence describing what you do"
                  className={inputClass}
                  maxLength={150}
                />
                <p className="text-xs text-muted mt-1.5">{oneLiner.length}/150 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-primary mb-2">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => { setDescription(e.target.value); markChanged() }}
                  placeholder="Tell AI more about your company..."
                  rows={4}
                  className={textareaClass}
                  maxLength={500}
                />
                <p className="text-xs text-muted mt-1.5">{description.length}/500 characters</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">Category</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => { setCategory(e.target.value); markChanged() }}
                    placeholder="e.g., SaaS, E-commerce"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">Ideal Customer</label>
                  <input
                    type="text"
                    value={icp}
                    onChange={(e) => { setIcp(e.target.value); markChanged() }}
                    placeholder="Who do you serve?"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Company Details */}
          <SectionCard
            title="Company Details"
            description="Location, founding date, and size"
            icon={Building2}
          >
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-primary mb-2">Headquarters</label>
                <input
                  type="text"
                  value={companyInfo.hq_location || ''}
                  onChange={(e) => { setCompanyInfo({ ...companyInfo, hq_location: e.target.value }); markChanged() }}
                  placeholder="e.g., San Francisco"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary mb-2">Founded</label>
                <input
                  type="number"
                  value={companyInfo.founded_year || ''}
                  onChange={(e) => { setCompanyInfo({ ...companyInfo, founded_year: e.target.value ? parseInt(e.target.value) : null }); markChanged() }}
                  placeholder="e.g., 2020"
                  className={inputClass}
                  min={1900}
                  max={new Date().getFullYear()}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary mb-2">Company Size</label>
                <select
                  value={companyInfo.employee_band || ''}
                  onChange={(e) => { setCompanyInfo({ ...companyInfo, employee_band: e.target.value }); markChanged() }}
                  className={inputClass}
                >
                  <option value="">Select size</option>
                  <option value="1-10">1-10</option>
                  <option value="11-50">11-50</option>
                  <option value="51-200">51-200</option>
                  <option value="201-1000">201-1000</option>
                  <option value="1000+">1000+</option>
                </select>
              </div>
            </div>
          </SectionCard>

          {/* Products */}
          <SectionCard
            title="Products & Services"
            description="What you offer to customers"
            icon={Package}
            count={offerings.length}
          >
            <div className="space-y-4">
              {offerings.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-border rounded-lg">
                  <Package className="w-8 h-8 text-muted mx-auto mb-2 opacity-40" strokeWidth={1.5} />
                  <p className="text-sm text-muted mb-3">No products added yet</p>
                  <button 
                    onClick={addProduct} 
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-primary bg-secondary hover:bg-hover border border-border rounded-lg transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Add Product
                  </button>
                </div>
              ) : (
                <>
                  {offerings.map((product, index) => (
                    <div key={index} className="p-4 bg-secondary/50 dark:bg-[#161718] rounded-lg space-y-3 border border-border/50">
                      <div className="flex items-start justify-between gap-3">
                        <input
                          type="text"
                          value={product.name}
                          onChange={(e) => updateProduct(index, 'name', e.target.value)}
                          placeholder="Product name"
                          className={`${inputClass} font-medium`}
                        />
                        <button
                          onClick={() => removeProduct(index)}
                          className="p-2 text-muted hover:text-red-500 transition-colors cursor-pointer flex-shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <textarea
                        value={product.description}
                        onChange={(e) => updateProduct(index, 'description', e.target.value)}
                        placeholder="Describe this product or service..."
                        rows={2}
                        className={textareaClass}
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={product.price || ''}
                          onChange={(e) => updateProduct(index, 'price', e.target.value)}
                          placeholder="Price (e.g., $99/mo)"
                          className={inputClass}
                        />
                        <select
                          value={product.status || 'active'}
                          onChange={(e) => updateProduct(index, 'status', e.target.value)}
                          className={inputClass}
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                          <option value="discontinued">Discontinued</option>
                        </select>
                      </div>
                    </div>
                  ))}
                  <button 
                    onClick={addProduct} 
                    className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-medium text-primary bg-secondary hover:bg-hover border border-border rounded-lg transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Add Another Product
                  </button>
                </>
              )}
            </div>
          </SectionCard>

          {/* FAQs */}
          <SectionCard
            title="FAQs"
            description="Canonical answers AI should use"
            icon={FileText}
            count={faqs.length}
          >
            <div className="space-y-4">
              {faqs.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-border rounded-lg">
                  <FileText className="w-8 h-8 text-muted mx-auto mb-2 opacity-40" strokeWidth={1.5} />
                  <p className="text-sm text-muted mb-3">No FAQs added yet</p>
                  <button 
                    onClick={addFaq} 
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-primary bg-secondary hover:bg-hover border border-border rounded-lg transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Add FAQ
                  </button>
                </div>
              ) : (
                <>
                  {faqs.map((faq, index) => (
                    <div key={index} className="p-4 bg-secondary/50 dark:bg-[#161718] rounded-lg space-y-3 border border-border/50">
                      <div className="flex items-start justify-between gap-3">
                        <input
                          type="text"
                          value={faq.question}
                          onChange={(e) => updateFaq(index, 'question', e.target.value)}
                          placeholder="Question"
                          className={`${inputClass} font-medium`}
                        />
                        <button
                          onClick={() => removeFaq(index)}
                          className="p-2 text-muted hover:text-red-500 transition-colors cursor-pointer flex-shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <textarea
                        value={faq.answer}
                        onChange={(e) => updateFaq(index, 'answer', e.target.value)}
                        placeholder="Answer"
                        rows={3}
                        className={textareaClass}
                      />
                    </div>
                  ))}
                  <button 
                    onClick={addFaq} 
                    className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-medium text-primary bg-secondary hover:bg-hover border border-border rounded-lg transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Add Another FAQ
                  </button>
                </>
              )}
            </div>
          </SectionCard>

          {/* AI Profile Preview */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-primary">Your AI Profile</h3>
                <p className="text-sm text-muted">The structured data AI models read</p>
              </div>
              {profile.slug && (
                <Link
                  href={`/brands/${profile.slug}`}
                  target="_blank"
                  className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-primary transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  View Profile
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
      </div>

      {/* Floating Save Bar */}
      {hasChanges && (
        <div className="fixed bottom-0 left-0 right-0 lg:left-64 bg-card border-t border-border p-4 z-40">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
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
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}
    </>
  )
}