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
  },
  {
    id: 'adwoa-nyarko',
    name: 'Adwoa Nyarko',
    phone: '+233 24 612 4301',
    neighbourhood: 'Osu',
    membership: {
      recognised: true,
      evidence: 'Recognition register, 2025',
      recognisedOn: '2025-11-09',
      correctionNote: ''
    }
  },
  {
    id: 'kwame-osei',
    name: 'Kwame Osei',
    phone: '+233 25 408 7126',
    neighbourhood: 'Madina',
    membership: { recognised: false, evidence: '', recognisedOn: '', correctionNote: '' }
  },
  {
    id: 'efua-danquah',
    name: 'Efua Danquah',
    phone: '+233 24 732 1905',
    neighbourhood: 'Labone',
    membership: { recognised: false, evidence: '', recognisedOn: '', correctionNote: '' }
  },
  {
    id: 'kofi-appiah',
    name: 'Kofi Appiah',
    phone: '+233 20 519 8430',
    neighbourhood: 'Kaneshie',
    membership: {
      recognised: true,
      evidence: 'Membership form, 2024',
      recognisedOn: '2024-10-02',
      correctionNote: ''
    }
  },
  {
    id: 'akua-sarpong',
    name: 'Akua Sarpong',
    phone: '+233 24 880 3614',
    neighbourhood: 'Nungua',
    membership: { recognised: false, evidence: '', recognisedOn: '', correctionNote: '' }
  },
  {
    id: 'nana-yeboah',
    name: 'Nana Yeboah',
    phone: '+233 25 661 9072',
    neighbourhood: 'Achimota',
    membership: { recognised: false, evidence: '', recognisedOn: '', correctionNote: '' }
  },
  {
    id: 'abena-osei',
    name: 'Abena Osei',
    phone: '+233 24 304 5186',
    neighbourhood: 'Tema Community 12',
    membership: {
      recognised: true,
      evidence: 'Recognition register, 2026',
      recognisedOn: '2026-01-18',
      correctionNote: ''
    }
  },
  {
    id: 'samuel-cole',
    name: 'Samuel Cole',
    phone: '+44 7700 900 518',
    neighbourhood: 'East Legon',
    membership: { recognised: false, evidence: '', recognisedOn: '', correctionNote: '' }
  },
  {
    id: 'esi-tetteh',
    name: 'Esi Tetteh',
    phone: '+233 20 446 8709',
    neighbourhood: 'Teshie',
    membership: { recognised: false, evidence: '', recognisedOn: '', correctionNote: '' }
  },
  {
    id: 'daniel-ansah',
    name: 'Daniel Ansah',
    phone: '+233 24 905 2176',
    neighbourhood: 'Dzorwulu',
    membership: {
      recognised: true,
      evidence: 'Membership form, 2025',
      recognisedOn: '2025-06-22',
      correctionNote: ''
    }
  },
  {
    id: 'comfort-adu',
    name: 'Comfort Adu',
    phone: '+233 25 277 4938',
    neighbourhood: 'Dansoman',
    membership: { recognised: false, evidence: '', recognisedOn: '', correctionNote: '' }
  },
  {
    id: 'michael-addai',
    name: 'Michael Addai',
    phone: '+1 202 555 0149',
    neighbourhood: 'Cantonments',
    membership: { recognised: false, evidence: '', recognisedOn: '', correctionNote: '' }
  },
  {
    id: 'gladys-baah',
    name: 'Gladys Baah',
    phone: '+233 24 641 0293',
    neighbourhood: 'Adenta',
    membership: {
      recognised: true,
      evidence: 'Recognition register, 2024',
      recognisedOn: '2024-08-07',
      correctionNote: ''
    }
  },
  {
    id: 'isaac-bediako',
    name: 'Isaac Bediako',
    phone: '+233 20 833 7451',
    neighbourhood: 'Spintex',
    membership: { recognised: false, evidence: '', recognisedOn: '', correctionNote: '' }
  },
  {
    id: 'mercy-quaye',
    name: 'Mercy Quaye',
    phone: '+233 24 512 6087',
    neighbourhood: 'La',
    membership: { recognised: false, evidence: '', recognisedOn: '', correctionNote: '' }
  },
  {
    id: 'josephine-arthur',
    name: 'Josephine Arthur',
    phone: '+233 25 934 2750',
    neighbourhood: 'Ashaley Botwe',
    membership: {
      recognised: true,
      evidence: 'Membership form, 2026',
      recognisedOn: '2026-02-14',
      correctionNote: ''
    }
  },
  {
    id: 'emmanuel-fosu',
    name: 'Emmanuel Fosu',
    phone: '+233 24 769 1502',
    neighbourhood: 'Kotobabi',
    membership: { recognised: false, evidence: '', recognisedOn: '', correctionNote: '' }
  },
  {
    id: 'ruth-mensah',
    name: 'Ruth Mensah',
    phone: '+233 20 395 8264',
    neighbourhood: 'Airport Residential',
    membership: { recognised: false, evidence: '', recognisedOn: '', correctionNote: '' }
  },
  {
    id: 'paul-kumi',
    name: 'Paul Kumi',
    phone: '+233 24 857 3046',
    neighbourhood: 'Sakumono',
    membership: {
      recognised: true,
      evidence: 'Recognition register, 2025',
      recognisedOn: '2025-03-29',
      correctionNote: ''
    }
  },
  {
    id: 'lydia-akwasi',
    name: 'Lydia Akwasi',
    phone: '+233 25 420 6819',
    neighbourhood: 'Haatso',
    membership: { recognised: false, evidence: '', recognisedOn: '', correctionNote: '' }
  },
  {
    id: 'peter-boateng',
    name: 'Peter Boateng',
    phone: '+233 24 236 9758',
    neighbourhood: 'Adabraka',
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
