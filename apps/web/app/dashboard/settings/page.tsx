// apps/web/app/dashboard/settings/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { Settings, Building2, CreditCard, ChevronDown, Check, Loader2, ExternalLink, LifeBuoy } from 'lucide-react'
import { useBrand } from '@/contexts/BrandContext'
import MobileHeader from '@/components/layout/MobileHeader'

// Standardized industry list - keep in sync with ai_profiles and onboarding
const INDUSTRIES = [
  'Analytics & Business Intelligence',
  'Consulting & Professional Services',
  'Customer Support',
  'Cybersecurity',
  'Developer Tools',
  'E-commerce & Retail',
  'Education & E-learning',
  'Finance & Accounting',
  'Food & Beverage',
  'Healthcare & Medical',
  'HR & Recruiting',
  'Legal & Compliance',
  'Manufacturing & Logistics',
  'Marketing & Advertising',
  'Media & Entertainment',
  'Nonprofit & Government',
  'Project Management',
  'Real Estate',
  'Sales & CRM',
  'Technology & SaaS',
  'Travel & Hospitality',
]

export default function ControlCenterPage() {
  const { currentDashboard, isLoading: brandLoading, refreshDashboards } = useBrand()
  
  const [brandName, setBrandName] = useState('')
  const [domain, setDomain] = useState('')
  const [industry, setIndustry] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize form with current dashboard values
  useEffect(() => {
    if (currentDashboard) {
      setBrandName(currentDashboard.brand_name || '')
      setDomain(currentDashboard.domain || '')
      setIndustry(currentDashboard.metadata?.category || '')
    }
  }, [currentDashboard])

  // Check if form has changes
  const hasChanges = currentDashboard && (
    brandName !== currentDashboard.brand_name ||
    domain !== currentDashboard.domain ||
    industry !== (currentDashboard.metadata?.category || '')
  )

  const handleSave = async () => {
    if (!currentDashboard || !hasChanges) return
    
    setSaving(true)
    setError(null)
    setSaved(false)

    try {
      const response = await fetch('/api/dashboard/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dashboardId: currentDashboard.id,
          brandName: brandName.trim(),
          domain: domain.trim().toLowerCase(),
          industry,
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save')
      }

      setSaved(true)
      await refreshDashboards()
      
      // Reset saved state after 2s
      setTimeout(() => setSaved(false), 2000)
    } catch (err: any) {
      setError(err.message || 'Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  // Loading state
  if (brandLoading) {
    return (
      <>
        <MobileHeader />
        <div className="max-w-screen-xl mx-auto pt-20 lg:pt-0 px-4 lg:px-0">
          <div className="animate-pulse space-y-8">
            <div className="h-10 w-64 bg-border rounded"></div>
            <div className="bg-card rounded-lg p-6 border border-border h-64"></div>
          </div>
        </div>
      </>
    )
  }

  if (!currentDashboard) {
    return (
      <>
        <MobileHeader />
        <div className="max-w-screen-xl mx-auto pt-20 lg:pt-0 px-4 lg:px-0">
          <p className="text-secondary/60">No dashboard found</p>
        </div>
      </>
    )
  }

  const logoUrl = `https://cdn.brandfetch.io/${currentDashboard.domain}`

  return (
    <>
      <MobileHeader />
      <div className="max-w-screen-xl mx-auto pt-20 lg:pt-0 px-4 lg:px-0">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Settings className="w-6 h-6 lg:w-8 lg:h-8 text-[#22D3EE]" strokeWidth={1.5} />
            <h1 className="text-2xl lg:text-4xl font-heading font-bold text-primary">
              Control Center
            </h1>
          </div>
          <p className="text-sm text-secondary/60">
            Manage your brand settings, plan, and account
          </p>
        </div>

        <div className="grid gap-6 lg:gap-8">
          {/* Brand Settings Card */}
          <div className="bg-card rounded-xl border border-border">
            <div className="p-6 border-b border-border">
              <div className="flex items-center gap-3">
                <Building2 className="w-5 h-5 text-primary" strokeWidth={1.5} />
                <h2 className="text-lg font-heading font-semibold text-primary">
                  Brand Settings
                </h2>
              </div>
            </div>
            
            <div className="p-6">
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Logo Preview */}
                <div className="flex flex-col items-center lg:items-start gap-3">
                  <div className="w-24 h-24 rounded-xl bg-white/5 border border-border overflow-hidden flex items-center justify-center">
                    <img 
                      src={logoUrl}
                      alt={`${brandName} logo`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                        target.parentElement!.innerHTML = `<span class="text-3xl font-bold text-secondary/40">${brandName.charAt(0)}</span>`
                      }}
                    />
                  </div>
                  <p className="text-xs text-secondary/40 text-center lg:text-left">
                    Logo via Brandfetch
                  </p>
                </div>

                {/* Form Fields */}
                <div className="flex-1 space-y-5">
                  {/* Brand Name */}
                  <div>
                    <label className="block text-xs font-medium text-secondary/60 mb-2 uppercase tracking-wider">
                      Brand Name
                    </label>
                    <input
                      type="text"
                      value={brandName}
                      onChange={(e) => setBrandName(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22D3EE] focus:border-transparent text-primary placeholder-secondary/30 font-mono"
                    />
                  </div>

                  {/* Domain */}
                  <div>
                    <label className="block text-xs font-medium text-secondary/60 mb-2 uppercase tracking-wider">
                      Website
                    </label>
                    <input
                      type="text"
                      value={domain}
                      onChange={(e) => setDomain(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22D3EE] focus:border-transparent text-primary placeholder-secondary/30 font-mono"
                    />
                  </div>

                  {/* Industry */}
                  <div>
                    <label className="block text-xs font-medium text-secondary/60 mb-2 uppercase tracking-wider">
                      Industry
                    </label>
                    <div className="relative">
                      <select
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22D3EE] focus:border-transparent text-primary font-mono appearance-none cursor-pointer"
                      >
                        <option value="" className="bg-card text-secondary/50">Select industry</option>
                        {INDUSTRIES.map((ind) => (
                          <option key={ind} value={ind} className="bg-card text-primary">
                            {ind}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary/50 pointer-events-none" />
                    </div>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <p className="text-sm text-red-400">{error}</p>
                    </div>
                  )}

                  {/* Save Button */}
                  <div className="flex items-center gap-4 pt-2">
                    <button
                      onClick={handleSave}
                      disabled={!hasChanges || saving}
                      className={`
                        px-6 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2
                        ${hasChanges && !saving
                          ? 'bg-[#22D3EE] text-[#0B1521] hover:bg-[#22D3EE]/90 cursor-pointer'
                          : 'bg-white/5 text-secondary/40 cursor-not-allowed'
                        }
                      `}
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Saving...
                        </>
                      ) : saved ? (
                        <>
                          <Check className="w-4 h-4" />
                          Saved
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </button>
                    
                    {hasChanges && !saving && (
                      <span className="text-xs text-secondary/40">Unsaved changes</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Plan Card */}
          <div className="bg-card rounded-xl border border-border">
            <div className="p-6 border-b border-border">
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-primary" strokeWidth={1.5} />
                <h2 className="text-lg font-heading font-semibold text-primary">
                  Plan & Billing
                </h2>
              </div>
            </div>
            
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-xl font-bold text-primary capitalize">
                      {currentDashboard.plan}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                      Active
                    </span>
                  </div>
                  <p className="text-sm text-secondary/60">
                    {currentDashboard.plan === 'solo' && '1 brand • 1 scan/week • 25 AI actions/day'}
                    {currentDashboard.plan === 'agency' && '5 brands • 8 scans/month • 100 AI actions/day'}
                    {currentDashboard.plan === 'enterprise' && 'Unlimited brands • Unlimited scans • API access'}
                  </p>
                </div>
                
                {currentDashboard.plan !== 'enterprise' && (
                  <a
                    href="/pricing"
                    className="px-4 py-2 rounded-lg border border-border text-secondary/80 hover:text-primary hover:border-primary/20 transition-colors flex items-center gap-2 text-sm"
                  >
                    Upgrade
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Support Card */}
          <div className="bg-card rounded-xl border border-border">
            <div className="p-6 border-b border-border">
              <div className="flex items-center gap-3">
                <LifeBuoy className="w-5 h-5 text-primary" strokeWidth={1.5} />
                <h2 className="text-lg font-heading font-semibold text-primary">
                  Support
                </h2>
              </div>
            </div>
            
            <div className="p-6">
              <p className="text-sm text-secondary/60 mb-4">
                Questions, feedback, or need help? We're here for you.
              </p>
              <a
                href="mailto:hello@useharbor.io"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#101A31] text-white hover:bg-[#1a2740] transition-colors text-sm font-medium"
              >
                Contact Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}