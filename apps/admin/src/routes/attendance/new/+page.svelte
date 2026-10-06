<script lang="ts">
  import { goto } from '$app/navigation';
  import IconPlus from '@tabler/icons-svelte-runes/icons/plus';

  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
  import EgliseDatePicker from '$lib/components/EgliseDatePicker.svelte';
  import EgliseSelect, { type EgliseSelectOption } from '$lib/components/EgliseSelect.svelte';
  import EgliseTimePicker from '$lib/components/EgliseTimePicker.svelte';
  import { attendanceEventTypes, createAttendanceEvent } from '$lib/attendance';
  import { showToast } from '$lib/toast';

  let eventTypeId = $state('sunday-service');
  let eventLabel = $state('');
  let eventDate = $state('2026-10-05');
  let eventTime = $state('07:00');
  let eventLeader = $state('');
  let eventError = $state('');

  let activeTypes = $derived($attendanceEventTypes.filter((type) => !type.retired));
  let typeOptions = $derived<EgliseSelectOption[]>(
    activeTypes.map((type) => ({ value: type.id, label: type.name }))
  );

  $effect(() => {
    if (activeTypes.some((type) => type.id === eventTypeId)) return;

    eventTypeId = activeTypes[0]?.id ?? '';
  });

  function createEvent(): void {
    eventError = '';
    if (!eventTypeId || !eventDate || !eventTime || !eventLeader.trim()) {
      eventError = 'Choose a type, date, time, and responsible leader.';

      return;
    }
    try {
      const created = createAttendanceEvent({
        typeId: eventTypeId,
        label: eventLabel,
        date: eventDate,
        startsAt: eventTime,
        leader: eventLeader
      });

      showToast('Attendance event created.');
      void goto(`/attendance/${encodeURIComponent(created.id)}`);
    } catch (error) {
      eventError = error instanceof Error ? error.message : 'We could not create this event.';
    }
  }
</script>

<svelte:head><title>Create attendance event | Eglise</title></svelte:head>

<section class="page attendance-page">
  <Breadcrumbs items={[{ label: 'Attendance', href: '/attendance' }, { label: 'Create event' }]} />
  <header class="page-head attendance-page-head">
    <div>
      <h1 tabindex="-1">Create an attendance event</h1>
      <p class="page-intro">Set up the service or event before recording any attendance.</p>
    </div>
  </header>
  <section aria-labelledby="event-details-heading" class="panel attendance-create-panel">
    <div class="section-head"><div><h2 id="event-details-heading">Event details</h2></div></div>
    <form
      class="attendance-form"
      onsubmit={(event) => {
        event.preventDefault();
        createEvent();
      }}
    >
      <div class="form-grid">
        <div class="field">
          <label for="attendance-event-type">Service or event type</label><EgliseSelect
            id="attendance-event-type"
            bind:value={eventTypeId}
            options={typeOptions}
          />
        </div>
        <div class="field">
          <label for="attendance-event-label"
            >Event label <span class="field-optional">Optional</span></label
          ><input
            id="attendance-event-label"
            bind:value={eventLabel}
            placeholder="For example, first service"
          />
        </div>
        <div class="field">
          <label for="attendance-event-date">Date</label><EgliseDatePicker
            id="attendance-event-date"
            autocomplete="off"
            bind:value={eventDate}
          />
        </div>
        <div class="field">
          <label for="attendance-event-time">Start time</label><EgliseTimePicker
            id="attendance-event-time"
            bind:value={eventTime}
          />
        </div>
        <div class="field attendance-leader-field">
          <label for="attendance-event-leader">Responsible leader</label><input
            id="attendance-event-leader"
            bind:value={eventLeader}
            placeholder="Name or team"
          />
        </div>
      </div>
      {#if eventError}<p class="field-error" role="alert">{eventError}</p>{/if}
      <div class="form-actions attendance-form-actions">
        <button class="button primary" type="submit"
          ><IconPlus aria-hidden="true" size={18} stroke={1.8} />Create event</button
        >
      </div>
    </form>
  </section>
</section>
