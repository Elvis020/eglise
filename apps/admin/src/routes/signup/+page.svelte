<script lang="ts">
  import AuthPrototypeForm from '$lib/components/AuthPrototypeForm.svelte';

  let { data } = $props();
</script>

<svelte:head>
  <title
    >{data.authMode === 'prototype' ? 'Create an account' : 'Invitation required'} | Eglise</title
  >
</svelte:head>

{#if data.authMode === 'prototype'}
  <AuthPrototypeForm mode="signup" />
{:else}
  <main class="auth-page" id="main-content">
    <section class="auth-panel" aria-labelledby="invite-only-title">
      <p class="auth-eyebrow">Workspace access</p>
      <h1 id="invite-only-title">An invitation is required</h1>
      <p class="auth-copy">
        Ask a workspace owner to invite your email address. They will choose the access appropriate
        to your role.
      </p>
      <a class="auth-link" href="/login">Return to sign in</a>
    </section>
  </main>
{/if}

<style>
  .auth-page {
    display: grid;
    min-height: 100svh;
    padding: 24px;
    place-content: center;
    background: var(--canvas);
  }
  .auth-panel {
    display: grid;
    gap: 16px;
    width: min(440px, 100%);
    padding: 36px 32px;
    border: 1px solid var(--border);
    border-radius: 12px;
    background: var(--surface-raised);
  }
  .auth-eyebrow {
    margin: 0;
    color: var(--primary);
    font-size: 14px;
    font-weight: 600;
  }
  h1 {
    margin: 0;
    font: 400 36px/1.1 var(--font-display);
  }
  .auth-copy {
    margin: 0;
    color: var(--text-secondary);
  }
  .auth-link {
    color: var(--primary);
    font-weight: 600;
  }
</style>
