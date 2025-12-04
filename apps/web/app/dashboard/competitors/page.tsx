// apps/web/app/dashboard/competitors/page.tsx
// Competitive Intelligence - All brands mentioned in AI responses, compared

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Users,
  TrendingUp,
  TrendingDown,
  Eye,
  MessageSquare,
  Target,
  Crown,
  AlertCircle,
  ArrowRight,
  Minus,
  ChevronRight,
  ExternalLink,
  Sparkles,
  BarChart3
} from 'lucide-react'
import { useBrand } from '@/contexts/BrandContext'
import MobileHeader from '@/components/layout/MobileHeader'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts'

// ============================================================================
// TYPES
// ============================================================================

interface CompetitorData {
  rank: number
  name: string
  domain: string | null
  logo: string
  visibility: number
  visibilityDelta: number | null
  sentiment: number
  sentimentDelta: number | null
  position: number
  positionDelta: number | null
  mentions: number
  isUser: boolean
  color: string
}

interface ApiResponse {
  competitors: CompetitorData[]
  total_brands_found: number
  user_rank: number | null
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

function MetricCard({ 
  title, 
  value, 
  delta, 
  suffix = '',
  sublabel,
  icon: Icon
}: { 
  title: string
  value: number | string
  delta?: number | null
  suffix?: string
  sublabel?: string
  icon: any
}) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-muted" />
          <span className="text-xs text-muted uppercase tracking-wide">{title}</span>
        </div>
        {delta !== undefined && delta !== null && (
          <div className={`flex items-center gap-1 text-xs font-medium ${
            delta > 0 ? 'text-positive' : delta < 0 ? 'text-negative' : 'text-muted'
          }`}>
            {delta > 0 ? <TrendingUp className="w-3 h-3" /> : delta < 0 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
            {delta > 0 ? '+' : ''}{typeof delta === 'number' ? delta.toFixed(1) : delta}{suffix}
          </div>
        )}
      </div>
      <div className="text-3xl font-bold text-primary">
        {value}<span className="text-xl text-muted">{suffix}</span>
      </div>
      {sublabel && <div className="text-xs text-muted mt-1">{sublabel}</div>}
    </div>
  )
}

function ComparisonBar({ 
  label, 
  userValue, 
  competitorValue, 
  userName, 
  competitorName,
  format = 'number',
  lowerIsBetter = false
}: { 
  label: string
  userValue: number
  competitorValue: number
  userName: string
  competitorName: string
  format?: 'number' | 'percent' | 'position'
  lowerIsBetter?: boolean
}) {
  const total = userValue + competitorValue || 1
  const userPercent = (userValue / total) * 100
  const competitorPercent = (competitorValue / total) * 100
  
  const formatValue = (v: number) => {
    if (format === 'percent') return `${v}%`
    if (format === 'position') return v.toFixed(1)
    return v.toLocaleString()
  }

  const userWinning = lowerIsBetter ? userValue < competitorValue : userValue > competitorValue
  const tied = userValue === competitorValue

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm text-secondary">{label}</span>
        <div className="flex items-center gap-4 text-sm">
          <span className={`font-medium ${userWinning && !tied ? 'text-accent' : 'text-secondary'}`}>
            {formatValue(userValue)}
          </span>
          <span className="text-muted">vs</span>
          <span className={`font-medium ${!userWinning && !tied ? 'text-primary' : 'text-secondary'}`}>
            {formatValue(competitorValue)}
          </span>
        </div>
      </div>
      <div className="flex h-2 rounded-full overflow-hidden bg-border">
        <div 
          className="bg-accent transition-all duration-300"
          style={{ width: `${userPercent}%` }}
        />
        <div 
          className="bg-secondary/50 transition-all duration-300"
          style={{ width: `${competitorPercent}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-muted">
        <span>{userName}</span>
        <span>{competitorName}</span>
      </div>
    </div>
  )
}

function BrandLogo({ name, size = 32 }: { name: string; size?: number }) {
  const domain = name.toLowerCase().replace(/\s+/g, '').replace(/\.com$/i, '') + '.com'
  return (
    <img 
      src={`https://cdn.brandfetch.io/${domain}/w/400/h/400`}
      alt=""
      className="rounded bg-card object-contain"
      style={{ width: size, height: size }}
      onError={(e) => { 
        e.currentTarget.style.display = 'none'
      }}
    />
  )
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function CompetitorsPage() {
  const { currentDashboard } = useBrand()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [competitors, setCompetitors] = useState<CompetitorData[]>([])
  const [totalBrands, setTotalBrands] = useState(0)
  const [userRank, setUserRank] = useState<number | null>(null)
  const [selectedCompetitorIndex, setSelectedCompetitorIndex] = useState<number>(0)

  const brandName = currentDashboard?.brand_name || 'Your Brand'

  useEffect(() => {
    async function fetchCompetitors() {
      if (!currentDashboard?.id) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const response = await fetch(`/api/dashboard/${currentDashboard.id}/competitors?limit=20`)
        
        if (!response.ok) throw new Error('Failed to fetch competitors')

        const data: ApiResponse = await response.json()
        
        setCompetitors(data.competitors || [])
        setTotalBrands(data.total_brands_found || 0)
        setUserRank(data.user_rank)
        
        // Default to first non-user competitor
        const firstCompetitorIdx = data.competitors?.findIndex(c => !c.isUser) ?? 0
        setSelectedCompetitorIndex(Math.max(0, firstCompetitorIdx))
        
      } catch (err) {
        console.error('Error fetching competitors:', err)
        setError(err instanceof Error ? err.message : 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    fetchCompetitors()
  }, [currentDashboard?.id])

  // Get user's data and selected competitor
  const userData = competitors.find(c => c.isUser)
  const nonUserCompetitors = competitors.filter(c => !c.isUser)
  const selectedCompetitor = nonUserCompetitors[selectedCompetitorIndex] || nonUserCompetitors[0]

  // Prepare chart data
  const chartData = competitors.slice(0, 10).map(c => ({
    name: c.name.length > 12 ? c.name.slice(0, 12) + '...' : c.name,
    fullName: c.name,
    mentions: c.mentions,
    isUser: c.isUser,
    color: c.isUser ? '#FF6B4A' : '#3B82F6'
  }))

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-primary" data-page="competitors">
        <MobileHeader />
        <div className="p-6 animate-pulse space-y-6">
          <div className="h-8 bg-card rounded w-48"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => <div key={i} className="h-28 bg-card rounded-lg"></div>)}
          </div>
          <div className="h-96 bg-card rounded-lg"></div>
        </div>
      </div>
    )
  }

  // Empty state
  if (competitors.length === 0) {
    return (
      <div className="min-h-screen bg-primary" data-page="competitors">
        <MobileHeader />
        <div className="p-6">
          <h1 className="text-2xl font-semibold text-primary mb-6">Competitive Intelligence</h1>
          <div className="card p-12 text-center">
            <AlertCircle className="w-12 h-12 text-muted mx-auto mb-4" />
            <h3 className="text-lg font-medium text-primary mb-2">No Competitor Data Yet</h3>
            <p className="text-secondary mb-2 max-w-md mx-auto">
              This page shows all brands mentioned in AI responses to your tracked prompts.
            </p>
            <p className="text-muted text-sm mb-6 max-w-md mx-auto">
              Run prompts related to your industry to discover which brands AI recommends alongside yours.
            </p>
            <Link 
              href="/dashboard/prompts" 
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
            >
              <Target className="w-4 h-4" />
              View Prompts
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-primary" data-page="competitors">
      <MobileHeader />

      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-primary">Competitive Intelligence</h1>
            <p className="text-secondary mt-1">
              {totalBrands} brands found across AI responses
            </p>
          </div>
          {userRank && userData && (
            <div className="flex items-center gap-3 px-4 py-3 bg-card rounded-lg border border-border">
              <Crown className="w-5 h-5 text-accent" />
              <div>
                <div className="text-xs text-muted uppercase tracking-wide">Your Rank</div>
                <div className="text-xl font-bold text-primary">
                  #{userRank} <span className="text-sm font-normal text-muted">of {totalBrands}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard 
            title="Your Visibility" 
            value={userData?.visibility || 0} 
            suffix="%" 
            delta={userData?.visibilityDelta}
            sublabel="vs top competitor"
            icon={Eye}
          />
          <MetricCard 
            title="Your Mentions" 
            value={userData?.mentions || 0} 
            delta={null}
            sublabel="total in AI responses"
            icon={MessageSquare}
          />
          <MetricCard 
            title="Sentiment" 
            value={userData?.sentiment || 0} 
            suffix="%" 
            delta={userData?.sentimentDelta}
            sublabel="positive mentions"
            icon={Sparkles}
          />
          <MetricCard 
            title="Avg Position" 
            value={userData?.position?.toFixed(1) || '-'} 
            delta={userData?.positionDelta}
            sublabel="when mentioned (1 = first)"
            icon={Target}
          />
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left: Brand Leaderboard */}
          <div className="lg:col-span-1 card p-0 overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <h3 className="font-medium text-primary">Brand Leaderboard</h3>
              <p className="text-xs text-muted mt-1">Click to compare</p>
            </div>
            <div className="divide-y divide-border max-h-[520px] overflow-y-auto">
              {competitors.map((comp, idx) => {
                const isSelected = !comp.isUser && nonUserCompetitors[selectedCompetitorIndex]?.name === comp.name
                return (
                  <button
                    key={comp.name}
                    onClick={() => {
                      if (!comp.isUser) {
                        const newIdx = nonUserCompetitors.findIndex(c => c.name === comp.name)
                        if (newIdx >= 0) setSelectedCompetitorIndex(newIdx)
                      }
                    }}
                    disabled={comp.isUser}
                    className={`w-full px-4 py-3 flex items-center gap-3 text-left transition-colors ${
                      comp.isUser 
                        ? 'bg-accent/5 cursor-default' 
                        : isSelected 
                          ? 'bg-hover' 
                          : 'hover:bg-hover cursor-pointer'
                    }`}
                  >
                    <span className={`w-6 text-sm font-medium tabular-nums ${comp.isUser ? 'text-accent' : 'text-muted'}`}>
                      {comp.rank}
                    </span>
                    <BrandLogo name={comp.name} size={28} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-primary truncate">{comp.name}</span>
                        {comp.isUser && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-accent/10 text-accent rounded shrink-0">YOU</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted">{comp.mentions} mentions</span>
                        {comp.sentiment > 0 && (
                          <span className={`text-xs ${comp.sentiment >= 70 ? 'text-positive' : comp.sentiment >= 40 ? 'text-secondary' : 'text-negative'}`}>
                            · {comp.sentiment}% positive
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-primary tabular-nums">{comp.visibility}%</div>
                    </div>
                    {!comp.isUser && (
                      <ChevronRight className={`w-4 h-4 transition-colors ${isSelected ? 'text-accent' : 'text-muted'}`} />
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Right: Comparison Panel */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Head to Head Comparison */}
            {selectedCompetitor && userData ? (
              <div className="card p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-medium text-primary">Head to Head</h3>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-accent" />
                      <span className="text-secondary">{brandName}</span>
                    </div>
                    <span className="text-muted">vs</span>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-secondary/50" />
                      <span className="text-secondary">{selectedCompetitor.name}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <ComparisonBar 
                    label="Visibility Score"
                    userValue={userData.visibility}
                    competitorValue={selectedCompetitor.visibility}
                    userName={brandName}
                    competitorName={selectedCompetitor.name}
                    format="percent"
                  />
                  <ComparisonBar 
                    label="Total Mentions"
                    userValue={userData.mentions}
                    competitorValue={selectedCompetitor.mentions}
                    userName={brandName}
                    competitorName={selectedCompetitor.name}
                    format="number"
                  />
                  <ComparisonBar 
                    label="Positive Sentiment"
                    userValue={userData.sentiment}
                    competitorValue={selectedCompetitor.sentiment}
                    userName={brandName}
                    competitorName={selectedCompetitor.name}
                    format="percent"
                  />
                  {userData.position && selectedCompetitor.position && (
                    <ComparisonBar 
                      label="Average Position"
                      userValue={userData.position}
                      competitorValue={selectedCompetitor.position}
                      userName={brandName}
                      competitorName={selectedCompetitor.name}
                      format="position"
                      lowerIsBetter={true}
                    />
                  )}
                </div>

                {/* Summary */}
                <div className="mt-6 pt-6 border-t border-border">
                  {userData.visibility !== selectedCompetitor.visibility ? (
                    <div className={`flex items-center gap-2 ${
                      userData.visibility > selectedCompetitor.visibility ? 'text-positive' : 'text-secondary'
                    }`}>
                      {userData.visibility > selectedCompetitor.visibility ? (
                        <>
                          <TrendingUp className="w-4 h-4" />
                          <span className="text-sm">
                            You lead by <strong>{userData.visibility - selectedCompetitor.visibility} points</strong> in visibility
                          </span>
                        </>
                      ) : (
                        <>
                          <TrendingDown className="w-4 h-4" />
                          <span className="text-sm">
                            <strong>{selectedCompetitor.name}</strong> leads by {selectedCompetitor.visibility - userData.visibility} points
                          </span>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-muted">
                      <Minus className="w-4 h-4" />
                      <span className="text-sm">You're tied in visibility</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="card p-12 text-center">
                <Users className="w-10 h-10 text-muted mx-auto mb-3" />
                <p className="text-secondary">Select a competitor from the leaderboard</p>
              </div>
            )}

            {/* Mentions Distribution Chart */}
            <div className="card p-6">
              <h3 className="font-medium text-primary mb-4">Mentions Distribution</h3>
              <p className="text-xs text-muted mb-4">Top 10 brands by AI mention frequency</p>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 20 }}>
                    <XAxis type="number" hide />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      width={100}
                      tick={{ fill: 'var(--color-secondary)', fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null
                        const data = payload[0].payload
                        return (
                          <div className="bg-card border border-border rounded-lg shadow-lg p-3">
                            <div className="font-medium text-primary">{data.fullName}</div>
                            <div className="text-sm text-secondary mt-1">{data.mentions.toLocaleString()} mentions</div>
                          </div>
                        )
                      }}
                    />
                    <Bar dataKey="mentions" radius={[0, 4, 4, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.isUser ? '#FF6B4A' : '#3B82F6'} fillOpacity={entry.isUser ? 1 : 0.6} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Insight Card */}
            <div className="card p-6 bg-accent/5 border-accent/20">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-primary mb-1">What is this data?</h4>
                  <p className="text-sm text-secondary leading-relaxed">
                    This leaderboard shows all brands mentioned by AI models (ChatGPT, Claude, Perplexity) 
                    in response to prompts you're tracking. Higher visibility means the brand appears 
                    more frequently and earlier in AI recommendations. Use this to understand your 
                    competitive position in AI-powered search and discovery.
                  </p>
                  <Link 
                    href="/dashboard/prompts" 
                    className="inline-flex items-center gap-1 text-sm text-accent hover:underline mt-3"
                  >
                    View tracked prompts <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}