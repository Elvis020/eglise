import { describe, expect, it } from 'vitest';
import { get } from 'svelte/store';

import {
  addAttendee,
  addAttendanceEventType,
  attendanceEvents,
  attendanceEventTypes,
  createAttendanceEvent,
  renameAttendanceEventType,
  retireAttendanceEventType,
  removeAttendee,
  setManualHeadcount
} from '$lib/attendance';

describe('attendance discovery rules', () => {
  it('keeps individual attendance duplicate-safe within one event', () => {
    const event = createAttendanceEvent({
      typeId: 'sunday-service',
      label: 'Duplicate-safe test',
      date: '2026-10-05',
      startsAt: '07:00',
      leader: 'Service team'
    });

    expect(addAttendee(event.id, 'ama-owusu')).toBe(true);
    expect(addAttendee(event.id, 'ama-owusu')).toBe(false);
    expect(removeAttendee(event.id, 'ama-owusu')).toBe(true);
  });

  it('records manual headcounts separately and rejects invalid totals', () => {
    const event = createAttendanceEvent({
      typeId: 'midweek-service',
      label: 'Manual count test',
      date: '2026-10-04',
      startsAt: '18:00',
      leader: 'Service team'
    });

    expect(setManualHeadcount(event.id, 42)).toBe(true);
    expect(setManualHeadcount(event.id, -1)).toBe(false);
  });

  it('keeps the agreed starting service types editable', () => {
    const added = addAttendanceEventType('Prayer meeting');

    expect(added?.name).toBe('Prayer meeting');
    expect(get(attendanceEventTypes).map((type) => type.name)).toContain('Prayer meeting');
  });

  it('preserves an event type label after changes and blocks retired types', () => {
    const event = createAttendanceEvent({
      typeId: 'special-event',
      label: 'Type history test',
      date: '2026-10-03',
      startsAt: '17:00',
      leader: 'Service team'
    });

    expect(renameAttendanceEventType('special-event', 'Church gathering')).toBe(true);
    expect(retireAttendanceEventType('special-event')).toBe(true);
    expect(get(attendanceEvents).find((entry) => entry.id === event.id)?.typeLabel).toBe(
      'Special event'
    );
    expect(() =>
      createAttendanceEvent({
        typeId: 'special-event',
        label: 'Retired type test',
        date: '2026-10-02',
        startsAt: '17:00',
        leader: 'Service team'
      })
    ).toThrow('Choose an active service or event type.');
  });
});
