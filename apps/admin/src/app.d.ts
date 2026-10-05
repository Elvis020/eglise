import type { SupabaseClient, User } from '@supabase/supabase-js';
import type { WorkspaceRole } from '$lib/access';

declare global {
  namespace App {
    interface Locals {
      supabase: SupabaseClient | null;
      user: User | null;
      workspace: {
        id: string;
        name: string;
        role: WorkspaceRole;
      } | null;
    }
  }
}

export {};
