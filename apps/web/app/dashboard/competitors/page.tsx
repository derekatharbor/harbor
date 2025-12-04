// apps/web/app/dashboard/competitors/page.tsx
// Competitive Intelligence - Compare your brand against competitors in AI search

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Users,
  TrendingUp,
  TrendingDown,
  Eye,
  MessageSquare,
  Target,
  Crown,
  BarChart3,
  AlertCircle
} from 'lucide-react'
import { useBrand } from '@/contexts/BrandContext'
import MobileHeader from '@/components/layout/MobileHeader'

// ============================================================================
// TYPES
// ============================================================================

interface CompetitorData {
  rank: number
  name: string
  domain: string | null
  logo: string
  visibility: number
  visibilityDelta: number | null
  sentiment: number
  sentimentDelta: number | null
  position: number
  positionDelta: number | null
  mentions: number
  isUser: boolean
  color: string
}

interface ApiResponse {
  competitors: CompetitorData[]
  total_brands_found: number
  user_rank: number | null
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function CompetitorsPage() {
  const { currentDashboard } = useBrand()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [competitors, setCompetitors] = useState<CompetitorData[]>([])
  const [totalBrands, setTotalBrands] = useState(0)
  const [userRank, setUserRank] = useState<number | null>(null)
  const [selectedCompetitor, setSelectedCompetitor] = useState<CompetitorData | null>(null)

  const brandName = currentDashboard?.brand_name || 'Your Brand'

  useEffect(() => {
    async function fetchCompetitors() {
      if (!currentDashboard?.id) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const response = await fetch(`/api/dashboard/${currentDashboard.id}/competitors?limit=15`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch competitors')
        }

        const data: ApiResponse = await response.json()
        
        setCompetitors(data.competitors || [])
        setTotalBrands(data.total_brands_found || 0)
        setUserRank(data.user_rank)
        
        // Select first non-user competitor by default
        const firstCompetitor = data.competitors?.find(c => !c.isUser)
        if (firstCompetitor) {
          setSelectedCompetitor(firstCompetitor)
        }
        
      } catch (err) {
        console.error('Error fetching competitors:', err)
        setError(err instanceof Error ? err.message : 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    fetchCompetitors()
  }, [currentDashboard?.id])

  // Get user's data
  const userData = competitors.find(c => c.isUser)
  const competitorData = competitors.filter(c => !c.isUser)

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-primary" data-page="competitors">
        <MobileHeader />
        <div className="p-6 animate-pulse space-y-6">
          <div className="h-8 bg-card rounded w-48"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1,2,3].map(i => <div key={i} className="h-32 bg-card rounded-lg"></div>)}
          </div>
          <div className="h-96 bg-card rounded-lg"></div>
        </div>
      </div>
    )
  }

  // Empty state
  if (competitors.length === 0) {
    return (
      <div className="min-h-screen bg-primary" data-page="competitors">
        <MobileHeader />
        <div className="p-6">
          <h1 className="text-2xl font-semibold text-primary mb-6">Competitive Intelligence</h1>
          <div className="card p-12 text-center">
            <AlertCircle className="w-12 h-12 text-muted mx-auto mb-4" />
            <h3 className="text-lg font-medium text-primary mb-2">No Competitor Data Yet</h3>
            <p className="text-secondary mb-6">
              Run prompts related to your industry to see how you compare against other brands in AI responses.
            </p>
            <Link 
              href="/dashboard/prompts" 
              className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90"
            >
              <Target className="w-4 h-4" />
              View Prompts
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-primary" data-page="competitors">
      <MobileHeader />

      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-primary">Competitive Intelligence</h1>
            <p className="text-secondary mt-1">
              {totalBrands} brands found in AI responses
            </p>
          </div>
          {userRank && (
            <div className="flex items-center gap-2 px-4 py-2 bg-card rounded-lg border border-border">
              <Crown className="w-4 h-4 text-accent" />
              <span className="text-sm text-secondary">Your rank:</span>
              <span className="text-lg font-semibold text-primary">#{userRank}</span>
              <span className="text-sm text-muted">of {totalBrands}</span>
            </div>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Your Visibility */}
          <div className="card p-5">
            <div className="flex items-center gap-2 text-muted mb-3">
              <Eye className="w-4 h-4" />
              <span className="text-xs uppercase tracking-wider">Your Visibility</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-semibold text-primary">
                {userData?.visibility || 0}%
              </span>
              {userData?.visibilityDelta !== null && userData?.visibilityDelta !== undefined && (
                <span className={`text-sm ${userData.visibilityDelta > 0 ? 'text-positive' : 'text-negative'}`}>
                  {userData.visibilityDelta > 0 ? '↑' : '↓'} {Math.abs(userData.visibilityDelta)}%
                </span>
              )}
            </div>
            <p className="text-xs text-muted mt-2">Relative to top competitor</p>
          </div>

          {/* Your Sentiment */}
          <div className="card p-5">
            <div className="flex items-center gap-2 text-muted mb-3">
              <MessageSquare className="w-4 h-4" />
              <span className="text-xs uppercase tracking-wider">Your Sentiment</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-semibold text-primary">
                {userData?.sentiment || 0}%
              </span>
              {userData?.sentimentDelta !== null && userData?.sentimentDelta !== undefined && (
                <span className={`text-sm ${userData.sentimentDelta > 0 ? 'text-positive' : 'text-negative'}`}>
                  {userData.sentimentDelta > 0 ? '↑' : '↓'} {Math.abs(userData.sentimentDelta)}%
                </span>
              )}
            </div>
            <p className="text-xs text-muted mt-2">Positive mention rate</p>
          </div>

          {/* Your Position */}
          <div className="card p-5">
            <div className="flex items-center gap-2 text-muted mb-3">
              <Target className="w-4 h-4" />
              <span className="text-xs uppercase tracking-wider">Avg Position</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-semibold text-primary">
                {userData?.position?.toFixed(1) || '-'}
              </span>
              {userData?.positionDelta !== null && userData?.positionDelta !== undefined && (
                <span className={`text-sm ${userData.positionDelta < 0 ? 'text-positive' : 'text-negative'}`}>
                  {userData.positionDelta < 0 ? '↑' : '↓'} {Math.abs(userData.positionDelta).toFixed(1)}
                </span>
              )}
            </div>
            <p className="text-xs text-muted mt-2">When mentioned in responses</p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Competitor List */}
          <div className="lg:col-span-1 card p-0 overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <h3 className="font-medium text-primary">All Brands</h3>
            </div>
            <div className="divide-y divide-border max-h-[500px] overflow-y-auto">
              {competitors.map((comp) => (
                <button
                  key={comp.name}
                  onClick={() => !comp.isUser && setSelectedCompetitor(comp)}
                  className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-hover transition-colors text-left ${
                    selectedCompetitor?.name === comp.name ? 'bg-hover' : ''
                  } ${comp.isUser ? 'bg-accent/5' : ''}`}
                >
                  <span className={`w-6 text-sm font-medium ${comp.isUser ? 'text-accent' : 'text-muted'}`}>
                    {comp.rank}
                  </span>
                  <img 
                    src={`https://cdn.brandfetch.io/${comp.name.toLowerCase().replace(/\s+/g, '').replace(/\.com$/i, '')}.com/w/400/h/400`}
                    alt=""
                    className="w-8 h-8 rounded bg-card"
                    onError={(e) => { e.currentTarget.style.display = 'none' }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-primary truncate">{comp.name}</span>
                      {comp.isUser && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-accent/10 text-accent rounded">YOU</span>
                      )}
                    </div>
                    <span className="text-xs text-muted">{comp.mentions} mentions</span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-primary">{comp.visibility}%</div>
                    <div className="text-xs text-muted">visibility</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Comparison View */}
          <div className="lg:col-span-2 space-y-6">
            {selectedCompetitor && userData ? (
              <>
                {/* Head to Head */}
                <div className="card p-6">
                  <h3 className="font-medium text-primary mb-6">
                    {brandName} vs {selectedCompetitor.name}
                  </h3>
                  
                  <div className="space-y-6">
                    {/* Visibility Comparison */}
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted">Visibility</span>
                        <div className="flex gap-4">
                          <span className="text-accent font-medium">{userData.visibility}%</span>
                          <span className="text-secondary font-medium">{selectedCompetitor.visibility}%</span>
                        </div>
                      </div>
                      <div className="flex gap-1 h-3">
                        <div 
                          className="bg-accent rounded-l"
                          style={{ width: `${(userData.visibility / (userData.visibility + selectedCompetitor.visibility)) * 100}%` }}
                        />
                        <div 
                          className="bg-secondary/30 rounded-r"
                          style={{ width: `${(selectedCompetitor.visibility / (userData.visibility + selectedCompetitor.visibility)) * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Sentiment Comparison */}
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted">Sentiment</span>
                        <div className="flex gap-4">
                          <span className="text-accent font-medium">{userData.sentiment}%</span>
                          <span className="text-secondary font-medium">{selectedCompetitor.sentiment}%</span>
                        </div>
                      </div>
                      <div className="flex gap-1 h-3">
                        <div 
                          className="bg-accent rounded-l"
                          style={{ width: `${(userData.sentiment / (userData.sentiment + selectedCompetitor.sentiment)) * 100}%` }}
                        />
                        <div 
                          className="bg-secondary/30 rounded-r"
                          style={{ width: `${(selectedCompetitor.sentiment / (userData.sentiment + selectedCompetitor.sentiment)) * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Mentions Comparison */}
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted">Mentions</span>
                        <div className="flex gap-4">
                          <span className="text-accent font-medium">{userData.mentions}</span>
                          <span className="text-secondary font-medium">{selectedCompetitor.mentions}</span>
                        </div>
                      </div>
                      <div className="flex gap-1 h-3">
                        <div 
                          className="bg-accent rounded-l"
                          style={{ width: `${(userData.mentions / (userData.mentions + selectedCompetitor.mentions)) * 100}%` }}
                        />
                        <div 
                          className="bg-secondary/30 rounded-r"
                          style={{ width: `${(selectedCompetitor.mentions / (userData.mentions + selectedCompetitor.mentions)) * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Position Comparison */}
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted">Avg Position (lower is better)</span>
                        <div className="flex gap-4">
                          <span className="text-accent font-medium">{userData.position?.toFixed(1) || '-'}</span>
                          <span className="text-secondary font-medium">{selectedCompetitor.position?.toFixed(1) || '-'}</span>
                        </div>
                      </div>
                      <div className="flex gap-1 h-3">
                        {userData.position && selectedCompetitor.position && (
                          <>
                            <div 
                              className="bg-accent rounded-l"
                              style={{ width: `${((1/userData.position) / ((1/userData.position) + (1/selectedCompetitor.position))) * 100}%` }}
                            />
                            <div 
                              className="bg-secondary/30 rounded-r"
                              style={{ width: `${((1/selectedCompetitor.position) / ((1/userData.position) + (1/selectedCompetitor.position))) * 100}%` }}
                            />
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="mt-6 pt-6 border-t border-border">
                    <div className={`flex items-center gap-2 ${
                      userData.visibility > selectedCompetitor.visibility ? 'text-positive' : 'text-negative'
                    }`}>
                      {userData.visibility > selectedCompetitor.visibility ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4" />
                      )}
                      <span className="text-sm font-medium">
                        {userData.visibility > selectedCompetitor.visibility 
                          ? `You're ${userData.visibility - selectedCompetitor.visibility} points ahead in visibility`
                          : `${selectedCompetitor.name} leads by ${selectedCompetitor.visibility - userData.visibility} points in visibility`
                        }
                      </span>
                    </div>
                  </div>
                </div>

                {/* Trend placeholder */}
                <div className="card p-6">
                  <h3 className="font-medium text-primary mb-4">Visibility Trend</h3>
                  <div className="h-48 flex items-center justify-center text-center">
                    <div>
                      <BarChart3 className="w-10 h-10 text-muted mx-auto mb-3 opacity-40" />
                      <p className="text-sm text-muted">Historical trend data coming soon</p>
                      <p className="text-xs text-muted mt-1">Check back after more scans to see trends</p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="card p-12 text-center">
                <Users className="w-10 h-10 text-muted mx-auto mb-3" />
                <p className="text-secondary">Select a competitor to compare</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}