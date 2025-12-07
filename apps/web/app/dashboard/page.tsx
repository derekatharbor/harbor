// apps/web/app/dashboard/page.tsx
// First-time welcome page - shown only before first scan

'use client'

import React, { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { ShoppingBag, Star, MessageSquare, Globe, Loader2 } from 'lucide-react'
import MobileHeader from '@/components/layout/MobileHeader'

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

        // Check if user has selected prompts (new flow)
        const promptsResult = await supabase
          .from('dashboard_prompts')
          .select('prompt_id')
          .eq('dashboard_id', dashboard.id)
          .limit(1)
        
        const hasPrompts = promptsResult.data && promptsResult.data.length > 0

        // Also check for legacy scans
        const scansResult = await supabase
          .from('scans')
          .select('id, status')
          .eq('dashboard_id', dashboard.id)
          .limit(1)
        
        const hasScans = scansResult.data && scansResult.data.length > 0

        // If user has prompts OR scans, go to overview
        if (hasPrompts || hasScans) {
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
            Harbor tracks how major AI models — ChatGPT, Claude, Gemini, and Perplexity — describe, recommend, and reference your brand.
          </p>
        </div>

        {/* Select Prompts CTA Card */}
        <div className="bg-card rounded-xl border border-border p-8 lg:p-10 mb-12">
          <div className="max-w-md mx-auto text-center">
            <button
              onClick={() => router.push('/onboarding')}
              className="w-full py-4 px-8 bg-[#101A31] text-white font-heading font-semibold text-lg rounded-lg hover:bg-[#1a2a4a] active:bg-[#0a1220] transition-colors cursor-pointer"
            >
              Select prompts to track
            </button>
            
            <p className="text-sm text-secondary/50 mt-4">
              Choose which AI questions to monitor for your brand
            </p>
          </div>
        </div>

        {/* What You'll See */}
        <div className="mb-8">
          <h2 className="text-xl font-heading font-bold text-primary mb-6">
            What you'll track
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