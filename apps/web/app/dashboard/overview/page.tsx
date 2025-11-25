// apps/web/app/dashboard/overview/page.tsx
// REDESIGNED: Rich Overview with insights, trends, and action items

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { 
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  ShoppingBag,
  Star,
  MessageSquare,
  Globe,
  Sparkles,
  ArrowUpRight
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
  top_questions?: string[]
  top_categories?: Array<{ name: string; mentions: number }>
  schema_issues?: number
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
          
          // Extract insights from API response
          const topQuestions = data.conversations?.questions?.slice(0, 5).map((q: any) => q.question) || []
          const topCategories = data.shopping?.categories?.slice(0, 3) || []
          const schemaIssues = data.website?.issues?.filter((i: any) => i.severity === 'high').length || 0
          
          // Transform API response
          const transformedData = {
            shopping_visibility: data.shopping?.score || 0,
            brand_visibility: data.brand?.visibility_index || 0,
            conversation_topics: data.conversations?.questions?.length || 0,
            site_readability: data.website?.readability_score || 0,
            brand_mentions: data.brand?.total_mentions || 0,
            last_scan: data.scan?.started_at || null,
            harbor_score: Math.round(
              (data.shopping?.score || 0) * 0.3 +
              (data.brand?.visibility_index || 0) * 0.3 +
              (data.website?.readability_score || 0) * 0.4
            ),
            visibility_score: Math.round(
              ((data.shopping?.score || 0) + (data.brand?.visibility_index || 0)) / 2
            ),
            top_questions: topQuestions,
            top_categories: topCategories,
            schema_issues: schemaIssues
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
        <MobileHeader />
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
      <MobileHeader />
      
      <div className="px-6 py-8 max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-heading font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              Overview
            </h1>
            <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
              Your AI visibility at a glance
            </p>
          </div>
          {hasScanData && <UniversalScanButton />}
        </div>

        {/* STATE 1: Profile Incomplete */}
        {!hasProfile && (
          <div className="max-w-3xl">
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

              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                    Profile Completeness
                  </span>
                  <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {profileCompleteness}%
                  </span>
                </div>
                <div className="h-2 rounded-full" style={{ backgroundColor: 'var(--bg-hover)' }}>
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
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all hover:opacity-90"
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

        {/* STATE 3: Has Scan Data - RICH DASHBOARD */}
        {hasScanData && (
          <div className="space-y-6">
            {/* Top Row: Harbor Score + Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Harbor Score Gauge */}
              <div 
                className="lg:col-span-1 rounded-xl p-8 flex flex-col items-center justify-center"
                style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
              >
                <div className="relative w-48 h-48 mb-4">
                  <svg className="transform -rotate-90 w-48 h-48">
                    <circle
                      cx="96"
                      cy="96"
                      r="88"
                      stroke="var(--border)"
                      strokeWidth="12"
                      fill="none"
                    />
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
                    <defs>
                      <linearGradient id="harborGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#00D9C0" />
                        <stop offset="50%" stopColor="#2979FF" />
                        <stop offset="100%" stopColor="#B95BC4" />
                      </linearGradient>
                    </defs>
                  </svg>
                  
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

              {/* Key Metrics with Links */}
              <div className="lg:col-span-2 grid grid-cols-2 gap-4">
                <MetricCardLink
                  href="/dashboard/shopping"
                  icon={ShoppingBag}
                  title="Shopping Visibility"
                  value={scanData.shopping_visibility}
                  suffix="%"
                  color="var(--accent-teal)"
                  insight={scanData.top_categories && scanData.top_categories.length > 0 
                    ? `Top: ${scanData.top_categories[0].name}`
                    : undefined
                  }
                />
                <MetricCardLink
                  href="/dashboard/brand"
                  icon={Star}
                  title="Brand Visibility"
                  value={scanData.brand_visibility}
                  suffix="%"
                  color="var(--accent-blue)"
                  insight={`${scanData.brand_mentions} mentions`}
                />
                <MetricCardLink
                  href="/dashboard/website"
                  icon={Globe}
                  title="Website Readiness"
                  value={websiteReadiness}
                  suffix="%"
                  color="var(--accent-green)"
                  insight={scanData.schema_issues ? `${scanData.schema_issues} issues` : undefined}
                />
                <MetricCardLink
                  href="/dashboard/conversations"
                  icon={MessageSquare}
                  title="Conversation Topics"
                  value={scanData.conversation_topics}
                  color="var(--accent-amber)"
                  insight="questions tracked"
                />
              </div>
            </div>

            {/* Middle Row: Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Questions */}
              {scanData.top_questions && scanData.top_questions.length > 0 && (
                <div 
                  className="rounded-xl p-6"
                  style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-heading font-semibold" style={{ color: 'var(--text-primary)' }}>
                      Top Questions About Your Brand
                    </h3>
                    <Link
                      href="/dashboard/conversations"
                      className="text-sm font-medium flex items-center gap-1 hover:opacity-80"
                      style={{ color: 'var(--accent-amber)' }}
                    >
                      View All
                      <ArrowUpRight className="w-4 h-4" />
                    </Link>
                  </div>
                  <div className="space-y-3">
                    {scanData.top_questions.slice(0, 5).map((question, idx) => (
                      <div 
                        key={idx}
                        className="flex items-start gap-3 p-3 rounded-lg transition-colors"
                        style={{ backgroundColor: 'var(--bg-hover)' }}
                      >
                        <div 
                          className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0 text-xs font-semibold"
                          style={{ backgroundColor: 'var(--accent-amber)', color: '#FFFFFF', opacity: 0.8 }}
                        >
                          {idx + 1}
                        </div>
                        <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
                          {question}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div 
                className="rounded-xl p-6"
                style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5" style={{ color: 'var(--pageAccent)' }} />
                  <h3 className="text-lg font-heading font-semibold" style={{ color: 'var(--text-primary)' }}>
                    Quick Actions
                  </h3>
                </div>
                <div className="space-y-3">
                  {websiteReadiness < 80 && (
                    <ActionItem
                      title="Improve Website Readiness"
                      description="Fix schema issues and improve technical SEO"
                      href="/dashboard/website"
                      priority="high"
                    />
                  )}
                  {scanData.shopping_visibility < 70 && (
                    <ActionItem
                      title="Boost Shopping Visibility"
                      description="Optimize product listings for AI discovery"
                      href="/dashboard/shopping"
                      priority="high"
                    />
                  )}
                  {scanData.brand_visibility < 70 && (
                    <ActionItem
                      title="Strengthen Brand Presence"
                      description="Improve brand perception across AI models"
                      href="/dashboard/brand"
                      priority="medium"
                    />
                  )}
                  {scanData.conversation_topics < 20 && (
                    <ActionItem
                      title="Address Common Questions"
                      description="Create content for popular queries"
                      href="/dashboard/conversations"
                      priority="medium"
                    />
                  )}
                  {websiteReadiness >= 80 && scanData.shopping_visibility >= 70 && scanData.brand_visibility >= 70 && (
                    <div className="text-center py-6" style={{ color: 'var(--text-secondary)' }}>
                      <CheckCircle2 className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--accent-green)' }} />
                      <p className="font-medium">All systems green!</p>
                      <p className="text-sm mt-1">Keep monitoring your scores</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Info */}
            <div className="flex items-center justify-between text-sm" style={{ color: 'var(--text-secondary)' }}>
              <div>
                Last scan: {new Date(scanData.last_scan!).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric', 
                  year: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit'
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Metric Card with Link
function MetricCardLink({ 
  href,
  icon: Icon,
  title, 
  value, 
  suffix = '',
  color,
  insight
}: { 
  href: string
  icon: any
  title: string
  value: number
  suffix?: string
  color: string
  insight?: string
}) {
  return (
    <Link
      href={href}
      className="rounded-xl p-6 transition-all hover:scale-[1.02] group"
      style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
    >
      <div className="flex items-start justify-between mb-3">
        <div 
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: color, opacity: 0.1 }}
        >
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        <ArrowUpRight 
          className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" 
          style={{ color: 'var(--text-secondary)' }} 
        />
      </div>
      <div className="text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
        {title}
      </div>
      <div className="text-3xl font-heading font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
        {value}{suffix}
      </div>
      {insight && (
        <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
          {insight}
        </div>
      )}
    </Link>
  )
}

// Action Item Component
function ActionItem({
  title,
  description,
  href,
  priority
}: {
  title: string
  description: string
  href: string
  priority: 'high' | 'medium' | 'low'
}) {
  const priorityColors = {
    high: '#EF4444',
    medium: '#F59E0B',
    low: '#6B7280'
  }

  return (
    <Link
      href={href}
      className="block p-4 rounded-lg transition-all hover:scale-[1.01]"
      style={{ backgroundColor: 'var(--bg-hover)', border: '1px solid var(--border)' }}
    >
      <div className="flex items-start gap-3">
        <div 
          className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
          style={{ backgroundColor: priorityColors[priority] }}
        />
        <div className="flex-1 min-w-0">
          <div className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
            {title}
          </div>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {description}
          </p>
        </div>
        <ArrowRight className="w-4 h-4 flex-shrink-0 mt-1" style={{ color: 'var(--text-secondary)' }} />
      </div>
    </Link>
  )
}