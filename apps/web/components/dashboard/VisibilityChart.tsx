'use client'

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts'

interface VisibilityChartProps {
  data: Array<{ date: string; score: number; competitor?: number }>
  height?: number
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
            <stop offset="5%" stopColor="#2979FF" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#2979FF" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="competitorGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6B7280" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#6B7280" stopOpacity={0} />
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
          style={{ fontSize: '12px', fontFamily: 'Source Code Pro' }}
          tickLine={false}
        />
        <YAxis 
          stroke="rgba(255,255,255,0.3)"
          style={{ fontSize: '12px', fontFamily: 'Source Code Pro' }}
          tickLine={false}
          tickFormatter={(value) => `${value}%`}
        />
        <Area
          type="monotone"
          dataKey="score"
          stroke="#2979FF"
          strokeWidth={2}
          fill="url(#scoreGradient)"
          animationDuration={500}
        />
        {data[0]?.competitor !== undefined && (
          <Area
            type="monotone"
            dataKey="competitor"
            stroke="#6B7280"
            strokeWidth={2}
            fill="url(#competitorGradient)"
            animationDuration={500}
          />
        )}
      </AreaChart>
    </ResponsiveContainer>
  )
}
