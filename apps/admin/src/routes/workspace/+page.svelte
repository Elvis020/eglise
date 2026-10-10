<script lang="ts">
  import { page } from '$app/state';
  import IconBible from '@tabler/icons-svelte-runes/icons/bible';
  import IconCalendarCheck from '@tabler/icons-svelte-runes/icons/calendar-check';
  import IconChartBar from '@tabler/icons-svelte-runes/icons/chart-bar';
  import IconFolder from '@tabler/icons-svelte-runes/icons/folder';
  import IconHeartHandshake from '@tabler/icons-svelte-runes/icons/heart-handshake';
  import IconLogout from '@tabler/icons-svelte-runes/icons/logout';
  import IconSchool from '@tabler/icons-svelte-runes/icons/school';
  import IconSettings from '@tabler/icons-svelte-runes/icons/settings';
  import IconSpeakerphone from '@tabler/icons-svelte-runes/icons/speakerphone';
  import IconUsersGroup from '@tabler/icons-svelte-runes/icons/users-group';

  const canAccessSettings = $derived(
    page.data.authMode !== 'supabase' ||
      page.data.workspace?.role === 'owner' ||
      page.data.workspace?.role === 'people_administrator'
  );

  function requestMobileLogout() {
    document.dispatchEvent(new CustomEvent('eglise:request-mobile-logout'));
  }
</script>

<svelte:head><title>Workspace | Eglise</title></svelte:head>

<section class="page workspace-index-page">
  <header class="page-head workspace-index-head">
    <div>
      <p class="eyebrow">Workspace</p>
      <h1 tabindex="-1">Find what you need.</h1>
      <p class="page-intro">Choose an area to continue a church administration task.</p>
    </div>
  </header>

  <section aria-labelledby="workspace-essentials" class="workspace-group">
    <p class="eyebrow" id="workspace-essentials">Essentials</p>
    <div class="workspace-list">
      <a href="/people">
        <IconUsersGroup aria-hidden="true" size={22} stroke={1.8} />
        <span
          ><strong>People &amp; Membership</strong><small>Directory, records, and membership</small
          ></span
        >
      </a>
      <a href="/attendance">
        <IconCalendarCheck aria-hidden="true" size={22} stroke={1.8} />
        <span><strong>Attendance</strong><small>Create events and record attendance</small></span>
      </a>
      <a href="/reports">
        <IconChartBar aria-hidden="true" size={22} stroke={1.8} />
        <span><strong>Reports</strong><small>Review completed attendance events</small></span>
      </a>
    </div>
  </section>

  <section aria-labelledby="workspace-care" class="workspace-group">
    <p class="eyebrow" id="workspace-care">Care &amp; formation</p>
    <div class="workspace-list">
      <a href="/welfare">
        <IconHeartHandshake aria-hidden="true" size={22} stroke={1.8} />
        <span><strong>Welfare</strong><small>Agree the boundaries before a workflow</small></span>
      </a>
      <a href="/bible-study">
        <IconBible aria-hidden="true" size={22} stroke={1.8} />
        <span><strong>Bible Study</strong><small>Prepare material for discussion</small></span>
      </a>
      <a href="/care-school">
        <IconSchool aria-hidden="true" size={22} stroke={1.8} />
        <span
          ><strong>Care School</strong><small>Shape topics before participant records</small></span
        >
      </a>
    </div>
  </section>

  <section aria-labelledby="workspace-resources" class="workspace-group">
    <p class="eyebrow" id="workspace-resources">Communication &amp; resources</p>
    <div class="workspace-list">
      <a href="/resources">
        <IconFolder aria-hidden="true" size={22} stroke={1.8} />
        <span
          ><strong>Resources</strong><small>Maintain approved notes and sermon links</small></span
        >
      </a>
      <a href="/announcements">
        <IconSpeakerphone aria-hidden="true" size={22} stroke={1.8} />
        <span
          ><strong>Announcements</strong><small>Prepare notices without sending messages</small
          ></span
        >
      </a>
    </div>
  </section>

  {#if canAccessSettings}
    <section aria-labelledby="workspace-settings" class="workspace-group">
      <p class="eyebrow" id="workspace-settings">Workspace</p>
      <div class="workspace-list">
        <a href="/settings">
          <IconSettings aria-hidden="true" size={22} stroke={1.8} />
          <span
            ><strong>Settings</strong><small>Access, invitations, and workspace details</small
            ></span
          >
        </a>
      </div>
    </section>
  {/if}

  <section aria-labelledby="workspace-account" class="workspace-group mobile-account-group">
    <p class="eyebrow" id="workspace-account">Account</p>
    <button class="workspace-account-action" onclick={requestMobileLogout} type="button">
      <IconLogout aria-hidden="true" size={22} stroke={1.8} />
      <span>Log out</span>
    </button>
  </section>
</section>

<style>
  .workspace-index-page {
    display: grid;
    gap: 32px;
    max-width: 760px;
  }

  .workspace-index-head {
    display: block;
    margin-bottom: 0;
  }

  .workspace-group {
    display: grid;
    gap: 10px;
  }

  .workspace-group .eyebrow {
    margin-bottom: 0;
  }

  .workspace-list {
    display: grid;
    gap: 4px;
  }

  .workspace-list a {
    display: grid;
    grid-template-columns: 28px minmax(0, 1fr);
    gap: 12px;
    min-height: 64px;
    align-items: center;
    padding: 12px 8px;
    border-radius: 8px;
    color: var(--text-primary);
    text-decoration: none;
  }

  .workspace-list a:hover,
  .workspace-list a:focus-visible {
    color: var(--primary);
  }

  .workspace-list a:active {
    background: var(--surface);
  }

  .workspace-list :global(svg) {
    color: var(--primary);
  }

  .workspace-list span {
    display: grid;
    gap: 2px;
    min-width: 0;
  }

  .workspace-list strong {
    font-size: 16px;
  }

  .workspace-list small {
    color: var(--text-secondary);
    font-size: 14px;
  }

  .mobile-account-group {
    display: none;
  }

  @media (max-width: 960px) {
    .mobile-account-group {
      display: grid;
    }

    .workspace-account-action {
      display: grid;
      grid-template-columns: 28px minmax(0, 1fr);
      gap: 12px;
      min-height: 52px;
      align-items: center;
      padding: 8px 4px;
      border: 0;
      border-radius: 8px;
      color: var(--danger);
      background: transparent;
      font: 600 16px var(--font-ui);
      text-align: left;
    }

    .workspace-account-action:hover,
    .workspace-account-action:focus-visible,
    .workspace-account-action:active {
      background: color-mix(in srgb, var(--danger) 8%, transparent);
    }

    .workspace-account-action:active {
      transform: translateY(1px);
    }
  }
</style>
