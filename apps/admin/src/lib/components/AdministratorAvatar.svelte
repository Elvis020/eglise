<script lang="ts">
  let {
    email,
    name,
    size = 44
  }: {
    email: string;
    name: string;
    size?: number;
  } = $props();

  const seed = $derived(
    Array.from(`${name}:${email}`).reduce(
      (total, character) => total + character.codePointAt(0)!,
      0
    )
  );
  const palette = $derived(
    [
      { background: '#E9DEC8', hair: '#594633', shirt: '#B86345', skin: '#C88963' },
      { background: '#DCE7D8', hair: '#313C2B', shirt: '#557763', skin: '#B97756' },
      { background: '#E6DCE9', hair: '#4D3948', shirt: '#786083', skin: '#A86D50' }
    ][seed % 3]
  );
  const hairShape = $derived(seed % 2 === 0 ? 'curly' : 'close');
</script>

<svg aria-hidden="true" class="administrator-avatar" height={size} viewBox="0 0 48 48" width={size}>
  <circle cx="24" cy="24" fill={palette.background} r="23" />
  <path d="M11 46c1.5-9.4 7-14 13-14s11.5 4.6 13 14" fill={palette.shirt} />
  <path
    d="M17.4 23.8c0-6.2 2.7-10.1 6.6-10.1s6.6 3.9 6.6 10.1c0 5.8-2.9 9.5-6.6 9.5s-6.6-3.7-6.6-9.5Z"
    fill={palette.skin}
  />
  {#if hairShape === 'curly'}
    <path
      d="M16.6 23.1c-1.1-6.7 2.2-12 7.4-12 5.6 0 8.6 4.5 7.4 11.6-2.4-2.9-5.3-4.2-8.4-4.2-2.4 0-4.6 1.5-6.4 4.6Z"
      fill={palette.hair}
    />
    <circle cx="18.4" cy="16" fill={palette.hair} r="3.1" />
    <circle cx="23.1" cy="13" fill={palette.hair} r="3.6" />
    <circle cx="28.2" cy="15.3" fill={palette.hair} r="3.3" />
  {:else}
    <path
      d="M17.2 22.1c.1-6.6 2.3-10.7 7.1-10.7 4.3 0 6.8 3.3 6.8 9.2-2.3-2.2-4.8-3.4-7.2-3.4-2.2 0-4.4 1.6-6.7 4.9Z"
      fill={palette.hair}
    />
  {/if}
  <path
    d="M21 27.2c1 .7 2 .9 3 .9s2-.2 3-.9"
    fill="none"
    stroke="#7B4835"
    stroke-linecap="round"
    stroke-width="1.1"
  />
</svg>

<style>
  .administrator-avatar {
    display: block;
    overflow: visible;
    flex: 0 0 auto;
    border: 1px solid rgb(255 255 255 / 28%);
    border-radius: 50%;
  }
</style>
