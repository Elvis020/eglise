import { redirect, type Handle } from '@sveltejs/kit';
import { createSupabaseServerClient, isSupabaseAuthConfigured } from '$lib/server/supabase';

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

  if (event.locals.supabase) {
    const {
      data: { user }
    } = await event.locals.supabase.auth.getUser();

    event.locals.user = user;
  }

  if (isSupabaseAuthConfigured() && !event.locals.user && !isPublicAuthRoute(event.url.pathname)) {
    const destination = `${event.url.pathname}${event.url.search}`;

    throw redirect(303, `/login?next=${encodeURIComponent(destination)}`);
  }

  return resolve(event);
};
