<script lang="ts">
  import IconLoader2 from '@tabler/icons-svelte-runes/icons/loader-2';
  import type { Snippet } from 'svelte';

  type ButtonVariant = 'primary' | 'secondary' | 'danger';

  let {
    pending = false,
    pendingLabel = 'Working…',
    variant = 'primary',
    class: className = '',
    disabled = false,
    type = 'button',
    onclick,
    children
  }: {
    pending?: boolean;
    pendingLabel?: string;
    variant?: ButtonVariant;
    class?: string;
    disabled?: boolean;
    children?: Snippet;
    type?: 'button' | 'submit' | 'reset';
    onclick?: (event: MouseEvent) => void;
  } = $props();
</script>

<button
  aria-busy={pending || undefined}
  class={`pending-button pending-button--${variant} ${className}`}
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
    display: inline-flex;
    gap: 8px;
    min-height: 44px;
    align-items: center;
    justify-content: center;
    padding: 9px 14px;
    border: 1px solid transparent;
    border-radius: 8px;
    font-weight: 500;
    text-decoration: none;
    text-wrap-style: auto;
    transition:
      background-color 120ms cubic-bezier(0.2, 0, 0, 1),
      border-color 120ms cubic-bezier(0.2, 0, 0, 1),
      color 120ms cubic-bezier(0.2, 0, 0, 1),
      transform 120ms cubic-bezier(0.2, 0, 0, 1);
  }

  .pending-button--primary {
    color: white;
    background: var(--primary);
  }

  .pending-button--primary:hover:not(:disabled) {
    background: var(--primary-hover);
  }

  .pending-button--secondary {
    border-color: var(--primary);
    color: var(--primary);
    background: transparent;
  }

  .pending-button--secondary:hover:not(:disabled) {
    background: #e7ede3;
  }

  .pending-button--danger {
    color: white;
    background: var(--danger);
  }

  .pending-button--danger:hover:not(:disabled) {
    background: #843226;
  }

  .pending-button:active:not(:disabled) {
    transform: translateY(1px);
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
