import { writable } from 'svelte/store';

import { initialPeople, type Person } from './domain';

function clonePeople(): Person[] {
  return initialPeople.map((person) => ({ ...person, membership: { ...person.membership } }));
}

export const people = writable<Person[]>(clonePeople());

export function addPerson(person: Person): void {
  people.update((records) => [...records, person]);
}

export function updatePerson(updated: Person): void {
  people.update((records) =>
    records.map((person) => (person.id === updated.id ? updated : person))
  );
}
