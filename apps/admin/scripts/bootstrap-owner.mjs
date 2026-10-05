import { createHash, randomBytes } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { createClient } from '@supabase/supabase-js';

const [workspaceNameInput, ownerEmailInput] = process.argv.slice(2);

if (!workspaceNameInput || !ownerEmailInput) {
  console.error('Usage: npm run auth:bootstrap-owner -- "Church name" owner@example.org');
  process.exit(1);
}

function parseEnvironment(source) {
  return Object.fromEntries(
    source
      .split(/\r?\n/)
      .filter((line) => line && !line.trimStart().startsWith('#'))
      .map((line) => {
        const separator = line.indexOf('=');

        return [line.slice(0, separator).trim(), line.slice(separator + 1).trim()];
      })
      .filter(([key]) => key)
  );
}

function normaliseEmail(value) {
  return value.trim().toLocaleLowerCase();
}

function validEmail(value) {
  return /^\S+@\S+\.\S+$/.test(value);
}

const workspaceName = workspaceNameInput.trim().replace(/\s+/g, ' ');
const ownerEmail = normaliseEmail(ownerEmailInput);

if (!workspaceName || workspaceName.length > 80) {
  console.error('Church name must contain 1 to 80 characters.');
  process.exit(1);
}

if (!validEmail(ownerEmail)) {
  console.error('Provide a valid owner email address.');
  process.exit(1);
}

const environmentFile = resolve(process.cwd(), '.env.local');
const environment = parseEnvironment(await readFile(environmentFile, 'utf8'));
const supabaseUrl = environment.SUPABASE_URL?.trim();
const serviceRoleKey = environment.SUPABASE_SERVICE_ROLE_KEY?.trim();
const siteUrl = environment.PUBLIC_SITE_URL?.trim();

if (!supabaseUrl || !serviceRoleKey || !siteUrl) {
  console.error('Set SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and PUBLIC_SITE_URL in .env.local.');
  process.exit(1);
}

const token = randomBytes(32).toString('base64url');
const tokenHash = createHash('sha256').update(token).digest('hex');
const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
const client = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const { data: workspace, error: workspaceError } = await client
  .from('workspaces')
  .insert({ name: workspaceName })
  .select('id')
  .single();

if (workspaceError || !workspace) {
  console.error('Could not create the workspace. Check that the migration has been applied.');
  process.exit(1);
}

const { error: inviteError } = await client.from('workspace_invites').insert({
  email: ownerEmail,
  expires_at: expiresAt,
  role: 'owner',
  token_hash: tokenHash,
  workspace_id: workspace.id
});

if (inviteError) {
  await client.from('workspaces').delete().eq('id', workspace.id);
  console.error('Could not create the owner invitation. The workspace was removed.');
  process.exit(1);
}

await client.from('audit_events').insert({
  action: 'workspace_bootstrapped',
  metadata: { owner_email: ownerEmail },
  target_id: workspace.id,
  target_type: 'workspace',
  workspace_id: workspace.id
});

const inviteUrl = new URL('/accept-invite', siteUrl);

inviteUrl.searchParams.set('token', token);

console.log(`Owner invitation for ${ownerEmail} (expires ${expiresAt}):`);
console.log(inviteUrl.toString());
