<script lang="ts">
  import IconBook2 from '@tabler/icons-svelte-runes/icons/book-2';
  import IconPlus from '@tabler/icons-svelte-runes/icons/plus';

  import { studyMaterialFormatLabel, studyMaterials } from '$lib/bible-study';
</script>

<svelte:head><title>Bible Study | Eglise</title></svelte:head>

<section class="page bible-study-page">
  <header class="page-head bible-study-page-head">
    <div>
      <p class="eyebrow">Bible Study</p>
      <h1 tabindex="-1">Prepare material without guessing the class.</h1>
      <p class="page-intro">
        Keep a light record of sermon-derived material while the church agrees how study groups and
        participation should work.
      </p>
    </div>
    <a class="button primary" href="/bible-study/new"
      ><IconPlus aria-hidden="true" size={18} stroke={1.8} />Add material</a
    >
  </header>

  <aside aria-labelledby="bible-study-boundary-title" class="bible-study-boundary">
    <div>
      <p class="eyebrow">Discovery boundary</p>
      <h2 id="bible-study-boundary-title">Materials only, not learner records</h2>
    </div>
    <p>
      This prototype does not enrol people, record attendance, infer completion, or grant
      facilitator access. Main-service attendance remains separate.
    </p>
  </aside>

  <section aria-labelledby="study-material-list-title" class="study-material-list-section">
    <div class="study-material-section-heading">
      <p class="eyebrow">Material register</p>
      <h2 id="study-material-list-title">What is ready to discuss</h2>
    </div>

    {#if $studyMaterials.length}
      <div class="study-material-table-wrap">
        <table class="study-material-table">
          <thead>
            <tr>
              <th scope="col">Material</th>
              <th scope="col">Prepared from</th>
              <th scope="col">Format</th>
            </tr>
          </thead>
          <tbody>
            {#each $studyMaterials as material}
              <tr>
                <th data-label="Material" scope="row">{material.title}</th>
                <td data-label="Prepared from">{material.source}</td>
                <td data-label="Format">{studyMaterialFormatLabel(material.format)}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {:else}
      <div class="study-material-empty-state">
        <IconBook2 aria-hidden="true" size={22} stroke={1.8} />
        <div>
          <h3>No study material has been recorded</h3>
          <p>Begin with one sermon or existing church resource the team wants to discuss.</p>
          <a href="/bible-study/new">Add material</a>
        </div>
      </div>
    {/if}
  </section>
</section>

<style>
  .bible-study-page {
    display: grid;
    gap: 40px;
  }
  .bible-study-page-head,
  .bible-study-boundary,
  .study-material-list-section {
    max-width: 1120px;
  }
  .bible-study-page-head {
    margin-bottom: 0;
  }
  .bible-study-boundary {
    display: flex;
    gap: 32px;
    align-items: center;
    justify-content: space-between;
    padding: 20px 0;
  }
  .bible-study-boundary .eyebrow,
  .study-material-section-heading .eyebrow {
    margin-bottom: 4px;
  }
  .bible-study-boundary h2,
  .study-material-section-heading h2 {
    margin: 0;
    font: 400 30px/1.15 var(--font-display);
  }
  .bible-study-boundary > p {
    max-width: 560px;
    margin: 0;
    color: var(--text-secondary);
  }
  .study-material-list-section {
    display: grid;
    gap: 20px;
  }
  .study-material-table-wrap {
    overflow-x: auto;
  }
  .study-material-table {
    width: 100%;
    border-collapse: collapse;
    text-align: left;
  }
  .study-material-table th,
  .study-material-table td {
    padding: 16px;
    border-bottom: 1px solid var(--border);
    vertical-align: top;
  }
  .study-material-table thead th {
    color: var(--text-secondary);
    font-size: 14px;
    font-weight: 600;
  }
  .study-material-table tbody th {
    min-width: 260px;
    font-weight: 600;
  }
  .study-material-empty-state {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    gap: 14px;
    max-width: 600px;
    padding: 20px;
    border: 1px solid var(--border);
    border-radius: 12px;
    background: var(--surface-raised);
  }
  .study-material-empty-state :global(svg) {
    color: var(--text-secondary);
  }
  .study-material-empty-state h3 {
    margin: 0;
    font-size: 16px;
  }
  .study-material-empty-state p {
    margin: 4px 0 0;
    color: var(--text-secondary);
  }
  .study-material-empty-state a {
    display: inline-flex;
    margin-top: 12px;
    color: var(--primary);
    font-weight: 600;
    text-underline-offset: 3px;
  }
  @media (max-width: 960px) {
    .bible-study-page {
      gap: 32px;
    }
    .bible-study-page-head,
    .bible-study-boundary {
      display: block;
    }
    .bible-study-page-head .button {
      display: inline-flex;
      margin-top: 16px;
    }
    .bible-study-boundary > p {
      margin-top: 12px;
    }
    .study-material-table-wrap {
      overflow: visible;
    }
    .study-material-table,
    .study-material-table tbody,
    .study-material-table tr,
    .study-material-table th,
    .study-material-table td {
      display: block;
    }
    .study-material-table thead {
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
    .study-material-table tr {
      padding: 16px 0;
      border-bottom: 1px solid var(--border);
    }
    .study-material-table th,
    .study-material-table td {
      display: grid;
      grid-template-columns: minmax(112px, 0.8fr) minmax(0, 1.2fr);
      gap: 16px;
      min-width: 0;
      padding: 5px 0;
      border: 0;
    }
    .study-material-table th::before,
    .study-material-table td::before {
      content: attr(data-label);
      color: var(--text-secondary);
      font-size: 14px;
      font-weight: 600;
    }
  }
</style>
