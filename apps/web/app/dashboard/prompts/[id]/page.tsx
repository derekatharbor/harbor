// app/dashboard/prompts/[id]/page.tsx
// Prompt Detail View - Model comparison, visibility, citations

'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
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
  Smile,
  Meh,
  Frown,
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
    chatgpt: '/logos/chatgpt.svg',
    claude: '/logos/claude.svg',
    gemini: '/logos/gemini.svg',
    perplexity: '/logos/perplexity.svg'
  }
  
  return (
    <Image
      src={logoMap[model] || logoMap.chatgpt}
      alt={model}
      width={size}
      height={size}
      className="rounded"
    />
  )
}

// Sentiment icon
function SentimentIcon({ sentiment, size = 16 }: { sentiment: string | null; size?: number }) {
  if (!sentiment) return <span className="text-gray-400">—</span>
  
  const icons = {
    positive: <Smile className={`w-${size/4} h-${size/4} text-emerald-500`} />,
    neutral: <Meh className={`w-${size/4} h-${size/4} text-gray-400`} />,
    negative: <Frown className={`w-${size/4} h-${size/4} text-red-500`} />
  }
  
  return icons[sentiment as keyof typeof icons] || icons.neutral
}

// Source type badge
function SourceTypeBadge({ type }: { type: string }) {
  const colors: Record<string, string> = {
    editorial: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    corporate: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    institutional: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    ugc: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    unknown: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
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
            className="w-full bg-gray-200 dark:bg-gray-700 rounded-t transition-all duration-500"
            style={{ 
              height: `${(point.value / maxValue) * 100}%`,
              minHeight: '4px'
            }}
          />
          <span className="text-[10px] text-gray-400">{point.date}</span>
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    )
  }

  if (!prompt) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Prompt not found</h2>
          <button
            onClick={() => router.push('/dashboard/prompts')}
            className="text-blue-600 hover:text-blue-700"
          >
            Back to Prompts
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <MobileHeader />
      
      {/* Top Bar */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/dashboard/prompts')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <span className="text-gray-400">Prompts</span>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="inline-flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer">
              <Calendar className="w-4 h-4" />
              Last 7 days
              <ChevronDown className="w-3 h-3" />
            </button>
            <button className="inline-flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer">
              All Models
              <ChevronDown className="w-3 h-3" />
            </button>
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer">
              <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* Prompt Header Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Prompt</p>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            {prompt.prompt_text}
          </h1>
          
          {/* Meta Row */}
          <div className="grid grid-cols-5 gap-6 text-sm">
            <div>
              <p className="text-gray-400 mb-1">Date added</p>
              <p className="text-gray-900 dark:text-white">
                {new Date(prompt.created_at).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-gray-400 mb-1">Topic</p>
              <p className="text-gray-900 dark:text-white">{prompt.topic || '—'}</p>
            </div>
            <div>
              <p className="text-gray-400 mb-1">Volume</p>
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className={`w-1.5 h-4 rounded-sm ${i <= 3 ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-gray-700'}`} />
                ))}
              </div>
            </div>
            <div>
              <p className="text-gray-400 mb-1">Location</p>
              <div className="flex items-center gap-2">
                <span className="text-lg">🇺🇸</span>
                <span className="text-gray-900 dark:text-white">US</span>
              </div>
            </div>
            <div>
              <p className="text-gray-400 mb-1">Status</p>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                <span className="text-emerald-600 dark:text-emerald-400">Active</span>
              </span>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          {/* Visibility Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-gray-400" />
                <span className="font-medium text-gray-900 dark:text-white">Visibility</span>
                <span className="text-gray-400 text-sm">· Percentage of chats mentioning each brand</span>
              </div>
              <button className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer">
                Export
              </button>
            </div>
            <VisibilityChart data={chartData} />
          </div>

          {/* Brands Table */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-gray-400" />
                <span className="font-medium text-gray-900 dark:text-white">Brands</span>
                <span className="text-gray-400 text-sm">· Brands with highest visibility</span>
              </div>
              <button className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer">
                Show All ↗
              </button>
            </div>
            
            <table className="w-full">
              <thead>
                <tr className="text-xs text-gray-400 uppercase tracking-wider">
                  <th className="text-left py-2 font-medium">#</th>
                  <th className="text-left py-2 font-medium">Brand</th>
                  <th className="text-left py-2 font-medium">Visibility</th>
                  <th className="text-left py-2 font-medium">Sentiment</th>
                  <th className="text-left py-2 font-medium">Position</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {(prompt.brands?.length > 0 ? prompt.brands : [
                  { brand_name: 'Asana', visibility_pct: 67, sentiment: 'positive', avg_position: 1 },
                  { brand_name: 'Monday.com', visibility_pct: 67, sentiment: 'positive', avg_position: 2 },
                  { brand_name: 'ClickUp', visibility_pct: 50, sentiment: 'neutral', avg_position: 3 },
                ]).map((brand, i) => (
                  <tr key={brand.brand_name} className="border-t border-gray-100 dark:border-gray-700">
                    <td className="py-3 text-gray-400">{i + 1}</td>
                    <td className="py-3 text-gray-900 dark:text-white font-medium">{brand.brand_name}</td>
                    <td className="py-3 text-gray-900 dark:text-white">{brand.visibility_pct}%</td>
                    <td className="py-3">
                      <SentimentIcon sentiment={brand.sentiment} />
                    </td>
                    <td className="py-3 text-gray-900 dark:text-white">
                      {brand.avg_position ? `#${brand.avg_position}` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <button className="w-full mt-4 py-2 border border-dashed border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500 transition-colors cursor-pointer flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" />
              Add Brands
            </button>
          </div>
        </div>

        {/* Top Sources */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-gray-400" />
              <span className="font-medium text-gray-900 dark:text-white">Top Sources</span>
              <span className="text-gray-400 text-sm">· Sources across active models</span>
            </div>
            <button className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer">
              Show All ↗
            </button>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {/* Citation Donut - Placeholder */}
            <div className="flex items-center justify-center">
              <div className="relative w-32 h-32">
                <svg className="w-full h-full -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="12"
                    className="dark:stroke-gray-700"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="12"
                    strokeDasharray={`${(prompt.sources?.length || 3) * 30} 352`}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {prompt.sources?.length || 0}
                  </span>
                  <span className="text-xs text-gray-400">Citations</span>
                </div>
              </div>
            </div>

            {/* Sources Table */}
            <div className="col-span-2">
              <table className="w-full">
                <thead>
                  <tr className="text-xs text-gray-400 uppercase tracking-wider">
                    <th className="text-left py-2 font-medium">Domain</th>
                    <th className="text-left py-2 font-medium">Used</th>
                    <th className="text-left py-2 font-medium">Avg. Citations</th>
                    <th className="text-left py-2 font-medium">Type</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {(prompt.sources?.length > 0 ? prompt.sources : [
                    { domain: 'g2.com', used_pct: 75, avg_citations: 2.1, source_type: 'editorial' },
                    { domain: 'capterra.com', used_pct: 50, avg_citations: 1.5, source_type: 'editorial' },
                    { domain: 'asana.com', used_pct: 33, avg_citations: 1.0, source_type: 'corporate' },
                  ]).map((source) => (
                    <tr key={source.domain} className="border-t border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30 cursor-pointer">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <img 
                            src={`https://www.google.com/s2/favicons?domain=${source.domain}&sz=32`}
                            alt=""
                            className="w-5 h-5 rounded"
                          />
                          <span className="text-gray-900 dark:text-white">{source.domain}</span>
                        </div>
                      </td>
                      <td className="py-3 text-gray-900 dark:text-white">{source.used_pct}%</td>
                      <td className="py-3 text-gray-900 dark:text-white">{source.avg_citations.toFixed(1)}</td>
                      <td className="py-3">
                        <SourceTypeBadge type={source.source_type} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Model Responses */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900 dark:text-white">Recent Responses</span>
              <span className="text-gray-400 text-sm">· Compare AI model answers</span>
            </div>
          </div>

          {/* Model Tabs */}
          <div className="flex items-center gap-2 mb-4 border-b border-gray-200 dark:border-gray-700 pb-4">
            {['chatgpt', 'claude', 'perplexity'].map((model) => (
              <button
                key={model}
                onClick={() => setActiveModel(model)}
                className={`
                  inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer
                  ${activeModel === model
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                  }
                `}
              >
                <ModelLogo model={model} size={16} />
                <span className="capitalize">{model}</span>
              </button>
            ))}
          </div>

          {/* Response Content */}
          <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4">
            {activeExecution ? (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                  {activeExecution.response_text.slice(0, 800)}
                  {activeExecution.response_text.length > 800 && '...'}
                </p>
                {activeExecution.response_text.length > 800 && (
                  <button 
                    onClick={() => setShowResponseModal(true)}
                    className="text-blue-600 dark:text-blue-400 text-sm font-medium mt-2 cursor-pointer"
                  >
                    Read full response ↗
                  </button>
                )}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                No response data yet. Run a scan to see AI responses.
              </p>
            )}
          </div>

          {/* Citations for this model */}
          {activeExecution?.citations && activeExecution.citations.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">Sources cited:</p>
              <div className="flex flex-wrap gap-2">
                {activeExecution.citations.map((citation, i) => (
                  <a
                    key={i}
                    href={citation.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    <img 
                      src={`https://www.google.com/s2/favicons?domain=${citation.domain}&sz=16`}
                      alt=""
                      className="w-4 h-4 rounded"
                    />
                    {citation.domain}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ))}
              </div>
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
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <ModelLogo model={activeModel || 'chatgpt'} size={24} />
                <span className="font-medium text-gray-900 dark:text-white capitalize">{activeModel}</span>
                <span className="text-gray-400">🇺🇸 US</span>
              </div>
              <button
                onClick={() => setShowResponseModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">User prompt:</p>
                <p className="text-gray-900 dark:text-white">{prompt.prompt_text}</p>
              </div>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                  {activeExecution.response_text}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
