// apps/web/app/dashboard/brand/page.tsx
// Brand Visibility - How AI models perceive and describe your brand

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Sparkles,
  TrendingUp,
  TrendingDown,
  MessageSquare,
  Globe,
  ArrowUpRight,
  ChevronDown,
  Eye,
  Heart,
  Minus,
  AlertCircle,
  Check,
  Calendar,
  Tag
} from 'lucide-react'
import { useBrand } from '@/contexts/BrandContext'
import MobileHeader from '@/components/layout/MobileHeader'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts'

interface BrandData {
  brand_name: string
  visibility_index: number
  visibility_delta: number
  total_mentions: number
  mentions_delta: number
  sentiment_score: number
  sentiment_delta: number
  descriptors: Array<{
    word: string
    sentiment: 'positive' | 'neutral' | 'negative'
    weight: number
    count: number
  }>
  sentiment_breakdown: {
    positive: number
    neutral: number
    negative: number
  }
  model_breakdown: Array<{
    model: string
    mentions: number
    sentiment: number
  }>
  associations: Array<{
    entity: string
    type: 'product' | 'person' | 'competitor' | 'concept'
    strength: number
  }>
  has_data: boolean
}

const SENTIMENT_COLORS = {
  positive: '#22C55E',
  neutral: '#71717A',
  negative: '#EF4444'
}

const MODEL_COLORS: Record<string, string> = {
  ChatGPT: '#10B981',
  Claude: '#8B5CF6',
  Perplexity: '#3B82F6',
  Gemini: '#F59E0B'
}

function MetricCard({ 
  title, 
  value, 
  delta, 
  suffix = '',
  icon: Icon,
  tooltip 
}: { 
  title: string
  value: number | string
  delta?: number
  suffix?: string
  icon: any
  tooltip?: string
}) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-muted" />
          <span className="text-xs text-muted uppercase tracking-wide">{title}</span>
        </div>
        {delta !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-medium ${
            delta > 0 ? 'text-positive' : delta < 0 ? 'text-negative' : 'text-muted'
          }`}>
            {delta > 0 ? <TrendingUp className="w-3 h-3" /> : delta < 0 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
            {delta > 0 ? '+' : ''}{delta}{suffix || '%'}
          </div>
        )}
      </div>
      <div className="text-3xl font-bold text-primary">
        {value}<span className="text-xl text-muted">{suffix}</span>
      </div>
    </div>
  )
}

function DescriptorCloud({ descriptors }: { descriptors: BrandData['descriptors'] }) {
  const getSentimentStyles = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-positive/10 text-positive border-positive/20 hover:bg-positive/20'
      case 'negative':
        return 'bg-negative/10 text-negative border-negative/20 hover:bg-negative/20'
      default:
        return 'bg-secondary text-secondary border-border hover:bg-hover'
    }
  }

  if (!descriptors || descriptors.length === 0) {
    return (
      <div className="text-center py-6 text-muted text-sm">
        Run more prompts to see how AI describes your brand
      </div>
    )
  }

  // Sort by weight
  const sorted = [...descriptors].sort((a, b) => b.weight - a.weight)

  return (
    <div className="flex flex-wrap gap-2">
      {sorted.map((desc, idx) => (
        <div
          key={idx}
          className={`px-3 py-1.5 rounded-full border text-sm font-medium cursor-default transition-colors ${getSentimentStyles(desc.sentiment)}`}
          title={`${desc.count} mentions`}
        >
          {desc.word}
        </div>
      ))}
    </div>
  )
}

function SentimentDonut({ breakdown }: { breakdown: BrandData['sentiment_breakdown'] }) {
  const data = [
    { name: 'Positive', value: breakdown.positive, color: SENTIMENT_COLORS.positive },
    { name: 'Neutral', value: breakdown.neutral, color: SENTIMENT_COLORS.neutral },
    { name: 'Negative', value: breakdown.negative, color: SENTIMENT_COLORS.negative },
  ]

  return (
    <div className="flex items-center gap-6">
      <div className="relative w-32 h-32">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={35}
              outerRadius={55}
              dataKey="value"
              strokeWidth={0}
            >
              {data.map((entry, idx) => (
                <Cell key={idx} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold text-primary">{breakdown.positive}%</span>
        </div>
      </div>
      
      <div className="space-y-2">
        {data.map((item) => (
          <div key={item.name} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-sm text-secondary">{item.name}</span>
            <span className="text-sm font-medium text-primary ml-auto">{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function ModelComparison({ models }: { models: BrandData['model_breakdown'] }) {
  if (!models || models.length === 0) {
    return (
      <div className="text-center py-6 text-muted text-sm">
        No model data yet
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {models.map((model) => (
        <div key={model.model} className="flex items-center gap-4">
          <div className="w-24 flex items-center gap-2">
            <img 
              src={`/models/${model.model.toLowerCase()}-logo.png`}
              alt={model.model}
              className="w-5 h-5 rounded"
              onError={(e) => { e.currentTarget.style.display = 'none' }}
            />
            <span className="text-sm font-medium text-primary">{model.model}</span>
          </div>
          <div className="flex-1">
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all"
                style={{ 
                  width: `${(model.mentions / Math.max(...models.map(m => m.mentions))) * 100}%`,
                  backgroundColor: MODEL_COLORS[model.model] || '#71717A'
                }}
              />
            </div>
          </div>
          <div className="w-20 text-right">
            <span className="text-sm font-medium text-primary">{model.mentions}</span>
            <span className="text-xs text-muted ml-1">mentions</span>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function BrandVisibilityPage() {
  const { currentDashboard } = useBrand()
  const [data, setData] = useState<BrandData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState('7d')

  useEffect(() => {
    async function fetchBrandData() {
      if (!currentDashboard?.id) {
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/dashboard/${currentDashboard.id}/brand-visibility`)
        if (!response.ok) {
          throw new Error('Failed to fetch brand data')
        }
        const result = await response.json()
        setData(result)
      } catch (err) {
        console.error('Error fetching brand data:', err)
        setError('Failed to load brand data')
      } finally {
        setLoading(false)
      }
    }

    fetchBrandData()
  }, [currentDashboard?.id])

  const brandName = data?.brand_name || currentDashboard?.brand_name || 'Your Brand'
  const brandLogo = currentDashboard?.logo_url

  if (loading) {
    return (
      <div className="min-h-screen bg-primary" data-page="brand">
        <MobileHeader />
        <div className="p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-card rounded w-64"></div>
            <div className="grid grid-cols-4 gap-4">
              {[1,2,3,4].map(i => <div key={i} className="h-28 bg-card rounded-lg"></div>)}
            </div>
            <div className="h-64 bg-card rounded-lg"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!data || !data.has_data) {
    return (
      <div className="min-h-screen bg-primary" data-page="brand">
        <MobileHeader />
        <div className="p-6">
          <div className="card p-12 text-center">
            <Sparkles className="w-12 h-12 text-muted mx-auto mb-4 opacity-40" />
            <h2 className="text-xl font-semibold text-primary mb-2">No Brand Data Yet</h2>
            <p className="text-sm text-muted mb-6">
              Run prompts to see how AI models perceive your brand.
            </p>
            <Link 
              href="/dashboard/prompts"
              className="inline-flex items-center gap-2 px-4 py-2 bg-secondary rounded-lg text-sm font-medium text-primary hover:bg-hover transition-colors"
            >
              Go to Prompts
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-primary" data-page="brand">
      <MobileHeader />

      {/* Header Bar */}
      <div className="page-header-bar">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary rounded-lg border border-border">
            {brandLogo ? (
              <img src={brandLogo} alt={brandName} className="w-5 h-5 rounded" />
            ) : (
              <div className="w-5 h-5 rounded bg-hover flex items-center justify-center text-xs font-medium text-muted">
                {brandName.charAt(0)}
              </div>
            )}
            <span className="font-medium text-primary text-sm">{brandName}</span>
          </div>

          <button className="dropdown-trigger">
            <Calendar className="w-4 h-4 text-muted" />
            <span>Last 7 days</span>
            <ChevronDown className="w-4 h-4 text-muted" />
          </button>
        </div>
      </div>

      {/* Status Banner */}
      <div className="status-banner">
        <div className="status-banner-text flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          <span className="font-medium text-primary">Brand Visibility</span>
          <span className="mx-1">•</span>
          <span>How AI models describe and perceive {brandName}</span>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Visibility Index"
            value={data.visibility_index}
            suffix="%"
            delta={data.visibility_delta}
            icon={Eye}
          />
          <MetricCard
            title="Total Mentions"
            value={data.total_mentions.toLocaleString()}
            delta={data.mentions_delta}
            suffix=""
            icon={MessageSquare}
          />
          <MetricCard
            title="Sentiment Score"
            value={data.sentiment_score}
            suffix="%"
            delta={data.sentiment_delta}
            icon={Heart}
          />
          <MetricCard
            title="Descriptors"
            value={data.descriptors.length}
            icon={Tag}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Descriptor Cloud - 2 columns */}
          <div className="lg:col-span-2 card p-0">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div>
                <h3 className="font-semibold text-primary text-sm">Brand Descriptors</h3>
                <p className="text-xs text-muted mt-0.5">Words AI uses to describe your brand</p>
              </div>
              <Link href="/dashboard/brand/descriptors" className="expand-btn">
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="p-4">
              <DescriptorCloud descriptors={data.descriptors} />
            </div>
          </div>

          {/* Sentiment Breakdown */}
          <div className="card p-0">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div>
                <h3 className="font-semibold text-primary text-sm">Sentiment Breakdown</h3>
                <p className="text-xs text-muted mt-0.5">Overall brand perception</p>
              </div>
            </div>
            <div className="p-4">
              <SentimentDonut breakdown={data.sentiment_breakdown} />
            </div>
          </div>
        </div>

        {/* Model Comparison + Associations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Model Breakdown */}
          <div className="card p-0">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div>
                <h3 className="font-semibold text-primary text-sm">Mentions by Model</h3>
                <p className="text-xs text-muted mt-0.5">How often each AI mentions your brand</p>
              </div>
            </div>
            <div className="p-4">
              <ModelComparison models={data.model_breakdown} />
            </div>
          </div>

          {/* Brand Associations */}
          <div className="card p-0">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div>
                <h3 className="font-semibold text-primary text-sm">Brand Associations</h3>
                <p className="text-xs text-muted mt-0.5">Entities AI connects with your brand</p>
              </div>
            </div>
            <div className="p-4">
              {data.associations && data.associations.length > 0 ? (
                <div className="space-y-3">
                  {data.associations.map((assoc, idx) => (
                    <div key={idx} className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          assoc.type === 'competitor' ? 'bg-warning/10 text-warning' :
                          assoc.type === 'product' ? 'bg-info/10 text-info' :
                          'bg-secondary text-muted'
                        }`}>
                          {assoc.type}
                        </span>
                        <span className="text-sm text-primary font-medium">{assoc.entity}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-1.5 bg-secondary rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${assoc.strength}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted w-8 text-right">{assoc.strength}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted text-sm">
                  Association data coming soon
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}