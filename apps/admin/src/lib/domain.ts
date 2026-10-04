export const MINIMUM_AGE = 16;

export type Membership = {
  recognised: boolean;
  evidence: string;
  recognisedOn: string;
  correctionNote: string;
};

export type Person = {
  id: string;
  name: string;
  phone: string;
  neighbourhood: string;
  membership: Membership;
};

export type ImportRow = {
  name: string;
  phone: string;
  neighbourhood: string;
  eligibility: 'eligible' | 'below-age' | 'not-assessed';
  state: 'ready' | 'invalid' | 'review';
  note: string;
};

export const initialPeople: Person[] = [
  {
    id: 'ama-owusu',
    name: 'Ama Owusu',
    phone: '+233 24 555 0142',
    neighbourhood: 'Adabraka',
    membership: {
      recognised: true,
      evidence: 'Recognition register, 2025',
      recognisedOn: '2025-08-14',
      correctionNote: ''
    }
  },
  {
    id: 'kojo-boateng',
    name: 'Kojo Boateng',
    phone: '+233 24 555 0142',
    neighbourhood: 'Adabraka',
    membership: { recognised: false, evidence: '', recognisedOn: '', correctionNote: '' }
  },
  {
    id: 'elena-mensah',
    name: 'Elena Mensah',
    phone: '+44 7700 900 517',
    neighbourhood: 'East Legon',
    membership: {
      recognised: true,
      evidence: 'Membership form, 2024',
      recognisedOn: '2024-05-20',
      correctionNote: ''
    }
  },
  {
    id: 'yaw-asante',
    name: 'Yaw Asante',
    phone: '+233 20 778 0021',
    neighbourhood: 'Dansoman',
    membership: { recognised: false, evidence: '', recognisedOn: '', correctionNote: '' }
  }
];

export const importRows: ImportRow[] = [
  {
    name: 'Nana Badu',
    phone: '+233 27 461 1800',
    neighbourhood: 'Osu',
    eligibility: 'eligible',
    state: 'ready',
    note: 'Ready to create'
  },
  {
    name: 'Akosua Dapaah',
    phone: '+233 24 555 0142',
    neighbourhood: 'Adabraka',
    eligibility: 'eligible',
    state: 'ready',
    note: 'Valid shared phone; create separately'
  },
  {
    name: 'Abena Kusi',
    phone: '024 700',
    neighbourhood: 'Madina',
    eligibility: 'not-assessed',
    state: 'invalid',
    note: 'Phone number needs correction'
  },
  {
    name: 'Ama Owusu',
    phone: '+233 24 555 0142',
    neighbourhood: 'Adabraka',
    eligibility: 'eligible',
    state: 'review',
    note: 'Possible duplicate; review before creating'
  },
  {
    name: 'Kweku Lamptey',
    phone: '+233 55 181 2004',
    neighbourhood: 'Dansoman',
    eligibility: 'below-age',
    state: 'invalid',
    note: 'Below the minimum age; excluded'
  },
  {
    name: 'Mira Daniels',
    phone: '+1 202 555 0148',
    neighbourhood: 'Cantonments',
    eligibility: 'eligible',
    state: 'ready',
    note: 'At the minimum age; ready to create'
  }
];

export function normalisePhone(phone: string): string {
  return phone.trim().replace(/[\s()-]/g, '');
}

export function isValidPhone(phone: string): boolean {
  const normalised = normalisePhone(phone);

  return (
    /^0[25]\d{8}$/.test(normalised) ||
    /^\+233[25]\d{8}$/.test(normalised) ||
    /^\+[1-9]\d{7,14}$/.test(normalised)
  );
}

export function ageOn(dateOfBirth: Date, today: Date): number {
  const birthdayThisYear = new Date(
    today.getFullYear(),
    dateOfBirth.getMonth(),
    dateOfBirth.getDate()
  );

  return today.getFullYear() - dateOfBirth.getFullYear() - Number(today < birthdayThisYear);
}

export function isEligible(
  dateOfBirth: string,
  today = new Date(),
  minimumAge = MINIMUM_AGE
): boolean {
  const date = new Date(`${dateOfBirth}T00:00:00`);

  return Boolean(dateOfBirth) && !Number.isNaN(date.getTime()) && ageOn(date, today) >= minimumAge;
}

export function createId(name: string): string {
  const stem = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  return `${stem}-${Date.now()}`;
}

export function createPerson(name: string, phone: string, neighbourhood: string): Person {
  return {
    id: createId(name),
    name: name.trim(),
    phone: phone.trim(),
    neighbourhood: neighbourhood.trim(),
    membership: { recognised: false, evidence: '', recognisedOn: '', correctionNote: '' }
  };
}
