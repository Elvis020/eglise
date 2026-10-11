import { beforeEach, describe, expect, it } from 'vitest';
import { get } from 'svelte/store';
import {
  addWelfareRecord,
  markWelfarePaid,
  parseAmount,
  scheduleDates,
  welfareRecords,
  welfareTotals
} from '$lib/welfare';
import { calendarBounds, movePeriod, validDate } from '$lib/calendar-period';

beforeEach(() => welfareRecords.set([]));

describe('calendar boundaries', () => {
  it('handles Monday weeks crossing years and leap-year months', () => {
    expect(calendarBounds('week', '2027-01-01')).toMatchObject({
      start: '2026-12-28',
      end: '2027-01-03'
    });
    expect(calendarBounds('month', '2028-02-15').end).toBe('2028-02-29');
    expect(movePeriod('month', '2026-03-31', -1)).toBe('2026-02-01');
    expect(validDate('2026-02-30')).toBe(false);
  });
});

describe('welfare schedules and payments', () => {
  it('clamps each monthly occurrence without drifting after February', () => {
    expect(scheduleDates('2028-01-31', '2028-04-30', 'monthly')).toEqual([
      '2028-01-31',
      '2028-02-29',
      '2028-03-31',
      '2028-04-30'
    ]);
    expect(scheduleDates('2026-12-25', '2027-01-08', 'weekly')).toEqual([
      '2026-12-25',
      '2027-01-01',
      '2027-01-08'
    ]);
    expect(() => scheduleDates('2026-10-01', '2026-09-01', 'monthly')).toThrow();
  });

  it('distinguishes paid, due today and future payments and prevents duplicate payment', () => {
    const record = addWelfareRecord({
      category: 'recurring-support',
      personId: 'ama',
      title: 'Monthly support',
      note: '',
      amount: 1050,
      recurrence: 'monthly',
      startDate: '2026-08-11',
      endDate: '2026-11-11'
    });

    expect(welfareTotals([record], '2026-10-11')).toEqual({
      paid: 0,
      outstanding: 3150,
      upcoming: 1050
    });
    expect(markWelfarePaid(record.id, record.payments[0].id, '2026-08-12')).toBe(true);
    expect(markWelfarePaid(record.id, record.payments[0].id, '2026-08-13')).toBe(false);
    expect(markWelfarePaid(record.id, record.payments[1].id, '2099-01-01')).toBe(false);
    expect(welfareTotals(get(welfareRecords), '2026-10-11')).toEqual({
      paid: 1050,
      outstanding: 2100,
      upcoming: 1050
    });
  });

  it('keeps money in minor units and rejects imprecise values', () => {
    expect(parseAmount('10.10')).toBe(1010);
    expect(parseAmount('10.001')).toBe(0);
    expect(parseAmount('-1')).toBe(0);
    expect(parseAmount('NaN')).toBe(0);
  });
});
