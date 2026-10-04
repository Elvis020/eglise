<script lang="ts">
  import { onMount } from 'svelte';

  import { page } from '$app/state';

  import '../app.css';

  import { futureModules, moduleSlug } from '$lib/modules';
  import { toast } from '$lib/toast';

  let { children } = $props();

  onMount(() => {
    if ('serviceWorker' in navigator) {
      void navigator.serviceWorker.register('/service-worker.js');
    }
  });
</script>

<svelte:head>
  <title>Eglise — People &amp; Membership pilot</title>
</svelte:head>

<a class="skip-link" href="#main-content">Skip to main content</a>

<div class="app-shell">
  <aside class="sidebar" aria-label="Application navigation">
    <a class="brand" href="/people" aria-label="Eglise People and Membership">
      <span class="brand-mark" aria-hidden="true">E</span>
      <span>Eglise</span>
    </a>

    <p class="pilot-label">Fictional-data pilot</p>

    <nav class="navigation" aria-label="Product areas">
      <a class="nav-link" class:active={page.url.pathname.startsWith('/people')} href="/people">
        <span>People &amp; Membership</span>
        <span class="nav-status">Active</span>
      </a>

      {#each futureModules as module}
        <a
          class="nav-link"
          class:active={page.url.pathname === `/planned/${moduleSlug(module)}`}
          href={`/planned/${moduleSlug(module)}`}
        >
          <span>{module}</span>
          <span class="nav-status">Planned next</span>
        </a>
      {/each}
    </nav>

    <p class="sidebar-note">
      Refresh resets every sample record. Nothing is stored on this device.
    </p>
  </aside>

  <main id="main-content" class="content" tabindex="-1">
    <div class="shared-banner" role="status">
      <strong>Shared pilot account</strong>
      <span>Changes in this prototype cannot be attributed to a named individual.</span>
    </div>

    {@render children()}
  </main>
</div>

{#if $toast}
  <div class="toast-region" aria-live="polite" aria-atomic="true">
    <div class="toast" role="status">{$toast}</div>
  </div>
{/if}
