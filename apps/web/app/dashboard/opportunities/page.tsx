// apps/web/app/dashboard/opportunities/page.tsx
// Actionable recommendations - Peec-inspired three-column layout

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
  CheckCircle2,
  HelpCircle,
  Copy,
  ExternalLink
} from 'lucide-react'
import { useBrand } from '@/contexts/BrandContext'
import MobileHeader from '@/components/layout/MobileHeader'

interface ActionType {
  id: string
  title: string
  icon: any
  category: 'on-page' | 'off-page'
  actionItems: string[]
  learn: string
  commonPhrases: { phrase: string; count: number }[]
  topSources: { domain: string; count: number; favicon?: string }[]
}

export default function OpportunitiesPage() {
  const { currentDashboard } = useBrand()
  const [selectedCategory, setSelectedCategory] = useState<'on-page' | 'off-page'>('on-page')
  const [selectedAction, setSelectedAction] = useState<string>('comparison')

  const actionTypes: ActionType[] = [
    // On-Page Actions
    {
      id: 'comparison',
      title: 'Comparison',
      icon: GitCompare,
      category: 'on-page',
      actionItems: [
        `Create a "${currentDashboard?.brand_name || 'Your Brand'} vs [Competitor]" page targeting common comparison queries`,
        'Study competitor comparison pages that are frequently cited by LLMs',
        'Include objective feature tables, pricing comparisons, and use-case recommendations',
        'Add FAQ schema markup to comparison pages for better AI parsing'
      ],
      learn: `Comparison pages are LLM magnets because they directly answer "which should I choose" questions that users constantly ask.\n\nIf competitors are winning these citations, build your own comparison that's more thorough, more honest, or covers angles they've missed.\n\nMake sure you can genuinely compete on quality: a weak comparison will hurt more than help.`,
      commonPhrases: [
        { phrase: `${currentDashboard?.brand_name || 'Brand'} vs Competitor`, count: 36 },
        { phrase: 'which is best for...', count: 35 },
        { phrase: 'how do they compare', count: 22 },
        { phrase: 'alternative to...', count: 17 },
        { phrase: 'difference between...', count: 17 }
      ],
      topSources: [
        { domain: 'g2.com', count: 364 },
        { domain: 'capterra.com', count: 156 },
        { domain: 'trustradius.com', count: 87 }
      ]
    },
    {
      id: 'article',
      title: 'Article',
      icon: FileText,
      category: 'on-page',
      actionItems: [
        'Publish original research or data studies in your category',
        'Share unique perspectives on industry trends',
        'Create comprehensive guides that become reference material',
        'Interview experts and publish actionable insights'
      ],
      learn: `Thought leadership content gets cited for industry context. AI looks for authoritative voices when explaining concepts or trends.\n\nOriginal data and unique perspectives are particularly valuable - they can't be found elsewhere, making your content the primary source.`,
      commonPhrases: [
        { phrase: 'industry trends...', count: 28 },
        { phrase: 'future of...', count: 24 },
        { phrase: 'expert opinion on...', count: 19 },
        { phrase: 'what is the best approach...', count: 15 }
      ],
      topSources: [
        { domain: 'hbr.org', count: 234 },
        { domain: 'mckinsey.com', count: 189 },
        { domain: 'forbes.com', count: 145 }
      ]
    },
    {
      id: 'howto',
      title: 'How-To Guide',
      icon: BookOpen,
      category: 'on-page',
      actionItems: [
        'Create step-by-step tutorials for common use cases in your category',
        'Include screenshots, code examples, and visual aids where relevant',
        'Structure content with clear H2/H3 headers for better AI parsing',
        'Add FAQ sections addressing common follow-up questions'
      ],
      learn: `How-to content gets cited when users ask AI for instructions. Clear, well-structured guides rank higher in AI responses.\n\nThe key is specificity - generic advice is everywhere. Detailed, practical guides with real examples become go-to references.`,
      commonPhrases: [
        { phrase: 'how to use...', count: 45 },
        { phrase: 'getting started with...', count: 38 },
        { phrase: 'tutorial for...', count: 29 },
        { phrase: 'step by step guide...', count: 22 }
      ],
      topSources: [
        { domain: 'docs.github.com', count: 312 },
        { domain: 'stackoverflow.com', count: 287 },
        { domain: 'medium.com', count: 156 }
      ]
    },
    {
      id: 'listicle',
      title: 'Listicle',
      icon: List,
      category: 'on-page',
      actionItems: [
        `Create "Top 10 ${currentDashboard?.metadata?.category || 'tools'} for [Use Case]" content`,
        'Include yourself naturally in the list (not always #1 - authenticity matters)',
        'Provide genuine pros/cons for each option',
        'Update regularly to maintain relevance and accuracy'
      ],
      learn: `Listicles get cited in "best of" queries. Being the author of authoritative lists builds category credibility.\n\nThe key is objectivity - if your list is obviously biased toward your own product, it loses credibility and AI citation potential.`,
      commonPhrases: [
        { phrase: 'best tools for...', count: 52 },
        { phrase: 'top software for...', count: 41 },
        { phrase: 'alternatives to...', count: 33 },
        { phrase: 'options for...', count: 27 }
      ],
      topSources: [
        { domain: 'zapier.com', count: 289 },
        { domain: 'hubspot.com', count: 234 },
        { domain: 'buffer.com', count: 178 }
      ]
    },
    {
      id: 'product',
      title: 'Product Page',
      icon: Package,
      category: 'on-page',
      actionItems: [
        'Add comprehensive Product schema markup (JSON-LD)',
        'Write 150+ word descriptions (not just bullet points)',
        'Include pricing, availability, and detailed specifications',
        'Add aggregateRating schema if you have customer reviews'
      ],
      learn: `Product pages with proper schema get cited in shopping queries. AI needs structured data to recommend products accurately.\n\nIncomplete or poorly structured product pages get skipped in favor of competitors with better markup.`,
      commonPhrases: [
        { phrase: 'best product for...', count: 48 },
        { phrase: 'which one should I buy...', count: 35 },
        { phrase: 'recommended for...', count: 29 },
        { phrase: 'good option for...', count: 24 }
      ],
      topSources: [
        { domain: 'amazon.com', count: 567 },
        { domain: 'bestbuy.com', count: 234 },
        { domain: 'wirecutter.com', count: 189 }
      ]
    },
    // Off-Page Actions
    {
      id: 'reddit',
      title: 'Reddit',
      icon: MessageCircle,
      category: 'off-page',
      actionItems: [
        `Join relevant subreddits in your category (r/${currentDashboard?.metadata?.category || 'technology'})`,
        'Answer questions helpfully without being promotional',
        'Share genuine expertise and build karma over time',
        'Participate in discussions where your product is naturally relevant'
      ],
      learn: `Reddit discussions frequently appear in AI citations. The platform's authentic, community-driven content is trusted by AI models.\n\nAuthentic participation matters - obvious marketing gets downvoted and ignored. Build real credibility.`,
      commonPhrases: [
        { phrase: 'has anyone used...', count: 67 },
        { phrase: 'what do you recommend...', count: 54 },
        { phrase: 'thoughts on...', count: 43 },
        { phrase: 'experience with...', count: 38 }
      ],
      topSources: [
        { domain: 'reddit.com', count: 847 }
      ]
    },
    {
      id: 'linkedin',
      title: 'LinkedIn',
      icon: Linkedin,
      category: 'off-page',
      actionItems: [
        'Post regularly about industry insights and trends',
        'Engage meaningfully with industry conversations',
        'Share company updates, milestones, and behind-the-scenes content',
        'Ensure executives are active and visible on the platform'
      ],
      learn: `LinkedIn content gets indexed and cited for professional and B2B queries. Active presence signals credibility to AI models.\n\nConsistency matters more than virality - regular, valuable posts build authority over time.`,
      commonPhrases: [
        { phrase: 'professional network...', count: 34 },
        { phrase: 'industry leader...', count: 28 },
        { phrase: 'B2B solution...', count: 23 },
        { phrase: 'enterprise...', count: 19 }
      ],
      topSources: [
        { domain: 'linkedin.com', count: 423 }
      ]
    },
    {
      id: 'reviews',
      title: 'Reviews',
      icon: Star,
      category: 'off-page',
      actionItems: [
        'Claim and complete your G2, Capterra, and TrustRadius profiles',
        'Respond thoughtfully to all reviews (positive and negative)',
        'Encourage satisfied customers to leave authentic reviews',
        'Keep product information and screenshots current'
      ],
      learn: `Review sites are heavily cited by AI for product recommendations. High ratings and review volume directly impact visibility.\n\nNegative reviews handled well can actually boost credibility - they show you're responsive and care about customers.`,
      commonPhrases: [
        { phrase: 'reviews of...', count: 56 },
        { phrase: 'is it worth it...', count: 43 },
        { phrase: 'user experience...', count: 37 },
        { phrase: 'customer feedback...', count: 29 }
      ],
      topSources: [
        { domain: 'g2.com', count: 312 },
        { domain: 'capterra.com', count: 198 },
        { domain: 'trustradius.com', count: 87 }
      ]
    },
    {
      id: 'pr',
      title: 'Digital PR',
      icon: Newspaper,
      category: 'off-page',
      actionItems: [
        'Pitch newsworthy stories to industry publications',
        'Contribute guest articles to authoritative sites',
        'Get featured in "best of" roundups and listicles',
        'Build ongoing relationships with relevant journalists'
      ],
      learn: `Editorial mentions from trusted domains carry significant weight in AI citations. Quality backlinks from authoritative sources boost visibility across all queries.\n\nFocus on genuine newsworthiness - AI can distinguish earned media from paid placements.`,
      commonPhrases: [
        { phrase: 'featured in...', count: 34 },
        { phrase: 'according to...', count: 28 },
        { phrase: 'reported by...', count: 22 },
        { phrase: 'announced...', count: 18 }
      ],
      topSources: [
        { domain: 'techcrunch.com', count: 156 },
        { domain: 'forbes.com', count: 134 },
        { domain: 'theverge.com', count: 98 }
      ]
    }
  ]

  const onPageActions = actionTypes.filter(a => a.category === 'on-page')
  const offPageActions = actionTypes.filter(a => a.category === 'off-page')
  
  const currentActions = selectedCategory === 'on-page' ? onPageActions : offPageActions
  const selectedActionData = actionTypes.find(a => a.id === selectedAction)

  // When category changes, select first action in that category
  const handleCategoryChange = (category: 'on-page' | 'off-page') => {
    setSelectedCategory(category)
    const firstInCategory = actionTypes.find(a => a.category === category)
    if (firstInCategory) {
      setSelectedAction(firstInCategory.id)
    }
  }

  return (
    <div className="min-h-screen bg-primary" data-page="opportunities">
      <MobileHeader />
      
      {/* Header */}
      <div className="page-header-bar">
        <div className="flex items-center gap-3">
          <Lightbulb className="w-5 h-5 text-muted" strokeWidth={1.5} />
          <div>
            <h1 className="text-lg font-semibold text-primary">Opportunities</h1>
            <p className="text-sm text-muted">Actions to improve your AI visibility</p>
          </div>
        </div>
      </div>

      {/* Three-column layout */}
      <div className="flex h-[calc(100vh-73px)]">
        
        {/* Left Column - Navigation */}
        <div className="w-56 border-r border-border flex-shrink-0 overflow-y-auto">
          {/* On-Page Section */}
          <div className="p-4">
            <button
              onClick={() => handleCategoryChange('on-page')}
              className={`text-xs font-medium uppercase tracking-wide mb-3 ${
                selectedCategory === 'on-page' ? 'text-primary' : 'text-muted'
              }`}
            >
              On-Page
            </button>
            <div className="space-y-1">
              {onPageActions.map((action) => {
                const Icon = action.icon
                const isSelected = selectedAction === action.id
                return (
                  <button
                    key={action.id}
                    onClick={() => {
                      setSelectedCategory('on-page')
                      setSelectedAction(action.id)
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      isSelected 
                        ? 'bg-secondary text-primary' 
                        : 'text-secondary hover:bg-secondary/50 hover:text-primary'
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={1.5} />
                    <span className="text-sm">{action.title}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Off-Page Section */}
          <div className="p-4 border-t border-border">
            <button
              onClick={() => handleCategoryChange('off-page')}
              className={`text-xs font-medium uppercase tracking-wide mb-3 ${
                selectedCategory === 'off-page' ? 'text-primary' : 'text-muted'
              }`}
            >
              Off-Page
            </button>
            <div className="space-y-1">
              {offPageActions.map((action) => {
                const Icon = action.icon
                const isSelected = selectedAction === action.id
                return (
                  <button
                    key={action.id}
                    onClick={() => {
                      setSelectedCategory('off-page')
                      setSelectedAction(action.id)
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      isSelected 
                        ? 'bg-secondary text-primary' 
                        : 'text-secondary hover:bg-secondary/50 hover:text-primary'
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={1.5} />
                    <span className="text-sm">{action.title}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right Content Area */}
        {selectedActionData && (
          <div className="flex-1 overflow-y-auto">
            {/* Action Header */}
            <div className="p-6 border-b border-border">
              <div className="flex items-center gap-2 text-sm text-muted">
                <span>Opportunities</span>
                <span>›</span>
                <span>{selectedCategory === 'on-page' ? 'On-Page' : 'Off-Page'}</span>
                <span>›</span>
                <span className="text-primary">{selectedActionData.title}</span>
              </div>
            </div>

            {/* Two-column content */}
            <div className="grid lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-border">
              {/* Action Items */}
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle2 className="w-4 h-4 text-muted" strokeWidth={1.5} />
                  <h2 className="text-sm font-medium text-primary">Action Items</h2>
                </div>
                <ul className="space-y-3">
                  {selectedActionData.actionItems.map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-chart-2/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle2 className="w-3 h-3 text-chart-2" />
                      </div>
                      <span className="text-sm text-secondary leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Learn */}
              <div className="p-6 bg-secondary/20">
                <div className="flex items-center gap-2 mb-4">
                  <HelpCircle className="w-4 h-4 text-muted" strokeWidth={1.5} />
                  <h2 className="text-sm font-medium text-primary">Learn</h2>
                </div>
                <div className="text-sm text-secondary leading-relaxed whitespace-pre-line">
                  {selectedActionData.learn}
                </div>
              </div>
            </div>

            {/* Phrases and Sources */}
            <div className="border-t border-border">
              <div className="p-6 pb-3">
                <h3 className="text-sm font-medium text-primary">Phrases and Sources</h3>
              </div>
              <div className="grid lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-border">
                {/* Common Phrases */}
                <div className="p-6 pt-0">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-muted uppercase tracking-wide">Common Phrases</span>
                    <button className="text-muted hover:text-primary">
                      <Copy className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                  </div>
                  <div className="space-y-2">
                    {selectedActionData.commonPhrases.map((phrase, i) => (
                      <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                        <span className="text-sm text-secondary truncate pr-4">{phrase.phrase}</span>
                        <span className="text-sm text-muted tabular-nums">{phrase.count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top Sources */}
                <div className="p-6 pt-0">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-muted uppercase tracking-wide">Top Sources</span>
                    <HelpCircle className="w-4 h-4 text-muted" strokeWidth={1.5} />
                  </div>
                  <div className="space-y-2">
                    {selectedActionData.topSources.map((source, i) => (
                      <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                        <span className="text-sm text-secondary flex items-center gap-2">
                          <ExternalLink className="w-3 h-3 text-muted" />
                          {source.domain}
                        </span>
                        <span className="text-sm text-muted tabular-nums">{source.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}