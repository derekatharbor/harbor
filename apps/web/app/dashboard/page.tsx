import { MetricCard } from '@/components/ui/MetricCard'
import { VisibilityChart } from '@/components/dashboard/VisibilityChart'
import { RankingTable } from '@/components/dashboard/RankingTable'
import { TimeRangeFilter } from '@/components/ui/TimeRangeFilter'
import { ShoppingBag, Star, MessageSquare, Globe } from 'lucide-react'

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
  { rank: 1, name: 'Chase', logo: '💳', score: 92, delta: 5 },
  { rank: 2, name: 'Demo Brand', logo: '🏢', score: 89.8, delta: 1 },
  { rank: 3, name: 'American Express', logo: '💎', score: 85.2, delta: -1 },
  { rank: 4, name: 'Capital on Tap', logo: '🏦', score: 78, delta: 5 },
  { rank: 5, name: 'US Bank', logo: '🏛️', score: 76.9, delta: -2 },
]

export default function OverviewPage() {
  return (
    <div className="min-h-screen bg-navy p-8">
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
          <p className="text-softgray opacity-75">
            Last scan: 2 hours ago
          </p>
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
        />
        <MetricCard
          title="Brand Mentions"
          value="2.7M"
          delta={12}
          description="Estimated monthly volume"
          icon={<Star size={18} />}
        />
        <MetricCard
          title="Conversation Topics"
          value="156"
          delta={8}
          description="Tracked keywords"
          icon={<MessageSquare size={18} />}
        />
        <MetricCard
          title="Site Readability"
          value="94%"
          delta={3}
          description="AI-optimized score"
          icon={<Globe size={18} />}
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
          <div className="lg:col-span-2 harbor-card">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-sm font-body text-softgray opacity-75 uppercase tracking-wide mb-2">
                  Visibility Score
                </h3>
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-heading font-bold text-white">
                    89.8%
                  </span>
                  <span className="text-cerulean text-sm font-body flex items-center gap-1">
                    <span>↑</span>
                    <span>1%</span>
                    <span className="text-softgray opacity-60">vs last week</span>
                  </span>
                </div>
              </div>
            </div>
            <VisibilityChart data={visibilityData} height={250} />
          </div>

          {/* Rankings */}
          <div>
            <RankingTable data={brandRankings} />
          </div>
        </div>
      </div>

      {/* Module Previews */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Shopping Preview */}
        <div className="harbor-card cursor-pointer hover:shadow-lg transition-harbor">
          <div className="flex items-center gap-2 mb-4">
            <ShoppingBag size={18} className="text-coral" />
            <h3 className="text-lg font-heading font-semibold text-white">
              Shopping Visibility
            </h3>
          </div>
          <p className="text-softgray text-sm mb-4 opacity-75">
            Track how your products appear in AI shopping recommendations
          </p>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-heading font-bold text-white">65.2%</span>
            <span className="text-cerulean text-sm">+1.9%</span>
          </div>
        </div>

        {/* Conversations Preview */}
        <div className="harbor-card cursor-pointer hover:shadow-lg transition-harbor">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare size={18} className="text-coral" />
            <h3 className="text-lg font-heading font-semibold text-white">
              Conversation Volumes
            </h3>
          </div>
          <p className="text-softgray text-sm mb-4 opacity-75">
            See what users ask AI about your brand and category
          </p>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-heading font-bold text-white">2.7M</span>
            <span className="text-cerulean text-sm">+12%</span>
          </div>
        </div>

        {/* Website Analytics Preview */}
        <div className="harbor-card cursor-pointer hover:shadow-lg transition-harbor">
          <div className="flex items-center gap-2 mb-4">
            <Globe size={18} className="text-coral" />
            <h3 className="text-lg font-heading font-semibold text-white">
              Website Analytics
            </h3>
          </div>
          <p className="text-softgray text-sm mb-4 opacity-75">
            Optimize how AI crawlers read and understand your site
          </p>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-heading font-bold text-white">94%</span>
            <span className="text-cerulean text-sm">+3%</span>
          </div>
        </div>
      </div>
    </div>
  )
}
