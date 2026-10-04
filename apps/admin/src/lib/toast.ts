import { writable } from 'svelte/store';

export const toast = writable('');

let timer: ReturnType<typeof setTimeout> | undefined;

export function showToast(message: string): void {
  toast.set(message);

  if (timer) clearTimeout(timer);

  timer = setTimeout(() => toast.set(''), 5000);
}
