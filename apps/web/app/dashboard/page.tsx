// app/dashboard/page.tsx
// Updated with theme tokens, UniversalScanButton, and mobile support

'use client'

import React, { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { ShoppingBag, Star, MessageSquare, Globe, Sparkles } from 'lucide-react'
import UniversalScanButton from '@/components/scan/UniversalScanButton'
import MobileHeader from '@/components/layout/MobileHeader'

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [brandName, setBrandName] = useState('')
  
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function loadDashboard() {
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
          .select('brand_name, id')
          .eq('org_id', userRole.org_id)
          .single()
        
        const dashboard = dashboardResult.data

        if (!dashboard) {
          router.push('/onboarding')
          return
        }

        setBrandName(dashboard.brand_name)

        // Check if any scans exist
        const scansResult = await supabase
          .from('scans')
          .select('id, status')
          .eq('dashboard_id', dashboard.id)
          .in('status', ['done', 'partial'])
          .limit(1)
        
        const scans = scansResult.data

        // If scan exists, redirect to overview
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

    loadDashboard()
  }, [router, supabase])

  if (loading) {
    return (
      <>
        <MobileHeader />
        <div className="max-w-screen-2xl mx-auto animate-pulse space-y-8 pt-20 lg:pt-0 px-4 lg:px-0">
          <div className="h-10 w-64 bg-border rounded"></div>
          <div className="bg-card rounded-lg p-12 border border-border h-96"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-card rounded-lg p-6 border border-border h-40"></div>
            ))}
          </div>
        </div>
      </>
    )
  }

  const moduleCards = [
    {
      title: 'Shopping Visibility',
      description: 'How your products appear in AI shopping recommendations',
      icon: ShoppingBag,
      color: '#00C6B7'
    },
    {
      title: 'Brand Visibility',
      description: 'Your brand\'s presence and tone in AI-generated answers',
      icon: Star,
      color: '#4EE4FF'
    },
    {
      title: 'Conversation Volumes',
      description: 'What users ask AI about your brand and category',
      icon: MessageSquare,
      color: '#FFB84D'
    },
    {
      title: 'Website Analytics',
      description: 'How AI crawlers read and understand your site structure',
      icon: Globe,
      color: '#E879F9'
    }
  ]

  return (
    <>
      <MobileHeader />
      <div className="max-w-screen-2xl mx-auto pt-20 lg:pt-0 px-4 lg:px-0">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-heading font-bold text-primary mb-3">
            Welcome to Harbor{brandName && `, ${brandName}`}
          </h1>
          <p className="text-base lg:text-lg text-secondary/70 font-body">
            Let's see how AI search engines understand your brand
          </p>
        </div>

        {/* Main CTA Card */}
        <div className="bg-card rounded-lg border border-border p-8 lg:p-12 mb-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-16 h-16 lg:w-20 lg:h-20 bg-[#FF6B4A]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-8 h-8 lg:w-10 lg:h-10 text-[#FF6B4A]" strokeWidth={1.5} />
            </div>

            <h2 className="text-xl lg:text-2xl font-heading font-bold text-primary mb-4">
              Run your first scan
            </h2>
            
            <p className="text-secondary/60 mb-8 leading-relaxed font-body text-sm lg:text-base">
              We'll analyze how ChatGPT, Claude, and Gemini understand your brand. 
              You'll get visibility scores, product mentions, conversation insights, and optimization recommendations.
            </p>

            <UniversalScanButton variant="large" />

            <p className="text-xs lg:text-sm text-secondary/50 mt-4 font-body">
              First scan takes 2-3 minutes
            </p>
          </div>
        </div>

        {/* What We'll Analyze Section */}
        <div className="mb-6">
          <h2 className="text-xl lg:text-2xl font-heading font-bold text-primary mb-6">
            What We'll Analyze
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {moduleCards.map((module, index) => {
            const Icon = module.icon
            return (
              <div 
                key={index} 
                className="bg-card rounded-lg border border-border p-6 hover:border-white/10 transition-colors"
              >
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                  style={{ backgroundColor: `${module.color}15` }}
                >
                  <Icon 
                    className="w-6 h-6" 
                    style={{ color: module.color }}
                    strokeWidth={1.5}
                  />
                </div>
                <h3 className="text-primary font-heading font-semibold mb-2 text-base">
                  {module.title}
                </h3>
                <p className="text-sm text-secondary/60 font-body leading-relaxed">
                  {module.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}