<script lang="ts">
  import { page } from '$app/state';
  import IconArrowLeft from '@tabler/icons-svelte-runes/icons/arrow-left';
  import IconEdit from '@tabler/icons-svelte-runes/icons/edit';
  import IconUserCheck from '@tabler/icons-svelte-runes/icons/user-check';

  import { formatRecordDate, personKindLabels, type Person } from '$lib/domain';
  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
  import PersonAvatar from '$lib/components/PersonAvatar.svelte';
  import { people } from '$lib/people';

  let person: Person | undefined;

  $: person = $people.find((record) => record.id === page.params.id);
</script>

<svelte:head
  ><title>{person ? `${person.name} | Eglise` : 'Person not found | Eglise'}</title></svelte:head
>

{#if person}
  <section class="page person-detail-page">
    <Breadcrumbs
      items={[{ label: 'People & Membership', href: '/people' }, { label: person.name }]}
    />

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
      <dl class="detail-list">
        <dt>Person type</dt>
        <dd>{personKindLabels[person.kind]}</dd>
        <dt>Phone</dt>
        <dd>{person.phone || 'Not provided'}</dd>
        <dt>Neighbourhood</dt>
        <dd>{person.neighbourhood || 'Not provided'}</dd>
        <dt>Membership</dt>
        <dd class="membership-value">{person.membership.recognised ? 'Member' : 'Not a member'}</dd>
        {#if person.membership.recognised}<dt>Assimilation completed</dt>
          <dd>{formatRecordDate(person.membership.assimilationCompletedOn)}</dd>
          <dt>Membership recognised</dt>
          <dd>{formatRecordDate(person.membership.recognisedOn)}</dd>
          <dt>Certificate or register reference</dt>
          <dd>{person.membership.evidence}</dd>
        {/if}{#if person.membership.correctionNote}<dt>Correction note</dt>
          <dd>{person.membership.correctionNote}</dd>{/if}
      </dl>
      <div class="person-actions">
        <a class="button secondary" href={`/people/${person.id}/edit`}>
          <IconEdit aria-hidden="true" size={18} stroke={1.8} />
          Edit person
        </a>
        <a class="button primary" href={`/people/${person.id}/membership`}>
          {#if person.membership.recognised}
            <IconEdit aria-hidden="true" size={18} stroke={1.8} />
          {:else}
            <IconUserCheck aria-hidden="true" size={18} stroke={1.8} />
          {/if}
          {person.membership.recognised ? 'Correct membership' : 'Record membership'}
        </a>
      </div>
    </div>
    <p class="membership-note">
      Membership is recorded only after church recognition. It is never inferred from imports or
      attendance.
    </p>
  </section>
{:else}
  <section class="page">
    <Breadcrumbs
      items={[{ label: 'People & Membership', href: '/people' }, { label: 'Person not found' }]}
    />

    <h1 tabindex="-1">Person not found</h1>
    <p class="page-intro">This person is not in the current sample.</p>
    <a class="button secondary" href="/people">
      <IconArrowLeft aria-hidden="true" size={18} stroke={1.8} />
      Return to people directory
    </a>
  </section>
{/if}
