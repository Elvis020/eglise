<script lang="ts">
  import type { Person, PersonKind } from '$lib/domain';
  import { summarisePeople } from '$lib/people-summary';

  export type DirectoryKindFilter = 'all' | Extract<PersonKind, 'visitor' | 'first-timer'>;

  let {
    records,
    activeFilter,
    onfilterchange
  }: {
    records: Person[];
    activeFilter: DirectoryKindFilter;
    onfilterchange: (filter: DirectoryKindFilter) => void;
  } = $props();

  let summary = $derived(summarisePeople(records));
  const heatmapCells = Array.from({ length: 12 }, (_, index) => index);
</script>

<section aria-label="Directory filters" class="directory-summary-filters">
  <button
    aria-pressed={activeFilter === 'all'}
    class:active={activeFilter === 'all'}
    class="directory-summary-filter"
    data-summary="directory"
    onclick={() => onfilterchange('all')}
    type="button"
  >
    <span>Total people</span>
    <strong>{summary.total}</strong>
  </button>

  <button
    aria-pressed={activeFilter === 'visitor'}
    class:active={activeFilter === 'visitor'}
    class="directory-summary-filter"
    data-summary="visitors"
    onclick={() => onfilterchange('visitor')}
    type="button"
  >
    <span>Visitors</span>
    <strong>{summary.visitors}</strong>
  </button>

  <button
    aria-pressed={activeFilter === 'first-timer'}
    class:active={activeFilter === 'first-timer'}
    class="directory-summary-filter"
    data-summary="first-timers"
    onclick={() => onfilterchange('first-timer')}
    type="button"
  >
    <span>First-timers</span>
    <strong>{summary.firstTimers}</strong>
  </button>

  <button
    aria-describedby="neighbourhood-heatmap-help"
    class="directory-summary-filter neighbourhood-heatmap-filter"
    data-summary="neighbourhood-heatmap"
    disabled
    type="button"
  >
    <span class="neighbourhood-heatmap-copy">
      <span>Neighbourhood heatmap</span>
      <small id="neighbourhood-heatmap-help">Coming soon</small>
    </span>
    <span aria-hidden="true" class="neighbourhood-heatmap-preview">
      {#each heatmapCells as index}
        <i class:active={index === 1 || index === 5 || index === 6 || index === 10}></i>
      {/each}
    </span>
  </button>
</section>

<style>
  .directory-summary-filters {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 8px;
    margin: 0 0 16px;
  }

  .directory-summary-filter {
    display: flex;
    min-height: 72px;
    align-items: flex-end;
    justify-content: space-between;
    gap: 12px;
    padding: 12px 16px;
    border: 1px solid var(--border);
    border-radius: 8px;
    color: var(--text-secondary);
    background: var(--canvas);
    font: inherit;
    text-align: left;
    cursor: pointer;
  }

  .directory-summary-filter:hover,
  .directory-summary-filter:focus-visible {
    border-color: var(--primary);
    color: var(--text-primary);
  }

  .directory-summary-filter:focus-visible {
    outline: 2px solid #6f8b75;
    outline-offset: 2px;
  }

  .directory-summary-filter.active {
    border-color: var(--primary);
    color: var(--text-primary);
    background: var(--surface);
  }

  .directory-summary-filter span {
    font-size: 14px;
    line-height: 1.3;
  }

  .directory-summary-filter strong {
    font: 400 30px/1 var(--font-display);
  }

  .neighbourhood-heatmap-filter {
    align-items: center;
    cursor: not-allowed;
    opacity: 1;
  }

  .neighbourhood-heatmap-copy {
    display: grid;
    gap: 2px;
  }

  .neighbourhood-heatmap-copy small {
    color: var(--text-secondary);
    font-size: 12px;
  }

  .neighbourhood-heatmap-preview {
    display: grid;
    grid-template-columns: repeat(4, 8px);
    gap: 4px;
    padding: 4px;
  }

  .neighbourhood-heatmap-preview i {
    display: block;
    width: 8px;
    height: 8px;
    border: 1px solid var(--border);
    border-radius: 2px;
    background: var(--surface-raised);
  }

  .neighbourhood-heatmap-preview i.active {
    border-color: #a9b7a5;
    background: #dfe8da;
  }

  @media (max-width: 960px) {
    .directory-summary-filters {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
</style>
