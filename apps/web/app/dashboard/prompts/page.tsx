// apps/web/app/dashboard/prompts/page.tsx
// Prompts Management - Clean Peec-style design

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
  Tag
} from 'lucide-react'
import { useBrand } from '@/contexts/BrandContext'
import MobileHeader from '@/components/layout/MobileHeader'

// Types
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
  last_executed_at?: string
}

interface TopicGroup {
  name: string
  prompts: Prompt[]
  avgVisibility: number
}

type TabId = 'active' | 'suggested' | 'inactive'

// Volume bar component (Peec-style)
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

// Sentiment display
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

// Filter pill button
function FilterPill({ 
  icon: Icon, 
  label, 
  active = false,
  onClick 
}: { 
  icon?: any
  label: string
  active?: boolean
  onClick?: () => void 
}) {
  return (
    <button
      onClick={onClick}
      className={`
        inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium
        transition-all cursor-pointer
        ${active 
          ? 'bg-primary text-primary border-border' 
          : 'bg-card text-secondary border-border hover:text-primary'
        }
      `}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {label}
      <ChevronDown className="w-3 h-3 opacity-50" />
    </button>
  )
}

export default function PromptsPage() {
  const router = useRouter()
  const { currentDashboard, isLoading: brandLoading } = useBrand()
  
  const [activeTab, setActiveTab] = useState<TabId>('active')
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [suggestedPrompts, setSuggestedPrompts] = useState<Prompt[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set(['all']))
  const [showAddModal, setShowAddModal] = useState(false)
  const [showTopicModal, setShowTopicModal] = useState(false)
  const [newPromptText, setNewPromptText] = useState('')
  const [newPromptTopic, setNewPromptTopic] = useState('')
  const [newPromptLocation, setNewPromptLocation] = useState('us')
  
  // Plan limits
  const promptLimit = currentDashboard?.plan === 'agency' ? 100 : 
                      currentDashboard?.plan === 'enterprise' ? 999 : 25

  // Fetch prompts
  const fetchPrompts = async () => {
    try {
      const params = new URLSearchParams()
      if (currentDashboard?.id) {
        params.append('dashboard_id', currentDashboard.id)
      }
      
      const res = await fetch(`/api/prompts/list?${params}`)
      if (res.ok) {
        const data = await res.json()
        setPrompts(data.prompts || [])
        setSuggestedPrompts(data.suggested || [])
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

  // Toggle topic expansion
  const toggleTopic = (topicName: string) => {
    const newExpanded = new Set(expandedTopics)
    if (newExpanded.has(topicName)) {
      newExpanded.delete(topicName)
    } else {
      newExpanded.add(topicName)
    }
    setExpandedTopics(newExpanded)
  }

  // Filter prompts based on tab
  const currentPrompts = activeTab === 'suggested' ? suggestedPrompts : prompts
  
  const filteredPrompts = currentPrompts.filter(p => {
    const matchesSearch = !searchQuery || 
      p.prompt_text.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  // Group by topic
  const groupedByTopic: TopicGroup[] = Object.entries(
    filteredPrompts.reduce((acc, prompt) => {
      const topic = prompt.topic || 'No Topic'
      if (!acc[topic]) {
        acc[topic] = []
      }
      acc[topic].push(prompt)
      return acc
    }, {} as Record<string, Prompt[]>)
  ).map(([name, prompts]) => ({
    name,
    prompts,
    avgVisibility: Math.round(prompts.reduce((sum, p) => sum + p.visibility_score, 0) / prompts.length) || 0
  })).sort((a, b) => a.name === 'No Topic' ? 1 : b.name === 'No Topic' ? -1 : a.name.localeCompare(b.name))

  const activeCount = prompts.length
  
  // Add prompt
  const handleAddPrompt = async () => {
    if (!newPromptText.trim() || saving) return
    
    setSaving(true)
    try {
      const res = await fetch('/api/prompts/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dashboard_id: currentDashboard?.id,
          prompt_text: newPromptText,
          topic: newPromptTopic || null,
          location: newPromptLocation
        })
      })
      
      if (res.ok) {
        await fetchPrompts()
        setNewPromptText('')
        setNewPromptTopic('')
        setShowAddModal(false)
        setActiveTab('active')
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to add prompt')
      }
    } catch (err) {
      console.error('Failed to add prompt:', err)
      alert('Failed to add prompt')
    } finally {
      setSaving(false)
    }
  }

  // Activate a suggested prompt
  const handleActivatePrompt = async (prompt: Prompt) => {
    setSaving(true)
    try {
      const res = await fetch('/api/prompts/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dashboard_id: currentDashboard?.id,
          prompt_text: prompt.prompt_text,
          topic: prompt.topic
        })
      })
      
      if (res.ok) {
        await fetchPrompts()
        setActiveTab('active')
      }
    } catch (err) {
      console.error('Failed to activate prompt:', err)
    } finally {
      setSaving(false)
    }
  }

  // Navigate to prompt detail
  const handlePromptClick = (promptId: string) => {
    router.push(`/dashboard/prompts/${promptId}`)
  }

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
      
      {/* Top Filter Bar */}
      <div className="bg-card border-b border-border">
        <div className="px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FilterPill 
              icon={MessageSquare} 
              label={currentDashboard?.brand_name || 'Brand'} 
            />
            <FilterPill icon={Calendar} label="Last 7 days" />
            <FilterPill icon={Layers} label="All Models" />
            <FilterPill icon={Tag} label="Group by Topic" />
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowTopicModal(true)}
              className="px-4 py-1.5 text-sm font-medium text-secondary hover:text-primary transition-colors cursor-pointer"
            >
              Add Topic
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary inline-flex items-center gap-2"
            >
              Add Prompt
            </button>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="px-6 py-4">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="w-5 h-5 text-muted" strokeWidth={1.5} />
            <h1 className="text-lg font-semibold text-primary">Prompts</h1>
            <span className="text-sm text-muted">
              · {activeCount} / {promptLimit} Prompts
            </span>
          </div>
          
          {/* Tabs */}
          <div className="pill-group">
            {(['active', 'suggested', 'inactive'] as TabId[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pill capitalize ${activeTab === tab ? 'active' : ''}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Search & Export Bar */}
      <div className="bg-card border-b border-border">
        <div className="px-6 py-3 flex items-center justify-between">
          <div /> {/* Spacer */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search"
                className="input pl-9 pr-4 py-1.5 text-sm w-48"
              />
            </div>
            <button className="btn-secondary inline-flex items-center gap-2 text-sm">
              <Upload className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card mx-6 mt-6 overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-secondary border-b border-border text-xs font-medium text-muted uppercase tracking-wider">
          <div className="col-span-5 flex items-center gap-2">
            <input type="checkbox" className="rounded border-border" />
            <span>Prompt</span>
            <ChevronDown className="w-3 h-3" />
          </div>
          <div className="col-span-1 flex items-center gap-1">
            <span>Visibility</span>
            <ChevronDown className="w-3 h-3" />
          </div>
          <div className="col-span-2 flex items-center gap-1">
            <span>Sentiment</span>
            <ChevronDown className="w-3 h-3" />
          </div>
          <div className="col-span-1 flex items-center gap-1">
            <span>Position</span>
            <ChevronDown className="w-3 h-3" />
          </div>
          <div className="col-span-1">Mentions</div>
          <div className="col-span-1 flex items-center gap-1">
            <span>Volume</span>
            <span className="text-[10px] px-1.5 py-0.5 bg-chart-1/10 text-chart-1 rounded font-medium normal-case">Beta</span>
          </div>
          <div className="col-span-1"></div>
        </div>

        {/* Table Body */}
        {groupedByTopic.length === 0 ? (
          <div className="text-center py-16">
            <MessageSquare className="w-12 h-12 text-muted mx-auto mb-4" />
            <h3 className="text-lg font-medium text-primary mb-2">No prompts yet</h3>
            <p className="text-sm text-secondary mb-6">
              Add prompts to track how your brand appears in AI responses.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Your First Prompt
            </button>
          </div>
        ) : (
          groupedByTopic.map((group) => {
            const isExpanded = expandedTopics.has(group.name) || expandedTopics.has('all')
            
            return (
              <div key={group.name}>
                {/* Topic Row */}
                <div 
                  className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-light hover:bg-hover cursor-pointer transition-colors group"
                  onClick={() => toggleTopic(group.name)}
                >
                  <div className="col-span-5 flex items-center gap-3">
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-muted" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-muted" />
                    )}
                    <div>
                      <span className="font-medium text-primary">{group.name}</span>
                      <span className="text-muted ml-2 text-sm">{group.prompts.length} prompts</span>
                    </div>
                    <button className="p-1 hover:bg-secondary rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreHorizontal className="w-4 h-4 text-muted" />
                    </button>
                  </div>
                  <div className="col-span-1 text-primary font-medium">{group.avgVisibility}%</div>
                  <div className="col-span-2 text-muted">—</div>
                  <div className="col-span-1 text-muted">—</div>
                  <div className="col-span-1 text-muted">—</div>
                  <div className="col-span-2"></div>
                </div>

                {/* Expanded Prompts */}
                {isExpanded && group.prompts.map((prompt) => (
                  <div 
                    key={prompt.id}
                    onClick={() => handlePromptClick(prompt.id)}
                    className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-light hover:bg-hover cursor-pointer transition-colors group"
                  >
                    <div className="col-span-5 flex items-center gap-3 pl-7">
                      <input 
                        type="checkbox" 
                        className="rounded border-border"
                        onClick={(e) => e.stopPropagation()} 
                      />
                      <span className="text-primary group-hover:text-chart-1 transition-colors">
                        {prompt.prompt_text}
                      </span>
                    </div>
                    <div className="col-span-1 text-primary font-medium">
                      {prompt.visibility_score}%
                    </div>
                    <div className="col-span-2">
                      <SentimentBadge sentiment={prompt.sentiment} />
                    </div>
                    <div className="col-span-1 text-primary">
                      {prompt.position ? `#${prompt.position}` : '—'}
                    </div>
                    <div className="col-span-1 text-primary">
                      {prompt.mentions || '—'}
                    </div>
                    <div className="col-span-1">
                      <VolumeBar value={prompt.volume} />
                    </div>
                    <div className="col-span-1"></div>
                  </div>
                ))}
              </div>
            )
          })
        )}
      </div>

      {/* Suggested Prompts Banner (shown on Suggested tab) */}
      {activeTab === 'suggested' && (
        <div className="mx-6 mt-4 p-4 card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-warning" />
              <div>
                <span className="font-medium text-primary">Suggested prompts.</span>
                <span className="text-secondary ml-1">Expand your brand's presence with suggested prompts.</span>
              </div>
            </div>
            <button className="text-sm font-medium text-secondary hover:text-primary transition-colors cursor-pointer">
              Suggest more
            </button>
          </div>
        </div>
      )}

      {/* Add Prompt Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowAddModal(false)}
          />
          <div className="relative bg-card rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-border">
            {/* Modal Tabs */}
            <div className="flex border-b border-border">
              <button className="flex-1 px-6 py-4 text-sm font-medium text-primary border-b-2 border-chart-1">
                Add Prompt
              </button>
              <button className="flex-1 px-6 py-4 text-sm font-medium text-muted hover:text-secondary transition-colors cursor-pointer">
                Bulk Upload
              </button>
            </div>

            <div className="p-6">
              <h3 className="text-lg font-semibold text-primary mb-1">Add Prompt</h3>
              <p className="text-sm text-secondary mb-6">
                Create a competitive prompt without mentioning your own brand. Every line will be a separate prompt.
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
                  />
                  <p className="text-xs text-muted mt-1">Tip: Ask what people would search for when looking for your product.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary mb-2">Topic</label>
                  <select
                    value={newPromptTopic}
                    onChange={(e) => setNewPromptTopic(e.target.value)}
                    className="input w-full cursor-pointer"
                  >
                    <option value="">No Topic</option>
                    <option value="Project Management">Project Management</option>
                    <option value="CRM & Sales">CRM & Sales</option>
                    <option value="Marketing & SEO">Marketing & SEO</option>
                    <option value="HR & Recruiting">HR & Recruiting</option>
                    <option value="Finance & Accounting">Finance & Accounting</option>
                    <option value="Communication">Communication</option>
                    <option value="Design & Creative">Design & Creative</option>
                    <option value="Developer Tools">Developer Tools</option>
                    <option value="Customer Support">Customer Support</option>
                    <option value="E-commerce">E-commerce</option>
                    <option value="Analytics & BI">Analytics & BI</option>
                    <option value="Security">Security</option>
                    <option value="AI & Automation">AI & Automation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary mb-2">IP Address</label>
                  <select 
                    value={newPromptLocation}
                    onChange={(e) => setNewPromptLocation(e.target.value)}
                    className="input w-full cursor-pointer"
                  >
                    <option value="us">🇺🇸 United States</option>
                    <option value="uk">🇬🇧 United Kingdom</option>
                    <option value="ca">🇨🇦 Canada</option>
                    <option value="de">🇩🇪 Germany</option>
                    <option value="fr">🇫🇷 France</option>
                    <option value="au">🇦🇺 Australia</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary mb-2">Tags</label>
                  <div className="input flex items-center gap-2 text-muted cursor-pointer hover:border-secondary transition-colors">
                    <span className="text-sm">Select tags for new prompts</span>
                    <Plus className="w-4 h-4 ml-auto" />
                  </div>
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
                onClick={handleAddPrompt}
                disabled={!newPromptText.trim() || saving}
                className="btn-primary inline-flex items-center gap-2 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Add
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Topic Modal */}
      {showTopicModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowTopicModal(false)}
          />
          <div className="relative bg-card rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-border">
            <button 
              onClick={() => setShowTopicModal(false)}
              className="absolute top-4 right-4 p-1 hover:bg-secondary rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5 text-muted" />
            </button>

            <div className="p-6">
              <h3 className="text-xl font-semibold text-primary mb-1">Add new Topic</h3>
              <p className="text-sm text-secondary mb-6">
                Create a Topic without mentioning your own brand. Every topic will have prompts
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">Topic</label>
                  <input
                    type="text"
                    placeholder="e.g. SEO optimization"
                    className="input w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary mb-2">Prompts per topic</label>
                  <select className="input w-full cursor-pointer">
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="15">15</option>
                    <option value="20">20</option>
                    <option value="25">25</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary mb-2">IP address</label>
                  <select className="input w-full cursor-pointer">
                    <option value="us">🇺🇸 United States</option>
                    <option value="uk">🇬🇧 United Kingdom</option>
                    <option value="ca">🇨🇦 Canada</option>
                    <option value="de">🇩🇪 Germany</option>
                    <option value="fr">🇫🇷 France</option>
                    <option value="au">🇦🇺 Australia</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary mb-2">Language</label>
                  <select className="input w-full cursor-pointer">
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end px-6 py-4">
              <button className="btn-primary inline-flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}