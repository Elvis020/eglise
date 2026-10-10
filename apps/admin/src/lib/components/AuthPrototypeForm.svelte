<script lang="ts">
  import { enhance } from '$app/forms';
  import { goto } from '$app/navigation';
  import { tick } from 'svelte';
  import type { SubmitFunction } from '@sveltejs/kit';
  import IconArrowLeft from '@tabler/icons-svelte-runes/icons/arrow-left';
  import IconArrowRight from '@tabler/icons-svelte-runes/icons/arrow-right';
  import IconCheck from '@tabler/icons-svelte-runes/icons/check';
  import IconInfoCircle from '@tabler/icons-svelte-runes/icons/info-circle';

  import EgliseChurchMark from '$lib/components/EgliseChurchMark.svelte';
  import PendingButton from '$lib/components/PendingButton.svelte';
  import PasswordField from '$lib/components/PasswordField.svelte';
  import {
    prototypeSession,
    signInPrototypeAdministrator,
    signUpPrototypeAdministrator
  } from '$lib/prototype-session';

  type AuthMode = 'login' | 'signup';

  let {
    authMode = 'prototype',
    form,
    mode,
    next = '/people'
  }: {
    authMode?: 'prototype' | 'supabase';
    form?: { error?: string } | null;
    mode: AuthMode;
    next?: string;
  } = $props();
  let nameError = $state('');
  let emailError = $state('');
  let passwordError = $state('');
  let formError = $state('');
  let isSubmitting = $state(false);
  let signupStep = $state(1);
  let name = $state('');
  let email = $state('');
  let password = $state('');

  const isLogin = $derived(mode === 'login');
  const title = $derived(isLogin ? 'Welcome back' : 'Create your account');
  const eyebrow = $derived(isLogin ? 'Administrator access' : 'Set up your workspace');
  const introduction = $derived(
    isLogin
      ? 'Sign in to manage people and membership.'
      : signupStep === 1
        ? 'Start with the administrator who will use this workspace.'
        : 'One final detail, then you can enter the workspace.'
  );
  const prototypeNotice = $derived(
    authMode === 'supabase'
      ? 'Access is invitation-only. Ask a workspace owner to send a new invitation if you need an account.'
      : isLogin
        ? 'Prototype access is saved on this device. Your password is not checked or stored.'
        : signupStep === 1
          ? 'Your administrator profile is saved on this device.'
          : 'Your password is not stored in this prototype.'
  );
  const submitLabel = $derived(isLogin ? 'Sign in to workspace' : 'Create account');
  const alternatePrompt = $derived(isLogin ? 'Need an account?' : 'Already have an account?');
  const alternateLabel = $derived(
    isLogin ? (authMode === 'supabase' ? 'Use your invitation' : 'Create one') : 'Sign in'
  );
  const alternateHref = $derived(
    isLogin ? (authMode === 'supabase' ? '/accept-invite' : '/signup') : '/login'
  );

  const trackSupabaseSubmission: SubmitFunction = ({ cancel }) => {
    if (authMode !== 'supabase') {
      cancel();

      return;
    }

    isSubmitting = true;

    return async ({ update }) => {
      try {
        await update();
      } finally {
        isSubmitting = false;
      }
    };
  };

  function clearFieldError(field: 'name' | 'email' | 'password') {
    if (field === 'name') nameError = '';
    if (field === 'email') emailError = '';
    if (field === 'password') passwordError = '';

    formError = '';
  }

  function hasValidEmail(value: string): boolean {
    return /^\S+@\S+\.\S+$/.test(value);
  }

  function advanceSignup() {
    if (!name.trim()) {
      nameError = 'Enter your name to create an administrator profile.';

      return;
    }

    if (!hasValidEmail(email.trim())) {
      emailError = 'Enter a valid email address.';

      return;
    }

    nameError = '';
    emailError = '';
    signupStep = 2;
  }

  function returnToProfile() {
    passwordError = '';
    formError = '';
    signupStep = 1;
  }

  async function handleSubmit(event: SubmitEvent) {
    if (authMode === 'supabase') {
      return;
    }

    event.preventDefault();

    const form = event.currentTarget;

    if (!(form instanceof HTMLFormElement)) return;

    if (!hasValidEmail(email.trim())) {
      emailError = 'Enter a valid email address.';

      return;
    }

    if (isLogin && !password) {
      passwordError = 'Enter your password to continue.';

      return;
    }

    if (!isLogin && signupStep === 1) {
      await advanceSignup();

      return;
    }

    if (!isLogin && password.length < 8) {
      passwordError = 'Use at least 8 characters for this preview.';

      return;
    }

    isSubmitting = true;

    await tick();

    const saved = isLogin
      ? signInPrototypeAdministrator(email.trim())
      : signUpPrototypeAdministrator({ email: email.trim(), name: name.trim() });

    if (!saved) {
      formError = 'This browser could not save prototype access.';
      isSubmitting = false;

      return;
    }

    try {
      await goto('/people');
    } finally {
      isSubmitting = false;
    }
  }
</script>

<svelte:head><title>{title} | {$prototypeSession.churchName}</title></svelte:head>

<main class="auth-page" id="main-content">
  <a
    class="auth-brand"
    href="/people"
    aria-label={`${$prototypeSession.churchName} People and Membership`}
  >
    <EgliseChurchMark />
    <span class="auth-church-name" title={$prototypeSession.churchName}
      >{$prototypeSession.churchName}</span
    >
  </a>

  <section class="auth-panel" aria-labelledby="auth-title">
    <header class="auth-heading">
      <p class="auth-eyebrow">{eyebrow}</p>
      <h1 id="auth-title">{title}</h1>
      <p>{introduction}</p>
    </header>

    {#if !isLogin}
      <ol
        aria-label="Account setup progress"
        class:complete-first-step={signupStep === 2}
        class="auth-progress"
      >
        <li aria-current={signupStep === 1 ? 'step' : undefined} class:complete={signupStep > 1}>
          <span class="auth-progress-marker">
            {#if signupStep > 1}
              <IconCheck aria-hidden="true" size={14} stroke={2.4} />
            {:else}
              1
            {/if}
          </span>
          <span class="auth-progress-label">Your details</span>
        </li>
        <li aria-current={signupStep === 2 ? 'step' : undefined}>
          <span class="auth-progress-marker">2</span>
          <span class="auth-progress-label">Access</span>
        </li>
      </ol>
    {/if}

    <form
      class="auth-form"
      method="POST"
      novalidate
      onsubmit={handleSubmit}
      use:enhance={trackSupabaseSubmission}
    >
      {#if authMode === 'supabase' && isLogin}
        <input name="next" type="hidden" value={next} />
      {/if}
      {#if !isLogin}
        {#key signupStep}
          <div class="auth-step">
            {#if signupStep === 1}
              <div class="auth-field">
                <label for="auth-name">Full name</label>
                <input
                  autocomplete="name"
                  bind:value={name}
                  aria-describedby={nameError ? 'auth-name-error' : undefined}
                  aria-invalid={nameError ? 'true' : undefined}
                  id="auth-name"
                  oninput={() => clearFieldError('name')}
                  placeholder="Ama Owusu"
                  type="text"
                />
                <p
                  class="auth-field-error"
                  id="auth-name-error"
                  role={nameError ? 'alert' : undefined}
                >
                  {nameError}
                </p>
              </div>

              <div class="auth-field">
                <label for="auth-email">Email address</label>
                <input
                  autocomplete="email"
                  bind:value={email}
                  aria-describedby={emailError ? 'auth-email-error' : undefined}
                  aria-invalid={emailError ? 'true' : undefined}
                  id="auth-email"
                  oninput={() => clearFieldError('email')}
                  placeholder="name@church.org"
                  type="email"
                />
                <p
                  class="auth-field-error"
                  id="auth-email-error"
                  role={emailError ? 'alert' : undefined}
                >
                  {emailError}
                </p>
              </div>

              <PendingButton class="auth-submit" onclick={advanceSignup} type="button">
                <span>Continue</span>
                <IconArrowRight aria-hidden="true" size={18} stroke={1.8} />
              </PendingButton>
            {:else}
              <div class="auth-account-summary">
                <span>Administrator</span>
                <strong>{name}</strong>
                <small>{email}</small>
              </div>

              <div class="auth-field">
                <label for="auth-password">Password</label>
                <PasswordField
                  autocomplete="new-password"
                  bind:value={password}
                  ariaDescribedby={passwordError ? 'auth-password-error' : undefined}
                  ariaInvalid={Boolean(passwordError)}
                  focusOnMount
                  id="auth-password"
                  minlength={8}
                  oninput={() => clearFieldError('password')}
                />
                <p class="auth-help">Use at least 8 characters for this preview.</p>
                <p
                  class="auth-field-error"
                  id="auth-password-error"
                  role={passwordError ? 'alert' : undefined}
                >
                  {passwordError}
                </p>
              </div>

              <div class="auth-step-actions">
                <button class="auth-back" type="button" onclick={returnToProfile}>
                  <IconArrowLeft aria-hidden="true" size={18} stroke={1.8} />
                  Back
                </button>
                <PendingButton
                  class="auth-submit"
                  pending={isSubmitting}
                  pendingLabel="Opening workspace…"
                  type="submit"
                  variant="primary"
                >
                  <span>{isSubmitting ? 'Opening workspace…' : submitLabel}</span>
                  <IconArrowRight aria-hidden="true" size={18} stroke={1.8} />
                </PendingButton>
              </div>
            {/if}
          </div>
        {/key}
      {:else}
        <div class="auth-field">
          <label for="auth-email">Email address</label>
          <input
            autocomplete="email"
            bind:value={email}
            aria-describedby={emailError ? 'auth-email-error' : undefined}
            aria-invalid={emailError ? 'true' : undefined}
            id="auth-email"
            name="email"
            oninput={() => clearFieldError('email')}
            placeholder="name@church.org"
            type="email"
          />
          <p class="auth-field-error" id="auth-email-error" role={emailError ? 'alert' : undefined}>
            {emailError}
          </p>
        </div>

        <div class="auth-field">
          <label for="auth-password">Password</label>
          <PasswordField
            autocomplete="current-password"
            bind:value={password}
            ariaDescribedby={passwordError ? 'auth-password-error' : undefined}
            ariaInvalid={Boolean(passwordError)}
            id="auth-password"
            name="password"
            oninput={() => clearFieldError('password')}
          />
          <p
            class="auth-field-error"
            id="auth-password-error"
            role={passwordError ? 'alert' : undefined}
          >
            {passwordError}
          </p>
        </div>

        <PendingButton
          class="auth-submit"
          pending={isSubmitting}
          pendingLabel="Opening workspace…"
          type="submit"
          variant="primary"
        >
          <span>{submitLabel}</span>
          <IconArrowRight aria-hidden="true" size={18} stroke={1.8} />
        </PendingButton>
      {/if}

      {#if formError || form?.error}
        <p class="auth-form-error" role="alert">{formError || form?.error}</p>
      {/if}
    </form>

    <aside class="auth-prototype-note" aria-label="Prototype limitation">
      <IconInfoCircle aria-hidden="true" class="auth-note-icon" size={17} stroke={1.8} />
      <p>{prototypeNotice}</p>
    </aside>

    <p class="auth-alternate">{alternatePrompt} <a href={alternateHref}>{alternateLabel}</a></p>
  </section>

  <p class="auth-return">People &amp; Membership</p>
</main>

<style>
  .auth-page {
    display: grid;
    width: 100%;
    min-height: 100svh;
    padding: 32px 20px;
    place-content: center;
    background:
      linear-gradient(120deg, transparent 0 48%, rgb(184 99 69 / 6%) 48% 48.2%, transparent 48.2%),
      var(--canvas);
  }
  .auth-brand {
    display: grid;
    grid-template-columns: 40px minmax(0, 1fr);
    gap: 10px;
    width: min(440px, calc(100vw - 40px));
    align-items: center;
    justify-content: center;
    margin: 0 auto 28px;
    color: var(--primary);
    font: 600 25px var(--font-display);
    text-decoration: none;
  }
  .auth-brand :global(.church-mark) {
    width: 40px;
    height: 40px;
  }
  .auth-church-name {
    min-width: 0;
    line-height: 1.08;
    text-align: left;
    text-wrap: pretty;
    overflow-wrap: anywhere;
  }
  .auth-panel {
    width: min(440px, calc(100vw - 40px));
    padding: 36px 32px 32px;
    border: 1px solid var(--border);
    border-radius: 12px;
    background: var(--surface-raised);
  }
  .auth-heading {
    margin-bottom: 24px;
  }
  .auth-eyebrow {
    margin: 0 0 6px;
    color: var(--primary);
    font-size: 14px;
    font-weight: 600;
  }
  .auth-heading h1 {
    max-width: 16ch;
    margin: 0;
    font: 400 36px/1.1 var(--font-display);
  }
  .auth-heading > p:last-child {
    max-width: 40ch;
    margin: 10px 0 0;
    color: var(--text-secondary);
  }
  .auth-prototype-note {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    gap: 10px;
    align-items: start;
    margin-top: 20px;
    padding: 0;
    border: 0;
    border-radius: 0;
    color: var(--text-secondary);
    background: transparent;
    font-size: 13px;
  }
  .auth-prototype-note :global(.auth-note-icon) {
    margin-top: 1px;
    color: var(--info);
  }
  .auth-prototype-note p,
  .auth-help,
  .auth-form-error,
  .auth-alternate,
  .auth-return {
    margin: 0;
  }
  .auth-form {
    display: grid;
    gap: 18px;
  }
  .auth-progress {
    display: grid;
    position: relative;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
    margin: 0 0 24px;
    padding: 0;
    color: var(--text-secondary);
    font-size: 13px;
    font-weight: 600;
    list-style: none;
  }
  .auth-progress::before {
    position: absolute;
    top: 11px;
    right: 11px;
    left: 11px;
    z-index: 0;
    height: 1px;
    background: var(--border);
    content: '';
  }
  .auth-progress.complete-first-step::before {
    background: var(--primary);
  }
  .auth-progress li {
    position: relative;
    display: grid;
    grid-template-rows: 22px auto;
    gap: 7px;
    align-items: center;
    min-width: 0;
    z-index: 1;
  }
  .auth-progress li:last-child {
    justify-items: end;
  }
  .auth-progress-marker {
    display: grid;
    width: 22px;
    height: 22px;
    place-items: center;
    border: 1px solid var(--border);
    border-radius: 50%;
    color: var(--text-secondary);
    background: var(--surface-raised);
    font-size: 12px;
  }
  .auth-progress-label {
    color: var(--text-secondary);
    line-height: 1.2;
  }
  .auth-progress li[aria-current='step'] {
    color: var(--primary);
  }
  .auth-progress li[aria-current='step'] .auth-progress-marker,
  .auth-progress li.complete .auth-progress-marker {
    border-color: var(--primary);
    color: white;
    background: var(--primary);
  }
  .auth-progress li[aria-current='step'] .auth-progress-label,
  .auth-progress li.complete .auth-progress-label {
    color: var(--primary);
  }
  .auth-step {
    display: grid;
    gap: 18px;
    animation: auth-step-enter 180ms cubic-bezier(0.16, 1, 0.3, 1) both;
  }
  .auth-account-summary {
    display: grid;
    gap: 1px;
    padding: 12px;
    border-left: 2px solid #a9b7a5;
    color: var(--text-secondary);
    background: var(--surface);
    font-size: 13px;
  }
  .auth-account-summary strong {
    color: var(--text-primary);
    font-size: 15px;
  }
  .auth-account-summary small {
    font-size: 13px;
  }
  .auth-step-actions {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    gap: 8px;
  }
  .auth-field {
    display: grid;
    gap: 6px;
  }
  .auth-field label {
    font-weight: 600;
  }
  .auth-field input {
    width: 100%;
    min-height: 46px;
    padding: 9px 11px;
    border: 2px solid var(--border);
    border-radius: 8px;
    color: var(--text-primary);
    background: #fffdf8;
    transition:
      border-color 120ms cubic-bezier(0.2, 0, 0, 1),
      box-shadow 120ms cubic-bezier(0.2, 0, 0, 1);
  }
  .auth-field input:hover {
    border-color: #a9b7a5;
  }
  .auth-field input:focus {
    outline: 0;
    border-color: #6f8b75;
    box-shadow: 0 0 0 2px rgb(49 84 59 / 12%);
  }
  .auth-help {
    color: var(--text-secondary);
    font-size: 14px;
  }
  .auth-field-error {
    min-height: 15px;
    margin: 0;
    color: var(--danger);
    font-size: 12px;
    line-height: 15px;
  }
  .auth-field input[aria-invalid='true'] {
    border-color: var(--danger);
  }
  :global(.auth-submit) {
    min-height: 46px;
    margin-top: 2px;
    font-weight: 600;
  }
  .auth-back {
    display: inline-flex;
    gap: 6px;
    min-height: 46px;
    align-items: center;
    justify-content: center;
    padding: 9px 12px;
    border: 1px solid transparent;
    border-radius: 8px;
    color: var(--primary);
    background: transparent;
    font-weight: 600;
  }
  .auth-back:hover,
  .auth-back:focus-visible {
    background: #e7ede3;
  }
  :global(.auth-submit:not(:disabled):hover svg) {
    transform: translateX(2px);
  }
  :global(.auth-submit svg) {
    transition: transform 120ms cubic-bezier(0.2, 0, 0, 1);
  }
  .auth-form-error {
    padding: 10px 12px;
    border: 1px solid var(--danger);
    border-radius: 8px;
    color: #7a2f25;
    background: #fbefec;
    font-size: 14px;
  }
  .auth-alternate {
    margin-top: 24px;
    padding-top: 20px;
    border-top: 1px solid var(--border);
    color: var(--text-secondary);
    text-align: center;
  }
  .auth-alternate a {
    display: inline-flex;
    min-height: 44px;
    align-items: center;
    padding: 0 6px;
    color: var(--primary);
    font-weight: 600;
    text-underline-offset: 3px;
  }
  .auth-return {
    margin-top: 14px;
    color: var(--text-secondary);
    font-size: 14px;
    text-align: center;
  }
  @keyframes auth-step-enter {
    from {
      opacity: 0;
      transform: translateX(8px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  @media (max-width: 520px) {
    .auth-page {
      padding: 24px 16px;
      place-content: start center;
    }
    .auth-brand {
      margin-bottom: 20px;
    }
    .auth-panel {
      width: min(100%, 440px);
      padding: 28px 24px 24px;
    }
    .auth-heading h1 {
      font-size: 32px;
    }
  }
  @media (forced-colors: active) {
    .auth-field input:focus {
      outline: 2px solid Highlight;
      outline-offset: 2px;
      border-color: Highlight;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .auth-field input,
    :global(.auth-submit),
    :global(.auth-submit svg),
    .auth-step {
      animation: none;
      transition-duration: 0.01ms;
    }
  }
</style>
