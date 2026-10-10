<script lang="ts">
  import { goto } from '$app/navigation';
  import { onMount, tick } from 'svelte';

  import { navigating, page } from '$app/state';
  import IconBible from '@tabler/icons-svelte-runes/icons/bible';
  import IconArrowBarLeft from '@tabler/icons-svelte-runes/icons/arrow-bar-left';
  import IconArrowBarRight from '@tabler/icons-svelte-runes/icons/arrow-bar-right';
  import IconCalendarCheck from '@tabler/icons-svelte-runes/icons/calendar-check';
  import IconChartBar from '@tabler/icons-svelte-runes/icons/chart-bar';
  import IconFolder from '@tabler/icons-svelte-runes/icons/folder';
  import IconHeartHandshake from '@tabler/icons-svelte-runes/icons/heart-handshake';
  import IconMenu2 from '@tabler/icons-svelte-runes/icons/menu-2';
  import IconSchool from '@tabler/icons-svelte-runes/icons/school';
  import IconSettings from '@tabler/icons-svelte-runes/icons/settings';
  import IconSpeakerphone from '@tabler/icons-svelte-runes/icons/speakerphone';
  import IconUsersGroup from '@tabler/icons-svelte-runes/icons/users-group';
  import IconX from '@tabler/icons-svelte-runes/icons/x';

  import '../app.css';

  import AppToaster from '$lib/components/AppToaster.svelte';
  import AdministratorAccount from '$lib/components/AdministratorAccount.svelte';
  import EgliseChurchMark from '$lib/components/EgliseChurchMark.svelte';
  import { showErrorToast } from '$lib/toast';
  import {
    initialisePrototypeSession,
    prototypeSession,
    signOutPrototypeAdministrator
  } from '$lib/prototype-session';

  let { children, data } = $props();
  let sidebarCollapsed = $state(false);
  let isMobile = $state(false);
  let mobileNavigationOpen = $state(false);
  let mobileNavigationRendered = $state(false);
  let mobileNavigationClosing = $state(false);
  let mobileCloseToken = 0;
  let sidebarElement = $state<HTMLElement | undefined>(undefined);
  let drawerCloseButton = $state<HTMLButtonElement | undefined>(undefined);
  let menuButton = $state<HTMLButtonElement | undefined>(undefined);
  let sessionReady = $state(false);
  let isLoggingOut = $state(false);
  let navigationFeedbackTimer: number | undefined;
  let routeProgressVisible = $state(false);

  const isAuthenticationRoute = $derived(
    page.url.pathname === '/login' ||
      page.url.pathname === '/signup' ||
      page.url.pathname === '/accept-invite'
  );
  // Action failures populate `page.form`; they are still part of the current
  // workspace screen and must retain its navigation and contextual feedback.
  const isErrorRoute = $derived(page.status >= 400 && !page.form);
  const requiresAuthentication = $derived(
    !isAuthenticationRoute && !isErrorRoute && page.url.pathname !== '/offline'
  );
  const usesSupabaseAuth = $derived(data.authMode === 'supabase');
  const signedIn = $derived(usesSupabaseAuth ? data.user !== null : $prototypeSession.signedIn);
  const canAccessSettings = $derived(
    !usesSupabaseAuth ||
      data.workspace?.role === 'owner' ||
      data.workspace?.role === 'people_administrator'
  );
  const churchName = $derived(
    usesSupabaseAuth ? (data.workspace?.name ?? 'Eglise') : $prototypeSession.churchName
  );
  const administratorName = $derived(
    usesSupabaseAuth ? data.user?.name || 'Church administrator' : undefined
  );
  const administratorEmail = $derived(usesSupabaseAuth ? (data.user?.email ?? '') : undefined);

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
      sidebarElement?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      ) ?? []
    ).filter((element) => !element.hasAttribute('inert') && element.offsetParent !== null);

    if (isMobile && drawerCloseButton && elements.includes(drawerCloseButton)) {
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

  async function completeLogOut() {
    if (isLoggingOut) return;

    isLoggingOut = true;

    if (usesSupabaseAuth) {
      try {
        const response = await fetch('/auth/logout', { method: 'POST' });

        if (!response.ok) {
          showErrorToast('We could not sign you out. Please try again.');

          return;
        }

        await goto('/login?logout=1', { invalidateAll: true });
      } catch {
        showErrorToast('We could not sign you out. Please check your connection and try again.');
      } finally {
        isLoggingOut = false;
      }

      return;
    }

    try {
      signOutPrototypeAdministrator();
      await goto('/login', { replaceState: true });
    } finally {
      isLoggingOut = false;
    }
  }

  function logOut() {
    const logoutRequest = new CustomEvent('eglise:before-logout', {
      cancelable: true,
      detail: { continueLogout: completeLogOut }
    });

    document.dispatchEvent(logoutRequest);

    if (!logoutRequest.defaultPrevented) {
      void completeLogOut();
    }
  }

  onMount(() => {
    if (!usesSupabaseAuth) {
      initialisePrototypeSession();
    }
    sessionReady = true;

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

  $effect(() => {
    if (!sessionReady) return;

    if (!usesSupabaseAuth && isAuthenticationRoute && page.url.searchParams.get('logout') === '1') {
      signOutPrototypeAdministrator();
      closeMobileNavigation();
      void goto('/login', { replaceState: true });

      return;
    }

    if (requiresAuthentication && !signedIn) {
      void goto('/login', { replaceState: true });

      return;
    }

    if (isAuthenticationRoute && signedIn) {
      void goto('/people', { replaceState: true });
    }
  });

  $effect(() => {
    if (navigationFeedbackTimer !== undefined) {
      clearTimeout(navigationFeedbackTimer);
      navigationFeedbackTimer = undefined;
    }

    if (navigating.to) {
      navigationFeedbackTimer = window.setTimeout(() => {
        routeProgressVisible = true;
      }, 150);
    } else {
      routeProgressVisible = false;
    }

    return () => {
      if (navigationFeedbackTimer !== undefined) clearTimeout(navigationFeedbackTimer);
    };
  });
</script>

<svelte:head>
  <title>{churchName} | People &amp; Membership</title>
</svelte:head>

<svelte:window onkeydown={handleKeydown} />

<a class="skip-link" href="#main-content">Skip to main content</a>

{#if routeProgressVisible}
  <div aria-hidden="true" class="route-progress"></div>
  <p class="sr-only" role="status">Loading page</p>
{/if}

{#if isAuthenticationRoute || isErrorRoute}
  {@render children()}
{:else}
  <div
    class:sidebar-collapsed={sidebarCollapsed}
    class:mobile-navigation-open={mobileNavigationOpen}
    class:mobile-navigation-rendered={mobileNavigationRendered}
    class="app-shell"
  >
    <header class="mobile-topbar">
      <a class="mobile-brand" href="/people" aria-label={`${churchName} People and Membership`}>
        <EgliseChurchMark />
        <span class="mobile-church-name" title={churchName}>{churchName}</span>
      </a>
      <button
        bind:this={menuButton}
        aria-controls="application-sidebar"
        aria-expanded={mobileNavigationOpen}
        aria-hidden={mobileNavigationRendered ? 'true' : undefined}
        aria-label="Open application menu"
        class="mobile-menu-button"
        inert={mobileNavigationRendered}
        onclick={() =>
          mobileNavigationOpen ? closeMobileNavigation() : void openMobileNavigation()}
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
        <a class="brand" href="/people" aria-label={`${churchName} People and Membership`}>
          <EgliseChurchMark />
          <span class="brand-label" title={churchName}>{churchName}</span>
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
            <p class="navigation-group-label" id={`navigation-group-${groupIndex}`}>
              {group.label}
            </p>

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
              {#if module === 'Attendance'}
                <a
                  aria-current={page.url.pathname.startsWith('/attendance') ? 'page' : undefined}
                  aria-label="Attendance"
                  class="nav-link"
                  class:active={page.url.pathname.startsWith('/attendance')}
                  href="/attendance"
                  onclick={closeMobileNavigation}
                >
                  <ModuleIcon aria-hidden="true" size={21} stroke={1.8} />
                  <span class="nav-copy">Attendance</span>
                  <span aria-hidden="true" class="nav-tooltip">Attendance</span>
                </a>
              {:else if module === 'Welfare'}
                <a
                  aria-current={page.url.pathname.startsWith('/welfare') ? 'page' : undefined}
                  aria-label="Welfare"
                  class="nav-link"
                  class:active={page.url.pathname.startsWith('/welfare')}
                  href="/welfare"
                  onclick={closeMobileNavigation}
                >
                  <ModuleIcon aria-hidden="true" size={21} stroke={1.8} />
                  <span class="nav-copy">Welfare</span>
                  <span aria-hidden="true" class="nav-tooltip">Welfare</span>
                </a>
              {:else if module === 'Reports'}
                <a
                  aria-current={page.url.pathname.startsWith('/reports') ? 'page' : undefined}
                  aria-label="Reports"
                  class="nav-link"
                  class:active={page.url.pathname.startsWith('/reports')}
                  href="/reports"
                  onclick={closeMobileNavigation}
                >
                  <ModuleIcon aria-hidden="true" size={21} stroke={1.8} />
                  <span class="nav-copy">Reports</span>
                  <span aria-hidden="true" class="nav-tooltip">Reports</span>
                </a>
              {:else if module === 'Resources'}
                <a
                  aria-current={page.url.pathname.startsWith('/resources') ? 'page' : undefined}
                  aria-label="Resources"
                  class="nav-link"
                  class:active={page.url.pathname.startsWith('/resources')}
                  href="/resources"
                  onclick={closeMobileNavigation}
                >
                  <ModuleIcon aria-hidden="true" size={21} stroke={1.8} />
                  <span class="nav-copy">Resources</span>
                  <span aria-hidden="true" class="nav-tooltip">Resources</span>
                </a>
              {:else if module === 'Announcements'}
                <a
                  aria-current={page.url.pathname.startsWith('/announcements') ? 'page' : undefined}
                  aria-label="Announcements"
                  class="nav-link"
                  class:active={page.url.pathname.startsWith('/announcements')}
                  href="/announcements"
                  onclick={closeMobileNavigation}
                >
                  <ModuleIcon aria-hidden="true" size={21} stroke={1.8} />
                  <span class="nav-copy">Announcements</span>
                  <span aria-hidden="true" class="nav-tooltip">Announcements</span>
                </a>
              {:else if module === 'Bible Study'}
                <a
                  aria-current={page.url.pathname.startsWith('/bible-study') ? 'page' : undefined}
                  aria-label="Bible Study"
                  class="nav-link"
                  class:active={page.url.pathname.startsWith('/bible-study')}
                  href="/bible-study"
                  onclick={closeMobileNavigation}
                >
                  <ModuleIcon aria-hidden="true" size={21} stroke={1.8} />
                  <span class="nav-copy">Bible Study</span>
                  <span aria-hidden="true" class="nav-tooltip">Bible Study</span>
                </a>
              {:else if module === 'Care School'}
                <a
                  aria-current={page.url.pathname.startsWith('/care-school') ? 'page' : undefined}
                  aria-label="Care School"
                  class="nav-link"
                  class:active={page.url.pathname.startsWith('/care-school')}
                  href="/care-school"
                  onclick={closeMobileNavigation}
                >
                  <ModuleIcon aria-hidden="true" size={21} stroke={1.8} />
                  <span class="nav-copy">Care School</span>
                  <span aria-hidden="true" class="nav-tooltip">Care School</span>
                </a>
              {:else}
                <div class="nav-future nav-link">
                  <ModuleIcon aria-hidden="true" size={21} stroke={1.8} />
                  <span class="nav-copy">{module}</span>
                  <span aria-hidden="true" class="nav-tooltip"
                    >{module} — Not part of this pilot</span
                  >
                  <span class="sr-only">Not part of this pilot</span>
                </div>
              {/if}
            {/each}
          </section>
        {/each}

        {#if canAccessSettings}
          <section
            class="navigation-group settings-navigation-group"
            aria-labelledby="settings-group"
          >
            <p class="navigation-group-label" id="settings-group">Workspace</p>
            <a
              aria-current={page.url.pathname === '/settings' ? 'page' : undefined}
              aria-label="Church settings"
              class="nav-link"
              class:active={page.url.pathname === '/settings'}
              href="/settings"
              onclick={closeMobileNavigation}
            >
              <IconSettings aria-hidden="true" size={21} stroke={1.8} />
              <span class="nav-copy">Settings</span>
              <span aria-hidden="true" class="nav-tooltip">Church settings</span>
            </a>
          </section>
        {/if}
      </nav>

      <AdministratorAccount
        collapsed={sidebarCollapsed}
        email={administratorEmail}
        {isLoggingOut}
        name={administratorName}
        onlogout={logOut}
      />
    </aside>

    <main id="main-content" class="content" inert={isMobile && mobileNavigationOpen} tabindex="-1">
      <div class="content-motif" aria-hidden="true"></div>

      {@render children()}
    </main>
  </div>
{/if}

{#if !isErrorRoute}
  <AppToaster />
{/if}
