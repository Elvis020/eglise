<script lang="ts">
  import { beforeNavigate, goto } from '$app/navigation';
  import { page } from '$app/state';
  import { onMount } from 'svelte';
  import IconArrowLeft from '@tabler/icons-svelte-runes/icons/arrow-left';
  import IconDeviceFloppy from '@tabler/icons-svelte-runes/icons/device-floppy';
  import IconEdit from '@tabler/icons-svelte-runes/icons/edit';
  import IconTrash from '@tabler/icons-svelte-runes/icons/trash';

  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
  import PersonDetailsFields from '$lib/components/PersonDetailsFields.svelte';
  import type { Person, PersonDetailsErrors, PersonKind } from '$lib/domain';
  import { people, updatePersonDetails } from '$lib/people';
  import { showToast } from '$lib/toast';
  import { validatePersonDetails } from '$lib/domain';

  let form: HTMLFormElement;
  let leaveDialog: HTMLDialogElement;
  let person: Person | undefined;
  let loadedPersonId = '';
  let dirty = false;
  let pendingNavigation: (() => void) | undefined;
  let name = '';
  let kind: PersonKind = 'person';
  let phone = '';
  let neighbourhood = '';
  let errors: PersonDetailsErrors = {};

  $: person = $people.find((record) => record.id === page.params.id);
  $: if (person && person.id !== loadedPersonId) {
    loadedPersonId = person.id;
    name = person.name;
    kind = person.kind;
    phone = person.phone;
    neighbourhood = person.neighbourhood;
  }

  function validate(): boolean {
    errors = validatePersonDetails({ name, kind, phone, neighbourhood });

    return Object.keys(errors).length === 0;
  }

  function save(): void {
    if (!person || !validate()) {
      const firstError = Object.keys(errors)[0];

      document.getElementById(firstError)?.focus();

      return;
    }

    updatePersonDetails(person.id, {
      name: name.trim(),
      kind,
      phone: phone.trim(),
      neighbourhood: neighbourhood.trim()
    });
    dirty = false;
    showToast('Person details saved.');
    void goto(`/people/${person.id}`);
  }

  function discard(): void {
    dirty = false;
    leaveDialog.close();
    pendingNavigation?.();
  }

  function stay(): void {
    pendingNavigation = undefined;
    leaveDialog.close();
    form.focus();
  }

  onMount(() => {
    const unload = (event: BeforeUnloadEvent) => {
      if (!dirty) return;

      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', unload);

    return () => window.removeEventListener('beforeunload', unload);
  });

  beforeNavigate((navigation) => {
    if (!dirty || navigation.type === 'leave') return;

    navigation.cancel();
    pendingNavigation = () => {
      const destination = navigation.to?.url;

      void goto(
        destination
          ? `${destination.pathname}${destination.search}${destination.hash}`
          : `/people/${page.params.id}`
      );
    };
    leaveDialog.showModal();
  });
</script>

<svelte:head
  ><title>{person ? `Edit ${person.name} | Eglise` : 'Person not found | Eglise'}</title
  ></svelte:head
>

{#if person}
  <section class="page">
    <Breadcrumbs
      items={[
        { label: 'People & Membership', href: '/people' },
        { label: person.name, href: `/people/${person.id}` },
        { label: 'Edit person' }
      ]}
    />

    <header class="page-head">
      <div>
        <h1 tabindex="-1">Edit person</h1>
        <p class="page-intro">
          Update the contact details used to find this person in the directory.
        </p>
      </div>
    </header>

    <form
      class="panel person-entry-form"
      bind:this={form}
      on:submit|preventDefault={save}
      on:input={() => (dirty = true)}
      novalidate
    >
      {#if Object.keys(errors).length}
        <p class="error" role="alert">Please correct the highlighted fields.</p>
      {/if}
      <div class="person-entry-fields">
        <PersonDetailsFields
          bind:name
          bind:kind
          bind:phone
          bind:neighbourhood
          {errors}
          kindDisabled={true}
          kindHelp="Update this through the person's journey so each stage has a date and note."
          onchange={() => (dirty = true)}
        />
      </div>
      <div class="form-actions person-entry-actions">
        <a class="button secondary" href={`/people/${person.id}`}>
          <IconArrowLeft aria-hidden="true" size={18} stroke={1.8} />
          Cancel
        </a>
        <button class="button primary" type="submit">
          <IconDeviceFloppy aria-hidden="true" size={18} stroke={1.8} />
          Save changes
        </button>
      </div>
    </form>
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

<dialog bind:this={leaveDialog} aria-labelledby="leave-title">
  <form method="dialog">
    <p class="dialog-context">People &amp; Membership · Edit person</p>
    <h2 id="leave-title">Leave unsaved changes?</h2>
    <p>Your changes will be lost when the page refreshes.</p>
    <div class="dialog-actions">
      <button class="button secondary" type="button" on:click={stay}>
        <IconEdit aria-hidden="true" size={18} stroke={1.8} />
        Keep editing
      </button>
      <button class="button danger-button" type="button" on:click={discard}>
        <IconTrash aria-hidden="true" size={18} stroke={1.8} />
        Discard changes
      </button>
    </div>
  </form>
</dialog>
