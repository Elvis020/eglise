<script lang="ts">
  import { goto } from '$app/navigation';

  import { createPerson, importRows } from '$lib/domain';
  import { addPerson } from '$lib/people';
  import { showToast } from '$lib/toast';

  let duplicateChoice: '' | 'create' | 'exclude' = '';
  let confirmDialog: HTMLDialogElement;

  $: readyRows = importRows.filter(
    (row) => row.state === 'ready' || (row.state === 'review' && duplicateChoice === 'create')
  );

  function confirmImport(): void {
    if (!duplicateChoice) return;

    confirmDialog.showModal();
  }

  function createRecords(): void {
    readyRows.forEach((row) => {
      const name = row.state === 'review' ? `${row.name} (import)` : row.name;

      addPerson(createPerson(name, row.phone, row.neighbourhood));
    });

    confirmDialog.close();
    showToast(`${readyRows.length} fictional people imported. Invalid rows were excluded.`);
    void goto('/people');
  }
</script>

<svelte:head><title>Review sample import — Eglise</title></svelte:head>

<section class="page">
  <header class="page-head">
    <div>
      <p class="eyebrow">People &amp; Membership</p>
      <h1 tabindex="-1">Review sample import</h1>
      <p class="page-intro">
        A deterministic fictional sample proves the review flow. It does not parse or upload a
        spreadsheet.
      </p>
    </div>
  </header>

  <div class="notice">
    <strong>Review before confirming.</strong>
    <p>
      Invalid rows are excluded. Possible duplicates require a human choice; a shared phone alone
      never merges people. Age results do not reveal a date of birth.
    </p>
  </div>

  <div class="panel">
    <div class="table-wrap">
      <table class="directory import-table">
        <thead
          ><tr
            ><th>Person</th><th>Phone</th><th>Neighbourhood</th><th>Eligibility</th><th
              >Review state</th
            ><th>Choice</th></tr
          ></thead
        >
        <tbody>
          {#each importRows as row}
            <tr
              class:import-invalid={row.state === 'invalid'}
              class:import-review={row.state === 'review'}
            >
              <td data-label="Person">{row.name}</td><td data-label="Phone">{row.phone}</td><td
                data-label="Neighbourhood">{row.neighbourhood}</td
              >
              <td data-label="Eligibility"
                >{row.eligibility === 'eligible'
                  ? 'Eligibility checked; private DOB withheld'
                  : row.eligibility === 'below-age'
                    ? `Under 16; private DOB withheld`
                    : 'Eligibility not assessed'}</td
              >
              <td data-label="Review state"
                ><span
                  class:review={row.state !== 'ready'}
                  class:member={row.state === 'ready'}
                  class="status">{row.note}</span
                ></td
              >
              <td data-label="Choice">
                {#if row.state === 'review'}
                  <fieldset class="choice-group">
                    <legend class="muted">A matching name exists</legend><label
                      ><input type="radio" bind:group={duplicateChoice} value="create" /> Create separately</label
                    ><label
                      ><input type="radio" bind:group={duplicateChoice} value="exclude" /> Exclude row</label
                    >
                  </fieldset>
                {:else if row.state === 'invalid'}
                  <span class="row-note">Excluded until corrected</span>
                {:else}
                  <span class="row-note">Create record</span>
                {/if}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
    <div class="form-actions">
      <a class="button secondary" href="/people">Cancel</a><button
        class="button primary"
        type="button"
        disabled={!duplicateChoice}
        aria-describedby="duplicate-decision-help"
        on:click={confirmImport}>Confirm reviewed import</button
      >
    </div>
    <p id="duplicate-decision-help" class="help">
      Choose whether to create or exclude the possible duplicate before confirming this sample.
    </p>
  </div>
</section>

<dialog bind:this={confirmDialog} aria-labelledby="import-title">
  <form method="dialog">
    <h2 id="import-title">Confirm reviewed import</h2>
    <p>
      {readyRows.length} fictional people will be created. Invalid rows remain excluded, and no membership
      or attendance is created.
    </p>
    <div class="dialog-actions">
      <button class="button secondary" value="cancel">Cancel</button><button
        class="button primary"
        type="button"
        on:click={createRecords}>Create fictional people</button
      >
    </div>
  </form>
</dialog>
