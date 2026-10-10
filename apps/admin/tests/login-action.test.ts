import { describe, expect, it, vi } from 'vitest';

vi.mock('$lib/server/supabase', () => ({
  isPrototypeAuthMode: () => false
}));

import { actions } from '../src/routes/login/+page.server';

function loginRequest(): Request {
  const formData = new FormData();

  formData.set('email', 'admin@church.org');
  formData.set('password', 'incorrect-password');

  return new Request('http://eglise.test/login', {
    body: formData,
    method: 'POST'
  });
}

function actionEvent(status: number) {
  return {
    locals: {
      supabase: {
        auth: {
          signInWithPassword: vi.fn().mockResolvedValue({ error: { status } })
        }
      }
    },
    request: loginRequest()
  } as never;
}

describe('login action', () => {
  it('marks only invalid credentials as a credential error', async () => {
    const result = await actions.default(actionEvent(400));

    expect(result).toMatchObject({
      data: {
        error: 'We could not sign you in with those details.',
        errorKind: 'credentials'
      },
      status: 400
    });
  });

  it('keeps operational authentication failures persistent', async () => {
    const result = await actions.default(actionEvent(429));

    expect(result).toMatchObject({
      data: { error: 'Sign-in is temporarily unavailable. Please try again.' },
      status: 503
    });
    expect(result).not.toMatchObject({ data: { errorKind: 'credentials' } });
  });
});
