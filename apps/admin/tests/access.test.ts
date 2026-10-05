import { describe, expect, it } from 'vitest';

import {
  canManageWorkspaceAccess,
  canUsePeopleCapability,
  workspaceRoles
} from '../src/lib/access';

describe('workspace access policy', () => {
  it('limits workspace settings to owners and people administrators', () => {
    expect(canManageWorkspaceAccess('owner')).toBe(true);
    expect(canManageWorkspaceAccess('people_administrator')).toBe(true);
    expect(canManageWorkspaceAccess('people_editor')).toBe(false);
    expect(canManageWorkspaceAccess('people_viewer')).toBe(false);
  });

  it('assigns only the intended People capabilities to each role', () => {
    expect(workspaceRoles).toEqual([
      'owner',
      'people_administrator',
      'people_editor',
      'people_viewer'
    ]);
    expect(canUsePeopleCapability('people_editor', 'edit')).toBe(true);
    expect(canUsePeopleCapability('people_editor', 'import')).toBe(false);
    expect(canUsePeopleCapability('people_viewer', 'view')).toBe(true);
    expect(canUsePeopleCapability('people_viewer', 'edit')).toBe(false);
  });
});
