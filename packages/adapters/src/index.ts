import { OpenAIAdapter } from './openai'
import { AnthropicAdapter } from './anthropic'
import { GeminiAdapter } from './gemini'
import type { PromptJob, PromptResponse, ModelType } from './types'

const adapters = {
  gpt: new OpenAIAdapter(),
  claude: new AnthropicAdapter(),
  gemini: new GeminiAdapter(),
}

export async function runPrompt(job: PromptJob): Promise<PromptResponse> {
  const adapter = adapters[job.model]
  
  if (!adapter) {
    throw new Error(`Unsupported model: ${job.model}`)
  }

  // Enforce token cap from env
  const maxTokens = Math.min(
    job.maxTokens,
    parseInt(process.env.SCAN_MAX_TOKENS_PER_JOB || '20000')
  )

  const response = await adapter.run({
    ...job,
    maxTokens,
  })

  return response
}

export * from './types'
export { OpenAIAdapter } from './openai'
export { AnthropicAdapter } from './anthropic'
export { GeminiAdapter } from './gemini'
