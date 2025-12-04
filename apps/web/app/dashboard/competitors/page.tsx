// apps/web/app/dashboard/competitors/page.tsx
// Competitive Intelligence - Compare your brand against competitors

'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { 
  Users,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ChevronDown,
  Calendar,
  Eye,
  MessageSquare,
  Target,
  Plus,
  Check,
  Minus,
  Crown,
  Zap
} from 'lucide-react'
import { useBrand } from '@/contexts/BrandContext'
import MobileHeader from '@/components/layout/MobileHeader'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar
} from 'recharts'

interface CompetitorData {
  id: string
  name: string
  domain: string
  logo_url?: string
  color: string
  metrics: {
    visibility: number
    visibility_delta: number
    sentiment: number
    sentiment_delta: number
    position: number
    position_delta: number
    mentions: number
  }
  strengths: string[]
  weaknesses: string[]
}

interface TrendData {
  date: string
  [key: string]: number | string
}

// Mock data
const MOCK_USER_BRAND = {
  name: 'HubSpot',
  domain: 'hubspot.com',
  color: '#FF7A59',
  metrics: {
    visibility: 68,
    visibility_delta: 2.1,
    sentiment: 82,
    sentiment_delta: 1.5,
    position: 2.4,
    position_delta: -0.3,
    mentions: 847
  }
}

const MOCK_COMPETITORS: CompetitorData[] = [
  {
    id: '1',
    name: 'Salesforce',
    domain: 'salesforce.com',
    color: '#00A1E0',
    metrics: {
      visibility: 72,
      visibility_delta: 0.8,
      sentiment: 76,
      sentiment_delta: -0.5,
      position: 2.1,
      position_delta: 0.1,
      mentions: 1024
    },
    strengths: ['Enterprise recognition', 'CRM market leader', 'Ecosystem size'],
    weaknesses: ['Complex pricing', 'Steep learning curve']
  },
  {
    id: '2',
    name: 'Pipedrive',
    domain: 'pipedrive.com',
    color: '#22C55E',
    metrics: {
      visibility: 45,
      visibility_delta: 3.2,
      sentiment: 84,
      sentiment_delta: 2.1,
      position: 3.8,
      position_delta: -0.5,
      mentions: 412
    },
    strengths: ['Ease of use', 'Sales-focused', 'Affordable'],
    weaknesses: ['Limited marketing features', 'Smaller ecosystem']
  },
  {
    id: '3',
    name: 'Zoho CRM',
    domain: 'zoho.com',
    color: '#F59E0B',
    metrics: {
      visibility: 38,
      visibility_delta: 1.5,
      sentiment: 72,
      sentiment_delta: 0.3,
      position: 4.2,
      position_delta: 0.2,
      mentions: 356
    },
    strengths: ['Value pricing', 'All-in-one suite', 'SMB focus'],
    weaknesses: ['Interface dated', 'Support quality']
  },
]

const MOCK_TREND_DATA: TrendData[] = [
  { date: 'Jan', HubSpot: 58, Salesforce: 65, Pipedrive: 32, 'Zoho CRM': 28 },
  { date: 'Feb', HubSpot: 62, Salesforce: 68, Pipedrive: 35, 'Zoho CRM': 30 },
  { date: 'Mar', HubSpot: 60, Salesforce: 70, Pipedrive: 38, 'Zoho CRM': 32 },
  { date: 'Apr', HubSpot: 64, Salesforce: 71, Pipedrive: 40, 'Zoho CRM': 35 },
  { date: 'May', HubSpot: 66, Salesforce: 72, Pipedrive: 43, 'Zoho CRM': 37 },
  { date: 'Jun', HubSpot: 68, Salesforce: 72, Pipedrive: 45, 'Zoho CRM': 38 },
]

const RADAR_DATA = [
  { metric: 'Visibility', HubSpot: 68, Salesforce: 72, Pipedrive: 45 },
  { metric: 'Sentiment', HubSpot: 82, Salesforce: 76, Pipedrive: 84 },
  { metric: 'Authority', HubSpot: 75, Salesforce: 88, Pipedrive: 52 },
  { metric: 'Coverage', HubSpot: 70, Salesforce: 82, Pipedrive: 48 },
  { metric: 'Momentum', HubSpot: 78, Salesforce: 65, Pipedrive: 85 },
]

function MetricComparison({ 
  label, 
  userValue, 
  userDelta,
  competitors 
}: { 
  label: string
  userValue: number
  userDelta: number
  competitors: Array<{ name: string; value: number; delta: number; color: string }>
}) {
  const allValues = [userValue, ...competitors.map(c => c.value)]
  const maxValue = Math.max(...allValues)
  const isPositionMetric = label.toLowerCase().includes('position')

  return (
    <div className="card p-4">
      <div className="text-xs text-muted uppercase tracking-wide mb-4">{label}</div>
      
      {/* User's metric */}
      <div className="flex items-center gap-3 mb-3 pb-3 border-b border-border">
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: MOCK_USER_BRAND.color }} />
        <span className="text-sm font-medium text-primary flex-1">{MOCK_USER_BRAND.name}</span>
        <span className="text-lg font-bold text-primary">{userValue}{isPositionMetric ? '' : '%'}</span>
        <span className={`text-xs font-medium flex items-center gap-0.5 ${
          (isPositionMetric ? userDelta < 0 : userDelta > 0) ? 'text-positive' : userDelta === 0 ? 'text-muted' : 'text-negative'
        }`}>
          {(isPositionMetric ? userDelta < 0 : userDelta > 0) ? <TrendingUp className="w-3 h-3" /> : userDelta === 0 ? <Minus className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {userDelta > 0 ? '+' : ''}{userDelta}
        </span>
      </div>

      {/* Competitors */}
      <div className="space-y-2">
        {competitors.map((comp, idx) => (
          <div key={idx} className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: comp.color }} />
            <span className="text-sm text-secondary flex-1">{comp.name}</span>
            <span className="text-sm font-medium text-primary">{comp.value}{isPositionMetric ? '' : '%'}</span>
            <span className={`text-xs ${
              (isPositionMetric ? comp.delta < 0 : comp.delta > 0) ? 'text-positive' : comp.delta === 0 ? 'text-muted' : 'text-negative'
            }`}>
              {comp.delta > 0 ? '+' : ''}{comp.delta}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function GapAnalysisCard({ competitor, userBrand }: { competitor: CompetitorData; userBrand: typeof MOCK_USER_BRAND }) {
  const gaps = {
    visibility: competitor.metrics.visibility - userBrand.metrics.visibility,
    sentiment: competitor.metrics.sentiment - userBrand.metrics.sentiment,
    mentions: competitor.metrics.mentions - userBrand.metrics.mentions
  }

  const beating = gaps.visibility > 0 || gaps.sentiment > 0

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
            style={{ backgroundColor: competitor.color }}
          >
            {competitor.name.charAt(0)}
          </div>
          <div>
            <div className="font-medium text-primary">{competitor.name}</div>
            <div className="text-xs text-muted">{competitor.domain}</div>
          </div>
        </div>
        {gaps.visibility > 0 && (
          <span className="px-2 py-1 text-xs font-medium rounded bg-warning/10 text-warning">
            +{gaps.visibility}% ahead
          </span>
        )}
      </div>

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-xs text-muted uppercase tracking-wide mb-2">Their strengths</div>
          <div className="space-y-1">
            {competitor.strengths.map((s, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-secondary">
                <Zap className="w-3 h-3 text-warning" />
                {s}
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="text-xs text-muted uppercase tracking-wide mb-2">Their weaknesses</div>
          <div className="space-y-1">
            {competitor.weaknesses.map((w, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-secondary">
                <Target className="w-3 h-3 text-positive" />
                {w}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick comparison bars */}
      <div className="pt-4 border-t border-border space-y-3">
        {['visibility', 'sentiment'].map((metric) => {
          const userVal = userBrand.metrics[metric as keyof typeof userBrand.metrics] as number
          const compVal = competitor.metrics[metric as keyof typeof competitor.metrics] as number
          const max = Math.max(userVal, compVal)
          
          return (
            <div key={metric} className="flex items-center gap-2">
              <div className="w-20 text-xs text-muted capitalize">{metric}</div>
              <div className="flex-1 flex items-center gap-1">
                <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full"
                    style={{ 
                      width: `${(userVal / max) * 100}%`,
                      backgroundColor: MOCK_USER_BRAND.color
                    }}
                  />
                </div>
                <span className="text-xs text-muted w-8">{userVal}%</span>
              </div>
              <div className="flex-1 flex items-center gap-1">
                <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full"
                    style={{ 
                      width: `${(compVal / max) * 100}%`,
                      backgroundColor: competitor.color
                    }}
                  />
                </div>
                <span className="text-xs text-muted w-8">{compVal}%</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function CompetitorsPage() {
  const { currentDashboard } = useBrand()
  const [loading, setLoading] = useState(true)
  const [activeMetric, setActiveMetric] = useState<'visibility' | 'sentiment' | 'position'>('visibility')
  const [selectedCompetitors, setSelectedCompetitors] = useState<Set<string>>(new Set(['1', '2']))

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 300)
    return () => clearTimeout(timer)
  }, [])

  const brandName = currentDashboard?.brand_name || MOCK_USER_BRAND.name

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null
    
    return (
      <div className="bg-card border border-border rounded-lg shadow-lg p-3 min-w-[180px]">
        <div className="font-medium text-primary mb-2">{label} 2025</div>
        <div className="space-y-1">
          {payload.map((entry: any, idx: number) => (
            <div key={idx} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-sm text-secondary">{entry.name}</span>
              </div>
              <span className="text-sm font-medium text-primary">{entry.value}%</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-primary" data-page="competitors">
        <MobileHeader />
        <div className="p-6 animate-pulse space-y-6">
          <div className="h-8 bg-card rounded w-48"></div>
          <div className="grid grid-cols-3 gap-4">
            {[1,2,3].map(i => <div key={i} className="h-40 bg-card rounded-lg"></div>)}
          </div>
        </div>
      </div>
    )
  }

  // Calculate user rank based on visibility vs competitors
  const userRank = [MOCK_USER_BRAND.metrics.visibility, ...MOCK_COMPETITORS.map(c => c.metrics.visibility)]
    .sort((a, b) => b - a)
    .indexOf(MOCK_USER_BRAND.metrics.visibility) + 1
  
  const totalTracked = MOCK_COMPETITORS.length

  return (
    <div className="min-h-screen bg-primary" data-page="competitors">
      <MobileHeader />

      {/* Header Bar */}
      <div className="page-header-bar">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary rounded-lg border border-border">
            <div className="w-5 h-5 rounded" style={{ backgroundColor: MOCK_USER_BRAND.color }} />
            <span className="font-medium text-primary text-sm">{brandName}</span>
          </div>

          <button className="dropdown-trigger">
            <Calendar className="w-4 h-4 text-muted" />
            <span>Last 30 days</span>
            <ChevronDown className="w-4 h-4 text-muted" />
          </button>
        </div>

        <Link href="/dashboard/competitors/manage" className="dropdown-trigger">
          <Plus className="w-4 h-4" />
          <span>Manage Competitors</span>
        </Link>
      </div>

      {/* Status Banner */}
      <div className="status-banner">
        <div className="status-banner-text flex items-center gap-2">
          <Users className="w-4 h-4" />
          <span className="font-medium text-primary">Competitors</span>
          <span className="mx-1">•</span>
          <span>You're ranked #{userRank} of {totalTracked + 1} tracked brands</span>
        </div>
        <div className="status-banner-metrics">
          {userRank === 1 && (
            <span className="flex items-center gap-1 text-warning">
              <Crown className="w-3 h-3" /> Category leader
            </span>
          )}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Metric Comparison Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricComparison
            label="Visibility"
            userValue={MOCK_USER_BRAND.metrics.visibility}
            userDelta={MOCK_USER_BRAND.metrics.visibility_delta}
            competitors={MOCK_COMPETITORS.map(c => ({
              name: c.name,
              value: c.metrics.visibility,
              delta: c.metrics.visibility_delta,
              color: c.color
            }))}
          />
          <MetricComparison
            label="Sentiment"
            userValue={MOCK_USER_BRAND.metrics.sentiment}
            userDelta={MOCK_USER_BRAND.metrics.sentiment_delta}
            competitors={MOCK_COMPETITORS.map(c => ({
              name: c.name,
              value: c.metrics.sentiment,
              delta: c.metrics.sentiment_delta,
              color: c.color
            }))}
          />
          <MetricComparison
            label="Avg Position"
            userValue={MOCK_USER_BRAND.metrics.position}
            userDelta={MOCK_USER_BRAND.metrics.position_delta}
            competitors={MOCK_COMPETITORS.map(c => ({
              name: c.name,
              value: c.metrics.position,
              delta: c.metrics.position_delta,
              color: c.color
            }))}
          />
        </div>

        {/* Trend Chart */}
        <div className="card p-0 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div>
              <h3 className="font-semibold text-primary text-sm">Visibility Over Time</h3>
              <p className="text-xs text-muted mt-0.5">Track how you compare to competitors</p>
            </div>
            <div className="pill-group">
              <button 
                className={`pill ${activeMetric === 'visibility' ? 'active' : ''}`}
                onClick={() => setActiveMetric('visibility')}
              >
                <Eye className="w-3.5 h-3.5" />
                Visibility
              </button>
              <button 
                className={`pill ${activeMetric === 'sentiment' ? 'active' : ''}`}
                onClick={() => setActiveMetric('sentiment')}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Sentiment
              </button>
            </div>
          </div>

          <div className="p-4 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={MOCK_TREND_DATA} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
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
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey={MOCK_USER_BRAND.name}
                  stroke={MOCK_USER_BRAND.color}
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 5 }}
                />
                {MOCK_COMPETITORS.filter(c => selectedCompetitors.has(c.id)).map((comp) => (
                  <Line 
                    key={comp.id}
                    type="monotone" 
                    dataKey={comp.name}
                    stroke={comp.color}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 px-4 pb-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: MOCK_USER_BRAND.color }} />
              <span className="text-sm font-medium text-primary">{MOCK_USER_BRAND.name}</span>
            </div>
            {MOCK_COMPETITORS.map((comp) => (
              <button
                key={comp.id}
                onClick={() => {
                  const next = new Set(selectedCompetitors)
                  if (next.has(comp.id)) {
                    next.delete(comp.id)
                  } else {
                    next.add(comp.id)
                  }
                  setSelectedCompetitors(next)
                }}
                className={`flex items-center gap-2 transition-opacity ${
                  selectedCompetitors.has(comp.id) ? 'opacity-100' : 'opacity-40'
                }`}
              >
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: comp.color }} />
                <span className="text-sm text-secondary">{comp.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Gap Analysis Cards */}
        <div>
          <h3 className="font-semibold text-primary text-sm mb-4">Gap Analysis</h3>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {MOCK_COMPETITORS.map((comp) => (
              <GapAnalysisCard key={comp.id} competitor={comp} userBrand={MOCK_USER_BRAND} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}