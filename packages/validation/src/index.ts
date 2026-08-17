import { z } from 'zod';
import { AddressType, CitizenCategory, ContactType, Gender, IdentityProviderType } from '@sanchay/types';

/**
 * UUID v4 / Sanchay UID Validator
 * Decoupled from Aadhaar, Phone, and Email per ADR-007
 */
export const SanchayUIDSchema = z
  .string()
  .uuid({ message: 'Invalid Sanchay UID format. Must be a valid UUID v4.' });

export const PhoneNumberSchema = z
  .string()
  .regex(/^[6-9]\d{9}$/, { message: 'Invalid Indian 10-digit mobile number format.' });

export const EmailSchema = z
  .string()
  .email({ message: 'Invalid email address format.' })
  .max(255);

export const PinCodeSchema = z
  .string()
  .regex(/^[1-9][0-9]{5}$/, { message: 'Invalid Indian 6-digit postal PIN code.' });

export const DateOfBirthSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'Date of birth must be formatted as YYYY-MM-DD.' });

export const SafeString = (maxLen = 500) =>
  z
    .string()
    .trim()
    .min(1)
    .max(maxLen)
    .transform((val) => val.replace(/<[^>]*>?/gm, ''));

export const SafeStringSchema = SafeString(500);

// ==========================================
// Phase 1 Request Validation Schemas
// ==========================================

export const LoginRequestSchema = z.object({
  provider: z.nativeEnum(IdentityProviderType),
  identifier: z.string().trim().min(1, 'Identifier is required').max(255),
});

export const VerifyOtpRequestSchema = z.object({
  sessionChallengeId: z.string().uuid('Invalid session challenge format'),
  otp: z.string().trim().min(4, 'OTP must be at least 4 digits').max(8, 'OTP must not exceed 8 digits'),
});

export const UpdateProfileSchema = z.object({
  fullName: SafeString(100).optional(),
  dateOfBirth: DateOfBirthSchema.optional(),
  gender: z
    .preprocess((val) => {
      if (typeof val === 'string') {
        const trimmed = val.trim().toUpperCase();
        if (trimmed === 'MALE' || trimmed === 'FEMALE' || trimmed === 'OTHER') return trimmed;
      }
      return val;
    }, z.nativeEnum(Gender, { errorMap: () => ({ message: "Gender value is invalid. Expected 'MALE', 'FEMALE', or 'OTHER'." }) }))
    .optional(),
  category: z
    .preprocess((val) => {
      if (val === '' || val === null || val === undefined) return null;
      if (typeof val === 'string') {
        const normalized = val.trim().toUpperCase().replace(/[-\s]/g, '_');
        if (normalized === 'GENERAL' || normalized === 'GEN') return CitizenCategory.GENERAL;
        if (normalized === 'EWS' || normalized === 'GENERAL_EWS') return CitizenCategory.EWS;
        if (normalized === 'OBC_NCL' || normalized === 'OBC') return CitizenCategory.OBC_NCL;
        if (normalized === 'SC') return CitizenCategory.SC;
        if (normalized === 'ST') return CitizenCategory.ST;
      }
      return val;
    }, z.nativeEnum(CitizenCategory, { errorMap: () => ({ message: "Category value is invalid. Expected 'GENERAL', 'EWS', 'OBC_NCL', 'SC', or 'ST'." }) }).nullable())
    .optional(),
  preferredLanguage: z.string().trim().min(2).max(10).optional(),
});

export const CreateAddressSchema = z.object({
  addressType: z.nativeEnum(AddressType).default(AddressType.PERMANENT),
  addressLine1: SafeString(200),
  addressLine2: SafeString(200).optional(),
  city: SafeString(100),
  district: SafeString(100),
  state: SafeString(100),
  postalCode: PinCodeSchema,
  country: z.string().trim().default('India'),
  isPrimary: z.boolean().default(false),
});

export const UpdateAddressSchema = z.object({
  addressType: z.nativeEnum(AddressType).optional(),
  addressLine1: SafeString(200).optional(),
  addressLine2: SafeString(200).optional(),
  city: SafeString(100).optional(),
  district: SafeString(100).optional(),
  state: SafeString(100).optional(),
  postalCode: PinCodeSchema.optional(),
  country: z.string().trim().optional(),
  isPrimary: z.boolean().optional(),
});

export const AddContactSchema = z.object({
  type: z.nativeEnum(ContactType),
  value: z.string().trim().min(1).max(255),
  isPrimary: z.boolean().default(false),
}).refine((data) => {
  if (data.type === ContactType.PHONE) {
    return PhoneNumberSchema.safeParse(data.value).success;
  }
  if (data.type === ContactType.EMAIL) {
    return EmailSchema.safeParse(data.value).success;
  }
  return true;
}, {
  message: 'Contact value does not match the specified contact type format.',
  path: ['value'],
});

export const CreateIdentityLinkSchema = z.object({
  provider: z.nativeEnum(IdentityProviderType),
  externalSubjectReference: z.string().trim().min(1).max(255),
  serviceId: z.string().uuid().optional(),
});

export const GrantConsentSchema = z.object({
  serviceId: z.string().uuid('Invalid service ID format'),
  purpose: SafeString(255),
  scope: z.array(z.string().trim().min(1)).min(1, 'At least one scope item is required'),
});
