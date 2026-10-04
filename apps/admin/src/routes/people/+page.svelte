<script lang="ts">
  import { goto } from '$app/navigation';
  import { onMount, tick } from 'svelte';

  import IconFileImport from '@tabler/icons-svelte-runes/icons/file-import';
  import IconUserPlus from '@tabler/icons-svelte-runes/icons/user-plus';

  import type { Person } from '$lib/domain';
  import { clampPage, DIRECTORY_PAGE_SIZE, pageItems } from '$lib/directory';
  import DirectoryPagination from '$lib/components/DirectoryPagination.svelte';
  import EgliseSelect, { type EgliseSelectOption } from '$lib/components/EgliseSelect.svelte';
  import PersonAvatar from '$lib/components/PersonAvatar.svelte';
  import { people } from '$lib/people';

  let query = '';
  let membership = 'all';
  let currentPage = 1;
  let pageSize = DIRECTORY_PAGE_SIZE;
  let directoryPage: HTMLElement;
  let directoryTable: HTMLTableElement;
  let importPrompt: HTMLElement;

  const membershipOptions: EgliseSelectOption[] = [
    { value: 'all', label: 'All people' },
    { value: 'true', label: 'Members' },
    { value: 'false', label: 'Not members' }
  ];

  function matches(person: Person, searchQuery: string, membershipValue: string): boolean {
    const searchable = `${person.name} ${person.phone} ${person.neighbourhood}`.toLowerCase();
    const membershipMatches =
      membershipValue === 'all' || String(person.membership.recognised) === membershipValue;

    return membershipMatches && searchable.includes(searchQuery.toLowerCase());
  }

  $: filteredPeople = $people.filter((person) => matches(person, query, membership));
  $: currentPage = clampPage(currentPage, filteredPeople.length, pageSize);
  $: pagedPeople = pageItems(filteredPeople, currentPage, pageSize);

  function resetPage(): void {
    currentPage = 1;
  }

  function openPerson(id: string): void {
    void goto(`/people/${id}`);
  }

  function handlePersonRowKeydown(event: KeyboardEvent, id: string): void {
    if (event.key !== 'Enter' && event.key !== ' ') return;

    event.preventDefault();
    openPerson(id);
  }

  function setPageSizePreservingFirstVisible(nextPageSize: number): void {
    if (nextPageSize === pageSize) return;

    const firstVisibleIndex = (currentPage - 1) * pageSize;

    pageSize = nextPageSize;
    currentPage = clampPage(
      Math.floor(firstVisibleIndex / pageSize) + 1,
      filteredPeople.length,
      pageSize
    );
  }

  onMount(() => {
    const desktopMediaQuery = window.matchMedia('(min-width: 961px)');
    let frame: number | undefined;

    const measurePageCapacity = (): void => {
      frame = undefined;

      if (!desktopMediaQuery.matches) {
        setPageSizePreservingFirstVisible(DIRECTORY_PAGE_SIZE);

        return;
      }

      const firstRow = directoryTable?.tBodies[0]?.rows[0];

      if (!firstRow || !importPrompt) return;

      const rowHeight = firstRow.getBoundingClientRect().height;

      if (rowHeight <= 0) return;

      const pagination = directoryPage.querySelector<HTMLElement>('.directory-pagination');

      if (!pagination) return;

      const footerBounds = importPrompt.getBoundingClientRect();
      const paginationBottom = pagination.getBoundingClientRect().bottom;
      const tablePanel = pagination.closest<HTMLElement>('.panel');
      const panelBottom = tablePanel?.getBoundingClientRect().bottom ?? paginationBottom;
      const panelMarginBottom = tablePanel
        ? Number.parseFloat(window.getComputedStyle(tablePanel).marginBottom)
        : 0;
      const flexibleFooterGap = footerBounds.top - panelBottom - panelMarginBottom;
      const availableRowChange = Math.floor(
        (footerBounds.bottom > window.innerHeight
          ? window.innerHeight - footerBounds.bottom
          : flexibleFooterGap) / rowHeight
      );
      const nextPageSize = Math.min(
        filteredPeople.length,
        Math.max(1, pageSize + availableRowChange)
      );

      setPageSizePreservingFirstVisible(nextPageSize);
    };

    const scheduleMeasurement = (): void => {
      if (frame !== undefined) cancelAnimationFrame(frame);

      frame = requestAnimationFrame(measurePageCapacity);
    };

    const resizeObserver = new ResizeObserver(scheduleMeasurement);

    resizeObserver.observe(directoryPage);
    window.addEventListener('resize', scheduleMeasurement);
    desktopMediaQuery.addEventListener('change', scheduleMeasurement);
    void tick().then(scheduleMeasurement);

    return () => {
      if (frame !== undefined) cancelAnimationFrame(frame);

      resizeObserver.disconnect();
      window.removeEventListener('resize', scheduleMeasurement);
      desktopMediaQuery.removeEventListener('change', scheduleMeasurement);
    };
  });
</script>

<svelte:head><title>People directory — Eglise</title></svelte:head>

<section bind:this={directoryPage} class="page directory-page">
  <header class="page-head">
    <div>
      <p class="eyebrow">People &amp; Membership</p>
      <h1 tabindex="-1">People directory</h1>
      <p class="page-intro">
        A fictional directory for testing the People &amp; Membership workflow.
      </p>
    </div>
    <a class="button primary" href="/people/add">
      <IconUserPlus aria-hidden="true" size={18} stroke={1.8} />
      Add person
    </a>
  </header>

  <div class="panel">
    <div class="controls">
      <div class="field">
        <label for="directory-search">Search people</label>
        <input
          id="directory-search"
          type="search"
          bind:value={query}
          oninput={resetPage}
          placeholder="Name, phone, or neighbourhood"
        />
      </div>
      <div class="field membership-field">
        <label for="membership-filter">Membership</label>
        <EgliseSelect
          id="membership-filter"
          bind:value={membership}
          onchange={resetPage}
          options={membershipOptions}
        />
      </div>
    </div>

    {#if filteredPeople.length}
      <div class="table-wrap">
        <table bind:this={directoryTable} class="directory people-directory">
          <colgroup>
            <col class="person-column" />
            <col class="phone-column" />
            <col class="neighbourhood-column" />
            <col class="membership-column" />
          </colgroup>
          <thead
            ><tr
              ><th scope="col">Person</th><th scope="col">Phone</th><th scope="col"
                >Neighbourhood</th
              ><th scope="col">Membership</th></tr
            ></thead
          >
          <tbody>
            {#each pagedPeople as person}
              <tr
                class="person-row"
                role="link"
                tabindex="0"
                aria-label={`Open ${person.name}`}
                onclick={() => openPerson(person.id)}
                onkeydown={(event) => handlePersonRowKeydown(event, person.id)}
              >
                <td data-label="Person">
                  <div class="person-identity">
                    <PersonAvatar />
                    <span class="person-name">{person.name}</span>
                  </div>
                </td>
                <td class="directory-metadata" data-label="Phone">{person.phone}</td>
                <td class="directory-metadata" data-label="Neighbourhood">{person.neighbourhood}</td
                >
                <td data-label="Membership">
                  <span class="membership-label">
                    {person.membership.recognised ? 'Member' : 'Not a member'}
                  </span>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
      <DirectoryPagination bind:page={currentPage} {pageSize} total={filteredPeople.length} />
    {:else}
      <p class="empty">
        No people match this search. Try another term or <a href="/people/add"
          >add a fictional person</a
        >.
      </p>
    {/if}
  </div>

  <div bind:this={importPrompt} class="panel import-prompt">
    <div>
      <h2>Bring in a fictional sample</h2>
      <p class="muted">
        Review a fixed example first. This prototype does not read files or create attendance
        records.
      </p>
    </div>
    <a class="button secondary" href="/people/import">
      <IconFileImport aria-hidden="true" size={18} stroke={1.8} />
      Review sample import
    </a>
  </div>
</section>
