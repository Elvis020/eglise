<script lang="ts">
  import { tick } from 'svelte';
  import {
    createPerson,
    normalisePhone,
    validatePersonDetails,
    type Person,
    type PersonDetailsErrors,
    type PersonKind
  } from '$lib/domain';
  import { people } from '$lib/people';
  import PersonDetailsFields from './PersonDetailsFields.svelte';

  let {
    onsave,
    oncancel,
    submitLabel = 'Save person',
    disabled = false
  }: {
    onsave: (person: Person) => void;
    oncancel: () => void;
    submitLabel?: string;
    disabled?: boolean;
  } = $props();
  let name = $state('');
  let kind = $state<PersonKind>('visitor');
  let phone = $state('');
  let neighbourhood = $state('');
  let errors = $state<PersonDetailsErrors>({});
  let reviewed = $state(false);
  let duplicate = $derived(
    $people.find(
      (person) =>
        person.name.trim().toLowerCase().replace(/\s+/g, ' ') ===
          name.trim().toLowerCase().replace(/\s+/g, ' ') ||
        (phone.trim() && normalisePhone(person.phone) === normalisePhone(phone))
    )
  );

  $effect(() => {
    void name;
    void phone;
    reviewed = false;
  });

  async function save(): Promise<void> {
    errors = validatePersonDetails({ name, kind, phone, neighbourhood });
    await tick();

    if (Object.keys(errors).length) {
      document.getElementById(Object.keys(errors)[0])?.focus();

      return;
    }

    if (duplicate && !reviewed) {
      reviewed = true;

      return;
    }

    onsave(createPerson(name, phone, neighbourhood, kind));
  }
</script>

<section class="inline-person" aria-label="Add person">
  <h3>Add person</h3>
  <div class="workflow-fields">
    <PersonDetailsFields bind:name bind:kind bind:phone bind:neighbourhood {errors} />
  </div>
  {#if reviewed && duplicate}
    <div class="review-notice" role="status">
      <p>
        <strong>Possible existing person: {duplicate.name}</strong><br />{duplicate.phone ||
          'No phone recorded'} · {duplicate.recordState}
      </p>
      <p>
        A shared phone number is allowed. Check the existing record before creating a separate
        person.
      </p>
      {#if duplicate.recordState === 'active'}
        <button class="button secondary" type="button" {disabled} onclick={() => onsave(duplicate!)}
          >Use existing person</button
        >
      {/if}
    </div>
  {/if}
  <div class="form-actions">
    <button class="button secondary" type="button" onclick={oncancel}>Cancel adding person</button>
    <button class="button primary" type="button" {disabled} onclick={save}
      >{reviewed && duplicate ? 'Create separate person' : submitLabel}</button
    >
  </div>
</section>
