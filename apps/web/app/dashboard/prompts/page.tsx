// apps/web/app/dashboard/prompts/page.tsx
// Prompts Management - Clean Peec-style design

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { 
  MessageSquare, 
  Plus, 
  Search, 
  Upload,
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
  Eye,
  Smile,
  Meh,
  Frown,
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
    <div className="flex items-center gap-[3px]">
      {Array.from({ length: bars }).map((_, i) => (
        <div
          key={i}
          className={`w-[5px] h-[18px] rounded-[2px] transition-colors ${
            i < filled ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-gray-700'
          }`}
        />
      ))}
    </div>
  )
}

// Sentiment display
function SentimentDisplay({ sentiment }: { sentiment: string | null }) {
  if (!sentiment) return <span className="text-gray-400">—</span>
  
  const config = {
    positive: { icon: Smile, color: 'text-emerald-500' },
    neutral: { icon: Meh, color: 'text-gray-400' },
    negative: { icon: Frown, color: 'text-red-500' },
  }
  
  const { icon: Icon, color } = config[sentiment as keyof typeof config] || config.neutral
  
  return <Icon className={`w-5 h-5 ${color}`} />
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
          ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-transparent' 
          : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
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
        const data = await res.json()
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <MobileHeader />
      
      {/* Top Filter Bar */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
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
              className="px-4 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              Add Topic
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-4 py-1.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors cursor-pointer"
            >
              Add Prompt
            </button>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Prompts</h1>
            <span className="text-sm text-gray-500">
              · {activeCount} / {promptLimit} Prompts
            </span>
          </div>
          
          {/* Tabs */}
          <div className="flex items-center gap-1">
            {(['active', 'suggested', 'inactive'] as TabId[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`
                  px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer capitalize
                  ${activeTab === tab
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                  }
                `}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Search & Export Bar */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="px-6 py-3 flex items-center justify-between">
          <div /> {/* Spacer */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search"
                className="pl-9 pr-4 py-1.5 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 w-48 focus:outline-none focus:ring-2 focus:ring-gray-900/10 dark:focus:ring-white/10"
              />
            </div>
            <button className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-gray-600 rounded-lg transition-colors cursor-pointer">
              <Upload className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 mx-6 mt-6 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          <div className="col-span-5 flex items-center gap-2">
            <input type="checkbox" className="rounded border-gray-300 dark:border-gray-600" />
            <span>Prompt</span>
            <ChevronDown className="w-3 h-3" />
          </div>
          <div className="col-span-1 flex items-center gap-1">
            <Eye className="w-3 h-3" />
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
            <span className="text-[10px] px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded font-medium normal-case">Beta</span>
          </div>
          <div className="col-span-1"></div>
        </div>

        {/* Table Body */}
        {groupedByTopic.length === 0 ? (
          <div className="text-center py-16">
            <MessageSquare className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No prompts yet</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Add prompts to track how your brand appears in AI responses.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors cursor-pointer"
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
                  className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 cursor-pointer transition-colors group"
                  onClick={() => toggleTopic(group.name)}
                >
                  <div className="col-span-5 flex items-center gap-3">
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    )}
                    <div>
                      <span className="font-medium text-gray-900 dark:text-white">{group.name}</span>
                      <span className="text-gray-400 dark:text-gray-500 ml-2 text-sm">{group.prompts.length} prompts</span>
                    </div>
                    <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreHorizontal className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                  <div className="col-span-1 text-gray-900 dark:text-white font-medium">{group.avgVisibility}%</div>
                  <div className="col-span-2 text-gray-400">—</div>
                  <div className="col-span-1 text-gray-400">—</div>
                  <div className="col-span-1 text-gray-400">—</div>
                  <div className="col-span-2"></div>
                </div>

                {/* Expanded Prompts */}
                {isExpanded && group.prompts.map((prompt) => (
                  <div 
                    key={prompt.id}
                    onClick={() => handlePromptClick(prompt.id)}
                    className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-gray-100 dark:border-gray-700/50 hover:bg-blue-50 dark:hover:bg-blue-900/10 cursor-pointer transition-colors group"
                  >
                    <div className="col-span-5 flex items-center gap-3 pl-7">
                      <input 
                        type="checkbox" 
                        className="rounded border-gray-300 dark:border-gray-600"
                        onClick={(e) => e.stopPropagation()} 
                      />
                      <span className="text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {prompt.prompt_text}
                      </span>
                    </div>
                    <div className="col-span-1 text-gray-900 dark:text-white font-medium">
                      {prompt.visibility_score}%
                    </div>
                    <div className="col-span-2">
                      <SentimentDisplay sentiment={prompt.sentiment} />
                    </div>
                    <div className="col-span-1 text-gray-900 dark:text-white">
                      {prompt.position ? `#${prompt.position}` : '—'}
                    </div>
                    <div className="col-span-1 text-gray-900 dark:text-white">
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
        <div className="mx-6 mt-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <div>
                <span className="font-medium text-gray-900 dark:text-white">Suggested prompts.</span>
                <span className="text-gray-500 dark:text-gray-400 ml-1">Expand your brand's presence with suggested prompts.</span>
              </div>
            </div>
            <button className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer">
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
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            {/* Modal Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              <button className="flex-1 px-6 py-4 text-sm font-medium text-gray-900 dark:text-white border-b-2 border-gray-900 dark:border-white">
                Add Prompt
              </button>
              <button className="flex-1 px-6 py-4 text-sm font-medium text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-pointer">
                Bulk Upload
              </button>
            </div>

            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Add Prompt</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Create a competitive prompt without mentioning your own brand. Every line will be a separate prompt.
              </p>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Prompt</label>
                    <span className="text-xs text-gray-400">{newPromptText.length}/200</span>
                  </div>
                  <textarea
                    value={newPromptText}
                    onChange={(e) => setNewPromptText(e.target.value.slice(0, 200))}
                    placeholder="What is the best project management software for small teams?"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 resize-none h-24 focus:outline-none focus:ring-2 focus:ring-gray-900/10 dark:focus:ring-white/10"
                  />
                  <p className="text-xs text-gray-400 mt-1">Tip: Ask what people would search for when looking for your product.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Topic</label>
                  <select
                    value={newPromptTopic}
                    onChange={(e) => setNewPromptTopic(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-gray-900/10 dark:focus:ring-white/10"
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">IP Address</label>
                  <select 
                    value={newPromptLocation}
                    onChange={(e) => setNewPromptLocation(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-gray-900/10 dark:focus:ring-white/10"
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tags</label>
                  <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-400 cursor-pointer hover:border-gray-300 dark:hover:border-gray-500 transition-colors">
                    <span className="text-sm">Select tags for new prompts</span>
                    <Plus className="w-4 h-4 ml-auto" />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleAddPrompt}
                disabled={!newPromptText.trim() || saving}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <button 
              onClick={() => setShowTopicModal(false)}
              className="absolute top-4 right-4 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>

            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">Add new Topic</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Create a Topic without mentioning your own brand. Every topic will have prompts
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Topic</label>
                  <input
                    type="text"
                    placeholder="e.g. SEO optimization"
                    className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Prompts per topic</label>
                  <select className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-gray-900/10 dark:focus:ring-white/10">
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="15">15</option>
                    <option value="20">20</option>
                    <option value="25">25</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">IP address</label>
                  <select className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-gray-900/10 dark:focus:ring-white/10">
                    <option value="us">🇺🇸 United States</option>
                    <option value="uk">🇬🇧 United Kingdom</option>
                    <option value="ca">🇨🇦 Canada</option>
                    <option value="de">🇩🇪 Germany</option>
                    <option value="fr">🇫🇷 France</option>
                    <option value="au">🇦🇺 Australia</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Language</label>
                  <select className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-gray-900/10 dark:focus:ring-white/10">
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end px-6 py-4">
              <button
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors cursor-pointer"
              >
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