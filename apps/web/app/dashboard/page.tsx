'use client'

import { MetricCard } from '@/components/ui/MetricCard'
import { ActionCard } from '@/components/ui/ActionCard'
import { VisibilityChart } from '@/components/dashboard/VisibilityChart'
import { RankingTable } from '@/components/dashboard/RankingTable'
import { TimeRangeFilter } from '@/components/ui/TimeRangeFilter'
import { ShoppingBag, Star, MessageSquare, Globe, Sparkles, TrendingUp, FileCheck } from 'lucide-react'

// Mock data
const visibilityData = [
  { date: 'Jan 29', score: 88, competitor: 92 },
  { date: 'Jan 30', score: 87.5, competitor: 91 },
  { date: 'Jan 31', score: 89, competitor: 90 },
  { date: 'Feb 01', score: 88.5, competitor: 89 },
  { date: 'Feb 02', score: 89.2, competitor: 88.5 },
  { date: 'Feb 03', score: 89.5, competitor: 88 },
  { date: 'Feb 04', score: 89.8, competitor: 87 },
]

const brandRankings = [
  { rank: 1, name: 'Chase', logo: '💳', score: 92, delta: 5, isCurrentUser: false },
  { rank: 2, name: 'Demo Brand', logo: '🏢', score: 89.8, delta: 1, isCurrentUser: true },
  { rank: 3, name: 'American Express', logo: '💎', score: 85.2, delta: -1, isCurrentUser: false },
  { rank: 4, name: 'Capital on Tap', logo: '🏦', score: 78, delta: 5, isCurrentUser: false },
  { rank: 5, name: 'US Bank', logo: '🏛️', score: 76.9, delta: -2, isCurrentUser: false },
]

export default function OverviewPage() {
  return (
    <div className="min-h-screen bg-navy p-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-softgray text-sm mb-2">
          <span className="opacity-60">Demo Brand</span>
          <span className="opacity-40">›</span>
          <span>Overview</span>
        </div>
        <h1 className="text-4xl font-heading font-bold text-white mb-4">
          Overview
        </h1>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <p className="text-softgray opacity-75">
              Last scan: 2 hours ago
            </p>
            <div className="relative flex items-center gap-2 px-3 py-1 bg-teal bg-opacity-10 rounded-full">
              <div className="relative">
                <div className="w-2 h-2 bg-teal rounded-full" />
                <div className="absolute inset-0 w-2 h-2 bg-teal rounded-full animate-sonar" />
              </div>
              <span className="text-teal text-xs font-body">Live</span>
            </div>
          </div>
          <TimeRangeFilter />
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Shopping Visibility"
          value="89.8%"
          delta={1}
          icon={<ShoppingBag size={18} />}
          onClick={() => console.log('Navigate to Shopping')}
          tooltip="How often your products appear in AI shopping recommendations across ChatGPT, Claude, and Gemini"
        />
        <MetricCard
          title="Brand Mentions"
          value="2.7M"
          delta={12}
          description="Estimated monthly volume"
          icon={<Star size={18} />}
          onClick={() => console.log('Navigate to Brand')}
          tooltip="Total estimated mentions of your brand across all AI model responses this month"
        />
        <MetricCard
          title="Conversation Topics"
          value="156"
          delta={8}
          description="Tracked keywords"
          icon={<MessageSquare size={18} />}
          onClick={() => console.log('Navigate to Conversations')}
          tooltip="Number of distinct topics and questions users ask AI about your brand or category"
        />
        <MetricCard
          title="Site Readability"
          value="94%"
          delta={3}
          description="AI-optimized score"
          icon={<Globe size={18} />}
          onClick={() => console.log('Navigate to Website')}
          tooltip="How well AI models can understand and extract information from your website content"
        />
      </div>

      {/* Brand Visibility Section */}
      <div className="mb-8">
        <div className="mb-4">
          <h2 className="text-2xl font-heading font-semibold text-white mb-2">
            Brand Visibility
          </h2>
          <p className="text-softgray opacity-75 text-sm">
            Percentage of AI answers about business credit cards that mention your brand
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Visibility Chart */}
          <div className="lg:col-span-2 harbor-card group hover:shadow-lg transition-all duration-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-sm font-body text-softgray opacity-75 uppercase tracking-wide mb-2">
                  Visibility Score
                </h3>
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-heading font-bold text-white group-hover:text-cerulean transition-colors" style={{ fontVariantNumeric: 'tabular-nums' }}>
                    89.8%
                  </span>
                  <span className="text-sm font-body flex items-center gap-1 text-cyan opacity-90">
                    <span>↑</span>
                    <span>1%</span>
                    <span className="text-softgray opacity-60">vs last week</span>
                  </span>
                </div>
              </div>
              <button className="px-3 py-1 text-xs font-body text-teal border border-teal rounded-lg hover:bg-teal hover:text-white transition-colors">
                Compare to Industry
              </button>
            </div>
            <VisibilityChart data={visibilityData} height={250} />
          </div>

          {/* Rankings */}
          <div>
            <RankingTable data={brandRankings} />
          </div>
        </div>
      </div>

      {/* Action Cards - New Bottom Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-heading font-semibold text-white mb-6">
          Recommended Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ActionCard
            title="Boost AI Shopping Presence"
            description="Optimize product schema and descriptions to increase mentions in AI shopping results"
            icon={<Sparkles size={20} />}
            trend="+1.9% potential"
            ctaText="View Optimization"
            onClick={() => console.log('Navigate to Shopping optimization')}
          />
          <ActionCard
            title="Understand How AI Describes You"
            description="Deep dive into how AI describes your brand and identify sentiment patterns"
            icon={<TrendingUp size={20} />}
            trend="+12% growth"
            ctaText="View Intelligence"
            onClick={() => console.log('Navigate to Brand analysis')}
          />
          <ActionCard
            title="Enhance Site Clarity for AI"
            description="See which pages need optimization for better AI comprehension"
            icon={<FileCheck size={20} />}
            trend="3 issues found"
            ctaText="View Report"
            onClick={() => console.log('Navigate to Website report')}
          />
        </div>
      </div>
    </div>
  )
}