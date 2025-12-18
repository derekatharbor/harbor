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
  icon: Icon, 
  children, 
  defaultOpen = false,
  count
}: { 
  title: string
  icon: any
  children: React.ReactNode
  defaultOpen?: boolean
  count?: number
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  
  return (
    <div className="card overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-4 flex items-center justify-between hover:bg-hover transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <Icon className="w-4 h-4 text-muted" strokeWidth={1.5} />
          <span className="font-semibold text-primary">{title}</span>
        </div>
        <div className="flex items-center gap-3">
          {count !== undefined && count > 0 && (
            <span className="text-xs text-muted">{count} items</span>
          )}
          {isOpen ? (
            <ChevronUp className="w-4 h-4 text-muted" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted" />
          )}
        </div>
      </button>
      {isOpen && (
        <div className="px-5 pb-5 border-t border-border overflow-hidden">
          <div className="pt-5">
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

  // Input classes - use standard input class
  const inputClass = "input w-full"

  if (loading) {
    return (
      <div className="min-h-screen bg-page pb-12" data-page="brand-hub">
        <MobileHeader />
        <div className="px-6 pt-6 pb-4">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-card rounded w-48"></div>
            <div className="h-4 bg-card rounded w-96"></div>
          </div>
        </div>
        <div className="mx-6 space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-card rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  // No profile linked
  if (!profile) {
    return (
      <div className="min-h-screen bg-page pb-12" data-page="brand-hub">
        <MobileHeader />
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center gap-3">
            <Layers className="w-5 h-5 text-muted" strokeWidth={1.5} />
            <div>
              <h1 className="text-lg font-semibold text-primary">Brand Hub</h1>
              <p className="text-sm text-muted">Manage your AI profile</p>
            </div>
          </div>
        </div>
        <div className="mx-6">
          <div className="card p-12 text-center">
            <Sparkles className="w-12 h-12 text-muted mx-auto mb-4 opacity-40" />
            <h2 className="text-lg font-semibold text-primary mb-2">Claim Your Brand Profile</h2>
            <p className="text-sm text-muted mb-6 max-w-md mx-auto">
              Your brand doesn't have an AI profile yet. Claim it to control how AI models describe your company.
            </p>
            <Link 
              href={`/brands?search=${encodeURIComponent(currentDashboard?.brand_name || '')}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-secondary rounded-lg text-sm font-medium text-primary hover:bg-hover transition-colors"
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
    <div className="min-h-screen bg-page pb-12 overflow-x-hidden" data-page="brand-hub">
      <MobileHeader />
      
      {/* Header */}
      <div className="px-6 pt-6 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Layers className="w-5 h-5 text-muted" strokeWidth={1.5} />
          <div>
            <h1 className="text-lg font-semibold text-primary">Brand Hub</h1>
            <p className="text-sm text-muted">Manage your AI profile</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {profile.claimed ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-medium">
              <Check className="w-3 h-3" />
              Claimed
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-medium">
              <AlertCircle className="w-3 h-3" />
              Unclaimed
            </span>
          )}
          {profile.slug && (
            <Link
              href={`/brands/${profile.slug}`}
              target="_blank"
              className="text-sm text-muted hover:text-primary flex items-center gap-1.5 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              View Profile
            </Link>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="mx-6 space-y-4 overflow-hidden">
        
        {/* Brand Information */}
        <SectionCard title="Brand Information" icon={Building2} defaultOpen={true}>
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
                className={`${inputClass} resize-none`}
                maxLength={500}
              />
              <p className="text-xs text-muted mt-1.5">{description.length}/500 characters</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="min-w-0">
                <label className="block text-sm font-medium text-primary mb-2">Category</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => { setCategory(e.target.value); markChanged() }}
                  placeholder="e.g., SaaS, E-commerce"
                  className={inputClass}
                />
              </div>
              <div className="min-w-0">
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
        <SectionCard title="Company Details" icon={Building2}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="min-w-0">
              <label className="block text-sm font-medium text-primary mb-2">Headquarters</label>
              <input
                type="text"
                value={companyInfo.hq_location || ''}
                onChange={(e) => { setCompanyInfo({ ...companyInfo, hq_location: e.target.value }); markChanged() }}
                placeholder="e.g., San Francisco"
                className={inputClass}
              />
            </div>
            <div className="min-w-0">
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
            <div className="min-w-0">
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
        <SectionCard title="Products & Services" icon={Package} count={offerings.length}>
          <div className="space-y-4">
            {offerings.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-border rounded-lg">
                <Package className="w-8 h-8 text-muted mx-auto mb-2 opacity-40" strokeWidth={1.5} />
                <p className="text-sm text-muted mb-3">No products added yet</p>
                <button 
                  onClick={addProduct} 
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-primary bg-secondary hover:bg-hover rounded-lg transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Add Product
                </button>
              </div>
            ) : (
              <>
                {offerings.map((product, index) => (
                  <div key={index} className="p-4 bg-secondary rounded-lg space-y-3 overflow-hidden">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <input
                          type="text"
                          value={product.name}
                          onChange={(e) => updateProduct(index, 'name', e.target.value)}
                          placeholder="Product name"
                          className={`${inputClass} font-medium`}
                        />
                      </div>
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
                      className={`${inputClass} resize-none`}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <div className="min-w-0">
                        <input
                          type="text"
                          value={product.price || ''}
                          onChange={(e) => updateProduct(index, 'price', e.target.value)}
                          placeholder="Price (e.g., $99/mo)"
                          className={inputClass}
                        />
                      </div>
                      <div className="min-w-0">
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
                  </div>
                ))}
                <button 
                  onClick={addProduct} 
                  className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-medium text-primary bg-secondary hover:bg-hover rounded-lg transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Add Another Product
                </button>
              </>
            )}
          </div>
        </SectionCard>

        {/* FAQs */}
        <SectionCard title="FAQs" icon={FileText} count={faqs.length}>
          <div className="space-y-4">
            {faqs.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-border rounded-lg">
                <FileText className="w-8 h-8 text-muted mx-auto mb-2 opacity-40" strokeWidth={1.5} />
                <p className="text-sm text-muted mb-3">No FAQs added yet</p>
                <button 
                  onClick={addFaq} 
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-primary bg-secondary hover:bg-hover rounded-lg transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Add FAQ
                </button>
              </div>
            ) : (
              <>
                {faqs.map((faq, index) => (
                  <div key={index} className="p-4 bg-secondary rounded-lg space-y-3 overflow-hidden">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <input
                          type="text"
                          value={faq.question}
                          onChange={(e) => updateFaq(index, 'question', e.target.value)}
                          placeholder="Question"
                          className={`${inputClass} font-medium`}
                        />
                      </div>
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
                      className={`${inputClass} resize-none`}
                    />
                  </div>
                ))}
                <button 
                  onClick={addFaq} 
                  className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-medium text-primary bg-secondary hover:bg-hover rounded-lg transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Add Another FAQ
                </button>
              </>
            )}
          </div>
        </SectionCard>

        {/* AI Profile Preview */}
        <div className="card p-5 overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-primary">Your AI Profile</h3>
              <p className="text-sm text-muted">The structured data AI models read</p>
            </div>
            {profile.slug && (
              <Link
                href={`/brands/${profile.slug}`}
                target="_blank"
                className="text-sm text-muted hover:text-primary flex items-center gap-1.5 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                View Profile
              </Link>
            )}
          </div>
          <div className="bg-[#0a0a0a] rounded-lg p-4 font-mono text-xs text-gray-400 max-h-64 overflow-auto max-w-full">
            <pre className="whitespace-pre-wrap break-all">{JSON.stringify({
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

      {/* Floating Save Bar */}
      {hasChanges && (
        <div className="fixed bottom-0 left-0 right-0 lg:left-64 bg-card border-t border-border px-6 py-4 z-40">
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
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-[#1a1a1a] text-white dark:bg-white dark:text-[#1a1a1a] rounded-lg hover:opacity-90 transition-colors disabled:opacity-50 cursor-pointer"
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