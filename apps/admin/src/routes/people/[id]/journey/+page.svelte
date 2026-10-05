<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import IconArrowLeft from '@tabler/icons-svelte-runes/icons/arrow-left';
  import IconArrowRight from '@tabler/icons-svelte-runes/icons/arrow-right';
  import IconUserCheck from '@tabler/icons-svelte-runes/icons/user-check';

  import { nextJourneyStage, personKindLabels, type Person, type PersonKind } from '$lib/domain';
  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
  import EgliseDatePicker from '$lib/components/EgliseDatePicker.svelte';
  import { people, recordJourneyStage } from '$lib/people';
  import { showToast } from '$lib/toast';

  let person: Person | undefined;
  let recordedOn = new Date().toISOString().slice(0, 10);
  let note = '';
  let error = '';

  $: person = $people.find((record) => record.id === page.params.id);
  $: nextStage = person ? nextJourneyStage(person.kind) : undefined;

  function stageAction(stage: PersonKind): string {
    return stage === 'first-timer' ? 'Record first-time visit' : 'Confirm regular attendance';
  }

  function saveJourneyStage(): void {
    if (!person || !nextStage) return;

    if (!recordedOn) {
      error = 'Enter the date for this journey update.';
      document.getElementById('journey-recorded-on')?.focus();

      return;
    }

    recordJourneyStage(person.id, {
      stage: nextStage,
      recordedOn,
      note: note.trim()
    });
    showToast(`${personKindLabels[nextStage]} recorded.`);
    void goto(`/people/${person.id}`);
  }
</script>

<svelte:head
  ><title>{person ? `Update ${person.name} | Eglise` : 'Person not found | Eglise'}</title
  ></svelte:head
>

{#if person}
  <section class="page journey-page">
    <Breadcrumbs
      items={[
        { label: 'People & Membership', href: '/people' },
        { label: person.name, href: `/people/${person.id}` }
      ]}
    />

    <header class="page-head">
      <div>
        <h1 tabindex="-1">Update journey</h1>
        <p class="page-intro">
          {person.name} is currently recorded as a {personKindLabels[person.kind].toLowerCase()}.
        </p>
      </div>
    </header>

    {#if nextStage}
      <form class="panel journey-form" on:submit|preventDefault={saveJourneyStage} novalidate>
        <p class="eyebrow">Next step</p>
        <h2>{stageAction(nextStage)}</h2>
        <p class="page-intro">
          This adds a dated entry to the person’s journey. It does not create membership.
        </p>

        <div class="journey-fields">
          <div class="field">
            <label for="journey-recorded-on">Recorded on</label>
            <EgliseDatePicker
              id="journey-recorded-on"
              bind:value={recordedOn}
              ariaInvalid={Boolean(error)}
              ariaDescribedby="journey-recorded-on-error"
            />
            <p class="error" id="journey-recorded-on-error">{error}</p>
          </div>
          <div class="field">
            <label for="journey-note">Note <span class="field-optional">Optional</span></label>
            <textarea
              id="journey-note"
              bind:value={note}
              placeholder="A brief context for this update"
              rows="3"
            ></textarea>
          </div>
        </div>

        <div class="form-actions">
          <a class="button secondary" href={`/people/${person.id}`}>
            <IconArrowLeft aria-hidden="true" size={18} stroke={1.8} />
            Cancel
          </a>
          <button class="button primary" type="submit">
            {stageAction(nextStage)}
            <IconArrowRight aria-hidden="true" size={18} stroke={1.8} />
          </button>
        </div>
      </form>
    {:else}
      <section class="panel journey-complete" aria-labelledby="journey-complete-title">
        <p class="eyebrow">Journey recorded</p>
        <h2 id="journey-complete-title">Ready for church recognition when appropriate</h2>
        <p class="page-intro">
          Regular attendance is recorded. Membership remains a separate church recognition decision.
        </p>
        <div class="form-actions">
          <a class="button secondary" href={`/people/${person.id}`}>
            <IconArrowLeft aria-hidden="true" size={18} stroke={1.8} />
            Return to person
          </a>
          <a class="button primary" href={`/people/${person.id}/membership`}>
            <IconUserCheck aria-hidden="true" size={18} stroke={1.8} />
            Record membership
          </a>
        </div>
      </section>
    {/if}
  </section>
{:else}
  <section class="page">
    <h1 tabindex="-1">Person not found</h1>
    <p class="page-intro">This person is not in the current sample.</p>
    <a class="button secondary" href="/people">Return to people directory</a>
  </section>
{/if}

<style>
  .journey-form,
  .journey-complete {
    display: grid;
    gap: 16px;
    max-width: 720px;
  }

  h2 {
    margin: 0;
    font: 500 28px/1.15 var(--font-display);
  }

  .journey-fields {
    display: grid;
    grid-template-columns: minmax(0, 280px) minmax(0, 1fr);
    gap: 24px;
    margin-top: 8px;
  }

  textarea {
    width: 100%;
    min-height: 88px;
    padding: 10px 12px;
    border: 2px solid var(--border);
    border-radius: 8px;
    color: var(--text-primary);
    background: var(--surface-raised);
    resize: vertical;
  }

  textarea:focus {
    outline: 0;
    border-color: #6f8b75;
    box-shadow: 0 0 0 2px rgb(49 84 59 / 12%);
  }

  @media (max-width: 640px) {
    .journey-fields {
      grid-template-columns: 1fr;
    }
  }
</style>
