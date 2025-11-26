// apps/web/app/dashboard/brand-settings/page.tsx
// Brand Settings - "Fix what AI gets wrong about you"

'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  Building2, ChevronDown, ChevronRight, Check, AlertTriangle,
  Plus, X, Save, ExternalLink, Sparkles, Shield, Clock,
  DollarSign, Puzzle, Users, MessageSquare, AlertCircle,
  Link as LinkIcon, FileText, Megaphone, Lock, Info,
  Edit3, Eye, TrendingUp
} from 'lucide-react'
import Link from 'next/link'
import { useBrand } from '@/contexts/BrandContext'
import MobileHeader from '@/components/layout/MobileHeader'

// ============================================================================
// TYPES
// ============================================================================

interface BrandData {
  // Identity (pre-filled from crawl)
  brand_name: string
  logo_url: string | null
  domain: string
  category: string
  
  // Core info (pre-filled from crawl)
  description: string
  offerings: Array<{ name: string; description: string; type: string }>
  faqs: Array<{ question: string; answer: string }>
  company_info: {
    hq_location: string
    founded_year: string
    employee_count: string
  }
  
  // Hallucination zones (user adds)
  pricing: {
    model: string // 'free' | 'freemium' | 'paid' | 'enterprise' | 'custom'
    starting_price: string
    has_free_tier: boolean
    pricing_url: string
    tiers: Array<{ name: string; price: string; description: string }>
  }
  integrations: string[]
  use_cases: Array<{ segment: string; use_case: string }>
  corrections: Array<{ misconception: string; reality: string }>
  competitor_context: Array<{ competitor: string; difference: string }>
  authoritative_sources: Array<{ label: string; url: string }>
  
  // Sticky / retention (user adds)
  recent_updates: Array<{ date: string; title: string; description: string; type: string }>
  security_compliance: {
    certifications: string[]
    compliance: string[]
    security_page_url: string
  }
}

interface SectionProps {
  id: string
  title: string
  icon: React.ReactNode
  status: 'complete' | 'incomplete' | 'warning'
  statusText: string
  isExpanded: boolean
  onToggle: () => void
  children: React.ReactNode
  impactText?: string
}

// ============================================================================
// SECTION COMPONENT
// ============================================================================

function Section({ id, title, icon, status, statusText, isExpanded, onToggle, children, impactText }: SectionProps) {
  const statusColors = {
    complete: { bg: 'rgba(34, 197, 94, 0.1)', border: 'rgba(34, 197, 94, 0.2)', text: 'var(--accent-green)' },
    incomplete: { bg: 'rgba(251, 191, 36, 0.1)', border: 'rgba(251, 191, 36, 0.2)', text: 'var(--accent-amber)' },
    warning: { bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.2)', text: 'var(--accent-coral)' }
  }
  
  const colors = statusColors[status]
  
  return (
    <div 
      className="rounded-xl overflow-hidden transition-all"
      style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
    >
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: 'var(--bg-muted)' }}
          >
            {icon}
          </div>
          <div className="text-left">
            <h3 className="font-medium" style={{ color: 'var(--text-primary)' }}>{title}</h3>
            {impactText && (
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{impactText}</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <span 
            className="text-xs px-2 py-1 rounded-full font-medium"
            style={{ backgroundColor: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}
          >
            {statusText}
          </span>
          {isExpanded ? (
            <ChevronDown className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
          ) : (
            <ChevronRight className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
          )}
        </div>
      </button>
      
      {isExpanded && (
        <div className="px-4 pb-4 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
          {children}
        </div>
      )}
    </div>
  )
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function BrandSettingsPage() {
  const { currentDashboard, refreshDashboards } = useBrand()
  
  const [data, setData] = useState<BrandData>({
    brand_name: '',
    logo_url: null,
    domain: '',
    category: '',
    description: '',
    offerings: [],
    faqs: [],
    company_info: { hq_location: '', founded_year: '', employee_count: '' },
    pricing: { model: '', starting_price: '', has_free_tier: false, pricing_url: '', tiers: [] },
    integrations: [],
    use_cases: [],
    corrections: [],
    competitor_context: [],
    authoritative_sources: [],
    recent_updates: [],
    security_compliance: { certifications: [], compliance: [], security_page_url: '' }
  })
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})
  const [publicProfile, setPublicProfile] = useState<any>(null)
  
  // Temp input states
  const [newIntegration, setNewIntegration] = useState('')
  const [newCertification, setNewCertification] = useState('')
  const [newCompliance, setNewCompliance] = useState('')

  // ============================================================================
  // LOAD DATA
  // ============================================================================
  
  useEffect(() => {
    async function loadData() {
      if (!currentDashboard) {
        setLoading(false)
        return
      }

      // Start with dashboard data
      const dashboardData: Partial<BrandData> = {
        brand_name: currentDashboard.brand_name || '',
        logo_url: currentDashboard.logo_url || null,
        domain: currentDashboard.domain || '',
        category: currentDashboard.metadata?.category || '',
        description: currentDashboard.metadata?.description || '',
      }
      
      // Try to fetch public profile by domain for crawled data
      try {
        const domain = currentDashboard.domain?.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0]
        if (domain) {
          const res = await fetch(`/api/brands?domain=${encodeURIComponent(domain)}`)
          if (res.ok) {
            const result = await res.json()
            if (result.profile) {
              setPublicProfile(result.profile)
              
              // Merge crawled data
              const fd = result.profile.feed_data || {}
              dashboardData.description = fd.short_description || dashboardData.description
              dashboardData.offerings = fd.offerings || []
              dashboardData.faqs = fd.faqs || []
              dashboardData.company_info = {
                hq_location: fd.company_info?.hq_location || '',
                founded_year: fd.company_info?.founded_year?.toString() || '',
                employee_count: fd.company_info?.employee_band || ''
              }
              
              // Load any existing hallucination-zone data
              dashboardData.pricing = fd.pricing || { model: '', starting_price: '', has_free_tier: false, pricing_url: '', tiers: [] }
              dashboardData.integrations = fd.integrations || []
              dashboardData.use_cases = fd.use_cases || []
              dashboardData.corrections = fd.corrections || []
              dashboardData.competitor_context = fd.competitor_context || []
              dashboardData.authoritative_sources = fd.authoritative_sources || []
              dashboardData.recent_updates = fd.recent_updates || []
              dashboardData.security_compliance = fd.security_compliance || { certifications: [], compliance: [], security_page_url: '' }
            }
          }
        }
      } catch (error) {
        console.error('Error loading public profile:', error)
      }
      
      setData(prev => ({ ...prev, ...dashboardData }))
      setLoading(false)
    }

    loadData()
  }, [currentDashboard])

  // ============================================================================
  // CALCULATE AI READINESS SCORE
  // ============================================================================
  
  const calculateReadinessScore = (): { score: number; maxScore: number; breakdown: Record<string, number> } => {
    let score = 0
    const breakdown: Record<string, number> = {}
    
    // Core info (30 points)
    if (data.description && data.description.length >= 50) { score += 10; breakdown.description = 10 }
    if (data.offerings.length >= 1) { score += 10; breakdown.offerings = 10 }
    if (data.faqs.length >= 2) { score += 10; breakdown.faqs = 10 }
    
    // Hallucination zones (50 points) - this is the moat
    if (data.pricing.model) { score += 10; breakdown.pricing = 10 }
    if (data.integrations.length >= 3) { score += 10; breakdown.integrations = 10 }
    if (data.use_cases.length >= 2) { score += 10; breakdown.use_cases = 10 }
    if (data.corrections.length >= 1) { score += 10; breakdown.corrections = 10 }
    if (data.competitor_context.length >= 1) { score += 10; breakdown.competitor_context = 10 }
    
    // Freshness & trust (20 points)
    if (data.recent_updates.length >= 1) { score += 10; breakdown.recent_updates = 10 }
    if (data.security_compliance.certifications.length >= 1 || data.security_compliance.compliance.length >= 1) { 
      score += 10; breakdown.security = 10 
    }
    
    return { score, maxScore: 100, breakdown }
  }
  
  const { score: readinessScore, breakdown: scoreBreakdown } = calculateReadinessScore()

  // ============================================================================
  // SECTION STATUS HELPERS
  // ============================================================================
  
  const getSectionStatus = (sectionId: string): { status: 'complete' | 'incomplete' | 'warning'; text: string } => {
    switch (sectionId) {
      case 'description':
        if (data.description && data.description.length >= 50) return { status: 'complete', text: 'Verified' }
        if (data.description) return { status: 'incomplete', text: 'Too short' }
        return { status: 'warning', text: 'Missing' }
        
      case 'offerings':
        if (data.offerings.length >= 1) return { status: 'complete', text: `${data.offerings.length} products` }
        return { status: 'warning', text: 'AI will guess' }
        
      case 'pricing':
        if (data.pricing.model) return { status: 'complete', text: 'Added' }
        return { status: 'warning', text: 'AI hallucinates this' }
        
      case 'integrations':
        if (data.integrations.length >= 3) return { status: 'complete', text: `${data.integrations.length} listed` }
        if (data.integrations.length > 0) return { status: 'incomplete', text: `${data.integrations.length} listed` }
        return { status: 'warning', text: 'AI invents these' }
        
      case 'use_cases':
        if (data.use_cases.length >= 2) return { status: 'complete', text: `${data.use_cases.length} defined` }
        if (data.use_cases.length > 0) return { status: 'incomplete', text: `${data.use_cases.length} defined` }
        return { status: 'incomplete', text: 'Not defined' }
        
      case 'faqs':
        if (data.faqs.length >= 3) return { status: 'complete', text: `${data.faqs.length} FAQs` }
        if (data.faqs.length > 0) return { status: 'incomplete', text: `${data.faqs.length} FAQs` }
        return { status: 'incomplete', text: 'None added' }
        
      case 'corrections':
        if (data.corrections.length >= 1) return { status: 'complete', text: `${data.corrections.length} corrections` }
        return { status: 'incomplete', text: 'None added' }
        
      case 'competitor_context':
        if (data.competitor_context.length >= 1) return { status: 'complete', text: `${data.competitor_context.length} comparisons` }
        return { status: 'incomplete', text: 'Not defined' }
        
      case 'authoritative_sources':
        if (data.authoritative_sources.length >= 2) return { status: 'complete', text: `${data.authoritative_sources.length} sources` }
        if (data.authoritative_sources.length > 0) return { status: 'incomplete', text: `${data.authoritative_sources.length} source` }
        return { status: 'incomplete', text: 'AI cites random blogs' }
        
      case 'recent_updates':
        if (data.recent_updates.length >= 1) return { status: 'complete', text: 'Up to date' }
        return { status: 'incomplete', text: 'No updates shared' }
        
      case 'security':
        const hasAny = data.security_compliance.certifications.length > 0 || data.security_compliance.compliance.length > 0
        if (hasAny) return { status: 'complete', text: 'Added' }
        return { status: 'incomplete', text: 'Not added' }
        
      default:
        return { status: 'incomplete', text: 'Incomplete' }
    }
  }

  // ============================================================================
  // HANDLERS
  // ============================================================================
  
  const toggleSection = (id: string) => {
    setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }))
  }
  
  const updateData = (updates: Partial<BrandData>) => {
    setData(prev => ({ ...prev, ...updates }))
    setHasChanges(true)
  }

  const handleSave = async () => {
    if (!currentDashboard) return
    
    setSaving(true)
    setSaveSuccess(false)

    try {
      // If we have a public profile, update it
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
            // New fields
            pricing: data.pricing,
            integrations: data.integrations,
            use_cases: data.use_cases,
            corrections: data.corrections,
            competitor_context: data.competitor_context,
            authoritative_sources: data.authoritative_sources,
            recent_updates: data.recent_updates,
            security_compliance: data.security_compliance
          })
        })
      }

      // Also update dashboard metadata
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

  // ============================================================================
  // LOADING & EMPTY STATES
  // ============================================================================
  
  if (loading) {
    return (
      <>
        <MobileHeader />
        <div className="max-w-4xl mx-auto animate-pulse space-y-6 pt-20 lg:pt-0 px-4">
          <div className="h-32 rounded-xl" style={{ backgroundColor: 'var(--bg-card)' }} />
          <div className="h-20 rounded-xl" style={{ backgroundColor: 'var(--bg-card)' }} />
          <div className="h-20 rounded-xl" style={{ backgroundColor: 'var(--bg-card)' }} />
        </div>
      </>
    )
  }

  if (!currentDashboard) {
    return (
      <>
        <MobileHeader />
        <div className="max-w-4xl mx-auto pt-20 lg:pt-0 px-4">
          <div 
            className="rounded-xl p-12 text-center"
            style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
          >
            <Building2 className="w-16 h-16 mx-auto mb-6 opacity-30" style={{ color: 'var(--text-secondary)' }} />
            <h2 className="text-2xl font-heading font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
              No Brand Selected
            </h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              Select a brand from the sidebar to manage its AI profile.
            </p>
          </div>
        </div>
      </>
    )
  }

  // ============================================================================
  // FIND TOP ISSUES
  // ============================================================================
  
  const getTopIssues = () => {
    const issues: Array<{ id: string; text: string; impact: string }> = []
    
    if (!data.pricing.model) {
      issues.push({ id: 'pricing', text: 'Pricing info missing', impact: 'AI will guess or use outdated data' })
    }
    if (data.integrations.length === 0) {
      issues.push({ id: 'integrations', text: 'No integrations listed', impact: 'AI invents integration claims' })
    }
    if (data.corrections.length === 0) {
      issues.push({ id: 'corrections', text: 'No corrections added', impact: 'AI may repeat misconceptions' })
    }
    if (data.recent_updates.length === 0) {
      issues.push({ id: 'recent_updates', text: 'No recent updates', impact: 'AI uses stale training data' })
    }
    
    return issues.slice(0, 3)
  }
  
  const topIssues = getTopIssues()

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <>
      <MobileHeader />
      <div className="max-w-4xl mx-auto pt-20 lg:pt-0 px-4 pb-24">
        
        {/* Header with Score */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-heading font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                AI Profile for {data.brand_name || 'Your Brand'}
              </h1>
              <p style={{ color: 'var(--text-secondary)' }}>
                Control what AI models say about you
              </p>
            </div>
            
            {/* AI Readiness Score */}
            <div 
              className="text-center px-6 py-4 rounded-xl"
              style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
            >
              <div className="text-3xl font-bold mb-1" style={{ color: 'var(--accent-teal)' }}>
                {readinessScore}
              </div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                AI Readiness
              </div>
            </div>
          </div>
          
          {/* Top Issues Alert */}
          {topIssues.length > 0 && (
            <div 
              className="rounded-xl p-4"
              style={{ backgroundColor: 'rgba(251, 191, 36, 0.1)', border: '1px solid rgba(251, 191, 36, 0.2)' }}
            >
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--accent-amber)' }} />
                <div className="flex-1">
                  <p className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                    AI might get these wrong about {data.brand_name || 'you'}:
                  </p>
                  <div className="space-y-1">
                    {topIssues.map((issue, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setExpandedSections(prev => ({ ...prev, [issue.id]: true }))
                          document.getElementById(`section-${issue.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                        }}
                        className="flex items-center gap-2 text-sm hover:underline"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        <span>•</span>
                        <span>{issue.text}</span>
                        <span style={{ color: 'var(--text-muted)' }}>— {issue.impact}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Section Groups */}
        <div className="space-y-8">
          
          {/* Group 1: What We Crawled */}
          <div>
            <h2 className="text-sm font-medium uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
              <Eye className="w-4 h-4" />
              What AI Found (Verify This)
            </h2>
            <div className="space-y-3">
              
              {/* Description */}
              <div id="section-description">
                <Section
                  id="description"
                  title="Brand Description"
                  icon={<FileText className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />}
                  status={getSectionStatus('description').status}
                  statusText={getSectionStatus('description').text}
                  isExpanded={expandedSections.description || false}
                  onToggle={() => toggleSection('description')}
                  impactText="How AI explains what you do"
                >
                  <div className="space-y-3">
                    <textarea
                      value={data.description}
                      onChange={(e) => updateData({ description: e.target.value })}
                      className="input-field resize-none w-full"
                      rows={4}
                      placeholder="Describe what your company does, who you serve, and what makes you different..."
                    />
                    <div className="flex justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
                      <span>{data.description.length} characters</span>
                      <span>{data.description.length >= 50 ? '✓ Good length' : 'Aim for 50+ characters'}</span>
                    </div>
                  </div>
                </Section>
              </div>
              
              {/* Products & Services */}
              <div id="section-offerings">
                <Section
                  id="offerings"
                  title="Products & Services"
                  icon={<Building2 className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />}
                  status={getSectionStatus('offerings').status}
                  statusText={getSectionStatus('offerings').text}
                  isExpanded={expandedSections.offerings || false}
                  onToggle={() => toggleSection('offerings')}
                  impactText="What AI recommends you for"
                >
                  <div className="space-y-3">
                    {data.offerings.map((offering, idx) => (
                      <div 
                        key={idx} 
                        className="p-3 rounded-lg relative group"
                        style={{ backgroundColor: 'var(--bg-muted)', border: '1px solid var(--border)' }}
                      >
                        <button
                          onClick={() => updateData({ offerings: data.offerings.filter((_, i) => i !== idx) })}
                          className="absolute top-2 right-2 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                        >
                          <X className="w-3 h-3" style={{ color: 'var(--accent-coral)' }} />
                        </button>
                        <input
                          type="text"
                          value={offering.name}
                          onChange={(e) => {
                            const newOfferings = [...data.offerings]
                            newOfferings[idx] = { ...offering, name: e.target.value }
                            updateData({ offerings: newOfferings })
                          }}
                          className="input-field w-full mb-2"
                          placeholder="Product name"
                        />
                        <textarea
                          value={offering.description}
                          onChange={(e) => {
                            const newOfferings = [...data.offerings]
                            newOfferings[idx] = { ...offering, description: e.target.value }
                            updateData({ offerings: newOfferings })
                          }}
                          className="input-field w-full resize-none"
                          rows={2}
                          placeholder="Brief description"
                        />
                      </div>
                    ))}
                    <button
                      onClick={() => updateData({ offerings: [...data.offerings, { name: '', description: '', type: 'product_line' }] })}
                      className="btn-secondary w-full py-2 text-sm"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Product or Service
                    </button>
                  </div>
                </Section>
              </div>

              {/* FAQs */}
              <div id="section-faqs">
                <Section
                  id="faqs"
                  title="FAQs"
                  icon={<MessageSquare className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />}
                  status={getSectionStatus('faqs').status}
                  statusText={getSectionStatus('faqs').text}
                  isExpanded={expandedSections.faqs || false}
                  onToggle={() => toggleSection('faqs')}
                  impactText="Answers AI gives about you"
                >
                  <div className="space-y-3">
                    {data.faqs.map((faq, idx) => (
                      <div 
                        key={idx} 
                        className="p-3 rounded-lg relative group"
                        style={{ backgroundColor: 'var(--bg-muted)', border: '1px solid var(--border)' }}
                      >
                        <button
                          onClick={() => updateData({ faqs: data.faqs.filter((_, i) => i !== idx) })}
                          className="absolute top-2 right-2 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                        >
                          <X className="w-3 h-3" style={{ color: 'var(--accent-coral)' }} />
                        </button>
                        <input
                          type="text"
                          value={faq.question}
                          onChange={(e) => {
                            const newFaqs = [...data.faqs]
                            newFaqs[idx] = { ...faq, question: e.target.value }
                            updateData({ faqs: newFaqs })
                          }}
                          className="input-field w-full mb-2 font-medium"
                          placeholder="Question?"
                        />
                        <textarea
                          value={faq.answer}
                          onChange={(e) => {
                            const newFaqs = [...data.faqs]
                            newFaqs[idx] = { ...faq, answer: e.target.value }
                            updateData({ faqs: newFaqs })
                          }}
                          className="input-field w-full resize-none"
                          rows={2}
                          placeholder="Answer"
                        />
                      </div>
                    ))}
                    <button
                      onClick={() => updateData({ faqs: [...data.faqs, { question: '', answer: '' }] })}
                      className="btn-secondary w-full py-2 text-sm"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add FAQ
                    </button>
                  </div>
                </Section>
              </div>
            </div>
          </div>

          {/* Group 2: What AI Gets Wrong */}
          <div>
            <h2 className="text-sm font-medium uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
              <AlertTriangle className="w-4 h-4" />
              What AI Guesses (Fix This)
            </h2>
            <div className="space-y-3">
              
              {/* Pricing */}
              <div id="section-pricing">
                <Section
                  id="pricing"
                  title="Pricing & Plans"
                  icon={<DollarSign className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />}
                  status={getSectionStatus('pricing').status}
                  statusText={getSectionStatus('pricing').text}
                  isExpanded={expandedSections.pricing || false}
                  onToggle={() => toggleSection('pricing')}
                  impactText="AI guesses pricing constantly"
                >
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                          Pricing Model
                        </label>
                        <select
                          value={data.pricing.model}
                          onChange={(e) => updateData({ pricing: { ...data.pricing, model: e.target.value } })}
                          className="input-field w-full"
                        >
                          <option value="">Select...</option>
                          <option value="free">Free</option>
                          <option value="freemium">Freemium</option>
                          <option value="paid">Paid</option>
                          <option value="enterprise">Enterprise / Contact Sales</option>
                          <option value="usage">Usage-based</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                          Starting Price
                        </label>
                        <input
                          type="text"
                          value={data.pricing.starting_price}
                          onChange={(e) => updateData({ pricing: { ...data.pricing, starting_price: e.target.value } })}
                          className="input-field w-full"
                          placeholder="e.g., $29/mo, Free, Contact us"
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="has_free_tier"
                        checked={data.pricing.has_free_tier}
                        onChange={(e) => updateData({ pricing: { ...data.pricing, has_free_tier: e.target.checked } })}
                        className="w-4 h-4 rounded"
                      />
                      <label htmlFor="has_free_tier" className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        We offer a free tier
                      </label>
                    </div>
                    
                    <div>
                      <label className="block text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                        Pricing Page URL
                      </label>
                      <input
                        type="url"
                        value={data.pricing.pricing_url}
                        onChange={(e) => updateData({ pricing: { ...data.pricing, pricing_url: e.target.value } })}
                        className="input-field w-full"
                        placeholder="https://yoursite.com/pricing"
                      />
                    </div>
                  </div>
                </Section>
              </div>

              {/* Integrations */}
              <div id="section-integrations">
                <Section
                  id="integrations"
                  title="Integrations"
                  icon={<Puzzle className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />}
                  status={getSectionStatus('integrations').status}
                  statusText={getSectionStatus('integrations').text}
                  isExpanded={expandedSections.integrations || false}
                  onToggle={() => toggleSection('integrations')}
                  impactText="AI invents these constantly"
                >
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {data.integrations.map((integration, idx) => (
                        <span 
                          key={idx}
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm"
                          style={{ backgroundColor: 'var(--bg-muted)', border: '1px solid var(--border)' }}
                        >
                          <span style={{ color: 'var(--text-primary)' }}>{integration}</span>
                          <button onClick={() => updateData({ integrations: data.integrations.filter((_, i) => i !== idx) })}>
                            <X className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />
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
                        className="input-field flex-1"
                        placeholder="e.g., Slack, Salesforce, Zapier..."
                      />
                      <button
                        onClick={() => {
                          if (newIntegration.trim()) {
                            updateData({ integrations: [...data.integrations, newIntegration.trim()] })
                            setNewIntegration('')
                          }
                        }}
                        className="btn-secondary px-4"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </Section>
              </div>

              {/* Use Cases */}
              <div id="section-use_cases">
                <Section
                  id="use_cases"
                  title="Use Cases"
                  icon={<Users className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />}
                  status={getSectionStatus('use_cases').status}
                  statusText={getSectionStatus('use_cases').text}
                  isExpanded={expandedSections.use_cases || false}
                  onToggle={() => toggleSection('use_cases')}
                  impactText="Who AI recommends you to"
                >
                  <div className="space-y-3">
                    {data.use_cases.map((useCase, idx) => (
                      <div 
                        key={idx} 
                        className="p-3 rounded-lg relative group flex gap-3"
                        style={{ backgroundColor: 'var(--bg-muted)', border: '1px solid var(--border)' }}
                      >
                        <button
                          onClick={() => updateData({ use_cases: data.use_cases.filter((_, i) => i !== idx) })}
                          className="absolute top-2 right-2 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                        >
                          <X className="w-3 h-3" style={{ color: 'var(--accent-coral)' }} />
                        </button>
                        <input
                          type="text"
                          value={useCase.segment}
                          onChange={(e) => {
                            const newUseCases = [...data.use_cases]
                            newUseCases[idx] = { ...useCase, segment: e.target.value }
                            updateData({ use_cases: newUseCases })
                          }}
                          className="input-field flex-1"
                          placeholder="Who (e.g., Startups, Enterprise)"
                        />
                        <input
                          type="text"
                          value={useCase.use_case}
                          onChange={(e) => {
                            const newUseCases = [...data.use_cases]
                            newUseCases[idx] = { ...useCase, use_case: e.target.value }
                            updateData({ use_cases: newUseCases })
                          }}
                          className="input-field flex-1"
                          placeholder="For what (e.g., Team collaboration)"
                        />
                      </div>
                    ))}
                    <button
                      onClick={() => updateData({ use_cases: [...data.use_cases, { segment: '', use_case: '' }] })}
                      className="btn-secondary w-full py-2 text-sm"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Use Case
                    </button>
                  </div>
                </Section>
              </div>

              {/* Corrections */}
              <div id="section-corrections">
                <Section
                  id="corrections"
                  title="Corrections"
                  icon={<AlertCircle className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />}
                  status={getSectionStatus('corrections').status}
                  statusText={getSectionStatus('corrections').text}
                  isExpanded={expandedSections.corrections || false}
                  onToggle={() => toggleSection('corrections')}
                  impactText="What AI gets wrong about you"
                >
                  <div className="space-y-3">
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      What do AI models commonly get wrong about your brand? Correct the record here.
                    </p>
                    {data.corrections.map((correction, idx) => (
                      <div 
                        key={idx} 
                        className="p-3 rounded-lg relative group"
                        style={{ backgroundColor: 'var(--bg-muted)', border: '1px solid var(--border)' }}
                      >
                        <button
                          onClick={() => updateData({ corrections: data.corrections.filter((_, i) => i !== idx) })}
                          className="absolute top-2 right-2 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                        >
                          <X className="w-3 h-3" style={{ color: 'var(--accent-coral)' }} />
                        </button>
                        <input
                          type="text"
                          value={correction.misconception}
                          onChange={(e) => {
                            const newCorrections = [...data.corrections]
                            newCorrections[idx] = { ...correction, misconception: e.target.value }
                            updateData({ corrections: newCorrections })
                          }}
                          className="input-field w-full mb-2"
                          placeholder="❌ AI says this (wrong)..."
                        />
                        <input
                          type="text"
                          value={correction.reality}
                          onChange={(e) => {
                            const newCorrections = [...data.corrections]
                            newCorrections[idx] = { ...correction, reality: e.target.value }
                            updateData({ corrections: newCorrections })
                          }}
                          className="input-field w-full"
                          placeholder="✓ The reality is..."
                        />
                      </div>
                    ))}
                    <button
                      onClick={() => updateData({ corrections: [...data.corrections, { misconception: '', reality: '' }] })}
                      className="btn-secondary w-full py-2 text-sm"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Correction
                    </button>
                  </div>
                </Section>
              </div>

              {/* Competitor Context */}
              <div id="section-competitor_context">
                <Section
                  id="competitor_context"
                  title="Competitor Differentiation"
                  icon={<TrendingUp className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />}
                  status={getSectionStatus('competitor_context').status}
                  statusText={getSectionStatus('competitor_context').text}
                  isExpanded={expandedSections.competitor_context || false}
                  onToggle={() => toggleSection('competitor_context')}
                  impactText="How AI compares you to others"
                >
                  <div className="space-y-3">
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      Help AI give accurate comparisons when users ask "X vs Y?"
                    </p>
                    {data.competitor_context.map((comp, idx) => (
                      <div 
                        key={idx} 
                        className="p-3 rounded-lg relative group"
                        style={{ backgroundColor: 'var(--bg-muted)', border: '1px solid var(--border)' }}
                      >
                        <button
                          onClick={() => updateData({ competitor_context: data.competitor_context.filter((_, i) => i !== idx) })}
                          className="absolute top-2 right-2 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                        >
                          <X className="w-3 h-3" style={{ color: 'var(--accent-coral)' }} />
                        </button>
                        <input
                          type="text"
                          value={comp.competitor}
                          onChange={(e) => {
                            const newComps = [...data.competitor_context]
                            newComps[idx] = { ...comp, competitor: e.target.value }
                            updateData({ competitor_context: newComps })
                          }}
                          className="input-field w-full mb-2"
                          placeholder="Compared to [competitor]..."
                        />
                        <input
                          type="text"
                          value={comp.difference}
                          onChange={(e) => {
                            const newComps = [...data.competitor_context]
                            newComps[idx] = { ...comp, difference: e.target.value }
                            updateData({ competitor_context: newComps })
                          }}
                          className="input-field w-full"
                          placeholder="We differ by..."
                        />
                      </div>
                    ))}
                    <button
                      onClick={() => updateData({ competitor_context: [...data.competitor_context, { competitor: '', difference: '' }] })}
                      className="btn-secondary w-full py-2 text-sm"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Comparison
                    </button>
                  </div>
                </Section>
              </div>

              {/* Authoritative Sources */}
              <div id="section-authoritative_sources">
                <Section
                  id="authoritative_sources"
                  title="Authoritative Sources"
                  icon={<LinkIcon className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />}
                  status={getSectionStatus('authoritative_sources').status}
                  statusText={getSectionStatus('authoritative_sources').text}
                  isExpanded={expandedSections.authoritative_sources || false}
                  onToggle={() => toggleSection('authoritative_sources')}
                  impactText="What AI should cite about you"
                >
                  <div className="space-y-3">
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      Tell AI which URLs are authoritative. Stop it from citing random blog posts.
                    </p>
                    {data.authoritative_sources.map((source, idx) => (
                      <div 
                        key={idx} 
                        className="p-3 rounded-lg relative group flex gap-3"
                        style={{ backgroundColor: 'var(--bg-muted)', border: '1px solid var(--border)' }}
                      >
                        <button
                          onClick={() => updateData({ authoritative_sources: data.authoritative_sources.filter((_, i) => i !== idx) })}
                          className="absolute top-2 right-2 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                        >
                          <X className="w-3 h-3" style={{ color: 'var(--accent-coral)' }} />
                        </button>
                        <input
                          type="text"
                          value={source.label}
                          onChange={(e) => {
                            const newSources = [...data.authoritative_sources]
                            newSources[idx] = { ...source, label: e.target.value }
                            updateData({ authoritative_sources: newSources })
                          }}
                          className="input-field w-1/3"
                          placeholder="Label (e.g., Docs)"
                        />
                        <input
                          type="url"
                          value={source.url}
                          onChange={(e) => {
                            const newSources = [...data.authoritative_sources]
                            newSources[idx] = { ...source, url: e.target.value }
                            updateData({ authoritative_sources: newSources })
                          }}
                          className="input-field flex-1"
                          placeholder="https://..."
                        />
                      </div>
                    ))}
                    <button
                      onClick={() => updateData({ authoritative_sources: [...data.authoritative_sources, { label: '', url: '' }] })}
                      className="btn-secondary w-full py-2 text-sm"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Source
                    </button>
                  </div>
                </Section>
              </div>
            </div>
          </div>

          {/* Group 3: Keep It Fresh */}
          <div>
            <h2 className="text-sm font-medium uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
              <Clock className="w-4 h-4" />
              Keep It Current
            </h2>
            <div className="space-y-3">
              
              {/* Recent Updates */}
              <div id="section-recent_updates">
                <Section
                  id="recent_updates"
                  title="Recent Updates"
                  icon={<Megaphone className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />}
                  status={getSectionStatus('recent_updates').status}
                  statusText={getSectionStatus('recent_updates').text}
                  isExpanded={expandedSections.recent_updates || false}
                  onToggle={() => toggleSection('recent_updates')}
                  impactText="AI training data is 6-18 months stale"
                >
                  <div className="space-y-3">
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      Share recent news: funding, product launches, partnerships, milestones.
                    </p>
                    {data.recent_updates.map((update, idx) => (
                      <div 
                        key={idx} 
                        className="p-3 rounded-lg relative group"
                        style={{ backgroundColor: 'var(--bg-muted)', border: '1px solid var(--border)' }}
                      >
                        <button
                          onClick={() => updateData({ recent_updates: data.recent_updates.filter((_, i) => i !== idx) })}
                          className="absolute top-2 right-2 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                        >
                          <X className="w-3 h-3" style={{ color: 'var(--accent-coral)' }} />
                        </button>
                        <div className="flex gap-3 mb-2">
                          <input
                            type="date"
                            value={update.date}
                            onChange={(e) => {
                              const newUpdates = [...data.recent_updates]
                              newUpdates[idx] = { ...update, date: e.target.value }
                              updateData({ recent_updates: newUpdates })
                            }}
                            className="input-field w-40"
                          />
                          <select
                            value={update.type}
                            onChange={(e) => {
                              const newUpdates = [...data.recent_updates]
                              newUpdates[idx] = { ...update, type: e.target.value }
                              updateData({ recent_updates: newUpdates })
                            }}
                            className="input-field w-40"
                          >
                            <option value="">Type...</option>
                            <option value="funding">Funding</option>
                            <option value="product">Product Launch</option>
                            <option value="partnership">Partnership</option>
                            <option value="milestone">Milestone</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                        <input
                          type="text"
                          value={update.title}
                          onChange={(e) => {
                            const newUpdates = [...data.recent_updates]
                            newUpdates[idx] = { ...update, title: e.target.value }
                            updateData({ recent_updates: newUpdates })
                          }}
                          className="input-field w-full mb-2"
                          placeholder="Headline"
                        />
                        <textarea
                          value={update.description}
                          onChange={(e) => {
                            const newUpdates = [...data.recent_updates]
                            newUpdates[idx] = { ...update, description: e.target.value }
                            updateData({ recent_updates: newUpdates })
                          }}
                          className="input-field w-full resize-none"
                          rows={2}
                          placeholder="Brief description"
                        />
                      </div>
                    ))}
                    <button
                      onClick={() => updateData({ recent_updates: [...data.recent_updates, { date: '', title: '', description: '', type: '' }] })}
                      className="btn-secondary w-full py-2 text-sm"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Update
                    </button>
                  </div>
                </Section>
              </div>

              {/* Security & Compliance */}
              <div id="section-security">
                <Section
                  id="security"
                  title="Security & Compliance"
                  icon={<Lock className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />}
                  status={getSectionStatus('security').status}
                  statusText={getSectionStatus('security').text}
                  isExpanded={expandedSections.security || false}
                  onToggle={() => toggleSection('security')}
                  impactText="AI makes up SOC2/GDPR claims"
                >
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                        Certifications (SOC2, ISO 27001, etc.)
                      </label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {data.security_compliance.certifications.map((cert, idx) => (
                          <span 
                            key={idx}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm"
                            style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)' }}
                          >
                            <Shield className="w-3 h-3" style={{ color: 'var(--accent-green)' }} />
                            <span style={{ color: 'var(--accent-green)' }}>{cert}</span>
                            <button onClick={() => updateData({ 
                              security_compliance: { 
                                ...data.security_compliance, 
                                certifications: data.security_compliance.certifications.filter((_, i) => i !== idx) 
                              } 
                            })}>
                              <X className="w-3 h-3" style={{ color: 'var(--accent-green)' }} />
                            </button>
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newCertification}
                          onChange={(e) => setNewCertification(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && newCertification.trim()) {
                              updateData({ 
                                security_compliance: { 
                                  ...data.security_compliance, 
                                  certifications: [...data.security_compliance.certifications, newCertification.trim()] 
                                } 
                              })
                              setNewCertification('')
                            }
                          }}
                          className="input-field flex-1"
                          placeholder="e.g., SOC 2 Type II"
                        />
                        <button
                          onClick={() => {
                            if (newCertification.trim()) {
                              updateData({ 
                                security_compliance: { 
                                  ...data.security_compliance, 
                                  certifications: [...data.security_compliance.certifications, newCertification.trim()] 
                                } 
                              })
                              setNewCertification('')
                            }
                          }}
                          className="btn-secondary px-4"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                        Compliance (GDPR, HIPAA, CCPA, etc.)
                      </label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {data.security_compliance.compliance.map((comp, idx) => (
                          <span 
                            key={idx}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm"
                            style={{ backgroundColor: 'rgba(34, 211, 238, 0.1)', border: '1px solid rgba(34, 211, 238, 0.2)' }}
                          >
                            <span style={{ color: 'var(--accent-teal)' }}>{comp}</span>
                            <button onClick={() => updateData({ 
                              security_compliance: { 
                                ...data.security_compliance, 
                                compliance: data.security_compliance.compliance.filter((_, i) => i !== idx) 
                              } 
                            })}>
                              <X className="w-3 h-3" style={{ color: 'var(--accent-teal)' }} />
                            </button>
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newCompliance}
                          onChange={(e) => setNewCompliance(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && newCompliance.trim()) {
                              updateData({ 
                                security_compliance: { 
                                  ...data.security_compliance, 
                                  compliance: [...data.security_compliance.compliance, newCompliance.trim()] 
                                } 
                              })
                              setNewCompliance('')
                            }
                          }}
                          className="input-field flex-1"
                          placeholder="e.g., GDPR Compliant"
                        />
                        <button
                          onClick={() => {
                            if (newCompliance.trim()) {
                              updateData({ 
                                security_compliance: { 
                                  ...data.security_compliance, 
                                  compliance: [...data.security_compliance.compliance, newCompliance.trim()] 
                                } 
                              })
                              setNewCompliance('')
                            }
                          }}
                          className="btn-secondary px-4"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                        Security Page URL
                      </label>
                      <input
                        type="url"
                        value={data.security_compliance.security_page_url}
                        onChange={(e) => updateData({ 
                          security_compliance: { ...data.security_compliance, security_page_url: e.target.value } 
                        })}
                        className="input-field w-full"
                        placeholder="https://yoursite.com/security"
                      />
                    </div>
                  </div>
                </Section>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Save Button */}
        {hasChanges && (
          <div className="fixed bottom-8 right-8 z-50">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-3 px-6 py-3 rounded-xl font-semibold text-white transition-all shadow-lg hover:scale-105"
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
            className="fixed top-24 right-6 rounded-xl shadow-2xl p-4 flex items-center gap-3 z-50"
            style={{ 
              backgroundColor: 'var(--bg-card)', 
              border: '1px solid var(--accent-green)',
              animation: 'fadeIn 0.2s ease-out'
            }}
          >
            <Check className="w-5 h-5" style={{ color: 'var(--accent-green)' }} />
            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              Profile updated — changes will appear in your AI feed
            </span>
          </div>
        )}
      </div>
    </>
  )
}