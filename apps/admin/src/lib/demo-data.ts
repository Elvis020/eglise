import type { AttendanceEvent } from './attendance';
import { todayIso } from './calendar-period';
import { initialPeople } from './domain';
import type { WelfareRecord } from './welfare';

// Shared directory identities keep reports, attendance and welfare connected.
const personIds = initialPeople.map((person) => person.id);

function offsetDate(anchor: string, days: number): string {
  const date = new Date(`${anchor}T12:00:00Z`);

  date.setUTCDate(date.getUTCDate() + days);

  return date.toISOString().slice(0, 10);
}

function monthStart(anchor: string, offset: number): string {
  const date = new Date(`${anchor}T12:00:00Z`);

  date.setUTCDate(1);
  date.setUTCMonth(date.getUTCMonth() + offset);

  return date.toISOString().slice(0, 10);
}

export function createDemoAttendanceEvents(anchor = todayIso()): AttendanceEvent[] {
  const offsets = [0, 1, 3, 7, 10, 14, 17, 21, 24, 28, 35, 42, 49, 60, 75, 90, 120, 180, 370, 400];

  return offsets.map((days, index) => {
    const date = offsetDate(anchor, -days);
    const weekday = new Date(`${date}T12:00:00Z`).getUTCDay();
    const isSunday = weekday === 0;
    const typeId = isSunday ? 'sunday-service' : index % 3 ? 'midweek-service' : 'special-event';
    const typeLabel = isSunday ? 'Sunday service' : index % 3 ? 'Midweek service' : 'Special event';
    const label = isSunday
      ? 'Sunday worship'
      : index % 3
        ? 'Prayer and fellowship'
        : 'Community gathering';
    const attendeeIds = personIds.filter((_, personIndex) => (personIndex + index) % 4 !== 0);
    const status = index === 0 ? 'open' : 'complete';
    const recordedAt = `${date}T12:00:00.000Z`;

    return {
      id: `demo-attendance-${index + 1}`,
      typeId,
      typeLabel,
      label: `${label} · demo ${index + 1}`,
      date,
      startsAt: isSunday ? '09:00' : '18:00',
      leader: 'Demo service team',
      status,
      attendeeIds,
      manualHeadcount: index % 3 === 0 ? attendeeIds.length + 8 : null,
      history: [
        {
          action: 'Created',
          recordedAt,
          note: 'Synthetic demo event with linked directory attendees.'
        },
        ...(status === 'complete'
          ? [{ action: 'Event completed', recordedAt, note: 'Demo attendance entry completed.' }]
          : [])
      ]
    };
  });
}

export function createDemoWelfareRecords(anchor = todayIso()): WelfareRecord[] {
  const definitions = [
    {
      personId: 'akua-sarpong',
      title: 'Weekly household support',
      category: 'recurring-support',
      amount: 15000,
      recurrence: 'weekly'
    },
    {
      personId: 'nana-yeboah',
      title: 'Monthly education support',
      category: 'recurring-support',
      amount: 30000,
      recurrence: 'monthly'
    },
    {
      personId: 'comfort-adu',
      title: 'Monthly transport support',
      category: 'recurring-support',
      amount: 20000,
      recurrence: 'monthly'
    },
    {
      personId: 'efua-danquah',
      title: 'Emergency household assistance',
      category: 'emergency-assistance',
      amount: 45000,
      recurrence: null
    },
    {
      personId: 'kofi-appiah',
      title: 'Emergency transport assistance',
      category: 'emergency-assistance',
      amount: 12500,
      recurrence: null
    },
    {
      personId: 'esi-tetteh',
      title: 'Emergency accommodation assistance',
      category: 'emergency-assistance',
      amount: 60000,
      recurrence: null
    },
    {
      personId: 'kojo-boateng',
      title: 'Welfare fund contribution',
      category: 'contributions',
      amount: 10000,
      recurrence: null
    },
    {
      personId: 'adwoa-nyarko',
      title: 'Welfare fund contribution',
      category: 'contributions',
      amount: 25000,
      recurrence: null
    },
    {
      personId: 'kwame-osei',
      title: 'Community support contribution',
      category: 'contributions',
      amount: 7550,
      recurrence: null
    },
    {
      personId: 'elena-mensah',
      title: 'Education fund contribution',
      category: 'contributions',
      amount: 50000,
      recurrence: null
    },
    {
      personId: 'yaw-asante',
      title: 'Welfare fund contribution',
      category: 'contributions',
      amount: 15000,
      recurrence: null
    }
  ] satisfies (Pick<WelfareRecord, 'personId' | 'title' | 'category' | 'recurrence'> & {
    amount: number;
  })[];

  return definitions.map((definition, index) => {
    if (!personIds.includes(definition.personId)) {
      throw new Error(`Demo welfare references a missing directory person: ${definition.personId}`);
    }

    const { amount, ...details } = definition;
    const id = `demo-welfare-${index + 1}`;
    const dates = definition.recurrence
      ? [-2, -1, 0, 1, 2].map((offset) =>
          definition.recurrence === 'weekly'
            ? offsetDate(anchor, offset * 7)
            : monthStart(anchor, offset)
        )
      : [offsetDate(anchor, -(index - 3) * 3)];

    return {
      ...details,
      id,
      note: 'Synthetic demo record for exploring the connected welfare workflow.',
      startDate: dates[0],
      endDate: dates[dates.length - 1],
      payments: dates.map((dueDate, paymentIndex) => ({
        id: `${id}-${dueDate}`,
        dueDate,
        amount,
        paidOn: !definition.recurrence || paymentIndex === 0 ? dueDate : null
      }))
    };
  });
}
