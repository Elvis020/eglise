import { isSupabaseAuthConfigured } from '$lib/server/supabase';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => ({
  authMode: isSupabaseAuthConfigured() ? ('supabase' as const) : ('prototype' as const)
});
