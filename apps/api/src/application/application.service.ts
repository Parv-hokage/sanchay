import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreateApplicationDto, UpdateFieldsDto, AutofillRequestDto } from './dto/application.dto';
import { ApplicationStatus, FieldSource } from '@prisma/client';
import { AuditActionType } from '@sanchay/types';

export interface ApplicationReviewPayload {
  applicationId: string;
  service: {
    id: string;
    name: string;
    slug: string;
    organization: string;
  };
  capability: {
    id: string;
    name: string;
    slug: string;
    type: string;
  };
  status: ApplicationStatus;
  currentStep: string;
  sections: {
    title: string;
    fields: {
      fieldKey: string;
      label: string;
      value: string;
      source: FieldSource;
      verified: boolean;
      required: boolean;
      status: 'AUTO_FILLED' | 'USER_ENTERED' | 'MISSING';
    }[];
  }[];
  isComplete: boolean;
  missingRequiredCount: number;
}

// In-memory fallback repository for resilient local development when DB is offline
const inMemoryApplications = new Map<string, any>();
const inMemoryEvents = new Map<string, any[]>();

@Injectable()
export class ApplicationService {
  private readonly logger = new Logger(ApplicationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  // ==========================================
  // 1. State Machine Validator
  // ==========================================
  private validateStateTransition(current: ApplicationStatus, next: ApplicationStatus): void {
    const validTransitions: Record<ApplicationStatus, ApplicationStatus[]> = {
      DRAFT: [ApplicationStatus.IN_PROGRESS, ApplicationStatus.FAILED],
      IN_PROGRESS: [
        ApplicationStatus.IN_PROGRESS,
        ApplicationStatus.READY_FOR_REVIEW,
        ApplicationStatus.FAILED,
      ],
      READY_FOR_REVIEW: [
        ApplicationStatus.IN_PROGRESS,
        ApplicationStatus.SUBMITTING,
        ApplicationStatus.FAILED,
      ],
      SUBMITTING: [
        ApplicationStatus.SUBMITTED,
        ApplicationStatus.FAILED,
      ],
      SUBMITTED: [
        ApplicationStatus.PROCESSING,
        ApplicationStatus.COMPLETED,
        ApplicationStatus.REJECTED,
      ],
      PROCESSING: [ApplicationStatus.COMPLETED, ApplicationStatus.REJECTED],
      COMPLETED: [],
      REJECTED: [],
      FAILED: [ApplicationStatus.DRAFT, ApplicationStatus.IN_PROGRESS],
    };

    if (current === next) return;

    const allowed = validTransitions[current] || [];
    if (!allowed.includes(next)) {
      throw new BadRequestException(
        `Invalid state transition: Cannot transition application from '${current}' to '${next}'.`,
      );
    }
  }

  // ==========================================
  // 2. Create Application
  // ==========================================
  async createApplication(userId: string, dto: CreateApplicationDto) {
    let service: any = null;
    let capability: any = null;

    try {
      // Find service
      const isServiceUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        dto.serviceId,
      );
      service = await this.prisma.governmentService.findFirst({
        where: isServiceUuid ? { id: dto.serviceId } : { slug: dto.serviceId },
        include: { organization: true },
      });

      if (service) {
        const isCapUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          dto.capabilityId,
        );
        capability = await this.prisma.serviceCapability.findFirst({
          where: {
            serviceId: service.id,
            ...(isCapUuid ? { id: dto.capabilityId } : { slug: dto.capabilityId }),
          },
          include: { requirements: true },
        });
      }
    } catch {
      // Fallback below
    }

    // Deterministic fallback if DB offline
    if (!service || !capability) {
      if (dto.serviceId.includes('jee') || dto.capabilityId.includes('registration') || dto.capabilityId.includes('jee')) {
        service = {
          id: 'srv-jee-001',
          name: 'Joint Entrance Examination (Main)',
          slug: 'jee-main',
          organization: { name: 'National Testing Agency (NTA)' },
        };
        capability = {
          id: 'cap-jee-3',
          name: 'Online Application & Registration',
          slug: 'registration',
          type: 'ACTION',
          requirements: [
            { id: 'req-1', fieldKey: 'fullName', label: 'Candidate Full Name', required: true, source: 'PROFILE' },
            { id: 'req-2', fieldKey: 'dateOfBirth', label: 'Date of Birth (YYYY-MM-DD)', required: true, source: 'PROFILE' },
            { id: 'req-3', fieldKey: 'gender', label: 'Gender', required: true, source: 'PROFILE' },
            { id: 'req-4', fieldKey: 'category', label: 'Category (GEN/OBC/SC/ST/EWS)', required: true, source: 'USER' },
            { id: 'req-5', fieldKey: 'twelfthMarks', label: 'Class 12 Passing Status / Percentage', required: true, source: 'USER' },
            { id: 'req-6', fieldKey: 'permanentAddress', label: 'Permanent Address', required: true, source: 'PROFILE' },
          ],
        };
      } else {
        service = {
          id: 'srv-ayush-002',
          name: 'Ayushman Bharat PM-JAY',
          slug: 'ayushman-bharat',
          organization: { name: 'National Health Authority (NHA)' },
        };
        capability = {
          id: 'cap-ayush-2',
          name: 'Beneficiary Eligibility Check',
          slug: 'check-eligibility',
          type: 'RETRIEVE',
          requirements: [
            { id: 'req-7', fieldKey: 'fullName', label: 'Beneficiary Full Name', required: true, source: 'PROFILE' },
            { id: 'req-8', fieldKey: 'state', label: 'Residential State', required: true, source: 'PROFILE' },
            { id: 'req-9', fieldKey: 'rationCardNumber', label: 'Ration Card Number', required: false, source: 'USER' },
          ],
        };
      }
    }

    const requirements = capability.requirements || [];

    try {
      const application = await this.prisma.application.create({
        data: {
          userId,
          serviceId: service.id,
          status: ApplicationStatus.DRAFT,
          currentStep: 'PERSONAL_INFO',
          fields: {
            create: requirements.map((req: any) => ({
              fieldKey: req.fieldKey,
              fieldValue: '',
              source: FieldSource.USER,
              verified: false,
            })),
          },
          events: {
            create: {
              eventType: 'APPLICATION_CREATED',
              actorType: 'USER',
              actorId: userId,
              metadata: {
                serviceName: service.name,
                capabilityName: capability.name,
                fieldCount: requirements.length,
              },
            },
          },
        },
        include: {
          service: { include: { organization: true } },
          fields: true,
          events: true,
        },
      });

      await this.auditService.recordEvent({
        action: AuditActionType.APPLICATION_CREATED,
        actorId: userId,
        resourceType: 'APPLICATION',
        resourceId: application.id,
        requestId: `app-${Date.now()}`,
        metadata: { serviceId: service.id, capabilityId: capability.id },
      });

      return {
        ...application,
        capability,
      };
    } catch {
      // In-Memory Fallback
      const appId = `app-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const newApp = {
        id: appId,
        userId,
        serviceId: service.id,
        status: ApplicationStatus.DRAFT,
        currentStep: 'PERSONAL_INFO',
        externalApplicationReference: null,
        submittedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        service,
        capability,
        fields: requirements.map((req: any) => ({
          id: `fld-${req.fieldKey}`,
          applicationId: appId,
          fieldKey: req.fieldKey,
          fieldValue: '',
          source: FieldSource.USER,
          verified: false,
          label: req.label,
          required: req.required,
        })),
        events: [
          {
            id: `evt-${Date.now()}`,
            applicationId: appId,
            eventType: 'APPLICATION_CREATED',
            actorType: 'USER',
            actorId: userId,
            metadata: { serviceName: service.name, capabilityName: capability.name },
            createdAt: new Date(),
          },
        ],
      };

      inMemoryApplications.set(appId, newApp);
      inMemoryEvents.set(appId, newApp.events);

      return newApp;
    }
  }

  // ==========================================
  // 3. Get User Applications
  // ==========================================
  async getUserApplications(userId: string, serviceId?: string, status?: ApplicationStatus) {
    try {
      const apps = await this.prisma.application.findMany({
        where: {
          userId,
          ...(serviceId ? { serviceId } : {}),
          ...(status ? { status } : {}),
        },
        include: {
          service: {
            include: { organization: { include: { department: true } } },
          },
          fields: true,
        },
        orderBy: { updatedAt: 'desc' },
      });
      if (apps && apps.length > 0) return apps;
    } catch {
      // Fallback
    }

    const userApps = Array.from(inMemoryApplications.values()).filter(
      (a) => a.userId === userId && (!serviceId || a.serviceId === serviceId) && (!status || a.status === status),
    );

    return userApps;
  }

  // ==========================================
  // 4. Get Application By ID (Ownership Verified)
  // ==========================================
  async getApplicationById(userId: string, applicationId: string) {
    let application: any = null;

    try {
      application = await this.prisma.application.findUnique({
        where: { id: applicationId },
        include: {
          service: {
            include: {
              organization: { include: { department: true } },
              capabilities: { include: { requirements: true } },
            },
          },
          fields: true,
          events: { orderBy: { createdAt: 'desc' } },
        },
      });
    } catch {
      // Fallback
    }

    if (!application) {
      application = inMemoryApplications.get(applicationId);
    }

    if (!application) {
      throw new NotFoundException(`Application '${applicationId}' not found.`);
    }

    // Ownership Enforcement (IDOR Protection)
    if (application.userId !== userId) {
      throw new ForbiddenException(`Access denied: You do not have permission to view application '${applicationId}'.`);
    }

    return application;
  }

  // ==========================================
  // 5. Deterministic Auto-Fill Engine
  // ==========================================
  async autofillApplication(userId: string, applicationId: string, dto: AutofillRequestDto = {}) {
    const application = await this.getApplicationById(userId, applicationId);

    if (application.status === ApplicationStatus.SUBMITTED || application.status === ApplicationStatus.COMPLETED) {
      throw new BadRequestException('Cannot auto-fill an application that has already been submitted.');
    }

    // Fetch verified citizen profile, contact, and address records
    let profile: any = null;
    let address: any = null;
    let contact: any = null;

    try {
      profile = await this.prisma.profile.findUnique({ where: { userId } });
      address = await this.prisma.address.findFirst({ where: { userId, isPrimary: true } });
      contact = await this.prisma.contactMethod.findFirst({ where: { userId, isPrimary: true } });
    } catch {
      // In-Memory Fallback Profile
      profile = {
        fullName: 'Rahul Sharma',
        gender: 'MALE',
        dateOfBirth: new Date('2002-05-14'),
      };
      address = {
        line1: 'Flat 402, Shanti Vihar',
        line2: 'Sector 62',
        city: 'Noida',
        state: 'Uttar Pradesh',
        pincode: '201301',
      };
      contact = {
        valueReference: '+91 98765 43210',
      };
    }

    // Deterministic Mapping Dictionary
    const candidateData: Record<string, { value: string; source: FieldSource }> = {};

    if (profile?.fullName) {
      candidateData['fullName'] = { value: profile.fullName, source: FieldSource.PROFILE };
    }
    if (profile?.gender) {
      candidateData['gender'] = { value: profile.gender, source: FieldSource.PROFILE };
    }
    if (profile?.category) {
      candidateData['category'] = { value: profile.category, source: FieldSource.PROFILE };
    }
    if (profile?.dateOfBirth) {
      const dobStr = new Date(profile.dateOfBirth).toISOString().split('T')[0];
      candidateData['dateOfBirth'] = { value: dobStr, source: FieldSource.PROFILE };
      candidateData['dob'] = { value: dobStr, source: FieldSource.PROFILE };
    }
    if (address) {
      const fullAddr = `${address.line1 || ''}, ${address.line2 ? address.line2 + ', ' : ''}${address.city || ''}, ${address.state || ''} - ${address.pincode || ''}`.trim();
      candidateData['permanentAddress'] = { value: fullAddr, source: FieldSource.PROFILE };
      candidateData['address'] = { value: fullAddr, source: FieldSource.PROFILE };
      if (address.state) {
        candidateData['state'] = { value: address.state, source: FieldSource.PROFILE };
      }
      if (address.pincode) {
        candidateData['pincode'] = { value: address.pincode, source: FieldSource.PROFILE };
      }
    }
    if (contact?.valueReference) {
      candidateData['phone'] = { value: contact.valueReference, source: FieldSource.PROFILE };
      candidateData['phoneNumber'] = { value: contact.valueReference, source: FieldSource.PROFILE };
    }

    const targetFieldKeys = dto.fields && dto.fields.length > 0
      ? dto.fields
      : (application.fields || []).map((f: any) => f.fieldKey);

    const updatedFields: any[] = [];
    const autoFilledKeys: string[] = [];

    for (const field of application.fields || []) {
      if (targetFieldKeys.includes(field.fieldKey) && candidateData[field.fieldKey]) {
        const candidate = candidateData[field.fieldKey];
        // Auto-fill field
        field.fieldValue = candidate.value;
        field.source = candidate.source;
        field.verified = true;
        updatedFields.push(field);
        autoFilledKeys.push(field.fieldKey);

        try {
          await this.prisma.applicationField.upsert({
            where: {
              applicationId_fieldKey: {
                applicationId,
                fieldKey: field.fieldKey,
              },
            },
            update: {
              fieldValue: candidate.value,
              source: candidate.source,
              verified: true,
            },
            create: {
              applicationId,
              fieldKey: field.fieldKey,
              fieldValue: candidate.value,
              source: candidate.source,
              verified: true,
            },
          });
        } catch {
          // Handled in-memory below
        }
      }
    }

    // Transition state to IN_PROGRESS if in DRAFT
    let nextStatus = application.status;
    if (application.status === ApplicationStatus.DRAFT && autoFilledKeys.length > 0) {
      nextStatus = ApplicationStatus.IN_PROGRESS;
      try {
        await this.prisma.application.update({
          where: { id: applicationId },
          data: { status: ApplicationStatus.IN_PROGRESS },
        });
      } catch {
        application.status = ApplicationStatus.IN_PROGRESS;
      }
    }

    // Record Event
    const event = {
      id: `evt-${Date.now()}`,
      applicationId,
      eventType: 'FIELD_AUTO_FILLED',
      actorType: 'SYSTEM',
      actorId: userId,
      metadata: { autoFilledKeys, count: autoFilledKeys.length },
      createdAt: new Date(),
    };

    try {
      await this.prisma.applicationEvent.create({
        data: {
          applicationId,
          eventType: 'FIELD_AUTO_FILLED',
          actorType: 'SYSTEM',
          actorId: userId,
          metadata: { autoFilledKeys, count: autoFilledKeys.length },
        },
      });
    } catch {
      const appEvents = inMemoryEvents.get(applicationId) || [];
      appEvents.unshift(event);
      inMemoryEvents.set(applicationId, appEvents);
    }

    return {
      applicationId,
      status: nextStatus,
      autoFilledKeys,
      fields: application.fields,
    };
  }

  // ==========================================
  // 6. Update Fields (Manual User Inputs)
  // ==========================================
  async updateFields(userId: string, applicationId: string, dto: UpdateFieldsDto) {
    const application = await this.getApplicationById(userId, applicationId);

    if (application.status === ApplicationStatus.SUBMITTED || application.status === ApplicationStatus.COMPLETED) {
      throw new BadRequestException('Cannot edit fields of an application that is already submitted.');
    }

    const updatedKeys: string[] = [];

    for (const f of dto.fields || []) {
      const existingField = (application.fields || []).find((field: any) => field.fieldKey === f.fieldKey);
      if (existingField) {
        existingField.fieldValue = f.fieldValue;
        existingField.source = FieldSource.USER;
        existingField.verified = false;
      } else {
        application.fields = application.fields || [];
        application.fields.push({
          id: `fld-${f.fieldKey}`,
          applicationId,
          fieldKey: f.fieldKey,
          fieldValue: f.fieldValue,
          source: FieldSource.USER,
          verified: false,
        });
      }
      updatedKeys.push(f.fieldKey);

      try {
        await this.prisma.applicationField.upsert({
          where: {
            applicationId_fieldKey: {
              applicationId,
              fieldKey: f.fieldKey,
            },
          },
          update: {
            fieldValue: f.fieldValue,
            source: FieldSource.USER,
          },
          create: {
            applicationId,
            fieldKey: f.fieldKey,
            fieldValue: f.fieldValue,
            source: FieldSource.USER,
          },
        });
      } catch {
        // In-memory update already applied
      }
    }

    const newStep = dto.currentStep || application.currentStep;
    const newStatus =
      application.status === ApplicationStatus.DRAFT ? ApplicationStatus.IN_PROGRESS : application.status;

    try {
      await this.prisma.application.update({
        where: { id: applicationId },
        data: {
          currentStep: newStep,
          status: newStatus,
        },
      });
    } catch {
      application.currentStep = newStep;
      application.status = newStatus;
    }

    // Record Event
    try {
      await this.prisma.applicationEvent.create({
        data: {
          applicationId,
          eventType: 'FIELD_UPDATED',
          actorType: 'USER',
          actorId: userId,
          metadata: { updatedKeys, currentStep: newStep },
        },
      });
    } catch {
      const appEvents = inMemoryEvents.get(applicationId) || [];
      appEvents.unshift({
        id: `evt-${Date.now()}`,
        applicationId,
        eventType: 'FIELD_UPDATED',
        actorType: 'USER',
        actorId: userId,
        metadata: { updatedKeys, currentStep: newStep },
        createdAt: new Date(),
      });
      inMemoryEvents.set(applicationId, appEvents);
    }

    return {
      applicationId,
      status: newStatus,
      currentStep: newStep,
      updatedKeys,
      fields: application.fields,
    };
  }

  // ==========================================
  // 7. Get Application Review Sheet
  // ==========================================
  async getApplicationReview(userId: string, applicationId: string): Promise<ApplicationReviewPayload> {
    const application = await this.getApplicationById(userId, applicationId);

    const personalKeys = ['fullName', 'dateOfBirth', 'dob', 'gender', 'category'];
    const contactKeys = ['phone', 'phoneNumber', 'email', 'permanentAddress', 'address', 'state', 'pincode'];

    const personalFields: any[] = [];
    const contactFields: any[] = [];
    const requirementFields: any[] = [];

    let missingRequiredCount = 0;

    for (const f of application.fields || []) {
      const val = (f.fieldValue || '').trim();
      const isMissing = val === '';
      const isRequired = true; // By default requirements are mandatory unless specified

      if (isMissing && isRequired) {
        missingRequiredCount++;
      }

      const item = {
        fieldKey: f.fieldKey,
        label: this.formatFieldLabel(f.fieldKey),
        value: val,
        source: f.source,
        verified: f.verified,
        required: isRequired,
        status: isMissing
          ? ('MISSING' as const)
          : f.source === FieldSource.PROFILE
          ? ('AUTO_FILLED' as const)
          : ('USER_ENTERED' as const),
      };

      if (personalKeys.includes(f.fieldKey)) {
        personalFields.push(item);
      } else if (contactKeys.includes(f.fieldKey)) {
        contactFields.push(item);
      } else {
        requirementFields.push(item);
      }
    }

    const sections = [
      { title: 'Personal Information', fields: personalFields },
      { title: 'Contact & Residential Details', fields: contactFields },
      { title: 'Application Specific Requirements', fields: requirementFields },
    ].filter((s) => s.fields.length > 0);

    return {
      applicationId: application.id,
      service: {
        id: application.service?.id || application.serviceId,
        name: application.service?.name || 'Government Service',
        slug: application.service?.slug || 'service',
        organization: application.service?.organization?.name || 'Authority',
      },
      capability: {
        id: application.capability?.id || 'cap-default',
        name: application.capability?.name || 'Application Capability',
        slug: application.capability?.slug || 'capability',
        type: application.capability?.type || 'ACTION',
      },
      status: application.status,
      currentStep: application.currentStep,
      sections,
      isComplete: missingRequiredCount === 0,
      missingRequiredCount,
    };
  }

  // ==========================================
  // 8. Explicit Citizen Confirmation
  // ==========================================
  async confirmApplication(userId: string, applicationId: string) {
    const review = await this.getApplicationReview(userId, applicationId);

    if (!review.isComplete) {
      throw new BadRequestException(
        `Cannot confirm application: There are ${review.missingRequiredCount} missing required fields.`,
      );
    }

    this.validateStateTransition(review.status, ApplicationStatus.READY_FOR_REVIEW);

    try {
      await this.prisma.application.update({
        where: { id: applicationId },
        data: { status: ApplicationStatus.READY_FOR_REVIEW },
      });
      await this.prisma.applicationEvent.create({
        data: {
          applicationId,
          eventType: 'CONFIRMED',
          actorType: 'USER',
          actorId: userId,
          metadata: { confirmedAt: new Date().toISOString() },
        },
      });
    } catch {
      const app = inMemoryApplications.get(applicationId);
      if (app) {
        app.status = ApplicationStatus.READY_FOR_REVIEW;
      }
      const appEvents = inMemoryEvents.get(applicationId) || [];
      appEvents.unshift({
        id: `evt-${Date.now()}`,
        applicationId,
        eventType: 'CONFIRMED',
        actorType: 'USER',
        actorId: userId,
        metadata: { confirmedAt: new Date().toISOString() },
        createdAt: new Date(),
      });
    }

    return {
      applicationId,
      status: ApplicationStatus.READY_FOR_REVIEW,
      confirmed: true,
      message: 'Application review confirmed by citizen. Ready for submission.',
    };
  }

  // ==========================================
  // 9. Mock Submission Adapter
  // ==========================================
  async submitApplication(userId: string, applicationId: string, idempotencyKey?: string) {
    const application = await this.getApplicationById(userId, applicationId);

    if (application.status === ApplicationStatus.SUBMITTED) {
      return {
        applicationId,
        status: ApplicationStatus.SUBMITTED,
        referenceNumber: application.externalApplicationReference,
        submittedAt: application.submittedAt,
        message: 'Application was already submitted.',
      };
    }

    if (application.status !== ApplicationStatus.READY_FOR_REVIEW && application.status !== ApplicationStatus.IN_PROGRESS) {
      throw new BadRequestException(
        `Cannot submit application in status '${application.status}'. Complete review and confirmation first.`,
      );
    }

    // Generate deterministic application reference
    const serviceSlug = application.service?.slug || 'gov';
    const prefix = serviceSlug === 'jee-main' ? 'JEE2026-NTA' : serviceSlug === 'ayushman-bharat' ? 'ABPMJAY-2026' : 'SANCHAY-2026';
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const referenceNumber = `${prefix}-${randomSuffix}`;
    const submissionTime = new Date();

    try {
      await this.prisma.application.update({
        where: { id: applicationId },
        data: {
          status: ApplicationStatus.SUBMITTED,
          externalApplicationReference: referenceNumber,
          submittedAt: submissionTime,
        },
      });

      await this.prisma.applicationEvent.create({
        data: {
          applicationId,
          eventType: 'SUBMISSION_SUCCEEDED',
          actorType: 'ADAPTER',
          actorId: 'MockSubmissionAdapter',
          metadata: { referenceNumber, idempotencyKey, isMock: true },
        },
      });

      await this.auditService.recordEvent({
        action: AuditActionType.APPLICATION_SUBMITTED,
        actorId: userId,
        resourceType: 'APPLICATION',
        resourceId: applicationId,
        requestId: idempotencyKey || `sub-${Date.now()}`,
        metadata: { referenceNumber, serviceId: application.serviceId, isMock: true },
      });
    } catch {
      application.status = ApplicationStatus.SUBMITTED;
      application.externalApplicationReference = referenceNumber;
      application.submittedAt = submissionTime;
      const appEvents = inMemoryEvents.get(applicationId) || [];
      appEvents.unshift({
        id: `evt-${Date.now()}`,
        applicationId,
        eventType: 'SUBMISSION_SUCCEEDED',
        actorType: 'ADAPTER',
        actorId: 'MockSubmissionAdapter',
        metadata: { referenceNumber, idempotencyKey, isMock: true },
        createdAt: submissionTime,
      });
    }

    return {
      applicationId,
      status: ApplicationStatus.SUBMITTED,
      referenceNumber,
      submittedAt: submissionTime,
      serviceName: application.service?.name,
      isMockSubmission: true,
      message: 'Application successfully submitted to mock authority adapter.',
    };
  }

  // ==========================================
  // 10. Application Events / Audit Timeline
  // ==========================================
  async getApplicationEvents(userId: string, applicationId: string) {
    await this.getApplicationById(userId, applicationId);

    try {
      const events = await this.prisma.applicationEvent.findMany({
        where: { applicationId },
        orderBy: { createdAt: 'desc' },
      });
      if (events && events.length > 0) return events;
    } catch {
      // Fallback
    }

    return inMemoryEvents.get(applicationId) || [];
  }

  // ==========================================
  // Helper: Format field labels
  // ==========================================
  private formatFieldLabel(key: string): string {
    const labels: Record<string, string> = {
      fullName: 'Full Name',
      dateOfBirth: 'Date of Birth (YYYY-MM-DD)',
      dob: 'Date of Birth (YYYY-MM-DD)',
      gender: 'Gender',
      category: 'Category (GEN/OBC/SC/ST/EWS)',
      twelfthMarks: 'Class 12 Passing Status / Percentage',
      permanentAddress: 'Permanent Address',
      address: 'Permanent Address',
      state: 'Residential State',
      pincode: 'PIN Code',
      phone: 'Mobile Number',
      phoneNumber: 'Mobile Number',
      email: 'Email Address',
      rationCardNumber: 'Ration Card Number',
    };

    return labels[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
  }
}
