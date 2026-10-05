<script lang="ts">
  import IconLoader2 from '@tabler/icons-svelte-runes/icons/loader-2';
  import type { Snippet } from 'svelte';

  let {
    pending = false,
    pendingLabel = 'Working…',
    class: className = '',
    disabled = false,
    type = 'button',
    onclick,
    children
  }: {
    pending?: boolean;
    pendingLabel?: string;
    class?: string;
    disabled?: boolean;
    children?: Snippet;
    type?: 'button' | 'submit' | 'reset';
    onclick?: (event: MouseEvent) => void;
  } = $props();
</script>

<button
  aria-busy={pending || undefined}
  class={`pending-button ${className}`}
  disabled={disabled || pending}
  {onclick}
  {type}
>
  {#if pending}
    <IconLoader2 aria-hidden="true" class="pending-button-spinner" size={18} stroke={2} />
    <span aria-live="polite">{pendingLabel}</span>
  {:else}
    {@render children?.()}
  {/if}
</button>

<style>
  .pending-button {
    position: relative;
  }

  .pending-button-spinner {
    flex: 0 0 auto;
    animation: pending-button-spin 700ms linear infinite;
  }

  @keyframes pending-button-spin {
    to {
      transform: rotate(360deg);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .pending-button-spinner {
      animation-duration: 1.8s;
    }
  }
</style>
