import { describe, it, expect } from 'vitest';
import {
  SanchayUIDSchema,
  PhoneNumberSchema,
  EmailSchema,
  PinCodeSchema,
  DateOfBirthSchema,
  SafeStringSchema,
  UpdateProfileSchema,
} from './index';

describe('Validation Schemas', () => {
  it('should validate valid UUID v4 as Sanchay UID', () => {
    const validUuid = '123e4567-e89b-12d3-a456-426614174000';
    expect(SanchayUIDSchema.safeParse(validUuid).success).toBe(true);
  });

  it('should reject invalid Sanchay UID', () => {
    expect(SanchayUIDSchema.safeParse('not-a-uuid').success).toBe(false);
  });

  it('should validate Indian 10-digit mobile numbers', () => {
    expect(PhoneNumberSchema.safeParse('9876543210').success).toBe(true);
    expect(PhoneNumberSchema.safeParse('1234567890').success).toBe(false);
  });

  it('should validate email addresses', () => {
    expect(EmailSchema.safeParse('citizen@sanchay.gov.in').success).toBe(true);
    expect(EmailSchema.safeParse('invalid-email').success).toBe(false);
  });

  it('should validate Indian postal pin codes', () => {
    expect(PinCodeSchema.safeParse('110001').success).toBe(true);
    expect(PinCodeSchema.safeParse('010001').success).toBe(false);
  });

  it('should validate date of birth format YYYY-MM-DD', () => {
    expect(DateOfBirthSchema.safeParse('2000-01-15').success).toBe(true);
    expect(DateOfBirthSchema.safeParse('15-01-2000').success).toBe(false);
  });

  it('should sanitize HTML tags from user strings', () => {
    const result = SafeStringSchema.parse('<script>alert("hack")</script>Hello');
    expect(result).toBe('alert("hack")Hello');
  });

  describe('UpdateProfileSchema Validation', () => {
    it('1. Valid gender profile update: validates canonical and case-insensitive gender', () => {
      expect(UpdateProfileSchema.parse({ gender: 'MALE' }).gender).toBe('MALE');
      expect(UpdateProfileSchema.parse({ gender: 'FEMALE' }).gender).toBe('FEMALE');
      expect(UpdateProfileSchema.parse({ gender: 'OTHER' }).gender).toBe('OTHER');
      expect(UpdateProfileSchema.parse({ gender: 'Male' }).gender).toBe('MALE');
      expect(UpdateProfileSchema.parse({ gender: 'female' }).gender).toBe('FEMALE');
    });

    it('2. Valid category profile update: validates canonical and normalized categories', () => {
      expect(UpdateProfileSchema.parse({ category: 'GENERAL' }).category).toBe('GENERAL');
      expect(UpdateProfileSchema.parse({ category: 'EWS' }).category).toBe('EWS');
      expect(UpdateProfileSchema.parse({ category: 'OBC_NCL' }).category).toBe('OBC_NCL');
      expect(UpdateProfileSchema.parse({ category: 'OBC-NCL' }).category).toBe('OBC_NCL');
      expect(UpdateProfileSchema.parse({ category: 'SC' }).category).toBe('SC');
      expect(UpdateProfileSchema.parse({ category: 'ST' }).category).toBe('ST');
      expect(UpdateProfileSchema.parse({ category: null }).category).toBe(null);
      expect(UpdateProfileSchema.parse({ category: '' }).category).toBe(null);
    });

    it('3. Category-only PATCH: allows minimal payload without other fields', () => {
      const res = UpdateProfileSchema.parse({ category: 'OBC_NCL' });
      expect(res).toEqual({ category: 'OBC_NCL' });
      expect(res.gender).toBeUndefined();
      expect(res.fullName).toBeUndefined();
    });

    it('4. Invalid gender returns validation error', () => {
      const res = UpdateProfileSchema.safeParse({ gender: 'INVALID_GENDER' });
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.errors[0].message).toContain('Gender value is invalid');
      }
    });

    it('5. Invalid category returns validation error', () => {
      const res = UpdateProfileSchema.safeParse({ category: 'INVALID_CATEGORY' });
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.errors[0].message).toContain('Category value is invalid');
      }
    });
  });
});
