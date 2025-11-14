// apps/web/app/dashboard/shopping/page.tsx

'use client'

import { useEffect, useState } from 'react'
import { ShoppingBag, TrendingUp, Trophy, Target, ArrowRight } from 'lucide-react'
import ScanProgressModal from '@/components/scan/ScanProgressModal'
import UniversalScanButton from '@/components/scan/UniversalScanButton'
import { useBrand } from '@/contexts/BrandContext'

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

  // Loading skeleton
  if (loading) {
    return (
      <div className="animate-pulse space-y-8">
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
      <div>
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-8 h-8 text-[#00C6B7]" strokeWidth={1.5} />
              <h1 className="text-4xl font-heading font-bold text-primary">
                Shopping Visibility
              </h1>
            </div>
            <UniversalScanButton />
          </div>
          
          <p className="text-sm text-secondary/60 mb-2">
            How your products surface in AI shopping recommendations across models
          </p>
        </div>

        <div className="bg-card rounded-lg p-12 border border-border text-center">
          <ShoppingBag className="w-16 h-16 text-[#00C6B7] mx-auto mb-6 opacity-40" strokeWidth={1.5} />
          <h2 className="text-2xl font-heading font-bold text-primary mb-3">
            No Scan Data Yet
          </h2>
          <p className="text-secondary/60 font-body text-sm mb-6 leading-relaxed max-w-md mx-auto">
            Run your first scan to see how your products appear in AI shopping recommendations across ChatGPT, Claude, Gemini, and Perplexity.
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
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-8 h-8 text-[#00C6B7]" strokeWidth={1.5} />
            <h1 className="text-4xl font-heading font-bold text-primary">
              Shopping Visibility
            </h1>
          </div>
          <UniversalScanButton />
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
      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="bg-card rounded-lg p-6 border border-border">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-5 h-5 text-[#00C6B7]" strokeWidth={1.5} />
            <p className="text-xs text-secondary/60 uppercase tracking-wider">Visibility Score</p>
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
          </div>
          <div className="text-4xl font-heading font-bold text-primary mb-2">
            {data.models.length}
          </div>
          <p className="text-sm text-secondary/60">AI models</p>
        </div>
      </div>

      {/* Categories Table */}
      <div className="bg-card rounded-lg border border-border mb-8">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-heading font-bold text-primary">
            Category Performance
          </h2>
          <p className="text-sm text-secondary/60 mt-1">
            How you rank in different product categories
          </p>
        </div>
        
        <div className="overflow-hidden">
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
      <div className="grid grid-cols-2 gap-6 mb-8">
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
            Actions to improve your product rankings
          </p>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 rounded-lg border border-border hover:border-[#00C6B7]/30 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-[#00C6B7]/10 flex items-center justify-center flex-shrink-0">
                <ShoppingBag className="w-5 h-5 text-[#00C6B7]" strokeWidth={1.5} />
              </div>
              <div className="flex-1">
                <h3 className="font-heading font-semibold text-primary mb-1">
                  Add Product Schema
                </h3>
                <p className="text-sm text-secondary/70 mb-3">
                  Implement Product JSON-LD schema on your product pages to help AI models understand your offerings.
                </p>
                <button className="text-sm text-[#00C6B7] hover:underline font-medium inline-flex items-center gap-1">
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