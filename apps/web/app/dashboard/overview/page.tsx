// app/dashboard/overview/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShoppingBag, Star, MessageSquare, Globe, TrendingUp, Award } from 'lucide-react'

interface ScanData {
  hasScans: boolean
  scan?: {
    id: string
    status: string
    startedAt: string
    finishedAt: string
  }
  dashboard?: {
    brandName: string
  }
  results?: {
    shopping: any[]
    brand: any[]
    conversations: any[]
    site: any[]
  }
  scores?: {
    shopping_score: number
    brand_score: number
    conversation_score: number
    website_score: number
    overall_score: number
    shopping_rank: number
    brand_mentions: number
  } | null
}

export default function OverviewPage() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<ScanData | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch('/api/scan/latest')
        const scanData = await response.json()

        if (!scanData.hasScans) {
          router.push('/dashboard')
          return
        }

        setData(scanData)
      } catch (error) {
        console.error('Failed to load overview data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#101A31] flex items-center justify-center">
        <div className="text-white font-body">Loading your intelligence...</div>
      </div>
    )
  }

  if (!data || !data.hasScans) {
    return null
  }

  const scores = data.scores || {
    shopping_score: 0,
    brand_score: 0,
    conversation_score: 0,
    website_score: 60,
    overall_score: 0,
    shopping_rank: 0,
    brand_mentions: 0,
  }

  const modules = [
    {
      name: 'Shopping Visibility',
      icon: ShoppingBag,
      score: scores.shopping_score,
      delta: '+2.3%',
      description: 'Product mentions in AI shopping recommendations',
      href: '/dashboard/shopping',
      color: '#4EE4FF',
      count: data.results?.shopping.length || 0,
      label: 'mentions',
    },
    {
      name: 'Brand Visibility',
      icon: Star,
      score: scores.brand_score,
      delta: '+5.2%',
      description: 'How AI describes your brand',
      href: '/dashboard/brand',
      color: '#FF6B4A',
      count: scores.brand_mentions,
      label: 'descriptors',
    },
    {
      name: 'Conversation Volumes',
      icon: MessageSquare,
      score: scores.conversation_score,
      delta: '+3.1%',
      description: 'Questions users ask AI about you',
      href: '/dashboard/conversations',
      color: '#2979FF',
      count: data.results?.conversations.length || 0,
      label: 'questions',
    },
    {
      name: 'Website Analytics',
      icon: Globe,
      score: scores.website_score,
      delta: '+1.2%',
      description: 'How AI crawlers read your site',
      href: '/dashboard/website',
      color: '#F4F6F8',
      count: data.results?.site.length || 0,
      label: 'issues',
    },
  ]

  return (
    <div className="min-h-screen bg-[#101A31]">
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-heading font-bold text-white mb-3">
            Overview
          </h1>
          <div className="flex items-center gap-4">
            <p className="text-softgray font-body text-lg">
              {data.dashboard?.brandName} Intelligence Dashboard
            </p>
            <div className="flex items-center gap-2 px-3 py-1 bg-teal/20 border border-teal/30 rounded-full">
              <div className="w-2 h-2 bg-teal rounded-full animate-pulse" />
              <span className="text-teal text-xs font-body uppercase tracking-wide">Live</span>
            </div>
          </div>
          <p className="text-softgray/60 text-sm font-body mt-2">
            Last scan: {new Date(data.scan?.finishedAt || '').toLocaleString()}
          </p>
        </div>

        {/* Overall Score Card */}
        <div className="bg-gradient-to-br from-[#141E38] to-[#0F1629] rounded-xl border border-white/10 p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal/5 rounded-full blur-3xl" />
          <div className="relative">
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-softgray text-sm font-body uppercase tracking-wide mb-2">
                  Overall Visibility Score
                </p>
                <div className="flex items-baseline gap-4">
                  <h2 className="text-6xl font-heading font-bold text-white">
                    {scores.overall_score.toFixed(1)}%
                  </h2>
                  <div className="flex items-center gap-1 text-teal text-lg font-body">
                    <TrendingUp className="w-5 h-5" />
                    <span>+4.2% vs last week</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <Award className="w-12 h-12 text-coral mb-2 ml-auto" />
                <p className="text-softgray text-sm font-body">Market Rank</p>
                <p className="text-white text-2xl font-heading font-bold">
                  #{scores.shopping_rank || 'N/A'}
                </p>
              </div>
            </div>

            {/* Progress bars for each module */}
            <div className="grid grid-cols-4 gap-4">
              {modules.map((module) => (
                <div key={module.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-softgray text-xs font-body">{module.name}</span>
                    <span className="text-white text-sm font-heading font-semibold">
                      {module.score.toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-2 bg-navy rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{
                        width: `${module.score}%`,
                        backgroundColor: module.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Module Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {modules.map((module) => {
            const Icon = module.icon
            return (
              <div
                key={module.name}
                onClick={() => router.push(module.href)}
                className="bg-[#141E38] rounded-lg border border-white/5 p-6 hover:border-white/20 transition-all cursor-pointer group hover:translate-y-[-2px]"
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: `${module.color}20` }}
                  >
                    <Icon className="w-6 h-6" style={{ color: module.color }} />
                  </div>
                  <div className="flex items-center gap-1 text-xs text-teal font-body">
                    <TrendingUp className="w-3 h-3" />
                    <span>{module.delta}</span>
                  </div>
                </div>

                <h3 className="text-white font-heading font-semibold mb-2 text-sm">
                  {module.name}
                </h3>

                <p className="text-softgray/75 text-xs font-body mb-4 line-clamp-2">
                  {module.description}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <div>
                    <p className="text-2xl font-heading font-bold text-white">
                      {module.score.toFixed(1)}%
                    </p>
                    <p className="text-softgray text-xs font-body">
                      {module.count} {module.label}
                    </p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                    <span className="text-white text-sm">→</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Quick Stats Row */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-[#141E38] rounded-lg border border-white/5 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-coral/20 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-coral" />
              </div>
              <div>
                <p className="text-softgray text-xs font-body">Product Mentions</p>
                <p className="text-white text-2xl font-heading font-bold">
                  {data.results?.shopping.length || 0}
                </p>
              </div>
            </div>
            <p className="text-softgray/75 text-xs font-body">
              Across ChatGPT, Claude, and Gemini
            </p>
          </div>

          <div className="bg-[#141E38] rounded-lg border border-white/5 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-cerulean/20 flex items-center justify-center">
                <Star className="w-5 h-5 text-cerulean" />
              </div>
              <div>
                <p className="text-softgray text-xs font-body">Brand Descriptors</p>
                <p className="text-white text-2xl font-heading font-bold">
                  {scores.brand_mentions}
                </p>
              </div>
            </div>
            <p className="text-softgray/75 text-xs font-body">
              {Math.round((data.results?.brand.filter(b => b.sentiment === 'pos').length || 0) / 
                (data.results?.brand.length || 1) * 100)}% positive sentiment
            </p>
          </div>

          <div className="bg-[#141E38] rounded-lg border border-white/5 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-teal/20 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-teal" />
              </div>
              <div>
                <p className="text-softgray text-xs font-body">Questions Identified</p>
                <p className="text-white text-2xl font-heading font-bold">
                  {data.results?.conversations.length || 0}
                </p>
              </div>
            </div>
            <p className="text-softgray/75 text-xs font-body">
              Common user queries about your brand
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
