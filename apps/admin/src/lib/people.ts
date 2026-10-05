import { writable } from 'svelte/store';

import {
  createPerson,
  initialPeople,
  type JourneyEntry,
  type Person,
  type PersonDetails,
  type PersonKind,
  type PersonRecordHistoryEntry,
  type PersonRecordState
} from './domain';

function clonePeople(): Person[] {
  return initialPeople.map((person) => ({
    ...person,
    journey: person.journey.map((entry) => ({ ...entry })),
    recordHistory: person.recordHistory.map((entry) => ({ ...entry })),
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
    records.map((person) =>
      person.id === id
        ? {
            ...person,
            ...details,
            recordHistory: [
              ...person.recordHistory,
              {
                action: 'details-corrected',
                recordedOn: new Date().toISOString().slice(0, 10),
                note: 'Contact details updated.'
              }
            ]
          }
        : person
    )
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

function updateRecordState(
  id: string,
  state: PersonRecordState,
  entry: PersonRecordHistoryEntry
): void {
  people.update((records) =>
    records.map((person) =>
      person.id === id
        ? { ...person, recordState: state, recordHistory: [...person.recordHistory, entry] }
        : person
    )
  );
}

export function archivePerson(id: string, note: string): void {
  updateRecordState(id, 'archived', {
    action: 'archived',
    recordedOn: new Date().toISOString().slice(0, 10),
    note
  });
}

export function restorePerson(id: string): void {
  updateRecordState(id, 'active', {
    action: 'restored',
    recordedOn: new Date().toISOString().slice(0, 10),
    note: 'Record restored to the active directory.'
  });
}

export function transferPerson(id: string, destination: string, note: string): void {
  updateRecordState(id, 'transferred', {
    action: 'transferred',
    recordedOn: new Date().toISOString().slice(0, 10),
    note: `${destination.trim()}: ${note.trim()}`
  });
}

export function mergePerson(id: string, targetId: string, targetName: string, note: string): void {
  updateRecordState(id, 'merged', {
    action: 'merged',
    recordedOn: new Date().toISOString().slice(0, 10),
    note: `Reviewed against ${targetName.trim()}: ${note.trim()}`,
    relatedPersonId: targetId
  });
}
