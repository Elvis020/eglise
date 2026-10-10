import { writable } from 'svelte/store';

export type StudyMaterialFormat = 'discussion-prompts' | 'existing-link' | 'study-outline';

export type StudyMaterial = {
  format: StudyMaterialFormat;
  id: string;
  source: string;
  title: string;
};

export type NewStudyMaterial = Omit<StudyMaterial, 'id'>;

export const studyMaterialFormats: Array<{ label: string; value: StudyMaterialFormat }> = [
  { value: 'study-outline', label: 'Study outline' },
  { value: 'discussion-prompts', label: 'Discussion prompts' },
  { value: 'existing-link', label: 'Existing link' }
];

export const studyMaterials = writable<StudyMaterial[]>([]);

function studyMaterialId(title: string): string {
  const stem =
    title
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'study-material';

  return `${stem}-${Date.now().toString(36)}`;
}

export function addStudyMaterial(material: NewStudyMaterial): StudyMaterial {
  const created = { ...material, id: studyMaterialId(material.title) };

  studyMaterials.update((records) => [created, ...records]);

  return created;
}

export function studyMaterialFormatLabel(format: StudyMaterialFormat): string {
  return studyMaterialFormats.find((option) => option.value === format)?.label ?? 'Material';
}
