import { describe, expect, it } from 'vitest';

import {
  ageOn,
  createPerson,
  initialPeople,
  isEligible,
  isOnOrBefore,
  isValidPhone,
  normalisePhone,
  validatePersonDetails
} from '../src/lib/domain';
import {
  peopleByNormalisedName,
  validatePeopleImportRow
} from '../src/lib/imports/people-import-definition';
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

  it('validates the editable person details without treating a shared phone as a duplicate', () => {
    expect(
      validatePersonDetails({
        name: 'Ama Owusu',
        kind: 'person',
        phone: '+233 24 555 0142',
        neighbourhood: 'Adabraka'
      })
    ).toEqual({});
    expect(
      validatePersonDetails({ name: '', kind: 'person', phone: '024 700', neighbourhood: '' })
    ).toEqual({
      name: "Enter the person's name.",
      phone: 'Enter a Ghanaian mobile number or an international E.164 number.'
    });

    expect(
      validatePersonDetails({ name: 'Mira Daniels', kind: 'visitor', phone: '', neighbourhood: '' })
    ).toEqual({});
  });

  it('accepts people at the age boundary and excludes people below it', () => {
    const today = new Date('2026-09-30T12:00:00');

    expect(ageOn(new Date('2010-09-30T00:00:00'), today)).toBe(16);
    expect(isEligible('2010-09-30', today)).toBe(true);
    expect(isEligible('2010-10-01', today)).toBe(false);
  });

  it('validates import rows without retaining dates of birth', () => {
    const ready = validatePeopleImportRow(
      {
        name: 'Mira Daniels',
        kind: 'Visitor',
        phone: '+233 24 555 0142',
        neighbourhood: 'Cantonments',
        dateOfBirth: 40356
      },
      2,
      initialPeople,
      new Date('2026-09-30T12:00:00')
    );
    const duplicate = validatePeopleImportRow(
      {
        name: '  Ama   Owusu ',
        kind: 'Visitor',
        phone: '',
        neighbourhood: '',
        dateOfBirth: '01/01/1990'
      },
      3,
      initialPeople,
      new Date('2026-09-30T12:00:00')
    );
    const underAge = validatePeopleImportRow(
      {
        name: 'Kweku Lamptey',
        kind: 'Person',
        phone: '024 555 0142',
        neighbourhood: '',
        dateOfBirth: '2010-10-01'
      },
      4,
      initialPeople,
      new Date('2026-09-30T12:00:00')
    );

    expect(ready.state).toBe('ready');
    expect(duplicate.state).toBe('review');
    expect(duplicate.possibleMatchId).toBe('ama-owusu');
    expect(underAge).toMatchObject({ state: 'excluded', reason: 'Age requirements were not met.' });
    expect(ready).not.toHaveProperty('dateOfBirth');
  });

  it('reuses a normalized person index when checking a batch for duplicates', () => {
    const index = peopleByNormalisedName(initialPeople);
    const duplicate = validatePeopleImportRow(
      {
        name: '  Ama   Owusu ',
        kind: 'Visitor',
        phone: '',
        neighbourhood: '',
        dateOfBirth: '01/01/1990'
      },
      3,
      initialPeople,
      new Date('2026-09-30T12:00:00'),
      index
    );

    expect(index.get('ama owusu')?.id).toBe('ama-owusu');
    expect(duplicate.possibleMatchId).toBe('ama-owusu');
  });

  it('starts people without a membership milestone and keeps the membership dates in order', () => {
    const person = createPerson('New person', '+233 24 555 0142', 'Adabraka');

    expect(person.membership).toEqual({
      recognised: false,
      assimilationCompletedOn: '',
      evidence: '',
      recognisedOn: '',
      correctionNote: '',
      history: []
    });
    expect(person.recordState).toBe('active');
    expect(person.recordHistory).toMatchObject([
      { action: 'created', note: 'Person record created.' }
    ]);
    expect(createPerson('New visitor', '', '', 'visitor').kind).toBe('visitor');
    expect(isOnOrBefore('2026-09-01', '2026-09-01')).toBe(true);
    expect(isOnOrBefore('2026-09-01', '2026-09-30')).toBe(true);
    expect(isOnOrBefore('2026-09-30', '2026-09-01')).toBe(false);
  });
});

describe('directory pagination', () => {
  it('keeps a truthful first page for the 25-person sample fixture', () => {
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
