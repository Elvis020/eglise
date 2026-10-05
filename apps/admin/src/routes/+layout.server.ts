import type { LayoutServerLoad } from './$types';
import { isSupabaseAuthConfigured } from '$lib/server/supabase';

export const load: LayoutServerLoad = async ({ locals }) => {
  if (!isSupabaseAuthConfigured()) {
    return { authMode: 'prototype' as const, user: null, workspace: null };
  }

  if (!locals.user || !locals.supabase) {
    return { authMode: 'supabase' as const, user: null, workspace: null };
  }

  const { data: membership } = await locals.supabase
    .from('workspace_memberships')
    .select('role, workspace:workspaces(id, name)')
    .eq('user_id', locals.user.id)
    .is('revoked_at', null)
    .maybeSingle();

  const workspace = Array.isArray(membership?.workspace)
    ? membership.workspace[0]
    : membership?.workspace;

  return {
    authMode: 'supabase' as const,
    user: {
      email: locals.user.email ?? '',
      id: locals.user.id,
      name:
        typeof locals.user.user_metadata.full_name === 'string'
          ? locals.user.user_metadata.full_name
          : ''
    },
    workspace: workspace
      ? {
          id: workspace.id as string,
          name: workspace.name as string,
          role: membership?.role as string
        }
      : null
  };
};
