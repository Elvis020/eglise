import { describe, expect, it } from 'vitest';

import { createDemoAttendanceEvents, createDemoWelfareRecords } from '$lib/demo-data';
import { initialPeople } from '$lib/domain';
import { buildAttendanceReport } from '$lib/reports';
import { scheduleDates, welfareTotals } from '$lib/welfare';
import { validDate } from '$lib/calendar-period';

const ids = new Set(initialPeople.map((person) => person.id));

// Exercise calendar boundaries as well as an ordinary demo day.
for (const anchor of ['2026-10-13', '2027-01-01', '2028-02-29']) {
  describe(`connected demo data at ${anchor}`, () => {
    it('links events to directory people and derives distinct report totals', () => {
      const events = createDemoAttendanceEvents(anchor);
      const report = buildAttendanceReport(events, 'month', anchor);
      const currentWeek = buildAttendanceReport(events, 'week', anchor);

      expect(events).toHaveLength(20);
      expect(new Set(events.map((event) => event.id)).size).toBe(events.length);
      expect(currentWeek.distinctPeople).toBeGreaterThan(0);
      expect(report.distinctPeople).toBe(
        new Set(report.events.flatMap((event) => event.attendeeIds)).size
      );
      expect(events.some((event) => event.date.slice(0, 4) < anchor.slice(0, 4))).toBe(true);
      expect(events.some((event) => event.status === 'complete')).toBe(true);
      expect(events.some((event) => event.status === 'open')).toBe(true);
      expect(events.reduce((sum, event) => sum + event.attendeeIds.length, 0)).toBeGreaterThan(
        ids.size
      );

      for (const event of events) {
        expect(validDate(event.date)).toBe(true);
        expect(event.date <= anchor).toBe(true);
        expect(event.attendeeIds.length).toBeGreaterThan(1);
        expect(new Set(event.attendeeIds).size).toBe(event.attendeeIds.length);
        expect(event.attendeeIds.every((id) => ids.has(id))).toBe(true);
      }
    });

    it('links welfare to attendees with valid schedules and all payment states', () => {
      const records = createDemoWelfareRecords(anchor);
      const attendees = new Set(
        createDemoAttendanceEvents(anchor).flatMap((event) => event.attendeeIds)
      );
      const totals = welfareTotals(records, anchor);

      expect(records).toHaveLength(11);
      expect(new Set(records.map((record) => record.category)).size).toBe(3);
      expect(totals.paid).toBeGreaterThan(0);
      expect(totals.outstanding).toBeGreaterThan(0);
      expect(totals.upcoming).toBeGreaterThan(0);

      for (const record of records) {
        expect(ids.has(record.personId) && attendees.has(record.personId)).toBe(true);
        if (record.recurrence) {
          expect(record.payments.map((payment) => payment.dueDate)).toEqual(
            scheduleDates(record.startDate, record.endDate, record.recurrence)
          );
        }
        for (const payment of record.payments) {
          expect(validDate(payment.dueDate)).toBe(true);
          expect(Number.isSafeInteger(payment.amount) && payment.amount > 0).toBe(true);
          expect(payment.paidOn === null || payment.paidOn <= anchor).toBe(true);
        }
      }
    });

    it('returns fresh independent fixtures on reload', () => {
      const events = createDemoAttendanceEvents(anchor);
      const records = createDemoWelfareRecords(anchor);

      events[0].attendeeIds.length = 0;
      records[0].payments[0].amount = 0;
      expect(createDemoAttendanceEvents(anchor)[0].attendeeIds.length).toBeGreaterThan(0);
      expect(createDemoWelfareRecords(anchor)[0].payments[0].amount).toBeGreaterThan(0);
    });
  });
}
