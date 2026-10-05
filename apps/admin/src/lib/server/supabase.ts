import { createServerClient } from '@supabase/ssr';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/private';
import type { RequestEvent } from '@sveltejs/kit';

function requiredEnvironmentValue(name: keyof typeof env): string | null {
  const value = env[name]?.trim();

  return value || null;
}

export function isSupabaseAuthConfigured(): boolean {
  if (requiredEnvironmentValue('EGLISE_AUTH_MODE') === 'prototype') {
    return false;
  }

  return Boolean(
    requiredEnvironmentValue('SUPABASE_URL') && requiredEnvironmentValue('SUPABASE_PUBLISHABLE_KEY')
  );
}

export function createSupabaseServerClient(event: RequestEvent): SupabaseClient | null {
  const url = requiredEnvironmentValue('SUPABASE_URL');
  const publishableKey = requiredEnvironmentValue('SUPABASE_PUBLISHABLE_KEY');

  if (!url || !publishableKey) {
    return null;
  }

  return createServerClient(url, publishableKey, {
    cookies: {
      getAll: () => event.cookies.getAll(),
      setAll: (cookies) => {
        cookies.forEach(({ name, options, value }) => {
          event.cookies.set(name, value, { ...options, path: '/' });
        });
      }
    }
  });
}

export function createSupabaseAdminClient(): SupabaseClient {
  const url = requiredEnvironmentValue('SUPABASE_URL');
  const serviceRoleKey = requiredEnvironmentValue('SUPABASE_SERVICE_ROLE_KEY');

  if (!url || !serviceRoleKey) {
    throw new Error('Supabase administrator configuration is incomplete.');
  }

  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}

export function configuredSiteUrl(fallback: string): string {
  return requiredEnvironmentValue('PUBLIC_SITE_URL') ?? fallback;
}
