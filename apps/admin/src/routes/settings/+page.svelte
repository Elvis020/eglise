<script lang="ts">
  import { enhance } from '$app/forms';
  import { goto } from '$app/navigation';
  import type { SubmitFunction } from '@sveltejs/kit';
  import IconArrowLeft from '@tabler/icons-svelte-runes/icons/arrow-left';
  import IconDeviceFloppy from '@tabler/icons-svelte-runes/icons/device-floppy';

  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
  import EgliseSelect, { type EgliseSelectOption } from '$lib/components/EgliseSelect.svelte';
  import PendingButton from '$lib/components/PendingButton.svelte';
  import { prototypeSession, updatePrototypeChurchName } from '$lib/prototype-session';
  import { showToast } from '$lib/toast';

  let { data, form } = $props();

  let churchName = $state('');
  let error = $state('');
  let hasEditedChurchName = $state(false);
  let inviteEmail = $state('');
  let inviteEmailTouched = $state(false);
  let inviteRole = $state('people_editor');
  let isCreatingInvitation = $state(false);
  let isCopyingInvitation = $state(false);

  const inviteRoleOptions: EgliseSelectOption[] = [
    {
      value: 'people_administrator',
      label: 'Administrator'
    },
    { value: 'people_editor', label: 'Editor' },
    { value: 'people_viewer', label: 'Viewer' }
  ];

  const inviteEmailError = $derived(
    !inviteEmail.trim()
      ? 'Enter an email address.'
      : /^\S+@\S+\.\S+$/.test(inviteEmail.trim())
        ? ''
        : 'Enter a valid email address.'
  );
  const canCreateInvitation = $derived(!inviteEmailError);

  $effect(() => {
    if (!hasEditedChurchName) {
      churchName = $prototypeSession.churchName;
    }
  });

  $effect(() => {
    if (form?.role) {
      inviteRole = form.role;
    }
  });

  $effect(() => {
    if (!inviteEmailTouched && form?.email) {
      inviteEmail = form.email;
    }
  });

  const trackInvitationCreation: SubmitFunction = () => {
    isCreatingInvitation = true;

    return async ({ update }) => {
      try {
        await update();
      } finally {
        isCreatingInvitation = false;
      }
    };
  };

  async function copyInvitationLink(link: string): Promise<void> {
    isCopyingInvitation = true;

    try {
      await navigator.clipboard.writeText(link);
      showToast('Invitation link copied.');
    } finally {
      isCopyingInvitation = false;
    }
  }

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
      <p class="page-intro">
        {data.authMode === 'supabase'
          ? 'Manage access for this church workspace.'
          : 'Set the name shown across this church workspace.'}
      </p>
    </div>
  </header>

  {#if data.authMode === 'prototype'}
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
  {/if}

  {#if data.authMode === 'supabase'}
    <section class="panel access-panel" aria-labelledby="access-title">
      <div>
        <p class="eyebrow">Workspace access</p>
        <h2 id="access-title">Invite people to this workspace</h2>
        <p class="access-intro">
          Invitations are single-use links for this proof of concept. Send the copied link only to
          the intended person.
        </p>
      </div>

      {#if data.accessManagement === 'owner'}
        <form
          class="access-form"
          method="POST"
          action="?/invite"
          use:enhance={trackInvitationCreation}
        >
          <div class="field">
            <label for="invite-email">Email address</label>
            <input
              aria-describedby={inviteEmailTouched && inviteEmailError
                ? 'invite-email-error'
                : undefined}
              aria-invalid={inviteEmailTouched && inviteEmailError ? 'true' : undefined}
              bind:value={inviteEmail}
              id="invite-email"
              name="email"
              onblur={() => (inviteEmailTouched = true)}
              oninput={() => (inviteEmailTouched = true)}
              required
              type="email"
            />
            {#if inviteEmailTouched && inviteEmailError}
              <p class="field-error" id="invite-email-error" role="alert">{inviteEmailError}</p>
            {/if}
          </div>

          <div class="field">
            <label for="invite-role">People &amp; Membership access</label>
            <input name="role" type="hidden" value={inviteRole} />
            <EgliseSelect id="invite-role" bind:value={inviteRole} options={inviteRoleOptions} />
          </div>

          {#if form?.inviteError}
            <p class="field-error" id="invite-error" role="alert">{form.inviteError}</p>
          {/if}

          <PendingButton
            class="button"
            disabled={!canCreateInvitation}
            pending={isCreatingInvitation}
            pendingLabel="Creating invitation…"
            type="submit"
            variant="primary"
          >
            Create invitation link
          </PendingButton>
        </form>

        <section class="role-guide" aria-labelledby="role-guide-title">
          <h3 id="role-guide-title">Role guide</h3>
          <dl>
            <div>
              <dt>Administrator</dt>
              <dd>Imports people and records membership recognition.</dd>
            </div>
            <div>
              <dt>Editor</dt>
              <dd>Makes ordinary changes to people records.</dd>
            </div>
            <div>
              <dt>Viewer</dt>
              <dd>Views People &amp; Membership records without making changes.</dd>
            </div>
          </dl>
        </section>

        {#if form?.inviteLink}
          <div class="invite-created" aria-live="polite">
            <strong>Invitation ready for {form.invitedEmail}</strong>
            <p>
              {form.invitedRole}. It expires in seven days and cannot be shown again after leaving
              this page.
            </p>
            <input aria-label="Invitation link" readonly value={form.inviteLink} />
            <PendingButton
              class="button"
              onclick={() => void copyInvitationLink(form.inviteLink)}
              pending={isCopyingInvitation}
              pendingLabel="Copying link…"
              type="button"
              variant="secondary"
            >
              Copy invitation link
            </PendingButton>
          </div>
        {/if}
      {:else}
        <p class="access-intro">
          Only the workspace Owner can invite people or change their access.
        </p>
      {/if}
    </section>
  {/if}
</section>

<style>
  .access-panel {
    display: grid;
    gap: 24px;
    margin-top: 24px;
  }
  .access-panel h2 {
    margin: 4px 0 0;
    font: 400 28px/1.15 var(--font-display);
  }
  .access-intro {
    margin: 8px 0 0;
    color: var(--text-secondary);
  }
  .access-form {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(240px, 1fr) auto;
    gap: 16px;
    align-items: start;
  }
  .access-form > :global(.button) {
    margin-top: 30px;
  }
  .access-form .field-error {
    grid-column: 1 / -1;
    margin: -8px 0 0;
  }
  .invite-created {
    display: grid;
    gap: 10px;
    padding: 16px;
    border: 1px solid #a9b7a5;
    border-radius: 8px;
    background: var(--surface);
  }
  .invite-created p {
    margin: 0;
    color: var(--text-secondary);
    font-size: 14px;
  }
  .invite-created input {
    width: 100%;
    min-height: 44px;
    padding: 8px 10px;
    border: 1px solid var(--border);
    border-radius: 8px;
    color: var(--text-primary);
    background: var(--surface-raised);
    font: 14px var(--font-ui);
  }
  .invite-created :global(.button) {
    width: fit-content;
  }
  .role-guide {
    padding: 16px;
    border: 1px solid var(--border);
    border-radius: 8px;
    background: var(--surface);
  }
  .role-guide h3 {
    margin: 0;
    font-size: 14px;
  }
  .role-guide dl {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 16px;
    margin: 12px 0 0;
  }
  .role-guide dl > div {
    min-width: 0;
  }
  .role-guide dt {
    font-weight: 700;
  }
  .role-guide dd {
    margin: 4px 0 0;
    color: var(--text-secondary);
    font-size: 14px;
  }
  @media (max-width: 760px) {
    .access-form {
      grid-template-columns: 1fr;
    }
    .access-form :global(.button) {
      width: 100%;
      margin-top: 0;
    }
    .role-guide dl {
      grid-template-columns: 1fr;
      gap: 12px;
    }
  }
</style>
