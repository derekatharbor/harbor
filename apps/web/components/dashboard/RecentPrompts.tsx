'use client'

// components/dashboard/RecentPrompts.tsx
// Recent AI chat executions grid with modal details

import { useState, useEffect } from 'react'
import { X, ExternalLink, MessageCircle, Globe, Tag } from 'lucide-react'

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

interface RecentPromptsProps {
  dashboardId?: string
  brandName?: string
  limit?: number
}

export default function RecentPrompts({ dashboardId, brandName, limit = 12 }: RecentPromptsProps) {
  const [prompts, setPrompts] = useState<PromptExecution[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPrompt, setSelectedPrompt] = useState<PromptExecution | null>(null)
  const [brandMentionedOnly, setBrandMentionedOnly] = useState(false)

  useEffect(() => {
    fetchPrompts()
  }, [brandMentionedOnly, brandName])

  async function fetchPrompts() {
    setLoading(true)
    try {
      const params = new URLSearchParams({ limit: limit.toString() })
      if (dashboardId) params.set('dashboard_id', dashboardId)
      if (brandMentionedOnly && brandName) params.set('brand', brandName)

      const res = await fetch(`/api/prompts/recent?${params}`)
      const data = await res.json()
      setPrompts(data.prompts || [])
    } catch (error) {
      console.error('Failed to fetch prompts:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Recent Chats
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-100 rounded-lg h-40" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Recent Chats
          </h3>
          
          {brandName && (
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <div 
                className={`relative w-10 h-5 rounded-full transition-colors ${
                  brandMentionedOnly ? 'bg-coral-500' : 'bg-gray-300'
                }`}
                onClick={() => setBrandMentionedOnly(!brandMentionedOnly)}
              >
                <div 
                  className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                    brandMentionedOnly ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </div>
              <span>{brandName} mentioned</span>
            </label>
          )}
        </div>

        {prompts.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No recent prompts found</p>
            {brandMentionedOnly && (
              <p className="text-sm mt-1">Try turning off the brand filter</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {prompts.map((prompt) => (
              <PromptCard 
                key={prompt.id} 
                prompt={prompt} 
                onClick={() => setSelectedPrompt(prompt)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedPrompt && (
        <PromptModal 
          prompt={selectedPrompt} 
          onClose={() => setSelectedPrompt(null)} 
        />
      )}
    </>
  )
}

function PromptCard({ prompt, onClick }: { prompt: PromptExecution; onClick: () => void }) {
  return (
    <div 
      onClick={onClick}
      className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer group"
    >
      {/* Header: Model logo + prompt */}
      <div className="flex items-start gap-3 mb-3">
        <img 
          src={prompt.modelLogo} 
          alt={prompt.modelName}
          className="w-6 h-6 rounded-md flex-shrink-0"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/24'
          }}
        />
        <h4 className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {prompt.prompt}
        </h4>
      </div>

      {/* Response preview */}
      <p className="text-sm text-gray-600 line-clamp-3 mb-4">
        {prompt.responsePreview}
      </p>

      {/* Footer: Citations + time */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          {prompt.citationFavicons.slice(0, 3).map((favicon, i) => (
            <img 
              key={i}
              src={favicon}
              alt=""
              className="w-4 h-4 rounded-sm"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none'
              }}
            />
          ))}
          {prompt.citationsCount > 3 && (
            <span className="text-xs text-gray-400 ml-1">
              +{prompt.citationsCount - 3}
            </span>
          )}
        </div>
        <span className="text-xs text-gray-400">{prompt.timeAgo}</span>
      </div>
    </div>
  )
}

function PromptModal({ prompt, onClose }: { prompt: PromptExecution; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <img 
              src={prompt.modelLogo} 
              alt={prompt.modelName}
              className="w-8 h-8 rounded-lg"
            />
            <div>
              <span className="text-sm font-medium text-gray-900">{prompt.modelName}</span>
              <span className="mx-2 text-gray-300">•</span>
              <span className="text-sm text-gray-500">{prompt.topic}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a 
              href="#" 
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              View prompt <ExternalLink className="w-3 h-3" />
            </a>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Main content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* User query */}
            <div className="flex items-start gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                <span className="text-sm">👤</span>
              </div>
              <div className="bg-gray-100 rounded-2xl px-4 py-3 max-w-lg">
                <p className="text-gray-900">{prompt.prompt}</p>
              </div>
            </div>

            {/* AI response */}
            <div className="flex items-start gap-3">
              <img 
                src={prompt.modelLogo} 
                alt={prompt.modelName}
                className="w-8 h-8 rounded-lg flex-shrink-0"
              />
              <div className="flex-1">
                <div className="prose prose-sm max-w-none">
                  <div 
                    className="text-gray-700 whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ 
                      __html: formatResponse(prompt.responseText) 
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-72 border-l border-gray-200 bg-gray-50 p-4 overflow-y-auto">
            {/* Brands section */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Brands
              </h4>
              {prompt.brands.length === 0 ? (
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <span className="opacity-50">∅</span> No Brands
                </p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {prompt.brands.map((brand, i) => (
                    <span 
                      key={i}
                      className="text-xs bg-white border border-gray-200 rounded-full px-2.5 py-1 text-gray-700"
                    >
                      {brand}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Sources section */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Sources
              </h4>
              {prompt.citationDomains.length === 0 ? (
                <p className="text-sm text-gray-500">No sources cited</p>
              ) : (
                <div className="space-y-2">
                  {prompt.citationDomains.map((domain, i) => (
                    <a 
                      key={i}
                      href={`https://${domain}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-gray-700 hover:text-blue-600 transition-colors"
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
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function formatResponse(text: string): string {
  if (!text) return ''
  
  // Convert markdown-style bold to HTML
  let formatted = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br />')
  
  return formatted
}
