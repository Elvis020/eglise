<script lang="ts">
  import IconPlus from '@tabler/icons-svelte-runes/icons/plus';
  import IconSchool from '@tabler/icons-svelte-runes/icons/school';

  import { careSchoolTopics } from '$lib/care-school';
</script>

<svelte:head><title>Care School | Eglise</title></svelte:head>

<section class="page care-school-page">
  <header class="page-head care-school-page-head">
    <div>
      <p class="eyebrow">Care School</p>
      <h1 tabindex="-1">Shape the programme before tracking people.</h1>
      <p class="page-intro">
        Collect the topics and next steps the church may want to offer, without recording learner
        progress or clinic information.
      </p>
    </div>
    <a class="button primary" href="/care-school/new"
      ><IconPlus aria-hidden="true" size={18} stroke={1.8} />Add topic</a
    >
  </header>

  <aside aria-labelledby="care-school-boundary-title" class="care-school-boundary">
    <div>
      <p class="eyebrow">Discovery boundary</p>
      <h2 id="care-school-boundary-title">Programme topics only, for now</h2>
    </div>
    <p>
      This is not a participant record, readiness assessment, booking tool, or clinic workflow.
      Those decisions need defined owners and restricted access first.
    </p>
  </aside>

  <section aria-labelledby="care-school-topic-list-title" class="care-school-topic-list-section">
    <div class="care-school-section-heading">
      <p class="eyebrow">Programme outline</p>
      <h2 id="care-school-topic-list-title">Topics to agree together</h2>
    </div>

    {#if $careSchoolTopics.length}
      <div class="care-school-topic-table-wrap">
        <table class="care-school-topic-table">
          <thead>
            <tr>
              <th scope="col">Topic</th>
              <th scope="col">Possible next step</th>
            </tr>
          </thead>
          <tbody>
            {#each $careSchoolTopics as topic}
              <tr>
                <th data-label="Topic" scope="row">{topic.title}</th>
                <td data-label="Possible next step">{topic.nextStep}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {:else}
      <div class="care-school-topic-empty-state">
        <IconSchool aria-hidden="true" size={22} stroke={1.8} />
        <div>
          <h3>No programme topics have been recorded</h3>
          <p>
            Begin with one topic the team wants to explore before any learner workflow is agreed.
          </p>
          <a href="/care-school/new">Add topic</a>
        </div>
      </div>
    {/if}
  </section>
</section>

<style>
  .care-school-page {
    display: grid;
    gap: 40px;
  }
  .care-school-page-head,
  .care-school-boundary,
  .care-school-topic-list-section {
    max-width: 1120px;
  }
  .care-school-page-head {
    margin-bottom: 0;
  }
  .care-school-boundary {
    display: flex;
    gap: 32px;
    align-items: center;
    justify-content: space-between;
    padding: 20px 0;
  }
  .care-school-boundary .eyebrow,
  .care-school-section-heading .eyebrow {
    margin-bottom: 4px;
  }
  .care-school-boundary h2,
  .care-school-section-heading h2 {
    margin: 0;
    font: 400 30px/1.15 var(--font-display);
  }
  .care-school-boundary > p {
    max-width: 560px;
    margin: 0;
    color: var(--text-secondary);
  }
  .care-school-topic-list-section {
    display: grid;
    gap: 20px;
  }
  .care-school-topic-table-wrap {
    overflow-x: auto;
  }
  .care-school-topic-table {
    width: 100%;
    border-collapse: collapse;
    text-align: left;
  }
  .care-school-topic-table th,
  .care-school-topic-table td {
    padding: 16px;
    border-bottom: 1px solid var(--border);
    vertical-align: top;
  }
  .care-school-topic-table thead th {
    color: var(--text-secondary);
    font-size: 14px;
    font-weight: 600;
  }
  .care-school-topic-table tbody th {
    min-width: 260px;
    font-weight: 600;
  }
  .care-school-topic-empty-state {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    gap: 14px;
    max-width: 600px;
    padding: 20px;
    border: 1px solid var(--border);
    border-radius: 12px;
    background: var(--surface-raised);
  }
  .care-school-topic-empty-state :global(svg) {
    color: var(--text-secondary);
  }
  .care-school-topic-empty-state h3 {
    margin: 0;
    font-size: 16px;
  }
  .care-school-topic-empty-state p {
    margin: 4px 0 0;
    color: var(--text-secondary);
  }
  .care-school-topic-empty-state a {
    display: inline-flex;
    margin-top: 12px;
    color: var(--primary);
    font-weight: 600;
    text-underline-offset: 3px;
  }
  @media (max-width: 960px) {
    .care-school-page {
      gap: 32px;
    }
    .care-school-page-head,
    .care-school-boundary {
      display: block;
    }
    .care-school-page-head .button {
      display: inline-flex;
      margin-top: 16px;
    }
    .care-school-boundary > p {
      margin-top: 12px;
    }
    .care-school-topic-table-wrap {
      overflow: visible;
    }
    .care-school-topic-table,
    .care-school-topic-table tbody,
    .care-school-topic-table tr,
    .care-school-topic-table th,
    .care-school-topic-table td {
      display: block;
    }
    .care-school-topic-table thead {
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
    .care-school-topic-table tr {
      padding: 16px 0;
      border-bottom: 1px solid var(--border);
    }
    .care-school-topic-table th,
    .care-school-topic-table td {
      display: grid;
      grid-template-columns: minmax(112px, 0.8fr) minmax(0, 1.2fr);
      gap: 16px;
      min-width: 0;
      padding: 5px 0;
      border: 0;
    }
    .care-school-topic-table th::before,
    .care-school-topic-table td::before {
      content: attr(data-label);
      color: var(--text-secondary);
      font-size: 14px;
      font-weight: 600;
    }
  }
</style>
