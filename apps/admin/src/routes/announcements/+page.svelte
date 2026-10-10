<script lang="ts">
  import IconArrowRight from '@tabler/icons-svelte-runes/icons/arrow-right';
  import IconPlus from '@tabler/icons-svelte-runes/icons/plus';
  import IconSpeakerphone from '@tabler/icons-svelte-runes/icons/speakerphone';
  import EgliseSelect from '$lib/components/EgliseSelect.svelte';
  import { addAnnouncement, announcements } from '$lib/announcements';
  import { showToast } from '$lib/toast';

  const audienceLabels = {
    'church-community': 'Church community',
    members: 'Recognised members',
    staff: 'Staff and ministry teams'
  } as const;
  const channelLabels = {
    both: 'Telegram and WhatsApp',
    telegram: 'Telegram',
    whatsapp: 'WhatsApp'
  } as const;

  let title = $state('');
  let summary = $state('');
  let audience = $state<'church-community' | 'members' | 'staff'>('church-community');
  let channel = $state<'telegram' | 'whatsapp' | 'both'>('both');
  let error = $state('');

  function addDraft() {
    error = '';
    if (!title.trim() || !summary.trim()) {
      error = 'Add a title and short message before saving a draft.';

      return;
    }
    addAnnouncement({ audience, channel, summary: summary.trim(), title: title.trim() });
    title = '';
    summary = '';
    showToast('Draft announcement added. Nothing has been sent.');
  }
</script>

<svelte:head><title>Announcements | Eglise</title></svelte:head>

<section class="page announcements-page">
  <header class="page-head announcements-page-head">
    <div>
      <p class="eyebrow">Announcements</p>
      <h1 tabindex="-1">A clearer home for what the church shares.</h1>
      <p class="page-intro">
        Eglise can make approved announcements easier to find without replacing the church’s
        WhatsApp and Telegram channels.
      </p>
    </div>
  </header>

  <section aria-labelledby="announcement-boundary-title" class="announcements-boundary">
    <IconSpeakerphone aria-hidden="true" size={24} stroke={1.8} />
    <div>
      <p class="eyebrow">Discovery boundary</p>
      <h2 id="announcement-boundary-title">No publishing workflow has been agreed yet</h2>
      <p>
        This area is intentionally not a message composer, delivery channel, or public feed. The
        existing channels remain the source of truth while the church agrees the workflow.
      </p>
    </div>
  </section>

  <section aria-labelledby="draft-title" class="announcements-draft panel">
    <div class="section-head">
      <div>
        <p class="eyebrow">Synthetic draft</p>
        <h2 id="draft-title">Prepare a notice</h2>
      </div>
    </div>
    <form
      novalidate
      onsubmit={(event) => {
        event.preventDefault();
        addDraft();
      }}
    >
      {#if error}
        <p class="error" role="alert">{error}</p>
      {/if}
      <div class="announcements-fields">
        <div class="field">
          <label for="announcement-title">Title</label>
          <input
            bind:value={title}
            id="announcement-title"
            placeholder="For example, Sunday service reminder"
          />
        </div>
        <div class="field">
          <label for="announcement-audience">Intended audience</label>
          <EgliseSelect
            bind:value={audience}
            id="announcement-audience"
            options={[
              { value: 'church-community', label: 'Church community' },
              { value: 'members', label: 'Recognised members' },
              { value: 'staff', label: 'Staff and ministry teams' }
            ]}
          />
        </div>
        <div class="field">
          <label for="announcement-channel">Existing channel</label>
          <EgliseSelect
            bind:value={channel}
            id="announcement-channel"
            options={[
              { value: 'telegram', label: 'Telegram' },
              { value: 'whatsapp', label: 'WhatsApp' },
              { value: 'both', label: 'Telegram and WhatsApp' }
            ]}
          />
        </div>
        <div class="field announcement-message-field">
          <label for="announcement-summary">Short message</label>
          <textarea bind:value={summary} id="announcement-summary" rows="3"></textarea>
        </div>
      </div>
      <div class="form-actions">
        <button class="button primary" type="submit">
          <IconPlus aria-hidden="true" size={18} stroke={1.8} />Save draft
        </button>
      </div>
    </form>
  </section>

  <section aria-labelledby="announcement-register-title" class="announcements-register">
    <p class="eyebrow">Register</p>
    <h2 id="announcement-register-title">Drafts awaiting review</h2>
    <div role="list">
      {#each $announcements as announcement}
        <article role="listitem">
          <strong>{announcement.title}</strong>
          <span>{announcement.summary}</span>
          <small>
            {audienceLabels[announcement.audience]} · {channelLabels[announcement.channel]}
          </small>
        </article>
      {/each}
    </div>
  </section>

  <section aria-labelledby="announcement-decisions-title" class="announcements-decisions">
    <div class="announcements-section-heading">
      <p class="eyebrow">What to agree</p>
      <h2 id="announcement-decisions-title">The decisions that make publishing safe</h2>
    </div>
    <ol>
      <li>
        <strong>Audience</strong><span
          >Who should see each announcement: staff, members, public, or a defined group?</span
        >
      </li>
      <li>
        <strong>Owner and approval</strong><span
          >Who prepares, reviews, and approves a message before it is shared?</span
        >
      </li>
      <li>
        <strong>Timing and lifecycle</strong><span
          >When does an announcement appear, expire, change, or need to be removed?</span
        >
      </li>
    </ol>
  </section>

  <aside class="announcements-next-step">
    <div>
      <p class="eyebrow">Available now</p>
      <h2>Keep existing shared material organised.</h2>
      <p>
        Resources is ready for staff to record reviewed Church Notes, sermon audio, and Telegram
        links.
      </p>
    </div>
    <a class="button secondary" href="/resources"
      >Review resources <IconArrowRight aria-hidden="true" size={18} stroke={1.8} /></a
    >
  </aside>
</section>

<style>
  .announcements-page {
    display: grid;
    width: 100%;
    max-width: none;
    gap: 40px;
    margin: 0;
  }
  .announcements-page-head,
  .announcements-boundary,
  .announcements-decisions,
  .announcements-next-step {
    max-width: none;
  }
  .announcements-page-head {
    display: block;
    margin-bottom: 0;
  }
  .announcements-boundary {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    gap: 16px;
    padding: 20px;
    border: 1px solid var(--border);
    border-radius: 12px;
    background: var(--surface-raised);
  }
  .announcements-boundary :global(svg) {
    color: var(--info);
  }
  .announcements-boundary .eyebrow,
  .announcements-section-heading .eyebrow,
  .announcements-next-step .eyebrow {
    margin-bottom: 4px;
  }
  .announcements-boundary h2,
  .announcements-section-heading h2,
  .announcements-next-step h2 {
    margin: 0;
    font: 400 30px/1.15 var(--font-display);
  }
  .announcements-boundary p:last-child,
  .announcements-next-step p:last-child {
    margin: 8px 0 0;
    color: var(--text-secondary);
  }
  .announcements-decisions {
    display: grid;
    gap: 20px;
  }
  .announcements-decisions ol {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .announcements-decisions li {
    display: grid;
    gap: 8px;
    min-height: 150px;
    padding: 20px 24px 20px 0;
  }
  .announcements-decisions li + li {
    padding-left: 24px;
    border-left: 1px solid var(--border);
  }
  .announcements-decisions strong {
    font-size: 16px;
  }
  .announcements-decisions span {
    color: var(--text-secondary);
  }
  .announcements-next-step {
    display: flex;
    gap: 24px;
    align-items: center;
    justify-content: space-between;
    padding: 20px 0;
  }
  .announcements-next-step > div {
    max-width: 700px;
  }
  .announcements-draft {
    width: 100%;
    max-width: none;
    padding: 24px;
  }
  .announcements-fields {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 16px;
  }
  .announcement-message-field {
    grid-column: 1 / -1;
  }
  .announcements-fields textarea {
    min-height: 104px;
    width: 100%;
    padding: 9px 11px;
    border: 2px solid var(--border);
    border-radius: 8px;
    color: var(--text-primary);
    background: #fffdf8;
    font: inherit;
    resize: none;
  }
  .announcements-fields textarea:focus {
    outline: 0;
    border-color: #6f8b75;
    box-shadow: 0 0 0 2px rgb(49 84 59 / 12%);
  }
  .announcements-register {
    display: grid;
    width: 100%;
    max-width: none;
    gap: 12px;
  }
  .announcements-register h2 {
    margin: 0;
    font: 400 30px/1.15 var(--font-display);
  }
  .announcements-register article {
    display: grid;
    gap: 4px;
    padding: 16px 0;
    border-bottom: 1px solid var(--border);
  }
  .announcements-register span,
  .announcements-register small {
    color: var(--text-secondary);
  }
  .announcements-register small {
    font-size: 14px;
    text-transform: capitalize;
  }
  @media (max-width: 720px) {
    .announcements-page {
      gap: 32px;
    }
    .announcements-decisions ol {
      grid-template-columns: 1fr;
    }
    .announcements-decisions li,
    .announcements-decisions li + li {
      min-height: 0;
      padding: 16px 0;
      border-left: 0;
    }
    .announcements-decisions li + li {
      border-top: 1px solid var(--border);
    }
    .announcements-next-step {
      display: block;
    }
    .announcements-next-step .button {
      display: inline-flex;
      margin-top: 16px;
    }
    .announcements-draft {
      padding: 16px;
    }
    .announcements-fields {
      grid-template-columns: 1fr;
    }
  }
</style>
