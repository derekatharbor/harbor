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
  Minus,
  Briefcase, // New icon for Brand/Brands card
  Plus // New icon for Add button
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
  ReferenceLine,
  Cell, // For donut chart
  PieChart, // For donut chart
  Pie // For donut chart
} from 'recharts'
import Image from 'next/image' // Recommended for Next.js

// --- [TYPE INTERFACES REMAIN UNCHANGED] ---
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
// --- [END TYPE INTERFACES] ---

// Placeholder for Top Sources/Domains data
const TOP_SOURCES_DATA = [
  { domain: 'experian.com', used: 59, citations: 1.2, type: 'Corporate' },
  { domain: 'nerdwallet.com', used: 41, citations: 1.4, type: 'Editorial' },
  { domain: 'cnbc.com', used: 30, citations: 1.2, type: 'Corporate' },
]
const PIE_COLORS = ['#FF6B4A', '#2979FF', '#10B981', '#F59E0B']

// Placeholder for Brands with Highest Visibility table
const HIGH_VISIBILITY_BRANDS = [
  { rank: 1, name: 'Brim', visibility: 0, sentiment: '-', position: '-' }
]


export default function OverviewPage() {
  const { currentDashboard } = useBrand()
  const [scanData, setScanData] = useState<ScanData | null>(null)
  const [loading, setLoading] = useState(true)
  const [competitorData, setCompetitorData] = useState<CompetitorData | null>(null)
  const [snapshotData, setSnapshotData] = useState<SnapshotData | null>(null)
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])
  const [scanStatus, setScanStatus] = useState<'none' | 'running' | 'done'>('none')
  const [currentScanId, setCurrentScanId] = useState<string | null>(null)
  // Peec screenshot shows no metric selector, but we keep this for future use
  const [activeMetric, setActiveMetric] = useState<'visibility' | 'sentiment' | 'position'>('visibility') 
  const [timeRange, setTimeRange] = useState('7d') // Default to 7d to match Peec screenshot

  const router = useRouter()

  // --- [EFFECT HOOK REMAINS LARGELY UNCHANGED] ---
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
            // Changed from router.push to just return to allow loading state for no-scan
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
  // --- [END EFFECT HOOK] ---

  const hasScanData = scanData && scanData.last_scan

  // Use real deltas from snapshot data, fallback to 0
  const deltas = snapshotData?.delta || { shopping: 0, brand: 0, website: 0, harbor: 0 }
  
  // For the status banner, use harbor delta
  // const visibilityDelta = deltas.harbor // No longer needed for Peec header bar

  // If no snapshots yet, show current data as single point
  const displayChartData = chartData.length > 0 ? chartData : (scanData ? [{
    date: 'Now',
    you: scanData.harbor_score
  }] : [])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#101A31]" data-page="overview"> {/* Primary Navy background */}
        <MobileHeader />
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-[#141E38] rounded-lg w-full"></div> {/* Card background */}
            <div className="h-64 bg-[#141E38] rounded-lg w-full"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    // Update bg-primary to specific Primary Navy color
    <div className="min-h-screen bg-[#101A31] text-[#F4F6F8] font-[Source Code Pro]" data-page="overview"> 
      <MobileHeader />
      
      {/* Header Bar - Peec style */}
      {/* Replaced old page-header-bar with the Peec filter pill structure */}
      <div className="sticky top-0 z-10 bg-[#101A31] px-6 pt-4 pb-2 border-b border-[#141E38] shadow-lg">
        <div className="flex items-center gap-2">
          {/* Brand Selector Pill */}
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 text-sm font-medium hover:bg-white/10 transition-colors">
            {currentDashboard?.logo_url ? (
              <img 
                src={currentDashboard.logo_url} 
                alt={currentDashboard.brand_name}
                className="w-4 h-4 rounded-full object-cover"
              />
            ) : (
              <div className="w-4 h-4 rounded-full bg-[#1a1a1a] flex items-center justify-center text-[8px] font-bold text-white">
                {currentDashboard?.brand_name?.charAt(0) || 'B'}
              </div>
            )}
            {currentDashboard?.brand_name || 'Brand'}
            <ChevronDown className="w-3 h-3 text-white/50" />
          </button>

          {/* Time Range Pill */}
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 text-sm font-medium hover:bg-white/10 transition-colors">
            Last {timeRange === '7d' ? '7 days' : timeRange === '30d' ? '30 days' : '90 days'}
            <ChevronDown className="w-3 h-3 text-white/50" />
          </button>
          
          {/* All Models Pill */}
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 text-sm font-medium hover:bg-white/10 transition-colors">
            All Models
            <ChevronDown className="w-3 h-3 text-white/50" />
          </button>

          {/* All Topics Pill */}
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 text-sm font-medium hover:bg-white/10 transition-colors">
            All Topics
            <ChevronDown className="w-3 h-3 text-white/50" />
          </button>
        </div>
      </div>


      {/* Status/Guidance Banner - Matching Peec screenshot */}
      <div className="bg-[#141E38] mx-6 mt-4 p-3 rounded-lg flex justify-between items-center text-sm font-[Space Grotesk]">
        <p className="text-[#F4F6F8]">
          <span className='font-bold'>Need help or want guidance?</span> Join the Daily Kickstart Session!
        </p>
        <div className="flex items-center gap-3">
          <button className="text-white/60 hover:text-white transition-colors text-xs font-medium">Dismiss</button>
          {/* Black button styling */}
          <button className="bg-[#1a1a1a] text-white px-3 py-1.5 rounded-lg hover:bg-[#333] transition-colors text-xs font-medium">
            Join
          </button>
        </div>
      </div>

      {/* Scan Running State */}
      {scanStatus === 'running' && currentScanId && !hasScanData && (
        <div className="p-6">
          <ScanProgressInline scanId={currentScanId} />
        </div>
      )}

      {/* Main Content */}
      {hasScanData && (
        <div className="p-6 space-y-6">
          {/* Top Row: Chart + Brands Card */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* 1. Chart Section (2/3 width) - Now called 'Visibility' */}
            <div className="lg:col-span-2 bg-[#141E38] p-0 rounded-lg overflow-hidden border border-[#212C46]">
              {/* Chart Header - Simplified to match Peec screenshot */}
              <div className="flex items-center justify-between p-4 border-b border-[#212C46]">
                <h3 className="font-medium text-sm text-[#F4F6F8]">
                  Visibility <span className="text-white/60">• Percentage of chats mentioning each brand</span>
                </h3>
                <button className="text-white/60 hover:text-[#FF6B4A] transition-colors flex items-center gap-1 text-xs font-medium">
                  <Download className="w-3.5 h-3.5" />
                  Export
                </button>
              </div>

              {/* Chart */}
              <div className="p-4 h-[300px]">
                {displayChartData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-white/50">
                    <p>Run a scan to start tracking your visibility</p>
                  </div>
                ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={displayChartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#212C46" vertical={false} /> {/* Darker grid */}
                    <XAxis 
                      dataKey="date" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#F4F6F8', fontSize: 12 }}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#F4F6F8', fontSize: 12 }}
                      domain={[0, 100]}
                      tickFormatter={(value) => `${value}%`}
                    />
                    {/* Tooltip and Lines remain, but ensure colors are adapted for dark background */}
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
                          // Dark background for tooltip
                          <div className="bg-[#101A31] border border-[#212C46] rounded-lg shadow-lg p-3 min-w-[240px]">
                            <div className="font-medium text-[#F4F6F8] mb-3">{label}</div>
                            <div className="space-y-2.5">
                              {payload.map((entry: any, idx: number) => (
                                <div key={idx} className="flex items-center gap-3">
                                  <div 
                                    className="w-2.5 h-2.5 rounded-sm flex-shrink-0" 
                                    style={{ backgroundColor: entry.color }}
                                  />
                                  {/* Simplified logo display */}
                                  {logoMap[entry.name] ? (
                                    <img 
                                      src={logoMap[entry.name]} 
                                      alt={entry.name}
                                      className="w-5 h-5 rounded object-contain flex-shrink-0 bg-white p-0.5"
                                    />
                                  ) : (
                                    <div className="w-5 h-5 rounded bg-white flex items-center justify-center text-2xs font-medium text-black flex-shrink-0">
                                      {entry.name?.charAt(0)}
                                    </div>
                                  )}
                                  <span className="text-[#F4F6F8]/80 flex-1">{entry.name}</span>
                                  <span className="font-medium text-[#F4F6F8]">{entry.value}%</span>
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
                        <span style={{ color: '#F4F6F8', marginRight: '16px', fontSize: '13px' }}>
                          {value}
                        </span>
                      )}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="you" 
                      name={currentDashboard?.brand_name || 'You'}
                      stroke="#FF6B4A" // Accent Coral
                      strokeWidth={2}
                      dot={displayChartData.length === 1}
                      activeDot={{ r: 4 }}
                    />
                    {/* Reference Lines - keep for comparison, use Cerulean Blue/Accent Coral */}
                    {competitorData?.competitors?.slice(0, 2).map((comp, idx) => {
                      const compScore = comp.visibility_score
                      return (
                        <ReferenceLine 
                          key={comp.id}
                          y={compScore}
                          stroke={idx === 0 ? '#2979FF' : '#FF6B4A'} // Cerulean Blue / Accent Coral
                          strokeDasharray="5 5"
                          strokeWidth={1.5}
                          label={{
                            value: `${comp.brand_name}: ${compScore}%`,
                            position: 'right',
                            fill: idx === 0 ? '#2979FF' : '#FF6B4A',
                            fontSize: 11
                          }}
                        />
                      )
                    })}
                  </LineChart>
                </ResponsiveContainer>
                )}
              </div>
              {/* PeecAI watermark placeholder */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
                <span className="text-8xl font-bold font-[Space Grotesk] text-[#F4F6F8]">Harbor AI</span>
              </div>
            </div>

            {/* 2. Brands/Competitor List Card (1/3 width) */}
            <div className="bg-[#141E38] p-0 rounded-lg overflow-hidden border border-[#212C46]">
              <div className="flex items-center justify-between p-4 border-b border-[#212C46]">
                <h3 className="font-medium text-sm text-[#F4F6F8]">
                  Brands <span className="text-white/60">• Brands with highest visibility</span>
                </h3>
                <Link href="/dashboard/competitors" className="text-white/60 hover:text-[#FF6B4A] transition-colors text-xs font-medium flex items-center">
                  Show All <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
                </Link>
              </div>

              {/* Brands Table */}
              <table className="w-full text-sm text-left font-[Source Code Pro] border-separate border-spacing-0">
                <thead>
                  <tr className="text-white/50 text-xs font-medium uppercase tracking-wider">
                    <th scope="col" className="px-4 py-2 font-normal w-10">#</th>
                    <th scope="col" className="px-4 py-2 font-normal">Brand</th>
                    <th scope="col" className="px-4 py-2 font-normal text-right">Visibility</th>
                    <th scope="col" className="px-4 py-2 font-normal text-right">Sentiment</th>
                    <th scope="col" className="px-4 py-2 font-normal text-right w-10">Position</th>
                  </tr>
                </thead>
                <tbody>
                  {HIGH_VISIBILITY_BRANDS.map((item, index) => (
                    <tr key={index} className="border-b border-[#212C46] last:border-b-0">
                      <td className="px-4 py-3">{item.rank}</td>
                      <td className="px-4 py-3 flex items-center gap-2">
                        {/* Peec style logo on white background */}
                        <div className="w-6 h-6 rounded bg-white flex items-center justify-center p-0.5">
                          <Briefcase className="w-4 h-4 text-black" />
                        </div>
                        <span className="text-[#F4F6F8]">{item.name}</span>
                      </td>
                      <td className="px-4 py-3 text-right">{item.visibility}%</td>
                      <td className="px-4 py-3 text-right">{item.sentiment}</td>
                      <td className="px-4 py-3 text-right">{item.position}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Add Brands Button - centered, light gray background */}
              <div className="p-4 text-center border-t border-[#212C46]">
                <button className="flex items-center justify-center w-full py-2 bg-white/5 text-white/80 rounded-lg hover:bg-white/10 transition-colors">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Brands
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Row: Top Sources Card */}
          <div className="grid grid-cols-1 gap-6">
            <div className="bg-[#141E38] p-0 rounded-lg overflow-hidden border border-[#212C46]">
              <div className="flex items-center justify-between p-4 border-b border-[#212C46]">
                <h3 className="font-medium text-sm text-[#F4F6F8]">
                  Top Sources <span className="text-white/60">• Sources across active models</span>
                </h3>
                <Link href="/dashboard/sources" className="text-white/60 hover:text-[#FF6B4A] transition-colors text-xs font-medium flex items-center">
                  Show All <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
                </Link>
              </div>

              <div className="flex">
                {/* Donut Chart (20% width) */}
                <div className="w-1/4 p-4 flex items-center justify-center border-r border-[#212C46]">
                  {/* Total Citations Metric */}
                  <div className="relative flex items-center justify-center">
                    <PieChart width={120} height={120}>
                      <Pie
                        data={TOP_SOURCES_DATA}
                        dataKey="used"
                        nameKey="domain"
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={60}
                        paddingAngle={2}
                        fill="#8884d8"
                        startAngle={90}
                        endAngle={-270}
                      >
                        {TOP_SOURCES_DATA.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                    {/* Text overlay for total citations */}
                    <div className="absolute text-center">
                      <span className="text-2xl font-bold font-[Space Grotesk]">284</span>
                      <p className="text-white/60 text-[10px] uppercase mt-0.5">Citations</p>
                    </div>
                  </div>
                </div>

                {/* Sources Table (80% width) */}
                <div className="w-3/4">
                  <table className="w-full text-sm text-left font-[Source Code Pro] border-separate border-spacing-0">
                    <thead>
                      <tr className="text-white/50 text-xs font-medium uppercase tracking-wider">
                        <th scope="col" className="px-4 py-2 font-normal w-1/4">Domain type</th>
                        <th scope="col" className="px-4 py-2 font-normal w-1/4">Domain</th>
                        <th scope="col" className="px-4 py-2 font-normal text-right">Used</th>
                        <th scope="col" className="px-4 py-2 font-normal text-right">Avg. Citations</th>
                        <th scope="col" className="px-4 py-2 font-normal text-right">Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {TOP_SOURCES_DATA.map((item, index) => (
                        <tr key={index} className="border-b border-[#212C46] last:border-b-0">
                          <td className="px-4 py-3 text-center">
                            {/* Placeholder for Domain Type Donut Chart */}
                            <div className="w-4 h-4 rounded-full mx-auto" style={{ backgroundColor: PIE_COLORS[index] }} />
                          </td>
                          <td className="px-4 py-3 flex items-center gap-2">
                            <Briefcase className='w-4 h-4 text-white/50'/>
                            <span className="text-[#F4F6F8]">{item.domain}</span>
                          </td>
                          <td className="px-4 py-3 text-right">{item.used}%</td>
                          <td className="px-4 py-3 text-right">{item.citations}</td>
                          <td className="px-4 py-3 text-right">
                            {/* Gray Pill for Type */}
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-white/5 text-white/80">
                              {item.type}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
          
          {/* Last Updated (Keep) */}
          <div className="text-xs text-white/50">
            Last updated: {new Date(scanData.last_scan!).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric', 
              year: 'numeric',
              hour: 'numeric',
              minute: '2-digit'
            })}
          </div>

          {/* Comment out the old module summary for now */}
          {/* <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">...</div> */}

        </div>
      )}
    </div>
  )
}