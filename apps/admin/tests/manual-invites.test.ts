import { describe, expect, it } from 'vitest';
import {
  createInviteToken,
  decryptInviteToken,
  encryptInviteToken,
  hashInviteToken,
  normaliseEmail,
  normaliseFullName
} from '$lib/server/invite-crypto';

describe('manual invitations', () => {
  it('creates opaque URL-safe tokens with stable hashes', async () => {
    const token = createInviteToken();

    expect(token).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(await hashInviteToken(token)).toHaveLength(64);
    expect(await hashInviteToken(token)).toBe(await hashInviteToken(token));
  });

  it('encrypts an invitation token for secure repeat copying', async () => {
    const token = createInviteToken();
    const ciphertext = await encryptInviteToken(token, 'test-invitation-encryption-secret');

    expect(ciphertext).not.toContain(token);
    expect(await decryptInviteToken(ciphertext, 'test-invitation-encryption-secret')).toBe(token);
    await expect(decryptInviteToken(ciphertext, 'other-secret')).rejects.toThrow();
  });

  it('normalises an invited email before looking it up', () => {
    expect(normaliseEmail('  Owner@Church.org ')).toBe('owner@church.org');
  });

  it('normalises name whitespace before duplicate checks', () => {
    expect(normaliseFullName('  Ama   Owusu  ')).toBe('Ama Owusu');
  });
});
