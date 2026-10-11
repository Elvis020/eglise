<script lang="ts">
  import { page } from '$app/state';
  import { attendanceEvents } from '$lib/attendance';
  import { people } from '$lib/people';
  import { calendarSelection } from '$lib/calendar-period';
  import { buildAttendanceReport } from '$lib/reports';
  import { downloadAttendancePdf } from '$lib/report-pdf';
  import CalendarPeriodFilter from '$lib/components/CalendarPeriodFilter.svelte';

  const selection = $derived(calendarSelection(page.url.searchParams));
  const report = $derived(
    buildAttendanceReport($attendanceEvents, selection.period, selection.anchor)
  );
  let error = $state('');

  function download(): void {
    error = '';
    try {
      downloadAttendancePdf(report, $people);
    } catch (cause) {
      error =
        cause instanceof Error ? cause.message : 'Unable to download the report. Please try again.';
    }
  }
</script>

<svelte:head><title>Attendance reporting | Eglise</title></svelte:head>
<section class="page workflow-page">
  <header class="page-head">
    <div>
      <p class="eyebrow">Reports</p>
      <h1 tabindex="-1">Attendance reporting</h1>
      <p class="page-intro">Event totals and attendee names for the selected calendar period.</p>
    </div>
    <button class="button primary" type="button" onclick={download}>Download PDF</button>
  </header>
  <CalendarPeriodFilter />
  {#if error}<p class="error" role="alert">{error}</p>{/if}
  <div class="summary-grid">
    <div class="summary-card">
      <span>Number of events</span><strong>{report.events.length}</strong>
    </div>
    <div class="summary-card">
      <span>Total attendance</span><strong>{report.distinctPeople}</strong><small
        >Distinct people in this period</small
      >
    </div>
    <div class="summary-card">
      <span>Manual headcounts</span><strong>{report.manualHeadcountTotal}</strong><small
        >Recorded separately</small
      >
    </div>
  </div>
  <p class="help">
    Open and completed events are included. Open event counts may change. Repeat attendees count
    once in Total attendance. Do not add individual check-ins and manual headcounts together.
  </p>
  <section class="workflow-section" aria-labelledby="report-events">
    <h2 id="report-events">Events · {report.label}</h2>
    {#if report.events.length}
      <table class="responsive-table">
        <thead
          ><tr
            ><th scope="col">Event</th><th scope="col">Date</th><th scope="col">Status</th><th
              scope="col">Check-ins</th
            ><th scope="col">Manual headcount</th><th scope="col">Attendees</th></tr
          ></thead
        ><tbody>
          {#each report.events as event}
            <tr
              ><th scope="row" data-label="Event"
                ><a href={`/attendance/${encodeURIComponent(event.id)}`}>{event.label}</a></th
              ><td data-label="Date">{event.date}</td><td data-label="Status"
                >{event.status === 'open' ? 'Open' : 'Complete'}</td
              ><td data-label="Check-ins">{event.attendeeIds.length}</td><td
                data-label="Manual headcount">{event.manualHeadcount ?? 'Not recorded'}</td
              ><td data-label="Attendees"
                ><details>
                  <summary>{event.attendeeIds.length} attendees</summary>
                  <ul>
                    {#each event.attendeeIds as id}<li>
                        {$people.find((person) => person.id === id)?.name ??
                          'Person record unavailable'}
                      </li>{:else}<li>No individual attendees recorded.</li>{/each}
                  </ul>
                </details></td
              ></tr
            >
          {/each}
        </tbody>
      </table>
    {:else}<p class="empty-state-copy">
        No events in this period. Choose another period or <a href="/attendance/new"
          >create an event</a
        >.
      </p>{/if}
  </section>
</section>
