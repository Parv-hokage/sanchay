import { Injectable } from '@nestjs/common';
import { IntentType } from '@sanchay/types';

export interface DetectedIntent {
  intent: IntentType;
  confidence: number;
  extractedServiceSlug?: string;
  extractedParameters: Record<string, any>;
}

export interface ConversationHistoryMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

@Injectable()
export class IntentDetectionService {
  detectIntent(
    message: string,
    contextServiceSlug?: string,
    history: ConversationHistoryMessage[] = [],
  ): DetectedIntent {
    const raw = message.trim().toLowerCase();

    // 0. Extract service from message, active context, or previous conversation history
    const serviceSlug = this.resolveServiceSlug(raw, contextServiceSlug, history);

    // 1. Check Eligibility Intent (including contextual follow-ups like "I am qualified?", "Am I eligible?", "Can I apply?")
    if (
      raw.includes('eligib') ||
      raw.includes('who can apply') ||
      raw.includes('qualification') ||
      raw.includes('qualified') ||
      raw.includes('qualify') ||
      raw.includes('age limit') ||
      raw.includes('criteria') ||
      raw.includes('am i eligible') ||
      raw.includes('i am qualified') ||
      raw.includes('am i qualified') ||
      raw.includes('can i apply') ||
      raw.includes('do i qualify') ||
      raw.includes('am i allowed') ||
      raw.includes('am i suitable') ||
      raw.includes('what about age') ||
      raw.includes('what about 12th') ||
      raw.includes('what if i passed in') ||
      raw.includes('what about pcm') ||
      (this.isEligibilityFollowUp(raw) && this.historyHasEligibilityContext(history))
    ) {
      return {
        intent: IntentType.ELIGIBILITY_CHECK,
        confidence: 0.95,
        extractedServiceSlug: serviceSlug,
        extractedParameters: {},
      };
    }

    // 2. Start Application Intent
    if (
      raw.includes('start application') ||
      raw.includes('apply for') ||
      raw.includes('new application') ||
      raw.includes('fill form') ||
      raw.includes('register for') ||
      (raw.includes('start') && raw.includes('application')) ||
      (raw.includes('apply') && raw.includes('application')) ||
      raw.includes('want to apply') ||
      raw.includes('want to start') ||
      raw.includes('how to apply') ||
      raw.includes('where do i apply')
    ) {
      return {
        intent: IntentType.START_APPLICATION,
        confidence: 0.92,
        extractedServiceSlug: serviceSlug,
        extractedParameters: {},
      };
    }

    // 3. Status Check Intent
    if (
      raw.includes('status') ||
      raw.includes('track') ||
      raw.includes('where is my application') ||
      raw.includes('check application')
    ) {
      return {
        intent: IntentType.CHECK_APPLICATION_STATUS,
        confidence: 0.9,
        extractedServiceSlug: serviceSlug,
        extractedParameters: {},
      };
    }

    // 4. Document Inquiry Intent
    if (
      raw.includes('document') ||
      raw.includes('upload') ||
      raw.includes('certificate') ||
      raw.includes('vault') ||
      raw.includes('marksheet') ||
      raw.includes('what documents') ||
      raw.includes('which documents') ||
      raw.includes('required documents')
    ) {
      return {
        intent: IntentType.FIND_DOCUMENT,
        confidence: 0.88,
        extractedServiceSlug: serviceSlug,
        extractedParameters: {},
      };
    }

    // 5. Navigation Actions
    if (
      raw.includes('open') ||
      raw.includes('go to') ||
      raw.includes('navigate') ||
      raw.includes('take me to') ||
      raw.includes('show me the syllabus') ||
      raw.includes('show notices') ||
      raw.includes('show me that') ||
      raw.includes('open it')
    ) {
      return {
        intent: IntentType.NAVIGATE_SERVICE,
        confidence: 0.9,
        extractedServiceSlug: serviceSlug,
        extractedParameters: {
          section: this.extractSection(raw, history),
        },
      };
    }

    // 6. Public Knowledge / Rule / Official Artifact Query
    if (
      raw.includes('when') ||
      raw.includes('what is') ||
      raw.includes('date') ||
      raw.includes('deadline') ||
      raw.includes('fee') ||
      raw.includes('exam pattern') ||
      raw.includes('syllabus') ||
      raw.includes('marking scheme') ||
      raw.includes('answer key') ||
      raw.includes('response sheet') ||
      raw.includes('question paper') ||
      raw.includes('scorecard') ||
      raw.includes('result') ||
      raw.includes('admit card') ||
      raw.includes('bulletin') ||
      raw.includes('notice') ||
      raw.includes('hospital') ||
      raw.includes('scheme') ||
      raw.includes('what does this mean') ||
      raw.includes('tell me more') ||
      raw.includes('and for b.tech') ||
      raw.includes('and for b.arch') ||
      raw.includes('what about negative marking')
    ) {
      return {
        intent: IntentType.KNOWLEDGE_QUERY,
        confidence: 0.92,
        extractedServiceSlug: serviceSlug,
        extractedParameters: {
          section: this.extractSection(raw, history),
        },
      };
    }

    return {
      intent: IntentType.GENERAL_HELP,
      confidence: 0.75,
      extractedServiceSlug: serviceSlug,
      extractedParameters: {},
    };
  }

  private resolveServiceSlug(
    text: string,
    fallback?: string,
    history: ConversationHistoryMessage[] = [],
  ): string | undefined {
    const directMatch = this.extractService(text);
    if (directMatch) return directMatch;

    if (fallback && fallback !== 'national-service-directory') {
      return fallback;
    }

    // Search backwards in conversation history for service references
    for (let i = history.length - 1; i >= 0; i--) {
      const msg = history[i].content.toLowerCase();
      const histMatch = this.extractService(msg);
      if (histMatch) return histMatch;
    }

    return fallback;
  }

  private extractService(text: string): string | undefined {
    if (text.includes('jee') || text.includes('engineering') || text.includes('nta') || text.includes('iit')) {
      return 'jee-main';
    }
    if (text.includes('ayushman') || text.includes('health') || text.includes('pmjay') || text.includes('nha')) {
      return 'ayushman-bharat';
    }
    return undefined;
  }

  private extractSection(text: string, history: ConversationHistoryMessage[] = []): string | undefined {
    if (text.includes('syllabus')) return 'syllabus';
    if (text.includes('bulletin') || text.includes('information')) return 'bulletin';
    if (text.includes('notice') || text.includes('update') || text.includes('circular')) return 'notices';
    if (text.includes('paper') || text.includes('previous year') || text.includes('question') || text.includes('answer key')) return 'papers';
    if (text.includes('faq') || text.includes('question') || text.includes('help')) return 'faq';
    if (text.includes('apply') || text.includes('service') || text.includes('candidate')) return 'candidate-services';

    // Check history for context if current query is "open that" / "show me that"
    if (text.includes('that') || text.includes('it')) {
      for (let i = history.length - 1; i >= 0; i--) {
        const histSection = this.extractSection(history[i].content.toLowerCase());
        if (histSection) return histSection;
      }
    }

    return undefined;
  }

  private isEligibilityFollowUp(text: string): boolean {
    return (
      text.startsWith('i ') ||
      text.startsWith('am i') ||
      text.startsWith('can i') ||
      text.includes('passed in') ||
      text.includes('pcm') ||
      text.includes('12th')
    );
  }

  private historyHasEligibilityContext(history: ConversationHistoryMessage[]): boolean {
    if (!history || history.length === 0) return false;
    const recent = history.slice(-4);
    return recent.some(
      (m) =>
        m.content.toLowerCase().includes('eligib') ||
        m.content.toLowerCase().includes('qualif') ||
        m.content.toLowerCase().includes('criteria') ||
        m.content.toLowerCase().includes('class 12'),
    );
  }
}
