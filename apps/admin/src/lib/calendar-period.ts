export type CalendarPeriod = 'week' | 'month' | 'year';

export function todayIso(): string {
  const date = new Date();

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function validDate(value: string): boolean {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    Number.isFinite(Date.parse(value)) &&
    new Date(`${value}T12:00:00Z`).toISOString().slice(0, 10) === value
  );
}

export function calendarSelection(params: URLSearchParams): {
  period: CalendarPeriod;
  anchor: string;
} {
  const value = params.get('period');
  const anchor = params.get('date') ?? '';

  return {
    period: value === 'week' || value === 'year' ? value : 'month',
    anchor: validDate(anchor) ? anchor : todayIso()
  };
}

export function calendarBounds(
  period: CalendarPeriod,
  anchor: string
): { start: string; end: string; label: string } {
  const date = new Date(`${validDate(anchor) ? anchor : todayIso()}T12:00:00Z`);
  const start = new Date(date);
  const end = new Date(date);

  if (period === 'week') {
    start.setUTCDate(date.getUTCDate() - ((date.getUTCDay() + 6) % 7));
    end.setTime(start.getTime());
    end.setUTCDate(start.getUTCDate() + 6);
  } else if (period === 'month') {
    start.setUTCDate(1);
    end.setUTCMonth(date.getUTCMonth() + 1, 0);
  } else {
    start.setUTCMonth(0, 1);
    end.setUTCMonth(11, 31);
  }

  const format = new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC'
  });

  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
    label: `${format.format(start)} – ${format.format(end)}`
  };
}

export function movePeriod(period: CalendarPeriod, anchor: string, direction: number): string {
  const date = new Date(`${calendarBounds(period, anchor).start}T12:00:00Z`);

  if (period === 'week') date.setUTCDate(date.getUTCDate() + direction * 7);
  else if (period === 'month') date.setUTCMonth(date.getUTCMonth() + direction);
  else date.setUTCFullYear(date.getUTCFullYear() + direction);

  return date.toISOString().slice(0, 10);
}
