<script lang="ts">
  import { enhance } from '$app/forms';
  import { goto } from '$app/navigation';
  import type { SubmitFunction } from '@sveltejs/kit';
  import IconArrowLeft from '@tabler/icons-svelte-runes/icons/arrow-left';
  import IconArrowRight from '@tabler/icons-svelte-runes/icons/arrow-right';
  import IconInfoCircle from '@tabler/icons-svelte-runes/icons/info-circle';

  import EgliseChurchMark from '$lib/components/EgliseChurchMark.svelte';
  import PendingButton from '$lib/components/PendingButton.svelte';

  let { data, form } = $props();
  let isSubmitting = $state(false);
  let isContinuing = $state(false);
  let invitationInput = $state('');
  let invitationError = $state('');

  const token = $derived(form?.token ?? data.token);
  const fullName = $derived(form?.fullName ?? '');
  const email = $derived(form?.email ?? '');
  const nameError = $derived(form?.nameError ?? '');

  function invitationToken(value: string): string {
    const trimmedValue = value.trim();

    try {
      return new URL(trimmedValue).searchParams.get('token')?.trim() ?? '';
    } catch {
      return trimmedValue;
    }
  }

  function isInvitationToken(value: string): boolean {
    return /^[A-Za-z0-9_-]{40,}$/.test(value);
  }

  async function continueWithInvitation(event: SubmitEvent): Promise<void> {
    event.preventDefault();

    const token = invitationToken(invitationInput);

    if (!isInvitationToken(token)) {
      invitationError = 'Paste the invitation link or its invitation code.';

      return;
    }

    invitationError = '';
    isContinuing = true;

    try {
      await goto(`/accept-invite?token=${encodeURIComponent(token)}`);
    } finally {
      isContinuing = false;
    }
  }

  const trackSubmission: SubmitFunction = () => {
    isSubmitting = true;

    return async ({ update }) => {
      try {
        await update();
      } finally {
        isSubmitting = false;
      }
    };
  };
</script>

<svelte:head><title>Accept invitation | Eglise</title></svelte:head>

<main class="invite-page" id="main-content">
  <div class="invite-brand" aria-label="Eglise">
    <EgliseChurchMark />
    <span>Eglise</span>
  </div>

  <section class="invite-panel" aria-labelledby="invite-title">
    <header>
      <p class="invite-eyebrow">Workspace invitation</p>
      <h1 id="invite-title">Set up your access</h1>
      <p>
        {token
          ? 'Use the email address the workspace owner invited.'
          : 'Paste your invitation to continue.'}
      </p>
    </header>

    {#if !data.authConfigured}
      <p class="invite-error" role="alert">Account setup is not configured yet.</p>
    {:else if !token}
      <form class="invite-entry" novalidate onsubmit={continueWithInvitation}>
        <div class="field">
          <label for="invitation">Invitation link or code</label>
          <input
            autocapitalize="none"
            aria-describedby={invitationError
              ? 'invitation-error invitation-help'
              : 'invitation-help'}
            aria-invalid={invitationError ? 'true' : undefined}
            autocomplete="off"
            bind:value={invitationInput}
            id="invitation"
            maxlength="2000"
            oninput={() => (invitationError = '')}
            placeholder="Paste invitation link or code"
            spellcheck={false}
            type="text"
          />
          <p class="help" id="invitation-help">
            Your workspace owner can copy this from the invitation they created.
          </p>
          {#if invitationError}
            <p class="field-error" id="invitation-error" role="alert">{invitationError}</p>
          {/if}
        </div>

        <PendingButton
          class="button"
          pending={isContinuing}
          pendingLabel="Opening invitation…"
          type="submit"
          variant="primary"
        >
          Continue with invitation
          <IconArrowRight aria-hidden="true" size={18} stroke={1.8} />
        </PendingButton>
      </form>
    {:else}
      <form method="POST" class="invite-form" use:enhance={trackSubmission}>
        <input name="token" type="hidden" value={token} />

        <div class="field">
          <label for="invite-name">Full name</label>
          <input
            autocomplete="name"
            aria-describedby={nameError ? 'invite-name-error' : undefined}
            aria-invalid={nameError ? 'true' : undefined}
            id="invite-name"
            maxlength="120"
            name="fullName"
            required
            value={fullName}
          />
          {#if nameError}
            <p class="field-error" id="invite-name-error" role="alert">{nameError}</p>
          {/if}
        </div>

        <div class="field">
          <label for="invite-email">Invited email address</label>
          <input
            autocomplete="email"
            id="invite-email"
            name="email"
            required
            type="email"
            value={email}
          />
        </div>

        <div class="field">
          <label for="invite-password">Create password</label>
          <input
            autocomplete="new-password"
            id="invite-password"
            minlength="12"
            name="password"
            required
            type="password"
          />
          <p class="help">Use at least 12 characters.</p>
        </div>

        {#if form?.error}
          <p class="invite-error" role="alert">{form.error}</p>
        {/if}

        <PendingButton
          class="button"
          pending={isSubmitting}
          pendingLabel="Creating account…"
          type="submit"
          variant="primary"
        >
          Create account and enter workspace
        </PendingButton>
      </form>

      <aside class="invite-note">
        <IconInfoCircle aria-hidden="true" size={17} stroke={1.8} />
        <p>
          Invitations expire after seven days and can be used once. Your password is never visible
          to the workspace owner.
        </p>
      </aside>
    {/if}

    {#if token && data.authConfigured}
      <p class="invite-change">
        <a href="/accept-invite">
          <IconArrowLeft aria-hidden="true" size={16} stroke={1.8} />
          Use a different invitation
        </a>
      </p>
    {/if}

    <p class="invite-alternate">
      Already have an account?
      <a href="/login">Sign in</a>
    </p>
  </section>
</main>

<style>
  .invite-page {
    display: grid;
    min-height: 100svh;
    padding: 32px 20px;
    place-content: center;
    background: var(--canvas);
  }
  .invite-brand {
    display: flex;
    gap: 10px;
    align-items: center;
    width: min(440px, calc(100vw - 40px));
    margin: 0 auto 28px;
    color: var(--primary);
    font: 600 25px var(--font-display);
  }
  .invite-brand :global(.church-mark) {
    width: 40px;
    height: 40px;
  }
  .invite-panel {
    width: min(440px, calc(100vw - 40px));
    padding: 36px 32px 32px;
    border: 1px solid var(--border);
    border-radius: 12px;
    background: var(--surface-raised);
  }
  .invite-eyebrow {
    margin: 0 0 6px;
    color: var(--primary);
    font-size: 14px;
    font-weight: 600;
  }
  h1 {
    margin: 0;
    font: 400 36px/1.1 var(--font-display);
  }
  header > p:last-child {
    margin: 10px 0 0;
    color: var(--text-secondary);
  }
  .invite-form {
    display: grid;
    gap: 18px;
    margin-top: 24px;
  }
  .invite-entry {
    display: grid;
    gap: 18px;
    margin-top: 24px;
  }
  .field {
    display: grid;
    gap: 6px;
  }
  .field label {
    font-weight: 600;
  }
  .field input {
    min-height: 46px;
    padding: 9px 11px;
    border: 2px solid var(--border);
    border-radius: 8px;
    color: var(--text-primary);
    background: #fffdf8;
  }
  .field input:focus {
    outline: 0;
    border-color: #6f8b75;
    box-shadow: 0 0 0 2px rgb(49 84 59 / 12%);
  }
  .help {
    margin: 0;
    color: var(--text-secondary);
    font-size: 14px;
  }
  .invite-error {
    margin: 20px 0 0;
    color: var(--danger);
    font-size: 14px;
  }
  .invite-form .invite-error {
    margin: 0;
  }
  .field-error {
    margin: 0;
    color: var(--danger);
    font-size: 12px;
    line-height: 1.3;
  }
  .invite-note {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    gap: 10px;
    align-items: start;
    margin-top: 20px;
    color: var(--text-secondary);
    font-size: 13px;
  }
  .invite-note p {
    margin: 0;
  }
  .invite-note :global(svg) {
    margin-top: 1px;
    color: var(--info);
  }
  .invite-change {
    margin: 20px 0 0;
    text-align: center;
  }
  .invite-change a,
  .invite-alternate a {
    display: inline-flex;
    gap: 6px;
    align-items: center;
    justify-content: center;
    min-height: 44px;
    padding: 0 4px;
    color: var(--primary);
    font-weight: 600;
    text-decoration: underline;
    text-decoration-thickness: 1px;
    text-underline-offset: 0.2em;
  }
  .invite-alternate {
    margin: 18px 0 0;
    padding-top: 18px;
    border-top: 1px solid var(--border);
    color: var(--text-secondary);
    text-align: center;
  }
  @media (max-width: 560px) {
    .invite-page {
      padding: 24px 16px;
    }
    .invite-brand,
    .invite-panel {
      width: min(100%, 440px);
    }
    .invite-panel {
      padding: 28px 20px;
    }
  }
</style>
