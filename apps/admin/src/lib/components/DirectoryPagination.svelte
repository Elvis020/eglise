<script lang="ts">
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
        class="button secondary compact-button"
        type="button"
        disabled={currentPage === 1}
        onclick={() => (page = currentPage - 1)}
      >
        Previous
      </button>
      <span aria-current="page">Page {currentPage} of {totalPages}</span>
      <button
        class="button secondary compact-button"
        type="button"
        disabled={currentPage === totalPages}
        onclick={() => (page = currentPage + 1)}
      >
        Next
      </button>
    </div>
  {/if}
</div>
