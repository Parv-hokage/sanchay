import { describe, it, expect } from 'vitest';
import {
  SanchayUIDSchema,
  PhoneNumberSchema,
  EmailSchema,
  PinCodeSchema,
  DateOfBirthSchema,
  SafeStringSchema,
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
});
