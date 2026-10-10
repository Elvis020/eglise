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
  it('keeps individual check-ins and manual headcounts as separate sources', () => {
    const report = buildAttendanceReport(events, 'all');

    expect(report.individualCheckIns).toBe(3);
    expect(report.manualHeadcountTotal).toBe(42);
    expect(report.manualHeadcountEvents).toBe(1);
    expect(report.completedEvents.map((event) => event.id)).toEqual([
      'completed-with-both-sources',
      'completed-individual-only'
    ]);
  });

  it('excludes open events and restricts the latest reporting window by completed dates', () => {
    const report = buildAttendanceReport(events, 'last-7-days');

    expect(report.completedEvents.map((event) => event.id)).toEqual([
      'completed-with-both-sources'
    ]);
    expect(report.individualCheckIns).toBe(2);
    expect(report.manualHeadcountTotal).toBe(42);
    expect(report.openEvents.map((event) => event.id)).toEqual(['open-event']);
  });
});
