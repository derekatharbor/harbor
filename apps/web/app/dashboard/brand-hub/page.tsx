// apps/web/app/dashboard/brand-hub/page.tsx
// Centralized brand data for AI consumption

'use client'

import { useEffect, useState } from 'react'
import { Database, Package, Link2, FileText, DollarSign, Award, Users, Plus, ArrowRight } from 'lucide-react'
import { useBrand } from '@/contexts/BrandContext'
import MobileHeader from '@/components/layout/MobileHeader'

interface BrandHubSection {
  id: string
  title: string
  description: string
  icon: any
  count: number
  status: 'empty' | 'partial' | 'complete'
  href: string
}

export default function BrandHubPage() {
  const { currentDashboard } = useBrand()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // TODO: Fetch actual brand hub data
    setLoading(false)
  }, [currentDashboard])

  const sections: BrandHubSection[] = [
    {
      id: 'products',
      title: 'Products',
      description: 'Your product catalog with descriptions, pricing, and features',
      icon: Package,
      count: 0,
      status: 'empty',
      href: '/dashboard/brand-hub/products'
    },
    {
      id: 'integrations',
      title: 'Integrations',
      description: 'Partner integrations and ecosystem connections',
      icon: Link2,
      count: 0,
      status: 'empty',
      href: '/dashboard/brand-hub/integrations'
    },
    {
      id: 'pricing',
      title: 'Pricing',
      description: 'Pricing tiers, plans, and billing information',
      icon: DollarSign,
      count: 0,
      status: 'empty',
      href: '/dashboard/brand-hub/pricing'
    },
    {
      id: 'faqs',
      title: 'FAQs',
      description: 'Canonical answers to common questions',
      icon: FileText,
      count: 0,
      status: 'empty',
      href: '/dashboard/brand-hub/faqs'
    },
    {
      id: 'team',
      title: 'Team & Leadership',
      description: 'Key people, bios, and organizational info',
      icon: Users,
      count: 0,
      status: 'empty',
      href: '/dashboard/brand-hub/team'
    },
    {
      id: 'credentials',
      title: 'Credentials',
      description: 'Awards, certifications, and trust signals',
      icon: Award,
      count: 0,
      status: 'empty',
      href: '/dashboard/brand-hub/credentials'
    }
  ]

  const statusColors = {
    empty: 'bg-gray-400/10 text-gray-400',
    partial: 'bg-amber-400/10 text-amber-400',
    complete: 'bg-green-400/10 text-green-400'
  }

  const statusLabels = {
    empty: 'Not started',
    partial: 'In progress',
    complete: 'Complete'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-chart-1"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-primary" data-page="brand-hub">
      <MobileHeader />
      
      {/* Header */}
      <div className="page-header-bar">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-chart-1/10 flex items-center justify-center">
            <Database className="w-4 h-4 text-chart-1" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-primary">Brand Hub</h1>
            <p className="text-sm text-muted">Your source of truth for AI models</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Intro Card */}
        <div className="card p-6 border-l-4 border-chart-1">
          <h2 className="font-semibold text-primary mb-2">Tell AI who you are</h2>
          <p className="text-sm text-secondary">
            The information you add here becomes the source of truth for AI models. 
            When someone asks ChatGPT or Claude about your products, pricing, or team — this is what they'll learn.
          </p>
        </div>

        {/* Sections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sections.map((section) => {
            const Icon = section.icon
            return (
              <div 
                key={section.id}
                className="card card-interactive p-5 group cursor-pointer"
                onClick={() => {
                  // TODO: Navigate to section
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-chart-1/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-chart-1" />
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${statusColors[section.status]}`}>
                    {statusLabels[section.status]}
                  </span>
                </div>
                <h3 className="font-medium text-primary mb-1 group-hover:text-chart-1 transition-colors">
                  {section.title}
                </h3>
                <p className="text-sm text-secondary mb-4">{section.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted">
                    {section.count} {section.count === 1 ? 'item' : 'items'}
                  </span>
                  <Plus className="w-4 h-4 text-muted group-hover:text-chart-1 transition-colors" />
                </div>
              </div>
            )
          })}
        </div>

        {/* Feed Preview */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-primary">Your AI Feed</h3>
              <p className="text-sm text-muted">Structured data for AI crawlers</p>
            </div>
            <button 
              className="text-sm text-chart-1 hover:underline flex items-center gap-1"
              disabled
            >
              Preview Feed <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="bg-secondary/30 rounded-lg p-4 font-mono text-xs text-muted">
            <span className="text-secondary">// Add content above to generate your feed</span>
            <br />
            <span className="text-chart-1">{'{'}</span>
            <br />
            <span className="ml-4">"@context": "https://schema.org",</span>
            <br />
            <span className="ml-4">"@type": "Organization",</span>
            <br />
            <span className="ml-4">"name": "{currentDashboard?.brand_name || 'Your Brand'}"</span>
            <br />
            <span className="text-chart-1">{'}'}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
