import type { WorkspaceRole } from '$lib/access';

type WorkspaceAccess = {
  id: string;
  name: string;
  role: WorkspaceRole;
};

type CacheEntry = {
  access: WorkspaceAccess;
  expiresAt: number;
  userId: string;
};

const cacheLifetimeMs = 30_000;
const maxEntries = 500;
const entries = new Map<string, CacheEntry>();

function removeExpiredEntries(now: number): void {
  for (const [sessionId, entry] of entries) {
    if (entry.expiresAt <= now) entries.delete(sessionId);
  }
}

function removeOldestEntry(): void {
  const oldestSessionId = entries.keys().next().value;

  if (typeof oldestSessionId === 'string') entries.delete(oldestSessionId);
}

export function readWorkspaceAccess(sessionId: string, now = Date.now()): WorkspaceAccess | null {
  const entry = entries.get(sessionId);

  if (!entry) return null;

  if (entry.expiresAt <= now) {
    entries.delete(sessionId);

    return null;
  }

  return entry.access;
}

export function cacheWorkspaceAccess(
  sessionId: string,
  userId: string,
  access: WorkspaceAccess,
  now = Date.now()
): void {
  removeExpiredEntries(now);

  if (!entries.has(sessionId) && entries.size >= maxEntries) removeOldestEntry();

  entries.set(sessionId, {
    access,
    expiresAt: now + cacheLifetimeMs,
    userId
  });
}

export function invalidateWorkspaceAccessForSession(sessionId: string): void {
  entries.delete(sessionId);
}

export function invalidateWorkspaceAccessForUser(userId: string): void {
  for (const [sessionId, entry] of entries) {
    if (entry.userId === userId) entries.delete(sessionId);
  }
}

export function resetWorkspaceAccessCacheForTests(): void {
  entries.clear();
}
