// apps/web/app/dashboard/brand-settings/page.tsx

'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  Building2, Upload, X, Plus, Save, CheckCircle, 
  Package, Target, Globe, Linkedin, Twitter, Facebook, 
  Instagram, ExternalLink, TrendingUp, AlertCircle, FileText, Info
} from 'lucide-react'
import { useBrand } from '@/contexts/BrandContext'
import MobileHeader from '@/components/layout/MobileHeader'

interface BrandSettings {
  logo_url: string | null
  brand_name: string
  domain: string
  category: string
  description: string
  founding_year: string
  headquarters: string
  products: string[]
  competitors: string[]
  social_links: {
    linkedin?: string
    twitter?: string
    facebook?: string
    instagram?: string
    crunchbase?: string
    wikipedia?: string
    press_kit?: string
  }
  target_keywords: string[]
}

interface ReadinessChecklist {
  brand_name: boolean
  domain: boolean
  logo: boolean
  description: boolean
  category: boolean
  headquarters: boolean
  founding_year: boolean
  one_product: boolean
  three_products: boolean
  one_competitor: boolean
  three_keywords: boolean
  one_social: boolean
}

// Tooltip Component
function Tooltip({ children, content }: { children: React.ReactNode; content: string }) {
  const [show, setShow] = useState(false)
  
  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        className="cursor-help"
      >
        {children}
      </div>
      {show && (
        <div className="absolute z-50 left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-[#121A24] dark:bg-[#0E1623] border border-[#FF6B4A]/50 rounded-lg shadow-xl whitespace-nowrap animate-in fade-in duration-150">
          <p className="text-xs font-body text-[#F4F6F8]">{content}</p>
          <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-[#FF6B4A]/50"></div>
        </div>
      )}
    </div>
  )
}

// Generate lettermark from brand name
function generateLettermark(name: string): string {
  if (!name) return '?'
  const words = name.trim().split(/\s+/)
  if (words.length === 1) return words[0].substring(0, 2).toUpperCase()
  return (words[0][0] + words[1][0]).toUpperCase()
}

// Generate color from brand name hash (muted palette)
function generateColorFromName(name: string): string {
  const colors = [
    '#2979FF', '#00C6B7', '#FF6B4A', '#9C27B0', 
    '#4CAF50', '#FF9800', '#E91E63', '#00BCD4'
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

export default function BrandSettingsPage() {
  const { currentDashboard } = useBrand()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [settings, setSettings] = useState<BrandSettings>({
    logo_url: null,
    brand_name: '',
    domain: '',
    category: '',
    description: '',
    founding_year: '',
    headquarters: '',
    products: [],
    competitors: [],
    social_links: {},
    target_keywords: []
  })
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [newProduct, setNewProduct] = useState('')
  const [newCompetitor, setNewCompetitor] = useState('')
  const [newKeyword, setNewKeyword] = useState('')

  useEffect(() => {
    async function loadSettings() {
      if (!currentDashboard) {
        setLoading(false)
        return
      }

      try {
        setSettings({
          logo_url: currentDashboard.logo_url || null,
          brand_name: currentDashboard.brand_name || '',
          domain: currentDashboard.domain || '',
          category: currentDashboard.metadata?.category || '',
          description: currentDashboard.metadata?.description || '',
          founding_year: currentDashboard.metadata?.founding_year || '',
          headquarters: currentDashboard.metadata?.headquarters || '',
          products: currentDashboard.metadata?.products || [],
          competitors: currentDashboard.metadata?.competitors || [],
          social_links: currentDashboard.metadata?.social_links || {},
          target_keywords: currentDashboard.metadata?.target_keywords || []
        })
      } catch (error) {
        console.error('Error loading settings:', error)
      } finally {
        setLoading(false)
      }
    }

    loadSettings()
  }, [currentDashboard])

  // Calculate AI Readiness Score
  const calculateReadiness = (): { score: number; checklist: ReadinessChecklist; itemsRemaining: number } => {
    const checklist: ReadinessChecklist = {
      brand_name: !!settings.brand_name,
      domain: !!settings.domain,
      logo: !!settings.logo_url,
      description: settings.description.length >= 50,
      category: !!settings.category,
      headquarters: !!settings.headquarters,
      founding_year: !!settings.founding_year,
      one_product: settings.products.length >= 1,
      three_products: settings.products.length >= 3,
      one_competitor: settings.competitors.length >= 1,
      three_keywords: settings.target_keywords.length >= 3,
      one_social: Object.values(settings.social_links).some(v => !!v)
    }

    const weights = {
      brand_name: 10,
      domain: 10,
      logo: 8,
      description: 10,
      category: 8,
      headquarters: 6,
      founding_year: 6,
      one_product: 10,
      three_products: 8,
      one_competitor: 8,
      three_keywords: 8,
      one_social: 8
    }

    const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0)
    const earnedWeight = Object.entries(checklist).reduce((sum, [key, completed]) => {
      return sum + (completed ? weights[key as keyof typeof weights] : 0)
    }, 0)

    const score = Math.round((earnedWeight / totalWeight) * 100)
    const itemsRemaining = Object.values(checklist).filter(v => !v).length

    return { score, checklist, itemsRemaining }
  }

  const { score, itemsRemaining } = calculateReadiness()

  const handleSave = async () => {
    if (!currentDashboard) return
    
    setSaving(true)
    setSaveSuccess(false)

    try {
      const response = await fetch('/api/dashboard/update-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dashboardId: currentDashboard.id,
          settings
        })
      })

      if (!response.ok) throw new Error('Failed to save')

      setSaveSuccess(true)
      setHasChanges(false)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (error) {
      console.error('Save error:', error)
      alert('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const objectUrl = URL.createObjectURL(file)
    setSettings({ ...settings, logo_url: objectUrl })
    setHasChanges(true)
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const addProduct = () => {
    if (!newProduct.trim()) return
    setSettings({
      ...settings,
      products: [...settings.products, newProduct.trim()]
    })
    setNewProduct('')
    setHasChanges(true)
  }

  const removeProduct = (index: number) => {
    setSettings({
      ...settings,
      products: settings.products.filter((_, i) => i !== index)
    })
    setHasChanges(true)
  }

  const addCompetitor = () => {
    if (!newCompetitor.trim() || settings.competitors.length >= 5) return
    setSettings({
      ...settings,
      competitors: [...settings.competitors, newCompetitor.trim()]
    })
    setNewCompetitor('')
    setHasChanges(true)
  }

  const removeCompetitor = (index: number) => {
    setSettings({
      ...settings,
      competitors: settings.competitors.filter((_, i) => i !== index)
    })
    setHasChanges(true)
  }

  const addKeyword = () => {
    if (!newKeyword.trim() || settings.target_keywords.length >= 10) return
    setSettings({
      ...settings,
      target_keywords: [...settings.target_keywords, newKeyword.trim()]
    })
    setNewKeyword('')
    setHasChanges(true)
  }

  const removeKeyword = (index: number) => {
    setSettings({
      ...settings,
      target_keywords: settings.target_keywords.filter((_, i) => i !== index)
    })
    setHasChanges(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F9FB] dark:bg-[#0E1623] flex items-center justify-center">
        <div className="text-[#444D59] dark:text-[#F4F6F8] font-body">Loading brand settings...</div>
      </div>
    )
  }

  const lettermark = generateLettermark(settings.brand_name)
  const lettermarkColor = generateColorFromName(settings.brand_name)

  return (
    <>
      <MobileHeader />
      
      <div className="min-h-screen bg-[#F7F9FB] dark:bg-[#0E1623] px-6 py-8 lg:px-12 lg:py-12">
        {/* Header Section */}
        <div className="max-w-7xl mx-auto mb-8">
          <h1 className="text-4xl font-heading font-bold text-[#0F1C2E] dark:text-white mb-3 tracking-tight" style={{ letterSpacing: '-0.02em' }}>
            Brand Dashboard
          </h1>
          <p className="text-base font-body text-[#444D59] dark:text-[#F4F6F8]/75">
            Manage your brand identity and power Harbor AI intelligence.
          </p>
        </div>

        {/* AI Readiness Card - HORIZONTAL LAYOUT (Dashboard Redesign 3) */}
        <div className="max-w-7xl mx-auto mb-12">
          <div className="bg-white dark:bg-[#162234] rounded-xl border border-[#E5E7EB] dark:border-white/6 shadow-sm p-8">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
              
              {/* LEFT: Avatar + 270° Partial Ring */}
              <div className="flex-shrink-0">
                <div className="relative w-20 h-20 lg:w-24 lg:h-24">
                  {/* Ring SVG - 270° arc (feels premium, avoids "gaming UI") */}
                  <svg className="w-full h-full -rotate-90">
                    {/* Base track */}
                    <circle
                      cx="48"
                      cy="48"
                      r="44"
                      stroke="currentColor"
                      className="text-[#E5E7EB] dark:text-white/6"
                      strokeWidth="6"
                      fill="none"
                    />
                    {/* Progress ring - Harbor teal #2BCFCC */}
                    <circle
                      cx="48"
                      cy="48"
                      r="44"
                      stroke="#2BCFCC"
                      strokeWidth="6"
                      fill="none"
                      strokeDasharray={`${(score / 100) * 265} 276.46`}
                      strokeLinecap="round"
                      className="transition-all duration-500"
                    />
                  </svg>
                  
                  {/* Avatar: logo or lettermark fallback */}
                  <div className="absolute inset-[6px] rounded-full overflow-hidden bg-white dark:bg-[#0E1623] flex items-center justify-center border-2 border-white dark:border-[#162234]">
                    {settings.logo_url ? (
                      <img 
                        src={settings.logo_url} 
                        alt="Brand logo" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div 
                        className="w-full h-full flex items-center justify-center text-white font-heading font-bold text-xl"
                        style={{ backgroundColor: lettermarkColor }}
                      >
                        {lettermark}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* MIDDLE: Score + Messaging */}
              <div className="flex-1">
                <h3 className="text-sm font-body text-[#444D59] dark:text-[#F4F6F8]/60 uppercase tracking-wide mb-1">
                  AI Readiness Profile
                </h3>
                <div className="flex items-baseline gap-3 mb-2">
                  <span className="text-5xl font-heading font-bold text-[#0F1C2E] dark:text-white">
                    {score}%
                  </span>
                </div>
                <p className="text-sm font-body text-[#444D59] dark:text-[#F4F6F8]/75 mb-3">
                  Your profile helps Harbor analyze your brand with higher accuracy.
                </p>
                <p className="text-xs font-body text-[#444D59] dark:text-[#F4F6F8]/50">
                  {score}% complete – {itemsRemaining} {itemsRemaining === 1 ? 'item' : 'items'} remaining
                </p>
                
                {/* Missing description nudge */}
                {!settings.description && (
                  <div className="mt-3 flex items-center gap-2 text-xs font-body text-[#FF6B4A]">
                    <AlertCircle className="w-4 h-4" strokeWidth={2} />
                    <span>Add your brand description to improve AI structuring</span>
                  </div>
                )}
              </div>

              {/* RIGHT: Actions (no coral, outline button) */}
              <div className="flex-shrink-0">
                <button className="px-4 py-2 text-sm font-body text-[#2979FF] hover:text-[#1e5fd9] border border-[#2979FF]/20 hover:border-[#2979FF]/40 rounded-lg transition-colors">
                  View Checklist
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="max-w-7xl mx-auto space-y-12">
          
          {/* SECTION 1: Brand Identity */}
          <section className="bg-white dark:bg-[#162234] rounded-xl border border-[#E5E7EB] dark:border-white/6 shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-[#E5E7EB] dark:border-white/6">
              <div className="flex items-center gap-3">
                <Building2 className="w-6 h-6 text-[#00C6B7]" strokeWidth={1.5} />
                <h2 className="text-2xl font-heading font-semibold text-[#0F1C2E] dark:text-white">Brand Identity</h2>
              </div>
              <p className="text-sm font-body text-[#444D59] dark:text-[#F4F6F8]/60 mt-2">
                Core details used to understand your brand.
              </p>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Logo Upload - Intentional Drop Zone */}
                <div className="lg:col-span-1">
                  <div 
                    onClick={triggerFileInput}
                    className="relative bg-[#F7F9FB] dark:bg-[#0E1623] rounded-lg border-2 border-dashed border-[#E3E5E8] dark:border-white/10 p-6 h-full flex flex-col items-center justify-center text-center transition-all hover:border-[#00C6B7] dark:hover:border-[#2BCFCC] group cursor-pointer"
                    style={{
                      backgroundImage: 'radial-gradient(circle, rgba(0,198,183,0.03) 1px, transparent 1px)',
                      backgroundSize: '16px 16px'
                    }}
                  >
                    {settings.logo_url ? (
                      <div className="w-full">
                        <img 
                          src={settings.logo_url} 
                          alt="Brand logo" 
                          className="w-32 h-32 object-contain mx-auto mb-4 rounded-lg"
                        />
                        <button className="text-sm font-body text-[#2979FF] hover:text-[#FF6B4A] transition-colors">
                          Change Logo
                        </button>
                      </div>
                    ) : (
                      <div className="w-full">
                        <div className="w-32 h-32 mx-auto mb-4 bg-white dark:bg-[#162234] rounded-lg border border-[#E5E7EB] dark:border-white/5 flex items-center justify-center group-hover:border-[#00C6B7] dark:group-hover:border-[#2BCFCC] transition-colors">
                          <Upload className="w-12 h-12 text-[#444D59]/30 dark:text-[#F4F6F8]/20 group-hover:text-[#00C6B7] dark:group-hover:text-[#2BCFCC] transition-colors" strokeWidth={1.5} />
                        </div>
                        <button className="inline-flex items-center gap-2 px-4 py-2 bg-[#FF6B4A] hover:bg-[#FF7A59] text-white font-body text-sm rounded-lg transition-all">
                          <Upload className="w-4 h-4" strokeWidth={2} />
                          Upload Logo
                        </button>
                        <p className="text-xs font-body text-[#444D59] dark:text-[#F4F6F8]/40 mt-3">
                          PNG or JPG, max 2MB
                        </p>
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Core Info Fields - Two Columns */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-body text-[#444D59] dark:text-[#F4F6F8]/75 uppercase tracking-wide mb-2">
                        Brand Name
                      </label>
                      <input
                        type="text"
                        value={settings.brand_name}
                        onChange={(e) => {
                          setSettings({ ...settings, brand_name: e.target.value })
                          setHasChanges(true)
                        }}
                        className="w-full px-4 py-3 bg-white dark:bg-[#0F1B2C] border border-[#E3E5E8] dark:border-white/10 rounded-lg text-[#0F1C2E] dark:text-white font-body text-sm focus:outline-none focus:border-[#FF6B4A] transition-colors"
                        placeholder="Your brand name"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-body text-[#444D59] dark:text-[#F4F6F8]/75 uppercase tracking-wide mb-2">
                        Primary Domain
                      </label>
                      <input
                        type="text"
                        value={settings.domain}
                        onChange={(e) => {
                          setSettings({ ...settings, domain: e.target.value })
                          setHasChanges(true)
                        }}
                        className="w-full px-4 py-3 bg-white dark:bg-[#0F1B2C] border border-[#E3E5E8] dark:border-white/10 rounded-lg text-[#0F1C2E] dark:text-white font-body text-sm focus:outline-none focus:border-[#FF6B4A] transition-colors"
                        placeholder="yourbrand.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-body text-[#444D59] dark:text-[#F4F6F8]/75 uppercase tracking-wide mb-2">
                        Industry
                      </label>
                      <input
                        type="text"
                        value={settings.category}
                        onChange={(e) => {
                          setSettings({ ...settings, category: e.target.value })
                          setHasChanges(true)
                        }}
                        className="w-full px-4 py-3 bg-white dark:bg-[#0F1B2C] border border-[#E3E5E8] dark:border-white/10 rounded-lg text-[#0F1C2E] dark:text-white font-body text-sm focus:outline-none focus:border-[#FF6B4A] transition-colors"
                        placeholder="E.g. Business Credit Cards, SaaS Tools"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-body text-[#444D59] dark:text-[#F4F6F8]/75 uppercase tracking-wide mb-2">
                        Founding Year
                      </label>
                      <input
                        type="text"
                        value={settings.founding_year}
                        onChange={(e) => {
                          setSettings({ ...settings, founding_year: e.target.value })
                          setHasChanges(true)
                        }}
                        className="w-full px-4 py-3 bg-white dark:bg-[#0F1B2C] border border-[#E3E5E8] dark:border-white/10 rounded-lg text-[#0F1C2E] dark:text-white font-body text-sm focus:outline-none focus:border-[#FF6B4A] transition-colors"
                        placeholder="2020"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-body text-[#444D59] dark:text-[#F4F6F8]/75 uppercase tracking-wide mb-2">
                      Headquarters
                    </label>
                    <input
                      type="text"
                      value={settings.headquarters}
                      onChange={(e) => {
                        setSettings({ ...settings, headquarters: e.target.value })
                        setHasChanges(true)
                      }}
                      className="w-full px-4 py-3 bg-white dark:bg-[#0F1B2C] border border-[#E3E5E8] dark:border-white/10 rounded-lg text-[#0F1C2E] dark:text-white font-body text-sm focus:outline-none focus:border-[#FF6B4A] transition-colors"
                      placeholder="San Francisco, CA"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-body text-[#444D59] dark:text-[#F4F6F8]/75 uppercase tracking-wide mb-2">
                      Brand Description
                    </label>
                    <textarea
                      value={settings.description}
                      onChange={(e) => {
                        setSettings({ ...settings, description: e.target.value })
                        setHasChanges(true)
                      }}
                      rows={4}
                      className="w-full px-4 py-3 bg-white dark:bg-[#0F1B2C] border border-[#E3E5E8] dark:border-white/10 rounded-lg text-[#0F1C2E] dark:text-white font-body text-sm focus:outline-none focus:border-[#FF6B4A] transition-colors resize-none"
                      placeholder="Brief description of what your brand does and stands for. Minimum 50 characters."
                    />
                    <div className="mt-2 text-xs font-body text-[#444D59] dark:text-[#F4F6F8]/40">
                      {settings.description.length} / 50 characters minimum
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 2: Products & Services */}
          <section className="bg-white dark:bg-[#162234] rounded-xl border border-[#E5E7EB] dark:border-white/6 shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-[#E5E7EB] dark:border-white/6">
              <div className="flex items-center gap-3">
                <Package className="w-6 h-6 text-[#00C6B7]" strokeWidth={1.5} />
                <h2 className="text-2xl font-heading font-semibold text-[#0F1C2E] dark:text-white">Products & Services</h2>
                <Tooltip content="Used to understand your category footprint across AI models.">
                  <Info className="w-4 h-4 text-[#444D59] dark:text-[#F4F6F8]/50" strokeWidth={2} />
                </Tooltip>
              </div>
              <p className="text-sm font-body text-[#444D59] dark:text-[#F4F6F8]/60 mt-2">
                Add products to improve category coverage in AI responses.
              </p>
            </div>

            <div className="p-8">
              <div className="flex gap-3 mb-6">
                <input
                  type="text"
                  value={newProduct}
                  onChange={(e) => setNewProduct(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addProduct()}
                  className="flex-1 px-4 py-3 bg-white dark:bg-[#0F1B2C] border border-[#E3E5E8] dark:border-white/10 rounded-lg text-[#0F1C2E] dark:text-white font-body text-sm focus:outline-none focus:border-[#FF6B4A] transition-colors"
                  placeholder="Product or service name"
                />
                <button
                  onClick={addProduct}
                  className="px-6 py-3 bg-[#FF6B4A] hover:bg-[#FF7A59] text-white font-body font-medium text-sm rounded-lg transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" strokeWidth={2} />
                  Add
                </button>
              </div>

              {settings.products.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {settings.products.map((product, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between px-4 py-3 bg-[#F7F9FB] dark:bg-[#0E1623] border border-[#E5E7EB] dark:border-white/5 rounded-lg group hover:border-[#00C6B7] dark:hover:border-[#2BCFCC] transition-all"
                    >
                      <span className="text-sm font-body text-[#0F1C2E] dark:text-white">{product}</span>
                      <button
                        onClick={() => removeProduct(index)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        <X className="w-4 h-4 text-[#444D59] dark:text-[#F4F6F8]/60 hover:text-[#FF6B4A]" strokeWidth={2} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-[#F7F9FB] dark:bg-[#0E1623] rounded-lg border border-[#E5E7EB] dark:border-white/5">
                  <Package className="w-12 h-12 text-[#444D59]/20 dark:text-[#F4F6F8]/10 mx-auto mb-4" strokeWidth={1.5} />
                  <p className="text-sm font-body text-[#444D59] dark:text-[#F4F6F8]/60 mb-1">
                    No products added yet.
                  </p>
                  <p className="text-xs font-body text-[#444D59] dark:text-[#F4F6F8]/40">
                    Adding at least one helps Harbor understand your category coverage.
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* SECTION 3: Competitors to Track */}
          <section className="bg-white dark:bg-[#162234] rounded-xl border border-[#E5E7EB] dark:border-white/6 shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-[#E5E7EB] dark:border-white/6">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-6 h-6 text-[#2979FF]" strokeWidth={1.5} />
                <h2 className="text-2xl font-heading font-semibold text-[#0F1C2E] dark:text-white">Competitors to Track</h2>
                <Tooltip content="Helps Harbor benchmark your model coverage and mentions.">
                  <Info className="w-4 h-4 text-[#444D59] dark:text-[#F4F6F8]/50" strokeWidth={2} />
                </Tooltip>
              </div>
              <p className="text-sm font-body text-[#444D59] dark:text-[#F4F6F8]/60 mt-2">
                Track up to 5 competitors to compare category coverage.
              </p>
            </div>

            <div className="p-8">
              <div className="flex gap-3 mb-6">
                <input
                  type="text"
                  value={newCompetitor}
                  onChange={(e) => setNewCompetitor(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addCompetitor()}
                  disabled={settings.competitors.length >= 5}
                  className="flex-1 px-4 py-3 bg-white dark:bg-[#0F1B2C] border border-[#E3E5E8] dark:border-white/10 rounded-lg text-[#0F1C2E] dark:text-white font-body text-sm focus:outline-none focus:border-[#FF6B4A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Competitor name"
                />
                <button
                  onClick={addCompetitor}
                  disabled={settings.competitors.length >= 5}
                  className="px-6 py-3 bg-[#FF6B4A] hover:bg-[#FF7A59] disabled:bg-[#E5E7EB] dark:disabled:bg-white/10 disabled:cursor-not-allowed text-white font-body font-medium text-sm rounded-lg transition-all flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" strokeWidth={2} />
                  Add
                </button>
              </div>

              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-body text-[#444D59] dark:text-[#F4F6F8]/50">
                  {settings.competitors.length} / 5 competitors
                </span>
              </div>

              {settings.competitors.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {settings.competitors.map((competitor, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between px-4 py-3 bg-[#F7F9FB] dark:bg-[#0E1623] border border-[#E5E7EB] dark:border-white/5 rounded-lg group hover:border-[#2979FF] transition-all"
                    >
                      <span className="text-sm font-body text-[#0F1C2E] dark:text-white">{competitor}</span>
                      <button
                        onClick={() => removeCompetitor(index)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        <X className="w-4 h-4 text-[#444D59] dark:text-[#F4F6F8]/60 hover:text-[#FF6B4A]" strokeWidth={2} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-[#F7F9FB] dark:bg-[#0E1623] rounded-lg border border-[#E5E7EB] dark:border-white/5">
                  <TrendingUp className="w-12 h-12 text-[#444D59]/20 dark:text-[#F4F6F8]/10 mx-auto mb-4" strokeWidth={1.5} />
                  <p className="text-sm font-body text-[#444D59] dark:text-[#F4F6F8]/60 mb-1">
                    No competitors tracked yet.
                  </p>
                  <p className="text-xs font-body text-[#444D59] dark:text-[#F4F6F8]/40">
                    Add at least one competitor to enable industry comparison.
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* SECTION 4: Target Keywords */}
          <section className="bg-white dark:bg-[#162234] rounded-xl border border-[#E5E7EB] dark:border-white/6 shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-[#E5E7EB] dark:border-white/6">
              <div className="flex items-center gap-3">
                <Target className="w-6 h-6 text-[#FF6B4A]" strokeWidth={1.5} />
                <h2 className="text-2xl font-heading font-semibold text-[#0F1C2E] dark:text-white">Target Keywords</h2>
                <Tooltip content="Signals associated with your brand in AI reasoning.">
                  <Info className="w-4 h-4 text-[#444D59] dark:text-[#F4F6F8]/50" strokeWidth={2} />
                </Tooltip>
              </div>
              <p className="text-sm font-body text-[#444D59] dark:text-[#F4F6F8]/60 mt-2">
                Signals your brand is commonly associated with or should be.
              </p>
            </div>

            <div className="p-8">
              <div className="flex gap-3 mb-6">
                <input
                  type="text"
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
                  disabled={settings.target_keywords.length >= 10}
                  className="flex-1 px-4 py-3 bg-white dark:bg-[#0F1B2C] border border-[#E3E5E8] dark:border-white/10 rounded-lg text-[#0F1C2E] dark:text-white font-body text-sm focus:outline-none focus:border-[#FF6B4A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Keyword or phrase"
                />
                <button
                  onClick={addKeyword}
                  disabled={settings.target_keywords.length >= 10}
                  className="px-6 py-3 bg-[#FF6B4A] hover:bg-[#FF7A59] disabled:bg-[#E5E7EB] dark:disabled:bg-white/10 disabled:cursor-not-allowed text-white font-body font-medium text-sm rounded-lg transition-all flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" strokeWidth={2} />
                  Add
                </button>
              </div>

              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-body text-[#444D59] dark:text-[#F4F6F8]/50">
                  {settings.target_keywords.length} / 10 keywords
                </span>
              </div>

              {settings.target_keywords.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {settings.target_keywords.map((keyword, index) => (
                    <div
                      key={index}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-[#F7F9FB] dark:bg-[#0E1623] border border-[#E5E7EB] dark:border-white/5 rounded-full group hover:border-[#FF6B4A] transition-all"
                    >
                      <span className="text-sm font-body text-[#0F1C2E] dark:text-white">{keyword}</span>
                      <button
                        onClick={() => removeKeyword(index)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5 text-[#444D59] dark:text-[#F4F6F8]/60 hover:text-[#FF6B4A]" strokeWidth={2} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-[#F7F9FB] dark:bg-[#0E1623] rounded-lg border border-[#E5E7EB] dark:border-white/5">
                  <Target className="w-12 h-12 text-[#444D59]/20 dark:text-[#F4F6F8]/10 mx-auto mb-4" strokeWidth={1.5} />
                  <p className="text-sm font-body text-[#444D59] dark:text-[#F4F6F8]/60 mb-1">
                    No keywords added yet.
                  </p>
                  <p className="text-xs font-body text-[#444D59] dark:text-[#F4F6F8]/40">
                    Harbor uses these when analyzing AI conversation topics.
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* SECTION 5: Social & Authority Links */}
          <section className="bg-white dark:bg-[#162234] rounded-xl border border-[#E5E7EB] dark:border-white/6 shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-[#E5E7EB] dark:border-white/6">
              <div className="flex items-center gap-3">
                <Globe className="w-6 h-6 text-[#00C6B7]" strokeWidth={1.5} />
                <h2 className="text-2xl font-heading font-semibold text-[#0F1C2E] dark:text-white">Social & Authority Links</h2>
                <Tooltip content="Used for schema enrichment and brand verification.">
                  <Info className="w-4 h-4 text-[#444D59] dark:text-[#F4F6F8]/50" strokeWidth={2} />
                </Tooltip>
              </div>
              <p className="text-sm font-body text-[#444D59] dark:text-[#F4F6F8]/60 mt-2">
                Used for organization schema and cross-model brand validation.
              </p>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* LinkedIn */}
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-[#F7F9FB] dark:bg-[#0E1623] rounded-lg border border-[#E5E7EB] dark:border-white/5 flex items-center justify-center">
                    <Linkedin className="w-5 h-5 text-[#0A66C2]" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-body text-[#444D59] dark:text-[#F4F6F8]/50 mb-1">LinkedIn</label>
                    <input
                      type="url"
                      value={settings.social_links.linkedin || ''}
                      onChange={(e) => {
                        setSettings({
                          ...settings,
                          social_links: { ...settings.social_links, linkedin: e.target.value }
                        })
                        setHasChanges(true)
                      }}
                      className="w-full px-3 py-2 bg-white dark:bg-[#0F1B2C] border border-[#E3E5E8] dark:border-white/10 rounded-lg text-[#0F1C2E] dark:text-white font-body text-sm focus:outline-none focus:border-[#FF6B4A] transition-colors"
                      placeholder="linkedin.com/company/..."
                    />
                  </div>
                </div>

                {/* Twitter */}
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-[#F7F9FB] dark:bg-[#0E1623] rounded-lg border border-[#E5E7EB] dark:border-white/5 flex items-center justify-center">
                    <Twitter className="w-5 h-5 text-[#1DA1F2]" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-body text-[#444D59] dark:text-[#F4F6F8]/50 mb-1">Twitter / X</label>
                    <input
                      type="url"
                      value={settings.social_links.twitter || ''}
                      onChange={(e) => {
                        setSettings({
                          ...settings,
                          social_links: { ...settings.social_links, twitter: e.target.value }
                        })
                        setHasChanges(true)
                      }}
                      className="w-full px-3 py-2 bg-white dark:bg-[#0F1B2C] border border-[#E3E5E8] dark:border-white/10 rounded-lg text-[#0F1C2E] dark:text-white font-body text-sm focus:outline-none focus:border-[#FF6B4A] transition-colors"
                      placeholder="twitter.com/..."
                    />
                  </div>
                </div>

                {/* Facebook */}
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-[#F7F9FB] dark:bg-[#0E1623] rounded-lg border border-[#E5E7EB] dark:border-white/5 flex items-center justify-center">
                    <Facebook className="w-5 h-5 text-[#1877F2]" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-body text-[#444D59] dark:text-[#F4F6F8]/50 mb-1">Facebook</label>
                    <input
                      type="url"
                      value={settings.social_links.facebook || ''}
                      onChange={(e) => {
                        setSettings({
                          ...settings,
                          social_links: { ...settings.social_links, facebook: e.target.value }
                        })
                        setHasChanges(true)
                      }}
                      className="w-full px-3 py-2 bg-white dark:bg-[#0F1B2C] border border-[#E3E5E8] dark:border-white/10 rounded-lg text-[#0F1C2E] dark:text-white font-body text-sm focus:outline-none focus:border-[#FF6B4A] transition-colors"
                      placeholder="facebook.com/..."
                    />
                  </div>
                </div>

                {/* Instagram */}
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-[#F7F9FB] dark:bg-[#0E1623] rounded-lg border border-[#E5E7EB] dark:border-white/5 flex items-center justify-center">
                    <Instagram className="w-5 h-5 text-[#E4405F]" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-body text-[#444D59] dark:text-[#F4F6F8]/50 mb-1">Instagram</label>
                    <input
                      type="url"
                      value={settings.social_links.instagram || ''}
                      onChange={(e) => {
                        setSettings({
                          ...settings,
                          social_links: { ...settings.social_links, instagram: e.target.value }
                        })
                        setHasChanges(true)
                      }}
                      className="w-full px-3 py-2 bg-white dark:bg-[#0F1B2C] border border-[#E3E5E8] dark:border-white/10 rounded-lg text-[#0F1C2E] dark:text-white font-body text-sm focus:outline-none focus:border-[#FF6B4A] transition-colors"
                      placeholder="instagram.com/..."
                    />
                  </div>
                </div>

                {/* Crunchbase */}
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-[#F7F9FB] dark:bg-[#0E1623] rounded-lg border border-[#E5E7EB] dark:border-white/5 flex items-center justify-center">
                    <ExternalLink className="w-5 h-5 text-[#0288D1]" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-body text-[#444D59] dark:text-[#F4F6F8]/50 mb-1">Crunchbase</label>
                    <input
                      type="url"
                      value={settings.social_links.crunchbase || ''}
                      onChange={(e) => {
                        setSettings({
                          ...settings,
                          social_links: { ...settings.social_links, crunchbase: e.target.value }
                        })
                        setHasChanges(true)
                      }}
                      className="w-full px-3 py-2 bg-white dark:bg-[#0F1B2C] border border-[#E3E5E8] dark:border-white/10 rounded-lg text-[#0F1C2E] dark:text-white font-body text-sm focus:outline-none focus:border-[#FF6B4A] transition-colors"
                      placeholder="crunchbase.com/organization/..."
                    />
                  </div>
                </div>

                {/* Wikipedia */}
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-[#F7F9FB] dark:bg-[#0E1623] rounded-lg border border-[#E5E7EB] dark:border-white/5 flex items-center justify-center">
                    <ExternalLink className="w-5 h-5 text-[#444D59] dark:text-[#F4F6F8]" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-body text-[#444D59] dark:text-[#F4F6F8]/50 mb-1">Wikipedia</label>
                    <input
                      type="url"
                      value={settings.social_links.wikipedia || ''}
                      onChange={(e) => {
                        setSettings({
                          ...settings,
                          social_links: { ...settings.social_links, wikipedia: e.target.value }
                        })
                        setHasChanges(true)
                      }}
                      className="w-full px-3 py-2 bg-white dark:bg-[#0F1B2C] border border-[#E3E5E8] dark:border-white/10 rounded-lg text-[#0F1C2E] dark:text-white font-body text-sm focus:outline-none focus:border-[#FF6B4A] transition-colors"
                      placeholder="en.wikipedia.org/wiki/..."
                    />
                  </div>
                </div>

                {/* Press Kit */}
                <div className="flex items-center gap-4 lg:col-span-2">
                  <div className="flex-shrink-0 w-10 h-10 bg-[#F7F9FB] dark:bg-[#0E1623] rounded-lg border border-[#E5E7EB] dark:border-white/5 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-[#00C6B7]" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-body text-[#444D59] dark:text-[#F4F6F8]/50 mb-1">Press Kit URL</label>
                    <input
                      type="url"
                      value={settings.social_links.press_kit || ''}
                      onChange={(e) => {
                        setSettings({
                          ...settings,
                          social_links: { ...settings.social_links, press_kit: e.target.value }
                        })
                        setHasChanges(true)
                      }}
                      className="w-full px-3 py-2 bg-white dark:bg-[#0F1B2C] border border-[#E3E5E8] dark:border-white/10 rounded-lg text-[#0F1C2E] dark:text-white font-body text-sm focus:outline-none focus:border-[#FF6B4A] transition-colors"
                      placeholder="yourbrand.com/press"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Success Toast */}
        {saveSuccess && (
          <div className="fixed top-24 right-6 bg-white dark:bg-[#162234] border border-[#00C6B7] rounded-lg shadow-2xl p-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-5 z-50">
            <CheckCircle className="w-5 h-5 text-[#00C6B7]" strokeWidth={2} />
            <span className="text-sm font-body text-[#0F1C2E] dark:text-white font-medium">Changes saved.</span>
          </div>
        )}

        {/* Sticky Save Button */}
        {hasChanges && (
          <div className="fixed bottom-8 right-8 z-50">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-3 px-8 py-4 bg-[#FF6B4A] hover:bg-[#FF7A59] disabled:opacity-50 disabled:cursor-not-allowed text-white font-heading font-semibold text-base rounded-lg transition-all duration-200 border border-white/10 cursor-pointer"
              style={{
                boxShadow: '0 8px 32px rgba(255, 107, 74, 0.4)'
              }}
            >
              <Save className="w-5 h-5" strokeWidth={2.5} />
              {saving ? 'Saving...' : 'Save All Changes'}
            </button>
          </div>
        )}
      </div>
    </>
  )
}