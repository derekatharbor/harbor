import { GoogleGenerativeAI } from '@google/generative-ai'
import type { ModelAdapter, PromptJob, PromptResponse } from './types'

export class GeminiAdapter implements ModelAdapter {
  private client: GoogleGenerativeAI

  constructor() {
    const apiKey = process.env.GOOGLE_API_KEY
    if (!apiKey) {
      throw new Error('GOOGLE_API_KEY environment variable is required')
    }
    this.client = new GoogleGenerativeAI(apiKey)
  }

  async run(job: PromptJob): Promise<PromptResponse> {
    const model = this.client.getGenerativeModel({ 
      model: 'gemini-pro',
      generationConfig: {
        maxOutputTokens: job.maxTokens,
        temperature: job.temperature ?? 0.7,
      }
    })

    const prompt = job.system 
      ? `${job.system}\n\n${job.user}`
      : job.user

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // Note: Gemini doesn't provide token usage in the same way
    // This is an approximation
    const tokensUsed = Math.ceil((prompt.length + text.length) / 4)

    return {
      text,
      tokensUsed,
      model: 'gemini-pro',
    }
  }
}
