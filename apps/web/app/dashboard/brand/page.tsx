'use client'

import { MetricCard } from '@/components/ui/MetricCard'
import { ActionCard } from '@/components/ui/ActionCard'
import { TimeRangeFilter } from '@/components/ui/TimeRangeFilter'
import { Star, TrendingUp, MessageSquare, FileCode, Lightbulb, Link as LinkIcon } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Cell, PieChart, Pie } from 'recharts'

// Mock data
const descriptorData = [
  { word: 'Innovative', sentiment: 'pos', size: 32 },
  { word: 'Reliable', sentiment: 'pos', size: 28 },
  { word: 'Enterprise', sentiment: 'neu', size: 24 },
  { word: 'Professional', sentiment: 'pos', size: 26 },
  { word: 'Complex', sentiment: 'neg', size: 18 },
  { word: 'Trusted', sentiment: 'pos', size: 30 },
  { word: 'Expensive', sentiment: 'neg', size: 20 },
  { word: 'Secure', sentiment: 'pos', size: 25 },
  { word: 'Corporate', sentiment: 'neu', size: 22 },
  { word: 'Modern', sentiment: 'pos', size: 27 },
  { word: 'Established', sentiment: 'pos', size: 23 },
  { word: 'Traditional', sentiment: 'neu', size: 19 },
]

const mentionsByModel = [
  { model: 'ChatGPT', mentions: 842 },
  { model: 'Claude', mentions: 756 },
  { model: 'Gemini', mentions: 623 },
  { model: 'Perplexity', mentions: 489 },
]

const sentimentData = [
  { name: 'Positive', value: 68, color: '#00C6B7' },
  { name: 'Neutral', value: 24, color: '#A9B4C5' },
  { name: 'Negative', value: 8, color: 'rgba(255,255,255,0.15)' },
]

const getSentimentColor = (sentiment: string) => {
  switch (sentiment) {
    case 'pos': return '#00C6B7'
    case 'neu': return '#A9B4C5'
    case 'neg': return 'rgba(255,255,255,0.15)'
    default: return '#A9B4C5'
  }
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div 
        className="bg-navy rounded-lg p-3 animate-in"
        style={{ 
          boxShadow: '0 0 10px rgba(0,198,183,0.25)',
          animation: 'fadeInUp 150ms ease-out'
        }}
      >
        <p className="text-white font-body text-sm font-medium mb-1">
          {payload[0].payload.model || payload[0].name}
        </p>
        <p className="text-cyan text-xs font-medium">
          {payload[0].value} {payload[0].payload.mentions !== undefined ? 'mentions' : '%'}
        </p>
      </div>
    )
  }
  return null
}

export default function BrandVisibilityPage() {
  return (
    <div 
      className="min-h-screen bg-navy p-8 animate-in"
      style={{
        background: 'radial-gradient(ellipse at center, #0B1521 0%, rgba(0,0,0,0.4) 100%)'
      }}
    >
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-softgray text-sm mb-2">
          <span className="opacity-60">Demo Brand</span>
          <span className="opacity-40">›</span>
          <span>Brand Visibility</span>
        </div>
        <h1 className="text-4xl font-heading font-bold text-white mb-2">
          Brand Visibility
        </h1>
        <p className="text-softgray opacity-75 mb-4">
          How AI models describe and associate your brand across conversations
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <p className="text-softgray opacity-75 text-sm">
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

      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <MetricCard
          title="Visibility Index"
          value="89.8%"
          delta={1.2}
          icon={<Star size={18} />}
          tooltip="Weighted score based on mention frequency, prominence, and sentiment across all AI models"
        />
        <MetricCard
          title="Total Mentions"
          value="2.7M"
          delta={12}
          description="Est. monthly volume"
          icon={<MessageSquare size={18} />}
          tooltip="Estimated total times your brand is mentioned in AI responses this month"
        />
        <MetricCard
          title="Sentiment Score"
          value="68%"
          delta={3}
          description="Positive mentions"
          icon={<TrendingUp size={18} />}
          tooltip="Percentage of brand mentions with positive sentiment"
        />
      </div>

      {/* Descriptor Cloud + Sentiment Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Descriptor Cloud */}
        <div className="lg:col-span-2 harbor-card hover:shadow-[0_8px_20px_rgba(0,198,183,0.1)] transition-all duration-200">
          <h3 className="text-lg font-heading font-semibold text-white mb-2">
            How AI Describes Your Brand
          </h3>
          <p className="text-softgray text-sm opacity-75 mb-6">
            Most common descriptors across all AI model responses
          </p>
          <div className="flex flex-wrap gap-3 items-center justify-center py-8">
            {descriptorData.map((item, index) => (
              <div
                key={index}
                className="px-4 py-2 rounded-lg transition-all duration-200 hover:scale-110 cursor-pointer"
                style={{
                  fontSize: `${item.size}px`,
                  backgroundColor: `${getSentimentColor(item.sentiment)}20`,
                  color: getSentimentColor(item.sentiment),
                  border: `1px solid ${getSentimentColor(item.sentiment)}40`
                }}
              >
                {item.word}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-6 mt-6 pt-6 border-t border-harbor">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-teal" />
              <span className="text-xs text-softgray">Positive</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-softgray" />
              <span className="text-xs text-softgray">Neutral</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }} />
              <span className="text-xs text-softgray">Negative</span>
            </div>
          </div>
        </div>

        {/* Sentiment Distribution */}
        <div className="harbor-card hover:shadow-[0_8px_20px_rgba(0,198,183,0.1)] transition-all duration-200">
          <h3 className="text-lg font-heading font-semibold text-white mb-2">
            Sentiment Distribution
          </h3>
          <p className="text-softgray text-sm opacity-75 mb-6">
            Overall sentiment breakdown
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={sentimentData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                animationDuration={600}
                animationBegin={0}
              >
                {sentimentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-4">
            {sentimentData.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-softgray">{item.name}</span>
                </div>
                <span className="text-sm text-white font-semibold">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mention Volume by Model */}
      <div className="harbor-card mb-8 hover:shadow-[0_8px_20px_rgba(0,198,183,0.1)] transition-all duration-200">
        <h3 className="text-lg font-heading font-semibold text-white mb-2">
          Brand Mentions by Model
        </h3>
        <p className="text-softgray text-sm opacity-75 mb-6">
          How frequently each AI platform mentions your brand
        </p>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={mentionsByModel}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis 
              dataKey="model" 
              stroke="#A9B4C5"
              style={{ fontSize: '12px', fontFamily: 'DM Sans' }}
              tickLine={false}
            />
            <YAxis 
              stroke="#A9B4C5"
              style={{ fontSize: '12px', fontFamily: 'DM Sans' }}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,198,183,0.05)' }} />
            <Bar 
              dataKey="mentions" 
              radius={[8, 8, 0, 0]}
              animationDuration={400}
              animationBegin={0}
              animationEasing="ease-in-out"
            >
              {mentionsByModel.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={index === 0 ? '#00C6B7' : index === 1 ? '#3C83FF' : index === 2 ? '#4EE4FF' : 'rgba(255,255,255,0.15)'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Optimize Actions */}
      <div>
        <h2 className="text-2xl font-heading font-semibold text-white mb-2">
          Enhance Your Brand Presence
        </h2>
        <p className="text-softgray opacity-75 mb-6">
          Strategic actions to improve how AI understands and describes your brand
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ActionCard
            title="Add Organization Schema"
            description="Implement Organization JSON-LD with logo, social profiles, and brand tagline to guide AI descriptions"
            icon={<FileCode size={20} style={{ marginTop: '8px' }} />}
            trend="+18% clarity"
            ctaText="Generate Schema"
          />
          <ActionCard
            title="Unify Brand Language"
            description="Align About, Press, and landing page copy to reinforce consistent brand positioning across pages"
            icon={<Lightbulb size={20} style={{ marginTop: '8px' }} />}
            trend="+10% consistency"
            ctaText="View Guide"
          />
          <ActionCard
            title="Add Authority Links"
            description="Include Wikipedia, Crunchbase, and industry directory links to strengthen brand entity recognition"
            icon={<LinkIcon size={20} style={{ marginTop: '8px' }} />}
            trend="+15% authority"
            ctaText="Get Started"
          />
        </div>
      </div>
    </div>
  )
}
