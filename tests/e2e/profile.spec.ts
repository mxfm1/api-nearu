import { test, expect } from '@playwright/test';
import type { APIResponse } from '@playwright/test';

function extractCookie(response: APIResponse): string {
  const allHeaders = response.headersArray();
  const cookies = allHeaders
    .filter((h) => h.name.toLowerCase() === 'set-cookie')
    .map((h) => h.value.split(';')[0]);
  return cookies.join('; ');
}

async function signUp(request: any, uniqueId: number) {
  const email = `profile-${uniqueId}@example.com`;
  const password = 'TestPassword123!';

  const res = await request.post('/api/auth/sign-up/email', {
    data: { name: 'Profile Test', email, password },
  });

  if (!res.ok()) {
    return { ok: false, email, password, cookie: '' };
  }

  const cookie = extractCookie(res);
  return { ok: true, email, password, cookie };
}

test.describe('Profile & Custom Auth Endpoints', () => {
  const uniqueId = Date.now();
  let sessionCookie = '';
  let testEmail = '';
  let signedUp = false;

  test.beforeAll(async ({ request }) => {
    const result = await signUp(request, uniqueId);
    signedUp = result.ok;
    sessionCookie = result.cookie;
    testEmail = result.email;
  });

  test('GET /api/auth/me returns the authenticated user', async ({ request }) => {
    test.skip(!signedUp, 'Requires database');

    const res = await request.get('/api/auth/me', {
      headers: { cookie: sessionCookie },
    });

    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.email).toBe(testEmail);
    expect(body.data.id).toBeDefined();
    expect(body.data.name).toBe('Profile Test');
  });

  test('GET /api/auth/me returns 401 without auth', async ({ request }) => {
    const res = await request.get('/api/auth/me');
    expect(res.status()).toBe(401);

    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('UNAUTHENTICATED');
  });

  test('PATCH /api/users/me updates the user name', async ({ request }) => {
    test.skip(!signedUp, 'Requires database');

    const res = await request.patch('/api/users/me', {
      headers: { cookie: sessionCookie },
      data: { name: 'Updated Name' },
    });

    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.name).toBe('Updated Name');
    expect(body.data.email).toBe(testEmail);
  });

  test('PATCH /api/users/me returns 401 without auth', async ({ request }) => {
    const res = await request.patch('/api/users/me', {
      data: { name: 'Hacker' },
    });
    expect(res.status()).toBe(401);
  });

  test('POST /api/auth/change-password changes the password', async ({ request }) => {
    test.skip(!signedUp, 'Requires database');

    const newPassword = 'NewTestPassword456!';
    const res = await request.post('/api/auth/change-password', {
      headers: { cookie: sessionCookie },
      data: { currentPassword: 'TestPassword123!', newPassword },
    });

    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.success).toBe(true);
  });

  test('POST /api/auth/change-password returns 401 without auth', async ({ request }) => {
    const res = await request.post('/api/auth/change-password', {
      data: { currentPassword: 'x', newPassword: 'y' },
    });
    expect(res.status()).toBe(401);
  });

  test('POST /api/auth/change-email requests email change', async ({ request }) => {
    test.skip(!signedUp, 'Requires database');

    const newEmail = `changed-${uniqueId}@example.com`;
    const res = await request.post('/api/auth/change-email', {
      headers: { cookie: sessionCookie },
      data: { newEmail },
    });

    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.status).toBe(true);
  });

  test('POST /api/auth/change-email returns 401 without auth', async ({ request }) => {
    const res = await request.post('/api/auth/change-email', {
      data: { newEmail: 'hacker@test.com' },
    });
    expect(res.status()).toBe(401);
  });

  test('DELETE /api/users/:id returns 401 without auth', async ({ request }) => {
    const res = await request.delete('/api/users/some-id');
    expect(res.status()).toBe(401);
  });

  test('DELETE /api/users/:id returns 404 for non-existent user', async ({ request }) => {
    test.skip(!signedUp, 'Requires database');

    const res = await request.delete('/api/users/non-existent-id', {
      headers: { cookie: sessionCookie },
    });

    // The user doesn't exist in our DB (different from auth user)
    expect(res.status()).toBe(404);
  });
});
