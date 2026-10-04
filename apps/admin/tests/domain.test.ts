import { describe, expect, it } from 'vitest';

import { ageOn, importRows, isEligible, isValidPhone, normalisePhone } from '../src/lib/domain';

describe('person pilot rules', () => {
  it('accepts valid Ghanaian, international, and shared phone numbers', () => {
    expect(isValidPhone('024 555 0142')).toBe(true);
    expect(isValidPhone('+233 24 555 0142')).toBe(true);
    expect(isValidPhone('+44 7700 900 517')).toBe(true);
    expect(normalisePhone('+233 (24) 555 0142')).toBe('+233245550142');
  });

  it('rejects malformed phone numbers', () => {
    expect(isValidPhone('024 700')).toBe(false);
  });

  it('accepts people at the age boundary and excludes people below it', () => {
    const today = new Date('2026-09-30T12:00:00');

    expect(ageOn(new Date('2010-09-30T00:00:00'), today)).toBe(16);
    expect(isEligible('2010-09-30', today)).toBe(true);
    expect(isEligible('2010-10-01', today)).toBe(false);
  });

  it('keeps deterministic import states for invalid, duplicate-candidate, and age cases', () => {
    expect(importRows.find((row) => row.name === 'Abena Kusi')?.state).toBe('invalid');
    expect(importRows.find((row) => row.name === 'Ama Owusu')?.state).toBe('review');
    expect(importRows.find((row) => row.name === 'Kweku Lamptey')?.eligibility).toBe('below-age');
  });
});
