<script lang="ts">
  import { tick } from 'svelte';
  import IconEye from '@tabler/icons-svelte-runes/icons/eye';
  import IconEyeOff from '@tabler/icons-svelte-runes/icons/eye-off';

  let {
    id,
    name,
    value = $bindable(''),
    autocomplete,
    minlength,
    required = false,
    ariaDescribedby,
    ariaInvalid = false,
    oninput,
    focusOnMount = false
  }: {
    id: string;
    name?: string;
    value?: string;
    autocomplete: 'current-password' | 'new-password';
    minlength?: number;
    required?: boolean;
    ariaDescribedby?: string;
    ariaInvalid?: boolean;
    oninput?: (event: Event) => void;
    focusOnMount?: boolean;
  } = $props();

  let input = $state<HTMLInputElement>();
  let passwordVisible = $state(false);

  $effect(() => {
    if (focusOnMount) input?.focus();
  });

  async function togglePasswordVisibility(): Promise<void> {
    passwordVisible = !passwordVisible;
    await tick();
    input?.focus();
  }
</script>

<div class="password-field">
  <input
    bind:this={input}
    {autocomplete}
    aria-describedby={ariaDescribedby}
    aria-invalid={ariaInvalid || undefined}
    {id}
    {minlength}
    {name}
    {oninput}
    {required}
    type={passwordVisible ? 'text' : 'password'}
    bind:value
  />
  <button
    aria-label={passwordVisible ? 'Hide password' : 'Show password'}
    aria-pressed={passwordVisible}
    class="password-field-toggle"
    onclick={togglePasswordVisibility}
    type="button"
  >
    {#if passwordVisible}
      <IconEyeOff aria-hidden="true" size={20} stroke={1.8} />
    {:else}
      <IconEye aria-hidden="true" size={20} stroke={1.8} />
    {/if}
  </button>
</div>

<style>
  .password-field {
    position: relative;
  }

  input {
    width: 100%;
    min-height: 46px;
    padding: 9px 52px 9px 11px;
    border: 2px solid var(--border);
    border-radius: 8px;
    color: var(--text-primary);
    background: #fffdf8;
    transition:
      border-color 120ms cubic-bezier(0.2, 0, 0, 1),
      box-shadow 120ms cubic-bezier(0.2, 0, 0, 1);
  }

  input:hover {
    border-color: #a9b7a5;
  }

  input:focus {
    outline: 0;
    border-color: #6f8b75;
    box-shadow: 0 0 0 2px rgb(49 84 59 / 12%);
  }

  input[aria-invalid='true'],
  input[aria-invalid='true']:focus {
    border-color: var(--danger);
    box-shadow: 0 0 0 2px rgb(168 69 53 / 16%);
  }

  .password-field-toggle {
    position: absolute;
    top: 1px;
    right: 1px;
    display: grid;
    width: 42px;
    height: calc(100% - 2px);
    place-items: center;
    padding: 0;
    border: 0;
    border-radius: 6px;
    color: var(--text-secondary);
    background: transparent;
    cursor: pointer;
  }

  .password-field-toggle:hover {
    color: var(--primary);
  }

  .password-field-toggle:focus-visible {
    outline: 2px solid var(--primary);
    outline-offset: -3px;
    color: var(--primary);
  }

  @media (forced-colors: active) {
    input:focus,
    .password-field-toggle:focus-visible {
      outline: 2px solid Highlight;
      outline-offset: 2px;
      border-color: Highlight;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    input {
      transition-duration: 0.01ms;
    }
  }
</style>
