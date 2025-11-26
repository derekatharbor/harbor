// apps/web/app/dashboard/shopping/page.tsx

'use client'

import { useEffect, useState } from 'react'
import { ShoppingBag, TrendingUp, Trophy, Target } from 'lucide-react'
import ScanProgressModal from '@/components/scan/ScanProgressModal'
import UniversalScanButton from '@/components/scan/UniversalScanButton'
import { useBrand } from '@/contexts/BrandContext'
import MobileHeader from '@/components/layout/MobileHeader'
import ActionCard from '@/components/optimization/ActionCard'
import ActionModal from '@/components/optimization/ActionModal'
import { analyzeShoppingData, ShoppingAnalysis, TaskRecommendation } from '@/lib/optimization/generator'
import { OptimizationTask } from '@/lib/optimization/tasks'

interface ShoppingData {
  score: number
  total_mentions: number
  categories: Array<{
    category: string
    rank: number
    mentions: number
  }>
  competitors: Array<{
    brand: string
    mentions: number
  }>
  models: Array<{
    model: string
    mentions: number
  }>
}

export default function ShoppingVisibilityPage() {
  const { currentDashboard } = useBrand()
  
  const [data, setData] = useState<ShoppingData | null>(null)
  const [scanData, setScanData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showScanModal, setShowScanModal] = useState(false)
  const [currentScanId, setCurrentScanId] = useState<string | null>(null)
  
  // Action items state
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
        
        // Map shopping data from API
        setData(result.shopping)
        
        // Analyze data and generate task recommendations
        if (result.shopping && result.shopping_raw) {
          const analysis: ShoppingAnalysis = {
            ...result.shopping,
            raw_results: result.shopping_raw
          }
          const tasks = analyzeShoppingData(analysis)
          setRecommendations(tasks)
        }
      } catch (error) {
        console.error('Error fetching shopping data:', error)
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

  const handleTaskClick = (task: OptimizationTask) => {
    setSelectedTask(task)
    setShowActionModal(true)
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
                <ShoppingBag className="w-6 h-6 lg:w-8 lg:h-8 text-[#00C6B7]" strokeWidth={1.5} />
                <h1 className="text-2xl lg:text-4xl font-heading font-bold text-primary">
                  Shopping Visibility
                </h1>
              </div>
            </div>
            
            <p className="text-sm text-secondary/60 mb-2">
              How your products surface in AI shopping recommendations
            </p>
          </div>

          <div className="bg-card rounded-xl p-8 lg:p-12 border border-border">
            <div className="max-w-lg mx-auto text-center">
              <div className="w-16 h-16 rounded-full bg-[#00C6B7]/10 flex items-center justify-center mx-auto mb-6">
                <ShoppingBag className="w-8 h-8 text-[#00C6B7]" strokeWidth={1.5} />
              </div>
              
              <h2 className="text-xl lg:text-2xl font-heading font-bold text-primary mb-3">
                Waiting for scan data
              </h2>
              
              <p className="text-secondary/60 text-sm leading-relaxed">
                Once your scan completes, you'll see how ChatGPT, Claude, Gemini, and Perplexity recommend your products in shopping-related queries.
              </p>
            </div>
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
              <ShoppingBag className="w-6 h-6 lg:w-8 lg:h-8 text-[#00C6B7]" strokeWidth={1.5} />
              <h1 className="text-2xl lg:text-4xl font-heading font-bold text-primary">
                Shopping Visibility
              </h1>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-secondary/60 mb-2">
                How your products surface in AI shopping recommendations across models
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
            <Trophy className="w-5 h-5 text-[#00C6B7]" strokeWidth={1.5} />
            <p className="text-xs text-secondary/60 uppercase tracking-wider">Visibility Score</p>
            <div className="group relative">
              <div className="w-4 h-4 rounded-full border border-secondary/30 flex items-center justify-center cursor-help text-[10px] text-secondary/60">
                ?
              </div>
              <div className="absolute left-0 top-6 w-64 p-3 bg-[#121A24] border border-[#00C6B7]/30 rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 text-xs text-secondary/90 leading-relaxed">
                How often your products show up when people ask AI for shopping recommendations. Higher scores mean more visibility.
              </div>
            </div>
          </div>
          <div className="text-4xl font-heading font-bold text-primary mb-2">
            {data.score}<span className="text-2xl text-secondary/40">%</span>
          </div>
          <p className="text-sm text-secondary/60">Overall presence</p>
        </div>

        <div className="bg-card rounded-lg p-6 border border-border">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-[#00C6B7]" strokeWidth={1.5} />
            <p className="text-xs text-secondary/60 uppercase tracking-wider">Total Mentions</p>
            <div className="group relative">
              <div className="w-4 h-4 rounded-full border border-secondary/30 flex items-center justify-center cursor-help text-[10px] text-secondary/60">
                ?
              </div>
              <div className="absolute left-0 top-6 w-64 p-3 bg-[#121A24] border border-[#00C6B7]/30 rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 text-xs text-secondary/90 leading-relaxed">
                Times AI recommended your products across all models. More mentions means you're winning more shopping queries.
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
            <ShoppingBag className="w-5 h-5 text-[#00C6B7]" strokeWidth={1.5} />
            <p className="text-xs text-secondary/60 uppercase tracking-wider">Categories</p>
            <div className="group relative">
              <div className="w-4 h-4 rounded-full border border-secondary/30 flex items-center justify-center cursor-help text-[10px] text-secondary/60">
                ?
              </div>
              <div className="absolute left-0 top-6 w-64 p-3 bg-[#121A24] border border-[#00C6B7]/30 rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 text-xs text-secondary/90 leading-relaxed">
                Product categories where you appear in AI results. More categories means broader discoverability across different searches.
              </div>
            </div>
          </div>
          <div className="text-4xl font-heading font-bold text-primary mb-2">
            {data.categories.length}
          </div>
          <p className="text-sm text-secondary/60">Product categories</p>
        </div>

        <div className="bg-card rounded-lg p-6 border border-border">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-[#00C6B7]" strokeWidth={1.5} />
            <p className="text-xs text-secondary/60 uppercase tracking-wider">Coverage</p>
            <div className="group relative">
              <div className="w-4 h-4 rounded-full border border-secondary/30 flex items-center justify-center cursor-help text-[10px] text-secondary/60">
                ?
              </div>
              <div className="absolute right-0 top-6 w-64 p-3 bg-[#121A24] border border-[#00C6B7]/30 rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 text-xs text-secondary/90 leading-relaxed">
                How many different AI models mention your products. More coverage means you're visible across ChatGPT, Claude, Gemini, and Perplexity.
              </div>
            </div>
          </div>
          <div className="text-4xl font-heading font-bold text-primary mb-2">
            {data.models.length}
          </div>
          <p className="text-sm text-secondary/60">AI models</p>
        </div>
      </div>

      {/* Categories Table */}
      <div className="bg-card rounded-lg border border-border mb-8 overflow-hidden">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-heading font-bold text-primary">
            Category Performance
          </h2>
          <p className="text-sm text-secondary/60 mt-1">
            How you rank in different product categories
          </p>
        </div>
        
        <div className="overflow-x-auto">
          {data.categories.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 text-xs text-secondary/60 uppercase tracking-wider font-medium">Rank</th>
                  <th className="text-left p-4 text-xs text-secondary/60 uppercase tracking-wider font-medium">Category</th>
                  <th className="text-right p-4 text-xs text-secondary/60 uppercase tracking-wider font-medium">Mentions</th>
                </tr>
              </thead>
              <tbody>
                {data.categories.map((category, index) => (
                  <tr 
                    key={index}
                    className="border-b border-border last:border-0 hover:bg-hover transition-colors"
                  >
                    <td className="p-4">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#00C6B7]/10 text-[#00C6B7] font-heading font-bold">
                        {category.rank}
                      </span>
                    </td>
                    <td className="p-4 text-primary font-medium">{category.category}</td>
                    <td className="p-4 text-right text-secondary/70 font-mono">{category.mentions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center text-secondary/60">
              No category data available
            </div>
          )}
        </div>
      </div>

      {/* Competitors & Models Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Competitors */}
        <div className="bg-card rounded-lg border border-border">
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-heading font-bold text-primary">
              Competitor Mentions
            </h2>
          </div>
          <div className="p-6">
            {data.competitors.length > 0 ? (
              <div className="space-y-3">
                {data.competitors.slice(0, 5).map((comp, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-secondary/80">{comp.brand}</span>
                    <span className="font-mono text-primary font-bold">{comp.mentions}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-secondary/60 text-sm text-center py-8">No competitor data</p>
            )}
          </div>
        </div>

        {/* Models */}
        <div className="bg-card rounded-lg border border-border">
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-heading font-bold text-primary">
              Model Coverage
            </h2>
          </div>
          <div className="p-6">
            {data.models.length > 0 ? (
              <div className="space-y-3">
                {data.models.map((model, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-secondary/80 capitalize">{model.model}</span>
                    <span className="font-mono text-primary font-bold">{model.mentions}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-secondary/60 text-sm text-center py-8">No model data</p>
            )}
          </div>
        </div>
      </div>

      {/* Optimize Section */}
      <div className="bg-card rounded-lg border border-border">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-heading font-bold text-primary">
            Optimize Shopping Visibility
          </h2>
          <p className="text-sm text-secondary/60 mt-1">
            {recommendations.length > 0 
              ? `${recommendations.length} recommended action${recommendations.length === 1 ? '' : 's'} to improve your rankings`
              : 'Actions to improve your product rankings'}
          </p>
        </div>
        <div className="p-6">
          {recommendations.length > 0 ? (
            <div className="space-y-4">
              {recommendations.slice(0, 5).map((rec) => (
                <ActionCard
                  key={rec.task.id}
                  task={rec.task}
                  onClick={() => handleTaskClick(rec.task)}
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

      {/* Modals */}
      <ScanProgressModal
        isOpen={showScanModal}
        onClose={() => setShowScanModal(false)}
        scanId={currentScanId}
      />
      
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
        />
      )}
      </div>
    </>
  )
}