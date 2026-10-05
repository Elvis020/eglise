import { error, redirect } from '@sveltejs/kit';
import { canUsePeopleCapability, type PeopleCapability, type WorkspaceRole } from '$lib/access';
import type { LayoutServerLoad } from './$types';

function requiredCapability(pathname: string): PeopleCapability | null {
  if (pathname === '/people/add' || pathname.endsWith('/edit') || pathname.endsWith('/journey')) {
    return 'edit';
  }

  if (pathname === '/people/import') return 'import';
  if (pathname.endsWith('/membership')) return 'manage_membership';
  if (pathname.endsWith('/record')) return 'manage_records';

  return null;
}

export const load: LayoutServerLoad = async ({ parent, url }) => {
  const parentData = await parent();

  if (parentData.authMode === 'prototype') {
    return {
      peopleAccess: {
        canEdit: true,
        canImport: true,
        canManageMembership: true,
        canManageRecords: true,
        role: 'owner' as const,
        storage: 'prototype' as const
      }
    };
  }

  const role = parentData.workspace?.role as WorkspaceRole | undefined;

  if (!role) {
    throw error(403, 'Your workspace access is not available.');
  }

  const capability = requiredCapability(url.pathname);

  if (capability && !canUsePeopleCapability(role, capability)) {
    throw redirect(303, '/people');
  }

  return {
    peopleAccess: {
      canEdit: canUsePeopleCapability(role, 'edit'),
      canImport: canUsePeopleCapability(role, 'import'),
      canManageMembership: canUsePeopleCapability(role, 'manage_membership'),
      canManageRecords: canUsePeopleCapability(role, 'manage_records'),
      role,
      storage: 'synthetic-preview' as const
    }
  };
};
