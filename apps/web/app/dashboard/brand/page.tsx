// app/dashboard/brand/page.tsx

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface BrandResult {
  descriptor: string
  sentiment: string
  weight: number
  source_model: string
}

export default function BrandVisibilityPage() {
  const [loading, setLoading] = useState(true)
  const [results, setResults] = useState<BrandResult[]>([])
  const [scanDate, setScanDate] = useState<string>('')
  const router = useRouter()

  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch('/api/scan/latest')
        const data = await response.json()

        if (!data.hasScans) {
          router.push('/dashboard')
          return
        }

        setResults(data.results.brand || [])
        setScanDate(data.scan.finishedAt || data.scan.startedAt)
      } catch (error) {
        console.error('Failed to load brand data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#101A31] flex items-center justify-center">
        <div className="text-white" style={{ fontFamily: 'Source Code Pro, monospace' }}>
          Loading brand data...
        </div>
      </div>
    )
  }

  const headingStyle = { fontFamily: 'Space Grotesk, sans-serif' }
  const bodyStyle = { fontFamily: 'Source Code Pro, monospace' }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'pos': return '#00C6B7'
      case 'neu': return '#A9B4C5'
      case 'neg': return '#FF6B4A'
      default: return '#A9B4C5'
    }
  }

  // Calculate sentiment distribution
  const sentimentCounts = results.reduce((acc: any, r) => {
    acc[r.sentiment] = (acc[r.sentiment] || 0) + 1
    return acc
  }, {})

  const total = results.length
  const sentimentPercentages = {
    pos: Math.round(((sentimentCounts.pos || 0) / total) * 100),
    neu: Math.round(((sentimentCounts.neu || 0) / total) * 100),
    neg: Math.round(((sentimentCounts.neg || 0) / total) * 100),
  }

  return (
    <div className="min-h-screen bg-[#101A31] p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2" style={headingStyle}>
          Brand Visibility
        </h1>
        <p className="text-white/70 mb-4" style={bodyStyle}>
          How AI models describe and perceive your brand
        </p>
        <p className="text-white/50 text-sm" style={bodyStyle}>
          Last scan: {new Date(scanDate).toLocaleString()}
        </p>
      </div>

      {/* Sentiment Overview */}
      {results.length > 0 && (
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-[#141E38] rounded-lg border border-white/5 p-6">
            <p className="text-white/60 text-sm mb-2" style={bodyStyle}>Positive</p>
            <p className="text-3xl font-bold text-[#00C6B7]" style={headingStyle}>
              {sentimentPercentages.pos}%
            </p>
          </div>
          <div className="bg-[#141E38] rounded-lg border border-white/5 p-6">
            <p className="text-white/60 text-sm mb-2" style={bodyStyle}>Neutral</p>
            <p className="text-3xl font-bold text-[#A9B4C5]" style={headingStyle}>
              {sentimentPercentages.neu}%
            </p>
          </div>
          <div className="bg-[#141E38] rounded-lg border border-white/5 p-6">
            <p className="text-white/60 text-sm mb-2" style={bodyStyle}>Negative</p>
            <p className="text-3xl font-bold text-[#FF6B4A]" style={headingStyle}>
              {sentimentPercentages.neg}%
            </p>
          </div>
        </div>
      )}

      {/* Descriptor Cloud */}
      <div className="bg-[#141E38] rounded-xl border border-white/5 p-8 mb-8">
        <h2 className="text-2xl font-bold text-white mb-6" style={headingStyle}>
          How AI Describes Your Brand
        </h2>
        <div className="flex flex-wrap gap-3 items-center justify-center py-8">
          {results.map((item, index) => (
            <div
              key={index}
              className="px-4 py-2 rounded-lg transition-all duration-200 hover:scale-110 cursor-pointer"
              style={{
                fontSize: `${Math.min(item.weight / 3 + 14, 32)}px`,
                backgroundColor: `${getSentimentColor(item.sentiment)}20`,
                color: getSentimentColor(item.sentiment),
                border: `1px solid ${getSentimentColor(item.sentiment)}40`,
                fontFamily: 'Space Grotesk, sans-serif'
              }}
            >
              {item.descriptor}
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center gap-6 mt-6 pt-6 border-t border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#00C6B7]" />
            <span className="text-xs text-white/60" style={bodyStyle}>Positive</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#A9B4C5]" />
            <span className="text-xs text-white/60" style={bodyStyle}>Neutral</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#FF6B4A]" />
            <span className="text-xs text-white/60" style={bodyStyle}>Negative</span>
          </div>
        </div>
      </div>

      {/* Descriptors by Model */}
      <div className="bg-[#141E38] rounded-xl border border-white/5 p-6">
        <h2 className="text-xl font-bold text-white mb-4" style={headingStyle}>
          Descriptors by Model
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4 text-white/60 text-sm" style={bodyStyle}>Descriptor</th>
                <th className="text-left py-3 px-4 text-white/60 text-sm" style={bodyStyle}>Sentiment</th>
                <th className="text-left py-3 px-4 text-white/60 text-sm" style={bodyStyle}>Source</th>
                <th className="text-left py-3 px-4 text-white/60 text-sm" style={bodyStyle}>Weight</th>
              </tr>
            </thead>
            <tbody>
              {results.map((item, index) => (
                <tr key={index} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-3 px-4 text-white" style={bodyStyle}>{item.descriptor}</td>
                  <td className="py-3 px-4">
                    <span 
                      className="px-2 py-1 rounded text-xs"
                      style={{ 
                        backgroundColor: `${getSentimentColor(item.sentiment)}20`,
                        color: getSentimentColor(item.sentiment),
                        fontFamily: 'Source Code Pro, monospace'
                      }}
                    >
                      {item.sentiment === 'pos' ? 'Positive' : item.sentiment === 'neu' ? 'Neutral' : 'Negative'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-white/70 text-sm" style={bodyStyle}>{item.source_model}</td>
                  <td className="py-3 px-4 text-white/70 text-sm" style={bodyStyle}>{item.weight}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {results.length === 0 && (
        <div className="bg-[#141E38] rounded-xl border border-white/5 p-12 text-center">
          <p className="text-white/70" style={bodyStyle}>
            No brand perception data yet.
          </p>
        </div>
      )}
    </div>
  )
}