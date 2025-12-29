// apps/web/app/dashboard/overview/page.tsx
// Overview Dashboard with DUMMY DATA for screenshots
// Replace with original page.tsx after screenshots are taken

'use client'

import React, { useState, useRef } from 'react'
import Link from 'next/link'
import { 
  ArrowUpRight,
  Download,
  Eye,
  Globe,
  ChevronDown,
  Check,
  MessageSquare,
  Calendar,
  Tag,
  Target,
  X,
  TrendingUp,
  CheckCircle2,
  Circle,
  Lightbulb,
  ArrowRight,
  Sparkles
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import MobileHeader from '@/components/layout/MobileHeader'

// ============================================================================
// DUMMY DATA FOR SCREENSHOTS
// ============================================================================

const DUMMY_BRAND = {
  name: 'Acme Corp',
  logo: 'https://logo.clearbit.com/acme.com',
  domain: 'acme.com'
}

const DUMMY_COMPETITORS: CompetitorData[] = [
  {
    rank: 1,
    name: 'Acme Corp',
    logo: 'https://logo.clearbit.com/acme.com',
    visibility: 72,
    visibilityDelta: 8,
    sentiment: 'positive',
    sentimentDelta: 5,
    position: 2.1,
    positionDelta: -0.3,
    mentions: 847,
    isUser: true,
    color: '#FF6B4A'
  },
  {
    rank: 2,
    name: 'TechFlow',
    logo: 'https://logo.clearbit.com/techflow.io',
    visibility: 68,
    visibilityDelta: 3,
    sentiment: 'positive',
    sentimentDelta: 2,
    position: 2.4,
    positionDelta: 0.1,
    mentions: 723,
    isUser: false,
    color: '#3B82F6'
  },
  {
    rank: 3,
    name: 'Zenith Labs',
    logo: 'https://logo.clearbit.com/zenith.com',
    visibility: 54,
    visibilityDelta: -2,
    sentiment: 'neutral',
    sentimentDelta: 0,
    position: 3.2,
    positionDelta: 0.4,
    mentions: 512,
    isUser: false,
    color: '#22C55E'
  },
  {
    rank: 4,
    name: 'Quantum Inc',
    logo: 'https://logo.clearbit.com/quantum.com',
    visibility: 41,
    visibilityDelta: 5,
    sentiment: 'positive',
    sentimentDelta: 3,
    position: 4.1,
    positionDelta: -0.2,
    mentions: 389,
    isUser: false,
    color: '#8B5CF6'
  },
  {
    rank: 5,
    name: 'Nova Systems',
    logo: 'https://logo.clearbit.com/nova.io',
    visibility: 35,
    visibilityDelta: 1,
    sentiment: 'neutral',
    sentimentDelta: -1,
    position: 4.8,
    positionDelta: 0.2,
    mentions: 298,
    isUser: false,
    color: '#F59E0B'
  },
  {
    rank: 6,
    name: 'Apex Digital',
    logo: 'https://logo.clearbit.com/apex.com',
    visibility: 28,
    visibilityDelta: -4,
    sentiment: 'negative',
    sentimentDelta: -2,
    position: 5.3,
    positionDelta: 0.5,
    mentions: 234,
    isUser: false,
    color: '#EC4899'
  },
]

const DUMMY_SOURCES: SourceData[] = [
  { domain: 'techcrunch.com', logo: 'https://logo.clearbit.com/techcrunch.com', type: 'Editorial', citations: 127, color: '#3B82F6' },
  { domain: 'g2.com', logo: 'https://logo.clearbit.com/g2.com', type: 'UGC', citations: 98, color: '#22D3EE' },
  { domain: 'acme.com', logo: 'https://logo.clearbit.com/acme.com', type: 'Corporate', citations: 84, color: '#FF8C42' },
  { domain: 'gartner.com', logo: 'https://logo.clearbit.com/gartner.com', type: 'Institutional', citations: 72, color: '#4ADE80' },
  { domain: 'wikipedia.org', logo: 'https://logo.clearbit.com/wikipedia.org', type: 'Reference', citations: 56, color: '#A855F7' },
]

const DUMMY_VISIBILITY_HISTORY = [
  { date: '2025-12-22', displayDate: 'Dec 22', visibility: 58, position: 3.2, sentiment: 65 },
  { date: '2025-12-23', displayDate: 'Dec 23', visibility: 61, position: 2.9, sentiment: 68 },
  { date: '2025-12-24', displayDate: 'Dec 24', visibility: 59, position: 3.0, sentiment: 66 },
  { date: '2025-12-25', displayDate: 'Dec 25', visibility: 64, position: 2.7, sentiment: 70 },
  { date: '2025-12-26', displayDate: 'Dec 26', visibility: 67, position: 2.4, sentiment: 72 },
  { date: '2025-12-27', displayDate: 'Dec 27', visibility: 69, position: 2.2, sentiment: 75 },
  { date: '2025-12-28', displayDate: 'Dec 28', visibility: 72, position: 2.1, sentiment: 78 },
]

const DUMMY_PROMPTS: PromptExecution[] = [
  {
    id: '1',
    prompt: 'What is the best project management software for startups?',
    topic: 'Project Management',
    model: 'chatgpt',
    modelName: 'ChatGPT',
    modelLogo: 'https://cdn.brandfetch.io/openai.com?c=1id1Fyz-h7an5-5KR_y',
    responsePreview: 'For startups, I recommend considering Acme Corp, TechFlow, or Notion based on your specific needs...',
    responseText: 'For startups, I recommend considering **Acme Corp**, **TechFlow**, or **Notion** based on your specific needs. Acme Corp offers excellent collaboration features and scales well. TechFlow is great for agile teams with its sprint planning tools.',
    executedAt: '2025-12-28T14:30:00Z',
    timeAgo: '2 hours ago',
    brandsCount: 3,
    brands: ['Acme Corp', 'TechFlow', 'Notion'],
    citationsCount: 2,
    citationDomains: ['g2.com', 'techcrunch.com'],
    citationFavicons: []
  },
  {
    id: '2',
    prompt: 'Compare enterprise CRM solutions for B2B companies',
    topic: 'CRM',
    model: 'claude',
    modelName: 'Claude',
    modelLogo: 'https://cdn.brandfetch.io/anthropic.com?c=1id1Fyz-h7an5-5KR_y',
    responsePreview: 'When comparing enterprise CRM solutions, Salesforce leads in features while Acme Corp offers better value...',
    responseText: 'When comparing enterprise CRM solutions, **Salesforce** leads in features while **Acme Corp** offers better value for mid-market companies. HubSpot is ideal for marketing-heavy teams.',
    executedAt: '2025-12-28T12:15:00Z',
    timeAgo: '4 hours ago',
    brandsCount: 3,
    brands: ['Salesforce', 'Acme Corp', 'HubSpot'],
    citationsCount: 3,
    citationDomains: ['gartner.com', 'forrester.com', 'g2.com'],
    citationFavicons: []
  },
  {
    id: '3',
    prompt: 'Best automation tools for small business',
    topic: 'Automation',
    model: 'perplexity',
    modelName: 'Perplexity',
    modelLogo: 'https://cdn.brandfetch.io/perplexity.ai?c=1id1Fyz-h7an5-5KR_y',
    responsePreview: 'For small business automation, Zapier and Acme Corp are top choices...',
    responseText: 'For small business automation, **Zapier** and **Acme Corp** are top choices. Acme Corp recently launched workflow automation that rivals Make.com at a lower price point.',
    executedAt: '2025-12-28T10:00:00Z',
    timeAgo: '6 hours ago',
    brandsCount: 3,
    brands: ['Zapier', 'Acme Corp', 'Make.com'],
    citationsCount: 1,
    citationDomains: ['techcrunch.com'],
    citationFavicons: []
  },
]

const DUMMY_ACTION_ITEMS: ActionItem[] = [
  {
    id: '1',
    title: 'Add schema markup to product pages',
    description: 'Help AI models understand your product features better with structured data',
    impact: 'high',
    href: '/dashboard/website',
    type: 'quick-win'
  },
  {
    id: '2',
    title: 'Create comparison content',
    description: 'Acme Corp vs TechFlow content could capture 15% more AI mentions',
    impact: 'high',
    href: '/dashboard/opportunities',
    type: 'opportunity'
  },
  {
    id: '3',
    title: 'Update meta descriptions',
    description: '12 pages have outdated descriptions that AI models may misinterpret',
    impact: 'medium',
    href: '/dashboard/website',
    type: 'quick-win'
  },
]

// ============================================================================
// TYPES
// ============================================================================

interface CompetitorData {
  rank: number
  name: string
  logo: string
  fallbackLogo?: string
  visibility: number
  visibilityDelta: number | null
  sentiment: 'positive' | 'neutral' | 'negative'
  sentimentDelta: number | null
  position: number | null
  positionDelta: number | null
  mentions: number
  isUser: boolean
  color: string
}

interface SourceData {
  domain: string
  logo: string
  type: string
  citations: number
  color: string
}

interface PromptExecution {
  id: string
  prompt: string
  topic: string
  model: string
  modelName: string
  modelLogo: string
  responsePreview: string
  responseText: string
  executedAt: string
  timeAgo: string
  brandsCount: number
  brands: string[]
  citationsCount: number
  citationDomains: string[]
  citationFavicons: string[]
}

interface ActionItem {
  id: string
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  href?: string
  type: 'quick-win' | 'opportunity'
}

// ============================================================================
// COMPONENT
// ============================================================================

const MODEL_NAMES: Record<string, string> = {
  all: 'All Models',
  chatgpt: 'ChatGPT',
  claude: 'Claude',
  perplexity: 'Perplexity',
}

export default function OverviewPage() {
  const [selectedModel, setSelectedModel] = useState('all')
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false)
  const [tagsDropdownOpen, setTagsDropdownOpen] = useState(false)
  const modelDropdownRef = useRef<HTMLDivElement>(null)
  const tagsDropdownRef = useRef<HTMLDivElement>(null)
  const [activeMetric, setActiveMetric] = useState<'visibility' | 'sentiment' | 'position'>('visibility')
  const [selectedPrompt, setSelectedPrompt] = useState<PromptExecution | null>(null)
  const [competitorAlertDismissed, setCompetitorAlertDismissed] = useState(false)

  // Use dummy data
  const brandName = DUMMY_BRAND.name
  const brandLogo = DUMMY_BRAND.logo
  const competitors = DUMMY_COMPETITORS
  const sources = DUMMY_SOURCES
  const visibilityHistory = DUMMY_VISIBILITY_HISTORY
  const recentPrompts = DUMMY_PROMPTS
  const actionItems = DUMMY_ACTION_ITEMS
  const totalCitations = sources.reduce((sum, s) => sum + s.citations, 0)
  const totalBrands = 847
  
  const userData = competitors.find(c => c.isUser)
  const userVisibility = userData?.visibility || 0
  const userSentiment = userData?.sentiment || 'neutral'
  const userRank = userData?.rank || 1
  
  const topCompetitor = competitors.find(c => !c.isUser && c.visibility > userVisibility)

  return (
    <div className="min-h-screen bg-primary" data-page="overview">
      <MobileHeader />
      
      {/* Header Bar */}
      <div className="page-header-bar">
        <div className="flex items-center gap-3">
          {/* Brand badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary rounded-lg border border-border">
            {brandLogo ? (
              <img src={brandLogo} alt={brandName} className="w-5 h-5 rounded" onError={(e) => { e.currentTarget.style.display = 'none' }} />
            ) : (
              <div className="w-5 h-5 rounded bg-hover flex items-center justify-center text-xs font-medium text-muted">
                {brandName.charAt(0)}
              </div>
            )}
            <span className="font-medium text-primary text-sm">{brandName}</span>
          </div>

          {/* Time Range */}
          <button className="dropdown-trigger">
            <Calendar className="w-4 h-4 text-muted" />
            <span>Last 7 days</span>
            <ChevronDown className="w-4 h-4 text-muted" />
          </button>

          {/* Tags */}
          <div className="relative" ref={tagsDropdownRef}>
            <button className="dropdown-trigger" onClick={() => setTagsDropdownOpen(!tagsDropdownOpen)}>
              <Tag className="w-4 h-4 text-muted" />
              <span>All tags</span>
              <ChevronDown className={`w-4 h-4 text-muted transition-transform ${tagsDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Models */}
          <div className="relative" ref={modelDropdownRef}>
            <button 
              className="dropdown-trigger"
              onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
            >
              <Globe className="w-4 h-4 text-muted" />
              <span>{MODEL_NAMES[selectedModel]}</span>
              <ChevronDown className={`w-4 h-4 text-muted transition-transform ${modelDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {modelDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 bg-card border border-border rounded-lg shadow-lg py-1 z-50 min-w-40">
                {Object.entries(MODEL_NAMES).map(([key, label]) => (
                  <button
                    key={key}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-hover flex items-center justify-between"
                    onClick={() => { setSelectedModel(key); setModelDropdownOpen(false) }}
                  >
                    <span className={selectedModel === key ? 'text-primary' : 'text-secondary'}>{label}</span>
                    {selectedModel === key && <Check className="w-4 h-4 text-accent" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-secondary hover:text-primary transition-colors">
          <Download className="w-4 h-4" />
          <span>Export</span>
        </button>
      </div>

      {/* Page Title */}
      <div className="px-6 pt-4 pb-2 flex items-center gap-2">
        <Eye className="w-4 h-4 text-muted" />
        <h1 className="text-sm font-medium text-secondary">Overview</h1>
        <span className="text-muted">•</span>
        <span className="text-sm text-muted">{totalBrands} brands found in AI responses</span>
      </div>

      {/* User Stats Summary */}
      <div className="px-6 pb-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Visibility */}
          <div className="card p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted uppercase tracking-wide">Visibility</span>
              <Eye className="w-3.5 h-3.5 text-muted" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-semibold text-primary">{userVisibility}%</span>
              <span className="text-xs text-green-500">Top performer</span>
            </div>
            <p className="text-xs text-muted mt-1">Top 25% in SaaS</p>
          </div>
          
          {/* Rank */}
          <div className="card p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted uppercase tracking-wide">Rank</span>
              <Target className="w-3.5 h-3.5 text-muted" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-semibold text-primary">#{userRank}</span>
              <span className="text-xs text-green-500">Top 10%</span>
            </div>
            <p className="text-xs text-muted mt-1">Out of {totalBrands} brands in SaaS</p>
          </div>
          
          {/* Sentiment */}
          <div className="card p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted uppercase tracking-wide">Sentiment</span>
              <MessageSquare className="w-3.5 h-3.5 text-muted" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-semibold capitalize text-green-500">
                {userSentiment}
              </span>
              <TrendingUp className="w-4 h-4 text-green-500" />
            </div>
            <p className="text-xs text-muted mt-1">How AI portrays your brand</p>
          </div>
          
          {/* Sources/Citations */}
          <div className="card p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted uppercase tracking-wide">Sources</span>
              <Globe className="w-3.5 h-3.5 text-muted" />
            </div>
            <div className="text-2xl font-semibold text-primary">{totalCitations}</div>
            <p className="text-xs text-muted mt-1">Domains cited in responses</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Action Items */}
        <div className="card p-0 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <Lightbulb className="w-4 h-4 text-amber-500" />
              </div>
              <div>
                <h3 className="font-semibold text-primary text-sm">Next Steps</h3>
                <p className="text-xs text-muted mt-0.5">High-impact actions to improve your AI visibility</p>
              </div>
            </div>
            <Link href="/dashboard/opportunities" className="expand-btn">
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {actionItems.map((item) => (
              <Link 
                key={item.id}
                href={item.href || '#'}
                className="flex items-start gap-3 px-4 py-3 hover:bg-hover transition-colors"
              >
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                  item.impact === 'high' ? 'bg-red-500' : 'bg-amber-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-primary">{item.title}</div>
                  <div className="text-xs text-muted mt-0.5">{item.description}</div>
                </div>
                <ArrowRight className="w-4 h-4 text-muted flex-shrink-0 mt-1" />
              </Link>
            ))}
          </div>
        </div>

        {/* Chart + Competitors */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Chart - 7 columns */}
          <div className="lg:col-span-7 card p-0 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="pill-group">
                  <button 
                    className={`pill flex items-center gap-1.5 ${activeMetric === 'visibility' ? 'active' : ''}`}
                    onClick={() => setActiveMetric('visibility')}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Visibility
                  </button>
                  <button 
                    className={`pill flex items-center gap-1.5 ${activeMetric === 'sentiment' ? 'active' : ''}`}
                    onClick={() => setActiveMetric('sentiment')}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    Sentiment
                  </button>
                  <button 
                    className={`pill flex items-center gap-1.5 ${activeMetric === 'position' ? 'active' : ''}`}
                    onClick={() => setActiveMetric('position')}
                  >
                    <Target className="w-3.5 h-3.5" />
                    Position
                  </button>
                </div>
                <span className="text-xs text-muted ml-2">
                  · {activeMetric === 'visibility' ? 'Percentage of chats mentioning each brand' : 
                     activeMetric === 'sentiment' ? 'How brands are portrayed in responses' : 
                     'Average ranking position'}
                </span>
              </div>
              <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-secondary border border-border rounded-lg hover:bg-secondary transition-colors">
                <Download className="w-3.5 h-3.5" />
                Export
              </button>
            </div>

            <div className="p-4 h-[360px]">
              <VisibilityChart 
                brandName={brandName}
                competitors={competitors}
                metric={activeMetric}
                history={visibilityHistory}
              />
            </div>
          </div>

          {/* Competitors Table - 5 columns */}
          <div className="lg:col-span-5 card p-0 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div>
                <h3 className="font-semibold text-primary text-sm">Top Brands in AI Responses</h3>
                <p className="text-xs text-muted mt-0.5">Brands mentioned alongside {brandName}</p>
              </div>
              <Link href="/dashboard/competitors" className="expand-btn">
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-12 gap-2 px-4 py-2 text-xs text-muted border-b border-border bg-secondary">
              <div className="col-span-6">Brand</div>
              <div className="col-span-3 text-center">Visibility</div>
              <div className="col-span-3 text-center">Sentiment</div>
            </div>

            <div className="max-h-[320px] overflow-y-auto">
              {competitors.map((comp, idx) => (
                <div 
                  key={comp.name}
                  className={`grid grid-cols-12 gap-2 px-4 py-3 items-center hover:bg-hover ${comp.isUser ? 'bg-secondary/50' : ''}`}
                  style={{ 
                    borderTop: idx > 0 ? '1px solid rgba(255,255,255,0.06)' : 'none'
                  }}
                >
                  {/* Brand - 6 cols */}
                  <div className="col-span-6 flex items-center gap-2 min-w-0">
                    <span className="text-muted text-xs w-4 flex-shrink-0">{comp.rank}</span>
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: comp.color }} />
                    <img 
                      src={comp.logo} 
                      alt="" 
                      className="w-5 h-5 rounded flex-shrink-0" 
                      onError={(e) => { e.currentTarget.style.display = 'none' }}
                    />
                    <span className={`truncate text-sm ${comp.isUser ? 'font-medium text-primary' : 'text-secondary'}`}>
                      {comp.name}
                      {comp.isUser && <span className="ml-1 text-xs text-accent">(You)</span>}
                    </span>
                  </div>

                  {/* Visibility - 3 cols */}
                  <div className="col-span-3 text-center">
                    <span className="text-sm text-primary">{comp.visibility}%</span>
                    {comp.visibilityDelta !== null && comp.visibilityDelta !== 0 && (
                      <span className={`ml-1 text-xs ${comp.visibilityDelta > 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {comp.visibilityDelta > 0 ? '+' : ''}{comp.visibilityDelta}
                      </span>
                    )}
                  </div>

                  {/* Sentiment - 3 cols */}
                  <div className="col-span-3 flex justify-center">
                    <span className={`px-2 py-0.5 rounded text-xs capitalize ${
                      comp.sentiment === 'positive' ? 'bg-green-500/20 text-green-500' :
                      comp.sentiment === 'negative' ? 'bg-red-500/20 text-red-500' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {comp.sentiment}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sources + Prompts */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sources - 5 columns */}
          <div className="lg:col-span-5 card p-0 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div>
                <h3 className="font-semibold text-primary text-sm">Top Sources</h3>
                <p className="text-xs text-muted mt-0.5">Domains AI models cite most</p>
              </div>
              <Link href="/dashboard/sources" className="expand-btn">
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="divide-y divide-border">
              {sources.map((source) => (
                <div key={source.domain} className="flex items-center gap-3 px-4 py-3 hover:bg-hover transition-colors">
                  <img 
                    src={source.logo} 
                    alt="" 
                    className="w-5 h-5 rounded flex-shrink-0"
                    onError={(e) => { e.currentTarget.style.display = 'none' }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-primary truncate">{source.domain}</div>
                    <div className="text-xs text-muted">{source.type}</div>
                  </div>
                  <div className="text-sm text-secondary">{source.citations}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Prompts - 7 columns */}
          <div className="lg:col-span-7 card p-0 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div>
                <h3 className="font-semibold text-primary text-sm">Recent Prompts</h3>
                <p className="text-xs text-muted mt-0.5">Latest AI conversations mentioning your brand</p>
              </div>
              <Link href="/dashboard/prompts" className="expand-btn">
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="divide-y divide-border">
              {recentPrompts.map((prompt) => (
                <button
                  key={prompt.id}
                  onClick={() => setSelectedPrompt(prompt)}
                  className="w-full flex items-start gap-3 px-4 py-3 hover:bg-hover transition-colors text-left"
                >
                  <img 
                    src={prompt.modelLogo} 
                    alt={prompt.modelName}
                    className="w-6 h-6 rounded flex-shrink-0 mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-primary line-clamp-1">{prompt.prompt}</div>
                    <div className="text-xs text-muted mt-1 line-clamp-1">{prompt.responsePreview}</div>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted">
                      <span>{prompt.timeAgo}</span>
                      <span>•</span>
                      <span>{prompt.brandsCount} brands</span>
                      <span>•</span>
                      <span>{prompt.citationsCount} sources</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Prompt Modal */}
      {selectedPrompt && (
        <PromptModal prompt={selectedPrompt} onClose={() => setSelectedPrompt(null)} />
      )}
    </div>
  )
}

// ============================================================================
// CHART COMPONENT
// ============================================================================

function VisibilityChart({ 
  brandName, 
  competitors, 
  metric,
  history
}: { 
  brandName: string
  competitors: CompetitorData[]
  metric: 'visibility' | 'sentiment' | 'position'
  history: typeof DUMMY_VISIBILITY_HISTORY
}) {
  const sentimentToNumber = (s: string) => s === 'positive' ? 80 : s === 'negative' ? 30 : 50
  
  const getValue = (comp: CompetitorData) => {
    if (metric === 'visibility') return comp.visibility
    if (metric === 'sentiment') return sentimentToNumber(comp.sentiment)
    return comp.position || 0
  }
  
  const userBrand = competitors.find(c => c.isUser)
  const topCompetitors = competitors.filter(c => !c.isUser).slice(0, 4)
  const charted = [userBrand, ...topCompetitors].filter(Boolean) as CompetitorData[]

  // Generate chart data with slight variations for competitors
  const chartData = history.map((h, idx) => {
    const point: Record<string, string | number | null> = { date: h.displayDate }
    
    charted.forEach(comp => {
      if (comp.isUser) {
        if (metric === 'visibility') point[comp.name] = h.visibility
        else if (metric === 'sentiment') point[comp.name] = h.sentiment
        else point[comp.name] = h.position
      } else {
        // Add slight variation to competitor data to make chart interesting
        const baseValue = getValue(comp)
        const variation = Math.sin(idx * 0.8) * 5 + (Math.random() - 0.5) * 3
        point[comp.name] = Math.max(0, Math.min(100, baseValue + variation))
      }
    })
    
    return point
  })

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid 
          strokeDasharray="3 3" 
          vertical={true}
          stroke="var(--border)"
        />
        <XAxis 
          dataKey="date" 
          axisLine={false}
          tickLine={false}
          tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
          dy={10}
        />
        <YAxis 
          axisLine={false}
          tickLine={false}
          tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
          domain={metric === 'position' ? [0, 10] : [0, 100]}
          tickFormatter={(value) => metric === 'position' ? value : `${value}%`}
          dx={-10}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#111213',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px',
            boxShadow: '0 4px 18px rgba(0,0,0,0.22)',
          }}
          labelStyle={{ color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}
          itemStyle={{ padding: '2px 0' }}
          formatter={(value: any, name: string) => [
            value === null ? 'No data' : (metric === 'position' ? Number(value).toFixed(1) : `${Math.round(value)}%`),
            name
          ]}
        />
        <Legend 
          verticalAlign="top" 
          height={36}
          iconType="line"
          iconSize={10}
          wrapperStyle={{ fontSize: '11px', color: 'var(--text-muted)' }}
        />
        {charted.map((comp) => (
          <Line
            key={comp.name}
            type="monotone"
            dataKey={comp.name}
            stroke={comp.color}
            strokeWidth={comp.isUser ? 2 : 1.5}
            strokeDasharray={comp.isUser ? undefined : '4 4'}
            dot={false}
            activeDot={{ r: 3, fill: comp.color }}
            connectNulls={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}

// ============================================================================
// PROMPT MODAL COMPONENT
// ============================================================================

function PromptModal({ prompt, onClose }: { prompt: PromptExecution; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-card rounded-2xl shadow-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden flex flex-col border border-border">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-secondary">
          <div className="flex items-center gap-3">
            <img 
              src={prompt.modelLogo} 
              alt={prompt.modelName}
              className="w-8 h-8 rounded-lg"
            />
            <div>
              <span className="text-sm font-medium text-primary">{prompt.modelName}</span>
              <span className="mx-2 text-muted">•</span>
              <span className="text-sm text-muted">{prompt.topic}</span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-hover rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-muted" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Main content */}
          <div className="flex-1 overflow-y-auto p-6 bg-card">
            {/* User query */}
            <div className="flex items-start gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-hover flex items-center justify-center flex-shrink-0">
                <span className="text-sm">👤</span>
              </div>
              <div className="bg-hover rounded-2xl px-4 py-3 max-w-lg">
                <p className="text-primary">{prompt.prompt}</p>
              </div>
            </div>

            {/* AI response */}
            <div className="flex items-start gap-3">
              <img 
                src={prompt.modelLogo} 
                alt={prompt.modelName}
                className="w-8 h-8 rounded-lg flex-shrink-0"
              />
              <div className="flex-1 prose prose-sm max-w-none text-secondary">
                <div dangerouslySetInnerHTML={{ 
                  __html: prompt.responseText
                    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-primary">$1</strong>')
                }} />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-72 border-l border-border bg-secondary p-4 overflow-y-auto">
            {/* Brands section */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-primary mb-2 flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Brands
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {prompt.brands.map((brand, i) => (
                  <span 
                    key={i}
                    className="text-xs bg-card border border-border rounded-full px-2.5 py-1 text-secondary"
                  >
                    {brand}
                  </span>
                ))}
              </div>
            </div>

            {/* Sources section */}
            <div>
              <h4 className="text-sm font-medium text-primary mb-2 flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Sources
              </h4>
              <div className="space-y-2">
                {prompt.citationDomains.map((domain, i) => (
                  <a 
                    key={i}
                    href={`https://${domain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-secondary hover:text-accent transition-colors"
                  >
                    <img 
                      src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
                      alt=""
                      className="w-4 h-4 rounded-sm"
                    />
                    <span className="truncate">{domain}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}