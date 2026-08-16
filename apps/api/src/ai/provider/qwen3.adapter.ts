import { Injectable, Logger } from '@nestjs/common';
import { AIProvider, ChatMessagePayload, AIProviderOptions } from './ai-provider.interface';

@Injectable()
export class Qwen3Adapter implements AIProvider {
  readonly providerName = 'qwen3';
  readonly defaultModel = process.env.AI_MODEL || 'qwen-2.5-72b-instruct';

  private readonly apiKey = process.env.AI_API_KEY || '';
  private readonly baseUrl = process.env.AI_BASE_URL || 'https://api.together.xyz/v1';
  private readonly logger = new Logger(Qwen3Adapter.name);

  async generateText(messages: ChatMessagePayload[], options?: AIProviderOptions): Promise<string> {
    if (!this.apiKey) {
      this.logger.debug('[Qwen3] API Key not configured. Using deterministic reasoning engine.');
      return this.localFallbackReasoning(messages);
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.defaultModel,
          messages,
          temperature: options?.temperature ?? 0.2,
          max_tokens: options?.maxTokens ?? 1024,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Qwen3 Provider HTTP Error ${response.status}: ${await response.text()}`);
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content || this.localFallbackReasoning(messages);
    } catch (err: any) {
      this.logger.warn(`[Qwen3] API call failed: ${err.message}. Falling back to deterministic reasoning.`);
      return this.localFallbackReasoning(messages);
    }
  }

  async generateStructured<T>(
    messages: ChatMessagePayload[],
    _schemaDescription: string,
    options?: AIProviderOptions,
  ): Promise<T> {
    const text = await this.generateText(messages, options);
    try {
      // Find JSON block if wrapped in markdown
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]) as T;
      }
      return JSON.parse(text) as T;
    } catch {
      return {} as T;
    }
  }

  private localFallbackReasoning(messages: ChatMessagePayload[]): string {
    const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user')?.content || '';
    const userLower = lastUserMessage.trim().toLowerCase();

    // Check if evidence was provided in system or assistant prompt
    const evidenceSystem = messages.find((m) => m.role === 'system')?.content || '';

    // Greetings
    if (
      userLower === 'hi' ||
      userLower === 'hello' ||
      userLower === 'hey' ||
      userLower === 'namaste' ||
      userLower.startsWith('hi ') ||
      userLower.startsWith('hello ')
    ) {
      return 'Namaste! I am Sanchay AI, your unified government digital service assistant. How can I help you with official government services, examination guidelines, or benefits today?';
    }

    if (userLower.includes('eligib') || userLower.includes('who can apply')) {
      if (evidenceSystem.includes('JEE')) {
        return 'Based on official National Testing Agency guidelines, candidates who passed Class 12 in 2024, 2025, or appearing in 2026 with Physics, Mathematics and one optional subject are eligible. There is no age limit.';
      }
      if (evidenceSystem.includes('Ayushman')) {
        return 'According to official National Health Authority guidelines, families listed in SECC 2011 database under deprivation categories are eligible for up to Rs. 5 Lakh coverage per year.';
      }
      return 'You can check your eligibility directly through official government guidelines retrieved with verified citations.';
    }

    if (userLower.includes('syllabus')) {
      return 'The official JEE (Main) 2026 syllabus covers Physics, Chemistry, and Mathematics. You can view the complete subject-wise breakdown in the Syllabus section with verified official citations.';
    }

    if (userLower.includes('answer key') || userLower.includes('response sheet')) {
      return 'Official Provisional and Final Answer Keys, along with candidate Recorded Response Sheets, are published on the JEE Main portal with designated challenge windows. You can access the official notices and question papers directly.';
    }

    if (userLower.includes('notice') || userLower.includes('bulletin') || userLower.includes('circular')) {
      return 'Official NTA Public Notices and Information Bulletins are indexed in Sanchay with verified dates, categories, and direct official source links.';
    }

    if (userLower.includes('paper') || userLower.includes('previous year') || userLower.includes('question')) {
      return 'Official JEE (Main) master question papers for 2024 and 2025 across English and Hindi mediums are available in the Question Papers section.';
    }

    if (userLower.includes('open') || userLower.includes('navigate') || userLower.includes('go to')) {
      return 'I can navigate directly to the relevant JEE Main section for you using Sanchay registered action cards.';
    }

    if (userLower.includes('apply') || userLower.includes('start') || userLower.includes('application')) {
      return 'I can assist you in preparing your online application using your verified Sanchay profile data. You can review all auto-filled fields before final confirmation.';
    }

    if (userLower.includes('document') || userLower.includes('vault')) {
      return 'Your private documents are securely stored in your Sanchay Document Vault with antivirus verification and strict consent-gated access.';
    }

    return 'I am Sanchay AI, your official digital government service assistant. I can help you search official rules, check eligibility, manage documents, and prepare applications with deterministic consent.';
  }
}
