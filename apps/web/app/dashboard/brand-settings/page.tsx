// apps/web/app/dashboard/brand-settings/page.tsx

'use client'

import { useState, useEffect } from 'react'
import { Briefcase, Upload, X, Plus, ExternalLink, Save, AlertCircle } from 'lucide-react'
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
  }
  target_keywords: string[]
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
        // Load existing settings from dashboard metadata
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

    // In production, upload to Supabase Storage
    // For now, create a local object URL
    const objectUrl = URL.createObjectURL(file)
    setSettings({ ...settings, logo_url: objectUrl })
  }

  const addProduct = () => {
    if (!newProduct.trim()) return
    setSettings({
      ...settings,
      products: [...settings.products, newProduct.trim()]
    })
    setNewProduct('')
  }

  const removeProduct = (index: number) => {
    setSettings({
      ...settings,
      products: settings.products.filter((_, i) => i !== index)
    })
  }

  const addCompetitor = () => {
    if (!newCompetitor.trim()) return
    if (settings.competitors.length >= 5) {
      alert('Maximum 5 competitors on your plan')
      return
    }
    setSettings({
      ...settings,
      competitors: [...settings.competitors, newCompetitor.trim()]
    })
    setNewCompetitor('')
  }

  const removeCompetitor = (index: number) => {
    setSettings({
      ...settings,
      competitors: settings.competitors.filter((_, i) => i !== index)
    })
  }

  const addKeyword = () => {
    if (!newKeyword.trim()) return
    setSettings({
      ...settings,
      target_keywords: [...settings.target_keywords, newKeyword.trim()]
    })
    setNewKeyword('')
  }

  const removeKeyword = (index: number) => {
    setSettings({
      ...settings,
      target_keywords: settings.target_keywords.filter((_, i) => i !== index)
    })
  }

  if (loading) {
    return (
      <>
        <MobileHeader />
        <div className="max-w-4xl mx-auto pt-20 lg:pt-0 px-4 lg:px-0 animate-pulse">
          <div className="h-10 w-64 bg-border rounded mb-8"></div>
          <div className="bg-card rounded-lg p-8 border border-border h-96"></div>
        </div>
      </>
    )
  }

  return (
    <>
      <MobileHeader />
      <div className="max-w-4xl mx-auto pt-20 lg:pt-0 px-4 lg:px-0">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Briefcase className="w-6 h-6 lg:w-8 lg:h-8 text-coral" strokeWidth={1.5} />
              <h1 className="text-2xl lg:text-4xl font-heading font-bold text-primary">
                Brand Dashboard
              </h1>
            </div>
            
            <button
              onClick={handleSave}
              disabled={saving}
              className="
                flex items-center gap-2 px-5 py-2.5
                bg-gradient-to-br from-[#FF6B4A] to-[#FF5533]
                hover:from-[#FF7A59] hover:to-[#FF6644]
                disabled:from-gray-400 disabled:to-gray-500
                text-white font-heading font-semibold text-sm
                rounded-lg shadow-md shadow-coral/20
                hover:shadow-lg hover:shadow-coral/30
                transition-all duration-300
                cursor-pointer
                border border-white/10
              "
            >
              <Save className="w-4 h-4" strokeWidth={2.5} />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

          <p className="text-sm text-secondary/60">
            Manage your brand identity and feed AI-optimized content generators
          </p>

          {saveSuccess && (
            <div className="mt-4 flex items-center gap-2 px-4 py-3 bg-green-500/10 border border-green-500/30 rounded-lg">
              <AlertCircle className="w-5 h-5 text-green-400" strokeWidth={1.5} />
              <span className="text-sm text-green-400 font-medium">Settings saved successfully!</span>
            </div>
          )}
        </div>

        {/* Logo Upload */}
        <div className="bg-card rounded-lg p-6 border border-border mb-6">
          <h2 className="text-lg font-heading font-bold text-primary mb-4">Brand Logo</h2>
          
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <div className="w-32 h-32 rounded-lg border-2 border-dashed border-border flex items-center justify-center bg-hover overflow-hidden">
              {settings.logo_url ? (
                <img src={settings.logo_url} alt="Brand logo" className="w-full h-full object-contain" />
              ) : (
                <Upload className="w-8 h-8 text-secondary/40" strokeWidth={1.5} />
              )}
            </div>

            <div className="flex-1">
              <label className="inline-block px-4 py-2 bg-border hover:bg-border/80 text-primary font-body text-sm rounded-lg cursor-pointer transition-colors">
                Upload Logo
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </label>
              <p className="text-xs text-secondary/60 mt-2">
                Recommended: Square PNG or SVG, min 512x512px
              </p>
            </div>
          </div>
        </div>

        {/* Basic Info */}
        <div className="bg-card rounded-lg p-6 border border-border mb-6">
          <h2 className="text-lg font-heading font-bold text-primary mb-4">Basic Information</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-body text-secondary/70 mb-2">Brand Name</label>
              <input
                type="text"
                value={settings.brand_name}
                onChange={(e) => setSettings({ ...settings, brand_name: e.target.value })}
                className="w-full px-4 py-2 bg-hover border border-border rounded-lg text-primary font-body focus:outline-none focus:border-coral transition-colors"
                placeholder="Acme Corporation"
              />
            </div>

            <div>
              <label className="block text-sm font-body text-secondary/70 mb-2">Primary Domain</label>
              <input
                type="text"
                value={settings.domain}
                onChange={(e) => setSettings({ ...settings, domain: e.target.value })}
                className="w-full px-4 py-2 bg-hover border border-border rounded-lg text-primary font-body focus:outline-none focus:border-coral transition-colors"
                placeholder="acme.com"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-body text-secondary/70 mb-2">Category / Industry</label>
                <input
                  type="text"
                  value={settings.category}
                  onChange={(e) => setSettings({ ...settings, category: e.target.value })}
                  className="w-full px-4 py-2 bg-hover border border-border rounded-lg text-primary font-body focus:outline-none focus:border-coral transition-colors"
                  placeholder="B2B SaaS"
                />
              </div>

              <div>
                <label className="block text-sm font-body text-secondary/70 mb-2">Founding Year</label>
                <input
                  type="text"
                  value={settings.founding_year}
                  onChange={(e) => setSettings({ ...settings, founding_year: e.target.value })}
                  className="w-full px-4 py-2 bg-hover border border-border rounded-lg text-primary font-body focus:outline-none focus:border-coral transition-colors"
                  placeholder="2020"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-body text-secondary/70 mb-2">Headquarters</label>
              <input
                type="text"
                value={settings.headquarters}
                onChange={(e) => setSettings({ ...settings, headquarters: e.target.value })}
                className="w-full px-4 py-2 bg-hover border border-border rounded-lg text-primary font-body focus:outline-none focus:border-coral transition-colors"
                placeholder="San Francisco, CA"
              />
            </div>

            <div>
              <label className="block text-sm font-body text-secondary/70 mb-2">
                Brand Description
                <span className="text-xs ml-2 text-secondary/50">(Max 150 characters - used in AI-optimized schema)</span>
              </label>
              <textarea
                value={settings.description}
                onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                maxLength={150}
                rows={3}
                className="w-full px-4 py-2 bg-hover border border-border rounded-lg text-primary font-body focus:outline-none focus:border-coral transition-colors resize-none"
                placeholder="A brief, factual description of what your brand does..."
              />
              <p className="text-xs text-secondary/50 mt-1 text-right">
                {settings.description.length}/150 characters
              </p>
            </div>
          </div>
        </div>

        {/* Products */}
        <div className="bg-card rounded-lg p-6 border border-border mb-6">
          <h2 className="text-lg font-heading font-bold text-primary mb-4">Products & Services</h2>
          
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newProduct}
              onChange={(e) => setNewProduct(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addProduct()}
              className="flex-1 px-4 py-2 bg-hover border border-border rounded-lg text-primary font-body focus:outline-none focus:border-coral transition-colors"
              placeholder="Product name..."
            />
            <button
              onClick={addProduct}
              className="px-4 py-2 bg-border hover:bg-border/80 text-primary rounded-lg transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" strokeWidth={2} />
              Add
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {settings.products.map((product, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-3 py-1.5 bg-hover border border-border rounded-lg group"
              >
                <span className="text-sm text-primary">{product}</span>
                <button
                  onClick={() => removeProduct(index)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4 text-secondary/60 hover:text-red-400" strokeWidth={2} />
                </button>
              </div>
            ))}
            {settings.products.length === 0 && (
              <p className="text-sm text-secondary/50">No products added yet</p>
            )}
          </div>
        </div>

        {/* Competitors */}
        <div className="bg-card rounded-lg p-6 border border-border mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-heading font-bold text-primary">Competitors to Track</h2>
            <span className="text-xs text-secondary/50">{settings.competitors.length}/5</span>
          </div>
          
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newCompetitor}
              onChange={(e) => setNewCompetitor(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addCompetitor()}
              disabled={settings.competitors.length >= 5}
              className="flex-1 px-4 py-2 bg-hover border border-border rounded-lg text-primary font-body focus:outline-none focus:border-coral transition-colors disabled:opacity-50"
              placeholder="Competitor name..."
            />
            <button
              onClick={addCompetitor}
              disabled={settings.competitors.length >= 5}
              className="px-4 py-2 bg-border hover:bg-border/80 disabled:opacity-50 disabled:cursor-not-allowed text-primary rounded-lg transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" strokeWidth={2} />
              Add
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {settings.competitors.map((competitor, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-3 py-1.5 bg-hover border border-border rounded-lg group"
              >
                <span className="text-sm text-primary">{competitor}</span>
                <button
                  onClick={() => removeCompetitor(index)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4 text-secondary/60 hover:text-red-400" strokeWidth={2} />
                </button>
              </div>
            ))}
            {settings.competitors.length === 0 && (
              <p className="text-sm text-secondary/50">No competitors added yet</p>
            )}
          </div>
        </div>

        {/* Target Keywords */}
        <div className="bg-card rounded-lg p-6 border border-border mb-6">
          <h2 className="text-lg font-heading font-bold text-primary mb-4">Target Keywords</h2>
          
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
              className="flex-1 px-4 py-2 bg-hover border border-border rounded-lg text-primary font-body focus:outline-none focus:border-coral transition-colors"
              placeholder="Keyword or phrase..."
            />
            <button
              onClick={addKeyword}
              className="px-4 py-2 bg-border hover:bg-border/80 text-primary rounded-lg transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" strokeWidth={2} />
              Add
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {settings.target_keywords.map((keyword, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-3 py-1.5 bg-hover border border-border rounded-lg group"
              >
                <span className="text-sm text-primary">{keyword}</span>
                <button
                  onClick={() => removeKeyword(index)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4 text-secondary/60 hover:text-red-400" strokeWidth={2} />
                </button>
              </div>
            ))}
            {settings.target_keywords.length === 0 && (
              <p className="text-sm text-secondary/50">No keywords added yet</p>
            )}
          </div>
        </div>

        {/* Social Links */}
        <div className="bg-card rounded-lg p-6 border border-border mb-6">
          <h2 className="text-lg font-heading font-bold text-primary mb-4">Social Media Links</h2>
          <p className="text-sm text-secondary/60 mb-4">These feed into your Organization schema</p>
          
          <div className="space-y-3">
            {['linkedin', 'twitter', 'facebook', 'instagram'].map((platform) => (
              <div key={platform} className="flex items-center gap-3">
                <label className="w-24 text-sm font-body text-secondary/70 capitalize">{platform}</label>
                <input
                  type="url"
                  value={settings.social_links[platform as keyof typeof settings.social_links] || ''}
                  onChange={(e) => setSettings({
                    ...settings,
                    social_links: { ...settings.social_links, [platform]: e.target.value }
                  })}
                  className="flex-1 px-4 py-2 bg-hover border border-border rounded-lg text-primary font-body text-sm focus:outline-none focus:border-coral transition-colors"
                  placeholder={`https://${platform}.com/yourcompany`}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Save Button (Bottom) */}
        <div className="flex justify-end mb-8">
          <button
            onClick={handleSave}
            disabled={saving}
            className="
              flex items-center gap-2 px-6 py-3
              bg-gradient-to-br from-[#FF6B4A] to-[#FF5533]
              hover:from-[#FF7A59] hover:to-[#FF6644]
              disabled:from-gray-400 disabled:to-gray-500
              text-white font-heading font-semibold text-base
              rounded-lg shadow-lg shadow-coral/25
              hover:shadow-xl hover:shadow-coral/35
              transition-all duration-300
              cursor-pointer
              border border-white/10
            "
          >
            <Save className="w-5 h-5" strokeWidth={2.5} />
            {saving ? 'Saving Changes...' : 'Save All Changes'}
          </button>
        </div>
      </div>
    </>
  )
}
