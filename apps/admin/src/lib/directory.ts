export const DIRECTORY_PAGE_SIZE = 10;

export function pageCount(total: number, pageSize: number): number {
  return Math.max(1, Math.ceil(total / pageSize));
}

export function clampPage(page: number, total: number, pageSize: number): number {
  return Math.min(Math.max(1, page), pageCount(total, pageSize));
}

export function pageItems<T>(items: T[], page: number, pageSize: number): T[] {
  const currentPage = clampPage(page, items.length, pageSize);
  const start = (currentPage - 1) * pageSize;

  return items.slice(start, start + pageSize);
}

export function pageSummary(total: number, page: number, pageSize: number): string {
  if (total === 0) return 'No records';

  const currentPage = clampPage(page, total, pageSize);
  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(total, currentPage * pageSize);

  return `${start}–${end} of ${total}`;
}
