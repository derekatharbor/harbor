'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  Edit, 
  Save, 
  X, 
  Plus,
  ExternalLink,
  ChevronRight
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

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
}

interface CanonicalProfile {
  description?: string
  products?: Array<{
    name: string
    description?: string
    url?: string
  }>
  faqs?: Array<{
    question: string
    answer: string
  }>
  company_info?: {
    founded?: string
    headquarters?: string
    employees?: string
  }
}

export default function ProfileManagerPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const [brand, setBrand] = useState<Brand | null>(null)
  const [profile, setProfile] = useState<CanonicalProfile>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editMode, setEditMode] = useState(false)

  // Editable fields
  const [description, setDescription] = useState('')
  const [products, setProducts] = useState<Array<{ name: string; description?: string; url?: string }>>([])
  const [faqs, setFaqs] = useState<Array<{ question: string; answer: string }>>([])
  const [companyInfo, setCompanyInfo] = useState({
    founded: '',
    headquarters: '',
    employees: ''
  })

  useEffect(() => {
    fetchBrandData()
  }, [slug])

  const fetchBrandData = async () => {
    try {
      const res = await fetch(`/api/brands/${slug}`)
      const brandData = await res.json()
      setBrand(brandData)

      setDescription(brandData.description || '')
      setProducts(brandData.products || [])
      setFaqs(brandData.faqs || [])
      setCompanyInfo(brandData.company_info || { founded: '', headquarters: '', employees: '' })

    } catch (error) {
      console.error('Failed to fetch brand:', error)
    } finally {
      setLoading(false)
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
        company_info: companyInfo
      }

      await fetch(`/api/brands/${slug}/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      setEditMode(false)
      alert('Profile updated successfully!')
    } catch (error) {
      console.error('Failed to save:', error)
      alert('Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  const addProduct = () => {
    setProducts([...products, { name: '', description: '', url: '' }])
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

  const calculateProfileStrength = () => {
    let strength = 0
    if (description && description.length > 100) strength += 25
    if (products.length >= 3) strength += 25
    if (faqs.length >= 3) strength += 25
    if (companyInfo.founded && companyInfo.headquarters && companyInfo.employees) strength += 25
    return strength
  }

  const getPercentileMessage = (rank: number) => {
    if (rank <= 10) return 'Top 1% of brands'
    if (rank <= 50) return 'Top 5% of brands'
    if (rank <= 100) return 'Top 10% of brands'
    return 'Top 25% of brands'
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

  const profileStrength = calculateProfileStrength()

  return (
    <div className="min-h-screen bg-[#0A0F1E]">
      {/* Minimal Header */}
      <header className="border-b border-white/5">
        <div className="max-w-5xl mx-auto px-8 py-5 flex items-center justify-between">
          <Link href="/" className="text-white/60 font-mono text-sm hover:text-white transition-colors">
            ← Harbor
          </Link>
          <Link 
            href={`/brands/${slug}`}
            className="text-white/40 font-mono text-xs hover:text-white/60 transition-colors flex items-center gap-2"
          >
            View public profile
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-8 py-20">
        
        {/* 1. VERIFIED STATUS - Permanent Indicator */}
        <div className="mb-16 p-5 bg-white/[0.02] border border-white/5 rounded">
          <div className="flex items-start gap-4">
            <div className="w-2 h-2 rounded-full bg-green-500/60 flex-shrink-0 mt-2" />
            <div>
              <div className="text-white font-mono text-sm mb-1">Profile: Verified</div>
              <div className="text-white/40 font-mono text-xs leading-relaxed">
                Updates you make here will influence how AI models understand your brand.
              </div>
            </div>
          </div>
        </div>

        {/* 2. HERO METRICS - Identity Summary */}
        <div className="mb-20 p-8 bg-white/[0.02] border border-white/5 rounded">
          <div className="flex items-center divide-x divide-white/5">
            <div className="flex-1 pr-8">
              <div className="text-white/40 font-mono text-xs uppercase tracking-wider mb-3">
                AI Visibility Score
              </div>
              <div className="text-white text-4xl font-mono tabular-nums">
                {brand.visibility_score.toFixed(1)}%
              </div>
            </div>
            <div className="flex-1 px-8">
              <div className="text-white/40 font-mono text-xs uppercase tracking-wider mb-3">
                Global Rank
              </div>
              <div className="text-white text-4xl font-mono tabular-nums">
                #{brand.rank_global}
              </div>
            </div>
            <div className="flex-1 pl-8">
              <div className="text-white/40 font-mono text-xs uppercase tracking-wider mb-3">
                Industry
              </div>
              <div className="text-white text-lg font-mono mt-2">
                {brand.industry}
              </div>
            </div>
          </div>
        </div>

        {/* 3. PROFILE STRENGTH - Muted Progress */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-3">
            <div className="text-white/60 font-mono text-xs uppercase tracking-wider">
              AI Profile Strength
            </div>
            <div className="text-white/40 font-mono text-xs tabular-nums">
              {profileStrength}%
            </div>
          </div>
          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#5B7C99] transition-all duration-500"
              style={{ width: `${profileStrength}%` }}
            />
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/5 mb-16" />

        {/* 4. AI PROFILE SECTION */}
        <div className="mb-20">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-white text-2xl font-normal mb-2">AI Profile</h2>
              <p className="text-white/40 font-mono text-xs">
                How AI should understand your brand
              </p>
            </div>
            {!editMode ? (
              <button
                onClick={() => setEditMode(true)}
                className="text-white/60 hover:text-white font-mono text-xs flex items-center gap-2 transition-colors"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
            ) : (
              <div className="flex gap-4">
                <button
                  onClick={() => setEditMode(false)}
                  className="text-white/40 hover:text-white/60 font-mono text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="text-white hover:text-white/80 font-mono text-xs flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            )}
          </div>

          {/* Form Fields */}
          <div className="space-y-16">
            
            {/* Description */}
            <div>
              <div className="mb-4">
                <label className="text-white/60 font-mono text-xs uppercase tracking-wider block mb-1">
                  Description
                </label>
                <p className="text-white/30 font-mono text-xs">
                  How AI introduces your company in answers.
                </p>
              </div>
              {editMode ? (
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full bg-transparent border border-white/10 rounded p-4 text-white font-mono text-sm focus:border-white/20 focus:outline-none transition-colors resize-none"
                  placeholder="Describe your brand in simple, factual language..."
                />
              ) : (
                <div className="text-white/70 font-mono text-sm leading-relaxed">
                  {description || <span className="text-white/20">No description yet</span>}
                </div>
              )}
            </div>

            {/* Products */}
            <div>
              <div className="mb-4 flex items-end justify-between">
                <div>
                  <label className="text-white/60 font-mono text-xs uppercase tracking-wider block mb-1">
                    Products
                  </label>
                  <p className="text-white/30 font-mono text-xs">
                    Helps AI models map what you actually offer.
                  </p>
                </div>
                {editMode && (
                  <button
                    onClick={addProduct}
                    className="text-white/40 hover:text-white font-mono text-xs flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    Add
                  </button>
                )}
              </div>
              
              {editMode ? (
                <div className="space-y-2">
                  {products.map((product, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={product.name}
                        onChange={(e) => updateProduct(index, 'name', e.target.value)}
                        placeholder="Product name"
                        className="flex-1 bg-transparent border border-white/10 rounded px-4 py-2 text-white font-mono text-sm focus:border-white/20 focus:outline-none transition-colors"
                      />
                      <button
                        onClick={() => removeProduct(index)}
                        className="text-white/30 hover:text-white/50 transition-colors p-2"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {products.length === 0 && (
                    <div className="text-white/20 font-mono text-sm">No products added yet</div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  {products.length > 0 ? (
                    products.map((product, index) => (
                      <div key={index} className="text-white/70 font-mono text-sm">
                        • {product.name}
                      </div>
                    ))
                  ) : (
                    <div className="text-white/20 font-mono text-sm">No products yet</div>
                  )}
                </div>
              )}
            </div>

            {/* FAQs */}
            <div>
              <div className="mb-4 flex items-end justify-between">
                <div>
                  <label className="text-white/60 font-mono text-xs uppercase tracking-wider block mb-1">
                    FAQs
                  </label>
                  <p className="text-white/30 font-mono text-xs">
                    Reduces AI hallucinations and confusion.
                  </p>
                </div>
                {editMode && (
                  <button
                    onClick={addFaq}
                    className="text-white/40 hover:text-white font-mono text-xs flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    Add
                  </button>
                )}
              </div>
              
              {editMode ? (
                <div className="space-y-4">
                  {faqs.map((faq, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={faq.question}
                          onChange={(e) => updateFaq(index, 'question', e.target.value)}
                          placeholder="Question"
                          className="flex-1 bg-transparent border border-white/10 rounded px-4 py-2 text-white font-mono text-sm focus:border-white/20 focus:outline-none transition-colors"
                        />
                        <button
                          onClick={() => removeFaq(index)}
                          className="text-white/30 hover:text-white/50 transition-colors p-2"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <textarea
                        value={faq.answer}
                        onChange={(e) => updateFaq(index, 'answer', e.target.value)}
                        rows={2}
                        placeholder="Answer"
                        className="w-full bg-transparent border border-white/10 rounded px-4 py-2 text-white font-mono text-sm focus:border-white/20 focus:outline-none transition-colors resize-none"
                      />
                    </div>
                  ))}
                  {faqs.length === 0 && (
                    <div className="text-white/20 font-mono text-sm">No FAQs added yet</div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {faqs.length > 0 ? (
                    faqs.map((faq, index) => (
                      <div key={index} className="border-l border-white/10 pl-4">
                        <div className="text-white/70 font-mono text-sm mb-1">{faq.question}</div>
                        <div className="text-white/40 font-mono text-xs">{faq.answer}</div>
                      </div>
                    ))
                  ) : (
                    <div className="text-white/20 font-mono text-sm">No FAQs yet</div>
                  )}
                </div>
              )}
            </div>

            {/* Company Info */}
            <div>
              <div className="mb-4">
                <label className="text-white/60 font-mono text-xs uppercase tracking-wider block mb-1">
                  Company Info
                </label>
                <p className="text-white/30 font-mono text-xs">
                  Provides grounding data: founding year, HQ, team size.
                </p>
              </div>
              {editMode ? (
                <div className="grid grid-cols-3 gap-3">
                  <input
                    type="text"
                    value={companyInfo.founded}
                    onChange={(e) => setCompanyInfo({...companyInfo, founded: e.target.value})}
                    placeholder="Founded"
                    className="bg-transparent border border-white/10 rounded px-4 py-2 text-white font-mono text-sm focus:border-white/20 focus:outline-none transition-colors"
                  />
                  <input
                    type="text"
                    value={companyInfo.headquarters}
                    onChange={(e) => setCompanyInfo({...companyInfo, headquarters: e.target.value})}
                    placeholder="HQ"
                    className="bg-transparent border border-white/10 rounded px-4 py-2 text-white font-mono text-sm focus:border-white/20 focus:outline-none transition-colors"
                  />
                  <input
                    type="text"
                    value={companyInfo.employees}
                    onChange={(e) => setCompanyInfo({...companyInfo, employees: e.target.value})}
                    placeholder="Employees"
                    className="bg-transparent border border-white/10 rounded px-4 py-2 text-white font-mono text-sm focus:border-white/20 focus:outline-none transition-colors"
                  />
                </div>
              ) : (
                <div className="flex gap-12">
                  {companyInfo.founded && (
                    <div>
                      <div className="text-white/40 font-mono text-xs mb-1">Founded</div>
                      <div className="text-white/70 font-mono text-sm">{companyInfo.founded}</div>
                    </div>
                  )}
                  {companyInfo.headquarters && (
                    <div>
                      <div className="text-white/40 font-mono text-xs mb-1">Headquarters</div>
                      <div className="text-white/70 font-mono text-sm">{companyInfo.headquarters}</div>
                    </div>
                  )}
                  {companyInfo.employees && (
                    <div>
                      <div className="text-white/40 font-mono text-xs mb-1">Employees</div>
                      <div className="text-white/70 font-mono text-sm">{companyInfo.employees}</div>
                    </div>
                  )}
                  {!companyInfo.founded && !companyInfo.headquarters && !companyInfo.employees && (
                    <div className="text-white/20 font-mono text-sm">No company info yet</div>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/5 mb-16" />

        {/* 5. MODEL SNAPSHOTS - Calm, Spacious */}
        <div className="mb-20">
          <div className="mb-8">
            <h3 className="text-white text-lg font-normal mb-2">How AI Describes You Today</h3>
            <p className="text-white/30 font-mono text-xs">Based on your latest profile updates.</p>
          </div>
          
          <div className="space-y-px bg-white/5">
            <div className="bg-[#0A0F1E] p-6 flex items-start gap-5">
              <div className="w-8 h-8 flex-shrink-0 opacity-50">
                <Image
                  src="/models/chatgpt-logo.png"
                  alt="ChatGPT"
                  width={32}
                  height={32}
                  className="w-full h-full object-contain grayscale"
                />
              </div>
              <div className="flex-1">
                <div className="text-white/40 font-mono text-xs mb-3">ChatGPT</div>
                <p className="text-white/60 font-mono text-sm leading-relaxed">
                  "{brand.brand_name} is a leading {brand.industry} company known for innovation and quality..."
                </p>
              </div>
            </div>
            <div className="bg-[#0A0F1E] p-6 flex items-start gap-5">
              <div className="w-8 h-8 flex-shrink-0 opacity-50">
                <Image
                  src="/models/claude-logo.png"
                  alt="Claude"
                  width={32}
                  height={32}
                  className="w-full h-full object-contain grayscale"
                />
              </div>
              <div className="flex-1">
                <div className="text-white/40 font-mono text-xs mb-3">Claude</div>
                <p className="text-white/60 font-mono text-sm leading-relaxed">
                  "{brand.brand_name} provides {brand.industry} solutions with a focus on customer satisfaction..."
                </p>
              </div>
            </div>
            <div className="bg-[#0A0F1E] p-6 flex items-start gap-5">
              <div className="w-8 h-8 flex-shrink-0 opacity-50">
                <Image
                  src="/models/perplexity-logo.png"
                  alt="Perplexity"
                  width={32}
                  height={32}
                  className="w-full h-full object-contain grayscale"
                />
              </div>
              <div className="flex-1">
                <div className="text-white/40 font-mono text-xs mb-3">Perplexity</div>
                <p className="text-white/60 font-mono text-sm leading-relaxed">
                  "{brand.brand_name} offers comprehensive {brand.industry} services to businesses worldwide..."
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 6. SHARE CARD - Reduced Void, Intentional Frame */}
        <div className="mb-20 p-8 bg-white/[0.02] border border-white/5 rounded">
          <div className="mb-8">
            <h3 className="text-white text-lg font-normal mb-2">Share Your Profile</h3>
            <p className="text-white/30 font-mono text-xs">
              Show how your brand ranks across AI models.
            </p>
          </div>
          
          {/* Minimal White Card */}
          <div className="bg-white p-12 rounded mb-6">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded overflow-hidden bg-gray-100">
                <Image
                  src={brand.logo_url}
                  alt={brand.brand_name}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-gray-900 text-3xl font-normal mb-2">{brand.brand_name}</div>
              <div className="text-gray-500 font-mono text-sm mb-8">{getPercentileMessage(brand.rank_global)}</div>
              <div className="flex items-center justify-center gap-12 mb-8">
                <div>
                  <div className="text-gray-400 font-mono text-xs mb-1">RANK</div>
                  <div className="text-gray-900 font-mono text-2xl">#{brand.rank_global}</div>
                </div>
                <div className="w-px h-12 bg-gray-200" />
                <div>
                  <div className="text-gray-400 font-mono text-xs mb-1">SCORE</div>
                  <div className="text-gray-900 font-mono text-2xl">{brand.visibility_score.toFixed(1)}%</div>
                </div>
              </div>
              <div className="pt-6 border-t border-gray-200">
                <div className="text-gray-400 font-mono text-xs">
                  Powered by <span className="text-gray-600">Harbor</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                const text = `${brand.brand_name} ranks in the ${getPercentileMessage(brand.rank_global).toLowerCase()} for AI visibility.\n\nRank: #${brand.rank_global}\nScore: ${brand.visibility_score.toFixed(1)}%`
                const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://useharbor.io/brands/${slug}`)}`
                window.open(linkedinUrl, '_blank')
              }}
              className="flex-1 text-center py-3 border border-white/10 text-white/60 font-mono text-xs hover:bg-white/5 hover:text-white transition-colors rounded"
            >
              Share to LinkedIn
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(`https://useharbor.io/brands/${slug}`)
                alert('Link copied')
              }}
              className="px-6 py-3 border border-white/10 text-white/60 font-mono text-xs hover:bg-white/5 hover:text-white transition-colors rounded"
            >
              Copy Link
            </button>
          </div>
        </div>

        {/* 7. INTELLIGENCE DASHBOARD CTA - Next Step, Not Ad */}
        <div className="p-8 border border-white/5 rounded">
          <div className="mb-6">
            <h3 className="text-white text-lg font-normal mb-2">Next Step: Intelligence Dashboard</h3>
            <p className="text-white/40 font-mono text-xs leading-relaxed">
              See real-time model descriptions, weekly scans, and competitive tracking.
            </p>
          </div>
          <Link 
            href="/dashboard"
            className="inline-flex items-center gap-2 text-white/60 font-mono text-xs hover:text-white transition-colors"
          >
            Learn more
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

      </main>
    </div>
  )
}