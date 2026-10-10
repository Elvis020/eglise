<script lang="ts">
  import IconArrowRight from '@tabler/icons-svelte-runes/icons/arrow-right';
  import IconCalendarCheck from '@tabler/icons-svelte-runes/icons/calendar-check';
  import IconInfoCircle from '@tabler/icons-svelte-runes/icons/info-circle';
  import IconUsersGroup from '@tabler/icons-svelte-runes/icons/users-group';

  import { attendanceEvents } from '$lib/attendance';
  import EgliseSelect, { type EgliseSelectOption } from '$lib/components/EgliseSelect.svelte';
  import {
    attendanceReportPeriods,
    buildAttendanceReport,
    type AttendanceReportPeriod
  } from '$lib/reports';

  let period = $state<AttendanceReportPeriod>('all');
  let report = $derived(buildAttendanceReport($attendanceEvents, period));

  const periodOptions: EgliseSelectOption[] = attendanceReportPeriods;

  function formatDate(isoDate: string): string {
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(new Date(`${isoDate}T12:00:00`));
  }
</script>

<svelte:head><title>Reports | Eglise</title></svelte:head>

<section class="page reports-page">
  <header class="page-head reports-page-head">
    <div>
      <p class="eyebrow">Reports</p>
      <h1 tabindex="-1">Attendance reporting</h1>
      <p class="page-intro">
        Review attendance from completed events with individual check-ins and manual headcounts kept
        distinct.
      </p>
    </div>
    <a class="button secondary reports-attendance-link" href="/attendance">
      Review attendance <IconArrowRight aria-hidden="true" size={18} stroke={1.8} />
    </a>
  </header>

  <section aria-label="Report controls" class="reports-controls">
    <div class="field reports-period-field">
      <label for="report-period">Reporting period</label>
      <EgliseSelect id="report-period" bind:value={period} options={periodOptions} />
    </div>
    <p>
      {#if report.periodEnd}
        Reporting through <strong>{formatDate(report.periodEnd)}</strong>.
      {:else}
        Completed events will appear here when their attendance is finalised.
      {/if}
    </p>
  </section>

  <section aria-labelledby="reporting-sources-title" class="reports-sources">
    <div class="reports-section-heading">
      <p class="eyebrow">Attendance sources</p>
      <h2 id="reporting-sources-title">Read each source on its own</h2>
    </div>

    <dl class="reports-totals">
      <div>
        <dt><IconCalendarCheck aria-hidden="true" size={18} stroke={1.8} />Completed events</dt>
        <dd>{report.completedEvents.length}</dd>
        <p>Completed events in this view.</p>
      </div>
      <div>
        <dt><IconUsersGroup aria-hidden="true" size={18} stroke={1.8} />Individual check-ins</dt>
        <dd>{report.individualCheckIns}</dd>
        <p>Check-ins across the completed events shown.</p>
      </div>
      <div>
        <dt><IconUsersGroup aria-hidden="true" size={18} stroke={1.8} />Manual headcounts</dt>
        <dd>{report.manualHeadcountTotal}</dd>
        <p>
          Recorded for {report.manualHeadcountEvents}
          {report.manualHeadcountEvents === 1 ? ' event' : ' events'}.
        </p>
      </div>
    </dl>

    <div class="reports-source-note">
      <IconInfoCircle aria-hidden="true" size={18} stroke={1.8} />
      <p>
        Do not add individual check-ins and manual headcounts together. A manual headcount may cover
        the same people as individual attendance.
      </p>
    </div>
  </section>

  <section aria-labelledby="completed-events-title" class="reports-events-section">
    <div class="reports-section-heading">
      <p class="eyebrow">Event detail</p>
      <h2 id="completed-events-title">Completed events</h2>
    </div>

    {#if report.completedEvents.length}
      <div class="reports-table-wrap">
        <table class="reports-events-table">
          <thead>
            <tr>
              <th scope="col">Event</th>
              <th scope="col">Date</th>
              <th scope="col">Individual check-ins</th>
              <th scope="col">Manual headcount</th>
            </tr>
          </thead>
          <tbody>
            {#each report.completedEvents as event}
              <tr>
                <th data-label="Event" scope="row">
                  <a href={`/attendance/${encodeURIComponent(event.id)}`}>{event.label}</a>
                  <small>{event.typeLabel} · {event.startsAt}</small>
                </th>
                <td data-label="Date">{formatDate(event.date)}</td>
                <td data-label="Individual check-ins">{event.attendeeIds.length}</td>
                <td data-label="Manual headcount">{event.manualHeadcount ?? 'Not recorded'}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {:else}
      <div class="reports-empty-state">
        <IconCalendarCheck aria-hidden="true" size={22} stroke={1.8} />
        <div>
          <h3>No completed events in this view</h3>
          <p>Complete an event in Attendance to include its sources in this report.</p>
          <a href="/attendance">Review attendance</a>
        </div>
      </div>
    {/if}
  </section>

  {#if report.openEvents.length}
    <aside aria-labelledby="open-events-title" class="reports-open-events">
      <div>
        <p class="eyebrow">Not included yet</p>
        <h2 id="open-events-title">
          {report.openEvents.length} open {report.openEvents.length === 1 ? 'event' : 'events'}
        </h2>
      </div>
      <p>Open events remain outside reporting until their attendance is finalised.</p>
    </aside>
  {/if}
</section>

<style>
  .reports-page {
    display: grid;
    gap: 40px;
  }

  .reports-page-head,
  .reports-controls,
  .reports-sources,
  .reports-events-section,
  .reports-open-events {
    max-width: 1120px;
  }

  .reports-page-head {
    display: flex;
    gap: 24px;
    align-items: end;
    justify-content: space-between;
  }

  .reports-page-head > div {
    max-width: 680px;
  }

  .reports-attendance-link {
    flex: 0 0 auto;
  }

  .reports-controls {
    display: flex;
    gap: 24px;
    align-items: end;
    padding: 20px 0;
  }

  .reports-period-field {
    min-width: min(100%, 310px);
  }

  .reports-period-field :global(.eglise-select-trigger) {
    min-height: 46px;
    width: 100%;
    padding: 9px 11px;
    border: 2px solid var(--border);
    border-radius: 8px;
    color: var(--text-primary);
    background: var(--surface-raised);
  }

  .reports-controls p,
  .reports-controls strong {
    margin: 0 0 10px;
    color: var(--text-secondary);
    font-size: 14px;
  }

  .reports-controls strong {
    color: var(--text-primary);
  }

  .reports-sources,
  .reports-events-section {
    display: grid;
    gap: 20px;
  }

  .reports-section-heading .eyebrow {
    margin-bottom: 4px;
  }

  .reports-section-heading h2,
  .reports-open-events h2 {
    margin: 0;
    font: 400 30px/1.15 var(--font-display);
  }

  .reports-totals {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    margin: 0;
  }

  .reports-totals > div {
    min-height: 152px;
    padding: 20px 24px 20px 0;
  }

  .reports-totals > div + div {
    padding-left: 24px;
    border-left: 1px solid var(--border);
  }

  .reports-totals dt {
    display: flex;
    gap: 8px;
    align-items: center;
    color: var(--text-secondary);
    font-size: 14px;
    font-weight: 600;
  }

  .reports-totals dt :global(svg) {
    color: var(--primary);
  }

  .reports-totals dd {
    margin: 8px 0 2px;
    font: 400 42px/1 var(--font-display);
  }

  .reports-totals p,
  .reports-source-note p,
  .reports-open-events > p {
    margin: 0;
    color: var(--text-secondary);
    font-size: 14px;
  }

  .reports-source-note {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    gap: 10px;
    align-items: start;
    padding: 14px 16px;
    border-left: 3px solid var(--accent-warm);
    background: #f3ede2;
  }

  .reports-source-note :global(svg) {
    margin-top: 2px;
    color: var(--accent-warm);
  }

  .reports-table-wrap {
    overflow-x: auto;
  }

  .reports-events-table {
    width: 100%;
    border-collapse: collapse;
    text-align: left;
  }

  .reports-events-table th,
  .reports-events-table td {
    padding: 14px 16px;
    border-bottom: 1px solid var(--border);
    vertical-align: top;
  }

  .reports-events-table thead th {
    color: var(--text-secondary);
    font-size: 14px;
    font-weight: 600;
  }

  .reports-events-table tbody th {
    min-width: 220px;
    font-weight: 600;
  }

  .reports-events-table a {
    color: var(--primary);
    text-underline-offset: 3px;
  }

  .reports-events-table small {
    display: block;
    margin-top: 2px;
    color: var(--text-secondary);
    font-size: 14px;
    font-weight: 400;
  }

  .reports-empty-state {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    gap: 14px;
    max-width: 560px;
    padding: 20px;
    border: 1px solid var(--border);
    border-radius: 12px;
    background: var(--surface-raised);
  }

  .reports-empty-state :global(svg) {
    color: var(--text-secondary);
  }

  .reports-empty-state h3 {
    margin: 0;
    font-size: 16px;
  }

  .reports-empty-state p {
    margin: 4px 0 0;
    color: var(--text-secondary);
  }

  .reports-empty-state a {
    display: inline-flex;
    margin-top: 12px;
    color: var(--primary);
    font-weight: 600;
    text-underline-offset: 3px;
  }

  .reports-open-events {
    display: flex;
    gap: 24px;
    align-items: center;
    justify-content: space-between;
    padding: 20px 0;
  }

  .reports-open-events .eyebrow {
    margin-bottom: 4px;
  }

  .reports-open-events > p {
    max-width: 420px;
  }

  @media (max-width: 960px) {
    .reports-page {
      gap: 32px;
    }

    .reports-page-head,
    .reports-controls,
    .reports-open-events {
      align-items: stretch;
      flex-direction: column;
    }

    .reports-attendance-link {
      align-self: start;
    }

    .reports-controls p {
      margin: 0;
    }

    .reports-totals {
      grid-template-columns: 1fr;
    }

    .reports-totals > div,
    .reports-totals > div + div {
      min-height: 0;
      padding: 16px 0;
      border-left: 0;
    }

    .reports-totals > div + div {
      border-top: 1px solid var(--border);
    }

    .reports-table-wrap {
      overflow: visible;
    }

    .reports-events-table,
    .reports-events-table tbody,
    .reports-events-table tr,
    .reports-events-table th,
    .reports-events-table td {
      display: block;
    }

    .reports-events-table thead {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }

    .reports-events-table tr {
      padding: 16px 0;
      border-bottom: 1px solid var(--border);
    }

    .reports-events-table th,
    .reports-events-table td {
      display: grid;
      grid-template-columns: minmax(128px, 0.85fr) minmax(0, 1.15fr);
      gap: 16px;
      min-width: 0;
      padding: 5px 0;
      border: 0;
    }

    .reports-events-table th::before,
    .reports-events-table td::before {
      content: attr(data-label);
      color: var(--text-secondary);
      font-size: 14px;
      font-weight: 600;
    }

    .reports-events-table small {
      margin-top: 4px;
    }
  }
</style>
