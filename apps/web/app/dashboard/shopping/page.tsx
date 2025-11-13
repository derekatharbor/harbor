// app/dashboard/shopping/page.tsx

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface ShoppingResult {
  model: string
  category: string
  product: string
  brand: string
  rank: number
  confidence: number
}

export default function ShoppingVisibilityPage() {
  const [loading, setLoading] = useState(true)
  const [results, setResults] = useState<ShoppingResult[]>([])
  const [scanDate, setScanDate] = useState<string>('')
  const router = useRouter()

  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch('/api/scan/latest')
        const data = await response.json()

        if (!data.hasScans) {
          // No scans yet, redirect to empty state
          router.push('/dashboard')
          return
        }

        setResults(data.results.shopping || [])
        setScanDate(data.scan.finishedAt || data.scan.startedAt)
      } catch (error) {
        console.error('Failed to load shopping data:', error)
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
          Loading shopping data...
        </div>
      </div>
    )
  }

  const headingStyle = { fontFamily: 'Space Grotesk, sans-serif' }
  const bodyStyle = { fontFamily: 'Source Code Pro, monospace' }

  // Group results by model
  const byModel = results.reduce((acc: any, result) => {
    if (!acc[result.model]) acc[result.model] = []
    acc[result.model].push(result)
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-[#101A31] p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2" style={headingStyle}>
          Shopping Visibility
        </h1>
        <p className="text-white/70 mb-4" style={bodyStyle}>
          How your products appear in AI shopping recommendations
        </p>
        <p className="text-white/50 text-sm" style={bodyStyle}>
          Last scan: {new Date(scanDate).toLocaleString()}
        </p>
      </div>

      {/* Results by Model */}
      <div className="grid gap-6 mb-8">
        {Object.entries(byModel).map(([model, items]: [string, any]) => (
          <div key={model} className="bg-[#141E38] rounded-xl border border-white/5 p-6">
            <h2 className="text-xl font-bold text-white mb-4" style={headingStyle}>
              {model}
            </h2>
            <div className="space-y-3">
              {items.map((item: ShoppingResult, index: number) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-4 bg-[#101A31] rounded-lg border border-white/5"
                >
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-10 h-10 rounded-full bg-[#FF6B4A]/10 flex items-center justify-center text-[#FF6B4A] font-bold"
                      style={headingStyle}
                    >
                      #{item.rank}
                    </div>
                    <div>
                      <p className="text-white font-semibold" style={bodyStyle}>
                        {item.product}
                      </p>
                      <p className="text-white/50 text-sm" style={bodyStyle}>
                        {item.brand} · {item.category}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[#2979FF] font-semibold" style={bodyStyle}>
                      {item.confidence}%
                    </p>
                    <p className="text-white/50 text-xs" style={bodyStyle}>
                      confidence
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {results.length === 0 && (
        <div className="bg-[#141E38] rounded-xl border border-white/5 p-12 text-center">
          <p className="text-white/70" style={bodyStyle}>
            No shopping visibility data yet. The AI models may not have mentioned your products in their responses.
          </p>
        </div>
      )}
    </div>
  )
}