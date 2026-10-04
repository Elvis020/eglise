export const futureModules = [
  'Attendance',
  'Reports',
  'Welfare',
  'Bible Study',
  'Care School',
  'Resources',
  'Announcements'
];

export function moduleSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-');
}
