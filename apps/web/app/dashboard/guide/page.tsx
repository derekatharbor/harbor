// apps/web/app/dashboard/guide/page.tsx
'use client'

import { FileText, Scan, BarChart3, Wrench, RefreshCw, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import MobileHeader from '@/components/layout/MobileHeader'

const steps = [
  {
    number: 1,
    title: 'Run Your First Scan',
    description: 'Harbor analyzes how AI models like ChatGPT, Claude, and Perplexity see your brand. Go to Overview and click "Run Scan" to start.',
    icon: Scan,
    link: '/dashboard/overview',
    linkText: 'Go to Overview'
  },
  {
    number: 2,
    title: 'Check Your Scores',
    description: 'Your Harbor Score shows your overall AI visibility (0-100). Higher is better. Each module breaks down different aspects: shopping results, brand perception, common questions, and website structure.',
    icon: BarChart3,
  },
  {
    number: 3,
    title: 'Fix What Matters',
    description: 'Each module shows specific issues and recommendations. Start with high-priority items. Website Analytics will tell you exactly what to fix on your site.',
    icon: Wrench,
    link: '/dashboard/website',
    linkText: 'View Website Issues'
  },
  {
    number: 4,
    title: 'Re-scan to Verify',
    description: 'After making changes, run another scan to see your updated scores. AI models update their knowledge over time, so check back weekly.',
    icon: RefreshCw,
  },
]

export default function QuickStartGuidePage() {
  return (
    <>
      <MobileHeader />
      <div className="max-w-screen-lg mx-auto pt-20 lg:pt-0 px-4 lg:px-0">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-6 h-6 lg:w-8 lg:h-8 text-[#22D3EE]" strokeWidth={1.5} />
            <h1 className="text-2xl lg:text-4xl font-heading font-bold text-primary">
              Quick Start Guide
            </h1>
          </div>
          <p className="text-secondary/60">
            Get up and running with Harbor in 5 minutes
          </p>
        </div>

        {/* What is Harbor */}
        <div className="bg-card rounded-xl border border-border p-6 lg:p-8 mb-8">
          <h2 className="text-lg font-heading font-semibold text-primary mb-3">
            What is Harbor?
          </h2>
          <p className="text-secondary/70 leading-relaxed">
            Harbor shows you how AI search engines describe your brand. When someone asks ChatGPT 
            "what's the best project management tool?" or "tell me about Company X" — does your 
            brand show up? Is the information accurate? Harbor answers these questions and helps 
            you improve your AI visibility.
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-4">
          {steps.map((step) => {
            const Icon = step.icon
            return (
              <div 
                key={step.number}
                className="bg-card rounded-xl border border-border p-6 lg:p-8"
              >
                <div className="flex gap-5">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-[#22D3EE]/10 flex items-center justify-center">
                      <span className="text-[#22D3EE] font-bold">{step.number}</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Icon className="w-5 h-5 text-primary/60" strokeWidth={1.5} />
                      <h3 className="text-lg font-heading font-semibold text-primary">
                        {step.title}
                      </h3>
                    </div>
                    <p className="text-secondary/70 leading-relaxed mb-4">
                      {step.description}
                    </p>
                    {step.link && (
                      <Link
                        href={step.link}
                        className="inline-flex items-center gap-2 text-sm text-[#22D3EE] hover:text-[#22D3EE]/80 transition-colors"
                      >
                        {step.linkText}
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Tips */}
        <div className="mt-8 bg-[#22D3EE]/5 rounded-xl border border-[#22D3EE]/20 p-6 lg:p-8">
          <h2 className="text-lg font-heading font-semibold text-primary mb-4">
            Tips for Better Scores
          </h2>
          <ul className="space-y-3 text-secondary/70">
            <li className="flex gap-3">
              <span className="text-[#22D3EE]">•</span>
              <span>Add structured data (JSON-LD schema) to your website — AI models love this</span>
            </li>
            <li className="flex gap-3">
              <span className="text-[#22D3EE]">•</span>
              <span>Write clear, factual descriptions of your products and services</span>
            </li>
            <li className="flex gap-3">
              <span className="text-[#22D3EE]">•</span>
              <span>Create FAQ pages that answer common questions about your brand</span>
            </li>
            <li className="flex gap-3">
              <span className="text-[#22D3EE]">•</span>
              <span>Keep your website content up to date — AI models notice stale information</span>
            </li>
          </ul>
        </div>

        {/* Help */}
        <div className="mt-8 text-center text-secondary/50 text-sm pb-8">
          Need help? <a href="mailto:hello@useharbor.io" className="text-[#22D3EE] hover:underline">Contact support</a>
        </div>
      </div>
    </>
  )
}
