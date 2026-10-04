import { toast } from 'svelte-sonner';

export function showToast(message: string): void {
  toast.success(message, { id: 'app-feedback' });
}
