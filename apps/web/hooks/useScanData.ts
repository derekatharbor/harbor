// apps/web/hooks/useScanData.ts

'use client'

import { useState, useEffect } from 'react'
import { useBrand } from '@/contexts/BrandContext'

export interface ScanData {
  scan: {
    id: string
    status: string
    started_at: string
    finished_at: string | null
  } | null
  shopping: {
    score: number
    total_mentions: number
    categories: Array<{
      category: string
      rank: number
      mentions: number
    }>
    competitors: Array<{
      brand: string
      mentions: number
    }>
    models: Array<{
      model: string
      mentions: number
    }>
  }
  brand: {
    visibility_index: number
    descriptors: Array<{
      word: string
      sentiment: string
      weight: number
    }>
    sentiment_breakdown: {
      positive: number
      neutral: number
      negative: number
    }
    total_mentions: number
  }
  conversations: {
    volume_index: number
    questions: Array<{
      question: string
      intent: string
      score: number
      emerging: boolean
    }>
    intent_breakdown: {
      how_to: number
      vs: number
      price: number
      trust: number
      features: number
    }
  }
  website: {
    readability_score: number
    schema_coverage: number
    issues: Array<{
      url: string
      code: string
      severity: string
      message: string
      schema_found: boolean
    }>
  }
}

export function useScanData() {
  const { currentDashboard } = useBrand()
  const [data, setData] = useState<ScanData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    if (!currentDashboard) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      const res = await fetch(`/api/scan/latest?dashboardId=${currentDashboard.id}`)
      
      if (!res.ok) {
        throw new Error('Failed to fetch scan data')
      }

      const data = await res.json()
      setData(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data')
      setData(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [currentDashboard])

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
  }
}
