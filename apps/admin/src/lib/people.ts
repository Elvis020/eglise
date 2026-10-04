import { writable } from 'svelte/store';

import {
  createPerson,
  initialPeople,
  type JourneyEntry,
  type Person,
  type PersonDetails,
  type PersonKind
} from './domain';

function clonePeople(): Person[] {
  return initialPeople.map((person) => ({
    ...person,
    journey: person.journey.map((entry) => ({ ...entry })),
    membership: {
      ...person.membership,
      history: person.membership.history.map((entry) => ({ ...entry }))
    }
  }));
}

export const people = writable<Person[]>(clonePeople());

export function addPerson(person: Person): void {
  people.update((records) => [...records, person]);
}

export type NewPerson = {
  name: string;
  kind: PersonKind;
  phone: string;
  neighbourhood: string;
};

function importedId(name: string, usedIds: Set<string>): string {
  const stem =
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'person';
  let suffix = 1;
  let id = `${stem}-imported`;

  while (usedIds.has(id)) {
    suffix += 1;
    id = `${stem}-imported-${suffix}`;
  }

  return id;
}

export function addPeople(newPeople: NewPerson[]): Person[] {
  let created: Person[] = [];

  people.update((records) => {
    const usedIds = new Set(records.map((person) => person.id));

    created = newPeople.map((details) => {
      const person = createPerson(details.name, details.phone, details.neighbourhood, details.kind);
      const id = importedId(person.name, usedIds);

      usedIds.add(id);

      return { ...person, id };
    });

    return [...records, ...created];
  });

  return created;
}

export function updatePerson(updated: Person): void {
  people.update((records) =>
    records.map((person) => (person.id === updated.id ? updated : person))
  );
}

export function updatePersonDetails(id: string, details: PersonDetails): void {
  people.update((records) =>
    records.map((person) => (person.id === id ? { ...person, ...details } : person))
  );
}

export function recordJourneyStage(id: string, entry: JourneyEntry): void {
  people.update((records) =>
    records.map((person) =>
      person.id === id
        ? { ...person, kind: entry.stage, journey: [...person.journey, entry] }
        : person
    )
  );
}
