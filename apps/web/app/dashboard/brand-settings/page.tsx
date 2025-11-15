// apps/web/app/dashboard/brand-settings/page.tsx

'use client'

import { useState, useEffect } from 'react'
import { Briefcase, Upload, X, Plus, Save, CheckCircle, Circle, ChevronDown, ChevronUp } from 'lucide-react'
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

export default function BrandSettingsPage() {
  const { currentDashboard } = useBrand()
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
  
  // Section collapse states
  const [collapsedSections, setCollapsedSections] = useState<{[key: string]: boolean}>({})

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
  const calculateReadiness = (): { score: number; checklist: ReadinessChecklist } => {
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

    // Weighted scoring
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
    return { score, checklist }
  }

  const { score, checklist } = calculateReadiness()

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
    if (!newCompetitor.trim()) return
    if (settings.competitors.length >= 5) {
      alert('Maximum 5 competitors allowed')
      return
    }
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
    if (!newKeyword.trim()) return
    if (settings.target_keywords.length >= 10) {
      alert('Maximum 10 keywords allowed')
      return
    }
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

  const toggleSection = (section: string) => {
    setCollapsedSections({
      ...collapsedSections,
      [section]: !collapsedSections[section]
    })
  }

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  if (loading) {
    return (
      <>
        <MobileHeader />
        <div className="max-w-5xl mx-auto pt-20 lg:pt-0 px-4 lg:px-0 animate-pulse">
          <div className="h-10 w-64 bg-border rounded mb-8"></div>
          <div className="bg-white dark:bg-card rounded-lg p-8 border border-border h-96"></div>
        </div>
      </>
    )
  }

  const completedItems = Object.values(checklist).filter(Boolean).length
  const totalItems = Object.values(checklist).length

  return (
    <>
      <MobileHeader />
      <div className="max-w-5xl mx-auto pt-20 lg:pt-0 px-4 lg:px-0 pb-24">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h1 className="text-3xl lg:text-4xl font-heading font-bold text-primary mb-2">
                Brand Dashboard
              </h1>
              <p className="text-sm text-secondary/60">
                Manage your brand identity and power Harbor's AI intelligence.
              </p>
            </div>
          </div>

          {/* AI Readiness Profile Ring */}
          <div className="mt-6 flex justify-end">
            <div className="text-right">
              <div className="flex items-center justify-end gap-4 mb-2">
                {/* Circular Progress Ring */}
                <div className="relative w-24 h-24">
                  <svg className="w-24 h-24 transform -rotate-90">
                    {/* Background circle */}
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="6"
                      fill="none"
                      className="text-border"
                    />
                    {/* Progress circle */}
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="6"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      strokeDashoffset={`${2 * Math.PI * 40 * (1 - score / 100)}`}
                      className="text-[#00C6B7] transition-all duration-500"
                      strokeLinecap="round"
                      style={score === 100 ? { filter: 'drop-shadow(0 0 8px rgba(0, 198, 183, 0.4))' } : {}}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-heading font-bold text-primary">{score}%</span>
                  </div>
                </div>

                <div className="text-left max-w-xs">
                  <h3 className="text-base font-heading font-semibold text-primary mb-1">
                    AI Readiness Profile
                  </h3>
                  <p className="text-xs text-secondary/70 leading-relaxed">
                    Complete your Brand Profile so Harbor can run full AI analysis with the highest accuracy.
                  </p>
                </div>
              </div>

              <p className="text-xs text-secondary/50 italic">
                This does not affect your AI visibility. It improves Harbor's ability to analyze your brand structure.
              </p>

              {/* Progress Text */}
              {score < 100 && (
                <p className="text-xs text-secondary/70 mt-2">
                  Brand Profile {score}% complete — {totalItems - completedItems} steps remaining
                </p>
              )}

              {/* Checklist (collapsible) */}
              <details className="mt-4 text-left">
                <summary className="text-xs text-[#00C6B7] cursor-pointer hover:underline">
                  View checklist ({completedItems}/{totalItems})
                </summary>
                <div className="mt-3 space-y-2 bg-hover/50 rounded-lg p-4 border border-border">
                  {[
                    { key: 'brand_name', label: 'Brand Name', section: 'identity' },
                    { key: 'domain', label: 'Primary Domain', section: 'identity' },
                    { key: 'logo', label: 'Brand Logo uploaded', section: 'identity' },
                    { key: 'description', label: 'Brand Description completed', section: 'identity' },
                    { key: 'category', label: 'Industry selected', section: 'identity' },
                    { key: 'headquarters', label: 'Headquarters provided', section: 'identity' },
                    { key: 'founding_year', label: 'Founding Year entered', section: 'identity' },
                    { key: 'one_product', label: 'At least 1 Product added', section: 'products' },
                    { key: 'three_products', label: 'At least 3 Products added', section: 'products' },
                    { key: 'one_competitor', label: 'At least 1 Competitor added', section: 'competitors' },
                    { key: 'three_keywords', label: 'At least 3 Keywords added', section: 'keywords' },
                    { key: 'one_social', label: 'At least 1 Social Link added', section: 'social' },
                  ].map((item) => (
                    <div
                      key={item.key}
                      onClick={() => !checklist[item.key as keyof ReadinessChecklist] && scrollToSection(item.section)}
                      className={`flex items-center gap-2 text-xs ${
                        checklist[item.key as keyof ReadinessChecklist]
                          ? 'text-secondary/70'
                          : 'text-[#00C6B7] cursor-pointer hover:underline'
                      }`}
                    >
                      {checklist[item.key as keyof ReadinessChecklist] ? (
                        <CheckCircle className="w-4 h-4 text-[#00C6B7]" strokeWidth={2} />
                      ) : (
                        <Circle className="w-4 h-4" strokeWidth={2} />
                      )}
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>
              </details>
            </div>
          </div>
        </div>

        {/* Section 1: Brand Identity */}
        <section id="identity" className="bg-white dark:bg-card rounded-lg border border-border mb-8">
          <div
            className="p-6 flex items-center justify-between cursor-pointer"
            onClick={() => toggleSection('identity')}
          >
            <h2 className="text-xl font-heading font-semibold text-primary">Brand Identity</h2>
            {collapsedSections.identity ? (
              <ChevronDown className="w-5 h-5 text-secondary/60" strokeWidth={1.5} />
            ) : (
              <ChevronUp className="w-5 h-5 text-secondary/60" strokeWidth={1.5} />
            )}
          </div>

          {!collapsedSections.identity && (
            <div className="px-6 pb-6 space-y-6">
              {/* Logo Upload */}
              <div>
                <label className="block text-sm font-medium text-secondary/80 mb-3">Brand Logo</label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-lg border border-border hover:border-[#00C6B7] transition-colors flex items-center justify-center bg-hover overflow-hidden cursor-pointer">
                    {settings.logo_url ? (
                      <img src={settings.logo_url} alt="Brand logo" className="w-full h-full object-contain" />
                    ) : (
                      <Upload className="w-6 h-6 text-secondary/40" strokeWidth={1.5} />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                  <div className="text-xs text-secondary/60">
                    <p>Square PNG or SVG recommended</p>
                    <p>Min 512x512px</p>
                  </div>
                </div>
              </div>

              {/* Brand Name */}
              <div>
                <label className="block text-sm font-medium text-secondary/80 mb-2">Brand Name *</label>
                <input
                  type="text"
                  value={settings.brand_name}
                  onChange={(e) => {
                    setSettings({ ...settings, brand_name: e.target.value })
                    setHasChanges(true)
                  }}
                  className="w-full px-4 py-2.5 bg-white dark:bg-hover border border-border rounded-lg text-primary font-body focus:outline-none focus:border-[#00C6B7] transition-colors"
                  placeholder="Acme Corporation"
                />
              </div>

              {/* Primary Domain */}
              <div>
                <label className="block text-sm font-medium text-secondary/80 mb-2">Primary Domain *</label>
                <input
                  type="text"
                  value={settings.domain}
                  onChange={(e) => {
                    setSettings({ ...settings, domain: e.target.value })
                    setHasChanges(true)
                  }}
                  className="w-full px-4 py-2.5 bg-white dark:bg-hover border border-border rounded-lg text-primary font-body focus:outline-none focus:border-[#00C6B7] transition-colors"
                  placeholder="acme.com"
                />
              </div>

              {/* Industry & Founding Year */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary/80 mb-2">Industry</label>
                  <input
                    type="text"
                    value={settings.category}
                    onChange={(e) => {
                      setSettings({ ...settings, category: e.target.value })
                      setHasChanges(true)
                    }}
                    className="w-full px-4 py-2.5 bg-white dark:bg-hover border border-border rounded-lg text-primary font-body focus:outline-none focus:border-[#00C6B7] transition-colors"
                    placeholder="B2B SaaS"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary/80 mb-2">Founding Year</label>
                  <input
                    type="text"
                    value={settings.founding_year}
                    onChange={(e) => {
                      setSettings({ ...settings, founding_year: e.target.value })
                      setHasChanges(true)
                    }}
                    className="w-full px-4 py-2.5 bg-white dark:bg-hover border border-border rounded-lg text-primary font-body focus:outline-none focus:border-[#00C6B7] transition-colors"
                    placeholder="2020"
                  />
                </div>
              </div>

              {/* Headquarters */}
              <div>
                <label className="block text-sm font-medium text-secondary/80 mb-2">Headquarters</label>
                <input
                  type="text"
                  value={settings.headquarters}
                  onChange={(e) => {
                    setSettings({ ...settings, headquarters: e.target.value })
                    setHasChanges(true)
                  }}
                  className="w-full px-4 py-2.5 bg-white dark:bg-hover border border-border rounded-lg text-primary font-body focus:outline-none focus:border-[#00C6B7] transition-colors"
                  placeholder="San Francisco, CA"
                />
              </div>

              {/* Brand Description */}
              <div>
                <label className="block text-sm font-medium text-secondary/80 mb-2">
                  Brand Description
                </label>
                <textarea
                  value={settings.description}
                  onChange={(e) => {
                    setSettings({ ...settings, description: e.target.value })
                    setHasChanges(true)
                  }}
                  maxLength={150}
                  rows={3}
                  className="w-full px-4 py-2.5 bg-white dark:bg-hover border border-border rounded-lg text-primary font-body focus:outline-none focus:border-[#00C6B7] transition-colors resize-none"
                  placeholder="A brief, factual description of what your brand does..."
                />
                <p className="text-xs text-secondary/50 mt-1 text-right">
                  {settings.description.length}/150 characters
                </p>
              </div>
            </div>
          )}
        </section>

        {/* Section 2: Products & Services */}
        <section id="products" className="bg-white dark:bg-card rounded-lg border border-border mb-8">
          <div
            className="p-6 flex items-center justify-between cursor-pointer"
            onClick={() => toggleSection('products')}
          >
            <div>
              <h2 className="text-xl font-heading font-semibold text-primary">Products & Services</h2>
              <p className="text-xs text-secondary/60 mt-1">Used to understand your product catalog in AI analysis.</p>
            </div>
            {collapsedSections.products ? (
              <ChevronDown className="w-5 h-5 text-secondary/60" strokeWidth={1.5} />
            ) : (
              <ChevronUp className="w-5 h-5 text-secondary/60" strokeWidth={1.5} />
            )}
          </div>

          {!collapsedSections.products && (
            <div className="px-6 pb-6">
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newProduct}
                  onChange={(e) => setNewProduct(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addProduct()}
                  className="flex-1 px-4 py-2 bg-white dark:bg-hover border border-border rounded-lg text-primary font-body text-sm focus:outline-none focus:border-[#00C6B7] transition-colors"
                  placeholder="Product name..."
                />
                <button
                  onClick={addProduct}
                  className="px-4 py-2 bg-hover hover:bg-border text-primary rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
                >
                  <Plus className="w-4 h-4" strokeWidth={2} />
                  Add
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {settings.products.map((product, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 px-3 py-1.5 bg-hover border border-border rounded-full group"
                  >
                    <span className="text-sm text-primary">{product}</span>
                    <button
                      onClick={() => removeProduct(index)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3.5 h-3.5 text-secondary/60 hover:text-red-400" strokeWidth={2} />
                    </button>
                  </div>
                ))}
                {settings.products.length === 0 && (
                  <p className="text-sm text-secondary/50">No products added yet.</p>
                )}
              </div>
            </div>
          )}
        </section>

        {/* Section 3: Competitors */}
        <section id="competitors" className="bg-white dark:bg-card rounded-lg border border-border mb-8">
          <div
            className="p-6 flex items-center justify-between cursor-pointer"
            onClick={() => toggleSection('competitors')}
          >
            <div>
              <h2 className="text-xl font-heading font-semibold text-primary">Competitors to Track</h2>
              <p className="text-xs text-secondary/60 mt-1">Helps Harbor understand your competitive landscape.</p>
            </div>
            {collapsedSections.competitors ? (
              <ChevronDown className="w-5 h-5 text-secondary/60" strokeWidth={1.5} />
            ) : (
              <ChevronUp className="w-5 h-5 text-secondary/60" strokeWidth={1.5} />
            )}
          </div>

          {!collapsedSections.competitors && (
            <div className="px-6 pb-6">
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newCompetitor}
                  onChange={(e) => setNewCompetitor(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addCompetitor()}
                  disabled={settings.competitors.length >= 5}
                  className="flex-1 px-4 py-2 bg-white dark:bg-hover border border-border rounded-lg text-primary font-body text-sm focus:outline-none focus:border-[#00C6B7] transition-colors disabled:opacity-50"
                  placeholder="Competitor name..."
                />
                <button
                  onClick={addCompetitor}
                  disabled={settings.competitors.length >= 5}
                  className="px-4 py-2 bg-hover hover:bg-border disabled:opacity-50 disabled:cursor-not-allowed text-primary rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
                >
                  <Plus className="w-4 h-4" strokeWidth={2} />
                  Add
                </button>
              </div>

              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-secondary/50">{settings.competitors.length}/5 competitors</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {settings.competitors.map((competitor, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 px-3 py-1.5 bg-hover border border-border rounded-full group"
                  >
                    <span className="text-sm text-primary">{competitor}</span>
                    <button
                      onClick={() => removeCompetitor(index)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3.5 h-3.5 text-secondary/60 hover:text-red-400" strokeWidth={2} />
                    </button>
                  </div>
                ))}
                {settings.competitors.length === 0 && (
                  <p className="text-sm text-secondary/50">No competitors added yet.</p>
                )}
              </div>
            </div>
          )}
        </section>

        {/* Section 4: Target Keywords */}
        <section id="keywords" className="bg-white dark:bg-card rounded-lg border border-border mb-8">
          <div
            className="p-6 flex items-center justify-between cursor-pointer"
            onClick={() => toggleSection('keywords')}
          >
            <div>
              <h2 className="text-xl font-heading font-semibold text-primary">Target Keywords</h2>
              <p className="text-xs text-secondary/60 mt-1">Keywords your brand is commonly associated with or aiming for.</p>
            </div>
            {collapsedSections.keywords ? (
              <ChevronDown className="w-5 h-5 text-secondary/60" strokeWidth={1.5} />
            ) : (
              <ChevronUp className="w-5 h-5 text-secondary/60" strokeWidth={1.5} />
            )}
          </div>

          {!collapsedSections.keywords && (
            <div className="px-6 pb-6">
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
                  disabled={settings.target_keywords.length >= 10}
                  className="flex-1 px-4 py-2 bg-white dark:bg-hover border border-border rounded-lg text-primary font-body text-sm focus:outline-none focus:border-[#00C6B7] transition-colors disabled:opacity-50"
                  placeholder="Keyword or phrase..."
                />
                <button
                  onClick={addKeyword}
                  disabled={settings.target_keywords.length >= 10}
                  className="px-4 py-2 bg-hover hover:bg-border disabled:opacity-50 disabled:cursor-not-allowed text-primary rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
                >
                  <Plus className="w-4 h-4" strokeWidth={2} />
                  Add
                </button>
              </div>

              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-secondary/50">{settings.target_keywords.length}/10 keywords</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {settings.target_keywords.map((keyword, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 px-3 py-1.5 bg-hover border border-border rounded-full group"
                  >
                    <span className="text-sm text-primary">{keyword}</span>
                    <button
                      onClick={() => removeKeyword(index)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3.5 h-3.5 text-secondary/60 hover:text-red-400" strokeWidth={2} />
                    </button>
                  </div>
                ))}
                {settings.target_keywords.length === 0 && (
                  <p className="text-sm text-secondary/50">No keywords added yet.</p>
                )}
              </div>
            </div>
          )}
        </section>

        {/* Section 5: Social & Authority Links */}
        <section id="social" className="bg-white dark:bg-card rounded-lg border border-border mb-8">
          <div
            className="p-6 flex items-center justify-between cursor-pointer"
            onClick={() => toggleSection('social')}
          >
            <div>
              <h2 className="text-xl font-heading font-semibold text-primary">Social & Authority Links</h2>
              <p className="text-xs text-secondary/60 mt-1">Used for organization schema and cross-model brand validation.</p>
            </div>
            {collapsedSections.social ? (
              <ChevronDown className="w-5 h-5 text-secondary/60" strokeWidth={1.5} />
            ) : (
              <ChevronUp className="w-5 h-5 text-secondary/60" strokeWidth={1.5} />
            )}
          </div>

          {!collapsedSections.social && (
            <div className="px-6 pb-6 space-y-4">
              {[
                { key: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/company/yourcompany' },
                { key: 'twitter', label: 'Twitter/X', placeholder: 'https://twitter.com/yourcompany' },
                { key: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/yourcompany' },
                { key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/yourcompany' },
                { key: 'crunchbase', label: 'Crunchbase', placeholder: 'https://crunchbase.com/organization/yourcompany' },
                { key: 'wikipedia', label: 'Wikipedia', placeholder: 'https://en.wikipedia.org/wiki/Your_Company' },
                { key: 'press_kit', label: 'Press Kit URL', placeholder: 'https://yourcompany.com/press' },
              ].map((platform) => (
                <div key={platform.key} className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <label className="sm:w-32 text-sm font-medium text-secondary/80">{platform.label}</label>
                  <input
                    type="url"
                    value={settings.social_links[platform.key as keyof typeof settings.social_links] || ''}
                    onChange={(e) => {
                      setSettings({
                        ...settings,
                        social_links: { ...settings.social_links, [platform.key]: e.target.value }
                      })
                      setHasChanges(true)
                    }}
                    className="flex-1 px-4 py-2 bg-white dark:bg-hover border border-border rounded-lg text-primary font-body text-sm focus:outline-none focus:border-[#00C6B7] transition-colors"
                    placeholder={platform.placeholder}
                  />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Success Toast */}
        {saveSuccess && (
          <div className="fixed top-20 right-4 bg-white dark:bg-card border border-[#00C6B7] rounded-lg shadow-lg p-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-5">
            <CheckCircle className="w-5 h-5 text-[#00C6B7]" strokeWidth={2} />
            <span className="text-sm text-primary font-medium">Changes saved.</span>
          </div>
        )}

        {/* Sticky Save Button */}
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={handleSave}
            disabled={saving || !hasChanges}
            className="
              flex items-center gap-2 px-6 py-3
              bg-gradient-to-br from-[#FF6B4A] to-[#FF5533]
              hover:from-[#FF7A59] hover:to-[#FF6644]
              disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed
              text-white font-heading font-semibold text-base
              rounded-lg shadow-xl
              transition-all duration-300
              border border-white/10
            "
            style={{
              boxShadow: hasChanges ? '0 8px 24px rgba(255, 107, 74, 0.35)' : 'none'
            }}
          >
            <Save className="w-5 h-5" strokeWidth={2.5} />
            {saving ? 'Saving...' : 'Save All Changes'}
          </button>
        </div>
      </div>
    </>
  )
}