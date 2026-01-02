// apps/web/app/dashboard/competitors/page.tsx
// Competitive Intelligence - MOCK DATA VERSION FOR SCREENSHOTS
// Cmd+Z to revert when done

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { 
  Users,
  TrendingUp,
  TrendingDown,
  Plus,
  ArrowUpRight,
  AlertCircle,
  X,
  Eye,
  MessageSquare,
  BarChart3,
  Search
} from 'lucide-react'
import { XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'
import { useBrand } from '@/contexts/BrandContext'
import MobileHeader from '@/components/layout/MobileHeader'

// ============================================================================
// MOCK DATA - DELETE THIS SECTION WHEN DONE
// ============================================================================

const MOCK_TRACKED: TrackedCompetitor[] = [
  {
    id: '1',
    profile_id: 'peec-1',
    brand_name: 'Peec',
    domain: 'peec.ai',
    logo_url: 'https://cdn.brandfetch.io/peec.ai?c=1id1Fyz-h7an5-5KR_y',
    mentions: 847,
    visibility: 72,
    sentiment: 'positive',
    avg_position: 2.3
  },
  {
    id: '2',
    profile_id: 'profound-1',
    brand_name: 'Profound',
    domain: 'tryprofound.com',
    logo_url: 'https://cdn.brandfetch.io/tryprofound.com?c=1id1Fyz-h7an5-5KR_y',
    mentions: 1243,
    visibility: 78,
    sentiment: 'positive',
    avg_position: 1.8
  },
  {
    id: '3',
    profile_id: 'otterly-1',
    brand_name: 'Otterly',
    domain: 'otterly.ai',
    logo_url: 'https://cdn.brandfetch.io/otterly.ai?c=1id1Fyz-h7an5-5KR_y',
    mentions: 312,
    visibility: 45,
    sentiment: 'neutral',
    avg_position: 4.1
  },
  {
    id: '4',
    profile_id: 'scrunch-1',
    brand_name: 'Scrunch',
    domain: 'scrunch.com',
    logo_url: 'https://cdn.brandfetch.io/scrunch.com?c=1id1Fyz-h7an5-5KR_y',
    mentions: 956,
    visibility: 68,
    sentiment: 'positive',
    avg_position: 2.7
  }
]

const MOCK_USER_DATA = {
  brand_name: 'Harbor',
  category: 'AI Visibility',
  visibility: 64,
  mentions: 523,
  sentiment: 'positive' as const,
  position: 3.2
}

const MOCK_PLAN_LIMITS = {
  current: 4,
  max: 10,
  plan: 'Agency'
}

const MOCK_TREND_DATA = [
  { date: '2025-12-26', displayDate: 'Dec 26', you: 58 },
  { date: '2025-12-27', displayDate: 'Dec 27', you: 61 },
  { date: '2025-12-28', displayDate: 'Dec 28', you: 59 },
  { date: '2025-12-29', displayDate: 'Dec 29', you: 62 },
  { date: '2025-12-30', displayDate: 'Dec 30', you: 64 },
  { date: '2025-12-31', displayDate: 'Dec 31', you: 63 },
  { date: '2026-01-01', displayDate: 'Jan 1', you: 64 },
]

const MOCK_COMPETITORS: CompetitorData[] = [
  {
    rank: 1,
    name: 'Profound',
    domain: 'tryprofound.com',
    logo: 'https://cdn.brandfetch.io/tryprofound.com?c=1id1Fyz-h7an5-5KR_y',
    fallbackLogo: '',
    visibility: 78,
    sentiment: 'positive',
    position: 1.8,
    mentions: 1243,
    isUser: false,
    isTracked: true,
    color: '#6366F1',
    profile_id: 'profound-1'
  },
  {
    rank: 2,
    name: 'Peec',
    domain: 'peec.ai',
    logo: 'https://cdn.brandfetch.io/peec.ai?c=1id1Fyz-h7an5-5KR_y',
    fallbackLogo: '',
    visibility: 72,
    sentiment: 'positive',
    position: 2.3,
    mentions: 847,
    isUser: false,
    isTracked: true,
    color: '#10B981',
    profile_id: 'peec-1'
  },
  {
    rank: 3,
    name: 'Scrunch',
    domain: 'scrunch.com',
    logo: 'https://cdn.brandfetch.io/scrunch.com?c=1id1Fyz-h7an5-5KR_y',
    fallbackLogo: '',
    visibility: 68,
    sentiment: 'positive',
    position: 2.7,
    mentions: 956,
    isUser: false,
    isTracked: true,
    color: '#F59E0B',
    profile_id: 'scrunch-1'
  },
  {
    rank: 4,
    name: 'Harbor',
    domain: 'useharbor.io',
    logo: 'https://cdn.brandfetch.io/useharbor.io?c=1id1Fyz-h7an5-5KR_y',
    fallbackLogo: '',
    visibility: 64,
    sentiment: 'positive',
    position: 3.2,
    mentions: 523,
    isUser: true,
    isTracked: false,
    color: '#06B6D4',
    profile_id: null
  },
  {
    rank: 5,
    name: 'Otterly',
    domain: 'otterly.ai',
    logo: 'https://cdn.brandfetch.io/otterly.ai?c=1id1Fyz-h7an5-5KR_y',
    fallbackLogo: '',
    visibility: 45,
    sentiment: 'neutral',
    position: 4.1,
    mentions: 312,
    isUser: false,
    isTracked: true,
    color: '#8B5CF6',
    profile_id: 'otterly-1'
  }
]

// ============================================================================
// TYPES
// ============================================================================

interface TrackedCompetitor {
  id: string
  profile_id: string
  brand_name: string
  domain: string
  logo_url: string
  mentions: number
  visibility: number
  sentiment: string
  avg_position: number | null
}

interface CompetitorData {
  rank: number
  name: string
  domain: string
  logo: string
  fallbackLogo: string
  visibility: number
  sentiment: string
  position: number | null
  mentions: number
  isUser: boolean
  isTracked: boolean
  color: string
  profile_id: string | null
}

interface ApiResponse {
  competitors: CompetitorData[]
  tracked: TrackedCompetitor[]
  suggested: any[]
  user_data: {
    brand_name: string
    category: string | null
    visibility: number
    mentions: number
    sentiment: string
    position: number | null
  }
  total_brands_found: number
  user_rank: number | null
  plan_limits: {
    current: number
    max: number
    plan: string
  }
}

// ============================================================================
// HELPERS
// ============================================================================

function getSentimentColor(sentiment: string): string {
  switch (sentiment) {
    case 'positive': return 'text-green-500'
    case 'negative': return 'text-red-500'
    default: return 'text-muted'
  }
}

function getSentimentBg(sentiment: string): string {
  switch (sentiment) {
    case 'positive': return 'bg-green-500/10'
    case 'negative': return 'bg-red-500/10'
    default: return 'bg-secondary'
  }
}

// ============================================================================
// BRAND LOGO COMPONENT
// ============================================================================

function BrandLogo({ 
  domain, 
  logoUrl,
  name, 
  size = 32,
  className = ''
}: { 
  domain?: string | null
  logoUrl?: string | null
  name: string
  size?: number
  className?: string
}) {
  const [error, setError] = useState(false)
  
  const url = logoUrl || (domain ? `https://cdn.brandfetch.io/${domain}?c=1id1Fyz-h7an5-5KR_y` : null)
  
  if (error || !url) {
    return (
      <div 
        className={`rounded-lg bg-secondary flex items-center justify-center text-primary font-semibold flex-shrink-0 ${className}`}
        style={{ width: size, height: size, fontSize: size * 0.4 }}
      >
        {name?.charAt(0)?.toUpperCase() || '?'}
      </div>
    )
  }
  
  return (
    <img
      src={url}
      alt={name}
      className={`rounded-lg bg-secondary flex-shrink-0 ${className}`}
      style={{ width: size, height: size }}
      onError={() => setError(true)}
    />
  )
}

// ============================================================================
// STAT CARD COMPONENT
// ============================================================================

function StatCard({ 
  label, 
  value, 
  subValue,
  trend,
  icon
}: { 
  label: string
  value: string | number
  subValue?: string
  trend?: { value: number; positive: boolean } | null
  icon?: string
}) {
  return (
    <div className="bg-card rounded-xl border border-border p-4 hover:border-border-light transition-colors">
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs text-muted uppercase tracking-wide">{label}</span>
        {icon && (
          <Image 
            src={`/icons/${icon}`} 
            alt="" 
            width={24} 
            height={24} 
            className="opacity-60"
          />
        )}
      </div>
      <div className="flex items-end justify-between">
        <div>
          <div className="text-2xl font-semibold text-primary tabular-nums">{value}</div>
          {subValue && (
            <div className="text-xs text-muted mt-0.5">{subValue}</div>
          )}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm font-medium ${trend.positive ? 'text-green-500' : 'text-red-500'}`}>
            {trend.positive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {trend.value}%
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================================================
// TRACKED COMPETITOR ROW
// ============================================================================

function TrackedCompetitorRow({ 
  competitor, 
  userData, 
  onUntrack,
  isUntracking,
  onClick
}: { 
  competitor: TrackedCompetitor
  userData: ApiResponse['user_data'] | null
  onUntrack: () => void
  isUntracking: boolean
  onClick: () => void
}) {
  const visibilityDiff = userData ? competitor.visibility - userData.visibility : 0
  const isWinning = visibilityDiff < 0
  const isTied = visibilityDiff === 0
  
  return (
    <div 
      className="group flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer"
      onClick={onClick}
    >
      <BrandLogo 
        domain={competitor.domain}
        logoUrl={competitor.logo_url}
        name={competitor.brand_name}
        size={40}
      />
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-primary truncate">{competitor.brand_name}</span>
          <span className={`text-xs px-1.5 py-0.5 rounded capitalize ${getSentimentBg(competitor.sentiment)} ${getSentimentColor(competitor.sentiment)}`}>
            {competitor.sentiment}
          </span>
        </div>
        <div className="text-xs text-muted truncate">{competitor.domain}</div>
      </div>
      
      <div className="text-right">
        <div className="text-sm font-semibold text-primary tabular-nums">{competitor.visibility}%</div>
        <div className={`text-xs ${isWinning ? 'text-green-500' : isTied ? 'text-muted' : 'text-red-500'}`}>
          {isTied ? 'Tied' : isWinning ? `You +${Math.abs(visibilityDiff)}%` : `+${visibilityDiff}%`}
        </div>
      </div>
      
      <button
        onClick={(e) => {
          e.stopPropagation()
          onUntrack()
        }}
        disabled={isUntracking}
        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-secondary text-muted hover:text-red-500 transition-all"
      >
        {isUntracking ? (
          <div className="w-4 h-4 border-2 border-muted border-t-primary rounded-full animate-spin" />
        ) : (
          <X className="w-4 h-4" />
        )}
      </button>
    </div>
  )
}

// ============================================================================
// LEADERBOARD ROW
// ============================================================================

function LeaderboardRow({ 
  competitor, 
  onTrack,
  isTracking
}: { 
  competitor: CompetitorData
  onTrack: () => void
  isTracking: boolean
}) {
  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${competitor.isUser ? 'bg-cyan-500/5 border border-cyan-500/20' : 'hover:bg-secondary/50'}`}>
      <div className="w-6 text-center">
        <span className={`text-sm font-semibold ${competitor.isUser ? 'text-cyan-500' : 'text-muted'}`}>
          #{competitor.rank}
        </span>
      </div>
      
      <BrandLogo 
        domain={competitor.domain}
        logoUrl={competitor.logo}
        name={competitor.name}
        size={36}
      />
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`font-medium truncate ${competitor.isUser ? 'text-cyan-500' : 'text-primary'}`}>
            {competitor.name}
          </span>
          {competitor.isUser && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-500">You</span>
          )}
        </div>
        <div className="text-xs text-muted truncate">{competitor.domain}</div>
      </div>
      
      <div className="text-right">
        <div className="text-sm font-semibold text-primary tabular-nums">{competitor.visibility}%</div>
        <div className="text-xs text-muted">{competitor.mentions} mentions</div>
      </div>
      
      {!competitor.isUser && !competitor.isTracked && (
        <button
          onClick={onTrack}
          disabled={isTracking}
          className="px-2 py-1 text-xs rounded bg-secondary hover:bg-hover text-muted hover:text-primary transition-colors"
        >
          {isTracking ? '...' : 'Track'}
        </button>
      )}
      
      {competitor.isTracked && (
        <span className="text-xs text-green-500 px-2">Tracking</span>
      )}
    </div>
  )
}

// ============================================================================
// MAIN COMPONENT - USING MOCK DATA
// ============================================================================

export default function CompetitorsPage() {
  const { currentDashboard } = useBrand()
  
  // Use mock data instead of API calls
  const loading = false
  const competitors = MOCK_COMPETITORS
  const tracked = MOCK_TRACKED
  const userData = MOCK_USER_DATA
  const planLimits = MOCK_PLAN_LIMITS
  const totalBrands = 127
  const userRank = 4
  const trendData = MOCK_TREND_DATA
  const hasTrendData = true
  
  // Modal states (keep functional for UI)
  const [showAddModal, setShowAddModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCompetitor, setSelectedCompetitor] = useState<TrackedCompetitor | null>(null)

  const hasLeaderboardData = competitors.length > 0
  const hasTrackedOrLeaderboard = tracked.length > 0 || competitors.length > 0
  const canTrackMore = planLimits ? tracked.length < planLimits.max : true

  return (
    <div className="min-h-screen bg-primary" data-page="competitors">
      <MobileHeader />

      {/* Header Bar */}
      <div className="page-header-bar">
        <div className="flex items-center gap-3">
          <Users className="w-4 h-4 text-muted" />
          <h1 className="text-sm font-medium text-secondary">Competitive Intelligence</h1>
        </div>

        <div className="flex items-center gap-2">
          {canTrackMore && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg bg-black text-white hover:bg-neutral-800 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          )}
          <Link 
            href="/dashboard/competitors/manage"
            className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg text-secondary hover:text-primary hover:bg-secondary transition-colors"
          >
            Manage
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <div className="p-6 space-y-6">
        
        {/* Stat Cards Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Your Rank"
            value={`#${userRank}`}
            subValue={`of ${totalBrands} brands`}
            icon="trophy.png"
          />
          <StatCard
            label="Visibility"
            value={`${userData.visibility}%`}
            subValue="in AI responses"
            trend={{ value: 8, positive: true }}
            icon="visibility.png"
          />
          <StatCard
            label="Tracked"
            value={tracked.length}
            subValue={`of ${planLimits.max} slots`}
            icon="user.png"
          />
          <StatCard
            label="Mentions"
            value={userData.mentions}
            subValue="across all prompts"
            trend={{ value: 12, positive: true }}
            icon="mentions.png"
          />
        </div>
        
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Visibility Trend Chart */}
          <div className="lg:col-span-2 card p-0 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div>
                <h3 className="font-semibold text-primary text-sm">Visibility Over Time</h3>
                <p className="text-xs text-muted mt-0.5">Your AI visibility trend</p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-1 rounded-full" style={{ background: 'linear-gradient(90deg, #06B6D4, #A855F7, #EC4899)' }} />
                  <span className="text-muted">You</span>
                </div>
              </div>
            </div>
            
            <div className="p-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="holoGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#06B6D4" />
                      <stop offset="50%" stopColor="#A855F7" />
                      <stop offset="100%" stopColor="#EC4899" />
                    </linearGradient>
                    <linearGradient id="holoFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#A855F7" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#A855F7" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="displayDate" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#666', fontSize: 11 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#666', fontSize: 11 }}
                    domain={[0, 100]}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip
                    contentStyle={{
                      background: '#1a1a1a',
                      border: '1px solid #333',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                    formatter={(value: number) => [`${value}%`, 'Visibility']}
                  />
                  <Area
                    type="monotone"
                    dataKey="you"
                    stroke="url(#holoGradient)"
                    strokeWidth={2}
                    fill="url(#holoFill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Tracked Competitors */}
          <div className="card p-0 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div>
                <h3 className="font-semibold text-primary text-sm">Tracked Competitors</h3>
                <p className="text-xs text-muted mt-0.5">{tracked.length} of {planLimits.max} slots used</p>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="p-1.5 rounded-lg hover:bg-secondary text-muted hover:text-primary transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            
            <div className="divide-y divide-border max-h-[320px] overflow-y-auto">
              {tracked.map((competitor) => (
                <TrackedCompetitorRow
                  key={competitor.id}
                  competitor={competitor}
                  userData={userData}
                  onUntrack={() => {}}
                  isUntracking={false}
                  onClick={() => setSelectedCompetitor(competitor)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Category Leaderboard */}
        <div className="card p-0 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div>
              <h3 className="font-semibold text-primary text-sm">AI Visibility Leaderboard</h3>
              <p className="text-xs text-muted mt-0.5">{totalBrands} brands in your category</p>
            </div>
          </div>
          
          <div className="divide-y divide-border">
            {competitors.map((competitor) => (
              <LeaderboardRow
                key={competitor.domain}
                competitor={competitor}
                onTrack={() => {}}
                isTracking={false}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}