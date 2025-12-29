// apps/web/app/dashboard/competitors/page.tsx
// Competitive Intelligence - DUMMY DATA VERSION for screenshots

'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { 
  Users,
  TrendingUp,
  TrendingDown,
  Plus,
  ArrowUpRight,
  X,
} from 'lucide-react'
import { XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'
import MobileHeader from '@/components/layout/MobileHeader'

// ============================================================================
// DUMMY DATA
// ============================================================================

const DUMMY_USER_DATA = {
  brand_name: 'Acme Corp',
  category: 'SaaS',
  visibility: 72,
  mentions: 847,
  sentiment: 'positive',
  position: 2.1
}

const DUMMY_TRACKED: TrackedCompetitor[] = [
  {
    id: '1',
    profile_id: 'p1',
    brand_name: 'TechFlow',
    domain: 'techflow.io',
    logo_url: 'https://logo.clearbit.com/techflow.io',
    mentions: 723,
    visibility: 68,
    sentiment: 'positive',
    avg_position: 2.4
  },
  {
    id: '2',
    profile_id: 'p2',
    brand_name: 'Zenith Labs',
    domain: 'zenith.com',
    logo_url: 'https://logo.clearbit.com/zenith.com',
    mentions: 512,
    visibility: 54,
    sentiment: 'neutral',
    avg_position: 3.2
  },
  {
    id: '3',
    profile_id: 'p3',
    brand_name: 'Quantum Inc',
    domain: 'quantum.com',
    logo_url: 'https://logo.clearbit.com/quantum.com',
    mentions: 389,
    visibility: 41,
    sentiment: 'positive',
    avg_position: 4.1
  },
]

const DUMMY_COMPETITORS: CompetitorData[] = [
  {
    rank: 1,
    name: 'Acme Corp',
    domain: 'acme.com',
    logo: 'https://logo.clearbit.com/acme.com',
    fallbackLogo: 'https://ui-avatars.com/api/?name=Acme&background=1a1a1a&color=fff&size=64',
    visibility: 72,
    sentiment: 'positive',
    position: 2.1,
    mentions: 847,
    isUser: true,
    isTracked: false,
    color: '#FF6B4A',
    profile_id: null
  },
  {
    rank: 2,
    name: 'TechFlow',
    domain: 'techflow.io',
    logo: 'https://logo.clearbit.com/techflow.io',
    fallbackLogo: 'https://ui-avatars.com/api/?name=TechFlow&background=1a1a1a&color=fff&size=64',
    visibility: 68,
    sentiment: 'positive',
    position: 2.4,
    mentions: 723,
    isUser: false,
    isTracked: true,
    color: '#3B82F6',
    profile_id: 'p1'
  },
  {
    rank: 3,
    name: 'Zenith Labs',
    domain: 'zenith.com',
    logo: 'https://logo.clearbit.com/zenith.com',
    fallbackLogo: 'https://ui-avatars.com/api/?name=Zenith&background=1a1a1a&color=fff&size=64',
    visibility: 54,
    sentiment: 'neutral',
    position: 3.2,
    mentions: 512,
    isUser: false,
    isTracked: true,
    color: '#22C55E',
    profile_id: 'p2'
  },
  {
    rank: 4,
    name: 'Quantum Inc',
    domain: 'quantum.com',
    logo: 'https://logo.clearbit.com/quantum.com',
    fallbackLogo: 'https://ui-avatars.com/api/?name=Quantum&background=1a1a1a&color=fff&size=64',
    visibility: 41,
    sentiment: 'positive',
    position: 4.1,
    mentions: 389,
    isUser: false,
    isTracked: true,
    color: '#8B5CF6',
    profile_id: 'p3'
  },
  {
    rank: 5,
    name: 'Nova Systems',
    domain: 'nova.io',
    logo: 'https://logo.clearbit.com/nova.io',
    fallbackLogo: 'https://ui-avatars.com/api/?name=Nova&background=1a1a1a&color=fff&size=64',
    visibility: 35,
    sentiment: 'neutral',
    position: 4.8,
    mentions: 298,
    isUser: false,
    isTracked: false,
    color: '#F59E0B',
    profile_id: 'p4'
  },
  {
    rank: 6,
    name: 'Apex Digital',
    domain: 'apex.com',
    logo: 'https://logo.clearbit.com/apex.com',
    fallbackLogo: 'https://ui-avatars.com/api/?name=Apex&background=1a1a1a&color=fff&size=64',
    visibility: 28,
    sentiment: 'negative',
    position: 5.3,
    mentions: 234,
    isUser: false,
    isTracked: false,
    color: '#EC4899',
    profile_id: 'p5'
  },
  {
    rank: 7,
    name: 'Prism Tech',
    domain: 'prismtech.com',
    logo: 'https://logo.clearbit.com/prismtech.com',
    fallbackLogo: 'https://ui-avatars.com/api/?name=Prism&background=1a1a1a&color=fff&size=64',
    visibility: 24,
    sentiment: 'positive',
    position: 5.8,
    mentions: 198,
    isUser: false,
    isTracked: false,
    color: '#14B8A6',
    profile_id: 'p6'
  },
  {
    rank: 8,
    name: 'Vertex AI',
    domain: 'vertexai.com',
    logo: 'https://logo.clearbit.com/vertexai.com',
    fallbackLogo: 'https://ui-avatars.com/api/?name=Vertex&background=1a1a1a&color=fff&size=64',
    visibility: 19,
    sentiment: 'neutral',
    position: 6.2,
    mentions: 156,
    isUser: false,
    isTracked: false,
    color: '#6366F1',
    profile_id: 'p7'
  },
]

const DUMMY_TREND_DATA = [
  { date: '2025-12-22', displayDate: 'Dec 22', you: 58 },
  { date: '2025-12-23', displayDate: 'Dec 23', you: 61 },
  { date: '2025-12-24', displayDate: 'Dec 24', you: 59 },
  { date: '2025-12-25', displayDate: 'Dec 25', you: 64 },
  { date: '2025-12-26', displayDate: 'Dec 26', you: 67 },
  { date: '2025-12-27', displayDate: 'Dec 27', you: 69 },
  { date: '2025-12-28', displayDate: 'Dec 28', you: 72 },
]

const DUMMY_PLAN_LIMITS = {
  current: 3,
  max: 5,
  plan: 'Pro'
}

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
  userData
}: { 
  competitor: TrackedCompetitor
  userData: typeof DUMMY_USER_DATA | null
}) {
  const visibilityDiff = userData ? competitor.visibility - userData.visibility : 0
  const isWinning = visibilityDiff < 0
  const isTied = visibilityDiff === 0
  
  return (
    <div className="group flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors">
      <img 
        src={competitor.logo_url}
        alt=""
        className="w-8 h-8 rounded-lg bg-secondary flex-shrink-0"
        onError={(e) => { 
          e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(competitor.brand_name)}&background=1a1a1a&color=fff&size=64`
        }}
      />
      <div className="flex-1 min-w-0">
        <div className="font-medium text-primary text-sm truncate">{competitor.brand_name}</div>
        <div className="text-xs text-muted">{competitor.visibility}% visibility</div>
      </div>
      <div className="flex items-center gap-2">
        {userData && !isTied && (
          <span className={`text-xs font-medium ${isWinning ? 'text-green-500' : 'text-red-500'}`}>
            {isWinning ? '+' : ''}{-visibilityDiff}%
          </span>
        )}
        <button
          className="p-1.5 rounded-lg text-muted opacity-0 group-hover:opacity-100 hover:text-red-500 hover:bg-red-500/10 transition-all"
          title="Stop tracking"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}

// ============================================================================
// CUSTOM CHART TOOLTIP
// ============================================================================

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload) return null
  
  return (
    <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
      <div className="text-xs text-muted mb-2">{label}</div>
      {payload.map((entry: any, idx: number) => (
        <div key={idx} className="flex items-center gap-2 text-sm">
          <div 
            className="w-2 h-2 rounded-full" 
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-muted capitalize">{entry.dataKey}:</span>
          <span className="font-medium text-primary">{entry.value}%</span>
        </div>
      ))}
    </div>
  )
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function CompetitorsPage() {
  const competitors = DUMMY_COMPETITORS
  const tracked = DUMMY_TRACKED
  const userData = DUMMY_USER_DATA
  const planLimits = DUMMY_PLAN_LIMITS
  const totalBrands = 847
  const userRank = 1
  const trendData = DUMMY_TREND_DATA

  return (
    <div className="min-h-screen bg-primary" data-page="competitors">
      <MobileHeader />

      {/* Header Bar */}
      <div className="page-header-bar">
        <div className="flex items-center gap-3">
          <Users className="w-4 h-4 text-muted" />
          <h1 className="text-sm font-medium text-secondary">Competitive Intelligence</h1>
        </div>

        <Link 
          href="/dashboard/competitors/manage"
          className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg text-secondary hover:text-primary hover:bg-secondary transition-colors"
        >
          Manage
          <ArrowUpRight className="w-4 h-4" />
        </Link>
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
                    tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                    domain={[0, 100]}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="you"
                    stroke="url(#holoGradient)"
                    strokeWidth={3}
                    fill="url(#holoFill)"
                    connectNulls
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Tracked Competitors Sidebar */}
          <div className="card p-0 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div>
                <h3 className="font-semibold text-primary text-sm">Tracked</h3>
                <p className="text-xs text-muted mt-0.5">
                  {tracked.length}/{planLimits.max} slots
                </p>
              </div>
              <Link 
                href="/dashboard/competitors/manage"
                className="p-1.5 rounded-lg text-muted hover:text-primary hover:bg-secondary transition-colors"
              >
                <Plus className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="max-h-[232px] overflow-y-auto">
              <div className="p-2">
                {tracked.map((comp) => (
                  <TrackedCompetitorRow
                    key={comp.id}
                    competitor={comp}
                    userData={userData}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Full Leaderboard */}
        <div className="card p-0 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div>
              <h3 className="font-semibold text-primary text-sm">All Brands in AI Responses</h3>
              <p className="text-xs text-muted mt-0.5">
                {totalBrands} brands mentioned across your tracked prompts
              </p>
            </div>
          </div>

          {/* Table Header */}
          <div className="grid grid-cols-12 gap-2 px-4 py-3 text-xs text-muted border-b border-border bg-secondary/50">
            <div className="col-span-1">#</div>
            <div className="col-span-4">Brand</div>
            <div className="col-span-2 text-right">Visibility</div>
            <div className="col-span-2 text-right">Mentions</div>
            <div className="col-span-2 text-center">Sentiment</div>
            <div className="col-span-1"></div>
          </div>

          {/* Table Body */}
          <div className="max-h-[400px] overflow-y-auto">
            {competitors.map((comp) => (
              <div 
                key={comp.name}
                className={`
                  grid grid-cols-12 gap-2 px-4 py-3 items-center border-b border-border
                  transition-colors
                  ${comp.isUser ? 'bg-accent/5' : 'hover:bg-secondary/50'}
                `}
              >
                {/* Rank */}
                <div className="col-span-1 text-sm text-muted tabular-nums font-medium">
                  {comp.rank}
                </div>
                
                {/* Brand */}
                <div className="col-span-4 flex items-center gap-3 min-w-0">
                  <img 
                    src={comp.logo}
                    alt=""
                    className="w-8 h-8 rounded-lg flex-shrink-0 bg-secondary"
                    onError={(e) => { 
                      e.currentTarget.src = comp.fallbackLogo
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm truncate ${comp.isUser ? 'font-semibold text-primary' : 'text-primary'}`}>
                        {comp.name}
                      </span>
                      {comp.isUser && (
                        <span className="text-xs px-1.5 py-0.5 rounded font-medium" style={{ 
                          background: 'linear-gradient(90deg, rgba(6,182,212,0.2), rgba(168,85,247,0.2), rgba(236,72,153,0.2))',
                          color: '#A855F7'
                        }}>YOU</span>
                      )}
                      {comp.isTracked && !comp.isUser && (
                        <span className="text-xs bg-green-500/20 text-green-500 px-1.5 py-0.5 rounded">Tracked</span>
                      )}
                    </div>
                    <span className="text-xs text-muted truncate block">{comp.domain}</span>
                  </div>
                </div>
                
                {/* Visibility */}
                <div className="col-span-2 flex items-center justify-end gap-2">
                  <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all"
                      style={{ 
                        width: `${comp.visibility}%`, 
                        background: comp.isUser 
                          ? 'linear-gradient(90deg, #06B6D4, #A855F7, #EC4899)' 
                          : comp.color 
                      }}
                    />
                  </div>
                  <span className="text-sm text-primary tabular-nums w-10 text-right font-medium">{comp.visibility}%</span>
                </div>
                
                {/* Mentions */}
                <div className="col-span-2 text-right">
                  <span className="text-sm text-primary tabular-nums font-medium">{comp.mentions}</span>
                </div>
                
                {/* Sentiment */}
                <div className="col-span-2 flex items-center justify-center">
                  <span className={`text-xs px-2.5 py-1 rounded-full capitalize ${getSentimentBg(comp.sentiment)} ${getSentimentColor(comp.sentiment)}`}>
                    {comp.sentiment}
                  </span>
                </div>
                
                {/* Action */}
                <div className="col-span-1 flex items-center justify-end">
                  {!comp.isUser && !comp.isTracked && (
                    <button
                      className="p-1.5 text-muted hover:text-primary hover:bg-secondary rounded-lg transition-all"
                      title="Track competitor"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}