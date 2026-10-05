import { error, redirect, type Handle } from '@sveltejs/kit';
import { isWorkspaceRole } from '$lib/access';
import {
  createSupabaseServerClient,
  isAuthenticationConfigurationValid,
  isPrototypeAuthMode
} from '$lib/server/supabase';

function isPublicAuthRoute(pathname: string): boolean {
  return (
    pathname === '/login' ||
    pathname === '/signup' ||
    pathname.startsWith('/accept-invite') ||
    pathname.startsWith('/auth/')
  );
}

export const handle: Handle = async ({ event, resolve }) => {
  event.locals.supabase = createSupabaseServerClient(event);
  event.locals.user = null;
  event.locals.workspace = null;

  if (!isAuthenticationConfigurationValid()) {
    throw error(503, 'Authentication configuration is incomplete.');
  }

  if (event.locals.supabase) {
    const {
      data: { user }
    } = await event.locals.supabase.auth.getUser();

    event.locals.user = user;

    if (user) {
      const { data: membership, error: membershipError } = await event.locals.supabase
        .from('workspace_memberships')
        .select('role, workspace:workspaces(id, name)')
        .eq('user_id', user.id)
        .is('revoked_at', null)
        .maybeSingle();

      const workspace = Array.isArray(membership?.workspace)
        ? membership.workspace[0]
        : membership?.workspace;

      if (!membership || membershipError || !workspace || !isWorkspaceRole(membership.role)) {
        if (!isPublicAuthRoute(event.url.pathname)) {
          throw error(403, 'Your workspace access is not available.');
        }
      } else {
        event.locals.workspace = {
          id: workspace.id as string,
          name: workspace.name as string,
          role: membership.role
        };
      }
    }
  }

  if (!isPrototypeAuthMode() && !event.locals.user && !isPublicAuthRoute(event.url.pathname)) {
    const destination = `${event.url.pathname}${event.url.search}`;

    throw redirect(303, `/login?next=${encodeURIComponent(destination)}`);
  }

  return resolve(event);
};
