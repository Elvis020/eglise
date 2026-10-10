<script lang="ts">
  import IconHeartHandshake from '@tabler/icons-svelte-runes/icons/heart-handshake';
  import IconPlus from '@tabler/icons-svelte-runes/icons/plus';

  import { welfareDiscoveryAreaLabel, welfareDiscoveryItems } from '$lib/welfare';
</script>

<svelte:head><title>Welfare | Eglise</title></svelte:head>

<section class="page welfare-page">
  <header class="page-head welfare-page-head">
    <div>
      <p class="eyebrow">Welfare</p>
      <h1 tabindex="-1">Agree the care model before recording care.</h1>
      <p class="page-intro">
        Keep the questions around contributions and support visible without creating sensitive
        welfare or financial records in a shared pilot account.
      </p>
    </div>
    <a class="button primary" href="/welfare/new"
      ><IconPlus aria-hidden="true" size={18} stroke={1.8} />Add discovery item</a
    >
  </header>

  <aside aria-labelledby="welfare-boundary-title" class="welfare-boundary">
    <div>
      <p class="eyebrow">Restricted discovery</p>
      <h2 id="welfare-boundary-title">No financial or personal welfare records</h2>
    </div>
    <p>
      This prototype cannot record contributors, recipients, support amounts, assistance cases,
      approvals, reminders, corrections, or exports. Those workflows need narrower access and named
      accountability.
    </p>
  </aside>

  <section aria-labelledby="welfare-discovery-list-title" class="welfare-discovery-list-section">
    <div class="welfare-section-heading">
      <p class="eyebrow">Decision register</p>
      <h2 id="welfare-discovery-list-title">Questions to resolve before a workflow</h2>
    </div>

    {#if $welfareDiscoveryItems.length}
      <div class="welfare-discovery-table-wrap">
        <table class="welfare-discovery-table">
          <thead>
            <tr>
              <th scope="col">Topic</th>
              <th scope="col">Area</th>
              <th scope="col">Decision needed</th>
            </tr>
          </thead>
          <tbody>
            {#each $welfareDiscoveryItems as item}
              <tr>
                <th data-label="Topic" scope="row">{item.title}</th>
                <td data-label="Area">{welfareDiscoveryAreaLabel(item.area)}</td>
                <td data-label="Decision needed">{item.decision}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {:else}
      <div class="welfare-discovery-empty-state">
        <IconHeartHandshake aria-hidden="true" size={22} stroke={1.8} />
        <div>
          <h3>No welfare discovery items have been recorded</h3>
          <p>Start with one policy or ownership question, not a contribution or assistance case.</p>
          <a href="/welfare/new">Add discovery item</a>
        </div>
      </div>
    {/if}
  </section>
</section>

<style>
  .welfare-page {
    display: grid;
    gap: 40px;
  }
  .welfare-page-head,
  .welfare-boundary,
  .welfare-discovery-list-section {
    max-width: 1120px;
  }
  .welfare-page-head {
    margin-bottom: 0;
  }
  .welfare-boundary {
    display: flex;
    gap: 32px;
    align-items: center;
    justify-content: space-between;
    padding: 20px 0;
  }
  .welfare-boundary .eyebrow,
  .welfare-section-heading .eyebrow {
    margin-bottom: 4px;
  }
  .welfare-boundary h2,
  .welfare-section-heading h2 {
    margin: 0;
    font: 400 30px/1.15 var(--font-display);
  }
  .welfare-boundary > p {
    max-width: 560px;
    margin: 0;
    color: var(--text-secondary);
  }
  .welfare-discovery-list-section {
    display: grid;
    gap: 20px;
  }
  .welfare-discovery-table-wrap {
    overflow-x: auto;
  }
  .welfare-discovery-table {
    width: 100%;
    border-collapse: collapse;
    text-align: left;
  }
  .welfare-discovery-table th,
  .welfare-discovery-table td {
    padding: 16px;
    border-bottom: 1px solid var(--border);
    vertical-align: top;
  }
  .welfare-discovery-table thead th {
    color: var(--text-secondary);
    font-size: 14px;
    font-weight: 600;
  }
  .welfare-discovery-table tbody th {
    min-width: 220px;
    font-weight: 600;
  }
  .welfare-discovery-empty-state {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    gap: 14px;
    max-width: 600px;
    padding: 20px;
    border: 1px solid var(--border);
    border-radius: 12px;
    background: var(--surface-raised);
  }
  .welfare-discovery-empty-state :global(svg) {
    color: var(--text-secondary);
  }
  .welfare-discovery-empty-state h3 {
    margin: 0;
    font-size: 16px;
  }
  .welfare-discovery-empty-state p {
    margin: 4px 0 0;
    color: var(--text-secondary);
  }
  .welfare-discovery-empty-state a {
    display: inline-flex;
    margin-top: 12px;
    color: var(--primary);
    font-weight: 600;
    text-underline-offset: 3px;
  }
  @media (max-width: 720px) {
    .welfare-page {
      gap: 32px;
    }
    .welfare-page-head,
    .welfare-boundary {
      display: block;
    }
    .welfare-page-head .button {
      display: inline-flex;
      margin-top: 16px;
    }
    .welfare-boundary > p {
      margin-top: 12px;
    }
    .welfare-discovery-table-wrap {
      overflow: visible;
    }
    .welfare-discovery-table,
    .welfare-discovery-table tbody,
    .welfare-discovery-table tr,
    .welfare-discovery-table th,
    .welfare-discovery-table td {
      display: block;
    }
    .welfare-discovery-table thead {
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
    .welfare-discovery-table tr {
      padding: 16px 0;
      border-bottom: 1px solid var(--border);
    }
    .welfare-discovery-table th,
    .welfare-discovery-table td {
      display: grid;
      grid-template-columns: minmax(112px, 0.8fr) minmax(0, 1.2fr);
      gap: 16px;
      min-width: 0;
      padding: 5px 0;
      border: 0;
    }
    .welfare-discovery-table th::before,
    .welfare-discovery-table td::before {
      content: attr(data-label);
      color: var(--text-secondary);
      font-size: 14px;
      font-weight: 600;
    }
  }
</style>
