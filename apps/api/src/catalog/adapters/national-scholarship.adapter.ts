import { Injectable } from '@nestjs/common';
import {
  ServiceAdapter,
  UniversalFormSchema,
  FormValidationResult,
} from './service-adapter.interface';
import { ServiceRequirementField } from '../../me/profile-resolver.service';

@Injectable()
export class NationalScholarshipAdapter implements ServiceAdapter {
  readonly serviceId = 'srv-nsp-001';
  readonly name = 'National Merit Scholarship Scheme 2026';
  readonly slug = 'national-scholarship';
  readonly organization = 'Ministry of Social Justice and Empowerment';
  readonly department = 'Department of Social Justice and Empowerment';

  async getRequirements(): Promise<ServiceRequirementField[]> {
    return [
      { fieldKey: 'fullName', label: 'Beneficiary Full Name', required: true, source: 'PROFILE' },
      { fieldKey: 'dateOfBirth', label: 'Date of Birth', required: true, source: 'PROFILE' },
      { fieldKey: 'gender', label: 'Gender', required: true, source: 'PROFILE' },
      { fieldKey: 'category', label: 'Reservation Category', required: true, source: 'PROFILE' },
      { fieldKey: 'permanentAddress', label: 'Permanent Domicile Address', required: true, source: 'PROFILE' },
      { fieldKey: 'state', label: 'Domicile State', required: true, source: 'PROFILE' },
      { fieldKey: 'pincode', label: 'PIN Code', required: true, source: 'PROFILE' },
      { fieldKey: 'phone', label: 'Registered Mobile Number', required: true, source: 'PROFILE' },
      {
        fieldKey: 'annualFamilyIncome',
        label: 'Annual Family Income (in INR)',
        required: true,
        source: 'USER',
      },
      {
        fieldKey: 'currentInstitutionName',
        label: 'Current College / University Name',
        required: true,
        source: 'USER',
      },
      {
        fieldKey: 'courseDegree',
        label: 'Current Degree / Course Name',
        required: true,
        source: 'USER',
        options: ['B.Tech / B.E.', 'MBBS', 'B.Sc / B.Com / B.A.', 'M.Tech / M.E.', 'MBA / PGDM'],
      },
      {
        fieldKey: 'class12Percentage',
        label: 'Class 12 Aggregate Percentage',
        required: true,
        source: 'USER',
      },
    ];
  }

  async getFormSchema(): Promise<UniversalFormSchema> {
    return {
      serviceId: this.serviceId,
      serviceName: this.name,
      capabilitySlug: 'application',
      sections: [
        { id: 'sec-applicant', title: 'Applicant Details', description: 'Loaded directly from verified Sanchay profile', order: 1 },
        { id: 'sec-income', title: 'Income & Domicile', description: 'Financial eligibility criteria', order: 2 },
        { id: 'sec-academic', title: 'Academic Enrollment', description: 'Current institution and previous performance', order: 3 },
      ],
      fields: [
        {
          fieldKey: 'fullName',
          label: 'Applicant Full Name',
          type: 'text',
          required: true,
          source: 'SANCHAY_PROFILE',
          section: 'sec-applicant',
        },
        {
          fieldKey: 'dateOfBirth',
          label: 'Date of Birth',
          type: 'date',
          required: true,
          source: 'SANCHAY_PROFILE',
          section: 'sec-applicant',
        },
        {
          fieldKey: 'gender',
          label: 'Gender',
          type: 'select',
          required: true,
          source: 'SANCHAY_PROFILE',
          section: 'sec-applicant',
          options: [
            { label: 'Male', value: 'Male' },
            { label: 'Female', value: 'Female' },
            { label: 'Other', value: 'Other' },
          ],
        },
        {
          fieldKey: 'category',
          label: 'Social Category',
          type: 'select',
          required: true,
          source: 'SANCHAY_PROFILE',
          section: 'sec-applicant',
          options: [
            { label: 'General / Unreserved', value: 'General' },
            { label: 'OBC-NCL', value: 'OBC_NCL' },
            { label: 'SC', value: 'SC' },
            { label: 'ST', value: 'ST' },
            { label: 'EWS', value: 'GEN_EWS' },
          ],
        },
        {
          fieldKey: 'permanentAddress',
          label: 'Permanent Address',
          type: 'textarea',
          required: true,
          source: 'SANCHAY_PROFILE',
          section: 'sec-applicant',
        },
        {
          fieldKey: 'annualFamilyIncome',
          label: 'Annual Family Gross Income (INR)',
          type: 'number',
          required: true,
          source: 'USER_INPUT',
          section: 'sec-income',
          placeholder: 'e.g. 250000',
          validation: { min: 0, max: 800000, message: 'Gross annual income must not exceed INR 8,00,000 for scholarship eligibility' },
        },
        {
          fieldKey: 'currentInstitutionName',
          label: 'College / Institute Name',
          type: 'text',
          required: true,
          source: 'USER_INPUT',
          section: 'sec-academic',
          placeholder: 'e.g. Indian Institute of Technology Delhi',
        },
        {
          fieldKey: 'courseDegree',
          label: 'Enrolled Course / Degree',
          type: 'select',
          required: true,
          source: 'USER_INPUT',
          section: 'sec-academic',
          options: [
            { label: 'B.Tech / B.E.', value: 'B.Tech' },
            { label: 'MBBS / Medical', value: 'MBBS' },
            { label: 'B.Sc / B.Com / B.A.', value: 'UG_GENERAL' },
            { label: 'M.Tech / M.Sc / M.A.', value: 'PG_GENERAL' },
          ],
        },
        {
          fieldKey: 'class12Percentage',
          label: 'Class 12 Score (%)',
          type: 'number',
          required: true,
          source: 'USER_INPUT',
          section: 'sec-academic',
          placeholder: 'e.g. 88.5',
          validation: { min: 60, max: 100, message: 'Minimum 60% in Class 12 is required for merit consideration' },
        },
      ],
    };
  }

  async validateApplication(fields: Record<string, string>): Promise<FormValidationResult> {
    const errors: Record<string, string> = {};
    const warnings: string[] = [];

    if (!fields.fullName || fields.fullName.trim().length === 0) {
      errors.fullName = 'Full name is required from Sanchay Profile.';
    }
    if (!fields.annualFamilyIncome) {
      errors.annualFamilyIncome = 'Annual family income is required.';
    } else {
      const inc = parseFloat(fields.annualFamilyIncome);
      if (isNaN(inc) || inc > 800000) {
        errors.annualFamilyIncome = 'Family income must be equal to or less than Rs. 8,00,000 per annum.';
      }
    }
    if (!fields.currentInstitutionName || fields.currentInstitutionName.trim().length === 0) {
      errors.currentInstitutionName = 'Institution name is required.';
    }
    if (!fields.class12Percentage) {
      errors.class12Percentage = 'Class 12 percentage is required.';
    } else {
      const pct = parseFloat(fields.class12Percentage);
      if (isNaN(pct) || pct < 60) {
        errors.class12Percentage = 'Minimum 60% marks in Class 12 required.';
      }
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
        const income = parseFloat(params.income || params.annualFamilyIncome);
        const marks = parseFloat(params.marks || params.class12Percentage);
        const incomeOk = !isNaN(income) && income <= 800000;
        const marksOk = !isNaN(marks) && marks >= 60;
        const eligible = incomeOk && marksOk;

        return {
          service: 'national-scholarship',
          eligible,
          criteria: {
            maxIncome: 800000,
            minMarks: 60,
          },
          message: eligible
            ? 'Candidate meets both income (<= 8 Lakh) and academic (>= 60%) merit criteria.'
            : 'Candidate does not meet scholarship eligibility thresholds.',
        };
      }
      default:
        return { success: true, action: actionName, params };
    }
  }
}
