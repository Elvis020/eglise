<script lang="ts">
  import { tick } from 'svelte';
  import IconCalendar from '@tabler/icons-svelte-runes/icons/calendar';
  import IconChevronLeft from '@tabler/icons-svelte-runes/icons/chevron-left';
  import IconChevronRight from '@tabler/icons-svelte-runes/icons/chevron-right';
  import type { HTMLInputAttributes } from 'svelte/elements';

  type CalendarDay = { date: Date; inCurrentMonth: boolean };
  type CalendarView = 'days' | 'months' | 'years';

  let {
    id,
    value = $bindable(),
    disabled = false,
    ariaInvalid = false,
    ariaDescribedby,
    autocomplete = 'bday',
    onchange
  }: {
    id: string;
    value: string;
    disabled?: boolean;
    ariaInvalid?: boolean;
    ariaDescribedby?: string;
    autocomplete?: HTMLInputAttributes['autocomplete'];
    onchange?: (value: string) => void;
  } = $props();

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ];
  const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  let root: HTMLDivElement;
  let input: HTMLInputElement;
  let toggle: HTMLButtonElement;
  let isOpen = $state(false);
  let activeView = $state<CalendarView>('days');
  let inputValue = $state(toDisplayDate(parseIsoDate(value)));
  let inputHasUncommittedValue = $state(false);
  let inputError = $state('');
  let focusedDate = $state(parseIsoDate(value) ?? today());
  let viewDate = $state(startOfMonth(parseIsoDate(value) ?? today()));

  let calendarDays = $derived(buildCalendarDays(viewDate));
  let decadeStart = $derived(Math.floor(viewDate.getFullYear() / 10) * 10);
  let decadeYears = $derived(Array.from({ length: 12 }, (_, index) => decadeStart - 1 + index));
  let inputDescribedby = $derived(
    [ariaDescribedby, inputError ? `${id}-date-error` : undefined].filter(Boolean).join(' ')
  );

  $effect(() => {
    const selectedDate = parseIsoDate(value);

    if (document.activeElement !== input && !inputHasUncommittedValue) {
      inputValue = toDisplayDate(selectedDate);
    }
  });

  function today(): Date {
    const now = new Date();

    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }

  function startOfMonth(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  }

  function createLocalDate(year: number, month: number, day: number): Date | undefined {
    const date = new Date(year, month - 1, day);

    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day ||
      date > today()
    ) {
      return undefined;
    }

    return date;
  }

  function parseIsoDate(isoDate: string): Date | undefined {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);

    return match
      ? createLocalDate(Number(match[1]), Number(match[2]), Number(match[3]))
      : undefined;
  }

  function parseDisplayDate(displayDate: string): Date | undefined {
    const match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(displayDate.trim());

    return match
      ? createLocalDate(Number(match[3]), Number(match[2]), Number(match[1]))
      : undefined;
  }

  function toIsoDate(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  function toDisplayDate(date: Date | undefined): string {
    return date
      ? `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`
      : '';
  }

  function sameDay(first: Date, second: Date): boolean {
    return toIsoDate(first) === toIsoDate(second);
  }

  function buildCalendarDays(month: Date): CalendarDay[] {
    const firstVisibleDay = new Date(month.getFullYear(), month.getMonth(), 1 - month.getDay());

    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(
        firstVisibleDay.getFullYear(),
        firstVisibleDay.getMonth(),
        firstVisibleDay.getDate() + index
      );

      return { date, inCurrentMonth: date.getMonth() === month.getMonth() };
    });
  }

  function setViewDate(date: Date): void {
    viewDate = startOfMonth(date);
  }

  function open(): void {
    if (disabled) return;

    focusedDate = parseIsoDate(value) ?? today();
    setViewDate(focusedDate);
    activeView = 'days';
    isOpen = true;
    focusActiveControl();
  }

  function close(returnFocus = false): void {
    isOpen = false;

    if (returnFocus) void tick().then(() => toggle.focus());
  }

  function selectDate(date: Date): void {
    if (date > today()) return;

    value = toIsoDate(date);
    inputValue = toDisplayDate(date);
    inputHasUncommittedValue = false;
    inputError = '';
    focusedDate = date;
    onchange?.(value);
    close(true);
  }

  function commitInput(): void {
    const trimmedValue = inputValue.trim();
    const parsedDate = parseDisplayDate(trimmedValue);

    if (!trimmedValue) {
      value = '';
      inputHasUncommittedValue = false;
      inputError = '';
      onchange?.(value);

      return;
    }

    if (!parsedDate) {
      value = '';
      inputHasUncommittedValue = true;
      inputError = 'Enter a real date in DD/MM/YYYY format, on or before today.';
      onchange?.(value);

      return;
    }

    value = toIsoDate(parsedDate);
    inputValue = toDisplayDate(parsedDate);
    inputHasUncommittedValue = false;
    inputError = '';
    focusedDate = parsedDate;
    setViewDate(parsedDate);
    onchange?.(value);
  }

  function changeView(direction: number): void {
    if (activeView === 'days') moveFocusByMonth(direction);
    else if (activeView === 'months') moveToYear(viewDate.getFullYear() + direction);
    else moveToDecade(decadeStart + direction * 10);
  }

  function canMoveForward(): boolean {
    if (activeView === 'days')
      return new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1) <= startOfMonth(today());
    if (activeView === 'months') return viewDate.getFullYear() < today().getFullYear();

    return decadeStart < Math.floor(today().getFullYear() / 10) * 10;
  }

  function moveFocusByMonth(offset: number): void {
    moveFocusToMonth(focusedDate.getFullYear(), focusedDate.getMonth() + offset);
  }

  function moveFocusToMonth(year: number, month: number): void {
    const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
    const nextDate = new Date(year, month, Math.min(focusedDate.getDate(), lastDayOfMonth));

    if (nextDate > today()) return;

    focusedDate = nextDate;
    setViewDate(nextDate);
    if (isOpen) focusActiveControl();
  }

  function moveToYear(year: number): void {
    if (year > today().getFullYear()) return;

    const month = Math.min(
      viewDate.getMonth(),
      year === today().getFullYear() ? today().getMonth() : 11
    );

    setViewDate(new Date(year, month, 1));
    focusedDate = new Date(
      year,
      month,
      Math.min(focusedDate.getDate(), new Date(year, month + 1, 0).getDate())
    );
    focusActiveControl();
  }

  function moveToDecade(year: number): void {
    if (year > Math.floor(today().getFullYear() / 10) * 10) return;

    setViewDate(new Date(year, viewDate.getMonth(), 1));
    focusActiveControl();
  }

  function chooseMonth(month: number): void {
    moveFocusToMonth(viewDate.getFullYear(), month);
    activeView = 'days';
    focusActiveControl();
  }

  function chooseYear(year: number): void {
    if (year > today().getFullYear()) return;

    moveToYear(year);
    activeView = 'months';
    focusActiveControl();
  }

  function showMonths(): void {
    activeView = 'months';
    focusActiveControl();
  }

  function showYears(): void {
    activeView = 'years';
    focusActiveControl();
  }

  function moveFocus(days: number): void {
    const nextDate = new Date(
      focusedDate.getFullYear(),
      focusedDate.getMonth(),
      focusedDate.getDate() + days
    );

    if (nextDate > today()) return;

    focusedDate = nextDate;
    setViewDate(nextDate);
    focusActiveControl();
  }

  function focusActiveControl(): void {
    void tick().then(() => {
      if (!isOpen) return;

      const selector =
        activeView === 'days'
          ? '.eglise-date-picker-grid button[tabindex="0"]'
          : activeView === 'months'
            ? `[data-month="${viewDate.getMonth()}"]`
            : `[data-year="${viewDate.getFullYear()}"]`;

      root.querySelector<HTMLButtonElement>(selector)?.focus();
    });
  }

  function handleGridKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        moveFocus(-1);
        break;
      case 'ArrowRight':
        event.preventDefault();
        moveFocus(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        moveFocus(-7);
        break;
      case 'ArrowDown':
        event.preventDefault();
        moveFocus(7);
        break;
      case 'Home':
        event.preventDefault();
        moveFocus(-focusedDate.getDay());
        break;
      case 'End':
        event.preventDefault();
        moveFocus(6 - focusedDate.getDay());
        break;
      case 'PageUp':
        event.preventDefault();
        moveFocusByMonth(event.shiftKey ? -12 : -1);
        break;
      case 'PageDown':
        event.preventDefault();
        moveFocusByMonth(event.shiftKey ? 12 : 1);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        selectDate(focusedDate);
        break;
      case 'Escape':
        event.preventDefault();
        close(true);
        break;
    }
  }

  function handlePickerKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      close(true);
    }
  }

  function handleInputKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowDown' && event.altKey) {
      event.preventDefault();
      open();
    }
  }

  function handleWindowPointerdown(event: PointerEvent): void {
    if (isOpen && event.target instanceof Node && !root.contains(event.target)) close();
  }
</script>

<svelte:window onpointerdown={handleWindowPointerdown} />

<div bind:this={root} class="eglise-date-picker">
  <div class="eglise-date-picker-input-wrap">
    <input
      bind:this={input}
      aria-describedby={inputDescribedby || undefined}
      aria-invalid={ariaInvalid || Boolean(inputError)}
      {autocomplete}
      {disabled}
      {id}
      inputmode="numeric"
      maxlength="10"
      placeholder="DD/MM/YYYY"
      value={inputValue}
      onblur={commitInput}
      oninput={(event) => {
        inputValue = event.currentTarget.value;
        inputHasUncommittedValue = true;
        inputError = '';
      }}
      onkeydown={handleInputKeydown}
    />
    <button
      bind:this={toggle}
      aria-controls={`${id}-calendar`}
      aria-expanded={isOpen}
      aria-haspopup="dialog"
      aria-label="Open calendar"
      class="eglise-date-picker-toggle"
      {disabled}
      type="button"
      onclick={() => (isOpen ? close() : open())}
    >
      <IconCalendar aria-hidden="true" size={19} stroke={1.8} />
    </button>
  </div>

  {#if inputError}<p class="eglise-date-picker-error" id={`${id}-date-error`} role="alert">
      {inputError}
    </p>{/if}

  {#if isOpen}
    <div
      aria-label="Calendar"
      class="eglise-date-picker-popup"
      id={`${id}-calendar`}
      role="dialog"
      tabindex="-1"
      onkeydown={handlePickerKeydown}
    >
      <div class="eglise-date-picker-controls">
        <button aria-label="Previous period" type="button" onclick={() => changeView(-1)}
          ><IconChevronLeft aria-hidden="true" size={18} stroke={2} /></button
        >
        {#if activeView === 'days'}
          <button
            aria-label="Choose month"
            class="eglise-date-picker-heading"
            type="button"
            onclick={showMonths}>{monthNames[viewDate.getMonth()]}</button
          >
          <button
            aria-label="Choose year"
            class="eglise-date-picker-heading"
            type="button"
            onclick={showYears}>{viewDate.getFullYear()}</button
          >
        {:else if activeView === 'months'}
          <button
            aria-label="Choose year"
            class="eglise-date-picker-heading eglise-date-picker-heading-wide"
            type="button"
            onclick={showYears}>{viewDate.getFullYear()}</button
          >
        {:else}
          <span class="eglise-date-picker-decade-heading" aria-live="polite"
            >{decadeStart}–{decadeStart + 9}</span
          >
        {/if}
        <button
          aria-label="Next period"
          disabled={!canMoveForward()}
          type="button"
          onclick={() => changeView(1)}
          ><IconChevronRight aria-hidden="true" size={18} stroke={2} /></button
        >
      </div>

      {#if activeView === 'days'}
        <div class="eglise-date-picker-weekdays" aria-hidden="true">
          {#each weekdayNames as weekday}<span>{weekday}</span>{/each}
        </div>
        <div
          aria-label={`${monthNames[viewDate.getMonth()]} ${viewDate.getFullYear()}`}
          class="eglise-date-picker-grid"
          role="group"
        >
          {#each calendarDays as day}
            <button
              aria-current={sameDay(day.date, today()) ? 'date' : undefined}
              aria-label={`${day.date.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}${parseIsoDate(value) && sameDay(day.date, parseIsoDate(value)!) ? ', selected' : ''}`}
              class:outside-month={!day.inCurrentMonth}
              class:selected={parseIsoDate(value) ? sameDay(day.date, parseIsoDate(value)!) : false}
              class:today={sameDay(day.date, today())}
              disabled={day.date > today()}
              tabindex={sameDay(day.date, focusedDate) ? 0 : -1}
              type="button"
              onkeydown={handleGridKeydown}
              onclick={() => selectDate(day.date)}>{day.date.getDate()}</button
            >
          {/each}
        </div>
      {:else if activeView === 'months'}
        <div
          aria-label={`Months in ${viewDate.getFullYear()}`}
          class="eglise-date-picker-period-grid"
          role="group"
        >
          {#each monthNames as month, monthIndex}
            <button
              aria-current={monthIndex === viewDate.getMonth() ? 'true' : undefined}
              data-month={monthIndex}
              disabled={viewDate.getFullYear() === today().getFullYear() &&
                monthIndex > today().getMonth()}
              type="button"
              onclick={() => chooseMonth(monthIndex)}>{month.slice(0, 3)}</button
            >
          {/each}
        </div>
      {:else}
        <div
          aria-label={`Years ${decadeStart} to ${decadeStart + 9}`}
          class="eglise-date-picker-period-grid"
          role="group"
        >
          {#each decadeYears as year}
            <button
              aria-current={year === viewDate.getFullYear() ? 'true' : undefined}
              class:outside-period={year < decadeStart || year > decadeStart + 9}
              data-year={year}
              disabled={year > today().getFullYear()}
              type="button"
              onclick={() => chooseYear(year)}>{year}</button
            >
          {/each}
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .eglise-date-picker {
    position: relative;
  }
  .eglise-date-picker-input-wrap {
    position: relative;
  }
  .eglise-date-picker input {
    padding-right: 48px;
  }
  .eglise-date-picker-toggle {
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
  .eglise-date-picker-toggle:hover:not(:disabled) {
    background: #e7ede3;
  }
  .eglise-date-picker-error {
    margin: 8px 0 0;
    color: var(--danger);
    font-size: 14px;
  }
  .eglise-date-picker-popup {
    position: absolute;
    z-index: 4;
    top: calc(100% + 4px);
    left: 0;
    width: min(320px, calc(100vw - 48px));
    padding: 12px;
    border: 1px solid var(--border);
    border-radius: 8px;
    background: var(--surface-raised);
    box-shadow: 0 8px 20px #24271f26;
  }
  .eglise-date-picker-controls {
    display: grid;
    grid-template-columns: 36px minmax(0, 1fr) auto 36px;
    gap: 4px;
    align-items: center;
    margin-bottom: 10px;
  }
  .eglise-date-picker-controls button {
    display: grid;
    width: 36px;
    height: 36px;
    place-items: center;
    border: 0;
    border-radius: 6px;
    color: var(--primary);
    background: transparent;
  }
  .eglise-date-picker-controls button:hover:not(:disabled),
  .eglise-date-picker-heading:hover {
    background: #e7ede3;
  }
  .eglise-date-picker-heading {
    width: auto !important;
    padding: 0 8px;
    font-weight: 600;
  }
  .eglise-date-picker-heading-wide,
  .eglise-date-picker-decade-heading {
    grid-column: 2 / span 2;
  }
  .eglise-date-picker-decade-heading {
    padding: 0 8px;
    color: var(--text-primary);
    font-size: 14px;
    font-weight: 600;
    text-align: center;
  }
  .eglise-date-picker-weekdays,
  .eglise-date-picker-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
  }
  .eglise-date-picker-weekdays {
    margin-bottom: 2px;
    color: var(--text-secondary);
    font-size: 12px;
    font-weight: 600;
    text-align: center;
  }
  .eglise-date-picker-grid button,
  .eglise-date-picker-period-grid button {
    width: 100%;
    min-width: 0;
    min-height: 36px;
    border: 1px solid transparent;
    border-radius: 6px;
    color: var(--text-primary);
    background: transparent;
  }
  .eglise-date-picker-grid button:hover:not(:disabled),
  .eglise-date-picker-grid button:focus-visible,
  .eglise-date-picker-period-grid button:hover:not(:disabled),
  .eglise-date-picker-period-grid button:focus-visible,
  .eglise-date-picker-controls button:focus-visible {
    outline: 0;
    border-color: #6f8b75;
    background: #e7ede3;
  }
  .eglise-date-picker-grid button.outside-month,
  .eglise-date-picker-period-grid button.outside-period {
    color: var(--text-secondary);
  }
  .eglise-date-picker-grid button.today,
  .eglise-date-picker-period-grid button[aria-current='true'] {
    border-color: var(--border);
    font-weight: 600;
  }
  .eglise-date-picker-grid button.selected {
    color: white;
    background: var(--primary);
  }
  .eglise-date-picker-grid button:disabled,
  .eglise-date-picker-period-grid button:disabled {
    color: #a7aa9e;
    background: transparent;
  }
  .eglise-date-picker-period-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 4px;
  }
</style>
