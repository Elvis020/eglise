import { writable } from 'svelte/store';
import { todayIso, validDate } from './calendar-period';

export type WelfareCategory = 'recurring-support' | 'emergency-assistance' | 'contributions';
export type Recurrence = 'weekly' | 'monthly';
export type WelfarePayment = { id: string; dueDate: string; amount: number; paidOn: string | null };
export type WelfareRecord = {
  id: string;
  category: WelfareCategory;
  personId: string;
  title: string;
  note: string;
  recurrence: Recurrence | null;
  startDate: string;
  endDate: string;
  payments: WelfarePayment[];
};
export type NewWelfareRecord = Omit<WelfareRecord, 'id' | 'payments'> & { amount: number };
export const welfareRecords = writable<WelfareRecord[]>([]);
export const welfareCategories: { value: WelfareCategory; label: string }[] = [
  { value: 'recurring-support', label: 'Recurring support' },
  { value: 'emergency-assistance', label: 'Emergency assistance' },
  { value: 'contributions', label: 'Contributions' }
];

export function money(amount: number): string {
  return new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' }).format(
    amount / 100
  );
}

export function parseAmount(value: string): number {
  if (!/^\d+(\.\d{1,2})?$/.test(value.trim())) return 0;

  const [whole, fraction = ''] = value.trim().split('.');
  const amount = Number(whole) * 100 + Number(fraction.padEnd(2, '0'));

  return Number.isSafeInteger(amount) ? amount : 0;
}

export function scheduleDates(start: string, end: string, recurrence: Recurrence): string[] {
  if (!validDate(start) || !validDate(end) || end < start)
    throw new Error('Choose a valid start and end date.');

  const first = new Date(`${start}T12:00:00Z`);
  const dates: string[] = [];

  for (let index = 0; index <= 600; index += 1) {
    const next = new Date(first);

    if (recurrence === 'weekly') next.setUTCDate(first.getUTCDate() + index * 7);
    else {
      next.setUTCDate(1);
      next.setUTCMonth(first.getUTCMonth() + index);
      const lastDay = new Date(
        Date.UTC(next.getUTCFullYear(), next.getUTCMonth() + 1, 0)
      ).getUTCDate();

      next.setUTCDate(Math.min(first.getUTCDate(), lastDay));
    }

    const date = next.toISOString().slice(0, 10);

    if (date > end) return dates;
    if (index === 600) throw new Error('Use a schedule with no more than 600 payments.');
    dates.push(date);
  }

  return dates;
}

export function addWelfareRecord(input: NewWelfareRecord): WelfareRecord {
  if (!input.personId || !input.title.trim())
    throw new Error('Choose a person and enter a support name or contribution description.');
  if (!Number.isSafeInteger(input.amount) || input.amount <= 0 || input.amount > 100_000_000_000)
    throw new Error(
      'Enter a positive amount of up to GHS 1,000,000,000 with at most two decimal places.'
    );
  if (!validDate(input.startDate)) throw new Error('Enter a valid date.');
  if (input.category !== 'recurring-support' && input.startDate > todayIso())
    throw new Error('A recorded payment cannot have a future date.');
  if (input.category === 'recurring-support' && !input.recurrence)
    throw new Error('Choose a recurrence.');

  const id = crypto.randomUUID();
  const dates =
    input.category === 'recurring-support'
      ? scheduleDates(input.startDate, input.endDate, input.recurrence!)
      : [input.startDate];
  const { amount, ...details } = input;
  const record: WelfareRecord = {
    ...details,
    id,
    payments: dates.map((dueDate) => ({
      id: `${id}-${dueDate}`,
      dueDate,
      amount,
      paidOn: input.category === 'recurring-support' ? null : input.startDate
    }))
  };

  welfareRecords.update((records) => [record, ...records]);

  return record;
}

export function paymentStatus(
  payment: WelfarePayment,
  today = todayIso()
): 'paid' | 'outstanding' | 'upcoming' {
  return payment.paidOn ? 'paid' : payment.dueDate <= today ? 'outstanding' : 'upcoming';
}

export function welfareTotals(records: WelfareRecord[], today = todayIso()) {
  const totals = { paid: 0, outstanding: 0, upcoming: 0 };

  for (const record of records) {
    for (const payment of record.payments) totals[paymentStatus(payment, today)] += payment.amount;
  }

  return totals;
}

export function markWelfarePaid(recordId: string, paymentId: string, paidOn: string): boolean {
  if (!validDate(paidOn) || paidOn > todayIso()) return false;

  let updated = false;

  welfareRecords.update((records) =>
    records.map((record) =>
      record.id !== recordId
        ? record
        : {
            ...record,
            payments: record.payments.map((payment) => {
              if (payment.id !== paymentId || payment.paidOn) return payment;
              updated = true;

              return { ...payment, paidOn };
            })
          }
    )
  );

  return updated;
}
