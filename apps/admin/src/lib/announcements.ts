import { writable } from 'svelte/store';

export type Announcement = {
  audience: 'church-community' | 'members' | 'staff';
  channel: 'telegram' | 'whatsapp' | 'both';
  id: string;
  summary: string;
  title: string;
};

export const announcements = writable<Announcement[]>([
  {
    audience: 'church-community',
    channel: 'both',
    id: 'sample-sunday-service',
    summary: 'A synthetic example for reviewing the workflow before real content is used.',
    title: 'Sunday service — sample notice'
  }
]);

export function addAnnouncement(input: Omit<Announcement, 'id'>): void {
  const stem =
    input.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'announcement';

  announcements.update((records) => [
    {
      ...input,
      id: `${stem}-${Date.now().toString(36)}`
    },
    ...records
  ]);
}
