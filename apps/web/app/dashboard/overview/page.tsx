// apps/web/app/dashboard/overview/page.tsx
// Peec-inspired Overview Dashboard - Clean, data-dense, professional

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  Download,
  Eye,
  MessageSquare,
  Globe,
  ShoppingBag,
  ChevronDown,
  Minus
} from 'lucide-react'
import { useBrand } from '@/contexts/BrandContext'
import MobileHeader from '@/components/layout/MobileHeader'
import ScanProgressInline from '@/components/scan/ScanProgressInline'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine
} from 'recharts'

interface ScanData {
  shopping_visibility: number
  brand_visibility: number
  conversation_topics: number
  site_readability: number
  harbor_score: number
  visibility_score: number
  last_scan: string | null
}

interface Competitor {
  id: string
  slug: string
  brand_name: string
  visibility_score: number
  logo_url?: string
  rank_global?: number
}

interface CompetitorData {
  competitors: Competitor[]
  userRank: number
  userScore: number
  totalInCategory: number
  category: string
}

interface Snapshot {
  snapshot_date: string
  shopping_score: number
  brand_score: number
  website_score: number
  harbor_score: number
  conversation_count: number
}

interface SnapshotData {
  snapshots: Snapshot[]
  delta: {
    shopping: number
    brand: number
    website: number
    harbor: number
  }
}

interface ChartDataPoint {
  date: string
  you: number
  [key: string]: number | string
}

export default function OverviewPage() {
  const { currentDashboard } = useBrand()
  const [scanData, setScanData] = useState<ScanData | null>(null)
  const [loading, setLoading] = useState(true)
  const [competitorData, setCompetitorData] = useState<CompetitorData | null>(null)
  const [snapshotData, setSnapshotData] = useState<SnapshotData | null>(null)
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])
  const [scanStatus, setScanStatus] = useState<'none' | 'running' | 'done'>('none')
  const [currentScanId, setCurrentScanId] = useState<string | null>(null)
  const [activeMetric, setActiveMetric] = useState<'visibility' | 'sentiment' | 'position'>('visibility')
  const [timeRange, setTimeRange] = useState('30d')

  const router = useRouter()

  useEffect(() => {
    async function fetchData() {
      if (!currentDashboard) {
        setLoading(false)
        return
      }

      try {
        // Fetch scan data
        const scanResponse = await fetch(`/api/scan/latest?dashboardId=${currentDashboard.id}`)
        
        if (scanResponse.ok) {
          const data = await scanResponse.json()
          
          if (!data.scan) {
            const statusRes = await fetch('/api/scan/status')
            if (statusRes.ok) {
              const statusData = await statusRes.json()
              if (statusData.currentScanId) {
                setScanStatus('running')
                setCurrentScanId(statusData.currentScanId)
                setLoading(false)
                return
              }
            }
            router.push('/dashboard')
            return
          }
          
          setScanStatus('done')
          
          const transformedData: ScanData = {
            shopping_visibility: data.shopping?.score || 0,
            brand_visibility: data.brand?.visibility_index || 0,
            conversation_topics: data.conversations?.questions?.length || 0,
            site_readability: data.website?.readability_score || 0,
            harbor_score: data.harbor_score?.harbor_score || Math.round(
              (data.shopping?.score || 0) * 0.3 +
              (data.brand?.visibility_index || 0) * 0.3 +
              (data.website?.readability_score || 0) * 0.4
            ),
            visibility_score: Math.round(
              ((data.shopping?.score || 0) + (data.brand?.visibility_index || 0)) / 2
            ),
            last_scan: data.scan?.started_at || null
          }
          
          setScanData(transformedData)
        }

        // Fetch competitor data
        const compResponse = await fetch(`/api/competitors?brandId=${currentDashboard.id}`)
        if (compResponse.ok) {
          const compData = await compResponse.json()
          setCompetitorData(compData)
        }

        // Fetch snapshot data for trends
        const snapshotResponse = await fetch(`/api/snapshots?dashboardId=${currentDashboard.id}&range=${timeRange}`)
        if (snapshotResponse.ok) {
          const snapData = await snapshotResponse.json()
          setSnapshotData(snapData)
          
          // Build chart data from snapshots
          if (snapData.snapshots && snapData.snapshots.length > 0) {
            const chartPoints: ChartDataPoint[] = snapData.snapshots.map((snap: Snapshot) => {
              const date = new Date(snap.snapshot_date)
              return {
                date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                you: snap.harbor_score || 0
              }
            })
            setChartData(chartPoints)
          }
        }
        
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [currentDashboard, router, timeRange])

  const hasScanData = scanData && scanData.last_scan

  // Use real deltas from snapshot data, fallback to 0
  const deltas = snapshotData?.delta || { shopping: 0, brand: 0, website: 0, harbor: 0 }
  
  // For the status banner, use harbor delta
  const visibilityDelta = deltas.harbor

  // If no snapshots yet, show current data as single point
  const displayChartData = chartData.length > 0 ? chartData : (scanData ? [{
    date: 'Now',
    you: scanData.harbor_score
  }] : [])

  if (loading) {
    return (
      <div className="min-h-screen bg-primary" data-page="overview">
        <MobileHeader />
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-card rounded-lg w-full"></div>
            <div className="h-64 bg-card rounded-lg w-full"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-primary" data-page="overview">
      <MobileHeader />
      
      {/* Header Bar - Peec style */}
      <div className="page-header-bar">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {currentDashboard?.logo_url ? (
              <img 
                src={currentDashboard.logo_url} 
                alt={currentDashboard.brand_name}
                className="w-6 h-6 rounded"
              />
            ) : (
              <div className="w-6 h-6 rounded bg-secondary flex items-center justify-center text-xs font-medium text-muted">
                {currentDashboard?.brand_name?.charAt(0) || 'B'}
              </div>
            )}
            <span className="font-medium text-primary">{currentDashboard?.brand_name || 'Brand'}</span>
            <ChevronDown className="w-4 h-4 text-muted" />
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Time Range Pills */}
          <div className="pill-group">
            {['7d', '30d', '90d'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`pill ${timeRange === range ? 'active' : ''}`}
              >
                {range === '7d' ? 'Last 7 days' : range === '30d' ? 'Last 30 days' : 'Last 90 days'}
              </button>
            ))}
          </div>

          {/* Export Button */}
          <button className="btn-secondary flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Status Banner */}
      {hasScanData && (
        <div className="status-banner">
          <div className="status-banner-text">
            <span className="font-medium text-primary">Overview</span>
            <span className="mx-2">•</span>
            <span>
              {currentDashboard?.brand_name}'s Visibility 
              {visibilityDelta >= 0 ? ' trending up ' : ' trending down '}
              by {Math.abs(visibilityDelta)}% this month
            </span>
          </div>
          <div className="status-banner-metrics">
            <span>
              Visibility: <strong className="text-primary">{competitorData?.userRank || '-'}/{competitorData?.totalInCategory || '-'}</strong>
              {visibilityDelta !== 0 && (
                <span className={visibilityDelta > 0 ? 'text-positive ml-1' : 'text-negative ml-1'}>
                  {visibilityDelta > 0 ? '↑' : '↓'}
                </span>
              )}
            </span>
            <span>•</span>
            <span>
              Score: <strong className="text-primary">{scanData?.harbor_score || 0}</strong>
            </span>
          </div>
        </div>
      )}

      {/* Scan Running State */}
      {scanStatus === 'running' && currentScanId && !hasScanData && (
        <div className="p-6">
          <ScanProgressInline scanId={currentScanId} />
        </div>
      )}

      {/* Main Content */}
      {hasScanData && (
        <div className="p-6 space-y-6">
          {/* Top Row: Chart + Competitor Table */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart Section */}
            <div className="lg:col-span-2 card p-0 overflow-hidden">
              {/* Chart Header */}
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="pill-group">
                  {(['visibility', 'sentiment', 'position'] as const).map((metric) => (
                    <button
                      key={metric}
                      onClick={() => setActiveMetric(metric)}
                      className={`pill flex items-center gap-1.5 ${activeMetric === metric ? 'active' : ''}`}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      {metric.charAt(0).toUpperCase() + metric.slice(1)}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <button className="expand-btn" title="View detailed chart">
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Chart */}
              <div className="p-4 h-[300px]">
                {displayChartData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-muted">
                    <p>Run a scan to start tracking your visibility</p>
                  </div>
                ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={displayChartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                      domain={[0, 100]}
                      tickFormatter={(value) => `${value}%`}
                    />
                    <Tooltip 
                      content={({ active, payload, label }) => {
                        if (!active || !payload?.length) return null
                        
                        // Build logo map for tooltip
                        const logoMap: Record<string, string | undefined> = {
                          [currentDashboard?.brand_name || 'You']: currentDashboard?.logo_url || undefined
                        }
                        competitorData?.competitors?.slice(0, 2).forEach((comp) => {
                          logoMap[comp.brand_name] = comp.logo_url
                        })
                        
                        return (
                          <div className="bg-card border border-border rounded-lg shadow-lg p-3 min-w-[240px]">
                            <div className="font-medium text-primary mb-3">{label}</div>
                            <div className="space-y-2.5">
                              {payload.map((entry: any, idx: number) => (
                                <div key={idx} className="flex items-center gap-3">
                                  <div 
                                    className="w-2.5 h-2.5 rounded-sm flex-shrink-0" 
                                    style={{ backgroundColor: entry.color }}
                                  />
                                  {logoMap[entry.name] ? (
                                    <img 
                                      src={logoMap[entry.name]} 
                                      alt={entry.name}
                                      className="w-5 h-5 rounded object-contain flex-shrink-0"
                                    />
                                  ) : (
                                    <div className="w-5 h-5 rounded bg-secondary flex items-center justify-center text-2xs font-medium text-muted flex-shrink-0">
                                      {entry.name?.charAt(0)}
                                    </div>
                                  )}
                                  <span className="text-secondary flex-1">{entry.name}</span>
                                  <span className="font-medium text-primary">{entry.value}%</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      }}
                    />
                    <Legend 
                      iconType="circle"
                      iconSize={8}
                      wrapperStyle={{ paddingTop: '16px' }}
                      formatter={(value: string) => (
                        <span style={{ color: 'var(--text-secondary)', marginRight: '16px', fontSize: '13px' }}>
                          {value}
                        </span>
                      )}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="you" 
                      name={currentDashboard?.brand_name || 'You'}
                      stroke="#3B82F6" 
                      strokeWidth={2}
                      dot={displayChartData.length === 1}
                      activeDot={{ r: 4 }}
                    />
                    {/* Show competitor current scores as reference lines */}
                    {competitorData?.competitors?.slice(0, 2).map((comp, idx) => {
                      // Add competitor scores as horizontal reference lines
                      const compScore = comp.visibility_score
                      return (
                        <ReferenceLine 
                          key={comp.id}
                          y={compScore}
                          stroke={idx === 0 ? '#10B981' : '#F59E0B'}
                          strokeDasharray="5 5"
                          strokeWidth={1.5}
                          label={{
                            value: `${comp.brand_name}: ${compScore}%`,
                            position: 'right',
                            fill: idx === 0 ? '#10B981' : '#F59E0B',
                            fontSize: 11
                          }}
                        />
                      )
                    })}
                  </LineChart>
                </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Competitor Ranking */}
            <div className="card p-0 overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div>
                  <h3 className="font-semibold text-primary text-sm">Competitors</h3>
                  <p className="text-xs text-muted mt-0.5">
                    {competitorData?.category || 'Your category'}
                  </p>
                </div>
                <Link href="/dashboard/competitors" className="expand-btn" title="View all competitors">
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="divide-y divide-border-light">
                {/* User's position */}
                {competitorData && (
                  <div className="ranking-row is-user">
                    <span className="ranking-position">{competitorData.userRank}</span>
                    {currentDashboard?.logo_url ? (
                      <img 
                        src={currentDashboard.logo_url} 
                        alt={currentDashboard.brand_name}
                        className="ranking-logo"
                      />
                    ) : (
                      <div className="ranking-logo flex items-center justify-center text-2xs font-medium">
                        {currentDashboard?.brand_name?.charAt(0)}
                      </div>
                    )}
                    <span className="ranking-name">
                      {currentDashboard?.brand_name}
                      <span className="ml-1.5 text-xs bg-info/10 text-info px-1.5 py-0.5 rounded">You</span>
                    </span>
                    <span className="ranking-score">{competitorData.userScore}%</span>
                  </div>
                )}

                {/* Competitors */}
                {competitorData?.competitors?.slice(0, 5).map((comp, idx) => {
                  // Skip if this would be the same as user position
                  const displayRank = comp.rank_global || idx + 1
                  
                  return (
                    <Link 
                      key={comp.id} 
                      href={`/brands/${comp.slug}`}
                      className="ranking-row"
                    >
                      <span className="ranking-position">{displayRank}</span>
                      {comp.logo_url ? (
                        <img 
                          src={comp.logo_url} 
                          alt={comp.brand_name}
                          className="ranking-logo"
                        />
                      ) : (
                        <div className="ranking-logo flex items-center justify-center text-2xs font-medium">
                          {comp.brand_name?.charAt(0)}
                        </div>
                      )}
                      <span className="ranking-name truncate">{comp.brand_name}</span>
                      <span className="ranking-score">{comp.visibility_score}%</span>
                    </Link>
                  )
                })}

                {(!competitorData?.competitors || competitorData.competitors.length === 0) && (
                  <div className="p-4 text-center text-sm text-muted">
                    No competitors found in your category
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Row: Quick Stats + Module Summary */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/dashboard/shopping" className="card card-interactive p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 rounded-lg bg-chart-2/10 flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4 text-chart-2" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-muted" />
              </div>
              <div className="metric-value text-2xl">{scanData.shopping_visibility}%</div>
              <div className="text-sm text-secondary mt-1">Shopping Visibility</div>
              {deltas.shopping !== 0 ? (
                <div className={`delta ${deltas.shopping > 0 ? 'delta-up' : 'delta-down'} text-xs mt-2`}>
                  {deltas.shopping > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {deltas.shopping > 0 ? '+' : ''}{deltas.shopping}% vs previous
                </div>
              ) : (
                <div className="delta delta-neutral text-xs mt-2">
                  <Minus className="w-3 h-3" />
                  No change
                </div>
              )}
            </Link>

            <Link href="/dashboard/brand" className="card card-interactive p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 rounded-lg bg-chart-1/10 flex items-center justify-center">
                  <Eye className="w-4 h-4 text-chart-1" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-muted" />
              </div>
              <div className="metric-value text-2xl">{scanData.brand_visibility}%</div>
              <div className="text-sm text-secondary mt-1">Brand Visibility</div>
              {deltas.brand !== 0 ? (
                <div className={`delta ${deltas.brand > 0 ? 'delta-up' : 'delta-down'} text-xs mt-2`}>
                  {deltas.brand > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {deltas.brand > 0 ? '+' : ''}{deltas.brand}% vs previous
                </div>
              ) : (
                <div className="delta delta-neutral text-xs mt-2">
                  <Minus className="w-3 h-3" />
                  No change
                </div>
              )}
            </Link>

            <Link href="/dashboard/website" className="card card-interactive p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 rounded-lg bg-chart-5/10 flex items-center justify-center">
                  <Globe className="w-4 h-4 text-chart-5" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-muted" />
              </div>
              <div className="metric-value text-2xl">{scanData.site_readability}%</div>
              <div className="text-sm text-secondary mt-1">Website Readiness</div>
              {deltas.website !== 0 ? (
                <div className={`delta ${deltas.website > 0 ? 'delta-up' : 'delta-down'} text-xs mt-2`}>
                  {deltas.website > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {deltas.website > 0 ? '+' : ''}{deltas.website}% vs previous
                </div>
              ) : (
                <div className="delta delta-neutral text-xs mt-2">
                  <Minus className="w-3 h-3" />
                  No change
                </div>
              )}
            </Link>

            <Link href="/dashboard/conversations" className="card card-interactive p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 rounded-lg bg-chart-3/10 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-chart-3" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-muted" />
              </div>
              <div className="metric-value text-2xl">{scanData.conversation_topics}</div>
              <div className="text-sm text-secondary mt-1">Topics Tracked</div>
              <div className="delta delta-neutral text-xs mt-2">
                <Minus className="w-3 h-3" />
                --
              </div>
            </Link>
          </div>

          {/* Last Updated */}
          <div className="text-xs text-muted">
            Last updated: {new Date(scanData.last_scan!).toLocaleDateString('en-US', { 
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
  )
}