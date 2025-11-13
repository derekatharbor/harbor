// app/dashboard/conversations/page.tsx

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface ConversationResult {
  question: string
  intent: string
  score: number
  emerging: boolean
}

export default function ConversationsPage() {
  const [loading, setLoading] = useState(true)
  const [results, setResults] = useState<ConversationResult[]>([])
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

        setResults(data.results.conversations || [])
        setScanDate(data.scan.finishedAt || data.scan.startedAt)
      } catch (error) {
        console.error('Failed to load conversations data:', error)
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
          Loading conversation data...
        </div>
      </div>
    )
  }

  const headingStyle = { fontFamily: 'Space Grotesk, sans-serif' }
  const bodyStyle = { fontFamily: 'Source Code Pro, monospace' }

  const getIntentColor = (intent: string) => {
    switch (intent) {
      case 'how_to': return '#2979FF'
      case 'vs': return '#4EE4FF'
      case 'comparison': return '#00C6B7'
      case 'price': return '#A9B4C5'
      case 'trust': return '#3C83FF'
      case 'features': return '#00C6B7'
      default: return '#A9B4C5'
    }
  }

  const getIntentLabel = (intent: string) => {
    switch (intent) {
      case 'how_to': return 'How-to'
      case 'vs': return 'VS'
      case 'comparison': return 'Comparison'
      case 'price': return 'Price'
      case 'trust': return 'Trust'
      case 'features': return 'Features'
      default: return intent
    }
  }

  // Group by intent
  const byIntent = results.reduce((acc: any, r) => {
    if (!acc[r.intent]) acc[r.intent] = []
    acc[r.intent].push(r)
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-[#101A31] p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2" style={headingStyle}>
          Conversation Volumes
        </h1>
        <p className="text-white/70 mb-4" style={bodyStyle}>
          What users ask AI about your brand and category
        </p>
        <p className="text-white/50 text-sm" style={bodyStyle}>
          Last scan: {new Date(scanDate).toLocaleString()}
        </p>
      </div>

      {/* Metrics */}
      {results.length > 0 && (
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-[#141E38] rounded-lg border border-white/5 p-6">
            <p className="text-white/60 text-sm mb-2" style={bodyStyle}>Total Questions</p>
            <p className="text-3xl font-bold text-white" style={headingStyle}>
              {results.length}
            </p>
          </div>
          <div className="bg-[#141E38] rounded-lg border border-white/5 p-6">
            <p className="text-white/60 text-sm mb-2" style={bodyStyle}>Unique Intents</p>
            <p className="text-3xl font-bold text-white" style={headingStyle}>
              {Object.keys(byIntent).length}
            </p>
          </div>
          <div className="bg-[#141E38] rounded-lg border border-white/5 p-6">
            <p className="text-white/60 text-sm mb-2" style={bodyStyle}>Emerging Topics</p>
            <p className="text-3xl font-bold text-[#FF6B4A]" style={headingStyle}>
              {results.filter(r => r.emerging).length}
            </p>
          </div>
        </div>
      )}

      {/* Questions Table */}
      <div className="bg-[#141E38] rounded-xl border border-white/5 p-6">
        <h2 className="text-xl font-bold text-white mb-4" style={headingStyle}>
          Common Questions
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4 text-white/60 text-sm" style={bodyStyle}>Question</th>
                <th className="text-left py-3 px-4 text-white/60 text-sm" style={bodyStyle}>Intent</th>
                <th className="text-left py-3 px-4 text-white/60 text-sm" style={bodyStyle}>Score</th>
                <th className="text-left py-3 px-4 text-white/60 text-sm" style={bodyStyle}>Status</th>
              </tr>
            </thead>
            <tbody>
              {results.map((item, index) => (
                <tr key={index} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-3 px-4 text-white" style={bodyStyle}>{item.question}</td>
                  <td className="py-3 px-4">
                    <span 
                      className="px-2 py-1 rounded text-xs"
                      style={{ 
                        backgroundColor: `${getIntentColor(item.intent)}20`,
                        color: getIntentColor(item.intent),
                        fontFamily: 'Source Code Pro, monospace'
                      }}
                    >
                      {getIntentLabel(item.intent)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-white/70 text-sm" style={bodyStyle}>{item.score}</td>
                  <td className="py-3 px-4">
                    {item.emerging ? (
                      <span className="text-[#FF6B4A] text-xs flex items-center gap-1" style={bodyStyle}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                        </svg>
                        Emerging
                      </span>
                    ) : (
                      <span className="text-white/40 text-xs" style={bodyStyle}>Stable</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {results.length === 0 && (
        <div className="bg-[#141E38] rounded-xl border border-white/5 p-12 text-center">
          <p className="text-white/70" style={bodyStyle}>
            No conversation data yet.
          </p>
        </div>
      )}
    </div>
  )
}