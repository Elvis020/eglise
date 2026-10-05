<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/state';

  import IconArrowDown from '@tabler/icons-svelte-runes/icons/arrow-down';
  import IconArrowUp from '@tabler/icons-svelte-runes/icons/arrow-up';
  import IconCheck from '@tabler/icons-svelte-runes/icons/check';
  import IconClock from '@tabler/icons-svelte-runes/icons/clock';
  import IconPlus from '@tabler/icons-svelte-runes/icons/plus';
  import IconRotate from '@tabler/icons-svelte-runes/icons/rotate';

  import EgliseDatePicker from '$lib/components/EgliseDatePicker.svelte';
  import EgliseSelect, { type EgliseSelectOption } from '$lib/components/EgliseSelect.svelte';
  import EgliseTimePicker from '$lib/components/EgliseTimePicker.svelte';
  import DirectoryPagination from '$lib/components/DirectoryPagination.svelte';
  import PersonAvatar from '$lib/components/PersonAvatar.svelte';
  import {
    addAttendee,
    addAttendanceEventType,
    attendanceEvents,
    attendanceEventTypes,
    completeAttendanceEvent,
    createAttendanceEvent,
    moveAttendanceEventType,
    removeAttendee,
    renameAttendanceEventType,
    reopenAttendanceEvent,
    retireAttendanceEventType,
    setManualHeadcount,
    type AttendanceEvent
  } from '$lib/attendance';
  import { clampPage, pageItems } from '$lib/directory';
  import { people } from '$lib/people';
  import { showErrorToast, showToast } from '$lib/toast';

  const ATTENDANCE_PAGE_SIZE = 6;

  let eventTypeId = $state('sunday-service');
  let eventLabel = $state('');
  let eventDate = $state('2026-10-05');
  let eventTime = $state('07:00');
  let eventLeader = $state('');
  let eventError = $state('');
  let attendeeQuery = $state('');
  let attendeeInitial = $state('all');
  let attendeePage = $state(1);
  let captureMode = $state<'individual' | 'manual'>('individual');
  let manualHeadcountValue = $state('');
  let newTypeName = $state('');

  let activeTypes = $derived($attendanceEventTypes.filter((type) => !type.retired));
  let typeOptions = $derived<EgliseSelectOption[]>(
    activeTypes.map((type) => ({ value: type.id, label: type.name }))
  );
  let selectedEventId = $derived(
    page.url.searchParams.get('event') || $attendanceEvents[0]?.id || ''
  );
  let activeEvent = $derived($attendanceEvents.find((event) => event.id === selectedEventId));
  let activePeople = $derived($people.filter((person) => person.recordState === 'active'));
  let availableInitials = $derived(
    Array.from(new Set(activePeople.map((person) => person.name.trim().charAt(0).toUpperCase())))
      .filter(Boolean)
      .sort()
  );
  let filteredPeople = $derived(
    activePeople
      .slice()
      .sort((first, second) => first.name.localeCompare(second.name))
      .filter((person) => {
        const query = attendeeQuery.trim().toLowerCase();
        const matchesInitial = attendeeInitial === 'all' || person.name.startsWith(attendeeInitial);

        return (
          matchesInitial &&
          (!query || `${person.name} ${person.phone}`.toLowerCase().includes(query))
        );
      })
  );
  let pagedPeople = $derived(pageItems(filteredPeople, attendeePage, ATTENDANCE_PAGE_SIZE));

  $effect(() => {
    attendeePage = clampPage(attendeePage, filteredPeople.length, ATTENDANCE_PAGE_SIZE);
  });
  $effect(() => {
    manualHeadcountValue = activeEvent?.manualHeadcount?.toString() ?? '';
  });

  function formatDate(isoDate: string): string {
    if (!isoDate) return 'Date not set';

    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(new Date(`${isoDate}T12:00:00`));
  }

  function eventStatusLabel(event: AttendanceEvent): string {
    return event.status === 'complete' ? 'Complete' : 'Open for entry';
  }

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

      eventLabel = '';
      eventLeader = '';
      attendeeQuery = '';
      void goto(`/attendance?event=${encodeURIComponent(created.id)}`);
      showToast('Attendance event opened.');
    } catch (error) {
      eventError = error instanceof Error ? error.message : 'We could not open this event.';
    }
  }

  function checkIn(personId: string): void {
    if (!activeEvent) return;

    if (addAttendee(activeEvent.id, personId)) {
      attendeeQuery = '';
      showToast('Attendance recorded.');
    } else {
      showErrorToast('That person is already recorded for this event.');
    }
  }

  function chooseAttendeeInitial(initial: string): void {
    attendeeInitial = initial;
    attendeePage = 1;
  }

  function selectCaptureMode(mode: 'individual' | 'manual'): void {
    captureMode = mode;

    if (mode === 'individual') attendeeQuery = '';
  }

  function handleCaptureTabKeydown(event: KeyboardEvent): void {
    const currentTab = event.currentTarget;

    if (!(currentTab instanceof HTMLButtonElement)) return;

    const tabs = Array.from(
      currentTab.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]') ?? []
    );
    const currentIndex = tabs.indexOf(currentTab);

    if (currentIndex === -1) return;

    let nextIndex = currentIndex;

    if (event.key === 'ArrowRight') nextIndex = (currentIndex + 1) % tabs.length;
    if (event.key === 'ArrowLeft') nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = tabs.length - 1;

    if (nextIndex === currentIndex) return;

    event.preventDefault();

    const nextTab = tabs[nextIndex];

    selectCaptureMode(nextTab.dataset.captureMode as 'individual' | 'manual');
    nextTab.focus();
  }

  function removeCheckIn(personId: string): void {
    if (!activeEvent) return;

    if (removeAttendee(activeEvent.id, personId)) {
      showToast('Attendance entry corrected.');
    }
  }

  function saveManualHeadcount(): void {
    if (!activeEvent) return;

    const trimmedValue = manualHeadcountValue.trim();
    const count = trimmedValue ? Number(trimmedValue) : null;

    if (!setManualHeadcount(activeEvent.id, count)) {
      showErrorToast('Enter a whole number of zero or more.');

      return;
    }

    showToast(trimmedValue ? 'Manual headcount saved.' : 'Manual headcount cleared.');
  }

  function toggleCompletion(): void {
    if (!activeEvent) return;

    const updated =
      activeEvent.status === 'open'
        ? completeAttendanceEvent(activeEvent.id)
        : reopenAttendanceEvent(activeEvent.id);

    if (updated) {
      showToast(
        activeEvent.status === 'open' ? 'Event marked complete.' : 'Event reopened for correction.'
      );
    }
  }

  function addType(): void {
    const created = addAttendanceEventType(newTypeName);

    if (!created) {
      showErrorToast('Enter a new, unique service or event type.');

      return;
    }

    newTypeName = '';
    eventTypeId = created.id;
    showToast('Service or event type added.');
  }

  function retireType(id: string): void {
    if (retireAttendanceEventType(id)) {
      if (eventTypeId === id) eventTypeId = activeTypes.find((type) => type.id !== id)?.id ?? '';
      showToast('Service or event type retired. Past events keep their recorded type.');
    } else {
      showErrorToast('Keep at least one active service or event type.');
    }
  }
</script>

<svelte:head><title>Attendance | Eglise</title></svelte:head>

<section class="page attendance-page">
  <header class="page-head attendance-page-head">
    <div>
      <p class="eyebrow">Attendance</p>
      <h1 tabindex="-1">Service and event attendance</h1>
      <p class="page-intro">
        Record individual attendance and manual headcounts separately for each service or event.
      </p>
    </div>
  </header>

  <p class="notice" role="status">
    Attendance is a synthetic discovery workspace. Entries are only available in this browser and
    are not church records.
  </p>

  <div class="attendance-layout">
    <section aria-labelledby="open-event-heading" class="panel attendance-open-panel">
      <div class="section-head">
        <div>
          <p class="eyebrow">New event</p>
          <h2 id="open-event-heading">Open attendance</h2>
        </div>
      </div>

      <form
        class="attendance-form"
        onsubmit={(event) => {
          event.preventDefault();
          createEvent();
        }}
      >
        <div class="form-grid">
          <div class="field">
            <label for="attendance-event-type">Service or event type</label>
            <EgliseSelect
              id="attendance-event-type"
              bind:value={eventTypeId}
              options={typeOptions}
            />
          </div>
          <div class="field">
            <label for="attendance-event-label"
              >Event label <span class="field-optional">Optional</span></label
            >
            <input
              id="attendance-event-label"
              bind:value={eventLabel}
              placeholder="For example, first service"
            />
          </div>
          <div class="field">
            <label for="attendance-event-date">Date</label>
            <EgliseDatePicker
              id="attendance-event-date"
              autocomplete="off"
              bind:value={eventDate}
            />
          </div>
          <div class="field">
            <label for="attendance-event-time">Start time</label>
            <EgliseTimePicker id="attendance-event-time" bind:value={eventTime} />
          </div>
          <div class="field attendance-leader-field">
            <label for="attendance-event-leader">Responsible leader</label>
            <input
              id="attendance-event-leader"
              bind:value={eventLeader}
              placeholder="Name or team"
            />
          </div>
        </div>
        {#if eventError}<p class="field-error" role="alert">{eventError}</p>{/if}
        <button class="button primary" type="submit">
          <IconPlus aria-hidden="true" size={18} stroke={1.8} />
          Open attendance
        </button>
      </form>
    </section>

    <section aria-labelledby="event-list-heading" class="panel attendance-events-panel">
      <div class="section-head">
        <div>
          <p class="eyebrow">Attendance events</p>
          <h2 id="event-list-heading">Open and recent</h2>
        </div>
      </div>
      <div class="attendance-event-list" role="list">
        {#each $attendanceEvents as event}
          <div role="listitem">
            <a
              aria-current={event.id === selectedEventId ? 'true' : undefined}
              class:active={event.id === selectedEventId}
              class="attendance-event-item"
              href={`/attendance?event=${encodeURIComponent(event.id)}`}
            >
              <span class="attendance-event-item-copy">
                <strong>{event.label}</strong>
                <span>{formatDate(event.date)} · {event.startsAt} · {event.leader}</span>
              </span>
              <span class:complete={event.status === 'complete'} class="attendance-status">
                {#if event.status === 'complete'}<IconCheck
                    aria-hidden="true"
                    size={15}
                    stroke={2}
                  />{:else}<IconClock aria-hidden="true" size={15} stroke={2} />{/if}
                {eventStatusLabel(event)}
              </span>
            </a>
          </div>
        {/each}
      </div>
    </section>
  </div>

  {#if activeEvent}
    <section aria-labelledby="event-register-heading" class="panel attendance-register-panel">
      <header class="attendance-register-head">
        <div>
          <p class="eyebrow">{activeEvent.typeLabel}</p>
          <h2 id="event-register-heading">{activeEvent.label}</h2>
          <p class="muted">
            {formatDate(activeEvent.date)} · {activeEvent.startsAt} · {activeEvent.leader}
          </p>
        </div>
        <button class="button secondary" type="button" onclick={toggleCompletion}>
          {#if activeEvent.status === 'open'}
            <IconCheck aria-hidden="true" size={18} stroke={1.8} /> Mark complete
          {:else}
            <IconRotate aria-hidden="true" size={18} stroke={1.8} /> Reopen for correction
          {/if}
        </button>
      </header>

      <div class="attendance-summary" aria-label="Attendance sources">
        <div>
          <span>Individual attendance</span>
          <strong>{activeEvent.attendeeIds.length}</strong>
          <small>People checked in</small>
        </div>
        <div>
          <span>Manual headcount</span>
          <strong>{activeEvent.manualHeadcount ?? '—'}</strong>
          <small>Recorded separately</small>
        </div>
        <p>
          Do not add these numbers together. The manual headcount may cover the same people as
          individual check-ins; reconciliation policy is still being agreed.
        </p>
      </div>

      <section aria-labelledby="attendance-capture-heading" class="attendance-capture-panel">
        <div class="section-head">
          <div>
            <h3 id="attendance-capture-heading">How are you recording attendance?</h3>
            <p class="muted">Choose one method for this entry.</p>
          </div>
        </div>
        <div aria-label="Attendance entry method" class="attendance-capture-choice" role="tablist">
          <button
            aria-controls="attendance-capture-individual-panel"
            aria-selected={captureMode === 'individual'}
            class:active={captureMode === 'individual'}
            data-capture-mode="individual"
            disabled={activeEvent.status === 'complete'}
            id="attendance-capture-individual-tab"
            onkeydown={handleCaptureTabKeydown}
            role="tab"
            tabindex={captureMode === 'individual' ? 0 : -1}
            type="button"
            onclick={() => selectCaptureMode('individual')}>Find a person</button
          >
          <button
            aria-controls="attendance-capture-manual-panel"
            aria-selected={captureMode === 'manual'}
            class:active={captureMode === 'manual'}
            data-capture-mode="manual"
            disabled={activeEvent.status === 'complete'}
            id="attendance-capture-manual-tab"
            onkeydown={handleCaptureTabKeydown}
            role="tab"
            tabindex={captureMode === 'manual' ? 0 : -1}
            type="button"
            onclick={() => selectCaptureMode('manual')}>Use manual count</button
          >
        </div>

        {#if captureMode === 'individual'}
          <div
            aria-labelledby="attendance-capture-individual-tab"
            class="attendance-capture-content"
            id="attendance-capture-individual-panel"
            role="tabpanel"
          >
            <div class="field">
              <label for="attendance-person-search">Find a person</label>
              <input
                id="attendance-person-search"
                bind:value={attendeeQuery}
                disabled={activeEvent.status === 'complete'}
                placeholder="Search by name or phone"
                type="search"
                oninput={() => (attendeePage = 1)}
              />
            </div>
            <div
              aria-label="Filter people by first letter"
              class="attendance-alphabet"
              role="group"
            >
              <button
                aria-pressed={attendeeInitial === 'all'}
                class:active={attendeeInitial === 'all'}
                type="button"
                onclick={() => chooseAttendeeInitial('all')}>All</button
              >
              {#each availableInitials as initial}
                <button
                  aria-label={`Show people whose names begin with ${initial}`}
                  aria-pressed={attendeeInitial === initial}
                  class:active={attendeeInitial === initial}
                  type="button"
                  onclick={() => chooseAttendeeInitial(initial)}>{initial}</button
                >
              {/each}
            </div>
            <div class="attendance-person-results" aria-live="polite">
              {#if pagedPeople.length}
                {#each pagedPeople as person}
                  {@const checkedIn = activeEvent.attendeeIds.includes(person.id)}
                  <div class="attendance-person-result">
                    <PersonAvatar />
                    <span>
                      <strong>{person.name}</strong>
                      <small>{person.phone || 'No phone recorded'}</small>
                    </span>
                    <button
                      class="button secondary compact-button"
                      disabled={activeEvent.status === 'complete'}
                      type="button"
                      onclick={() => (checkedIn ? removeCheckIn(person.id) : checkIn(person.id))}
                      >{checkedIn ? 'Undo check-in' : 'Check in'}</button
                    >
                  </div>
                {/each}
              {:else}
                <p class="attendance-no-results">No people match this search.</p>
              {/if}
            </div>
            <DirectoryPagination
              bind:page={attendeePage}
              pageSize={ATTENDANCE_PAGE_SIZE}
              total={filteredPeople.length}
            />
          </div>
        {:else}
          <div
            aria-labelledby="attendance-capture-manual-tab"
            class="attendance-capture-content attendance-manual-content"
            id="attendance-capture-manual-panel"
            role="tabpanel"
          >
            <p class="muted">
              Use a manual count instead of individual check-ins when the service or event needs a
              separately recorded total.
            </p>
            <div class="field">
              <label for="manual-headcount">People counted</label>
              <input
                id="manual-headcount"
                bind:value={manualHeadcountValue}
                disabled={activeEvent.status === 'complete'}
                inputmode="numeric"
                min="0"
                placeholder="For example, 86"
                type="number"
              />
            </div>
            <button
              class="button secondary"
              disabled={activeEvent.status === 'complete'}
              type="button"
              onclick={saveManualHeadcount}>Save manual count</button
            >
            <p class="attendance-manual-note">A blank value clears the manual total.</p>
          </div>
        {/if}
      </section>
    </section>
  {/if}

  <section aria-labelledby="event-types-heading" class="attendance-types-section">
    <div>
      <p class="eyebrow">Configuration</p>
      <h2 id="event-types-heading">Service and event types</h2>
      <p class="page-intro">
        Start with the agreed defaults and adapt this list as the church’s programme changes.
      </p>
    </div>
    <div class="attendance-type-list">
      {#each $attendanceEventTypes as type, index}
        <div class:retired={type.retired} class="attendance-type-row">
          <input
            aria-label={`Name for ${type.name}`}
            disabled={type.retired}
            value={type.name}
            onblur={(event) => renameAttendanceEventType(type.id, event.currentTarget.value)}
          />
          {#if type.retired}
            <span class="attendance-type-retired">Retired</span>
          {:else}
            <div class="attendance-type-actions">
              <button
                aria-label={`Move ${type.name} up`}
                class="icon-button"
                disabled={index === 0}
                type="button"
                onclick={() => moveAttendanceEventType(type.id, 'up')}
                ><IconArrowUp aria-hidden="true" size={17} stroke={1.8} /></button
              >
              <button
                aria-label={`Move ${type.name} down`}
                class="icon-button"
                disabled={index === $attendanceEventTypes.length - 1}
                type="button"
                onclick={() => moveAttendanceEventType(type.id, 'down')}
                ><IconArrowDown aria-hidden="true" size={17} stroke={1.8} /></button
              >
              <button
                class="button secondary compact-button"
                type="button"
                onclick={() => retireType(type.id)}
              >
                Retire
              </button>
            </div>
          {/if}
        </div>
      {/each}
    </div>
    <form
      class="attendance-add-type"
      onsubmit={(event) => {
        event.preventDefault();
        addType();
      }}
    >
      <label class="sr-only" for="new-attendance-type">New service or event type</label>
      <input
        id="new-attendance-type"
        bind:value={newTypeName}
        placeholder="Add a service or event type"
      />
      <button class="button secondary" type="submit"
        ><IconPlus aria-hidden="true" size={18} stroke={1.8} /> Add type</button
      >
    </form>
  </section>
</section>
