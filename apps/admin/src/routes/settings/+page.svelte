<script lang="ts">
  import { goto } from '$app/navigation';
  import IconArrowLeft from '@tabler/icons-svelte-runes/icons/arrow-left';
  import IconDeviceFloppy from '@tabler/icons-svelte-runes/icons/device-floppy';

  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
  import { prototypeSession, updatePrototypeChurchName } from '$lib/prototype-session';
  import { showToast } from '$lib/toast';

  let churchName = $state('');
  let error = $state('');
  let hasEditedChurchName = $state(false);

  $effect(() => {
    if (!hasEditedChurchName) {
      churchName = $prototypeSession.churchName;
    }
  });

  function saveChurchName(event: SubmitEvent) {
    event.preventDefault();

    const nextName = churchName.trim().replace(/\s+/g, ' ');

    if (!nextName) {
      error = 'Enter a church name.';

      return;
    }

    if (!updatePrototypeChurchName(nextName)) {
      error = 'This browser could not save the church name.';

      return;
    }

    churchName = nextName;
    error = '';
    hasEditedChurchName = false;
    showToast('Church name saved.');
  }
</script>

<svelte:head><title>Church settings | {$prototypeSession.churchName}</title></svelte:head>

<section class="page settings-page">
  <Breadcrumbs items={[{ label: 'Settings' }]} />

  <header class="page-head">
    <div>
      <h1 tabindex="-1">Church settings</h1>
      <p class="page-intro">Set the name shown across this church workspace.</p>
    </div>
  </header>

  <form class="panel settings-form" onsubmit={saveChurchName}>
    <div class="field">
      <label for="church-name">Church name</label>
      <input
        aria-describedby={error ? 'church-name-error' : undefined}
        aria-invalid={error ? 'true' : undefined}
        id="church-name"
        maxlength="80"
        name="churchName"
        oninput={() => {
          error = '';
          hasEditedChurchName = true;
        }}
        required
        type="text"
        bind:value={churchName}
      />
      <p class="help">This name stays on this device for the prototype.</p>
      {#if error}
        <p class="field-error" id="church-name-error" role="alert">{error}</p>
      {/if}
    </div>

    <div class="settings-actions">
      <button class="button secondary" onclick={() => void goto('/people')} type="button">
        <IconArrowLeft aria-hidden="true" size={18} stroke={1.8} />
        Back to people
      </button>
      <button class="button primary" type="submit">
        <IconDeviceFloppy aria-hidden="true" size={18} stroke={1.8} />
        Save church name
      </button>
    </div>
  </form>
</section>
