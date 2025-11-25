// apps/web/app/dashboard/overview/page.tsx
// Properly styled following module page patterns

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { 
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Clock,
  ShoppingBag,
  Star,
  MessageSquare,
  Globe,
  Trophy,
  TrendingUp
} from 'lucide-react'
import { useBrand } from '@/contexts/BrandContext'
import { calculateWebsiteReadiness } from '@/lib/scoring'
import MobileHeader from '@/components/layout/MobileHeader'
import UniversalScanButton from '@/components/scan/UniversalScanButton'
import ActionCard from '@/components/optimization/ActionCard'
import { analyzeShoppingData, ShoppingAnalysis } from '@/lib/optimization/generator'
import { analyzeBrandData, BrandAnalysis } from '@/lib/optimization/generator'
import { analyzeConversationsData, ConversationsAnalysis } from '@/lib/optimization/generator'
import { analyzeWebsiteData, WebsiteAnalysis } from '@/lib/optimization/generator'

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
  const [allRecommendations, setAllRecommendations] = useState<any[]>([])

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
            harbor_score: Math.round(
              (data.shopping?.score || 0) * 0.3 +
              (data.brand?.visibility_index || 0) * 0.3 +
              (data.website?.readability_score || 0) * 0.4
            ),
            visibility_score: Math.round(
              ((data.shopping?.score || 0) + (data.brand?.visibility_index || 0)) / 2
            )
          }
          
          setScanData(transformedData)

          // Generate action items from all modules
          const allTasks: any[] = []

          // Shopping recommendations
          if (data.shopping && data.shopping_raw) {
            const shoppingAnalysis: ShoppingAnalysis = {
              ...data.shopping,
              raw_results: data.shopping_raw
            }
            const shoppingTasks = analyzeShoppingData(shoppingAnalysis)
            allTasks.push(...shoppingTasks.map(t => ({ ...t, module: 'shopping' })))
          }

          // Brand recommendations
          if (data.brand && data.brand_raw) {
            const brandAnalysis: BrandAnalysis = {
              visibility_index: data.brand.visibility_index,
              descriptors: data.brand.descriptors || [],
              sentiment_breakdown: data.brand.sentiment_breakdown,
              total_mentions: data.brand.total_mentions,
              raw_descriptors: data.brand_raw
            }
            const brandTasks = analyzeBrandData(brandAnalysis)
            allTasks.push(...brandTasks.map(t => ({ ...t, module: 'brand' })))
          }

          // Conversations recommendations
          if (data.conversations) {
            const conversationsAnalysis: ConversationsAnalysis = {
              volume_index: data.conversations.volume_index,
              questions: data.conversations.questions || [],
              intent_breakdown: data.conversations.intent_breakdown
            }
            const conversationsTasks = analyzeConversationsData(conversationsAnalysis)
            allTasks.push(...conversationsTasks.map(t => ({ ...t, module: 'conversations' })))
          }

          // Website recommendations
          if (data.website) {
            const websiteAnalysis: WebsiteAnalysis = {
              readability_score: data.website.readability_score,
              schema_coverage: data.website.schema_coverage,
              issues: data.website.issues || []
            }
            const websiteTasks = analyzeWebsiteData(websiteAnalysis)
            allTasks.push(...websiteTasks.map(t => ({ ...t, module: 'website' })))
          }

          // Sort by priority and take top 6
          const sortedTasks = allTasks.sort((a, b) => {
            const priorityOrder = { high: 0, medium: 1, low: 2 }
            return priorityOrder[a.task.priority as keyof typeof priorityOrder] - priorityOrder[b.task.priority as keyof typeof priorityOrder]
          })

          setAllRecommendations(sortedTasks.slice(0, 6))
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
            <div className="h-8 bg-card rounded w-48 mb-4"></div>
            <div className="h-4 bg-card rounded w-64"></div>
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
            <h1 className="text-3xl font-heading font-bold text-primary mb-2">
              Overview
            </h1>
            <p className="text-sm text-secondary/60">
              Your AI visibility at a glance
            </p>
          </div>
          {hasScanData && <UniversalScanButton />}
        </div>

        {/* STATE 1: Profile Incomplete */}
        {!hasProfile && (
          <div className="max-w-3xl">
            <div className="bg-card rounded-lg border border-border p-8 mb-6">
              <div className="flex items-start gap-4 mb-6">
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: 'rgba(0, 198, 183, 0.1)' }}
                >
                  <AlertCircle className="w-6 h-6 text-[#00C6B7]" strokeWidth={1.5} />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-heading font-bold text-primary mb-2">
                    Welcome to Harbor
                  </h2>
                  <p className="text-secondary/60">
                    Complete your brand profile to unlock AI visibility insights and start tracking your Harbor Score.
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-secondary/60">Profile Completeness</span>
                  <span className="text-sm font-semibold text-primary">{profileCompleteness}%</span>
                </div>
                <div className="h-2 bg-border rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#00C6B7] transition-all duration-500"
                    style={{ width: `${profileCompleteness}%` }}
                  />
                </div>
              </div>

              <Link
                href="/dashboard/brand-settings"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#00C6B7] text-white rounded-lg font-medium transition-opacity hover:opacity-90"
              >
                Complete Brand Profile
                <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
              </Link>
            </div>
          </div>
        )}

        {/* STATE 2: Profile Complete, No Scan */}
        {hasProfile && !hasScanData && (
          <div className="max-w-3xl">
            <div className="bg-card rounded-lg border border-border p-8 mb-6">
              <div className="flex items-start gap-4 mb-6">
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)' }}
                >
                  <CheckCircle2 className="w-6 h-6 text-green-500" strokeWidth={1.5} />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-heading font-bold text-primary mb-2">
                    Profile Complete
                  </h2>
                  <p className="text-secondary/60 mb-4">
                    Your website readiness score is <strong className="text-primary">{websiteReadiness}%</strong>. Run your first scan to see how AI models perceive your brand.
                  </p>
                  <div className="flex items-center gap-2 text-sm text-secondary/60">
                    <Clock className="w-4 h-4" strokeWidth={1.5} />
                    <span>Takes 2-3 minutes</span>
                  </div>
                </div>
              </div>

              <UniversalScanButton variant="large" />
            </div>
          </div>
        )}

        {/* STATE 3: Has Scan Data */}
        {hasScanData && (
          <div className="space-y-8">
            {/* Top Row: Harbor Score + Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Harbor Score Gauge */}
              <div className="lg:col-span-1 bg-card rounded-lg border border-border p-8 flex flex-col items-center justify-center">
                <div className="relative w-48 h-48 mb-4">
                  <svg className="transform -rotate-90 w-48 h-48">
                    <circle
                      cx="96"
                      cy="96"
                      r="88"
                      stroke="rgba(255,255,255,0.06)"
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
                    <div className="text-5xl font-heading font-bold text-primary">
                      {scanData.harbor_score}
                    </div>
                    <div className="text-sm text-secondary/60">OUT OF 100</div>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-xs text-secondary/60 uppercase tracking-wider mb-1">Harbor Score</div>
                  <p className="text-xs text-secondary/60">Your overall AI visibility</p>
                </div>
              </div>

              {/* Key Metrics */}
              <div className="lg:col-span-2 grid grid-cols-2 gap-4">
                <Link
                  href="/dashboard/shopping"
                  className="bg-card rounded-lg border border-border p-6 transition-colors hover:border-[#00C6B7]/30"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <ShoppingBag className="w-5 h-5 text-[#00C6B7]" strokeWidth={1.5} />
                    <p className="text-xs text-secondary/60 uppercase tracking-wider">Shopping</p>
                  </div>
                  <div className="text-4xl font-heading font-bold text-primary mb-2">
                    {scanData.shopping_visibility}<span className="text-2xl text-secondary/40">%</span>
                  </div>
                  <p className="text-sm text-secondary/60">Product visibility</p>
                </Link>

                <Link
                  href="/dashboard/brand"
                  className="bg-card rounded-lg border border-border p-6 transition-colors hover:border-[#00C6B7]/30"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Star className="w-5 h-5 text-[#4EE4FF]" strokeWidth={1.5} />
                    <p className="text-xs text-secondary/60 uppercase tracking-wider">Brand</p>
                  </div>
                  <div className="text-4xl font-heading font-bold text-primary mb-2">
                    {scanData.brand_visibility}<span className="text-2xl text-secondary/40">%</span>
                  </div>
                  <p className="text-sm text-secondary/60">Brand perception</p>
                </Link>

                <Link
                  href="/dashboard/website"
                  className="bg-card rounded-lg border border-border p-6 transition-colors hover:border-[#00C6B7]/30"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Globe className="w-5 h-5 text-[#B95BC4]" strokeWidth={1.5} />
                    <p className="text-xs text-secondary/60 uppercase tracking-wider">Website</p>
                  </div>
                  <div className="text-4xl font-heading font-bold text-primary mb-2">
                    {websiteReadiness}<span className="text-2xl text-secondary/40">%</span>
                  </div>
                  <p className="text-sm text-secondary/60">Technical health</p>
                </Link>

                <Link
                  href="/dashboard/conversations"
                  className="bg-card rounded-lg border border-border p-6 transition-colors hover:border-[#00C6B7]/30"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <MessageSquare className="w-5 h-5 text-[#FAAD14]" strokeWidth={1.5} />
                    <p className="text-xs text-secondary/60 uppercase tracking-wider">Topics</p>
                  </div>
                  <div className="text-4xl font-heading font-bold text-primary mb-2">
                    {scanData.conversation_topics}
                  </div>
                  <p className="text-sm text-secondary/60">Questions tracked</p>
                </Link>
              </div>
            </div>

            {/* Priority Actions */}
            {allRecommendations.length > 0 && (
              <div className="bg-card rounded-lg border border-border">
                <div className="p-6 border-b border-border">
                  <h2 className="text-xl font-heading font-bold text-primary">
                    Priority Actions
                  </h2>
                  <p className="text-sm text-secondary/60 mt-1">
                    {allRecommendations.length} high-impact recommendations across all modules
                  </p>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {allRecommendations.map((rec, idx) => (
                      <ActionCard
                        key={`${rec.module}-${idx}`}
                        task={rec.task}
                        onClick={() => {
                          // Navigate to module page
                          window.location.href = `/dashboard/${rec.module}`
                        }}
                        context={rec.context}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Last Scan Info */}
            <div className="text-sm text-secondary/60">
              Last scan: {new Date(scanData.last_scan!).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit'
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}