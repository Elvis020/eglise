import { json, type RequestHandler } from '@sveltejs/kit';
import { invalidateWorkspaceAccessForSession } from '$lib/server/workspace-access-cache';

export const POST: RequestHandler = async ({ locals }) => {
  if (!locals.supabase) {
    return json({ error: 'Sign-out is not configured.' }, { status: 503 });
  }

  const { error } = await locals.supabase.auth.signOut();

  if (error) {
    return json({ error: 'We could not sign you out. Please try again.' }, { status: 500 });
  }

  if (locals.sessionId) invalidateWorkspaceAccessForSession(locals.sessionId);

  return json({ ok: true });
};
