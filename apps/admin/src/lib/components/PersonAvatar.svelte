<script lang="ts">
  import IconUser from '@tabler/icons-svelte-runes/icons/user';

  export let size: 'small' | 'large' = 'small';
</script>

<span class:large={size === 'large'} class="person-avatar" aria-hidden="true">
  <IconUser size={size === 'large' ? 28 : 17} stroke={1.7} />
</span>

<style>
  .person-avatar {
    display: inline-grid;
    width: 32px;
    height: 32px;
    flex: 0 0 32px;
    place-items: center;
    border: 1px solid var(--border);
    border-radius: 50%;
    color: #697966;
    background: #f0ecdf;
  }

  .person-avatar :global(svg) {
    flex: 0 0 auto;
  }

  .person-avatar.large {
    width: 72px;
    height: 72px;
    flex-basis: 72px;
  }
</style>
