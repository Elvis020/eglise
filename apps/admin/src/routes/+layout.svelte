<script lang="ts">
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';

  import { navigating, page } from '$app/state';
  import IconBible from '@tabler/icons-svelte-runes/icons/bible';
  import IconArrowBarLeft from '@tabler/icons-svelte-runes/icons/arrow-bar-left';
  import IconArrowBarRight from '@tabler/icons-svelte-runes/icons/arrow-bar-right';
  import IconCalendarCheck from '@tabler/icons-svelte-runes/icons/calendar-check';
  import IconChartBar from '@tabler/icons-svelte-runes/icons/chart-bar';
  import IconFolder from '@tabler/icons-svelte-runes/icons/folder';
  import IconHeartHandshake from '@tabler/icons-svelte-runes/icons/heart-handshake';
  import IconLogout from '@tabler/icons-svelte-runes/icons/logout';
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
  import { provideAppShellContext } from '$lib/app-shell-context';
  import { showErrorToast } from '$lib/toast';
  import {
    initialisePrototypeSession,
    prototypeSession,
    signOutPrototypeAdministrator
  } from '$lib/prototype-session';

  let { children, data } = $props();
  let sidebarCollapsed = $state(false);
  let sessionReady = $state(false);
  let isLoggingOut = $state(false);
  let logoutGuard: ((continueLogout: () => Promise<void>) => boolean) | undefined;
  let navigationFeedbackTimer: number | undefined;
  let routeProgressVisible = $state(false);
  let mobileNavigation = $state<HTMLDialogElement>();
  let mobileNavigationOpen = $state(false);

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
  const mobileWorkspaceLabel = $derived(
    page.url.pathname.startsWith('/attendance')
      ? 'Attendance'
      : page.url.pathname.startsWith('/reports')
        ? 'Reports'
        : page.url.pathname.startsWith('/welfare')
          ? 'Welfare'
          : page.url.pathname.startsWith('/bible-study')
            ? 'Bible Study'
            : page.url.pathname.startsWith('/care-school')
              ? 'Care School'
              : page.url.pathname.startsWith('/resources')
                ? 'Resources'
                : page.url.pathname.startsWith('/announcements')
                  ? 'Announcements'
                  : page.url.pathname.startsWith('/settings')
                    ? 'Settings'
                    : page.url.pathname.startsWith('/workspace')
                      ? 'Workspace'
                      : 'People & Membership'
  );
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

  const moduleRoutes: Record<keyof typeof moduleIcons, string> = {
    Attendance: '/attendance',
    Reports: '/reports',
    Welfare: '/welfare',
    'Bible Study': '/bible-study',
    'Care School': '/care-school',
    Resources: '/resources',
    Announcements: '/announcements'
  };

  function moduleHref(module: keyof typeof moduleIcons): string {
    return moduleRoutes[module];
  }

  function isMobileRouteActive(href: string): boolean {
    return page.url.pathname.startsWith(href);
  }

  function openMobileNavigation(): void {
    if (!mobileNavigation) return;

    mobileNavigation.showModal();
    mobileNavigationOpen = true;
  }

  function closeMobileNavigation(): void {
    if (mobileNavigation?.open) mobileNavigation.close();
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

  function requestLogout() {
    if (isLoggingOut || logoutGuard?.(completeLogOut)) return;

    void completeLogOut();
  }

  function requestMobileLogout(): void {
    closeMobileNavigation();
    requestLogout();
  }

  function registerLogoutGuard(guard: (continueLogout: () => Promise<void>) => boolean) {
    logoutGuard = guard;

    return () => {
      if (logoutGuard === guard) logoutGuard = undefined;
    };
  }

  provideAppShellContext({
    isLoggingOut: () => isLoggingOut,
    registerLogoutGuard,
    requestLogout
  });

  onMount(() => {
    if (!usesSupabaseAuth) {
      initialisePrototypeSession();
    }
    sessionReady = true;

    if ('serviceWorker' in navigator) {
      void navigator.serviceWorker.register('/service-worker.js');
    }
  });

  $effect(() => {
    if (!sessionReady) return;

    if (!usesSupabaseAuth && isAuthenticationRoute && page.url.searchParams.get('logout') === '1') {
      signOutPrototypeAdministrator();
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

<a class="skip-link" href="#main-content">Skip to main content</a>

{#if routeProgressVisible}
  <div aria-hidden="true" class="route-progress"></div>
  <p class="sr-only" role="status">Loading page</p>
{/if}

{#if isAuthenticationRoute || isErrorRoute}
  {@render children()}
{:else}
  <div class:sidebar-collapsed={sidebarCollapsed} class="app-shell">
    <header class="mobile-topbar">
      <div class="mobile-context">
        <a class="mobile-brand" href="/people" aria-label={`${churchName} home`}>
          <EgliseChurchMark />
          <span class="mobile-church-name" title={churchName}>{churchName}</span>
        </a>
        <p class="mobile-workspace-name">{mobileWorkspaceLabel}</p>
      </div>
      <button
        aria-controls="mobile-navigation"
        aria-expanded={mobileNavigationOpen}
        aria-label="Open application navigation"
        class="mobile-navigation-toggle"
        onclick={openMobileNavigation}
        type="button"
      >
        <IconMenu2 aria-hidden="true" size={24} stroke={1.8} />
      </button>
    </header>

    <aside class="sidebar" id="application-sidebar" aria-label="Application navigation">
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
        onlogout={requestLogout}
      />
    </aside>

    <main id="main-content" class="content" tabindex="-1">
      <div class="content-motif" aria-hidden="true"></div>

      {@render children()}
    </main>

    <dialog
      bind:this={mobileNavigation}
      aria-labelledby="mobile-navigation-title"
      class="mobile-navigation-dialog"
      id="mobile-navigation"
      onclose={() => (mobileNavigationOpen = false)}
    >
      <header class="mobile-navigation-header">
        <div>
          <p class="dialog-context">{churchName}</p>
          <h2 id="mobile-navigation-title">Navigate</h2>
        </div>
        <button
          aria-label="Close application navigation"
          class="mobile-navigation-close"
          onclick={closeMobileNavigation}
          type="button"
        >
          <IconX aria-hidden="true" size={24} stroke={1.8} />
        </button>
      </header>

      <nav aria-label="Primary mobile navigation" class="mobile-navigation-list">
        <section class="mobile-navigation-group" aria-labelledby="mobile-navigation-people">
          <p id="mobile-navigation-people">Essentials</p>
          <a
            aria-current={page.url.pathname.startsWith('/people') ? 'page' : undefined}
            class:active={page.url.pathname.startsWith('/people')}
            href="/people"
            onclick={closeMobileNavigation}
          >
            <IconUsersGroup aria-hidden="true" size={21} stroke={1.8} />
            <span>People &amp; Membership</span>
          </a>
          {#each navigationGroups[0].modules as module}
            {@const ModuleIcon = moduleIcon(module as keyof typeof moduleIcons)}
            {@const href = moduleHref(module as keyof typeof moduleIcons)}
            <a
              aria-current={isMobileRouteActive(href) ? 'page' : undefined}
              class:active={isMobileRouteActive(href)}
              {href}
              onclick={closeMobileNavigation}
            >
              <ModuleIcon aria-hidden="true" size={21} stroke={1.8} />
              <span>{module}</span>
            </a>
          {/each}
        </section>

        {#each navigationGroups.slice(1) as group, groupIndex}
          <section
            class="mobile-navigation-group"
            aria-labelledby={`mobile-navigation-group-${groupIndex}`}
          >
            <p id={`mobile-navigation-group-${groupIndex}`}>{group.label}</p>
            {#each group.modules as module}
              {@const ModuleIcon = moduleIcon(module as keyof typeof moduleIcons)}
              {@const href = moduleHref(module as keyof typeof moduleIcons)}
              <a
                aria-current={isMobileRouteActive(href) ? 'page' : undefined}
                class:active={isMobileRouteActive(href)}
                {href}
                onclick={closeMobileNavigation}
              >
                <ModuleIcon aria-hidden="true" size={21} stroke={1.8} />
                <span>{module}</span>
              </a>
            {/each}
          </section>
        {/each}

        {#if canAccessSettings}
          <section class="mobile-navigation-group" aria-labelledby="mobile-navigation-workspace">
            <p id="mobile-navigation-workspace">Workspace</p>
            <a
              aria-current={page.url.pathname === '/settings' ? 'page' : undefined}
              class:active={page.url.pathname === '/settings'}
              href="/settings"
              onclick={closeMobileNavigation}
            >
              <IconSettings aria-hidden="true" size={21} stroke={1.8} />
              <span>Settings</span>
            </a>
          </section>
        {/if}
      </nav>

      <button
        aria-busy={isLoggingOut || undefined}
        class="mobile-navigation-logout"
        disabled={isLoggingOut}
        onclick={requestMobileLogout}
        type="button"
      >
        <IconLogout aria-hidden="true" size={20} stroke={1.8} />
        {isLoggingOut ? 'Logging out…' : 'Log out'}
      </button>
    </dialog>
  </div>
{/if}

{#if !isErrorRoute}
  <AppToaster />
{/if}
