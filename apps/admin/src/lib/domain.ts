export const MINIMUM_AGE = 16;

export type Membership = {
  recognised: boolean;
  assimilationCompletedOn: string;
  evidence: string;
  recognisedOn: string;
  correctionNote: string;
  history: MembershipHistoryEntry[];
};

export type PersonKind = 'person' | 'visitor' | 'first-timer';

export type JourneyEntry = {
  stage: PersonKind;
  recordedOn: string;
  note: string;
};

export type MembershipHistoryEntry = {
  action: 'recognised' | 'corrected';
  recordedOn: string;
  note: string;
};

export type PersonRecordState = 'active' | 'archived' | 'transferred' | 'merged';

export const personRecordStateLabels: Record<PersonRecordState, string> = {
  active: 'Active',
  archived: 'Archived',
  transferred: 'Transferred',
  merged: 'Merged into another record'
};

export type PersonRecordHistoryEntry = {
  action: 'created' | 'details-corrected' | 'archived' | 'restored' | 'transferred' | 'merged';
  recordedOn: string;
  note: string;
  relatedPersonId?: string;
};

export const personKindLabels: Record<PersonKind, string> = {
  person: 'Regular attendee',
  visitor: 'Visitor',
  'first-timer': 'First-time visitor'
};

export const journeyStages: PersonKind[] = ['visitor', 'first-timer', 'person'];

export function nextJourneyStage(stage: PersonKind): PersonKind | undefined {
  return journeyStages.at(journeyStages.indexOf(stage) + 1);
}

export type Person = {
  id: string;
  name: string;
  kind: PersonKind;
  phone: string;
  neighbourhood: string;
  journey: JourneyEntry[];
  membership: Membership;
  recordState: PersonRecordState;
  recordHistory: PersonRecordHistoryEntry[];
};

export type PersonDetails = Pick<Person, 'name' | 'kind' | 'phone' | 'neighbourhood'>;

export type PersonDetailsErrors = Partial<Record<keyof PersonDetails, string>>;

type InitialMembership = Omit<Membership, 'history'>;
type InitialPerson = Omit<
  Person,
  'kind' | 'journey' | 'membership' | 'recordState' | 'recordHistory'
> & {
  membership: InitialMembership;
};

const initialPeopleRecords: InitialPerson[] = [
  {
    id: 'ama-owusu',
    name: 'Ama Owusu',
    phone: '+233 24 555 0142',
    neighbourhood: 'Adabraka',
    membership: {
      recognised: true,
      assimilationCompletedOn: '2025-08-01',
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
    membership: {
      recognised: false,
      assimilationCompletedOn: '',
      evidence: '',
      recognisedOn: '',
      correctionNote: ''
    }
  },
  {
    id: 'elena-mensah',
    name: 'Elena Mensah',
    phone: '+44 7700 900 517',
    neighbourhood: 'East Legon',
    membership: {
      recognised: true,
      assimilationCompletedOn: '2024-05-06',
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
    membership: {
      recognised: false,
      assimilationCompletedOn: '',
      evidence: '',
      recognisedOn: '',
      correctionNote: ''
    }
  },
  {
    id: 'adwoa-nyarko',
    name: 'Adwoa Nyarko',
    phone: '+233 24 612 4301',
    neighbourhood: 'Osu',
    membership: {
      recognised: true,
      assimilationCompletedOn: '2025-10-28',
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
    membership: {
      recognised: false,
      assimilationCompletedOn: '',
      evidence: '',
      recognisedOn: '',
      correctionNote: ''
    }
  },
  {
    id: 'efua-danquah',
    name: 'Efua Danquah',
    phone: '+233 24 732 1905',
    neighbourhood: 'Labone',
    membership: {
      recognised: false,
      assimilationCompletedOn: '',
      evidence: '',
      recognisedOn: '',
      correctionNote: ''
    }
  },
  {
    id: 'kofi-appiah',
    name: 'Kofi Appiah',
    phone: '+233 20 519 8430',
    neighbourhood: 'Kaneshie',
    membership: {
      recognised: true,
      assimilationCompletedOn: '2024-09-18',
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
    membership: {
      recognised: false,
      assimilationCompletedOn: '',
      evidence: '',
      recognisedOn: '',
      correctionNote: ''
    }
  },
  {
    id: 'nana-yeboah',
    name: 'Nana Yeboah',
    phone: '+233 25 661 9072',
    neighbourhood: 'Achimota',
    membership: {
      recognised: false,
      assimilationCompletedOn: '',
      evidence: '',
      recognisedOn: '',
      correctionNote: ''
    }
  },
  {
    id: 'abena-osei',
    name: 'Abena Osei',
    phone: '+233 24 304 5186',
    neighbourhood: 'Tema Community 12',
    membership: {
      recognised: true,
      assimilationCompletedOn: '2026-01-04',
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
    membership: {
      recognised: false,
      assimilationCompletedOn: '',
      evidence: '',
      recognisedOn: '',
      correctionNote: ''
    }
  },
  {
    id: 'esi-tetteh',
    name: 'Esi Tetteh',
    phone: '+233 20 446 8709',
    neighbourhood: 'Teshie',
    membership: {
      recognised: false,
      assimilationCompletedOn: '',
      evidence: '',
      recognisedOn: '',
      correctionNote: ''
    }
  },
  {
    id: 'daniel-ansah',
    name: 'Daniel Ansah',
    phone: '+233 24 905 2176',
    neighbourhood: 'Dzorwulu',
    membership: {
      recognised: true,
      assimilationCompletedOn: '2025-06-07',
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
    membership: {
      recognised: false,
      assimilationCompletedOn: '',
      evidence: '',
      recognisedOn: '',
      correctionNote: ''
    }
  },
  {
    id: 'michael-addai',
    name: 'Michael Addai',
    phone: '+1 202 555 0149',
    neighbourhood: 'Cantonments',
    membership: {
      recognised: false,
      assimilationCompletedOn: '',
      evidence: '',
      recognisedOn: '',
      correctionNote: ''
    }
  },
  {
    id: 'gladys-baah',
    name: 'Gladys Baah',
    phone: '+233 24 641 0293',
    neighbourhood: 'Adenta',
    membership: {
      recognised: true,
      assimilationCompletedOn: '2024-07-19',
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
    membership: {
      recognised: false,
      assimilationCompletedOn: '',
      evidence: '',
      recognisedOn: '',
      correctionNote: ''
    }
  },
  {
    id: 'mercy-quaye',
    name: 'Mercy Quaye',
    phone: '+233 24 512 6087',
    neighbourhood: 'La',
    membership: {
      recognised: false,
      assimilationCompletedOn: '',
      evidence: '',
      recognisedOn: '',
      correctionNote: ''
    }
  },
  {
    id: 'josephine-arthur',
    name: 'Josephine Arthur',
    phone: '+233 25 934 2750',
    neighbourhood: 'Ashaley Botwe',
    membership: {
      recognised: true,
      assimilationCompletedOn: '2026-01-31',
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
    membership: {
      recognised: false,
      assimilationCompletedOn: '',
      evidence: '',
      recognisedOn: '',
      correctionNote: ''
    }
  },
  {
    id: 'ruth-mensah',
    name: 'Ruth Mensah',
    phone: '+233 20 395 8264',
    neighbourhood: 'Airport Residential',
    membership: {
      recognised: false,
      assimilationCompletedOn: '',
      evidence: '',
      recognisedOn: '',
      correctionNote: ''
    }
  },
  {
    id: 'paul-kumi',
    name: 'Paul Kumi',
    phone: '+233 24 857 3046',
    neighbourhood: 'Sakumono',
    membership: {
      recognised: true,
      assimilationCompletedOn: '2025-03-15',
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
    membership: {
      recognised: false,
      assimilationCompletedOn: '',
      evidence: '',
      recognisedOn: '',
      correctionNote: ''
    }
  },
  {
    id: 'peter-boateng',
    name: 'Peter Boateng',
    phone: '+233 24 236 9758',
    neighbourhood: 'Adabraka',
    membership: {
      recognised: false,
      assimilationCompletedOn: '',
      evidence: '',
      recognisedOn: '',
      correctionNote: ''
    }
  }
];

export const initialPeople: Person[] = initialPeopleRecords.map((person) => {
  const kind =
    person.id === 'akua-sarpong'
      ? 'visitor'
      : person.id === 'nana-yeboah'
        ? 'first-timer'
        : 'person';
  const startingDate = person.membership.recognisedOn || '2026-01-01';

  return {
    ...person,
    kind,
    journey: [{ stage: kind, recordedOn: startingDate, note: '' }],
    membership: {
      ...person.membership,
      history: person.membership.recognised
        ? [
            {
              action: 'recognised',
              recordedOn: person.membership.recognisedOn,
              note: person.membership.evidence
            }
          ]
        : []
    },
    recordState: 'active',
    recordHistory: [
      {
        action: 'created',
        recordedOn: startingDate,
        note: 'Initial sample record.'
      }
    ]
  };
});

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

export function validatePersonDetails(details: PersonDetails): PersonDetailsErrors {
  const errors: PersonDetailsErrors = {};

  if (!details.name.trim()) errors.name = "Enter the person's name.";
  if (details.kind === 'person' && !details.phone.trim()) {
    errors.phone = 'Enter a Ghanaian mobile number or an international E.164 number.';
  } else if (details.phone.trim() && !isValidPhone(details.phone)) {
    errors.phone = 'Enter a Ghanaian mobile number or an international E.164 number.';
  }

  return errors;
}

export function isOnOrBefore(firstDate: string, secondDate: string): boolean {
  return Boolean(firstDate && secondDate) && firstDate <= secondDate;
}

export function formatRecordDate(date: string): string {
  if (!date) return '';

  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC'
  }).format(new Date(`${date}T00:00:00Z`));
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

export function createPerson(
  name: string,
  phone: string,
  neighbourhood: string,
  kind: PersonKind = 'person'
): Person {
  return {
    id: createId(name),
    name: name.trim(),
    kind,
    phone: phone.trim(),
    neighbourhood: neighbourhood.trim(),
    journey: [
      {
        stage: kind,
        recordedOn: new Date().toISOString().slice(0, 10),
        note: ''
      }
    ],
    membership: {
      recognised: false,
      assimilationCompletedOn: '',
      evidence: '',
      recognisedOn: '',
      correctionNote: '',
      history: []
    },
    recordState: 'active',
    recordHistory: [
      {
        action: 'created',
        recordedOn: new Date().toISOString().slice(0, 10),
        note: 'Person record created.'
      }
    ]
  };
}
