// apps/web/app/dashboard/overview/page.tsx
// REDESIGNED: Proper dashboard with Harbor Score gauge, real trends, action items

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { 
  TrendingUp,
  TrendingDown,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Clock
} from 'lucide-react'
import { useBrand } from '@/contexts/BrandContext'
import { calculateWebsiteReadiness } from '@/lib/scoring'
import MobileHeader from '@/components/layout/MobileHeader'
import UniversalScanButton from '@/components/scan/UniversalScanButton'

interface ScanData {
  shopping_visibility: number
  brand_visibility: number
  conversation_topics: number
  site_readability: number
  brand_mentions: number
  last_scan: string | null
  harbor_score: number
  visibility_score: number
}

export default function OverviewPage() {
  const { currentDashboard } = useBrand()
  const [scanData, setScanData] = useState<ScanData | null>(null)
  const [loading, setLoading] = useState(true)
  const [websiteReadiness, setWebsiteReadiness] = useState(0)

  useEffect(() => {
    async function fetchLatestScan() {
      if (!currentDashboard) {
        setLoading(false)
        return
      }

      try {
        // Calculate website readiness
        const profileData = {
          description: currentDashboard.metadata?.description || '',
          offerings: currentDashboard.metadata?.products || [],
          faqs: currentDashboard.metadata?.target_keywords || [],
          companyInfo: {
            hq_location: currentDashboard.metadata?.headquarters,
            founded_year: currentDashboard.metadata?.founding_year ? parseInt(currentDashboard.metadata.founding_year) : undefined
          }
        }
        
        const readiness = calculateWebsiteReadiness(profileData)
        setWebsiteReadiness(readiness)

        // Fetch scan data
        const response = await fetch(`/api/scan/latest?dashboardId=${currentDashboard.id}`)
        
        if (response.ok) {
          const data = await response.json()
          
          // Transform API response
          const transformedData = {
            shopping_visibility: data.shopping?.score || 0,
            brand_visibility: data.brand?.visibility_index || 0,
            conversation_topics: data.conversations?.questions?.length || 0,
            site_readability: data.website?.readability_score || 0,
            brand_mentions: data.brand?.total_mentions || 0,
            last_scan: data.scan?.started_at || null,
            // Harbor Score: 30% shopping + 30% brand + 40% website
            harbor_score: Math.round(
              (data.shopping?.score || 0) * 0.3 +
              (data.brand?.visibility_index || 0) * 0.3 +
              (data.website?.readability_score || 0) * 0.4
            ),
            // Visibility Score: average of shopping + brand
            visibility_score: Math.round(
              ((data.shopping?.score || 0) + (data.brand?.visibility_index || 0)) / 2
            )
          }
          
          setScanData(transformedData)
        }
        
      } catch (error) {
        console.error('Failed to fetch scan data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchLatestScan()
  }, [currentDashboard])

  // Profile completeness calculation
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
  const hasProfile = profileCompleteness >= 80
  const hasScanData = scanData && scanData.last_scan

  if (loading) {
    return (
      <div className="min-h-screen" data-page="overview">
        <MobileHeader title="Overview" />
        <div className="px-6 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-64"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" data-page="overview">
      <MobileHeader title="Overview" />
      
      <div className="px-6 py-8 max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            Overview
          </h1>
          <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
            Your AI visibility at a glance
          </p>
        </div>

        {/* STATE 1: Profile Incomplete */}
        {!hasProfile && (
          <div className="max-w-3xl">
            {/* Welcome Card */}
            <div 
              className="rounded-xl p-8 mb-6"
              style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
            >
              <div className="flex items-start gap-4 mb-6">
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: 'var(--pageAccent)', opacity: 0.1 }}
                >
                  <AlertCircle style={{ color: 'var(--pageAccent)' }} className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-heading font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                    Welcome to Harbor
                  </h2>
                  <p style={{ color: 'var(--text-secondary)' }}>
                    Complete your brand profile to unlock AI visibility insights and start tracking your Harbor Score.
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                    Profile Completeness
                  </span>
                  <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {profileCompleteness}%
                  </span>
                </div>
                <div className="h-2 rounded-full" style={{ backgroundColor: 'var(--bg-muted)' }}>
                  <div 
                    className="h-full rounded-full transition-all duration-500"
                    style={{ 
                      width: `${profileCompleteness}%`,
                      backgroundColor: 'var(--pageAccent)'
                    }}
                  />
                </div>
              </div>

              <Link
                href="/dashboard/brand-settings"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all"
                style={{
                  backgroundColor: 'var(--pageAccent)',
                  color: '#FFFFFF'
                }}
              >
                Complete Brand Profile
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

        {/* STATE 2: Profile Complete, No Scan */}
        {hasProfile && !hasScanData && (
          <div className="max-w-3xl">
            <div 
              className="rounded-xl p-8 mb-6"
              style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
            >
              <div className="flex items-start gap-4 mb-6">
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: '#22C55E', opacity: 0.1 }}
                >
                  <CheckCircle2 style={{ color: '#22C55E' }} className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-heading font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                    Profile Complete
                  </h2>
                  <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
                    Your website readiness score is <strong>{websiteReadiness}%</strong>. Run your first scan to see how AI models perceive your brand.
                  </p>
                  <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <Clock className="w-4 h-4 inline mr-1" /> Takes 2-3 minutes
                  </div>
                </div>
              </div>

              <UniversalScanButton variant="large" />
            </div>
          </div>
        )}

        {/* STATE 3: Has Scan Data - PROPER DASHBOARD */}
        {hasScanData && (
          <div className="space-y-8">
            {/* Top Row: Harbor Score Gauge + Key Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Harbor Score - Circular Gauge */}
              <div 
                className="lg:col-span-1 rounded-xl p-8 flex flex-col items-center justify-center"
                style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
              >
                <div className="relative w-48 h-48 mb-4">
                  {/* SVG Circle Gauge */}
                  <svg className="transform -rotate-90 w-48 h-48">
                    {/* Background circle */}
                    <circle
                      cx="96"
                      cy="96"
                      r="88"
                      stroke="var(--border)"
                      strokeWidth="12"
                      fill="none"
                    />
                    {/* Progress circle */}
                    <circle
                      cx="96"
                      cy="96"
                      r="88"
                      stroke="url(#harborGradient)"
                      strokeWidth="12"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 88}`}
                      strokeDashoffset={`${2 * Math.PI * 88 * (1 - scanData.harbor_score / 100)}`}
                      strokeLinecap="round"
                      style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
                    />
                    {/* Gradient definition */}
                    <defs>
                      <linearGradient id="harborGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#00D9C0" />
                        <stop offset="50%" stopColor="#2979FF" />
                        <stop offset="100%" stopColor="#B95BC4" />
                      </linearGradient>
                    </defs>
                  </svg>
                  
                  {/* Center text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-5xl font-heading font-bold" style={{ color: 'var(--text-primary)' }}>
                      {scanData.harbor_score}
                    </div>
                    <div className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                      OUT OF 100
                    </div>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-sm font-medium uppercase tracking-wider mb-1" style={{ color: 'var(--text-secondary)' }}>
                    Harbor Score
                  </div>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    Your overall AI visibility
                  </p>
                </div>
              </div>

              {/* Key Metrics - 2 columns */}
              <div className="lg:col-span-2 grid grid-cols-2 gap-4">
                <MetricCard
                  title="Shopping Visibility"
                  value={scanData.shopping_visibility}
                  suffix="%"
                  color="var(--accent-teal)"
                />
                <MetricCard
                  title="Brand Visibility"
                  value={scanData.brand_visibility}
                  suffix="%"
                  color="var(--accent-blue)"
                />
                <MetricCard
                  title="Website Readiness"
                  value={websiteReadiness}
                  suffix="%"
                  color="var(--accent-green)"
                />
                <MetricCard
                  title="Conversation Topics"
                  value={scanData.conversation_topics}
                  color="var(--accent-amber)"
                />
              </div>
            </div>

            {/* Action Items Section - PLACEHOLDER */}
            <div 
              className="rounded-xl p-6"
              style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-heading font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Priority Actions
                </h2>
                <Link
                  href="/dashboard/optimize"
                  className="text-sm font-medium flex items-center gap-1"
                  style={{ color: 'var(--pageAccent)' }}
                >
                  View All
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              
              <div className="text-center py-12" style={{ color: 'var(--text-secondary)' }}>
                <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Action items coming soon</p>
                <p className="text-sm mt-1">We'll aggregate high-priority tasks from all modules here</p>
              </div>
            </div>

            {/* Last Scan Info */}
            <div className="flex items-center justify-between">
              <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Last scan: {new Date(scanData.last_scan!).toLocaleDateString()}
              </div>
              <UniversalScanButton />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Metric Card Component
function MetricCard({ 
  title, 
  value, 
  suffix = '',
  color 
}: { 
  title: string
  value: number
  suffix?: string
  color: string
}) {
  return (
    <div 
      className="rounded-xl p-6"
      style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
    >
      <div className="text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
        {title}
      </div>
      <div className="text-3xl font-heading font-bold" style={{ color: 'var(--text-primary)' }}>
        {value}{suffix}
      </div>
    </div>
  )
}