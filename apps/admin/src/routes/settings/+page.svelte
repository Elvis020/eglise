<script lang="ts">
  import { enhance } from '$app/forms';
  import { goto } from '$app/navigation';
  import type { SubmitFunction } from '@sveltejs/kit';
  import { onDestroy, tick } from 'svelte';
  import IconArrowLeft from '@tabler/icons-svelte-runes/icons/arrow-left';
  import IconCheck from '@tabler/icons-svelte-runes/icons/check';
  import IconCircleCheck from '@tabler/icons-svelte-runes/icons/circle-check';
  import IconClockHour4 from '@tabler/icons-svelte-runes/icons/clock-hour-4';
  import IconCopy from '@tabler/icons-svelte-runes/icons/copy';
  import IconDeviceFloppy from '@tabler/icons-svelte-runes/icons/device-floppy';
  import IconTrash from '@tabler/icons-svelte-runes/icons/trash';

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
  let copyingInvitationId = $state('');
  let copiedInvitationId = $state('');
  let invitationCopyError = $state('');
  let accessActionPending = $state('');
  let revocationError = $state('');
  let memberRoles = $state<Record<string, string>>({});
  let accessQuery = $state('');
  let accessStatus = $state('all');
  let accessRole = $state('all');
  let accessPage = $state(1);
  let revokeDialog = $state<HTMLDialogElement>();
  let revokeTarget = $state<
    { id: string; kind: 'member' | 'invitation'; name: string } | undefined
  >(undefined);
  let copyResetTimer: ReturnType<typeof setTimeout> | undefined;
  let accessSearchTimer: ReturnType<typeof setTimeout> | undefined;

  const inviteRoleOptions: EgliseSelectOption[] = [
    {
      value: 'people_administrator',
      label: 'Administrator'
    },
    { value: 'people_editor', label: 'Editor' },
    { value: 'people_viewer', label: 'Viewer' }
  ];

  const ownerRoleOptions: EgliseSelectOption[] = [{ value: 'owner', label: 'Owner' }];

  const accessStatusOptions: EgliseSelectOption[] = [
    { value: 'all', label: 'All access' },
    { value: 'active', label: 'Active access' },
    { value: 'pending', label: 'Pending invitation' }
  ];

  const accessRoleOptions: EgliseSelectOption[] = [
    { value: 'all', label: 'All roles' },
    { value: 'owner', label: 'Owner' },
    ...inviteRoleOptions
  ];

  const inviteEmailError = $derived(
    !inviteEmail.trim()
      ? 'Enter an email address.'
      : /^\S+@\S+\.\S+$/.test(inviteEmail.trim())
        ? ''
        : 'Enter a valid email address.'
  );
  const canCreateInvitation = $derived(!inviteEmailError);
  const revocationActionId = $derived(revokeTarget ? `revoke-${revokeTarget.id}` : '');
  const isRevoking = $derived(
    Boolean(revocationActionId) && accessActionPending === revocationActionId
  );

  const roleLabel = (role: string): string => {
    switch (role) {
      case 'owner':
        return 'Owner';
      case 'people_administrator':
        return 'Administrator';
      case 'people_editor':
        return 'Editor';
      default:
        return 'Viewer';
    }
  };

  const invitationExpiry = (value: string): string =>
    new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(
      new Date(value)
    );

  type AccessRow =
    | {
        email: string;
        fullName: string;
        role: string;
        status: 'active';
        userId: string;
      }
    | {
        email: string;
        expiresAt: string;
        id: string;
        role: string;
        status: 'pending';
      };

  const accessRows = $derived(data.accessRows as AccessRow[]);
  const accessPageCount = $derived(
    Math.max(1, Math.ceil(data.accessTotalCount / data.accessPageSize))
  );
  const accessRangeStart = $derived(
    data.accessTotalCount ? (accessPage - 1) * data.accessPageSize + 1 : 0
  );
  const accessRangeEnd = $derived(
    Math.min(accessPage * data.accessPageSize, data.accessTotalCount)
  );

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

  $effect(() => {
    for (const row of accessRows) {
      if (row.status === 'active') {
        memberRoles[row.userId] = row.role;
      }
    }
  });

  $effect(() => {
    accessQuery = data.accessFilters.query;
    accessStatus = data.accessFilters.status;
    accessRole = data.accessFilters.role;
    accessPage = data.accessFilters.page;
  });

  function updateAccessFilters(
    update: Partial<{ page: number; query: string; role: string; status: string }>
  ) {
    if (accessSearchTimer) {
      clearTimeout(accessSearchTimer);
      accessSearchTimer = undefined;
    }

    const nextQuery = update.query ?? accessQuery;
    const nextStatus = update.status ?? accessStatus;
    const nextRole = update.role ?? accessRole;
    const nextPage = update.page ?? accessPage;
    const searchParams = new URLSearchParams();

    if (nextQuery.trim()) searchParams.set('accessQuery', nextQuery.trim());
    if (nextStatus !== 'all') searchParams.set('accessStatus', nextStatus);
    if (nextRole !== 'all') searchParams.set('accessRole', nextRole);
    if (nextPage > 1) searchParams.set('accessPage', String(nextPage));

    accessQuery = nextQuery;
    accessStatus = nextStatus;
    accessRole = nextRole;
    accessPage = nextPage;

    void goto(`/settings${searchParams.size ? `?${searchParams}` : ''}`, {
      keepFocus: true,
      noScroll: true
    });
  }

  function scheduleAccessSearch() {
    if (accessSearchTimer) clearTimeout(accessSearchTimer);

    accessSearchTimer = setTimeout(() => updateAccessFilters({ page: 1 }), 250);
  }

  const trackInvitationCreation: SubmitFunction = () => {
    isCreatingInvitation = true;

    return async ({ result, update }) => {
      try {
        await update();

        if (result.type === 'success' && typeof result.data?.inviteLink === 'string') {
          inviteEmailTouched = false;
          await copyInvitationLink(result.data.inviteLink, result.data.invitationId);
        }
      } finally {
        isCreatingInvitation = false;
      }
    };
  };

  const trackAccessAction =
    (getAction: () => string, closeDialog = false): SubmitFunction =>
    () => {
      const action = getAction();

      accessActionPending = action;

      return async ({ result, update }) => {
        try {
          await update();

          if (result.type === 'success') {
            if (typeof result.data?.accessMessage === 'string') {
              showToast(result.data.accessMessage);
            }

            if (closeDialog) {
              revokeDialog?.close();
              revokeTarget = undefined;
              revocationError = '';
            }
          } else if (closeDialog && result.type === 'failure') {
            revocationError =
              typeof result.data?.accessError === 'string'
                ? result.data.accessError
                : 'We could not update workspace access. Please try again.';
          }
        } finally {
          accessActionPending = '';
        }
      };
    };

  const trackInvitationCopy =
    (invitationId: string): SubmitFunction =>
    () => {
      copyingInvitationId = invitationId;

      return async ({ result, update }) => {
        try {
          await update();

          if (result.type === 'success' && typeof result.data?.inviteLink === 'string') {
            await copyInvitationLink(result.data.inviteLink, invitationId);
          }
        } finally {
          copyingInvitationId = '';
        }
      };
    };

  function openRevocationDialog(target: {
    id: string;
    kind: 'member' | 'invitation';
    name: string;
  }) {
    revocationError = '';
    revokeTarget = target;
    void tick().then(() => revokeDialog?.showModal());
  }

  async function copyInvitationLink(link: string, invitationId?: unknown): Promise<boolean> {
    invitationCopyError = '';

    try {
      await navigator.clipboard.writeText(link);
      showToast('Invitation link copied.');

      if (typeof invitationId === 'string') {
        copiedInvitationId = invitationId;

        if (copyResetTimer) {
          clearTimeout(copyResetTimer);
        }

        copyResetTimer = setTimeout(() => {
          copiedInvitationId = '';
          copyResetTimer = undefined;
        }, 3000);
      }

      return true;
    } catch {
      invitationCopyError =
        'Your browser could not copy the invitation link. Try the copy button again.';

      return false;
    }
  }

  onDestroy(() => {
    if (copyResetTimer) {
      clearTimeout(copyResetTimer);
    }

    if (accessSearchTimer) {
      clearTimeout(accessSearchTimer);
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

<svelte:head><title>Settings | {$prototypeSession.churchName}</title></svelte:head>

<section class="page settings-page">
  <header class="page-head">
    <div>
      <h1 tabindex="-1">Settings</h1>
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
    <div class="settings-sections">
      <section class="settings-section" aria-labelledby="access-title">
        <div class="settings-section-heading">
          <p class="eyebrow">Workspace</p>
          <h2 id="access-title">Access</h2>
          <p class="access-intro">
            Invite people and manage who can open this workspace. Invitation links are single-use;
            send the copied link only to the intended person.
          </p>
        </div>

        {#if data.accessManagement === 'owner'}
          <section class="settings-subsection" aria-label="Invite someone">
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
                <EgliseSelect
                  id="invite-role"
                  bind:value={inviteRole}
                  options={inviteRoleOptions}
                />
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
          </section>

          <section class="settings-subsection access-list" aria-labelledby="workspace-access-title">
            <div>
              <h3 id="workspace-access-title">People with access</h3>
              <p>
                Active people can open the workspace. Pending invitations have not yet been
                accepted.
              </p>
            </div>

            {#if form?.accessError || invitationCopyError}
              {@const accessError = form?.accessError ?? invitationCopyError}
              <p class="field-error access-feedback" role="alert">{accessError}</p>
            {/if}

            <div class="access-filters" aria-label="Filter workspace access">
              <div class="field access-search">
                <label for="access-search">Search access</label>
                <input
                  bind:value={accessQuery}
                  id="access-search"
                  oninput={scheduleAccessSearch}
                  placeholder="Name or email"
                  type="search"
                />
              </div>
              <div class="field">
                <label for="access-status">Status</label>
                <EgliseSelect
                  id="access-status"
                  bind:value={accessStatus}
                  onchange={(value) => updateAccessFilters({ page: 1, status: value })}
                  options={accessStatusOptions}
                />
              </div>
              <div class="field">
                <label for="access-role">Role</label>
                <EgliseSelect
                  id="access-role"
                  bind:value={accessRole}
                  onchange={(value) => updateAccessFilters({ page: 1, role: value })}
                  options={accessRoleOptions}
                />
              </div>
            </div>

            <div class="access-table-wrap">
              <table class="access-table">
                <colgroup>
                  <col class="access-person-column" />
                  <col class="access-status-column" />
                  <col class="access-role-column" />
                  <col class="access-expiry-column" />
                  <col class="access-actions-column" />
                </colgroup>
                <thead>
                  <tr>
                    <th scope="col">Person</th>
                    <th scope="col">Access</th>
                    <th scope="col">Role</th>
                    <th scope="col">Expiry</th>
                    <th class="access-actions-heading" scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {#each accessRows as row (row.status === 'active' ? row.userId : row.id)}
                    <tr>
                      <th scope="row">
                        {#if row.status === 'active'}
                          <span class="access-person-name">{row.fullName}</span>
                        {/if}
                        <span class="access-person-email">{row.email}</span>
                      </th>
                      <td data-label="Access">
                        <span class:pending={row.status === 'pending'} class="access-status">
                          {#if row.status === 'active'}
                            <IconCircleCheck aria-hidden="true" size={18} stroke={1.8} />
                          {:else}
                            <IconClockHour4 aria-hidden="true" size={18} stroke={1.8} />
                          {/if}
                          <span>{row.status === 'active' ? 'Active' : 'Pending'}</span>
                        </span>
                      </td>
                      <td data-label="Role">
                        {#if row.status === 'active' && row.role !== 'owner'}
                          <form
                            class="role-change-form"
                            method="POST"
                            action="?/changeRole"
                            use:enhance={trackAccessAction(() => `role-${row.userId}`)}
                          >
                            <input name="userId" type="hidden" value={row.userId} />
                            <input
                              name="role"
                              type="hidden"
                              value={memberRoles[row.userId] ?? row.role}
                            />
                            <label class="sr-only" for={`member-role-${row.userId}`}>
                              Access for {row.fullName}
                            </label>
                            <EgliseSelect
                              id={`member-role-${row.userId}`}
                              menuMode="floating"
                              options={inviteRoleOptions}
                              value={memberRoles[row.userId] ?? row.role}
                              onchange={(value) => (memberRoles[row.userId] = value)}
                            />
                            <PendingButton
                              class="compact-action"
                              disabled={(memberRoles[row.userId] ?? row.role) === row.role}
                              pending={accessActionPending === `role-${row.userId}`}
                              pendingLabel="Saving…"
                              type="submit"
                              variant="secondary"
                            >
                              Save role
                            </PendingButton>
                          </form>
                        {:else if row.status === 'active'}
                          <EgliseSelect
                            disabled
                            id={`member-role-${row.userId}`}
                            options={ownerRoleOptions}
                            value="owner"
                          />
                        {:else}
                          <span>{roleLabel(row.role)}</span>
                        {/if}
                      </td>
                      <td data-label="Expiry">
                        {#if row.status === 'active'}
                          <span aria-hidden="true">—</span><span class="sr-only">No expiry</span>
                        {:else}
                          {invitationExpiry(row.expiresAt)}
                        {/if}
                      </td>
                      <td class="access-actions" data-label="Actions">
                        <div class="access-action-controls">
                          {#if row.status === 'active' && row.role === 'owner'}
                            <span class="owner-protected">Protected</span>
                          {:else if row.status === 'active'}
                            <button
                              class="button danger-outline compact-action"
                              onclick={() =>
                                openRevocationDialog({
                                  id: row.userId,
                                  kind: 'member',
                                  name: row.fullName
                                })}
                              type="button"
                            >
                              <IconTrash aria-hidden="true" size={16} stroke={1.8} />
                              Remove access
                            </button>
                          {:else}
                            <form
                              class="copy-invitation-form"
                              method="POST"
                              action="?/copyInvitation"
                              use:enhance={trackInvitationCopy(row.id)}
                            >
                              <input name="invitationId" type="hidden" value={row.id} />
                              <button
                                aria-label={copiedInvitationId === row.id
                                  ? `Invitation link copied for ${row.email}`
                                  : `Copy invitation link for ${row.email}`}
                                class="icon-action"
                                disabled={copyingInvitationId === row.id}
                                title={copiedInvitationId === row.id
                                  ? 'Invitation link copied'
                                  : 'Copy invitation link'}
                                type="submit"
                              >
                                {#if copiedInvitationId === row.id}
                                  <IconCheck aria-hidden="true" size={18} stroke={1.8} />
                                {:else}
                                  <IconCopy aria-hidden="true" size={18} stroke={1.8} />
                                {/if}
                              </button>
                            </form>
                            <button
                              aria-label={`Revoke invitation for ${row.email}`}
                              class="icon-action danger-icon"
                              onclick={() =>
                                openRevocationDialog({
                                  id: row.id,
                                  kind: 'invitation',
                                  name: row.email
                                })}
                              title="Revoke invitation"
                              type="button"
                            >
                              <IconTrash aria-hidden="true" size={18} stroke={1.8} />
                            </button>
                          {/if}
                        </div>
                      </td>
                    </tr>
                  {:else}
                    <tr>
                      <td class="access-empty" colspan="5"
                        >No people or invitations match these filters.</td
                      >
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>

            <div class="access-pagination">
              <p>
                Showing {accessRangeStart}–{accessRangeEnd} of {data.accessTotalCount}{' '}
                {data.accessTotalCount === 1 ? 'record' : 'records'}
              </p>
              {#if accessPageCount > 1}
                <nav aria-label="Access table pagination">
                  <button
                    class="button secondary compact-action"
                    disabled={accessPage === 1}
                    onclick={() => updateAccessFilters({ page: accessPage - 1 })}
                    type="button"
                  >
                    Previous
                  </button>
                  <span>Page {accessPage} of {accessPageCount}</span>
                  <button
                    class="button secondary compact-action"
                    disabled={accessPage === accessPageCount}
                    onclick={() => updateAccessFilters({ page: accessPage + 1 })}
                    type="button"
                  >
                    Next
                  </button>
                </nav>
              {/if}
            </div>
          </section>
        {:else}
          <p class="settings-section-message">
            Only the workspace Owner can invite people or change their access.
          </p>
        {/if}
      </section>
    </div>
  {/if}
</section>

{#if data.authMode === 'supabase' && data.accessManagement === 'owner'}
  <dialog
    bind:this={revokeDialog}
    aria-busy={isRevoking || undefined}
    aria-labelledby="revoke-access-title"
  >
    <form
      method="POST"
      action={revokeTarget?.kind === 'member' ? '?/revokeMembership' : '?/revokeInvitation'}
      use:enhance={trackAccessAction(() => revocationActionId, true)}
    >
      <p class="dialog-context">Workspace access</p>
      <h2 id="revoke-access-title">
        {revokeTarget?.kind === 'member' ? 'Remove workspace access?' : 'Revoke invitation?'}
      </h2>
      <p>
        {#if revokeTarget?.kind === 'member'}
          {revokeTarget.name} will no longer be able to open this workspace. Their people records are
          not deleted.
        {:else}
          The link for {revokeTarget?.name} will stop working immediately. You can create a new invitation
          later if needed.
        {/if}
      </p>
      {#if revocationError}
        <p class="field-error" role="alert">{revocationError}</p>
      {/if}
      {#if isRevoking}
        <p class="dialog-pending" role="status">
          {revokeTarget?.kind === 'member' ? 'Removing access…' : 'Revoking invitation…'}
        </p>
      {/if}
      {#if revokeTarget?.kind === 'member'}
        <input name="userId" type="hidden" value={revokeTarget.id} />
      {:else}
        <input name="invitationId" type="hidden" value={revokeTarget?.id ?? ''} />
      {/if}
      <div class="dialog-actions">
        <button
          class="button secondary"
          disabled={isRevoking}
          onclick={() => revokeDialog?.close()}
          type="button"
        >
          Keep access
        </button>
        <PendingButton
          class="button"
          pending={isRevoking}
          pendingLabel={revokeTarget?.kind === 'member'
            ? 'Removing access…'
            : 'Revoking invitation…'}
          type="submit"
          variant="danger"
        >
          {revokeTarget?.kind === 'member' ? 'Remove access' : 'Revoke invitation'}
        </PendingButton>
      </div>
    </form>
  </dialog>
{/if}

<style>
  .settings-sections {
    display: grid;
    margin-top: 32px;
  }
  .settings-section {
    display: grid;
  }
  .settings-section-heading {
    padding-bottom: 24px;
  }
  .settings-section h2 {
    margin: 4px 0 0;
    font: 400 28px/1.15 var(--font-display);
  }
  .access-intro {
    margin: 8px 0 0;
    color: var(--text-secondary);
  }
  .settings-subsection {
    display: grid;
    gap: 20px;
    padding: 32px 0;
  }
  .settings-section-message {
    margin: 0;
    padding: 24px 0 0;
    border-top: 1px solid var(--border);
    color: var(--text-secondary);
  }
  .access-list {
    border-top: 1px solid var(--border);
  }
  .access-list h3 {
    margin: 0;
    font: 600 20px/1.2 var(--font-ui);
  }
  .access-list p {
    max-width: 76ch;
    margin: 6px 0 0;
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
  .role-guide {
    display: grid;
    gap: 12px;
    padding: 16px 0 0;
  }
  .role-guide h3 {
    margin: 0;
    font-size: 14px;
    font-weight: 700;
  }
  .role-guide dl {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 16px;
    margin: 0;
    padding: 0;
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
  .access-feedback {
    margin: 0;
    padding: 10px 12px;
    border: 1px solid currentColor;
    border-radius: 8px;
  }
  .access-filters {
    display: grid;
    grid-template-columns: minmax(220px, 1fr) repeat(2, minmax(160px, 220px));
    gap: 12px;
    align-items: end;
  }
  .access-search {
    min-width: 0;
  }
  .access-table-wrap {
    overflow-x: auto;
    border: 1px solid var(--border);
    border-radius: 12px;
    background: var(--surface-raised);
  }
  .access-table {
    min-width: 960px;
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
    text-align: left;
  }
  .access-person-column {
    width: 28%;
  }
  .access-status-column {
    width: 14%;
  }
  .access-role-column {
    width: 28%;
  }
  .access-expiry-column {
    width: 12%;
  }
  .access-actions-column {
    width: 18%;
  }
  .access-table th,
  .access-table td {
    padding: 12px 10px;
    border-bottom: 1px solid var(--border);
    vertical-align: middle;
  }
  .access-table thead th {
    color: var(--text-secondary);
    font-size: 14px;
    font-weight: 600;
  }
  .access-actions-heading {
    text-align: right;
  }
  .access-table tbody th {
    min-width: 0;
  }
  .access-person-name,
  .access-person-email {
    display: block;
  }
  .access-person-name {
    font-weight: 600;
  }
  .access-person-email,
  .owner-protected {
    margin-top: 2px;
    color: var(--text-secondary);
    font-size: 14px;
    font-weight: 400;
  }
  .access-person-email {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .access-status {
    display: inline-flex;
    gap: 6px;
    align-items: center;
    color: var(--primary);
    font-size: 14px;
    font-weight: 600;
    white-space: nowrap;
  }
  .access-status.pending {
    color: #70551d;
  }
  .role-change-form {
    display: grid;
    grid-template-columns: minmax(150px, 1fr) auto;
    gap: 8px;
    align-items: center;
  }
  .role-change-form :global(.eglise-select) {
    min-width: 150px;
  }
  .compact-action {
    min-height: 40px;
    padding: 7px 10px;
    font-size: 14px;
    white-space: nowrap;
  }
  .icon-action {
    display: inline-grid;
    width: 40px;
    min-height: 40px;
    place-items: center;
    border: 1px solid var(--border);
    border-radius: 8px;
    color: var(--primary);
    background: transparent;
    cursor: pointer;
    transition:
      background-color 120ms cubic-bezier(0.2, 0, 0, 1),
      border-color 120ms cubic-bezier(0.2, 0, 0, 1),
      color 120ms cubic-bezier(0.2, 0, 0, 1);
  }
  .icon-action:hover:not(:disabled),
  .icon-action:focus-visible {
    border-color: var(--primary);
    background: #e7ede3;
  }
  .icon-action:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .danger-icon {
    color: var(--danger);
  }
  .danger-icon:hover,
  .danger-icon:focus-visible {
    border-color: var(--danger);
    background: #f8e9e5;
  }
  .access-actions {
    text-align: right;
  }
  .access-action-controls {
    display: flex;
    gap: 8px;
    align-items: center;
    justify-content: flex-end;
  }
  .copy-invitation-form {
    display: contents;
  }
  .dialog-pending {
    margin: 16px 0 0;
    padding: 8px 12px;
    border: 1px solid var(--border);
    border-radius: 8px;
    color: var(--primary);
    background: var(--surface);
    font-weight: 600;
  }
  .danger-outline {
    border-color: var(--danger);
    color: var(--danger);
    background: transparent;
  }
  .danger-outline:hover,
  .danger-outline:focus-visible {
    background: #f8e9e5;
  }
  .access-empty {
    padding: 16px;
    color: var(--text-secondary);
    text-align: center;
  }
  .access-pagination {
    display: flex;
    gap: 16px;
    align-items: center;
    justify-content: space-between;
    padding: 16px 0 0;
    color: var(--text-secondary);
    font-size: 14px;
  }
  .access-pagination p {
    margin: 0;
  }
  .access-pagination nav {
    display: flex;
    gap: 12px;
    align-items: center;
  }
  @media (max-width: 960px) {
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
    .access-filters {
      grid-template-columns: 1fr;
    }
    .access-table-wrap {
      overflow: visible;
    }
    .access-table,
    .access-table tbody,
    .access-table tr,
    .access-table th,
    .access-table td {
      display: block;
      width: 100%;
    }
    .access-table {
      min-width: 0;
    }
    .access-table thead {
      display: none;
    }
    .access-table tr {
      padding: 12px 0;
      border-bottom: 1px solid var(--border);
    }
    .access-table th,
    .access-table td {
      padding: 4px 0;
      border: 0;
    }
    .access-table td[data-label] {
      display: grid;
      grid-template-columns: minmax(88px, 0.42fr) minmax(0, 1fr);
      gap: 12px;
      align-items: start;
    }
    .access-table td.access-empty {
      padding: 16px 0;
      border: 1px dashed var(--border);
      border-radius: 8px;
      background: var(--surface);
    }
    .access-table td[data-label]::before {
      color: var(--text-secondary);
      content: attr(data-label);
      font-size: 14px;
    }
    .role-change-form {
      grid-template-columns: 1fr;
    }
    .role-change-form :global(.eglise-select) {
      min-width: 0;
    }
    .role-change-form :global(.button) {
      width: 100%;
    }
    .access-actions {
      width: 100%;
    }
    .access-action-controls {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      width: 100%;
    }
    .access-action-controls .button {
      grid-column: 1 / -1;
      width: 100%;
      margin-top: 4px;
    }
    .access-action-controls .icon-action {
      width: 100%;
      min-height: 44px;
      margin-top: 4px;
    }
    .access-pagination {
      align-items: flex-start;
      flex-direction: column;
    }
    .access-pagination nav {
      width: 100%;
      justify-content: space-between;
    }
  }
</style>
