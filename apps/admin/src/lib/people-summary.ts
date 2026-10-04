import type { Person } from './domain';

export type PeopleSummary = {
  total: number;
  visitors: number;
  firstTimers: number;
};

export function summarisePeople(records: Person[]): PeopleSummary {
  return {
    total: records.length,
    visitors: records.filter((person) => person.kind === 'visitor').length,
    firstTimers: records.filter((person) => person.kind === 'first-timer').length
  };
}
