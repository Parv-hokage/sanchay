import { Injectable, Logger } from '@nestjs/common';
import { MeService } from './me.service';

export enum FieldState {
  PROFILE_VERIFIED = 'PROFILE_VERIFIED',
  USER_PROVIDED = 'USER_PROVIDED',
  AI_EXTRACTED = 'AI_EXTRACTED',
  MISSING = 'MISSING',
  INVALID = 'INVALID',
  VALID = 'VALID',
  REQUIRES_CONFIRMATION = 'REQUIRES_CONFIRMATION',
  LOCKED = 'LOCKED',
}

export interface ServiceRequirementField {
  fieldKey: string;
  label: string;
  required: boolean;
  source: 'PROFILE' | 'USER' | 'DOCUMENT' | 'SYSTEM';
  description?: string;
  options?: string[];
}

export interface ResolvedFieldResult {
  fieldKey: string;
  label: string;
  value: string | null;
  source: string;
  state: FieldState;
  required: boolean;
  editable: boolean;
  verified: boolean;
}

export interface ProfileResolutionReport {
  userId: string;
  sanchayUid: string;
  isComplete: boolean;
  totalRequired: number;
  resolvedRequired: number;
  missingRequired: string[];
  fields: ResolvedFieldResult[];
}

@Injectable()
export class ProfileResolverService {
  private readonly logger = new Logger(ProfileResolverService.name);

  constructor(private readonly meService: MeService) {}

  /**
   * Authoritatively resolves a list of service requirements against the authenticated citizen's profile
   */
  async resolveRequirements(
    userId: string,
    requirements: ServiceRequirementField[],
    userSuppliedFields: Record<string, string> = {},
  ): Promise<ProfileResolutionReport> {
    const profile = await this.meService.getProfile(userId);
    const account = await this.meService.getAccountOverview(userId);

    const primaryAddress = account?.primaryAddress;
    const primaryContact = (account?.primaryContacts || [])[0];

    const resolvedFields: ResolvedFieldResult[] = [];
    const missingRequired: string[] = [];
    let totalRequired = 0;
    let resolvedRequired = 0;

    for (const req of requirements) {
      if (req.required) totalRequired++;

      let val: string | null = null;
      let state = FieldState.MISSING;
      let verified = false;
      let editable = req.source === 'USER';

      // 1. Check Profile Sources
      if (req.fieldKey === 'fullName' && profile?.fullName) {
        val = profile.fullName;
        state = FieldState.PROFILE_VERIFIED;
        verified = true;
        editable = false;
      } else if ((req.fieldKey === 'dateOfBirth' || req.fieldKey === 'dob') && profile?.dateOfBirth) {
        val = new Date(profile.dateOfBirth).toISOString().split('T')[0];
        state = FieldState.PROFILE_VERIFIED;
        verified = true;
        editable = false;
      } else if (req.fieldKey === 'gender' && profile?.gender) {
        val = profile.gender;
        state = FieldState.PROFILE_VERIFIED;
        verified = true;
        editable = false;
      } else if ((req.fieldKey === 'category' || req.fieldKey === 'caste') && profile?.category) {
        val = profile.category;
        state = FieldState.PROFILE_VERIFIED;
        verified = true;
        editable = false;
      } else if ((req.fieldKey === 'permanentAddress' || req.fieldKey === 'address') && primaryAddress) {
        val = `${primaryAddress.line1 || ''}, ${primaryAddress.line2 ? primaryAddress.line2 + ', ' : ''}${primaryAddress.city || ''}, ${primaryAddress.state || ''} - ${primaryAddress.pincode || ''}`.trim();
        state = FieldState.PROFILE_VERIFIED;
        verified = true;
        editable = false;
      } else if (req.fieldKey === 'state' && primaryAddress?.state) {
        val = primaryAddress.state;
        state = FieldState.PROFILE_VERIFIED;
        verified = true;
        editable = false;
      } else if (req.fieldKey === 'pincode' && primaryAddress?.pincode) {
        val = primaryAddress.pincode;
        state = FieldState.PROFILE_VERIFIED;
        verified = true;
        editable = false;
      } else if ((req.fieldKey === 'phone' || req.fieldKey === 'mobile' || req.fieldKey === 'phoneNumber') && primaryContact?.valueReference) {
        val = primaryContact.valueReference;
        state = FieldState.PROFILE_VERIFIED;
        verified = true;
        editable = false;
      }

      // 2. Check User-Supplied Inputs if not resolved from verified profile
      if (!val && userSuppliedFields[req.fieldKey]) {
        val = userSuppliedFields[req.fieldKey];
        state = FieldState.USER_PROVIDED;
        verified = false;
        editable = true;
      }

      // 3. Evaluate Completeness
      if (req.required) {
        if (val && val.trim().length > 0) {
          resolvedRequired++;
        } else {
          missingRequired.push(req.fieldKey);
        }
      }

      resolvedFields.push({
        fieldKey: req.fieldKey,
        label: req.label,
        value: val,
        source: state === FieldState.PROFILE_VERIFIED ? 'SANCHAY_PROFILE' : req.source,
        state,
        required: req.required,
        editable,
        verified,
      });
    }

    return {
      userId,
      sanchayUid: account?.sanchayUid || `uid-${userId}`,
      isComplete: missingRequired.length === 0,
      totalRequired,
      resolvedRequired,
      missingRequired,
      fields: resolvedFields,
    };
  }
}
