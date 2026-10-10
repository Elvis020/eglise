import { error, redirect, type Handle } from '@sveltejs/kit';
import { isWorkspaceRole } from '$lib/access';
import {
  createSupabaseServerClient,
  isAuthenticationConfigurationValid,
  isPrototypeAuthMode
} from '$lib/server/supabase';
import { cacheWorkspaceAccess, readWorkspaceAccess } from '$lib/server/workspace-access-cache';

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
  event.locals.sessionId = null;
  event.locals.user = null;
  event.locals.workspace = null;

  if (!isAuthenticationConfigurationValid()) {
    throw error(503, 'Authentication configuration is incomplete.');
  }

  if (event.locals.supabase) {
    const { data: claimData } = await event.locals.supabase.auth.getClaims();
    const claims = claimData?.claims;
    const userId = typeof claims?.sub === 'string' ? claims.sub : null;
    const sessionId = typeof claims?.session_id === 'string' ? claims.session_id : null;

    if (claims && userId && sessionId) {
      event.locals.sessionId = sessionId;
      const cachedAccess = readWorkspaceAccess(sessionId);

      if (cachedAccess) {
        event.locals.user = {
          email: typeof claims.email === 'string' ? claims.email : null,
          id: userId,
          user_metadata:
            claims.user_metadata && typeof claims.user_metadata === 'object'
              ? claims.user_metadata
              : {}
        };
        event.locals.workspace = cachedAccess;
      } else {
        const {
          data: { user }
        } = await event.locals.supabase.auth.getUser();

        if (!user || user.id !== userId) {
          event.locals.sessionId = null;
        } else {
          event.locals.user = {
            email: user.email ?? null,
            id: user.id,
            user_metadata: user.user_metadata
          };

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
            cacheWorkspaceAccess(sessionId, user.id, event.locals.workspace);
          }
        }
      }
    }
  }

  if (!isPrototypeAuthMode() && !event.locals.user && !isPublicAuthRoute(event.url.pathname)) {
    const destination = `${event.url.pathname}${event.url.search}`;

    throw redirect(303, `/login?next=${encodeURIComponent(destination)}`);
  }

  return resolve(event);
};
