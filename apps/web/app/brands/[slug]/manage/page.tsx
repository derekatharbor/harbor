'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  Check, 
  AlertCircle, 
  Edit, 
  Save, 
  X, 
  Plus,
  TrendingUp,
  Shield,
  Share2,
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

interface QuickWin {
  id: string
  title: string
  description: string
  impact: string
  completed: boolean
  action: 'edit' | 'generate' | 'complete'
}

export default function ProfileManagerPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const [brand, setBrand] = useState<Brand | null>(null)
  const [profile, setProfile] = useState<CanonicalProfile>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [showSuccess, setShowSuccess] = useState(true) // Show success message on first load

  // Editable fields
  const [description, setDescription] = useState('')
  const [products, setProducts] = useState<Array<{ name: string; description?: string; url?: string }>>([])
  const [faqs, setFaqs] = useState<Array<{ question: string; answer: string }>>([])
  const [companyInfo, setCompanyInfo] = useState({
    founded: '',
    headquarters: '',
    employees: ''
  })

  // Quick wins calculation
  const [quickWins, setQuickWins] = useState<QuickWin[]>([])

  useEffect(() => {
    fetchBrandData()
  }, [slug])

  useEffect(() => {
    // Calculate quick wins based on current data
    const wins: QuickWin[] = [
      {
        id: 'schema',
        title: 'Add Organization Schema',
        description: 'Add structured data to help AI models understand your brand better.',
        impact: '+2.4%',
        completed: !!profile.company_info?.founded && !!profile.company_info?.headquarters,
        action: 'complete'
      },
      {
        id: 'faqs',
        title: 'Add 3 Common FAQs',
        description: 'Answer questions users frequently ask AI about your brand.',
        impact: '+1.8%',
        completed: (faqs?.length || 0) >= 3,
        action: 'edit'
      },
      {
        id: 'description',
        title: 'Update Brand Description',
        description: 'Keep your description fresh and optimized for AI discovery.',
        impact: '+1.1%',
        completed: (description?.length || 0) > 100,
        action: 'edit'
      },
      {
        id: 'products',
        title: 'Add Product Details',
        description: 'Showcase your key products with descriptions.',
        impact: '+0.8%',
        completed: (products?.length || 0) >= 3,
        action: 'edit'
      },
      {
        id: 'info',
        title: 'Complete Company Info',
        description: 'Fill in founding date, headquarters, and employee count.',
        impact: '+0.5%',
        completed: !!companyInfo.founded && !!companyInfo.headquarters && !!companyInfo.employees,
        action: 'complete'
      }
    ]
    setQuickWins(wins)
  }, [description, products, faqs, companyInfo, profile])

  const fetchBrandData = async () => {
    try {
      const res = await fetch(`/api/brands/${slug}`)
      const brandData = await res.json()
      setBrand(brandData)

      // Fetch canonical profile if exists
      // For now, use placeholder - you'll implement the API route
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
      // TODO: Implement save to canonical_profiles table
      const payload = {
        brand_id: brand?.id,
        description,
        products,
        faqs,
        company_info: companyInfo
      }

      // Placeholder - you'll create this API route
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

  const getPercentileMessage = (rank: number) => {
    // Assume 10,000 brands total for now
    const totalBrands = 10000
    const percentile = ((totalBrands - rank) / totalBrands) * 100

    if (rank <= 10) return "Top 10 brand globally"
    if (percentile >= 99) return "Top 1% of brands"
    if (percentile >= 90) return "Top 10% of brands"
    if (percentile >= 75) return "Top 25% of brands"
    return `Top ${Math.ceil((100 - percentile) / 10) * 10}% of brands`
  }

  const getTotalImpact = () => {
    const incomplete = quickWins.filter(w => !w.completed)
    const total = incomplete.reduce((sum, w) => sum + parseFloat(w.impact.replace('+', '').replace('%', '')), 0)
    return total.toFixed(1)
  }

  const getProjectedRank = () => {
    if (!brand) return 1
    const impact = parseFloat(getTotalImpact())
    const ranksToGain = Math.floor(impact / 2) // Rough estimate: 2% = 1 rank
    return Math.max(1, brand.rank_global - ranksToGain)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#101A31] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (!brand) {
    return (
      <div className="min-h-screen bg-[#101A31] flex items-center justify-center">
        <div className="text-white">Brand not found</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#101A31]">
      {/* Nav */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-3rem)] max-w-[1400px]">
        <div 
          className="backdrop-blur-xl bg-white/15 rounded-2xl shadow-2xl border border-white/10"
          style={{ backdropFilter: 'blur(12px)' }}
        >
          <div className="px-4 md:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14 md:h-16">
              <Link href="/" className="flex items-center space-x-2 md:space-x-3">
                <Image 
                  src="/logo-icon.png" 
                  alt="Harbor" 
                  width={32} 
                  height={32}
                  className="w-7 h-7 md:w-8 md:h-8"
                />
                <span className="text-lg md:text-xl font-bold text-white">Harbor</span>
              </Link>

              <div className="flex items-center space-x-2 md:space-x-4">
                <Link 
                  href={`/brands/${slug}`}
                  className="text-white/70 text-sm md:text-base hover:text-white transition-colors duration-200 flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  View Public Profile
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Spacer */}
      <div className="h-28" />

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-12 space-y-8">
        
        {/* Success Message (shows once after claim) */}
        {showSuccess && (
          <div className="bg-green-400/10 border border-green-400/20 rounded-xl p-6 flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-green-400/20 flex items-center justify-center flex-shrink-0">
              <Check className="w-5 h-5 text-green-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white mb-1">
                Profile Successfully Claimed!
              </h3>
              <p className="text-white/70 text-sm mb-4">
                You now control how AI models see {brand.brand_name}. Complete the quick wins below to improve your visibility.
              </p>
              <button
                onClick={() => setShowSuccess(false)}
                className="text-sm text-green-400 hover:text-green-300 transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Current Status Card */}
        <div className="bg-[#0C1422] rounded-2xl border border-white/5 p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-white/5 flex items-center justify-center">
              <Image
                src={brand.logo_url}
                alt={brand.brand_name}
                width={64}
                height={64}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none'
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-3xl font-bold text-white">{brand.brand_name}</h1>
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-400/10 text-green-400 text-xs font-medium">
                  <Shield className="w-3 h-3" />
                  Verified
                </div>
              </div>
              <p className="text-white/50 text-sm">{brand.domain}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/5 rounded-xl p-4">
              <div className="text-white/50 text-xs mb-2">Visibility Score</div>
              <div className="text-3xl font-bold text-white mb-1">
                {brand.visibility_score.toFixed(1)}%
              </div>
              <div className="text-xs text-green-400">↑ 1.2% this week</div>
            </div>

            <div className="bg-white/5 rounded-xl p-4">
              <div className="text-white/50 text-xs mb-2">Global Rank</div>
              <div className="text-3xl font-bold text-white mb-1">
                #{brand.rank_global}
              </div>
              <div className="text-xs text-white/50">in {brand.industry}</div>
            </div>

            <div className="bg-white/5 rounded-xl p-4">
              <div className="text-white/50 text-xs mb-2">Percentile</div>
              <div className="text-lg font-bold text-white mb-1">
                {getPercentileMessage(brand.rank_global)}
              </div>
              <div className="text-xs text-white/50">Among all brands</div>
            </div>
          </div>
        </div>

        {/* Quick Wins Section */}
        <div className="bg-[#0C1422] rounded-2xl border border-white/5">
          <div className="p-6 border-b border-white/5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">5 Quick Wins to Reach #{getProjectedRank()}</h2>
                <p className="text-white/60 text-sm">
                  Complete these optimizations to improve by +{getTotalImpact()}% and climb {brand.rank_global - getProjectedRank()} spots
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-white">
                  {quickWins.filter(w => w.completed).length}/{quickWins.length}
                </div>
                <div className="text-xs text-white/50">Complete</div>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-4">
            {quickWins.map((win, index) => (
              <div
                key={win.id}
                className={`p-4 rounded-xl border transition-all ${
                  win.completed
                    ? 'bg-green-400/5 border-green-400/20'
                    : 'bg-white/5 border-white/10 hover:border-[#FF6B4A]/30'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    win.completed ? 'bg-green-400/20 text-green-400' : 'bg-white/10 text-white/40'
                  }`}>
                    {win.completed ? <Check className="w-5 h-5" /> : <span className="text-sm font-bold">{index + 1}</span>}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-white font-semibold">{win.title}</h3>
                      <span className="text-sm font-medium text-[#FF6B4A]">
                        Impact: {win.impact}
                      </span>
                    </div>
                    <p className="text-white/60 text-sm mb-3">{win.description}</p>

                    {!win.completed && (
                      <button
                        onClick={() => {
                          setEditMode(true)
                          // Scroll to relevant section
                          if (win.id === 'description' || win.id === 'products' || win.id === 'faqs') {
                            document.getElementById('edit-section')?.scrollIntoView({ behavior: 'smooth' })
                          } else if (win.id === 'info') {
                            document.getElementById('company-info')?.scrollIntoView({ behavior: 'smooth' })
                          }
                        }}
                        className="text-sm text-[#FF6B4A] hover:text-[#FF6B4A]/80 transition-colors flex items-center gap-1"
                      >
                        {win.action === 'edit' ? 'Edit Now' : win.action === 'generate' ? 'Generate' : 'Complete'}
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Edit Profile Section */}
        <div id="edit-section" className="bg-[#0C1422] rounded-2xl border border-white/5">
          <div className="p-6 border-b border-white/5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Edit Your Profile</h2>
                <p className="text-white/60 text-sm">
                  Keep your information current for AI models
                </p>
              </div>
              {!editMode ? (
                <button
                  onClick={() => setEditMode(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditMode(false)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#FF6B4A] text-white hover:bg-[#FF6B4A]/90 transition-colors disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Description */}
            <div>
              <label className="block text-white font-medium mb-2">Brand Description</label>
              <p className="text-white/50 text-sm mb-3">How should AI describe your brand?</p>
              {editMode ? (
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Enter a clear, concise description of your brand..."
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#FF6B4A] transition-colors resize-none"
                />
              ) : (
                <div className="p-4 rounded-lg bg-white/5 border border-white/10 text-white/70">
                  {description || 'No description added yet'}
                </div>
              )}
            </div>

            {/* Products */}
            <div>
              <label className="block text-white font-medium mb-2">Products</label>
              <p className="text-white/50 text-sm mb-3">Key products AI should know about</p>
              <div className="space-y-3">
                {products.map((product, index) => (
                  <div key={index} className="p-4 rounded-lg bg-white/5 border border-white/10">
                    {editMode ? (
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <input
                            type="text"
                            value={product.name}
                            onChange={(e) => updateProduct(index, 'name', e.target.value)}
                            placeholder="Product name"
                            className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#FF6B4A]"
                          />
                          <button
                            onClick={() => removeProduct(index)}
                            className="p-2 rounded-lg hover:bg-red-400/10 text-red-400 transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                        <textarea
                          value={product.description || ''}
                          onChange={(e) => updateProduct(index, 'description', e.target.value)}
                          placeholder="Product description (optional)"
                          rows={2}
                          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#FF6B4A] resize-none"
                        />
                        <input
                          type="url"
                          value={product.url || ''}
                          onChange={(e) => updateProduct(index, 'url', e.target.value)}
                          placeholder="Product URL (optional)"
                          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#FF6B4A]"
                        />
                      </div>
                    ) : (
                      <div>
                        <div className="font-medium text-white mb-1">{product.name}</div>
                        {product.description && (
                          <div className="text-sm text-white/60 mb-1">{product.description}</div>
                        )}
                        {product.url && (
                          <a href={product.url} className="text-xs text-[#FF6B4A] hover:underline" target="_blank" rel="noopener">
                            {product.url}
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                {editMode && (
                  <button
                    onClick={addProduct}
                    className="w-full py-3 rounded-lg border-2 border-dashed border-white/20 text-white/60 hover:border-[#FF6B4A]/50 hover:text-white transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Add Product
                  </button>
                )}
              </div>
            </div>

            {/* FAQs */}
            <div>
              <label className="block text-white font-medium mb-2">Frequently Asked Questions</label>
              <p className="text-white/50 text-sm mb-3">Common questions users ask AI about your brand</p>
              <div className="space-y-3">
                {faqs.map((faq, index) => (
                  <div key={index} className="p-4 rounded-lg bg-white/5 border border-white/10">
                    {editMode ? (
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <input
                            type="text"
                            value={faq.question}
                            onChange={(e) => updateFaq(index, 'question', e.target.value)}
                            placeholder="Question"
                            className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#FF6B4A]"
                          />
                          <button
                            onClick={() => removeFaq(index)}
                            className="p-2 rounded-lg hover:bg-red-400/10 text-red-400 transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                        <textarea
                          value={faq.answer}
                          onChange={(e) => updateFaq(index, 'answer', e.target.value)}
                          placeholder="Answer"
                          rows={3}
                          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#FF6B4A] resize-none"
                        />
                      </div>
                    ) : (
                      <div>
                        <div className="font-medium text-white mb-2">{faq.question}</div>
                        <div className="text-sm text-white/60">{faq.answer}</div>
                      </div>
                    )}
                  </div>
                ))}
                {editMode && (
                  <button
                    onClick={addFaq}
                    className="w-full py-3 rounded-lg border-2 border-dashed border-white/20 text-white/60 hover:border-[#FF6B4A]/50 hover:text-white transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Add FAQ
                  </button>
                )}
              </div>
            </div>

            {/* Company Info */}
            <div id="company-info">
              <label className="block text-white font-medium mb-2">Company Information</label>
              <p className="text-white/50 text-sm mb-3">Basic details about your company</p>
              {editMode ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-white/60 text-sm mb-1">Founded</label>
                    <input
                      type="text"
                      value={companyInfo.founded}
                      onChange={(e) => setCompanyInfo({...companyInfo, founded: e.target.value})}
                      placeholder="e.g. 1964"
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#FF6B4A]"
                    />
                  </div>
                  <div>
                    <label className="block text-white/60 text-sm mb-1">Headquarters</label>
                    <input
                      type="text"
                      value={companyInfo.headquarters}
                      onChange={(e) => setCompanyInfo({...companyInfo, headquarters: e.target.value})}
                      placeholder="e.g. Beaverton, OR"
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#FF6B4A]"
                    />
                  </div>
                  <div>
                    <label className="block text-white/60 text-sm mb-1">Employees</label>
                    <input
                      type="text"
                      value={companyInfo.employees}
                      onChange={(e) => setCompanyInfo({...companyInfo, employees: e.target.value})}
                      placeholder="e.g. 75,000"
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#FF6B4A]"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                    <div className="text-white/50 text-xs mb-1">Founded</div>
                    <div className="text-white">{companyInfo.founded || 'Not set'}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                    <div className="text-white/50 text-xs mb-1">Headquarters</div>
                    <div className="text-white">{companyInfo.headquarters || 'Not set'}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                    <div className="text-white/50 text-xs mb-1">Employees</div>
                    <div className="text-white">{companyInfo.employees || 'Not set'}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Share Section */}
        <div className="bg-[#0C1422] rounded-2xl border border-white/5 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Share2 className="w-6 h-6 text-[#FF6B4A]" />
            <h2 className="text-2xl font-bold text-white">Share Your Profile</h2>
          </div>
          <p className="text-white/60 text-sm mb-6">
            Let others know you're optimizing for AI visibility
          </p>

          {/* Share Card Preview */}
          <div className="mb-6 p-8 rounded-xl bg-gradient-to-br from-[#FF6B4A]/10 to-transparent border border-[#FF6B4A]/20">
            <div className="text-center">
              <div className="text-sm text-white/50 mb-2">HARBOR INDEX</div>
              <div className="text-3xl font-bold text-white mb-2">{brand.brand_name}</div>
              <div className="text-lg text-white/70 mb-4">{getPercentileMessage(brand.rank_global)}</div>
              <div className="flex items-center justify-center gap-8 mb-4">
                <div>
                  <div className="text-xs text-white/50 mb-1">Rank</div>
                  <div className="text-2xl font-bold text-white">#{brand.rank_global}</div>
                </div>
                <div>
                  <div className="text-xs text-white/50 mb-1">Score</div>
                  <div className="text-2xl font-bold text-white">{brand.visibility_score.toFixed(1)}%</div>
                </div>
              </div>
              <div className="text-xs text-white/40">Powered by Harbor</div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                const text = `${brand.brand_name} ranks in the ${getPercentileMessage(brand.rank_global).toLowerCase()} for AI visibility.\n\nRank: #${brand.rank_global} in ${brand.industry}\nVisibility Score: ${brand.visibility_score.toFixed(1)}%\n\nManaging our AI presence with Harbor.\n\nCheck your brand: useharbor.io/brands`
                const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://useharbor.io/brands/${slug}`)}&summary=${encodeURIComponent(text)}`
                window.open(linkedinUrl, '_blank')
              }}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[#0077B5] text-white hover:bg-[#0077B5]/90 transition-colors"
            >
              <Share2 className="w-5 h-5" />
              Share to LinkedIn
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(`https://useharbor.io/brands/${slug}`)
                alert('Link copied to clipboard!')
              }}
              className="px-6 py-3 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              Copy Link
            </button>
          </div>
        </div>

        {/* Upsell Card */}
        <div className="bg-gradient-to-br from-[#FF6B4A]/10 to-transparent border border-[#FF6B4A]/20 rounded-2xl p-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#FF6B4A]/20 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-6 h-6 text-[#FF6B4A]" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white mb-2">Want Deeper Insights?</h3>
              <p className="text-white/70 text-sm mb-4">
                See exactly how ChatGPT, Claude, Gemini, and Perplexity talk about {brand.brand_name}. 
                Get weekly scans, competitor tracking, and optimization recommendations.
              </p>
              <Link href="/dashboard">
                <button className="flex items-center gap-2 px-6 py-3 rounded-lg bg-[#FF6B4A] text-white hover:bg-[#FF6B4A]/90 transition-colors">
                  View Intelligence Dashboard
                  <ChevronRight className="w-5 h-5" />
                </button>
              </Link>
              <p className="text-xs text-white/40 mt-3">Starts at $79/month</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
