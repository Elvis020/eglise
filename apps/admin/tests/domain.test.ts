import { describe, expect, it } from 'vitest';

import {
  ageOn,
  importRows,
  initialPeople,
  isEligible,
  isValidPhone,
  normalisePhone
} from '../src/lib/domain';
import {
  DIRECTORY_PAGE_SIZE,
  clampPage,
  pageCount,
  pageItems,
  pageSummary
} from '../src/lib/directory';

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

describe('directory pagination', () => {
  it('keeps a truthful first page for the 25-person fictional fixture', () => {
    expect(DIRECTORY_PAGE_SIZE).toBe(10);
    expect(initialPeople).toHaveLength(25);
    expect(pageCount(initialPeople.length, DIRECTORY_PAGE_SIZE)).toBe(3);
    expect(pageSummary(initialPeople.length, 1, DIRECTORY_PAGE_SIZE)).toBe('1–10 of 25');
    expect(pageItems(initialPeople, 1, DIRECTORY_PAGE_SIZE)).toHaveLength(10);
    expect(initialPeople.find((person) => person.id === 'ama-owusu')?.phone).toBe(
      initialPeople.find((person) => person.id === 'kojo-boateng')?.phone
    );
  });

  it('clamps stale page numbers and slices later pages without inventing records', () => {
    const records = Array.from({ length: 26 }, (_, index) => index + 1);

    expect(clampPage(9, records.length, 10)).toBe(3);
    expect(pageItems(records, 3, 10)).toEqual([21, 22, 23, 24, 25, 26]);
    expect(pageSummary(records.length, 3, 10)).toBe('21–26 of 26');
  });
});
