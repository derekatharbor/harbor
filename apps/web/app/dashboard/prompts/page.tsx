// apps/web/app/dashboard/prompts/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  MessageSquare, Plus, ChevronDown, ChevronRight, MoreHorizontal, X, Sparkles
} from 'lucide-react'
import { useBrand } from '@/contexts/BrandContext'
import MobileHeader from '@/components/layout/MobileHeader'

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
  created_at?: string | null
  source: string
}

type TabId = 'active' | 'suggested' | 'inactive'

function VolumeBar({ value }: { value: number }) {
  const bars = 5
  const filled = Math.round((value / 100) * bars)
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: bars }).map((_, i) => (
        <div 
          key={i} 
          className={`w-1 h-3.5 rounded-sm ${
            i < filled 
              ? 'bg-emerald-600 dark:bg-emerald-500' 
              : 'bg-gray-200 dark:bg-[#2a2a2a]'
          }`} 
        />
      ))}
    </div>
  )
}

function timeAgo(date: string | null | undefined): string {
  if (!date) return '—'
  const d = new Date(date)
  const days = Math.floor((Date.now() - d.getTime()) / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return '1 day ago'
  if (days < 7) return `${days} days ago`
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function PromptsPage() {
  const router = useRouter()
  const { currentDashboard } = useBrand()
  
  const [tab, setTab] = useState<TabId>('active')
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [suggested, setSuggested] = useState<Prompt[]>([])
  const [inactive, setInactive] = useState<Prompt[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<Set<string>>(new Set<string>())
  const [showModal, setShowModal] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [newPrompt, setNewPrompt] = useState('')
  const [newTopic, setNewTopic] = useState('')
  
  const limit = currentDashboard?.plan === 'agency' ? 100 : currentDashboard?.plan === 'enterprise' ? 999 : 25

  useEffect(() => {
    if (!currentDashboard?.id) return
    setLoading(true)
    fetch(`/api/prompts/list?dashboard_id=${currentDashboard.id}`)
      .then(r => r.json())
      .then(data => {
        setPrompts(data.prompts || [])
        setSuggested(data.all_suggested || [])
        setInactive(data.inactive || [])
        // Expand all topics by default
        const topics = new Set<string>([
          ...(data.prompts || []).map((p: Prompt) => p.topic || 'No Topic'),
          ...(data.all_suggested || []).map((p: Prompt) => p.topic || 'No Topic'),
        ])
        setExpanded(topics)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [currentDashboard?.id])

  const track = async (id: string) => {
    if (!currentDashboard?.id) return
    setActionLoading(id)
    try {
      await fetch('/api/prompts/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dashboard_id: currentDashboard.id, prompt_id: id })
      })
      const p = suggested.find(x => x.id === id)
      if (p) {
        setSuggested(prev => prev.filter(x => x.id !== id))
        setPrompts(prev => [...prev, { ...p, status: 'active' }])
      }
    } finally {
      setActionLoading(null)
    }
  }

  const reject = async (id: string) => {
    if (!currentDashboard?.id) return
    setActionLoading(id)
    try {
      await fetch('/api/prompts/dismiss', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dashboard_id: currentDashboard.id, prompt_id: id })
      })
      const p = suggested.find(x => x.id === id)
      if (p) {
        setSuggested(prev => prev.filter(x => x.id !== id))
        setInactive(prev => [...prev, { ...p, status: 'inactive' }])
      }
    } finally {
      setActionLoading(null)
    }
  }

  const addPrompt = async () => {
    if (!newPrompt.trim() || !currentDashboard?.id) return
    setActionLoading('add')
    try {
      await fetch('/api/prompts/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dashboard_id: currentDashboard.id, prompt_text: newPrompt.trim(), topic: newTopic || null })
      })
      setNewPrompt('')
      setNewTopic('')
      setShowModal(false)
      const r = await fetch(`/api/prompts/list?dashboard_id=${currentDashboard.id}`)
      const data = await r.json()
      setPrompts(data.prompts || [])
      setSuggested(data.all_suggested || [])
    } finally {
      setActionLoading(null)
    }
  }

  const current = tab === 'suggested' ? suggested : tab === 'inactive' ? inactive : prompts
  
  const grouped = Object.entries(
    current.reduce((acc, p) => {
      const t = p.topic || 'No Topic'
      if (!acc[t]) acc[t] = []
      acc[t].push(p)
      return acc
    }, {} as Record<string, Prompt[]>)
  ).sort(([a], [b]) => a === 'No Topic' ? 1 : b === 'No Topic' ? -1 : a.localeCompare(b))

  const toggle = (t: string) => setExpanded(prev => {
    const n = new Set<string>(prev)
    n.has(t) ? n.delete(t) : n.add(t)
    return n
  })

  const openPrompt = (id: string) => {
    router.push(`/dashboard/prompts/${id}`)
  }

  return (
    <div className="min-h-screen bg-page pb-12">
      <MobileHeader />
      
      {/* Header */}
      <div className="px-6 pt-6 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-muted" />
          <h1 className="text-lg font-semibold text-primary">Prompts</h1>
          <span className="text-sm text-muted">· {prompts.length} / {limit} Prompts</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 text-sm font-medium border border-border rounded-lg hover:bg-secondary transition-colors">Add Topic</button>
          <button onClick={() => setShowModal(true)} className="px-4 py-2 text-sm font-medium bg-[#1a1a1a] text-white dark:bg-white dark:text-[#1a1a1a] rounded-lg hover:opacity-90 transition-colors flex items-center gap-1.5">
            <Plus className="w-4 h-4" /> Add Prompt
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 flex items-center gap-1 mb-4">
        {(['active', 'suggested', 'inactive'] as TabId[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              tab === t ? 'bg-secondary text-primary' : 'text-muted hover:text-primary'
            }`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Main Card */}
      <div className="mx-6 card p-0 overflow-hidden">
        {/* Suggested Banner */}
        {tab === 'suggested' && (
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-secondary/30">
            <div className="flex items-center gap-2 text-sm">
              <Sparkles className="w-4 h-4 text-muted" />
              <span className="font-medium text-primary">Suggested prompts.</span>
              <span className="text-secondary">Expand your brand's presence with suggested prompts.</span>
            </div>
            <button className="px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-secondary transition-colors">Suggest more</button>
          </div>
        )}

        {/* Table Header */}
        {tab === 'suggested' ? (
          <div className="grid grid-cols-[1fr,100px,100px,150px] gap-4 px-4 py-2.5 border-b border-border text-xs font-medium text-muted uppercase tracking-wide">
            <div className="flex items-center gap-1 cursor-pointer hover:text-primary">Suggested Prompt <ChevronDown className="w-3 h-3" /></div>
            <div className="flex items-center gap-1 cursor-pointer hover:text-primary">Volume <span className="text-[10px] text-muted bg-secondary px-1.5 py-0.5 rounded normal-case font-normal ml-1">Beta</span></div>
            <div className="flex items-center gap-1 cursor-pointer hover:text-primary">Suggested At <ChevronDown className="w-3 h-3" /></div>
            <div></div>
          </div>
        ) : (
          <div className="grid grid-cols-[1fr,80px,80px,80px,80px,100px] gap-3 px-4 py-2.5 border-b border-border text-xs font-medium text-muted uppercase tracking-wide">
            <div className="flex items-center gap-1 cursor-pointer hover:text-primary">Prompt <ChevronDown className="w-3 h-3" /></div>
            <div>Visibility</div>
            <div>Sentiment</div>
            <div>Position</div>
            <div>Mentions</div>
            <div className="flex items-center gap-1">Volume <span className="text-[10px] text-muted bg-secondary px-1.5 py-0.5 rounded normal-case font-normal ml-1">Beta</span></div>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-6 h-6 border-2 border-gray-300 dark:border-gray-600 border-t-gray-600 dark:border-t-gray-300 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-muted">Loading prompts...</p>
          </div>
        ) : current.length === 0 ? (
          <div className="p-12 text-center">
            <MessageSquare className="w-10 h-10 text-muted mx-auto mb-3 opacity-30" />
            <p className="font-medium text-primary mb-1">
              {tab === 'active' ? 'No active prompts' : tab === 'suggested' ? 'No suggestions' : 'No inactive prompts'}
            </p>
            <p className="text-sm text-muted mb-4">
              {tab === 'active' ? 'Track prompts to monitor your brand visibility.' : 'Check back later.'}
            </p>
            {tab === 'active' && (
              <button onClick={() => setShowModal(true)} className="mx-auto px-4 py-2 text-sm font-medium bg-[#1a1a1a] text-white dark:bg-white dark:text-[#1a1a1a] rounded-lg hover:opacity-90 transition-colors flex items-center gap-1.5">
                <Plus className="w-4 h-4" /> Add Prompt
              </button>
            )}
          </div>
        ) : (
          <div>
            {grouped.map(([topic, items]) => (
              <div key={topic} className="border-b border-border last:border-b-0">
                {/* Topic Row */}
                <div
                  onClick={() => toggle(topic)}
                  className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-hover transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {expanded.has(topic) ? <ChevronDown className="w-4 h-4 text-muted" /> : <ChevronRight className="w-4 h-4 text-muted" />}
                    <span className="font-medium text-primary">{topic}</span>
                    <span className="text-sm text-muted">{items.length} prompts</span>
                  </div>
                  <button onClick={e => e.stopPropagation()} className="p-1.5 hover:bg-secondary rounded-lg">
                    <MoreHorizontal className="w-4 h-4 text-muted" />
                  </button>
                </div>

                {/* Prompt Rows */}
                {expanded.has(topic) && items.map(p => (
                  <div
                    key={p.id}
                    onClick={() => openPrompt(p.id)}
                    className={`border-t border-border hover:bg-hover transition-colors cursor-pointer ${
                      tab === 'suggested'
                        ? 'grid grid-cols-[1fr,100px,100px,150px] gap-4'
                        : 'grid grid-cols-[1fr,80px,80px,80px,80px,100px] gap-3'
                    } px-4 py-3`}
                  >
                    <div className="text-sm text-secondary pl-6">{p.prompt_text}</div>

                    {tab === 'suggested' ? (
                      <>
                        <div className="flex items-center"><VolumeBar value={p.volume} /></div>
                        <div className="text-sm text-muted">{timeAgo(p.created_at)}</div>
                        <div className="flex items-center gap-2 justify-end">
                          <button
                            onClick={e => { e.stopPropagation(); reject(p.id) }}
                            disabled={actionLoading === p.id}
                            className="px-3 py-1.5 text-sm text-secondary border border-border rounded-lg hover:bg-secondary transition-colors disabled:opacity-50"
                          >
                            Reject
                          </button>
                          <button
                            onClick={e => { e.stopPropagation(); track(p.id) }}
                            disabled={actionLoading === p.id}
                            className="px-3 py-1.5 text-sm text-white bg-[#1a1a1a] dark:bg-white dark:text-[#1a1a1a] rounded-lg hover:opacity-90 transition-colors disabled:opacity-50"
                          >
                            Track
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="text-sm text-muted">{p.visibility_score}%</div>
                        <div className="text-sm text-muted">—</div>
                        <div className="text-sm text-muted">—</div>
                        <div className="text-sm text-muted">—</div>
                        <div className="flex items-center"><VolumeBar value={p.volume} /></div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <div className="relative bg-card rounded-xl shadow-xl w-full max-w-md border border-border">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h3 className="font-semibold text-primary">Add Prompt</h3>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-secondary rounded"><X className="w-5 h-5 text-muted" /></button>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-sm text-secondary">Create a prompt to track. Don't include your brand name.</p>
              <div>
                <div className="flex justify-between mb-1.5">
                  <label className="text-sm font-medium text-primary">Prompt</label>
                  <span className="text-xs text-muted">{newPrompt.length}/200</span>
                </div>
                <textarea
                  value={newPrompt}
                  onChange={e => setNewPrompt(e.target.value.slice(0, 200))}
                  placeholder="What is the best project management tool for startups?"
                  className="input w-full h-20 resize-none text-sm"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary mb-1.5">Topic</label>
                <select value={newTopic} onChange={e => setNewTopic(e.target.value)} className="input w-full text-sm">
                  <option value="">No Topic</option>
                  <option>AI & Automation</option>
                  <option>Analytics & BI</option>
                  <option>CRM & Sales</option>
                  <option>Customer Support</option>
                  <option>Developer Tools</option>
                  <option>E-commerce</option>
                  <option>Marketing & SEO</option>
                  <option>Project Management</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 px-5 py-4 bg-secondary/50 border-t border-border">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium border border-border rounded-lg hover:bg-secondary transition-colors">Cancel</button>
              <button onClick={addPrompt} disabled={!newPrompt.trim() || actionLoading === 'add'} className="px-4 py-2 text-sm font-medium bg-[#1a1a1a] text-white dark:bg-white dark:text-[#1a1a1a] rounded-lg hover:opacity-90 transition-colors disabled:opacity-50">
                {actionLoading === 'add' ? 'Adding...' : 'Add Prompt'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}