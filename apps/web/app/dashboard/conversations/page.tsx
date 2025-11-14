// apps/web/app/dashboard/conversations/page.tsx

'use client'

import { useEffect, useState } from 'react'
import { MessageSquare, TrendingUp, Users, Target, ArrowRight } from 'lucide-react'
import ScanProgressModal from '@/components/scan/ScanProgressModal'
import UniversalScanButton from '@/components/scan/UniversalScanButton'
import { useBrand } from '@/contexts/BrandContext'

interface ConversationsData {
  volume_index: number
  questions: Array<{
    question: string
    intent: string
    score: number
    emerging: boolean
  }>
  intent_breakdown: {
    how_to: number
    vs: number
    price: number
    trust: number
    features: number
  }
}

export default function ConversationVolumesPage() {
  const { currentDashboard } = useBrand()
  
  const [data, setData] = useState<ConversationsData | null>(null)
  const [scanData, setScanData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showScanModal, setShowScanModal] = useState(false)
  const [currentScanId, setCurrentScanId] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      if (!currentDashboard) {
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/scan/latest?dashboardId=${currentDashboard.id}`)
        if (!response.ok) throw new Error('Failed to fetch')
        
        const result = await response.json()
        setScanData(result)
        
        // If no scan exists, don't set data
        if (!result.scan) {
          setData(null)
          setLoading(false)
          return
        }
        
        // Map conversations data from API
        setData(result.conversations)
      } catch (error) {
        console.error('Error fetching conversations data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [currentDashboard])

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No recent scan'
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      })
    } catch {
      return 'No recent scan'
    }
  }

  const getIntentColor = (intent: string) => {
    const colors: Record<string, string> = {
      how_to: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      vs: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
      price: 'bg-green-500/10 text-green-400 border-green-500/30',
      trust: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      features: 'bg-teal-500/10 text-teal-400 border-teal-500/30'
    }
    return colors[intent] || 'bg-gray-500/10 text-gray-400 border-gray-500/30'
  }

  const getIntentLabel = (intent: string) => {
    const labels: Record<string, string> = {
      how_to: 'How To',
      vs: 'Comparison',
      price: 'Price',
      trust: 'Trust',
      features: 'Features'
    }
    return labels[intent] || intent
  }

  // Loading skeleton
  if (loading) {
    return (
      <div className="max-w-screen-2xl mx-auto animate-pulse space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-border rounded-lg"></div>
            <div className="h-10 w-64 bg-border rounded"></div>
          </div>
          <div className="h-10 w-40 bg-border rounded-lg"></div>
        </div>

        <div className="grid grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-card rounded-lg p-6 border border-border h-32"></div>
          ))}
        </div>

        <div className="bg-card rounded-lg p-6 border border-border h-64"></div>
      </div>
    )
  }

  // Empty state - no scans yet
  if (!data || !scanData?.scan) {
    return (
      <div className="max-w-screen-2xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-8 h-8 text-[#FFB84D]" strokeWidth={1.5} />
              <h1 className="text-4xl font-heading font-bold text-primary">
                Conversation Volumes
              </h1>
            </div>
            <UniversalScanButton />
          </div>
          
          <p className="text-sm text-secondary/60 mb-2">
            What users ask AI about your brand and category
          </p>
        </div>

        <div className="bg-card rounded-lg p-12 border border-border text-center">
          <MessageSquare className="w-16 h-16 text-[#FFB84D] mx-auto mb-6 opacity-40" strokeWidth={1.5} />
          <h2 className="text-2xl font-heading font-bold text-primary mb-3">
            No Scan Data Yet
          </h2>
          <p className="text-secondary/60 font-body text-sm mb-6 leading-relaxed max-w-md mx-auto">
            Run your first scan to discover what questions users are asking AI about your brand, products, and industry.
          </p>
          <UniversalScanButton variant="large" />
        </div>

        <ScanProgressModal
          isOpen={showScanModal}
          onClose={() => setShowScanModal(false)}
          scanId={currentScanId}
        />
      </div>
    )
  }

  // Main content with data
  return (
    <div className="max-w-screen-2xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-8 h-8 text-[#FFB84D]" strokeWidth={1.5} />
            <h1 className="text-4xl font-heading font-bold text-primary">
              Conversation Volumes
            </h1>
          </div>
          <UniversalScanButton />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-secondary/60 mb-2">
              What users ask AI about your brand and category
            </p>
            <p className="text-sm text-secondary/70 italic">
              Last scan: {formatDate(scanData.scan.finished_at || scanData.scan.started_at)}
            </p>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="bg-card rounded-lg p-6 border border-border">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-[#FFB84D]" strokeWidth={1.5} />
            <p className="text-xs text-secondary/60 uppercase tracking-wider">Volume Index</p>
          </div>
          <div className="text-4xl font-heading font-bold text-primary mb-2">
            {data.volume_index}
          </div>
          <p className="text-sm text-secondary/60">Question volume</p>
        </div>

        <div className="bg-card rounded-lg p-6 border border-border">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="w-5 h-5 text-[#FFB84D]" strokeWidth={1.5} />
            <p className="text-xs text-secondary/60 uppercase tracking-wider">Total Questions</p>
          </div>
          <div className="text-4xl font-heading font-bold text-primary mb-2">
            {data.questions.length}
          </div>
          <p className="text-sm text-secondary/60">Unique queries</p>
        </div>

        <div className="bg-card rounded-lg p-6 border border-border">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-[#FFB84D]" strokeWidth={1.5} />
            <p className="text-xs text-secondary/60 uppercase tracking-wider">Emerging</p>
          </div>
          <div className="text-4xl font-heading font-bold text-primary mb-2">
            {data.questions.filter(q => q.emerging).length}
          </div>
          <p className="text-sm text-secondary/60">New topics</p>
        </div>

        <div className="bg-card rounded-lg p-6 border border-border">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-[#FFB84D]" strokeWidth={1.5} />
            <p className="text-xs text-secondary/60 uppercase tracking-wider">Top Intent</p>
          </div>
          <div className="text-2xl font-heading font-bold text-primary mb-2">
            {getIntentLabel(Object.entries(data.intent_breakdown).sort((a, b) => b[1] - a[1])[0][0])}
          </div>
          <p className="text-sm text-secondary/60">Most common</p>
        </div>
      </div>

      {/* Questions Table */}
      <div className="bg-card rounded-lg border border-border mb-8">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-heading font-bold text-primary">
            Top Questions
          </h2>
          <p className="text-sm text-secondary/60 mt-1">
            What users are asking AI about your category
          </p>
        </div>
        
        <div className="overflow-hidden">
          {data.questions.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 text-xs text-secondary/60 uppercase tracking-wider font-medium">Question</th>
                  <th className="text-left p-4 text-xs text-secondary/60 uppercase tracking-wider font-medium">Intent</th>
                  <th className="text-right p-4 text-xs text-secondary/60 uppercase tracking-wider font-medium">Score</th>
                </tr>
              </thead>
              <tbody>
                {data.questions.slice(0, 20).map((question, index) => (
                  <tr 
                    key={index}
                    className="border-b border-border last:border-0 hover:bg-hover transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="text-primary">{question.question}</span>
                        {question.emerging && (
                          <span className="px-2 py-0.5 bg-[#FFB84D]/10 text-[#FFB84D] border border-[#FFB84D]/30 rounded text-xs font-medium">
                            New
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full border text-xs font-medium ${getIntentColor(question.intent)}`}>
                        {getIntentLabel(question.intent)}
                      </span>
                    </td>
                    <td className="p-4 text-right text-secondary/70 font-mono">{question.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center text-secondary/60">
              No question data available
            </div>
          )}
        </div>
      </div>

      {/* Intent Breakdown */}
      <div className="bg-card rounded-lg border border-border mb-8">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-heading font-bold text-primary">
            Intent Breakdown
          </h2>
          <p className="text-sm text-secondary/60 mt-1">
            Distribution of question types
          </p>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-5 gap-6">
            {Object.entries(data.intent_breakdown).map(([intent, count]) => (
              <div key={intent} className="text-center">
                <div className="text-3xl font-heading font-bold text-primary mb-2">
                  {count}
                </div>
                <p className="text-sm text-secondary/70">{getIntentLabel(intent)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Optimize Section */}
      <div className="bg-card rounded-lg border border-border">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-heading font-bold text-primary">
            Optimize Conversation Coverage
          </h2>
          <p className="text-sm text-secondary/60 mt-1">
            Actions to improve question coverage
          </p>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 rounded-lg border border-border hover:border-[#FFB84D]/30 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-[#FFB84D]/10 flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-5 h-5 text-[#FFB84D]" strokeWidth={1.5} />
              </div>
              <div className="flex-1">
                <h3 className="font-heading font-semibold text-primary mb-1">
                  Add FAQ Schema
                </h3>
                <p className="text-sm text-secondary/70 mb-3">
                  Create an FAQ page with JSON-LD schema for your top questions to help AI provide better answers.
                </p>
                <button className="text-sm text-[#FFB84D] hover:underline font-medium inline-flex items-center gap-1">
                  Learn how <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ScanProgressModal
        isOpen={showScanModal}
        onClose={() => setShowScanModal(false)}
        scanId={currentScanId}
      />
    </div>
  )
}