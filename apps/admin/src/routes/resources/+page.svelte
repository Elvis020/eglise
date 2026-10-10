<script lang="ts">
  import IconArrowUpRight from '@tabler/icons-svelte-runes/icons/arrow-up-right';
  import IconFolder from '@tabler/icons-svelte-runes/icons/folder';
  import IconPlus from '@tabler/icons-svelte-runes/icons/plus';

  import { resources, resourceKindLabel } from '$lib/resources';
</script>

<svelte:head><title>Resources | Eglise</title></svelte:head>

<section class="page resources-page">
  <header class="page-head resources-page-head">
    <div>
      <p class="eyebrow">Resources</p>
      <h1 tabindex="-1">Shared material, easy to find.</h1>
      <p class="page-intro">
        Keep a short, reviewed register of the church notes, sermon audio, and Telegram links staff
        already share.
      </p>
    </div>
    <a class="button primary" href="/resources/new"
      ><IconPlus aria-hidden="true" size={18} stroke={1.8} />Add resource</a
    >
  </header>

  <aside aria-labelledby="resources-boundary-title" class="resources-boundary">
    <div>
      <p class="eyebrow">Discovery boundary</p>
      <h2 id="resources-boundary-title">Staff curation only, for now</h2>
    </div>
    <p>
      Audience, publishing ownership, link review, and removal rules still need agreement. Eglise
      does not replace the church’s Telegram or WhatsApp channels.
    </p>
  </aside>

  <section aria-labelledby="resource-list-title" class="resources-list-section">
    <div class="resources-section-heading">
      <p class="eyebrow">Resource register</p>
      <h2 id="resource-list-title">Reviewed links</h2>
    </div>

    {#if $resources.length}
      <div class="resources-table-wrap">
        <table class="resources-table">
          <thead>
            <tr>
              <th scope="col">Resource</th>
              <th scope="col">Type</th>
              <th scope="col">Link</th>
            </tr>
          </thead>
          <tbody>
            {#each $resources as resource}
              <tr>
                <th data-label="Resource" scope="row">
                  <strong>{resource.title}</strong>
                  {#if resource.note}<small>{resource.note}</small>{/if}
                </th>
                <td data-label="Type">{resourceKindLabel(resource.kind)}</td>
                <td data-label="Link">
                  <a href={resource.url} rel="noreferrer" target="_blank"
                    >Open link <IconArrowUpRight aria-hidden="true" size={16} stroke={1.8} /></a
                  >
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {:else}
      <div class="resources-empty-state">
        <IconFolder aria-hidden="true" size={22} stroke={1.8} />
        <div>
          <h3>No resources have been added</h3>
          <p>Add an existing Church Note, sermon-audio, or Telegram link to begin the register.</p>
          <a href="/resources/new">Add a resource</a>
        </div>
      </div>
    {/if}
  </section>
</section>

<style>
  .resources-page {
    display: grid;
    gap: 40px;
  }
  .resources-page-head,
  .resources-boundary,
  .resources-list-section {
    max-width: 1120px;
  }
  .resources-page-head {
    margin-bottom: 0;
  }
  .resources-boundary {
    display: flex;
    gap: 32px;
    align-items: center;
    justify-content: space-between;
    padding: 20px 0;
  }
  .resources-boundary .eyebrow,
  .resources-section-heading .eyebrow {
    margin-bottom: 4px;
  }
  .resources-boundary h2,
  .resources-section-heading h2 {
    margin: 0;
    font: 400 30px/1.15 var(--font-display);
  }
  .resources-boundary > p {
    max-width: 560px;
    margin: 0;
    color: var(--text-secondary);
  }
  .resources-list-section {
    display: grid;
    gap: 20px;
  }
  .resources-table-wrap {
    overflow-x: auto;
  }
  .resources-table {
    width: 100%;
    border-collapse: collapse;
    text-align: left;
  }
  .resources-table th,
  .resources-table td {
    padding: 16px;
    border-bottom: 1px solid var(--border);
    vertical-align: top;
  }
  .resources-table thead th {
    color: var(--text-secondary);
    font-size: 14px;
    font-weight: 600;
  }
  .resources-table tbody th {
    min-width: 280px;
    font-weight: 400;
  }
  .resources-table tbody th strong {
    display: block;
    font-weight: 600;
  }
  .resources-table small {
    display: block;
    margin-top: 2px;
    color: var(--text-secondary);
    font-size: 14px;
    font-weight: 400;
  }
  .resources-table a,
  .resources-empty-state a {
    display: inline-flex;
    gap: 6px;
    align-items: center;
    color: var(--primary);
    font-weight: 600;
    text-underline-offset: 3px;
  }
  .resources-empty-state {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    gap: 14px;
    max-width: 600px;
    padding: 20px;
    border: 1px solid var(--border);
    border-radius: 12px;
    background: var(--surface-raised);
  }
  .resources-empty-state :global(svg) {
    color: var(--text-secondary);
  }
  .resources-empty-state h3 {
    margin: 0;
    font-size: 16px;
  }
  .resources-empty-state p {
    margin: 4px 0 0;
    color: var(--text-secondary);
  }
  .resources-empty-state a {
    margin-top: 12px;
  }
  @media (max-width: 960px) {
    .resources-page {
      gap: 32px;
    }
    .resources-page-head,
    .resources-boundary {
      display: block;
    }
    .resources-page-head .button {
      display: inline-flex;
      margin-top: 16px;
    }
    .resources-boundary > p {
      margin-top: 12px;
    }
    .resources-table-wrap {
      overflow: visible;
    }
    .resources-table,
    .resources-table tbody,
    .resources-table tr,
    .resources-table th,
    .resources-table td {
      display: block;
    }
    .resources-table thead {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }
    .resources-table tr {
      padding: 16px 0;
      border-bottom: 1px solid var(--border);
    }
    .resources-table th,
    .resources-table td {
      display: grid;
      grid-template-columns: minmax(112px, 0.8fr) minmax(0, 1.2fr);
      gap: 16px;
      min-width: 0;
      padding: 5px 0;
      border: 0;
    }
    .resources-table th::before,
    .resources-table td::before {
      content: attr(data-label);
      color: var(--text-secondary);
      font-size: 14px;
      font-weight: 600;
    }
  }
</style>
