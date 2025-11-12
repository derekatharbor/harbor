'use client'

import { MetricCard } from '@/components/ui/MetricCard'
import { ActionCard } from '@/components/ui/ActionCard'
import { TimeRangeFilter } from '@/components/ui/TimeRangeFilter'
import { MessageSquare, TrendingUp, Zap, FileCode, FileText, HelpCircle } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Cell } from 'recharts'

// Mock data
const topQuestions = [
  { question: 'What are the best business credit cards?', intent: 'comparison', volume: 1240, emerging: false },
  { question: 'How to get a small business loan', intent: 'how_to', volume: 890, emerging: true },
  { question: 'Business credit card vs corporate card', intent: 'vs', volume: 720, emerging: false },
  { question: 'What business expenses are tax deductible?', intent: 'features', volume: 650, emerging: false },
  { question: 'Are business credit cards worth it?', intent: 'trust', volume: 580, emerging: true },
  { question: 'How to build business credit', intent: 'how_to', volume: 520, emerging: false },
  { question: 'Business credit card interest rates', intent: 'price', volume: 480, emerging: false },
  { question: 'Can I use business credit card for personal?', intent: 'trust', volume: 420, emerging: false },
]

const keywordVariations = [
  { keyword: 'business credit cards', volume: 9 },
  { keyword: 'small business banking', volume: 7 },
  { keyword: 'corporate cards', volume: 8 },
  { keyword: 'business loans', volume: 6 },
  { keyword: 'expense management', volume: 5 },
]

const platformVolume = [
  { platform: 'ChatGPT', volume: 45, color: '#00C6B7' },
  { platform: 'Claude', volume: 32, color: '#3C83FF' },
  { platform: 'Gemini', volume: 18, color: '#4EE4FF' },
  { platform: 'Perplexity', volume: 5, color: 'rgba(255,255,255,0.15)' },
]

const getIntentBadge = (intent: string) => {
  const styles: Record<string, { bg: string; text: string; label: string }> = {
    comparison: { bg: '#00C6B7', text: '#00C6B7', label: 'Comparison' },
    how_to: { bg: '#3C83FF', text: '#3C83FF', label: 'How-to' },
    vs: { bg: '#4EE4FF', text: '#4EE4FF', label: 'VS' },
    features: { bg: '#A9B4C5', text: '#A9B4C5', label: 'Features' },
    trust: { bg: '#2979FF', text: '#2979FF', label: 'Trust' },
    price: { bg: '#4EE4FF', text: '#4EE4FF', label: 'Price' },
  }
  return styles[intent] || styles.features
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
          {payload[0].payload.platform || payload[0].payload.keyword}
        </p>
        <p className="text-cyan text-xs font-medium">
          {payload[0].value}% <span className="text-softgray opacity-60">of queries</span>
        </p>
      </div>
    )
  }
  return null
}

export default function ConversationVolumesPage() {
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
          <span>Conversation Volumes</span>
        </div>
        <h1 className="text-4xl font-heading font-bold text-white mb-2">
          Conversation Volumes
        </h1>
        <p className="text-softgray opacity-75 mb-4">
          What users ask AI about your brand and category
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
          title="Query Volume Index"
          value="2.7M"
          delta={12}
          description="Est. monthly queries"
          icon={<MessageSquare size={18} />}
          tooltip="Estimated number of AI queries mentioning your brand or category this month"
        />
        <MetricCard
          title="Tracked Topics"
          value="156"
          delta={8}
          description="Unique questions"
          icon={<TrendingUp size={18} />}
          tooltip="Number of distinct questions and topics users ask AI about your brand"
        />
        <MetricCard
          title="Emerging Questions"
          value="12"
          description="New this week"
          icon={<Zap size={18} />}
          tooltip="Questions with significant volume increases in the past 7 days"
        />
      </div>

      {/* Platform Volume + Keyword Variations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Platform Volume */}
        <div className="harbor-card hover:shadow-[0_8px_20px_rgba(0,198,183,0.1)] transition-all duration-200">
          <h3 className="text-lg font-heading font-semibold text-white mb-2">
            Query Volume by Platform
          </h3>
          <p className="text-softgray text-sm opacity-75 mb-6">
            Distribution of brand-related queries across AI platforms
          </p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={platformVolume}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis 
                dataKey="platform" 
                stroke="#A9B4C5"
                style={{ fontSize: '12px', fontFamily: 'DM Sans' }}
                tickLine={false}
              />
              <YAxis 
                stroke="#A9B4C5"
                style={{ fontSize: '12px', fontFamily: 'DM Sans' }}
                tickLine={false}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,198,183,0.05)' }} />
              <Bar 
                dataKey="volume" 
                radius={[8, 8, 0, 0]}
                animationDuration={400}
                animationBegin={0}
                animationEasing="ease-in-out"
              >
                {platformVolume.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Keyword Variations */}
        <div className="harbor-card hover:shadow-[0_8px_20px_rgba(0,198,183,0.1)] transition-all duration-200">
          <h3 className="text-lg font-heading font-semibold text-white mb-2">
            Top Keyword Variations
          </h3>
          <p className="text-softgray text-sm opacity-75 mb-6">
            Related terms users search for alongside your brand
          </p>
          <div className="space-y-4 pt-4">
            {keywordVariations.map((item, index) => (
              <div key={index} className="flex items-center justify-between group hover:translate-x-1 transition-transform">
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-softgray opacity-60 font-body text-sm w-6">
                    {index + 1}
                  </span>
                  <span className="text-white font-body text-sm group-hover:text-teal transition-colors">
                    {item.keyword}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-2 bg-navy-lighter rounded-full overflow-hidden" style={{ width: '100px' }}>
                    <div 
                      className="h-full bg-teal rounded-full transition-all duration-500"
                      style={{ width: `${item.volume * 10}%` }}
                    />
                  </div>
                  <span className="text-cyan text-sm font-semibold w-8 text-right">
                    {item.volume}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Questions Table */}
      <div className="harbor-card mb-8 hover:shadow-[0_8px_20px_rgba(0,198,183,0.1)] transition-all duration-200">
        <h3 className="text-lg font-heading font-semibold text-white mb-2">
          Most Common Questions
        </h3>
        <p className="text-softgray text-sm opacity-75 mb-6">
          What users are asking AI about your brand and category
        </p>
        <div className="overflow-x-auto">
          <table className="harbor-table">
            <thead>
              <tr className="border-b border-harbor">
                <th className="text-left py-3">Question</th>
                <th className="text-left py-3">Intent</th>
                <th className="text-left py-3">Est. Volume</th>
                <th className="text-left py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {topQuestions.map((item, index) => {
                const badge = getIntentBadge(item.intent)
                return (
                  <tr 
                    key={index}
                    className="border-b border-harbor last:border-0 hover:bg-[rgba(0,198,183,0.05)] transition-colors"
                  >
                    <td className="py-4">
                      <span className="text-white font-body text-sm">{item.question}</span>
                    </td>
                    <td className="py-4">
                      <span 
                        className="px-2 py-1 text-xs rounded font-medium"
                        style={{ 
                          backgroundColor: `${badge.bg}20`,
                          color: badge.text,
                          borderRadius: '4px'
                        }}
                      >
                        {badge.label}
                      </span>
                    </td>
                    <td className="py-4">
                      <span className="text-softgray text-sm font-medium">{item.volume.toLocaleString()}</span>
                    </td>
                    <td className="py-4">
                      {item.emerging ? (
                        <span className="flex items-center gap-1 text-cyan text-xs font-medium">
                          <Zap size={12} />
                          Emerging
                        </span>
                      ) : (
                        <span className="text-softgray opacity-60 text-xs">Stable</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Optimize Actions */}
      <div>
        <h2 className="text-2xl font-heading font-semibold text-white mb-2">
          Capture More Conversations
        </h2>
        <p className="text-softgray opacity-75 mb-6">
          Actions to address common questions and improve your presence in AI responses
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ActionCard
            title="Add FAQ Schema"
            description="Generate FAQPage JSON-LD for your top 10 questions to help AI models find authoritative answers"
            icon={<FileCode size={20} style={{ marginTop: '8px' }} />}
            trend="+20% coverage"
            ctaText="Generate FAQ"
          />
          <ActionCard
            title="Create Comparison Pages"
            description="Build dedicated pages for VS queries to capture comparison traffic and guide AI responses"
            icon={<FileText size={20} style={{ marginTop: '8px' }} />}
            trend="+15% visibility"
            ctaText="View Template"
          />
          <ActionCard
            title="Answer How-To Questions"
            description="Publish step-by-step guides addressing common how-to queries in your category"
            icon={<HelpCircle size={20} style={{ marginTop: '8px' }} />}
            trend="+12% authority"
            ctaText="Get Started"
          />
        </div>
      </div>
    </div>
  )
}
