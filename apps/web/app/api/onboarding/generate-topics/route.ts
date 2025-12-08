// app/api/onboarding/generate-topics/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!
})

export async function POST(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { domain, brandName } = await req.json()

    if (!domain || !brandName) {
      return NextResponse.json({ error: 'Domain and brand name required' }, { status: 400 })
    }

    // Clean domain
    const cleanDomain = domain.replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/.*$/, '')

    // Try to fetch some basic info from the website
    let websiteContext = ''
    try {
      const response = await fetch(`https://${cleanDomain}`, {
        headers: { 'User-Agent': 'HarborBot/1.0' },
        signal: AbortSignal.timeout(5000)
      })
      
      if (response.ok) {
        const html = await response.text()
        // Extract meta description and title
        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
        const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i)
        const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i)
        
        if (titleMatch) websiteContext += `Title: ${titleMatch[1]}\n`
        if (descMatch) websiteContext += `Description: ${descMatch[1]}\n`
        if (h1Match) websiteContext += `Main heading: ${h1Match[1]}\n`
      }
    } catch (e) {
      console.log('Could not fetch website, using brand name only')
    }

    // Generate topics using Claude
    const prompt = `You are helping a brand track their visibility in AI search results.

Brand: ${brandName}
Domain: ${cleanDomain}
${websiteContext ? `Website info:\n${websiteContext}` : ''}

Based on this brand, generate 5-7 relevant TOPIC CATEGORIES that users might search for where this brand could be mentioned. These should be broad topic areas, not specific questions.

Examples of good topics:
- For a cocktail company: "Cocktail Recipes", "Mixology Techniques", "Party Planning", "Alcohol Pairings", "Bar Equipment"
- For a SaaS tool: "Project Management", "Team Collaboration", "Productivity Tips", "Remote Work", "Software Integrations"
- For a fashion brand: "Sustainable Fashion", "Outfit Ideas", "Seasonal Trends", "Wardrobe Essentials", "Style Tips"

Return ONLY a JSON array of topic names, nothing else:
["Topic 1", "Topic 2", "Topic 3", ...]`

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }]
    })

    // Parse the response
    const content = message.content[0]
    if (content.type !== 'text') {
      throw new Error('Unexpected response type')
    }

    let topics: string[]
    try {
      // Extract JSON from response (handle potential markdown code blocks)
      let jsonStr = content.text.trim()
      if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/```json?\n?/g, '').replace(/```/g, '').trim()
      }
      topics = JSON.parse(jsonStr)
    } catch (e) {
      console.error('Failed to parse topics:', content.text)
      // Fallback to generic topics based on common patterns
      topics = [
        'Product Recommendations',
        'Industry Best Practices', 
        'Buying Guides',
        'Comparisons & Alternatives',
        'How-To Guides'
      ]
    }

    // Format response with IDs
    const formattedTopics = topics.map((name, i) => ({
      id: `topic-${i}`,
      name
    }))

    return NextResponse.json({ topics: formattedTopics })

  } catch (error: any) {
    console.error('Generate topics error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate topics' },
      { status: 500 }
    )
  }
}
