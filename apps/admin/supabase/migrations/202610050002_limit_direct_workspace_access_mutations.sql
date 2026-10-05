-- Workspace access is changed only by authenticated server actions using the
-- service role after they verify the caller is the workspace Owner. Removing
-- the broad client-side policy prevents an Owner's browser session from
-- directly elevating a role or removing the final Owner by calling Supabase.

drop policy if exists "owners manage workspace memberships" on public.workspace_memberships;
drop policy if exists "owners manage workspace invites" on public.workspace_invites;
