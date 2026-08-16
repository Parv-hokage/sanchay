import { Injectable } from '@nestjs/common';
import { IntentType } from '@sanchay/types';

export interface DetectedIntent {
  intent: IntentType;
  confidence: number;
  extractedServiceSlug?: string;
  extractedParameters: Record<string, any>;
}

@Injectable()
export class IntentDetectionService {
  detectIntent(message: string, contextServiceSlug?: string): DetectedIntent {
    const raw = message.trim().toLowerCase();

    // 1. Check Eligibility Intent
    if (
      raw.includes('eligib') ||
      raw.includes('who can apply') ||
      raw.includes('qualification') ||
      raw.includes('age limit') ||
      raw.includes('criteria')
    ) {
      return {
        intent: IntentType.ELIGIBILITY_CHECK,
        confidence: 0.95,
        extractedServiceSlug: this.extractService(raw, contextServiceSlug),
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
      (raw.includes('want to apply')) ||
      (raw.includes('want to start'))
    ) {
      return {
        intent: IntentType.START_APPLICATION,
        confidence: 0.92,
        extractedServiceSlug: this.extractService(raw, contextServiceSlug),
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
        extractedServiceSlug: this.extractService(raw, contextServiceSlug),
        extractedParameters: {},
      };
    }

    // 4. Document Inquiry Intent
    if (
      raw.includes('document') ||
      raw.includes('upload') ||
      raw.includes('certificate') ||
      raw.includes('vault') ||
      raw.includes('marksheet')
    ) {
      return {
        intent: IntentType.FIND_DOCUMENT,
        confidence: 0.88,
        extractedServiceSlug: this.extractService(raw, contextServiceSlug),
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
      raw.includes('show notices')
    ) {
      return {
        intent: IntentType.NAVIGATE_SERVICE,
        confidence: 0.9,
        extractedServiceSlug: this.extractService(raw, contextServiceSlug),
        extractedParameters: {
          section: this.extractSection(raw),
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
      raw.includes('scheme')
    ) {
      return {
        intent: IntentType.KNOWLEDGE_QUERY,
        confidence: 0.92,
        extractedServiceSlug: this.extractService(raw, contextServiceSlug),
        extractedParameters: {
          section: this.extractSection(raw),
        },
      };
    }

    return {
      intent: IntentType.GENERAL_HELP,
      confidence: 0.75,
      extractedServiceSlug: contextServiceSlug,
      extractedParameters: {},
    };
  }

  private extractService(text: string, fallback?: string): string | undefined {
    if (text.includes('jee') || text.includes('engineering') || text.includes('nta') || text.includes('iit')) {
      return 'jee-main';
    }
    if (text.includes('ayushman') || text.includes('health') || text.includes('pmjay')) {
      return 'ayushman-bharat';
    }
    return fallback;
  }

  private extractSection(text: string): string | undefined {
    if (text.includes('syllabus')) return 'syllabus';
    if (text.includes('bulletin') || text.includes('information')) return 'bulletin';
    if (text.includes('notice') || text.includes('update') || text.includes('circular')) return 'notices';
    if (text.includes('paper') || text.includes('previous year') || text.includes('question') || text.includes('answer key')) return 'papers';
    if (text.includes('faq') || text.includes('question') || text.includes('help')) return 'faq';
    if (text.includes('apply') || text.includes('service') || text.includes('candidate')) return 'candidate-services';
    return undefined;
  }
}
