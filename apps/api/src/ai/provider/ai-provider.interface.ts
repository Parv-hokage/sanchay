export interface ChatMessagePayload {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIProviderOptions {
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export interface AIProvider {
  readonly providerName: string;
  readonly defaultModel: string;

  generateText(messages: ChatMessagePayload[], options?: AIProviderOptions): Promise<string>;
  generateStructured<T>(
    messages: ChatMessagePayload[],
    schemaDescription: string,
    options?: AIProviderOptions,
  ): Promise<T>;
}
