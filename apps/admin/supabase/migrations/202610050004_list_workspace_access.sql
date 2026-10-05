-- Settings only needs the current workspace's access rows. Keep the Auth join
-- inside one owner-checked function instead of listing every project user.

create or replace function public.get_workspace_access(
  candidate_workspace_id uuid,
  query_text text default '',
  status_filter text default 'all',
  role_filter text default 'all',
  requested_page_size integer default 10,
  requested_page integer default 1
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  normalised_query text := left(lower(trim(coalesce(query_text, ''))), 120);
  normalised_status text := lower(trim(coalesce(status_filter, 'all')));
  normalised_role text := lower(trim(coalesce(role_filter, 'all')));
  page_size integer := least(greatest(coalesce(requested_page_size, 10), 1), 100);
  page_number integer := least(greatest(coalesce(requested_page, 1), 1), 100000);
  result jsonb;
begin
  if not public.is_workspace_owner(candidate_workspace_id) then
    raise exception 'Only a workspace Owner can view workspace access.'
      using errcode = '42501';
  end if;

  if normalised_status not in ('all', 'active', 'pending') then
    normalised_status := 'all';
  end if;

  if normalised_role not in ('all', 'owner', 'people_administrator', 'people_editor', 'people_viewer') then
    normalised_role := 'all';
  end if;

  with access_entries as (
    select
      membership.user_id as entry_id,
      'active'::text as entry_status,
      coalesce(account.email, 'Email unavailable') as email,
      coalesce(profile.full_name, 'Workspace member') as full_name,
      membership.role::text as access_role,
      null::timestamptz as expires_at,
      membership.created_at,
      0 as status_order
    from public.workspace_memberships membership
    left join public.profiles profile on profile.id = membership.user_id
    join auth.users account on account.id = membership.user_id
    where membership.workspace_id = candidate_workspace_id
      and membership.revoked_at is null

    union all

    select
      invitation.id as entry_id,
      'pending'::text as entry_status,
      invitation.email,
      null::text as full_name,
      invitation.role::text as access_role,
      invitation.expires_at,
      invitation.created_at,
      1 as status_order
    from public.workspace_invites invitation
    where invitation.workspace_id = candidate_workspace_id
      and invitation.accepted_at is null
      and invitation.revoked_at is null
      and invitation.expires_at > now()
  ),
  filtered_entries as (
    select *
    from access_entries entry
    where (
      normalised_query = ''
      or lower(entry.email) like '%' || normalised_query || '%'
      or lower(coalesce(entry.full_name, '')) like '%' || normalised_query || '%'
    )
      and (normalised_status = 'all' or entry.entry_status = normalised_status)
      and (normalised_role = 'all' or entry.access_role = normalised_role)
  ),
  paged_entries as (
    select *
    from filtered_entries
    order by status_order, created_at desc, entry_id
    limit page_size
    offset (page_number - 1) * page_size
  )
  select jsonb_build_object(
    'total', (select count(*) from filtered_entries),
    'rows', coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'email', entry.email,
            'expiresAt', entry.expires_at,
            'fullName', entry.full_name,
            'id', entry.entry_id,
            'role', entry.access_role,
            'status', entry.entry_status
          )
          order by entry.status_order, entry.created_at desc, entry.entry_id
        )
        from paged_entries entry
      ),
      '[]'::jsonb
    )
  )
  into result;

  return result;
end;
$$;

alter function public.get_workspace_access(uuid, text, text, text, integer, integer) owner to postgres;

revoke all on function public.get_workspace_access(uuid, text, text, text, integer, integer) from public;
grant execute on function public.get_workspace_access(uuid, text, text, text, integer, integer) to authenticated;

create index if not exists workspace_memberships_workspace_active_access_idx
  on public.workspace_memberships (workspace_id, created_at desc, user_id)
  where revoked_at is null;
