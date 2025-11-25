// apps/web/app/dashboard/overview/page.tsx
// Redesigned with proper empty states and user flow

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { 
  Home,
  ShoppingBag, 
  Star, 
  MessageSquare, 
  Globe,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Target
} from 'lucide-react'
import { useBrand } from '@/contexts/BrandContext'
import { calculateWebsiteReadiness } from '@/lib/scoring'
import MobileHeader from '@/components/layout/MobileHeader'
import UniversalScanButton from '@/components/scan/UniversalScanButton'

interface OverviewData {
  shopping_visibility: number
  brand_visibility: number
  conversation_topics: number
  site_readability: number
  brand_mentions: number
  last_scan: string | null
  harbor_score?: number
  visibility_score?: number
}

export default function OverviewPage() {
  const { currentDashboard } = useBrand()
  const [scanData, setScanData] = useState<OverviewData | null>(null)
  const [loading, setLoading] = useState(true)
  const [websiteReadiness, setWebsiteReadiness] = useState(0)

  useEffect(() => {
    async function fetchLatestScan() {
      if (!currentDashboard) {
        setLoading(false)
        return
      }

      try {
        // Calculate website readiness from profile
        const profileData = {
          description: currentDashboard.metadata?.description || '',
          offerings: currentDashboard.metadata?.products || [],
          faqs: currentDashboard.metadata?.target_keywords || [], // Using keywords as proxy
          companyInfo: {
            hq_location: currentDashboard.metadata?.headquarters,
            founded_year: currentDashboard.metadata?.founding_year ? parseInt(currentDashboard.metadata.founding_year) : undefined
          }
        }
        
        const readiness = calculateWebsiteReadiness(profileData)
        setWebsiteReadiness(readiness)

        // Try to fetch scan data
        const response = await fetch(`/api/scan/latest?dashboardId=${currentDashboard.id}`)
        
        if (response.ok) {
          const data = await response.json()
          
          // Transform API response to match component expectations
          const transformedData = {
            shopping_visibility: data.shopping?.score || 0,
            brand_visibility: data.brand?.visibility_index || 0,
            conversation_topics: data.conversations?.questions?.length || 0,
            site_readability: data.website?.readability_score || 0,
            brand_mentions: data.brand?.total_mentions || 0,
            last_scan: data.scan?.started_at || null,
            // Calculate Harbor Score (weighted average)
            harbor_score: Math.round(
              (data.shopping?.score || 0) * 0.3 +
              (data.brand?.visibility_index || 0) * 0.3 +
              (data.website?.readability_score || 0) * 0.4
            ),
            // Calculate Visibility Score
            visibility_score: Math.round(
              ((data.shopping?.score || 0) + (data.brand?.visibility_index || 0)) / 2
            )
          }
          
          setScanData(transformedData)
          console.log('[Overview] Scan data loaded:', transformedData)
        }
        
      } catch (error) {
        console.error('Failed to fetch scan data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchLatestScan()
  }, [currentDashboard])

  // Calculate profile completeness
  const calculateCompleteness = () => {
    if (!currentDashboard) return 0
    
    let completed = 0
    const total = 8

    if (currentDashboard.brand_name) completed++
    if (currentDashboard.domain) completed++
    if (currentDashboard.logo_url) completed++
    if (currentDashboard.metadata?.description && currentDashboard.metadata.description.length >= 50) completed++
    if (currentDashboard.metadata?.category) completed++
    if (currentDashboard.metadata?.products && currentDashboard.metadata.products.length >= 1) completed++
    if (currentDashboard.metadata?.target_keywords && currentDashboard.metadata.target_keywords.length >= 3) completed++
    if (currentDashboard.metadata?.headquarters || currentDashboard.metadata?.founding_year) completed++

    return Math.round((completed / total) * 100)
  }

  const profileCompleteness = calculateCompleteness()
  const isProfileReady = profileCompleteness >= 80
  const hasScanData = scanData && scanData.last_scan

  // Loading state
  if (loading) {
    return (
      <>
        <MobileHeader />
        <div className="max-w-screen-2xl mx-auto pt-20 lg:pt-0 animate-pulse space-y-8">
          <div className="h-10 w-64 rounded" style={{ backgroundColor: 'var(--bg-card)' }} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 rounded-lg" style={{ backgroundColor: 'var(--bg-card)' }} />
            ))}
          </div>
        </div>
      </>
    )
  }

  // No dashboard selected
  if (!currentDashboard) {
    return (
      <>
        <MobileHeader />
        <div className="max-w-screen-2xl mx-auto pt-20 lg:pt-0 px-4 lg:px-0">
          <div 
            className="rounded-xl p-12 text-center"
            style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
          >
            <Home className="w-16 h-16 mx-auto mb-6 opacity-30" style={{ color: 'var(--text-secondary)' }} />
            <h2 className="text-2xl font-heading font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
              No Brand Selected
            </h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              Select a brand from the sidebar to view its overview.
            </p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <MobileHeader />
      <div className="max-w-screen-2xl mx-auto pt-20 lg:pt-0 px-4 lg:px-0">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Home className="w-6 h-6 lg:w-7 lg:h-7" style={{ color: 'var(--accent-teal)' }} strokeWidth={1.5} />
            <h1 className="text-2xl lg:text-4xl font-heading font-bold" style={{ color: 'var(--text-primary)' }}>
              Overview
            </h1>
          </div>
          <p style={{ color: 'var(--text-secondary)' }}>
            Your AI visibility at a glance
          </p>
        </div>

        {/* Empty State - No Scan Yet, Profile Incomplete */}
        {!hasScanData && !isProfileReady && (
          <div className="space-y-6">
            {/* Welcome Card */}
            <div 
              className="rounded-xl p-8 lg:p-10"
              style={{ 
                backgroundColor: 'var(--bg-card)', 
                border: '1px solid var(--border)',
                background: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(34, 211, 238, 0.03) 100%)'
              }}
            >
              <div className="flex items-start gap-4 mb-6">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: 'rgba(34, 211, 238, 0.1)' }}
                >
                  <Sparkles className="w-6 h-6" style={{ color: 'var(--accent-teal)' }} strokeWidth={1.5} />
                </div>
                <div>
                  <h2 className="text-xl font-heading font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                    Welcome to Harbor
                  </h2>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    Let's get your brand ready for AI visibility analysis. Follow these steps to unlock your full dashboard.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Step 1 */}
                <div className="flex items-start gap-4">
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 font-heading font-bold"
                    style={{ 
                      backgroundColor: 'var(--accent-teal)',
                      color: '#0F172A'
                    }}
                  >
                    1
                  </div>
                  <div className="flex-1">
                    <div className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                      Complete your brand profile
                    </div>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      Add your brand details, products, and keywords to calculate your Website Readiness Score
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex items-start gap-4 opacity-50">
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 font-heading font-bold"
                    style={{ 
                      backgroundColor: 'var(--bg-muted)',
                      color: 'var(--text-muted)',
                      border: '1px solid var(--border)'
                    }}
                  >
                    2
                  </div>
                  <div className="flex-1">
                    <div className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                      Run your first AI scan
                    </div>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      Analyze how ChatGPT, Claude, Gemini, and Perplexity see your brand
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex items-start gap-4 opacity-50">
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 font-heading font-bold"
                    style={{ 
                      backgroundColor: 'var(--bg-muted)',
                      color: 'var(--text-muted)',
                      border: '1px solid var(--border)'
                    }}
                  >
                    3
                  </div>
                  <div className="flex-1">
                    <div className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                      Track and improve your scores
                    </div>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      Monitor your Harbor Score and optimize for better AI visibility
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <Link
                  href="/dashboard/brand-settings"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all"
                  style={{
                    backgroundColor: 'var(--accent-teal)',
                    color: '#0F172A'
                  }}
                >
                  Complete Brand Profile
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Profile Completeness Card */}
            <div 
              className="rounded-xl p-6"
              style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-heading font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                    Profile Completeness
                  </h3>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {profileCompleteness < 80 
                      ? `${Math.ceil((80 - profileCompleteness) / 12)} more fields to unlock scanning`
                      : 'Profile ready for scanning!'}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-heading font-bold" style={{ color: 'var(--accent-teal)' }}>
                    {profileCompleteness}%
                  </div>
                </div>
              </div>

              <div className="relative h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-muted)' }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ 
                    width: `${profileCompleteness}%`,
                    backgroundColor: profileCompleteness >= 80 ? 'var(--accent-green)' : 'var(--accent-teal)'
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Empty State - Profile Ready, No Scan */}
        {!hasScanData && isProfileReady && (
          <div className="space-y-6">
            {/* Metric Cards - Empty */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCardEmpty
                icon={Target}
                title="Harbor Score"
                subtitle="Overall AI visibility"
                value="--"
              />
              <MetricCardEmpty
                icon={TrendingUp}
                title="Website Readiness"
                subtitle="Profile completion"
                value={`${websiteReadiness}%`}
                color="var(--accent-green)"
              />
              <MetricCardEmpty
                icon={Star}
                title="Visibility Score"
                subtitle="AI mention frequency"
                value="--"
              />
              <MetricCardEmpty
                icon={MessageSquare}
                title="AI Mentions"
                subtitle="Across all models"
                value="--"
              />
            </div>

            {/* Ready to Scan Card */}
            <div 
              className="rounded-xl p-8 lg:p-10"
              style={{ 
                backgroundColor: 'var(--bg-card)', 
                border: '1px solid var(--border-strong)',
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, var(--bg-card) 100%)'
              }}
            >
              <div className="flex items-start gap-4 mb-6">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)' }}
                >
                  <Target className="w-6 h-6" style={{ color: 'var(--accent-green)' }} strokeWidth={1.5} />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-heading font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                    Profile Complete
                  </h2>
                  <p className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    Your brand profile is ready. Run your first AI visibility scan to see how ChatGPT, Claude, Gemini, and Perplexity perceive your brand.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-muted)' }}>
                  <div className="w-1 h-8 rounded-full" style={{ backgroundColor: 'var(--accent-teal)' }} />
                  <div className="flex-1">
                    <div className="font-medium text-sm mb-1" style={{ color: 'var(--text-primary)' }}>
                      Scan Duration
                    </div>
                    <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      Typically takes 2-3 minutes to complete
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-muted)' }}>
                  <div className="w-1 h-8 rounded-full" style={{ backgroundColor: 'var(--accent-teal)' }} />
                  <div className="flex-1">
                    <div className="font-medium text-sm mb-1" style={{ color: 'var(--text-primary)' }}>
                      What We Analyze
                    </div>
                    <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      Product mentions, brand perception, conversation topics, and website structure
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <UniversalScanButton variant="large" />
              </div>
            </div>
          </div>
        )}

        {/* Has Scan Data - Show Full Dashboard */}
        {hasScanData && (
          <div className="space-y-6">
            {/* Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                icon={Target}
                title="Harbor Score"
                value={scanData.harbor_score || 0}
                trend={+2.5}
                color="var(--accent-teal)"
              />
              <MetricCard
                icon={TrendingUp}
                title="Website Readiness"
                value={websiteReadiness}
                trend={+5}
                color="var(--accent-green)"
              />
              <MetricCard
                icon={Star}
                title="Visibility Score"
                value={scanData.visibility_score || 0}
                trend={-1.2}
                color="var(--accent-blue)"
              />
              <MetricCard
                icon={MessageSquare}
                title="AI Mentions"
                value={scanData.brand_mentions}
                color="var(--accent-purple)"
              />
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              <QuickLinkCard
                href="/dashboard/shopping"
                icon={ShoppingBag}
                title="Shopping Visibility"
                description="Product mentions"
                color="var(--accent-teal)"
              />
              <QuickLinkCard
                href="/dashboard/brand"
                icon={Star}
                title="Brand Visibility"
                description="Brand perception"
                color="var(--accent-blue)"
              />
              <QuickLinkCard
                href="/dashboard/conversations"
                icon={MessageSquare}
                title="Conversations"
                description="Topic analysis"
                color="var(--accent-amber)"
              />
              <QuickLinkCard
                href="/dashboard/website"
                icon={Globe}
                title="Website Analytics"
                description="Technical audit"
                color="var(--accent-purple)"
              />
            </div>
          </div>
        )}
      </div>
    </>
  )
}

// Helper Components

function MetricCardEmpty({ icon: Icon, title, subtitle, value, color }: any) {
  return (
    <div 
      className="rounded-lg p-6"
      style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
    >
      <div className="flex items-center gap-3 mb-4">
        <Icon className="w-5 h-5" style={{ color: color || 'var(--text-muted)' }} strokeWidth={1.5} />
        <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
          {title}
        </span>
      </div>
      <div className="text-3xl font-heading font-bold mb-1" style={{ color: color || 'var(--text-primary)' }}>
        {value}
      </div>
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
        {subtitle}
      </p>
    </div>
  )
}

function MetricCard({ icon: Icon, title, value, trend, color }: any) {
  return (
    <div 
      className="rounded-lg p-6"
      style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
    >
      <div className="flex items-center gap-3 mb-4">
        <Icon className="w-5 h-5" style={{ color: color || 'var(--text-muted)' }} strokeWidth={1.5} />
        <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
          {title}
        </span>
      </div>
      <div className="flex items-end gap-3 mb-1">
        <div className="text-3xl font-heading font-bold" style={{ color: 'var(--text-primary)' }}>
          {typeof value === 'number' ? Math.round(value) : value}
          {title.includes('Score') || title.includes('Readiness') ? '%' : ''}
        </div>
        {trend !== undefined && (
          <div 
            className="text-sm font-medium pb-1"
            style={{ color: trend >= 0 ? 'var(--accent-green)' : '#EF4444' }}
          >
            {trend >= 0 ? '+' : ''}{trend}%
          </div>
        )}
      </div>
    </div>
  )
}

function QuickLinkCard({ href, icon: Icon, title, description, color }: any) {
  return (
    <Link
      href={href}
      className="group rounded-lg p-6 transition-all"
      style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
    >
      <div className="flex items-center justify-between mb-3">
        <Icon className="w-6 h-6 group-hover:scale-110 transition-transform" style={{ color }} strokeWidth={1.5} />
        <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--text-muted)' }} />
      </div>
      <h3 className="font-heading font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
        {title}
      </h3>
      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
        {description}
      </p>
    </Link>
  )
}