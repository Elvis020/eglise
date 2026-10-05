create or replace function public.create_workspace_invite(
  candidate_workspace_id uuid,
  invited_email text,
  invited_role public.eglise_role,
  invitation_expires_at timestamptz,
  invitation_token_hash text,
  invitation_token_ciphertext text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  invitation_id uuid;
begin
  if not public.is_workspace_owner(candidate_workspace_id) then
    raise exception 'Only the workspace owner can manage access.' using errcode = '42501';
  end if;

  if invited_role not in (
    'people_administrator'::public.eglise_role,
    'people_editor'::public.eglise_role,
    'people_viewer'::public.eglise_role
  ) then
    raise exception 'Choose a valid workspace role.' using errcode = '22023';
  end if;

  if lower(trim(invited_email)) !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then
    raise exception 'Enter a valid email address.' using errcode = '22023';
  end if;

  if invitation_expires_at <= now() then
    raise exception 'The invitation expiry must be in the future.' using errcode = '22023';
  end if;

  if length(trim(invitation_token_hash)) = 0 or length(trim(invitation_token_ciphertext)) = 0 then
    raise exception 'The invitation token is invalid.' using errcode = '22023';
  end if;

  insert into public.workspace_invites (
    workspace_id,
    email,
    role,
    token_hash,
    token_ciphertext,
    expires_at,
    created_by
  )
  values (
    candidate_workspace_id,
    lower(trim(invited_email)),
    invited_role,
    invitation_token_hash,
    invitation_token_ciphertext,
    invitation_expires_at,
    (select auth.uid())
  )
  returning id into invitation_id;

  insert into public.audit_events (
    workspace_id,
    actor_user_id,
    action,
    target_type,
    target_id,
    metadata
  )
  values (
    candidate_workspace_id,
    (select auth.uid()),
    'workspace_invite_created',
    'workspace_invite',
    invitation_id,
    jsonb_build_object('role', invited_role)
  );

  return invitation_id;
end;
$$;

create or replace function public.change_workspace_member_role(
  candidate_workspace_id uuid,
  candidate_user_id uuid,
  next_role public.eglise_role
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_role public.eglise_role;
begin
  if not public.is_workspace_owner(candidate_workspace_id) then
    raise exception 'Only the workspace owner can manage access.' using errcode = '42501';
  end if;

  if next_role not in (
    'people_administrator'::public.eglise_role,
    'people_editor'::public.eglise_role,
    'people_viewer'::public.eglise_role
  ) then
    raise exception 'Choose a valid workspace role.' using errcode = '22023';
  end if;

  select role into current_role
  from public.workspace_memberships
  where workspace_id = candidate_workspace_id
    and user_id = candidate_user_id
    and revoked_at is null
  for update;

  if not found then
    raise exception 'That workspace member no longer has access.' using errcode = 'P0002';
  end if;

  if current_role = 'owner'::public.eglise_role then
    raise exception 'The workspace Owner’s access cannot be changed here.' using errcode = '42501';
  end if;

  if current_role = next_role then
    return;
  end if;

  update public.workspace_memberships
  set role = next_role
  where workspace_id = candidate_workspace_id
    and user_id = candidate_user_id;

  insert into public.audit_events (
    workspace_id,
    actor_user_id,
    action,
    target_type,
    target_id,
    metadata
  )
  values (
    candidate_workspace_id,
    (select auth.uid()),
    'workspace_member_role_changed',
    'workspace_membership',
    candidate_user_id,
    jsonb_build_object('from', current_role, 'to', next_role)
  );
end;
$$;

create or replace function public.revoke_workspace_member(
  candidate_workspace_id uuid,
  candidate_user_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_role public.eglise_role;
begin
  if not public.is_workspace_owner(candidate_workspace_id) then
    raise exception 'Only the workspace owner can manage access.' using errcode = '42501';
  end if;

  select role into current_role
  from public.workspace_memberships
  where workspace_id = candidate_workspace_id
    and user_id = candidate_user_id
    and revoked_at is null
  for update;

  if not found then
    raise exception 'That workspace member no longer has access.' using errcode = 'P0002';
  end if;

  if current_role = 'owner'::public.eglise_role then
    raise exception 'The workspace Owner cannot be removed here.' using errcode = '42501';
  end if;

  update public.workspace_memberships
  set revoked_at = now(), revoked_by = (select auth.uid())
  where workspace_id = candidate_workspace_id
    and user_id = candidate_user_id;

  insert into public.audit_events (
    workspace_id,
    actor_user_id,
    action,
    target_type,
    target_id,
    metadata
  )
  values (
    candidate_workspace_id,
    (select auth.uid()),
    'workspace_member_revoked',
    'workspace_membership',
    candidate_user_id,
    jsonb_build_object('role', current_role)
  );
end;
$$;

create or replace function public.revoke_workspace_invite(
  candidate_workspace_id uuid,
  candidate_invitation_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  invitation_role public.eglise_role;
begin
  if not public.is_workspace_owner(candidate_workspace_id) then
    raise exception 'Only the workspace owner can manage access.' using errcode = '42501';
  end if;

  select role into invitation_role
  from public.workspace_invites
  where id = candidate_invitation_id
    and workspace_id = candidate_workspace_id
    and accepted_at is null
    and revoked_at is null
  for update;

  if not found then
    raise exception 'That invitation is no longer available.' using errcode = 'P0002';
  end if;

  update public.workspace_invites
  set revoked_at = now(), revoked_by = (select auth.uid())
  where id = candidate_invitation_id;

  insert into public.audit_events (
    workspace_id,
    actor_user_id,
    action,
    target_type,
    target_id,
    metadata
  )
  values (
    candidate_workspace_id,
    (select auth.uid()),
    'workspace_invite_revoked',
    'workspace_invite',
    candidate_invitation_id,
    jsonb_build_object('role', invitation_role)
  );
end;
$$;

revoke all on function public.create_workspace_invite(uuid, text, public.eglise_role, timestamptz, text, text) from public;
revoke all on function public.change_workspace_member_role(uuid, uuid, public.eglise_role) from public;
revoke all on function public.revoke_workspace_member(uuid, uuid) from public;
revoke all on function public.revoke_workspace_invite(uuid, uuid) from public;

grant execute on function public.create_workspace_invite(uuid, text, public.eglise_role, timestamptz, text, text) to authenticated;
grant execute on function public.change_workspace_member_role(uuid, uuid, public.eglise_role) to authenticated;
grant execute on function public.revoke_workspace_member(uuid, uuid) to authenticated;
grant execute on function public.revoke_workspace_invite(uuid, uuid) to authenticated;
