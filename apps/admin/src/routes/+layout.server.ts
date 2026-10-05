import type { LayoutServerLoad } from './$types';
import { isPrototypeAuthMode } from '$lib/server/supabase';

export const load: LayoutServerLoad = async ({ locals }) => {
  if (isPrototypeAuthMode()) {
    return { authMode: 'prototype' as const, user: null, workspace: null };
  }

  if (!locals.user || !locals.workspace) {
    return { authMode: 'supabase' as const, user: null, workspace: null };
  }

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
    workspace: locals.workspace
  };
};
