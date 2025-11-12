export type ModelType = 'gpt' | 'claude' | 'gemini' | 'perplexity'

export interface PromptJob {
  model: ModelType
  system?: string
  user: string
  maxTokens: number
  temperature?: number
}

export interface PromptResponse {
  text: string
  tokensUsed: number
  model: string
}

export interface ModelAdapter {
  run(job: PromptJob): Promise<PromptResponse>
}
