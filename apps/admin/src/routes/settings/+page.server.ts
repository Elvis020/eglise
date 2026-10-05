import { fail } from '@sveltejs/kit';
import {
  createInviteToken,
  hashInviteToken,
  isValidInviteRole,
  normaliseEmail,
  requireOwnerWorkspace
} from '$lib/server/manual-invites';
import {
  configuredSiteUrl,
  createSupabaseAdminClient,
  isSupabaseAuthConfigured
} from '$lib/server/supabase';
import type { Actions, PageServerLoad } from './$types';

const roleLabels = {
  people_administrator: 'People administrator',
  people_editor: 'People editor',
  people_viewer: 'People viewer'
} as const;

export const load: PageServerLoad = async ({ locals }) => {
  if (!isSupabaseAuthConfigured() || !locals.user || !locals.supabase) {
    return { accessManagement: null };
  }

  const { data: membership } = await locals.supabase
    .from('workspace_memberships')
    .select('role')
    .eq('user_id', locals.user.id)
    .is('revoked_at', null)
    .maybeSingle();

  return { accessManagement: membership?.role === 'owner' ? 'owner' : 'member' };
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
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const admin = createSupabaseAdminClient();

    const { error: inviteError } = await admin.from('workspace_invites').insert({
      created_by: locals.user?.id,
      email,
      expires_at: expiresAt,
      role,
      token_hash: tokenHash,
      workspace_id: workspaceId
    });

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
      inviteLink: inviteUrl.toString(),
      invitedEmail: email,
      invitedRole: roleLabels[role]
    };
  }
};
