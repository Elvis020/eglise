<script lang="ts">
  import { enhance } from '$app/forms';
  import type { SubmitFunction } from '@sveltejs/kit';
  import IconInfoCircle from '@tabler/icons-svelte-runes/icons/info-circle';

  import EgliseChurchMark from '$lib/components/EgliseChurchMark.svelte';
  import PendingButton from '$lib/components/PendingButton.svelte';

  let { data, form } = $props();
  let isSubmitting = $state(false);

  const token = $derived(form?.token ?? data.token);
  const fullName = $derived(form?.fullName ?? '');
  const email = $derived(form?.email ?? '');
  const nameError = $derived(form?.nameError ?? '');

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
        Use the email address the workspace owner invited. Your password is never visible to them.
      </p>
    </header>

    {#if !data.authConfigured}
      <p class="invite-error" role="alert">Account setup is not configured yet.</p>
    {:else if !token}
      <p class="invite-error" role="alert">
        This invitation link is incomplete. Ask the owner for a new one.
      </p>
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
          class="button primary"
          pending={isSubmitting}
          pendingLabel="Creating account…"
          type="submit"
        >
          Create account and enter workspace
        </PendingButton>
      </form>

      <aside class="invite-note">
        <IconInfoCircle aria-hidden="true" size={17} stroke={1.8} />
        <p>
          This proof-of-concept link is sent manually by the workspace owner. It expires after seven
          days and can be used once.
        </p>
      </aside>
    {/if}
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
