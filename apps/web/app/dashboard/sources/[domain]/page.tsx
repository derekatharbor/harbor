// app/dashboard/sources/[domain]/page.tsx
// Source detail page - URLs and Chats for a specific domain

'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Globe,
  Link as LinkIcon,
  MessageSquare,
  ExternalLink,
  Check,
  X,
  Target,
  Mail,
  Copy,
} from 'lucide-react'
import MobileHeader from '@/components/layout/MobileHeader'
import { useBrand } from '@/contexts/BrandContext'

interface UrlData {
  url: string
  title?: string
  urlType: string
  brandMentioned: boolean
  mentions: number
  usedTotal: number
  avgCitations: number
}

interface ChatData {
  id: string
  prompt: string
  model: string
  response_snippet: string
  citations: number
  mentions: number
  sources: string[]
  executed_at: string
}

// Model logo helper
function ModelLogo({ model }: { model: string }) {
  const logos: Record<string, string> = {
    chatgpt: 'https://cdn.brandfetch.io/openai.com?c=1id1Fyz-h7an5-5KR_y',
    claude: 'https://cdn.brandfetch.io/anthropic.com?c=1id1Fyz-h7an5-5KR_y',
    perplexity: 'https://cdn.brandfetch.io/perplexity.ai?c=1id1Fyz-h7an5-5KR_y',
    gemini: 'https://cdn.brandfetch.io/gemini.google.com?c=1id1Fyz-h7an5-5KR_y',
  }
  
  return (
    <img 
      src={logos[model] || logos.chatgpt} 
      alt={model} 
      className="w-5 h-5 rounded object-contain"
    />
  )
}

// Get Brandfetch logo URL
function getBrandLogo(domain: string): string {
  const clean = domain.replace('www.', '')
  return `https://cdn.brandfetch.io/${clean}?c=1id1Fyz-h7an5-5KR_y`
}

// URL type badge
function UrlTypeBadge({ type }: { type: string }) {
  const colors: Record<string, string> = {
    listicle: 'bg-cyan-100 text-cyan-700',
    'how-to': 'bg-emerald-100 text-emerald-700',
    review: 'bg-purple-100 text-purple-700',
    comparison: 'bg-blue-100 text-blue-700',
    guide: 'bg-green-100 text-green-700',
    news: 'bg-orange-100 text-orange-700',
    other: 'bg-gray-100 text-gray-700'
  }
  
  const labels: Record<string, string> = {
    listicle: 'Listicle',
    'how-to': 'How-To',
    review: 'Review',
    comparison: 'Comparison',
    guide: 'Guide',
    news: 'News',
    other: 'Other'
  }
  
  return (
    <span className={`text-xs px-2 py-0.5 rounded font-medium ${colors[type] || colors.other}`}>
      {labels[type] || 'Other'}
    </span>
  )
}

// Brand mentioned badge - uses black/gray instead of green
function BrandMentionedBadge({ mentioned }: { mentioned: boolean }) {
  if (mentioned) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-gray-900 text-white text-xs font-medium">
        <Check className="w-3 h-3" /> Yes
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-100 text-red-600 text-xs font-medium">
      <X className="w-3 h-3" /> No
    </span>
  )
}

export default function SourceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const domain = decodeURIComponent(params.domain as string)
  const { currentDashboard } = useBrand()
  
  const [activeTab, setActiveTab] = useState<'urls' | 'chats'>('urls')
  const [urls, setUrls] = useState<UrlData[]>([])
  const [chats, setChats] = useState<ChatData[]>([])
  const [loading, setLoading] = useState(true)
  const [showPitchModal, setShowPitchModal] = useState(false)
  const [sourceStats, setSourceStats] = useState({
    totalCitations: 0,
    uniqueUrls: 0,
    brandMentioned: false,
    sourceType: 'other',
    authority: 'low' as 'high' | 'medium' | 'low'
  })
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')

  useEffect(() => {
    const savedTheme = localStorage.getItem('harbor-theme') as 'light' | 'dark' | null
    setTheme(savedTheme || 'dark')
    
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'data-theme') {
          setTheme(document.documentElement.getAttribute('data-theme') as 'light' | 'dark' || 'dark')
        }
      })
    })
    observer.observe(document.documentElement, { attributes: true })
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    fetchSourceDetail()
  }, [domain])

  const fetchSourceDetail = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/sources/${encodeURIComponent(domain)}`)
      if (res.ok) {
        const data = await res.json()
        setUrls(data.urls || [])
        setChats(data.chats || [])
        setSourceStats(data.stats || {})
      }
    } catch (err) {
      console.error('Failed to fetch source detail:', err)
    } finally {
      setLoading(false)
    }
  }

  const isDark = theme === 'dark'
  const colors = {
    bg: isDark ? '#0F1419' : '#FAFBFC',
    card: isDark ? '#1A1F26' : '#FFFFFF',
    text: isDark ? '#F9FAFB' : '#111827',
    muted: isDark ? '#6B7280' : '#9CA3AF',
    border: isDark ? 'rgba(255,255,255,0.08)' : '#E5E7EB',
    hover: isDark ? 'rgba(255,255,255,0.05)' : '#F3F4F6',
  }

  // Generate pitch template
  const generatePitch = () => {
    return `Hi there,

I noticed ${domain} has been covering [TOPIC] and wanted to reach out about ${currentDashboard?.brand_name || '[YOUR BRAND]'}.

We're a [BRIEF DESCRIPTION] that helps [TARGET AUDIENCE] with [KEY BENEFIT].

I think your readers would find value in:
• [ANGLE 1 - e.g., a comparison piece]
• [ANGLE 2 - e.g., expert insights]
• [ANGLE 3 - e.g., data/research]

Would you be open to a quick chat about potential collaboration?

Best,
[YOUR NAME]`
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.bg }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.bg }}>
      <MobileHeader />
      
      {/* Header */}
      <div style={{ backgroundColor: colors.card, borderBottom: `1px solid ${colors.border}` }}>
        <div className="px-6 py-4">
          {/* Breadcrumb */}
          <button
            onClick={() => router.push('/dashboard/sources')}
            className="flex items-center gap-2 mb-4 transition-colors cursor-pointer"
            style={{ color: colors.muted }}
            onMouseEnter={(e) => e.currentTarget.style.color = colors.text}
            onMouseLeave={(e) => e.currentTarget.style.color = colors.muted}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Sources</span>
          </button>
          
          {/* Domain Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img 
                src={getBrandLogo(domain)}
                alt=""
                className="w-12 h-12 rounded-lg object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`
                }}
              />
              <div>
                <h1 className="text-2xl font-heading font-bold" style={{ color: colors.text }}>
                  {domain}
                </h1>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-sm" style={{ color: colors.muted }}>
                    {sourceStats.totalCitations} citations
                  </span>
                  <span style={{ color: colors.border }}>•</span>
                  <span className="text-sm" style={{ color: colors.muted }}>
                    {sourceStats.uniqueUrls} URLs
                  </span>
                  <span style={{ color: colors.border }}>•</span>
                  {sourceStats.brandMentioned ? (
                    <span className="text-sm" style={{ color: colors.text }}>Your brand is mentioned</span>
                  ) : (
                    <span className="text-sm text-amber-500">Gap opportunity</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={`https://${domain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 transition-colors"
                style={{ 
                  backgroundColor: colors.hover,
                  color: colors.text,
                  border: `1px solid ${colors.border}`
                }}
              >
                <ExternalLink className="w-4 h-4" />
                Visit Site
              </a>
              
              {!sourceStats.brandMentioned && (
                <button
                  onClick={() => setShowPitchModal(true)}
                  className="px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 bg-gray-900 text-white hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  <Mail className="w-4 h-4" />
                  Draft Pitch
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 flex gap-1">
          <button
            onClick={() => setActiveTab('urls')}
            className="px-4 py-3 text-sm font-medium border-b-2 transition-colors cursor-pointer"
            style={{ 
              color: activeTab === 'urls' ? colors.text : colors.muted,
              borderColor: activeTab === 'urls' ? (isDark ? '#F9FAFB' : '#111827') : 'transparent'
            }}
          >
            <div className="flex items-center gap-2">
              <LinkIcon className="w-4 h-4" />
              URLs
            </div>
          </button>
          <button
            onClick={() => setActiveTab('chats')}
            className="px-4 py-3 text-sm font-medium border-b-2 transition-colors cursor-pointer"
            style={{ 
              color: activeTab === 'chats' ? colors.text : colors.muted,
              borderColor: activeTab === 'chats' ? (isDark ? '#F9FAFB' : '#111827') : 'transparent'
            }}
          >
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Chats
            </div>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'urls' ? (
          /* URLs Tab */
          <div 
            className="rounded-xl overflow-hidden"
            style={{ backgroundColor: colors.card, border: `1px solid ${colors.border}` }}
          >
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: `1px solid ${colors.border}` }}>
                  <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: colors.muted }}>URL</th>
                  <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: colors.muted }}>Type</th>
                  <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: colors.muted }}>
                    <div className="flex items-center gap-1">
                      {currentDashboard?.domain && (
                        <img 
                          src={getBrandLogo(currentDashboard.domain)}
                          alt=""
                          className="w-4 h-4 rounded object-contain"
                        />
                      )}
                      Mentioned
                    </div>
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: colors.muted }}>Used Total</th>
                  <th className="text-right px-4 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: colors.muted }}>Avg Citations</th>
                </tr>
              </thead>
              <tbody>
                {urls.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center" style={{ color: colors.muted }}>
                      No URL data available yet. Keep running prompts to collect more data.
                    </td>
                  </tr>
                ) : (
                  urls.map((url, i) => (
                    <tr 
                      key={i}
                      style={{ borderBottom: `1px solid ${colors.border}` }}
                    >
                      <td className="px-4 py-3">
                        <a
                          href={url.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-start gap-2 group"
                        >
                          <img 
                            src={getBrandLogo(domain)}
                            alt=""
                            className="w-4 h-4 rounded mt-0.5 flex-shrink-0 object-contain"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`
                            }}
                          />
                          <div className="min-w-0">
                            <div className="font-medium truncate max-w-md group-hover:underline transition-colors" style={{ color: colors.text }}>
                              {url.title || url.url.split('/').pop() || url.url}
                            </div>
                            <div className="text-xs truncate max-w-md" style={{ color: colors.muted }}>
                              {url.url}
                            </div>
                          </div>
                        </a>
                      </td>
                      <td className="px-4 py-3">
                        <UrlTypeBadge type={url.urlType} />
                      </td>
                      <td className="px-4 py-3">
                        <BrandMentionedBadge mentioned={url.brandMentioned} />
                      </td>
                      <td className="px-4 py-3 text-right text-sm" style={{ color: colors.text }}>
                        {url.usedTotal}
                      </td>
                      <td className="px-4 py-3 text-right text-sm" style={{ color: colors.text }}>
                        {url.avgCitations.toFixed(1)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          /* Chats Tab */
          <div 
            className="rounded-xl overflow-hidden"
            style={{ backgroundColor: colors.card, border: `1px solid ${colors.border}` }}
          >
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: `1px solid ${colors.border}` }}>
                  <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: colors.muted }}>Chat</th>
                  <th className="text-right px-4 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: colors.muted }}>Citations</th>
                  <th className="text-right px-4 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: colors.muted }}>Mentions</th>
                  <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: colors.muted }}>Sources</th>
                  <th className="text-right px-4 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: colors.muted }}>Created</th>
                </tr>
              </thead>
              <tbody>
                {chats.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center" style={{ color: colors.muted }}>
                      No chat data available yet. Keep running prompts to collect more data.
                    </td>
                  </tr>
                ) : (
                  chats.map((chat) => (
                    <tr 
                      key={chat.id}
                      className="cursor-pointer transition-colors"
                      style={{ borderBottom: `1px solid ${colors.border}` }}
                      onClick={() => router.push(`/dashboard/prompts/${chat.id}`)}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.hover}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-start gap-3">
                          <ModelLogo model={chat.model} />
                          <div className="min-w-0">
                            <div className="font-medium text-sm" style={{ color: colors.text }}>
                              {chat.prompt}
                            </div>
                            <div className="text-sm mt-1 line-clamp-2" style={{ color: colors.muted }}>
                              {chat.response_snippet}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right text-sm" style={{ color: colors.text }}>
                        {chat.citations}
                      </td>
                      <td className="px-4 py-3 text-right text-sm" style={{ color: colors.text }}>
                        {chat.mentions}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {chat.sources.slice(0, 4).map((src, i) => (
                            <img 
                              key={i}
                              src={getBrandLogo(src)}
                              alt=""
                              className="w-4 h-4 rounded object-contain"
                              title={src}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = `https://www.google.com/s2/favicons?domain=${src}&sz=32`
                              }}
                            />
                          ))}
                          {chat.sources.length > 4 && (
                            <span className="text-xs" style={{ color: colors.muted }}>
                              +{chat.sources.length - 4}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right text-sm" style={{ color: colors.muted }}>
                        {new Date(chat.executed_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pitch Modal */}
      {showPitchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowPitchModal(false)}
          />
          <div 
            className="relative rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden"
            style={{ backgroundColor: colors.card, border: `1px solid ${colors.border}` }}
          >
            <div 
              className="flex items-center justify-between px-6 py-4"
              style={{ borderBottom: `1px solid ${colors.border}` }}
            >
              <div className="flex items-center gap-3">
                <Target className="w-5 h-5" style={{ color: colors.text }} />
                <h2 className="font-semibold" style={{ color: colors.text }}>
                  Draft Pitch for {domain}
                </h2>
              </div>
              <button 
                onClick={() => setShowPitchModal(false)}
                className="p-1 rounded-lg transition-colors cursor-pointer"
                style={{ color: colors.muted }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <p className="text-sm mb-4" style={{ color: colors.muted }}>
                Here's a template to get you started. Customize it based on the content types 
                that work best on this source.
              </p>
              
              <textarea
                className="w-full h-64 p-4 rounded-lg text-sm font-mono resize-none outline-none"
                style={{ 
                  backgroundColor: colors.hover,
                  color: colors.text,
                  border: `1px solid ${colors.border}`
                }}
                defaultValue={generatePitch()}
              />
              
              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(generatePitch())
                  }}
                  className="px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors cursor-pointer"
                  style={{ 
                    backgroundColor: colors.hover,
                    color: colors.text,
                    border: `1px solid ${colors.border}`
                  }}
                >
                  <Copy className="w-4 h-4" />
                  Copy
                </button>
                <button
                  onClick={() => setShowPitchModal(false)}
                  className="px-4 py-2 rounded-lg text-sm bg-gray-900 text-white hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}