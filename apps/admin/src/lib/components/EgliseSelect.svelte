<script lang="ts">
  import { tick } from 'svelte';

  export type EgliseSelectOption = {
    value: string;
    label: string;
  };

  let {
    id,
    value = $bindable(),
    options,
    disabled = false,
    onchange
  }: {
    id: string;
    value: string;
    options: EgliseSelectOption[];
    disabled?: boolean;
    onchange?: (value: string) => void;
  } = $props();

  let isOpen = $state(false);
  let activeIndex = $state(0);
  let button: HTMLButtonElement;
  let root: HTMLDivElement;

  let listboxId = $derived(`${id}-listbox`);

  function selectedIndex(): number {
    return Math.max(
      0,
      options.findIndex((option) => option.value === value)
    );
  }

  function optionId(index: number): string {
    return `${id}-option-${index}`;
  }

  function open(index = selectedIndex()): void {
    if (disabled) return;

    activeIndex = index;
    isOpen = true;
  }

  function close(restoreFocus = false): void {
    isOpen = false;

    if (restoreFocus) {
      void tick().then(() => button.focus());
    }
  }

  function choose(index: number, restoreFocus = true): void {
    value = options[index].value;
    activeIndex = index;
    onchange?.(value);
    close(restoreFocus);
  }

  function moveActive(delta: number): void {
    activeIndex = (activeIndex + delta + options.length) % options.length;
  }

  function handleKeydown(event: KeyboardEvent): void {
    if (disabled) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (isOpen) moveActive(1);
        else open(Math.min(selectedIndex() + 1, options.length - 1));
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (isOpen) moveActive(-1);
        else open(Math.max(selectedIndex() - 1, 0));
        break;
      case 'Home':
        event.preventDefault();
        if (!isOpen) open(0);
        else activeIndex = 0;
        break;
      case 'End':
        event.preventDefault();
        if (!isOpen) open(options.length - 1);
        else activeIndex = options.length - 1;
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (isOpen) choose(activeIndex);
        else open();
        break;
      case 'Escape':
        if (isOpen) {
          event.preventDefault();
          close(true);
        }
        break;
      case 'Tab':
        if (isOpen) choose(activeIndex, false);
        break;
    }
  }

  function handleBlur(): void {
    window.setTimeout(() => {
      if (!button.parentElement?.contains(document.activeElement)) {
        close();
      }
    });
  }

  function handleOptionKeydown(event: KeyboardEvent, index: number): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      choose(index);
    }
  }

  function handleWindowPointerdown(event: PointerEvent): void {
    if (isOpen && event.target instanceof Node && !root.contains(event.target)) {
      close();
    }
  }
</script>

<svelte:window onpointerdown={handleWindowPointerdown} />

<div bind:this={root} class="eglise-select">
  <button
    bind:this={button}
    aria-activedescendant={isOpen ? optionId(activeIndex) : undefined}
    aria-controls={listboxId}
    aria-expanded={isOpen}
    aria-haspopup="listbox"
    class="eglise-select-trigger"
    {disabled}
    {id}
    role="combobox"
    type="button"
    onblur={handleBlur}
    onkeydown={handleKeydown}
    onclick={() => (isOpen ? close() : open())}
  >
    <span>{options[selectedIndex()]?.label}</span>
    <span class="eglise-select-indicator" aria-hidden="true"></span>
  </button>

  {#if isOpen}
    <ul class="eglise-select-listbox" id={listboxId} role="listbox" aria-labelledby={id}>
      {#each options as option, index}
        <li
          aria-selected={option.value === value}
          class:active={index === activeIndex}
          class:selected={option.value === value}
          id={optionId(index)}
          role="option"
          tabindex="-1"
          onmousedown={(event) => event.preventDefault()}
          onkeydown={(event) => handleOptionKeydown(event, index)}
          onclick={() => choose(index)}
        >
          {option.label}
        </li>
      {/each}
    </ul>
  {/if}
</div>
