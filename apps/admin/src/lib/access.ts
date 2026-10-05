export const workspaceRoles = [
  'owner',
  'people_administrator',
  'people_editor',
  'people_viewer'
] as const;

export type WorkspaceRole = (typeof workspaceRoles)[number];

export type PeopleCapability = 'view' | 'edit' | 'manage_membership' | 'manage_records' | 'import';

const peopleCapabilities: Record<WorkspaceRole, readonly PeopleCapability[]> = {
  owner: ['view', 'edit', 'manage_membership', 'manage_records', 'import'],
  people_administrator: ['view', 'edit', 'manage_membership', 'manage_records', 'import'],
  people_editor: ['view', 'edit'],
  people_viewer: ['view']
};

export function isWorkspaceRole(value: string | null | undefined): value is WorkspaceRole {
  return workspaceRoles.includes(value as WorkspaceRole);
}

export function canManageWorkspaceAccess(role: WorkspaceRole): boolean {
  return role === 'owner' || role === 'people_administrator';
}

export function canUsePeopleCapability(role: WorkspaceRole, capability: PeopleCapability): boolean {
  return peopleCapabilities[role].includes(capability);
}
