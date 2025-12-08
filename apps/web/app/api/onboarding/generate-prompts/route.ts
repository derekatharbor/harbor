// app/api/onboarding/generate-prompts/route.ts
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

    const { topic, brandName, domain } = await req.json()

    if (!topic || !brandName) {
      return NextResponse.json({ error: 'Topic and brand name required' }, { status: 400 })
    }

    // Generate prompts using Claude
    const prompt = `You are helping a brand track their visibility in AI search results.

Brand: ${brandName}
Domain: ${domain || 'N/A'}
Topic: ${topic}

Generate 5 natural search queries that a user might ask an AI assistant about "${topic}" where "${brandName}" could potentially be mentioned or recommended.

These should be realistic questions people actually ask AI assistants like ChatGPT, Claude, or Perplexity. Mix different intents:
- Discovery: "What are the best..." / "Top rated..."
- Comparison: "What's better for..." / "How does X compare..."
- How-to: "How do I..." / "Best way to..."
- Recommendation: "Can you recommend..." / "What should I use for..."

Return ONLY a JSON array of prompt strings, nothing else:
["Prompt 1", "Prompt 2", "Prompt 3", "Prompt 4", "Prompt 5"]`

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

    let prompts: string[]
    try {
      // Extract JSON from response (handle potential markdown code blocks)
      let jsonStr = content.text.trim()
      if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/```json?\n?/g, '').replace(/```/g, '').trim()
      }
      prompts = JSON.parse(jsonStr)
    } catch (e) {
      console.error('Failed to parse prompts:', content.text)
      // Fallback prompts
      prompts = [
        `What are the best options for ${topic.toLowerCase()}?`,
        `Top rated ${topic.toLowerCase()} recommendations`,
        `How do I choose the right ${topic.toLowerCase()}?`,
        `What should I look for in ${topic.toLowerCase()}?`,
        `Best ${topic.toLowerCase()} for beginners`
      ]
    }

    // Format response with IDs
    const formattedPrompts = prompts.map((text, i) => ({
      id: `prompt-${i}`,
      text
    }))

    return NextResponse.json({ prompts: formattedPrompts })

  } catch (error: any) {
    console.error('Generate prompts error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate prompts' },
      { status: 500 }
    )
  }
}
