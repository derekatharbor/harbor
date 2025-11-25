// apps/web/app/dashboard/brand-settings/page.tsx
// Redesigned Brand Dashboard - Clean, cohesive with Harbor aesthetic

'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  Building2, Upload, X, Plus, Save, CheckCircle, 
  Package, Globe, ExternalLink, TrendingUp, 
  AlertCircle, Info, Shield, Sparkles, ArrowRight
} from 'lucide-react'
import Link from 'next/link'
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
    website?: string
  }
  target_keywords: string[]
}

export default function BrandDashboardPage() {
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

  // Calculate profile completeness
  const calculateCompleteness = () => {
    let completed = 0
    let total = 8

    if (settings.brand_name) completed++
    if (settings.domain) completed++
    if (settings.logo_url) completed++
    if (settings.description && settings.description.length >= 50) completed++
    if (settings.category) completed++
    if (settings.products.length >= 1) completed++
    if (settings.target_keywords.length >= 3) completed++
    if (settings.headquarters || settings.founding_year) completed++

    return Math.round((completed / total) * 100)
  }

  const completeness = calculateCompleteness()

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

      if (!response.ok) {
        throw new Error('Failed to save')
      }

      setSaveSuccess(true)
      setHasChanges(false)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (error) {
      console.error('Save error:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB')
      return
    }

    // Create preview URL
    const previewUrl = URL.createObjectURL(file)
    setSettings({ ...settings, logo_url: previewUrl })
    setHasChanges(true)
  }

  const addProduct = () => {
    if (!newProduct.trim()) return
    setSettings({ ...settings, products: [...settings.products, newProduct.trim()] })
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

  const addKeyword = () => {
    if (!newKeyword.trim()) return
    setSettings({ ...settings, target_keywords: [...settings.target_keywords, newKeyword.trim()] })
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

  // Loading skeleton
  if (loading) {
    return (
      <>
        <MobileHeader />
        <div className="max-w-screen-xl mx-auto animate-pulse space-y-8 pt-20 lg:pt-0">
          <div className="h-10 w-64 rounded" style={{ backgroundColor: 'var(--bg-card)' }} />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-64 rounded-xl" style={{ backgroundColor: 'var(--bg-card)' }} />
              <div className="h-48 rounded-xl" style={{ backgroundColor: 'var(--bg-card)' }} />
            </div>
            <div className="h-96 rounded-xl" style={{ backgroundColor: 'var(--bg-card)' }} />
          </div>
        </div>
      </>
    )
  }

  // Empty state
  if (!currentDashboard) {
    return (
      <>
        <MobileHeader />
        <div className="max-w-screen-xl mx-auto pt-20 lg:pt-0 px-4 lg:px-0">
          <div 
            className="rounded-xl p-12 text-center"
            style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
          >
            <Building2 className="w-16 h-16 mx-auto mb-6 opacity-30" style={{ color: 'var(--text-secondary)' }} />
            <h2 className="text-2xl font-heading font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
              No Brand Selected
            </h2>
            <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
              Select a brand from the sidebar to manage its settings.
            </p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <MobileHeader />
      <div className="max-w-screen-xl mx-auto pt-20 lg:pt-0 px-4 lg:px-0">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Building2 className="w-7 h-7" style={{ color: 'var(--accent-teal)' }} strokeWidth={1.5} />
            <h1 className="text-3xl font-heading font-bold" style={{ color: 'var(--text-primary)' }}>
              Brand Profile
            </h1>
          </div>
          <p style={{ color: 'var(--text-secondary)' }}>
            Manage your brand information to improve AI visibility
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Brand Identity Card */}
            <section 
              className="rounded-xl p-6"
              style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
            >
              <h2 className="text-lg font-heading font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>
                Brand Identity
              </h2>

              <div className="flex flex-col sm:flex-row gap-6 mb-6">
                {/* Logo Upload */}
                <div className="flex-shrink-0">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-24 h-24 rounded-xl flex items-center justify-center overflow-hidden transition-all hover:opacity-80"
                    style={{ 
                      backgroundColor: 'var(--bg-muted)', 
                      border: '2px dashed var(--border-strong)' 
                    }}
                  >
                    {settings.logo_url ? (
                      <img src={settings.logo_url} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <Upload className="w-6 h-6" style={{ color: 'var(--text-muted)' }} />
                    )}
                  </button>
                  <p className="text-xs mt-2 text-center" style={{ color: 'var(--text-muted)' }}>
                    Upload logo
                  </p>
                </div>

                {/* Brand Name & Domain */}
                <div className="flex-1 space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                      Brand Name
                    </label>
                    <input
                      type="text"
                      value={settings.brand_name}
                      onChange={(e) => {
                        setSettings({ ...settings, brand_name: e.target.value })
                        setHasChanges(true)
                      }}
                      className="input-field"
                      placeholder="Your brand name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                      Domain
                    </label>
                    <input
                      type="text"
                      value={settings.domain}
                      onChange={(e) => {
                        setSettings({ ...settings, domain: e.target.value })
                        setHasChanges(true)
                      }}
                      className="input-field"
                      placeholder="yourbrand.com"
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Brand Description
                  <span className="ml-2 text-xs font-normal" style={{ color: 'var(--text-muted)' }}>
                    (min 50 characters for best AI understanding)
                  </span>
                </label>
                <textarea
                  value={settings.description}
                  onChange={(e) => {
                    setSettings({ ...settings, description: e.target.value })
                    setHasChanges(true)
                  }}
                  className="input-field resize-none"
                  rows={3}
                  placeholder="Describe what your brand does, who you serve, and what makes you unique..."
                />
                <p className="text-xs mt-1" style={{ color: settings.description.length >= 50 ? 'var(--accent-green)' : 'var(--text-muted)' }}>
                  {settings.description.length}/50 characters
                </p>
              </div>

              {/* Category & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                    Category / Industry
                  </label>
                  <input
                    type="text"
                    value={settings.category}
                    onChange={(e) => {
                      setSettings({ ...settings, category: e.target.value })
                      setHasChanges(true)
                    }}
                    className="input-field"
                    placeholder="e.g., SaaS, E-commerce, Finance"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                    Headquarters
                  </label>
                  <input
                    type="text"
                    value={settings.headquarters}
                    onChange={(e) => {
                      setSettings({ ...settings, headquarters: e.target.value })
                      setHasChanges(true)
                    }}
                    className="input-field"
                    placeholder="City, Country"
                  />
                </div>
              </div>
            </section>

            {/* Products & Services */}
            <section 
              className="rounded-xl p-6"
              style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-heading font-semibold" style={{ color: 'var(--text-primary)' }}>
                    Products & Services
                  </h2>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    Help AI understand what you offer
                  </p>
                </div>
                <Package className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
              </div>

              {/* Product Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {settings.products.map((product, index) => (
                  <span 
                    key={index}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm"
                    style={{ backgroundColor: 'var(--bg-muted)', border: '1px solid var(--border)' }}
                  >
                    <span style={{ color: 'var(--text-primary)' }}>{product}</span>
                    <button
                      type="button"
                      onClick={() => removeProduct(index)}
                      className="hover:opacity-70 transition-opacity"
                    >
                      <X className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
                    </button>
                  </span>
                ))}
              </div>

              {/* Add Product */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newProduct}
                  onChange={(e) => setNewProduct(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addProduct()}
                  className="input-field flex-1"
                  placeholder="Add a product or service..."
                />
                <button
                  type="button"
                  onClick={addProduct}
                  className="btn-secondary px-4"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </section>

            {/* Target Keywords */}
            <section 
              className="rounded-xl p-6"
              style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-heading font-semibold" style={{ color: 'var(--text-primary)' }}>
                    Target Keywords
                  </h2>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    Keywords you want to rank for in AI responses
                  </p>
                </div>
                <Sparkles className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
              </div>

              {/* Keyword Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {settings.target_keywords.map((keyword, index) => (
                  <span 
                    key={index}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm"
                    style={{ backgroundColor: 'rgba(34, 211, 238, 0.1)', border: '1px solid rgba(34, 211, 238, 0.2)' }}
                  >
                    <span style={{ color: 'var(--accent-teal)' }}>{keyword}</span>
                    <button
                      type="button"
                      onClick={() => removeKeyword(index)}
                      className="hover:opacity-70 transition-opacity"
                    >
                      <X className="w-3.5 h-3.5" style={{ color: 'var(--accent-teal)' }} />
                    </button>
                  </span>
                ))}
              </div>

              {/* Add Keyword */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addKeyword()}
                  className="input-field flex-1"
                  placeholder="Add a keyword..."
                />
                <button
                  type="button"
                  onClick={addKeyword}
                  className="btn-secondary px-4"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Completeness */}
            <div 
              className="rounded-xl p-6"
              style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
            >
              <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                Profile Completeness
              </h3>
              
              <div className="relative mb-4">
                <div className="progress-bar h-2">
                  <div 
                    className="progress-fill"
                    style={{ 
                      width: `${completeness}%`,
                      backgroundColor: completeness >= 80 ? 'var(--accent-green)' : completeness >= 50 ? 'var(--accent-amber)' : 'var(--accent-teal)'
                    }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between mb-6">
                <span className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {completeness}%
                </span>
                <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  {completeness >= 80 ? 'Great!' : completeness >= 50 ? 'Good progress' : 'Just started'}
                </span>
              </div>

              {/* Quick Tips */}
              <div className="space-y-3">
                <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  Improve your score
                </p>
                
                {!settings.description || settings.description.length < 50 ? (
                  <div className="flex items-start gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--accent-amber)' }} />
                    <span>Add a description (50+ chars)</span>
                  </div>
                ) : null}
                
                {settings.products.length === 0 ? (
                  <div className="flex items-start gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--accent-amber)' }} />
                    <span>Add at least one product</span>
                  </div>
                ) : null}

                {settings.target_keywords.length < 3 ? (
                  <div className="flex items-start gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--accent-amber)' }} />
                    <span>Add 3+ target keywords</span>
                  </div>
                ) : null}

                {completeness >= 80 && (
                  <div className="flex items-start gap-2 text-sm" style={{ color: 'var(--accent-green)' }}>
                    <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>Profile looking good!</span>
                  </div>
                )}
              </div>
            </div>

            {/* Public Profile Link */}
            {currentDashboard.slug && (
              <div 
                className="rounded-xl p-6"
                style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
              >
                <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                  Public Profile
                </h3>
                <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
                  Your brand has a public page in the Harbor Index.
                </p>
                <Link
                  href={`/brands/${currentDashboard.slug}`}
                  className="inline-flex items-center gap-2 text-sm font-medium transition-colors"
                  style={{ color: 'var(--accent-teal)' }}
                >
                  View public profile
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>
            )}

            {/* Quick Actions */}
            <div 
              className="rounded-xl p-6"
              style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
            >
              <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                Quick Actions
              </h3>
              <div className="space-y-2">
                <Link
                  href="/dashboard/overview"
                  className="flex items-center justify-between p-3 rounded-lg transition-colors"
                  style={{ backgroundColor: 'var(--bg-muted)' }}
                >
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>View Overview</span>
                  <ArrowRight className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                </Link>
                <Link
                  href="/dashboard/competitors"
                  className="flex items-center justify-between p-3 rounded-lg transition-colors"
                  style={{ backgroundColor: 'var(--bg-muted)' }}
                >
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Competitive Intel</span>
                  <ArrowRight className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Save Button */}
        {hasChanges && (
          <div className="fixed bottom-8 right-8 z-50">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-3 px-6 py-3 rounded-xl font-semibold text-white transition-all shadow-lg"
              style={{ 
                backgroundColor: 'var(--accent-teal)',
                boxShadow: '0 8px 32px rgba(34, 211, 238, 0.3)'
              }}
            >
              <Save className="w-5 h-5" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}

        {/* Success Toast */}
        {saveSuccess && (
          <div 
            className="fixed top-24 right-6 rounded-xl shadow-2xl p-4 flex items-center gap-3 animate-in z-50"
            style={{ 
              backgroundColor: 'var(--bg-card)', 
              border: '1px solid var(--accent-green)' 
            }}
          >
            <CheckCircle className="w-5 h-5" style={{ color: 'var(--accent-green)' }} />
            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              Changes saved successfully
            </span>
          </div>
        )}
      </div>
    </>
  )
}