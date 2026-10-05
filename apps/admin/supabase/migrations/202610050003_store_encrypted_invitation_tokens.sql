-- Retain only an encrypted copy of each pending invitation token so workspace
-- Owners can copy the same single-use link again. The server still validates
-- invitations exclusively via token_hash; clients never read this column.

alter table public.workspace_invites
  add column if not exists token_ciphertext text;
