import { Injectable } from '@nestjs/common';
import {
  ServiceAdapter,
  UniversalFormSchema,
  FormValidationResult,
} from './service-adapter.interface';
import { ServiceRequirementField } from '../../me/profile-resolver.service';

@Injectable()
export class JeeMainAdapter implements ServiceAdapter {
  readonly serviceId = 'srv-jee-001';
  readonly name = 'Joint Entrance Examination (Main) 2026';
  readonly slug = 'jee-main';
  readonly organization = 'National Testing Agency (NTA)';
  readonly department = 'Department of Higher Education, MoE';

  async getRequirements(): Promise<ServiceRequirementField[]> {
    return [
      { fieldKey: 'fullName', label: 'Candidate Full Name', required: true, source: 'PROFILE' },
      { fieldKey: 'dateOfBirth', label: 'Date of Birth', required: true, source: 'PROFILE' },
      { fieldKey: 'gender', label: 'Gender', required: true, source: 'PROFILE' },
      { fieldKey: 'category', label: 'Category / Caste', required: true, source: 'PROFILE' },
      { fieldKey: 'permanentAddress', label: 'Permanent Address', required: true, source: 'PROFILE' },
      { fieldKey: 'state', label: 'State of Eligibility', required: true, source: 'PROFILE' },
      { fieldKey: 'pincode', label: 'Postal PIN Code', required: true, source: 'PROFILE' },
      { fieldKey: 'phone', label: 'Mobile Number', required: true, source: 'PROFILE' },
      {
        fieldKey: 'examPaper',
        label: 'Applied Exam Paper',
        required: true,
        source: 'USER',
        options: ['B.E./B.Tech (Paper 1)', 'B.Arch (Paper 2A)', 'B.Planning (Paper 2B)'],
      },
      {
        fieldKey: 'examSession',
        label: 'Exam Session',
        required: true,
        source: 'USER',
        options: ['Session 1 (January 2026)', 'Session 2 (April 2026)', 'Both Sessions'],
      },
      {
        fieldKey: 'examCity1',
        label: 'First Choice Exam City',
        required: true,
        source: 'USER',
      },
      {
        fieldKey: 'examCity2',
        label: 'Second Choice Exam City',
        required: false,
        source: 'USER',
      },
      {
        fieldKey: 'twelfthPassingYear',
        label: 'Class 12 Passing Year',
        required: true,
        source: 'USER',
      },
    ];
  }

  async getFormSchema(): Promise<UniversalFormSchema> {
    return {
      serviceId: this.serviceId,
      serviceName: this.name,
      capabilitySlug: 'registration',
      sections: [
        { id: 'sec-personal', title: 'Personal Information', description: 'Verified from citizen Sanchay profile', order: 1 },
        { id: 'sec-exam', title: 'Examination & Paper Selection', description: 'Select sessions and test subjects', order: 2 },
        { id: 'sec-city', title: 'Exam City Preferences', description: 'Select preferred examination centers', order: 3 },
        { id: 'sec-academic', title: 'Academic Qualifications', description: 'Class 12 details for NTA eligibility', order: 4 },
      ],
      fields: [
        {
          fieldKey: 'fullName',
          label: 'Candidate Full Name',
          type: 'text',
          required: true,
          source: 'SANCHAY_PROFILE',
          section: 'sec-personal',
          description: 'Official name as per Matriculation certificate',
        },
        {
          fieldKey: 'dateOfBirth',
          label: 'Date of Birth',
          type: 'date',
          required: true,
          source: 'SANCHAY_PROFILE',
          section: 'sec-personal',
        },
        {
          fieldKey: 'gender',
          label: 'Gender',
          type: 'select',
          required: true,
          source: 'SANCHAY_PROFILE',
          section: 'sec-personal',
          options: [
            { label: 'Male', value: 'Male' },
            { label: 'Female', value: 'Female' },
            { label: 'Third Gender', value: 'Other' },
          ],
        },
        {
          fieldKey: 'category',
          label: 'Category / Caste',
          type: 'select',
          required: true,
          source: 'SANCHAY_PROFILE',
          section: 'sec-personal',
          options: [
            { label: 'General / Unreserved', value: 'General' },
            { label: 'General-EWS', value: 'GEN_EWS' },
            { label: 'OBC-NCL (Central List)', value: 'OBC_NCL' },
            { label: 'Scheduled Caste (SC)', value: 'SC' },
            { label: 'Scheduled Tribe (ST)', value: 'ST' },
          ],
        },
        {
          fieldKey: 'permanentAddress',
          label: 'Permanent Address',
          type: 'textarea',
          required: true,
          source: 'SANCHAY_PROFILE',
          section: 'sec-personal',
        },
        {
          fieldKey: 'examPaper',
          label: 'Applied Paper',
          type: 'select',
          required: true,
          source: 'USER_INPUT',
          section: 'sec-exam',
          options: [
            { label: 'Paper 1 (B.E. / B.Tech)', value: 'B.E./B.Tech' },
            { label: 'Paper 2A (B.Arch)', value: 'B.Arch' },
            { label: 'Paper 2B (B.Planning)', value: 'B.Planning' },
          ],
        },
        {
          fieldKey: 'examSession',
          label: 'Exam Session',
          type: 'select',
          required: true,
          source: 'USER_INPUT',
          section: 'sec-exam',
          options: [
            { label: 'Session 1 (January 2026)', value: 'SESSION_1' },
            { label: 'Session 2 (April 2026)', value: 'SESSION_2' },
            { label: 'Both Sessions', value: 'BOTH' },
          ],
        },
        {
          fieldKey: 'examCity1',
          label: 'Choice of Examination City 1',
          type: 'text',
          required: true,
          source: 'USER_INPUT',
          section: 'sec-city',
          placeholder: 'e.g. Noida, New Delhi, Bengaluru',
        },
        {
          fieldKey: 'examCity2',
          label: 'Choice of Examination City 2',
          type: 'text',
          required: false,
          source: 'USER_INPUT',
          section: 'sec-city',
          placeholder: 'e.g. Gurugram, Jaipur, Pune',
        },
        {
          fieldKey: 'twelfthPassingYear',
          label: 'Year of Passing Class 12 / Qualifying Exam',
          type: 'number',
          required: true,
          source: 'USER_INPUT',
          section: 'sec-academic',
          validation: { min: 2024, max: 2026, message: 'Class 12 year must be 2024, 2025, or 2026 for JEE Main 2026' },
        },
      ],
    };
  }

  async validateApplication(fields: Record<string, string>): Promise<FormValidationResult> {
    const errors: Record<string, string> = {};
    const warnings: string[] = [];

    if (!fields.fullName || fields.fullName.trim().length === 0) {
      errors.fullName = 'Candidate Full Name is required from Sanchay Profile.';
    }
    if (!fields.dateOfBirth) {
      errors.dateOfBirth = 'Date of birth is required.';
    }
    if (!fields.examPaper) {
      errors.examPaper = 'Please select the examination paper.';
    }
    if (!fields.examSession) {
      errors.examSession = 'Please select the examination session.';
    }
    if (!fields.examCity1 || fields.examCity1.trim().length === 0) {
      errors.examCity1 = 'Primary exam city choice is required.';
    }
    if (fields.twelfthPassingYear) {
      const yr = parseInt(fields.twelfthPassingYear, 10);
      if (isNaN(yr) || yr < 2024 || yr > 2026) {
        errors.twelfthPassingYear = 'Candidates must have passed Class 12 in 2024, 2025, or appearing in 2026.';
      }
    } else {
      errors.twelfthPassingYear = 'Class 12 passing year is required.';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      warnings,
    };
  }

  async executeAction(actionName: string, params: Record<string, any>, user?: any): Promise<any> {
    switch (actionName) {
      case 'check_eligibility': {
        const passingYear = parseInt(params.passingYear, 10);
        const isEligible = !isNaN(passingYear) && passingYear >= 2024 && passingYear <= 2026;
        return {
          service: 'jee-main',
          eligible: isEligible,
          criteria: {
            mandatorySubjects: ['Physics', 'Mathematics', 'Chemistry/Technical Vocational'],
            allowedYears: [2024, 2025, 2026],
          },
          message: isEligible
            ? `Candidate is eligible for JEE Main 2026 (Passing Year: ${passingYear}).`
            : `Passing year ${passingYear} does not meet the 3-consecutive-year criteria for JEE (Main) 2026.`,
        };
      }
      case 'open_section': {
        const section = params.section || 'bulletin';
        return {
          serviceSlug: 'jee-main',
          section,
          route: `/services/jee-main?section=${encodeURIComponent(section)}`,
        };
      }
      default:
        return { success: true, action: actionName, params };
    }
  }
}
