<script lang="ts">
  import { goto } from '$app/navigation';
  import IconArrowLeft from '@tabler/icons-svelte-runes/icons/arrow-left';
  import IconLink from '@tabler/icons-svelte-runes/icons/link';

  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
  import EgliseSelect, { type EgliseSelectOption } from '$lib/components/EgliseSelect.svelte';
  import { addResource, resourceKinds, type ResourceKind } from '$lib/resources';
  import { showToast } from '$lib/toast';

  const resourceKindOptions: EgliseSelectOption[] = resourceKinds;

  let title = $state('');
  let kind = $state<ResourceKind>('church-note');
  let url = $state('');
  let note = $state('');
  let error = $state('');

  function saveResource(): void {
    error = '';

    let parsedUrl: URL;

    try {
      parsedUrl = new URL(url.trim());
    } catch {
      error = 'Enter a complete link, beginning with https://.';

      return;
    }

    if (!title.trim() || !['http:', 'https:'].includes(parsedUrl.protocol)) {
      error = title.trim()
        ? 'Enter a web link beginning with https://.'
        : 'Add a title before saving this resource.';

      return;
    }

    addResource({ kind, note: note.trim(), title: title.trim(), url: parsedUrl.toString() });
    showToast('Resource added to the shared register.');
    void goto('/resources');
  }
</script>

<svelte:head><title>Add resource | Eglise</title></svelte:head>

<section class="page resource-entry-page">
  <Breadcrumbs items={[{ label: 'Resources', href: '/resources' }, { label: 'Add resource' }]} />
  <header class="page-head resource-entry-head">
    <div>
      <h1 tabindex="-1">Add a resource</h1>
      <p class="page-intro">
        Record an existing link. This pilot does not upload or host material.
      </p>
    </div>
  </header>

  <form
    class="panel resource-entry-form"
    novalidate
    onsubmit={(event) => {
      event.preventDefault();
      saveResource();
    }}
  >
    {#if error}<p class="error" role="alert">{error}</p>{/if}
    <div class="resource-entry-fields">
      <div class="field">
        <label for="resource-title">Title</label>
        <input
          bind:value={title}
          id="resource-title"
          placeholder="For example, Sunday teaching notes"
        />
      </div>
      <div class="field">
        <label for="resource-kind">Type</label>
        <EgliseSelect bind:value={kind} id="resource-kind" options={resourceKindOptions} />
      </div>
      <div class="field resource-link-field">
        <label for="resource-url">Existing link</label>
        <input
          bind:value={url}
          id="resource-url"
          inputmode="url"
          placeholder="https://t.me/..."
          type="url"
        />
        <p class="help">
          The link opens in its current channel or host; Eglise does not copy the material.
        </p>
      </div>
      <div class="field resource-note-field">
        <label for="resource-note">Short note <span class="field-optional">Optional</span></label>
        <textarea
          bind:value={note}
          id="resource-note"
          placeholder="What is this useful for?"
          rows="3"
        ></textarea>
      </div>
    </div>
    <div class="form-actions resource-entry-actions">
      <a class="button secondary" href="/resources"
        ><IconArrowLeft aria-hidden="true" size={18} stroke={1.8} />Cancel</a
      >
      <button class="button primary" type="submit"
        ><IconLink aria-hidden="true" size={18} stroke={1.8} />Add resource</button
      >
    </div>
  </form>
</section>

<style>
  .resource-entry-page {
    max-width: 760px;
  }
  .resource-entry-head {
    display: block;
  }
  .resource-entry-form {
    padding: 24px;
  }
  .resource-entry-fields {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 20px;
  }
  .resource-link-field,
  .resource-note-field {
    grid-column: 1 / -1;
  }
  .resource-entry-form textarea {
    width: 100%;
    min-height: 96px;
    padding: 9px 11px;
    border: 2px solid var(--border);
    border-radius: 8px;
    color: var(--text-primary);
    background: #fffdf8;
    resize: vertical;
  }
  .resource-entry-form textarea:focus {
    outline: 0;
    border-color: #6f8b75;
    box-shadow: 0 0 0 2px rgb(49 84 59 / 12%);
  }
  .resource-entry-actions {
    justify-content: flex-end;
  }
  @media (max-width: 720px) {
    .resource-entry-form {
      padding: 16px;
    }
    .resource-entry-fields {
      grid-template-columns: 1fr;
    }
    .resource-link-field,
    .resource-note-field {
      grid-column: auto;
    }
    .resource-entry-actions {
      display: grid;
      justify-content: stretch;
    }
    .resource-entry-actions .button {
      justify-content: center;
    }
  }
</style>
