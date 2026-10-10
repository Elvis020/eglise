import { error, fail, redirect } from '@sveltejs/kit';
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
import { invalidateWorkspaceAccessForUser } from '$lib/server/workspace-access-cache';
import type { Actions, PageServerLoad } from './$types';

type WorkspaceRole = 'owner' | 'people_administrator' | 'people_editor' | 'people_viewer';

type AccessStatus = 'active' | 'pending';

type WorkspaceAccessDatabaseRow = {
  email: string;
  expiresAt: string | null;
  fullName: string | null;
  id: string;
  role: WorkspaceRole;
  status: AccessStatus;
};

type WorkspaceAccessResult = {
  rows: WorkspaceAccessDatabaseRow[];
  total: number;
};

const accessPageSize = 10;

const roleLabels = {
  owner: 'Owner',
  people_administrator: 'People administrator',
  people_editor: 'People editor',
  people_viewer: 'People viewer'
} as const;

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function normaliseAccessStatus(value: string | null): 'all' | AccessStatus {
  return value === 'active' || value === 'pending' ? value : 'all';
}

function normaliseAccessRole(value: string | null): 'all' | WorkspaceRole {
  return value === 'owner' || isValidInviteRole(value ?? '') ? (value as WorkspaceRole) : 'all';
}

function normaliseAccessPage(value: string | null): number {
  const page = Number(value);

  return Number.isInteger(page) && page > 0 ? page : 1;
}

function accessFilters(url: URL) {
  return {
    page: normaliseAccessPage(url.searchParams.get('accessPage')),
    query: url.searchParams.get('accessQuery')?.trim().slice(0, 120) ?? '',
    role: normaliseAccessRole(url.searchParams.get('accessRole')),
    status: normaliseAccessStatus(url.searchParams.get('accessStatus'))
  };
}

function settingsAccessUrl(filters: ReturnType<typeof accessFilters>, page: number): string {
  const searchParams = new URLSearchParams();

  if (filters.query) searchParams.set('accessQuery', filters.query);
  if (filters.status !== 'all') searchParams.set('accessStatus', filters.status);
  if (filters.role !== 'all') searchParams.set('accessRole', filters.role);
  if (page > 1) searchParams.set('accessPage', String(page));

  return `/settings${searchParams.size ? `?${searchParams}` : ''}`;
}

export const load: PageServerLoad = async ({ locals, parent, url }) => {
  const parentData = await parent();
  const filters = accessFilters(url);
  const emptyAccess = {
    accessFilters: filters,
    accessPageSize,
    accessRows: [],
    accessTotalCount: 0
  };

  if (!isSupabaseAuthConfigured() || !locals.user || !locals.supabase || !parentData.workspace) {
    return { accessManagement: null, ...emptyAccess };
  }

  const workspaceRole = parentData.workspace.role as WorkspaceRole;

  if (workspaceRole !== 'owner' && workspaceRole !== 'people_administrator') {
    throw redirect(303, '/people');
  }

  if (workspaceRole !== 'owner') {
    return { accessManagement: 'administrator', ...emptyAccess };
  }

  const { data, error: accessError } = await locals.supabase.rpc('get_workspace_access', {
    candidate_workspace_id: parentData.workspace.id,
    query_text: filters.query,
    requested_page: filters.page,
    requested_page_size: accessPageSize,
    role_filter: filters.role,
    status_filter: filters.status
  });

  if (accessError) {
    throw error(500, 'Unable to load workspace access.');
  }

  const access = data as WorkspaceAccessResult | null;
  const accessTotalCount = Number(access?.total ?? 0);
  const accessPageCount = Math.max(1, Math.ceil(accessTotalCount / accessPageSize));

  if (filters.page > accessPageCount) {
    throw redirect(303, settingsAccessUrl(filters, accessPageCount));
  }

  return {
    accessFilters: filters,
    accessManagement: 'owner',
    accessPageSize,
    accessRows: (access?.rows ?? []).map((row) =>
      row.status === 'active'
        ? {
            email: row.email,
            fullName: row.fullName ?? 'Workspace member',
            role: row.role,
            status: 'active' as const,
            userId: row.id
          }
        : {
            email: row.email,
            expiresAt: row.expiresAt ?? '',
            id: row.id,
            role: row.role,
            status: 'pending' as const
          }
    ),
    accessTotalCount
  };
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
    const { data: invitationId, error: inviteError } = (await locals.supabase?.rpc(
      'create_workspace_invite',
      {
        candidate_workspace_id: workspaceId,
        invitation_expires_at: expiresAt,
        invitation_token_ciphertext: tokenCiphertext,
        invitation_token_hash: tokenHash,
        invited_email: email,
        invited_role: role
      }
    )) ?? { data: null, error: new Error('Workspace access is unavailable.') };

    if (inviteError) {
      return fail(500, {
        inviteError: 'We could not create this invitation. Please try again.',
        email,
        role
      });
    }

    const inviteUrl = new URL('/accept-invite', configuredSiteUrl(url.origin));

    inviteUrl.searchParams.set('token', token);

    return {
      invitationId,
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

    if (invitationError) {
      return fail(500, {
        accessError: 'We could not retrieve this invitation. Please try again.'
      });
    }

    if (!invitation) {
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
    const { error: updateError } = (await locals.supabase?.rpc('change_workspace_member_role', {
      candidate_user_id: userId,
      candidate_workspace_id: workspaceId,
      next_role: role
    })) ?? { error: new Error('Workspace access is unavailable.') };

    if (updateError) {
      return fail(500, { accessError: 'We could not change access. Please try again.' });
    }

    invalidateWorkspaceAccessForUser(userId);

    return { accessMessage: `Access changed to ${roleLabels[role]}.` };
  },

  revokeMembership: async ({ locals, request }) => {
    const formData = await request.formData();
    const userId = String(formData.get('userId') ?? '');

    if (!isUuid(userId)) {
      return fail(400, { accessError: 'We could not identify that workspace member.' });
    }

    const workspaceId = await requireOwnerWorkspace(locals);
    const { error: revokeError } = (await locals.supabase?.rpc('revoke_workspace_member', {
      candidate_user_id: userId,
      candidate_workspace_id: workspaceId
    })) ?? { error: new Error('Workspace access is unavailable.') };

    if (revokeError) {
      return fail(500, { accessError: 'We could not remove access. Please try again.' });
    }

    invalidateWorkspaceAccessForUser(userId);

    return { accessMessage: 'Workspace access removed.' };
  },

  revokeInvitation: async ({ locals, request }) => {
    const formData = await request.formData();
    const invitationId = String(formData.get('invitationId') ?? '');

    if (!isUuid(invitationId)) {
      return fail(400, { accessError: 'We could not identify that invitation.' });
    }

    const workspaceId = await requireOwnerWorkspace(locals);
    const { error: revokeError } = (await locals.supabase?.rpc('revoke_workspace_invite', {
      candidate_invitation_id: invitationId,
      candidate_workspace_id: workspaceId
    })) ?? { error: new Error('Workspace access is unavailable.') };

    if (revokeError) {
      return fail(500, { accessError: 'We could not revoke this invitation. Please try again.' });
    }

    return { accessMessage: 'Invitation revoked.' };
  }
};
