import Anthropic from '@anthropic-ai/sdk'
import type { ModelAdapter, PromptJob, PromptResponse } from './types'

export class AnthropicAdapter implements ModelAdapter {
  private client: Anthropic

  constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY environment variable is required')
    }
    this.client = new Anthropic({ apiKey })
  }

  async run(job: PromptJob): Promise<PromptResponse> {
    const message = await this.client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: job.maxTokens,
      temperature: job.temperature ?? 0.7,
      system: job.system,
      messages: [
        { role: 'user', content: job.user }
      ],
    })

    const textContent = message.content.find(block => block.type === 'text')
    
    return {
      text: textContent?.type === 'text' ? textContent.text : '',
      tokensUsed: message.usage.input_tokens + message.usage.output_tokens,
      model: message.model,
    }
  }
}
