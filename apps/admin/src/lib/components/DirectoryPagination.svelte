<script lang="ts">
  import IconChevronLeft from '@tabler/icons-svelte-runes/icons/chevron-left';
  import IconChevronRight from '@tabler/icons-svelte-runes/icons/chevron-right';

  import { clampPage, pageCount, pageSummary } from '$lib/directory';

  let {
    page = $bindable(),
    pageSize,
    total
  }: {
    page: number;
    pageSize: number;
    total: number;
  } = $props();

  let totalPages = $derived(pageCount(total, pageSize));
  let currentPage = $derived(clampPage(page, total, pageSize));
</script>

<div class="directory-pagination" aria-label="Directory pagination">
  <p class="directory-pagination-summary" aria-live="polite">
    Showing {pageSummary(total, currentPage, pageSize)} records
  </p>
  {#if totalPages > 1}
    <div class="directory-page-actions">
      <button
        aria-label="Previous"
        class="button secondary compact-button"
        type="button"
        disabled={currentPage === 1}
        onclick={() => (page = currentPage - 1)}
      >
        <IconChevronLeft
          aria-hidden="true"
          class="directory-page-action-icon"
          size={18}
          stroke={2}
        />
        <span class="directory-page-action-label">Previous</span>
      </button>
      <span aria-current="page">Page {currentPage} of {totalPages}</span>
      <button
        aria-label="Next"
        class="button secondary compact-button"
        type="button"
        disabled={currentPage === totalPages}
        onclick={() => (page = currentPage + 1)}
      >
        <span class="directory-page-action-label">Next</span>
        <IconChevronRight
          aria-hidden="true"
          class="directory-page-action-icon"
          size={18}
          stroke={2}
        />
      </button>
    </div>
  {/if}
</div>
