import { writable } from 'svelte/store';

export type AttendanceEventStatus = 'open' | 'complete';

export type AttendanceEventType = {
  id: string;
  name: string;
  retired: boolean;
};

export type AttendanceHistoryEntry = {
  action: string;
  recordedAt: string;
  note: string;
};

export type AttendanceEvent = {
  id: string;
  typeId: string;
  typeLabel: string;
  label: string;
  date: string;
  startsAt: string;
  leader: string;
  status: AttendanceEventStatus;
  attendeeIds: string[];
  manualHeadcount: number | null;
  history: AttendanceHistoryEntry[];
};

export type NewAttendanceEvent = Pick<
  AttendanceEvent,
  'typeId' | 'label' | 'date' | 'startsAt' | 'leader'
>;

const initialTypes: AttendanceEventType[] = [
  { id: 'sunday-service', name: 'Sunday service', retired: false },
  { id: 'midweek-service', name: 'Midweek service', retired: false },
  { id: 'special-event', name: 'Special event', retired: false }
];

const initialEvents: AttendanceEvent[] = [
  {
    id: 'sample-sunday-service',
    typeId: 'sunday-service',
    typeLabel: 'Sunday service',
    label: 'Sunday service — sample',
    date: '2026-10-05',
    startsAt: '07:00',
    leader: 'Service team',
    status: 'open',
    attendeeIds: [],
    manualHeadcount: null,
    history: [
      {
        action: 'Created',
        recordedAt: '2026-10-05T07:00:00.000Z',
        note: 'Synthetic example event created for the attendance discovery workspace.'
      }
    ]
  }
];

export const attendanceEventTypes = writable<AttendanceEventType[]>(
  initialTypes.map((type) => ({ ...type }))
);
export const attendanceEvents = writable<AttendanceEvent[]>(initialEvents.map(cloneEvent));

function cloneEvent(event: AttendanceEvent): AttendanceEvent {
  return {
    ...event,
    attendeeIds: [...event.attendeeIds],
    history: event.history.map((entry) => ({ ...entry }))
  };
}

function eventId(label: string): string {
  const stem =
    label
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'attendance-event';

  return `${stem}-${Date.now().toString(36)}`;
}

function typeId(name: string): string {
  const stem =
    name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'event-type';

  return `${stem}-${Date.now().toString(36)}`;
}

function history(action: string, note: string): AttendanceHistoryEntry {
  return { action, note, recordedAt: new Date().toISOString() };
}

export function createAttendanceEvent(input: NewAttendanceEvent): AttendanceEvent {
  let created: AttendanceEvent | undefined;

  attendanceEventTypes.update((types) => {
    const selectedType = types.find((type) => type.id === input.typeId);

    if (!selectedType || selectedType.retired) {
      throw new Error('Choose an active service or event type.');
    }

    attendanceEvents.update((events) => {
      const label = input.label.trim() || selectedType.name;

      created = {
        id: eventId(label),
        typeId: selectedType.id,
        typeLabel: selectedType.name,
        label,
        date: input.date,
        startsAt: input.startsAt,
        leader: input.leader.trim(),
        status: 'open',
        attendeeIds: [],
        manualHeadcount: null,
        history: [history('Created', 'Event opened for attendance entry.')]
      };

      return [created!, ...events];
    });

    return types;
  });

  return created!;
}

export function addAttendee(eventId: string, personId: string): boolean {
  let added = false;

  attendanceEvents.update((events) =>
    events.map((event) => {
      if (event.id !== eventId || event.status !== 'open' || event.attendeeIds.includes(personId)) {
        return event;
      }

      added = true;

      return {
        ...event,
        attendeeIds: [...event.attendeeIds, personId],
        history: [
          ...event.history,
          history('Individual attendance added', 'A person was checked in.')
        ]
      };
    })
  );

  return added;
}

export function removeAttendee(eventId: string, personId: string): boolean {
  let removed = false;

  attendanceEvents.update((events) =>
    events.map((event) => {
      if (
        event.id !== eventId ||
        event.status !== 'open' ||
        !event.attendeeIds.includes(personId)
      ) {
        return event;
      }

      removed = true;

      return {
        ...event,
        attendeeIds: event.attendeeIds.filter((id) => id !== personId),
        history: [
          ...event.history,
          history('Individual attendance corrected', 'A check-in was removed.')
        ]
      };
    })
  );

  return removed;
}

export function setManualHeadcount(eventId: string, count: number | null): boolean {
  if (count !== null && (!Number.isInteger(count) || count < 0)) return false;

  let updated = false;

  attendanceEvents.update((events) =>
    events.map((event) => {
      if (event.id !== eventId || event.status !== 'open') return event;

      updated = true;

      return {
        ...event,
        manualHeadcount: count,
        history: [
          ...event.history,
          history(
            'Manual headcount updated',
            count === null ? 'Manual headcount cleared.' : `Manual headcount set to ${count}.`
          )
        ]
      };
    })
  );

  return updated;
}

export function completeAttendanceEvent(eventId: string): boolean {
  return updateEventStatus(
    eventId,
    'complete',
    'Event completed',
    'Attendance entry was marked complete.'
  );
}

export function reopenAttendanceEvent(eventId: string): boolean {
  return updateEventStatus(
    eventId,
    'open',
    'Event reopened',
    'Attendance entry was reopened for correction.'
  );
}

function updateEventStatus(
  eventId: string,
  status: AttendanceEventStatus,
  action: string,
  note: string
): boolean {
  let updated = false;

  attendanceEvents.update((events) =>
    events.map((event) => {
      if (event.id !== eventId || event.status === status) return event;

      updated = true;

      return { ...event, status, history: [...event.history, history(action, note)] };
    })
  );

  return updated;
}

export function addAttendanceEventType(name: string): AttendanceEventType | undefined {
  const trimmedName = name.trim();

  if (!trimmedName) return undefined;

  let created: AttendanceEventType | undefined;

  attendanceEventTypes.update((types) => {
    if (types.some((type) => type.name.toLowerCase() === trimmedName.toLowerCase())) return types;

    created = { id: typeId(trimmedName), name: trimmedName, retired: false };

    return [...types, created!];
  });

  return created;
}

export function renameAttendanceEventType(id: string, name: string): boolean {
  const trimmedName = name.trim();

  if (!trimmedName) return false;

  let renamed = false;

  attendanceEventTypes.update((types) => {
    if (
      types.some(
        (type) =>
          type.id !== id && type.name.toLocaleLowerCase() === trimmedName.toLocaleLowerCase()
      )
    ) {
      return types;
    }

    return types.map((type) => {
      if (type.id !== id) return type;

      renamed = true;

      return { ...type, name: trimmedName };
    });
  });

  return renamed;
}

export function retireAttendanceEventType(id: string): boolean {
  let retired = false;

  attendanceEventTypes.update((types) => {
    const activeCount = types.filter((type) => !type.retired).length;

    return types.map((type) => {
      if (type.id !== id || type.retired || activeCount <= 1) return type;

      retired = true;

      return { ...type, retired: true };
    });
  });

  return retired;
}

export function moveAttendanceEventType(id: string, direction: 'up' | 'down'): void {
  attendanceEventTypes.update((types) => {
    const index = types.findIndex((type) => type.id === id);
    const targetIndex = index + (direction === 'up' ? -1 : 1);

    if (index < 0 || targetIndex < 0 || targetIndex >= types.length) return types;

    const reordered = [...types];
    const [type] = reordered.splice(index, 1);

    reordered.splice(targetIndex, 0, type);

    return reordered;
  });
}
