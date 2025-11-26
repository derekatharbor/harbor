// apps/web/app/dashboard/page.tsx
// First-time welcome page - shown only before first scan

'use client'

import React, { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { ShoppingBag, Star, MessageSquare, Globe, Loader2 } from 'lucide-react'
import MobileHeader from '@/components/layout/MobileHeader'
import { useBrand } from '@/contexts/BrandContext'

const moduleCards = [
  {
    title: 'Shopping Visibility',
    description: 'How your products appear in AI shopping and product-recommendation responses.',
    icon: ShoppingBag,
  },
  {
    title: 'Brand Visibility',
    description: 'How often AI models reference your brand and how accurately they describe it.',
    icon: Star,
  },
  {
    title: 'Conversation Volumes',
    description: 'The questions and topics where AI mentions your brand or your category.',
    icon: MessageSquare,
  },
  {
    title: 'Website Analytics',
    description: 'How AI crawlers understand your site structure and extract brand information.',
    icon: Globe,
  }
]

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [scanning, setScanning] = useState(false)
  const { currentDashboard } = useBrand()
  
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function checkScanStatus() {
      try {
        const result = await supabase.auth.getSession()
        const session = result.data.session
        
        if (!session?.user) {
          router.push('/auth/login')
          return
        }

        const roleResult = await supabase
          .from('user_roles')
          .select('org_id')
          .eq('user_id', session.user.id)
          .single()
        
        const userRole = roleResult.data

        if (!userRole?.org_id) {
          router.push('/onboarding')
          return
        }

        const dashboardResult = await supabase
          .from('dashboards')
          .select('id')
          .eq('org_id', userRole.org_id)
          .single()
        
        const dashboard = dashboardResult.data

        if (!dashboard) {
          router.push('/onboarding')
          return
        }

        // Check if ANY scans exist (including running)
        const scansResult = await supabase
          .from('scans')
          .select('id, status')
          .eq('dashboard_id', dashboard.id)
          .limit(1)
        
        const scans = scansResult.data

        // If any scan exists, go to overview
        if (scans && scans.length > 0) {
          router.push('/dashboard/overview')
          return
        }

        setLoading(false)
      } catch (error) {
        console.error('Dashboard load error:', error)
        setLoading(false)
      }
    }

    checkScanStatus()
  }, [supabase, router])

  const handleRunScan = async () => {
    if (!currentDashboard || scanning) return
    
    setScanning(true)
    
    try {
      // Create the scan
      const response = await fetch('/api/scan/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dashboardId: currentDashboard.id })
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to start scan')
      }
      
      const data = await response.json()
      const scanId = data.scan.id
      
      // Trigger the process (fire and forget)
      fetch('/api/scan/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scanId })
      }).catch(err => console.error('Process trigger failed:', err))
      
      // Redirect to overview
      router.push('/dashboard/overview')
      
    } catch (error) {
      console.error('Scan error:', error)
      alert('Failed to start scan. Please try again.')
      setScanning(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary/30" />
      </div>
    )
  }

  return (
    <>
      <MobileHeader />
      <div className="max-w-4xl mx-auto pt-20 lg:pt-8 px-6 pb-16">
        
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-3xl lg:text-4xl font-heading font-bold text-primary mb-4">
            Let's see how AI understands your brand
          </h1>
          <p className="text-secondary/70 text-lg max-w-2xl mx-auto leading-relaxed">
            Harbor analyzes how major AI models — ChatGPT, Claude, Gemini, and Perplexity — describe, recommend, and reference your brand across multiple contexts.
          </p>
        </div>

        {/* Scan CTA Card */}
        <div className="bg-card rounded-xl border border-border p-8 lg:p-10 mb-12">
          <div className="max-w-md mx-auto text-center">
            <button
              onClick={handleRunScan}
              disabled={scanning}
              className="w-full py-4 px-8 bg-[#101A31] text-white font-heading font-semibold text-lg rounded-lg hover:bg-[#1a2a4a] active:bg-[#0a1220] transition-colors disabled:opacity-60 cursor-pointer"
            >
              {scanning ? (
                <span className="flex items-center justify-center gap-3">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Starting scan...
                </span>
              ) : (
                'Run your first scan'
              )}
            </button>
            
            <p className="text-sm text-secondary/50 mt-4">
              Takes 2–3 minutes · Updates weekly
            </p>
          </div>
        </div>

        {/* What This Scan Includes */}
        <div className="mb-8">
          <h2 className="text-xl font-heading font-bold text-primary mb-6">
            What this scan includes
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {moduleCards.map((module, index) => {
            const Icon = module.icon
            return (
              <div 
                key={index} 
                className="bg-card rounded-lg border border-border p-6"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-primary/70" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="text-primary font-heading font-semibold mb-1">
                      {module.title}
                    </h3>
                    <p className="text-sm text-secondary/60 leading-relaxed">
                      {module.description}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

      </div>
    </>
  )
}