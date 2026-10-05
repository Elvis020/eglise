import { fail, redirect } from '@sveltejs/kit';
import { safeNextPath } from '$lib/server/navigation';
import { isPrototypeAuthMode } from '$lib/server/supabase';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ url }) => ({
  authMode: isPrototypeAuthMode() ? ('prototype' as const) : ('supabase' as const),
  next: safeNextPath(url.searchParams.get('next'))
});

export const actions: Actions = {
  default: async ({ locals, request }) => {
    if (!locals.supabase) {
      return fail(503, { error: 'Sign-in is not configured yet.' });
    }

    const formData = await request.formData();
    const email = String(formData.get('email') ?? '')
      .trim()
      .toLocaleLowerCase();
    const password = String(formData.get('password') ?? '');
    const next = safeNextPath(String(formData.get('next') ?? ''));

    if (!/^\S+@\S+\.\S+$/.test(email) || !password) {
      return fail(400, { error: 'Enter your email address and password.' });
    }

    const { error: signInError } = await locals.supabase.auth.signInWithPassword({
      email,
      password
    });

    if (signInError) {
      return fail(400, { error: 'We could not sign you in with those details.' });
    }

    throw redirect(303, next);
  }
};
