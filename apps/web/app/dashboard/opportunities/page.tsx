// apps/web/app/dashboard/opportunities/page.tsx
// Actionable recommendations organized by On-Page and Off-Page

'use client'

import { useState } from 'react'
import { 
  Lightbulb, 
  ArrowRight, 
  FileText, 
  GitCompare, 
  BookOpen, 
  List, 
  Package,
  MessageCircle,
  Linkedin,
  Star,
  Newspaper,
  ChevronDown,
  ChevronRight as ChevronRightIcon,
  ExternalLink,
  Sparkles
} from 'lucide-react'
import { useBrand } from '@/contexts/BrandContext'
import MobileHeader from '@/components/layout/MobileHeader'

interface ActionCard {
  id: string
  title: string
  description: string
  icon: any
  recommendations: string[]
  whyItMatters: string
  topDomains?: { domain: string; count: number }[]
  commonPhrases?: string[]
}

export default function OpportunitiesPage() {
  const { currentDashboard } = useBrand()
  const [expandedCard, setExpandedCard] = useState<string | null>(null)

  const onPageActions: ActionCard[] = [
    {
      id: 'comparison',
      title: 'Comparison Pages',
      description: 'Create "X vs Y" pages that answer common comparison queries',
      icon: GitCompare,
      recommendations: [
        `Create "${currentDashboard?.brand_name || 'Your Brand'} vs [Top Competitor]" comparison page`,
        'Include objective feature comparisons with tables',
        'Address pricing differences transparently',
        'Add user testimonials from switchers'
      ],
      whyItMatters: 'Comparison pages are LLM magnets because they directly answer "which should I choose" questions that users constantly ask.',
      commonPhrases: [
        `${currentDashboard?.brand_name || 'Brand'} vs Competitor`,
        `Best ${currentDashboard?.metadata?.category || 'software'} comparison`,
        'Which is better for...',
        'Alternatives to...'
      ]
    },
    {
      id: 'howto',
      title: 'How-To Guides',
      description: 'Step-by-step tutorials that demonstrate expertise',
      icon: BookOpen,
      recommendations: [
        'Create guides for common use cases in your category',
        'Include screenshots and code examples where relevant',
        'Structure with clear H2/H3 headers for AI parsing',
        'Add FAQ sections at the bottom'
      ],
      whyItMatters: 'How-to content gets cited when users ask AI for instructions. Clear, structured guides rank higher.',
      commonPhrases: [
        'How to use...',
        'Getting started with...',
        'Tutorial for...',
        'Step by step guide...'
      ]
    },
    {
      id: 'listicle',
      title: 'Listicles',
      description: 'Curated lists that position you as a category expert',
      icon: List,
      recommendations: [
        `Create "Top 10 ${currentDashboard?.metadata?.category || 'tools'} for [Use Case]"`,
        'Include yourself naturally (not always #1)',
        'Provide genuine pros/cons for each option',
        'Update regularly to stay current'
      ],
      whyItMatters: 'Listicles get cited in "best of" queries. Being the author of authoritative lists builds category credibility.',
      commonPhrases: [
        'Best tools for...',
        'Top software for...',
        'Alternatives to...',
        'Options for...'
      ]
    },
    {
      id: 'product',
      title: 'Product Pages',
      description: 'Optimize product pages for AI readability',
      icon: Package,
      recommendations: [
        'Add comprehensive Product schema markup',
        'Write 150+ word descriptions (not just bullet points)',
        'Include pricing, availability, and specifications',
        'Add aggregateRating if you have reviews'
      ],
      whyItMatters: 'Product pages with proper schema get cited in shopping queries. AI needs structured data to recommend accurately.',
      commonPhrases: [
        'Best product for...',
        'Which one should I buy...',
        'Recommended for...',
        'Good option for...'
      ]
    },
    {
      id: 'article',
      title: 'Thought Leadership',
      description: 'Original insights that establish authority',
      icon: FileText,
      recommendations: [
        'Publish original research or data studies',
        'Share unique perspectives on industry trends',
        'Interview experts and publish insights',
        'Take positions on industry debates'
      ],
      whyItMatters: 'Thought leadership content gets cited for industry context. AI looks for authoritative voices when explaining concepts.',
      commonPhrases: [
        'Industry trends...',
        'Future of...',
        'Expert opinion on...',
        'What is the best approach...'
      ]
    }
  ]

  const offPageActions: ActionCard[] = [
    {
      id: 'reddit',
      title: 'Reddit Discussions',
      description: 'Participate authentically in relevant subreddits',
      icon: MessageCircle,
      recommendations: [
        `Join r/${currentDashboard?.metadata?.category || 'technology'} and related subreddits`,
        'Answer questions helpfully (not promotional)',
        'Share expertise without hard-selling',
        'Build karma and credibility over time'
      ],
      whyItMatters: 'Reddit discussions frequently appear in AI citations. Authentic participation builds brand mentions naturally.',
      topDomains: [
        { domain: 'reddit.com', count: 847 }
      ]
    },
    {
      id: 'linkedin',
      title: 'LinkedIn Presence',
      description: 'Build thought leadership on professional networks',
      icon: Linkedin,
      recommendations: [
        'Post regularly about industry insights',
        'Engage with industry conversations',
        'Share company updates and milestones',
        'Have executives active on the platform'
      ],
      whyItMatters: 'LinkedIn content gets indexed and cited for professional/B2B queries. Active presence signals credibility.',
      topDomains: [
        { domain: 'linkedin.com', count: 423 }
      ]
    },
    {
      id: 'reviews',
      title: 'Review Sites',
      description: 'Maintain presence on G2, Capterra, TrustRadius',
      icon: Star,
      recommendations: [
        'Claim and complete your G2 profile',
        'Respond to all reviews (positive and negative)',
        'Encourage customers to leave reviews',
        'Keep product information current'
      ],
      whyItMatters: 'Review sites are heavily cited by AI for product recommendations. High ratings directly impact visibility.',
      topDomains: [
        { domain: 'g2.com', count: 312 },
        { domain: 'capterra.com', count: 198 },
        { domain: 'trustradius.com', count: 87 }
      ]
    },
    {
      id: 'pr',
      title: 'Digital PR',
      description: 'Get featured in authoritative publications',
      icon: Newspaper,
      recommendations: [
        'Pitch stories to industry publications',
        'Contribute guest articles to relevant sites',
        'Get mentioned in "best of" roundups',
        'Build relationships with journalists'
      ],
      whyItMatters: 'Editorial mentions from trusted domains carry significant weight in AI citations. Quality backlinks boost visibility.',
      topDomains: [
        { domain: 'techcrunch.com', count: 156 },
        { domain: 'forbes.com', count: 134 },
        { domain: 'nytimes.com', count: 89 }
      ]
    }
  ]

  const toggleCard = (id: string) => {
    setExpandedCard(expandedCard === id ? null : id)
  }

  const renderActionCard = (action: ActionCard) => {
    const Icon = action.icon
    const isExpanded = expandedCard === action.id

    return (
      <div 
        key={action.id}
        className="card overflow-hidden"
      >
        {/* Card Header - Always visible */}
        <button
          onClick={() => toggleCard(action.id)}
          className="w-full p-5 flex items-center gap-4 text-left hover:bg-secondary/30 transition-colors"
        >
          <div className="w-10 h-10 rounded-lg bg-chart-1/10 flex items-center justify-center flex-shrink-0">
            <Icon className="w-5 h-5 text-chart-1" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-primary">{action.title}</h3>
            <p className="text-sm text-muted truncate">{action.description}</p>
          </div>
          {isExpanded ? (
            <ChevronDown className="w-5 h-5 text-muted flex-shrink-0" />
          ) : (
            <ChevronRightIcon className="w-5 h-5 text-muted flex-shrink-0" />
          )}
        </button>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="border-t border-border">
            <div className="grid md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x divide-border">
              {/* Left: Recommendations */}
              <div className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-chart-3" />
                  <span className="text-sm font-medium text-primary">Recommendations</span>
                </div>
                <ul className="space-y-2">
                  {action.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-secondary">
                      <ArrowRight className="w-3 h-3 mt-1.5 text-chart-1 flex-shrink-0" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Right: Why it matters + Data */}
              <div className="p-5 bg-secondary/20">
                <div className="mb-4">
                  <span className="text-xs font-medium text-muted uppercase tracking-wide">Why it matters</span>
                  <p className="text-sm text-secondary mt-1">{action.whyItMatters}</p>
                </div>

                {action.commonPhrases && (
                  <div className="mb-4">
                    <span className="text-xs font-medium text-muted uppercase tracking-wide">Common Phrases</span>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {action.commonPhrases.slice(0, 4).map((phrase, i) => (
                        <span key={i} className="text-xs px-2 py-1 rounded-full bg-secondary text-secondary">
                          {phrase}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {action.topDomains && (
                  <div>
                    <span className="text-xs font-medium text-muted uppercase tracking-wide">Top Domains</span>
                    <div className="mt-2 space-y-1.5">
                      {action.topDomains.map((d, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <span className="text-secondary flex items-center gap-1.5">
                            <ExternalLink className="w-3 h-3" />
                            {d.domain}
                          </span>
                          <span className="text-muted">{d.count} citations</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-primary" data-page="opportunities">
      <MobileHeader />
      
      {/* Header */}
      <div className="page-header-bar">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
            <Lightbulb className="w-4 h-4 text-orange-500" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-primary">Opportunities</h1>
            <p className="text-sm text-muted">Actions to improve your AI visibility</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* On-Page Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-chart-2"></div>
            <h2 className="text-sm font-semibold text-primary uppercase tracking-wide">On-Page</h2>
            <span className="text-xs text-muted">— Content on your website</span>
          </div>
          <div className="space-y-3">
            {onPageActions.map(renderActionCard)}
          </div>
        </section>

        {/* Off-Page Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-chart-5"></div>
            <h2 className="text-sm font-semibold text-primary uppercase tracking-wide">Off-Page</h2>
            <span className="text-xs text-muted">— Presence across the web</span>
          </div>
          <div className="space-y-3">
            {offPageActions.map(renderActionCard)}
          </div>
        </section>
      </div>
    </div>
  )
}