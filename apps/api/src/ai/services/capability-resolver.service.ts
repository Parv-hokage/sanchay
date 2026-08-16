import { Injectable } from '@nestjs/common';
import { IntentType, RiskLevel, ActionCard } from '@sanchay/types';

export interface ResolvedCapability {
  capabilitySlug: string;
  serviceSlug: string;
  name: string;
  description: string;
  actionCard?: ActionCard;
}

@Injectable()
export class CapabilityResolverService {
  resolveCapability(
    intent: IntentType,
    serviceSlug?: string,
  ): ResolvedCapability | null {
    const activeService = serviceSlug || 'jee-main';

    if (intent === IntentType.START_APPLICATION || intent === IntentType.FILL_APPLICATION) {
      if (activeService === 'jee-main') {
        return {
          capabilitySlug: 'apply-jee-main-2026',
          serviceSlug: 'jee-main',
          name: 'JEE (Main) 2026 Online Application',
          description: 'Prepare and auto-fill JEE Main application form with verified citizen profile.',
          actionCard: {
            id: 'act-jee-start',
            title: 'Start JEE (Main) 2026 Application',
            description: 'Sanchay will auto-fill your verified profile details, addresses, and contacts.',
            actionType: 'START_APPLICATION',
            payload: {
              serviceSlug: 'jee-main',
              capabilitySlug: 'apply-jee-main-2026',
            },
            riskLevel: RiskLevel.MEDIUM,
            confirmationRequired: false,
          },
        };
      }

      if (activeService === 'ayushman-bharat') {
        return {
          capabilitySlug: 'ayushman-card-generation',
          serviceSlug: 'ayushman-bharat',
          name: 'Ayushman Bharat PM-JAY e-KYC Card Generation',
          description: 'Generate your Ayushman health cover card linked to your Sanchay UID.',
          actionCard: {
            id: 'act-ayushman-start',
            title: 'Generate Ayushman Health Card',
            description: 'Initiate e-KYC verification using your verified Sanchay profile and SECC ID.',
            actionType: 'START_APPLICATION',
            payload: {
              serviceSlug: 'ayushman-bharat',
              capabilitySlug: 'ayushman-card-generation',
            },
            riskLevel: RiskLevel.MEDIUM,
            confirmationRequired: false,
          },
        };
      }
    }

    if (intent === IntentType.ELIGIBILITY_CHECK) {
      return {
        capabilitySlug: 'check-eligibility',
        serviceSlug: activeService,
        name: 'Official Eligibility Verification',
        description: 'Verify official guidelines against citizen credentials.',
      };
    }

    if (intent === IntentType.NAVIGATE_SERVICE) {
      return {
        capabilitySlug: 'navigate-service',
        serviceSlug: activeService,
        name: 'Portal Navigation',
        description: 'Navigate to official service section.',
        actionCard: {
          id: 'act-jee-nav',
          title: 'Navigate to JEE Main Section',
          description: 'Open official JEE Main section in Sanchay portal.',
          actionType: 'NAVIGATE_SERVICE',
          payload: {
            serviceSlug: activeService,
            route: `/services/${activeService}`,
          },
          riskLevel: RiskLevel.LOW,
          confirmationRequired: false,
        },
      };
    }

    return null;
  }
}
