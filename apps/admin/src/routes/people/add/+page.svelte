<script lang="ts">
  import { beforeNavigate, goto } from '$app/navigation';
  import { onDestroy, onMount, tick } from 'svelte';
  import IconArrowLeft from '@tabler/icons-svelte-runes/icons/arrow-left';
  import IconDeviceFloppy from '@tabler/icons-svelte-runes/icons/device-floppy';
  import IconEdit from '@tabler/icons-svelte-runes/icons/edit';
  import IconTrash from '@tabler/icons-svelte-runes/icons/trash';

  import {
    createPerson,
    type PersonKind,
    type PersonDetailsErrors,
    validatePersonDetails
  } from '$lib/domain';
  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
  import { useAppShellContext } from '$lib/app-shell-context';
  import PersonDetailsFields from '$lib/components/PersonDetailsFields.svelte';
  import { addPerson } from '$lib/people';
  import { showToast } from '$lib/toast';

  let form: HTMLFormElement;
  let leaveDialog: HTMLDialogElement;
  let mobileLeaveSheet: HTMLDialogElement;
  let dirty = false;
  let mobileLeaveSheetOpen = false;
  let pendingNavigation: (() => void) | undefined;
  let name = '';
  let kind: PersonKind = 'person';
  let phone = '';
  let neighbourhood = '';
  let errors: PersonDetailsErrors = {};

  const appShell = useAppShellContext();

  function validate(): boolean {
    errors = {};

    errors = validatePersonDetails({ name, kind, phone, neighbourhood });

    return Object.keys(errors).length === 0;
  }

  function submit(): void {
    if (!validate()) {
      const firstError = Object.keys(errors)[0];

      document.getElementById(firstError)?.focus();

      return;
    }

    addPerson(createPerson(name, phone, neighbourhood, kind));
    dirty = false;
    showToast('Person saved.');
    void goto('/people');
  }

  function discard(): void {
    dirty = false;
    closeLeaveConfirmation();
    pendingNavigation?.();
  }

  function stay(): void {
    pendingNavigation = undefined;
    closeLeaveConfirmation();
    form.focus();
  }

  function openLeaveConfirmation(): void {
    if (window.matchMedia('(max-width: 640px)').matches) {
      mobileLeaveSheetOpen = true;
      void tick().then(() => mobileLeaveSheet?.querySelector<HTMLButtonElement>('button')?.focus());

      return;
    }

    leaveDialog.showModal();
  }

  function closeLeaveConfirmation(): void {
    if (mobileLeaveSheetOpen) {
      mobileLeaveSheetOpen = false;

      return;
    }

    leaveDialog.close();
  }

  function handleMobileLeaveSheetKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      stay();

      return;
    }

    if (event.key !== 'Tab') return;

    const buttons = Array.from(mobileLeaveSheet.querySelectorAll<HTMLButtonElement>('button'));
    const firstButton = buttons[0];
    const lastButton = buttons[buttons.length - 1];

    if (!firstButton || !lastButton) return;

    if (event.shiftKey && document.activeElement === firstButton) {
      event.preventDefault();
      lastButton.focus();
    } else if (!event.shiftKey && document.activeElement === lastButton) {
      event.preventDefault();
      firstButton.focus();
    }
  }

  function handleLogoutRequest(continueLogout: () => Promise<void>): boolean {
    if (!dirty) return false;

    pendingNavigation = () => {
      void continueLogout();
    };
    openLeaveConfirmation();

    return true;
  }

  const unregisterLogoutGuard = appShell.registerLogoutGuard(handleLogoutRequest);

  onDestroy(unregisterLogoutGuard);

  onMount(() => {
    const unload = (event: BeforeUnloadEvent) => {
      if (!dirty) return;

      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', unload);

    return () => {
      window.removeEventListener('beforeunload', unload);
    };
  });

  beforeNavigate((navigation) => {
    if (!dirty || navigation.type === 'leave') return;

    navigation.cancel();
    pendingNavigation = () => {
      const destination = navigation.to?.url;

      void goto(
        destination ? `${destination.pathname}${destination.search}${destination.hash}` : '/people'
      );
    };
    openLeaveConfirmation();
  });
</script>

<svelte:head><title>Add a person | Eglise</title></svelte:head>

<section class="page">
  <Breadcrumbs items={[{ label: 'People & Membership', href: '/people' }]} />

  <header class="page-head">
    <div>
      <h1 tabindex="-1">Add a person</h1>
      <p class="page-intro">Create a person record for the church directory.</p>
    </div>
  </header>

  <form
    class="panel person-entry-form"
    bind:this={form}
    on:submit|preventDefault={submit}
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
        onchange={() => (dirty = true)}
      />
    </div>
    <div class="form-actions person-entry-actions">
      <a class="button secondary" href="/people">
        <IconArrowLeft aria-hidden="true" size={18} stroke={1.8} />
        Cancel
      </a><button class="button primary" type="submit">
        <IconDeviceFloppy aria-hidden="true" size={18} stroke={1.8} />
        Save person
      </button>
    </div>
  </form>
</section>

<dialog bind:this={leaveDialog} aria-labelledby="leave-title">
  <form method="dialog">
    <p class="dialog-context">People &amp; Membership · Add a person</p>
    <h2 id="leave-title">Leave unsaved entry?</h2>
    <p>Your entry will be lost when the page refreshes. It is not stored anywhere.</p>
    <div class="dialog-actions">
      <button class="button secondary" type="button" on:click={stay}>
        <IconEdit aria-hidden="true" size={18} stroke={1.8} />
        Keep editing
      </button><button class="button danger-button" type="button" on:click={discard}>
        <IconTrash aria-hidden="true" size={18} stroke={1.8} />
        Discard entry
      </button>
    </div>
  </form>
</dialog>

{#if mobileLeaveSheetOpen}
  <div class="mobile-leave-sheet-layer">
    <dialog
      bind:this={mobileLeaveSheet}
      aria-labelledby="mobile-leave-title"
      aria-modal="true"
      class="mobile-leave-sheet"
      open
      tabindex="-1"
      on:keydown={handleMobileLeaveSheetKeydown}
    >
      <p class="dialog-context">People &amp; Membership · Add a person</p>
      <h2 id="mobile-leave-title">Leave unsaved entry?</h2>
      <p>Your entry will be lost when the page refreshes. It is not stored anywhere.</p>
      <div class="dialog-actions">
        <button class="button secondary" type="button" on:click={stay}>
          <IconEdit aria-hidden="true" size={18} stroke={1.8} />
          Keep editing
        </button><button class="button danger-button" type="button" on:click={discard}>
          <IconTrash aria-hidden="true" size={18} stroke={1.8} />
          Discard entry
        </button>
      </div>
    </dialog>
  </div>
{/if}

<style>
  .mobile-leave-sheet-layer {
    position: fixed;
    z-index: 30;
    inset: 0;
    background: #24271f80;
  }

  .mobile-leave-sheet {
    position: absolute;
    right: 0;
    bottom: 0;
    left: 0;
    max-height: min(84dvh, calc(100dvh - env(safe-area-inset-top)));
    margin: 0;
    overflow-y: auto;
    padding: 20px 16px calc(20px + env(safe-area-inset-bottom));
    border: 1px solid var(--border);
    border-bottom: 0;
    border-radius: 16px 16px 0 0;
    color: var(--text-primary);
    background: var(--surface-raised);
    box-shadow: 0 -8px 24px rgb(36 39 31 / 12%);
  }

  .mobile-leave-sheet h2 {
    margin: 0;
    font: 400 28px var(--font-display);
  }

  .mobile-leave-sheet p:not(.dialog-context) {
    color: var(--text-secondary);
  }

  @media (min-width: 641px) {
    .mobile-leave-sheet-layer {
      display: none;
    }
  }
</style>
