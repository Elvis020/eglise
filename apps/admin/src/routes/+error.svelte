<script lang="ts">
  import IconArrowLeft from '@tabler/icons-svelte-runes/icons/arrow-left';
  import IconMapPinOff from '@tabler/icons-svelte-runes/icons/map-pin-off';

  let { status = 404 }: { status?: number } = $props();

  const isNotFound = $derived(status === 404);
  const label = $derived(isNotFound ? 'Page not found' : 'Something went wrong');
  const title = $derived(
    isNotFound ? "This page isn't part of the workspace." : "We couldn't open this page."
  );
  const description = $derived(
    isNotFound
      ? 'The address may be out of date, or the page may have moved.'
      : 'Try returning to the People directory and continue from there.'
  );
</script>

<svelte:head>
  <title>{label} — Eglise</title>
</svelte:head>

<section class="not-found-page" aria-labelledby="not-found-title">
  <div class="not-found-mark" aria-hidden="true">
    <IconMapPinOff size={28} stroke={1.6} />
  </div>

  <p class="eyebrow">{status} · {label}</p>
  <h1 id="not-found-title">{title}</h1>
  <p class="page-intro">{description}</p>

  <a class="button primary not-found-action" href="/people">
    <IconArrowLeft aria-hidden="true" size={18} stroke={2} />
    Return to People directory
  </a>
</section>

<style>
  .not-found-page {
    display: grid;
    align-content: center;
    max-width: 560px;
    min-height: min(580px, calc(100dvh - 168px));
    padding: clamp(32px, 8vw, 96px) 0;
    animation: not-found-enter 280ms cubic-bezier(0.16, 1, 0.3, 1) both;
  }

  .not-found-mark {
    display: grid;
    width: 52px;
    height: 52px;
    margin-bottom: 24px;
    place-items: center;
    border: 1px solid var(--border);
    border-radius: 12px;
    color: var(--primary);
    background: var(--surface-raised);
  }

  h1 {
    max-width: 510px;
    margin: 8px 0 16px;
    color: var(--text-primary);
    font-family: var(--font-display);
    font-size: clamp(36px, 4.4vw, 56px);
    font-weight: 500;
    letter-spacing: -0.02em;
    line-height: 1.04;
    text-wrap: balance;
  }

  .page-intro {
    max-width: 460px;
    margin: 0;
    color: var(--text-secondary);
    font-size: 18px;
    line-height: 1.55;
    text-wrap: pretty;
  }

  .not-found-action {
    width: fit-content;
    margin-top: 32px;
  }

  @keyframes not-found-enter {
    from {
      opacity: 0;
      transform: translateY(10px);
    }

    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .not-found-page {
      animation: none;
    }
  }

  @media (max-width: 960px) {
    .not-found-page {
      min-height: min(520px, calc(100dvh - 120px));
    }
  }
</style>
