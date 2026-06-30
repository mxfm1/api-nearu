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
  const email = `company-profile-${uniqueId}@example.com`;
  const password = 'TestPassword123!';

  const res = await request.post('/api/auth/sign-up/email', {
    data: { name: 'Company Profile Test', email, password },
  });

  if (!res.ok()) return { ok: false, email, password, cookie: '', userId: '' };

  const body = await res.json();
  const cookie = extractCookie(res);
  const userId = body.user?.id ?? '';
  return { ok: true, email, password, cookie, userId };
}

test.describe('Company Profile Endpoints', () => {
  const uniqueId = Date.now();
  let sessionCookie = '';
  let testEmail = '';
  let testUserId = '';
  let signedUp = false;

  test.beforeAll(async ({ request }) => {
    const result = await signUp(request, uniqueId);
    signedUp = result.ok;
    sessionCookie = result.cookie;
    testEmail = result.email;
    testUserId = result.userId;
  });

  test('GET /api/profiles/:userId returns 404 for user without profile', async ({ request }) => {
    test.skip(!signedUp, 'Requires database');
    test.skip(!testUserId, 'Requires user ID');

    const res = await request.get(`/api/profiles/${testUserId}`);
    expect(res.status()).toBe(404);

    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('NOT_FOUND');
  });

  test('PATCH /api/profiles/me creates a new profile (upsert)', async ({ request }) => {
    test.skip(!signedUp, 'Requires database');

    const res = await request.patch('/api/profiles/me', {
      headers: { cookie: sessionCookie },
      data: {
        name: 'Mi Empresa S.A.',
        industry: 'Technology',
        description: 'Empresa de tecnología',
        tags: ['tech', 'software'],
        location: 'Buenos Aires',
        founded: '2020',
        employees: '10-50',
        website: 'https://miempresa.com',
        whatsapp: '+541112345678',
        socialLinks: [
          { platform: 'instagram', url: 'https://instagram.com/miempresa', orden: 0 },
          { platform: 'linkedin', url: 'https://linkedin.com/company/miempresa', orden: 1 },
        ],
      },
    });

    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.success).toBe(true);

    expect(body.data.name).toBe('Mi Empresa S.A.');
    expect(body.data.industry).toBe('Technology');
    expect(body.data.description).toBe('Empresa de tecnología');
    expect(body.data.tags).toEqual(['tech', 'software']);
    expect(body.data.location).toBe('Buenos Aires');
    expect(body.data.founded).toBe('2020');
    expect(body.data.employees).toBe('10-50');
    expect(body.data.website).toBe('https://miempresa.com');
    expect(body.data.whatsapp).toBe('+541112345678');
    expect(body.data.socialLinks).toHaveLength(2);
    expect(body.data.socialLinks[0].platform).toBe('instagram');
    expect(body.data.socialLinks[1].platform).toBe('linkedin');
    expect(body.data.userId).toBe(testUserId);
    expect(body.data.id).toBeDefined();
  });

  test('GET /api/profiles/:userId returns the profile', async ({ request }) => {
    test.skip(!signedUp, 'Requires database');
    test.skip(!testUserId, 'Requires user ID');

    const res = await request.get(`/api/profiles/${testUserId}`);
    expect(res.ok()).toBeTruthy();

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.name).toBe('Mi Empresa S.A.');
    expect(body.data.industry).toBe('Technology');
    expect(body.data.socialLinks).toHaveLength(2);
  });

  test('PATCH /api/profiles/me updates existing profile fields', async ({ request }) => {
    test.skip(!signedUp, 'Requires database');

    const res = await request.patch('/api/profiles/me', {
      headers: { cookie: sessionCookie },
      data: {
        name: 'Mi Empresa Actualizada S.A.',
        description: 'Descripción actualizada',
        tags: ['tech', 'software', 'innovation'],
        socialLinks: [
          { platform: 'instagram', url: 'https://instagram.com/nuevo', orden: 0 },
        ],
      },
    });

    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.name).toBe('Mi Empresa Actualizada S.A.');
    expect(body.data.description).toBe('Descripción actualizada');
    expect(body.data.tags).toEqual(['tech', 'software', 'innovation']);
    // Social links should be replaced entirely
    expect(body.data.socialLinks).toHaveLength(1);
    expect(body.data.socialLinks[0].platform).toBe('instagram');
    expect(body.data.socialLinks[0].url).toBe('https://instagram.com/nuevo');
    // Fields not sent should keep their previous values
    expect(body.data.industry).toBe('Technology');
    expect(body.data.location).toBe('Buenos Aires');
  });

  test('PATCH /api/profiles/me returns 401 without auth', async ({ request }) => {
    const res = await request.patch('/api/profiles/me', {
      data: { name: 'Hacker' },
    });
    expect(res.status()).toBe(401);
  });

  test('GET /api/profiles/:userId returns 404 for non-existent user', async ({ request }) => {
    const res = await request.get('/api/profiles/non-existent-id');
    expect(res.status()).toBe(404);
  });
});
