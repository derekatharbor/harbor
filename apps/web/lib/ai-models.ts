// lib/ai-models.ts

// This will handle calling different AI model APIs

export type AIModel = 'gpt' | 'claude' | 'gemini' | 'perplexity'

export interface PromptJob {
  model: AIModel
  system?: string
  user: string
  maxTokens: number
}

export async function runPrompt(job: PromptJob): Promise<string> {
  // Check for API keys
  const hasOpenAI = !!process.env.OPENAI_API_KEY
  const hasAnthropic = !!process.env.ANTHROPIC_API_KEY
  const hasGoogle = !!process.env.GOOGLE_API_KEY
  const hasPerplexity = !!process.env.PERPLEXITY_API_KEY

  // If no API keys, return mock data
  if (!hasOpenAI && !hasAnthropic && !hasGoogle && !hasPerplexity) {
    console.log('⚠️  No API keys found - returning mock data')
    return getMockResponse(job)
  }

  // Route to appropriate model
  switch (job.model) {
    case 'gpt':
      if (!hasOpenAI) return getMockResponse(job)
      return callOpenAI(job)
    
    case 'claude':
      if (!hasAnthropic) return getMockResponse(job)
      return callAnthropic(job)
    
    case 'gemini':
      if (!hasGoogle) return getMockResponse(job)
      return callGemini(job)
    
    case 'perplexity':
      if (!hasPerplexity) return getMockResponse(job)
      return callPerplexity(job)
    
    default:
      throw new Error(`Unknown model: ${job.model}`)
  }
}

// OpenAI API Call
async function callOpenAI(job: PromptJob): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini', // FIXED: Use gpt-4o-mini instead of gpt-4
      messages: [
        ...(job.system ? [{ role: 'system', content: job.system }] : []),
        { role: 'user', content: job.user }
      ],
      max_tokens: job.maxTokens,
      temperature: 0.7
    })
  })

  if (!response.ok) {
    const errorBody = await response.text()
    console.error('OpenAI error body:', errorBody)
    throw new Error(`OpenAI API error: ${response.statusText}`)
  }

  const data = await response.json()
  return data.choices[0].message.content
}

// Anthropic API Call
async function callAnthropic(job: PromptJob): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY || '',
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: job.maxTokens,
      messages: [
        { role: 'user', content: job.user }
      ],
      ...(job.system ? { system: job.system } : {})
    })
  })

  if (!response.ok) {
    const errorBody = await response.text()
    console.error('Anthropic error body:', errorBody)
    throw new Error(`Anthropic API error: ${response.statusText}`)
  }

  const data = await response.json()
  return data.content[0].text
}

// Google Gemini API Call
async function callGemini(job: PromptJob): Promise<string> {
  const prompt = job.system ? `${job.system}\n\n${job.user}` : job.user
  
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GOOGLE_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: job.maxTokens,
          temperature: 0.7
        }
      })
    }
  )

  if (!response.ok) {
    const errorBody = await response.text()
    console.error('Gemini error body:', errorBody)
    throw new Error(`Gemini API error: ${response.statusText}`)
  }

  const data = await response.json()
  return data.candidates[0].content.parts[0].text
}

// Perplexity API Call (optional)
async function callPerplexity(job: PromptJob): Promise<string> {
  // Perplexity uses OpenAI-compatible API
  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`
    },
    body: JSON.stringify({
      model: 'llama-3.1-sonar-large-128k-online',
      messages: [
        ...(job.system ? [{ role: 'system', content: job.system }] : []),
        { role: 'user', content: job.user }
      ],
      max_tokens: job.maxTokens
    })
  })

  if (!response.ok) {
    const errorBody = await response.text()
    console.error('Perplexity error body:', errorBody)
    throw new Error(`Perplexity API error: ${response.statusText}`)
  }

  const data = await response.json()
  return data.choices[0].message.content
}

// Mock response for testing without API keys
function getMockResponse(job: PromptJob): string {
  console.log(`🎭 Mock response for ${job.model}`)
  
  // Return structured mock data based on prompt content
  if (job.user.includes('shopping') || job.user.includes('product')) {
    return JSON.stringify([
      { rank: 1, brand: 'Demo Brand', product: 'Premium Product', reason: 'Highly rated' },
      { rank: 2, brand: 'Demo Brand', product: 'Standard Product', reason: 'Best value' }
    ])
  }
  
  if (job.user.includes('brand') || job.user.includes('known for')) {
    return JSON.stringify({
      summary: 'Demo Brand is known for innovative solutions and reliability.',
      descriptors: [
        { word: 'Innovative', sentiment: 'pos' },
        { word: 'Reliable', sentiment: 'pos' },
        { word: 'Professional', sentiment: 'pos' }
      ],
      competitors: ['Competitor A', 'Competitor B']
    })
  }
  
  if (job.user.includes('questions') || job.user.includes('ask about')) {
    return JSON.stringify([
      { question: 'What is Demo Brand?', intent: 'features' },
      { question: 'How to use Demo Brand?', intent: 'how_to' },
      { question: 'Demo Brand vs alternatives?', intent: 'vs' }
    ])
  }
  
  return 'Mock response for: ' + job.user.substring(0, 50)
}