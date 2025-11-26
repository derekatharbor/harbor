// apps/web/app/dashboard/overview/page.tsx
// Properly styled following module page patterns

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowRight,
  ShoppingBag,
  Star,
  MessageSquare,
  Globe,
  Trophy,
  TrendingUp,
  Home
} from 'lucide-react'
import { useBrand } from '@/contexts/BrandContext'
import { calculateWebsiteReadiness } from '@/lib/scoring'
import MobileHeader from '@/components/layout/MobileHeader'
import UniversalScanButton from '@/components/scan/UniversalScanButton'
import ScanProgressInline from '@/components/scan/ScanProgressInline'
import ActionCard from '@/components/optimization/ActionCard'
import { 
  analyzeShoppingData, 
  analyzeBrandData, 
  analyzeConversationsData, 
  analyzeWebsiteData,
  ShoppingAnalysis,
  BrandAnalysis
} from '@/lib/optimization/generator'

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
  const [scanStatus, setScanStatus] = useState<'none' | 'running' | 'done'>('none')
  const [currentScanId, setCurrentScanId] = useState<string | null>(null)

  const router = useRouter()

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

        // Fetch completed scan data
        const response = await fetch(`/api/scan/latest?dashboardId=${currentDashboard.id}`)
        
        if (response.ok) {
          const data = await response.json()
          
          // If no completed scan, check if there's a running scan
          if (!data.scan) {
            // Check scan status API for running scans
            const statusRes = await fetch('/api/scan/status')
            if (statusRes.ok) {
              const statusData = await statusRes.json()
              if (statusData.currentScanId) {
                // There's a running scan
                setScanStatus('running')
                setCurrentScanId(statusData.currentScanId)
                setLoading(false)
                return
              }
            }
            // No scan at all - redirect to /dashboard
            router.push('/dashboard')
            return
          }
          
          // We have a completed scan
          setScanStatus('done')
          
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
          if (data.brand) {
            const brandAnalysis: BrandAnalysis = {
              visibility_index: data.brand.visibility_index,
              descriptors: data.brand.descriptors || [],
              sentiment_breakdown: data.brand.sentiment_breakdown,
              total_mentions: data.brand.total_mentions
            }
            const brandTasks = analyzeBrandData(brandAnalysis)
            allTasks.push(...brandTasks.map(t => ({ ...t, module: 'brand' })))
          }

          // Conversations recommendations
          if (data.conversations) {
            const conversationsAnalysis = {
              volume_index: data.conversations.volume_index,
              questions: data.conversations.questions || [],
              intent_breakdown: data.conversations.intent_breakdown
            }
            const conversationsTasks = analyzeConversationsData(conversationsAnalysis)
            allTasks.push(...conversationsTasks.map(t => ({ ...t, module: 'conversations' })))
          }

          // Website recommendations
          if (data.website) {
            const websiteAnalysis = {
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
  }, [currentDashboard, router])

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
            <div className="flex items-center gap-3 mb-2">
              <Home className="w-6 h-6 lg:w-8 lg:h-8 text-[#00C6B7]" strokeWidth={1.5} />
              <h1 className="text-2xl lg:text-4xl font-heading font-bold text-primary">
                Overview
              </h1>
            </div>
            <p className="text-sm text-secondary/60">
              Your brand's AI visibility across ChatGPT, Claude, Gemini, and Perplexity
            </p>
          </div>
          {hasScanData && <UniversalScanButton />}
        </div>

        {/* STATE 1: Scan Running */}
        {scanStatus === 'running' && currentScanId && !hasScanData && (
          <ScanProgressInline scanId={currentScanId} />
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