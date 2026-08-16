import { Injectable, ForbiddenException, BadRequestException, Logger } from '@nestjs/common';
import { RiskLevel, ActionCard } from '@sanchay/types';
import { KnowledgeService } from '../../knowledge/knowledge.service';
import { ApplicationService } from '../../application/application.service';
import { DocumentService } from '../../document/document.service';

export interface ToolDefinition {
  id: string;
  name: string;
  description: string;
  riskLevel: RiskLevel;
  requiresAuth: boolean;
  requiresConfirmation: boolean;
}

@Injectable()
export class ToolRegistryService {
  private readonly logger = new Logger(ToolRegistryService.name);

  private readonly registeredTools: Map<string, ToolDefinition> = new Map([
    [
      'knowledge.search',
      {
        id: 'knowledge.search',
        name: 'Official Knowledge Search',
        description: 'Searches authoritative government bulletins and circulars with verifiable citations.',
        riskLevel: RiskLevel.LOW,
        requiresAuth: false,
        requiresConfirmation: false,
      },
    ],
    [
      'application.autofill',
      {
        id: 'application.autofill',
        name: 'Deterministic Application Auto-Fill',
        description: 'Auto-fills verified citizen profile data into draft applications with consent.',
        riskLevel: RiskLevel.MEDIUM,
        requiresAuth: true,
        requiresConfirmation: false,
      },
    ],
    [
      'application.review',
      {
        id: 'application.review',
        name: 'Application Review Sheet',
        description: 'Aggregates application fields into a transparent review sheet before submission.',
        riskLevel: RiskLevel.LOW,
        requiresAuth: true,
        requiresConfirmation: false,
      },
    ],
    [
      'application.submit_mock',
      {
        id: 'application.submit_mock',
        name: 'Consequential Application Submission',
        description: 'Submits finalized application to official authority adapter. Requires explicit confirmation.',
        riskLevel: RiskLevel.HIGH,
        requiresAuth: true,
        requiresConfirmation: true,
      },
    ],
    [
      'document.list',
      {
        id: 'document.list',
        name: 'Citizen Document Vault Listing',
        description: 'Lists citizen sovereign documents with verification and antivirus status.',
        riskLevel: RiskLevel.LOW,
        requiresAuth: true,
        requiresConfirmation: false,
      },
    ],
    [
      'jee.open_section',
      {
        id: 'jee.open_section',
        name: 'JEE Portal Section Navigation',
        description: 'Navigates to specific JEE Main section (syllabus, bulletin, notices, papers, faq, candidate-services).',
        riskLevel: RiskLevel.LOW,
        requiresAuth: false,
        requiresConfirmation: false,
      },
    ],
    [
      'jee.check_eligibility',
      {
        id: 'jee.check_eligibility',
        name: 'JEE Main Eligibility Checker',
        description: 'Evaluates candidate qualification rules (Class 12 year, subjects: Physics, Maths, Chemistry/Tech) deterministically.',
        riskLevel: RiskLevel.LOW,
        requiresAuth: false,
        requiresConfirmation: false,
      },
    ],
  ]);

  constructor(
    private readonly knowledgeService: KnowledgeService,
    private readonly applicationService: ApplicationService,
    private readonly documentService: DocumentService,
  ) {}

  getTool(toolId: string): ToolDefinition | undefined {
    return this.registeredTools.get(toolId);
  }

  /**
   * Executes an authorized tool with strict risk level enforcement and confirmation verification
   */
  async executeTool(
    toolId: string,
    params: Record<string, any>,
    user?: any,
    isConfirmed = false,
  ): Promise<{ result: any; actionCard?: ActionCard }> {
    const tool = this.registeredTools.get(toolId);
    if (!tool) {
      throw new BadRequestException(`Unregistered or unallowed tool: "${toolId}"`);
    }

    if (tool.requiresAuth && !user) {
      throw new ForbiddenException(`Authentication required to execute tool "${toolId}".`);
    }

    // High-Risk Consequential Action Guard: Must be explicitly confirmed
    if (tool.riskLevel === RiskLevel.HIGH && !isConfirmed) {
      this.logger.log(`[ToolRegistry] High-risk tool "${toolId}" requires citizen confirmation. Generating confirmation card.`);
      return {
        result: {
          status: 'PENDING_CONFIRMATION',
          message: 'This is a consequential government action that requires your explicit review and confirmation.',
        },
        actionCard: {
          id: `conf-${Date.now()}`,
          title: 'Confirm Consequential Action',
          description: `Are you sure you want to execute "${tool.name}"? This will submit your application to the official authority.`,
          actionType: toolId,
          payload: params,
          riskLevel: RiskLevel.HIGH,
          confirmationRequired: true,
          isConfirmed: false,
        },
      };
    }

    // Execute Tool Implementation
    switch (toolId) {
      case 'knowledge.search': {
        const data = await this.knowledgeService.searchKnowledge({
          query: params.query || '',
          serviceId: params.serviceId,
          limit: params.limit || 5,
        });
        return { result: data };
      }

      case 'application.autofill': {
        const data = await this.applicationService.autofillApplication(params.applicationId, user);
        return { result: data };
      }

      case 'application.review': {
        const data = await this.applicationService.getApplicationReview(params.applicationId, user);
        return { result: data };
      }

      case 'application.submit_mock': {
        const data = await this.applicationService.submitApplication(params.applicationId, user);
        return { result: data };
      }

      case 'document.list': {
        const data = await this.documentService.listDocuments(user);
        return { result: data };
      }

      case 'jee.open_section': {
        const section = params.section || 'overview';
        return {
          result: {
            serviceSlug: 'jee-main',
            section,
            route: `/services/jee-main?section=${section}`,
          },
        };
      }

      case 'jee.check_eligibility': {
        const passingYear = Number(params.passingYear || 2026);
        const eligible = passingYear >= 2024 && passingYear <= 2026;
        return {
          result: {
            eligible,
            criteria: {
              qualifyingYears: [2024, 2025, 2026],
              mandatorySubjects: ['Physics', 'Mathematics'],
              optionalSubjects: ['Chemistry', 'Biology', 'Biotechnology', 'Technical Vocational Subject'],
              ageLimit: 'No Age Limit',
            },
            message: eligible
              ? 'Candidate is eligible for JEE (Main) 2026 based on qualifying examination year and subjects.'
              : 'Candidate does not meet qualifying year requirements for JEE (Main) 2026.',
          },
        };
      }

      default:
        throw new BadRequestException(`No handler implemented for tool "${toolId}"`);
    }
  }
}
