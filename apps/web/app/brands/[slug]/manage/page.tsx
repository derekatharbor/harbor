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
  Sparkles,
  Target,
  FileText,
  MessageSquare,
  Building2,
  Eye,
  Zap,
  BarChart3
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
  icon: any
  category: 'schema' | 'content' | 'structure'
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
  const [showPreviewModal, setShowPreviewModal] = useState(false)
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

  // Quick wins calculation
  const [quickWins, setQuickWins] = useState<QuickWin[]>([])
  const [profileStrength, setProfileStrength] = useState(0)

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
        completed: !!companyInfo.founded && !!companyInfo.headquarters,
        action: 'complete',
        icon: Building2,
        category: 'schema'
      },
      {
        id: 'faqs',
        title: 'Add 3 Common FAQs',
        description: 'Answer questions users frequently ask AI about your brand.',
        impact: '+1.8%',
        completed: (faqs?.length || 0) >= 3,
        action: 'edit',
        icon: MessageSquare,
        category: 'content'
      },
      {
        id: 'description',
        title: 'Update Brand Description',
        description: 'Keep your description fresh and optimized for AI discovery.',
        impact: '+1.1%',
        completed: (description?.length || 0) > 100,
        action: 'edit',
        icon: FileText,
        category: 'content'
      },
      {
        id: 'products',
        title: 'Add Product Details',
        description: 'Showcase your key products with descriptions.',
        impact: '+0.8%',
        completed: (products?.length || 0) >= 3,
        action: 'edit',
        icon: Target,
        category: 'structure'
      },
      {
        id: 'info',
        title: 'Complete Company Info',
        description: 'Fill in founding date, headquarters, and employee count.',
        impact: '+0.5%',
        completed: !!companyInfo.founded && !!companyInfo.headquarters && !!companyInfo.employees,
        action: 'complete',
        icon: Building2,
        category: 'schema'
      }
    ]
    setQuickWins(wins)

    // Calculate profile strength
    const completedCount = wins.filter(w => w.completed).length
    const strength = Math.round((completedCount / wins.length) * 100)
    setProfileStrength(strength)
  }, [description, products, faqs, companyInfo, profile])

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

  const getPercentileMessage = (rank: number) => {
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
    const ranksToGain = Math.floor(impact / 2)
    return Math.max(1, brand.rank_global - ranksToGain)
  }

  const getStrengthColor = () => {
    if (profileStrength >= 80) return 'text-green-400'
    if (profileStrength >= 60) return 'text-[#4EE4FF]'
    if (profileStrength >= 40) return 'text-yellow-400'
    return 'text-[#FF6B4A]'
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
        
        {/* Success Message */}
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

        {/* Quick Wins Section - ELEVATED */}
        <div className="relative">
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#FF6B4A]/10 via-[#4EE4FF]/10 to-[#FF6B4A]/10 rounded-2xl blur-xl"></div>
          
          <div className="relative bg-gradient-to-br from-[#141E38] to-[#0C1422] rounded-2xl border border-[#FF6B4A]/20 shadow-2xl">
            <div className="p-6 border-b border-white/5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#FF6B4A]/20 flex items-center justify-center flex-shrink-0">
                    <Zap className="w-5 h-5 text-[#FF6B4A]" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
                      5 Quick Wins to Reach #{getProjectedRank()}
                      <TrendingUp className="w-5 h-5 text-[#4EE4FF]" />
                    </h2>
                    <p className="text-white/60 text-sm">
                      Boost your AI Visibility Score by <span className="text-[#FF6B4A] font-semibold">+{getTotalImpact()}%</span> with these high-impact improvements
                    </p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="relative w-16 h-16">
                    {/* Progress circle */}
                    <svg className="w-16 h-16 transform -rotate-90">
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth="4"
                        fill="none"
                      />
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        stroke="#FF6B4A"
                        strokeWidth="4"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 28}`}
                        strokeDashoffset={`${2 * Math.PI * 28 * (1 - quickWins.filter(w => w.completed).length / quickWins.length)}`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xl font-bold text-white">
                        {quickWins.filter(w => w.completed).length}/{quickWins.length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {quickWins.map((win, index) => {
                const Icon = win.icon
                return (
                  <div
                    key={win.id}
                    className={`p-4 rounded-xl border transition-all ${
                      win.completed
                        ? 'bg-green-400/5 border-green-400/20'
                        : 'bg-white/5 border-white/10 hover:border-[#FF6B4A]/30 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        win.completed ? 'bg-green-400/20 text-green-400' : 'bg-[#FF6B4A]/10 text-[#FF6B4A]'
                      }`}>
                        {win.completed ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-white font-semibold">{win.title}</h3>
                          <span className="px-2 py-0.5 rounded-full bg-[#FF6B4A]/20 text-[#FF6B4A] text-xs font-bold">
                            {win.impact}
                          </span>
                        </div>
                        <p className="text-white/60 text-sm mb-3">{win.description}</p>

                        {!win.completed && (
                          <button
                            onClick={() => {
                              setEditMode(true)
                              if (win.id === 'description' || win.id === 'products' || win.id === 'faqs') {
                                document.getElementById('ai-profile-section')?.scrollIntoView({ behavior: 'smooth' })
                              } else if (win.id === 'info') {
                                document.getElementById('company-info')?.scrollIntoView({ behavior: 'smooth' })
                              }
                            }}
                            className="text-sm text-[#FF6B4A] hover:text-[#FF6B4A]/80 transition-colors flex items-center gap-1 font-medium"
                          >
                            {win.action === 'edit' ? 'Edit Now' : win.action === 'generate' ? 'Generate' : 'Complete'}
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* AI Profile Strength */}
        <div className="bg-[#0C1422] rounded-2xl border border-white/5 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-5 h-5 text-[#4EE4FF]" />
              <h3 className="text-lg font-semibold text-white">AI Profile Strength</h3>
            </div>
            <span className={`text-2xl font-bold ${getStrengthColor()}`}>
              {profileStrength}%
            </span>
          </div>
          <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#FF6B4A] via-[#4EE4FF] to-green-400 transition-all duration-500 rounded-full"
              style={{ width: `${profileStrength}%` }}
            />
          </div>
          <p className="text-white/50 text-sm mt-3">
            {profileStrength < 40 && 'Complete more fields to strengthen your AI profile'}
            {profileStrength >= 40 && profileStrength < 80 && 'Good progress! Keep filling out details'}
            {profileStrength >= 80 && 'Excellent! Your AI profile is nearly complete'}
          </p>
        </div>

        {/* AI Profile Section (renamed from "Edit Profile") */}
        <div id="ai-profile-section" className="bg-[#0C1422] rounded-2xl border border-white/5">
          <div className="p-6 border-b border-white/5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">AI Profile</h2>
                <p className="text-white/60 text-sm italic">
                  How AI should understand your brand
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
              <p className="text-white/40 text-sm mb-3 italic">
                Tip: Describe your brand in simple, factual language. Imagine you're explaining it to a smart intern.
              </p>
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
              <p className="text-white/40 text-sm mb-3 italic">
                List your key products. These help AI models map what you actually offer.
              </p>
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
              <p className="text-white/40 text-sm mb-3 italic">
                Add the top questions customers ask about your product. These reduce AI hallucinations.
              </p>
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
              <p className="text-white/40 text-sm mb-3 italic">
                Give AI the basics: founding year, HQ, and employee count.
              </p>
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

        {/* Model Snapshot Preview - NEW */}
        <div className="bg-gradient-to-br from-[#0C1422] to-[#141E38] rounded-2xl border border-white/10 p-6">
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="w-6 h-6 text-[#4EE4FF]" />
            <div>
              <h2 className="text-xl font-bold text-white">How AI Describes You Today</h2>
              <p className="text-white/50 text-sm">Based on your latest profile updates</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-green-400/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-green-400">GPT</span>
                </div>
                <div className="flex-1">
                  <p className="text-white/70 text-sm italic">
                    "{brand.brand_name} is a leading {brand.industry} company known for innovation and quality..."
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#FF6B4A]/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-[#FF6B4A]">CLD</span>
                </div>
                <div className="flex-1">
                  <p className="text-white/70 text-sm italic">
                    "{brand.brand_name} provides {brand.industry} solutions with a focus on customer satisfaction..."
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-400/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-blue-400">PPX</span>
                </div>
                <div className="flex-1">
                  <p className="text-white/70 text-sm italic">
                    "{brand.brand_name} offers comprehensive {brand.industry} services to businesses worldwide..."
                  </p>
                </div>
              </div>
            </div>
          </div>

          <p className="text-white/40 text-xs mt-4 text-center italic">
            These are example descriptions. Upgrade to Intelligence Dashboard for real-time AI monitoring.
          </p>
        </div>

        {/* Public Profile Preview Button */}
        <div className="flex gap-4">
          <button
            onClick={() => setShowPreviewModal(true)}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl border border-white/10 text-white hover:bg-white/5 transition-colors"
          >
            <Eye className="w-5 h-5" />
            Preview Public Profile
          </button>
          <Link 
            href={`/brands/${slug}`}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl border border-white/10 text-white hover:bg-white/5 transition-colors"
          >
            <ExternalLink className="w-5 h-5" />
            View Live Profile
          </Link>
        </div>

        {/* Share Section - UPGRADED WITH WHITE CARD */}
        <div className="bg-[#0C1422] rounded-2xl border border-white/5 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Share2 className="w-6 h-6 text-[#FF6B4A]" />
            <h2 className="text-2xl font-bold text-white">Share Your Profile</h2>
          </div>
          <p className="text-white/60 text-sm mb-6">
            Let others know you're optimizing for AI visibility
          </p>

          {/* WHITE LINKEDIN-STYLE SHARE CARD */}
          <div className="mb-6 p-8 rounded-xl bg-white border border-gray-200 shadow-lg">
            <div className="text-center">
              {/* Logo */}
              <div className="w-16 h-16 mx-auto mb-4 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center">
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

              {/* Brand Name */}
              <div className="text-3xl font-bold text-gray-900 mb-2">{brand.brand_name}</div>
              
              {/* Percentile */}
              <div className="text-lg text-gray-600 mb-6">{getPercentileMessage(brand.rank_global)}</div>
              
              {/* Stats Grid */}
              <div className="flex items-center justify-center gap-8 mb-6">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Rank</div>
                  <div className="text-2xl font-bold text-gray-900">#{brand.rank_global}</div>
                </div>
                <div className="w-px h-12 bg-gray-300" />
                <div>
                  <div className="text-xs text-gray-500 mb-1">Score</div>
                  <div className="text-2xl font-bold text-gray-900">{brand.visibility_score.toFixed(1)}%</div>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                  <span>Powered by</span>
                  <span className="font-semibold text-gray-600">Harbor</span>
                </div>
              </div>
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

        {/* Update Log - Placeholder */}
        <div className="bg-[#0C1422] rounded-2xl border border-white/5 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Profile Improvements</h3>
          <div className="space-y-3">
            {description && (
              <div className="flex items-center gap-3 text-sm text-white/60">
                <div className="w-2 h-2 rounded-full bg-green-400" />
                <span>Brand description updated</span>
              </div>
            )}
            {faqs.length > 0 && (
              <div className="flex items-center gap-3 text-sm text-white/60">
                <div className="w-2 h-2 rounded-full bg-green-400" />
                <span>{faqs.length} FAQ{faqs.length !== 1 ? 's' : ''} added</span>
              </div>
            )}
            {products.length > 0 && (
              <div className="flex items-center gap-3 text-sm text-white/60">
                <div className="w-2 h-2 rounded-full bg-green-400" />
                <span>Product list refined ({products.length} products)</span>
              </div>
            )}
            {!description && !faqs.length && !products.length && (
              <p className="text-white/40 text-sm italic">No updates yet. Start editing your profile above!</p>
            )}
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