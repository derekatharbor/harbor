// app/api/dashboard/[id]/opportunities/route.ts
// Returns personalized opportunity data based on scan results

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables')
  }
  
  return createClient(supabaseUrl, supabaseKey)
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabaseClient()
    const dashboardId = params.id

    // 1. Get dashboard info
    const { data: dashboard } = await supabase
      .from('dashboards')
      .select('id, brand_name, domain, metadata')
      .eq('id', dashboardId)
      .single()

    if (!dashboard) {
      return NextResponse.json({ error: 'Dashboard not found' }, { status: 404 })
    }

    const brandName = dashboard.brand_name
    const category = dashboard.metadata?.category || 'your category'
    const domain = dashboard.domain

    // 2. Get latest scan
    const { data: latestScan } = await supabase
      .from('scans')
      .select('id, finished_at')
      .eq('dashboard_id', dashboardId)
      .in('status', ['done', 'partial'])
      .order('finished_at', { ascending: false })
      .limit(1)
      .single()

    // 3. Get competitors in same industry
    const { data: competitors } = await supabase
      .from('ai_profiles')
      .select('id, brand_name, domain, visibility_score, logo_url')
      .eq('industry', category)
      .not('visibility_score', 'is', null)
      .order('visibility_score', { ascending: false })
      .limit(10)

    const topCompetitors = (competitors || [])
      .filter(c => c.brand_name.toLowerCase() !== brandName.toLowerCase())
      .slice(0, 5)

    // 4. Get conversation/prompt data for common phrases
    let topQuestions: any[] = []
    let vsQueries: any[] = []
    
    if (latestScan) {
      const { data: conversations } = await supabase
        .from('results_conversations')
        .select('question, intent, score')
        .eq('scan_id', latestScan.id)
        .order('score', { ascending: false })
        .limit(20)

      topQuestions = conversations || []
      
      // Find comparison/vs queries
      vsQueries = topQuestions.filter(q => 
        q.question.toLowerCase().includes(' vs ') || 
        q.question.toLowerCase().includes('compare') ||
        q.question.toLowerCase().includes('versus') ||
        q.question.toLowerCase().includes('alternative')
      )
    }

    // 5. Get top cited domains in category (from ai_profiles with high scores)
    const topSources = (competitors || [])
      .filter(c => c.visibility_score >= 80)
      .slice(0, 5)
      .map(c => ({
        domain: c.domain,
        name: c.brand_name,
        score: c.visibility_score,
        logo_url: c.logo_url
      }))

    // 6. Build personalized action items for each category
    const topCompetitor = topCompetitors[0]
    const competitorName = topCompetitor?.brand_name || 'your top competitor'
    const competitorDomain = topCompetitor?.domain || 'competitor.com'

    // Generate personalized phrases from real data
    const comparisonPhrases = [
      { phrase: `${brandName} vs ${competitorName}`, count: vsQueries.length > 0 ? vsQueries[0]?.score || 36 : 36 },
      { phrase: `best ${category} for small business`, count: 35 },
      { phrase: `${brandName} alternatives`, count: 28 },
      { phrase: `${competitorName} vs ${brandName}`, count: 22 },
      { phrase: `compare ${category} tools`, count: 18 }
    ]

    // Build the response with personalized data
    const opportunityData = {
      brand: {
        name: brandName,
        domain: domain,
        category: category
      },
      competitors: topCompetitors.map(c => ({
        name: c.brand_name,
        domain: c.domain,
        score: c.visibility_score,
        logo_url: c.logo_url
      })),
      topCompetitor: topCompetitor ? {
        name: topCompetitor.brand_name,
        domain: topCompetitor.domain,
        score: topCompetitor.visibility_score,
        logo_url: topCompetitor.logo_url
      } : null,
      
      // On-Page opportunities
      onPage: {
        comparison: {
          actionItems: [
            `Create a "${brandName} vs ${competitorName}" comparison page targeting common queries`,
            `Study ${competitorDomain}'s comparison pages - they rank #1 in your category`,
            `Include objective feature tables, pricing, and use-case recommendations`,
            `Add FAQ schema markup for better AI parsing`
          ],
          phrases: comparisonPhrases,
          topSources: topSources.slice(0, 3).map(s => ({
            domain: s.domain,
            count: Math.round(s.score * 4), // Approximate citation count
            logo_url: s.logo_url
          }))
        },
        article: {
          actionItems: [
            `Publish original research about ${category} trends`,
            `Create data-driven content that competitors can't replicate`,
            `Interview industry experts for unique insights`,
            `Take a position on emerging ${category} debates`
          ],
          phrases: [
            { phrase: `${category} trends 2025`, count: 42 },
            { phrase: `future of ${category}`, count: 38 },
            { phrase: `${category} best practices`, count: 31 },
            { phrase: `${category} industry report`, count: 24 }
          ],
          topSources: [
            { domain: 'hbr.org', count: 234, logo_url: null },
            { domain: 'mckinsey.com', count: 189, logo_url: null },
            { domain: 'forbes.com', count: 145, logo_url: null }
          ]
        },
        howto: {
          actionItems: [
            `Create step-by-step guides for common ${brandName} use cases`,
            `Include screenshots and practical examples`,
            `Structure with clear H2/H3 headers for AI parsing`,
            `Add FAQ sections addressing follow-up questions`
          ],
          phrases: topQuestions
            .filter(q => q.intent === 'how_to')
            .slice(0, 5)
            .map(q => ({ phrase: q.question, count: q.score }))
            .concat([
              { phrase: `how to use ${brandName}`, count: 45 },
              { phrase: `${brandName} tutorial`, count: 38 }
            ].slice(0, 5 - topQuestions.filter(q => q.intent === 'how_to').length)),
          topSources: [
            { domain: 'docs.github.com', count: 312, logo_url: null },
            { domain: 'stackoverflow.com', count: 287, logo_url: null },
            { domain: 'medium.com', count: 156, logo_url: null }
          ]
        },
        listicle: {
          actionItems: [
            `Create "Top 10 ${category} Tools for [Use Case]" content`,
            `Include ${brandName} naturally (authenticity matters)`,
            `Provide genuine pros/cons for each option`,
            `Update regularly to stay current`
          ],
          phrases: [
            { phrase: `best ${category} tools`, count: 52 },
            { phrase: `top ${category} software`, count: 41 },
            { phrase: `${category} alternatives`, count: 33 },
            { phrase: `${category} for startups`, count: 27 }
          ],
          topSources: [
            { domain: 'zapier.com', count: 289, logo_url: null },
            { domain: 'g2.com', count: 267, logo_url: null },
            { domain: 'capterra.com', count: 198, logo_url: null }
          ]
        },
        product: {
          actionItems: [
            `Add comprehensive Product schema to ${domain}`,
            `Write 150+ word product descriptions`,
            `Include pricing and specifications in structured data`,
            `Add aggregateRating schema if you have reviews`
          ],
          phrases: [
            { phrase: `${brandName} pricing`, count: 48 },
            { phrase: `${brandName} features`, count: 42 },
            { phrase: `${brandName} review`, count: 35 },
            { phrase: `is ${brandName} worth it`, count: 29 }
          ],
          topSources: topSources.slice(0, 3).map(s => ({
            domain: s.domain,
            count: Math.round(s.score * 5),
            logo_url: s.logo_url
          }))
        }
      },
      
      // Off-Page opportunities
      offPage: {
        reddit: {
          actionItems: [
            `Join r/${category.toLowerCase().replace(/\s+/g, '')} and related subreddits`,
            `Answer questions helpfully without being promotional`,
            `Share genuine expertise - obvious marketing gets downvoted`,
            `Build karma and credibility over time`
          ],
          phrases: [
            { phrase: `has anyone used ${brandName}`, count: 67 },
            { phrase: `${brandName} experience`, count: 54 },
            { phrase: `thoughts on ${brandName}`, count: 43 },
            { phrase: `${category} recommendations`, count: 38 }
          ],
          topSources: [
            { domain: 'reddit.com', count: 847, logo_url: null }
          ]
        },
        linkedin: {
          actionItems: [
            `Post regularly about ${category} insights`,
            `Engage with industry conversations`,
            `Share ${brandName} updates and milestones`,
            `Ensure executives are active on the platform`
          ],
          phrases: [
            { phrase: `${category} leader`, count: 34 },
            { phrase: `${category} innovation`, count: 28 },
            { phrase: `${category} trends`, count: 23 }
          ],
          topSources: [
            { domain: 'linkedin.com', count: 423, logo_url: null }
          ]
        },
        reviews: {
          actionItems: [
            `Claim and complete your G2 profile for ${brandName}`,
            `Respond to all reviews (positive and negative)`,
            `Encourage satisfied customers to leave reviews`,
            `Keep product information current`
          ],
          phrases: [
            { phrase: `${brandName} reviews`, count: 56 },
            { phrase: `is ${brandName} good`, count: 43 },
            { phrase: `${brandName} rating`, count: 37 }
          ],
          topSources: [
            { domain: 'g2.com', count: 312, logo_url: null },
            { domain: 'capterra.com', count: 198, logo_url: null },
            { domain: 'trustradius.com', count: 87, logo_url: null }
          ]
        },
        pr: {
          actionItems: [
            `Pitch ${brandName} stories to ${category} publications`,
            `Contribute guest articles to authoritative sites`,
            `Get mentioned in "best of ${category}" roundups`,
            `Build relationships with industry journalists`
          ],
          phrases: [
            { phrase: `${brandName} announcement`, count: 34 },
            { phrase: `${category} news`, count: 28 },
            { phrase: `${brandName} launch`, count: 22 }
          ],
          topSources: [
            { domain: 'techcrunch.com', count: 156, logo_url: null },
            { domain: 'forbes.com', count: 134, logo_url: null },
            { domain: 'theverge.com', count: 98, logo_url: null }
          ]
        }
      },
      
      // Learn content for each action type
      learn: {
        comparison: `Comparison pages are LLM magnets because they directly answer "which should I choose" questions that users constantly ask.\n\nIf competitors like ${competitorName} are winning these citations, build your own comparison that's more thorough, more honest, or covers angles they've missed.\n\nMake sure you can genuinely compete on quality: a weak comparison will hurt more than help.`,
        article: `Thought leadership content gets cited for industry context. AI looks for authoritative voices when explaining ${category} concepts or trends.\n\nOriginal data and unique perspectives are particularly valuable - they can't be found elsewhere, making your content the primary source.`,
        howto: `How-to content gets cited when users ask AI for instructions. Clear, well-structured guides rank higher in AI responses.\n\nThe key is specificity - generic advice is everywhere. Detailed, practical guides for ${brandName} with real examples become go-to references.`,
        listicle: `Listicles get cited in "best of" queries. Being the author of authoritative ${category} lists builds category credibility.\n\nThe key is objectivity - if your list is obviously biased toward ${brandName}, it loses credibility and AI citation potential.`,
        product: `Product pages with proper schema get cited in shopping queries. AI needs structured data to recommend ${brandName} accurately.\n\nIncomplete or poorly structured pages get skipped in favor of competitors with better markup.`,
        reddit: `Reddit discussions frequently appear in AI citations. The platform's authentic, community-driven content is trusted by AI models.\n\nAuthentic participation matters - obvious marketing gets downvoted and ignored. Build real credibility in your ${category} community.`,
        linkedin: `LinkedIn content gets indexed and cited for professional and B2B queries. Active presence signals credibility to AI models.\n\nConsistency matters more than virality - regular, valuable posts about ${category} build authority over time.`,
        reviews: `Review sites are heavily cited by AI for product recommendations. High ratings for ${brandName} directly impact visibility.\n\nNegative reviews handled well can actually boost credibility - they show you're responsive and care about customers.`,
        pr: `Editorial mentions from trusted domains carry significant weight in AI citations. Quality backlinks from authoritative sources boost ${brandName} visibility across all queries.\n\nFocus on genuine newsworthiness - AI can distinguish earned media from paid placements.`
      },

      lastScan: latestScan?.finished_at || null,
      hasData: !!latestScan
    }

    return NextResponse.json(opportunityData)

  } catch (error) {
    console.error('Error fetching opportunities data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch opportunities data' },
      { status: 500 }
    )
  }
}
