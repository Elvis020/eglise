<script lang="ts">
  import { page } from '$app/state';
  import IconArrowLeft from '@tabler/icons-svelte-runes/icons/arrow-left';
  import IconDeviceFloppy from '@tabler/icons-svelte-runes/icons/device-floppy';
  import IconEdit from '@tabler/icons-svelte-runes/icons/edit';
  import IconUserCheck from '@tabler/icons-svelte-runes/icons/user-check';
  import IconUserX from '@tabler/icons-svelte-runes/icons/user-x';

  import type { Person } from '$lib/domain';
  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
  import EgliseDatePicker from '$lib/components/EgliseDatePicker.svelte';
  import EgliseSelect, { type EgliseSelectOption } from '$lib/components/EgliseSelect.svelte';
  import PersonAvatar from '$lib/components/PersonAvatar.svelte';
  import { people, updatePerson } from '$lib/people';
  import { showToast } from '$lib/toast';

  let membershipDialog: HTMLDialogElement;
  let removalDialog: HTMLDialogElement;
  let person: Person | undefined;
  let recognised = false;
  let evidence = '';
  let recognisedOn = '';
  let correctionNote = '';
  let membershipError = '';
  let membershipRecord = 'not-recorded';

  const membershipOptions: EgliseSelectOption[] = [
    { value: 'recognised', label: 'Recognised member' },
    { value: 'not-recorded', label: 'Not recorded' }
  ];

  $: person = $people.find((record) => record.id === page.params.id);
  $: recognised = membershipRecord === 'recognised';

  function openMembership(): void {
    if (!person) return;

    membershipRecord = person.membership.recognised ? 'recognised' : 'not-recorded';
    evidence = person.membership.evidence;
    recognisedOn = person.membership.recognisedOn;
    correctionNote = '';
    membershipError = '';
    membershipDialog.showModal();
  }

  function saveMembership(): void {
    if (!person) return;

    if (recognised && (!evidence.trim() || !recognisedOn)) {
      membershipError = 'Enter both recognition evidence and the recognition date.';

      return;
    }
    if (!recognised && person.membership.recognised && !correctionNote.trim()) {
      membershipError = 'Enter a correction note before removing the membership record.';

      return;
    }
    if (!recognised && person.membership.recognised) {
      removalDialog.showModal();

      return;
    }

    updateMembership();
  }

  function updateMembership(): void {
    if (!person) return;

    updatePerson({
      ...person,
      membership: {
        recognised,
        evidence: recognised ? evidence.trim() : '',
        recognisedOn: recognised ? recognisedOn : '',
        correctionNote: recognised ? '' : correctionNote.trim()
      }
    });
    membershipDialog.close();
    removalDialog.close();
    showToast(recognised ? 'Membership record saved.' : 'Membership correction saved.');
  }
</script>

<svelte:head
  ><title>{person ? `${person.name} — Eglise` : 'Person not found — Eglise'}</title></svelte:head
>

{#if person}
  <section class="page person-detail-page">
    <Breadcrumbs
      items={[{ label: 'People & Membership', href: '/people' }, { label: person.name }]}
    />

    <header class="page-head person-page-head">
      <div class="person-heading">
        <PersonAvatar size="large" />
        <div>
          <h1 tabindex="-1">{person.name}</h1>
          <p class="page-intro">
            Fictional person record. Date of birth is not stored, displayed, or searchable.
          </p>
        </div>
      </div>
    </header>
    <div class="panel person-summary">
      <dl class="detail-list">
        <dt>Phone</dt>
        <dd>{person.phone}</dd>
        <dt>Neighbourhood</dt>
        <dd>{person.neighbourhood}</dd>
        <dt>Membership</dt>
        <dd class="membership-value">{person.membership.recognised ? 'Member' : 'Not a member'}</dd>
        {#if person.membership.recognised}<dt>Recognition evidence</dt>
          <dd>{person.membership.evidence}</dd>
          <dt>Recognised on</dt>
          <dd>{person.membership.recognisedOn}</dd>{/if}{#if person.membership.correctionNote}<dt>
            Correction note
          </dt>
          <dd>{person.membership.correctionNote}</dd>{/if}
      </dl>
      <button class="button primary" type="button" on:click={openMembership}>
        {#if person.membership.recognised}
          <IconEdit aria-hidden="true" size={18} stroke={1.8} />
        {:else}
          <IconUserCheck aria-hidden="true" size={18} stroke={1.8} />
        {/if}
        {person.membership.recognised ? 'Correct membership' : 'Record membership'}
      </button>
    </div>
    <p class="membership-note">
      Membership is recorded only after church recognition. It is never inferred from imports or
      attendance.
    </p>
  </section>
{:else}
  <section class="page">
    <Breadcrumbs
      items={[{ label: 'People & Membership', href: '/people' }, { label: 'Person not found' }]}
    />

    <h1 tabindex="-1">Person not found</h1>
    <p class="page-intro">This fictional person is not in the current in-memory sample.</p>
    <a class="button secondary" href="/people">
      <IconArrowLeft aria-hidden="true" size={18} stroke={1.8} />
      Return to people directory
    </a>
  </section>
{/if}

<dialog bind:this={membershipDialog} aria-labelledby="membership-title">
  <form method="dialog" on:submit|preventDefault={saveMembership}>
    <p class="dialog-context">People &amp; Membership · {person?.name}</p>
    <h2 id="membership-title">
      {person?.membership.recognised ? 'Correct membership record' : 'Record recognised membership'}
    </h2>
    <div class="field">
      <label for="membership-status">Membership record</label><EgliseSelect
        id="membership-status"
        bind:value={membershipRecord}
        options={membershipOptions}
      />
    </div>
    {#if recognised}<div class="field">
        <label for="evidence">Recognition evidence or reference</label><input
          id="evidence"
          bind:value={evidence}
          placeholder="e.g. Recognition register, 2026"
        /><label for="recognised-on">Recognition date</label><EgliseDatePicker
          id="recognised-on"
          bind:value={recognisedOn}
          autocomplete="off"
        />
      </div>{:else if person?.membership.recognised}<div class="field">
        <label for="correction-note">Correction note</label><input
          id="correction-note"
          bind:value={correctionNote}
          placeholder="Why the record is being corrected"
        />
      </div>{/if}
    <p class="help">
      Membership is recorded only after the church's recognition and paperwork process.
    </p>
    {#if membershipError}<p class="error" role="alert">{membershipError}</p>{/if}
    <div class="dialog-actions">
      <button class="button secondary" value="cancel">
        <IconArrowLeft aria-hidden="true" size={18} stroke={1.8} />
        Cancel
      </button><button class="button primary" type="submit">
        <IconDeviceFloppy aria-hidden="true" size={18} stroke={1.8} />
        Save membership record
      </button>
    </div>
  </form>
</dialog>

<dialog bind:this={removalDialog} aria-labelledby="removal-title">
  <form method="dialog">
    <p class="dialog-context">People &amp; Membership · {person?.name}</p>
    <h2 id="removal-title">Confirm membership correction</h2>
    <p>
      This changes the record from recognised member to not recorded. The correction note remains
      visible.
    </p>
    <div class="dialog-actions">
      <button class="button secondary" value="cancel">
        <IconArrowLeft aria-hidden="true" size={18} stroke={1.8} />
        Cancel
      </button><button class="button danger-button" type="button" on:click={updateMembership}>
        <IconUserX aria-hidden="true" size={18} stroke={1.8} />
        Mark as not recorded
      </button>
    </div>
  </form>
</dialog>
