// apps/web/app/dashboard/brand/page.tsx

'use client'

import { useEffect, useState } from 'react'
import { Star, TrendingUp, MessageSquare, Users, Target } from 'lucide-react'
import ScanProgressModal from '@/components/scan/ScanProgressModal'
import ActionCard from '@/components/optimization/ActionCard'
import ActionModal from '@/components/optimization/ActionModal'
import { analyzeBrandData, TaskRecommendation } from '@/lib/optimization/generator'
import { OptimizationTask } from '@/lib/optimization/tasks'
import { useBrand } from '@/contexts/BrandContext'
import MobileHeader from '@/components/layout/MobileHeader'

interface BrandData {
  visibility_index: number
  descriptors: Array<{
    word: string
    sentiment: string
    weight: number
  }>
  sentiment_breakdown: {
    positive: number
    neutral: number
    negative: number
  }
  total_mentions: number
}

export default function BrandVisibilityPage() {
  const { currentDashboard } = useBrand()
  
  const [data, setData] = useState<BrandData | null>(null)
  const [scanData, setScanData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showScanModal, setShowScanModal] = useState(false)
  const [currentScanId, setCurrentScanId] = useState<string | null>(null)
  
  // NEW: State for recommendations
  const [recommendations, setRecommendations] = useState<TaskRecommendation[]>([])
  const [selectedTask, setSelectedTask] = useState<OptimizationTask | null>(null)
  const [showActionModal, setShowActionModal] = useState(false)

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
        
        // Map brand data from API
        setData(result.brand)
        
        // NEW: Generate recommendations if we have brand data
        if (result.brand) {
          const tasks = analyzeBrandData(result.brand)
          setRecommendations(tasks)
          console.log('📋 [Brand] Recommendations:', tasks.length)
        }
      } catch (error) {
        console.error('Error fetching brand data:', error)
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

  const getSentimentColor = (sentiment: string) => {
    if (sentiment === 'pos' || sentiment === 'positive') return 'bg-[#00C6B7]/10 text-[#00C6B7] border-[#00C6B7]/30'
    if (sentiment === 'neg' || sentiment === 'negative') return 'bg-red-500/10 text-red-400 border-red-500/30'
    return 'bg-blue-500/10 text-blue-400 border-blue-500/30'
  }

  // Loading skeleton
  if (loading) {
    return (
      <>
        <MobileHeader />
        <div className="max-w-screen-2xl mx-auto animate-pulse space-y-8 pt-20 lg:pt-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-border rounded-lg"></div>
              <div className="h-10 w-64 bg-border rounded"></div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-card rounded-lg p-6 border border-border h-32"></div>
            ))}
          </div>

          <div className="bg-card rounded-lg p-6 border border-border h-64"></div>
        </div>
      </>
    )
  }

  // Empty state - no scans yet
  if (!data || !scanData?.scan) {
    return (
      <>
        <MobileHeader />
        <div className="max-w-screen-2xl mx-auto pt-20 lg:pt-0 px-4 lg:px-0">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Star className="w-6 h-6 lg:w-8 lg:h-8 text-[#4EE4FF]" strokeWidth={1.5} />
                <h1 className="text-2xl lg:text-4xl font-heading font-bold text-primary">
                  Brand Visibility
                </h1>
              </div>
            </div>
            
            <p className="text-sm text-secondary/60 mb-2">
              How AI models describe and associate your brand
            </p>
          </div>

          <div className="bg-card rounded-lg p-8 lg:p-12 border border-border text-center">
            <Star className="w-12 h-12 lg:w-16 lg:h-16 text-[#4EE4FF] mx-auto mb-6 opacity-40" strokeWidth={1.5} />
            <h2 className="text-xl lg:text-2xl font-heading font-bold text-primary mb-3">
              No Scan Data Yet
            </h2>
            <p className="text-secondary/60 font-body text-sm mb-6 leading-relaxed max-w-md mx-auto">
              Run your first scan to see how AI models describe your brand, analyze sentiment, and identify key associations.
            </p>
          </div>

          <ScanProgressModal
            isOpen={showScanModal}
            onClose={() => setShowScanModal(false)}
            scanId={currentScanId}
          />
        </div>
      </>
    )
  }

  // Main content with data
  return (
    <>
      <MobileHeader />
      <div className="max-w-screen-2xl mx-auto pt-20 lg:pt-0 px-4 lg:px-0">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Star className="w-6 h-6 lg:w-8 lg:h-8 text-[#4EE4FF]" strokeWidth={1.5} />
              <h1 className="text-2xl lg:text-4xl font-heading font-bold text-primary">
                Brand Visibility
              </h1>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-secondary/60 mb-2">
                How AI models describe and associate your brand
              </p>
              <p className="text-sm text-secondary/70 italic">
                Last scan: {formatDate(scanData.scan.finished_at || scanData.scan.started_at)}
              </p>
            </div>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-card rounded-lg p-6 border border-border">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-[#4EE4FF]" strokeWidth={1.5} />
            <p className="text-xs text-secondary/60 uppercase tracking-wider">Visibility Index</p>
            <div className="group relative">
              <div className="w-4 h-4 rounded-full border border-secondary/30 flex items-center justify-center cursor-help text-[10px] text-secondary/60">
                ?
              </div>
              <div className="absolute left-0 top-6 w-64 p-3 bg-[#121A24] border border-[#4EE4FF]/30 rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 text-xs text-secondary/90 leading-relaxed">
                How prominently AI mentions your brand. Higher visibility means AI talks about you more often and with more context.
              </div>
            </div>
          </div>
          <div className="text-4xl font-heading font-bold text-primary mb-2">
            {data.visibility_index}
          </div>
          <p className="text-sm text-secondary/60">Brand presence</p>
        </div>

        <div className="bg-card rounded-lg p-6 border border-border">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="w-5 h-5 text-[#4EE4FF]" strokeWidth={1.5} />
            <p className="text-xs text-secondary/60 uppercase tracking-wider">Total Mentions</p>
            <div className="group relative">
              <div className="w-4 h-4 rounded-full border border-secondary/30 flex items-center justify-center cursor-help text-[10px] text-secondary/60">
                ?
              </div>
              <div className="absolute left-0 top-6 w-64 p-3 bg-[#121A24] border border-[#4EE4FF]/30 rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 text-xs text-secondary/90 leading-relaxed">
                How many times AI models referenced your brand. More mentions means greater awareness and reach in AI responses.
              </div>
            </div>
          </div>
          <div className="text-4xl font-heading font-bold text-primary mb-2">
            {data.total_mentions}
          </div>
          <p className="text-sm text-secondary/60">Across all models</p>
        </div>

        <div className="bg-card rounded-lg p-6 border border-border">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-[#4EE4FF]" strokeWidth={1.5} />
            <p className="text-xs text-secondary/60 uppercase tracking-wider">Positive Sentiment</p>
            <div className="group relative">
              <div className="w-4 h-4 rounded-full border border-secondary/30 flex items-center justify-center cursor-help text-[10px] text-secondary/60">
                ?
              </div>
              <div className="absolute left-0 top-6 w-64 p-3 bg-[#121A24] border border-[#4EE4FF]/30 rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 text-xs text-secondary/90 leading-relaxed">
                Percentage of positive words AI uses to describe you. Higher is better—it means AI portrays your brand favorably.
              </div>
            </div>
          </div>
          <div className="text-4xl font-heading font-bold text-primary mb-2">
            {data.sentiment_breakdown.positive}<span className="text-2xl text-secondary/40">%</span>
          </div>
          <p className="text-sm text-secondary/60">Of descriptors</p>
        </div>

        <div className="bg-card rounded-lg p-6 border border-border">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-[#4EE4FF]" strokeWidth={1.5} />
            <p className="text-xs text-secondary/60 uppercase tracking-wider">Descriptors</p>
            <div className="group relative">
              <div className="w-4 h-4 rounded-full border border-secondary/30 flex items-center justify-center cursor-help text-[10px] text-secondary/60">
                ?
              </div>
              <div className="absolute right-0 top-6 w-64 p-3 bg-[#121A24] border border-[#4EE4FF]/30 rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 text-xs text-secondary/90 leading-relaxed">
                Unique words and phrases AI associates with your brand. These shape how people learn about you through AI.
              </div>
            </div>
          </div>
          <div className="text-4xl font-heading font-bold text-primary mb-2">
            {data.descriptors.length}
          </div>
          <p className="text-sm text-secondary/60">Key associations</p>
        </div>
      </div>

      {/* Descriptors Cloud */}
      <div className="bg-card rounded-lg border border-border mb-8">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-heading font-bold text-primary">
            Brand Descriptors
          </h2>
          <p className="text-sm text-secondary/60 mt-1">
            How AI models describe your brand
          </p>
        </div>
        
        <div className="p-6">
          {data.descriptors.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {data.descriptors.map((desc, index) => (
                <span
                  key={index}
                  className={`px-4 py-2 rounded-full border text-sm font-medium ${getSentimentColor(desc.sentiment)}`}
                >
                  {desc.word}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-secondary/60 text-sm text-center py-8">No descriptor data</p>
          )}
        </div>
      </div>

      {/* Sentiment Distribution */}
      <div className="bg-card rounded-lg border border-border mb-8">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-heading font-bold text-primary">
            Sentiment Distribution
          </h2>
          <p className="text-sm text-secondary/60 mt-1">
            Overall brand perception breakdown
          </p>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-heading font-bold text-[#00C6B7] mb-2">
                {data.sentiment_breakdown.positive}%
              </div>
              <p className="text-sm text-secondary/70">Positive</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-heading font-bold text-blue-400 mb-2">
                {data.sentiment_breakdown.neutral}%
              </div>
              <p className="text-sm text-secondary/70">Neutral</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-heading font-bold text-red-400 mb-2">
                {data.sentiment_breakdown.negative}%
              </div>
              <p className="text-sm text-secondary/70">Negative</p>
            </div>
          </div>
        </div>
      </div>

      {/* UPDATED: Optimize Section with ActionCards */}
      <div className="bg-card rounded-lg border border-border">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-heading font-bold text-primary">
            Optimize Brand Visibility
          </h2>
          <p className="text-sm text-secondary/60 mt-1">
            {recommendations.length > 0 
              ? `${recommendations.length} recommended action${recommendations.length === 1 ? '' : 's'} to improve brand perception`
              : 'Actions to improve brand perception'}
          </p>
        </div>
        <div className="p-6">
          {recommendations.length > 0 ? (
            <div className="space-y-4">
              {recommendations.slice(0, 5).map((rec) => (
                <ActionCard
                  key={rec.task.id}
                  task={rec.task}
                  onClick={() => {
                    setSelectedTask(rec.task)
                    setShowActionModal(true)
                  }}
                  context={rec.context}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-secondary/60">
              <p className="mb-2">No specific recommendations at this time.</p>
              <p className="text-sm">Run another scan after implementing changes to see updated suggestions.</p>
            </div>
          )}
        </div>
      </div>

      {/* Action Modal */}
      {selectedTask && (
  <ActionModal
    isOpen={showActionModal}
    onClose={() => {
      setShowActionModal(false)
      setSelectedTask(null)
    }}
    task={selectedTask}
    dashboardId={currentDashboard?.id || ''}
    brandName={currentDashboard?.brand_name || ''}
    context={recommendations.find(r => r.task.id === selectedTask.id)?.context} // NEW LINE!
  />
)}

      <ScanProgressModal
        isOpen={showScanModal}
        onClose={() => setShowScanModal(false)}
        scanId={currentScanId}
      />
      </div>
    </>
  )
}