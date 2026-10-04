<script lang="ts">
  import { page } from '$app/state';

  import { futureModules } from '$lib/modules';

  $: activeModule = futureModules.find(
    (module) => module.toLowerCase().replace(/\s+/g, '-') === page.params.module
  );
</script>

<svelte:head><title>Planned next — Eglise</title></svelte:head>

<section class="page">
  <header class="page-head">
    <div>
      <p class="eyebrow">People &amp; Membership pilot</p>
      <h1 tabindex="-1">{activeModule ?? 'Planned next'}</h1>
      <p class="page-intro">
        Only People &amp; Membership is active in this fictional Phase 1 pilot.
      </p>
    </div>
  </header>
  <div class="future-grid">
    {#each futureModules as module}
      <article class="future-card">
        <span class="status review">Planned next</span>
        <h2>{module}</h2>
        <p>
          {module === activeModule
            ? 'This area is intentionally not implemented in the pilot.'
            : 'Visible for future discovery; no workflow is available yet.'}
        </p>
      </article>
    {/each}
  </div>
</section>
