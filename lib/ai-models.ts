// lib/ai-models.ts
// Multi-model support: OpenAI, Anthropic (Claude), Google (Gemini)

import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'
import { GoogleGenerativeAI } from '@google/generative-ai'

export type AIModel = 'gpt' | 'claude' | 'gemini' | 'perplexity'

export interface PromptJob {
  model: AIModel
  system?: string
  user: string
  maxTokens: number
  temperature?: number
}

export interface PromptResponse {
  text: string
  tokensUsed?: number
  model: string
}

// Lazy-initialized clients
let openaiClient: OpenAI | null = null
let anthropicClient: Anthropic | null = null
let geminiClient: GoogleGenerativeAI | null = null

function getOpenAI(): OpenAI {
  if (!openaiClient) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY not configured')
    }
    openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  }
  return openaiClient
}

function getAnthropic(): Anthropic {
  if (!anthropicClient) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY not configured')
    }
    anthropicClient = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  }
  return anthropicClient
}

function getGemini(): GoogleGenerativeAI {
  if (!geminiClient) {
    if (!process.env.GOOGLE_API_KEY) {
      throw new Error('GOOGLE_API_KEY not configured')
    }
    geminiClient = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY)
  }
  return geminiClient
}

// ============================================================================
// MAIN ROUTER
// ============================================================================

export async function runPrompt(job: PromptJob): Promise<string> {
  const response = await runPromptWithMeta(job)
  return response.text
}

export async function runPromptWithMeta(job: PromptJob): Promise<PromptResponse> {
  switch (job.model) {
    case 'gpt':
      return callOpenAI(job)
    
    case 'claude':
      if (process.env.ANTHROPIC_API_KEY) {
        return callClaude(job)
      }
      console.log('[Claude] Falling back to GPT (ANTHROPIC_API_KEY not set)')
      return callOpenAI(job)
    
    case 'gemini':
      if (process.env.GOOGLE_API_KEY) {
        return callGemini(job)
      }
      console.log('[Gemini] Falling back to GPT (GOOGLE_API_KEY not set)')
      return callOpenAI(job)
    
    case 'perplexity':
      // Perplexity uses OpenAI-compatible API
      if (process.env.PERPLEXITY_API_KEY) {
        return callPerplexity(job)
      }
      console.log('[Perplexity] Falling back to GPT (PERPLEXITY_API_KEY not set)')
      return callOpenAI(job)
    
    default:
      throw new Error(`Unknown model: ${job.model}`)
  }
}

// ============================================================================
// OPENAI
// ============================================================================

async function callOpenAI(job: PromptJob): Promise<PromptResponse> {
  const client = getOpenAI()
  
  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      ...(job.system ? [{ role: 'system' as const, content: job.system }] : []),
      { role: 'user' as const, content: job.user }
    ],
    max_tokens: job.maxTokens,
    temperature: job.temperature ?? 0.7
  })

  const text = response.choices[0]?.message?.content || ''
  const tokensUsed = response.usage?.total_tokens || 0

  return {
    text,
    tokensUsed,
    model: response.model
  }
}

// ============================================================================
// CLAUDE (Anthropic)
// ============================================================================

async function callClaude(job: PromptJob): Promise<PromptResponse> {
  const client = getAnthropic()
  
  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: job.maxTokens,
    ...(job.system ? { system: job.system } : {}),
    messages: [
      { role: 'user', content: job.user }
    ]
  })

  const textBlock = response.content.find((block: any) => block.type === 'text')
  const text = textBlock?.type === 'text' ? textBlock.text : ''
  const tokensUsed = response.usage.input_tokens + response.usage.output_tokens

  return {
    text,
    tokensUsed,
    model: response.model
  }
}

// ============================================================================
// GEMINI (Google)
// ============================================================================

async function callGemini(job: PromptJob): Promise<PromptResponse> {
  const client = getGemini()
  
  const model = client.getGenerativeModel({ 
    model: 'gemini-2.0-flash',
    generationConfig: {
      maxOutputTokens: job.maxTokens,
      temperature: job.temperature ?? 0.7,
    }
  })

  // Gemini doesn't have a separate system message, so combine them
  const prompt = job.system 
    ? `${job.system}\n\n${job.user}`
    : job.user

  const result = await model.generateContent(prompt)
  const response = await result.response
  const text = response.text()

  // Gemini doesn't provide token counts easily, estimate
  const tokensUsed = Math.ceil((prompt.length + text.length) / 4)

  return {
    text,
    tokensUsed,
    model: 'gemini-2.0-flash'
  }
}

// ============================================================================
// PERPLEXITY (OpenAI-compatible)
// ============================================================================

async function callPerplexity(job: PromptJob): Promise<PromptResponse> {
  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`
    },
    body: JSON.stringify({
      model: 'llama-3.1-sonar-small-128k-online',
      messages: [
        ...(job.system ? [{ role: 'system', content: job.system }] : []),
        { role: 'user', content: job.user }
      ],
      max_tokens: job.maxTokens,
      temperature: job.temperature ?? 0.7
    })
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Perplexity API error: ${response.status} - ${error}`)
  }

  const data = await response.json()
  
  return {
    text: data.choices[0]?.message?.content || '',
    tokensUsed: data.usage?.total_tokens || 0,
    model: data.model || 'perplexity'
  }
}

// ============================================================================
// UTILITY: Check which models are available
// ============================================================================

export function getAvailableModels(): AIModel[] {
  const models: AIModel[] = []
  
  if (process.env.OPENAI_API_KEY) models.push('gpt')
  if (process.env.ANTHROPIC_API_KEY) models.push('claude')
  if (process.env.GOOGLE_API_KEY) models.push('gemini')
  if (process.env.PERPLEXITY_API_KEY) models.push('perplexity')
  
  return models
}

export function hasModel(model: AIModel): boolean {
  switch (model) {
    case 'gpt': return !!process.env.OPENAI_API_KEY
    case 'claude': return !!process.env.ANTHROPIC_API_KEY
    case 'gemini': return !!process.env.GOOGLE_API_KEY
    case 'perplexity': return !!process.env.PERPLEXITY_API_KEY
    default: return false
  }
}