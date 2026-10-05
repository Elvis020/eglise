import { error } from '@sveltejs/kit';
import { createInviteToken, hashInviteToken, normaliseEmail } from '$lib/server/invite-crypto';
import { createSupabaseAdminClient } from '$lib/server/supabase';

export const inviteRoles = ['people_administrator', 'people_editor', 'people_viewer'] as const;

export type InviteRole = (typeof inviteRoles)[number];

export function isValidInviteRole(value: string): value is InviteRole {
  return inviteRoles.includes(value as InviteRole);
}

export { createInviteToken, hashInviteToken, normaliseEmail };

export async function requireOwnerWorkspace(locals: App.Locals) {
  if (!locals.supabase || !locals.user) {
    throw error(401, 'Sign in to manage workspace access.');
  }

  const { data: membership, error: membershipError } = await locals.supabase
    .from('workspace_memberships')
    .select('workspace_id, role')
    .eq('user_id', locals.user.id)
    .eq('role', 'owner')
    .is('revoked_at', null)
    .maybeSingle();

  if (membershipError || !membership) {
    throw error(403, 'Only the workspace owner can manage access.');
  }

  return membership.workspace_id as string;
}

export async function acceptManualInvite(input: {
  email: string;
  fullName: string;
  password: string;
  token: string;
}) {
  const admin = createSupabaseAdminClient();
  const tokenHash = await hashInviteToken(input.token);
  const email = normaliseEmail(input.email);

  const { data: invitation } = await admin
    .from('workspace_invites')
    .select('email')
    .eq('token_hash', tokenHash)
    .is('accepted_at', null)
    .is('revoked_at', null)
    .gt('expires_at', new Date().toISOString())
    .maybeSingle();

  if (!invitation || invitation.email !== email) {
    return { error: 'This invitation is invalid, expired, or already used.' };
  }

  const { data: createdUser, error: createUserError } = await admin.auth.admin.createUser({
    email,
    email_confirm: true,
    password: input.password,
    user_metadata: { full_name: input.fullName }
  });

  if (createUserError || !createdUser.user) {
    return { error: 'We could not create this account. Ask the owner for a new invitation.' };
  }

  const { error: claimError } = await admin.rpc('claim_manual_invite', {
    invitation_token_hash: tokenHash,
    invited_email: email,
    invited_full_name: input.fullName,
    invited_user_id: createdUser.user.id
  });

  if (claimError) {
    await admin.auth.admin.deleteUser(createdUser.user.id);

    return { error: 'This invitation is no longer available. Ask the owner for a new invitation.' };
  }

  return { email };
}
