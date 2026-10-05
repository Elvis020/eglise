<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import IconArchive from '@tabler/icons-svelte-runes/icons/archive';
  import IconArrowLeft from '@tabler/icons-svelte-runes/icons/arrow-left';
  import IconArrowsExchange from '@tabler/icons-svelte-runes/icons/arrows-exchange';
  import IconGitMerge from '@tabler/icons-svelte-runes/icons/git-merge';
  import IconRestore from '@tabler/icons-svelte-runes/icons/restore';

  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
  import EgliseSelect, { type EgliseSelectOption } from '$lib/components/EgliseSelect.svelte';
  import { formatRecordDate, personRecordStateLabels, type Person } from '$lib/domain';
  import { archivePerson, mergePerson, people, restorePerson, transferPerson } from '$lib/people';
  import { showToast } from '$lib/toast';

  type ActiveRecordAction = 'archive' | 'transfer' | 'merge';

  const actionOptions: EgliseSelectOption[] = [
    { value: 'archive', label: 'Archive this record' },
    { value: 'transfer', label: 'Transfer to another church' },
    { value: 'merge', label: 'Merge into a reviewed record' }
  ];

  let person: Person | undefined;
  let action: ActiveRecordAction = 'archive';
  let note = '';
  let destination = '';
  let mergeTargetId = '';
  let error = '';

  $: person = $people.find((record) => record.id === page.params.id);
  $: mergeTargets = $people.filter(
    (record) => record.id !== person?.id && record.recordState === 'active'
  );
  $: mergeTargetOptions = mergeTargets.map((record) => ({ value: record.id, label: record.name }));

  function changeAction(nextAction: string): void {
    action = nextAction as ActiveRecordAction;
    error = '';
  }

  function saveActiveRecordAction(): void {
    if (!person) return;

    if (!note.trim()) {
      error = 'Add a short reason before changing this record.';

      return;
    }

    if (action === 'archive') {
      archivePerson(person.id, note);
      showToast('Record archived.');
    }

    if (action === 'transfer') {
      if (!destination.trim()) {
        error = 'Enter the receiving church or destination.';

        return;
      }

      transferPerson(person.id, destination, note);
      showToast('Record marked as transferred.');
    }

    if (action === 'merge') {
      const target = mergeTargets.find((record) => record.id === mergeTargetId);

      if (!target) {
        error = 'Choose the reviewed record that will remain active.';

        return;
      }

      mergePerson(person.id, target.id, target.name, note);
      showToast('Source record marked as merged.');
    }

    void goto(`/people/${person.id}`);
  }

  function restore(): void {
    if (!person || person.recordState === 'merged') return;

    restorePerson(person.id);
    showToast('Record restored to the active directory.');
    void goto(`/people/${person.id}`);
  }
</script>

<svelte:head
  ><title>{person ? `Manage ${person.name} | Eglise` : 'Person not found | Eglise'}</title
  ></svelte:head
>

{#if person}
  <section class="page record-management-page">
    <Breadcrumbs
      items={[
        { label: 'People & Membership', href: '/people' },
        { label: person.name, href: `/people/${person.id}` }
      ]}
    />

    <header class="page-head">
      <div>
        <p class="eyebrow">Record lifecycle</p>
        <h1 tabindex="-1">Manage this record</h1>
        <p class="page-intro">
          Archive, transfer, or link a reviewed duplicate without silently deleting history.
        </p>
      </div>
    </header>

    <section class="panel record-management-state" aria-labelledby="record-state-title">
      <div>
        <p class="eyebrow">Current state</p>
        <h2 id="record-state-title">{personRecordStateLabels[person.recordState]}</h2>
      </div>
      <p>
        {#if person.recordState === 'active'}
          This person appears in the active directory.
        {:else if person.recordState === 'merged'}
          This source record is retained for history and cannot be restored here.
        {:else}
          This person is excluded from the active directory but their history is retained.
        {/if}
      </p>
    </section>

    {#if person.recordState === 'active'}
      <form
        class="panel record-management-form"
        onsubmit={(event) => {
          event.preventDefault();
          saveActiveRecordAction();
        }}
        novalidate
      >
        <div class="field record-action-field">
          <label for="record-action">Choose an action</label>
          <EgliseSelect
            id="record-action"
            value={action}
            options={actionOptions}
            onchange={changeAction}
          />
        </div>

        {#if action === 'archive'}
          <div class="record-action-copy">
            <h2>Archive without deleting</h2>
            <p>
              The record leaves the active directory but remains available with its complete
              history.
            </p>
          </div>
        {:else if action === 'transfer'}
          <div class="record-action-copy">
            <h2>Record a transfer</h2>
            <p>
              The person leaves this active directory. Their source record stays intact for
              reference.
            </p>
          </div>
          <div class="field">
            <label for="transfer-destination">Receiving church or destination</label>
            <input id="transfer-destination" bind:value={destination} />
          </div>
        {:else}
          <div class="record-action-copy">
            <h2>Link a reviewed duplicate</h2>
            <p>
              Select the record that remains active. No contact details, attendance, or membership
              data are merged automatically.
            </p>
          </div>
          <div class="field">
            <label for="merge-target">Record that remains active</label>
            <EgliseSelect
              id="merge-target"
              bind:value={mergeTargetId}
              options={mergeTargetOptions}
            />
          </div>
        {/if}

        <div class="field">
          <label for="record-note">Reason</label>
          <textarea id="record-note" bind:value={note} rows="3"></textarea>
          <p class="help">This is retained in the record history.</p>
          <p class="error" role={error ? 'alert' : undefined}>{error}</p>
        </div>

        <div class="form-actions">
          <a class="button secondary" href={`/people/${person.id}`}>
            <IconArrowLeft aria-hidden="true" size={18} stroke={1.8} />Cancel
          </a>
          <button class="button primary" type="submit">
            {#if action === 'archive'}
              <IconArchive aria-hidden="true" size={18} stroke={1.8} />Archive record
            {:else if action === 'transfer'}
              <IconArrowsExchange aria-hidden="true" size={18} stroke={1.8} />Record transfer
            {:else}
              <IconGitMerge aria-hidden="true" size={18} stroke={1.8} />Link reviewed duplicate
            {/if}
          </button>
        </div>
      </form>
    {:else if person.recordState !== 'merged'}
      <section class="panel record-restore" aria-labelledby="restore-title">
        <h2 id="restore-title">Restore this record?</h2>
        <p>
          It will return to the active directory. The previous lifecycle event remains in history.
        </p>
        <button class="button primary" type="button" onclick={restore}>
          <IconRestore aria-hidden="true" size={18} stroke={1.8} />Restore to directory
        </button>
      </section>
    {/if}

    <section class="panel record-history" aria-labelledby="record-history-title">
      <div>
        <p class="eyebrow">Record history</p>
        <h2 id="record-history-title">Changes to this record</h2>
      </div>
      <ol>
        {#each [...person.recordHistory].reverse() as entry}
          <li>
            <strong>{entry.action.replaceAll('-', ' ')}</strong>
            <span>{formatRecordDate(entry.recordedOn)}</span>
            <p>{entry.note}</p>
            {#if entry.relatedPersonId}
              <a href={`/people/${entry.relatedPersonId}`}>Open linked record</a>
            {/if}
          </li>
        {/each}
      </ol>
    </section>
  </section>
{:else}
  <section class="page">
    <h1 tabindex="-1">Person not found</h1>
    <p class="page-intro">This person is not in the current sample.</p>
    <a class="button secondary" href="/people">
      <IconArrowLeft aria-hidden="true" size={18} stroke={1.8} />Return to people directory
    </a>
  </section>
{/if}

<style>
  .record-management-page {
    max-width: 880px;
  }

  .record-management-state {
    display: flex;
    gap: 24px;
    align-items: end;
    justify-content: space-between;
  }

  .record-management-state h2,
  .record-action-copy h2,
  .record-history h2 {
    margin: 4px 0 0;
    font: 500 24px/1.15 var(--font-display);
  }

  .record-management-state > p,
  .record-action-copy p,
  .record-restore p {
    max-width: 52ch;
    margin: 0;
    color: var(--text-secondary);
  }

  .record-management-form {
    display: grid;
    gap: 24px;
  }

  .record-action-field {
    max-width: 360px;
  }

  .record-action-copy {
    padding: 16px;
    border-left: 3px solid var(--warning);
    background: #fff8e9;
  }

  .record-action-copy p {
    margin-top: 8px;
  }

  .record-restore {
    display: grid;
    gap: 12px;
  }

  .record-restore h2 {
    margin: 0;
  }

  .record-restore .button {
    width: fit-content;
  }

  .record-history {
    display: grid;
    gap: 20px;
  }

  .record-history ol {
    display: grid;
    gap: 0;
    padding: 0;
    margin: 0;
    list-style: none;
  }

  .record-history li {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 4px 16px;
    padding: 12px 0;
    border-top: 1px solid var(--border);
    font-size: 14px;
  }

  .record-history li:last-child {
    border-bottom: 1px solid var(--border);
  }

  .record-history li span,
  .record-history li p,
  .record-history li a {
    color: var(--text-secondary);
  }

  .record-history li p,
  .record-history li a {
    grid-column: 1 / -1;
    margin: 0;
  }

  @media (max-width: 640px) {
    .record-management-state {
      align-items: start;
      flex-direction: column;
    }

    .record-history li {
      grid-template-columns: 1fr;
    }
  }
</style>
