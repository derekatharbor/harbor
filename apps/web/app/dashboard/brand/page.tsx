// app/dashboard/brand/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Star, TrendingUp, Users, AlertCircle } from 'lucide-react'

interface BrandDescriptor {
  word: string
  sentiment: 'pos' | 'neu' | 'neg'
  weight: number
  model: string
}

interface CompetitorData {
  name: string
  mentionCount: number
  context: string[]
}

export default function BrandVisibilityPage() {
  const [loading, setLoading] = useState(true)
  const [descriptors, setDescriptors] = useState<BrandDescriptor[]>([])
  const [competitors, setCompetitors] = useState<CompetitorData[]>([])
  const [brandScore, setBrandScore] = useState<number>(0)
  const [totalMentions, setTotalMentions] = useState<number>(0)
  const [brandName, setBrandName] = useState('')

  const supabase = createClientComponentClient()

  useEffect(() => {
    async function loadBrandData() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return

        const { data: userRole } = await supabase
          .from('user_roles')
          .select('org_id')
          .eq('user_id', session.user.id)
          .single()

        if (!userRole) return

        const { data: dashboard } = await supabase
          .from('dashboards')
          .select('id, brand_name')
          .eq('org_id', userRole.org_id)
          .single()

        if (!dashboard) return

        setBrandName(dashboard.brand_name)

        const { data: latestScan } = await supabase
          .from('scans')
          .select('id')
          .eq('dashboard_id', dashboard.id)
          .eq('status', 'done')
          .order('finished_at', { ascending: false })
          .limit(1)
          .single()

        if (!latestScan) {
          setLoading(false)
          return
        }

        // Get visibility score
        const { data: scoreData } = await supabase
          .from('visibility_scores')
          .select('brand_score, brand_mentions')
          .eq('scan_id', latestScan.id)
          .single()

        if (scoreData) {
          setBrandScore(scoreData.brand_score || 0)
          setTotalMentions(scoreData.brand_mentions || 0)
        }

        // Get brand descriptors
        const { data: descriptorData } = await supabase
          .from('results_brand')
          .select('*')
          .eq('scan_id', latestScan.id)
          .order('weight', { ascending: false })

        if (descriptorData) {
          setDescriptors(
            descriptorData.map(d => ({
              word: d.descriptor,
              sentiment: d.sentiment,
              weight: d.weight || 10,
              model: d.source_model,
            }))
          )
        }

        // Get competitor data
        const { data: competitorData } = await supabase
          .from('brand_competitors')
          .select('*')
          .eq('scan_id', latestScan.id)

        if (competitorData) {
          const competitorMap = new Map<string, CompetitorData>()

          competitorData.forEach(c => {
            if (!competitorMap.has(c.competitor_name)) {
              competitorMap.set(c.competitor_name, {
                name: c.competitor_name,
                mentionCount: 0,
                context: [],
              })
            }
            const comp = competitorMap.get(c.competitor_name)!
            comp.mentionCount++
            if (c.comparison_context) {
              comp.context.push(c.comparison_context)
            }
          })

          setCompetitors(
            Array.from(competitorMap.values())
              .sort((a, b) => b.mentionCount - a.mentionCount)
              .slice(0, 5)
          )
        }

      } catch (error) {
        console.error('Error loading brand data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadBrandData()
  }, [supabase])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#101A31] flex items-center justify-center">
        <div className="text-white font-mono">Loading brand visibility...</div>
      </div>
    )
  }

  if (descriptors.length === 0) {
    return (
      <div className="min-h-screen bg-[#101A31] p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-[#141E38] rounded-xl border border-white/5 p-12 text-center">
            <AlertCircle className="w-12 h-12 text-coral mx-auto mb-4" />
            <h2 className="text-xl font-heading font-semibold text-white mb-2">
              No brand data yet
            </h2>
            <p className="text-softgray font-body">
              Run a scan to see how AI describes your brand
            </p>
          </div>
        </div>
      </div>
    )
  }

  const sentimentCounts = {
    pos: descriptors.filter(d => d.sentiment === 'pos').length,
    neu: descriptors.filter(d => d.sentiment === 'neu').length,
    neg: descriptors.filter(d => d.sentiment === 'neg').length,
  }

  const sentimentPercentage = {
    pos: (sentimentCounts.pos / descriptors.length) * 100,
    neu: (sentimentCounts.neu / descriptors.length) * 100,
    neg: (sentimentCounts.neg / descriptors.length) * 100,
  }

  return (
    <div className="min-h-screen bg-[#101A31]">
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <Star className="w-8 h-8 text-coral" />
            <h1 className="text-3xl font-heading font-bold text-white">
              Brand Visibility
            </h1>
          </div>
          <p className="text-softgray font-body text-lg">
            How AI describes and associates your brand
          </p>
        </div>

        {/* Score Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-[#141E38] rounded-lg border border-white/5 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-softgray text-sm font-body">Brand Score</span>
              <Star className="w-4 h-4 text-coral" />
            </div>
            <div className="text-3xl font-heading font-bold text-white mb-1">
              {brandScore.toFixed(1)}%
            </div>
            <div className="flex items-center gap-1 text-cerulean text-sm font-body">
              <TrendingUp className="w-3 h-3" />
              <span>+5.2% vs last scan</span>
            </div>
          </div>

          <div className="bg-[#141E38] rounded-lg border border-white/5 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-softgray text-sm font-body">Total Mentions</span>
            </div>
            <div className="text-3xl font-heading font-bold text-white mb-1">
              {totalMentions}
            </div>
            <div className="text-softgray text-sm font-body">
              Across all models
            </div>
          </div>

          <div className="bg-[#141E38] rounded-lg border border-white/5 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-softgray text-sm font-body">Positive Sentiment</span>
            </div>
            <div className="text-3xl font-heading font-bold text-white mb-1">
              {sentimentPercentage.pos.toFixed(0)}%
            </div>
            <div className="text-softgray text-sm font-body">
              {sentimentCounts.pos} descriptors
            </div>
          </div>

          <div className="bg-[#141E38] rounded-lg border border-white/5 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-softgray text-sm font-body">Competitors</span>
              <Users className="w-4 h-4 text-softgray" />
            </div>
            <div className="text-3xl font-heading font-bold text-white mb-1">
              {competitors.length}
            </div>
            <div className="text-softgray text-sm font-body">
              Identified
            </div>
          </div>
        </div>

        {/* Descriptor Cloud */}
        <div className="bg-[#141E38] rounded-lg border border-white/5 p-6 mb-8">
          <h3 className="text-xl font-heading font-semibold text-white mb-6">
            Brand Descriptors
          </h3>

          <div className="flex flex-wrap gap-3 mb-8">
            {descriptors.slice(0, 20).map((desc, idx) => {
              const sizeClass = desc.weight > 15 ? 'text-xl' : desc.weight > 10 ? 'text-lg' : 'text-base'
              const colorClass =
                desc.sentiment === 'pos'
                  ? 'bg-cerulean/20 text-cerulean border-cerulean/30'
                  : desc.sentiment === 'neg'
                  ? 'bg-coral/20 text-coral border-coral/30'
                  : 'bg-softgray/20 text-softgray border-softgray/30'

              return (
                <div
                  key={idx}
                  className={`px-4 py-2 rounded-full border ${colorClass} ${sizeClass} font-body font-medium`}
                >
                  {desc.word}
                </div>
              )
            })}
          </div>

          {/* Sentiment Breakdown */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-[#101A31] rounded-lg p-4 border border-cerulean/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-cerulean text-sm font-body uppercase tracking-wide">
                  Positive
                </span>
                <span className="text-2xl font-heading font-bold text-cerulean">
                  {sentimentCounts.pos}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {descriptors
                  .filter(d => d.sentiment === 'pos')
                  .slice(0, 5)
                  .map((d, i) => (
                    <span key={i} className="text-xs text-cerulean/80 font-body">
                      {d.word}
                    </span>
                  ))}
              </div>
            </div>

            <div className="bg-[#101A31] rounded-lg p-4 border border-softgray/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-softgray text-sm font-body uppercase tracking-wide">
                  Neutral
                </span>
                <span className="text-2xl font-heading font-bold text-softgray">
                  {sentimentCounts.neu}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {descriptors
                  .filter(d => d.sentiment === 'neu')
                  .slice(0, 5)
                  .map((d, i) => (
                    <span key={i} className="text-xs text-softgray/80 font-body">
                      {d.word}
                    </span>
                  ))}
              </div>
            </div>

            <div className="bg-[#101A31] rounded-lg p-4 border border-coral/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-coral text-sm font-body uppercase tracking-wide">
                  Negative
                </span>
                <span className="text-2xl font-heading font-bold text-coral">
                  {sentimentCounts.neg}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {descriptors
                  .filter(d => d.sentiment === 'neg')
                  .slice(0, 5)
                  .map((d, i) => (
                    <span key={i} className="text-xs text-coral/80 font-body">
                      {d.word}
                    </span>
                  ))}
              </div>
            </div>
          </div>
        </div>

        {/* Competitor Analysis */}
        {competitors.length > 0 && (
          <div className="bg-[#141E38] rounded-lg border border-white/5 p-6">
            <h3 className="text-xl font-heading font-semibold text-white mb-6">
              Competitor Landscape
            </h3>

            <div className="space-y-4">
              {competitors.map((comp, idx) => (
                <div
                  key={idx}
                  className="bg-[#101A31] rounded-lg p-4 border border-white/5 hover:border-white/10 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-navy flex items-center justify-center">
                        <span className="text-sm font-heading text-white">
                          {comp.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-base font-body font-semibold text-white">
                          {comp.name}
                        </h4>
                        <p className="text-xs text-softgray font-body">
                          {comp.mentionCount} co-mentions
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-heading text-softgray">
                        Rank #{idx + 1}
                      </div>
                    </div>
                  </div>

                  {comp.context.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-white/5">
                      <p className="text-xs text-softgray font-body italic">
                        "{comp.context[0]}"
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}