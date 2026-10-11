import { describe, expect, it } from 'vitest';

import { buildAttendanceReport } from '$lib/reports';
import type { AttendanceEvent } from '$lib/attendance';

const events: AttendanceEvent[] = [
  {
    id: 'completed-with-both-sources',
    typeId: 'sunday-service',
    typeLabel: 'Sunday service',
    label: 'Sunday service',
    date: '2026-10-05',
    startsAt: '07:00',
    leader: 'Service team',
    status: 'complete',
    attendeeIds: ['ama-owusu', 'kojo-boateng'],
    manualHeadcount: 42,
    history: []
  },
  {
    id: 'completed-individual-only',
    typeId: 'midweek-service',
    typeLabel: 'Midweek service',
    label: 'Midweek service',
    date: '2026-09-10',
    startsAt: '18:00',
    leader: 'Prayer team',
    status: 'complete',
    attendeeIds: ['ama-owusu'],
    manualHeadcount: null,
    history: []
  },
  {
    id: 'open-event',
    typeId: 'special-event',
    typeLabel: 'Special event',
    label: 'Open event',
    date: '2026-10-04',
    startsAt: '10:00',
    leader: 'Events team',
    status: 'open',
    attendeeIds: ['ama-owusu'],
    manualHeadcount: 9,
    history: []
  }
];

describe('attendance reporting', () => {
  it('counts distinct people across open and complete events, separately from headcounts', () => {
    const report = buildAttendanceReport(events, 'year', '2026-10-11');

    expect(report.distinctPeople).toBe(2);
    expect(report.individualCheckIns).toBe(4);
    expect(report.manualHeadcountTotal).toBe(51);
    expect(report.events).toHaveLength(3);
  });

  it('uses calendar boundaries rather than the latest event date', () => {
    const report = buildAttendanceReport(events, 'week', '2026-10-11');

    expect(report.start).toBe('2026-10-05');
    expect(report.end).toBe('2026-10-11');
    expect(report.events.map((event) => event.id)).toEqual(['completed-with-both-sources']);
    expect(buildAttendanceReport(events, 'month', '2026-08-01').events).toEqual([]);
  });
});
