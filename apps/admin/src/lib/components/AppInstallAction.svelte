<script lang="ts">
  import IconDeviceMobile from '@tabler/icons-svelte-runes/icons/device-mobile';
  import { pwaInstall, requestPwaInstall } from '$lib/pwa-install';

  let installDialog: HTMLDialogElement;
  let isRequesting = $state(false);

  const installKind = $derived($pwaInstall.kind);

  async function install(): Promise<void> {
    isRequesting = true;

    try {
      await requestPwaInstall();
    } finally {
      isRequesting = false;
    }
  }

  function openInstallInstructions(): void {
    installDialog.showModal();
  }
</script>

{#if installKind === 'prompt'}
  <button
    aria-busy={isRequesting || undefined}
    class="app-install-action"
    disabled={isRequesting}
    onclick={install}
    type="button"
  >
    <IconDeviceMobile aria-hidden="true" size={22} stroke={1.8} />
    <span>
      <strong>{isRequesting ? 'Opening install prompt…' : 'Install Eglise'}</strong>
      <small>Keep the workspace on your home screen.</small>
    </span>
  </button>
{:else if installKind === 'ios'}
  <button class="app-install-action" onclick={openInstallInstructions} type="button">
    <IconDeviceMobile aria-hidden="true" size={22} stroke={1.8} />
    <span>
      <strong>Add Eglise to Home Screen</strong>
      <small>Save a shortcut that opens like an app.</small>
    </span>
  </button>
{/if}

<dialog bind:this={installDialog} aria-labelledby="install-dialog-title">
  <form method="dialog">
    <p class="dialog-context">Eglise app</p>
    <h2 id="install-dialog-title">Add Eglise to your Home Screen</h2>
    <ol>
      <li>Tap the Share button in Safari.</li>
      <li>Choose <strong>Add to Home Screen</strong>.</li>
      <li>Tap <strong>Add</strong> to finish.</li>
    </ol>
    <div class="dialog-actions">
      <button class="button primary" type="submit">Done</button>
    </div>
  </form>
</dialog>

<style>
  .app-install-action {
    display: grid;
    grid-template-columns: 28px minmax(0, 1fr);
    gap: 12px;
    width: 100%;
    min-height: 64px;
    align-items: center;
    padding: 12px 8px;
    border: 1px solid color-mix(in srgb, var(--primary) 32%, var(--border));
    border-radius: 8px;
    color: var(--text-primary);
    background: color-mix(in srgb, var(--surface) 64%, var(--surface-raised));
    font: inherit;
    text-align: left;
  }

  .app-install-action:hover,
  .app-install-action:focus-visible {
    border-color: var(--primary);
    color: var(--primary);
  }

  .app-install-action:active {
    background: var(--surface);
  }

  .app-install-action:disabled {
    cursor: wait;
  }

  .app-install-action :global(svg) {
    color: var(--primary);
  }

  .app-install-action span {
    display: grid;
    gap: 2px;
    min-width: 0;
  }

  .app-install-action strong {
    font-size: 16px;
  }

  .app-install-action small {
    color: var(--text-secondary);
    font-size: 14px;
  }

  dialog ol {
    display: grid;
    gap: 8px;
    margin: 16px 0 0;
    padding-left: 24px;
  }
</style>
