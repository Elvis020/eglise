import { writable } from 'svelte/store';

export type WelfareDiscoveryArea = 'contributions' | 'emergency-assistance' | 'recurring-support';

export type WelfareDiscoveryItem = {
  area: WelfareDiscoveryArea;
  decision: string;
  id: string;
  title: string;
};

export type NewWelfareDiscoveryItem = Omit<WelfareDiscoveryItem, 'id'>;

export const welfareDiscoveryAreas: Array<{ label: string; value: WelfareDiscoveryArea }> = [
  { value: 'contributions', label: 'Contributions received' },
  { value: 'recurring-support', label: 'Recurring support' },
  { value: 'emergency-assistance', label: 'Emergency assistance' }
];

export const welfareDiscoveryItems = writable<WelfareDiscoveryItem[]>([]);

function welfareDiscoveryItemId(title: string): string {
  const stem =
    title
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'welfare-discovery-item';

  return `${stem}-${Date.now().toString(36)}`;
}

export function addWelfareDiscoveryItem(item: NewWelfareDiscoveryItem): WelfareDiscoveryItem {
  const created = { ...item, id: welfareDiscoveryItemId(item.title) };

  welfareDiscoveryItems.update((records) => [created, ...records]);

  return created;
}

export function welfareDiscoveryAreaLabel(area: WelfareDiscoveryArea): string {
  return welfareDiscoveryAreas.find((option) => option.value === area)?.label ?? 'Discovery area';
}
