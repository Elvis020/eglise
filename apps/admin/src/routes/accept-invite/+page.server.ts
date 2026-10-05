import { fail, redirect } from '@sveltejs/kit';
import { acceptManualInvite, normaliseEmail, normaliseFullName } from '$lib/server/manual-invites';
import { isSupabaseAuthConfigured } from '$lib/server/supabase';
import type { Actions, PageServerLoad } from './$types';

function validToken(value: string): boolean {
  return /^[A-Za-z0-9_-]{40,}$/.test(value);
}

export const load: PageServerLoad = ({ url }) => ({
  authConfigured: isSupabaseAuthConfigured(),
  token: url.searchParams.get('token') ?? ''
});

export const actions: Actions = {
  default: async ({ locals, request, url }) => {
    const formData = await request.formData();
    const token = String(formData.get('token') ?? '');
    const fullName = normaliseFullName(String(formData.get('fullName') ?? ''));
    const email = normaliseEmail(String(formData.get('email') ?? ''));
    const password = String(formData.get('password') ?? '');

    if (!validToken(token)) {
      return fail(400, { error: 'This invitation link is not valid.' });
    }

    if (!fullName || fullName.length > 120) {
      return fail(400, { error: 'Enter your full name.', fullName, email, token });
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return fail(400, {
        error: 'Enter the email address this invitation was sent to.',
        fullName,
        email,
        token
      });
    }

    if (password.length < 12) {
      return fail(400, {
        error: 'Use a password with at least 12 characters.',
        fullName,
        email,
        token
      });
    }

    if (!locals.supabase) {
      return fail(503, { error: 'Account setup is not configured yet.', fullName, email, token });
    }

    const outcome = await acceptManualInvite({ email, fullName, password, token });

    if ('nameError' in outcome) {
      return fail(400, { nameError: outcome.nameError, fullName, email, token });
    }

    if ('error' in outcome) {
      return fail(400, { error: outcome.error, fullName, email, token });
    }

    const { error: signInError } = await locals.supabase.auth.signInWithPassword({
      email: outcome.email,
      password
    });

    if (signInError) {
      return fail(500, {
        error: 'Your account was created, but we could not sign you in.',
        fullName,
        email,
        token
      });
    }

    throw redirect(303, new URL('/people', url).pathname);
  }
};
