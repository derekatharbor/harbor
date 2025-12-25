// DESTINATION: ~/Claude Harbor/apps/web/app/agencies/workspace/page.tsx
// Agency Pitch Workspace - manage prospects and clients

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createBrowserClient } from '@supabase/ssr'
import {
  Plus,
  Search,
  ExternalLink,
  MoreVertical,
  FileText,
  TrendingUp,
  Users,
  Target,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  ArrowUpRight,
  Building2
} from 'lucide-react'

interface Audit {
  id: string
  brand_name: string
  domain: string
  logo_url: string | null
  visibility_score: number
  share_of_voice: number
  created_at: string
}

interface PitchItem {
  id: string
  audit_id: string
  status: 'prospect' | 'pitched' | 'won' | 'lost'
  notes: string | null
  created_at: string
  updated_at: string
  audit: Audit
}

const STATUS_CONFIG = {
  prospect: { label: 'Prospect', color: 'text-blue-400', bg: 'bg-blue-500/10', icon: Target },
  pitched: { label: 'Pitched', color: 'text-yellow-400', bg: 'bg-yellow-500/10', icon: Clock },
  won: { label: 'Won', color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: CheckCircle2 },
  lost: { label: 'Lost', color: 'text-red-400', bg: 'bg-red-500/10', icon: XCircle },
}

export default function WorkspacePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<PitchItem[]>([])
  const [filter, setFilter] = useState<'all' | 'prospect' | 'pitched' | 'won' | 'lost'>('all')
  const [search, setSearch] = useState('')
  const [menuOpen, setMenuOpen] = useState<string | null>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    async function fetchWorkspace() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          router.push('/auth/login?next=/agencies/workspace')
          return
        }

        const { data, error } = await supabase
          .from('pitch_workspace')
          .select(`
            *,
            audit:agency_audits(*)
          `)
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false })

        if (error) throw error
        setItems(data || [])
      } catch (err) {
        console.error('Error fetching workspace:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchWorkspace()
  }, [router, supabase])

  const updateStatus = async (itemId: string, newStatus: PitchItem['status']) => {
    try {
      const { error } = await supabase
        .from('pitch_workspace')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', itemId)

      if (error) throw error

      setItems(items.map(item =>
        item.id === itemId ? { ...item, status: newStatus } : item
      ))
    } catch (err) {
      console.error('Error updating status:', err)
    }
    setMenuOpen(null)
  }

  const removeFromWorkspace = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('pitch_workspace')
        .delete()
        .eq('id', itemId)

      if (error) throw error
      setItems(items.filter(item => item.id !== itemId))
    } catch (err) {
      console.error('Error removing item:', err)
    }
    setMenuOpen(null)
  }

  const filteredItems = items.filter(item => {
    if (filter !== 'all' && item.status !== filter) return false
    if (search && !item.audit.brand_name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const stats = {
    total: items.length,
    prospects: items.filter(i => i.status === 'prospect').length,
    pitched: items.filter(i => i.status === 'pitched').length,
    won: items.filter(i => i.status === 'won').length,
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0B0C] flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-white/30 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0B0B0C]">
      {/* Header */}
      <header className="border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/images/Harbor_White_Logo.png"
                alt="Harbor"
                width={28}
                height={28}
                className="h-7 w-auto"
              />
              <span className="text-lg font-semibold text-white font-['Space_Grotesk']">Harbor</span>
            </Link>
            <div className="h-6 w-px bg-white/10" />
            <span className="text-white/50 font-['Source_Code_Pro'] text-sm">Pitch Workspace</span>
          </div>
          
          <div className="flex items-center gap-4">
            <Link
              href="/agencies"
              className="flex items-center gap-2 px-4 py-2 bg-white text-[#0B0B0C] rounded-lg font-medium text-sm font-['Space_Grotesk'] hover:bg-white/90 transition-all"
            >
              <Plus className="w-4 h-4" />
              New Audit
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
            <div className="flex items-center gap-3 mb-2">
              <Building2 className="w-4 h-4 text-white/30" />
              <span className="text-xs text-white/40 font-['Source_Code_Pro']">Total Brands</span>
            </div>
            <p className="text-2xl font-semibold text-white font-['Space_Grotesk']">{stats.total}</p>
          </div>
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
            <div className="flex items-center gap-3 mb-2">
              <Target className="w-4 h-4 text-blue-400/50" />
              <span className="text-xs text-white/40 font-['Source_Code_Pro']">Prospects</span>
            </div>
            <p className="text-2xl font-semibold text-white font-['Space_Grotesk']">{stats.prospects}</p>
          </div>
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-4 h-4 text-yellow-400/50" />
              <span className="text-xs text-white/40 font-['Source_Code_Pro']">Pitched</span>
            </div>
            <p className="text-2xl font-semibold text-white font-['Space_Grotesk']">{stats.pitched}</p>
          </div>
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400/50" />
              <span className="text-xs text-white/40 font-['Source_Code_Pro']">Won</span>
            </div>
            <p className="text-2xl font-semibold text-white font-['Space_Grotesk']">{stats.won}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search brands..."
              className="w-full pl-10 pr-4 py-2 bg-white/[0.03] border border-white/10 rounded-lg text-white placeholder-white/30 font-['Source_Code_Pro'] text-sm focus:outline-none focus:border-white/20 transition-colors"
            />
          </div>
          
          <div className="flex items-center gap-2">
            {(['all', 'prospect', 'pitched', 'won', 'lost'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-['Source_Code_Pro'] transition-colors ${
                  filter === status
                    ? 'bg-white/10 text-white'
                    : 'text-white/40 hover:text-white/60'
                }`}
              >
                {status === 'all' ? 'All' : STATUS_CONFIG[status].label}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-white/20" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2 font-['Space_Grotesk']">
              No brands yet
            </h3>
            <p className="text-white/40 text-sm font-['Source_Code_Pro'] mb-6 max-w-sm mx-auto">
              Run an audit on a prospect and save it here to track your pipeline.
            </p>
            <Link
              href="/agencies"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-white text-[#0B0B0C] rounded-lg font-medium text-sm font-['Space_Grotesk'] hover:bg-white/90 transition-all"
            >
              <Plus className="w-4 h-4" />
              Run Your First Audit
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredItems.map((item) => {
              const StatusIcon = STATUS_CONFIG[item.status].icon
              return (
                <div
                  key={item.id}
                  className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors group"
                >
                  {/* Logo */}
                  <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {item.audit.logo_url ? (
                      <Image
                        src={item.audit.logo_url}
                        alt={item.audit.brand_name}
                        width={40}
                        height={40}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <span className="text-sm font-medium text-white/30">
                        {item.audit.brand_name.charAt(0)}
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-medium text-white font-['Space_Grotesk'] truncate">
                        {item.audit.brand_name}
                      </h3>
                      <span className="text-xs text-white/30 font-['Source_Code_Pro']">
                        {item.audit.domain}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-xs text-white/40 font-['Source_Code_Pro']">
                        Visibility: {item.audit.visibility_score}%
                      </span>
                      <span className="text-xs text-white/40 font-['Source_Code_Pro']">
                        Share: {item.audit.share_of_voice}%
                      </span>
                    </div>
                  </div>

                  {/* Status */}
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${STATUS_CONFIG[item.status].bg}`}>
                    <StatusIcon className={`w-3.5 h-3.5 ${STATUS_CONFIG[item.status].color}`} />
                    <span className={`text-xs font-['Source_Code_Pro'] ${STATUS_CONFIG[item.status].color}`}>
                      {STATUS_CONFIG[item.status].label}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/agencies/report/${item.audit_id}`}
                      className="p-2 text-white/30 hover:text-white/60 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                    
                    <div className="relative">
                      <button
                        onClick={() => setMenuOpen(menuOpen === item.id ? null : item.id)}
                        className="p-2 text-white/30 hover:text-white/60 transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      
                      {menuOpen === item.id && (
                        <div className="absolute right-0 top-full mt-1 w-40 bg-[#1A1A1B] border border-white/10 rounded-lg shadow-xl z-10 overflow-hidden">
                          <div className="p-1">
                            <p className="px-3 py-1.5 text-xs text-white/30 font-['Source_Code_Pro']">
                              Change status
                            </p>
                            {(['prospect', 'pitched', 'won', 'lost'] as const).map((status) => (
                              <button
                                key={status}
                                onClick={() => updateStatus(item.id, status)}
                                className={`w-full flex items-center gap-2 px-3 py-2 text-left text-sm font-['Source_Code_Pro'] hover:bg-white/5 transition-colors ${
                                  item.status === status ? 'text-white' : 'text-white/60'
                                }`}
                              >
                                {STATUS_CONFIG[status].label}
                                {item.status === status && (
                                  <CheckCircle2 className="w-3 h-3 ml-auto text-emerald-400" />
                                )}
                              </button>
                            ))}
                          </div>
                          <div className="border-t border-white/10 p-1">
                            <button
                              onClick={() => removeFromWorkspace(item.id)}
                              className="w-full px-3 py-2 text-left text-sm text-red-400 font-['Source_Code_Pro'] hover:bg-white/5 transition-colors"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
