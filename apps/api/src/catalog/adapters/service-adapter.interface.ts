import { ServiceRequirementField } from '../../me/profile-resolver.service';

export interface FormFieldSchema {
  fieldKey: string;
  label: string;
  type: 'text' | 'select' | 'number' | 'date' | 'file' | 'textarea' | 'radio';
  required: boolean;
  source: 'SANCHAY_PROFILE' | 'USER_INPUT' | 'DOCUMENT_VAULT';
  section: string;
  description?: string;
  placeholder?: string;
  options?: { label: string; value: string }[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

export interface FormSectionSchema {
  id: string;
  title: string;
  description?: string;
  order: number;
}

export interface UniversalFormSchema {
  serviceId: string;
  serviceName: string;
  capabilitySlug: string;
  sections: FormSectionSchema[];
  fields: FormFieldSchema[];
}

export interface FormValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  warnings: string[];
}

export interface ServiceAdapter {
  readonly serviceId: string;
  readonly name: string;
  readonly slug: string;
  readonly organization: string;
  readonly department: string;

  getRequirements(): Promise<ServiceRequirementField[]>;
  getFormSchema(): Promise<UniversalFormSchema>;
  validateApplication(fields: Record<string, string>): Promise<FormValidationResult>;
  executeAction(actionName: string, params: Record<string, any>, user?: any): Promise<any>;
}
