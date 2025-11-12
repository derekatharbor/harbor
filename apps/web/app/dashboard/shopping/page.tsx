'use client'

import { MetricCard } from '@/components/ui/MetricCard'
import { ActionCard } from '@/components/ui/ActionCard'
import { TimeRangeFilter } from '@/components/ui/TimeRangeFilter'
import { ShoppingBag, TrendingUp, Award, Package, FileCode, Sparkles } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Cell } from 'recharts'

// Mock data
const productMentionsByModel = [
  { model: 'ChatGPT', mentions: 87, color: '#00C6B7' },
  { model: 'Claude', mentions: 92, color: '#3C83FF' },
  { model: 'Gemini', mentions: 68, color: '#4EE4FF' },
  { model: 'Perplexity', mentions: 45, color: 'rgba(255,255,255,0.15)' },
]

const categoryData = [
  { category: 'Business Credit Cards', rank: 2, models: ['ChatGPT', 'Claude', 'Gemini'], lastDetected: '2 hours ago' },
  { category: 'Small Business Banking', rank: 4, models: ['ChatGPT', 'Gemini'], lastDetected: '5 hours ago' },
  { category: 'Corporate Cards', rank: 7, models: ['Claude'], lastDetected: '1 day ago' },
  { category: 'Expense Management', rank: null, models: [], lastDetected: 'Not detected' },
]

const competitorData = [
  { name: 'Your Brand', score: 89.8, color: '#00C6B7', gradient: true },
  { name: 'Chase', score: 95.2, color: 'rgba(255,255,255,0.15)', gradient: false },
  { name: 'American Express', score: 87.1, color: 'rgba(255,255,255,0.15)', gradient: false },
  { name: 'Capital One', score: 72.4, color: 'rgba(255,255,255,0.15)', gradient: false },
]

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
        <p className="text-white font-body text-sm font-medium mb-1">{payload[0].payload.model}</p>
        <p className="text-cyan text-xs font-medium">
          {payload[0].value} <span className="text-softgray opacity-60">mentions</span>
        </p>
      </div>
    )
  }
  return null
}

const CustomBar = (props: any) => {
  const { fill, x, y, width, height, payload } = props
  
  return (
    <g>
      <defs>
        {payload.model === 'Your Brand' && (
          <linearGradient id={`gradient-${payload.model}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#00C6B7" />
            <stop offset="100%" stopColor="#4EE4FF" />
          </linearGradient>
        )}
      </defs>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={payload.model === 'Your Brand' ? `url(#gradient-${payload.model})` : fill}
        rx={8}
        className="transition-all duration-200 hover:translate-y-[-3px]"
        style={{ 
          filter: 'drop-shadow(0 4px 12px rgba(0,198,183,0.15))',
          cursor: 'pointer'
        }}
      />
    </g>
  )
}

export default function ShoppingVisibilityPage() {
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
          <span>Shopping Visibility</span>
        </div>
        <h1 className="text-4xl font-heading font-bold text-white mb-2">
          Shopping Visibility
        </h1>
        <p className="text-softgray opacity-75 mb-4">
          How often your products appear in ChatGPT Shopping tiles and other AI shopping recommendations
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
          title="Shopping Visibility Score"
          value="65.2%"
          delta={1.9}
          icon={<ShoppingBag size={18} />}
          tooltip="Percentage of relevant AI shopping queries where your products are mentioned"
        />
        <MetricCard
          title="Shopping Visibility Rank"
          value="#1"
          description="In your category"
          icon={<Award size={18} />}
          tooltip="Your ranking among competitors in business credit card category"
        />
        <MetricCard
          title="Total Mentions"
          value="292"
          delta={8}
          description="Across all models"
          icon={<TrendingUp size={18} />}
          tooltip="Total product mentions across ChatGPT, Claude, Gemini, and Perplexity"
        />
      </div>

      {/* Product Mentions by Model */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="harbor-card hover:shadow-[0_8px_20px_rgba(0,198,183,0.1)] transition-all duration-200">
          <h3 className="text-lg font-heading font-semibold text-white mb-2">
            How AI Models Mention Your Brand
          </h3>
          <p className="text-softgray text-sm opacity-75 mb-6">
            Frequency of product recommendations across major AI platforms
          </p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={productMentionsByModel}>
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
                {productMentionsByModel.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color}
                    className="hover:translate-y-[-3px] transition-transform duration-200"
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Competitor Comparison */}
        <div className="harbor-card hover:shadow-[0_8px_20px_rgba(0,198,183,0.1)] transition-all duration-200">
          <h3 className="text-lg font-heading font-semibold text-white mb-2">
            Competitor Comparison
          </h3>
          <p className="text-softgray text-sm opacity-75 mb-6">
            Your visibility vs. top competitors
          </p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={competitorData} layout="vertical">
              <defs>
                <linearGradient id="yourBrandGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#00C6B7" />
                  <stop offset="100%" stopColor="#4EE4FF" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
              <XAxis 
                type="number"
                stroke="#A9B4C5"
                style={{ fontSize: '12px', fontFamily: 'DM Sans' }}
                tickLine={false}
              />
              <YAxis 
                type="category"
                dataKey="name"
                stroke="#A9B4C5"
                style={{ fontSize: '12px', fontFamily: 'DM Sans' }}
                tickLine={false}
                width={120}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,198,183,0.05)' }} />
              <Bar 
                dataKey="score" 
                radius={[0, 8, 8, 0]}
                animationDuration={400}
                animationBegin={100}
                animationEasing="ease-in-out"
              >
                {competitorData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.gradient ? 'url(#yourBrandGradient)' : entry.color}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Coverage Table */}
      <div className="harbor-card mb-8 hover:shadow-[0_8px_20px_rgba(0,198,183,0.1)] transition-all duration-200">
        <h3 className="text-lg font-heading font-semibold text-white mb-2">
          Where You Appear in AI Results
        </h3>
        <p className="text-softgray text-sm opacity-75 mb-6">
          Product categories where AI models recommend your brand
        </p>
        <div className="overflow-x-auto">
          <table className="harbor-table">
            <thead>
              <tr className="border-b border-harbor">
                <th className="text-left py-3">Category</th>
                <th className="text-left py-3">Rank</th>
                <th className="text-left py-3">Models</th>
                <th className="text-left py-3">Last Detected</th>
              </tr>
            </thead>
            <tbody>
              {categoryData.map((item, index) => (
                <tr 
                  key={index}
                  className="border-b border-harbor last:border-0 hover:bg-[rgba(0,198,183,0.05)] transition-colors"
                >
                  <td className="py-4">
                    <span className="text-white font-body">{item.category}</span>
                  </td>
                  <td className="py-4">
                    {item.rank ? (
                      <span className="text-teal font-semibold text-sm">
                        #{item.rank}
                      </span>
                    ) : (
                      <span className="text-softgray opacity-60 text-sm">Not ranked</span>
                    )}
                  </td>
                  <td className="py-4">
                    <div className="flex gap-2">
                      {item.models.length > 0 ? (
                        item.models.map((model, i) => (
                          <span 
                            key={i}
                            className="px-2 py-1 bg-navy-lighter text-cyan text-xs rounded"
                            style={{ borderRadius: '4px' }}
                          >
                            {model}
                          </span>
                        ))
                      ) : (
                        <span className="text-softgray opacity-60 text-sm">—</span>
                      )}
                    </div>
                  </td>
                  <td className="py-4">
                    <span className="text-softgray text-sm opacity-75">{item.lastDetected}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Optimize Actions */}
      <div>
        <h2 className="text-2xl font-heading font-semibold text-white mb-2">
          Improve Your Presence in AI Recommendations
        </h2>
        <p className="text-softgray opacity-75 mb-6">
          Actionable steps to increase product mentions across AI platforms
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ActionCard
            title="Add Product Schema"
            description="Implement Product JSON-LD with name, brand, SKU, and pricing to help AI models understand your products"
            icon={<FileCode size={20} style={{ marginTop: '8px' }} />}
            trend="+15% potential"
            ctaText="Generate Schema"
          />
          <ActionCard
            title="Enrich Descriptions"
            description="Expand product descriptions to 120-150 words with AI-readable feature lists and use cases"
            icon={<Package size={20} style={{ marginTop: '8px' }} />}
            trend="+8% potential"
            ctaText="View Guide"
          />
          <ActionCard
            title="Add Review Schema"
            description="Include aggregateRating and Review schema to build trust signals for AI recommendations"
            icon={<Sparkles size={20} style={{ marginTop: '8px' }} />}
            trend="+12% potential"
            ctaText="Generate Schema"
          />
        </div>
      </div>
    </div>
  )
}