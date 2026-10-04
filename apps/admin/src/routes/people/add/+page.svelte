<script lang="ts">
  import { beforeNavigate, goto } from '$app/navigation';
  import { onMount } from 'svelte';

  import { MINIMUM_AGE, createPerson, isEligible, isValidPhone } from '$lib/domain';
  import { addPerson } from '$lib/people';
  import { showToast } from '$lib/toast';

  let form: HTMLFormElement;
  let leaveDialog: HTMLDialogElement;
  let dirty = false;
  let pendingNavigation: (() => void) | undefined;
  let name = '';
  let phone = '';
  let neighbourhood = '';
  let dateOfBirth = '';
  let errors: Record<string, string> = {};

  function validate(): boolean {
    errors = {};

    if (!name.trim()) errors.name = "Enter the person's name.";
    if (!isValidPhone(phone))
      errors.phone = 'Enter a Ghanaian mobile number or an international E.164 number.';
    if (!neighbourhood.trim()) errors.neighbourhood = 'Enter a neighbourhood.';
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
    addPerson(createPerson(name, phone, neighbourhood));
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
    pendingNavigation = () => void goto(navigation.to?.url.pathname ?? '/people');
    leaveDialog.showModal();
  });
</script>

<svelte:head><title>Add a person — Eglise</title></svelte:head>

<section class="page">
  <header class="page-head">
    <div>
      <p class="eyebrow">People &amp; Membership</p>
      <h1 tabindex="-1">Add a person</h1>
      <p class="page-intro">
        Create a fictional record. Date of birth is used only for the age check, then discarded.
      </p>
    </div>
  </header>

  <form
    class="panel"
    bind:this={form}
    on:submit|preventDefault={submit}
    on:input={() => (dirty = true)}
    novalidate
  >
    {#if Object.keys(errors).length}
      <p class="error" role="alert">Please correct the highlighted fields.</p>
    {/if}
    <div class="form-grid">
      <div class="field">
        <label for="name">Full name</label>
        <input
          id="name"
          bind:value={name}
          autocomplete="name"
          aria-invalid={Boolean(errors.name)}
          aria-describedby="name-error"
        />
        <p class="error" id="name-error">{errors.name ?? ''}</p>
      </div>
      <div class="field">
        <label for="phone">Phone number</label>
        <input
          id="phone"
          bind:value={phone}
          inputmode="tel"
          autocomplete="tel"
          aria-invalid={Boolean(errors.phone)}
          aria-describedby="phone-help phone-error"
        />
        <p class="help" id="phone-help">
          Use a Ghanaian mobile number or international E.164 number. A shared number is valid.
        </p>
        <p class="error" id="phone-error">{errors.phone ?? ''}</p>
      </div>
      <div class="field">
        <label for="neighbourhood">Neighbourhood</label>
        <input
          id="neighbourhood"
          bind:value={neighbourhood}
          aria-invalid={Boolean(errors.neighbourhood)}
          aria-describedby="neighbourhood-error"
        />
        <p class="error" id="neighbourhood-error">{errors.neighbourhood ?? ''}</p>
      </div>
      <div class="field">
        <label for="dateOfBirth">Date of birth</label>
        <input
          id="dateOfBirth"
          bind:value={dateOfBirth}
          type="date"
          aria-invalid={Boolean(errors.dateOfBirth)}
          aria-describedby="dob-help dob-error"
        />
        <p class="help" id="dob-help">
          Private: checked against the pilot minimum age of {MINIMUM_AGE}; never shown, stored, or
          searchable.
        </p>
        <p class="error" id="dob-error">{errors.dateOfBirth ?? ''}</p>
      </div>
    </div>
    <div class="form-actions">
      <a class="button secondary" href="/people">Cancel</a><button
        class="button primary"
        type="submit">Save person</button
      >
    </div>
  </form>
</section>

<dialog bind:this={leaveDialog} aria-labelledby="leave-title">
  <form method="dialog">
    <h2 id="leave-title">Leave unsaved entry?</h2>
    <p>Your fictional entry will be lost. It is not stored anywhere.</p>
    <div class="dialog-actions">
      <button class="button secondary" type="button" on:click={stay}>Keep editing</button><button
        class="button danger-button"
        type="button"
        on:click={discard}>Discard entry</button
      >
    </div>
  </form>
</dialog>
