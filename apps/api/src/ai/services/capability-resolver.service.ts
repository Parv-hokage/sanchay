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
    extractedParams?: Record<string, any>,
  ): ResolvedCapability | null {
    const activeService = serviceSlug || 'jee-main';
    const isProfile =
      activeService === 'profile' ||
      extractedParams?.section === 'profile' ||
      extractedParams?.route === '/profile';

    if (
      intent === IntentType.APPLICATION_ACTION ||
      intent === IntentType.START_APPLICATION ||
      intent === IntentType.FILL_APPLICATION
    ) {
      if (activeService === 'jee-main') {
        const isFilling = intent === IntentType.FILL_APPLICATION;
        return {
          capabilitySlug: 'apply-jee-main-2026',
          serviceSlug: 'jee-main',
          name: 'JEE (Main) 2026 Online Application',
          description: 'Prepare and auto-fill JEE Main application form with verified citizen profile.',
          actionCard: {
            id: `act-jee-${Date.now()}`,
            title: isFilling ? 'Review Proposed Application Values' : 'Start JEE (Main) 2026 Application',
            description: isFilling
              ? 'Class 12 Year: 2025 | Subjects: Physics, Chemistry, Mathematics'
              : 'Review pre-filled application details from your Sanchay Profile before submission.',
            actionType: 'START_APPLICATION',
            payload: {
              serviceSlug: 'jee-main',
              capabilitySlug: 'apply-jee-main-2026',
              route: '/services/jee-main/apply',
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
        capabilitySlug: isProfile ? 'manage-profile' : 'navigate-service',
        serviceSlug: isProfile ? 'profile' : activeService,
        name: isProfile ? 'Citizen Profile Management' : 'Portal Navigation',
        description: isProfile
          ? 'Update citizen identity, academic, and contact information.'
          : 'Navigate to official service section.',
        actionCard: {
          id: `act-nav-${Date.now()}`,
          title: isProfile ? 'Open My Profile' : 'Navigate to Service Section',
          description: isProfile
            ? 'Personal and academic data is managed in My Profile as the single source of truth.'
            : `Open ${activeService} in Sanchay portal.`,
          actionType: 'NAVIGATE_SERVICE',
          payload: {
            serviceSlug: isProfile ? 'profile' : activeService,
            route: isProfile ? '/profile' : `/services/${activeService}`,
          },
          riskLevel: RiskLevel.LOW,
          confirmationRequired: false,
        },
      };
    }

    return null;
  }
}
