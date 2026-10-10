<script lang="ts">
  import { goto } from '$app/navigation';
  import IconArrowLeft from '@tabler/icons-svelte-runes/icons/arrow-left';
  import IconBook2 from '@tabler/icons-svelte-runes/icons/book-2';

  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
  import EgliseSelect, { type EgliseSelectOption } from '$lib/components/EgliseSelect.svelte';
  import {
    addStudyMaterial,
    studyMaterialFormats,
    type StudyMaterialFormat
  } from '$lib/bible-study';
  import { showToast } from '$lib/toast';

  const formatOptions: EgliseSelectOption[] = studyMaterialFormats;

  let title = $state('');
  let source = $state('');
  let format = $state<StudyMaterialFormat>('study-outline');
  let error = $state('');

  function saveStudyMaterial(): void {
    error = '';

    if (!title.trim() || !source.trim()) {
      error = 'Add a title and source reference before saving this material.';

      return;
    }

    addStudyMaterial({ format, source: source.trim(), title: title.trim() });
    showToast('Study material added to the synthetic register.');
    void goto('/bible-study');
  }
</script>

<svelte:head><title>Add study material | Eglise</title></svelte:head>

<section class="page study-material-entry-page">
  <Breadcrumbs
    items={[{ label: 'Bible Study', href: '/bible-study' }, { label: 'Add material' }]}
  />
  <header class="page-head study-material-entry-head">
    <div>
      <h1 tabindex="-1">Add study material</h1>
      <p class="page-intro">
        Record the source the team wants to use. This does not create a class, group, or learner
        record.
      </p>
    </div>
  </header>

  <form
    class="panel study-material-entry-form"
    novalidate
    onsubmit={(event) => {
      event.preventDefault();
      saveStudyMaterial();
    }}
  >
    {#if error}<p class="error" role="alert">{error}</p>{/if}
    <div class="study-material-entry-fields">
      <div class="field">
        <label for="study-material-title">Material title</label>
        <input
          bind:value={title}
          id="study-material-title"
          placeholder="For example, Hope in difficult seasons"
        />
      </div>
      <div class="field">
        <label for="study-material-format">Format</label>
        <EgliseSelect bind:value={format} id="study-material-format" options={formatOptions} />
      </div>
      <div class="field study-material-source-field">
        <label for="study-material-source">Sermon or source reference</label>
        <textarea
          bind:value={source}
          id="study-material-source"
          placeholder="For example, Sunday sermon on 6 October — Pastor Ama"
          rows="3"
        ></textarea>
      </div>
    </div>
    <div class="form-actions study-material-entry-actions">
      <a class="button secondary" href="/bible-study"
        ><IconArrowLeft aria-hidden="true" size={18} stroke={1.8} />Cancel</a
      >
      <button class="button primary" type="submit"
        ><IconBook2 aria-hidden="true" size={18} stroke={1.8} />Add material</button
      >
    </div>
  </form>
</section>

<style>
  .study-material-entry-page {
    max-width: 760px;
  }
  .study-material-entry-head {
    display: block;
  }
  .study-material-entry-form {
    padding: 24px;
  }
  .study-material-entry-fields {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 20px;
  }
  .study-material-source-field {
    grid-column: 1 / -1;
  }
  .study-material-entry-form textarea {
    width: 100%;
    min-height: 96px;
    padding: 9px 11px;
    border: 2px solid var(--border);
    border-radius: 8px;
    color: var(--text-primary);
    background: #fffdf8;
    resize: vertical;
  }
  .study-material-entry-form textarea:focus {
    outline: 0;
    border-color: #6f8b75;
    box-shadow: 0 0 0 2px rgb(49 84 59 / 12%);
  }
  .study-material-entry-actions {
    justify-content: flex-end;
  }
  @media (max-width: 720px) {
    .study-material-entry-form {
      padding: 16px;
    }
    .study-material-entry-fields {
      grid-template-columns: 1fr;
    }
    .study-material-source-field {
      grid-column: auto;
    }
    .study-material-entry-actions {
      display: grid;
      justify-content: stretch;
    }
    .study-material-entry-actions .button {
      justify-content: center;
    }
  }
</style>
