import type { AttendanceEvent } from './attendance';
import { calendarBounds, todayIso, type CalendarPeriod } from './calendar-period';

export function buildAttendanceReport(
  events: AttendanceEvent[],
  period: CalendarPeriod,
  anchor = todayIso()
) {
  const bounds = calendarBounds(period, anchor);
  const selectedEvents = events
    .filter((event) => event.date >= bounds.start && event.date <= bounds.end)
    .slice()
    .sort(
      (left, right) =>
        right.date.localeCompare(left.date) || right.startsAt.localeCompare(left.startsAt)
    );

  return {
    ...bounds,
    events: selectedEvents,
    distinctPeople: new Set(selectedEvents.flatMap((event) => event.attendeeIds)).size,
    individualCheckIns: selectedEvents.reduce(
      (total, event) => total + event.attendeeIds.length,
      0
    ),
    manualHeadcountTotal: selectedEvents.reduce(
      (total, event) => total + (event.manualHeadcount ?? 0),
      0
    )
  };
}

export type AttendanceReport = ReturnType<typeof buildAttendanceReport>;
