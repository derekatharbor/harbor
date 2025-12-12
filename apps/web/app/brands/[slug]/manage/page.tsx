// apps/web/app/brands/[slug]/manage/page.tsx
// Claimed profile management - "Your website is for humans. Your Harbor profile is for AI."

'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { 
  ArrowLeft, 
  ExternalLink, 
  Eye,
  Building2,
  Package,
  HelpCircle,
  Plus,
  X,
  Save,
  Globe,
  Calendar,
  Users,
  MapPin,
  CheckCircle2,
  Upload,
  Camera,
  Zap,
  LogOut,
  BookOpen,
  Info
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
  logo: string
  visit_count: number
  last_visit: string | null
}

// Nav sections
const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: Eye },
  { id: 'brand', label: 'Brand Info', icon: Building2 },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'faqs', label: 'FAQs', icon: HelpCircle },
] as const

type NavId = typeof NAV_ITEMS[number]['id'] | 'getting-started'

export default function ManageBrandPage() {
  const router = useRouter()
  const params = useParams()
  const slug = params?.slug as string
  const supabase = createClientComponentClient()

  // Sign out handler
  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  // Core state
  const [brand, setBrand] = useState<Brand | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeNav, setActiveNav] = useState<NavId>('overview')
  const [saving, setSaving] = useState(false)
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

  // Bot visits - using Brandfetch for high-quality logos
  const [botVisits] = useState<BotVisit[]>([
    { bot_name: 'GPTBot', bot_label: 'ChatGPT', logo: 'https://cdn.brandfetch.io/openai.com?c=1id1Fyz-h7an5-5KR_y', visit_count: 0, last_visit: null },
    { bot_name: 'anthropic-ai', bot_label: 'Claude', logo: 'https://cdn.brandfetch.io/anthropic.com?c=1id1Fyz-h7an5-5KR_y', visit_count: 0, last_visit: null },
    { bot_name: 'PerplexityBot', bot_label: 'Perplexity', logo: 'https://cdn.brandfetch.io/perplexity.ai?c=1id1Fyz-h7an5-5KR_y', visit_count: 0, last_visit: null },
    { bot_name: 'Google-Extended', bot_label: 'Gemini', logo: 'https://cdn.brandfetch.io/google.com?c=1id1Fyz-h7an5-5KR_y', visit_count: 0, last_visit: null },
  ])

  // CSV Import state
  const [csvPreview, setCsvPreview] = useState<{
    rows: Array<Record<string, string>>
    columns: string[]
    mapping: { name: string; price: string; description: string; status: string }
  } | null>(null)

  // Load brand data
  useEffect(() => {
    async function loadBrand() {
      try {
        const res = await fetch(`/api/brands/${slug}`)
        if (!res.ok) throw new Error('Brand not found')
        const data = await res.json()
        
        if (!data.claimed) {
          router.push(`/brands/${slug}`)
          return
        }
        
        setBrand(data)
        
        // Initialize editable state from feed_data
        if (data.feed_data) {
          setDescription(data.feed_data.short_description || '')
          setOneLiner(data.feed_data.one_line_summary || '')
          setCategory(data.feed_data.category || '')
          setIcp(data.feed_data.icp || '')
          setCompanyInfo(data.feed_data.company_info || {})
          setOfferings(data.feed_data.offerings || [])
          setFaqs(data.feed_data.faqs || [])
        }
      } catch (error) {
        console.error('Failed to load brand:', error)
      } finally {
        setLoading(false)
      }
    }
    
    if (slug) loadBrand()
  }, [slug, router])

  // Save handler
  async function handleSave() {
    if (!brand) return
    setSaving(true)
    setMessage(null)

    try {
      // Send in format API expects
      const res = await fetch(`/api/brands/${slug}/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description, // API maps this to short_description
          offerings: offerings.map(o => ({
            name: o.name,
            type: o.type || 'product',
            description: o.description,
            price: o.price,
            status: o.status || 'active'
          })),
          faqs,
          companyInfo: {
            ...companyInfo,
            // Include one_liner, category, icp in company_info
          },
          // Additional fields the API supports
          one_line_summary: oneLiner,
          category,
          icp,
        })
      })

      if (!res.ok) throw new Error('Failed to save')
      
      // Update local state with new feed_data
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
      
      setBrand({ ...brand, feed_data: updatedFeedData })
      setHasChanges(false)
      setMessage({ type: 'success', text: 'Saved!' })
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save' })
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

  // CSV handlers
  const COLUMN_ALIASES = {
    name: ['name', 'product_name', 'product', 'title', 'item', 'service'],
    price: ['price', 'pricing', 'cost', 'amount', 'rate', 'fee'],
    description: ['description', 'desc', 'details', 'summary', 'about', 'info'],
    status: ['status', 'state', 'active', 'enabled', 'available']
  }

  function detectColumnMapping(columns: string[]) {
    const lowerColumns = columns.map(c => c.toLowerCase().trim())
    const mapping = { name: '', price: '', description: '', status: '' }
    
    for (const [field, aliases] of Object.entries(COLUMN_ALIASES)) {
      const match = lowerColumns.find(col => aliases.includes(col))
      if (match) {
        mapping[field as keyof typeof mapping] = columns[lowerColumns.indexOf(match)]
      }
    }
    return mapping
  }

  function handleCsvFile(file: File) {
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const lines = text.split('\n').filter(line => line.trim())
      if (lines.length < 2) {
        setMessage({ type: 'error', text: 'CSV must have header and data rows' })
        return
      }
      const columns = lines[0].split(',').map(c => c.trim().replace(/^"|"$/g, ''))
      const rows = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''))
        const row: Record<string, string> = {}
        columns.forEach((col, i) => { row[col] = values[i] || '' })
        return row
      }).filter(row => Object.values(row).some(v => v))

      setCsvPreview({ rows, columns, mapping: detectColumnMapping(columns) })
    }
    reader.readAsText(file)
  }

  function importCsvProducts() {
    if (!csvPreview) return
    const { rows, mapping } = csvPreview
    const newProducts = rows.map(row => ({
      name: row[mapping.name] || '',
      price: row[mapping.price] || '',
      description: row[mapping.description] || '',
      status: 'active' as const
    })).filter(p => p.name)

    setOfferings([...offerings, ...newProducts])
    setCsvPreview(null)
    markChanged()
    setMessage({ type: 'success', text: `Imported ${newProducts.length} products` })
    setTimeout(() => setMessage(null), 3000)
  }

  // Progress calculation
  const steps = [
    { id: 1, label: 'Add brand info', description: 'Name, description, and category', done: description?.length > 20 && oneLiner?.length > 10, icon: '/icons/step-brand.png' },
    { id: 2, label: 'Add products', description: 'What you offer', done: offerings?.length > 0, icon: '/icons/step-products.png' },
    { id: 3, label: 'Add FAQs', description: 'Common questions', done: faqs?.length > 0, icon: '/icons/step-faqs.png' },
  ]
  const completedSteps = steps.filter(s => s.done).length

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
    <div className="h-screen bg-[#0B0B0C] flex overflow-hidden">
      {/* Left Sidebar - Fixed */}
      <aside className="w-[220px] border-r border-white/[0.06] flex flex-col flex-shrink-0 h-screen overflow-hidden">
        {/* Brand Header */}
        <div className="p-4 border-b border-white/[0.06]">
          <Link
            href={`/brands/${brand.slug}`}
            className="flex items-center gap-2 text-white/50 hover:text-white/70 text-sm mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to profile
          </Link>
          
          <div className="flex items-center gap-3">
            <div className="relative group">
              <div className="w-10 h-10 rounded-lg overflow-hidden bg-white/5">
                <Image
                  src={brand.logo_url}
                  alt={brand.brand_name}
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              </div>
              <label className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-lg">
                <Camera className="w-4 h-4 text-white" />
                <input type="file" accept="image/*" className="hidden" />
              </label>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-white font-semibold text-sm truncate">{brand.brand_name}</h1>
              <p className="text-white/40 text-xs truncate">{brand.domain}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 overflow-y-auto">
          {/* Getting Started - Separate section */}
          <button
            onClick={() => setActiveNav('getting-started')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors mb-2 ${
              activeNav === 'getting-started' 
                ? 'bg-white/[0.08] text-white' 
                : 'text-white/60 hover:text-white/80 hover:bg-white/[0.04]'
            }`}
          >
            <BookOpen className="w-4 h-4" strokeWidth={1.5} />
            Getting Started
          </button>

          {/* Divider */}
          <div className="h-px bg-white/[0.06] my-2" />

          {/* Main Nav */}
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = activeNav === item.id
            return (
              <button
                key={item.id}
                onClick={() => setActiveNav(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive 
                    ? 'bg-white/[0.08] text-white' 
                    : 'text-white/60 hover:text-white/80 hover:bg-white/[0.04]'
                }`}
              >
                <Icon className="w-4 h-4" strokeWidth={1.5} />
                {item.label}
              </button>
            )
          })}
        </nav>

        {/* Sign Out */}
        <div className="p-2 border-t border-white/[0.06]">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/60 transition-colors hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut className="w-4 h-4" strokeWidth={1.5} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content - Scrollable */}
      <main className="flex-1 overflow-y-auto h-screen">
        <div className="max-w-4xl mx-auto p-8">

          {/* Getting Started Section */}
          {activeNav === 'getting-started' && (
            <div className="space-y-8">
              {/* Hero */}
              <div className="text-center py-8">
                <h2 className="text-white font-semibold font-heading text-2xl mb-3">Welcome to your AI Profile</h2>
                <p className="text-white/60 text-lg max-w-xl mx-auto">
                  Create a clean, structured profile that AI platforms can read when they crawl your Harbor page.
                </p>
              </div>

              {/* Q&A Cards */}
              <div className="space-y-4">
                {/* Where does this go? */}
                <div className="bg-[#111213] rounded-xl border border-white/[0.06] p-6">
                  <div className="flex items-start gap-4">
                    {/* Image placeholder */}
                    <div className="w-24 h-24 rounded-lg bg-[#161718] border border-white/[0.04] flex-shrink-0 flex items-center justify-center">
                      <Globe className="w-10 h-10 text-white/20" strokeWidth={1} />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold font-heading text-lg mb-2">Where does this information go?</h3>
                      <p className="text-white/60 text-sm leading-relaxed">
                        Everything you add here becomes a public, structured data file on your Harbor profile page. 
                        It uses schema.org formatting - the same standard Google uses for rich search results. 
                        When AI crawlers visit your page, they can read this clean data instead of parsing messy HTML.
                      </p>
                    </div>
                  </div>
                </div>

                {/* When will AI see this? */}
                <div className="bg-[#111213] rounded-xl border border-white/[0.06] p-6">
                  <div className="flex items-start gap-4">
                    {/* Image placeholder */}
                    <div className="w-24 h-24 rounded-lg bg-[#161718] border border-white/[0.04] flex-shrink-0 flex items-center justify-center">
                      <Eye className="w-10 h-10 text-white/20" strokeWidth={1} />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold font-heading text-lg mb-2">When will AI see this?</h3>
                      <p className="text-white/60 text-sm leading-relaxed">
                        Your profile is live immediately after you save. AI platforms crawl the web regularly, and 
                        when they visit your Harbor page, they'll find structured data ready to index. The "AI Visits" 
                        section tracks when crawlers like GPTBot or PerplexityBot hit your page.
                      </p>
                    </div>
                  </div>
                </div>

                {/* What should I add? */}
                <div className="bg-[#111213] rounded-xl border border-white/[0.06] p-6">
                  <div className="flex items-start gap-4">
                    {/* Image placeholder */}
                    <div className="w-24 h-24 rounded-lg bg-[#161718] border border-white/[0.04] flex-shrink-0 flex items-center justify-center">
                      <Package className="w-10 h-10 text-white/20" strokeWidth={1} />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold font-heading text-lg mb-2">What should I add?</h3>
                      <p className="text-white/60 text-sm leading-relaxed mb-3">
                        Start with the basics: a clear description and category. Then add your products or services. 
                        FAQs are useful because they give AI specific answers to common questions instead of making it guess.
                      </p>
                      <p className="text-white/40 text-xs">
                        Focus on accuracy over marketing speak. AI does better with factual, specific information.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Why does this matter? */}
                <div className="bg-[#111213] rounded-xl border border-white/[0.06] p-6">
                  <div className="flex items-start gap-4">
                    {/* Image placeholder */}
                    <div className="w-24 h-24 rounded-lg bg-[#161718] border border-white/[0.04] flex-shrink-0 flex items-center justify-center">
                      <Zap className="w-10 h-10 text-white/20" strokeWidth={1} />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold font-heading text-lg mb-2">Why does this matter?</h3>
                      <p className="text-white/60 text-sm leading-relaxed">
                        AI models are increasingly used for product discovery and recommendations. Having clean, 
                        structured data available makes it easier for these systems to accurately represent your 
                        brand when users ask about your category or compare options.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="text-center py-6">
                <button
                  onClick={() => setActiveNav('brand')}
                  className="px-6 py-3 rounded-lg bg-white text-black font-medium hover:bg-white/90 transition-colors"
                >
                  Start building your profile
                </button>
              </div>
            </div>
          )}

          {/* Overview Section */}
          {activeNav === 'overview' && (
            <div className="space-y-6">
              {/* Progress Steps */}
              <div className="mb-2">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-white font-semibold font-heading text-lg">Build your AI profile</h2>
                    <p className="text-white/50 text-sm">Help AI understand and recommend your brand</p>
                  </div>
                  <span className="text-white/40 text-sm">{completedSteps}/3 complete</span>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  {steps.map((step, idx) => (
                    <button
                      key={step.id}
                      onClick={() => setActiveNav(idx === 0 ? 'brand' : idx === 1 ? 'products' : 'faqs')}
                      className={`p-5 rounded-xl border text-left transition-all ${
                        step.done 
                          ? 'bg-[#111213] border-blue-500/20 hover:border-blue-500/30' 
                          : 'bg-[#111213] border-white/[0.06] hover:border-white/[0.12]'
                      }`}
                    >
                      {/* Icon placeholder - upload 48x48 PNGs to /public/icons/ */}
                      <div className="w-14 h-14 rounded-xl bg-[#161718] border border-white/[0.06] mb-5 flex items-center justify-center overflow-hidden">
                        <Image
                          src={step.icon}
                          alt=""
                          width={48}
                          height={48}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            // Fallback if icon not found
                            (e.target as HTMLImageElement).style.display = 'none'
                          }}
                        />
                      </div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-medium ${step.done ? 'text-blue-400' : 'text-white/40'}`}>
                          Step {step.id}
                        </span>
                        {step.done && <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />}
                      </div>
                      <p className={`font-medium text-sm ${step.done ? 'text-white' : 'text-white/80'}`}>
                        {step.label}
                      </p>
                      <p className="text-white/40 text-xs mt-1">{step.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* AI Visits */}
              <div className="bg-[#111213] rounded-xl border border-white/[0.06] p-6">
                {/* Explainer */}
                <div className="flex items-start gap-3 p-4 rounded-lg bg-[#161718]/50 border border-white/[0.04] mb-6">
                  <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-white/70 text-sm">
                      When AI platforms like ChatGPT or Perplexity read your profile, their visits show up here. 
                      More visits means more chances to get recommended.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-semibold font-heading">AI Visits</h3>
                  <span className="text-white/30 text-xs">Last 30 days</span>
                </div>

                {/* Recharts Area Chart */}
                <div className="h-32 mb-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart 
                      data={(() => {
                        // Generate last 30 days of data (zeros for now - will be wired to real data)
                        const days = []
                        for (let i = 29; i >= 0; i--) {
                          const date = new Date()
                          date.setDate(date.getDate() - i)
                          days.push({
                            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                            fullDate: date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
                            total: 0,
                            chatgpt: 0,
                            claude: 0,
                            perplexity: 0,
                            gemini: 0
                          })
                        }
                        return days
                      })()}
                      margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                    >
                      <defs>
                        <linearGradient id="visitGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="rgba(99, 102, 241, 0.3)" />
                          <stop offset="100%" stopColor="rgba(99, 102, 241, 0)" />
                        </linearGradient>
                      </defs>
                      <XAxis 
                        dataKey="date" 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }}
                        interval={9}
                      />
                      <YAxis 
                        hide={true}
                        domain={[0, 10]}
                      />
                      <Tooltip 
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload
                            return (
                              <div className="bg-[#1A1F26] border border-white/[0.1] rounded-lg p-3 shadow-xl min-w-[150px]">
                                <p className="text-white/50 text-[10px] mb-2">{data.fullDate}</p>
                                <div className="space-y-1.5">
                                  {botVisits.map((bot) => {
                                    const key = bot.bot_label.toLowerCase().replace(' ', '')
                                    const count = data[key] || 0
                                    return (
                                      <div key={bot.bot_name} className="flex items-center gap-2">
                                        <Image src={bot.logo} alt="" width={14} height={14} className="rounded" />
                                        <span className="text-white/70 text-xs">{bot.bot_label}</span>
                                        <span className="text-white/40 text-xs ml-auto">{count}</span>
                                      </div>
                                    )
                                  })}
                                </div>
                              </div>
                            )
                          }
                          return null
                        }}
                        cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }}
                      />
                      <Area
                        type="monotone"
                        dataKey="total"
                        stroke="rgba(99, 102, 241, 0.6)"
                        strokeWidth={2}
                        fill="url(#visitGradient)"
                        dot={false}
                        activeDot={{ r: 4, fill: '#6366f1', stroke: '#1A1F26', strokeWidth: 2 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Platform grid */}
                <div className="grid grid-cols-4 gap-3">
                  {botVisits.map((bot) => (
                    <div 
                      key={bot.bot_name} 
                      className={`flex flex-col items-center p-3 rounded-lg border transition-colors ${
                        bot.visit_count > 0 
                          ? 'bg-[#161718] border-white/[0.08]' 
                          : 'bg-[#0B0B0C] border-white/[0.04]'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg overflow-hidden mb-2 ${
                        bot.visit_count === 0 ? 'opacity-30 grayscale' : ''
                      }`}>
                        <Image
                          src={bot.logo}
                          alt={bot.bot_label}
                          width={32}
                          height={32}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <span className={`text-xs ${bot.visit_count > 0 ? 'text-white/70' : 'text-white/30'}`}>
                        {bot.visit_count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Upgrade CTA */}
              <div className="bg-[#111213] rounded-xl border border-white/[0.06] p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[#161718] flex items-center justify-center">
                    <Zap className="w-5 h-5 text-white/50" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-semibold font-heading mb-1">Track AI mentions</h3>
                    <p className="text-white/50 text-sm mb-4">
                      See where AI recommends your brand. Monitor competitors. Get insights.
                    </p>
                    <div className="flex items-center gap-3">
                      <Link
                        href="/signup"
                        className="px-4 py-2 rounded-lg bg-white text-black text-sm font-medium hover:bg-white/90 transition-colors"
                      >
                        Start Free
                      </Link>
                      <Link href="/pricing" className="text-white/40 text-sm hover:text-white/60">
                        View plans
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Brand Info Section */}
          {activeNav === 'brand' && (
            <div className="space-y-6">
              <div className="bg-[#111213] rounded-xl border border-white/[0.06] p-6">
                <h3 className="text-white font-semibold font-heading mb-6">Brand Information</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-white/70 text-sm mb-2">One-liner</label>
                    <input
                      type="text"
                      value={oneLiner}
                      onChange={(e) => { setOneLiner(e.target.value); markChanged() }}
                      placeholder="A single sentence describing what you do"
                      className="w-full px-4 py-3 rounded-lg bg-[#161718] border border-white/[0.06] text-white placeholder-white/30 focus:outline-none focus:border-white/20 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-white/70 text-sm mb-2">Description</label>
                    <textarea
                      value={description}
                      onChange={(e) => { setDescription(e.target.value); markChanged() }}
                      placeholder="Tell AI more about your company..."
                      rows={4}
                      className="w-full px-4 py-3 rounded-lg bg-[#161718] border border-white/[0.06] text-white placeholder-white/30 focus:outline-none focus:border-white/20 transition-colors resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white/70 text-sm mb-2">Category</label>
                      <input
                        type="text"
                        value={category}
                        onChange={(e) => { setCategory(e.target.value); markChanged() }}
                        placeholder="e.g., SaaS, E-commerce"
                        className="w-full px-4 py-3 rounded-lg bg-[#161718] border border-white/[0.06] text-white placeholder-white/30 focus:outline-none focus:border-white/20 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-white/70 text-sm mb-2">Ideal Customer</label>
                      <input
                        type="text"
                        value={icp}
                        onChange={(e) => { setIcp(e.target.value); markChanged() }}
                        placeholder="Who do you serve?"
                        className="w-full px-4 py-3 rounded-lg bg-[#161718] border border-white/[0.06] text-white placeholder-white/30 focus:outline-none focus:border-white/20 transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#111213] rounded-xl border border-white/[0.06] p-6">
                <h3 className="text-white font-semibold font-heading mb-6">Company Details</h3>
                
                <div className="grid grid-cols-2 gap-4">
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
                    <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-[#0B0B0C] border border-white/[0.06]">
                      <span className="text-white/50">{brand.domain}</span>
                      <a href={`https://${brand.domain}`} target="_blank" rel="noopener noreferrer" className="ml-auto text-white/30 hover:text-white/60">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Products Section */}
          {activeNav === 'products' && (
            <div className="space-y-6">
              {/* Explainer */}
              <div className="flex items-start gap-3 p-4 rounded-lg bg-[#111213] border border-white/[0.06]">
                <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-white/70 text-sm mb-1">
                    <span className="text-white font-medium">Why add offerings?</span> When AI is asked what you offer, 
                    this data helps it give specific, accurate answers instead of vague descriptions.
                  </p>
                  <p className="text-white/40 text-xs">For services, pricing can be a range or "Contact for quote" - AI handles natural language.</p>
                </div>
              </div>

              <div className="bg-[#111213] rounded-xl border border-white/[0.06] p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-white font-semibold font-heading">Products & Services</h3>
                    <p className="text-white/50 text-sm mt-1">What you offer</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#161718] border border-white/[0.06] text-white/60 text-sm cursor-pointer hover:border-white/[0.12]">
                      <Upload className="w-4 h-4" />
                      CSV
                      <input type="file" accept=".csv" className="hidden" onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleCsvFile(file)
                        e.target.value = ''
                      }} />
                    </label>
                    <button
                      onClick={addProduct}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 text-white text-sm hover:bg-white/15"
                    >
                      <Plus className="w-4 h-4" />
                      Add
                    </button>
                  </div>
                </div>

                {offerings.length === 0 ? (
                  <div 
                    className="text-center py-16 border-2 border-dashed border-white/[0.1] rounded-xl"
                    onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('border-blue-500/50', 'bg-blue-500/5') }}
                    onDragLeave={(e) => { e.currentTarget.classList.remove('border-blue-500/50', 'bg-blue-500/5') }}
                    onDrop={(e) => {
                      e.preventDefault()
                      e.currentTarget.classList.remove('border-blue-500/50', 'bg-blue-500/5')
                      const file = e.dataTransfer.files[0]
                      if (file?.name.endsWith('.csv')) handleCsvFile(file)
                    }}
                  >
                    <Package className="w-12 h-12 text-white/30 mx-auto mb-3" strokeWidth={1} />
                    <p className="text-white/50 mb-1">No offerings yet</p>
                    <p className="text-white/30 text-sm mb-4">Add products, services, or both</p>
                    <button onClick={addProduct} className="text-blue-400 text-sm hover:text-blue-300">
                      Add your first offering
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {offerings.map((product, idx) => (
                      <div key={idx} className="p-4 rounded-lg bg-[#0B0B0C] border border-white/[0.06]">
                        <div className="flex gap-4">
                          <div className="flex-1 grid grid-cols-4 gap-3">
                            <input
                              type="text"
                              value={product.name}
                              onChange={(e) => updateProduct(idx, 'name', e.target.value)}
                              placeholder="Name"
                              className="px-3 py-2 rounded-lg bg-[#161718] border border-white/[0.06] text-white text-sm placeholder-white/30 focus:outline-none focus:border-white/20"
                            />
                            <select
                              value={product.type || 'product'}
                              onChange={(e) => updateProduct(idx, 'type', e.target.value)}
                              className="px-3 py-2 rounded-lg bg-[#161718] border border-white/[0.06] text-white text-sm focus:outline-none focus:border-white/20"
                            >
                              <option value="product">Product</option>
                              <option value="service">Service</option>
                              <option value="subscription">Subscription</option>
                            </select>
                            <input
                              type="text"
                              value={product.price || ''}
                              onChange={(e) => updateProduct(idx, 'price', e.target.value)}
                              placeholder={product.type === 'service' ? 'e.g. From $500 or Contact us' : 'Price'}
                              className="px-3 py-2 rounded-lg bg-[#161718] border border-white/[0.06] text-white text-sm placeholder-white/30 focus:outline-none focus:border-white/20"
                            />
                            <select
                              value={product.status || 'active'}
                              onChange={(e) => updateProduct(idx, 'status', e.target.value)}
                              className="px-3 py-2 rounded-lg bg-[#161718] border border-white/[0.06] text-white text-sm focus:outline-none focus:border-white/20"
                            >
                              <option value="active">Active</option>
                              <option value="inactive">Inactive</option>
                              <option value="discontinued">Discontinued</option>
                            </select>
                          </div>
                          <button
                            onClick={() => removeProduct(idx)}
                            className="p-2 text-white/30 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <textarea
                          value={product.description}
                          onChange={(e) => updateProduct(idx, 'description', e.target.value)}
                          placeholder="Brief description..."
                          rows={2}
                          className="w-full mt-3 px-3 py-2 rounded-lg bg-[#161718] border border-white/[0.06] text-white text-sm placeholder-white/30 focus:outline-none focus:border-white/20 resize-none"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* FAQs Section */}
          {activeNav === 'faqs' && (
            <div className="space-y-6">
              {/* Explainer */}
              <div className="flex items-start gap-3 p-4 rounded-lg bg-[#111213] border border-white/[0.06]">
                <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-white/70 text-sm mb-1">
                    <span className="text-white font-medium">Why add FAQs?</span> AI models use these to answer specific questions about your brand. 
                    Without FAQs, AI might guess or say "I don't know" when asked about your policies, features, or processes.
                  </p>
                  <p className="text-white/40 text-xs">Think about what customers commonly ask you. Those are your FAQs.</p>
                </div>
              </div>

              <div className="bg-[#111213] rounded-xl border border-white/[0.06] p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-white font-semibold font-heading">FAQs</h3>
                    <p className="text-white/50 text-sm mt-1">Help AI answer questions accurately</p>
                  </div>
                  <button
                    onClick={addFaq}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 text-white text-sm hover:bg-white/15"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                </div>

                {faqs.length === 0 ? (
                  <div className="text-center py-16 border-2 border-dashed border-white/[0.1] rounded-xl">
                    <HelpCircle className="w-12 h-12 text-white/30 mx-auto mb-3" strokeWidth={1} />
                    <p className="text-white/50 mb-1">No FAQs yet</p>
                    <p className="text-white/30 text-sm mb-4">Add common questions about your brand</p>
                    <button onClick={addFaq} className="text-blue-400 text-sm hover:text-blue-300">
                      Add your first FAQ
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {faqs.map((faq, idx) => (
                      <div key={idx} className="p-4 rounded-lg bg-[#0B0B0C] border border-white/[0.06]">
                        <div className="flex gap-4">
                          <div className="flex-1 space-y-3">
                            <input
                              type="text"
                              value={faq.question}
                              onChange={(e) => updateFaq(idx, 'question', e.target.value)}
                              placeholder="Question"
                              className="w-full px-3 py-2 rounded-lg bg-[#161718] border border-white/[0.06] text-white text-sm placeholder-white/30 focus:outline-none focus:border-white/20"
                            />
                            <textarea
                              value={faq.answer}
                              onChange={(e) => updateFaq(idx, 'answer', e.target.value)}
                              placeholder="Answer"
                              rows={2}
                              className="w-full px-3 py-2 rounded-lg bg-[#161718] border border-white/[0.06] text-white text-sm placeholder-white/30 focus:outline-none focus:border-white/20 resize-none"
                            />
                          </div>
                          <button
                            onClick={() => removeFaq(idx)}
                            className="p-2 h-fit text-white/30 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Floating Save Bar - only on editable sections */}
        {hasChanges && (activeNav === 'brand' || activeNav === 'products' || activeNav === 'faqs') && (
          <div className="sticky bottom-0 left-0 right-0 p-4 bg-[#0B0B0C]/95 backdrop-blur border-t border-white/[0.06]">
            <div className="max-w-4xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-2">
                {message && (
                  <span className={`text-sm ${message.type === 'success' ? 'text-blue-400' : 'text-red-400'}`}>
                    {message.text}
                  </span>
                )}
                {!message && <span className="text-white/40 text-sm">Unsaved changes</span>}
              </div>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white text-black font-medium text-sm hover:bg-white/90 transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Right Sidebar - The Actual JSON Feed - Fixed */}
      <aside className="w-[360px] border-l border-white/[0.06] flex flex-col bg-[#0B0B0C] flex-shrink-0 h-screen overflow-hidden">
        <div className="p-4 border-b border-white/[0.06] flex items-center justify-between">
          <div>
            <h2 className="text-white font-semibold text-sm font-heading">Your AI Profile</h2>
            <p className="text-white/40 text-xs mt-0.5">The schema AI models read</p>
          </div>
          <Link
            href={`/brands/${brand.slug}/harbor.json`}
            target="_blank"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#111213] border border-white/[0.06] hover:border-white/[0.12] text-white/50 text-xs transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            View Profile
          </Link>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
          <pre className="text-xs font-mono leading-relaxed text-white/70 whitespace-pre-wrap break-words">
            <code>{JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Organization",
  name: brand.brand_name,
  url: `https://${brand.domain}`,
  description: description || undefined,
  slogan: oneLiner || undefined,
  ...(companyInfo?.founded_year && { foundingDate: String(companyInfo.founded_year) }),
  ...(companyInfo?.hq_location && {
    address: {
      "@type": "PostalAddress",
      addressLocality: companyInfo.hq_location
    }
  }),
  ...(companyInfo?.employee_band && {
    numberOfEmployees: {
      "@type": "QuantitativeValue",
      value: companyInfo.employee_band
    }
  }),
  ...(category && { industry: category }),
  ...(icp && { audience: icp }),
  ...(offerings.length > 0 && {
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      itemListElement: offerings
        .filter(o => o.status !== 'discontinued')
        .map(o => ({
          "@type": "Offer",
          name: o.name,
          description: o.description,
          ...(o.price && { price: o.price })
        }))
    }
  }),
  ...(faqs.length > 0 && {
    mainEntity: {
      "@type": "FAQPage",
      mainEntity: faqs.map(f => ({
        "@type": "Question",
        name: f.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: f.answer
        }
      }))
    }
  })
}, null, 2)}</code>
          </pre>
        </div>

        <div className="p-4 border-t border-white/[0.06]">
          <p className="text-white/30 text-xs">
            Available at <span className="font-mono text-white/50">/brands/{brand.slug}/harbor.json</span>
          </p>
        </div>
      </aside>

      {/* CSV Preview Modal */}
      {csvPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setCsvPreview(null)} />
          <div className="relative bg-[#111213] rounded-xl border border-white/[0.06] w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-white/[0.06]">
              <h3 className="text-white font-semibold">Import Products</h3>
              <p className="text-white/50 text-sm mt-1">{csvPreview.rows.length} products found</p>
            </div>

            <div className="p-6 border-b border-white/[0.06]">
              <p className="text-white/40 text-xs uppercase mb-3">Column Mapping</p>
              <div className="grid grid-cols-4 gap-3">
                {(['name', 'price', 'description', 'status'] as const).map((field) => (
                  <div key={field}>
                    <label className="block text-white/50 text-xs mb-1 capitalize">{field}</label>
                    <select
                      value={csvPreview.mapping[field]}
                      onChange={(e) => setCsvPreview({
                        ...csvPreview,
                        mapping: { ...csvPreview.mapping, [field]: e.target.value }
                      })}
                      className="w-full px-2 py-1.5 rounded bg-[#161718] border border-white/[0.06] text-white text-sm"
                    >
                      <option value="">Skip</option>
                      {csvPreview.columns.map(col => (
                        <option key={col} value={col}>{col}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 max-h-[200px] overflow-y-auto">
              <p className="text-white/40 text-xs uppercase mb-3">Preview</p>
              <div className="space-y-2">
                {csvPreview.rows.slice(0, 5).map((row, i) => (
                  <div key={i} className="flex gap-4 text-sm">
                    <span className="text-white truncate flex-1">{row[csvPreview.mapping.name] || '-'}</span>
                    <span className="text-white/50 w-20">{row[csvPreview.mapping.price] || '-'}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 border-t border-white/[0.06] flex justify-end gap-3">
              <button onClick={() => setCsvPreview(null)} className="px-4 py-2 text-white/60 text-sm hover:text-white">
                Cancel
              </button>
              <button
                onClick={importCsvProducts}
                disabled={!csvPreview.mapping.name}
                className="px-4 py-2 rounded-lg bg-white text-black text-sm font-medium hover:bg-white/90 disabled:opacity-50"
              >
                Import {csvPreview.rows.filter(r => r[csvPreview.mapping.name]).length} Products
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}