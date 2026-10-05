<script lang="ts">
  import { tick } from 'svelte';
  import IconDots from '@tabler/icons-svelte-runes/icons/dots';
  import IconLoader2 from '@tabler/icons-svelte-runes/icons/loader-2';
  import IconLogout from '@tabler/icons-svelte-runes/icons/logout';
  import { prototypeSession } from '$lib/prototype-session';

  import AdministratorAvatar from './AdministratorAvatar.svelte';

  let {
    collapsed = false,
    email,
    isLoggingOut = false,
    name,
    onlogout
  }: {
    collapsed?: boolean;
    email?: string;
    isLoggingOut?: boolean;
    name?: string;
    onlogout: () => void;
  } = $props();

  const administratorName = $derived(
    name ?? $prototypeSession.administrator?.name ?? 'Church administrator'
  );
  const administratorEmail = $derived(email ?? $prototypeSession.administrator?.email ?? '');
  let menuOpen = $state(false);
  let accountMenu: HTMLDivElement;
  let menuTrigger: HTMLButtonElement;

  function closeMenu(restoreFocus = false): void {
    menuOpen = false;

    if (restoreFocus) {
      void tick().then(() => menuTrigger.focus());
    }
  }

  function handleWindowPointerdown(event: PointerEvent): void {
    if (menuOpen && event.target instanceof Node && !accountMenu.contains(event.target)) {
      closeMenu();
    }
  }

  function handleMenuKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && menuOpen) {
      event.preventDefault();
      closeMenu(true);
    }
  }
</script>

<svelte:window onkeydown={handleMenuKeydown} onpointerdown={handleWindowPointerdown} />

<div bind:this={accountMenu} class="administrator-account" aria-label="Administrator account">
  <button
    bind:this={menuTrigger}
    aria-controls="administrator-menu"
    aria-expanded={menuOpen}
    aria-haspopup="menu"
    aria-label="Open administrator menu"
    class="administrator-menu-trigger"
    onclick={() => (menuOpen = !menuOpen)}
    type="button"
  >
    <AdministratorAvatar email={administratorEmail} name={administratorName} size={40} />
    <div class="administrator-copy">
      <strong>{administratorName}</strong>
      <span>Administrator</span>
    </div>
    <IconDots aria-hidden="true" class="administrator-menu-icon" size={20} stroke={1.8} />
  </button>

  {#if collapsed}
    <button
      aria-label="Log out"
      class="administrator-compact-logout"
      disabled={isLoggingOut}
      onclick={onlogout}
      title="Log out"
      type="button"
    >
      {#if isLoggingOut}
        <IconLoader2 aria-hidden="true" class="administrator-logout-spinner" size={20} stroke={2} />
      {:else}
        <IconLogout aria-hidden="true" size={20} stroke={1.8} />
      {/if}
    </button>
  {/if}

  {#if menuOpen}
    <div class="administrator-menu" id="administrator-menu" role="menu">
      <button
        aria-busy={isLoggingOut || undefined}
        class="administrator-menu-item"
        disabled={isLoggingOut}
        onclick={onlogout}
        role="menuitem"
        type="button"
      >
        {#if isLoggingOut}
          <IconLoader2
            aria-hidden="true"
            class="administrator-logout-spinner"
            size={18}
            stroke={2}
          />
          Logging out…
        {:else}
          <IconLogout aria-hidden="true" size={18} stroke={1.8} />
          Log out
        {/if}
      </button>
    </div>
  {/if}
</div>

<style>
  :global(.administrator-logout-spinner) {
    animation: administrator-logout-spin 700ms linear infinite;
  }

  @keyframes administrator-logout-spin {
    to {
      transform: rotate(360deg);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    :global(.administrator-logout-spinner) {
      animation-duration: 1.8s;
    }
  }
</style>
