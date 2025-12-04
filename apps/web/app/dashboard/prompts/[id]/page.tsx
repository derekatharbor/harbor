// app/dashboard/prompts/[id]/page.tsx
// Prompt Detail View - Model comparison, visibility, citations

'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Eye,
  Calendar,
  MapPin,
  Tag,
  Globe,
  ExternalLink,
  ChevronDown,
  Settings,
  TrendingUp,
  TrendingDown,
  Minus,
  Plus,
  X
} from 'lucide-react'
import { useBrand } from '@/contexts/BrandContext'
import MobileHeader from '@/components/layout/MobileHeader'

interface PromptDetail {
  id: string
  prompt_text: string
  topic: string | null
  status: string
  created_at: string
  executions: Execution[]
  brands: BrandVisibility[]
  sources: SourceData[]
}

interface Execution {
  id: string
  model: string
  response_text: string
  executed_at: string
  tokens_used: number
  brands_mentioned: string[]
  citations: Citation[]
}

interface Citation {
  url: string
  domain: string
  source_type: string
}

interface BrandVisibility {
  brand_name: string
  visibility_pct: number
  sentiment: 'positive' | 'neutral' | 'negative' | null
  avg_position: number | null
}

interface SourceData {
  domain: string
  favicon?: string
  used_pct: number
  avg_citations: number
  source_type: string
}

// Model logo component
function ModelLogo({ model, size = 20 }: { model: string; size?: number }) {
  const logoMap: Record<string, string> = {
    chatgpt: 'https://img.logo.dev/openai.com?token=pk_X-1ZO13GSgeOGP3a5JYvJw',
    claude: 'https://img.logo.dev/anthropic.com?token=pk_X-1ZO13GSgeOGP3a5JYvJw',
    gemini: 'https://img.logo.dev/google.com?token=pk_X-1ZO13GSgeOGP3a5JYvJw',
    perplexity: 'https://img.logo.dev/perplexity.ai?token=pk_X-1ZO13GSgeOGP3a5JYvJw'
  }
  
  return (
    <img
      src={logoMap[model] || logoMap.chatgpt}
      alt={model}
      width={size}
      height={size}
      className="rounded object-contain"
    />
  )
}

// Sentiment badge
function SentimentBadge({ sentiment }: { sentiment: string | null }) {
  if (!sentiment) return <span className="text-muted">—</span>
  
  const config = {
    positive: { icon: TrendingUp, color: 'text-chart-2', bg: 'bg-chart-2/10' },
    neutral: { icon: Minus, color: 'text-muted', bg: 'bg-secondary' },
    negative: { icon: TrendingDown, color: 'text-red-400', bg: 'bg-red-400/10' },
  }
  
  const { icon: Icon, color, bg } = config[sentiment as keyof typeof config] || config.neutral
  
  return (
    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded ${bg}`}>
      <Icon className={`w-3 h-3 ${color}`} />
    </div>
  )
}

// Source type badge
function SourceTypeBadge({ type }: { type: string }) {
  const colors: Record<string, string> = {
    editorial: 'badge-positive',
    corporate: 'bg-purple-100 text-purple-700',
    institutional: 'bg-chart-2/10 text-chart-2',
    ugc: 'bg-warning/10 text-warning',
    unknown: 'bg-secondary text-muted'
  }
  
  return (
    <span className={`text-xs px-2 py-1 rounded-md font-medium capitalize ${colors[type] || colors.unknown}`}>
      {type}
    </span>
  )
}

// Visibility Chart (simplified)
function VisibilityChart({ data }: { data: { date: string; value: number }[] }) {
  const maxValue = Math.max(...data.map(d => d.value), 100)
  
  return (
    <div className="h-48 flex items-end gap-1">
      {data.map((point, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-2">
          <div 
            className="w-full bg-secondary rounded-t transition-all duration-500"
            style={{ 
              height: `${(point.value / maxValue) * 100}%`,
              minHeight: '4px'
            }}
          />
          <span className="text-[10px] text-muted">{point.date}</span>
        </div>
      ))}
    </div>
  )
}

export default function PromptDetailPage() {
  const params = useParams()
  const router = useRouter()
  const promptId = params.id as string
  
  const [prompt, setPrompt] = useState<PromptDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeModel, setActiveModel] = useState<string | null>(null)
  const [showResponseModal, setShowResponseModal] = useState(false)
  
  useEffect(() => {
    const fetchPromptDetail = async () => {
      try {
        const res = await fetch(`/api/prompts/${promptId}`)
        if (res.ok) {
          const data = await res.json()
          setPrompt(data)
          if (data.executions?.length > 0) {
            setActiveModel(data.executions[0].model)
          }
        }
      } catch (err) {
        console.error('Failed to fetch prompt:', err)
      } finally {
        setLoading(false)
      }
    }
    
    if (promptId) {
      fetchPromptDetail()
    }
  }, [promptId])

  // Mock chart data (replace with real data)
  const chartData = [
    { date: 'Nov 27', value: 34 },
    { date: 'Nov 28', value: 28 },
    { date: 'Nov 29', value: 32 },
    { date: 'Nov 30', value: 25 },
    { date: 'Dec 1', value: 18 },
    { date: 'Dec 2', value: 30 },
    { date: 'Dec 3', value: 22 },
  ]

  const activeExecution = prompt?.executions?.find(e => e.model === activeModel)

  if (loading) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!prompt) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-primary mb-2">Prompt not found</h2>
          <button
            onClick={() => router.push('/dashboard/prompts')}
            className="text-gray-700 hover:underline cursor-pointer"
          >
            Back to Prompts
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-primary">
      <MobileHeader />
      
      {/* Top Bar */}
      <div className="bg-card border-b border-border">
        <div className="px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/dashboard/prompts')}
              className="flex items-center gap-2 p-2 -ml-2 hover:bg-secondary rounded-lg transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5 text-secondary" />
              <span className="text-muted">Prompts</span>
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="btn-secondary inline-flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4" />
              Last 7 days
              <ChevronDown className="w-3 h-3" />
            </button>
            <button className="btn-secondary inline-flex items-center gap-2 text-sm">
              All Models
              <ChevronDown className="w-3 h-3" />
            </button>
            <button className="p-2 hover:bg-secondary rounded-lg transition-colors cursor-pointer">
              <Settings className="w-5 h-5 text-secondary" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* Prompt Header Card */}
        <div className="card p-6 mb-6">
          <p className="text-xs text-muted uppercase tracking-wider mb-2">Prompt</p>
          <h1 className="text-2xl font-semibold text-primary mb-6">
            {prompt.prompt_text}
          </h1>
          
          {/* Meta Row */}
          <div className="grid grid-cols-5 gap-6 text-sm">
            <div>
              <p className="text-muted mb-1">Date added</p>
              <p className="text-primary">
                {new Date(prompt.created_at).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-muted mb-1">Topic</p>
              <p className="text-primary">{prompt.topic || '—'}</p>
            </div>
            <div>
              <p className="text-muted mb-1">Volume</p>
              <div className="flex items-center gap-0.5">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className={`w-1.5 h-4 rounded-sm ${i <= 3 ? 'bg-chart-2' : 'bg-secondary'}`} />
                ))}
              </div>
            </div>
            <div>
              <p className="text-muted mb-1">Location</p>
              <div className="flex items-center gap-2">
                <span className="text-lg">🇺🇸</span>
                <span className="text-primary">US</span>
              </div>
            </div>
            <div>
              <p className="text-muted mb-1">Status</p>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 bg-chart-2 rounded-full"></span>
                <span className="text-chart-2">Active</span>
              </span>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          {/* Visibility Chart */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-muted" />
                <span className="font-medium text-primary">Visibility</span>
                <span className="text-muted text-sm">· Percentage of chats mentioning each brand</span>
              </div>
              <button className="text-sm text-secondary hover:text-primary cursor-pointer">
                Export
              </button>
            </div>
            <VisibilityChart data={chartData} />
          </div>

          {/* Brands Table */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-muted" />
                <span className="font-medium text-primary">Brands</span>
                <span className="text-muted text-sm">· Brands with highest visibility</span>
              </div>
              <button className="text-sm text-secondary hover:text-primary cursor-pointer">
                Show All ↗
              </button>
            </div>
            
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Brand</th>
                  <th>Visibility</th>
                  <th>Sentiment</th>
                  <th>Position</th>
                </tr>
              </thead>
              <tbody>
                {(prompt.brands?.length > 0 ? prompt.brands : [
                  { brand_name: 'Asana', visibility_pct: 67, sentiment: 'positive', avg_position: 1 },
                  { brand_name: 'Monday.com', visibility_pct: 67, sentiment: 'positive', avg_position: 2 },
                  { brand_name: 'ClickUp', visibility_pct: 50, sentiment: 'neutral', avg_position: 3 },
                ]).map((brand, i) => (
                  <tr key={brand.brand_name}>
                    <td className="text-muted">{i + 1}</td>
                    <td className="text-primary font-medium">
                      <div className="flex items-center gap-2">
                        <img 
                          src={`https://img.logo.dev/${brand.brand_name.toLowerCase().replace(/\s+/g, '').replace('.com', '')}.com?token=pk_X-1ZO13GSgeOGP3a5JYvJw`}
                          alt=""
                          className="w-5 h-5 rounded object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none'
                          }}
                        />
                        {brand.brand_name}
                      </div>
                    </td>
                    <td className="text-primary">{brand.visibility_pct}%</td>
                    <td>
                      <SentimentBadge sentiment={brand.sentiment} />
                    </td>
                    <td className="text-primary">
                      {brand.avg_position ? `#${brand.avg_position}` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <button className="w-full mt-4 py-2 border border-dashed border-border rounded-lg text-sm text-secondary hover:text-primary hover:border-muted transition-colors cursor-pointer flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" />
              Add Brands
            </button>
          </div>
        </div>

        {/* Top Sources */}
        <div className="card p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-muted" />
              <span className="font-medium text-primary">Top Sources</span>
              <span className="text-muted text-sm">· Sources across active models</span>
            </div>
            <button className="text-sm text-secondary hover:text-primary cursor-pointer">
              Show All ↗
            </button>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {/* Citation Donut */}
            <div className="flex items-center justify-center">
              <div className="relative w-32 h-32">
                <svg className="w-full h-full -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    fill="none"
                    stroke="var(--bg-secondary)"
                    strokeWidth="12"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    fill="none"
                    stroke="var(--chart-2)"
                    strokeWidth="12"
                    strokeDasharray={`${(prompt.sources?.length || 3) * 30} 352`}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-primary">
                    {prompt.sources?.length || 0}
                  </span>
                  <span className="text-xs text-muted">Citations</span>
                </div>
              </div>
            </div>

            {/* Source Type Legend */}
            <div className="flex flex-col justify-center gap-2">
              {['Editorial', 'Institutional', 'UGC', 'Corporate'].map((type, i) => (
                <div key={type} className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-sm ${
                    i === 0 ? 'bg-chart-1' : 
                    i === 1 ? 'bg-chart-2' : 
                    i === 2 ? 'bg-warning' : 
                    'bg-chart-4'
                  }`} />
                  <span className="text-sm text-secondary">{type}</span>
                </div>
              ))}
            </div>

            {/* Source List */}
            <div className="space-y-2">
              {(prompt.sources?.slice(0, 4) || [
                { domain: 'youtube.com', used_pct: 100, avg_citations: 2, source_type: 'ugc' },
                { domain: 'zapier.com', used_pct: 67, avg_citations: 1.5, source_type: 'corporate' },
                { domain: 'pcmag.com', used_pct: 50, avg_citations: 1, source_type: 'editorial' },
              ]).map((source) => (
                <div key={source.domain} className="flex items-center justify-between py-1">
                  <div className="flex items-center gap-2">
                    <img 
                      src={`https://www.google.com/s2/favicons?domain=${source.domain}&sz=32`}
                      alt=""
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-sm text-primary">{source.domain}</span>
                  </div>
                  <SourceTypeBadge type={source.source_type} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Chats / Model Responses */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="font-medium text-primary">Recent Chats</span>
              <span className="text-muted text-sm">· Last 100 chats in the selected time period</span>
            </div>
            <div className="flex items-center gap-2">
              <button className="btn-secondary text-sm">
                Export
              </button>
            </div>
          </div>

          {/* Model Tabs */}
          <div className="flex items-center gap-1 mb-4 border-b border-border">
            {['chatgpt', 'claude', 'perplexity'].map((model) => {
              const execution = prompt?.executions?.find(e => e.model === model)
              const isActive = activeModel === model
              
              return (
                <button
                  key={model}
                  onClick={() => setActiveModel(model)}
                  className={`
                    flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors cursor-pointer
                    ${isActive 
                      ? 'border-gray-900 text-primary' 
                      : 'border-transparent text-muted hover:text-secondary'
                    }
                  `}
                >
                  <ModelLogo model={model} size={16} />
                  <span className="capitalize">{model}</span>
                  {execution ? (
                    <span className={`ml-1 px-1.5 py-0.5 rounded text-xs ${
                      execution.brands_mentioned?.length > 0 
                        ? 'bg-chart-2/10 text-chart-2' 
                        : 'bg-secondary text-muted'
                    }`}>
                      {execution.brands_mentioned?.length > 0 ? 'Yes' : 'No'}
                    </span>
                  ) : (
                    <span className="ml-1 px-1.5 py-0.5 bg-secondary text-muted rounded text-xs">
                      Pending
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Response Content */}
          {activeExecution ? (
            <div className="space-y-4">
              <div className="bg-secondary rounded-lg p-4">
                <p className="text-secondary text-sm leading-relaxed line-clamp-6">
                  {activeExecution.response_text || 'No response text available.'}
                </p>
                <button 
                  onClick={() => setShowResponseModal(true)}
                  className="text-sm text-gray-700 hover:underline mt-2 cursor-pointer"
                >
                  Read full response →
                </button>
              </div>

              {/* Citations */}
              {activeExecution.citations?.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-primary mb-2">
                    Citations ({activeExecution.citations.length})
                  </p>
                  <div className="space-y-2">
                    {activeExecution.citations.map((citation, i) => (
                      <a
                        key={i}
                        href={citation.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-secondary hover:text-primary transition-colors group"
                      >
                        <img 
                          src={`https://www.google.com/s2/favicons?domain=${citation.domain}&sz=32`}
                          alt=""
                          className="w-4 h-4 rounded"
                        />
                        <span className="truncate">{citation.url}</span>
                        <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-muted">
              <p>No execution data for {activeModel} yet.</p>
              <p className="text-sm mt-1">Run a scan to see results.</p>
            </div>
          )}
        </div>
      </div>

      {/* Full Response Modal */}
      {showResponseModal && activeExecution && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowResponseModal(false)}
          />
          <div className="relative bg-card rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden border border-border">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <ModelLogo model={activeExecution.model} />
                <span className="font-medium text-primary capitalize">{activeExecution.model} Response</span>
              </div>
              <button 
                onClick={() => setShowResponseModal(false)}
                className="p-1 hover:bg-secondary rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 text-muted" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <p className="text-secondary whitespace-pre-wrap leading-relaxed">
                {activeExecution.response_text}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}