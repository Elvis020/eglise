<script lang="ts">
  import { tick } from 'svelte';
  import IconClock from '@tabler/icons-svelte-runes/icons/clock';

  let {
    id,
    value = $bindable(),
    disabled = false,
    ariaInvalid = false,
    ariaDescribedby,
    onchange
  }: {
    id: string;
    value: string;
    disabled?: boolean;
    ariaInvalid?: boolean;
    ariaDescribedby?: string;
    onchange?: (value: string) => void;
  } = $props();

  const hours = Array.from({ length: 24 }, (_, hour) => hour);
  const minutes = Array.from({ length: 60 }, (_, minute) => minute);

  let root: HTMLDivElement;
  let input: HTMLInputElement;
  let toggle: HTMLButtonElement;
  let isOpen = $state(false);
  let inputValue = $state(formatTime(parseTime(value)));
  let inputHasUncommittedValue = $state(false);
  let inputError = $state('');
  let selectedTime = $derived(parseTime(value) ?? { hour: 0, minute: 0 });
  let inputDescribedby = $derived(
    [ariaDescribedby, inputError ? `${id}-time-error` : undefined].filter(Boolean).join(' ')
  );

  $effect(() => {
    if (document.activeElement !== input && !inputHasUncommittedValue) {
      inputValue = formatTime(parseTime(value));
    }
  });

  function formatNumber(value: number): string {
    return String(value).padStart(2, '0');
  }

  function formatTime(time: { hour: number; minute: number } | undefined): string {
    return time ? `${formatNumber(time.hour)}:${formatNumber(time.minute)}` : '';
  }

  function parseTime(time: string): { hour: number; minute: number } | undefined {
    const match = /^(\d{1,2}):(\d{2})$/.exec(time.trim());

    if (!match) return undefined;

    const hour = Number(match[1]);
    const minute = Number(match[2]);

    return hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59 ? { hour, minute } : undefined;
  }

  function commitInput(): void {
    const parsedTime = parseTime(inputValue);

    if (!inputValue.trim()) {
      value = '';
      inputHasUncommittedValue = false;
      inputError = '';
      onchange?.(value);

      return;
    }

    if (!parsedTime) {
      value = '';
      inputHasUncommittedValue = true;
      inputError = 'Enter a time from 00:00 to 23:59.';
      onchange?.(value);

      return;
    }

    value = formatTime(parsedTime);
    inputValue = value;
    inputHasUncommittedValue = false;
    inputError = '';
    onchange?.(value);
  }

  function open(): void {
    if (disabled) return;

    isOpen = true;
    void tick().then(() => {
      root.querySelector<HTMLButtonElement>('[data-time-selected="true"]')?.focus();
    });
  }

  function close(returnFocus = false): void {
    isOpen = false;

    if (returnFocus) void tick().then(() => toggle.focus());
  }

  function chooseTime(hour: number, minute: number, closeAfterChoice: boolean): void {
    value = formatTime({ hour, minute });
    inputValue = value;
    inputHasUncommittedValue = false;
    inputError = '';
    onchange?.(value);

    if (closeAfterChoice) close(true);
  }

  function chooseHour(hour: number): void {
    chooseTime(hour, selectedTime.minute, false);
  }

  function chooseMinute(minute: number): void {
    chooseTime(selectedTime.hour, minute, true);
  }

  function handleWindowPointerdown(event: PointerEvent): void {
    if (isOpen && event.target instanceof Node && !root.contains(event.target)) close();
  }

  function handlePickerKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      close(true);
    }
  }
</script>

<svelte:window onpointerdown={handleWindowPointerdown} />

<div bind:this={root} class="eglise-time-picker">
  <div class="eglise-time-picker-input-wrap">
    <input
      bind:this={input}
      aria-describedby={inputDescribedby || undefined}
      aria-invalid={ariaInvalid || Boolean(inputError)}
      {disabled}
      {id}
      inputmode="numeric"
      maxlength="5"
      placeholder="HH:MM"
      value={inputValue}
      onblur={commitInput}
      oninput={(event) => {
        inputValue = event.currentTarget.value;
        inputHasUncommittedValue = true;
        inputError = '';
      }}
      onkeydown={(event) => {
        if (event.key === 'ArrowDown' && event.altKey) {
          event.preventDefault();
          open();
        }
      }}
    />
    <button
      bind:this={toggle}
      aria-controls={`${id}-picker`}
      aria-expanded={isOpen}
      aria-haspopup="dialog"
      aria-label="Open time picker"
      class="eglise-time-picker-toggle"
      {disabled}
      type="button"
      onclick={() => (isOpen ? close() : open())}
    >
      <IconClock aria-hidden="true" size={19} stroke={1.8} />
    </button>
  </div>

  {#if inputError}<p class="eglise-time-picker-error" id={`${id}-time-error`} role="alert">
      {inputError}
    </p>{/if}

  {#if isOpen}
    <div
      aria-label="Choose a start time"
      class="eglise-time-picker-popup"
      id={`${id}-picker`}
      role="dialog"
      tabindex="-1"
      onkeydown={handlePickerKeydown}
    >
      <p>Choose hour and minute</p>
      <div class="eglise-time-picker-columns">
        <section aria-label="Hours" class="eglise-time-picker-column">
          <h3>Hour</h3>
          <div class="eglise-time-picker-options">
            {#each hours as hour}
              <button
                aria-label={`${formatNumber(hour)} hours`}
                aria-pressed={selectedTime.hour === hour}
                data-time-selected={selectedTime.hour === hour}
                type="button"
                onclick={() => chooseHour(hour)}>{formatNumber(hour)}</button
              >
            {/each}
          </div>
        </section>
        <section aria-label="Minutes" class="eglise-time-picker-column">
          <h3>Minute</h3>
          <div class="eglise-time-picker-options">
            {#each minutes as minute}
              <button
                aria-label={`${formatNumber(minute)} minutes`}
                aria-pressed={selectedTime.minute === minute}
                data-time-selected={selectedTime.minute === minute}
                type="button"
                onclick={() => chooseMinute(minute)}>{formatNumber(minute)}</button
              >
            {/each}
          </div>
        </section>
      </div>
    </div>
  {/if}
</div>

<style>
  .eglise-time-picker {
    position: relative;
  }
  .eglise-time-picker-input-wrap {
    position: relative;
  }
  .eglise-time-picker input {
    padding-right: 48px;
  }
  .eglise-time-picker-toggle {
    position: absolute;
    top: 2px;
    right: 2px;
    display: grid;
    width: 40px;
    height: calc(100% - 4px);
    place-items: center;
    border: 0;
    border-radius: 6px;
    color: var(--primary);
    background: transparent;
  }
  .eglise-time-picker-toggle:hover:not(:disabled) {
    background: #e7ede3;
  }
  .eglise-time-picker-error {
    margin: 8px 0 0;
    color: var(--danger);
    font-size: 14px;
  }
  .eglise-time-picker-popup {
    position: absolute;
    z-index: 20;
    top: calc(100% + 4px);
    left: 0;
    width: min(360px, 100vw - 32px);
    padding: 14px;
    border: 1px solid var(--border);
    border-radius: 8px;
    background: var(--surface-raised);
    box-shadow: 0 8px 20px #24271f26;
  }
  .eglise-time-picker-popup > p {
    margin: 0 0 10px;
    color: var(--text-secondary);
    font-size: 14px;
  }
  .eglise-time-picker-columns {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }
  .eglise-time-picker-column {
    min-width: 0;
  }
  .eglise-time-picker-column h3 {
    margin: 0 0 6px;
    color: var(--text-secondary);
    font: 600 13px var(--font-ui);
  }
  .eglise-time-picker-options {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    max-height: 196px;
    gap: 4px;
    overflow-y: auto;
    padding-right: 2px;
    scrollbar-color: #b9b9b6 transparent;
    scrollbar-width: thin;
  }
  .eglise-time-picker-options::-webkit-scrollbar {
    width: 6px;
  }
  .eglise-time-picker-options::-webkit-scrollbar-thumb {
    border-radius: 999px;
    background: #b9b9b6;
  }
  .eglise-time-picker-options button {
    min-height: 36px;
    border: 1px solid transparent;
    border-radius: 6px;
    color: var(--text-primary);
    background: transparent;
  }
  .eglise-time-picker-options button:hover,
  .eglise-time-picker-options button[aria-pressed='true'] {
    color: white;
    background: var(--primary);
  }

  @media (max-width: 960px) {
    .eglise-time-picker-toggle {
      top: 0;
      right: 0;
      width: 44px;
      height: 100%;
    }

    .eglise-time-picker-popup {
      width: min(360px, calc(100vw - 32px));
    }

    .eglise-time-picker-options button {
      min-height: 44px;
    }
  }

  @media (max-width: 480px) {
    .eglise-time-picker-popup {
      right: 0;
      left: auto;
    }
  }
</style>
