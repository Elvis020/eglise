import { toast } from 'svelte-sonner';

export function showToast(message: string): void {
  toast.success(message, { duration: 4000, id: 'app-feedback' });
}
