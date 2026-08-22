import { Injectable } from '@nestjs/common';
import {
  ServiceAdapter,
  UniversalFormSchema,
  FormValidationResult,
} from './service-adapter.interface';
import { ServiceRequirementField } from '../../me/profile-resolver.service';

@Injectable()
export class PlaygroundAdapter implements ServiceAdapter {
  readonly serviceId = 'srv-playground-001';
  readonly name = 'Universal Form Playground';
  readonly slug = 'universal-form';
  readonly organization = 'Sanchay Innovation Lab';
  readonly department = 'Department of Digital Governance';

  async getRequirements(): Promise<ServiceRequirementField[]> {
    return [
      // Profile-backed fields
      { fieldKey: 'fullName', label: 'Full Name', required: true, source: 'PROFILE' },
      { fieldKey: 'dateOfBirth', label: 'Date of Birth', required: true, source: 'PROFILE' },
      { fieldKey: 'gender', label: 'Gender', required: true, source: 'PROFILE' },
      { fieldKey: 'category', label: 'Category / Caste', required: true, source: 'PROFILE' },
      { fieldKey: 'class10Board', label: 'Class 10 Board', required: true, source: 'PROFILE' },
      { fieldKey: 'class10PassingYear', label: 'Class 10 Passing Year', required: true, source: 'PROFILE' },
      { fieldKey: 'class10Percentage', label: 'Class 10 Percentage', required: true, source: 'PROFILE' },
      { fieldKey: 'class12Board', label: 'Class 12 Board', required: true, source: 'PROFILE' },
      { fieldKey: 'class12PassingYear', label: 'Class 12 Passing Year', required: true, source: 'PROFILE' },
      { fieldKey: 'class12Percentage', label: 'Class 12 Percentage', required: true, source: 'PROFILE' },
      { fieldKey: 'stream', label: 'Academic Stream', required: true, source: 'PROFILE' },

      // Application-owned / Intentionally missing fields
      {
        fieldKey: 'preferredCity',
        label: 'Preferred Examination City',
        required: true,
        source: 'USER',
      },
      {
        fieldKey: 'preferredCourse',
        label: 'Preferred Degree / Course',
        required: true,
        source: 'USER',
        options: ['Computer Science & Engineering', 'Electronics & Communication', 'Mechanical Engineering', 'Data Science & AI'],
      },
      {
        fieldKey: 'preferredInstitution',
        label: 'Target Institution Choice',
        required: true,
        source: 'USER',
      },
      {
        fieldKey: 'applicationPreference',
        label: 'Application Quota Preference',
        required: false,
        source: 'USER',
        options: ['All India Quota', 'Home State Quota', 'NRI / Sponsored'],
      },
      {
        fieldKey: 'emergencyContact',
        label: 'Emergency Contact Mobile',
        required: true,
        source: 'USER',
      },
    ];
  }

  async getFormSchema(): Promise<UniversalFormSchema> {
    return {
      serviceId: this.serviceId,
      serviceName: this.name,
      capabilitySlug: 'playground-application',
      sections: [
        {
          id: 'sec-profile',
          title: '1. Personal Identity & Profile Data',
          description: 'Sovereign data auto-resolved and locked from your authenticated Sanchay profile',
          order: 1,
        },
        {
          id: 'sec-academic',
          title: '2. Academic History',
          description: 'Educational credentials mapped from citizen profile records',
          order: 2,
        },
        {
          id: 'sec-preferences',
          title: '3. Application Preferences (Form Specific)',
          description: 'Application-owned choices filled via UI or AI conversational sync',
          order: 3,
        },
        {
          id: 'sec-documents',
          title: '4. Document Verification',
          description: 'Vault-attached certificates & required document uploads',
          order: 4,
        },
      ],
      fields: [
        // Section 1: Profile
        {
          fieldKey: 'fullName',
          label: 'Candidate Full Name',
          type: 'text',
          required: true,
          source: 'SANCHAY_PROFILE',
          section: 'sec-profile',
          description: 'Verified official name',
        },
        {
          fieldKey: 'dateOfBirth',
          label: 'Date of Birth',
          type: 'date',
          required: true,
          source: 'SANCHAY_PROFILE',
          section: 'sec-profile',
        },
        {
          fieldKey: 'gender',
          label: 'Gender',
          type: 'select',
          required: true,
          source: 'SANCHAY_PROFILE',
          section: 'sec-profile',
          options: [
            { label: 'Male', value: 'Male' },
            { label: 'Female', value: 'Female' },
            { label: 'Other', value: 'Other' },
          ],
        },
        {
          fieldKey: 'category',
          label: 'Category / Caste',
          type: 'select',
          required: true,
          source: 'SANCHAY_PROFILE',
          section: 'sec-profile',
          options: [
            { label: 'General / Unreserved', value: 'General' },
            { label: 'General-EWS', value: 'GEN_EWS' },
            { label: 'OBC-NCL', value: 'OBC_NCL' },
            { label: 'Scheduled Caste (SC)', value: 'SC' },
            { label: 'Scheduled Tribe (ST)', value: 'ST' },
          ],
        },

        // Section 2: Academic
        {
          fieldKey: 'class10Board',
          label: 'Class 10 Board',
          type: 'text',
          required: true,
          source: 'SANCHAY_PROFILE',
          section: 'sec-academic',
        },
        {
          fieldKey: 'class10PassingYear',
          label: 'Class 10 Passing Year',
          type: 'number',
          required: true,
          source: 'SANCHAY_PROFILE',
          section: 'sec-academic',
        },
        {
          fieldKey: 'class10Percentage',
          label: 'Class 10 Aggregate (%)',
          type: 'number',
          required: true,
          source: 'SANCHAY_PROFILE',
          section: 'sec-academic',
          validation: { min: 0, max: 100, message: 'Percentage must be between 0 and 100' },
        },
        {
          fieldKey: 'class12Board',
          label: 'Class 12 Board',
          type: 'text',
          required: true,
          source: 'SANCHAY_PROFILE',
          section: 'sec-academic',
        },
        {
          fieldKey: 'class12PassingYear',
          label: 'Class 12 Passing Year',
          type: 'number',
          required: true,
          source: 'SANCHAY_PROFILE',
          section: 'sec-academic',
        },
        {
          fieldKey: 'class12Percentage',
          label: 'Class 12 Aggregate (%)',
          type: 'number',
          required: true,
          source: 'SANCHAY_PROFILE',
          section: 'sec-academic',
          validation: { min: 0, max: 100, message: 'Percentage must be between 0 and 100' },
        },
        {
          fieldKey: 'stream',
          label: 'Academic Stream',
          type: 'text',
          required: true,
          source: 'SANCHAY_PROFILE',
          section: 'sec-academic',
        },

        // Section 3: Preferences
        {
          fieldKey: 'preferredCity',
          label: 'Preferred Examination City',
          type: 'text',
          required: true,
          source: 'USER_INPUT',
          section: 'sec-preferences',
          placeholder: 'e.g. Noida, Delhi, Bengaluru',
        },
        {
          fieldKey: 'preferredCourse',
          label: 'Preferred Degree Course',
          type: 'select',
          required: true,
          source: 'USER_INPUT',
          section: 'sec-preferences',
          options: [
            { label: 'Computer Science & Engineering', value: 'Computer Science' },
            { label: 'Electronics & Communication', value: 'Electronics' },
            { label: 'Mechanical Engineering', value: 'Mechanical' },
            { label: 'Data Science & AI', value: 'Data Science' },
          ],
        },
        {
          fieldKey: 'preferredInstitution',
          label: 'Target Institution Choice',
          type: 'text',
          required: true,
          source: 'USER_INPUT',
          section: 'sec-preferences',
          placeholder: 'e.g. IIT Delhi, NIT Trichy',
        },
        {
          fieldKey: 'applicationPreference',
          label: 'Quota Category',
          type: 'select',
          required: false,
          source: 'USER_INPUT',
          section: 'sec-preferences',
          options: [
            { label: 'All India Quota', value: 'AIQ' },
            { label: 'Home State Quota', value: 'HSQ' },
            { label: 'NRI / Sponsored', value: 'NRI' },
          ],
        },
        {
          fieldKey: 'emergencyContact',
          label: 'Emergency Contact Mobile Number',
          type: 'text',
          required: true,
          source: 'USER_INPUT',
          section: 'sec-preferences',
          placeholder: '+91 98765 43210',
          validation: { pattern: '^(\\+91)?[6-9]\\d{9}$', message: 'Enter a valid 10-digit Indian mobile number' },
        },

        // Section 4: Documents
        {
          fieldKey: 'twelfthMarksheet',
          label: 'Class 12 Marksheet (From Vault)',
          type: 'file',
          required: true,
          source: 'DOCUMENT_VAULT',
          section: 'sec-documents',
          description: 'Link verified digital document from your Sanchay Vault',
        },
        {
          fieldKey: 'incomeCertificate',
          label: 'Income Certificate (Upload Required)',
          type: 'file',
          required: true,
          source: 'DOCUMENT_VAULT',
          section: 'sec-documents',
          description: 'Upload latest government-certified income certificate',
        },
      ],
    };
  }

  async validateApplication(fields: Record<string, string>): Promise<FormValidationResult> {
    const errors: Record<string, string> = {};
    const warnings: string[] = [];

    // Profile field validations
    if (!fields.fullName || fields.fullName.trim().length === 0) {
      errors.fullName = 'Full Name is required from your Sanchay Profile.';
    }
    if (!fields.dateOfBirth) {
      errors.dateOfBirth = 'Date of birth is required.';
    }
    if (!fields.category) {
      errors.category = 'Category is required.';
    }

    // Application fields validations
    if (!fields.preferredCity || fields.preferredCity.trim().length === 0) {
      errors.preferredCity = 'Preferred examination city is required.';
    }
    if (!fields.preferredCourse || fields.preferredCourse.trim().length === 0) {
      errors.preferredCourse = 'Preferred degree course is required.';
    }
    if (!fields.preferredInstitution || fields.preferredInstitution.trim().length === 0) {
      errors.preferredInstitution = 'Target institution choice is required.';
    }

    // Number / format validations
    if (fields.class10Percentage) {
      const p = parseFloat(fields.class10Percentage);
      if (isNaN(p) || p < 0 || p > 100) {
        errors.class10Percentage = 'Class 10 percentage must be between 0 and 100.';
      }
    }
    if (fields.class12Percentage) {
      const p = parseFloat(fields.class12Percentage);
      if (isNaN(p) || p < 0 || p > 100) {
        errors.class12Percentage = 'Class 12 percentage must be between 0 and 100.';
      }
    }
    if (fields.emergencyContact) {
      const cleanPhone = fields.emergencyContact.replace(/[\s\-()]/g, '');
      const valid = /^(\+91)?[6-9]\d{9}$/.test(cleanPhone);
      if (!valid) {
        errors.emergencyContact = 'Emergency contact must be a valid 10-digit mobile number starting with 6-9.';
      }
    } else {
      errors.emergencyContact = 'Emergency contact mobile number is required.';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      warnings,
    };
  }

  async executeAction(actionName: string, params: Record<string, any>, user?: any): Promise<any> {
    switch (actionName) {
      case 'submit_mock': {
        const testCode = `TEST-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
        return {
          status: 'SUCCESS',
          submissionId: `sub-play-${Date.now()}`,
          referenceCode: testCode,
          message: `TEST APPLICATION SUBMITTED — ${testCode}`,
          timestamp: new Date().toISOString(),
          isPlayground: true,
        };
      }

      default:
        return { success: true, action: actionName, params };
    }
  }
}
