import OpenAI from 'openai'
import type { ModelAdapter, PromptJob, PromptResponse } from './types'

export class OpenAIAdapter implements ModelAdapter {
  private client: OpenAI

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is required')
    }
    this.client = new OpenAI({ apiKey })
  }

  async run(job: PromptJob): Promise<PromptResponse> {
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = []
    
    if (job.system) {
      messages.push({ role: 'system', content: job.system })
    }
    
    messages.push({ role: 'user', content: job.user })

    const completion = await this.client.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages,
      max_tokens: job.maxTokens,
      temperature: job.temperature ?? 0.7,
    })

    return {
      text: completion.choices[0]?.message?.content || '',
      tokensUsed: completion.usage?.total_tokens || 0,
      model: completion.model,
    }
  }
}
