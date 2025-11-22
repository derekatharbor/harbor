'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  Edit, 
  Save, 
  X, 
  Plus,
  ExternalLink,
  ArrowRight,
  ArrowLeft
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { ProfileSummaryCard } from '@/components/manage/ProfileSummaryCard'
import { VisibilityOpportunities } from '@/components/manage/VisibilityOpportunities'
import { VersionHistory } from '@/components/manage/VersionHistory'
import { ProfileCompletenessBar } from '@/components/manage/ProfileCompletenessBar'

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
  claimed_at: string
  claimed_by_email: string
  last_scan_at?: string
  next_scan_scheduled_at?: string
  feed_data: any
}

export default function ProfileManagerPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const [brand, setBrand] = useState<Brand | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [scanInProgress, setScanInProgress] = useState(false)

  // Editable fields
  const [description, setDescription] = useState('')
  const [products, setProducts] = useState<Array<{ name: string; description?: string; type?: string }>>([])
  const [faqs, setFaqs] = useState<Array<{ question: string; answer: string }>>([])
  const [companyInfo, setCompanyInfo] = useState({
    founded_year: '',
    hq_location: '',
    employee_band: '',
    industry_tags: [] as string[]
  })

  // UI state
  const [shareCardTheme, setShareCardTheme] = useState<'light' | 'dark'>('light')
  const [opportunities, setOpportunities] = useState<any>({})
  const [history, setHistory] = useState<any[]>([])
  const [loadingOpportunities, setLoadingOpportunities] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(false)

  useEffect(() => {
    fetchBrandData()
  }, [slug])

  useEffect(() => {
    if (brand) {
      fetchOpportunities()
      fetchHistory()
    }
  }, [brand])

  const fetchBrandData = async () => {
    try {
      const res = await fetch(`/api/brands/${slug}`)
      const brandData = await res.json()
      setBrand(brandData)

      // Populate form fields from feed_data
      const feedData = brandData.feed_data || {}
      setDescription(feedData.short_description || '')
      setProducts(feedData.offerings || [])
      setFaqs(feedData.faqs || [])
      setCompanyInfo({
        founded_year: feedData.company_info?.founded_year?.toString() || '',
        hq_location: feedData.company_info?.hq_location || '',
        employee_band: feedData.company_info?.employee_band || '',
        industry_tags: feedData.company_info?.industry_tags || []
      })
    } catch (error) {
      console.error('Failed to fetch brand:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchOpportunities = async () => {
    setLoadingOpportunities(true)
    try {
      const res = await fetch(`/api/brands/${slug}/opportunities`)
      const data = await res.json()
      setOpportunities(data.opportunities || {})
    } catch (error) {
      console.error('Failed to fetch opportunities:', error)
    } finally {
      setLoadingOpportunities(false)
    }
  }

  const fetchHistory = async () => {
    setLoadingHistory(true)
    try {
      const res = await fetch(`/api/brands/${slug}/history`)
      const data = await res.json()
      setHistory(data.history || [])
    } catch (error) {
      console.error('Failed to fetch history:', error)
    } finally {
      setLoadingHistory(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const payload = {
        brand_id: brand?.id,
        description,
        products,
        faqs,
        company_info: {
          founded_year: companyInfo.founded_year ? parseInt(companyInfo.founded_year) : null,
          hq_location: companyInfo.hq_location,
          employee_band: companyInfo.employee_band,
          industry_tags: companyInfo.industry_tags
        }
      }

      const res = await fetch(`/api/brands/${slug}/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!res.ok) throw new Error('Failed to save')

      setEditMode(false)
      
      // Refresh data
      await fetchBrandData()
      await fetchOpportunities()
      await fetchHistory()
      
      alert('Profile updated successfully!')
    } catch (error) {
      console.error('Failed to save:', error)
      alert('Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  const handleScanClick = async () => {
    if (scanInProgress) return

    setScanInProgress(true)
    try {
      const res = await fetch(`/api/brands/${slug}/scan`, {
        method: 'POST'
      })
      
      const data = await res.json()

      if (!res.ok) {
        alert(data.message || 'Failed to start scan')
        return
      }

      alert(data.message || 'Scan started successfully!')
      
      // Refresh data after scan completes (3 minutes)
      setTimeout(() => {
        fetchBrandData()
        fetchHistory()
        setScanInProgress(false)
      }, 180000)

    } catch (error) {
      console.error('Failed to trigger scan:', error)
      alert('Failed to start scan')
      setScanInProgress(false)
    }
  }

  const addProduct = () => {
    setProducts([...products, { name: '', description: '', type: 'product_line' }])
  }

  const removeProduct = (index: number) => {
    setProducts(products.filter((_, i) => i !== index))
  }

  const updateProduct = (index: number, field: string, value: string) => {
    const updated = [...products]
    updated[index] = { ...updated[index], [field]: value }
    setProducts(updated)
  }

  const addFaq = () => {
    setFaqs([...faqs, { question: '', answer: '' }])
  }

  const removeFaq = (index: number) => {
    setFaqs(faqs.filter((_, i) => i !== index))
  }

  const updateFaq = (index: number, field: string, value: string) => {
    const updated = [...faqs]
    updated[index] = { ...updated[index], [field]: value }
    setFaqs(updated)
  }

  const calculateProfileCompleteness = () => {
    let score = 25 // Baseline from existing scan data
    if (description && description.length > 100) score += 19
    if (products.length >= 3) score += 19
    if (faqs.length >= 3) score += 19
    if (companyInfo.founded_year && companyInfo.hq_location && companyInfo.employee_band) score += 18
    return Math.min(score, 100)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0F1E] flex items-center justify-center">
        <div className="text-white/40 font-mono text-sm">Loading profile...</div>
      </div>
    )
  }

  if (!brand) {
    return (
      <div className="min-h-screen bg-[#0A0F1E] flex items-center justify-center">
        <div className="text-white/40 font-mono text-sm">Brand not found</div>
      </div>
    )
  }

  const profileCompleteness = calculateProfileCompleteness()

  return (
    <div className="min-h-screen bg-[#0c162b] relative overflow-hidden">
      {/* Wireframe Background - Behind header only */}
      <div 
        className="absolute inset-x-0 top-0 h-[600px] opacity-[0.3] pointer-events-none"
        style={{
          backgroundImage: "url('/images/wireframe-wave.png')",
          backgroundPosition: 'center top',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat'
        }}
      />
      
      {/* Content */}
      <div className="relative z-10">
      
      {/* Minimal Header */}
      <header className="border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
          <Link 
            href={`/brands/${slug}`}
            className="text-white/70 font-mono text-sm hover:text-white transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to public profile
          </Link>
          <Link 
            href="/"
            className="text-white/50 font-mono text-sm hover:text-white/70 transition-colors"
          >
            Harbor
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-[#e8f4ff] text-2xl sm:text-3xl font-light mb-3">
            Manage Your AI Visibility Profile
          </h1>
          <p className="text-[#94a3b8] font-mono text-sm sm:text-base">
            Control how AI models understand and represent your brand
          </p>
        </div>

        {/* Profile Completeness */}
        <div className="mb-8">
          <ProfileCompletenessBar completeness={profileCompleteness} />
        </div>

        {/* Profile Summary Card */}
        <div className="mb-8">
          <ProfileSummaryCard 
            brand={brand}
            onScanClick={handleScanClick}
            scanInProgress={scanInProgress}
          />
          <p className="text-[#94a3b8] font-mono text-xs mt-4">
            Changes may take time to propagate across AI models.
          </p>
        </div>

        {/* Edit Mode Toggle */}
        <div className="mb-8">
          <h2 className="text-[#e8f4ff] text-xl font-light mb-6">Profile Information</h2>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {!editMode ? (
              <div className="flex-1" />
            ) : (
              <div className="flex-1" />
            )}
            {!editMode ? (
              <button
                onClick={() => setEditMode(true)}
                className="flex items-center justify-center gap-2 px-4 py-2 border border-white/[0.06] text-[#94a3b8] font-mono text-sm hover:bg-white/[0.03] hover:text-[#e8f4ff] transition-colors rounded"
              >
                <Edit className="w-4 h-4" />
                Edit Profile
              </button>
            ) : (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={() => setEditMode(false)}
                  className="flex items-center justify-center gap-2 px-4 py-2 border border-white/[0.06] text-[#94a3b8] font-mono text-sm hover:bg-white/[0.03] transition-colors rounded"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-[#2DD4BF] text-[#0c162b] font-mono text-sm hover:bg-[#14B8A6] transition-colors rounded disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Editable Sections */}
        <div className="space-y-6 sm:space-y-8 mb-8 sm:mb-12">
          
          {/* Brand Description */}
          <div className="p-6 sm:p-8 bg-white/[0.03] border border-white/[0.06] rounded-lg hover:border-white/10 transition-all group">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[#e8f4ff] font-mono text-sm">Brand Description</h3>
              <span className="text-[#34d399] font-mono text-xs">+19 pts</span>
            </div>
            <p className="text-[#94a3b8] font-mono text-xs mb-4">
              Imagine you're explaining your brand to a smart intern
            </p>
            {editMode ? (
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="A clear 2-3 sentence description of what you do..."
                className="w-full p-3 sm:p-4 bg-white/[0.03] border border-white/[0.06] rounded text-[#e8f4ff] font-mono text-sm focus:outline-none focus:border-[#2DD4BF] resize-none"
                rows={4}
              />
            ) : (
              <div className="text-[#94a3b8] font-mono text-sm leading-relaxed">
                {description || <span className="text-white/30">No description yet</span>}
              </div>
            )}
            <div className="mt-2 text-[#94a3b8] font-mono text-xs">
              {description.length} / 250 characters {description.length >= 100 && '✓'}
            </div>
          </div>

          {/* Products & Services */}
          <div className="p-6 sm:p-8 bg-white/[0.03] border border-white/[0.06] rounded-lg hover:border-white/10 transition-all group">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[#e8f4ff] font-mono text-sm">Products & Services</h3>
              <span className="text-[#34d399] font-mono text-xs">+19 pts</span>
            </div>
            <p className="text-[#94a3b8] font-mono text-xs mb-4">
              List your core offerings with clear descriptions
            </p>
            <div className="space-y-3 sm:space-y-4">
              {products.map((product, idx) => (
                <div key={idx} className="p-3 sm:p-4 bg-white/[0.03] border border-white/[0.06] rounded">
                  {editMode ? (
                    <div className="space-y-3">
                      <div className="flex gap-3">
                        <input
                          type="text"
                          value={product.name}
                          onChange={(e) => updateProduct(idx, 'name', e.target.value)}
                          placeholder="Product/service name"
                          className="flex-1 p-2 bg-white/[0.03] border border-white/[0.06] rounded text-[#e8f4ff] font-mono text-sm focus:outline-none focus:border-[#2DD4BF]"
                        />
                        <button
                          onClick={() => removeProduct(idx)}
                          className="px-3 py-2 border border-white/[0.06] text-[#94a3b8] hover:text-red-400 hover:border-red-400/50 transition-colors rounded"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <textarea
                        value={product.description}
                        onChange={(e) => updateProduct(idx, 'description', e.target.value)}
                        placeholder="Brief description..."
                        className="w-full p-2 bg-white/[0.03] border border-white/[0.06] rounded text-[#e8f4ff] font-mono text-sm focus:outline-none focus:border-[#2DD4BF] resize-none"
                        rows={2}
                      />
                    </div>
                  ) : (
                    <div>
                      <div className="text-[#e8f4ff] font-mono text-sm mb-1">{product.name}</div>
                      <div className="text-[#94a3b8] font-mono text-xs">{product.description}</div>
                    </div>
                  )}
                </div>
              ))}
              {editMode && (
                <button
                  onClick={addProduct}
                  className="w-full p-3 border border-dashed border-white/[0.06] text-[#94a3b8] hover:text-[#e8f4ff] hover:border-white/10 font-mono text-sm transition-colors rounded flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Product/Service
                </button>
              )}
            </div>
          </div>

          {/* FAQs */}
          <div className="p-6 sm:p-8 bg-white/[0.03] border border-white/[0.06] rounded-lg hover:border-white/10 transition-all group">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[#e8f4ff] font-mono text-sm">Frequently Asked Questions</h3>
              <span className="text-[#34d399] font-mono text-xs">+19 pts</span>
            </div>
            <p className="text-[#94a3b8] font-mono text-xs mb-4">
              Answer common questions AI models ask about brands like yours
            </p>
            <div className="space-y-3 sm:space-y-4">
              {faqs.map((faq, idx) => (
                <div key={idx} className="p-3 sm:p-4 bg-white/[0.03] border border-white/[0.06] rounded">
                  {editMode ? (
                    <div className="space-y-3">
                      <div className="flex gap-3">
                        <input
                          type="text"
                          value={faq.question}
                          onChange={(e) => updateFaq(idx, 'question', e.target.value)}
                          placeholder="Question"
                          className="flex-1 p-2 bg-white/[0.03] border border-white/[0.06] rounded text-[#e8f4ff] font-mono text-sm focus:outline-none focus:border-[#2DD4BF]"
                        />
                        <button
                          onClick={() => removeFaq(idx)}
                          className="px-3 py-2 border border-white/[0.06] text-[#94a3b8] hover:text-red-400 hover:border-red-400/50 transition-colors rounded"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <textarea
                        value={faq.answer}
                        onChange={(e) => updateFaq(idx, 'answer', e.target.value)}
                        placeholder="Answer"
                        className="w-full p-2 bg-white/[0.03] border border-white/[0.06] rounded text-[#e8f4ff] font-mono text-sm focus:outline-none focus:border-[#2DD4BF] resize-none"
                        rows={2}
                      />
                    </div>
                  ) : (
                    <div>
                      <div className="text-[#e8f4ff] font-mono text-sm mb-1">{faq.question}</div>
                      <div className="text-[#94a3b8] font-mono text-xs">{faq.answer}</div>
                    </div>
                  )}
                </div>
              ))}
              {editMode && (
                <button
                  onClick={addFaq}
                  className="w-full p-3 border border-dashed border-white/[0.06] text-[#94a3b8] hover:text-[#e8f4ff] hover:border-white/10 font-mono text-sm transition-colors rounded flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add FAQ
                </button>
              )}
            </div>
          </div>

          {/* Company Information */}
          <div className="p-6 sm:p-8 bg-white/[0.03] border border-white/[0.06] rounded-lg hover:border-white/10 transition-all group">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[#e8f4ff] font-mono text-sm">Company Information</h3>
              <span className="text-[#34d399] font-mono text-xs">+18 pts</span>
            </div>
            <p className="text-[#94a3b8] font-mono text-xs mb-4">
              Help AI models understand your company's scale and presence
            </p>
            {editMode ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[#94a3b8] font-mono text-xs mb-2 block">Founded</label>
                  <input
                    type="text"
                    value={companyInfo.founded_year}
                    onChange={(e) => setCompanyInfo({ ...companyInfo, founded_year: e.target.value })}
                    placeholder="2020"
                    className="w-full p-2 bg-white/[0.03] border border-white/[0.06] rounded text-[#e8f4ff] font-mono text-sm focus:outline-none focus:border-[#2DD4BF]"
                  />
                </div>
                <div>
                  <label className="text-[#94a3b8] font-mono text-xs mb-2 block">Headquarters</label>
                  <input
                    type="text"
                    value={companyInfo.hq_location}
                    onChange={(e) => setCompanyInfo({ ...companyInfo, hq_location: e.target.value })}
                    placeholder="San Francisco, CA"
                    className="w-full p-2 bg-white/[0.03] border border-white/[0.06] rounded text-[#e8f4ff] font-mono text-sm focus:outline-none focus:border-[#2DD4BF]"
                  />
                </div>
                <div>
                  <label className="text-[#94a3b8] font-mono text-xs mb-2 block">Employees</label>
                  <select
                    value={companyInfo.employee_band}
                    onChange={(e) => setCompanyInfo({ ...companyInfo, employee_band: e.target.value })}
                    className="w-full p-2 bg-white/[0.03] border border-white/[0.06] rounded text-[#e8f4ff] font-mono text-sm focus:outline-none focus:border-[#2DD4BF]"
                  >
                    <option value="">Select...</option>
                    <option value="1-10">1-10</option>
                    <option value="11-50">11-50</option>
                    <option value="51-200">51-200</option>
                    <option value="201-1000">201-1000</option>
                    <option value="1000+">1000+</option>
                  </select>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-6 sm:gap-12">
                {companyInfo.founded_year && (
                  <div>
                    <div className="text-[#94a3b8] font-mono text-sm mb-1">Founded</div>
                    <div className="text-[#e8f4ff] font-mono text-base">{companyInfo.founded_year}</div>
                  </div>
                )}
                {companyInfo.hq_location && (
                  <div>
                    <div className="text-[#94a3b8] font-mono text-sm mb-1">Headquarters</div>
                    <div className="text-[#e8f4ff] font-mono text-base">{companyInfo.hq_location}</div>
                  </div>
                )}
                {companyInfo.employee_band && (
                  <div>
                    <div className="text-[#94a3b8] font-mono text-sm mb-1">Employees</div>
                    <div className="text-[#e8f4ff] font-mono text-base">{companyInfo.employee_band}</div>
                  </div>
                )}
                {!companyInfo.founded_year && !companyInfo.hq_location && !companyInfo.employee_band && (
                  <div className="text-white/30 font-mono text-base">No company info yet</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Visibility Opportunities */}
        <div className="mb-8 sm:mb-12">
          <h2 className="text-[#e8f4ff] text-xl font-light mb-6">Visibility Opportunities</h2>
          <VisibilityOpportunities 
            opportunities={opportunities}
            loading={loadingOpportunities}
          />
        </div>

        {/* Version History */}
        <div className="mb-8 sm:mb-12">
          <h2 className="text-[#e8f4ff] text-xl font-light mb-6">Version History</h2>
          <VersionHistory 
            history={history}
            loading={loadingHistory}
          />
        </div>

        {/* Share Card Section */}
        <div className="mb-8 sm:mb-12">
          <h2 className="text-[#e8f4ff] text-xl font-light mb-6">Share Your Profile</h2>
          <div className="p-6 sm:p-8 bg-white/[0.03] border border-white/[0.06] rounded-lg">
          <div className="p-6 sm:p-8 bg-white/[0.03] border border-white/[0.06] rounded-lg">
          <div className="mb-6">
            <h3 className="text-[#e8f4ff] text-lg font-light mb-2">Share Your Ranking</h3>
            <p className="text-[#94a3b8] font-mono text-sm">
              Show how your brand ranks across AI models
            </p>
          </div>

          <div className="mb-6">
            <div className="text-[#94a3b8] font-mono text-sm mb-3">Choose theme</div>
            <div className="flex gap-3">
              <button
                onClick={() => setShareCardTheme('light')}
                className={`flex-1 p-4 rounded-lg border transition-colors ${
                  shareCardTheme === 'light'
                    ? 'border-white/[0.12] bg-white/[0.05]'
                    : 'border-white/[0.06] hover:border-white/10'
                }`}
              >
                <div className="text-[#e8f4ff] font-mono text-sm mb-1">Light</div>
                <div className="text-[#94a3b8] font-mono text-xs">For LinkedIn</div>
              </button>
              <button
                onClick={() => setShareCardTheme('dark')}
                className={`flex-1 p-4 rounded-lg border transition-colors ${
                  shareCardTheme === 'dark'
                    ? 'border-white/[0.12] bg-white/[0.05]'
                    : 'border-white/[0.06] hover:border-white/10'
                }`}
              >
                <div className="text-[#e8f4ff] font-mono text-sm mb-1">Dark</div>
                <div className="text-[#94a3b8] font-mono text-xs">For Twitter</div>
              </button>
            </div>
          </div>
          
          <div className="mb-6 rounded-lg overflow-hidden border border-white/[0.06]">
            <img 
              src={`/api/share-card/${slug}?theme=${shareCardTheme}`}
              alt={`${brand.brand_name} share card`}
              className="w-full h-auto"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => {
                window.open(
                  `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://useharbor.io/brands/${slug}`)}`,
                  '_blank'
                )
              }}
              className="flex-1 py-3 border border-white/[0.06] text-[#94a3b8] font-mono text-sm hover:bg-white/[0.03] rounded transition-colors text-center"
            >
              Share to LinkedIn
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(`https://useharbor.io/brands/${slug}`)
                alert('Link copied!')
              }}
              className="sm:px-6 py-3 border border-white/[0.06] text-[#94a3b8] font-mono text-sm hover:bg-white/[0.03] rounded transition-colors text-center"
            >
              Copy Link
            </button>
          </div>
        </div>

        {/* Upgrade CTA */}
        <div className="p-6 sm:p-8 bg-white/[0.03] border border-white/[0.06] rounded-lg">
          <div className="flex flex-col lg:flex-row items-start justify-between gap-6 lg:gap-8">
            <div className="flex-1">
              <h3 className="text-[#e8f4ff] text-xl font-light mb-3">
                Get the Full Intelligence Dashboard
              </h3>
              <p className="text-[#94a3b8] font-mono text-sm leading-relaxed mb-6">
                Your AI Profile is just the start. See real-time model descriptions, track weekly changes, 
                monitor competitors, and get optimization recommendations.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="text-[#94a3b8] font-mono text-sm flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-[#94a3b8]" />
                  Weekly automated scans across all 4 AI models
                </li>
                <li className="text-[#94a3b8] font-mono text-sm flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-[#94a3b8]" />
                  Competitor tracking and benchmarking
                </li>
                <li className="text-[#94a3b8] font-mono text-sm flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-[#94a3b8]" />
                  Actionable optimization tasks with impact estimates
                </li>
              </ul>
            </div>
            <div className="flex-shrink-0 w-full sm:w-auto">
              <Link 
                href="/signup"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/[0.06] hover:bg-white/[0.09] text-[#e8f4ff] font-mono text-sm rounded transition-colors w-full sm:w-auto"
              >
                Get started
                <ArrowRight className="w-4 h-4" />
              </Link>
              <p className="text-[#94a3b8] font-mono text-xs mt-2 text-center sm:text-right">From $79/month</p>
            </div>
          </div>
        </div>

      </main>
      </div>
    </div>
  )
}