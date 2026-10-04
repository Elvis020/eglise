<script lang="ts">
  import type { Person } from '$lib/domain';
  import { people } from '$lib/people';

  let query = '';
  let membership = 'all';

  function matches(person: Person): boolean {
    const searchable = `${person.name} ${person.phone} ${person.neighbourhood}`.toLowerCase();
    const membershipMatches =
      membership === 'all' || String(person.membership.recognised) === membership;

    return membershipMatches && searchable.includes(query.toLowerCase());
  }

  $: filteredPeople = $people.filter(matches);
</script>

<svelte:head><title>People directory — Eglise</title></svelte:head>

<section class="page">
  <header class="page-head">
    <div>
      <p class="eyebrow">People &amp; Membership</p>
      <h1 tabindex="-1">People directory</h1>
      <p class="page-intro">
        A fictional directory for testing the People &amp; Membership workflow.
      </p>
    </div>
    <a class="button primary" href="/people/add">Add person</a>
  </header>

  <div class="panel">
    <div class="controls">
      <div class="field">
        <label for="directory-search">Search people</label>
        <input
          id="directory-search"
          type="search"
          bind:value={query}
          placeholder="Name, phone, or neighbourhood"
        />
      </div>
      <div class="field">
        <label for="membership-filter">Membership</label>
        <select id="membership-filter" bind:value={membership}>
          <option value="all">All people</option>
          <option value="true">Members</option>
          <option value="false">Not members</option>
        </select>
      </div>
    </div>

    <p class="muted" aria-live="polite">
      {filteredPeople.length} fictional {filteredPeople.length === 1 ? 'record' : 'records'}. Shared
      phone numbers are allowed and are never merged automatically.
    </p>

    {#if filteredPeople.length}
      <div class="table-wrap">
        <table class="directory">
          <thead
            ><tr><th>Person</th><th>Phone</th><th>Neighbourhood</th><th>Membership</th></tr></thead
          >
          <tbody>
            {#each filteredPeople as person}
              <tr>
                <td data-label="Person"
                  ><a class="person-link" href={`/people/${person.id}`}>{person.name}</a></td
                >
                <td data-label="Phone">{person.phone}</td>
                <td data-label="Neighbourhood">{person.neighbourhood}</td>
                <td data-label="Membership">
                  <span
                    class:member={person.membership.recognised}
                    class:not-member={!person.membership.recognised}
                    class="status"
                  >
                    {person.membership.recognised ? '● Member' : '○ Not a member'}
                  </span>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {:else}
      <p class="empty">
        No people match this search. Try another term or <a href="/people/add"
          >add a fictional person</a
        >.
      </p>
    {/if}
  </div>

  <div class="panel">
    <h2>Bring in a fictional sample</h2>
    <p class="muted">
      Review a fixed example first. This prototype does not read files or create attendance records.
    </p>
    <p><a class="button secondary" href="/people/import">Review sample import</a></p>
  </div>
</section>
