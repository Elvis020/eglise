<script lang="ts">
  import IconArrowDown from '@tabler/icons-svelte-runes/icons/arrow-down';
  import IconArrowUp from '@tabler/icons-svelte-runes/icons/arrow-up';
  import IconPlus from '@tabler/icons-svelte-runes/icons/plus';

  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
  import {
    addAttendanceEventType,
    attendanceEventTypes,
    moveAttendanceEventType,
    renameAttendanceEventType,
    retireAttendanceEventType
  } from '$lib/attendance';
  import { showErrorToast, showToast } from '$lib/toast';

  let newTypeName = $state('');

  function addType(): void {
    const created = addAttendanceEventType(newTypeName);

    if (!created) {
      showErrorToast('Enter a new, unique service or event type.');

      return;
    }
    newTypeName = '';
    showToast('Service or event type added.');
  }

  function retireType(id: string): void {
    if (retireAttendanceEventType(id)) {
      showToast('Service or event type retired. Past events keep their recorded type.');
    } else {
      showErrorToast('Keep at least one active service or event type.');
    }
  }
</script>

<svelte:head><title>Attendance event types | Eglise</title></svelte:head>

<section class="page attendance-page">
  <Breadcrumbs items={[{ label: 'Attendance', href: '/attendance' }, { label: 'Event types' }]} />
  <header class="page-head attendance-page-head">
    <div>
      <p class="eyebrow">Attendance settings</p>
      <h1 tabindex="-1">Service and event types</h1>
      <p class="page-intro">
        Maintain the choices available when a new attendance event is created.
      </p>
    </div>
  </header>
  <section
    aria-labelledby="event-types-heading"
    class="attendance-types-section attendance-settings-section"
  >
    <div>
      <p class="eyebrow">Configuration</p>
      <h2 id="event-types-heading">Event types</h2>
      <p class="page-intro">
        Retiring a type preserves its name on past events while removing it from future choices.
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
                onclick={() => retireType(type.id)}>Retire</button
              >
            </div>
          {/if}
        </div>
      {/each}
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
          ><IconPlus aria-hidden="true" size={18} stroke={1.8} />Add type</button
        >
      </form>
    </div>
  </section>
</section>
