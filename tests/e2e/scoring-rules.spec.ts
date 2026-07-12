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
  const email = `scoring-test-${uniqueId}@example.com`;
  const password = 'TestPassword123!';

  const res = await request.post('/api/auth/sign-up/email', {
    data: { name: 'Scoring Test', email, password },
  });

  if (!res.ok()) return { ok: false, email, password, cookie: '', userId: '', profileId: '' };

  const body = await res.json();
  const cookie = extractCookie(res);
  const userId = body.user?.id ?? '';
  return { ok: true, email, password, cookie, userId, profileId: '' };
}

async function createProfile(request: any, cookie: string) {
  const res = await request.patch('/api/profiles/me', {
    headers: { cookie },
    data: {
      name: 'Scoring Test Org',
      industry: 'Events',
      description: 'Organización de prueba para scoring',
    },
  });
  if (!res.ok()) return '';
  const body = await res.json();
  return body.data?.id ?? '';
}

test.describe('Scoring Rules Endpoints', () => {
  const uniqueId = Date.now();
  let sessionCookie = '';
  let profileId = '';
  let eventId = '';
  let signedUp = false;

  test.beforeAll(async ({ request }) => {
    const result = await signUp(request, uniqueId);
    signedUp = result.ok;
    sessionCookie = result.cookie;

    if (signedUp) {
      profileId = await createProfile(request, sessionCookie);
      if (profileId) {
        const eventRes = await request.post('/api/eventos', {
          headers: { cookie: sessionCookie },
          data: {
            slug: `scoring-event-${uniqueId}`,
            title: 'Evento para Scoring',
            description: 'Evento de prueba para testing de reglas de scoring.',
            startAt: '2026-10-15T18:30:00-03:00',
            thumbnailUrl: 'https://picsum.photos/seed/scoring/1200/400',
            status: 'published',
          },
        });
        if (eventRes.ok()) {
          const body = await eventRes.json();
          eventId = body.data?.id ?? '';
        }
      }
    }
  });

  // ──────────────────────────────────────────────
  // GET /api/scoring-rules/catalog
  // ──────────────────────────────────────────────
  test('GET /api/scoring-rules/catalog returns all rules', async ({ request }) => {
    const res = await request.get('/api/scoring-rules/catalog');
    expect(res.ok()).toBeTruthy();

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBe(17);

    // Check structure of first rule
    const first = body.data[0];
    expect(first).toHaveProperty('ruleType');
    expect(first).toHaveProperty('description');
    expect(first).toHaveProperty('group');
    expect(typeof first.ruleType).toBe('string');
    expect(typeof first.description).toBe('string');
    expect(typeof first.group).toBe('string');
  });

  test('GET /api/scoring-rules/catalog?group=perfil filters by group', async ({ request }) => {
    const res = await request.get('/api/scoring-rules/catalog?group=perfil');
    expect(res.ok()).toBeTruthy();

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.length).toBeGreaterThan(0);
    body.data.forEach((rule: any) => {
      expect(rule.group).toBe('perfil');
    });
  });

  test('GET /api/scoring-rules/catalog returns correct ruleTypes', async ({ request }) => {
    const res = await request.get('/api/scoring-rules/catalog');
    const body = await res.json();
    const ruleTypes = body.data.map((r: any) => r.ruleType);

    expect(ruleTypes).toContain('VERIFIED_PROFILE');
    expect(ruleTypes).toContain('SAME_REGION');
    expect(ruleTypes).toContain('HAS_PORTFOLIO');
    expect(ruleTypes).toContain('IS_PREMIUM_COMPANY');
    expect(ruleTypes).toContain('CUSTOM_FIELD_MATCH');
  });

  // ──────────────────────────────────────────────
  // GET /api/events/:eventId/scoring-rules
  // ──────────────────────────────────────────────
  test('GET /api/events/:eventId/scoring-rules returns empty array initially', async ({ request }) => {
    test.skip(!eventId, 'Requires created event');

    const res = await request.get(`/api/events/${eventId}/scoring-rules`, {
      headers: { cookie: sessionCookie },
    });
    expect(res.ok()).toBeTruthy();

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBe(0);
  });

  test('GET /api/events/:eventId/scoring-rules returns 401 without auth', async ({ request }) => {
    test.skip(!eventId, 'Requires created event');

    const res = await request.get(`/api/events/${eventId}/scoring-rules`);
    expect(res.status()).toBe(401);
  });

  test('GET /api/events/:eventId/scoring-rules returns 404 for non-existent event', async ({ request }) => {
    const res = await request.get('/api/events/evt_nonexistent/scoring-rules', {
      headers: { cookie: sessionCookie },
    });
    expect(res.status()).toBe(404);
  });

  // ──────────────────────────────────────────────
  // POST /api/events/:eventId/scoring-rules
  // ──────────────────────────────────────────────
  test('POST /api/events/:eventId/scoring-rules creates rules', async ({ request }) => {
    test.skip(!eventId, 'Requires created event');

    const res = await request.post(`/api/events/${eventId}/scoring-rules`, {
      headers: { cookie: sessionCookie },
      data: {
        rules: [
          { ruleType: 'VERIFIED_PROFILE', weight: 10 },
          { ruleType: 'SAME_REGION', weight: 5 },
          { ruleType: 'HAS_PORTFOLIO', weight: 8 },
        ],
      },
    });

    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBe(3);

    // Check structure of created rule
    const rule = body.data[0];
    expect(rule).toHaveProperty('id');
    expect(rule).toHaveProperty('eventId');
    expect(rule).toHaveProperty('ruleType');
    expect(rule).toHaveProperty('weight');
    expect(rule).toHaveProperty('createdAt');
    expect(rule.eventId).toBe(eventId);
  });

  test('POST /api/events/:eventId/scoring-rules returns created rules on GET', async ({ request }) => {
    test.skip(!eventId, 'Requires created event');

    const res = await request.get(`/api/events/${eventId}/scoring-rules`, {
      headers: { cookie: sessionCookie },
    });
    expect(res.ok()).toBeTruthy();

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.length).toBe(3);

    const ruleTypes = body.data.map((r: any) => r.ruleType);
    expect(ruleTypes).toContain('VERIFIED_PROFILE');
    expect(ruleTypes).toContain('SAME_REGION');
    expect(ruleTypes).toContain('HAS_PORTFOLIO');
  });

  test('POST /api/events/:eventId/scoring-rules replaces existing rules', async ({ request }) => {
    test.skip(!eventId, 'Requires created event');

    // Create new rules (should replace the 3 existing)
    const res = await request.post(`/api/events/${eventId}/scoring-rules`, {
      headers: { cookie: sessionCookie },
      data: {
        rules: [
          { ruleType: 'VERIFIED_PROFILE', weight: 20 },
        ],
      },
    });

    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.data.length).toBe(1);
    expect(body.data[0].ruleType).toBe('VERIFIED_PROFILE');
    expect(body.data[0].weight).toBe(20);

    // Verify only 1 rule exists now
    const getRes = await request.get(`/api/events/${eventId}/scoring-rules`, {
      headers: { cookie: sessionCookie },
    });
    const getBody = await getRes.json();
    expect(getBody.data.length).toBe(1);
  });

  test('POST /api/events/:eventId/scoring-rules returns 400 with empty rules', async ({ request }) => {
    test.skip(!eventId, 'Requires created event');

    const res = await request.post(`/api/events/${eventId}/scoring-rules`, {
      headers: { cookie: sessionCookie },
      data: { rules: [] },
    });

    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('SCORING_RULES_EMPTY');
  });

  test('POST /api/events/:eventId/scoring-rules returns 401 without auth', async ({ request }) => {
    test.skip(!eventId, 'Requires created event');

    const res = await request.post(`/api/events/${eventId}/scoring-rules`, {
      data: {
        rules: [{ ruleType: 'VERIFIED_PROFILE', weight: 10 }],
      },
    });

    expect(res.status()).toBe(401);
  });

  test('POST /api/events/:eventId/scoring-rules returns 404 for non-existent event', async ({ request }) => {
    const res = await request.post('/api/events/evt_nonexistent/scoring-rules', {
      headers: { cookie: sessionCookie },
      data: {
        rules: [{ ruleType: 'VERIFIED_PROFILE', weight: 10 }],
      },
    });

    expect(res.status()).toBe(404);
  });

  // ──────────────────────────────────────────────
  // Cleanup
  // ──────────────────────────────────────────────
  test('DELETE /api/eventos/:id cleans up event', async ({ request }) => {
    test.skip(!eventId, 'Requires created event');

    const res = await request.delete(`/api/eventos/${eventId}`, {
      headers: { cookie: sessionCookie },
    });
    expect(res.status()).toBe(204);
  });
});

test.describe('Regiones Endpoint', () => {
  test('GET /api/regiones returns regions with locations', async ({ request }) => {
    const res = await request.get('/api/regiones');
    expect(res.ok()).toBeTruthy();

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBeGreaterThan(0);

    // Check structure
    const region = body.data[0];
    expect(region).toHaveProperty('id');
    expect(region).toHaveProperty('name');
    expect(region).toHaveProperty('slug');
    expect(region).toHaveProperty('locations');
    expect(Array.isArray(region.locations)).toBe(true);

    // Check location structure
    if (region.locations.length > 0) {
      const location = region.locations[0];
      expect(location).toHaveProperty('id');
      expect(location).toHaveProperty('name');
      expect(location).toHaveProperty('slug');
    }
  });
});
