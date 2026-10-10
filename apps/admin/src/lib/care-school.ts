import { writable } from 'svelte/store';

export type CareSchoolTopic = {
  id: string;
  nextStep: string;
  title: string;
};

export type NewCareSchoolTopic = Omit<CareSchoolTopic, 'id'>;

export const careSchoolTopics = writable<CareSchoolTopic[]>([]);

function careSchoolTopicId(title: string): string {
  const stem =
    title
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'care-school-topic';

  return `${stem}-${Date.now().toString(36)}`;
}

export function addCareSchoolTopic(topic: NewCareSchoolTopic): CareSchoolTopic {
  const created = { ...topic, id: careSchoolTopicId(topic.title) };

  careSchoolTopics.update((records) => [created, ...records]);

  return created;
}
