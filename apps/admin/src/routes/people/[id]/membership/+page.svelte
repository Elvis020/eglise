<script lang="ts">
  import { beforeNavigate, goto } from '$app/navigation';
  import { page } from '$app/state';
  import { onMount, tick } from 'svelte';
  import IconArrowLeft from '@tabler/icons-svelte-runes/icons/arrow-left';
  import IconDeviceFloppy from '@tabler/icons-svelte-runes/icons/device-floppy';
  import IconEdit from '@tabler/icons-svelte-runes/icons/edit';
  import IconTrash from '@tabler/icons-svelte-runes/icons/trash';
  import IconUserX from '@tabler/icons-svelte-runes/icons/user-x';

  import { isOnOrBefore, type Person } from '$lib/domain';
  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
  import EgliseDatePicker from '$lib/components/EgliseDatePicker.svelte';
  import { people, updatePerson } from '$lib/people';
  import { showToast } from '$lib/toast';

  type MembershipStep = 'assimilation' | 'recognition' | 'remove-note' | 'confirm-removal';

  let form: HTMLFormElement;
  let leaveDialog: HTMLDialogElement;
  let confirmationHeading: HTMLHeadingElement;
  let person: Person | undefined;
  let loadedPersonId = '';
  let dirty = false;
  let pendingNavigation: (() => void) | undefined;
  let assimilationCompletedOn = '';
  let recognisedOn = '';
  let evidence = '';
  let correctionNote = '';
  let membershipError = '';
  let membershipErrors: Record<string, string> = {};
  let membershipStep: MembershipStep = 'assimilation';

  $: person = $people.find((record) => record.id === page.params.id);
  $: if (person && person.id !== loadedPersonId) {
    loadedPersonId = person.id;
    assimilationCompletedOn = person.membership.assimilationCompletedOn;
    recognisedOn = person.membership.recognisedOn;
    evidence = person.membership.evidence;
    correctionNote = '';
    membershipError = '';
    membershipErrors = {};
    membershipStep = 'assimilation';
    dirty = false;
  }

  function focusField(id: string): void {
    void tick().then(() => document.getElementById(id)?.focus());
  }

  function goToRecognition(): void {
    membershipError = '';
    membershipErrors = {};

    if (!assimilationCompletedOn) {
      membershipErrors.assimilationCompletedOn = 'Enter the Assimilation completion date.';
      membershipError = 'Please enter the Assimilation completion date.';
      focusField('assimilation-completed-on');

      return;
    }

    membershipStep = 'recognition';
    focusField('recognised-on');
  }

  function returnToAssimilation(): void {
    membershipError = '';
    membershipErrors = {};
    membershipStep = 'assimilation';
    focusField('assimilation-completed-on');
  }

  function beginMembershipRemoval(): void {
    membershipError = '';
    membershipErrors = {};
    membershipStep = 'remove-note';
    focusField('correction-note');
  }

  function continueToRemovalConfirmation(): void {
    membershipError = '';

    if (!correctionNote.trim()) {
      membershipError = 'Enter a correction note before removing the membership record.';
      focusField('correction-note');

      return;
    }

    membershipStep = 'confirm-removal';
    void tick().then(() => confirmationHeading.focus());
  }

  function returnToRemovalNote(): void {
    membershipStep = 'remove-note';
    focusField('correction-note');
  }

  function saveMembership(): void {
    if (!person) return;

    membershipError = '';
    membershipErrors = {};

    if (!evidence.trim()) {
      membershipErrors.evidence = 'Enter the certificate or register reference.';
    }
    if (!recognisedOn) {
      membershipErrors.recognisedOn = 'Enter the membership recognition date.';
    }
    if (!isOnOrBefore(assimilationCompletedOn, recognisedOn)) {
      membershipErrors.recognisedOn =
        'Membership recognition cannot be before Assimilation is completed.';
    }
    if (Object.keys(membershipErrors).length) {
      membershipError = 'Please correct the highlighted membership fields.';
      focusField(membershipErrors.recognisedOn ? 'recognised-on' : 'evidence');

      return;
    }

    updatePerson({
      ...person,
      membership: {
        recognised: true,
        assimilationCompletedOn,
        evidence: evidence.trim(),
        recognisedOn,
        correctionNote: '',
        history: [
          ...person.membership.history,
          { action: 'recognised', recordedOn: recognisedOn, note: evidence.trim() }
        ]
      }
    });
    dirty = false;
    showToast('Membership record saved.');
    void goto(`/people/${person.id}`);
  }

  function removeMembership(): void {
    if (!person) return;

    updatePerson({
      ...person,
      membership: {
        recognised: false,
        assimilationCompletedOn: '',
        evidence: '',
        recognisedOn: '',
        correctionNote: correctionNote.trim(),
        history: [
          ...person.membership.history,
          {
            action: 'corrected',
            recordedOn: new Date().toISOString().slice(0, 10),
            note: correctionNote.trim()
          }
        ]
      }
    });
    dirty = false;
    showToast('Membership correction saved.');
    void goto(`/people/${person.id}`);
  }

  function handleSubmit(): void {
    if (membershipStep === 'assimilation') goToRecognition();
    else if (membershipStep === 'recognition') saveMembership();
    else if (membershipStep === 'remove-note') continueToRemovalConfirmation();
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

  function handleLogoutRequest(event: Event): void {
    if (!dirty) return;

    event.preventDefault();
    const { continueLogout } = (event as CustomEvent<{ continueLogout: () => Promise<void> }>)
      .detail;

    pendingNavigation = () => {
      void continueLogout();
    };
    leaveDialog.showModal();
  }

  onMount(() => {
    const unload = (event: BeforeUnloadEvent) => {
      if (!dirty) return;

      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', unload);
    document.addEventListener('eglise:before-logout', handleLogoutRequest);

    return () => {
      window.removeEventListener('beforeunload', unload);
      document.removeEventListener('eglise:before-logout', handleLogoutRequest);
    };
  });

  beforeNavigate((navigation) => {
    if (!dirty || navigation.type === 'leave') return;

    navigation.cancel();
    pendingNavigation = () => {
      const destination = navigation.to?.url;

      void goto(
        destination
          ? `${destination.pathname}${destination.search}${destination.hash}`
          : `/people/${page.params.id}`
      );
    };
    leaveDialog.showModal();
  });
</script>

<svelte:head>
  <title
    >{person ? `Record membership for ${person.name} | Eglise` : 'Person not found | Eglise'}</title
  >
</svelte:head>

{#if person}
  <section class="page membership-workflow-page">
    <Breadcrumbs
      items={[
        { label: 'People & Membership', href: '/people' },
        { label: person.name, href: `/people/${person.id}` }
      ]}
    />

    <header class="page-head membership-workflow-head">
      <div>
        <h1 tabindex="-1">
          {person.membership.recognised ? 'Correct membership' : 'Record recognised membership'}
        </h1>
        <p class="page-intro">{person.name} · Membership is a deliberate church recognition.</p>
      </div>
    </header>

    {#if person.kind !== 'person'}
      <section class="panel membership-eligibility" aria-labelledby="membership-eligibility-title">
        <p class="eyebrow">Journey first</p>
        <h2 id="membership-eligibility-title">Record regular attendance before membership</h2>
        <p class="page-intro">
          Membership is a separate church recognition decision after this person is recorded as a
          regular attendee.
        </p>
        <a class="button primary" href={`/people/${person.id}/journey`}>Update journey</a>
      </section>
    {:else}
      {#if membershipStep === 'assimilation' || membershipStep === 'recognition'}
        <ol class="membership-progress" aria-label="Membership recording progress">
          <li aria-current={membershipStep === 'assimilation' ? 'step' : undefined}>
            <span>1</span> Assimilation
          </li>
          <li aria-current={membershipStep === 'recognition' ? 'step' : undefined}>
            <span>2</span> Recognition
          </li>
        </ol>
      {/if}

      <form
        class="panel membership-workflow-form"
        bind:this={form}
        novalidate
        on:input={() => (dirty = true)}
        on:submit|preventDefault={handleSubmit}
      >
        {#if membershipStep === 'assimilation'}
          <h2>Assimilation</h2>
          <p class="page-intro">Start with the date this person completed Assimilation.</p>
          <div class="membership-step">
            <div class="field membership-date-field">
              <label for="assimilation-completed-on">Assimilation completion date</label>
              <EgliseDatePicker
                id="assimilation-completed-on"
                bind:value={assimilationCompletedOn}
                autocomplete="off"
                ariaInvalid={Boolean(membershipErrors.assimilationCompletedOn)}
                ariaDescribedby="assimilation-completed-on-error"
                onchange={() => (dirty = true)}
              />
              <p class="error" id="assimilation-completed-on-error">
                {membershipErrors.assimilationCompletedOn ?? ''}
              </p>
            </div>
          </div>
          <p class="help">Membership is recorded only after Assimilation and church recognition.</p>
          {#if membershipError}<p class="error" role="alert">{membershipError}</p>{/if}
          <div class="form-actions membership-workflow-actions">
            <a class="button secondary" href={`/people/${person.id}`}>
              <IconArrowLeft aria-hidden="true" size={18} stroke={1.8} />
              Cancel
            </a>
            {#if person.membership.recognised}
              <button class="button quiet-button" type="button" on:click={beginMembershipRemoval}>
                Mark as not recorded
              </button>
            {/if}
            <button class="button primary" type="submit">Continue</button>
          </div>
        {:else if membershipStep === 'recognition'}
          <h2>Church recognition</h2>
          <p class="page-intro">Finish the record with the recognition date and its reference.</p>
          <div class="membership-step">
            <div class="field membership-date-field">
              <label for="recognised-on">Membership recognition date</label>
              <EgliseDatePicker
                id="recognised-on"
                bind:value={recognisedOn}
                autocomplete="off"
                ariaInvalid={Boolean(membershipErrors.recognisedOn)}
                ariaDescribedby="recognised-on-error"
                onchange={() => (dirty = true)}
              />
              <p class="error" id="recognised-on-error">{membershipErrors.recognisedOn ?? ''}</p>
            </div>
            <div class="field membership-reference-field">
              <label for="evidence">Certificate or register reference</label>
              <input
                id="evidence"
                bind:value={evidence}
                placeholder="e.g. Recognition register, 2026"
                aria-invalid={Boolean(membershipErrors.evidence)}
                aria-describedby="evidence-error"
              />
              <p class="error" id="evidence-error">{membershipErrors.evidence ?? ''}</p>
            </div>
          </div>
          {#if membershipError}<p class="error" role="alert">{membershipError}</p>{/if}
          <div class="form-actions membership-workflow-actions">
            <button class="button secondary" type="button" on:click={returnToAssimilation}>
              <IconArrowLeft aria-hidden="true" size={18} stroke={1.8} />
              Back
            </button>
            <button class="button primary" type="submit">
              <IconDeviceFloppy aria-hidden="true" size={18} stroke={1.8} />
              Save membership record
            </button>
          </div>
        {:else if membershipStep === 'remove-note'}
          <h2>Correct membership record</h2>
          <p class="page-intro">Explain why this recognised record should be removed.</p>
          <div class="membership-step">
            <div class="field membership-reference-field">
              <label for="correction-note">Correction note</label>
              <input
                id="correction-note"
                bind:value={correctionNote}
                placeholder="Why the record is being corrected"
              />
            </div>
          </div>
          {#if membershipError}<p class="error" role="alert">{membershipError}</p>{/if}
          <div class="form-actions membership-workflow-actions">
            <button class="button secondary" type="button" on:click={returnToAssimilation}>
              <IconArrowLeft aria-hidden="true" size={18} stroke={1.8} />
              Back
            </button>
            <button class="button primary" type="submit">Continue</button>
          </div>
        {:else}
          <h2 bind:this={confirmationHeading} tabindex="-1">Confirm membership correction</h2>
          <p class="page-intro">
            This changes the record from recognised member to not recorded. The correction note
            remains visible.
          </p>
          <div class="form-actions membership-workflow-actions">
            <button class="button secondary" type="button" on:click={returnToRemovalNote}>
              <IconArrowLeft aria-hidden="true" size={18} stroke={1.8} />
              Back
            </button>
            <button class="button danger-button" type="button" on:click={removeMembership}>
              <IconUserX aria-hidden="true" size={18} stroke={1.8} />
              Mark as not recorded
            </button>
          </div>
        {/if}
      </form>
    {/if}
  </section>
{:else}
  <section class="page">
    <Breadcrumbs items={[{ label: 'People & Membership', href: '/people' }]} />

    <h1 tabindex="-1">Person not found</h1>
    <p class="page-intro">This person is not in the current sample.</p>
    <a class="button secondary" href="/people">
      <IconArrowLeft aria-hidden="true" size={18} stroke={1.8} />
      Return to people directory
    </a>
  </section>
{/if}

<dialog bind:this={leaveDialog} aria-labelledby="leave-membership-title">
  <form method="dialog">
    <p class="dialog-context">People &amp; Membership · {person?.name}</p>
    <h2 id="leave-membership-title">Leave membership recording?</h2>
    <p>Your unsaved membership changes will be lost.</p>
    <div class="dialog-actions">
      <button class="button secondary" type="button" on:click={stay}>
        <IconEdit aria-hidden="true" size={18} stroke={1.8} />
        Keep recording
      </button>
      <button class="button danger-button" type="button" on:click={discard}>
        <IconTrash aria-hidden="true" size={18} stroke={1.8} />
        Discard changes
      </button>
    </div>
  </form>
</dialog>

<style>
  .membership-eligibility {
    display: grid;
    gap: 16px;
    max-width: 680px;
  }

  .membership-eligibility h2 {
    margin: 0;
    font: 500 28px/1.15 var(--font-display);
  }
</style>
