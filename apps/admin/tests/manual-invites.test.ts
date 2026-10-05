import { describe, expect, it } from 'vitest';
import { createInviteToken, hashInviteToken, normaliseEmail } from '$lib/server/invite-crypto';

describe('manual invitations', () => {
  it('creates opaque URL-safe tokens with stable hashes', async () => {
    const token = createInviteToken();

    expect(token).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(await hashInviteToken(token)).toHaveLength(64);
    expect(await hashInviteToken(token)).toBe(await hashInviteToken(token));
  });

  it('normalises an invited email before looking it up', () => {
    expect(normaliseEmail('  Owner@Church.org ')).toBe('owner@church.org');
  });
});
