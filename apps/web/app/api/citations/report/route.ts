// apps/web/app/api/citations/report/route.ts
// Manual citation reporting endpoint
// POST /api/citations/report

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      source, // 'perplexity' | 'chatgpt' | 'gemini' | 'copilot' | 'bing' | 'google' | 'other'
      source_url, // URL of the AI response if available
      source_query, // The query that triggered the citation
      cited_url, // The Harbor URL that was cited (required)
      screenshot_url, // Screenshot proof
      snippet, // Text around the citation
    } = body

    if (!cited_url) {
      return NextResponse.json(
        { error: 'cited_url is required' },
        { status: 400 }
      )
    }

    // Validate it's a Harbor URL
    if (!cited_url.includes('useharbor.io')) {
      return NextResponse.json(
        { error: 'cited_url must be a useharbor.io URL' },
        { status: 400 }
      )
    }

    const validSources = ['perplexity', 'chatgpt', 'gemini', 'copilot', 'bing', 'google', 'other']
    if (source && !validSources.includes(source)) {
      return NextResponse.json(
        { error: `source must be one of: ${validSources.join(', ')}` },
        { status: 400 }
      )
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Extract slug from URL
    const slugMatch = cited_url.match(/\/brands\/([^\/\?]+)/)
    const cited_slug = slugMatch ? slugMatch[1] : null

    // Determine page type
    let cited_page_type = 'other'
    if (cited_url.includes('/brands/') && cited_slug) {
      cited_page_type = 'brand_profile'
    } else if (cited_url.includes('/best-') || cited_url.includes('/top-')) {
      cited_page_type = 'listicle'
    } else if (cited_url === 'https://useharbor.io' || cited_url === 'https://useharbor.io/') {
      cited_page_type = 'homepage'
    }

    // Check for duplicates (same source + URL within 24 hours)
    const { data: existing } = await supabase
      .from('citations')
      .select('id')
      .eq('source', source || 'other')
      .eq('cited_url', cited_url)
      .gte('detected_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .single()

    if (existing) {
      return NextResponse.json({
        success: true,
        message: 'Citation already logged within the last 24 hours',
        duplicate: true,
        citation_id: existing.id,
      })
    }

    // Save citation
    const { data: citation, error } = await supabase
      .from('citations')
      .insert({
        source: source || 'other',
        source_url,
        source_query,
        cited_url,
        cited_slug,
        cited_page_type,
        citation_type: source_url ? 'direct_link' : 'reference',
        snippet,
        screenshot_url,
        detected_by: 'user_report',
        verified: !!screenshot_url, // Auto-verify if screenshot provided
        verified_at: screenshot_url ? new Date().toISOString() : null,
      })
      .select('id')
      .single()

    if (error) {
      console.error('Failed to save citation:', error)
      return NextResponse.json(
        { error: 'Failed to save citation' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Citation reported successfully!',
      citation_id: citation.id,
    })

  } catch (error) {
    console.error('Citation report error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET endpoint to fetch recent citations
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Math.min(100, parseInt(searchParams.get('limit') || '20'))
    const source = searchParams.get('source')

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    let query = supabase
      .from('citations')
      .select('*')
      .order('detected_at', { ascending: false })
      .limit(limit)

    if (source) {
      query = query.eq('source', source)
    }

    const { data: citations, error, count } = await query

    if (error) {
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    // Get summary stats
    const { data: stats } = await supabase
      .from('citations')
      .select('source, verified')
      .then(({ data }) => {
        const bySource: Record<string, number> = {}
        let verified = 0
        let total = 0
        
        data?.forEach(row => {
          bySource[row.source] = (bySource[row.source] || 0) + 1
          if (row.verified) verified++
          total++
        })
        
        return { data: { bySource, verified, total } }
      })

    return NextResponse.json({
      citations,
      stats,
    })

  } catch (error) {
    console.error('Citation fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
