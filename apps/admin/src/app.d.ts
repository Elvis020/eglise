import type { SupabaseClient } from '@supabase/supabase-js';
import type { WorkspaceRole } from '$lib/access';

type AuthenticatedUser = {
  email: string | null;
  id: string;
  user_metadata: Record<string, unknown>;
};

declare global {
  namespace App {
    interface Locals {
      supabase: SupabaseClient | null;
      sessionId: string | null;
      user: AuthenticatedUser | null;
      workspace: {
        id: string;
        name: string;
        role: WorkspaceRole;
      } | null;
    }
  }
}

export {};
