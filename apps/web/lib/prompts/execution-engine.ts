// Harbor Prompt Execution Engine
// Runs prompts against ChatGPT, Claude, Gemini, Perplexity and stores results

import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Types
export interface ExecutionResult {
  model: 'chatgpt' | 'claude' | 'gemini' | 'perplexity'
  prompt_id: string
  response_text: string
  brands_mentioned: BrandMention[]
  citations: Citation[]
  executed_at: string
  tokens_used: number
  error?: string
}

export interface BrandMention {
  brand_name: string
  position: number  // 1st, 2nd, 3rd mentioned
  sentiment: 'positive' | 'neutral' | 'negative'
  context: string  // snippet where brand was mentioned
}

export interface Citation {
  url: string
  domain: string
  source_type: 'editorial' | 'corporate' | 'institutional' | 'ugc' | 'unknown'
}

// Initialize clients (lazy - only when needed)
let openaiClient: OpenAI | null = null
let anthropicClient: Anthropic | null = null
let geminiClient: GoogleGenerativeAI | null = null

function getOpenAI(): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  }
  return openaiClient
}

function getAnthropic(): Anthropic {
  if (!anthropicClient) {
    anthropicClient = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  }
  return anthropicClient
}

function getGemini(): GoogleGenerativeAI {
  if (!geminiClient) {
    geminiClient = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '')
  }
  return geminiClient
}

// Execute prompt against ChatGPT
async function executeChatGPT(promptText: string): Promise<{ text: string; tokens: number }> {
  const openai = getOpenAI()
  
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini', // Cheapest: ~$0.15/M in, $0.60/M out (vs gpt-4o at $2.50/$10)
    messages: [
      {
        role: 'system',
        content: 'You are a helpful assistant providing software recommendations. Be specific about product names and include relevant details about why each is recommended.'
      },
      { role: 'user', content: promptText }
    ],
    max_tokens: 1000,
    temperature: 0.7
  })

  return {
    text: response.choices[0]?.message?.content || '',
    tokens: response.usage?.total_tokens || 0
  }
}

// Execute prompt against Claude
async function executeClaude(promptText: string): Promise<{ text: string; tokens: number }> {
  const anthropic = getAnthropic()
  
  const response = await anthropic.messages.create({
    model: 'claude-3-5-haiku-20241022', // Cheapest: $0.80/M in, $4/M out (vs Sonnet at $3/$15)
    max_tokens: 1000,
    system: 'You are a helpful assistant providing software recommendations. Be specific about product names and include relevant details about why each is recommended.',
    messages: [
      { role: 'user', content: promptText }
    ]
  })

  const text = response.content[0]?.type === 'text' ? response.content[0].text : ''
  
  return {
    text,
    tokens: response.usage.input_tokens + response.usage.output_tokens
  }
}

// Execute prompt against Gemini
async function executeGemini(promptText: string): Promise<{ text: string; tokens: number }> {
  const genAI = getGemini()
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
  
  const result = await model.generateContent({
    contents: [
      {
        role: 'user',
        parts: [
          { text: 'You are a helpful assistant providing software recommendations. Be specific about product names and include relevant details about why each is recommended.\n\n' + promptText }
        ]
      }
    ],
    generationConfig: {
      maxOutputTokens: 1000,
      temperature: 0.7
    }
  })

  const response = result.response
  const text = response.text()
  
  // Gemini doesn't return token count easily, estimate it
  const estimatedTokens = Math.ceil((promptText.length + text.length) / 4)
  
  return {
    text,
    tokens: estimatedTokens
  }
}

// Execute prompt against Perplexity
async function executePerplexity(promptText: string): Promise<{ text: string; tokens: number; citations: string[] }> {
  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'sonar', // Cheapest: $1/M input, $1/M output (vs sonar-pro at $3/$15)
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant providing software recommendations. Be specific about product names and include relevant details about why each is recommended.'
        },
        { role: 'user', content: promptText }
      ],
      max_tokens: 1000,
      temperature: 0.7,
      return_citations: true
    })
  })

  const data = await response.json()
  
  return {
    text: data.choices?.[0]?.message?.content || '',
    tokens: data.usage?.total_tokens || 0,
    citations: data.citations || []
  }
}

// Parse brand mentions from response text
function parseBrandMentions(text: string, knownBrands?: string[]): BrandMention[] {
  const mentions: BrandMention[] = []
  
  // Common SaaS brands to look for (can be expanded)
  const defaultBrands = [
    'Asana', 'Monday.com', 'ClickUp', 'Notion', 'Trello', 'Basecamp', 'Jira', 'Linear',
    'Salesforce', 'HubSpot', 'Pipedrive', 'Zoho', 'Close', 'Copper',
    'Ahrefs', 'SEMrush', 'Moz', 'Mailchimp', 'Klaviyo', 'ConvertKit', 'Buffer', 'Hootsuite',
    'Greenhouse', 'Lever', 'Workable', 'Gusto', 'Rippling', 'BambooHR', 'Workday',
    'QuickBooks', 'Xero', 'FreshBooks', 'Wave', 'Brex', 'Ramp',
    'Slack', 'Microsoft Teams', 'Discord', 'Zoom', 'Google Meet', 'Loom',
    'Figma', 'Sketch', 'Adobe XD', 'Canva', 'Miro', 'FigJam',
    'GitHub', 'GitLab', 'VS Code', 'Vercel', 'Netlify', 'AWS', 'Heroku',
    'Zendesk', 'Intercom', 'Freshdesk', 'Help Scout', 'Drift', 'Front',
    'Shopify', 'WooCommerce', 'BigCommerce', 'Stripe', 'PayPal', 'Square',
    'Mixpanel', 'Amplitude', 'Heap', 'Tableau', 'Power BI', 'Looker', 'Metabase',
    '1Password', 'LastPass', 'Okta', 'Auth0', 'Vanta', 'Drata',
    'Zapier', 'Make', 'n8n', 'Jasper', 'Copy.ai', 'ChatGPT', 'Claude'
  ]
  
  const brandsToCheck = knownBrands || defaultBrands
  let position = 0
  
  for (const brand of brandsToCheck) {
    const regex = new RegExp(`\\b${brand.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi')
    const match = text.match(regex)
    
    if (match) {
      position++
      
      // Extract context (50 chars before and after)
      const index = text.toLowerCase().indexOf(brand.toLowerCase())
      const start = Math.max(0, index - 50)
      const end = Math.min(text.length, index + brand.length + 50)
      const context = text.slice(start, end)
      
      // Simple sentiment detection based on surrounding words
      const sentiment = detectSentiment(context)
      
      mentions.push({
        brand_name: brand,
        position,
        sentiment,
        context: context.trim()
      })
    }
  }
  
  return mentions
}

// Simple sentiment detection
function detectSentiment(text: string): 'positive' | 'neutral' | 'negative' {
  const lower = text.toLowerCase()
  
  const positiveWords = ['best', 'great', 'excellent', 'top', 'leading', 'powerful', 'recommended', 'popular', 'favorite', 'love', 'amazing', 'perfect', 'ideal']
  const negativeWords = ['worst', 'bad', 'poor', 'expensive', 'difficult', 'complex', 'limited', 'lacking', 'avoid', 'disappointing', 'frustrating']
  
  let positiveCount = 0
  let negativeCount = 0
  
  for (const word of positiveWords) {
    if (lower.includes(word)) positiveCount++
  }
  
  for (const word of negativeWords) {
    if (lower.includes(word)) negativeCount++
  }
  
  if (positiveCount > negativeCount) return 'positive'
  if (negativeCount > positiveCount) return 'negative'
  return 'neutral'
}

// Parse citations from Perplexity response
function parseCitations(urls: string[]): Citation[] {
  return urls.map(url => {
    let domain = ''
    try {
      domain = new URL(url).hostname.replace('www.', '')
    } catch {
      domain = url
    }
    
    // Classify source type
    const sourceType = classifySourceType(domain)
    
    return {
      url,
      domain,
      source_type: sourceType
    }
  })
}

// Classify citation source type
function classifySourceType(domain: string): Citation['source_type'] {
  const editorialDomains = ['techcrunch.com', 'forbes.com', 'wired.com', 'theverge.com', 'zdnet.com', 'cnet.com', 'pcmag.com', 'g2.com', 'capterra.com', 'trustradius.com']
  const institutionalDomains = ['.edu', '.gov', '.org']
  const ugcDomains = ['reddit.com', 'quora.com', 'medium.com', 'dev.to', 'stackoverflow.com']
  
  const lower = domain.toLowerCase()
  
  if (editorialDomains.some(d => lower.includes(d))) return 'editorial'
  if (institutionalDomains.some(d => lower.includes(d))) return 'institutional'
  if (ugcDomains.some(d => lower.includes(d))) return 'ugc'
  
  // If it's a known brand domain, it's corporate
  const brandDomains = ['asana.com', 'monday.com', 'notion.so', 'hubspot.com', 'salesforce.com', 'zendesk.com', 'shopify.com', 'stripe.com']
  if (brandDomains.some(d => lower.includes(d))) return 'corporate'
  
  return 'unknown'
}

// Main execution function - runs prompt against all models
export async function executePromptAllModels(
  promptId: string, 
  promptText: string,
  models: ('chatgpt' | 'claude' | 'gemini' | 'perplexity')[] = ['chatgpt', 'claude', 'perplexity'] // Gemini disabled - 404 errors
): Promise<ExecutionResult[]> {
  const results: ExecutionResult[] = []
  const executedAt = new Date().toISOString()

  // Execute in parallel for speed
  const executions = await Promise.allSettled(
    models.map(async (model) => {
      try {
        let response: { text: string; tokens: number; citations?: string[] }
        
        switch (model) {
          case 'chatgpt':
            response = await executeChatGPT(promptText)
            break
          case 'claude':
            response = await executeClaude(promptText)
            break
          case 'gemini':
            response = await executeGemini(promptText)
            break
          case 'perplexity':
            response = await executePerplexity(promptText)
            break
        }

        const brandMentions = parseBrandMentions(response.text)
        const citations = model === 'perplexity' && response.citations 
          ? parseCitations(response.citations)
          : []

        return {
          model,
          prompt_id: promptId,
          response_text: response.text,
          brands_mentioned: brandMentions,
          citations,
          executed_at: executedAt,
          tokens_used: response.tokens
        } as ExecutionResult

      } catch (error) {
        return {
          model,
          prompt_id: promptId,
          response_text: '',
          brands_mentioned: [],
          citations: [],
          executed_at: executedAt,
          tokens_used: 0,
          error: error instanceof Error ? error.message : 'Unknown error'
        } as ExecutionResult
      }
    })
  )

  // Process results
  for (const execution of executions) {
    if (execution.status === 'fulfilled') {
      results.push(execution.value)
    }
  }

  return results
}

// Store results in Supabase
export async function storeExecutionResults(
  supabase: any,
  results: ExecutionResult[]
): Promise<void> {
  for (const result of results) {
    // Store main execution record
    const { data: execution, error: execError } = await supabase
      .from('prompt_executions')
      .insert({
        prompt_id: result.prompt_id,
        model: result.model,
        response_text: result.response_text,
        tokens_used: result.tokens_used,
        executed_at: result.executed_at,
        error: result.error || null
      })
      .select('id')
      .single()

    if (execError || !execution) {
      console.error('Failed to store execution:', execError)
      continue
    }

    // Store brand mentions
    if (result.brands_mentioned.length > 0) {
      const mentions = result.brands_mentioned.map(m => ({
        execution_id: execution.id,
        brand_name: m.brand_name,
        position: m.position,
        sentiment: m.sentiment,
        context: m.context
      }))

      await supabase.from('prompt_brand_mentions').insert(mentions)
    }

    // Store citations
    if (result.citations.length > 0) {
      const citations = result.citations.map(c => ({
        execution_id: execution.id,
        url: c.url,
        domain: c.domain,
        source_type: c.source_type
      }))

      await supabase.from('prompt_citations').insert(citations)
    }
  }
}

// Calculate visibility score from executions
export function calculateVisibilityFromExecutions(
  brandName: string,
  executions: ExecutionResult[]
): { visibility: number; sentiment: 'positive' | 'neutral' | 'negative'; avgPosition: number } {
  let mentioned = 0
  let totalSentiment = 0
  let totalPosition = 0
  let positionCount = 0

  for (const exec of executions) {
    const mention = exec.brands_mentioned.find(
      m => m.brand_name.toLowerCase() === brandName.toLowerCase()
    )
    
    if (mention) {
      mentioned++
      totalPosition += mention.position
      positionCount++
      
      // Convert sentiment to number
      if (mention.sentiment === 'positive') totalSentiment += 1
      else if (mention.sentiment === 'negative') totalSentiment -= 1
    }
  }

  const visibility = executions.length > 0 ? Math.round((mentioned / executions.length) * 100) : 0
  const avgPosition = positionCount > 0 ? Math.round(totalPosition / positionCount) : 0
  
  let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral'
  if (mentioned > 0) {
    const avgSentiment = totalSentiment / mentioned
    if (avgSentiment > 0.3) sentiment = 'positive'
    else if (avgSentiment < -0.3) sentiment = 'negative'
  }

  return { visibility, sentiment, avgPosition }
}