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

    // 1. Application Action Intent (e.g. "apply for me", "start application", "fill it for me", etc.)
    if (this.isApplicationAction(raw)) {
      return {
        intent: IntentType.APPLICATION_ACTION,
        confidence: 0.95,
        extractedServiceSlug: serviceSlug,
        extractedParameters: {},
      };
    }

    // 2. Check Eligibility Intent (including contextual follow-ups like "I am qualified?", "Am I eligible?", "Can I apply?")
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

    // 5. Navigation & Profile Correction Actions
    if (
      raw.includes('wrong') ||
      raw.includes('change my') ||
      raw.includes('update my') ||
      raw.includes('edit my') ||
      raw.includes('open profile') ||
      raw.includes('my profile') ||
      raw.includes('open') ||
      raw.includes('go to') ||
      raw.includes('navigate') ||
      raw.includes('take me to') ||
      raw.includes('show me the syllabus') ||
      raw.includes('show notices') ||
      raw.includes('show me that') ||
      raw.includes('open it')
    ) {
      const isProfileIntent =
        raw.includes('wrong') ||
        raw.includes('change my') ||
        raw.includes('update my') ||
        raw.includes('edit my') ||
        raw.includes('profile');

      return {
        intent: IntentType.NAVIGATE_SERVICE,
        confidence: 0.92,
        extractedServiceSlug: serviceSlug,
        extractedParameters: {
          section: isProfileIntent ? 'profile' : this.extractSection(raw, history),
          route: isProfileIntent ? '/profile' : undefined,
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

  private isApplicationAction(text: string): boolean {
    const t = text.trim().toLowerCase();
    return (
      t === 'apply' ||
      t === 'apply for me' ||
      t === 'apply for it' ||
      t === 'apply now' ||
      t === 'start application' ||
      t === 'start my application' ||
      t === 'fill the application' ||
      t === 'fill it for me' ||
      t === 'fill my form' ||
      t === 'fill form' ||
      t === 'fill application' ||
      t === 'complete my application' ||
      t === 'help me apply' ||
      t === 'submit my application' ||
      t === 'proceed with application' ||
      t === 'continue application' ||
      t === 'new application' ||
      t.includes('apply for me') ||
      t.includes('apply for it') ||
      t.includes('start my application') ||
      t.includes('start application') ||
      t.includes('fill the application') ||
      t.includes('fill it for me') ||
      t.includes('fill my form') ||
      t.includes('fill application') ||
      t.includes('complete my application') ||
      t.includes('help me apply') ||
      t.includes('submit my application') ||
      t.includes('proceed with application') ||
      t.includes('continue application') ||
      t.includes('apply for') ||
      t.includes('register for') ||
      t.includes('want to apply') ||
      t.includes('want to start') ||
      t.includes('how to apply') ||
      t.includes('where do i apply') ||
      (t.includes('apply') && (t.includes('application') || t.includes('form') || t.includes('now') || t.includes('me') || t.includes('jee'))) ||
      (t.includes('fill') && (t.includes('application') || t.includes('form') || t.includes('it') || t.includes('me') || t.includes('jee')))
    );
  }

  private resolveServiceSlug(
    text: string,
    fallback?: string,
    history: ConversationHistoryMessage[] = [],
  ): string | undefined {
    // 1. Explicit service in current message
    const directMatch = this.extractService(text);
    if (directMatch) return directMatch;

    // 2. Active route / service context
    if (fallback && fallback !== 'national-service-directory') {
      return fallback;
    }

    // 3. Most recent service mentioned in conversation history
    for (let i = history.length - 1; i >= 0; i--) {
      const msg = history[i].content.toLowerCase();
      const histMatch = this.extractService(msg);
      if (histMatch) return histMatch;
    }

    return undefined;
  }

  private extractService(text: string): string | undefined {
    if (
      text.includes('jee') ||
      text.includes('engineering') ||
      text.includes('nta') ||
      text.includes('iit') ||
      text.includes('joint entrance')
    ) {
      return 'jee-main';
    }
    if (
      text.includes('ayushman') ||
      text.includes('health') ||
      text.includes('pmjay') ||
      text.includes('pm-jay') ||
      text.includes('nha')
    ) {
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
