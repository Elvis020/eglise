<script lang="ts">
  import { beforeNavigate, goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import IconArrowLeft from '@tabler/icons-svelte-runes/icons/arrow-left';
  import IconDeviceFloppy from '@tabler/icons-svelte-runes/icons/device-floppy';
  import IconEdit from '@tabler/icons-svelte-runes/icons/edit';
  import IconTrash from '@tabler/icons-svelte-runes/icons/trash';

  import {
    MINIMUM_AGE,
    createPerson,
    isEligible,
    type PersonKind,
    type PersonDetailsErrors,
    validatePersonDetails
  } from '$lib/domain';
  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
  import PersonDetailsFields from '$lib/components/PersonDetailsFields.svelte';
  import { addPerson } from '$lib/people';
  import { showToast } from '$lib/toast';
  import EgliseDatePicker from '$lib/components/EgliseDatePicker.svelte';

  let form: HTMLFormElement;
  let leaveDialog: HTMLDialogElement;
  let dirty = false;
  let pendingNavigation: (() => void) | undefined;
  let name = '';
  let kind: PersonKind = 'person';
  let phone = '';
  let neighbourhood = '';
  let dateOfBirth = '';
  let errors: PersonDetailsErrors & { dateOfBirth?: string } = {};

  function validate(): boolean {
    errors = {};

    errors = validatePersonDetails({ name, kind, phone, neighbourhood });
    if (!isEligible(dateOfBirth))
      errors.dateOfBirth = `This pilot records people aged ${MINIMUM_AGE} or over.`;

    return Object.keys(errors).length === 0;
  }

  function submit(): void {
    if (!validate()) {
      const firstError = Object.keys(errors)[0];

      document.getElementById(firstError)?.focus();

      return;
    }

    // DOB is intentionally not passed into the person record after this eligibility check.
    addPerson(createPerson(name, phone, neighbourhood, kind));
    dirty = false;
    showToast('Person saved. Their date of birth was discarded after the eligibility check.');
    void goto('/people');
  }

  function discard(): void {
    dirty = false;
    leaveDialog.close();
    pendingNavigation?.();
  }

  function stay(): void {
    pendingNavigation = undefined;
    leaveDialog.close();
    form.focus();
  }

  onMount(() => {
    const unload = (event: BeforeUnloadEvent) => {
      if (!dirty) return;

      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', unload);

    return () => window.removeEventListener('beforeunload', unload);
  });

  beforeNavigate((navigation) => {
    if (!dirty || navigation.type === 'leave') return;

    navigation.cancel();
    pendingNavigation = () => {
      const destination = navigation.to?.url;

      void goto(
        destination ? `${destination.pathname}${destination.search}${destination.hash}` : '/people'
      );
    };
    leaveDialog.showModal();
  });
</script>

<svelte:head><title>Add a person | Eglise</title></svelte:head>

<section class="page">
  <Breadcrumbs items={[{ label: 'People & Membership', href: '/people' }]} />

  <header class="page-head">
    <div>
      <h1 tabindex="-1">Add a person</h1>
      <p class="page-intro">
        Create a person record. Date of birth is used only for the age check, then discarded.
      </p>
    </div>
  </header>

  <form
    class="panel person-entry-form"
    bind:this={form}
    on:submit|preventDefault={submit}
    on:input={() => (dirty = true)}
    novalidate
  >
    {#if Object.keys(errors).length}
      <p class="error" role="alert">Please correct the highlighted fields.</p>
    {/if}
    <div class="person-entry-fields">
      <PersonDetailsFields
        bind:name
        bind:kind
        bind:phone
        bind:neighbourhood
        {errors}
        onchange={() => (dirty = true)}
      />
      <div class="field">
        <label for="dateOfBirth">Date of birth</label>
        <EgliseDatePicker
          id="dateOfBirth"
          bind:value={dateOfBirth}
          ariaInvalid={Boolean(errors.dateOfBirth)}
          ariaDescribedby="dob-help dob-error"
          onchange={() => (dirty = true)}
        />
        <p class="help" id="dob-help">
          Private: checked against the pilot minimum age of {MINIMUM_AGE}; never shown, stored, or
          searchable.
        </p>
        <p class="error" id="dob-error">{errors.dateOfBirth ?? ''}</p>
      </div>
    </div>
    <div class="form-actions person-entry-actions">
      <a class="button secondary" href="/people">
        <IconArrowLeft aria-hidden="true" size={18} stroke={1.8} />
        Cancel
      </a><button class="button primary" type="submit">
        <IconDeviceFloppy aria-hidden="true" size={18} stroke={1.8} />
        Save person
      </button>
    </div>
  </form>
</section>

<dialog bind:this={leaveDialog} aria-labelledby="leave-title">
  <form method="dialog">
    <p class="dialog-context">People &amp; Membership · Add a person</p>
    <h2 id="leave-title">Leave unsaved entry?</h2>
    <p>Your entry will be lost when the page refreshes. It is not stored anywhere.</p>
    <div class="dialog-actions">
      <button class="button secondary" type="button" on:click={stay}>
        <IconEdit aria-hidden="true" size={18} stroke={1.8} />
        Keep editing
      </button><button class="button danger-button" type="button" on:click={discard}>
        <IconTrash aria-hidden="true" size={18} stroke={1.8} />
        Discard entry
      </button>
    </div>
  </form>
</dialog>
