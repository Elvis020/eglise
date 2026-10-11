<script lang="ts">
  import { people, addPerson } from '$lib/people';
  import type { Person } from '$lib/domain';
  import InlinePersonForm from './InlinePersonForm.svelte';

  let { value = $bindable('') }: { value?: string } = $props();
  let query = $state('');
  let creating = $state(false);
  const selected = $derived($people.find((person) => person.id === value));
  const results = $derived(
    $people
      .filter(
        (person) =>
          person.recordState === 'active' &&
          (person.name.toLowerCase().includes(query.trim().toLowerCase()) ||
            person.phone.replace(/\D/g, '').includes(query.replace(/\D/g, '') || 'no-phone-query'))
      )
      .slice(0, 8)
  );

  function save(person: Person): void {
    if (!$people.some((record) => record.id === person.id)) addPerson(person);
    value = person.id;
    creating = false;
  }
</script>

<div class="person-picker">
  {#if selected}
    <p><strong>{selected.name}</strong> · {selected.phone}</p>
    <button
      class="button secondary"
      type="button"
      onclick={() => {
        value = '';
        query = '';
      }}>Choose another person</button
    >
  {:else if creating}
    <InlinePersonForm onsave={save} oncancel={() => (creating = false)} />
  {:else}
    <div class="field">
      <label for="welfare-person-search">Find a person</label>
      <input
        id="welfare-person-search"
        type="search"
        bind:value={query}
        placeholder="Search by name or phone"
      />
    </div>
    {#if query.trim()}
      <div class="person-picker-results">
        {#each results as person}
          <button class="button secondary" type="button" onclick={() => (value = person.id)}
            >{person.name} · {person.phone}</button
          >
        {:else}<p>No people match this search.</p>{/each}
        <p class="help">Showing up to 8 matches. Refine your search if needed.</p>
      </div>
    {/if}
    <button class="button secondary" type="button" onclick={() => (creating = true)}
      >Add person</button
    >
  {/if}
</div>
