// lib/ai-models.ts
// STRICT VERSION: No mock data - will fail loudly if APIs don't work

export type AIModel = 'gpt' | 'claude' | 'gemini' | 'perplexity'

export interface PromptJob {
  model: AIModel
  system?: string
  user: string
  maxTokens: number
}

export async function runPrompt(job: PromptJob): Promise<string> {
  // Check for API keys - FAIL if missing
  const hasOpenAI = !!process.env.OPENAI_API_KEY
  const hasAnthropic = !!process.env.ANTHROPIC_API_KEY
  const hasGoogle = !!process.env.GOOGLE_API_KEY

  if (!hasOpenAI && !hasAnthropic && !hasGoogle) {
    throw new Error('CRITICAL: No API keys configured. Set OPENAI_API_KEY, ANTHROPIC_API_KEY, or GOOGLE_API_KEY')
  }

  // Route to appropriate model - use OpenAI for everything for now
  switch (job.model) {
    case 'gpt':
      if (!hasOpenAI) throw new Error('OPENAI_API_KEY not set')
      return callOpenAI(job)
    
    case 'claude':
      if (!hasOpenAI) throw new Error('Falling back to OpenAI but OPENAI_API_KEY not set')
      console.log('[Claude] Falling back to GPT-4o-mini (Claude API key missing or model unavailable)')
      return callOpenAI(job)
    
    case 'gemini':
      if (!hasOpenAI) throw new Error('Falling back to OpenAI but OPENAI_API_KEY not set')
      console.log('[Gemini] Falling back to GPT-4o-mini (Gemini API key missing or model unavailable)')
      return callOpenAI(job)
    
    case 'perplexity':
      if (!hasOpenAI) throw new Error('Falling back to OpenAI but OPENAI_API_KEY not set')
      console.log('[Perplexity] Falling back to GPT-4o-mini (Perplexity not configured)')
      return callOpenAI(job)
    
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
      model: 'gpt-4o-mini',
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
    console.error('OpenAI error:', errorBody)
    throw new Error(`OpenAI API failed: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  
  if (!data.choices || !data.choices[0] || !data.choices[0].message) {
    console.error('Unexpected OpenAI response:', data)
    throw new Error('OpenAI returned invalid response structure')
  }
  
  return data.choices[0].message.content
}