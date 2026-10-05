create extension if not exists pgcrypto;

create type public.eglise_role as enum (
  'owner',
  'people_administrator',
  'people_editor',
  'people_viewer'
);

create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 1 and 80),
  created_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null check (char_length(trim(full_name)) between 1 and 120),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.workspace_memberships (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.eglise_role not null,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  revoked_at timestamptz,
  revoked_by uuid references auth.users(id),
  primary key (workspace_id, user_id)
);

create index workspace_memberships_user_active_idx
  on public.workspace_memberships (user_id, workspace_id)
  where revoked_at is null;

create table public.workspace_invites (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  email text not null check (email = lower(trim(email))),
  role public.eglise_role not null,
  token_hash text not null unique,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  expires_at timestamptz not null,
  accepted_at timestamptz,
  accepted_by uuid references auth.users(id),
  revoked_at timestamptz,
  revoked_by uuid references auth.users(id),
  check (expires_at > created_at)
);

create index workspace_invites_workspace_pending_idx
  on public.workspace_invites (workspace_id, created_at desc)
  where accepted_at is null and revoked_at is null;

create table public.audit_events (
  id bigint generated always as identity primary key,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  actor_user_id uuid references auth.users(id),
  action text not null check (char_length(action) between 1 and 100),
  target_type text not null check (char_length(target_type) between 1 and 100),
  target_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index audit_events_workspace_created_idx
  on public.audit_events (workspace_id, created_at desc);

create or replace function public.is_workspace_owner(candidate_workspace_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.workspace_memberships membership
    where membership.workspace_id = candidate_workspace_id
      and membership.user_id = (select auth.uid())
      and membership.role = 'owner'::public.eglise_role
      and membership.revoked_at is null
  );
$$;

revoke all on function public.is_workspace_owner(uuid) from public;
grant execute on function public.is_workspace_owner(uuid) to authenticated;

alter table public.workspaces enable row level security;
alter table public.profiles enable row level security;
alter table public.workspace_memberships enable row level security;
alter table public.workspace_invites enable row level security;
alter table public.audit_events enable row level security;

create policy "members read their workspace"
  on public.workspaces for select to authenticated
  using (
    exists (
      select 1 from public.workspace_memberships membership
      where membership.workspace_id = workspaces.id
        and membership.user_id = (select auth.uid())
        and membership.revoked_at is null
    )
  );

create policy "users read their own profile"
  on public.profiles for select to authenticated
  using (id = (select auth.uid()));

create policy "users update their own profile"
  on public.profiles for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

create policy "members read their own memberships"
  on public.workspace_memberships for select to authenticated
  using (user_id = (select auth.uid()));

create policy "owners manage workspace memberships"
  on public.workspace_memberships for all to authenticated
  using ((select public.is_workspace_owner(workspace_id)))
  with check ((select public.is_workspace_owner(workspace_id)));

create policy "owners manage workspace invites"
  on public.workspace_invites for all to authenticated
  using ((select public.is_workspace_owner(workspace_id)))
  with check ((select public.is_workspace_owner(workspace_id)));

create policy "members read workspace audit events"
  on public.audit_events for select to authenticated
  using (
    exists (
      select 1 from public.workspace_memberships membership
      where membership.workspace_id = audit_events.workspace_id
        and membership.user_id = (select auth.uid())
        and membership.revoked_at is null
    )
  );

create or replace function public.claim_manual_invite(
  invitation_token_hash text,
  invited_user_id uuid,
  invited_email text,
  invited_full_name text
)
returns table (workspace_id uuid, role public.eglise_role)
language plpgsql
security definer
set search_path = ''
as $$
declare
  invitation public.workspace_invites%rowtype;
begin
  select * into invitation
  from public.workspace_invites
  where token_hash = invitation_token_hash
    and email = lower(trim(invited_email))
    and accepted_at is null
    and revoked_at is null
    and expires_at > now()
  for update;

  if not found then
    raise exception 'Invitation is invalid, expired, or already used.';
  end if;

  update public.workspace_invites
  set accepted_at = now(), accepted_by = invited_user_id
  where id = invitation.id;

  insert into public.profiles (id, full_name)
  values (invited_user_id, trim(invited_full_name));

  insert into public.workspace_memberships (workspace_id, user_id, role, created_by)
  values (invitation.workspace_id, invited_user_id, invitation.role, invitation.created_by);

  insert into public.audit_events (workspace_id, actor_user_id, action, target_type, target_id, metadata)
  values (
    invitation.workspace_id,
    invited_user_id,
    'workspace_invite_accepted',
    'workspace_membership',
    invited_user_id,
    jsonb_build_object('role', invitation.role)
  );

  return query select invitation.workspace_id, invitation.role;
end;
$$;

revoke all on function public.claim_manual_invite(text, uuid, text, text) from public;
grant execute on function public.claim_manual_invite(text, uuid, text, text) to service_role;
