<script lang="ts">
  import { onMount, tick } from 'svelte';

  import { page } from '$app/state';
  import IconBible from '@tabler/icons-svelte-runes/icons/bible';
  import IconArrowBarLeft from '@tabler/icons-svelte-runes/icons/arrow-bar-left';
  import IconArrowBarRight from '@tabler/icons-svelte-runes/icons/arrow-bar-right';
  import IconCalendarCheck from '@tabler/icons-svelte-runes/icons/calendar-check';
  import IconChartBar from '@tabler/icons-svelte-runes/icons/chart-bar';
  import IconFolder from '@tabler/icons-svelte-runes/icons/folder';
  import IconHeartHandshake from '@tabler/icons-svelte-runes/icons/heart-handshake';
  import IconMenu2 from '@tabler/icons-svelte-runes/icons/menu-2';
  import IconSchool from '@tabler/icons-svelte-runes/icons/school';
  import IconSpeakerphone from '@tabler/icons-svelte-runes/icons/speakerphone';
  import IconUsersGroup from '@tabler/icons-svelte-runes/icons/users-group';
  import IconX from '@tabler/icons-svelte-runes/icons/x';

  import '../app.css';

  import EgliseChurchMark from '$lib/components/EgliseChurchMark.svelte';
  import { toast } from '$lib/toast';

  let { children } = $props();
  let sidebarCollapsed = $state(false);
  let isMobile = $state(false);
  let mobileNavigationOpen = $state(false);
  let mobileNavigationRendered = $state(false);
  let mobileNavigationClosing = $state(false);
  let mobileCloseToken = 0;
  let sidebarElement: HTMLElement;
  let drawerCloseButton: HTMLButtonElement;
  let menuButton: HTMLButtonElement;

  const navigationGroups = [
    { label: 'Essentials', modules: ['Attendance', 'Reports'] },
    { label: 'Care & formation', modules: ['Welfare', 'Bible Study', 'Care School'] },
    { label: 'Communication & resources', modules: ['Resources', 'Announcements'] }
  ];

  function toggleDesktopNavigation() {
    sidebarCollapsed = !sidebarCollapsed;
  }

  const moduleIcons = {
    Attendance: IconCalendarCheck,
    Reports: IconChartBar,
    Welfare: IconHeartHandshake,
    'Bible Study': IconBible,
    'Care School': IconSchool,
    Resources: IconFolder,
    Announcements: IconSpeakerphone
  };

  function moduleIcon(module: keyof typeof moduleIcons) {
    return moduleIcons[module];
  }

  function focusableDrawerElements() {
    const elements = Array.from(
      sidebarElement.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter((element) => !element.hasAttribute('inert') && element.offsetParent !== null);

    if (isMobile && elements.includes(drawerCloseButton)) {
      return [drawerCloseButton, ...elements.filter((element) => element !== drawerCloseButton)];
    }

    return elements;
  }

  function setDocumentScrollLocked(locked: boolean) {
    document.body.style.overflow = locked ? 'hidden' : '';
  }

  async function openMobileNavigation() {
    mobileCloseToken += 1;
    mobileNavigationRendered = true;
    mobileNavigationClosing = false;
    setDocumentScrollLocked(true);
    await tick();
    mobileNavigationOpen = true;
    await tick();
    drawerCloseButton?.focus();
  }

  function finishMobileNavigationClose(token: number) {
    if (token !== mobileCloseToken || mobileNavigationOpen) {
      return;
    }

    mobileNavigationRendered = false;
    mobileNavigationClosing = false;
    setDocumentScrollLocked(false);
    void tick().then(() => menuButton?.focus());
  }

  function closeMobileNavigation() {
    if (!mobileNavigationOpen || mobileNavigationClosing) {
      return;
    }

    const closeToken = ++mobileCloseToken;

    mobileNavigationClosing = true;
    mobileNavigationOpen = false;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      finishMobileNavigationClose(closeToken);

      return;
    }

    window.setTimeout(() => finishMobileNavigationClose(closeToken), 400);
  }

  function handleMobileSidebarTransitionEnd(event: TransitionEvent) {
    if (
      event.target === event.currentTarget &&
      event.propertyName === 'transform' &&
      mobileNavigationClosing
    ) {
      finishMobileNavigationClose(mobileCloseToken);
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && mobileNavigationOpen) {
      closeMobileNavigation();
    }

    if (event.key !== 'Tab' || !mobileNavigationOpen) {
      return;
    }

    const focusableElements = focusableDrawerElements();
    const firstElement = focusableElements[0];
    const lastElement = focusableElements.at(-1);

    if (!firstElement || !lastElement) {
      return;
    }

    if (
      event.shiftKey &&
      document.activeElement instanceof HTMLElement &&
      document.activeElement.matches('.drawer-close-button')
    ) {
      event.preventDefault();
      lastElement.focus();
    }

    if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  }

  function handleDrawerCloseKeydown(event: KeyboardEvent) {
    if (event.key !== 'Tab' || !event.shiftKey) {
      return;
    }

    event.preventDefault();
    focusableDrawerElements().at(-1)?.focus();
  }

  onMount(() => {
    if ('serviceWorker' in navigator) {
      void navigator.serviceWorker.register('/service-worker.js');
    }

    const mediaQuery = window.matchMedia('(max-width: 960px)');
    const syncViewport = () => {
      isMobile = mediaQuery.matches;

      if (isMobile) {
        sidebarCollapsed = false;
      }

      if (!isMobile && mobileNavigationRendered) {
        mobileCloseToken += 1;
        mobileNavigationOpen = false;
        mobileNavigationRendered = false;
        mobileNavigationClosing = false;
        setDocumentScrollLocked(false);
      }
    };

    syncViewport();
    mediaQuery.addEventListener('change', syncViewport);

    return () => {
      mediaQuery.removeEventListener('change', syncViewport);
      setDocumentScrollLocked(false);
    };
  });
</script>

<svelte:head>
  <title>Eglise — People &amp; Membership pilot</title>
</svelte:head>

<svelte:window onkeydown={handleKeydown} />

<a class="skip-link" href="#main-content">Skip to main content</a>

<div
  class:sidebar-collapsed={sidebarCollapsed}
  class:mobile-navigation-open={mobileNavigationOpen}
  class:mobile-navigation-rendered={mobileNavigationRendered}
  class="app-shell"
>
  <header class="mobile-topbar">
    <a class="mobile-brand" href="/people" aria-label="Eglise People and Membership">
      <EgliseChurchMark />
      <span>Eglise</span>
    </a>
    <button
      bind:this={menuButton}
      aria-controls="application-sidebar"
      aria-expanded={mobileNavigationOpen}
      aria-hidden={mobileNavigationRendered ? 'true' : undefined}
      aria-label="Open application menu"
      class="mobile-menu-button"
      inert={mobileNavigationRendered}
      onclick={() => (mobileNavigationOpen ? closeMobileNavigation() : void openMobileNavigation())}
      tabindex={mobileNavigationRendered ? -1 : undefined}
      type="button"
    >
      <IconMenu2 aria-hidden="true" size={22} stroke={1.8} />
    </button>
  </header>

  {#if mobileNavigationRendered}
    <button
      aria-hidden="true"
      aria-label="Close application menu"
      class:closing={mobileNavigationClosing}
      class="sidebar-backdrop"
      onclick={closeMobileNavigation}
      tabindex="-1"
      type="button"
    ></button>
  {/if}

  <aside
    bind:this={sidebarElement}
    class:mobile-open={mobileNavigationOpen}
    class="sidebar"
    id="application-sidebar"
    aria-label="Application navigation"
    aria-hidden={isMobile && !mobileNavigationOpen ? 'true' : undefined}
    inert={isMobile && !mobileNavigationOpen}
    ontransitionend={handleMobileSidebarTransitionEnd}
  >
    <div class="sidebar-header">
      <a class="brand" href="/people" aria-label="Eglise People and Membership">
        <EgliseChurchMark />
        <span class="brand-label">Eglise</span>
      </a>

      <button
        aria-label={sidebarCollapsed
          ? 'Expand application navigation'
          : 'Collapse application navigation'}
        aria-controls="application-sidebar"
        aria-expanded={!sidebarCollapsed}
        class="sidebar-toggle"
        onclick={toggleDesktopNavigation}
        type="button"
      >
        <span class="toggle-icon toggle-icon-close" aria-hidden={sidebarCollapsed}>
          <IconArrowBarLeft aria-hidden="true" size={20} stroke={1.8} />
        </span>
        <span class="toggle-icon toggle-icon-open" aria-hidden={!sidebarCollapsed}>
          <IconArrowBarRight aria-hidden="true" size={20} stroke={1.8} />
        </span>
      </button>

      <button
        bind:this={drawerCloseButton}
        aria-label="Close application menu"
        class="drawer-close-button"
        onclick={closeMobileNavigation}
        onkeydown={handleDrawerCloseKeydown}
        type="button"
      >
        <IconX aria-hidden="true" size={22} stroke={1.8} />
      </button>
    </div>

    <nav class="navigation" aria-label="Product areas">
      {#each navigationGroups as group, groupIndex}
        <section class="navigation-group" aria-labelledby={`navigation-group-${groupIndex}`}>
          <p class="navigation-group-label" id={`navigation-group-${groupIndex}`}>{group.label}</p>

          {#if groupIndex === 0}
            <a
              aria-current={page.url.pathname.startsWith('/people') ? 'page' : undefined}
              aria-label="People and Membership"
              class="nav-link"
              class:active={page.url.pathname.startsWith('/people')}
              href="/people"
              onclick={closeMobileNavigation}
            >
              <IconUsersGroup aria-hidden="true" size={21} stroke={1.8} />
              <span class="nav-copy">People &amp; Membership</span>
              <span aria-hidden="true" class="nav-tooltip">People &amp; Membership</span>
            </a>
          {/if}

          {#each group.modules as module}
            {@const ModuleIcon = moduleIcon(module as keyof typeof moduleIcons)}
            <div class="nav-future nav-link">
              <ModuleIcon aria-hidden="true" size={21} stroke={1.8} />
              <span class="nav-copy">{module}</span>
              <span aria-hidden="true" class="nav-tooltip">{module} — Not part of this pilot</span>
              <span class="sr-only">Not part of this pilot</span>
            </div>
          {/each}
        </section>
      {/each}
    </nav>
  </aside>

  <main id="main-content" class="content" inert={isMobile && mobileNavigationOpen} tabindex="-1">
    <div class="content-motif" aria-hidden="true"></div>

    <aside class="pilot-context" aria-label="Shared prototype limitations">
      <strong>Shared prototype</strong>
      <p>
        Changes in this prototype cannot be attributed to a named individual. Refresh resets every
        sample record; nothing is stored on this device.
      </p>
    </aside>

    {@render children()}
  </main>
</div>

{#if $toast}
  <div class="toast-region" aria-live="polite" aria-atomic="true">
    <div class="toast" role="status">{$toast}</div>
  </div>
{/if}
