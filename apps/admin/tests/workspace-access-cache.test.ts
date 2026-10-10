import { afterEach, describe, expect, it } from 'vitest';

import {
  cacheWorkspaceAccess,
  invalidateWorkspaceAccessForSession,
  invalidateWorkspaceAccessForUser,
  readWorkspaceAccess,
  resetWorkspaceAccessCacheForTests
} from '../src/lib/server/workspace-access-cache';

const workspace = {
  id: 'workspace-1',
  name: 'Grace Fellowship',
  role: 'people_editor' as const
};

afterEach(() => {
  resetWorkspaceAccessCacheForTests();
});

describe('workspace access cache', () => {
  it('returns a verified session entry until its 30-second lifetime ends', () => {
    cacheWorkspaceAccess('session-1', 'user-1', workspace, 1_000);

    expect(readWorkspaceAccess('session-1', 30_999)).toEqual(workspace);
    expect(readWorkspaceAccess('session-1', 31_000)).toBeNull();
  });

  it('removes a session immediately at logout', () => {
    cacheWorkspaceAccess('session-1', 'user-1', workspace, 1_000);

    invalidateWorkspaceAccessForSession('session-1');

    expect(readWorkspaceAccess('session-1', 1_001)).toBeNull();
  });

  it('removes every active session for a user after their access changes', () => {
    cacheWorkspaceAccess('session-1', 'user-1', workspace, 1_000);
    cacheWorkspaceAccess('session-2', 'user-1', workspace, 1_000);
    cacheWorkspaceAccess('session-3', 'user-2', workspace, 1_000);

    invalidateWorkspaceAccessForUser('user-1');

    expect(readWorkspaceAccess('session-1', 1_001)).toBeNull();
    expect(readWorkspaceAccess('session-2', 1_001)).toBeNull();
    expect(readWorkspaceAccess('session-3', 1_001)).toEqual(workspace);
  });
});
