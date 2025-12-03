// apps/web/app/dashboard/prompts/page.tsx
// Prompts Management - Track queries to monitor AI visibility

'use client'

import { useState, useEffect } from 'react'
import { 
  MessageSquare, 
  Plus, 
  Search, 
  Download,
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
  Trash2,
  Edit3,
  Eye,
  TrendingUp,
  TrendingDown,
  Minus,
  X,
  Folder,
  Sparkles
} from 'lucide-react'
import { useBrand } from '@/contexts/BrandContext'
import MobileHeader from '@/components/layout/MobileHeader'

interface Prompt {
  id: string
  prompt_text: string
  topic_id: string | null
  topic_name?: string
  status: 'active' | 'inactive' | 'suggested'
  visibility_score: number
  sentiment: 'positive' | 'neutral' | 'negative' | null
  position: number | null
  mentions: number
  volume: number // 0-100 bar indicator
  last_run?: string
}

interface Topic {
  id: string
  name: string
  color: string
  prompt_count: number
  avg_visibility: number
}

interface PromptSuggestion {
  id: string
  prompt_text: string
  topic_name: string
  popularity_score: number
}

type TabId = 'active' | 'suggested' | 'inactive'

// Volume bar component (like Peec's)
function VolumeBar({ value }: { value: number }) {
  const bars = 5
  const filled = Math.round((value / 100) * bars)
  
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: bars }).map((_, i) => (
        <div
          key={i}
          className={`w-1.5 h-4 rounded-sm ${
            i < filled ? 'bg-chart-2' : 'bg-secondary'
          }`}
        />
      ))}
    </div>
  )
}

// Sentiment indicator
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
      <span className={`text-xs capitalize ${color}`}>{sentiment}</span>
    </div>
  )
}

export default function PromptsPage() {
  const { currentDashboard, isLoading: brandLoading } = useBrand()
  
  const [activeTab, setActiveTab] = useState<TabId>('active')
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [topics, setTopics] = useState<Topic[]>([])
  const [suggestions, setSuggestions] = useState<PromptSuggestion[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set())
  const [showAddPromptModal, setShowAddPromptModal] = useState(false)
  const [showAddTopicModal, setShowAddTopicModal] = useState(false)
  const [newPromptText, setNewPromptText] = useState('')
  const [newPromptTopic, setNewPromptTopic] = useState<string | null>(null)
  const [newTopicName, setNewTopicName] = useState('')
  
  // Plan limits
  const getPromptLimit = () => {
    const limits: Record<string, number> = { solo: 25, agency: 100, enterprise: 999 }
    return limits[currentDashboard?.plan || 'solo'] || 25
  }

  // Fetch prompts data
  useEffect(() => {
    if (!currentDashboard?.id) return
    
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/dashboard/${currentDashboard.id}/prompts`)
        if (res.ok) {
          const data = await res.json()
          setPrompts(data.prompts || [])
          setTopics(data.topics || [])
          setSuggestions(data.suggestions || [])
        }
      } catch (err) {
        console.error('Failed to fetch prompts:', err)
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [currentDashboard?.id])

  // Toggle topic expansion
  const toggleTopic = (topicId: string) => {
    const newExpanded = new Set(expandedTopics)
    if (newExpanded.has(topicId)) {
      newExpanded.delete(topicId)
    } else {
      newExpanded.add(topicId)
    }
    setExpandedTopics(newExpanded)
  }

  // Add new prompt
  const addPrompt = async () => {
    if (!currentDashboard?.id || !newPromptText.trim()) return
    
    try {
      const res = await fetch(`/api/dashboard/${currentDashboard.id}/prompts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt_text: newPromptText.trim(),
          topic_id: newPromptTopic
        })
      })
      
      if (res.ok) {
        const data = await res.json()
        setPrompts(prev => [...prev, data.prompt])
        setNewPromptText('')
        setNewPromptTopic(null)
        setShowAddPromptModal(false)
      }
    } catch (err) {
      console.error('Failed to add prompt:', err)
    }
  }

  // Add new topic
  const addTopic = async () => {
    if (!currentDashboard?.id || !newTopicName.trim()) return
    
    try {
      const res = await fetch(`/api/dashboard/${currentDashboard.id}/prompts/topics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newTopicName.trim() })
      })
      
      if (res.ok) {
        const data = await res.json()
        setTopics(prev => [...prev, data.topic])
        setNewTopicName('')
        setShowAddTopicModal(false)
      }
    } catch (err) {
      console.error('Failed to add topic:', err)
    }
  }

  // Accept suggestion
  const acceptSuggestion = async (suggestion: PromptSuggestion) => {
    if (!currentDashboard?.id) return
    
    try {
      const res = await fetch(`/api/dashboard/${currentDashboard.id}/prompts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt_text: suggestion.prompt_text,
          topic_name: suggestion.topic_name,
          source: 'suggested'
        })
      })
      
      if (res.ok) {
        const data = await res.json()
        setPrompts(prev => [...prev, data.prompt])
        setSuggestions(prev => prev.filter(s => s.id !== suggestion.id))
      }
    } catch (err) {
      console.error('Failed to accept suggestion:', err)
    }
  }

  // Filter prompts by tab and search
  const filteredPrompts = prompts.filter(p => {
    const matchesTab = p.status === activeTab
    const matchesSearch = !searchQuery || 
      p.prompt_text.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesTab && matchesSearch
  })

  // Group prompts by topic
  const groupedPrompts = filteredPrompts.reduce((acc, prompt) => {
    const topicId = prompt.topic_id || 'no-topic'
    if (!acc[topicId]) {
      acc[topicId] = []
    }
    acc[topicId].push(prompt)
    return acc
  }, {} as Record<string, Prompt[]>)

  // Get topic info
  const getTopicInfo = (topicId: string) => {
    if (topicId === 'no-topic') {
      return { name: 'No Topic', color: '#6B7280' }
    }
    const topic = topics.find(t => t.id === topicId)
    return topic || { name: 'Unknown', color: '#6B7280' }
  }

  const activeCount = prompts.filter(p => p.status === 'active').length
  const totalLimit = getPromptLimit()

  if (loading || brandLoading) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-chart-1"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-primary">
      <MobileHeader />
      
      {/* Header */}
      <div className="border-b border-border bg-primary">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-5 h-5 text-muted" strokeWidth={1.5} />
              <h1 className="text-xl font-semibold text-primary">Prompts</h1>
              <span className="text-sm text-muted">
                · {activeCount} / {totalLimit} Prompts
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAddTopicModal(true)}
                className="px-4 py-2 text-sm font-medium text-secondary hover:text-primary border border-border hover:border-primary/20 rounded-lg transition-colors cursor-pointer"
              >
                Add Topic
              </button>
              <button
                onClick={() => setShowAddPromptModal(true)}
                disabled={activeCount >= totalLimit}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeCount >= totalLimit
                    ? 'bg-secondary text-muted cursor-not-allowed'
                    : 'bg-[#1a1a1a] dark:bg-white text-white dark:text-[#1a1a1a] hover:opacity-80 cursor-pointer'
                }`}
              >
                <Plus className="w-4 h-4" />
                Add Prompt
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-6">
            {(['active', 'suggested', 'inactive'] as TabId[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 text-sm font-medium border-b-2 -mb-px transition-colors cursor-pointer capitalize ${
                  activeTab === tab
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted hover:text-secondary'
                }`}
              >
                {tab}
                {tab === 'active' && ` (${activeCount})`}
                {tab === 'suggested' && ` (${suggestions.length})`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="px-6 py-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <select className="px-3 py-1.5 text-sm bg-secondary border border-border rounded-lg text-primary cursor-pointer">
            <option>All Models</option>
            <option>ChatGPT</option>
            <option>Claude</option>
            <option>Gemini</option>
            <option>Perplexity</option>
          </select>
          <select className="px-3 py-1.5 text-sm bg-secondary border border-border rounded-lg text-primary cursor-pointer">
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last 90 days</option>
          </select>
          <select className="px-3 py-1.5 text-sm bg-secondary border border-border rounded-lg text-primary cursor-pointer">
            <option>Group by Topic</option>
            <option>No Grouping</option>
          </select>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search prompts..."
              className="pl-9 pr-4 py-1.5 text-sm bg-secondary border border-border rounded-lg text-primary placeholder-muted w-64 focus:outline-none focus:ring-2 focus:ring-chart-1/50"
            />
          </div>
          <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-muted hover:text-primary border border-border rounded-lg transition-colors cursor-pointer">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'suggested' ? (
          // Suggested prompts view
          <div className="space-y-4">
            {suggestions.length === 0 ? (
              <div className="text-center py-12">
                <Sparkles className="w-12 h-12 text-muted mx-auto mb-4" />
                <h3 className="text-lg font-medium text-primary mb-2">No suggestions available</h3>
                <p className="text-sm text-muted">We'll suggest prompts based on your category and activity.</p>
              </div>
            ) : (
              suggestions.map((suggestion) => (
                <div 
                  key={suggestion.id}
                  className="card p-4 flex items-center justify-between hover:border-primary/20 transition-all"
                >
                  <div className="flex-1">
                    <p className="text-primary">{suggestion.prompt_text}</p>
                    <p className="text-sm text-muted mt-1">{suggestion.topic_name}</p>
                  </div>
                  <button
                    onClick={() => acceptSuggestion(suggestion)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-[#1a1a1a] dark:bg-white text-white dark:text-[#1a1a1a] text-sm font-medium rounded-lg hover:opacity-80 transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add
                  </button>
                </div>
              ))
            )}
          </div>
        ) : (
          // Active/Inactive prompts table
          <div className="card overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-border bg-secondary/30 text-xs text-muted font-medium uppercase tracking-wide">
              <div className="col-span-5 flex items-center gap-2">
                <input type="checkbox" className="rounded border-border" />
                Prompt
              </div>
              <div className="col-span-1 flex items-center gap-1">
                <Eye className="w-3 h-3" />
                Visibility
              </div>
              <div className="col-span-2 flex items-center gap-1">
                Sentiment
              </div>
              <div className="col-span-1">Position</div>
              <div className="col-span-1">Mentions</div>
              <div className="col-span-2 flex items-center gap-1">
                Volume
                <span className="text-[10px] px-1.5 py-0.5 bg-chart-1/20 text-chart-1 rounded">Beta</span>
              </div>
            </div>

            {/* Table Body */}
            {Object.entries(groupedPrompts).length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="w-12 h-12 text-muted mx-auto mb-4" />
                <h3 className="text-lg font-medium text-primary mb-2">No prompts yet</h3>
                <p className="text-sm text-muted mb-6">Add prompts to track how your brand appears in AI responses.</p>
                <button
                  onClick={() => setShowAddPromptModal(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1a1a1a] dark:bg-white text-white dark:text-[#1a1a1a] rounded-lg text-sm font-medium hover:opacity-80 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Add Your First Prompt
                </button>
              </div>
            ) : (
              Object.entries(groupedPrompts).map(([topicId, topicPrompts]) => {
                const topicInfo = getTopicInfo(topicId)
                const isExpanded = expandedTopics.has(topicId)
                const avgVisibility = Math.round(
                  topicPrompts.reduce((sum, p) => sum + p.visibility_score, 0) / topicPrompts.length
                )
                
                return (
                  <div key={topicId}>
                    {/* Topic Row */}
                    <div 
                      className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-border hover:bg-secondary/20 cursor-pointer transition-colors"
                      onClick={() => toggleTopic(topicId)}
                    >
                      <div className="col-span-5 flex items-center gap-3">
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-muted" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-muted" />
                        )}
                        <div>
                          <span className="font-medium text-primary">{topicInfo.name}</span>
                          <span className="text-muted ml-2">{topicPrompts.length} prompts</span>
                        </div>
                        <button className="p-1 hover:bg-secondary rounded opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreHorizontal className="w-4 h-4 text-muted" />
                        </button>
                      </div>
                      <div className="col-span-1 text-primary">{avgVisibility}%</div>
                      <div className="col-span-2 text-muted">—</div>
                      <div className="col-span-1 text-muted">—</div>
                      <div className="col-span-1 text-muted">—</div>
                      <div className="col-span-2"></div>
                    </div>

                    {/* Expanded Prompts */}
                    {isExpanded && topicPrompts.map((prompt) => (
                      <div 
                        key={prompt.id}
                        className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-border hover:bg-secondary/10 transition-colors group"
                      >
                        <div className="col-span-5 flex items-center gap-3 pl-7">
                          <input type="checkbox" className="rounded border-border" />
                          <span className="text-primary">{prompt.prompt_text}</span>
                        </div>
                        <div className="col-span-1 text-primary">{prompt.visibility_score}%</div>
                        <div className="col-span-2">
                          <SentimentBadge sentiment={prompt.sentiment} />
                        </div>
                        <div className="col-span-1 text-primary">
                          {prompt.position ? `#${prompt.position}` : '—'}
                        </div>
                        <div className="col-span-1 text-primary">
                          {prompt.mentions || '—'}
                        </div>
                        <div className="col-span-2">
                          <VolumeBar value={prompt.volume} />
                        </div>
                      </div>
                    ))}
                  </div>
                )
              })
            )}
          </div>
        )}

        {/* Upgrade CTA */}
        {activeCount >= totalLimit - 5 && (
          <div className="mt-6 flex items-center justify-between text-sm text-muted">
            <span>Using {activeCount} of {totalLimit} prompts</span>
            <a href="/pricing" className="text-chart-1 hover:underline font-medium">
              Need more? Upgrade →
            </a>
          </div>
        )}
      </div>

      {/* Add Prompt Modal */}
      {showAddPromptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowAddPromptModal(false)}
          />
          <div className="relative bg-card border border-border rounded-xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h3 className="text-lg font-semibold text-primary">Add Prompt</h3>
              <button
                onClick={() => setShowAddPromptModal(false)}
                className="p-2 rounded-lg hover:bg-secondary text-muted hover:text-primary transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Prompt Text
                </label>
                <textarea
                  value={newPromptText}
                  onChange={(e) => setNewPromptText(e.target.value)}
                  placeholder="e.g., Best project management tools for remote teams"
                  className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-primary placeholder-muted resize-none h-24 focus:outline-none focus:ring-2 focus:ring-chart-1/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Topic (optional)
                </label>
                <select
                  value={newPromptTopic || ''}
                  onChange={(e) => setNewPromptTopic(e.target.value || null)}
                  className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-primary cursor-pointer focus:outline-none focus:ring-2 focus:ring-chart-1/50"
                >
                  <option value="">No topic</option>
                  {topics.map((topic) => (
                    <option key={topic.id} value={topic.id}>{topic.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-5 border-t border-border">
              <button
                onClick={() => setShowAddPromptModal(false)}
                className="px-4 py-2 text-sm font-medium text-muted hover:text-primary transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={addPrompt}
                disabled={!newPromptText.trim()}
                className="px-4 py-2 bg-[#1a1a1a] dark:bg-white text-white dark:text-[#1a1a1a] text-sm font-medium rounded-lg hover:opacity-80 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Prompt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Topic Modal */}
      {showAddTopicModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowAddTopicModal(false)}
          />
          <div className="relative bg-card border border-border rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h3 className="text-lg font-semibold text-primary">Add Topic</h3>
              <button
                onClick={() => setShowAddTopicModal(false)}
                className="p-2 rounded-lg hover:bg-secondary text-muted hover:text-primary transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5">
              <label className="block text-sm font-medium text-primary mb-2">
                Topic Name
              </label>
              <input
                type="text"
                value={newTopicName}
                onChange={(e) => setNewTopicName(e.target.value)}
                placeholder="e.g., Product Discovery"
                className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-chart-1/50"
              />
            </div>

            <div className="flex items-center justify-end gap-3 p-5 border-t border-border">
              <button
                onClick={() => setShowAddTopicModal(false)}
                className="px-4 py-2 text-sm font-medium text-muted hover:text-primary transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={addTopic}
                disabled={!newTopicName.trim()}
                className="px-4 py-2 bg-[#1a1a1a] dark:bg-white text-white dark:text-[#1a1a1a] text-sm font-medium rounded-lg hover:opacity-80 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Topic
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
