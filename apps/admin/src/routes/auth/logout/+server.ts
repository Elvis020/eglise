import { json, type RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ locals }) => {
  if (!locals.supabase) {
    return json({ error: 'Sign-out is not configured.' }, { status: 503 });
  }

  const { error } = await locals.supabase.auth.signOut();

  if (error) {
    return json({ error: 'We could not sign you out. Please try again.' }, { status: 500 });
  }

  return json({ ok: true });
};
