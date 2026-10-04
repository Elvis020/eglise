import { describe, expect, it } from 'vitest';

import { initialPeople } from '../src/lib/domain';
import { summarisePeople } from '../src/lib/people-summary';

describe('people summary', () => {
  it('summarises the directory without invented fields', () => {
    expect(summarisePeople(initialPeople)).toEqual({
      total: 25,
      visitors: 1,
      firstTimers: 1
    });
  });

  it('returns empty counts when there are no people', () => {
    expect(summarisePeople([])).toEqual({
      total: 0,
      visitors: 0,
      firstTimers: 0
    });
  });
});
