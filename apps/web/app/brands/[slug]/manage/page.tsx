// apps/web/app/brands/[slug]/manage/page.tsx
// Claimed profile management - "Your website is for humans. Your Harbor profile is for AI."

'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { 
  ArrowLeft, 
  ExternalLink, 
  Check,
  AlertCircle,
  Eye,
  Building2,
  Package,
  HelpCircle,
  Rss,
  Bot,
  Plus,
  X,
  Save,
  ChevronRight,
  Globe,
  Calendar,
  Users,
  MapPin,
  Sparkles,
  Copy,
  CheckCircle2
} from 'lucide-react'

// Types
interface Brand {
  id: string
  brand_name: string
  slug: string
  domain: string
  logo_url: string
  visibility_score: number
  industry: string
  claimed: boolean
  feed_data: FeedData | null
}

interface FeedData {
  brand_name: string
  one_line_summary?: string
  short_description?: string
  category?: string
  company_info?: {
    founded_year?: number | null
    hq_location?: string | null
    employee_band?: string
    industry_tags?: string[]
  }
  icp?: string
  offerings?: Array<{
    name: string
    type?: string
    description: string
    price?: string
    status?: 'active' | 'inactive' | 'discontinued'
  }>
  pricing?: {
    price_model?: string
    starting_price?: string | null
    has_free_tier?: boolean
    price_notes?: string
  }
  features?: string[]
  faqs?: Array<{
    question: string
    answer: string
  }>
  integrations?: string[]
  schema_url?: string
}

interface BotVisit {
  bot_name: string
  bot_label: string
  visit_count: number
  last_visit: string | null
}

// Tab definitions
const TABS = [
  { id: 'overview', label: 'Overview', icon: Eye },
  { id: 'brand', label: 'Brand Info', icon: Building2 },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'faqs', label: 'FAQs', icon: HelpCircle },
  { id: 'feed', label: 'AI Feed', icon: Rss },
] as const

type TabId = typeof TABS[number]['id']

export default function ManageBrandPage() {
  const router = useRouter()
  const params = useParams()
  const slug = params?.slug as string

  const [brand, setBrand] = useState<Brand | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<TabId>('overview')
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [hasChanges, setHasChanges] = useState(false)

  // Editable state
  const [description, setDescription] = useState('')
  const [oneLiner, setOneLiner] = useState('')
  const [category, setCategory] = useState('')
  const [icp, setIcp] = useState('')
  const [companyInfo, setCompanyInfo] = useState<FeedData['company_info']>({})
  const [offerings, setOfferings] = useState<NonNullable<FeedData['offerings']>>([])
  const [faqs, setFaqs] = useState<NonNullable<FeedData['faqs']>>([])

  // Bot visits (mock for now - will be real data)
  const [botVisits, setBotVisits] = useState<BotVisit[]>([
    { bot_name: 'GPTBot', bot_label: 'ChatGPT', visit_count: 0, last_visit: null },
    { bot_name: 'anthropic-ai', bot_label: 'Claude', visit_count: 0, last_visit: null },
    { bot_name: 'PerplexityBot', bot_label: 'Perplexity', visit_count: 0, last_visit: null },
    { bot_name: 'Google-Extended', bot_label: 'Gemini', visit_count: 0, last_visit: null },
  ])

  // Copied state for feed URL
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (slug) loadBrand()
  }, [slug])

  async function loadBrand() {
    try {
      const res = await fetch(`/api/brands/${slug}`)
      if (!res.ok) throw new Error('Failed to load brand')
      
      const data = await res.json()
      
      if (!data.claimed) {
        router.push(`/brands/${slug}`)
        return
      }
      
      setBrand(data)
      
      // Initialize editable state from feed_data
      const feed = data.feed_data || {}
      setDescription(feed.short_description || '')
      setOneLiner(feed.one_line_summary || '')
      setCategory(feed.category || '')
      setIcp(feed.icp || '')
      setCompanyInfo(feed.company_info || {})
      setOfferings(feed.offerings || [])
      setFaqs(feed.faqs || [])
      
    } catch (error) {
      console.error('Failed to load brand:', error)
      setMessage({ type: 'error', text: 'Failed to load brand' })
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    if (!brand) return
    setSaving(true)
    setMessage(null)

    try {
      const updatedFeedData: FeedData = {
        ...(brand.feed_data || {}),
        brand_name: brand.brand_name,
        short_description: description,
        one_line_summary: oneLiner,
        category,
        icp,
        company_info: companyInfo,
        offerings,
        faqs,
      }

      const res = await fetch(`/api/brands/${slug}/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feed_data: updatedFeedData })
      })

      if (!res.ok) throw new Error('Failed to save')
      
      setBrand({ ...brand, feed_data: updatedFeedData })
      setHasChanges(false)
      setMessage({ type: 'success', text: 'Changes saved' })
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save changes' })
    } finally {
      setSaving(false)
    }
  }

  function markChanged() {
    setHasChanges(true)
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

  // Copy feed URL
  function copyFeedUrl() {
    if (!brand) return
    const url = `https://useharbor.io/brands/${brand.slug}/harbor.json`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Calculate completeness
  function getCompleteness() {
    let score = 0
    let total = 5
    if (description?.length > 20) score++
    if (oneLiner?.length > 10) score++
    if (offerings?.length > 0) score++
    if (faqs?.length > 0) score++
    if (companyInfo?.hq_location || companyInfo?.founded_year) score++
    return { score, total, percentage: Math.round((score / total) * 100) }
  }

  const completeness = getCompleteness()

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0B0C] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white/30" />
      </div>
    )
  }

  if (!brand) {
    return (
      <div className="min-h-screen bg-[#0B0B0C] flex items-center justify-center">
        <div className="text-white/50">Brand not found</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0B0B0C]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0B0B0C]/95 backdrop-blur border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link 
                href={`/brands/${brand.slug}`}
                className="p-2 -ml-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-white/50" />
              </Link>
              
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg overflow-hidden bg-white/5">
                  <Image
                    src={brand.logo_url}
                    alt={brand.brand_name}
                    width={32}
                    height={32}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none'
                    }}
                  />
                </div>
                <div>
                  <h1 className="text-white font-semibold font-heading text-sm">{brand.brand_name}</h1>
                  <p className="text-white/40 text-xs">Manage Profile</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {message && (
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${
                  message.type === 'success' 
                    ? 'bg-green-400/10 text-green-400' 
                    : 'bg-red-400/10 text-red-400'
                }`}>
                  {message.type === 'success' ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <AlertCircle className="w-4 h-4" />
                  )}
                  {message.text}
                </div>
              )}
              
              <button
                onClick={handleSave}
                disabled={saving || !hasChanges}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  hasChanges 
                    ? 'bg-white text-black hover:bg-white/90' 
                    : 'bg-white/5 text-white/40 cursor-not-allowed'
                }`}
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 -mb-px overflow-x-auto">
            {TABS.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    isActive 
                      ? 'border-white text-white' 
                      : 'border-transparent text-white/50 hover:text-white/70'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Preview Card */}
            <div className="bg-[#111213] rounded-xl border border-white/[0.06] p-6">
              <h2 className="text-white font-semibold font-heading mb-4">How AI sees your brand</h2>
              
              <div className="bg-[#161718] rounded-lg border border-white/[0.06] p-5">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
                    <Image
                      src={brand.logo_url}
                      alt={brand.brand_name}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold font-heading">{brand.brand_name}</h3>
                    <p className="text-white/50 text-sm">{brand.domain} · {category || 'Uncategorized'}</p>
                    <p className="text-white/70 text-sm mt-2 line-clamp-2">
                      {oneLiner || description || 'No description added yet'}
                    </p>
                  </div>
                </div>

                {/* AI Platform Visibility */}
                <div className="mt-5 pt-5 border-t border-white/[0.06]">
                  <p className="text-white/40 text-xs uppercase tracking-wide mb-3">AI Platform Visibility</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {botVisits.map((bot) => (
                      <div 
                        key={bot.bot_name}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#1A1F26]"
                      >
                        <div className={`w-2 h-2 rounded-full ${
                          bot.visit_count > 0 ? 'bg-green-400' : 'bg-white/20'
                        }`} />
                        <span className="text-white/70 text-sm">{bot.bot_label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Completeness Checklist */}
            <div className="bg-[#111213] rounded-xl border border-white/[0.06] p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white font-semibold font-heading">Strengthen your AI presence</h2>
                <span className="text-white/50 text-sm">{completeness.percentage}% complete</span>
              </div>

              <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden mb-6">
                <div 
                  className="h-full bg-blue-500 transition-all duration-500"
                  style={{ width: `${completeness.percentage}%` }}
                />
              </div>

              <div className="space-y-3">
                <ChecklistItem 
                  done={description?.length > 20}
                  label="Add a description"
                  onClick={() => setActiveTab('brand')}
                />
                <ChecklistItem 
                  done={oneLiner?.length > 10}
                  label="Write a one-liner"
                  onClick={() => setActiveTab('brand')}
                />
                <ChecklistItem 
                  done={offerings?.length > 0}
                  label="Add your products"
                  onClick={() => setActiveTab('products')}
                />
                <ChecklistItem 
                  done={faqs?.length > 0}
                  label="Add FAQs"
                  onClick={() => setActiveTab('faqs')}
                />
                <ChecklistItem 
                  done={!!(companyInfo?.hq_location || companyInfo?.founded_year)}
                  label="Complete company info"
                  onClick={() => setActiveTab('brand')}
                />
              </div>
            </div>

            {/* Bot Activity */}
            <div className="bg-[#111213] rounded-xl border border-white/[0.06] p-6">
              <div className="flex items-center gap-2 mb-4">
                <Bot className="w-5 h-5 text-white/50" />
                <h2 className="text-white font-semibold font-heading">AI Bot Activity</h2>
              </div>
              <p className="text-white/50 text-sm mb-4">
                Track when AI crawlers visit your Harbor profile
              </p>

              <div className="space-y-3">
                {botVisits.map((bot) => (
                  <div 
                    key={bot.bot_name}
                    className="flex items-center justify-between py-3 border-b border-white/[0.04] last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        bot.visit_count > 0 ? 'bg-green-400/10' : 'bg-[#1A1F26]'
                      }`}>
                        <Bot className={`w-4 h-4 ${
                          bot.visit_count > 0 ? 'text-green-400' : 'text-white/30'
                        }`} />
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">{bot.bot_label}</p>
                        <p className="text-white/40 text-xs">{bot.bot_name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white/70 text-sm">
                        {bot.visit_count > 0 ? `${bot.visit_count} visits` : 'No visits yet'}
                      </p>
                      {bot.last_visit && (
                        <p className="text-white/40 text-xs">Last: {bot.last_visit}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-white/30 text-xs mt-4">
                Bot visits are tracked from your Harbor profile page
              </p>
            </div>

            {/* Upgrade CTA */}
            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl border border-blue-500/20 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-white font-semibold font-heading mb-1">Want deeper insights?</h3>
                  <p className="text-white/60 text-sm mb-4">
                    Track 50+ prompts, monitor competitors, and get actionable recommendations.
                  </p>
                  <Link
                    href="/pricing"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-black text-sm font-medium hover:bg-white/90 transition-colors"
                  >
                    <Sparkles className="w-4 h-4" />
                    Upgrade to Pro
                  </Link>
                </div>
                <div className="text-right">
                  <p className="text-white/40 text-xs">Starting at</p>
                  <p className="text-white font-semibold">$79/mo</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Brand Info Tab */}
        {activeTab === 'brand' && (
          <div className="space-y-6">
            <div className="bg-[#111213] rounded-xl border border-white/[0.06] p-6">
              <h2 className="text-white font-semibold font-heading mb-6">Brand Information</h2>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-white/70 text-sm mb-2">One-liner</label>
                  <input
                    type="text"
                    value={oneLiner}
                    onChange={(e) => { setOneLiner(e.target.value); markChanged() }}
                    placeholder="A brief tagline for your brand"
                    className="w-full px-4 py-3 rounded-lg bg-[#161718] border border-white/[0.06] text-white placeholder-white/30 focus:outline-none focus:border-white/20 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-white/70 text-sm mb-2">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => { setDescription(e.target.value); markChanged() }}
                    placeholder="Describe what your company does..."
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg bg-[#161718] border border-white/[0.06] text-white placeholder-white/30 focus:outline-none focus:border-white/20 transition-colors resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/70 text-sm mb-2">Category</label>
                    <input
                      type="text"
                      value={category}
                      onChange={(e) => { setCategory(e.target.value); markChanged() }}
                      placeholder="e.g., SaaS, E-commerce, Agency"
                      className="w-full px-4 py-3 rounded-lg bg-[#161718] border border-white/[0.06] text-white placeholder-white/30 focus:outline-none focus:border-white/20 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-white/70 text-sm mb-2">Ideal Customer</label>
                    <input
                      type="text"
                      value={icp}
                      onChange={(e) => { setIcp(e.target.value); markChanged() }}
                      placeholder="Who is your target customer?"
                      className="w-full px-4 py-3 rounded-lg bg-[#161718] border border-white/[0.06] text-white placeholder-white/30 focus:outline-none focus:border-white/20 transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#111213] rounded-xl border border-white/[0.06] p-6">
              <h2 className="text-white font-semibold font-heading mb-6">Company Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/70 text-sm mb-2">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Headquarters
                  </label>
                  <input
                    type="text"
                    value={companyInfo?.hq_location || ''}
                    onChange={(e) => { setCompanyInfo({...companyInfo, hq_location: e.target.value}); markChanged() }}
                    placeholder="e.g., San Francisco, CA"
                    className="w-full px-4 py-3 rounded-lg bg-[#161718] border border-white/[0.06] text-white placeholder-white/30 focus:outline-none focus:border-white/20 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-white/70 text-sm mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Founded Year
                  </label>
                  <input
                    type="number"
                    value={companyInfo?.founded_year || ''}
                    onChange={(e) => { setCompanyInfo({...companyInfo, founded_year: parseInt(e.target.value) || null}); markChanged() }}
                    placeholder="e.g., 2020"
                    min="1800"
                    max={new Date().getFullYear()}
                    className="w-full px-4 py-3 rounded-lg bg-[#161718] border border-white/[0.06] text-white placeholder-white/30 focus:outline-none focus:border-white/20 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-white/70 text-sm mb-2">
                    <Users className="w-4 h-4 inline mr-1" />
                    Company Size
                  </label>
                  <select
                    value={companyInfo?.employee_band || ''}
                    onChange={(e) => { setCompanyInfo({...companyInfo, employee_band: e.target.value}); markChanged() }}
                    className="w-full px-4 py-3 rounded-lg bg-[#161718] border border-white/[0.06] text-white focus:outline-none focus:border-white/20 transition-colors"
                  >
                    <option value="">Select size</option>
                    <option value="1-10">1-10 employees</option>
                    <option value="11-50">11-50 employees</option>
                    <option value="51-200">51-200 employees</option>
                    <option value="201-500">201-500 employees</option>
                    <option value="501-1000">501-1000 employees</option>
                    <option value="1000+">1000+ employees</option>
                  </select>
                </div>

                <div>
                  <label className="block text-white/70 text-sm mb-2">
                    <Globe className="w-4 h-4 inline mr-1" />
                    Website
                  </label>
                  <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-[#111213] border border-white/[0.06]">
                    <span className="text-white/50">{brand.domain}</span>
                    <a
                      href={`https://${brand.domain}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-auto text-white/30 hover:text-white/60"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="bg-[#111213] rounded-xl border border-white/[0.06] p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-white font-semibold font-heading">Products & Services</h2>
                  <p className="text-white/50 text-sm mt-1">Add what you offer so AI can recommend you accurately</p>
                </div>
                <button
                  onClick={addProduct}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white text-sm transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Product
                </button>
              </div>

              {offerings.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-10 h-10 text-white/20 mx-auto mb-3" />
                  <p className="text-white/40 text-sm">No products added yet</p>
                  <button
                    onClick={addProduct}
                    className="mt-4 text-blue-400 text-sm hover:text-blue-300"
                  >
                    Add your first product →
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {offerings.map((product, idx) => (
                    <div 
                      key={idx}
                      className="p-4 rounded-lg bg-[#1A1F26] border border-white/[0.06] group relative"
                    >
                      <button
                        onClick={() => removeProduct(idx)}
                        className="absolute top-3 right-3 p-1.5 rounded-lg bg-red-400/10 hover:bg-red-400/20 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-white/50 text-xs mb-1.5">Name</label>
                          <input
                            type="text"
                            value={product.name}
                            onChange={(e) => updateProduct(idx, 'name', e.target.value)}
                            placeholder="Product name"
                            className="w-full px-3 py-2 rounded-lg bg-[#1A1F26] border border-white/[0.06] text-white placeholder-white/30 text-sm focus:outline-none focus:border-white/20"
                          />
                        </div>
                        <div>
                          <label className="block text-white/50 text-xs mb-1.5">Price</label>
                          <input
                            type="text"
                            value={product.price || ''}
                            onChange={(e) => updateProduct(idx, 'price', e.target.value)}
                            placeholder="e.g., $99/mo, Free, Contact us"
                            className="w-full px-3 py-2 rounded-lg bg-[#1A1F26] border border-white/[0.06] text-white placeholder-white/30 text-sm focus:outline-none focus:border-white/20"
                          />
                        </div>
                        <div>
                          <label className="block text-white/50 text-xs mb-1.5">Status</label>
                          <select
                            value={product.status || 'active'}
                            onChange={(e) => updateProduct(idx, 'status', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-[#1A1F26] border border-white/[0.06] text-white text-sm focus:outline-none focus:border-white/20"
                          >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="discontinued">Discontinued</option>
                          </select>
                        </div>
                      </div>

                      <div className="mt-3">
                        <label className="block text-white/50 text-xs mb-1.5">Description</label>
                        <textarea
                          value={product.description}
                          onChange={(e) => updateProduct(idx, 'description', e.target.value)}
                          placeholder="Brief description of this product..."
                          rows={2}
                          className="w-full px-3 py-2 rounded-lg bg-[#1A1F26] border border-white/[0.06] text-white placeholder-white/30 text-sm focus:outline-none focus:border-white/20 resize-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* FAQs Tab */}
        {activeTab === 'faqs' && (
          <div className="space-y-6">
            <div className="bg-[#111213] rounded-xl border border-white/[0.06] p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-white font-semibold font-heading">Frequently Asked Questions</h2>
                  <p className="text-white/50 text-sm mt-1">Help AI answer questions about your brand accurately</p>
                </div>
                <button
                  onClick={addFaq}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white text-sm transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add FAQ
                </button>
              </div>

              {faqs.length === 0 ? (
                <div className="text-center py-12">
                  <HelpCircle className="w-10 h-10 text-white/20 mx-auto mb-3" />
                  <p className="text-white/40 text-sm">No FAQs added yet</p>
                  <button
                    onClick={addFaq}
                    className="mt-4 text-blue-400 text-sm hover:text-blue-300"
                  >
                    Add your first FAQ →
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {faqs.map((faq, idx) => (
                    <div 
                      key={idx}
                      className="p-4 rounded-lg bg-[#1A1F26] border border-white/[0.06] group relative"
                    >
                      <button
                        onClick={() => removeFaq(idx)}
                        className="absolute top-3 right-3 p-1.5 rounded-lg bg-red-400/10 hover:bg-red-400/20 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-white/50 text-xs mb-1.5">Question</label>
                          <input
                            type="text"
                            value={faq.question}
                            onChange={(e) => updateFaq(idx, 'question', e.target.value)}
                            placeholder="What do customers commonly ask?"
                            className="w-full px-3 py-2 rounded-lg bg-[#1A1F26] border border-white/[0.06] text-white placeholder-white/30 text-sm focus:outline-none focus:border-white/20"
                          />
                        </div>
                        <div>
                          <label className="block text-white/50 text-xs mb-1.5">Answer</label>
                          <textarea
                            value={faq.answer}
                            onChange={(e) => updateFaq(idx, 'answer', e.target.value)}
                            placeholder="The answer you want AI to give..."
                            rows={3}
                            className="w-full px-3 py-2 rounded-lg bg-[#1A1F26] border border-white/[0.06] text-white placeholder-white/30 text-sm focus:outline-none focus:border-white/20 resize-none"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* AI Feed Tab */}
        {activeTab === 'feed' && (
          <div className="space-y-6">
            <div className="bg-[#111213] rounded-xl border border-white/[0.06] p-6">
              <h2 className="text-white font-semibold font-heading mb-2">Your AI Feed</h2>
              <p className="text-white/50 text-sm mb-6">
                This structured data is what AI models see when they visit your Harbor profile
              </p>

              {/* Feed URL */}
              <div className="mb-6">
                <label className="block text-white/70 text-sm mb-2">Feed URL</label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 px-4 py-3 rounded-lg bg-[#1A1F26] border border-white/[0.06] font-mono text-sm text-white/70 truncate">
                    https://useharbor.io/brands/{brand.slug}/harbor.json
                  </div>
                  <button
                    onClick={copyFeedUrl}
                    className="p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    {copied ? (
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                    ) : (
                      <Copy className="w-5 h-5 text-white/50" />
                    )}
                  </button>
                </div>
              </div>

              {/* Feed Preview */}
              <div>
                <label className="block text-white/70 text-sm mb-2">Preview</label>
                <div className="bg-[#161718] rounded-lg border border-white/[0.06] p-4 overflow-x-auto">
                  <pre className="text-xs font-mono text-white/70 whitespace-pre-wrap">
{JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Organization",
  name: brand.brand_name,
  description: description || undefined,
  url: `https://${brand.domain}`,
  slogan: oneLiner || undefined,
  foundingDate: companyInfo?.founded_year || undefined,
  address: companyInfo?.hq_location ? {
    "@type": "PostalAddress",
    addressLocality: companyInfo.hq_location
  } : undefined,
  numberOfEmployees: companyInfo?.employee_band ? {
    "@type": "QuantitativeValue",
    value: companyInfo.employee_band
  } : undefined,
  hasOfferCatalog: offerings?.length > 0 ? {
    "@type": "OfferCatalog",
    itemListElement: offerings.filter(o => o.status !== 'discontinued').map(o => ({
      "@type": "Offer",
      name: o.name,
      description: o.description,
      price: o.price
    }))
  } : undefined,
  mainEntity: faqs?.length > 0 ? {
    "@type": "FAQPage",
    mainEntity: faqs.map(f => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.answer
      }
    }))
  } : undefined
}, null, 2)}
                  </pre>
                </div>
              </div>

              <p className="text-white/30 text-xs mt-4">
                This schema.org structured data is automatically generated from your profile
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

// Checklist Item Component
function ChecklistItem({ 
  done, 
  label, 
  onClick 
}: { 
  done: boolean
  label: string
  onClick: () => void 
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-[#1A1F26] transition-colors group text-left"
    >
      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
        done ? 'bg-green-400/20' : 'border border-white/20'
      }`}>
        {done && <Check className="w-3 h-3 text-green-400" />}
      </div>
      <span className={`flex-1 text-sm ${done ? 'text-white/50 line-through' : 'text-white/80'}`}>
        {label}
      </span>
      <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-white/50 transition-colors" />
    </button>
  )
}