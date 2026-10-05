import { isPrototypeAuthMode } from '$lib/server/supabase';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => ({
  authMode: isPrototypeAuthMode() ? ('prototype' as const) : ('supabase' as const)
});
