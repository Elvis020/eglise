<script lang="ts">
  import IconCheck from '@tabler/icons-svelte-runes/icons/check';
  import IconClock from '@tabler/icons-svelte-runes/icons/clock';
  import IconPlus from '@tabler/icons-svelte-runes/icons/plus';

  import { attendanceEvents, type AttendanceEvent } from '$lib/attendance';

  let openEvents = $derived($attendanceEvents.filter((event) => event.status === 'open'));
  let completedEvents = $derived($attendanceEvents.filter((event) => event.status === 'complete'));

  function formatDate(isoDate: string): string {
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(new Date(`${isoDate}T12:00:00`));
  }

  function eventMeta(event: AttendanceEvent): string {
    return `${formatDate(event.date)} · ${event.startsAt} · ${event.leader}`;
  }
</script>

<svelte:head><title>Attendance | Eglise</title></svelte:head>

<section class="page attendance-page">
  <header class="page-head attendance-page-head">
    <div class="attendance-heading-copy">
      <p class="eyebrow">Attendance</p>
      <div class="attendance-heading-row">
        <h1 tabindex="-1">Attendance events</h1>
        <div class="attendance-page-actions">
          <a class="button secondary" href="/attendance/settings">Manage event types</a>
          <a class="button primary" href="/attendance/new">
            <IconPlus aria-hidden="true" size={18} stroke={1.8} /> Create event
          </a>
        </div>
      </div>
      <p class="page-intro">Create an event first, then record its attendance in one place.</p>
    </div>
  </header>

  <div class="attendance-event-groups">
    <section aria-labelledby="open-events-heading" class="panel attendance-events-panel">
      <div class="section-head">
        <div>
          <p class="eyebrow">Ready for entry</p>
          <h2 id="open-events-heading">Open events</h2>
        </div>
      </div>
      {#if openEvents.length}
        <div class="attendance-event-list" role="list">
          {#each openEvents as event}
            <div role="listitem">
              <a class="attendance-event-item" href={`/attendance/${encodeURIComponent(event.id)}`}>
                <span class="attendance-event-item-copy">
                  <strong>{event.label}</strong>
                  <span>{eventMeta(event)}</span>
                </span>
                <span class="attendance-status"
                  ><IconClock aria-hidden="true" size={15} stroke={2} />Open</span
                >
              </a>
            </div>
          {/each}
        </div>
      {:else}
        <p class="empty-state-copy">
          There are no open events. Create an event to begin attendance.
        </p>
      {/if}
    </section>

    <section aria-labelledby="completed-events-heading" class="attendance-completed-section">
      <div class="section-head">
        <div>
          <p class="eyebrow">Reference</p>
          <h2 id="completed-events-heading">Completed and recent events</h2>
        </div>
      </div>
      {#if completedEvents.length}
        <div class="attendance-event-list" role="list">
          {#each completedEvents as event}
            <div role="listitem">
              <a class="attendance-event-item" href={`/attendance/${encodeURIComponent(event.id)}`}>
                <span class="attendance-event-item-copy">
                  <strong>{event.label}</strong>
                  <span>{eventMeta(event)}</span>
                </span>
                <span class="attendance-status complete"
                  ><IconCheck aria-hidden="true" size={15} stroke={2} />Complete</span
                >
              </a>
            </div>
          {/each}
        </div>
      {:else}
        <p class="empty-state-copy">
          Completed events will appear here after their attendance is finalised.
        </p>
      {/if}
    </section>
  </div>
</section>
