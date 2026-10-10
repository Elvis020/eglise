import { writable } from 'svelte/store';

export type ResourceKind = 'church-note' | 'sermon-audio' | 'telegram-link';

export type Resource = {
  id: string;
  kind: ResourceKind;
  note: string;
  title: string;
  url: string;
};

export type NewResource = Omit<Resource, 'id'>;

export const resourceKinds: Array<{ label: string; value: ResourceKind }> = [
  { value: 'church-note', label: 'Church note' },
  { value: 'sermon-audio', label: 'Sermon audio' },
  { value: 'telegram-link', label: 'Telegram link' }
];

export const resources = writable<Resource[]>([]);

function resourceId(title: string): string {
  const stem =
    title
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'resource';

  return `${stem}-${Date.now().toString(36)}`;
}

export function addResource(resource: NewResource): Resource {
  const created = { ...resource, id: resourceId(resource.title) };

  resources.update((records) => [created, ...records]);

  return created;
}

export function resourceKindLabel(kind: ResourceKind): string {
  return resourceKinds.find((option) => option.value === kind)?.label ?? 'Resource';
}
