<script lang="ts">
  export type BreadcrumbItem = {
    label: string;
    href?: string;
  };

  let { items }: { items: BreadcrumbItem[] } = $props();
</script>

<nav class="breadcrumb" aria-label="Breadcrumb">
  <ol>
    {#each items as item, index}
      <li>
        {#if item.href}
          <a href={item.href}>{item.label}</a>
        {:else}
          <span aria-current={index === items.length - 1 ? 'page' : undefined}>{item.label}</span>
        {/if}
      </li>
      {#if index < items.length - 1}
        <li class="breadcrumb-separator" aria-hidden="true"></li>
      {/if}
    {/each}
  </ol>
</nav>
