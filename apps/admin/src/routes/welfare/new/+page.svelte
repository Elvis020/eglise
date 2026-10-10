<script lang="ts">
  import { goto } from '$app/navigation';
  import IconArrowLeft from '@tabler/icons-svelte-runes/icons/arrow-left';
  import IconHeartHandshake from '@tabler/icons-svelte-runes/icons/heart-handshake';

  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
  import EgliseSelect, { type EgliseSelectOption } from '$lib/components/EgliseSelect.svelte';
  import {
    addWelfareDiscoveryItem,
    welfareDiscoveryAreas,
    type WelfareDiscoveryArea
  } from '$lib/welfare';
  import { showToast } from '$lib/toast';

  const areaOptions: EgliseSelectOption[] = welfareDiscoveryAreas;

  let title = $state('');
  let area = $state<WelfareDiscoveryArea>('contributions');
  let decision = $state('');
  let error = $state('');

  function saveDiscoveryItem(): void {
    error = '';

    if (!title.trim() || !decision.trim()) {
      error = 'Add a topic and the decision that is still needed before saving.';

      return;
    }

    addWelfareDiscoveryItem({ area, decision: decision.trim(), title: title.trim() });
    showToast('Welfare discovery item added to the synthetic register.');
    void goto('/welfare');
  }
</script>

<svelte:head><title>Add welfare discovery item | Eglise</title></svelte:head>

<section class="page welfare-discovery-entry-page">
  <Breadcrumbs items={[{ label: 'Welfare', href: '/welfare' }, { label: 'Add discovery item' }]} />
  <header class="page-head welfare-discovery-entry-head">
    <div>
      <h1 tabindex="-1">Add a discovery item</h1>
      <p class="page-intro">
        Record a policy or ownership question only. Do not enter a person, contribution, amount, or
        assistance case.
      </p>
    </div>
  </header>

  <form
    class="panel welfare-discovery-entry-form"
    novalidate
    onsubmit={(event) => {
      event.preventDefault();
      saveDiscoveryItem();
    }}
  >
    {#if error}<p class="error" role="alert">{error}</p>{/if}
    <div class="welfare-discovery-entry-fields">
      <div class="field">
        <label for="welfare-discovery-title">Topic</label>
        <input
          bind:value={title}
          id="welfare-discovery-title"
          placeholder="For example, Who approves recurring support?"
        />
      </div>
      <div class="field">
        <label for="welfare-discovery-area">Area</label>
        <EgliseSelect bind:value={area} id="welfare-discovery-area" options={areaOptions} />
      </div>
      <div class="field welfare-discovery-decision-field">
        <label for="welfare-discovery-decision">Decision needed</label>
        <textarea
          bind:value={decision}
          id="welfare-discovery-decision"
          placeholder="For example, Define who can request, approve, and correct this type of support."
          rows="3"
        ></textarea>
      </div>
    </div>
    <div class="form-actions welfare-discovery-entry-actions">
      <a class="button secondary" href="/welfare"
        ><IconArrowLeft aria-hidden="true" size={18} stroke={1.8} />Cancel</a
      >
      <button class="button primary" type="submit"
        ><IconHeartHandshake aria-hidden="true" size={18} stroke={1.8} />Add discovery item</button
      >
    </div>
  </form>
</section>

<style>
  .welfare-discovery-entry-page {
    max-width: 760px;
  }
  .welfare-discovery-entry-head {
    display: block;
  }
  .welfare-discovery-entry-form {
    padding: 24px;
  }
  .welfare-discovery-entry-fields {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 20px;
  }
  .welfare-discovery-decision-field {
    grid-column: 1 / -1;
  }
  .welfare-discovery-entry-form textarea {
    width: 100%;
    min-height: 96px;
    padding: 9px 11px;
    border: 2px solid var(--border);
    border-radius: 8px;
    color: var(--text-primary);
    background: #fffdf8;
    resize: vertical;
  }
  .welfare-discovery-entry-form textarea:focus {
    outline: 0;
    border-color: #6f8b75;
    box-shadow: 0 0 0 2px rgb(49 84 59 / 12%);
  }
  .welfare-discovery-entry-actions {
    justify-content: flex-end;
  }
  @media (max-width: 960px) {
    .welfare-discovery-entry-form {
      padding: 16px;
    }
    .welfare-discovery-entry-fields {
      grid-template-columns: 1fr;
    }
    .welfare-discovery-decision-field {
      grid-column: auto;
    }
    .welfare-discovery-entry-actions {
      display: grid;
      justify-content: stretch;
    }
    .welfare-discovery-entry-actions .button {
      justify-content: center;
    }
  }
</style>
