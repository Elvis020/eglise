<script lang="ts">
  import IconArrowLeft from '@tabler/icons-svelte-runes/icons/arrow-left';
  import IconDownload from '@tabler/icons-svelte-runes/icons/download';
  import IconFileCheck from '@tabler/icons-svelte-runes/icons/file-check';
  import IconUpload from '@tabler/icons-svelte-runes/icons/upload';
  import IconUsersPlus from '@tabler/icons-svelte-runes/icons/users-plus';
  import { get } from 'svelte/store';

  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
  import PendingButton from '$lib/components/PendingButton.svelte';
  import {
    PEOPLE_IMPORT_MAX_FILE_SIZE_BYTES,
    PEOPLE_IMPORT_MAX_ROWS,
    PEOPLE_IMPORT_TEMPLATE_VERSION,
    acceptedPersonKinds,
    normalisePersonName,
    peopleByNormalisedName,
    type PeopleImportRow,
    validatePeopleImportRow
  } from '$lib/imports/people-import-definition';
  import { DIRECTORY_PAGE_SIZE, clampPage, pageItems } from '$lib/directory';
  import DirectoryPagination from '$lib/components/DirectoryPagination.svelte';
  import { downloadPeopleImportTemplate, parsePeopleWorkbook } from '$lib/imports/people-xlsx';
  import { addPeople, people } from '$lib/people';
  import { personKindLabels } from '$lib/domain';

  type DuplicateDecision = 'create' | 'exclude' | 'defer';

  let rows: PeopleImportRow[] = [];
  let warnings: string[] = [];
  let uploadError = '';
  let selectedFileName = '';
  let isReading = false;
  let isDownloading = false;
  let isCreatingPeople = false;
  let decisions: Record<number, DuplicateDecision> = {};
  let outcome: { created: number; excluded: number; deferred: number } | null = null;
  let confirmDialog: HTMLDialogElement;
  let reviewPage = 1;

  const maximumFileSizeMegabytes = PEOPLE_IMPORT_MAX_FILE_SIZE_BYTES / (1024 * 1024);

  $: readyRows = rows.filter((row) => row.state === 'ready');
  $: reviewRows = rows.filter((row) => row.state === 'review');
  $: excludedRows = rows.filter((row) => row.state === 'excluded');
  $: unresolvedReviews = reviewRows.filter((row) => !decisions[row.rowNumber]);
  $: chosenReviewRows = reviewRows.filter((row) => decisions[row.rowNumber] === 'create');
  $: deferredReviewRows = reviewRows.filter((row) => decisions[row.rowNumber] === 'defer');
  $: importRows = [...readyRows, ...chosenReviewRows];
  $: totalExcluded =
    excludedRows.length + reviewRows.filter((row) => decisions[row.rowNumber] === 'exclude').length;
  $: canConfirmReview =
    unresolvedReviews.length === 0 && (importRows.length > 0 || deferredReviewRows.length > 0);

  $: peopleById = new Map($people.map((person) => [person.id, person]));
  $: reviewPage = clampPage(reviewPage, rows.length, DIRECTORY_PAGE_SIZE);
  $: pagedRows = pageItems(rows, reviewPage, DIRECTORY_PAGE_SIZE);

  function matchingPersonFor(row: PeopleImportRow) {
    return row.possibleMatchId ? peopleById.get(row.possibleMatchId) : undefined;
  }

  async function downloadTemplate(): Promise<void> {
    isDownloading = true;
    uploadError = '';

    try {
      await downloadPeopleImportTemplate();
    } catch {
      uploadError = 'The template could not be downloaded. Please try again.';
    } finally {
      isDownloading = false;
    }
  }

  async function readFile(event: Event): Promise<void> {
    const input = event.currentTarget as HTMLInputElement;
    const file = input.files?.[0];

    rows = [];
    warnings = [];
    decisions = {};
    outcome = null;
    reviewPage = 1;
    uploadError = '';
    selectedFileName = '';

    if (!file) return;

    if (!file.name.toLocaleLowerCase().endsWith('.xlsx')) {
      uploadError = 'Choose an .xlsx workbook.';
      input.value = '';

      return;
    }

    if (file.size > PEOPLE_IMPORT_MAX_FILE_SIZE_BYTES) {
      uploadError = `Choose a workbook smaller than ${maximumFileSizeMegabytes} MB.`;
      input.value = '';

      return;
    }

    isReading = true;

    try {
      const workbook = await parsePeopleWorkbook(file);
      const currentPeople = get(people);
      const existingPeopleByName = peopleByNormalisedName(currentPeople);
      const nameCounts = new Map<string, number>();

      workbook.rows.forEach(({ values }) => {
        const name =
          typeof values.name === 'string' || typeof values.name === 'number'
            ? normalisePersonName(String(values.name))
            : '';

        if (name) nameCounts.set(name, (nameCounts.get(name) ?? 0) + 1);
      });

      rows = workbook.rows.map(({ rowNumber, values }) => {
        const row = validatePeopleImportRow(
          values,
          rowNumber,
          currentPeople,
          new Date(),
          existingPeopleByName
        );
        const hasMatchingWorkbookName = (nameCounts.get(normalisePersonName(row.name)) ?? 0) > 1;

        return row.state === 'ready' && hasMatchingWorkbookName
          ? {
              ...row,
              state: 'review' as const,
              reason: 'Another row in this workbook has the same name.'
            }
          : row;
      });
      warnings = workbook.warnings;
      selectedFileName = file.name;
    } catch (error) {
      uploadError = error instanceof Error ? error.message : 'This workbook could not be read.';
      input.value = '';
    } finally {
      isReading = false;
    }
  }

  function setDecision(rowNumber: number, decision: DuplicateDecision): void {
    decisions = { ...decisions, [rowNumber]: decision };
  }

  function openConfirmation(): void {
    if (!canConfirmReview) return;

    confirmDialog.showModal();
  }

  async function createPeople(): Promise<void> {
    isCreatingPeople = true;

    try {
      await new Promise<void>((resolve) => window.requestAnimationFrame(() => resolve()));

      const created = addPeople(
        importRows.map((row) => ({
          name: row.name,
          kind: row.kind ?? 'person',
          phone: row.phone,
          neighbourhood: row.neighbourhood
        }))
      );

      outcome = {
        created: created.length,
        excluded: totalExcluded,
        deferred: deferredReviewRows.length
      };
      rows = [];
      decisions = {};
      confirmDialog.close();
    } finally {
      isCreatingPeople = false;
    }
  }
</script>

<svelte:head><title>Import people | Eglise</title></svelte:head>

<section class="page import-page">
  <Breadcrumbs items={[{ label: 'People & Membership', href: '/people' }]} />

  <header class="page-head">
    <div>
      <h1 tabindex="-1">Import people</h1>
      <p class="page-intro">
        Upload a {PEOPLE_IMPORT_TEMPLATE_VERSION} workbook, check each result, then create the people
        you approve. New people start unrecognised; this import never creates membership records.
      </p>
    </div>
  </header>

  <ol class="import-steps" aria-label="Import progress">
    <li class:active={!rows.length && !outcome}><span>1</span>Upload</li>
    <li class:active={rows.length > 0 && !outcome}><span>2</span>Review</li>
    <li class:active={outcome !== null}><span>3</span>Complete</li>
  </ol>

  {#if outcome}
    <section class="notice import-outcome" aria-labelledby="import-outcome-title">
      <strong id="import-outcome-title">Import complete</strong>
      <p>
        Created {outcome.created}
        {outcome.created === 1 ? 'person' : 'people'}. Excluded {outcome.excluded}
        {outcome.excluded === 1 ? 'row was' : 'rows were'} not added. Deferred
        {outcome.deferred}
        {outcome.deferred === 1 ? 'row needs' : 'rows need'} later review.
      </p>
      <a class="button primary" href="/people">View people directory</a>
    </section>
  {/if}

  <section class="panel import-upload" aria-labelledby="upload-title">
    <div>
      <h2 id="upload-title">1. Use the {PEOPLE_IMPORT_TEMPLATE_VERSION} template</h2>
      <p>
        Use the columns Full name, Person type, Phone number, Neighbourhood, and Date of birth.
        Accepted person types: {acceptedPersonKinds
          .map((kind) => personKindLabels[kind])
          .join(', ')}.
      </p>
    </div>
    <div class="import-upload-actions">
      <PendingButton
        class="button"
        type="button"
        onclick={downloadTemplate}
        pending={isDownloading}
        pendingLabel="Preparing template…"
        variant="secondary"
      >
        <IconDownload aria-hidden="true" size={18} stroke={1.8} />
        Download {PEOPLE_IMPORT_TEMPLATE_VERSION} template
      </PendingButton>
      <div class="field import-file-field">
        <label for="people-workbook">2. Upload completed workbook</label>
        <input
          id="people-workbook"
          type="file"
          accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          onchange={readFile}
          disabled={isReading}
          aria-describedby="people-workbook-help people-workbook-error"
        />
        <p id="people-workbook-help" class="help">
          .xlsx only, up to {maximumFileSizeMegabytes} MB and {PEOPLE_IMPORT_MAX_ROWS} people.
        </p>
      </div>
    </div>
    {#if isReading}
      <p class="status import-reading">
        <IconUpload aria-hidden="true" size={16} />Reading workbook…
      </p>
    {/if}
    {#if uploadError}
      <p id="people-workbook-error" class="field-error" role="alert">{uploadError}</p>
    {/if}
    {#if warnings.length}
      <div class="notice import-warning" role="status">
        <strong>Workbook warning</strong>
        {#each warnings as warning}<p>{warning}</p>{/each}
      </div>
    {/if}
  </section>

  {#if rows.length && !outcome}
    <section class="panel import-review" aria-labelledby="review-title">
      <div class="import-review-heading">
        <div>
          <h2 id="review-title">Review workbook rows</h2>
          <p>
            {selectedFileName} · {readyRows.length} ready · {reviewRows.length} need review ·
            {excludedRows.length} excluded
          </p>
        </div>
        <span class="row-note">
          Dates of birth are checked only for eligibility and are not shown or saved.
        </span>
      </div>

      <div class="table-wrap">
        <table class="directory import-table">
          <thead>
            <tr>
              <th scope="col">Row</th><th scope="col">Person</th><th scope="col">Type</th><th
                scope="col">Phone</th
              ><th scope="col">Neighbourhood</th><th scope="col">Result</th><th scope="col"
                >Decision</th
              >
            </tr>
          </thead>
          <tbody>
            {#each pagedRows as row (row.rowNumber)}
              <tr
                class:import-excluded={row.state === 'excluded'}
                class:import-review-row={row.state === 'review'}
              >
                <td data-label="Row">{row.rowNumber}</td>
                <td data-label="Person">{row.name || 'No name provided'}</td>
                <td data-label="Type">
                  {row.kind ? personKindLabels[row.kind] : 'Needs correction'}
                </td>
                <td data-label="Phone">{row.phone || 'Not provided'}</td>
                <td data-label="Neighbourhood">{row.neighbourhood || 'Not provided'}</td>
                <td data-label="Result">
                  <span
                    class:member={row.state === 'ready'}
                    class:review={row.state !== 'ready'}
                    class="status">{row.reason}</span
                  >
                </td>
                <td data-label="Decision">
                  {#if row.state === 'review'}
                    <fieldset class="choice-group import-review-choice">
                      <legend>Possible duplicate</legend>
                      {#if matchingPersonFor(row)}
                        <details class="import-compare">
                          <summary>Compare with {matchingPersonFor(row)?.name}</summary>
                          <dl>
                            <div>
                              <dt>Imported</dt>
                              <dd>
                                {row.name} · {row.phone || 'No phone'} · {row.neighbourhood ||
                                  'No neighbourhood'}
                              </dd>
                            </div>
                            <div>
                              <dt>Existing</dt>
                              <dd>
                                {matchingPersonFor(row)?.name} · {matchingPersonFor(row)?.phone ||
                                  'No phone'} · {matchingPersonFor(row)?.neighbourhood ||
                                  'No neighbourhood'}
                              </dd>
                            </div>
                          </dl>
                          <a href={`/people/${matchingPersonFor(row)?.id}`}>Open existing person</a>
                        </details>
                      {/if}
                      <label>
                        <input
                          type="radio"
                          name={`row-${row.rowNumber}`}
                          checked={decisions[row.rowNumber] === 'create'}
                          onchange={() => setDecision(row.rowNumber, 'create')}
                        />
                        Create separately
                      </label>
                      <label>
                        <input
                          type="radio"
                          name={`row-${row.rowNumber}`}
                          checked={decisions[row.rowNumber] === 'exclude'}
                          onchange={() => setDecision(row.rowNumber, 'exclude')}
                        />
                        Exclude row
                      </label>
                      <label>
                        <input
                          type="radio"
                          name={`row-${row.rowNumber}`}
                          checked={decisions[row.rowNumber] === 'defer'}
                          onchange={() => setDecision(row.rowNumber, 'defer')}
                        />
                        Defer for later review
                      </label>
                    </fieldset>
                  {:else if row.state === 'excluded'}
                    <span class="row-note">Excluded</span>
                  {:else}
                    <span class="row-note">Will create</span>
                  {/if}
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>

      <DirectoryPagination
        bind:page={reviewPage}
        pageSize={DIRECTORY_PAGE_SIZE}
        total={rows.length}
      />

      <div class="form-actions">
        <a class="button secondary" href="/people">
          <IconArrowLeft aria-hidden="true" size={18} stroke={1.8} />Cancel
        </a>
        <button
          class="button primary"
          type="button"
          disabled={!canConfirmReview}
          aria-describedby="confirm-import-help"
          onclick={openConfirmation}
        >
          <IconFileCheck aria-hidden="true" size={18} stroke={1.8} />Confirm import
        </button>
      </div>
      <p id="confirm-import-help" class="help">
        {#if unresolvedReviews.length}
          Decide how to handle {unresolvedReviews.length} matching
          {unresolvedReviews.length === 1 ? 'name' : 'names'}: create separately, exclude, or defer.
        {:else if !canConfirmReview}
          No valid rows are available to create or defer.
        {:else}
          {importRows.length}
          {importRows.length === 1 ? 'person is' : 'people are'} ready to create; {deferredReviewRows.length}
          {deferredReviewRows.length === 1 ? ' row is' : ' rows are'} deferred.
        {/if}
      </p>
    </section>
  {/if}
</section>

<dialog bind:this={confirmDialog} aria-labelledby="confirm-import-title">
  <form method="dialog">
    <p class="dialog-context">People &amp; Membership · Import people</p>
    <h2 id="confirm-import-title">Confirm import</h2>
    <p>
      Create exactly {importRows.length}
      {importRows.length === 1 ? 'person' : 'people'}, exclude {totalExcluded}
      {totalExcluded === 1 ? 'row' : 'rows'}, and defer {deferredReviewRows.length}
      {deferredReviewRows.length === 1 ? ' row' : ' rows'}? No membership or attendance records will
      be created.
    </p>
    <div class="dialog-actions">
      <button class="button secondary" value="cancel">
        <IconArrowLeft aria-hidden="true" size={18} stroke={1.8} />Cancel
      </button>
      <PendingButton
        class="button"
        pending={isCreatingPeople}
        pendingLabel="Creating people…"
        type="button"
        onclick={() => void createPeople()}
        variant="primary"
      >
        <IconUsersPlus aria-hidden="true" size={18} stroke={1.8} />Create people
      </PendingButton>
    </div>
  </form>
</dialog>
