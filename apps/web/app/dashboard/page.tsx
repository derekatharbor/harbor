'use client'

import React, { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

interface ModuleCard {
  title: string
  description: string
  icon: JSX.Element
}

const moduleCards: ModuleCard[] = [
  {
    title: 'Shopping Visibility',
    description: 'How your products appear in AI shopping recommendations',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="9" cy="21" r="1"></circle>
        <circle cx="20" cy="21" r="1"></circle>
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
      </svg>
    )
  },
  {
    title: 'Brand Visibility',
    description: 'Your brand\'s presence and tone in AI-generated answers',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
        <path d="M2 17l10 5 10-5"></path>
        <path d="M2 12l10 5 10-5"></path>
      </svg>
    )
  },
  {
    title: 'Conversation Volumes',
    description: 'What users ask AI about your brand and category',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      </svg>
    )
  },
  {
    title: 'Website Analytics',
    description: 'How AI crawlers read and understand your site structure',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="9" y1="3" x2="9" y2="21"></line>
      </svg>
    )
  }
]

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [brandName, setBrandName] = useState('')
  const [hasScans, setHasScans] = useState(false)
  
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

        const scansResult = await supabase
          .from('scans')
          .select('id')
          .eq('dashboard_id', dashboard.id)
          .limit(1)
        
        const scans = scansResult.data

        setHasScans(scans ? scans.length > 0 : false)
      } catch (error) {
        console.error('Dashboard load error:', error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [router, supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  if (loading) {
    const loadingStyle = { fontFamily: 'Source Code Pro, monospace' }
    return (
      <div className="min-h-screen bg-[#101A31] flex items-center justify-center">
        <div className="text-white" style={loadingStyle}>
          Loading your dashboard...
        </div>
      </div>
    )
  }

  const headingStyle = { fontFamily: 'Space Grotesk, sans-serif' }
  const bodyStyle = { fontFamily: 'Source Code Pro, monospace' }

  return (
    <div className="min-h-screen bg-[#101A31]">
      <nav className="border-b border-white/5 bg-[#101A31]">
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
          <Image
            src="/images/harbor-logo-white.svg"
            alt="Harbor"
            width={100}
            height={33}
            className="h-8 w-auto"
          />
          <button
            onClick={handleSignOut}
            className="text-sm text-white/60 hover:text-white transition-colors"
            style={bodyStyle}
          >
            Sign out
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-3" style={headingStyle}>
            Welcome to Harbor, {brandName}
          </h1>
          <p className="text-lg text-white/70" style={bodyStyle}>
            Let&apos;s see how AI search engines understand your brand
          </p>
        </div>

        <div className="bg-[#141E38] rounded-xl border border-white/5 p-12 text-center mb-8">
          <div className="max-w-2xl mx-auto">
            <div className="w-20 h-20 bg-[#FF6B4A]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FF6B4A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
            </div>

            <h2 className="text-2xl font-bold text-white mb-4" style={headingStyle}>
              Run your first scan
            </h2>
            
            <p className="text-white/70 mb-8 leading-relaxed" style={bodyStyle}>
              We&apos;ll analyze how ChatGPT, Claude, Gemini, and Perplexity understand your brand. 
              You&apos;ll get visibility scores, product mentions, conversation insights, and optimization recommendations.
            </p>

            <button className="px-8 py-4 bg-[#FF6B4A] text-white rounded-lg font-medium hover:bg-[#E55A3A] transition-all inline-flex items-center gap-2" style={bodyStyle}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
              Start first scan
            </button>

            <p className="text-sm text-white/50 mt-4" style={bodyStyle}>
              First scan takes 2-3 minutes
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {moduleCards.map((module, index) => (
            <div key={index} className="bg-[#141E38] rounded-lg border border-white/5 p-6">
              <div className="w-12 h-12 bg-[#FF6B4A]/10 rounded-lg flex items-center justify-center mb-4 text-[#FF6B4A]">
                {module.icon}
              </div>
              <h3 className="text-white font-semibold mb-2" style={headingStyle}>
                {module.title}
              </h3>
              <p className="text-sm text-white/60" style={bodyStyle}>
                {module.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}