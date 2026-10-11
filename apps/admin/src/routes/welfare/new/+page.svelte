<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import { beforeNavigate } from '$app/navigation';
  import { useAppShellContext } from '$lib/app-shell-context';
  import { onDestroy } from 'svelte';
  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
  import EgliseDatePicker from '$lib/components/EgliseDatePicker.svelte';
  import PersonPicker from '$lib/components/PersonPicker.svelte';
  import { todayIso } from '$lib/calendar-period';
  import {
    addWelfareRecord,
    parseAmount,
    type WelfareCategory,
    type Recurrence
  } from '$lib/welfare';
  import { showToast } from '$lib/toast';

  let category = $state<WelfareCategory>(
    page.url.searchParams.get('category') === 'contributions'
      ? 'contributions'
      : 'recurring-support'
  );
  let personId = $state('');
  let title = $state('');
  let amount = $state('');
  let note = $state('');
  let startDate = $state(todayIso());
  let endDate = $state('');
  let recurrence = $state<Recurrence>('monthly');
  let error = $state('');
  let dirty = $state(false);

  let leaveDialog: HTMLDialogElement;
  let pendingNavigation: (() => void) | undefined;
  const appShell = useAppShellContext();
  const unregister = appShell.registerLogoutGuard((continueLogout) => {
    if (!dirty) return false;

    pendingNavigation = () => {
      void continueLogout();
    };
    leaveDialog.showModal();

    return true;
  });

  onDestroy(unregister);

  beforeNavigate((navigation) => {
    if (!dirty) return;
    if (navigation.type === 'leave') {
      navigation.cancel();

      return;
    }
    navigation.cancel();
    const destination = navigation.to?.url;

    pendingNavigation = () => {
      if (navigation.type === 'popstate' && navigation.delta) window.history.go(navigation.delta);
      else if (destination)
        void goto(`${destination.pathname}${destination.search}${destination.hash}`);
    };
    leaveDialog.showModal();
  });

  function discard(): void {
    dirty = false;
    leaveDialog.close();
    pendingNavigation?.();
  }

  function save(): void {
    error = '';
    try {
      addWelfareRecord({
        category,
        personId,
        title,
        amount: parseAmount(amount),
        note,
        startDate,
        endDate: category === 'recurring-support' ? endDate : startDate,
        recurrence: category === 'recurring-support' ? recurrence : null
      });
      dirty = false;
      showToast(category === 'contributions' ? 'Contribution recorded.' : 'Welfare support added.');
      void goto(`/welfare?category=${category}`);
    } catch (cause) {
      error = cause instanceof Error ? cause.message : 'Unable to save. Please check the form.';
    }
  }
</script>

<svelte:head
  ><title>{category === 'contributions' ? 'Add contribution' : 'Add welfare'} | Eglise</title
  ></svelte:head
>

<section class="page workflow-entry">
  <Breadcrumbs items={[{ label: 'Welfare', href: '/welfare' }]} />
  <header class="page-head">
    <div>
      <h1 tabindex="-1">{category === 'contributions' ? 'Add contribution' : 'Add welfare'}</h1>
      <p class="page-intro">
        {category === 'contributions'
          ? 'Record a contribution received from a person.'
          : 'Record emergency assistance or schedule recurring support.'}
      </p>
    </div>
  </header>
  <form
    class="panel workflow-form"
    novalidate
    oninput={() => (dirty = true)}
    onsubmit={(event) => {
      event.preventDefault();
      save();
    }}
  >
    <p class="help">Prototype records are held for this session and reset on reload.</p>
    {#if error}<p class="error" role="alert">{error}</p>{/if}
    {#if category !== 'contributions'}
      <div class="field">
        <label for="support-category">Support type</label><select
          id="support-category"
          bind:value={category}
          ><option value="recurring-support">Recurring support</option><option
            value="emergency-assistance">Emergency assistance</option
          ></select
        >
      </div>
    {/if}
    <PersonPicker bind:value={personId} />
    <div class="workflow-fields">
      <div class="field">
        <label for="welfare-title"
          >{category === 'contributions' ? 'Contribution description' : 'Support name'}</label
        ><input id="welfare-title" bind:value={title} required maxlength="160" />
      </div>
      <div class="field">
        <label for="welfare-amount"
          >Amount (GHS){category === 'recurring-support' ? ' per payment' : ''}</label
        ><input
          id="welfare-amount"
          bind:value={amount}
          inputmode="decimal"
          required
          placeholder="0.00"
        />
      </div>
      <div class="field">
        <label for="support-start"
          >{category === 'recurring-support' ? 'First payment due' : 'Payment date'}</label
        ><EgliseDatePicker
          id="support-start"
          bind:value={startDate}
          onchange={() => (dirty = true)}
          allowFuture={category === 'recurring-support'}
          autocomplete="off"
        />
      </div>
      {#if category === 'recurring-support'}
        <div class="field">
          <label for="support-frequency">Repeat</label><select
            id="support-frequency"
            bind:value={recurrence}
            ><option value="weekly">Weekly</option><option value="monthly">Monthly</option></select
          >
        </div>
        <div class="field">
          <label for="support-end">Schedule end date</label><EgliseDatePicker
            id="support-end"
            bind:value={endDate}
            onchange={() => (dirty = true)}
            allowFuture
            autocomplete="off"
          />
          <p class="help">
            Monthly payments use the same day, or the month's last day when shorter. Mark individual
            payments paid from the register.
          </p>
        </div>
      {/if}
      <div class="field">
        <label for="welfare-note">Notes (optional)</label><textarea
          id="welfare-note"
          bind:value={note}
          rows="3"
          maxlength="1000"
        ></textarea>
      </div>
    </div>
    <div class="form-actions">
      <a class="button secondary" href="/welfare">Cancel</a><button
        class="button primary"
        type="submit">{category === 'contributions' ? 'Save contribution' : 'Save welfare'}</button
      >
    </div>
  </form>
</section>

<dialog bind:this={leaveDialog} aria-labelledby="welfare-leave-title" class="confirm-dialog">
  <h2 id="welfare-leave-title">Leave without saving?</h2>
  <p>Your unsaved welfare record will be discarded.</p>
  <div class="dialog-actions">
    <button class="button secondary" type="button" onclick={() => leaveDialog.close()}
      >Keep editing</button
    >
    <button class="button danger" type="button" onclick={discard}>Discard changes</button>
  </div>
</dialog>
