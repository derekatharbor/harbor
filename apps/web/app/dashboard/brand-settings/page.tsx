// apps/web/app/dashboard/brand-settings/page.tsx
// Brand Profile Editor - Verified Truth + AI Belief Comparison

'use client'

import { useState, useEffect } from 'react'
import { 
  Building2, Check, Plus, X, Save, Shield, Clock,
  DollarSign, Puzzle, Users, MessageSquare, 
  Link as LinkIcon, FileText, Megaphone, Lock,
  TrendingUp, TrendingDown, RefreshCw, ExternalLink,
  AlertCircle, CheckCircle, HelpCircle, Package
} from 'lucide-react'
import { useBrand } from '@/contexts/BrandContext'
import MobileHeader from '@/components/layout/MobileHeader'

// ============================================================================
// TYPES
// ============================================================================

interface BrandData {
  brand_name: string
  logo_url: string | null
  domain: string
  category: string
  claimed_at: string | null
  
  description: string
  offerings: Array<{ name: string; description: string; type: string }>
  faqs: Array<{ question: string; answer: string }>
  company_info: {
    hq_location: string
    founded_year: string
    employee_count: string
  }
  
  pricing: {
    model: string
    starting_price: string
    has_free_tier: boolean
    pricing_url: string
  }
  integrations: string[]
  use_cases: Array<{ title: string; description: string }>
  competitor_context: Array<{ competitor: string; positioning: string }>
  authoritative_sources: Array<{ url: string }>
  recent_updates: Array<{ category: string; description: string; date: string }>
}

interface AIBelief {
  description?: string
  offerings?: string[]
  pricing?: string[]
  integrations?: Array<{ name: string; status: 'correct' | 'incorrect' | 'missing' }>
  use_cases?: string[]
  competitors?: Record<string, string>
  sources?: string[]
  faq_answers?: Record<string, string>
}

// ============================================================================
// AI BELIEF PANEL COMPONENT
// ============================================================================

function AIBeliefPanel({ 
  title, 
  children,
  isEmpty = false 
}: { 
  title: string
  children: React.ReactNode
  isEmpty?: boolean
}) {
  return (
    <div 
      className="mt-4 rounded-lg p-4"
      style={{ 
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.05)'
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#22d3ee' }} />
        <span className="text-sm font-medium" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          {title}
        </span>
      </div>
      {isEmpty ? (
        <p className="text-sm italic" style={{ color: 'rgba(255, 255, 255, 0.4)' }}>
          Run a visibility scan to see what AI models believe.
        </p>
      ) : (
        <div className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
          {children}
        </div>
      )}
    </div>
  )
}

// ============================================================================
// STATUS TAG COMPONENT
// ============================================================================

function StatusTag({ status, label }: { status: 'correct' | 'incorrect' | 'missing' | 'unknown'; label: string }) {
  const styles = {
    correct: { bg: 'rgba(63, 191, 117, 0.15)', border: 'rgba(63, 191, 117, 0.3)', text: '#3fbf75' },
    incorrect: { bg: 'rgba(255, 107, 107, 0.15)', border: 'rgba(255, 107, 107, 0.3)', text: '#ff6b6b' },
    missing: { bg: 'rgba(246, 193, 75, 0.15)', border: 'rgba(246, 193, 75, 0.3)', text: '#f6c14b' },
    unknown: { bg: 'rgba(255, 255, 255, 0.05)', border: 'rgba(255, 255, 255, 0.1)', text: 'rgba(255, 255, 255, 0.5)' }
  }
  
  const s = styles[status]
  
  return (
    <span 
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium"
      style={{ backgroundColor: s.bg, border: `1px solid ${s.border}`, color: s.text }}
    >
      {status === 'correct' && <CheckCircle className="w-3 h-3" />}
      {status === 'incorrect' && <X className="w-3 h-3" />}
      {status === 'missing' && <HelpCircle className="w-3 h-3" />}
      {label}
    </span>
  )
}

// ============================================================================
// SECTION CARD COMPONENT
// ============================================================================

function SectionCard({ 
  icon, 
  title, 
  subtitle, 
  children 
}: { 
  icon: React.ReactNode
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <div 
      className="rounded-xl p-8 transition-all duration-200"
      style={{ 
        backgroundColor: '#111b2c',
        border: '1px solid rgba(255, 255, 255, 0.05)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
        e.currentTarget.style.boxShadow = '0 4px 24px rgba(0, 0, 0, 0.2)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      <div className="flex items-start gap-3 mb-6">
        <div 
          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
        >
          {icon}
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-1" style={{ color: '#ffffff' }}>
            {title}
          </h3>
          <p className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.45)' }}>
            {subtitle}
          </p>
        </div>
      </div>
      {children}
      <p className="text-xs mt-6 pt-4 border-t" style={{ color: 'rgba(255, 255, 255, 0.3)', borderColor: 'rgba(255, 255, 255, 0.05)' }}>
        Harbor compares this information against AI model output to assess visibility, accuracy, and consistency.
      </p>
    </div>
  )
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function BrandSettingsPage() {
  const { currentDashboard } = useBrand()
  
  const [data, setData] = useState<BrandData>({
    brand_name: '',
    logo_url: null,
    domain: '',
    category: '',
    claimed_at: null,
    description: '',
    offerings: [],
    faqs: [],
    company_info: { hq_location: '', founded_year: '', employee_count: '' },
    pricing: { model: '', starting_price: '', has_free_tier: false, pricing_url: '' },
    integrations: [],
    use_cases: [],
    competitor_context: [],
    authoritative_sources: [],
    recent_updates: []
  })
  
  // Mock AI beliefs from last scan (in production, this comes from scan results)
  const [aiBeliefs, setAIBeliefs] = useState<AIBelief>({
    description: '',
    offerings: [],
    pricing: [],
    integrations: [],
    use_cases: [],
    competitors: {},
    sources: [],
    faq_answers: {}
  })
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [publicProfile, setPublicProfile] = useState<any>(null)
  const [lastScanDate, setLastScanDate] = useState<string | null>(null)
  const [visibilityScore, setVisibilityScore] = useState<number>(0)
  const [globalRank, setGlobalRank] = useState<number | null>(null)
  const [scoreTrend, setScoreTrend] = useState<'up' | 'down' | 'stable'>('stable')
  
  // Temp input states
  const [newIntegration, setNewIntegration] = useState('')

  // ============================================================================
  // LOAD DATA
  // ============================================================================
  
  useEffect(() => {
    async function loadData() {
      if (!currentDashboard) {
        setLoading(false)
        return
      }

      const dashboardData: Partial<BrandData> = {
        brand_name: currentDashboard.brand_name || '',
        logo_url: currentDashboard.logo_url || null,
        domain: currentDashboard.domain || '',
        category: currentDashboard.metadata?.category || '',
        description: currentDashboard.metadata?.description || '',
      }
      
      try {
        const domain = currentDashboard.domain?.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0]
        if (domain) {
          const res = await fetch(`/api/brands?domain=${encodeURIComponent(domain)}`)
          if (res.ok) {
            const result = await res.json()
            if (result.profile) {
              setPublicProfile(result.profile)
              setVisibilityScore(result.profile.visibility_score || 0)
              setGlobalRank(result.profile.rank_global || null)
              
              const fd = result.profile.feed_data || {}
              dashboardData.description = fd.short_description || dashboardData.description
              dashboardData.offerings = fd.offerings || []
              dashboardData.faqs = fd.faqs || []
              dashboardData.company_info = {
                hq_location: fd.company_info?.hq_location || '',
                founded_year: fd.company_info?.founded_year?.toString() || '',
                employee_count: fd.company_info?.employee_band || ''
              }
              dashboardData.claimed_at = result.profile.claimed_at || null
              
              // Load visibility-shaping data
              dashboardData.pricing = fd.pricing || { model: '', starting_price: '', has_free_tier: false, pricing_url: '' }
              dashboardData.integrations = fd.integrations || []
              dashboardData.use_cases = fd.use_cases || []
              dashboardData.competitor_context = fd.competitor_context || []
              dashboardData.authoritative_sources = fd.authoritative_sources || []
              dashboardData.recent_updates = fd.recent_updates || []
              
              // Mock AI beliefs (in production, fetch from scan results)
              setAIBeliefs({
                description: fd.short_description ? 'Based on website crawl data' : '',
                offerings: fd.offerings?.map((o: any) => o.name) || [],
                pricing: [],
                integrations: [],
                use_cases: [],
                competitors: {},
                sources: [],
                faq_answers: {}
              })
            }
          }
        }
        
        // Get last scan date
        const scanRes = await fetch(`/api/scan/latest?dashboardId=${currentDashboard.id}`)
        if (scanRes.ok) {
          const scanData = await scanRes.json()
          if (scanData.scan?.finished_at) {
            setLastScanDate(scanData.scan.finished_at)
          }
        }
      } catch (error) {
        console.error('Error loading data:', error)
      }
      
      setData(prev => ({ ...prev, ...dashboardData }))
      setLoading(false)
    }

    loadData()
  }, [currentDashboard])

  // ============================================================================
  // HANDLERS
  // ============================================================================
  
  const updateData = (updates: Partial<BrandData>) => {
    setData(prev => ({ ...prev, ...updates }))
    setHasChanges(true)
  }

  const handleSave = async () => {
    if (!currentDashboard) return
    
    setSaving(true)
    setSaveSuccess(false)

    try {
      if (publicProfile?.slug) {
        await fetch(`/api/brands/${publicProfile.slug}/update`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            description: data.description,
            offerings: data.offerings,
            faqs: data.faqs,
            companyInfo: {
              hq_location: data.company_info.hq_location,
              founded_year: data.company_info.founded_year ? parseInt(data.company_info.founded_year) : null,
              employee_band: data.company_info.employee_count
            },
            pricing: data.pricing,
            integrations: data.integrations,
            use_cases: data.use_cases,
            competitor_context: data.competitor_context,
            authoritative_sources: data.authoritative_sources,
            recent_updates: data.recent_updates
          })
        })
      }

      await fetch('/api/dashboard/update-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dashboardId: currentDashboard.id,
          settings: {
            description: data.description,
            category: data.category
          }
        })
      })

      setSaveSuccess(true)
      setHasChanges(false)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (error) {
      console.error('Save error:', error)
    } finally {
      setSaving(false)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  // ============================================================================
  // LOADING & EMPTY STATES
  // ============================================================================
  
  if (loading) {
    return (
      <>
        <MobileHeader />
        <div className="min-h-screen" style={{ backgroundColor: '#0f1624' }}>
          <div className="max-w-6xl mx-auto px-6 py-8 animate-pulse space-y-6">
            <div className="h-32 rounded-xl" style={{ backgroundColor: '#111b2c' }} />
            <div className="h-64 rounded-xl" style={{ backgroundColor: '#111b2c' }} />
          </div>
        </div>
      </>
    )
  }

  if (!currentDashboard) {
    return (
      <>
        <MobileHeader />
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0f1624' }}>
          <div className="text-center">
            <Building2 className="w-16 h-16 mx-auto mb-4 opacity-30" style={{ color: 'white' }} />
            <h2 className="text-xl font-semibold text-white mb-2">No Brand Selected</h2>
            <p style={{ color: 'rgba(255,255,255,0.5)' }}>Select a brand from the sidebar.</p>
          </div>
        </div>
      </>
    )
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <>
      <MobileHeader />
      <div 
        className="min-h-screen"
        style={{ 
          backgroundColor: '#0f1624'
        }}
      >
        <div className="max-w-6xl mx-auto px-6 py-8 pb-32">
          
          {/* ============================================================ */}
          {/* HEADER - Brand Identity Summary */}
          {/* ============================================================ */}
          <div 
            className="rounded-xl p-6 mb-8"
            style={{ 
              background: 'linear-gradient(135deg, #111b2c 0%, #0f1624 100%)',
              border: '1px solid rgba(255, 255, 255, 0.05)'
            }}
          >
            <div className="flex items-center gap-4">
              {data.logo_url ? (
                <img src={data.logo_url} alt={data.brand_name} className="w-16 h-16 rounded-xl object-contain bg-white/10" />
              ) : (
                <div className="w-16 h-16 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                  <Building2 className="w-8 h-8" style={{ color: 'rgba(255,255,255,0.5)' }} />
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-2xl font-bold text-white">{data.brand_name}</h1>
                  {publicProfile?.claimed && (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium"
                      style={{ backgroundColor: 'rgba(63, 191, 117, 0.15)', color: '#3fbf75' }}>
                      <Shield className="w-3 h-3" />
                      Verified
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  <span>{data.domain}</span>
                  {data.claimed_at && (
                    <>
                      <span>•</span>
                      <span>Claimed {formatDate(data.claimed_at)}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <p className="mt-4 text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
              This is the official source-of-truth information for your brand. Harbor uses this to identify gaps between what you've provided and what AI models currently believe.
            </p>
          </div>

          {/* ============================================================ */}
          {/* MAIN CONTENT - Two Column Layout */}
          {/* ============================================================ */}
          <div className="flex gap-8">
            
            {/* Left Column - Editable Sections */}
            <div className="flex-1 space-y-6">
              
              {/* Brand Description */}
              <SectionCard
                icon={<FileText className="w-5 h-5" style={{ color: 'rgba(255,255,255,0.6)' }} />}
                title="Brand Description"
                subtitle="AI pulls descriptions from your website and public data. Provide a single, clear description for Harbor to verify against AI model output."
              >
                <textarea
                  value={data.description}
                  onChange={(e) => updateData({ description: e.target.value })}
                  className="w-full rounded-lg p-4 resize-none text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  style={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}
                  rows={4}
                  maxLength={500}
                  placeholder="Describe what your company does, who you serve, and what makes you different..."
                />
                <div className="flex justify-end mt-2">
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    {data.description.length}/500
                  </span>
                </div>
                
                <AIBeliefPanel title="AI currently believes:" isEmpty={!aiBeliefs.description}>
                  <p className="font-mono">{aiBeliefs.description || 'No data from last scan.'}</p>
                </AIBeliefPanel>
              </SectionCard>

              {/* Products & Services */}
              <SectionCard
                icon={<Package className="w-5 h-5" style={{ color: 'rgba(255,255,255,0.6)' }} />}
                title="Products & Services"
                subtitle="List your core offerings. Harbor checks whether AI models recognize them correctly."
              >
                <div className="space-y-3">
                  {data.offerings.map((offering, idx) => (
                    <div 
                      key={idx}
                      className="rounded-lg p-4 group relative transition-all duration-200 hover:bg-white/[0.02]"
                      style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
                    >
                      <button
                        onClick={() => updateData({ offerings: data.offerings.filter((_, i) => i !== idx) })}
                        className="absolute top-3 right-3 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        style={{ backgroundColor: 'rgba(255, 107, 107, 0.1)' }}
                      >
                        <X className="w-4 h-4" style={{ color: '#ff6b6b' }} />
                      </button>
                      <input
                        type="text"
                        value={offering.name}
                        onChange={(e) => {
                          const newOfferings = [...data.offerings]
                          newOfferings[idx] = { ...offering, name: e.target.value }
                          updateData({ offerings: newOfferings })
                        }}
                        className="w-full bg-transparent text-white font-medium mb-2 focus:outline-none"
                        placeholder="Product name"
                      />
                      <textarea
                        value={offering.description}
                        onChange={(e) => {
                          const newOfferings = [...data.offerings]
                          newOfferings[idx] = { ...offering, description: e.target.value }
                          updateData({ offerings: newOfferings })
                        }}
                        className="w-full bg-transparent text-sm resize-none focus:outline-none"
                        style={{ color: 'rgba(255,255,255,0.6)' }}
                        rows={2}
                        placeholder="Short description"
                      />
                    </div>
                  ))}
                  <button
                    onClick={() => updateData({ offerings: [...data.offerings, { name: '', description: '', type: 'product' }] })}
                    className="w-full py-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer hover:border-cyan-500/30 hover:bg-white/[0.02]"
                    style={{ 
                      backgroundColor: 'rgba(255,255,255,0.03)', 
                      border: '1px dashed rgba(255,255,255,0.1)',
                      color: 'rgba(255,255,255,0.5)'
                    }}
                  >
                    <Plus className="w-4 h-4" />
                    Add Product or Service
                  </button>
                </div>
                
                <AIBeliefPanel title="AI currently lists these offerings:" isEmpty={aiBeliefs.offerings?.length === 0}>
                  {aiBeliefs.offerings && aiBeliefs.offerings.length > 0 ? (
                    <ul className="space-y-1">
                      {aiBeliefs.offerings.map((o, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <span>•</span>
                          <span>{o}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="italic">Run a visibility scan to see what AI models believe.</p>
                  )}
                </AIBeliefPanel>
              </SectionCard>

              {/* Pricing & Plans */}
              <SectionCard
                icon={<DollarSign className="w-5 h-5" style={{ color: 'rgba(255,255,255,0.6)' }} />}
                title="Pricing & Plans"
                subtitle="Pricing is one of the most common AI misunderstandings. Provide the verified details below — Harbor compares these to what AI models currently assume."
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>
                      Pricing Model
                    </label>
                    <select
                      value={data.pricing.model}
                      onChange={(e) => updateData({ pricing: { ...data.pricing, model: e.target.value } })}
                      className="w-full rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 cursor-pointer"
                      style={{ 
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)'
                      }}
                    >
                      <option value="">Select...</option>
                      <option value="free">Free tier available</option>
                      <option value="subscription">Subscription</option>
                      <option value="usage">Usage-based</option>
                      <option value="one-time">One-time purchase</option>
                      <option value="custom">Custom / Contact sales</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>
                      Starting Price
                    </label>
                    <input
                      type="text"
                      value={data.pricing.starting_price}
                      onChange={(e) => updateData({ pricing: { ...data.pricing, starting_price: e.target.value } })}
                      className="w-full rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                      style={{ 
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)'
                      }}
                      placeholder="e.g., $29/mo, Free, Contact us"
                    />
                  </div>
                </div>
                
                <div className="mt-4">
                  <label className="block text-xs font-medium mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    Pricing Page URL
                  </label>
                  <input
                    type="url"
                    value={data.pricing.pricing_url}
                    onChange={(e) => updateData({ pricing: { ...data.pricing, pricing_url: e.target.value } })}
                    className="w-full rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                    style={{ 
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)'
                    }}
                    placeholder="https://yoursite.com/pricing"
                  />
                </div>
                
                <label className="flex items-center gap-3 mt-4 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={data.pricing.has_free_tier}
                    onChange={(e) => updateData({ pricing: { ...data.pricing, has_free_tier: e.target.checked } })}
                    className="w-4 h-4 rounded cursor-pointer"
                  />
                  <span className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                    We offer a free tier
                  </span>
                </label>
                
                <AIBeliefPanel title="AI currently believes your pricing is:" isEmpty={!aiBeliefs.pricing || aiBeliefs.pricing.length === 0}>
                  {aiBeliefs.pricing && aiBeliefs.pricing.length > 0 ? (
                    <div className="space-y-2">
                      {aiBeliefs.pricing.map((p, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <StatusTag status="unknown" label={p} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="italic" style={{ color: '#f6c14b' }}>
                      AI is unsure / inconsistent here. Run a scan to see current beliefs.
                    </p>
                  )}
                </AIBeliefPanel>
              </SectionCard>

              {/* Integrations */}
              <SectionCard
                icon={<Puzzle className="w-5 h-5" style={{ color: 'rgba(255,255,255,0.6)' }} />}
                title="Integrations"
                subtitle="AI often assumes integrations based on competitors. List your real integrations here."
              >
                <div className="flex flex-wrap gap-2 mb-4">
                  {data.integrations.map((integration, idx) => (
                    <span 
                      key={idx}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm"
                      style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                    >
                      <span className="text-white">{integration}</span>
                      <button onClick={() => updateData({ integrations: data.integrations.filter((_, i) => i !== idx) })} className="cursor-pointer">
                        <X className="w-3 h-3" style={{ color: 'rgba(255,255,255,0.4)' }} />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newIntegration}
                    onChange={(e) => setNewIntegration(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newIntegration.trim()) {
                        updateData({ integrations: [...data.integrations, newIntegration.trim()] })
                        setNewIntegration('')
                      }
                    }}
                    className="flex-1 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                    style={{ 
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)'
                    }}
                    placeholder="Add integration (e.g., Slack, Salesforce)..."
                  />
                  <button
                    onClick={() => {
                      if (newIntegration.trim()) {
                        updateData({ integrations: [...data.integrations, newIntegration.trim()] })
                        setNewIntegration('')
                      }
                    }}
                    className="px-4 rounded-lg transition-all duration-200 cursor-pointer hover:bg-white/[0.08] hover:border-cyan-500/30"
                    style={{ 
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)'
                    }}
                  >
                    <Plus className="w-5 h-5" style={{ color: 'rgba(255,255,255,0.6)' }} />
                  </button>
                </div>
                
                <AIBeliefPanel title="AI currently thinks you integrate with:" isEmpty={!aiBeliefs.integrations || aiBeliefs.integrations.length === 0}>
                  {aiBeliefs.integrations && aiBeliefs.integrations.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {aiBeliefs.integrations.map((int, i) => (
                        <StatusTag key={i} status={int.status} label={int.name} />
                      ))}
                    </div>
                  ) : (
                    <p className="italic">Run a visibility scan to see what AI models believe.</p>
                  )}
                </AIBeliefPanel>
              </SectionCard>

              {/* Use Cases */}
              <SectionCard
                icon={<Users className="w-5 h-5" style={{ color: 'rgba(255,255,255,0.6)' }} />}
                title="Use Cases"
                subtitle="Tell Harbor the main use cases for your product. We compare these against how AI recommends your brand."
              >
                <div className="space-y-3">
                  {data.use_cases.map((uc, idx) => (
                    <div 
                      key={idx}
                      className="rounded-lg p-4 group relative transition-all duration-200 hover:bg-white/[0.02]"
                      style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
                    >
                      <button
                        onClick={() => updateData({ use_cases: data.use_cases.filter((_, i) => i !== idx) })}
                        className="absolute top-3 right-3 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        style={{ backgroundColor: 'rgba(255, 107, 107, 0.1)' }}
                      >
                        <X className="w-4 h-4" style={{ color: '#ff6b6b' }} />
                      </button>
                      <input
                        type="text"
                        value={uc.title}
                        onChange={(e) => {
                          const newUCs = [...data.use_cases]
                          newUCs[idx] = { ...uc, title: e.target.value }
                          updateData({ use_cases: newUCs })
                        }}
                        className="w-full bg-transparent text-white font-medium mb-2 focus:outline-none"
                        placeholder="Use case title"
                      />
                      <input
                        type="text"
                        value={uc.description}
                        onChange={(e) => {
                          const newUCs = [...data.use_cases]
                          newUCs[idx] = { ...uc, description: e.target.value }
                          updateData({ use_cases: newUCs })
                        }}
                        className="w-full bg-transparent text-sm focus:outline-none"
                        style={{ color: 'rgba(255,255,255,0.6)' }}
                        placeholder="One sentence description"
                      />
                    </div>
                  ))}
                  <button
                    onClick={() => updateData({ use_cases: [...data.use_cases, { title: '', description: '' }] })}
                    className="w-full py-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer hover:border-cyan-500/30 hover:bg-white/[0.02]"
                    style={{ 
                      backgroundColor: 'rgba(255,255,255,0.03)', 
                      border: '1px dashed rgba(255,255,255,0.1)',
                      color: 'rgba(255,255,255,0.5)'
                    }}
                  >
                    <Plus className="w-4 h-4" />
                    Add Use Case
                  </button>
                </div>
                
                <AIBeliefPanel title="AI currently recommends you for:" isEmpty={!aiBeliefs.use_cases || aiBeliefs.use_cases.length === 0}>
                  {aiBeliefs.use_cases && aiBeliefs.use_cases.length > 0 ? (
                    <ul className="space-y-1">
                      {aiBeliefs.use_cases.map((uc, i) => (
                        <li key={i}>• {uc}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="italic">Run a visibility scan to see what AI models believe.</p>
                  )}
                </AIBeliefPanel>
              </SectionCard>

              {/* Competitor Comparisons */}
              <SectionCard
                icon={<TrendingUp className="w-5 h-5" style={{ color: 'rgba(255,255,255,0.6)' }} />}
                title="Competitor Comparisons"
                subtitle='Control how your brand is positioned in "X vs Y" queries. Provide your official stance.'
              >
                <div className="space-y-3">
                  {data.competitor_context.map((comp, idx) => (
                    <div 
                      key={idx}
                      className="rounded-lg p-4 group relative transition-all duration-200 hover:bg-white/[0.02]"
                      style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
                    >
                      <button
                        onClick={() => updateData({ competitor_context: data.competitor_context.filter((_, i) => i !== idx) })}
                        className="absolute top-3 right-3 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        style={{ backgroundColor: 'rgba(255, 107, 107, 0.1)' }}
                      >
                        <X className="w-4 h-4" style={{ color: '#ff6b6b' }} />
                      </button>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-medium mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
                            Competitor
                          </label>
                          <input
                            type="text"
                            value={comp.competitor}
                            onChange={(e) => {
                              const newComps = [...data.competitor_context]
                              newComps[idx] = { ...comp, competitor: e.target.value }
                              updateData({ competitor_context: newComps })
                            }}
                            className="w-full rounded-lg px-3 py-2 text-white bg-transparent focus:outline-none"
                            style={{ border: '1px solid rgba(255,255,255,0.1)' }}
                            placeholder="Name"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-xs font-medium mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
                            Your Positioning
                          </label>
                          <input
                            type="text"
                            value={comp.positioning}
                            onChange={(e) => {
                              const newComps = [...data.competitor_context]
                              newComps[idx] = { ...comp, positioning: e.target.value }
                              updateData({ competitor_context: newComps })
                            }}
                            className="w-full rounded-lg px-3 py-2 text-white bg-transparent focus:outline-none"
                            style={{ border: '1px solid rgba(255,255,255,0.1)' }}
                            placeholder="How you differ from them"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => updateData({ competitor_context: [...data.competitor_context, { competitor: '', positioning: '' }] })}
                    className="w-full py-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer hover:border-cyan-500/30 hover:bg-white/[0.02]"
                    style={{ 
                      backgroundColor: 'rgba(255,255,255,0.03)', 
                      border: '1px dashed rgba(255,255,255,0.1)',
                      color: 'rgba(255,255,255,0.5)'
                    }}
                  >
                    <Plus className="w-4 h-4" />
                    Add Competitor Comparison
                  </button>
                </div>
                
                <AIBeliefPanel title="AI's current comparison summary:" isEmpty={!aiBeliefs.competitors || Object.keys(aiBeliefs.competitors).length === 0}>
                  {aiBeliefs.competitors && Object.keys(aiBeliefs.competitors).length > 0 ? (
                    <div className="space-y-2">
                      {Object.entries(aiBeliefs.competitors).map(([comp, summary], i) => (
                        <div key={i}>
                          <span className="font-medium">{comp}:</span> {summary}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="italic">Run a visibility scan to see AI's current comparisons.</p>
                  )}
                </AIBeliefPanel>
              </SectionCard>

              {/* FAQs */}
              <SectionCard
                icon={<MessageSquare className="w-5 h-5" style={{ color: 'rgba(255,255,255,0.6)' }} />}
                title="FAQs"
                subtitle="Add common questions users ask about your brand. Harbor checks AI's answers against your verified answers."
              >
                <div className="space-y-3">
                  {data.faqs.map((faq, idx) => (
                    <div 
                      key={idx}
                      className="rounded-lg p-4 group relative transition-all duration-200 hover:bg-white/[0.02]"
                      style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
                    >
                      <button
                        onClick={() => updateData({ faqs: data.faqs.filter((_, i) => i !== idx) })}
                        className="absolute top-3 right-3 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        style={{ backgroundColor: 'rgba(255, 107, 107, 0.1)' }}
                      >
                        <X className="w-4 h-4" style={{ color: '#ff6b6b' }} />
                      </button>
                      <input
                        type="text"
                        value={faq.question}
                        onChange={(e) => {
                          const newFaqs = [...data.faqs]
                          newFaqs[idx] = { ...faq, question: e.target.value }
                          updateData({ faqs: newFaqs })
                        }}
                        className="w-full bg-transparent text-white font-medium mb-2 focus:outline-none"
                        placeholder="Question?"
                      />
                      <textarea
                        value={faq.answer}
                        onChange={(e) => {
                          const newFaqs = [...data.faqs]
                          newFaqs[idx] = { ...faq, answer: e.target.value }
                          updateData({ faqs: newFaqs })
                        }}
                        className="w-full bg-transparent text-sm resize-none focus:outline-none"
                        style={{ color: 'rgba(255,255,255,0.6)' }}
                        rows={2}
                        placeholder="Your verified answer"
                      />
                    </div>
                  ))}
                  <button
                    onClick={() => updateData({ faqs: [...data.faqs, { question: '', answer: '' }] })}
                    className="w-full py-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer hover:border-cyan-500/30 hover:bg-white/[0.02]"
                    style={{ 
                      backgroundColor: 'rgba(255,255,255,0.03)', 
                      border: '1px dashed rgba(255,255,255,0.1)',
                      color: 'rgba(255,255,255,0.5)'
                    }}
                  >
                    <Plus className="w-4 h-4" />
                    Add FAQ
                  </button>
                </div>
                
                <AIBeliefPanel title="AI's current answers:" isEmpty={!aiBeliefs.faq_answers || Object.keys(aiBeliefs.faq_answers).length === 0}>
                  {aiBeliefs.faq_answers && Object.keys(aiBeliefs.faq_answers).length > 0 ? (
                    <div className="space-y-3">
                      {Object.entries(aiBeliefs.faq_answers).map(([q, a], i) => (
                        <div key={i}>
                          <p className="font-medium mb-1">{q}</p>
                          <p className="font-mono text-xs">{a}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="italic">Run a visibility scan to see AI's current answers.</p>
                  )}
                </AIBeliefPanel>
              </SectionCard>

              {/* Authoritative Sources */}
              <SectionCard
                icon={<LinkIcon className="w-5 h-5" style={{ color: 'rgba(255,255,255,0.6)' }} />}
                title="Authoritative Sources"
                subtitle="Add accurate sources you want Harbor to treat as authoritative when checking AI output."
              >
                <div className="space-y-3">
                  {data.authoritative_sources.map((source, idx) => (
                    <div 
                      key={idx}
                      className="flex items-center gap-3 group"
                    >
                      <input
                        type="url"
                        value={source.url}
                        onChange={(e) => {
                          const newSources = [...data.authoritative_sources]
                          newSources[idx] = { url: e.target.value }
                          updateData({ authoritative_sources: newSources })
                        }}
                        className="flex-1 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                        style={{ 
                          backgroundColor: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(255,255,255,0.1)'
                        }}
                        placeholder="https://..."
                      />
                      <button
                        onClick={() => updateData({ authoritative_sources: data.authoritative_sources.filter((_, i) => i !== idx) })}
                        className="p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        style={{ backgroundColor: 'rgba(255, 107, 107, 0.1)' }}
                      >
                        <X className="w-4 h-4" style={{ color: '#ff6b6b' }} />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => updateData({ authoritative_sources: [...data.authoritative_sources, { url: '' }] })}
                    className="w-full py-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer hover:border-cyan-500/30 hover:bg-white/[0.02]"
                    style={{ 
                      backgroundColor: 'rgba(255,255,255,0.03)', 
                      border: '1px dashed rgba(255,255,255,0.1)',
                      color: 'rgba(255,255,255,0.5)'
                    }}
                  >
                    <Plus className="w-4 h-4" />
                    Add Source
                  </button>
                </div>
                
                <AIBeliefPanel title="AI currently cites these sources:" isEmpty={!aiBeliefs.sources || aiBeliefs.sources.length === 0}>
                  {aiBeliefs.sources && aiBeliefs.sources.length > 0 ? (
                    <ul className="space-y-1 font-mono text-xs">
                      {aiBeliefs.sources.map((s, i) => (
                        <li key={i}>• {s}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="italic">Run a visibility scan to see sources AI cites.</p>
                  )}
                </AIBeliefPanel>
              </SectionCard>

              {/* Recent Updates */}
              <SectionCard
                icon={<Megaphone className="w-5 h-5" style={{ color: 'rgba(255,255,255,0.6)' }} />}
                title="Recent Updates"
                subtitle="AI models lag 6–18 months behind real-world changes. Add updates so Harbor can detect outdated AI summaries."
              >
                <div className="space-y-3">
                  {data.recent_updates.map((update, idx) => (
                    <div 
                      key={idx}
                      className="rounded-lg p-4 group relative transition-all duration-200 hover:bg-white/[0.02]"
                      style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
                    >
                      <button
                        onClick={() => updateData({ recent_updates: data.recent_updates.filter((_, i) => i !== idx) })}
                        className="absolute top-3 right-3 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        style={{ backgroundColor: 'rgba(255, 107, 107, 0.1)' }}
                      >
                        <X className="w-4 h-4" style={{ color: '#ff6b6b' }} />
                      </button>
                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                          <label className="block text-xs font-medium mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
                            Category
                          </label>
                          <select
                            value={update.category}
                            onChange={(e) => {
                              const newUpdates = [...data.recent_updates]
                              newUpdates[idx] = { ...update, category: e.target.value }
                              updateData({ recent_updates: newUpdates })
                            }}
                            className="w-full rounded-lg px-3 py-2 text-white focus:outline-none cursor-pointer"
                            style={{ 
                              backgroundColor: 'rgba(255,255,255,0.05)',
                              border: '1px solid rgba(255,255,255,0.1)'
                            }}
                          >
                            <option value="">Select...</option>
                            <option value="fundraising">Fundraising</option>
                            <option value="product_launch">Product Launch</option>
                            <option value="rebrand">Rebrand</option>
                            <option value="partnership">Partnership</option>
                            <option value="acquisition">Acquisition</option>
                            <option value="shutdown">Shutdown / Pivot</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
                            Date
                          </label>
                          <input
                            type="date"
                            value={update.date}
                            onChange={(e) => {
                              const newUpdates = [...data.recent_updates]
                              newUpdates[idx] = { ...update, date: e.target.value }
                              updateData({ recent_updates: newUpdates })
                            }}
                            className="w-full rounded-lg px-3 py-2 text-white focus:outline-none"
                            style={{ 
                              backgroundColor: 'rgba(255,255,255,0.05)',
                              border: '1px solid rgba(255,255,255,0.1)'
                            }}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
                          Description
                        </label>
                        <input
                          type="text"
                          value={update.description}
                          onChange={(e) => {
                            const newUpdates = [...data.recent_updates]
                            newUpdates[idx] = { ...update, description: e.target.value }
                            updateData({ recent_updates: newUpdates })
                          }}
                          className="w-full rounded-lg px-3 py-2 text-white bg-transparent focus:outline-none"
                          style={{ border: '1px solid rgba(255,255,255,0.1)' }}
                          placeholder="Brief description of the update"
                        />
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => updateData({ recent_updates: [...data.recent_updates, { category: '', description: '', date: '' }] })}
                    className="w-full py-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer hover:border-cyan-500/30 hover:bg-white/[0.02]"
                    style={{ 
                      backgroundColor: 'rgba(255,255,255,0.03)', 
                      border: '1px dashed rgba(255,255,255,0.1)',
                      color: 'rgba(255,255,255,0.5)'
                    }}
                  >
                    <Plus className="w-4 h-4" />
                    Add Update
                  </button>
                </div>
                
                <AIBeliefPanel title="AI awareness status:" isEmpty={false}>
                  <p className="italic" style={{ color: '#f6c14b' }}>
                    AI is not aware of these updates yet.
                  </p>
                </AIBeliefPanel>
              </SectionCard>

            </div>

            {/* ============================================================ */}
            {/* Right Column - AI Readiness Score Card */}
            {/* ============================================================ */}
            <div className="w-80 flex-shrink-0 hidden lg:block">
              <div 
                className="sticky top-8 rounded-xl p-6"
                style={{ 
                  backgroundColor: '#111b2c',
                  border: '1px solid rgba(255, 255, 255, 0.05)'
                }}
              >
                <h3 className="text-sm font-semibold mb-4" style={{ color: 'rgba(255,255,255,0.7)' }}>
                  AI Readiness Score
                </h3>
                
                {/* Score Ring - Gradient version */}
                <div className="flex items-center justify-center mb-6">
                  <div 
                    className="relative w-32 h-32 rounded-full flex items-center justify-center p-1"
                    style={{ 
                      background: `conic-gradient(from 180deg, #22d3ee 0%, #a855f7 ${visibilityScore}%, rgba(255,255,255,0.08) ${visibilityScore}%)`
                    }}
                  >
                    <div 
                      className="w-full h-full rounded-full flex items-center justify-center"
                      style={{ backgroundColor: '#111b2c' }}
                    >
                      <span 
                        className="text-3xl font-bold"
                        style={{ 
                          background: 'linear-gradient(135deg, #22d3ee 0%, #a855f7 100%)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text'
                        }}
                      >
                        {visibilityScore}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Stats */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>Trend</span>
                    <span className="flex items-center gap-1 text-sm" style={{ color: scoreTrend === 'up' ? '#3fbf75' : scoreTrend === 'down' ? '#ff6b6b' : 'rgba(255,255,255,0.5)' }}>
                      {scoreTrend === 'up' && <TrendingUp className="w-4 h-4" />}
                      {scoreTrend === 'down' && <TrendingDown className="w-4 h-4" />}
                      {scoreTrend === 'up' ? 'Improving' : scoreTrend === 'down' ? 'Declining' : 'Stable'}
                    </span>
                  </div>
                  {globalRank && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>Global Rank</span>
                      <span className="text-sm text-white font-medium">#{globalRank}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>Last Scan</span>
                    <span className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
                      {formatDate(lastScanDate)}
                    </span>
                  </div>
                </div>
                
                {/* CTA */}
                <button
                  className="w-full py-3 rounded-lg font-medium text-white flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer hover:opacity-90 hover:shadow-lg"
                  style={{ 
                    background: 'linear-gradient(135deg, #22d3ee 0%, #3b82f6 100%)'
                  }}
                >
                  <RefreshCw className="w-4 h-4" />
                  Run Visibility Scan
                </button>
                
                <p className="text-xs mt-4 text-center" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  This score reflects how consistently AI models interpret and describe your brand. It updates after each new scan.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* Floating Save Button */}
        {/* ============================================================ */}
        {hasChanges && (
          <div className="fixed bottom-8 right-8 z-50">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-3 px-6 py-3 rounded-xl font-semibold text-white transition-all duration-200 cursor-pointer"
              style={{ 
                background: '#111b2c',
                boxShadow: '0 4px 24px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(34, 211, 238, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#0d1520'
                e.currentTarget.style.boxShadow = '0 4px 32px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(34, 211, 238, 0.4)'
                e.currentTarget.style.borderColor = 'rgba(34, 211, 238, 0.3)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#111b2c'
                e.currentTarget.style.boxShadow = '0 4px 24px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(34, 211, 238, 0.2)'
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)'
              }}
            >
              <Save className="w-5 h-5" style={{ color: '#22d3ee' }} />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}

        {/* Success Toast */}
        {saveSuccess && (
          <div 
            className="fixed top-24 right-6 rounded-xl shadow-2xl p-4 flex items-center gap-3 z-50"
            style={{ 
              backgroundColor: '#111b2c', 
              border: '1px solid rgba(63, 191, 117, 0.3)'
            }}
          >
            <Check className="w-5 h-5" style={{ color: '#3fbf75' }} />
            <span className="text-sm font-medium text-white">
              Your verified information has been updated.
            </span>
          </div>
        )}
      </div>
    </>
  )
}