import { fail } from '@sveltejs/kit';
import {
  createInviteToken,
  hashInviteToken,
  isValidInviteRole,
  normaliseEmail,
  requireOwnerWorkspace
} from '$lib/server/manual-invites';
import { decryptInviteToken, encryptInviteToken } from '$lib/server/invite-crypto';
import {
  configuredSiteUrl,
  createSupabaseAdminClient,
  invitationEncryptionSecret,
  isSupabaseAuthConfigured
} from '$lib/server/supabase';
import type { Actions, PageServerLoad } from './$types';

type WorkspaceRole = 'owner' | 'people_administrator' | 'people_editor' | 'people_viewer';

const roleLabels = {
  owner: 'Owner',
  people_administrator: 'People administrator',
  people_editor: 'People editor',
  people_viewer: 'People viewer'
} as const;

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

async function loadWorkspaceAccess(workspaceId: string) {
  const admin = createSupabaseAdminClient();
  const [
    { data: memberships, error: membershipsError },
    { data: invitations, error: invitationsError }
  ] = await Promise.all([
    admin
      .from('workspace_memberships')
      .select('user_id, role, created_at')
      .eq('workspace_id', workspaceId)
      .is('revoked_at', null)
      .order('created_at'),
    admin
      .from('workspace_invites')
      .select('id, email, role, created_at, expires_at')
      .eq('workspace_id', workspaceId)
      .is('accepted_at', null)
      .is('revoked_at', null)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
  ]);

  if (membershipsError || invitationsError) {
    throw new Error('Unable to load workspace access.');
  }

  const userIds = memberships.map((membership) => membership.user_id);
  const [{ data: profiles, error: profilesError }, { data: users, error: usersError }] =
    userIds.length
      ? await Promise.all([
          admin.from('profiles').select('id, full_name').in('id', userIds),
          admin.auth.admin.listUsers({ page: 1, perPage: 1000 })
        ])
      : [
          { data: [], error: null },
          { data: { users: [] }, error: null }
        ];

  if (profilesError || usersError) {
    throw new Error('Unable to load workspace access.');
  }

  const profilesById = new Map(profiles.map((profile) => [profile.id, profile.full_name]));
  const emailsById = new Map(
    users.users.map((user) => [user.id, user.email ?? 'Email unavailable'])
  );

  return {
    members: memberships.map((membership) => ({
      createdAt: membership.created_at,
      email: emailsById.get(membership.user_id) ?? 'Email unavailable',
      fullName: profilesById.get(membership.user_id) ?? 'Workspace member',
      role: membership.role as WorkspaceRole,
      userId: membership.user_id
    })),
    pendingInvites: invitations.map((invitation) => ({
      createdAt: invitation.created_at,
      email: invitation.email,
      expiresAt: invitation.expires_at,
      id: invitation.id,
      role: invitation.role as WorkspaceRole
    }))
  };
}

export const load: PageServerLoad = async ({ locals }) => {
  if (!isSupabaseAuthConfigured() || !locals.user || !locals.supabase) {
    return { accessManagement: null, members: [], pendingInvites: [] };
  }

  const { data: membership } = await locals.supabase
    .from('workspace_memberships')
    .select('workspace_id, role')
    .eq('user_id', locals.user.id)
    .is('revoked_at', null)
    .maybeSingle();

  if (membership?.role !== 'owner') {
    return { accessManagement: 'member', members: [], pendingInvites: [] };
  }

  const access = await loadWorkspaceAccess(membership.workspace_id as string);

  return { accessManagement: 'owner', ...access };
};

export const actions: Actions = {
  invite: async ({ locals, request, url }) => {
    const formData = await request.formData();
    const email = normaliseEmail(String(formData.get('email') ?? ''));
    const role = String(formData.get('role') ?? '');

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return fail(400, { inviteError: 'Enter a valid email address.', email, role });
    }

    if (!isValidInviteRole(role)) {
      return fail(400, { inviteError: 'Choose an access role.', email, role });
    }

    const workspaceId = await requireOwnerWorkspace(locals);
    const token = createInviteToken();
    const tokenHash = await hashInviteToken(token);
    const tokenCiphertext = await encryptInviteToken(token, invitationEncryptionSecret());
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const admin = createSupabaseAdminClient();

    const { data: invitation, error: inviteError } = await admin
      .from('workspace_invites')
      .insert({
        created_by: locals.user?.id,
        email,
        expires_at: expiresAt,
        role,
        token_ciphertext: tokenCiphertext,
        token_hash: tokenHash,
        workspace_id: workspaceId
      })
      .select('id')
      .single();

    if (inviteError) {
      return fail(500, {
        inviteError: 'We could not create this invitation. Please try again.',
        email,
        role
      });
    }

    await admin.from('audit_events').insert({
      action: 'workspace_invite_created',
      actor_user_id: locals.user?.id,
      metadata: { role },
      target_type: 'workspace_invite',
      workspace_id: workspaceId
    });

    const inviteUrl = new URL('/accept-invite', configuredSiteUrl(url.origin));

    inviteUrl.searchParams.set('token', token);

    return {
      invitationId: invitation.id,
      inviteLink: inviteUrl.toString(),
      invitedEmail: email,
      invitedRole: roleLabels[role]
    };
  },

  copyInvitation: async ({ locals, request, url }) => {
    const formData = await request.formData();
    const invitationId = String(formData.get('invitationId') ?? '');

    if (!isUuid(invitationId)) {
      return fail(400, { accessError: 'We could not identify that invitation.' });
    }

    const workspaceId = await requireOwnerWorkspace(locals);
    const admin = createSupabaseAdminClient();
    const { data: invitation, error: invitationError } = await admin
      .from('workspace_invites')
      .select('token_ciphertext')
      .eq('id', invitationId)
      .eq('workspace_id', workspaceId)
      .is('accepted_at', null)
      .is('revoked_at', null)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();

    if (invitationError || !invitation) {
      return fail(404, { accessError: 'That invitation is no longer available.' });
    }

    if (!invitation.token_ciphertext) {
      return fail(409, {
        accessError:
          'This older invitation cannot be copied again. Revoke it and create a new invitation.'
      });
    }

    let token: string;

    try {
      token = await decryptInviteToken(invitation.token_ciphertext, invitationEncryptionSecret());
    } catch {
      return fail(500, {
        accessError: 'We could not copy this invitation. Create a new invitation.'
      });
    }

    const inviteUrl = new URL('/accept-invite', configuredSiteUrl(url.origin));

    inviteUrl.searchParams.set('token', token);

    return { invitationId, inviteLink: inviteUrl.toString() };
  },

  changeRole: async ({ locals, request }) => {
    const formData = await request.formData();
    const userId = String(formData.get('userId') ?? '');
    const role = String(formData.get('role') ?? '');

    if (!isUuid(userId)) {
      return fail(400, { accessError: 'We could not identify that workspace member.' });
    }

    if (!isValidInviteRole(role)) {
      return fail(400, { accessError: 'Choose a valid workspace role.' });
    }

    const workspaceId = await requireOwnerWorkspace(locals);
    const admin = createSupabaseAdminClient();
    const { data: membership, error: membershipError } = await admin
      .from('workspace_memberships')
      .select('role')
      .eq('workspace_id', workspaceId)
      .eq('user_id', userId)
      .is('revoked_at', null)
      .maybeSingle();

    if (membershipError || !membership) {
      return fail(404, { accessError: 'That workspace member no longer has access.' });
    }

    if (membership.role === 'owner') {
      return fail(403, { accessError: 'The workspace Owner’s access cannot be changed here.' });
    }

    if (membership.role === role) {
      return { accessMessage: 'No access changes were needed.' };
    }

    const { error: updateError } = await admin
      .from('workspace_memberships')
      .update({ role })
      .eq('workspace_id', workspaceId)
      .eq('user_id', userId)
      .is('revoked_at', null);

    if (updateError) {
      return fail(500, { accessError: 'We could not change access. Please try again.' });
    }

    await admin.from('audit_events').insert({
      action: 'workspace_member_role_changed',
      actor_user_id: locals.user?.id,
      metadata: { from: membership.role, to: role },
      target_id: userId,
      target_type: 'workspace_membership',
      workspace_id: workspaceId
    });

    return { accessMessage: `Access changed to ${roleLabels[role]}.` };
  },

  revokeMembership: async ({ locals, request }) => {
    const formData = await request.formData();
    const userId = String(formData.get('userId') ?? '');

    if (!isUuid(userId)) {
      return fail(400, { accessError: 'We could not identify that workspace member.' });
    }

    const workspaceId = await requireOwnerWorkspace(locals);
    const admin = createSupabaseAdminClient();
    const { data: membership, error: membershipError } = await admin
      .from('workspace_memberships')
      .select('role')
      .eq('workspace_id', workspaceId)
      .eq('user_id', userId)
      .is('revoked_at', null)
      .maybeSingle();

    if (membershipError || !membership) {
      return fail(404, { accessError: 'That workspace member no longer has access.' });
    }

    if (membership.role === 'owner') {
      return fail(403, { accessError: 'The workspace Owner cannot be removed here.' });
    }

    const { error: revokeError } = await admin
      .from('workspace_memberships')
      .update({ revoked_at: new Date().toISOString(), revoked_by: locals.user?.id })
      .eq('workspace_id', workspaceId)
      .eq('user_id', userId)
      .is('revoked_at', null);

    if (revokeError) {
      return fail(500, { accessError: 'We could not remove access. Please try again.' });
    }

    await admin.from('audit_events').insert({
      action: 'workspace_member_revoked',
      actor_user_id: locals.user?.id,
      metadata: { role: membership.role },
      target_id: userId,
      target_type: 'workspace_membership',
      workspace_id: workspaceId
    });

    return { accessMessage: 'Workspace access removed.' };
  },

  revokeInvitation: async ({ locals, request }) => {
    const formData = await request.formData();
    const invitationId = String(formData.get('invitationId') ?? '');

    if (!isUuid(invitationId)) {
      return fail(400, { accessError: 'We could not identify that invitation.' });
    }

    const workspaceId = await requireOwnerWorkspace(locals);
    const admin = createSupabaseAdminClient();
    const { data: invitation, error: invitationError } = await admin
      .from('workspace_invites')
      .select('role')
      .eq('id', invitationId)
      .eq('workspace_id', workspaceId)
      .is('accepted_at', null)
      .is('revoked_at', null)
      .maybeSingle();

    if (invitationError || !invitation) {
      return fail(404, { accessError: 'That invitation is no longer available.' });
    }

    const { error: revokeError } = await admin
      .from('workspace_invites')
      .update({ revoked_at: new Date().toISOString(), revoked_by: locals.user?.id })
      .eq('id', invitationId)
      .eq('workspace_id', workspaceId)
      .is('accepted_at', null)
      .is('revoked_at', null);

    if (revokeError) {
      return fail(500, { accessError: 'We could not revoke this invitation. Please try again.' });
    }

    await admin.from('audit_events').insert({
      action: 'workspace_invite_revoked',
      actor_user_id: locals.user?.id,
      metadata: { role: invitation.role },
      target_id: invitationId,
      target_type: 'workspace_invite',
      workspace_id: workspaceId
    });

    return { accessMessage: 'Invitation revoked.' };
  }
};
