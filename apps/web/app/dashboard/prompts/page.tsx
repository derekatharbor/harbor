// apps/web/app/dashboard/prompts/page.tsx
// Prompts Management - Improved design beating Peec

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  MessageSquare, 
  Plus, 
  Search, 
  Upload,
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
  TrendingUp,
  TrendingDown,
  Minus,
  X,
  Sparkles,
  Calendar,
  Layers,
  Tag,
  Check,
  Clock,
  Pause,
  Play,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react'
import { useBrand } from '@/contexts/BrandContext'
import MobileHeader from '@/components/layout/MobileHeader'

// ============================================================================
// TYPES
// ============================================================================

interface Prompt {
  id: string
  prompt_text: string
  topic: string | null
  status: 'active' | 'inactive' | 'suggested'
  visibility_score: number
  sentiment: 'positive' | 'neutral' | 'negative' | null
  position: number | null
  mentions: number
  volume: number
  last_executed_at?: string | null
  source: 'onboarding' | 'user' | 'seed'
  models_found?: string[] // Which AI models mention the user's brand
}

interface TopicGroup {
  name: string
  prompts: Prompt[]
  isExpanded: boolean
}

type TabId = 'active' | 'suggested' | 'inactive'

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

// Volume bar component
function VolumeBar({ value }: { value: number }) {
  const bars = 5
  const filled = Math.round((value / 100) * bars)
  
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: bars }).map((_, i) => (
        <div
          key={i}
          className={`w-1.5 h-4 rounded-sm transition-colors ${
            i < filled ? 'bg-accent' : 'bg-hover'
          }`}
        />
      ))}
    </div>
  )
}

// Time ago formatter
function timeAgo(dateString: string | null | undefined): string {
  if (!dateString) return 'Never'
  
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function PromptsPage() {
  const router = useRouter()
  const { currentDashboard, isLoading: brandLoading } = useBrand()
  
  // State
  const [activeTab, setActiveTab] = useState<TabId>('active')
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [suggestedPrompts, setSuggestedPrompts] = useState<Prompt[]>([])
  const [inactivePrompts, setInactivePrompts] = useState<Prompt[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set())
  const [selectedPrompts, setSelectedPrompts] = useState<Set<string>>(new Set())
  const [showAddModal, setShowAddModal] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  
  // Add prompt form
  const [newPromptText, setNewPromptText] = useState('')
  const [newPromptTopic, setNewPromptTopic] = useState('')
  
  // Plan limits
  const promptLimit = currentDashboard?.plan === 'agency' ? 100 : 
                      currentDashboard?.plan === 'enterprise' ? 999 : 25

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  const fetchPrompts = async () => {
    if (!currentDashboard?.id) return
    
    try {
      setLoading(true)
      const params = new URLSearchParams({ dashboard_id: currentDashboard.id })
      
      const res = await fetch(`/api/prompts/list?${params}`)
      if (res.ok) {
        const data = await res.json()
        
        // Active = prompts from onboarding + user-added
        setPrompts(data.prompts || [])
        
        // Suggested = seed prompts not yet tracked
        setSuggestedPrompts(data.all_suggested || [])
        
        // Inactive = paused prompts (TODO: implement pause feature)
        setInactivePrompts([])
        
        // Auto-expand first topic
        const topics = [...new Set((data.prompts || []).map((p: Prompt) => p.topic || 'No Topic'))]
        if (topics.length > 0) {
          setExpandedTopics(new Set([topics[0]]))
        }
      }
    } catch (err) {
      console.error('Failed to fetch prompts:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPrompts()
  }, [currentDashboard?.id])

  // ============================================================================
  // ACTIONS
  // ============================================================================

  const trackPrompt = async (promptId: string) => {
    if (!currentDashboard?.id) return
    
    setActionLoading(promptId)
    try {
      const res = await fetch('/api/prompts/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dashboard_id: currentDashboard.id,
          prompt_id: promptId
        })
      })
      
      if (res.ok) {
        // Move from suggested to active
        const prompt = suggestedPrompts.find(p => p.id === promptId)
        if (prompt) {
          setSuggestedPrompts(prev => prev.filter(p => p.id !== promptId))
          setPrompts(prev => [...prev, { ...prompt, status: 'active', source: 'onboarding' }])
        }
      }
    } catch (err) {
      console.error('Failed to track prompt:', err)
    } finally {
      setActionLoading(null)
    }
  }

  const dismissPrompt = async (promptId: string) => {
    // Just remove from UI for now (could persist to dismissed_prompts table later)
    setSuggestedPrompts(prev => prev.filter(p => p.id !== promptId))
  }

  const trackSelected = async () => {
    const toTrack = Array.from(selectedPrompts)
    for (const id of toTrack) {
      await trackPrompt(id)
    }
    setSelectedPrompts(new Set())
  }

  const pausePrompt = async (promptId: string) => {
    // Move to inactive
    const prompt = prompts.find(p => p.id === promptId)
    if (prompt) {
      setPrompts(prev => prev.filter(p => p.id !== promptId))
      setInactivePrompts(prev => [...prev, { ...prompt, status: 'inactive' }])
    }
  }

  const resumePrompt = async (promptId: string) => {
    // Move back to active
    const prompt = inactivePrompts.find(p => p.id === promptId)
    if (prompt) {
      setInactivePrompts(prev => prev.filter(p => p.id !== promptId))
      setPrompts(prev => [...prev, { ...prompt, status: 'active' }])
    }
  }

  const addPrompt = async () => {
    if (!newPromptText.trim() || !currentDashboard?.id) return
    
    setActionLoading('add')
    try {
      const res = await fetch('/api/prompts/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dashboard_id: currentDashboard.id,
          prompt_text: newPromptText.trim(),
          topic: newPromptTopic || null
        })
      })
      
      if (res.ok) {
        setNewPromptText('')
        setNewPromptTopic('')
        setShowAddModal(false)
        fetchPrompts()
      }
    } catch (err) {
      console.error('Failed to add prompt:', err)
    } finally {
      setActionLoading(null)
    }
  }

  // ============================================================================
  // FILTERING & GROUPING
  // ============================================================================

  const currentPrompts = activeTab === 'suggested' ? suggestedPrompts : 
                         activeTab === 'inactive' ? inactivePrompts : prompts
  
  const filteredPrompts = currentPrompts.filter(p => {
    if (!searchQuery) return true
    return p.prompt_text.toLowerCase().includes(searchQuery.toLowerCase())
  })

  // Group by topic
  const groupedByTopic: TopicGroup[] = Object.entries(
    filteredPrompts.reduce((acc, prompt) => {
      const topic = prompt.topic || 'No Topic'
      if (!acc[topic]) acc[topic] = []
      acc[topic].push(prompt)
      return acc
    }, {} as Record<string, Prompt[]>)
  ).map(([name, prompts]) => ({
    name,
    prompts,
    isExpanded: expandedTopics.has(name)
  })).sort((a, b) => {
    if (a.name === 'No Topic') return 1
    if (b.name === 'No Topic') return -1
    return a.name.localeCompare(b.name)
  })

  const toggleTopic = (topicName: string) => {
    setExpandedTopics(prev => {
      const next = new Set(prev)
      if (next.has(topicName)) {
        next.delete(topicName)
      } else {
        next.add(topicName)
      }
      return next
    })
  }

  const toggleSelectPrompt = (promptId: string) => {
    setSelectedPrompts(prev => {
      const next = new Set(prev)
      if (next.has(promptId)) {
        next.delete(promptId)
      } else {
        next.add(promptId)
      }
      return next
    })
  }

  const selectAllInTopic = (topicPrompts: Prompt[]) => {
    setSelectedPrompts(prev => {
      const next = new Set(prev)
      topicPrompts.forEach(p => next.add(p.id))
      return next
    })
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="min-h-screen bg-page">
      <MobileHeader />
      
      {/* Header */}
      <div className="px-6 py-4 border-b border-border bg-card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-5 h-5 text-muted" />
            <h1 className="text-lg font-semibold text-primary">Prompts</h1>
            <span className="text-sm text-muted">
              · {prompts.length} / {promptLimit} Prompts
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowAddModal(true)}
              className="btn-secondary text-sm"
            >
              Add Topic
            </button>
            <button 
              onClick={() => setShowAddModal(true)}
              className="btn-primary text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Prompt
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1">
          {(['active', 'suggested', 'inactive'] as TabId[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === tab
                  ? 'bg-secondary text-primary'
                  : 'text-muted hover:text-secondary'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab === 'active' && prompts.length > 0 && (
                <span className="ml-1.5 text-xs text-muted">({prompts.length})</span>
              )}
              {tab === 'suggested' && suggestedPrompts.length > 0 && (
                <span className="ml-1.5 text-xs text-muted">({suggestedPrompts.length})</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Suggested Banner */}
      {activeTab === 'suggested' && (
        <div className="mx-6 mt-4 p-4 card flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-accent" />
            <div>
              <span className="font-medium text-primary">Suggested prompts.</span>
              <span className="text-secondary ml-1">Expand your brand's presence with prompts relevant to your industry.</span>
            </div>
          </div>
          {selectedPrompts.size > 0 && (
            <button 
              onClick={trackSelected}
              className="btn-primary text-sm"
            >
              Track {selectedPrompts.size} Selected
            </button>
          )}
        </div>
      )}

      {/* Search & Filters */}
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Bulk selection info */}
          {selectedPrompts.size > 0 && activeTab === 'suggested' && (
            <div className="flex items-center gap-2 text-sm text-secondary">
              <Check className="w-4 h-4 text-accent" />
              {selectedPrompts.size} selected
              <button 
                onClick={() => setSelectedPrompts(new Set())}
                className="text-muted hover:text-primary ml-2"
              >
                Clear
              </button>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search"
              className="input pl-9 w-48"
            />
          </div>
          <button className="btn-secondary text-sm">
            <Upload className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="mx-6 mb-6 card p-0 overflow-hidden">
        {/* Table Header */}
        <div className={`grid ${activeTab === 'suggested' ? 'grid-cols-[auto,1fr,100px,140px]' : 'grid-cols-[auto,1fr,80px,80px,100px,100px]'} gap-4 px-4 py-3 bg-secondary border-b border-border text-xs font-medium text-muted uppercase tracking-wide`}>
          <div className="w-6">
            {activeTab === 'suggested' && (
              <input 
                type="checkbox" 
                className="rounded border-border"
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedPrompts(new Set(filteredPrompts.map(p => p.id)))
                  } else {
                    setSelectedPrompts(new Set())
                  }
                }}
                checked={selectedPrompts.size === filteredPrompts.length && filteredPrompts.length > 0}
              />
            )}
          </div>
          <div className="flex items-center gap-1">
            Prompt
            <ChevronDown className="w-3 h-3" />
          </div>
          {activeTab === 'suggested' ? (
            <>
              <div>Volume</div>
              <div>Actions</div>
            </>
          ) : (
            <>
              <div>Visibility</div>
              <div>Sentiment</div>
              <div>Last Checked</div>
              <div>Volume</div>
            </>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="p-8 text-center">
            <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-muted">Loading prompts...</p>
          </div>
        ) : filteredPrompts.length === 0 ? (
          <div className="p-12 text-center">
            <MessageSquare className="w-12 h-12 text-muted mx-auto mb-4 opacity-40" />
            <h3 className="font-medium text-primary mb-1">
              {activeTab === 'active' ? 'No prompts yet' : 
               activeTab === 'suggested' ? 'No suggestions available' :
               'No inactive prompts'}
            </h3>
            <p className="text-sm text-muted mb-4">
              {activeTab === 'active' 
                ? 'Add prompts to track how your brand appears in AI responses.'
                : activeTab === 'suggested'
                ? 'Check back later for new prompt suggestions.'
                : 'Paused prompts will appear here.'}
            </p>
            {activeTab === 'active' && (
              <button 
                onClick={() => setShowAddModal(true)}
                className="btn-primary"
              >
                <Plus className="w-4 h-4" />
                Add Your First Prompt
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-border">
            {groupedByTopic.map(group => (
              <div key={group.name}>
                {/* Topic Header */}
                <button
                  onClick={() => toggleTopic(group.name)}
                  className="w-full grid grid-cols-[auto,1fr,auto] gap-4 px-4 py-3 hover:bg-hover transition-colors text-left"
                >
                  <div className="w-6 flex items-center">
                    {group.isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-muted" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-muted" />
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-primary">{group.name}</span>
                    <span className="text-sm text-muted">{group.prompts.length} prompts</span>
                  </div>
                  {activeTab === 'suggested' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        selectAllInTopic(group.prompts)
                      }}
                      className="text-xs text-muted hover:text-primary transition-colors"
                    >
                      Select all
                    </button>
                  )}
                </button>

                {/* Prompts in Topic */}
                {group.isExpanded && (
                  <div className="bg-card">
                    {group.prompts.map(prompt => (
                      <div 
                        key={prompt.id}
                        className={`group grid ${activeTab === 'suggested' ? 'grid-cols-[auto,1fr,100px,140px]' : 'grid-cols-[auto,1fr,80px,80px,100px,100px]'} gap-4 px-4 py-3 border-t border-border hover:bg-hover transition-colors`}
                      >
                        {/* Checkbox */}
                        <div className="w-6 flex items-center">
                          {activeTab === 'suggested' ? (
                            <input 
                              type="checkbox"
                              checked={selectedPrompts.has(prompt.id)}
                              onChange={() => toggleSelectPrompt(prompt.id)}
                              className="rounded border-border"
                            />
                          ) : (
                            <div className="w-4 h-4 rounded border border-border opacity-0 group-hover:opacity-100 transition-opacity" />
                          )}
                        </div>

                        {/* Prompt Text */}
                        <div className="flex items-center">
                          <span className="text-sm text-secondary">{prompt.prompt_text}</span>
                        </div>

                        {activeTab === 'suggested' ? (
                          <>
                            {/* Volume */}
                            <div className="flex items-center">
                              <VolumeBar value={prompt.volume} />
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => trackPrompt(prompt.id)}
                                disabled={actionLoading === prompt.id}
                                className="px-3 py-1.5 bg-accent text-white text-xs font-medium rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50"
                              >
                                {actionLoading === prompt.id ? '...' : 'Track'}
                              </button>
                              <button
                                onClick={() => dismissPrompt(prompt.id)}
                                className="px-3 py-1.5 text-muted text-xs font-medium rounded-lg hover:bg-secondary transition-colors"
                              >
                                Dismiss
                              </button>
                            </div>
                          </>
                        ) : (
                          <>
                            {/* Visibility */}
                            <div className="flex items-center">
                              <span className={`text-sm ${prompt.visibility_score > 0 ? 'text-primary' : 'text-muted'}`}>
                                {prompt.visibility_score}%
                              </span>
                            </div>

                            {/* Sentiment */}
                            <div className="flex items-center">
                              {prompt.sentiment ? (
                                <span className={`text-sm ${
                                  prompt.sentiment === 'positive' ? 'text-green-500' :
                                  prompt.sentiment === 'negative' ? 'text-red-400' : 'text-muted'
                                }`}>
                                  {prompt.sentiment === 'positive' ? '+' : prompt.sentiment === 'negative' ? '-' : '~'}
                                </span>
                              ) : (
                                <span className="text-sm text-muted">—</span>
                              )}
                            </div>

                            {/* Last Checked */}
                            <div className="flex items-center">
                              <span className="text-xs text-muted">
                                {prompt.last_executed_at ? timeAgo(prompt.last_executed_at) : 'Pending'}
                              </span>
                            </div>

                            {/* Volume */}
                            <div className="flex items-center justify-between">
                              <VolumeBar value={prompt.volume} />
                              
                              {/* Row Actions (on hover) */}
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="p-1 hover:bg-secondary rounded">
                                  <MoreHorizontal className="w-4 h-4 text-muted" />
                                </button>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Prompt Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowAddModal(false)}
          />
          <div className="relative bg-card rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-border">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 className="text-lg font-semibold text-primary">Add Prompt</h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-1 hover:bg-secondary rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-muted" />
              </button>
            </div>

            <div className="p-6">
              <p className="text-sm text-secondary mb-6">
                Create a prompt to track. Don't mention your own brand — we'll check if AI recommends you.
              </p>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-primary">Prompt</label>
                    <span className="text-xs text-muted">{newPromptText.length}/200</span>
                  </div>
                  <textarea
                    value={newPromptText}
                    onChange={(e) => setNewPromptText(e.target.value.slice(0, 200))}
                    placeholder="What is the best project management software for small teams?"
                    className="input w-full resize-none h-24"
                    autoFocus
                  />
                  <p className="text-xs text-muted mt-1">
                    Tip: Ask what people would search for when looking for your product.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary mb-2">Topic (optional)</label>
                  <select
                    value={newPromptTopic}
                    onChange={(e) => setNewPromptTopic(e.target.value)}
                    className="input w-full"
                  >
                    <option value="">No Topic</option>
                    <option value="AI & Automation">AI & Automation</option>
                    <option value="Analytics & BI">Analytics & BI</option>
                    <option value="Communication">Communication</option>
                    <option value="CRM & Sales">CRM & Sales</option>
                    <option value="Customer Support">Customer Support</option>
                    <option value="Design & Creative">Design & Creative</option>
                    <option value="Developer Tools">Developer Tools</option>
                    <option value="E-commerce">E-commerce</option>
                    <option value="Finance & Accounting">Finance & Accounting</option>
                    <option value="HR & Recruiting">HR & Recruiting</option>
                    <option value="Marketing & SEO">Marketing & SEO</option>
                    <option value="Project Management">Project Management</option>
                    <option value="Security">Security</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 bg-secondary border-t border-border">
              <button
                onClick={() => setShowAddModal(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={addPrompt}
                disabled={!newPromptText.trim() || actionLoading === 'add'}
                className="btn-primary"
              >
                {actionLoading === 'add' ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Add Prompt
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}