import { toast } from 'svelte-sonner';

export function showToast(message: string): void {
  toast.success(message, { duration: 4000, id: 'app-feedback' });
}

export function showErrorToast(message: string): void {
  toast.error(message, { duration: 5000, id: 'app-feedback' });
}
