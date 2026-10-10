<script lang="ts">
  import { goto } from '$app/navigation';
  import IconArrowLeft from '@tabler/icons-svelte-runes/icons/arrow-left';
  import IconSchool from '@tabler/icons-svelte-runes/icons/school';

  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
  import { addCareSchoolTopic } from '$lib/care-school';
  import { showToast } from '$lib/toast';

  let title = $state('');
  let nextStep = $state('');
  let error = $state('');

  function saveTopic(): void {
    error = '';

    if (!title.trim() || !nextStep.trim()) {
      error = 'Add a topic and possible next step before saving.';

      return;
    }

    addCareSchoolTopic({ nextStep: nextStep.trim(), title: title.trim() });
    showToast('Programme topic added to the synthetic register.');
    void goto('/care-school');
  }
</script>

<svelte:head><title>Add Care School topic | Eglise</title></svelte:head>

<section class="page care-school-topic-entry-page">
  <Breadcrumbs items={[{ label: 'Care School', href: '/care-school' }, { label: 'Add topic' }]} />
  <header class="page-head care-school-topic-entry-head">
    <div>
      <h1 tabindex="-1">Add a programme topic</h1>
      <p class="page-intro">
        Capture a topic for discussion. It does not create a participant record or a booking.
      </p>
    </div>
  </header>

  <form
    class="panel care-school-topic-entry-form"
    novalidate
    onsubmit={(event) => {
      event.preventDefault();
      saveTopic();
    }}
  >
    {#if error}<p class="error" role="alert">{error}</p>{/if}
    <div class="care-school-topic-entry-fields">
      <div class="field">
        <label for="care-school-topic-title">Topic</label>
        <input
          bind:value={title}
          id="care-school-topic-title"
          placeholder="For example, Foundations of care and prayer"
        />
      </div>
      <div class="field">
        <label for="care-school-next-step">Possible next step</label>
        <textarea
          bind:value={nextStep}
          id="care-school-next-step"
          placeholder="For example, Agree who should facilitate this topic"
          rows="3"
        ></textarea>
      </div>
    </div>
    <div class="form-actions care-school-topic-entry-actions">
      <a class="button secondary" href="/care-school"
        ><IconArrowLeft aria-hidden="true" size={18} stroke={1.8} />Cancel</a
      >
      <button class="button primary" type="submit"
        ><IconSchool aria-hidden="true" size={18} stroke={1.8} />Add topic</button
      >
    </div>
  </form>
</section>

<style>
  .care-school-topic-entry-page {
    max-width: 760px;
  }
  .care-school-topic-entry-head {
    display: block;
  }
  .care-school-topic-entry-form {
    padding: 24px;
  }
  .care-school-topic-entry-fields {
    display: grid;
    gap: 20px;
  }
  .care-school-topic-entry-form textarea {
    width: 100%;
    min-height: 96px;
    padding: 9px 11px;
    border: 2px solid var(--border);
    border-radius: 8px;
    color: var(--text-primary);
    background: #fffdf8;
    resize: vertical;
  }
  .care-school-topic-entry-form textarea:focus {
    outline: 0;
    border-color: #6f8b75;
    box-shadow: 0 0 0 2px rgb(49 84 59 / 12%);
  }
  .care-school-topic-entry-actions {
    justify-content: flex-end;
  }
  @media (max-width: 960px) {
    .care-school-topic-entry-form {
      padding: 16px;
    }
    .care-school-topic-entry-actions {
      display: grid;
      justify-content: stretch;
    }
    .care-school-topic-entry-actions .button {
      justify-content: center;
    }
  }
</style>
