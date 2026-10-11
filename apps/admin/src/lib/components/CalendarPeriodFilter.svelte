<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import { calendarBounds, calendarSelection, movePeriod, todayIso } from '$lib/calendar-period';
  import EgliseDatePicker from './EgliseDatePicker.svelte';

  const selection = $derived(calendarSelection(page.url.searchParams));
  let anchor = $state(todayIso());

  $effect(() => {
    anchor = selection.anchor;
  });

  function select(period: string, date: string): void {
    const url = new URL(page.url);

    url.searchParams.set('period', period);
    url.searchParams.set('date', date);
    void goto(`${url.pathname}${url.search}${url.hash}`, { noScroll: true, keepFocus: true });
  }
</script>

<div class="calendar-filter" aria-label="Calendar period">
  <div class="field">
    <label for="calendar-period">Reporting period</label>
    <select
      id="calendar-period"
      value={selection.period}
      onchange={(event) => select(event.currentTarget.value, selection.anchor)}
    >
      <option value="week">Calendar week</option>
      <option value="month">Calendar month</option>
      <option value="year">Calendar year</option>
    </select>
  </div>
  <div class="field">
    <label for="calendar-anchor">Date within period</label>
    <EgliseDatePicker
      id="calendar-anchor"
      bind:value={anchor}
      allowFuture
      autocomplete="off"
      onchange={(date) => {
        if (date) select(selection.period, date);
      }}
    />
  </div>
  <div class="period-step-actions">
    <button
      class="button secondary"
      type="button"
      aria-label="Previous period"
      onclick={() => select(selection.period, movePeriod(selection.period, selection.anchor, -1))}
      >Previous</button
    >
    <button
      class="button secondary"
      type="button"
      aria-label="Next period"
      onclick={() => select(selection.period, movePeriod(selection.period, selection.anchor, 1))}
      >Next</button
    >
  </div>
  <p class="muted">
    {calendarBounds(selection.period, selection.anchor).label}<br />Weeks start Monday.
  </p>
</div>
