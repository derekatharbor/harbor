'use client'

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts'

interface VisibilityChartProps {
  data: Array<{ date: string; score: number; competitor?: number }>
  height?: number
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-navy-lighter border border-teal rounded-lg p-3 shadow-lg">
        <p className="text-white font-body text-sm mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-xs">
            <div 
              className="w-2 h-2 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-softgray">
              {entry.name === 'score' ? 'Your Brand' : 'Competitor'}:
            </span>
            <span className="text-white font-semibold">{entry.value}%</span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export function VisibilityChart({ data, height = 300 }: VisibilityChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart
        data={data}
        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#4EE4FF" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#0B1521" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="competitorGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6B7280" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#0B1521" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid 
          strokeDasharray="3 3" 
          stroke="rgba(255,255,255,0.05)" 
          vertical={false}
        />
        <XAxis 
          dataKey="date" 
          stroke="rgba(255,255,255,0.3)"
          style={{ fontSize: '12px', fontFamily: 'DM Sans' }}
          tickLine={false}
        />
        <YAxis 
          stroke="rgba(255,255,255,0.3)"
          style={{ fontSize: '12px', fontFamily: 'DM Sans' }}
          tickLine={false}
          tickFormatter={(value) => `${value}%`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="score"
          stroke="#00C6B7"
          strokeWidth={2}
          fill="url(#scoreGradient)"
          animationDuration={800}
          animationBegin={0}
        />
        {data[0]?.competitor !== undefined && (
          <Area
            type="monotone"
            dataKey="competitor"
            stroke="#6B7280"
            strokeWidth={2}
            fill="url(#competitorGradient)"
            animationDuration={800}
            animationBegin={200}
          />
        )}
      </AreaChart>
    </ResponsiveContainer>
  )
}