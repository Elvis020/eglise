import { type Person, type PersonKind, isValidPhone, personKindLabels } from '../domain';

export const PEOPLE_IMPORT_TEMPLATE_VERSION = 'v2';
export const PEOPLE_IMPORT_TEMPLATE_FILE_NAME = `eglise-people-import-${PEOPLE_IMPORT_TEMPLATE_VERSION}.xlsx`;
export const PEOPLE_IMPORT_MAX_ROWS = 500;
export const PEOPLE_IMPORT_MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024;

export type PeopleImportField = 'name' | 'kind' | 'phone' | 'neighbourhood';

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
  }
];

export const peopleImportTemplateExample = [
  'Example Person',
  'Regular attendee',
  '024 555 0142',
  'Adabraka'
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

export function validatePeopleImportRow(
  raw: RawPeopleImportRow,
  rowNumber: number,
  existingPeople: Person[],
  existingPeopleByName = peopleByNormalisedName(existingPeople)
): PeopleImportRow {
  const name = text(raw.name);
  const kind = personKind(raw.kind);
  const phone = text(raw.phone);
  const neighbourhood = text(raw.neighbourhood);

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
