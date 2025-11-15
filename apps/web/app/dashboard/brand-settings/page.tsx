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

  const { score, checklist, itemsRemaining } = calculateReadiness()

  const handleSave = async () => {
    if (!currentDashboard) return
    
    setSaving(true)
    setSaveSuccess(false)

    try {
      // TODO: The /api/dashboard/update-settings endpoint needs to be created
      // It should handle logo upload to Supabase Storage and update metadata
      const response = await fetch('/api/dashboard/update-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dashboardId: currentDashboard.id,
          settings
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to save settings')
      }

      setSaveSuccess(true)
      setHasChanges(false)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (error) {
      console.error('Save error:', error)
      alert(`Failed to save settings: ${error instanceof Error ? error.message : 'Unknown error'}`)
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
    if (!newKeyword.trim()) return
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

  // Generate lettermark from brand name
  const generateLettermark = (name: string) => {
    const initials = name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
    
    // Generate color from hash of name
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    const hue = hash % 360
    
    return { initials, color: `hsl(${hue}, 45%, 55%)` }
  }

  const lettermark = !settings.logo_url && settings.brand_name ? generateLettermark(settings.brand_name) : null

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center pt-20 lg:pt-0">
        <div className="text-secondary">Loading...</div>
      </div>
    )
  }

  return (
    <>
      <MobileHeader />
      <div className="min-h-screen bg-background pb-32 pt-20 lg:pt-0">
        {/* Header */}
        <div className="px-6 pt-8 pb-6">
          <h1 className="text-3xl font-heading font-bold text-primary mb-2">
            Brand Dashboard
          </h1>
          <p className="text-sm font-body text-secondary/60">
            Complete your profile to improve AI analysis accuracy
          </p>
        </div>

        {/* AI Readiness Card - Horizontal Layout */}
        <div className="px-6 mb-12">
          <div className="bg-card border border-border rounded-xl p-8">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6 lg:gap-8">
              {/* Left: Logo + Ring */}
              <div className="flex-shrink-0 relative">
                <svg width="88" height="88" viewBox="0 0 88 88" className="transform -rotate-90">
                  {/* Base track */}
                  <circle
                    cx="44"
                    cy="44"
                    r="40"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="6"
                    className="text-border"
                  />
                  {/* Progress ring (270° arc) */}
                  <circle
                    cx="44"
                    cy="44"
                    r="40"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={`${(score / 100) * 251.2 * 0.75} 251.2`}
                    className="text-[#2BCFCC] transition-all duration-500"
                  />
                </svg>
                {/* Avatar inside ring */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {settings.logo_url ? (
                    <img
                      src={settings.logo_url}
                      alt={settings.brand_name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : lettermark ? (
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center text-white font-heading font-bold text-xl"
                      style={{ backgroundColor: lettermark.color }}
                    >
                      {lettermark.initials}
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                      <Building2 className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                </div>
              </div>

              {/* Middle: Score + Messaging */}
              <div className="flex-1">
                <h2 className="text-base font-heading font-semibold text-primary mb-1">
                  AI Readiness Profile
                </h2>
                <div className="text-5xl font-heading font-bold text-primary mb-2">
                  {score}%
                </div>
                <p className="text-sm font-body text-secondary/80 mb-1">
                  Your profile helps Harbor analyze your brand with higher accuracy.
                </p>
                <p className="text-xs font-body text-secondary/60">
                  {score}% complete · {itemsRemaining} {itemsRemaining === 1 ? 'item' : 'items'} remaining
                </p>
              </div>

              {/* Right: Actions */}
              <div className="flex-shrink-0">
                <button className="cursor-pointer px-4 py-2 border border-border hover:bg-muted rounded-lg text-sm font-body text-secondary transition-colors cursor-pointer">
                  View Checklist
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 space-y-12">
          {/* Brand Identity */}
          <section>
            <div className="bg-card border border-border rounded-xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-muted border border-border flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-[#2BCFCC]" strokeWidth={1.5} />
                </div>
                <h2 className="text-xl font-heading font-bold text-primary">
                  Brand Identity
                </h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Logo Upload */}
                <div className="lg:col-span-2">
                  <label className="block text-xs font-body uppercase tracking-wide text-secondary/75 mb-3">
                    Brand Logo
                  </label>
                  <div className="flex items-center gap-4">
                    {settings.logo_url ? (
                      <img
                        src={settings.logo_url}
                        alt="Brand logo"
                        className="w-20 h-20 rounded-lg object-cover border border-border"
                      />
                    ) : lettermark ? (
                      <div
                        className="w-20 h-20 rounded-lg flex items-center justify-center text-white font-heading font-bold text-2xl border border-border"
                        style={{ backgroundColor: lettermark.color }}
                      >
                        {lettermark.initials}
                      </div>
                    ) : (
                      <div className="w-20 h-20 rounded-lg bg-muted border border-dashed border-border flex items-center justify-center">
                        <Upload className="w-8 h-8 text-muted-foreground" strokeWidth={1.5} />
                      </div>
                    )}
                    <div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                      <button
                        onClick={triggerFileInput}
                        className="px-5 py-2.5 bg-[#FF6A4A] hover:bg-[#FF7A59] text-white font-heading font-semibold text-sm rounded-lg transition-colors cursor-pointer"
                      >
                        Upload Logo
                      </button>
                      <p className="text-xs font-body text-secondary/60 mt-2">
                        PNG or SVG recommended
                      </p>
                    </div>
                  </div>
                </div>

                {/* Brand Name */}
                <div>
                  <label className="block text-xs font-body uppercase tracking-wide text-secondary/75 mb-2">
                    Brand Name
                  </label>
                  <input
                    type="text"
                    value={settings.brand_name}
                    onChange={(e) => {
                      setSettings({ ...settings, brand_name: e.target.value })
                      setHasChanges(true)
                    }}
                    className="w-full px-4 py-3 bg-card border border-border text-primary font-body text-sm focus:outline-none focus:border-[#2BCFCC] transition-colors"
                    placeholder="Your brand name"
                  />
                </div>

                {/* Domain */}
                <div>
                  <label className="block text-xs font-body uppercase tracking-wide text-secondary/75 mb-2">
                    Domain
                  </label>
                  <input
                    type="text"
                    value={settings.domain}
                    onChange={(e) => {
                      setSettings({ ...settings, domain: e.target.value })
                      setHasChanges(true)
                    }}
                    className="w-full px-4 py-3 bg-card border border-border rounded-lg text-primary font-body text-sm focus:outline-none focus:border-[#2BCFCC] transition-colors"
                    placeholder="yourbrand.com"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-body uppercase tracking-wide text-secondary/75 mb-2">
                    Category
                  </label>
                  <input
                    type="text"
                    value={settings.category}
                    onChange={(e) => {
                      setSettings({ ...settings, category: e.target.value })
                      setHasChanges(true)
                    }}
                    className="w-full px-4 py-3 bg-card border border-border rounded-lg text-primary font-body text-sm focus:outline-none focus:border-[#2BCFCC] transition-colors"
                    placeholder="e.g., SaaS, E-commerce"
                  />
                </div>

                {/* Founding Year */}
                <div>
                  <label className="block text-xs font-body uppercase tracking-wide text-secondary/75 mb-2">
                    Founding Year
                  </label>
                  <input
                    type="text"
                    value={settings.founding_year}
                    onChange={(e) => {
                      setSettings({ ...settings, founding_year: e.target.value })
                      setHasChanges(true)
                    }}
                    className="w-full px-4 py-3 bg-card border border-border rounded-lg text-primary font-body text-sm focus:outline-none focus:border-[#2BCFCC] transition-colors"
                    placeholder="2020"
                  />
                </div>

                {/* Headquarters */}
                <div className="lg:col-span-2">
                  <label className="block text-xs font-body uppercase tracking-wide text-secondary/75 mb-2">
                    Headquarters
                  </label>
                  <input
                    type="text"
                    value={settings.headquarters}
                    onChange={(e) => {
                      setSettings({ ...settings, headquarters: e.target.value })
                      setHasChanges(true)
                    }}
                    className="w-full px-4 py-3 bg-card border border-border rounded-lg text-primary font-body text-sm focus:outline-none focus:border-[#2BCFCC] transition-colors"
                    placeholder="San Francisco, CA"
                  />
                </div>

                {/* Brand Description */}
                <div className="lg:col-span-2">
                  <label className="block text-xs font-body uppercase tracking-wide text-secondary/75 mb-2">
                    Brand Description
                  </label>
                  <textarea
                    value={settings.description}
                    onChange={(e) => {
                      if (e.target.value.length <= 150) {
                        setSettings({ ...settings, description: e.target.value })
                        setHasChanges(true)
                      }
                    }}
                    rows={3}
                    className="w-full px-4 py-3 bg-card border border-border rounded-lg text-primary font-body text-sm focus:outline-none focus:border-[#2BCFCC] transition-colors resize-none"
                    placeholder="Concise description for AI schema (max 150 characters)"
                  />
                  <p className="text-xs font-body text-secondary/60 mt-1 text-right">
                    {settings.description.length}/150
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Products & Services */}
          <section>
            <div className="bg-card border border-border rounded-xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-muted border border-border flex items-center justify-center">
                  <Package className="w-5 h-5 text-[#2BCFCC]" strokeWidth={1.5} />
                </div>
                <h2 className="text-xl font-heading font-bold text-primary">
                  Products & Services
                </h2>
                <button className="cursor-pointer ml-auto p-1.5 hover:bg-muted rounded-lg transition-colors group cursor-pointer">
                  <Info className="w-4 h-4 text-secondary/60 group-hover:text-[#2979FF]" strokeWidth={1.5} />
                </button>
              </div>

              <div className="mb-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newProduct}
                    onChange={(e) => setNewProduct(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addProduct()}
                    className="flex-1 px-4 py-3 bg-card border border-border rounded-lg text-primary font-body text-sm focus:outline-none focus:border-[#2BCFCC] transition-colors"
                    placeholder="Add a product or service"
                  />
                  <button
                    onClick={addProduct}
                    className="px-5 py-3 bg-[#FF6A4A] hover:bg-[#FF7A59] text-white font-heading font-semibold text-sm rounded-lg transition-colors cursor-pointer flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" strokeWidth={2.5} />
                    Add
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {settings.products.map((product, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 px-4 py-2 bg-muted border border-border rounded-lg"
                  >
                    <span className="text-sm font-body text-primary">{product}</span>
                    <button
                      onClick={() => removeProduct(index)}
                      className="p-0.5 hover:bg-hover rounded transition-colors cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5 text-secondary/60" strokeWidth={2} />
                    </button>
                  </div>
                ))}
                {settings.products.length === 0 && (
                  <p className="text-sm font-body text-secondary/60">
                    No products added yet
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Competitors to Track */}
          <section>
            <div className="bg-card border border-border rounded-xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-muted border border-border flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-[#2BCFCC]" strokeWidth={1.5} />
                </div>
                <h2 className="text-xl font-heading font-bold text-primary">
                  Competitors to Track
                </h2>
                <button className="cursor-pointer ml-auto p-1.5 hover:bg-muted rounded-lg transition-colors group cursor-pointer">
                  <Info className="w-4 h-4 text-secondary/60 group-hover:text-[#2979FF]" strokeWidth={1.5} />
                </button>
              </div>

              <div className="mb-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCompetitor}
                    onChange={(e) => setNewCompetitor(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addCompetitor()}
                    disabled={settings.competitors.length >= 5}
                    className="flex-1 px-4 py-3 bg-card border border-border rounded-lg text-primary font-body text-sm focus:outline-none focus:border-[#2BCFCC] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder={settings.competitors.length >= 5 ? 'Maximum 5 competitors' : 'Add a competitor'}
                  />
                  <button
                    onClick={addCompetitor}
                    disabled={settings.competitors.length >= 5}
                    className="px-5 py-3 bg-[#FF6A4A] hover:bg-[#FF7A59] text-white font-heading font-semibold text-sm rounded-lg transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4" strokeWidth={2.5} />
                    Add
                  </button>
                </div>
                <p className="text-xs font-body text-secondary/60 mt-2">
                  {settings.competitors.length}/5 competitors added
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {settings.competitors.map((competitor, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 px-4 py-2 bg-muted border border-border rounded-lg"
                  >
                    <span className="text-sm font-body text-primary">{competitor}</span>
                    <button
                      onClick={() => removeCompetitor(index)}
                      className="p-0.5 hover:bg-hover rounded transition-colors cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5 text-secondary/60" strokeWidth={2} />
                    </button>
                  </div>
                ))}
                {settings.competitors.length === 0 && (
                  <p className="text-sm font-body text-secondary/60">
                    No competitors added yet
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Target Keywords */}
          <section>
            <div className="bg-card border border-border rounded-xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-muted border border-border flex items-center justify-center">
                  <Target className="w-5 h-5 text-[#2BCFCC]" strokeWidth={1.5} />
                </div>
                <h2 className="text-xl font-heading font-bold text-primary">
                  Target Keywords
                </h2>
                <button className="cursor-pointer ml-auto p-1.5 hover:bg-muted rounded-lg transition-colors group cursor-pointer">
                  <Info className="w-4 h-4 text-secondary/60 group-hover:text-[#2979FF]" strokeWidth={1.5} />
                </button>
              </div>

              <div className="mb-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
                    className="flex-1 px-4 py-3 bg-card border border-border rounded-lg text-primary font-body text-sm focus:outline-none focus:border-[#2BCFCC] transition-colors"
                    placeholder="Add a target keyword"
                  />
                  <button
                    onClick={addKeyword}
                    className="px-5 py-3 bg-[#FF6A4A] hover:bg-[#FF7A59] text-white font-heading font-semibold text-sm rounded-lg transition-colors cursor-pointer flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" strokeWidth={2.5} />
                    Add
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {settings.target_keywords.map((keyword, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 px-4 py-2 bg-muted border border-border rounded-lg"
                  >
                    <span className="text-sm font-body text-primary">{keyword}</span>
                    <button
                      onClick={() => removeKeyword(index)}
                      className="p-0.5 hover:bg-hover rounded transition-colors cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5 text-secondary/60" strokeWidth={2} />
                    </button>
                  </div>
                ))}
                {settings.target_keywords.length === 0 && (
                  <p className="text-sm font-body text-secondary/60">
                    No keywords added yet
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Social & Authority Links */}
          <section>
            <div className="bg-card border border-border rounded-xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-muted border border-border flex items-center justify-center">
                  <Globe className="w-5 h-5 text-[#2BCFCC]" strokeWidth={1.5} />
                </div>
                <h2 className="text-xl font-heading font-bold text-primary">
                  Social & Authority Links
                </h2>
                <button className="cursor-pointer ml-auto p-1.5 hover:bg-muted rounded-lg transition-colors group cursor-pointer">
                  <Info className="w-4 h-4 text-secondary/60 group-hover:text-[#2979FF]" strokeWidth={1.5} />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* LinkedIn */}
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-muted rounded-lg border border-border flex items-center justify-center">
                    <Linkedin className="w-5 h-5 text-[#0A66C2]" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-body text-secondary/50 mb-1">LinkedIn</label>
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
                      className="w-full px-3 py-2 bg-card border border-border rounded-lg text-primary font-body text-sm focus:outline-none focus:border-[#2BCFCC] transition-colors"
                      placeholder="linkedin.com/company/..."
                    />
                  </div>
                </div>

                {/* Twitter */}
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-muted rounded-lg border border-border flex items-center justify-center">
                    <Twitter className="w-5 h-5 text-[#1DA1F2]" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-body text-secondary/50 mb-1">Twitter / X</label>
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
                      className="w-full px-3 py-2 bg-card border border-border rounded-lg text-primary font-body text-sm focus:outline-none focus:border-[#2BCFCC] transition-colors"
                      placeholder="twitter.com/..."
                    />
                  </div>
                </div>

                {/* Facebook */}
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-muted rounded-lg border border-border flex items-center justify-center">
                    <Facebook className="w-5 h-5 text-[#1877F2]" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-body text-secondary/50 mb-1">Facebook</label>
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
                      className="w-full px-3 py-2 bg-card border border-border rounded-lg text-primary font-body text-sm focus:outline-none focus:border-[#2BCFCC] transition-colors"
                      placeholder="facebook.com/..."
                    />
                  </div>
                </div>

                {/* Instagram */}
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-muted rounded-lg border border-border flex items-center justify-center">
                    <Instagram className="w-5 h-5 text-[#E4405F]" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-body text-secondary/50 mb-1">Instagram</label>
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
                      className="w-full px-3 py-2 bg-card border border-border rounded-lg text-primary font-body text-sm focus:outline-none focus:border-[#2BCFCC] transition-colors"
                      placeholder="instagram.com/..."
                    />
                  </div>
                </div>

                {/* Crunchbase */}
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-muted rounded-lg border border-border flex items-center justify-center">
                    <ExternalLink className="w-5 h-5 text-[#0288D1]" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-body text-secondary/50 mb-1">Crunchbase</label>
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
                      className="w-full px-3 py-2 bg-card border border-border rounded-lg text-primary font-body text-sm focus:outline-none focus:border-[#2BCFCC] transition-colors"
                      placeholder="crunchbase.com/organization/..."
                    />
                  </div>
                </div>

                {/* Wikipedia */}
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-muted rounded-lg border border-border flex items-center justify-center">
                    <ExternalLink className="w-5 h-5 text-secondary" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-body text-secondary/50 mb-1">Wikipedia</label>
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
                      className="w-full px-3 py-2 bg-card border border-border rounded-lg text-primary font-body text-sm focus:outline-none focus:border-[#2BCFCC] transition-colors"
                      placeholder="en.wikipedia.org/wiki/..."
                    />
                  </div>
                </div>

                {/* Press Kit */}
                <div className="flex items-center gap-4 lg:col-span-2">
                  <div className="flex-shrink-0 w-10 h-10 bg-muted rounded-lg border border-border flex items-center justify-center">
                    <FileText className="w-5 h-5 text-[#2BCFCC]" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-body text-secondary/50 mb-1">Press Kit URL</label>
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
                      className="w-full px-3 py-2 bg-card border border-border rounded-lg text-primary font-body text-sm focus:outline-none focus:border-[#2BCFCC] transition-colors"
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
          <div className="fixed top-24 right-6 bg-card border border-[#2BCFCC] rounded-lg shadow-2xl p-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-5 z-50">
            <CheckCircle className="w-5 h-5 text-[#2BCFCC]" strokeWidth={2} />
            <span className="text-sm font-body text-primary font-medium">Changes saved.</span>
          </div>
        )}

        {/* Sticky Save Button */}
        {hasChanges && (
          <div className="fixed bottom-8 right-8 z-50">
            <button
              onClick={handleSave}
              disabled={saving}
              className="
                flex items-center gap-3 px-8 py-4
                bg-[#FF6A4A] hover:bg-[#FF7A59]
                disabled:opacity-50 disabled:cursor-not-allowed
                text-white font-heading font-semibold text-base
                rounded-lg
                transition-all duration-200
                border border-white/10
                cursor-pointer
              "
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