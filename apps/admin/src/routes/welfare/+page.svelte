<script lang="ts">
  import { page } from '$app/state';
  import { onMount } from 'svelte';
  import { todayIso } from '$lib/calendar-period';
  import { people } from '$lib/people';
  import {
    welfareRecords,
    welfareCategories,
    welfareTotals,
    paymentStatus,
    money,
    markWelfarePaid,
    type WelfareCategory
  } from '$lib/welfare';
  import DirectoryPagination from '$lib/components/DirectoryPagination.svelte';
  import { clampPage, pageItems } from '$lib/directory';
  import EgliseDatePicker from '$lib/components/EgliseDatePicker.svelte';
  import { showToast } from '$lib/toast';

  const category = $derived(
    (welfareCategories.find((item) => item.value === page.url.searchParams.get('category'))
      ?.value ?? 'recurring-support') as WelfareCategory
  );
  const label = $derived(welfareCategories.find((item) => item.value === category)!.label);
  let query = $state('');
  let today = $state(todayIso());
  let paidOn = $state(todayIso());
  let error = $state('');
  let status = $state('all');
  const records = $derived($welfareRecords.filter((record) => record.category === category));
  const totals = $derived(welfareTotals(records, today));
  const rows = $derived(
    records
      .flatMap((record) =>
        record.payments.map((payment) => ({
          record,
          payment,
          person: $people.find((person) => person.id === record.personId),
          status: paymentStatus(payment, today)
        }))
      )
      .filter(
        (row) =>
          `${row.record.title} ${row.person?.name} ${row.person?.phone}`
            .toLowerCase()
            .includes(query.trim().toLowerCase()) &&
          (category !== 'recurring-support' || status === 'all' || row.status === status)
      )
      .sort((a, b) => a.payment.dueDate.localeCompare(b.payment.dueDate))
  );

  let currentPage = $state(1);
  const visibleRows = $derived(pageItems(rows, currentPage, 10));

  $effect(() => {
    void category;
    void query;
    void status;
    currentPage = 1;
  });

  $effect(() => {
    currentPage = clampPage(currentPage, rows.length, 10);
  });

  onMount(() => {
    const timer = window.setInterval(() => {
      today = todayIso();
    }, 30_000);

    return () => window.clearInterval(timer);
  });

  function markPaid(recordId: string, paymentId: string): void {
    error = '';
    if (!markWelfarePaid(recordId, paymentId, paidOn)) {
      error = 'Choose a valid payment date no later than today. This payment may already be paid.';

      return;
    }
    showToast('Support payment recorded.');
  }
</script>

<svelte:head><title>Welfare | Eglise</title></svelte:head>

<section class="page workflow-page">
  <header class="page-head">
    <div>
      <p class="eyebrow">Welfare</p>
      <h1 tabindex="-1">Support and contributions</h1>
      <p class="page-intro">Track support given and contributions received.</p>
    </div>
    <div class="workflow-actions">
      <a class="button secondary" href="/welfare/new?category=contributions">Add contribution</a><a
        class="button primary"
        href="/welfare/new">Add welfare</a
      >
    </div>
  </header>
  <p class="help">Prototype records are held for this session and reset on reload.</p>
  <div class="summary-grid" aria-label="Welfare totals">
    {#each welfareCategories as item}
      <a
        class="summary-card"
        class:selected={category === item.value}
        aria-current={category === item.value ? 'true' : undefined}
        href={`/welfare?category=${item.value}#welfare-records`}
      >
        <span>{item.label}</span><strong
          >{money(
            welfareTotals(
              $welfareRecords.filter((record) => record.category === item.value),
              today
            ).paid
          )}</strong
        ><small
          >{item.value === 'contributions' ? 'Received · View people' : 'Paid · View people'}</small
        >
      </a>
    {/each}
  </div>
  <section class="workflow-section" aria-labelledby="welfare-records">
    <h2 id="welfare-records" tabindex="-1">{label}</h2>
    {#if category === 'recurring-support'}
      <dl class="amount-breakdown">
        <div>
          <dt>Paid</dt>
          <dd>{money(totals.paid)}</dd>
        </div>
        <div>
          <dt>Outstanding · due but unpaid</dt>
          <dd>{money(totals.outstanding)}</dd>
        </div>
        <div>
          <dt>Upcoming · future payments</dt>
          <dd>{money(totals.upcoming)}</dd>
        </div>
      </dl>
    {/if}
    <div class="workflow-controls">
      <div class="field">
        <label for="welfare-search">Search {label.toLowerCase()}</label><input
          id="welfare-search"
          type="search"
          bind:value={query}
          placeholder="Person, phone or support name"
        />
      </div>
      {#if category === 'recurring-support'}
        <div class="field">
          <label for="payment-status">Payment status</label><select
            id="payment-status"
            bind:value={status}
            ><option value="all">All payments</option><option value="outstanding"
              >Outstanding</option
            ><option value="upcoming">Upcoming</option><option value="paid">Paid</option></select
          >
        </div>
        <div class="field">
          <label for="paid-date">Date to record when marking paid</label><EgliseDatePicker
            id="paid-date"
            bind:value={paidOn}
            autocomplete="off"
          />
        </div>
      {/if}
    </div>
    {#if error}<p class="error" role="alert">{error}</p>{/if}
    {#if rows.length}
      <table class="responsive-table">
        <caption class="sr-only">{label} by person and payment</caption><thead
          ><tr
            ><th scope="col">Person</th><th scope="col">Description</th><th scope="col"
              >Amount (GHS)</th
            ><th scope="col">{category === 'recurring-support' ? 'Due date' : 'Date'}</th><th
              scope="col">Payment</th
            ></tr
          ></thead
        ><tbody>
          {#each visibleRows as row (row.payment.id)}
            <tr
              ><th scope="row" data-label="Person"
                >{row.person?.name ?? 'Person record unavailable'}</th
              ><td data-label="Description"
                >{row.record.title}{#if row.record.note}<small>{row.record.note}</small>{/if}</td
              ><td data-label="Amount">{money(row.payment.amount)}</td><td data-label="Date"
                >{row.payment.dueDate}</td
              ><td data-label="Payment"
                ><div class="payment-cell">
                  {#if row.payment.paidOn}<span>Paid · {row.payment.paidOn}</span>{:else}<span
                      >{row.status === 'outstanding' ? 'Outstanding' : 'Upcoming'}</span
                    ><button
                      class="button secondary"
                      type="button"
                      aria-label={`Mark ${row.record.title} for ${row.person?.name} due ${row.payment.dueDate} paid`}
                      onclick={() => markPaid(row.record.id, row.payment.id)}>Mark paid</button
                    >{/if}
                </div></td
              ></tr
            >
          {/each}
        </tbody>
      </table>
      <DirectoryPagination bind:page={currentPage} pageSize={10} total={rows.length} />
    {:else}<p class="empty-state-copy">
        {records.length
          ? 'No payments match these filters.'
          : `No ${label.toLowerCase()} recorded yet.`}
      </p>{/if}
  </section>
</section>
