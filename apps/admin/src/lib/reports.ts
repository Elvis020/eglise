import type { AttendanceEvent } from './attendance';

export type AttendanceReportPeriod = 'all' | 'last-7-days' | 'last-30-days';

export const attendanceReportPeriods: Array<{
  value: AttendanceReportPeriod;
  label: string;
}> = [
  { value: 'all', label: 'All completed events' },
  { value: 'last-7-days', label: 'Latest 7 days of completed events' },
  { value: 'last-30-days', label: 'Latest 30 days of completed events' }
];

export type AttendanceReport = {
  completedEvents: AttendanceEvent[];
  individualCheckIns: number;
  manualHeadcountEvents: number;
  manualHeadcountTotal: number;
  openEvents: AttendanceEvent[];
  periodEnd: string | undefined;
};

function compareDatesDescending(left: AttendanceEvent, right: AttendanceEvent): number {
  return right.date.localeCompare(left.date) || right.startsAt.localeCompare(left.startsAt);
}

function periodStart(periodEnd: string, period: AttendanceReportPeriod): string | undefined {
  if (period === 'all') return undefined;

  const date = new Date(`${periodEnd}T12:00:00Z`);

  date.setUTCDate(date.getUTCDate() - (period === 'last-7-days' ? 6 : 29));

  return date.toISOString().slice(0, 10);
}

export function buildAttendanceReport(
  events: AttendanceEvent[],
  period: AttendanceReportPeriod
): AttendanceReport {
  const completedEvents = events
    .filter((event) => event.status === 'complete')
    .sort(compareDatesDescending);
  const periodEnd = completedEvents[0]?.date;
  const start = periodEnd ? periodStart(periodEnd, period) : undefined;
  const eventsInPeriod = completedEvents.filter((event) => !start || event.date >= start);
  const openEvents = events
    .filter((event) => event.status === 'open' && (!start || event.date >= start))
    .sort(compareDatesDescending);

  return {
    completedEvents: eventsInPeriod,
    individualCheckIns: eventsInPeriod.reduce(
      (total, event) => total + event.attendeeIds.length,
      0
    ),
    manualHeadcountEvents: eventsInPeriod.filter((event) => event.manualHeadcount !== null).length,
    manualHeadcountTotal: eventsInPeriod.reduce(
      (total, event) => total + (event.manualHeadcount ?? 0),
      0
    ),
    openEvents,
    periodEnd
  };
}
