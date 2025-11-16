// lib/optimization/tasks.ts
// Pre-defined optimization tasks with trigger logic

export type TaskImpact = 'high' | 'medium' | 'low'
export type TaskDifficulty = 'easy' | 'medium' | 'hard'
export type TaskModule = 'shopping' | 'brand' | 'conversations' | 'website'

export interface OptimizationTask {
  id: string
  module: TaskModule
  title: string
  description: string
  impact: TaskImpact
  difficulty: TaskDifficulty
  icon: string // lucide-react icon name
  
  // Modal content
  whyMatters: string
  whatToDo: string[]
  whereToDoIt: string[]
  
  // Actions
  hasGenerator: boolean
  hasValidator: boolean
  generatorEndpoint?: string
  validatorEndpoint?: string
  
  // Trigger logic
  shouldShow: (data: any) => boolean
}

// ============================================================================
// SHOPPING VISIBILITY TASKS
// ============================================================================

export const SHOPPING_TASKS: OptimizationTask[] = [
  {
    id: 'add-product-schema',
    module: 'shopping',
    title: 'Add Product Schema',
    description: 'Help AI models understand your products with structured data',
    impact: 'high',
    difficulty: 'easy',
    icon: 'ShoppingBag',
    
    whyMatters: 'AI models like ChatGPT, Claude, and Gemini need structured data to understand your products. Without Product schema, they can\'t reliably surface your products in shopping recommendations. This is the #1 factor in AI visibility.',
    
    whatToDo: [
      'We\'ll generate a Product JSON-LD snippet for each of your products',
      'This code tells AI exactly what you sell, pricing, ratings, and availability',
      'It\'s a simple copy/paste—no coding required'
    ],
    
    whereToDoIt: [
      'Open your product page template in your CMS (Shopify, WordPress, etc.)',
      'Find the <head> section of your HTML',
      'Paste the generated code before the closing </head> tag',
      'Save and publish the changes',
      'Repeat for each product type or use a template variable'
    ],
    
    hasGenerator: true,
    hasValidator: true,
    generatorEndpoint: '/api/gen/product-schema',
    validatorEndpoint: '/api/validate/schema',
    
    shouldShow: (data) => {
      // Show if user has low rankings or few mentions
      const userMentions = data.total_mentions || 0
      const avgRank = data.categories?.reduce((sum: number, cat: any) => sum + cat.rank, 0) / (data.categories?.length || 1)
      return userMentions < 10 || avgRank > 3
    }
  },
  
  {
    id: 'enrich-descriptions',
    module: 'shopping',
    title: 'Enrich Product Descriptions',
    description: 'Rewrite product descriptions to be AI-readable and compelling',
    impact: 'high',
    difficulty: 'medium',
    icon: 'FileText',
    
    whyMatters: 'AI models scan your product descriptions to understand what you sell and who it\'s for. Marketing fluff and jargon confuse them. Clear, factual descriptions with use cases help AI recommend your products accurately.',
    
    whatToDo: [
      'We\'ll generate 120-150 word descriptions for your key products',
      'These are written specifically for AI comprehension',
      'They focus on: what it is, who it\'s for, key features, and use cases'
    ],
    
    whereToDoIt: [
      'Copy the generated description',
      'Go to your product page in your CMS',
      'Add a new section called "Overview" or "About This Product"',
      'Paste the description above or below your existing content',
      'You can keep your marketing copy—this is supplemental'
    ],
    
    hasGenerator: true,
    hasValidator: false,
    generatorEndpoint: '/api/gen/product-description',
    
    shouldShow: (data) => {
      // Show if user brand appears but with low confidence or weak positioning
      const userProducts = data.raw_results?.filter((r: any) => r.is_user_brand) || []
      return userProducts.length > 0 && userProducts.length < 5
    }
  },
  
  {
    id: 'add-offers-schema',
    module: 'shopping',
    title: 'Add Pricing & Availability Schema',
    description: 'Make your prices and stock status visible to AI',
    impact: 'medium',
    difficulty: 'easy',
    icon: 'DollarSign',
    
    whyMatters: 'When users ask "What\'s the best affordable option?" or "What\'s in stock?", AI needs your pricing and availability data. The Offers schema tells AI your current price, currency, and whether the product is available.',
    
    whatToDo: [
      'We\'ll generate an Offers schema snippet',
      'This includes price, currency, availability status, and valid dates',
      'It goes inside your existing Product schema'
    ],
    
    whereToDoIt: [
      'Open the Product schema you added earlier (or we can combine them)',
      'Add the "offers" property inside your Product object',
      'Paste the generated Offers snippet',
      'Make sure your price updates automatically if you use dynamic pricing'
    ],
    
    hasGenerator: true,
    hasValidator: true,
    generatorEndpoint: '/api/gen/product-schema', // Use same endpoint
    validatorEndpoint: '/api/validate/schema',
    
    shouldShow: (data) => {
      // Always show after product schema is added
      return true
    }
  },
  
  {
    id: 'add-review-schema',
    module: 'shopping',
    title: 'Add Review & Rating Schema',
    description: 'Surface your product ratings and customer reviews to AI',
    impact: 'medium',
    difficulty: 'medium',
    icon: 'Star',
    
    whyMatters: 'AI models heavily weight customer reviews and ratings when making recommendations. If you have 4.8 stars and 500 reviews but no schema, AI doesn\'t know. Review schema surfaces your social proof.',
    
    whatToDo: [
      'We\'ll generate a Review and AggregateRating schema',
      'This shows your average rating, total reviews, and individual review highlights',
      'You\'ll need at least a few real customer reviews to use this'
    ],
    
    whereToDoIt: [
      'Add the "aggregateRating" and "review" properties to your Product schema',
      'Paste the generated snippets',
      'If you use a review platform (Yotpo, Trustpilot, etc.), connect their schema too',
      'Keep this updated as new reviews come in'
    ],
    
    hasGenerator: true,
    hasValidator: true,
    generatorEndpoint: '/api/gen/review-schema',
    validatorEndpoint: '/api/validate/schema',
    
    shouldShow: (data) => {
      // Show if user has products but isn't ranking well
      const avgRank = data.categories?.reduce((sum: number, cat: any) => sum + cat.rank, 0) / (data.categories?.length || 1)
      return avgRank > 2
    }
  },
  
  {
    id: 'create-category-pages',
    module: 'shopping',
    title: 'Create Missing Category Pages',
    description: 'Build landing pages for categories where you should appear but don\'t',
    impact: 'high',
    difficulty: 'hard',
    icon: 'Layout',
    
    whyMatters: 'AI finds you by scanning category-specific pages. If you sell "payment APIs" but only have a generic "products" page, AI won\'t surface you when users ask about payment solutions. Dedicated category pages give AI clear signals.',
    
    whatToDo: [
      'We\'ll identify categories where competitors appear but you don\'t',
      'For each, we\'ll suggest a page structure and headline copy',
      'You\'ll need to create actual pages in your CMS—this is more work but high impact'
    ],
    
    whereToDoIt: [
      'Create a new page in your CMS for each missing category',
      'Use our suggested URL structure: /products/[category-name]',
      'Add a clear H1 headline with the category name',
      'List relevant products with descriptions',
      'Add breadcrumb schema so AI understands the hierarchy'
    ],
    
    hasGenerator: true,
    hasValidator: false,
    generatorEndpoint: '/api/gen/category-page',
    
    shouldShow: (data) => {
      // Show if there are categories where competitors appear but user doesn't
      const allCategories = new Set(data.categories?.map((c: any) => c.category) || [])
      const userCategories = new Set(
        data.raw_results?.filter((r: any) => r.is_user_brand).map((r: any) => r.category) || []
      )
      return allCategories.size > userCategories.size
    }
  }
]

// ============================================================================
// BRAND VISIBILITY TASKS
// ============================================================================

// UPDATED BRAND_TASKS - Only measurable, code-based tasks


export const BRAND_TASKS: OptimizationTask[] = [
  {
    id: 'add-organization-schema',
    module: 'brand',
    title: 'Add Organization Schema',
    description: 'Tell AI who you are with structured brand data',
    impact: 'high',
    difficulty: 'easy',
    icon: 'Building2',
    
    whyMatters: 'AI models need to know your brand identity—who you are, what you do, and how to contact you. Organization schema provides this foundational information and helps AI understand your brand beyond just product mentions.',
    
    whatToDo: [
      'Generate an Organization JSON-LD snippet with your brand info',
      'This includes name, URL, logo, description, and social links',
      'It tells AI your official brand identity'
    ],
    
    whereToDoIt: [
      'Open your homepage or about page',
      'Find the <head> section',
      'Paste the generated code before the closing </head> tag',
      'Save and publish',
      'This applies site-wide from your homepage'
    ],
    
    hasGenerator: true,
    hasValidator: true,
    generatorEndpoint: '/api/gen/organization-schema',
    validatorEndpoint: '/api/validate/schema',
    
    shouldShow: (data) => {
      return data.visibility_index < 80
    }
  },
  
  {
    id: 'add-faq-schema',
    module: 'brand',
    title: 'Add FAQ Schema',
    description: 'Answer common questions about your brand directly in search results',
    impact: 'medium',
    difficulty: 'easy',
    icon: 'MessageCircle',
    
    whyMatters: 'When users ask AI questions about your brand, FAQ schema helps provide accurate answers. This builds trust and increases visibility for informational queries.',
    
    whatToDo: [
      'We\'ll generate FAQ schema for the most common questions about your brand',
      'This structured data tells AI exactly how to answer questions',
      'It increases your presence in conversational AI results'
    ],
    
    whereToDoIt: [
      'Add an FAQ section to your About or Support page (if you don\'t have one)',
      'Paste the generated FAQ schema in the <head> section',
      'Make sure the visible Q&A on the page matches the schema',
      'Save and publish'
    ],
    
    hasGenerator: true,
    hasValidator: true,
    generatorEndpoint: '/api/gen/faq-schema',
    validatorEndpoint: '/api/validate/schema',
    
    shouldShow: (data) => {
      return data.total_mentions < 50
    }
  },

  {
    id: 'fix-negative-descriptors',
    module: 'brand',
    title: 'Address Negative Brand Perception',
    description: 'Create content to counter negative descriptors',
    impact: 'high',
    difficulty: 'medium',
    icon: 'AlertTriangle',
    
    whyMatters: 'AI has associated your brand with negative terms. These hurt your reputation when AI recommends alternatives. The only way to change this is by publishing content that addresses these concerns directly.',
    
    whatToDo: [
      'Review the negative descriptors AI has learned',
      'Create content that directly addresses each concern',
      'Publish case studies, testimonials, or blog posts that counter these perceptions',
      'Update your About page to clarify misconceptions'
    ],
    
    whereToDoIt: [
      'For "expensive" → Publish pricing transparency page or value comparison',
      'For "complex" → Create "Getting Started" guide or simplified explainer',
      'For "limited support" → Add support page with hours, channels, response times',
      'For "overwhelming" → Create onboarding docs or quick-start guide',
      'Link to all of these from your homepage or navigation'
    ],
    
    hasGenerator: false, // NO CODE - this is strategic
    hasValidator: false,
    
    shouldShow: (data) => {
      const negPct = data.sentiment_breakdown?.negative || 0
      return negPct > 20
    }
  },
  
  {
    id: 'add-breadcrumb-schema',
    module: 'brand',
    title: 'Add Breadcrumb Navigation Schema',
    description: 'Help AI understand your site structure',
    impact: 'low',
    difficulty: 'easy',
    icon: 'Navigation',
    
    whyMatters: 'Breadcrumb schema helps AI understand how your pages relate to each other. This improves your overall brand comprehension and helps AI surface the right pages for specific queries.',
    
    whatToDo: [
      'Generate breadcrumb schema for your main pages',
      'This shows AI your site hierarchy (Home > Products > Product Name)',
      'It helps AI understand context and relationships'
    ],
    
    whereToDoIt: [
      'Add breadcrumb navigation to your pages (if you don\'t have it)',
      'Paste the generated schema in the <head> of each page',
      'Make sure the visible breadcrumbs match the schema',
      'Repeat for all main pages (products, about, support, etc.)'
    ],
    
    hasGenerator: true,
    hasValidator: true,
    generatorEndpoint: '/api/gen/breadcrumb-schema',
    validatorEndpoint: '/api/validate/schema',
    
    shouldShow: (data) => {
      return data.visibility_index < 60
    }
  }
]


// NOTES:
// - Organization Schema: MEASURABLE - re-scan shows visibility increase
// - FAQ Schema: MEASURABLE - re-scan shows mention increase in Q&A contexts
// - Breadcrumb Schema: MEASURABLE - re-scan shows better page association
// - Fix Negative Descriptors: STRATEGIC - no code, just guidance on what content to create
//
// Removed:
// - "Boost positive descriptors" - not measurable, just content advice
// - "Unify brand language" - not measurable, just copywriting
// - "Add authority links" - this goes in Organization schema already

// ============================================================================
// CONVERSATION VOLUME TASKS
// ============================================================================

export const CONVERSATION_TASKS: OptimizationTask[] = [
  {
    id: 'claim-brand-questions',
    module: 'conversations',
    title: 'Answer Questions About Your Brand',
    description: 'Create FAQ schema for questions that already mention your brand',
    impact: 'high',
    difficulty: 'easy',
    icon: 'Target',
    
    whyMatters: 'Users are already asking AI about YOUR brand specifically. If you don\'t provide answers, AI will either skip you or use outdated/competitor information. These are the highest-intent questions to answer.',
    
    whatToDo: [
      'We\'ll identify questions that explicitly mention your brand name',
      'Generate FAQPage schema with authoritative answers',
      'These questions show what people already want to know about you'
    ],
    
    whereToDoIt: [
      'Create a brand-specific FAQ page (e.g., /about/faq)',
      'Answer each question that mentions your brand',
      'Paste the generated FAQPage schema in the <head>',
      'Make visible Q&As match the schema',
      'Link from your homepage or About page'
    ],
    
    hasGenerator: true,
    hasValidator: true,
    generatorEndpoint: '/api/gen/brand-faq-schema',
    validatorEndpoint: '/api/validate/schema',
    
    shouldShow: (data) => {
      // Show if there are questions that mention the brand
      const brandQuestions = data.questions?.filter((q: any) => q.mentions_brand === true) || []
      return brandQuestions.length >= 3
    }
  },
  
  {
    id: 'add-faq-page-schema',
    module: 'conversations',
    title: 'Add Category FAQ Schema',
    description: 'Answer common category questions to increase visibility',
    impact: 'high',
    difficulty: 'easy',
    icon: 'MessageCircle',
    
    whyMatters: 'When users ask AI general questions about your category, FAQ schema helps you appear in those answers even if they don\'t know your brand yet. This builds awareness and positions you as an authority.',
    
    whatToDo: [
      'We\'ll generate FAQPage schema for high-scoring category questions',
      'Focus on questions that don\'t mention your brand (opportunity to get mentioned)',
      'Each Q&A increases your chances of being cited by AI'
    ],
    
    whereToDoIt: [
      'Create an FAQ or Resources page',
      'Answer the top category questions from your industry',
      'Paste the generated schema in the <head> section',
      'Make sure visible Q&As match the schema',
      'Save and publish'
    ],
    
    hasGenerator: true,
    hasValidator: true,
    generatorEndpoint: '/api/gen/faq-schema',
    validatorEndpoint: '/api/validate/schema',
    
    shouldShow: (data) => {
      // Show if there are high-scoring questions that DON'T mention the brand
      const categoryQuestions = data.questions?.filter((q: any) => q.score >= 50 && q.mentions_brand === false) || []
      return categoryQuestions.length >= 5
    }
  },
  
  {
    id: 'create-competitor-comparisons',
    module: 'conversations',
    title: 'Build Competitor Comparison Pages',
    description: 'Answer direct "X vs Y" questions with fair comparisons',
    impact: 'high',
    difficulty: 'medium',
    icon: 'GitCompare',
    
    whyMatters: 'Users are directly comparing you to specific competitors in AI. If you don\'t have comparison pages, AI pulls from competitor content—giving them the advantage. Balanced comparison pages let you control the narrative and highlight your strengths.',
    
    whatToDo: [
      'We\'ll identify which competitors users are comparing you against',
      'Generate fair, factual comparison outlines for each matchup',
      'Create pages that acknowledge competitor strengths but highlight your advantages',
      'Add structured data so AI understands the comparison clearly'
    ],
    
    whereToDoIt: [
      'Create a comparison page for each top competitor',
      'URL structure: /compare/your-brand-vs-[competitor]',
      'Use our generated outline with a feature comparison table',
      'Be fair and factual—AI rewards balanced comparisons',
      'Add ComparisonTable or Product schema to both offerings',
      'Link from your pricing or features page'
    ],
    
    hasGenerator: true,
    hasValidator: false,
    generatorEndpoint: '/api/gen/competitor-comparison',
    
    shouldShow: (data) => {
      // Show if there are questions that mention competitors
      const competitorQuestions = data.questions?.filter((q: any) => q.mentions_competitor === true) || []
      return competitorQuestions.length >= 3
    }
  },
  
  {
    id: 'create-how-to-guides',
    module: 'conversations',
    title: 'Create How-To Guides',
    description: 'Answer "how to" questions with step-by-step guides',
    impact: 'medium',
    difficulty: 'medium',
    icon: 'BookOpen',
    
    whyMatters: 'When users ask AI "how to" questions, they want clear instructions. If you don\'t have guides, AI either won\'t mention you or will piece together answers from scattered content. Dedicated how-to pages position you as the authority.',
    
    whatToDo: [
      'We\'ll identify your top "how to" questions',
      'For each, we\'ll suggest a guide structure with clear steps',
      'You\'ll create pages with numbered steps, screenshots, and HowTo schema',
      'This helps AI cite you as the authoritative source'
    ],
    
    whereToDoIt: [
      'Create a /guides or /how-to section on your site',
      'Write a guide for each top question (3-8 numbered steps)',
      'Add HowTo schema (we\'ll generate the JSON-LD)',
      'Include clear headings like "How to [do X]"',
      'Link to these guides from related product pages'
    ],
    
    hasGenerator: true,
    hasValidator: true,
    generatorEndpoint: '/api/gen/howto-outline',
    validatorEndpoint: '/api/validate/schema',
    
    shouldShow: (data) => {
      // Show if there are "how_to" intent questions
      const howToQuestions = data.questions?.filter((q: any) => q.intent === 'how_to') || []
      return howToQuestions.length >= 4
    }
  },
  
  {
    id: 'add-pricing-transparency',
    module: 'conversations',
    title: 'Add Pricing Transparency Page',
    description: 'Answer pricing questions with clear, structured information',
    impact: 'medium',
    difficulty: 'easy',
    icon: 'DollarSign',
    
    whyMatters: 'Pricing questions are common and high-intent. If AI can\'t find your pricing, it either won\'t mention you or will say "pricing not available." A clear pricing page with schema helps AI provide accurate cost information.',
    
    whatToDo: [
      'We\'ll generate a pricing page structure with PriceSpecification schema',
      'This tells AI your exact pricing tiers and what\'s included',
      'Even if you have custom pricing, you can show starting prices'
    ],
    
    whereToDoIt: [
      'Create or update your /pricing page',
      'List your plans/tiers with clear prices',
      'Add PriceSpecification schema (we\'ll generate this)',
      'Include currency, billing period, and what\'s included',
      'Link to this page from your navigation'
    ],
    
    hasGenerator: true,
    hasValidator: true,
    generatorEndpoint: '/api/gen/pricing-schema',
    validatorEndpoint: '/api/validate/schema',
    
    shouldShow: (data) => {
      // Show if there are price-related questions
      const priceQuestions = data.questions?.filter((q: any) => q.intent === 'price') || []
      return priceQuestions.length >= 2
    }
  },
  
  {
    id: 'address-trust-concerns',
    module: 'conversations',
    title: 'Address Trust & Security Questions',
    description: 'Create content to answer credibility and safety questions',
    impact: 'medium',
    difficulty: 'medium',
    icon: 'Shield',
    
    whyMatters: 'Trust questions ("Is X reliable?", "Is X safe?", "Is X legit?") directly impact whether AI recommends you. Without clear trust signals, AI may mention competitors with better documentation or skip you entirely.',
    
    whatToDo: [
      'We\'ll identify your top trust-related questions',
      'Create dedicated pages for: security, privacy, certifications, testimonials',
      'Add structured data for reviews, certifications, and security badges',
      'This helps AI cite your credibility'
    ],
    
    whereToDoIt: [
      'Create a /security or /trust page',
      'List certifications, compliance standards, security measures',
      'Add customer testimonials with Review schema',
      'Include "About Us" section with founding date and team size',
      'Add these trust signals to your Organization schema too'
    ],
    
    hasGenerator: true,
    hasValidator: false,
    generatorEndpoint: '/api/gen/trust-page-outline',
    
    shouldShow: (data) => {
      // Show if there are trust-related questions
      const trustQuestions = data.questions?.filter((q: any) => q.intent === 'trust') || []
      return trustQuestions.length >= 2
    }
  },
  
  {
    id: 'optimize-emerging-topics',
    module: 'conversations',
    title: 'Create Content for Emerging Questions',
    description: 'Get ahead of new trends before competitors do',
    impact: 'high',
    difficulty: 'hard',
    icon: 'TrendingUp',
    
    whyMatters: 'Emerging questions represent new market trends or changing user needs. If you create content early—especially for questions that mention your brand—you become the authoritative source before the topic gets crowded. This is your competitive advantage window.',
    
    whatToDo: [
      'We\'ll highlight questions marked as "emerging"',
      'Prioritize those that mention your brand (high intent)',
      'Create blog posts, guides, or landing pages addressing these topics',
      'Add relevant schema (Article, BlogPosting, or HowTo) to each'
    ],
    
    whereToDoIt: [
      'For each emerging question, decide the best content format',
      'Brand-mention emerging = priority landing page or guide',
      'Category emerging = blog post or thought leadership',
      'Technical emerging = how-to guide with HowTo schema',
      'Add Article or BlogPosting schema to blog content',
      'Publish and share on social to accelerate indexing'
    ],
    
    hasGenerator: true,
    hasValidator: false,
    generatorEndpoint: '/api/gen/emerging-topic-outline',
    
    shouldShow: (data) => {
      // Show if there are any emerging questions
      const emergingQuestions = data.questions?.filter((q: any) => q.emerging === true) || []
      return emergingQuestions.length >= 2
    }
  }
]

// ============================================================================
// WEBSITE ANALYTICS TASKS
// ============================================================================

export const WEBSITE_TASKS: OptimizationTask[] = [
  {
    id: 'add-missing-schema',
    module: 'website',
    title: 'Add Missing Schema Markup',
    description: 'Add JSON-LD structured data to pages without any schema',
    impact: 'high',
    difficulty: 'easy',
    icon: 'FileCode',
    
    whyMatters: 'Pages without schema markup are invisible to AI crawlers. Schema tells AI what your pages are about, who you are, and what you offer. This is foundational for AI visibility.',
    
    whatToDo: [
      'We\'ll identify which pages need schema and what type',
      'Generate the appropriate JSON-LD for each page type',
      'Start with Organization, Product, and Breadcrumb schemas'
    ],
    
    whereToDoIt: [
      'Add Organization schema to your homepage',
      'Add Product schema to product pages',
      'Add Breadcrumb schema to all internal pages',
      'Paste generated code in the <head> section of each page',
      'Validate with Google\'s Rich Results Test'
    ],
    
    hasGenerator: true,
    hasValidator: true,
    generatorEndpoint: '/api/gen/schema-bulk',
    validatorEndpoint: '/api/validate/schema',
    
    shouldShow: (data) => {
      const noSchemaIssues = data.issues?.filter((i: any) => i.issue_code === 'no_schema') || []
      return noSchemaIssues.length >= 5
    }
  },
  
  {
    id: 'add-faq-schema-pages',
    module: 'website',
    title: 'Add FAQ Schema to Support Pages',
    description: 'Missing FAQ schema on pages with Q&A content',
    impact: 'high',
    difficulty: 'easy',
    icon: 'MessageCircle',
    
    whyMatters: 'Support and help pages without FAQ schema miss opportunities for AI to cite your answers. AI models prioritize structured Q&A data when responding to user questions.',
    
    whatToDo: [
      'We\'ll identify pages with FAQ/support content',
      'Generate FAQPage JSON-LD for each page',
      'Include questions and answers in structured format'
    ],
    
    whereToDoIt: [
      'Add FAQPage schema to support/help pages',
      'Ensure visible Q&A matches schema',
      'Paste in <head> section',
      'Validate and run verification scan'
    ],
    
    hasGenerator: true,
    hasValidator: true,
    generatorEndpoint: '/api/gen/faq-schema-pages',
    validatorEndpoint: '/api/validate/schema',
    
    shouldShow: (data) => {
      const faqIssues = data.issues?.filter((i: any) => i.issue_code === 'missing_faq_schema') || []
      return faqIssues.length >= 1
    }
  },
  
  {
    id: 'fix-multiple-h1',
    module: 'website',
    title: 'Fix Multiple H1 Tags',
    description: 'Pages with multiple H1 tags confuse AI about primary topic',
    impact: 'medium',
    difficulty: 'medium',
    icon: 'Type',
    
    whyMatters: 'Multiple H1 tags confuse AI about what your page is actually about. AI uses H1 as the primary signal for page topic. Multiple H1s dilute this signal and hurt comprehension.',
    
    whatToDo: [
      'We\'ll identify pages with multiple H1s and show the count',
      'You\'ll need to change extra H1s to H2 or H3 tags',
      'Keep only ONE H1 per page that clearly states the main topic'
    ],
    
    whereToDoIt: [
      'Open each flagged page in your CMS',
      'Find all H1 tags (<h1>)',
      'Keep the most important one as H1',
      'Change others to H2 (<h2>) or H3 (<h3>)',
      'Save and re-scan to verify'
    ],
    
    hasGenerator: false,
    hasValidator: false,
    
    shouldShow: (data) => {
      const h1Issues = data.issues?.filter((i: any) => i.issue_code === 'multiple_h1') || []
      return h1Issues.length >= 10
    }
  },
  
  {
    id: 'add-meta-descriptions',
    module: 'website',
    title: 'Add Missing Meta Descriptions',
    description: 'AI uses meta descriptions for page context',
    impact: 'medium',
    difficulty: 'easy',
    icon: 'FileText',
    
    whyMatters: 'Meta descriptions help AI understand what each page is about. Missing meta descriptions force AI to guess from content, often getting it wrong. Clear descriptions improve AI citation accuracy.',
    
    whatToDo: [
      'We\'ll generate 50-160 character meta descriptions for each page',
      'Descriptions will be factual, clear, and AI-optimized',
      'No marketing fluff—just what the page contains'
    ],
    
    whereToDoIt: [
      'Add generated meta descriptions to page <head> sections',
      'Format: <meta name="description" content="...">',
      'Keep between 50-160 characters',
      'Update in your CMS or template'
    ],
    
    hasGenerator: true,
    hasValidator: false,
    generatorEndpoint: '/api/gen/meta-descriptions',
    
    shouldShow: (data) => {
      const metaIssues = data.issues?.filter((i: any) => i.issue_code === 'missing_meta_description') || []
      return metaIssues.length >= 5
    }
  },
  
  {
    id: 'improve-readability',
    module: 'website',
    title: 'Improve Content Readability',
    description: 'Simplify complex content for better AI parsing',
    impact: 'low',
    difficulty: 'hard',
    icon: 'BookOpen',
    
    whyMatters: 'AI models struggle with complex, jargon-heavy content. Low readability scores mean AI may misunderstand or skip your content entirely. Simpler language improves AI comprehension and citation rate.',
    
    whatToDo: [
      'We\'ll identify pages with lowest readability scores',
      'Provide guidelines for simplifying each page',
      'Focus on: shorter sentences, simpler words, clear structure'
    ],
    
    whereToDoIt: [
      'Review pages with readability scores below 50',
      'Break long sentences into shorter ones',
      'Replace jargon with plain language',
      'Add clear headings and bullet points',
      'Use active voice instead of passive'
    ],
    
    hasGenerator: false,
    hasValidator: false,
    
    shouldShow: (data) => {
      const readabilityIssues = data.issues?.filter((i: any) => 
        i.issue_code === 'low_readability' && (i.message?.includes('score: 0') || i.message?.includes('score: 1') || i.message?.includes('score: 2'))
      ) || []
      return readabilityIssues.length >= 20
    }
  }
]

// ============================================================================
// TASK REGISTRY
// ============================================================================

export const ALL_TASKS: OptimizationTask[] = [
  ...SHOPPING_TASKS,
  ...BRAND_TASKS,
  ...CONVERSATION_TASKS,
  ...WEBSITE_TASKS
]

export function getTaskById(taskId: string): OptimizationTask | undefined {
  return ALL_TASKS.find(task => task.id === taskId)
}

export function getTasksForModule(module: TaskModule): OptimizationTask[] {
  switch (module) {
    case 'shopping':
      return SHOPPING_TASKS
    case 'brand':
      return BRAND_TASKS
    case 'conversations':
      return CONVERSATION_TASKS
    case 'website':
      return WEBSITE_TASKS
    default:
      return []
  }
}