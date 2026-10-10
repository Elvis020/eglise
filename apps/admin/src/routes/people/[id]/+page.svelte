<script lang="ts">
  import { page } from '$app/state';
  import IconArrowLeft from '@tabler/icons-svelte-runes/icons/arrow-left';
  import IconEdit from '@tabler/icons-svelte-runes/icons/edit';
  import IconArrowRight from '@tabler/icons-svelte-runes/icons/arrow-right';
  import IconCircleCheck from '@tabler/icons-svelte-runes/icons/circle-check';
  import IconCircleDashed from '@tabler/icons-svelte-runes/icons/circle-dashed';
  import IconUserCheck from '@tabler/icons-svelte-runes/icons/user-check';

  import {
    formatRecordDate,
    journeyStages,
    personKindLabels,
    personRecordStateLabels,
    type JourneyEntry,
    type Person,
    type PersonKind
  } from '$lib/domain';
  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
  import PersonAvatar from '$lib/components/PersonAvatar.svelte';
  import { people } from '$lib/people';

  let person: Person | undefined;

  $: person = $people.find((record) => record.id === page.params.id);
  $: peopleAccess = page.data.peopleAccess;

  function journeyEntryFor(stage: PersonKind): JourneyEntry | undefined {
    return person?.journey.find((entry) => entry.stage === stage);
  }

  function isCurrentJourneyStage(stage: PersonKind): boolean {
    return person?.kind === stage && !person.membership.recognised;
  }
</script>

<svelte:head
  ><title>{person ? `${person.name} | Eglise` : 'Person not found | Eglise'}</title></svelte:head
>

{#if person}
  <section class="page person-detail-page">
    <Breadcrumbs items={[{ label: 'People & Membership', href: '/people' }]} />

    <header class="page-head person-page-head">
      <div class="person-heading">
        <PersonAvatar size="large" />
        <div>
          <h1 tabindex="-1">{person.name}</h1>
          <p class="page-intro">
            Person record. Date of birth is not stored, displayed, or searchable.
          </p>
        </div>
      </div>
    </header>
    <div class="panel person-summary">
      <div class="person-summary-content">
        <div class:recognised={person.membership.recognised} class="membership-overview">
          <p class="eyebrow">Membership</p>
          <div class="membership-status-line">
            <strong>{person.membership.recognised ? 'Member' : 'Not a member'}</strong>
            {#if person.membership.recognised}
              <span>Recognised {formatRecordDate(person.membership.recognisedOn)}</span>
            {:else}
              <span>Awaiting church recognition</span>
            {/if}
          </div>
        </div>
        <dl class="detail-list">
          <div>
            <dt>Person type</dt>
            <dd>{personKindLabels[person.kind]}</dd>
          </div>
          <div>
            <dt>Phone</dt>
            <dd>{person.phone || 'Not provided'}</dd>
          </div>
          <div>
            <dt>Neighbourhood</dt>
            <dd>{person.neighbourhood || 'Not provided'}</dd>
          </div>
          {#if person.membership.recognised}
            <div>
              <dt>Assimilation completed</dt>
              <dd>{formatRecordDate(person.membership.assimilationCompletedOn)}</dd>
            </div>
            <div class="wide-detail">
              <dt>Certificate or register reference</dt>
              <dd>{person.membership.evidence}</dd>
            </div>
          {/if}
          {#if person.membership.correctionNote}
            <div class="wide-detail">
              <dt>Correction note</dt>
              <dd>{person.membership.correctionNote}</dd>
            </div>
          {/if}
        </dl>
      </div>
      <div class="person-actions">
        {#if person.recordState === 'active' && peopleAccess?.canEdit}
          <a class="button secondary" href={`/people/${person.id}/edit`}>
            <IconEdit aria-hidden="true" size={18} stroke={1.8} />
            Edit person
          </a>
          {#if person.kind === 'person'}
            <a class="button secondary" href={`/people/${person.id}/journey`}>
              <IconArrowRight aria-hidden="true" size={18} stroke={1.8} />
              Review journey
            </a>
            {#if peopleAccess?.canManageMembership}
              <a class="button primary" href={`/people/${person.id}/membership`}>
                {#if person.membership.recognised}
                  <IconEdit aria-hidden="true" size={18} stroke={1.8} />
                {:else}
                  <IconUserCheck aria-hidden="true" size={18} stroke={1.8} />
                {/if}
                {person.membership.recognised ? 'Correct membership' : 'Record membership'}
              </a>
            {/if}
          {:else}
            <a class="button primary" href={`/people/${person.id}/journey`}>
              <IconArrowRight aria-hidden="true" size={18} stroke={1.8} />
              Continue journey
            </a>
          {/if}
        {:else}
          <p class="record-state-notice">
            This record is {personRecordStateLabels[person.recordState].toLocaleLowerCase()} and is not
            available for ordinary editing.
          </p>
          {#if peopleAccess?.canManageRecords}
            <a class="button secondary" href={`/people/${person.id}/record`}>
              <IconEdit aria-hidden="true" size={18} stroke={1.8} />
              Manage record
            </a>
          {/if}
        {/if}
      </div>
    </div>
    <section class="panel relationship-roadmap" aria-labelledby="relationship-roadmap-title">
      <div class="relationship-roadmap-head">
        <div>
          <p class="eyebrow">Relationship roadmap</p>
          <h2 id="relationship-roadmap-title">From first visit to membership</h2>
        </div>
        <p>Each milestone is recorded deliberately; membership is never inferred.</p>
      </div>

      <ol class="roadmap">
        {#each journeyStages as stage}
          {@const entry = journeyEntryFor(stage)}
          <li class:recorded={Boolean(entry)} class:current={isCurrentJourneyStage(stage)}>
            <span class="roadmap-marker" aria-hidden="true">
              {#if entry}
                <IconCircleCheck size={22} stroke={1.8} />
              {:else}
                <IconCircleDashed size={22} stroke={1.6} />
              {/if}
            </span>
            <div class="roadmap-copy">
              <div class="roadmap-title-row">
                <strong>{personKindLabels[stage]}</strong>
                {#if isCurrentJourneyStage(stage)}<span class="roadmap-status">Current</span>{/if}
              </div>
              {#if entry}
                <p>{formatRecordDate(entry.recordedOn)}</p>
                {#if entry.note}<p class="roadmap-note">{entry.note}</p>{/if}
              {:else}
                <p>Not recorded yet</p>
              {/if}
            </div>
          </li>
        {/each}
        <li
          class:recorded={person.membership.recognised}
          class:current={person.membership.recognised}
        >
          <span class="roadmap-marker" aria-hidden="true">
            {#if person.membership.recognised}
              <IconCircleCheck size={22} stroke={1.8} />
            {:else}
              <IconCircleDashed size={22} stroke={1.6} />
            {/if}
          </span>
          <div class="roadmap-copy">
            <div class="roadmap-title-row">
              <strong>Member</strong>
              {#if person.membership.recognised}<span class="roadmap-status">Current</span>{/if}
            </div>
            {#if person.membership.recognised}
              <p>{formatRecordDate(person.membership.recognisedOn)}</p>
              {#if person.membership.evidence}<p class="roadmap-note">
                  {person.membership.evidence}
                </p>{/if}
            {:else}
              <p>Awaiting church recognition</p>
            {/if}
          </div>
        </li>
      </ol>

      {#if person.membership.history.length > 1}
        <details class="roadmap-history">
          <summary>View recognition record ({person.membership.history.length} entries)</summary>
          <ol>
            {#each person.membership.history as entry}
              <li>
                <strong
                  >{entry.action === 'recognised'
                    ? 'Recognition recorded'
                    : 'Record corrected'}</strong
                >
                <span>{formatRecordDate(entry.recordedOn)}</span>
                {#if entry.note}<p>{entry.note}</p>{/if}
              </li>
            {/each}
          </ol>
        </details>
      {/if}
    </section>
    <details class="record-options">
      <summary>Record management</summary>
      <p>Archive, transfer, or link a reviewed duplicate without removing this person’s history.</p>
      <a href={`/people/${person.id}/record`}>Manage record lifecycle</a>
    </details>
    <p class="membership-note">
      Membership is recorded only after church recognition. It is never inferred from imports or
      attendance.
    </p>
  </section>
{:else}
  <section class="page">
    <Breadcrumbs items={[{ label: 'People & Membership', href: '/people' }]} />

    <h1 tabindex="-1">Person not found</h1>
    <p class="page-intro">This person is not in the current sample.</p>
    <a class="button secondary" href="/people">
      <IconArrowLeft aria-hidden="true" size={18} stroke={1.8} />
      Return to people directory
    </a>
  </section>
{/if}

<style>
  .relationship-roadmap {
    display: grid;
    gap: 28px;
    margin-top: 24px;
  }

  .relationship-roadmap-head {
    display: flex;
    gap: 16px 32px;
    align-items: end;
    justify-content: space-between;
  }

  .relationship-roadmap h2 {
    margin: 4px 0 0;
    font: 500 24px/1.15 var(--font-display);
  }

  .relationship-roadmap-head > p {
    max-width: 330px;
    margin: 0;
    color: var(--text-secondary);
    font-size: 14px;
    text-align: right;
  }

  .roadmap {
    display: grid;
    gap: 0;
    padding: 0;
    margin: 0;
    list-style: none;
  }

  .roadmap > li {
    position: relative;
    display: grid;
    grid-template-columns: 30px minmax(0, 1fr);
    gap: 14px;
    min-height: 76px;
    padding: 0 0 20px;
  }

  .roadmap > li:not(:last-child)::before {
    position: absolute;
    top: 24px;
    bottom: 0;
    left: 10px;
    width: 1px;
    content: '';
    background: var(--border);
  }

  .roadmap-marker {
    position: relative;
    z-index: 1;
    display: grid;
    width: 22px;
    height: 22px;
    place-items: center;
    color: var(--text-secondary);
    background: var(--surface-raised);
  }

  .roadmap > li.recorded .roadmap-marker {
    color: var(--success);
  }

  .roadmap > li.current .roadmap-marker {
    color: var(--primary);
  }

  .roadmap-copy {
    min-width: 0;
    padding: 0 0 4px;
  }

  .roadmap-title-row {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .roadmap-copy strong {
    font-size: 15px;
  }

  .roadmap-copy p {
    margin: 4px 0 0;
    color: var(--text-secondary);
    font-size: 14px;
  }

  .roadmap-note {
    color: var(--text-primary) !important;
  }

  .roadmap-status {
    padding: 2px 7px;
    border-radius: 999px;
    color: var(--primary);
    background: #e8efe4;
    font-size: 12px;
    font-weight: 700;
  }

  .roadmap-history {
    padding-top: 16px;
    border-top: 1px solid var(--border);
  }

  .roadmap-history summary {
    color: var(--primary);
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
  }

  .roadmap-history ol {
    display: grid;
    gap: 10px;
    padding: 16px 0 0;
    margin: 0;
    list-style: none;
  }

  .roadmap-history li {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 4px 16px;
    font-size: 14px;
  }

  .roadmap-history li span,
  .roadmap-history li p {
    color: var(--text-secondary);
  }

  .record-state-notice {
    max-width: 42ch;
    margin: 0;
    color: var(--text-secondary);
    font-size: 14px;
  }

  .record-options {
    margin-top: 24px;
    padding: 16px 0;
  }

  .record-options summary {
    color: var(--primary);
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
  }

  .record-options p {
    max-width: 58ch;
    margin: 12px 0 8px;
    color: var(--text-secondary);
    font-size: 14px;
  }

  .record-options a {
    color: var(--primary);
    font-size: 14px;
    font-weight: 700;
  }

  .roadmap-history li p {
    grid-column: 1 / -1;
    margin: 0;
  }

  @media (max-width: 640px) {
    .relationship-roadmap-head {
      align-items: start;
      flex-direction: column;
    }

    .relationship-roadmap-head > p {
      text-align: left;
    }

    .roadmap-history li {
      grid-template-columns: 1fr;
    }
  }
</style>
