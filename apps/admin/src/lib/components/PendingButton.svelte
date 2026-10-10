<script lang="ts">
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

  const pendingVisibleLabel = $derived(pendingLabel.replace(/\s*(?:…|\.\.\.)$/, ''));
</script>

<button
  aria-busy={pending || undefined}
  class={`pending-button pending-button--${variant} ${className}`}
  disabled={disabled || pending}
  {onclick}
  {type}
>
  {#if pending}
    <span aria-live="polite" class="pending-button-pending-label">
      {pendingVisibleLabel}
      <span aria-hidden="true" class="pending-button-dots">
        <span></span><span></span><span></span>
      </span>
    </span>
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

  .pending-button-pending-label {
    display: inline;
  }

  .pending-button-dots {
    display: inline;
    margin-left: 3px;
    white-space: nowrap;
  }

  .pending-button-dots span {
    display: inline-block;
    width: 4px;
    height: 4px;
    margin-right: 3px;
    border-radius: 50%;
    background: currentcolor;
    animation: pending-button-dot 900ms ease-in-out infinite;
    vertical-align: baseline;
  }

  .pending-button-dots span:last-child {
    margin-right: 0;
  }

  .pending-button-dots span:nth-child(2) {
    animation-delay: 120ms;
  }

  .pending-button-dots span:nth-child(3) {
    animation-delay: 240ms;
  }

  @keyframes pending-button-dot {
    0%,
    100% {
      opacity: 0.35;
      transform: translateY(0);
    }

    50% {
      opacity: 1;
      transform: translateY(-2px);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .pending-button-dots span {
      animation: none;
      opacity: 0.7;
    }
  }
</style>
