import {
  MINIMUM_AGE,
  type Person,
  type PersonKind,
  isValidPhone,
  personKindLabels
} from '../domain';

export const PEOPLE_IMPORT_TEMPLATE_VERSION = 'v1';
export const PEOPLE_IMPORT_TEMPLATE_FILE_NAME = `eglise-people-import-${PEOPLE_IMPORT_TEMPLATE_VERSION}.xlsx`;
export const PEOPLE_IMPORT_MAX_ROWS = 500;
export const PEOPLE_IMPORT_MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024;

export type PeopleImportField = 'name' | 'kind' | 'phone' | 'neighbourhood' | 'dateOfBirth';

export type PeopleImportColumn = {
  field: PeopleImportField;
  header: string;
  aliases: string[];
  required: boolean;
};

export const peopleImportColumns: PeopleImportColumn[] = [
  { field: 'name', header: 'Full name', aliases: ['Name'], required: true },
  { field: 'kind', header: 'Person type', aliases: ['Type', 'Kind'], required: true },
  { field: 'phone', header: 'Phone number', aliases: ['Phone', 'Mobile number'], required: false },
  {
    field: 'neighbourhood',
    header: 'Neighbourhood',
    aliases: ['Neighborhood', 'Area'],
    required: false
  },
  { field: 'dateOfBirth', header: 'Date of birth', aliases: ['DOB', 'Birth date'], required: true }
];

export const peopleImportTemplateExample = [
  'Example Person',
  'Regular attendee',
  '024 555 0142',
  'Adabraka',
  '01/01/1990'
];

export const acceptedPersonKinds = Object.keys(personKindLabels) as PersonKind[];

export type ImportState = 'ready' | 'review' | 'excluded';

export type PeopleImportRow = {
  rowNumber: number;
  name: string;
  kind: PersonKind | null;
  phone: string;
  neighbourhood: string;
  possibleMatchId: string | null;
  state: ImportState;
  reason: string;
};

export type RawPeopleImportRow = Record<PeopleImportField, unknown>;

export function normaliseImportHeader(value: unknown): string {
  return String(value ?? '')
    .trim()
    .toLocaleLowerCase()
    .replace(/\s+/g, ' ');
}

export function normalisePersonName(value: string): string {
  return value.trim().toLocaleLowerCase().replace(/\s+/g, ' ');
}

export function peopleByNormalisedName(records: Person[]): Map<string, Person> {
  const peopleByName = new Map<string, Person>();

  for (const person of records) {
    const name = normalisePersonName(person.name);

    if (name && !peopleByName.has(name)) {
      peopleByName.set(name, person);
    }
  }

  return peopleByName;
}

function text(value: unknown): string {
  return typeof value === 'string' || typeof value === 'number' ? String(value).trim() : '';
}

function personKind(value: unknown): PersonKind | null {
  const normalised = text(value).toLocaleLowerCase();

  if (normalised === 'person' || normalised === 'regular attendee') return 'person';
  if (normalised === 'visitor') return 'visitor';
  if (
    normalised === 'first-timer' ||
    normalised === 'first timer' ||
    normalised === 'first-time visitor'
  ) {
    return 'first-timer';
  }

  return null;
}

function dateFromExcelSerial(serial: number): Date | null {
  if (!Number.isFinite(serial) || serial < 1) return null;

  const date = new Date(Date.UTC(1899, 11, 30));

  date.setUTCDate(date.getUTCDate() + Math.floor(serial));

  return date;
}

function dateOfBirth(value: unknown): Date | null {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
  if (typeof value === 'number') return dateFromExcelSerial(value);

  const input = text(value);

  if (!input) return null;

  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(input);
  const british = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(input);
  const parts = iso
    ? [Number(iso[1]), Number(iso[2]), Number(iso[3])]
    : british
      ? [Number(british[3]), Number(british[2]), Number(british[1])]
      : null;

  if (!parts) return null;

  const parsed = new Date(parts[0], parts[1] - 1, parts[2]);

  return parsed.getFullYear() === parts[0] &&
    parsed.getMonth() === parts[1] - 1 &&
    parsed.getDate() === parts[2]
    ? parsed
    : null;
}

function meetsMinimumAge(value: Date, today: Date): boolean {
  const threshold = new Date(today.getFullYear() - MINIMUM_AGE, today.getMonth(), today.getDate());

  return value <= threshold;
}

export function validatePeopleImportRow(
  raw: RawPeopleImportRow,
  rowNumber: number,
  existingPeople: Person[],
  today = new Date(),
  existingPeopleByName = peopleByNormalisedName(existingPeople)
): PeopleImportRow {
  const name = text(raw.name);
  const kind = personKind(raw.kind);
  const phone = text(raw.phone);
  const neighbourhood = text(raw.neighbourhood);
  const dob = dateOfBirth(raw.dateOfBirth);

  if (!name) {
    return {
      rowNumber,
      name,
      kind,
      phone,
      neighbourhood,
      possibleMatchId: null,
      state: 'excluded',
      reason: 'Full name is required.'
    };
  }

  if (!kind) {
    return {
      rowNumber,
      name,
      kind,
      phone,
      neighbourhood,
      possibleMatchId: null,
      state: 'excluded',
      reason: 'Choose Regular attendee, Visitor, or First-time visitor.'
    };
  }

  if ((kind === 'person' && !phone) || (phone && !isValidPhone(phone))) {
    return {
      rowNumber,
      name,
      kind,
      phone,
      neighbourhood,
      possibleMatchId: null,
      state: 'excluded',
      reason: 'Phone number needs correction.'
    };
  }

  if (!dob || dob > today || !meetsMinimumAge(dob, today)) {
    return {
      rowNumber,
      name,
      kind,
      phone,
      neighbourhood,
      possibleMatchId: null,
      state: 'excluded',
      reason: 'Age requirements were not met.'
    };
  }

  const possibleMatch = existingPeopleByName.get(normalisePersonName(name));
  const matchesExistingName = Boolean(possibleMatch);

  return {
    rowNumber,
    name,
    kind,
    phone,
    neighbourhood,
    possibleMatchId: possibleMatch?.id ?? null,
    state: matchesExistingName ? 'review' : 'ready',
    reason: matchesExistingName ? 'A person with this name already exists.' : 'Ready to create.'
  };
}
