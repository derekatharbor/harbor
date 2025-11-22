'use client'

import { Clock, TrendingUp, Edit3, Plus, Trash2, RefreshCw } from 'lucide-react'

interface HistoryItem {
  id: string
  timestamp: string
  description: string
  type: string
}

interface VersionHistoryProps {
  history: HistoryItem[]
  loading?: boolean
}

export function VersionHistory({ history, loading }: VersionHistoryProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'scan_triggered':
        return <RefreshCw className="w-4 h-4" />
      case 'visibility_score_updated':
        return <TrendingUp className="w-4 h-4" />
      case 'product_added':
      case 'faq_added':
        return <Plus className="w-4 h-4" />
      case 'product_removed':
      case 'faq_removed':
        return <Trash2 className="w-4 h-4" />
      case 'description_updated':
      case 'product_updated':
      case 'faq_updated':
      case 'company_info_updated':
        return <Edit3 className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    })
  }

  if (loading) {
    return (
      <div className="p-8 bg-white/[0.02] border border-white/5 rounded-lg">
        <div className="text-white/40 font-mono text-sm animate-pulse">
          Loading history...
        </div>
      </div>
    )
  }

  if (history.length === 0) {
    return (
      <div className="p-8 bg-white/[0.02] border border-white/5 rounded-lg">
        <h3 className="text-white text-xl font-light mb-2">Version History</h3>
        <p className="text-white/40 font-mono text-sm">
          No changes yet. Make edits to your profile to see them tracked here.
        </p>
      </div>
    )
  }

  return (
    <div className="p-8 bg-white/[0.02] border border-white/5 rounded-lg">
      <div className="mb-6">
        <h3 className="text-white text-xl font-light mb-2">Version History</h3>
        <p className="text-white/40 font-mono text-sm">
          Track all changes made to your profile
        </p>
      </div>

      <div className="space-y-px bg-white/5 rounded-lg overflow-hidden">
        {history.slice(0, 10).map((item) => (
          <div 
            key={item.id}
            className="p-4 bg-[#0A0F1E] flex items-start gap-4 hover:bg-white/[0.01] transition-colors"
          >
            {/* Icon */}
            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0 text-white/40">
              {getIcon(item.type)}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="text-white/90 font-mono text-sm mb-1">
                {item.description}
              </div>
              <div className="text-white/40 font-mono text-xs">
                {formatTimestamp(item.timestamp)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {history.length > 10 && (
        <div className="mt-4 text-center">
          <button className="text-white/40 hover:text-white/60 font-mono text-xs transition-colors">
            View all {history.length} changes
          </button>
        </div>
      )}
    </div>
  )
}
