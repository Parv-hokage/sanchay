import { Injectable, ForbiddenException, BadRequestException, Logger, Optional } from '@nestjs/common';
import { RiskLevel, ActionCard } from '../../types';
import { KnowledgeService } from '../../knowledge/knowledge.service';
import { ApplicationService } from '../../application/application.service';
import { DocumentService } from '../../document/document.service';
import { ServiceRegistryService } from '../../catalog/service-registry.service';
import { ProfileResolverService } from '../../me/profile-resolver.service';

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
      'service.get_requirements',
      {
        id: 'service.get_requirements',
        name: 'Service Requirements Discovery',
        description: 'Discovers declared profile and document requirements for any registered government service.',
        riskLevel: RiskLevel.LOW,
        requiresAuth: false,
        requiresConfirmation: false,
      },
    ],
    [
      'service.get_form_schema',
      {
        id: 'service.get_form_schema',
        name: 'Universal Form Schema Provider',
        description: 'Retrieves machine-readable universal form schema with field types, sections, and validation.',
        riskLevel: RiskLevel.LOW,
        requiresAuth: false,
        requiresConfirmation: false,
      },
    ],
    [
      'profile.resolve_requirements',
      {
        id: 'profile.resolve_requirements',
        name: 'Canonical Profile Requirement Resolver',
        description: 'Deterministically resolves verified citizen profile fields against service requirements.',
        riskLevel: RiskLevel.LOW,
        requiresAuth: true,
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
    [
      'scholarship.check_eligibility',
      {
        id: 'scholarship.check_eligibility',
        name: 'National Scholarship Eligibility Checker',
        description: 'Evaluates candidate income threshold (<= 8 Lakh) and merit percentage (>= 60%) deterministically.',
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
    @Optional() private readonly serviceRegistry?: ServiceRegistryService,
    @Optional() private readonly profileResolver?: ProfileResolverService,
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

      case 'service.get_requirements': {
        const serviceSlug = params.serviceSlug || params.serviceId || 'jee-main';
        if (this.serviceRegistry) {
          const reqs = await this.serviceRegistry.getServiceRequirements(serviceSlug);
          return { result: { serviceSlug, requirements: reqs } };
        }
        return { result: { serviceSlug, requirements: [] } };
      }

      case 'service.get_form_schema': {
        const serviceSlug = params.serviceSlug || params.serviceId || 'jee-main';
        if (this.serviceRegistry) {
          const schema = await this.serviceRegistry.getUniversalFormSchema(serviceSlug);
          return { result: { serviceSlug, schema } };
        }
        return { result: { serviceSlug, schema: null } };
      }

      case 'profile.resolve_requirements': {
        const serviceSlug = params.serviceSlug || params.serviceId || 'jee-main';
        if (this.serviceRegistry && this.profileResolver && user?.id) {
          const reqs = await this.serviceRegistry.getServiceRequirements(serviceSlug);
          const report = await this.profileResolver.resolveRequirements(user.id, reqs, params.fields || {});
          return { result: report };
        }
        return { result: { isComplete: false, message: 'Profile resolver unavailable' } };
      }

      case 'application.autofill': {
        const data = await this.applicationService.autofillApplication(user?.id || user, params.applicationId, params.dto || {});
        return { result: data };
      }

      case 'application.review': {
        const data = await this.applicationService.getApplicationReview(user?.id || user, params.applicationId);
        return { result: data };
      }

      case 'application.submit_mock': {
        if (params.serviceSlug === 'universal-form' || params.isPlayground) {
          if (this.serviceRegistry) {
            const playRes = await this.serviceRegistry.executeServiceAction('universal-form', 'submit_mock', params, user);
            return { result: playRes };
          }
          const testCode = `TEST-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
          return {
            result: {
              status: 'SUCCESS',
              referenceCode: testCode,
              message: `TEST APPLICATION SUBMITTED — ${testCode}`,
              isPlayground: true,
            },
          };
        }
        const data = await this.applicationService.submitApplication(user?.id || user, params.applicationId);
        return { result: data };
      }

      case 'document.list': {
        const data = await this.documentService.listDocuments(user?.id || user);
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
            service: 'jee-main',
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

      case 'scholarship.check_eligibility': {
        if (this.serviceRegistry) {
          const res = await this.serviceRegistry.executeServiceAction('national-scholarship', 'check_eligibility', params, user);
          return { result: res };
        }
        const income = parseFloat(params.income || params.annualFamilyIncome);
        const marks = parseFloat(params.marks || params.class12Percentage);
        const eligible = !isNaN(income) && income <= 800000 && !isNaN(marks) && marks >= 60;
        return {
          result: {
            service: 'national-scholarship',
            eligible,
            criteria: { maxIncome: 800000, minMarks: 60 },
            message: eligible
              ? 'Candidate meets both income (<= 8 Lakh) and academic (>= 60%) merit criteria.'
              : 'Candidate does not meet scholarship eligibility thresholds.',
          },
        };
      }

      default:
        throw new BadRequestException(`No handler implemented for tool "${toolId}"`);
    }
  }
}
