<script lang="ts">
  import { page } from '$app/state';
  import IconCheck from '@tabler/icons-svelte-runes/icons/check';
  import IconRotate from '@tabler/icons-svelte-runes/icons/rotate';

  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
  import DirectoryPagination from '$lib/components/DirectoryPagination.svelte';
  import PersonAvatar from '$lib/components/PersonAvatar.svelte';
  import {
    addAttendee,
    attendanceEvents,
    completeAttendanceEvent,
    removeAttendee,
    reopenAttendanceEvent,
    setManualHeadcount
  } from '$lib/attendance';
  import { clampPage, pageItems } from '$lib/directory';
  import { people } from '$lib/people';
  import { showErrorToast, showToast } from '$lib/toast';

  const ATTENDANCE_PAGE_SIZE = 6;
  let attendeeQuery = $state('');
  let attendeeInitial = $state('all');
  let attendeePage = $state(1);
  let captureMode = $state<'individual' | 'manual'>('individual');
  let manualHeadcountValue = $state('');
  let activeEvent = $derived($attendanceEvents.find((event) => event.id === page.params.eventId));
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

        return (
          (attendeeInitial === 'all' || person.name.startsWith(attendeeInitial)) &&
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
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(new Date(`${isoDate}T12:00:00`));
  }
  function chooseAttendeeInitial(initial: string): void {
    attendeeInitial = initial;
    attendeePage = 1;
  }
  function selectCaptureMode(mode: 'individual' | 'manual'): void {
    captureMode = mode;
    if (mode === 'individual') attendeeQuery = '';
  }
  function checkIn(personId: string): void {
    if (activeEvent && addAttendee(activeEvent.id, personId)) {
      attendeeQuery = '';
      showToast('Attendance recorded.');
    } else {
      showErrorToast('That person is already recorded for this event.');
    }
  }
  function removeCheckIn(personId: string): void {
    if (activeEvent && removeAttendee(activeEvent.id, personId))
      showToast('Attendance entry corrected.');
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
    const wasOpen = activeEvent.status === 'open';
    const updated = wasOpen
      ? completeAttendanceEvent(activeEvent.id)
      : reopenAttendanceEvent(activeEvent.id);

    if (updated) showToast(wasOpen ? 'Event marked complete.' : 'Event reopened for correction.');
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
</script>

<svelte:head
  ><title>{activeEvent ? `${activeEvent.label} attendance` : 'Attendance event'} | Eglise</title
  ></svelte:head
>

{#if activeEvent}
  <section class="page attendance-page">
    <Breadcrumbs
      items={[{ label: 'Attendance', href: '/attendance' }, { label: activeEvent.label }]}
    />
    <section aria-labelledby="event-register-heading" class="panel attendance-register-panel">
      <header class="attendance-register-head">
        <div>
          <p class="eyebrow">{activeEvent.typeLabel}</p>
          <h1 id="event-register-heading" tabindex="-1">{activeEvent.label}</h1>
          <p class="muted">
            {formatDate(activeEvent.date)} · {activeEvent.startsAt} · {activeEvent.leader}
          </p>
        </div>
        <button class="button secondary" type="button" onclick={toggleCompletion}
          >{#if activeEvent.status === 'open'}<IconCheck
              aria-hidden="true"
              size={18}
              stroke={1.8}
            /> Mark complete{:else}<IconRotate aria-hidden="true" size={18} stroke={1.8} /> Reopen for
            correction{/if}</button
        >
      </header>
      <div class="attendance-summary" aria-label="Attendance sources">
        <div>
          <span>Individual attendance</span><strong>{activeEvent.attendeeIds.length}</strong><small
            >People checked in</small
          >
        </div>
        <div>
          <span>Manual headcount</span><strong>{activeEvent.manualHeadcount ?? '—'}</strong><small
            >Recorded separately</small
          >
        </div>
        <p>
          Do not add these numbers together. The manual headcount may cover the same people as
          individual check-ins; reconciliation policy is still being agreed.
        </p>
      </div>
      {#if activeEvent.status === 'complete'}<p class="notice attendance-complete-notice">
          This event is complete. You can review its attendance; reopen it to make corrections.
        </p>{/if}
      <section aria-labelledby="attendance-capture-heading" class="attendance-capture-panel">
        <div class="section-head">
          <div>
            <h2 id="attendance-capture-heading">Record attendance</h2>
            <p class="muted">Choose one method for this entry.</p>
          </div>
        </div>
        <div aria-label="Attendance entry method" class="attendance-capture-choice" role="tablist">
          <button
            aria-controls="attendance-capture-individual-panel"
            aria-selected={captureMode === 'individual'}
            class:active={captureMode === 'individual'}
            data-capture-mode="individual"
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
              <input
                aria-label="Find a person"
                id="attendance-person-search"
                bind:value={attendeeQuery}
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
              >{#each availableInitials as initial}<button
                  aria-label={`Show people whose names begin with ${initial}`}
                  aria-pressed={attendeeInitial === initial}
                  class:active={attendeeInitial === initial}
                  type="button"
                  onclick={() => chooseAttendeeInitial(initial)}>{initial}</button
                >{/each}
            </div>
            <div class="attendance-person-results" aria-live="polite">
              {#if pagedPeople.length}{#each pagedPeople as person}{@const checkedIn =
                    activeEvent.attendeeIds.includes(person.id)}
                  <div class="attendance-person-result">
                    <PersonAvatar /><span
                      ><span class="attendance-person-name">{person.name}</span><small
                        >{person.phone || 'No phone recorded'}</small
                      ></span
                    ><button
                      class="button secondary compact-button"
                      disabled={activeEvent.status === 'complete'}
                      type="button"
                      onclick={() => (checkedIn ? removeCheckIn(person.id) : checkIn(person.id))}
                      >{checkedIn ? 'Undo check-in' : 'Check in'}</button
                    >
                  </div>{/each}{:else}<p class="attendance-no-results">
                  No people match this search.
                </p>{/if}
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
              <label for="manual-headcount">People counted</label><input
                id="manual-headcount"
                bind:value={manualHeadcountValue}
                disabled={activeEvent.status === 'complete'}
                inputmode="numeric"
                min="0"
                placeholder="For example, 86"
                type="number"
              />
            </div>
            <div class="form-actions attendance-manual-actions">
              <button
                class="button secondary"
                disabled={activeEvent.status === 'complete'}
                type="button"
                onclick={saveManualHeadcount}>Save manual count</button
              >
            </div>
            <p class="attendance-manual-note">A blank value clears the manual total.</p>
          </div>
        {/if}
      </section>
    </section>
  </section>
{:else}
  <section class="page attendance-page">
    <Breadcrumbs
      items={[{ label: 'Attendance', href: '/attendance' }, { label: 'Event not found' }]}
    />
    <section class="panel attendance-unknown-event">
      <p class="eyebrow">Attendance</p>
      <h1 tabindex="-1">Event not found</h1>
      <p class="page-intro">
        This browser does not have an attendance event with that link. Events are available only in
        the browser where they were created.
      </p>
      <a class="button primary" href="/attendance">Return to attendance</a>
    </section>
  </section>
{/if}
