'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  Check, 
  Edit, 
  Save, 
  X, 
  Plus,
  ExternalLink,
  ChevronRight,
  Sparkles
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
  const [showSuccess, setShowSuccess] = useState(true)

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

  const getStrengthColor = (strength: number) => {
    if (strength < 25) return 'rgba(255, 107, 74, 0.4)'
    if (strength < 50) return 'rgba(255, 193, 7, 0.4)'
    if (strength < 75) return 'rgba(41, 121, 255, 0.4)'
    return 'rgba(76, 175, 80, 0.4)'
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
        <div className="text-white/60 font-mono text-sm">Loading profile...</div>
      </div>
    )
  }

  if (!brand) {
    return (
      <div className="min-h-screen bg-[#0A0F1E] flex items-center justify-center">
        <div className="text-white/60 font-mono text-sm">Brand not found</div>
      </div>
    )
  }

  const profileStrength = calculateProfileStrength()

  return (
    <div className="min-h-screen bg-[#0A0F1E]">
      {/* Minimal Header */}
      <header className="border-b border-white/5">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-white font-mono text-sm hover:text-white/60 transition-colors">
            ← Harbor
          </Link>
          <Link 
            href={`/brands/${slug}`}
            className="text-white/60 font-mono text-sm hover:text-white transition-colors flex items-center gap-2"
          >
            View public profile
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </header>

      {/* Main Content - Max Width, Generous Spacing */}
      <main className="max-w-4xl mx-auto px-6 py-16">
        
        {/* Success Message - Minimal */}
        {showSuccess && (
          <div className="mb-12 flex items-start justify-between p-4 bg-white/5 border border-white/10 rounded">
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-[#4CAF50] flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-white font-mono text-sm mb-1">Profile claimed</div>
                <div className="text-white/50 font-mono text-xs">
                  Updates you make will be reflected in how AI models understand your brand.
                </div>
              </div>
            </div>
            <button 
              onClick={() => setShowSuccess(false)}
              className="text-white/40 hover:text-white/60 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Current Stats - Clean Grid */}
        <div className="mb-16">
          <div className="grid grid-cols-3 gap-px bg-white/5">
            <div className="bg-[#0A0F1E] p-6">
              <div className="text-white/40 font-mono text-xs uppercase tracking-wider mb-2">Rank</div>
              <div className="text-white text-3xl font-mono">#{brand.rank_global}</div>
            </div>
            <div className="bg-[#0A0F1E] p-6">
              <div className="text-white/40 font-mono text-xs uppercase tracking-wider mb-2">Score</div>
              <div className="text-white text-3xl font-mono">{brand.visibility_score.toFixed(1)}%</div>
            </div>
            <div className="bg-[#0A0F1E] p-6">
              <div className="text-white/40 font-mono text-xs uppercase tracking-wider mb-2">Industry</div>
              <div className="text-white text-lg font-mono mt-2">{brand.industry}</div>
            </div>
          </div>
        </div>

        {/* Profile Strength - Minimal Progress */}
        <div className="mb-16">
          <div className="flex items-end justify-between mb-3">
            <div className="text-white/40 font-mono text-xs uppercase tracking-wider">Profile Strength</div>
            <div className="text-white font-mono text-sm">{profileStrength}%</div>
          </div>
          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
            <div 
              className="h-full transition-all duration-500"
              style={{ 
                width: `${profileStrength}%`,
                backgroundColor: getStrengthColor(profileStrength)
              }}
            />
          </div>
        </div>

        {/* AI Profile Section - Clean Header */}
        <div className="mb-16">
          <div className="flex items-end justify-between mb-8 pb-4 border-b border-white/5">
            <div>
              <h2 className="text-white text-2xl font-normal mb-2">AI Profile</h2>
              <p className="text-white/40 font-mono text-xs">How AI should understand your brand</p>
            </div>
            {!editMode ? (
              <button
                onClick={() => setEditMode(true)}
                className="text-white/60 hover:text-white font-mono text-sm flex items-center gap-2 transition-colors"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={() => setEditMode(false)}
                  className="text-white/40 hover:text-white/60 font-mono text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="text-white hover:text-white/80 font-mono text-sm flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            )}
          </div>

          {/* Form Fields - Ultra Minimal */}
          <div className="space-y-12">
            
            {/* Description */}
            <div>
              <label className="text-white/60 font-mono text-xs uppercase tracking-wider mb-3 block">
                Description
              </label>
              {editMode ? (
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full bg-transparent border border-white/10 rounded p-4 text-white font-mono text-sm focus:border-white/30 focus:outline-none transition-colors resize-none"
                  placeholder="Describe your brand in simple, factual language..."
                />
              ) : (
                <div className="text-white/80 font-mono text-sm leading-relaxed">
                  {description || <span className="text-white/30">No description yet</span>}
                </div>
              )}
              <div className="text-white/30 font-mono text-xs mt-2 italic">
                Tip: Imagine you're explaining it to a smart intern.
              </div>
            </div>

            {/* Products */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-white/60 font-mono text-xs uppercase tracking-wider">
                  Products
                </label>
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
                <div className="space-y-3">
                  {products.map((product, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={product.name}
                        onChange={(e) => updateProduct(index, 'name', e.target.value)}
                        placeholder="Product name"
                        className="flex-1 bg-transparent border border-white/10 rounded px-4 py-2 text-white font-mono text-sm focus:border-white/30 focus:outline-none transition-colors"
                      />
                      <button
                        onClick={() => removeProduct(index)}
                        className="text-white/40 hover:text-white/60 transition-colors p-2"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {products.length === 0 && (
                    <div className="text-white/30 font-mono text-sm">No products added yet</div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  {products.length > 0 ? (
                    products.map((product, index) => (
                      <div key={index} className="text-white/80 font-mono text-sm">
                        • {product.name}
                      </div>
                    ))
                  ) : (
                    <div className="text-white/30 font-mono text-sm">No products yet</div>
                  )}
                </div>
              )}
              <div className="text-white/30 font-mono text-xs mt-2 italic">
                These help AI models map what you actually offer.
              </div>
            </div>

            {/* FAQs */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-white/60 font-mono text-xs uppercase tracking-wider">
                  FAQs
                </label>
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
                          className="flex-1 bg-transparent border border-white/10 rounded px-4 py-2 text-white font-mono text-sm focus:border-white/30 focus:outline-none transition-colors"
                        />
                        <button
                          onClick={() => removeFaq(index)}
                          className="text-white/40 hover:text-white/60 transition-colors p-2"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <textarea
                        value={faq.answer}
                        onChange={(e) => updateFaq(index, 'answer', e.target.value)}
                        rows={2}
                        placeholder="Answer"
                        className="w-full bg-transparent border border-white/10 rounded px-4 py-2 text-white font-mono text-sm focus:border-white/30 focus:outline-none transition-colors resize-none"
                      />
                    </div>
                  ))}
                  {faqs.length === 0 && (
                    <div className="text-white/30 font-mono text-sm">No FAQs added yet</div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {faqs.length > 0 ? (
                    faqs.map((faq, index) => (
                      <div key={index} className="border-l border-white/10 pl-4">
                        <div className="text-white/80 font-mono text-sm mb-1">{faq.question}</div>
                        <div className="text-white/50 font-mono text-xs">{faq.answer}</div>
                      </div>
                    ))
                  ) : (
                    <div className="text-white/30 font-mono text-sm">No FAQs yet</div>
                  )}
                </div>
              )}
              <div className="text-white/30 font-mono text-xs mt-2 italic">
                Top questions customers ask. These reduce AI hallucinations.
              </div>
            </div>

            {/* Company Info */}
            <div>
              <label className="text-white/60 font-mono text-xs uppercase tracking-wider mb-3 block">
                Company Info
              </label>
              {editMode ? (
                <div className="grid grid-cols-3 gap-3">
                  <input
                    type="text"
                    value={companyInfo.founded}
                    onChange={(e) => setCompanyInfo({...companyInfo, founded: e.target.value})}
                    placeholder="Founded"
                    className="bg-transparent border border-white/10 rounded px-4 py-2 text-white font-mono text-sm focus:border-white/30 focus:outline-none transition-colors"
                  />
                  <input
                    type="text"
                    value={companyInfo.headquarters}
                    onChange={(e) => setCompanyInfo({...companyInfo, headquarters: e.target.value})}
                    placeholder="HQ"
                    className="bg-transparent border border-white/10 rounded px-4 py-2 text-white font-mono text-sm focus:border-white/30 focus:outline-none transition-colors"
                  />
                  <input
                    type="text"
                    value={companyInfo.employees}
                    onChange={(e) => setCompanyInfo({...companyInfo, employees: e.target.value})}
                    placeholder="Employees"
                    className="bg-transparent border border-white/10 rounded px-4 py-2 text-white font-mono text-sm focus:border-white/30 focus:outline-none transition-colors"
                  />
                </div>
              ) : (
                <div className="flex gap-8">
                  {companyInfo.founded && (
                    <div>
                      <div className="text-white/40 font-mono text-xs mb-1">Founded</div>
                      <div className="text-white/80 font-mono text-sm">{companyInfo.founded}</div>
                    </div>
                  )}
                  {companyInfo.headquarters && (
                    <div>
                      <div className="text-white/40 font-mono text-xs mb-1">Headquarters</div>
                      <div className="text-white/80 font-mono text-sm">{companyInfo.headquarters}</div>
                    </div>
                  )}
                  {companyInfo.employees && (
                    <div>
                      <div className="text-white/40 font-mono text-xs mb-1">Employees</div>
                      <div className="text-white/80 font-mono text-sm">{companyInfo.employees}</div>
                    </div>
                  )}
                  {!companyInfo.founded && !companyInfo.headquarters && !companyInfo.employees && (
                    <div className="text-white/30 font-mono text-sm">No company info yet</div>
                  )}
                </div>
              )}
              <div className="text-white/30 font-mono text-xs mt-2 italic">
                Give AI the basics: founding year, HQ, and employee count.
              </div>
            </div>

          </div>
        </div>

        {/* Model Snapshots - Clean Grid */}
        <div className="mb-16">
          <h3 className="text-white/40 font-mono text-xs uppercase tracking-wider mb-6">
            How AI Describes You Today
          </h3>
          <div className="grid gap-px bg-white/5">
            <div className="bg-[#0A0F1E] p-6 flex items-start gap-4">
              <Image
                src="/models/chatgpt-logo.png"
                alt="ChatGPT"
                width={32}
                height={32}
                className="w-8 h-8 flex-shrink-0 opacity-60"
              />
              <div className="flex-1">
                <div className="text-white/40 font-mono text-xs mb-2">ChatGPT</div>
                <p className="text-white/60 font-mono text-xs italic leading-relaxed">
                  "{brand.brand_name} is a leading {brand.industry} company known for innovation and quality..."
                </p>
              </div>
            </div>
            <div className="bg-[#0A0F1E] p-6 flex items-start gap-4">
              <Image
                src="/models/claude-logo.png"
                alt="Claude"
                width={32}
                height={32}
                className="w-8 h-8 flex-shrink-0 opacity-60"
              />
              <div className="flex-1">
                <div className="text-white/40 font-mono text-xs mb-2">Claude</div>
                <p className="text-white/60 font-mono text-xs italic leading-relaxed">
                  "{brand.brand_name} provides {brand.industry} solutions with a focus on customer satisfaction..."
                </p>
              </div>
            </div>
            <div className="bg-[#0A0F1E] p-6 flex items-start gap-4">
              <Image
                src="/models/perplexity-logo.png"
                alt="Perplexity"
                width={32}
                height={32}
                className="w-8 h-8 flex-shrink-0 opacity-60"
              />
              <div className="flex-1">
                <div className="text-white/40 font-mono text-xs mb-2">Perplexity</div>
                <p className="text-white/60 font-mono text-xs italic leading-relaxed">
                  "{brand.brand_name} offers comprehensive {brand.industry} services to businesses worldwide..."
                </p>
              </div>
            </div>
          </div>
          <p className="text-white/30 font-mono text-xs mt-4 italic">
            Placeholder descriptions. Upgrade to Intelligence Dashboard for real-time monitoring.
          </p>
        </div>

        {/* Share - Minimal LinkedIn Card */}
        <div className="mb-16">
          <h3 className="text-white/40 font-mono text-xs uppercase tracking-wider mb-6">
            Share Your Profile
          </h3>
          
          {/* Minimal White Card */}
          <div className="bg-white p-12 rounded mb-4">
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
                const text = `${brand.brand_name} ranks in the ${getPercentileMessage(brand.rank_global).toLowerCase()} for AI visibility.\n\nRank: #${brand.rank_global}\nScore: ${brand.visibility_score.toFixed(1)}%\n\nManaging our AI presence with Harbor.`
                const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://useharbor.io/brands/${slug}`)}`
                window.open(linkedinUrl, '_blank')
              }}
              className="flex-1 text-center py-3 border border-white/10 text-white font-mono text-sm hover:bg-white/5 transition-colors rounded"
            >
              Share to LinkedIn
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(`https://useharbor.io/brands/${slug}`)
                alert('Link copied')
              }}
              className="px-6 py-3 border border-white/10 text-white font-mono text-sm hover:bg-white/5 transition-colors rounded"
            >
              Copy Link
            </button>
          </div>
        </div>

        {/* Upsell - Minimal */}
        <div className="border border-white/10 rounded p-8">
          <div className="flex items-start gap-6">
            <Sparkles className="w-6 h-6 text-white/40 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-white text-lg font-normal mb-2">Intelligence Dashboard</h3>
              <p className="text-white/50 font-mono text-sm mb-6 leading-relaxed">
                See exactly how ChatGPT, Claude, Gemini, and Perplexity talk about {brand.brand_name}. 
                Weekly scans, competitor tracking, optimization recommendations.
              </p>
              <Link 
                href="/dashboard"
                className="inline-flex items-center gap-2 text-white font-mono text-sm hover:text-white/60 transition-colors"
              >
                Learn more
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

      </main>
    </div>
  )
}

function getPercentileMessage(rank: number) {
  if (rank <= 10) return 'Top 1% of brands'
  if (rank <= 50) return 'Top 5% of brands'
  if (rank <= 100) return 'Top 10% of brands'
  return 'Top 25% of brands'
}